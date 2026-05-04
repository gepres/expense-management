/**
 * Servicio HTTP para presupuestos.
 *
 * Mutations vía backend (validación de asignación + cálculo de rollover).
 * Lectura realtime via onSnapshot en el hook `usePresupuestos`.
 */

import { auth } from './firebase';
import { fetchOrThrowOffline } from '@utils/api-errors';
import type {
  Presupuesto,
  CreatePresupuestoDto,
  UpdatePresupuestoDto,
  PresupuestoMensualResumen,
} from '@app-types';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

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
    if (response.status === 404) throw new Error('Presupuesto no encontrado.');
    if (response.status === 409) throw new Error(errorData.message || 'Conflicto.');
    throw new Error(errorData.message || 'Error en la petición.');
  }

  return response.json() as Promise<T>;
}

function deserializePresupuesto(raw: any): Presupuesto {
  return {
    id: raw.id,
    userId: raw.userId,
    accountId: raw.accountId,
    mes: raw.mes,
    bucket: raw.bucket,
    limite: raw.limite,
    moneda: raw.moneda,
    rolloverEntrada: raw.rolloverEntrada,
    gastado: raw.gastado,
    disponible: raw.disponible,
    excede: raw.excede,
    porcentaje: raw.porcentaje,
    alertaEnviada80: raw.alertaEnviada80,
    alertaEnviada100: raw.alertaEnviada100,
    createdAt: raw.createdAt ? new Date(raw.createdAt) : new Date(),
    updatedAt: raw.updatedAt ? new Date(raw.updatedAt) : new Date(),
  };
}

function deserializeResumen(raw: any): PresupuestoMensualResumen {
  return {
    accountId: raw.accountId,
    mes: raw.mes,
    moneda: raw.moneda,
    general: raw.general ? deserializePresupuesto(raw.general) : undefined,
    categorias: (raw.categorias ?? []).map(deserializePresupuesto),
    efectivo: raw.efectivo ? deserializePresupuesto(raw.efectivo) : undefined,
    totalGastado: raw.totalGastado ?? 0,
    totalAsignado: raw.totalAsignado ?? 0,
    accountBalance: raw.accountBalance ?? 0,
    excedeAsignacion: !!raw.excedeAsignacion,
    disponibleSinAsignar: raw.disponibleSinAsignar ?? 0,
  };
}

export const PresupuestosService = {
  async create(dto: CreatePresupuestoDto): Promise<Presupuesto> {
    const raw = await fetchWithAuth<any>('/presupuestos', {
      method: 'POST',
      body: JSON.stringify(dto),
    });
    return deserializePresupuesto(raw);
  },

  async update(id: string, dto: UpdatePresupuestoDto): Promise<Presupuesto> {
    const raw = await fetchWithAuth<any>(`/presupuestos/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(dto),
    });
    return deserializePresupuesto(raw);
  },

  async remove(id: string): Promise<void> {
    await fetchWithAuth<{ success: boolean }>(`/presupuestos/${id}`, {
      method: 'DELETE',
    });
  },

  async getResumen(accountId: string, mes: string): Promise<PresupuestoMensualResumen> {
    const params = new URLSearchParams({ accountId, mes });
    const raw = await fetchWithAuth<any>(`/presupuestos/resumen?${params.toString()}`);
    return deserializeResumen(raw);
  },
};

export default PresupuestosService;
