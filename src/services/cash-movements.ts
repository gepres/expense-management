/**
 * Servicio HTTP para movimientos entre los sub-saldos de una misma cuenta.
 *
 * - withdrawal:    bankBalance → cashBalance (retirar al bolsillo)
 * - deposit_cash:  cashBalance → bankBalance (depositar efectivo en el banco)
 *
 * Las mutaciones van por backend para garantizar atomicidad. La lectura la
 * hace el hook `useCashMovements` con `onSnapshot`.
 */

import { auth } from './firebase';
import { fetchOrThrowOffline } from '@utils/api-errors';
import type {
  CashMovement,
  CreateCashMovementDto,
  CreateIncomeDto,
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
    if (response.status === 400) throw new Error(errorData.message || 'Datos inválidos.');
    if (response.status === 404) throw new Error('Cuenta o movimiento no encontrado.');
    throw new Error(errorData.message || 'Error en la petición.');
  }

  return response.json() as Promise<T>;
}

function deserialize(
  raw: CashMovement & { date: string; createdAt: string; updatedAt: string },
): CashMovement {
  return {
    ...raw,
    date: new Date(raw.date),
    createdAt: new Date(raw.createdAt),
    updatedAt: new Date(raw.updatedAt),
  };
}

export const CashMovementsService = {
  async withdraw(accountId: string, dto: CreateCashMovementDto): Promise<CashMovement> {
    const raw = await fetchWithAuth<
      CashMovement & { date: string; createdAt: string; updatedAt: string }
    >(`/accounts/${accountId}/withdraw`, {
      method: 'POST',
      body: JSON.stringify(dto),
    });
    return deserialize(raw);
  },

  async depositCash(
    accountId: string,
    dto: CreateCashMovementDto,
  ): Promise<CashMovement> {
    const raw = await fetchWithAuth<
      CashMovement & { date: string; createdAt: string; updatedAt: string }
    >(`/accounts/${accountId}/deposit-cash`, {
      method: 'POST',
      body: JSON.stringify(dto),
    });
    return deserialize(raw);
  },

  /**
   * Registra un ingreso externo a la cuenta (sueldo, préstamo, CTS, AFP…).
   * Aumenta el saldo total → presupuesto general del mes (modelo Opción B).
   */
  async addIncome(
    accountId: string,
    dto: CreateIncomeDto,
  ): Promise<CashMovement> {
    const raw = await fetchWithAuth<
      CashMovement & { date: string; createdAt: string; updatedAt: string }
    >(`/accounts/${accountId}/income`, {
      method: 'POST',
      body: JSON.stringify(dto),
    });
    return deserialize(raw);
  },

  async findAll(opts: { accountId?: string; limit?: number } = {}): Promise<CashMovement[]> {
    const params = new URLSearchParams();
    if (opts.accountId) params.set('accountId', opts.accountId);
    if (opts.limit) params.set('limit', String(opts.limit));
    const qs = params.toString() ? `?${params.toString()}` : '';

    const raws = await fetchWithAuth<
      Array<CashMovement & { date: string; createdAt: string; updatedAt: string }>
    >(`/cash-movements${qs}`);
    return raws.map(deserialize);
  },

  async findOne(id: string): Promise<CashMovement> {
    const raw = await fetchWithAuth<
      CashMovement & { date: string; createdAt: string; updatedAt: string }
    >(`/cash-movements/${id}`);
    return deserialize(raw);
  },

  async remove(id: string): Promise<void> {
    await fetchWithAuth<{ success: boolean }>(`/cash-movements/${id}`, {
      method: 'DELETE',
    });
  },
};

export default CashMovementsService;
