/**
 * Bitácora de cambios de modelo de IA (editorial, curada a mano).
 *
 * La CONFIGURACIÓN ACTUAL de modelos por grupo NO vive aquí: la sirve el
 * backend (`GET /api/ai-usage/models`) resolviendo las envs reales, para que
 * el panel muestre data viva y no se desincronice. Este archivo solo guarda la
 * narrativa histórica: qué cambió, cuándo y a quién afecta — algo que el
 * backend no registra (requeriría una colección de auditoría).
 *
 * Al cambiar un modelo en prod (una env), añade una entrada aquí.
 */

export interface CambioModelo {
  /** Mes YYYY-MM (ubica el marcador en la vista mensual de la gráfica). */
  mes: string;
  /** Fecha exacta YYYY-MM-DD (ubica el marcador en la vista semanal). */
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
    fecha: '2026-06-20',
    titulo: 'OCR cambiado a Claude Haiku 4.5 (activado en prod)',
    afecta: ['whatsapp_receipt_ocr', 'receipt_ocr', 'shared-receipt-scan'],
    detalle:
      'ANTHROPIC_MODEL_VISION=claude-haiku-4-5 en prod. El OCR de comprobantes pasa de Sonnet 4.6 a Haiku 4.5 (~3× más barato en tokens de entrada/salida). No afecta el parse de texto ni el chat (siguen en Sonnet).',
  },
  {
    mes: '2026-06',
    fecha: '2026-06-19',
    titulo: 'Tier "vision" separado para OCR',
    afecta: ['whatsapp_receipt_ocr', 'receipt_ocr', 'shared-receipt-scan'],
    detalle:
      'El OCR pasa a usar un modelo propio (ANTHROPIC_MODEL_VISION), aislado del parse de texto y del chat, para poder ajustarlo sin afectarlos.',
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
