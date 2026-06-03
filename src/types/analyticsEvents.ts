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
