/**
 * Gráfica de tendencia del consumo de IA con marcadores de cambios de modelo.
 * Granularidad mes/semana (controlada por el padre, que provee los datos de la
 * fuente óptima: rollups mensuales para "mes", eventos agregados para "semana").
 * La métrica (tokens / costo) la decide el caller (reusa el toggle del panel).
 */

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { BarChart3, Loader2 } from 'lucide-react';
import { SegmentedControl } from '@components/common/SegmentedControl';
import {
  AXIS_PROPS,
  GRID_STROKE,
  fmtEjeMoneda,
  colorAt,
} from '@components/graficos/charts/chartTheme';
import { MetricTooltip } from '@components/graficos/charts/MetricTooltip';
import { formatearNumeroCompacto } from '@utils/formatters';

export type TrendGranularity = 'mes' | 'semana';

export interface TrendPoint {
  /** Etiqueta del eje X (YYYY-MM en mes; DD/MM del lunes en semana). */
  label: string;
  tokens: number;
  costUsd: number;
}

interface ConsumoIATrendChartProps {
  data: TrendPoint[];
  metric: 'tokens' | 'cost';
  /** Etiquetas del eje donde hubo un cambio de modelo (marcador ⚙). */
  markerLabels: string[];
  granularity: TrendGranularity;
  onGranularityChange: (g: TrendGranularity) => void;
  loading?: boolean;
  /** Aviso opcional (p. ej. datos truncados por límite de lectura). */
  aviso?: string | null;
}

export default function ConsumoIATrendChart({
  data,
  metric,
  markerLabels,
  granularity,
  onGranularityChange,
  loading = false,
  aviso = null,
}: ConsumoIATrendChartProps) {
  const isCost = metric === 'cost';
  const dataKey = isCost ? 'costUsd' : 'tokens';
  const serieName = isCost ? 'Costo (USD)' : 'Tokens';
  const markerColor = colorAt(2); // ámbar de la paleta
  const marks = Array.from(new Set(markerLabels));
  const hayDatos = data.some((d) => d.tokens > 0 || d.costUsd > 0);

  return (
    <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
          <BarChart3 className="h-4 w-4 text-indigo-500" />
          Tendencia de consumo · {isCost ? 'costo (USD)' : 'tokens'}
        </h3>
        <div className="flex items-center gap-2">
          {marks.length > 0 && (
            <span className="text-[11px] text-muted-foreground flex items-center gap-1.5">
              <span
                className="inline-block h-3 w-0.5"
                style={{ backgroundColor: markerColor }}
              />
              ⚙ cambio de modelo
            </span>
          )}
          <SegmentedControl
            size="sm"
            value={granularity}
            onChange={(v) => onGranularityChange(v as TrendGranularity)}
            options={[
              { value: 'mes', label: 'Mes' },
              { value: 'semana', label: 'Semana' },
            ]}
          />
        </div>
      </div>

      {loading ? (
        <div className="h-[240px] flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : !hayDatos ? (
        <div className="h-[240px] flex flex-col items-center justify-center text-muted-foreground bg-muted/10 rounded-lg border border-dashed border-border">
          <BarChart3 className="h-8 w-8 mb-2 opacity-20" />
          <p className="text-sm">
            Sin consumo en {granularity === 'mes' ? 'los meses' : 'las semanas'}{' '}
            del periodo
          </p>
        </div>
      ) : (
        <div className="h-[240px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 16, right: 10, left: -8, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke={GRID_STROKE}
                vertical={false}
              />
              <XAxis dataKey="label" {...AXIS_PROPS} dy={8} />
              <YAxis
                {...AXIS_PROPS}
                width={52}
                tickFormatter={(v) =>
                  isCost
                    ? fmtEjeMoneda(Number(v), 'USD')
                    : formatearNumeroCompacto(Number(v))
                }
              />
              <Tooltip
                cursor={{ fill: 'hsl(var(--muted) / 0.4)' }}
                content={<MetricTooltip moneda="USD" asCurrency={isCost} />}
              />
              {marks.map((label) => (
                <ReferenceLine
                  key={label}
                  x={label}
                  stroke={markerColor}
                  strokeDasharray="5 4"
                  label={{
                    value: '⚙',
                    position: 'top',
                    fontSize: 13,
                    fill: markerColor,
                  }}
                />
              ))}
              <Bar
                dataKey={dataKey}
                name={serieName}
                fill="hsl(var(--primary))"
                radius={[4, 4, 0, 0]}
                maxBarSize={40}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {aviso && (
        <p className="text-[11px] text-amber-600 dark:text-amber-400 mt-2">
          {aviso}
        </p>
      )}
    </div>
  );
}
