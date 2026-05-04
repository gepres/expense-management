/**
 * Servicio HTTP para gastos.
 *
 * Las MUTATIONS pasan por el backend NestJS para que la transacción atómica
 * descuente del bankBalance/cashBalance de la cuenta. Las LECTURAS se hacen
 * via `onSnapshot` directo a Firestore desde el hook `useGastos`.
 */

import { auth } from './firebase';
import { fetchOrThrowOffline } from '@utils/api-errors';
import type { BucketAlert, Gasto, GastoFirestore } from '@app-types';

/** Respuesta del backend al crear/editar/borrar un gasto. */
export interface ExpenseMutationResult {
  gasto: Gasto;
  /** Estado del bucket categoría afectado tras la mutación (si existe). */
  bucketAlert: BucketAlert | null;
  /** Para updates con cambio de categoría/cuenta/mes: bucket anterior. */
  previousBucketAlert?: BucketAlert | null;
}

export interface RemoveExpenseResult {
  id: string;
  bucketAlert: BucketAlert | null;
}

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

/**
 * DTO que el backend NestJS espera (todo en español, igual que Firestore).
 */
export interface CreateExpenseDto {
  accountId: string;
  monto: number;
  fecha: string; // ISO datetime
  categoria: string;
  metodoPago: string;
  moneda: string;
  subcategoria?: string;
  descripcion?: string;
  comercio?: string;
  tags?: string[];
  recurrente?: boolean;
  shoppingListId?: string;
  voucherType?: string;
  voucherNumber?: string;
  ruc?: string;
  igv?: number;
  subtotal?: number;
  reimbursementStatus?: string;
}

export type UpdateExpenseDto = Partial<CreateExpenseDto>;

async function getAuthToken(): Promise<string> {
  const user = auth.currentUser;
  if (!user) throw new Error('Usuario no autenticado');
  return await user.getIdToken();
}

async function fetchWithAuth<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = await getAuthToken();
  const response = await fetchOrThrowOffline(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    if (response.status === 401) throw new Error('Debes iniciar sesión.');
    if (response.status === 400) throw new Error(errorData.message || 'Datos inválidos.');
    if (response.status === 404) throw new Error('Recurso no encontrado.');
    throw new Error(errorData.message || 'Error en la petición.');
  }

  return response.json() as Promise<T>;
}

/**
 * Convierte la respuesta del backend (fechas ISO/strings) al tipo `Gasto` del
 * frontend (fechas como `Date`).
 */
function deserializeGasto(raw: any): Gasto {
  const toDate = (value: any): Date => {
    if (!value) return new Date();
    if (value instanceof Date) return value;
    if (typeof value === 'string') return new Date(value);
    if (typeof value === 'object' && typeof value._seconds === 'number') {
      return new Date(value._seconds * 1000);
    }
    if (typeof value === 'object' && typeof value.seconds === 'number') {
      return new Date(value.seconds * 1000);
    }
    return new Date(value);
  };

  return {
    id: raw.id,
    userId: raw.userId,
    accountId: raw.accountId,
    fecha: toDate(raw.fecha),
    categoria: raw.categoria,
    subcategoria: raw.subcategoria,
    monto: raw.monto,
    moneda: raw.moneda,
    descripcion: raw.descripcion ?? '',
    metodoPago: raw.metodoPago,
    tags: raw.tags,
    recurrente: raw.recurrente,
    shoppingListId: raw.shoppingListId,
    voucherType: raw.voucherType,
    voucherNumber: raw.voucherNumber,
    ruc: raw.ruc,
    igv: raw.igv,
    subtotal: raw.subtotal,
    reimbursementStatus: raw.reimbursementStatus,
    createdAt: toDate(raw.createdAt),
    updatedAt: toDate(raw.updatedAt ?? raw.createdAt),
  };
}

export const ExpensesService = {
  async create(dto: CreateExpenseDto): Promise<ExpenseMutationResult> {
    const raw = await fetchWithAuth<any>('/expenses', {
      method: 'POST',
      body: JSON.stringify(dto),
    });
    return {
      gasto: deserializeGasto(raw),
      bucketAlert: raw.bucketAlert ?? null,
    };
  },

  async update(id: string, dto: UpdateExpenseDto): Promise<ExpenseMutationResult> {
    const raw = await fetchWithAuth<any>(`/expenses/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(dto),
    });
    return {
      gasto: deserializeGasto(raw),
      bucketAlert: raw.bucketAlert ?? null,
      previousBucketAlert: raw.previousBucketAlert ?? null,
    };
  },

  async remove(id: string): Promise<RemoveExpenseResult> {
    const raw = await fetchWithAuth<{
      id: string;
      message: string;
      bucketAlert: BucketAlert | null;
    }>(`/expenses/${id}`, {
      method: 'DELETE',
    });
    return { id: raw.id, bucketAlert: raw.bucketAlert ?? null };
  },

  async exportExpenses(
    month: number,
    year: number,
    format: 'json' | 'excel',
  ): Promise<Blob> {
    const token = await getAuthToken();
    const queryParams = new URLSearchParams({
      month: month.toString(),
      year: year.toString(),
      format,
    });

    const response = await fetch(`${API_URL}/expenses/export?${queryParams}`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) throw new Error('Error exporting expenses');
    return response.blob();
  },
};

// Helper que mantenemos para conversión Firestore ↔ App en los listeners
// (lo usa `useGastos` con onSnapshot).
export function gastoFirestoreToGasto(id: string, data: GastoFirestore): Gasto {
  const toDate = (ts: any): Date => {
    if (!ts) return new Date();
    if (ts instanceof Date) return ts;
    if (typeof ts.toDate === 'function') return ts.toDate();
    return new Date(ts);
  };

  return {
    id,
    userId: data.userId,
    accountId: data.accountId,
    fecha: toDate(data.fecha),
    categoria: data.categoria,
    subcategoria: data.subcategoria,
    monto: data.monto,
    moneda: data.moneda,
    descripcion: data.descripcion ?? '',
    metodoPago: data.metodoPago,
    tags: data.tags,
    recurrente: data.recurrente,
    shoppingListId: data.shoppingListId,
    voucherType: data.voucherType,
    voucherNumber: data.voucherNumber,
    ruc: data.ruc,
    igv: data.igv,
    subtotal: data.subtotal,
    reimbursementStatus: data.reimbursementStatus,
    createdAt: toDate(data.createdAt),
    updatedAt: toDate(data.updatedAt),
  };
}

export default ExpensesService;
