/**
 * Tema y helpers compartidos para los gráficos de Métricas (recharts).
 * Sin JSX — solo constantes y funciones puras.
 */

import { formatearMoneda, formatearNumeroCompacto } from '@utils/formatters';
import type { Moneda } from '@app-types';

/**
 * Paleta de series. Colores distintivos que funcionan en light y dark.
 * Para categorías preferimos `getCategoryColor` (ConfigContext); esta paleta
 * es para series sin color semántico (método de pago, tags, etc.).
 */
export const CHART_PALETTE = [
  '#6366f1', // indigo
  '#10b981', // emerald
  '#f59e0b', // amber
  '#ef4444', // red
  '#3b82f6', // blue
  '#ec4899', // pink
  '#8b5cf6', // violet
  '#06b6d4', // cyan
  '#f97316', // orange
  '#84cc16', // lime
  '#14b8a6', // teal
  '#a855f7', // purple
] as const;

export function colorAt(index: number): string {
  return CHART_PALETTE[index % CHART_PALETTE.length];
}

/** Estilo del tooltip de recharts alineado al tema (HSL vars). */
export const TOOLTIP_CONTENT_STYLE: React.CSSProperties = {
  backgroundColor: 'hsl(var(--card))',
  border: '1px solid hsl(var(--border))',
  borderRadius: '8px',
  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
  color: 'hsl(var(--card-foreground))',
  fontSize: '12px',
};

export const AXIS_PROPS = {
  stroke: 'hsl(var(--muted-foreground))',
  fontSize: 11,
  tickLine: false,
  axisLine: false,
} as const;

export const GRID_STROKE = 'hsl(var(--border))';

/** Formatea un valor monetario completo (tooltips). */
export function fmtMoneda(value: number, moneda: string): string {
  return formatearMoneda(value, (moneda as Moneda) || 'PEN');
}

/** Etiqueta compacta para ejes (S/ 1.2k). */
export function fmtEjeMoneda(value: number, moneda: string): string {
  const prefijo = moneda === 'USD' ? '$' : moneda === 'PEN' ? 'S/' : '';
  return `${prefijo} ${formatearNumeroCompacto(value)}`;
}

/** DD/MM a partir de una fecha ISO `YYYY-MM-DD` (eje temporal). */
export function fmtFechaCorta(iso: string): string {
  const [, m, d] = iso.split('-');
  return d && m ? `${d}/${m}` : iso;
}
