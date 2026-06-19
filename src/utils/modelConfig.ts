/**
 * Configuración de modelos de IA por grupo de features + bitácora de cambios.
 *
 * Fuente de verdad para que el panel "Consumo IA" muestre QUÉ modelo usa cada
 * grupo y CUÁNDO se cambió y A QUIÉNES afecta. Un cambio de modelo es config
 * global (env del backend/functions), así que "afecta" = todas las features
 * listadas → y por tanto todos los usuarios que las usan.
 *
 * Mantener al día al cambiar una env de modelo (ANTHROPIC_MODEL,
 * ANTHROPIC_MODEL_PRIMARY, ANTHROPIC_MODEL_VISION, ANTHROPIC_MODEL_HELPER,
 * ANTHROPIC_ANALYTICS_MODEL, OPENAI_MODEL_TRANSCRIBE).
 */

export interface ModeloGrupo {
  grupo: string;
  /** Modelo activo (refleja el default; ajustar si cambia la env). */
  modelo: string;
  /** Variable de entorno que lo controla. */
  env: string;
  /** Features que usan este grupo. */
  features: string[];
}

export const MODELOS_ACTUALES: ModeloGrupo[] = [
  {
    grupo: 'OCR / visión (comprobantes)',
    modelo: 'Claude Sonnet 4.6',
    env: 'ANTHROPIC_MODEL_VISION',
    features: ['whatsapp_receipt_ocr', 'receipt_ocr', 'shared-receipt-scan'],
  },
  {
    grupo: 'Parse texto / voz',
    modelo: 'Claude Sonnet 4.6',
    env: 'ANTHROPIC_MODEL_PRIMARY',
    features: ['whatsapp_expense_parse', 'voice_expense'],
  },
  {
    grupo: 'Helpers (clasificación)',
    modelo: 'Claude Haiku 4.5',
    env: 'ANTHROPIC_MODEL_HELPER',
    features: [
      'category_classify',
      'whatsapp_date_parse',
      'whatsapp_category_classify',
      'whatsapp_payment_disambiguation',
    ],
  },
  {
    grupo: 'Chat asistente',
    modelo: 'Claude Sonnet 4.6',
    env: 'ANTHROPIC_MODEL',
    features: ['assistant_chat'],
  },
  {
    grupo: 'Métricas (PRO)',
    modelo: 'Claude Sonnet 4.6',
    env: 'ANTHROPIC_ANALYTICS_MODEL',
    features: ['metrics_insights', 'metrics_ask', 'metrics_roast'],
  },
  {
    grupo: 'Audio (transcripción)',
    modelo: 'OpenAI gpt-4o-mini-transcribe',
    env: 'OPENAI_MODEL_TRANSCRIBE',
    features: ['whatsapp_audio_transcribe', 'voice_transcribe'],
  },
  {
    grupo: 'Imagen (roast)',
    modelo: 'OpenAI gpt-image-1',
    env: '—',
    features: ['metrics_image'],
  },
];

export interface CambioModelo {
  /** Mes YYYY-MM (ubica el marcador en la gráfica de tendencia). */
  mes: string;
  /** Fecha exacta YYYY-MM-DD. */
  fecha: string;
  titulo: string;
  /** Features afectadas (config global → todos los usuarios de esas features). */
  afecta: string[];
  detalle?: string;
}

/** Bitácora (más reciente primero). Añadir una entrada al cambiar un modelo. */
export const MODEL_CHANGELOG: CambioModelo[] = [
  {
    mes: '2026-06',
    fecha: '2026-06-19',
    titulo: 'Tier "vision" separado para OCR (default Sonnet 4.6)',
    afecta: ['whatsapp_receipt_ocr', 'receipt_ocr', 'shared-receipt-scan'],
    detalle:
      'El OCR ahora usa un modelo propio (ANTHROPIC_MODEL_VISION), aislado del parse de texto y del chat. Por defecto sigue en Sonnet 4.6; al setear la env a claude-haiku-4-5 el OCR pasa a Haiku (~3× más barato), sin afectar parse ni chat.',
  },
  {
    mes: '2026-06',
    fecha: '2026-06-19',
    titulo: 'Limpieza de IDs de modelo retirados → claude-sonnet-4-6',
    afecta: ['assistant_chat'],
    detalle:
      'Se reemplazaron IDs obsoletos (claude-sonnet-4-20250514 / claude-sonnet-4) por claude-sonnet-4-6. Sin cambio de comportamiento.',
  },
];

/** Cambios cuyo mes cae dentro de la ventana dada (para marcar la gráfica). */
export function cambiosEnVentana(meses: string[]): CambioModelo[] {
  const set = new Set(meses);
  return MODEL_CHANGELOG.filter((c) => set.has(c.mes));
}
