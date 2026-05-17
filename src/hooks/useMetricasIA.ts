/**
 * Hook de IA para el módulo de Métricas PRO.
 *
 * - `insights`: análisis estructurado (`POST /analytics/ai-insights`) con
 *   caché 24h en memoria + localStorage (igual que AIInsights → controla
 *   costo: una llamada al día por periodo/foco salvo refresh manual).
 * - `ask(question)`: pregunta libre contextual (`POST /analytics/ai-ask`),
 *   transitoria (sin caché), la UI gestiona el hilo de chat.
 *
 * Solo PRO dispara llamadas. No-pro nunca toca el backend de IA.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useAuth } from '@context/AuthContext';
import { AnalyticsService, ProRequiredError } from '@services/analytics';
import { isNetworkError } from '@utils/api-errors';
import type { MetricsAiResult, MetricasFiltros } from '@app-types';

const TTL_MINUTES = (() => {
  const raw = import.meta.env.VITE_METRICAS_IA_TTL_MINUTES;
  const parsed = Number(raw);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1440;
})();
const TTL_MS = TTL_MINUTES * 60 * 1000;
const LS_PREFIX = 'metricas-ia:';

interface CacheEntry {
  insights: MetricsAiResult;
  timestamp: number;
}

const cache = new Map<string, CacheEntry>();

function cacheKey(
  userId: string | undefined,
  f: MetricasFiltros,
  focus: string | undefined,
): string {
  const accs = (f.accountIds ?? []).slice().sort().join(',');
  return `${userId ?? 'anon'}:${f.year}-${f.month}:${accs}:${
    f.moneda ?? 'auto'
  }:${focus ?? ''}`;
}

function readLS(key: string): CacheEntry | undefined {
  try {
    const raw = localStorage.getItem(LS_PREFIX + key);
    if (!raw) return undefined;
    const parsed = JSON.parse(raw) as CacheEntry;
    if (!parsed || typeof parsed.timestamp !== 'number' || !parsed.insights) {
      return undefined;
    }
    return parsed;
  } catch {
    return undefined;
  }
}

function writeLS(key: string, entry: CacheEntry): void {
  try {
    localStorage.setItem(LS_PREFIX + key, JSON.stringify(entry));
  } catch {
    /* ignore */
  }
}

export interface UseMetricasIAReturn {
  insights: MetricsAiResult | null;
  loading: boolean;
  refreshing: boolean;
  error: string | null;
  lastUpdated: number | null;
  refresh: () => void;
  /** Pregunta libre; resuelve con el texto de respuesta. Lanza en error. */
  ask: (question: string) => Promise<string>;
  asking: boolean;
}

export function useMetricasIA(
  filtros: MetricasFiltros,
  focus?: string,
  /** Si false, no dispara la carga inicial (p.ej. pestaña IA aún no abierta). */
  enabled: boolean = true,
): UseMetricasIAReturn {
  const { usuario, isPro } = useAuth();

  const [insights, setInsights] = useState<MetricsAiResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<number | null>(null);
  const [asking, setAsking] = useState(false);

  const reqIdRef = useRef(0);

  const key = useMemo(
    () => cacheKey(usuario?.id, filtros, focus),
    [usuario?.id, filtros, focus],
  );

  const load = useCallback(
    async (force: boolean): Promise<void> => {
      if (!isPro || !enabled) {
        setLoading(false);
        return;
      }

      let cached = cache.get(key);
      if (!cached) {
        const persisted = readLS(key);
        if (persisted) {
          cache.set(key, persisted);
          cached = persisted;
        }
      }
      const fresh = cached && Date.now() - cached.timestamp < TTL_MS;
      if (!force && fresh && cached) {
        setInsights(cached.insights);
        setLastUpdated(cached.timestamp);
        setLoading(false);
        setError(null);
        return;
      }

      const myReq = ++reqIdRef.current;
      if (cached) {
        setInsights(cached.insights);
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      try {
        const data = await AnalyticsService.getAiInsights({
          ...filtros,
          focus,
        });
        if (myReq !== reqIdRef.current) return;
        const entry: CacheEntry = { insights: data, timestamp: Date.now() };
        cache.set(key, entry);
        writeLS(key, entry);
        setInsights(data);
        setLastUpdated(entry.timestamp);
      } catch (err) {
        if (myReq !== reqIdRef.current) return;
        if (err instanceof ProRequiredError) {
          setError('Esta función requiere una cuenta PRO.');
        } else if (isNetworkError(err)) {
          setError('No se pudo conectar con el asistente.');
        } else {
          setError(err instanceof Error ? err.message : 'Error desconocido');
        }
      } finally {
        if (myReq === reqIdRef.current) {
          setLoading(false);
          setRefreshing(false);
        }
      }
    },
    [filtros, focus, isPro, enabled, key],
  );

  useEffect(() => {
    void load(false);
  }, [load]);

  const refresh = useCallback(() => {
    void load(true);
  }, [load]);

  const ask = useCallback(
    async (question: string): Promise<string> => {
      setAsking(true);
      try {
        const res = await AnalyticsService.askAi({ ...filtros, question });
        return res.respuesta;
      } finally {
        setAsking(false);
      }
    },
    [filtros],
  );

  return {
    insights,
    loading,
    refreshing,
    error,
    lastUpdated,
    refresh,
    ask,
    asking,
  };
}
