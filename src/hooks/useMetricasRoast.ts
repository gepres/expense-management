/**
 * Hook del "roast" financiero (tarjeta sarcástica compartible).
 *
 * Disparo MANUAL (el usuario hace clic en "Generar") — no auto en mount,
 * por costo y porque es una acción deliberada. Se cachea el último roast
 * por periodo (memoria + localStorage) para que persista al navegar; cada
 * "Generar/Otra" pide uno nuevo. Solo PRO.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useAuth } from '@context/AuthContext';
import { AnalyticsService, ProRequiredError } from '@services/analytics';
import { isNetworkError } from '@utils/api-errors';
import type { MetricsRoast, MetricasFiltros, RoastTono } from '@app-types';

const LS_PREFIX = 'metricas-roast:';

const cache = new Map<string, MetricsRoast>();
// La imagen IA es base64 grande → solo en memoria (no localStorage, evita
// reventar la cuota y corromper otras cachés). Se pierde al recargar.
const imageCache = new Map<string, string>();

function cacheKey(userId: string | undefined, f: MetricasFiltros): string {
  const accs = (f.accountIds ?? []).slice().sort().join(',');
  return `${userId ?? 'anon'}:${f.year}-${f.month}:${accs}:${f.moneda ?? 'auto'}`;
}

function readLS(key: string): MetricsRoast | undefined {
  try {
    const raw = localStorage.getItem(LS_PREFIX + key);
    if (!raw) return undefined;
    const parsed = JSON.parse(raw) as MetricsRoast;
    return parsed && Array.isArray(parsed.frases) ? parsed : undefined;
  } catch {
    return undefined;
  }
}

function writeLS(key: string, roast: MetricsRoast): void {
  try {
    localStorage.setItem(LS_PREFIX + key, JSON.stringify(roast));
  } catch {
    /* ignore */
  }
}

export interface UseMetricasRoastReturn {
  roast: MetricsRoast | null;
  loading: boolean;
  error: string | null;
  tono: RoastTono;
  setTono: (t: RoastTono) => void;
  /** Pide un roast nuevo a la IA (manual). */
  generar: () => Promise<void>;
  /** Ilustración IA (data URL) o null. */
  imagen: string | null;
  loadingImagen: boolean;
  errorImagen: string | null;
  /** Genera la ilustración IA (manual, OpenAI). */
  generarImagen: () => Promise<void>;
}

export function useMetricasRoast(
  filtros: MetricasFiltros,
): UseMetricasRoastReturn {
  const { usuario, isPro } = useAuth();
  const [roast, setRoast] = useState<MetricsRoast | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tono, setTono] = useState<RoastTono>('picante');
  const [imagen, setImagen] = useState<string | null>(null);
  const [loadingImagen, setLoadingImagen] = useState(false);
  const [errorImagen, setErrorImagen] = useState<string | null>(null);

  const reqIdRef = useRef(0);
  const imgReqRef = useRef(0);
  const key = useMemo(
    () => cacheKey(usuario?.id, filtros),
    [usuario?.id, filtros],
  );

  // Al cambiar de periodo: muestra el último roast cacheado de ese periodo
  // (si existe), sin llamar a la IA.
  useEffect(() => {
    let cached = cache.get(key);
    if (!cached) {
      const persisted = readLS(key);
      if (persisted) {
        cache.set(key, persisted);
        cached = persisted;
      }
    }
    setRoast(cached ?? null);
    setError(null);
    setImagen(imageCache.get(key) ?? null);
    setErrorImagen(null);
  }, [key]);

  const generar = useCallback(async (): Promise<void> => {
    if (!isPro) {
      setError('Esta función requiere una cuenta PRO.');
      return;
    }
    const myReq = ++reqIdRef.current;
    setLoading(true);
    setError(null);
    try {
      const data = await AnalyticsService.getRoast({ ...filtros, tono });
      if (myReq !== reqIdRef.current) return;
      cache.set(key, data);
      writeLS(key, data);
      setRoast(data);
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
      if (myReq === reqIdRef.current) setLoading(false);
    }
  }, [filtros, tono, isPro, key]);

  const generarImagen = useCallback(async (): Promise<void> => {
    if (!isPro) {
      setErrorImagen('Esta función requiere una cuenta PRO.');
      return;
    }
    const myReq = ++imgReqRef.current;
    setLoadingImagen(true);
    setErrorImagen(null);
    try {
      const { imagenDataUrl } = await AnalyticsService.getRoastImage({
        ...filtros,
        tono,
      });
      if (myReq !== imgReqRef.current) return;
      imageCache.set(key, imagenDataUrl);
      setImagen(imagenDataUrl);
    } catch (err) {
      if (myReq !== imgReqRef.current) return;
      if (err instanceof ProRequiredError) {
        setErrorImagen('Esta función requiere una cuenta PRO.');
      } else if (isNetworkError(err)) {
        setErrorImagen('No se pudo conectar con el servidor.');
      } else {
        setErrorImagen(
          err instanceof Error ? err.message : 'Error desconocido',
        );
      }
    } finally {
      if (myReq === imgReqRef.current) setLoadingImagen(false);
    }
  }, [filtros, tono, isPro, key]);

  return {
    roast,
    loading,
    error,
    tono,
    setTono,
    generar,
    imagen,
    loadingImagen,
    errorImagen,
    generarImagen,
  };
}
