/**
 * Servicio HTTP para transferencias entre cuentas.
 *
 * Las transfers son inmutables: para corregir hay que borrar (revierte saldos)
 * y crear de nuevo. La regla Firestore lo refuerza desde el lado servidor.
 */

import { auth } from './firebase';
import { fetchOrThrowOffline } from '@utils/api-errors';
import type { Transfer, CreateTransferDto } from '@app-types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

async function getAuthToken(): Promise<string> {
  const user = auth.currentUser;
  if (!user) throw new Error('Usuario no autenticado');
  return await user.getIdToken();
}

async function fetchWithAuth<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const token = await getAuthToken();

  const response = await fetchOrThrowOffline(`${API_BASE_URL}${endpoint}`, {
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
    if (response.status === 404) throw new Error('Cuenta o transferencia no encontrada.');
    throw new Error(errorData.message || 'Error en la petición.');
  }

  return response.json() as Promise<T>;
}

function deserializeTransfer(
  raw: Transfer & { date: string; createdAt: string; updatedAt: string },
): Transfer {
  return {
    ...raw,
    date: new Date(raw.date),
    createdAt: new Date(raw.createdAt),
    updatedAt: new Date(raw.updatedAt),
  };
}

// =============================================================================
// API
// =============================================================================

export const TransfersService = {
  async create(data: CreateTransferDto): Promise<Transfer> {
    const raw = await fetchWithAuth<
      Transfer & { date: string; createdAt: string; updatedAt: string }
    >('/transfers', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return deserializeTransfer(raw);
  },

  async findAll(opts: { accountId?: string; limit?: number } = {}): Promise<Transfer[]> {
    const params = new URLSearchParams();
    if (opts.accountId) params.set('accountId', opts.accountId);
    if (opts.limit) params.set('limit', String(opts.limit));
    const qs = params.toString() ? `?${params.toString()}` : '';

    const raws = await fetchWithAuth<
      Array<Transfer & { date: string; createdAt: string; updatedAt: string }>
    >(`/transfers${qs}`);
    return raws.map(deserializeTransfer);
  },

  async findOne(id: string): Promise<Transfer> {
    const raw = await fetchWithAuth<
      Transfer & { date: string; createdAt: string; updatedAt: string }
    >(`/transfers/${id}`);
    return deserializeTransfer(raw);
  },

  async remove(id: string): Promise<void> {
    await fetchWithAuth<{ success: boolean }>(`/transfers/${id}`, {
      method: 'DELETE',
    });
  },
};

export default TransfersService;
