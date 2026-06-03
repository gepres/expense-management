/**
 * Tracking de navegación (Fase 2) — page-views + métricas de sesión.
 *
 * Acumula las vistas por ruta normalizada en memoria y hace **flush** del
 * resumen en `visibilitychange→hidden` / `pagehide` (1 request por periodo
 * visible, no por navegación → barato). Las rutas se normalizan (sin IDs) y
 * el backend las valida contra su allowlist.
 *
 * Cada periodo de visibilidad cuenta como una "sesión" (count/bounce/duración).
 */

import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { endSession } from '@services/analyticsEvents';
import type { SessionSummary } from '@app-types';

const BASE_ROUTES: Record<string, string> = {
  gastos: 'gastos',
  cuentas: 'cuentas',
  presupuestos: 'presupuestos',
  programados: 'programados',
  compartidos: 'compartidos',
  compras: 'compras',
  importar: 'importar',
  metricas: 'metricas',
  asistente: 'asistente',
  configuracion: 'configuracion',
  admin: 'admin',
};

/** Rutas que tienen vista de detalle (`/x/:id` → `x.detalle`). */
const WITH_DETAIL = new Set(['gastos', 'cuentas', 'compartidos']);

/** pathname → clave normalizada (coincide con KNOWN_ROUTES del backend). */
function normalizeRoute(pathname: string): string {
  if (pathname === '/') return 'dashboard';
  const seg = pathname.split('/').filter(Boolean);
  const base = BASE_ROUTES[seg[0]];
  if (!base) return 'otra';
  if (seg.length > 1 && seg[1] !== 'nuevo' && WITH_DETAIL.has(seg[0])) {
    return `${base}.detalle`;
  }
  return base;
}

interface SessionState {
  views: Record<string, number>;
  totalViews: number;
  startMs: number;
  entryRoute: string;
  lastRoute: string;
}

export function usePageTracking(): void {
  const location = useLocation();
  const ref = useRef<SessionState | null>(null);

  // Registrar una vista en cada cambio de ruta.
  useEffect(() => {
    const ruta = normalizeRoute(location.pathname);
    const s = ref.current;
    if (!s) {
      ref.current = {
        views: { [ruta]: 1 },
        totalViews: 1,
        startMs: Date.now(),
        entryRoute: ruta,
        lastRoute: ruta,
      };
    } else {
      s.views[ruta] = (s.views[ruta] ?? 0) + 1;
      s.totalViews += 1;
      s.lastRoute = ruta;
    }
  }, [location.pathname]);

  // Flush del resumen al ocultar la pestaña / cerrar.
  useEffect(() => {
    const flush = (): void => {
      const s = ref.current;
      if (!s || s.totalViews === 0) return;
      const summary: SessionSummary = {
        views: s.views,
        totalViews: s.totalViews,
        durationMs: Date.now() - s.startMs,
        entryRoute: s.entryRoute,
        exitRoute: s.lastRoute,
      };
      void endSession(summary);
      // Nuevo periodo: cada tramo visible cuenta como una sesión.
      ref.current = {
        views: {},
        totalViews: 0,
        startMs: Date.now(),
        entryRoute: s.lastRoute,
        lastRoute: s.lastRoute,
      };
    };
    const onVisibility = (): void => {
      if (document.visibilityState === 'hidden') flush();
    };
    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('pagehide', flush);
    return () => {
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('pagehide', flush);
    };
  }, []);
}
