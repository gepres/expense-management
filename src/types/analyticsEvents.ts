/**
 * Tipos del módulo de diagnóstico de uso (analítica de flujos).
 *
 * Fase 0: `UsageSnapshot` — espejo del contrato del backend
 * (`GET /usage-events/admin/snapshot`). Las Fases 1-2 añadirán aquí los
 * tipos de rollups de eventos (overview/daily/top-users).
 */

/** Estado vivo agregado de las features (métricas derivables). */
export interface UsageSnapshot {
  /** ISO timestamp de generación en el backend. */
  generatedAt: string;
  /** Mes en curso `YYYY-MM` (UTC). */
  mes: string;

  usuarios: {
    total: number;
    /** Con WhatsApp vinculado (adopción del bot). */
    conWhatsapp: number;
    admins: number;
  };

  gastos: {
    total: number;
    /** Creados este mes. */
    esteMes: number;
  };

  transfers: { total: number };

  recurrentes: {
    gastos: { total: number; activos: number; pausados: number };
    transferencias: { total: number; activos: number; pausados: number };
    ejecuciones: {
      total: number;
      exitosa: number;
      fallida: number;
      saldoInsuficiente: number;
      pending: number;
    };
  };

  whatsapp: {
    /** Mensajes entrantes encolados (histórico). */
    llamadosTotal: number;
    pendientes: number;
    vinculados: number;
  };

  chat: { conversaciones: number; mensajes: number };
  grupos: { total: number };
  recibos: { total: number };
  listas: { total: number };
}

/** Overview mensual: contadores de eventos (rollup) + gastos por origen. */
export interface UsageOverview {
  mes: string;
  generatedAt: string;
  /** event → conteo del rollup `usageEventsAppMonthly/{mes}`. */
  counters: Record<string, number>;
  /** Gastos creados por canal de origen. */
  gastosPorOrigen: Record<string, number>;
}

/** Eventos de funnel que el cliente puede emitir (allowlist client). */
export type ClientEventName =
  | 'expense.form.opened'
  | 'expense.form.saved'
  | 'expense.form.abandoned'
  | 'expense.form.validation_error'
  | 'rec.form.opened'
  | 'rec.form.saved'
  | 'rec.form.abandoned'
  | 'receipt.preview.shown'
  | 'receipt.preview.discarded';

/** Resumen de una sesión de navegación (flush en visibilitychange). */
export interface SessionSummary {
  /** Vistas por ruta normalizada. */
  views: Record<string, number>;
  totalViews: number;
  durationMs: number;
  entryRoute?: string;
  exitRoute?: string;
}

/** Fila de actividad por usuario (rollup mensual). */
export interface UsageUserRow {
  userId: string;
  /** Suma de todos los contadores del mes. */
  total: number;
  counters: Record<string, number>;
}

/** Punto de la serie diaria de actividad. */
export interface UsageDailyPoint {
  dia: string;
  total: number;
}
