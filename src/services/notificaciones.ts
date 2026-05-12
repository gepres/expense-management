/**
 * Servicio HTTP para Notificaciones del sistema.
 * Endpoints: /notificaciones en gastos-backend.
 *
 * El read principal se hace vía onSnapshot directo a Firestore desde el hook,
 * pero estos endpoints sirven para mutaciones y como fallback no-reactivo.
 */

import { auth } from './firebase';
import { fetchOrThrowOffline } from '@utils/api-errors';
import type { Notificacion } from '@app-types';

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
    if (response.status === 404) throw new Error('Notificación no encontrada.');
    throw new Error(errorData.message || 'Error en la petición.');
  }

  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

type Raw = Omit<Notificacion, 'createdAt'> & { createdAt: string };

function deserialize(raw: Raw): Notificacion {
  return { ...raw, createdAt: new Date(raw.createdAt) };
}

export const NotificacionesService = {
  async findAll(soloNoLeidas = false): Promise<Notificacion[]> {
    const query = soloNoLeidas ? '?soloNoLeidas=true' : '';
    const raws = await fetchWithAuth<Raw[]>(`/notificaciones${query}`);
    return raws.map(deserialize);
  },

  async contarNoLeidas(): Promise<number> {
    const res = await fetchWithAuth<{ count: number }>(
      '/notificaciones/contar-no-leidas',
    );
    return res.count;
  },

  async marcarLeida(id: string): Promise<Notificacion> {
    const raw = await fetchWithAuth<Raw>(`/notificaciones/${id}/leida`, {
      method: 'PATCH',
    });
    return deserialize(raw);
  },

  async marcarTodasLeidas(): Promise<{ actualizadas: number }> {
    return fetchWithAuth<{ actualizadas: number }>(
      '/notificaciones/marcar-todas-leidas',
      { method: 'POST' },
    );
  },

  async eliminar(id: string): Promise<void> {
    await fetchWithAuth<void>(`/notificaciones/${id}`, { method: 'DELETE' });
  },
};

export default NotificacionesService;
