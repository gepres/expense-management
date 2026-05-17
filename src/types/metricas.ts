/**
 * Tipos del módulo de Métricas PRO.
 *
 * Reflejan EXACTAMENTE el contrato del backend
 * (`gastos-backend/src/modules/analytics/interfaces/analytics.interface.ts`
 * y `AnthropicService.MetricsAiResult`). Mantener en sync si cambia el backend.
 */

import type { Moneda } from './index';

export type TendenciaMetrica = 'creciente' | 'decreciente' | 'estable';

/** Resumen calculado server-side por `GET /api/analytics/summary`. */
export interface AnalyticsSummary {
  periodo: {
    month: number;
    year: number;
    desde: string;
    hasta: string;
    diasTranscurridos: number;
    diasTotales: number;
  };
  moneda: string;
  cuentasIncluidas: string[];
  totales: {
    totalGastado: number;
    numTransacciones: number;
    promedioPorGasto: number;
    promedioDiario: number;
    gastoMaximo: number;
    gastoMinimo: number;
    diasConGasto: number;
  };
  comparativaMesAnterior: {
    totalAnterior: number;
    diferencia: number;
    diferenciaPorcentaje: number;
    tendencia: TendenciaMetrica;
  };
  proyeccionFinMes: number;
  porCategoria: Array<{
    categoria: string;
    total: number;
    porcentaje: number;
    numGastos: number;
  }>;
  porSubcategoria: Array<{
    categoria: string;
    subcategoria: string;
    total: number;
  }>;
  porMetodoPago: Array<{
    metodoPago: string;
    total: number;
    porcentaje: number;
  }>;
  porDia: Array<{ fecha: string; total: number; acumulado: number }>;
  tendenciasCategoria: Array<{
    categoria: string;
    tendencia: TendenciaMetrica;
    porcentajeCambio: number;
    actual: number;
    anterior: number;
  }>;
  topGastos: Array<{
    id: string;
    descripcion: string;
    monto: number;
    categoria: string;
    fecha: string;
  }>;
  anomalias: Array<{
    id: string;
    descripcion: string;
    monto: number;
    categoria: string;
    fecha: string;
    razon: string;
    desviacion: number;
  }>;
  topTags: Array<{ tag: string; total: number; count: number }>;
  monedasDisponibles: string[];
}

/** Resultado IA estructurado de `POST /api/analytics/ai-insights`. */
export interface MetricsAiResult {
  resumen: string;
  recomendaciones: string[];
  insights: string[];
  anomalias: Array<{
    titulo: string;
    detalle: string;
    severidad: 'baja' | 'media' | 'alta';
  }>;
  ahorroEstimado?: number;
  contextUsed: { month: number; year: number; moneda: string };
}

/** Respuesta de `POST /api/analytics/ai-ask`. */
export interface MetricsAiAnswer {
  respuesta: string;
  contextUsed: { month: number; year: number; moneda: string };
}

/** Filtros que el cliente envía a los endpoints de analytics. */
export interface MetricasFiltros {
  month: number;
  year: number;
  /** Vacío/undefined = todas las cuentas. */
  accountIds?: string[];
  /** Si se omite, el backend usa la moneda de mayor gasto. */
  moneda?: Moneda;
}

export type ExportMetricasFormato = 'excel' | 'csv';
