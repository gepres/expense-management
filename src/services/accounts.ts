/**
 * Servicio HTTP para el módulo de cuentas (multi-cuenta).
 *
 * Las MUTATIONS van por el backend NestJS porque éste mantiene la integridad
 * transactional (saldos, default flag, archivado seguro). Las LECTURAS las
 * resuelven los hooks con `onSnapshot` directo a Firestore para realtime.
 */

import { auth } from './firebase';
import { fetchOrThrowOffline } from '@utils/api-errors';
import type {
  Account,
  CreateAccountDto,
  UpdateAccountDto,
} from '@app-types';

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
    if (response.status === 404) throw new Error('Cuenta no encontrada.');
    if (response.status === 409) throw new Error(errorData.message || 'Conflicto.');
    if (response.status === 429) throw new Error('Demasiadas solicitudes.');
    throw new Error(errorData.message || 'Error en la petición.');
  }

  return response.json() as Promise<T>;
}

/**
 * Convierte el Account del backend (con fechas como ISO string) al formato del
 * frontend (Date).
 */
function deserializeAccount(raw: Account & { createdAt: string; updatedAt: string }): Account {
  return {
    ...raw,
    createdAt: new Date(raw.createdAt),
    updatedAt: new Date(raw.updatedAt),
  };
}

// =============================================================================
// API
// =============================================================================

export const AccountsService = {
  async create(data: CreateAccountDto): Promise<Account> {
    const raw = await fetchWithAuth<Account & { createdAt: string; updatedAt: string }>(
      '/accounts',
      {
        method: 'POST',
        body: JSON.stringify(data),
      },
    );
    return deserializeAccount(raw);
  },

  async findAll(includeArchived = false): Promise<Account[]> {
    const qs = includeArchived ? '?includeArchived=true' : '';
    const raws = await fetchWithAuth<Array<Account & { createdAt: string; updatedAt: string }>>(
      `/accounts${qs}`,
    );
    return raws.map(deserializeAccount);
  },

  async findOne(id: string): Promise<Account> {
    const raw = await fetchWithAuth<Account & { createdAt: string; updatedAt: string }>(
      `/accounts/${id}`,
    );
    return deserializeAccount(raw);
  },

  async update(id: string, data: UpdateAccountDto): Promise<Account> {
    const raw = await fetchWithAuth<Account & { createdAt: string; updatedAt: string }>(
      `/accounts/${id}`,
      {
        method: 'PATCH',
        body: JSON.stringify(data),
      },
    );
    return deserializeAccount(raw);
  },

  async remove(id: string, force = false): Promise<void> {
    const qs = force ? '?force=true' : '';
    await fetchWithAuth<{ success: boolean }>(`/accounts/${id}${qs}`, {
      method: 'DELETE',
    });
  },

  async recalculate(id: string): Promise<Account> {
    const raw = await fetchWithAuth<Account & { createdAt: string; updatedAt: string }>(
      `/accounts/${id}/recalculate`,
      { method: 'POST' },
    );
    return deserializeAccount(raw);
  },
};

export default AccountsService;
