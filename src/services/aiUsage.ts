/**
 * Consumo IA del propio usuario (Fase 2). `GET /api/ai-usage/me` →
 * snapshot de cuota para mostrar el medidor en Configuración → Perfil.
 * Mismo patrón fetchWithAuth que el resto de servicios.
 */

import { auth } from './firebase';
import { fetchOrThrowOffline } from '@utils/api-errors';
import type { QuotaSnapshot } from '@app-types';

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

async function getAuthToken(): Promise<string> {
  const user = auth.currentUser;
  if (!user) throw new Error('Usuario no autenticado');
  return await user.getIdToken();
}

export const AiUsageService = {
  /** Snapshot de cuota IA del usuario autenticado. */
  async getMyUsage(): Promise<QuotaSnapshot> {
    const token = await getAuthToken();
    const response = await fetchOrThrowOffline(`${API_BASE_URL}/ai-usage/me`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) {
      throw new Error('No se pudo cargar tu consumo de IA');
    }
    return response.json() as Promise<QuotaSnapshot>;
  },
};
