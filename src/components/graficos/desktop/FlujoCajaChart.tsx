/**
 * Flujo de caja temporal: gasto acumulado del mes con línea de proyección,
 * o gasto diario. Toggle acumulado / diario.
 */

import { useState } from 'react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { TrendingUp } from 'lucide-react';
import { SegmentedControl } from '@components/common/SegmentedControl';
import { MetricTooltip } from '../charts/MetricTooltip';
import {
  AXIS_PROPS,
  GRID_STROKE,
  fmtEjeMoneda,
  fmtFechaCorta,
  fmtMoneda,
} from '../charts/chartTheme';
import type { AnalyticsSummary } from '@app-types';

interface FlujoCajaChartProps {
  summary: AnalyticsSummary;
}

export default function FlujoCajaChart({ summary }: FlujoCajaChartProps) {
  const [vista, setVista] = useState<'acumulado' | 'diario'>('acumulado');
  const moneda = summary.moneda;
  const data = summary.porDia;
  const hayDatos = data.length > 0;

  return (
    <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-indigo-500" />
            Flujo de caja
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Proyección fin de mes:{' '}
            <span className="font-semibold text-foreground">
              {fmtMoneda(summary.proyeccionFinMes, moneda)}
            </span>
          </p>
        </div>
        <SegmentedControl
          size="sm"
          value={vista}
          onChange={(v) => setVista(v as 'acumulado' | 'diario')}
          options={[
            { value: 'acumulado', label: 'Acumulado' },
            { value: 'diario', label: 'Diario' },
          ]}
        />
      </div>

      {!hayDatos ? (
        <div className="h-[320px] flex flex-col items-center justify-center text-muted-foreground bg-muted/10 rounded-lg border border-dashed border-border">
          <TrendingUp className="h-10 w-10 mb-2 opacity-20" />
          <p>Sin movimientos en este periodo</p>
        </div>
      ) : (
        <div className="h-[320px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            {vista === 'acumulado' ? (
              <AreaChart
                data={data}
                margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="gradAcum" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor="hsl(var(--primary))"
                      stopOpacity={0.35}
                    />
                    <stop
                      offset="95%"
                      stopColor="hsl(var(--primary))"
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke={GRID_STROKE}
                  vertical={false}
                />
                <XAxis
                  dataKey="fecha"
                  {...AXIS_PROPS}
                  tickFormatter={fmtFechaCorta}
                  dy={8}
                />
                <YAxis
                  {...AXIS_PROPS}
                  tickFormatter={(v) => fmtEjeMoneda(Number(v), moneda)}
                />
                <Tooltip
                  content={
                    <MetricTooltip
                      moneda={moneda}
                      labelFormatter={(l) => fmtFechaCorta(String(l))}
                    />
                  }
                />
                <ReferenceLine
                  y={summary.proyeccionFinMes}
                  stroke="hsl(var(--muted-foreground))"
                  strokeDasharray="6 4"
                  label={{
                    value: 'Proyección',
                    position: 'insideTopRight',
                    fontSize: 10,
                    fill: 'hsl(var(--muted-foreground))',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="acumulado"
                  name="Acumulado"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  fill="url(#gradAcum)"
                />
              </AreaChart>
            ) : (
              <BarChart
                data={data}
                margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke={GRID_STROKE}
                  vertical={false}
                />
                <XAxis
                  dataKey="fecha"
                  {...AXIS_PROPS}
                  tickFormatter={fmtFechaCorta}
                  dy={8}
                />
                <YAxis
                  {...AXIS_PROPS}
                  tickFormatter={(v) => fmtEjeMoneda(Number(v), moneda)}
                />
                <Tooltip
                  cursor={{ fill: 'hsl(var(--muted)/0.4)' }}
                  content={
                    <MetricTooltip
                      moneda={moneda}
                      labelFormatter={(l) => fmtFechaCorta(String(l))}
                    />
                  }
                />
                <Bar
                  dataKey="total"
                  name="Gasto del día"
                  fill="hsl(var(--primary))"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={28}
                />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
