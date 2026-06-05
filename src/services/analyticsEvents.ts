/**
 * Lectura (solo admin) del diagnóstico de uso para el Panel de Administración.
 *
 * Fase 0: snapshot agregado vía backend (`GET /usage-events/admin/snapshot`),
 * con métricas derivables de colecciones existentes. Las Fases 1-2 añadirán
 * aquí la lectura de rollups de eventos y el beacon `trackEvent`.
 *
 * Patrón de `adminFetch` idéntico a `aiUsageAdmin.ts`.
 */

import { auth } from './firebase';
import type {
  UsageSnapshot,
  UsageOverview,
  ClientEventName,
  SessionSummary,
  UsageUserRow,
  UsageDailyPoint,
} from '@app-types';

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

/** fetch autenticado (Firebase ID token) contra el backend admin. */
async function adminFetch<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const token = await auth.currentUser?.getIdToken();
  if (!token) throw new Error('No hay sesión activa');
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    if (res.status === 403) throw new Error('Solo administradores.');
    throw new Error(err.message || 'Error en la petición admin');
  }
  return res.json() as Promise<T>;
}

export const AnalyticsEventsService = {
  /** Snapshot de diagnóstico (cacheado 5 min en backend; `force` lo recalcula). */
  async getSnapshot(force = false): Promise<UsageSnapshot> {
    return adminFetch<UsageSnapshot>(
      `/usage-events/admin/snapshot${force ? '?force=true' : ''}`,
    );
  },

  /** Overview mensual: contadores de eventos + gastos por origen. */
  async getOverview(mes?: string): Promise<UsageOverview> {
    return adminFetch<UsageOverview>(
      `/usage-events/admin/overview${mes ? `?mes=${encodeURIComponent(mes)}` : ''}`,
    );
  },

  /** Top usuarios por actividad del mes. */
  async getTopUsers(mes?: string, max = 15): Promise<UsageUserRow[]> {
    const qs = new URLSearchParams({ max: String(max) });
    if (mes) qs.set('mes', mes);
    return adminFetch<UsageUserRow[]>(
      `/usage-events/admin/top-users?${qs.toString()}`,
    );
  },

  /** Serie diaria de actividad (últimos `dias` días). */
  async getDaily(dias = 14): Promise<UsageDailyPoint[]> {
    return adminFetch<UsageDailyPoint[]>(
      `/usage-events/admin/daily?dias=${dias}`,
    );
  },
};

// ============================================================================
// Beacons del cliente (Fase 2) — fire-and-forget, nunca rompen la UI.
// ============================================================================

async function userToken(): Promise<string | null> {
  try {
    return (await auth.currentUser?.getIdToken()) ?? null;
  } catch {
    return null;
  }
}

/** Registra un evento de funnel (UI). Fire-and-forget. */
export async function trackEvent(event: ClientEventName): Promise<void> {
  try {
    const token = await userToken();
    if (!token) return;
    await fetch(`${API_BASE_URL}/usage-events/track`, {
      method: 'POST',
      keepalive: true,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ event }),
    });
  } catch {
    /* fire-and-forget: el tracking jamás rompe la UI */
  }
}

/** Envía el resumen de una sesión de navegación. Fire-and-forget. */
export async function endSession(summary: SessionSummary): Promise<void> {
  try {
    const token = await userToken();
    if (!token) return;
    await fetch(`${API_BASE_URL}/usage-events/session-end`, {
      method: 'POST',
      keepalive: true,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(summary),
    });
  } catch {
    /* fire-and-forget */
  }
}
