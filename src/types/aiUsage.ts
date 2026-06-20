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
 * Forma mínima de un doc `aiUsageEvents/{id}` para la tendencia semanal.
 * Los rollups solo existen por mes; para agrupar por semana se leen los
 * eventos crudos (1 por llamada) y se agregan en el cliente. Solo admin lee
 * `aiUsageEvents` (Firestore rules).
 */
export interface AiUsageEventLite {
  /** Momento de la llamada (de `createdAt`, ya convertido a Date). */
  createdAt: Date;
  totalTokens: number;
  estimatedCostUsd: number;
}

/**
 * Snapshot de cuota del propio usuario (`GET /api/ai-usage/me`).
 * Espejo de `QuotaService.snapshot()` del backend. `limit: null` = admin
 * (ilimitado). `resetAt` es ISO (1° del próximo mes UTC).
 */
export interface QuotaSnapshot {
  mes: string;
  role: 'admin' | 'pro' | 'standard' | 'promocional';
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

/** Límites de cuota IA por rol (editables por admin). */
export interface QuotaConfig {
  standardTokens: number;
  proTokens: number;
  promocionalTokens: number;
  standardImages: number;
  proImages: number;
  promocionalImages: number;
  /** Duración por defecto del trial promocional (días). */
  promocionalDays: number;
  warnPct: number;
}

export interface QuotaConfigResponse {
  config: QuotaConfig;
  /** 'doc' = override del admin activo; 'env' = defaults de entorno. */
  source: 'doc' | 'env';
  envDefaults: QuotaConfig;
}

/**
 * Grupo de features con el modelo REAL en uso (resuelto por el backend desde
 * env/config). Espejo de `GET /api/ai-usage/models`.
 */
export interface ModelGroup {
  key: string;
  grupo: string;
  modelo: string;
  provider: 'anthropic' | 'openai';
  env: string;
  features: string[];
}

export interface ModelConfigResponse {
  groups: ModelGroup[];
  nota: string;
}

/** Costo real facturado de un proveedor (no es saldo restante). */
export interface ProviderCost {
  enabled: boolean;
  amountUsd?: number;
  error?: string;
}

export interface VendorCost {
  mes: string;
  anthropic: ProviderCost;
  openai: ProviderCost;
  note: string;
}
