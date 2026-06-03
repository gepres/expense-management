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
import type { UsageSnapshot } from '@app-types';

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
};
