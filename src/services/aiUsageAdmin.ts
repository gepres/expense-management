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
import { db } from './firebase';
import type { AiUsageRollup, AiUsageUserRow, AiUsageSortBy } from '@app-types';

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
};
