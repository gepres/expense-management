/**
 * Tooltip temático reutilizable para los gráficos de Métricas.
 * Compatible con el `content` prop de recharts.
 */

import { TOOLTIP_CONTENT_STYLE, fmtMoneda } from './chartTheme';

interface TooltipPayloadItem {
  name?: string;
  value?: number;
  color?: string;
  payload?: Record<string, unknown>;
}

interface MetricTooltipProps {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  label?: string | number;
  moneda: string;
  /** Transforma el label (p.ej. ISO → DD/MM). */
  labelFormatter?: (label: string | number) => string;
  /** Si false, muestra el valor crudo en vez de moneda. */
  asCurrency?: boolean;
}

export function MetricTooltip({
  active,
  payload,
  label,
  moneda,
  labelFormatter,
  asCurrency = true,
}: MetricTooltipProps) {
  if (!active || !payload || payload.length === 0) return null;

  return (
    <div style={TOOLTIP_CONTENT_STYLE} className="px-3 py-2">
      {label !== undefined && (
        <p className="font-semibold mb-1 text-foreground">
          {labelFormatter ? labelFormatter(label) : label}
        </p>
      )}
      <div className="space-y-0.5">
        {payload.map((item, idx) => (
          <div key={idx} className="flex items-center gap-2">
            <span
              className="inline-block h-2 w-2 rounded-full"
              style={{ backgroundColor: item.color ?? 'hsl(var(--primary))' }}
            />
            <span className="text-muted-foreground">{item.name}:</span>
            <span className="font-medium text-foreground">
              {asCurrency
                ? fmtMoneda(Number(item.value ?? 0), moneda)
                : Number(item.value ?? 0).toLocaleString('es-PE')}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
