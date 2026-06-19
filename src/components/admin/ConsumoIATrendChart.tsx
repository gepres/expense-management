/**
 * Gráfica de tendencia del consumo de IA (últimos meses) con marcadores de
 * cambios de modelo. La métrica (tokens / costo) la decide el caller, normalmente
 * reusando el toggle "Por tokens / Por costo" del panel.
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
import {
  AXIS_PROPS,
  GRID_STROKE,
  fmtEjeMoneda,
  colorAt,
} from '@components/graficos/charts/chartTheme';
import { MetricTooltip } from '@components/graficos/charts/MetricTooltip';
import { formatearNumeroCompacto } from '@utils/formatters';
import type { CambioModelo } from '@utils/modelConfig';

export interface TrendPoint {
  mes: string;
  tokens: number;
  costUsd: number;
}

interface ConsumoIATrendChartProps {
  data: TrendPoint[];
  metric: 'tokens' | 'cost';
  cambios: CambioModelo[];
  loading?: boolean;
}

export default function ConsumoIATrendChart({
  data,
  metric,
  cambios,
  loading = false,
}: ConsumoIATrendChartProps) {
  const isCost = metric === 'cost';
  const dataKey = isCost ? 'costUsd' : 'tokens';
  const serieName = isCost ? 'Costo (USD)' : 'Tokens';
  const markerColor = colorAt(2); // ámbar de la paleta

  // Un marcador por mes con cambios (puede haber varios cambios el mismo mes).
  const mesesCambio = Array.from(new Set(cambios.map((c) => c.mes)));
  const hayDatos = data.some((d) => d.tokens > 0 || d.costUsd > 0);

  return (
    <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
          <BarChart3 className="h-4 w-4 text-indigo-500" />
          Tendencia de consumo · {isCost ? 'costo (USD)' : 'tokens'}
        </h3>
        {mesesCambio.length > 0 && (
          <span className="text-[11px] text-muted-foreground flex items-center gap-1.5">
            <span
              className="inline-block h-3 w-0.5"
              style={{ backgroundColor: markerColor }}
            />
            ⚙ cambio de modelo
          </span>
        )}
      </div>

      {loading ? (
        <div className="h-[240px] flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : !hayDatos ? (
        <div className="h-[240px] flex flex-col items-center justify-center text-muted-foreground bg-muted/10 rounded-lg border border-dashed border-border">
          <BarChart3 className="h-8 w-8 mb-2 opacity-20" />
          <p className="text-sm">Sin consumo en el periodo</p>
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
              <XAxis dataKey="mes" {...AXIS_PROPS} dy={8} />
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
              {mesesCambio.map((m) => (
                <ReferenceLine
                  key={m}
                  x={m}
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
    </div>
  );
}
