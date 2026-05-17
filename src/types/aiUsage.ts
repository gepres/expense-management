/**
 * Tipos de consumo IA (Fase 1: tracking). Espejo de los rollups que
 * escriben gastos-backend y gastos-firebase-functions.
 *
 * Colecciones (top-level, solo Admin SDK escribe):
 *  - `aiUsageAppMonthly/{YYYY-MM}`     → consumo autogenerado del aplicativo
 *  - `aiUsageMonthly/{uid}_{YYYY-MM}`  → consumo por usuario (campo userId)
 *  - `aiUsageEvents/{id}`              → auditoría (1 por llamada)
 */

export interface AiUsageBucketStat {
  tokens: number;
  calls: number;
  costUsd: number;
}

export interface AiUsageRollup {
  mes: string;
  totalTokens: number;
  inputTokens: number;
  outputTokens: number;
  estimatedCostUsd: number;
  calls: number;
  byFeature: Record<string, AiUsageBucketStat>;
  byProvider: Record<string, AiUsageBucketStat>;
}

/** Doc de `aiUsageMonthly/{uid}_{mes}` (incluye userId). */
export interface AiUsageUserRow extends AiUsageRollup {
  /** ID del doc (`{uid}_{mes}`). */
  docId: string;
  userId: string;
  /** Datos de display resueltos del doc `users/{uid}` (best-effort). */
  nombre?: string;
  email?: string;
}

export type AiUsageSortBy = 'totalTokens' | 'estimatedCostUsd';

/**
 * Snapshot de cuota del propio usuario (`GET /api/ai-usage/me`).
 * Espejo de `QuotaService.snapshot()` del backend. `limit: null` = admin
 * (ilimitado). `resetAt` es ISO (1° del próximo mes UTC).
 */
export interface QuotaSnapshot {
  mes: string;
  role: 'admin' | 'pro' | 'standard';
  used: number;
  limit: number | null;
  remaining: number | null;
  pct: number;
  warn: boolean;
  blocked: boolean;
  imagesUsed: number;
  imagesLimit: number | null;
  imagesBlocked: boolean;
  resetAt: string;
  warnPct: number;
}
