/**
 * Servicio HTTP para Gastos Programados.
 *
 * Patrón idéntico a transfers.ts: fetchWithAuth + deserialize.
 * Endpoints (a implementar en gastos-backend, ver docs/programados-backend.md):
 *   GET    /programados/gastos          → lista
 *   POST   /programados/gastos          → crea
 *   GET    /programados/gastos/:id      → detalle
 *   PATCH  /programados/gastos/:id      → actualiza
 *   DELETE /programados/gastos/:id      → elimina
 *   POST   /programados/gastos/:id/pause   → pausa (activo: false)
 *   POST   /programados/gastos/:id/resume  → reanuda (activo: true)
 */

import { auth } from './firebase';
import { fetchOrThrowOffline } from '@utils/api-errors';
import type {
  GastoProgramado,
  CreateGastoProgramadoDto,
  UpdateGastoProgramadoDto,
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
    if (response.status === 404) throw new Error('Programación no encontrada.');
    throw new Error(errorData.message || 'Error en la petición.');
  }

  // 204 No Content
  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

type RawGastoProgramado = Omit<
  GastoProgramado,
  'fechaInicio' | 'fechaFin' | 'fechaUnica' | 'proximaEjecucion' | 'ultimaEjecucion' | 'createdAt' | 'updatedAt'
> & {
  fechaInicio: string;
  fechaFin?: string;
  fechaUnica?: string;
  proximaEjecucion: string;
  ultimaEjecucion?: string;
  createdAt: string;
  updatedAt: string;
};

function deserialize(raw: RawGastoProgramado): GastoProgramado {
  return {
    ...raw,
    fechaInicio: new Date(raw.fechaInicio),
    fechaFin: raw.fechaFin ? new Date(raw.fechaFin) : undefined,
    fechaUnica: raw.fechaUnica ? new Date(raw.fechaUnica) : undefined,
    proximaEjecucion: new Date(raw.proximaEjecucion),
    ultimaEjecucion: raw.ultimaEjecucion ? new Date(raw.ultimaEjecucion) : undefined,
    createdAt: new Date(raw.createdAt),
    updatedAt: new Date(raw.updatedAt),
  };
}

// =============================================================================
// API
// =============================================================================

export const ProgramadosService = {
  async create(data: CreateGastoProgramadoDto): Promise<GastoProgramado> {
    const raw = await fetchWithAuth<RawGastoProgramado>('/programados/gastos', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return deserialize(raw);
  },

  async findAll(): Promise<GastoProgramado[]> {
    const raws = await fetchWithAuth<RawGastoProgramado[]>('/programados/gastos');
    return raws.map(deserialize);
  },

  async findOne(id: string): Promise<GastoProgramado> {
    const raw = await fetchWithAuth<RawGastoProgramado>(`/programados/gastos/${id}`);
    return deserialize(raw);
  },

  async update(id: string, data: UpdateGastoProgramadoDto): Promise<GastoProgramado> {
    const raw = await fetchWithAuth<RawGastoProgramado>(`/programados/gastos/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
    return deserialize(raw);
  },

  async remove(id: string): Promise<void> {
    await fetchWithAuth<{ success: boolean }>(`/programados/gastos/${id}`, {
      method: 'DELETE',
    });
  },

  async pause(id: string): Promise<GastoProgramado> {
    const raw = await fetchWithAuth<RawGastoProgramado>(
      `/programados/gastos/${id}/pause`,
      { method: 'POST' },
    );
    return deserialize(raw);
  },

  async resume(id: string): Promise<GastoProgramado> {
    const raw = await fetchWithAuth<RawGastoProgramado>(
      `/programados/gastos/${id}/resume`,
      { method: 'POST' },
    );
    return deserialize(raw);
  },
};

export default ProgramadosService;
