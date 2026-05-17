/**
 * Lectura (solo admin) del consumo IA para el Panel de Administración.
 *
 * Las colecciones son top-level y solo el Admin SDK (backend/functions)
 * las escribe; las Firestore rules permiten READ a admin (y al dueño su
 * propio rollup). Requiere `firebase deploy --only firestore` desplegado.
 */

import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit as fbLimit,
} from 'firebase/firestore';
import { db, auth } from './firebase';
import type {
  AiUsageRollup,
  AiUsageUserRow,
  AiUsageSortBy,
  QuotaConfig,
  QuotaConfigResponse,
  QuotaSnapshot,
  VendorCost,
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

/** Clave de mes en UTC, idéntica a la que usan backend/functions. */
export function currentMonthKey(d: Date = new Date()): string {
  const m = String(d.getUTCMonth() + 1).padStart(2, '0');
  return `${d.getUTCFullYear()}-${m}`;
}

/** Navega meses sobre una clave `YYYY-MM` (UTC). */
export function shiftMonthKey(mes: string, delta: number): string {
  const [y, m] = mes.split('-').map(Number);
  const d = new Date(Date.UTC(y, m - 1 + delta, 1));
  return currentMonthKey(d);
}

export const AiUsageAdminService = {
  /** Consumo autogenerado del aplicativo en el mes. */
  async getAppMonthly(mes: string): Promise<AiUsageRollup | null> {
    const snap = await getDoc(doc(db, 'aiUsageAppMonthly', mes));
    return snap.exists() ? (snap.data() as AiUsageRollup) : null;
  },

  /** Rollup de un usuario en el mes. */
  async getUserMonthly(
    userId: string,
    mes: string,
  ): Promise<AiUsageRollup | null> {
    const snap = await getDoc(doc(db, 'aiUsageMonthly', `${userId}_${mes}`));
    return snap.exists() ? (snap.data() as AiUsageRollup) : null;
  },

  /** Top usuarios por tokens o costo en el mes. */
  async getTopUsers(
    mes: string,
    max = 15,
    sortBy: AiUsageSortBy = 'totalTokens',
  ): Promise<AiUsageUserRow[]> {
    const q = query(
      collection(db, 'aiUsageMonthly'),
      where('mes', '==', mes),
      orderBy(sortBy, 'desc'),
      fbLimit(max),
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({
      docId: d.id,
      ...(d.data() as Omit<AiUsageUserRow, 'docId'>),
    }));
  },

  /** Límites de cuota IA por rol (efectivos + origen + defaults env). */
  async getQuotaConfig(): Promise<QuotaConfigResponse> {
    return adminFetch<QuotaConfigResponse>('/ai-usage/quota-config');
  },

  /** Guarda el override de límites (admin). Propaga en ≤60s. */
  async updateQuotaConfig(
    cfg: QuotaConfig,
  ): Promise<{ ok: boolean; config: QuotaConfig }> {
    return adminFetch('/ai-usage/quota-config', {
      method: 'PUT',
      body: JSON.stringify(cfg),
    });
  },

  /**
   * Resetea o amplía la cuota de un usuario para el mes en curso (admin).
   * No toca el rollup de tracking. Devuelve el snapshot actualizado.
   */
  async adjustUserQuota(payload: {
    userId: string;
    mode: 'reset' | 'bonus';
    tokens?: number;
    note?: string;
  }): Promise<QuotaSnapshot> {
    return adminFetch<QuotaSnapshot>('/ai-usage/quota-adjust', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  /** Costo REAL facturado por proveedor en el mes (no es saldo). */
  async getVendorCost(mes: string): Promise<VendorCost> {
    return adminFetch<VendorCost>(
      `/ai-usage/vendor-cost?mes=${encodeURIComponent(mes)}`,
    );
  },
};
