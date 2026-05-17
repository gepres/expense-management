/**
 * Hook de datos para el módulo de Métricas PRO.
 *
 * - Gestiona el estado de filtros (periodo / cuentas / moneda).
 * - Llama a `GET /analytics/summary` (el cálculo pesado vive en el backend).
 * - Cachea por `userId+filtros` en memoria + localStorage con TTL corto
 *   (las métricas cambian al registrar gastos; aceptamos leve staleness y
 *   ofrecemos refetch manual). Patrón alineado con AIInsights.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useAuth } from '@context/AuthContext';
import { AnalyticsService, ProRequiredError } from '@services/analytics';
import { isNetworkError } from '@utils/api-errors';
import type { AnalyticsSummary, MetricasFiltros, Moneda } from '@app-types';

const TTL_MINUTES = (() => {
  const raw = import.meta.env.VITE_METRICAS_TTL_MINUTES;
  const parsed = Number(raw);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 10;
})();
const TTL_MS = TTL_MINUTES * 60 * 1000;
const LS_PREFIX = 'metricas-summary:';

interface CacheEntry {
  summary: AnalyticsSummary;
  timestamp: number;
}

const cache = new Map<string, CacheEntry>();

function cacheKey(userId: string | undefined, f: MetricasFiltros): string {
  const accs = (f.accountIds ?? []).slice().sort().join(',');
  return `${userId ?? 'anon'}:${f.year}-${f.month}:${accs}:${f.moneda ?? 'auto'}`;
}

function readLS(key: string): CacheEntry | undefined {
  try {
    const raw = localStorage.getItem(LS_PREFIX + key);
    if (!raw) return undefined;
    const parsed = JSON.parse(raw) as CacheEntry;
    if (!parsed || typeof parsed.timestamp !== 'number' || !parsed.summary) {
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
    /* quota / disabled → ignorar, la memoria sigue funcionando */
  }
}

function currentPeriod(): { month: number; year: number } {
  const d = new Date();
  return { month: d.getMonth() + 1, year: d.getFullYear() };
}

export interface UseMetricasReturn {
  filtros: MetricasFiltros;
  setMonth: (m: number) => void;
  setYear: (y: number) => void;
  setPeriodo: (m: number, y: number) => void;
  setAccountIds: (ids: string[] | undefined) => void;
  setMoneda: (m: Moneda | undefined) => void;
  summary: AnalyticsSummary | null;
  loading: boolean;
  refreshing: boolean;
  error: string | null;
  isProRequired: boolean;
  isOffline: boolean;
  lastUpdated: number | null;
  refetch: () => void;
}

export function useMetricas(
  initial?: Partial<MetricasFiltros>,
): UseMetricasReturn {
  const { usuario, isPro } = useAuth();

  const [filtros, setFiltros] = useState<MetricasFiltros>(() => {
    const { month, year } = currentPeriod();
    return {
      month: initial?.month ?? month,
      year: initial?.year ?? year,
      accountIds: initial?.accountIds,
      moneda: initial?.moneda,
    };
  });

  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isProRequired, setIsProRequired] = useState(false);
  const [isOffline, setIsOffline] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<number | null>(null);

  // Evita setState tras unmount / requests obsoletas.
  const reqIdRef = useRef(0);

  const key = useMemo(
    () => cacheKey(usuario?.id, filtros),
    [usuario?.id, filtros],
  );

  const load = useCallback(
    async (force: boolean): Promise<void> => {
      // No-pro: no llamamos al backend (recibiríamos 403). El gating visual
      // lo maneja la página; aquí solo evitamos la request.
      if (!isPro) {
        setLoading(false);
        setSummary(null);
        setIsProRequired(true);
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
        setSummary(cached.summary);
        setLastUpdated(cached.timestamp);
        setLoading(false);
        setError(null);
        setIsProRequired(false);
        setIsOffline(false);
        return;
      }

      const myReq = ++reqIdRef.current;
      if (cached) {
        // Mostramos lo cacheado mientras revalidamos.
        setSummary(cached.summary);
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      try {
        const data = await AnalyticsService.getSummary(filtros);
        if (myReq !== reqIdRef.current) return;
        const entry: CacheEntry = { summary: data, timestamp: Date.now() };
        cache.set(key, entry);
        writeLS(key, entry);
        setSummary(data);
        setLastUpdated(entry.timestamp);
        setIsProRequired(false);
        setIsOffline(false);
      } catch (err) {
        if (myReq !== reqIdRef.current) return;
        if (err instanceof ProRequiredError) {
          setIsProRequired(true);
          setSummary(null);
        } else if (isNetworkError(err)) {
          setIsOffline(true);
          setError(
            'No se pudo conectar con el servidor. Revisa que el backend esté arriba.',
          );
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
    [filtros, isPro, key],
  );

  useEffect(() => {
    void load(false);
  }, [load]);

  const refetch = useCallback(() => {
    void load(true);
  }, [load]);

  const setMonth = useCallback(
    (m: number) => setFiltros((f) => ({ ...f, month: m })),
    [],
  );
  const setYear = useCallback(
    (y: number) => setFiltros((f) => ({ ...f, year: y })),
    [],
  );
  const setPeriodo = useCallback(
    (m: number, y: number) => setFiltros((f) => ({ ...f, month: m, year: y })),
    [],
  );
  const setAccountIds = useCallback(
    (ids: string[] | undefined) =>
      setFiltros((f) => ({
        ...f,
        accountIds: ids && ids.length > 0 ? ids : undefined,
      })),
    [],
  );
  const setMoneda = useCallback(
    (m: Moneda | undefined) => setFiltros((f) => ({ ...f, moneda: m })),
    [],
  );

  return {
    filtros,
    setMonth,
    setYear,
    setPeriodo,
    setAccountIds,
    setMoneda,
    summary,
    loading,
    refreshing,
    error,
    isProRequired,
    isOffline,
    lastUpdated,
    refetch,
  };
}
