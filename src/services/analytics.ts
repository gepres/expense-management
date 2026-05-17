/**
 * Servicio HTTP del módulo de Métricas PRO.
 *
 * Patrón idéntico a programados.ts: `fetchWithAuth` + `fetchOrThrowOffline`.
 * Todos los endpoints están PRO-gated en el backend (`ProGuard`); un usuario
 * no-pro recibirá 403 (el frontend además bloquea con el teaser antes de
 * llegar aquí).
 *
 * Endpoints (gastos-backend, módulo `analytics`, ver docs/analytics-backend.md):
 *   GET  /analytics/summary       → AnalyticsSummary (sin IA, cacheable)
 *   POST /analytics/ai-insights   → MetricsAiResult
 *   POST /analytics/ai-ask        → MetricsAiAnswer
 *   GET  /analytics/export        → Blob (xlsx | csv)
 */

import { auth } from './firebase';
import { fetchOrThrowOffline } from '@utils/api-errors';
import type {
  AnalyticsSummary,
  MetricsAiResult,
  MetricsAiAnswer,
  MetricsRoast,
  MetricsRoastImage,
  RoastTono,
  MetricasFiltros,
  ExportMetricasFormato,
} from '@app-types';

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

async function getAuthToken(): Promise<string> {
  const user = auth.currentUser;
  if (!user) throw new Error('Usuario no autenticado');
  return await user.getIdToken();
}

/** Error específico para 403 (cuenta no PRO) — la UI lo usa para mostrar el teaser. */
export class ProRequiredError extends Error {
  readonly isProRequired = true;
  constructor(message = 'Esta función requiere una cuenta PRO') {
    super(message);
    this.name = 'ProRequiredError';
  }
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
    if (response.status === 403) {
      throw new ProRequiredError(errorData.message);
    }
    if (response.status === 400) {
      throw new Error(errorData.message || 'Parámetros inválidos.');
    }
    if (response.status === 429) {
      throw new Error('Límite de solicitudes excedido. Intenta en un minuto.');
    }
    throw new Error(errorData.message || 'Error en la petición.');
  }

  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

function buildQuery(filtros: MetricasFiltros): string {
  const qp = new URLSearchParams({
    month: String(filtros.month),
    year: String(filtros.year),
  });
  if (filtros.accountIds && filtros.accountIds.length > 0) {
    qp.set('accountIds', filtros.accountIds.join(','));
  }
  if (filtros.moneda) qp.set('moneda', filtros.moneda);
  return qp.toString();
}

export const AnalyticsService = {
  /** KPIs/series del periodo (sin IA). */
  async getSummary(filtros: MetricasFiltros): Promise<AnalyticsSummary> {
    return fetchWithAuth<AnalyticsSummary>(
      `/analytics/summary?${buildQuery(filtros)}`,
    );
  },

  /** Análisis IA estructurado. `focus` opcional para enfocar el flujo. */
  async getAiInsights(
    filtros: MetricasFiltros & { focus?: string },
  ): Promise<MetricsAiResult> {
    return fetchWithAuth<MetricsAiResult>('/analytics/ai-insights', {
      method: 'POST',
      body: JSON.stringify(filtros),
    });
  },

  /** Pregunta libre sobre las métricas del periodo. */
  async askAi(
    filtros: MetricasFiltros & { question: string },
  ): Promise<MetricsAiAnswer> {
    return fetchWithAuth<MetricsAiAnswer>('/analytics/ai-ask', {
      method: 'POST',
      body: JSON.stringify(filtros),
    });
  },

  /** Roast sarcástico compartible del periodo. */
  async getRoast(
    filtros: MetricasFiltros & { tono?: RoastTono },
  ): Promise<MetricsRoast> {
    return fetchWithAuth<MetricsRoast>('/analytics/ai-roast', {
      method: 'POST',
      body: JSON.stringify(filtros),
    });
  },

  /** Ilustración IA del roast (OpenAI). Requiere OPENAI_API_KEY en backend. */
  async getRoastImage(
    filtros: MetricasFiltros & { tono?: RoastTono },
  ): Promise<MetricsRoastImage> {
    return fetchWithAuth<MetricsRoastImage>('/analytics/ai-image', {
      method: 'POST',
      body: JSON.stringify(filtros),
    });
  },

  /** Exporta el resumen como Excel o CSV. Devuelve un Blob para descargar. */
  async exportMetricas(
    filtros: MetricasFiltros,
    format: ExportMetricasFormato,
  ): Promise<Blob> {
    const token = await getAuthToken();
    const qp = buildQuery(filtros);
    const response = await fetchOrThrowOffline(
      `${API_BASE_URL}/analytics/export?${qp}&format=${format}`,
      { method: 'GET', headers: { Authorization: `Bearer ${token}` } },
    );
    if (!response.ok) {
      if (response.status === 403) throw new ProRequiredError();
      throw new Error('Error al exportar métricas');
    }
    return response.blob();
  },
};
