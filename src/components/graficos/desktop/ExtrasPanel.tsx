/**
 * Extras: método de pago · top tags · top gastos del periodo.
 */

import { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { CreditCard, Tag, Trophy } from 'lucide-react';
import { useConfig } from '@context/ConfigContext';
import { formatearMoneda } from '@utils/formatters';
import { MetricTooltip } from '../charts/MetricTooltip';
import { AXIS_PROPS, colorAt, fmtEjeMoneda } from '../charts/chartTheme';
import type { AnalyticsSummary, Moneda } from '@app-types';

interface ExtrasPanelProps {
  summary: AnalyticsSummary;
}

export default function ExtrasPanel({ summary }: ExtrasPanelProps) {
  const { getPaymentMethodLabel, getCategoryLabel } = useConfig();
  const moneda = (summary.moneda as Moneda) || 'PEN';
  const fmt = (n: number) => formatearMoneda(n, moneda);

  const metodos = useMemo(
    () =>
      summary.porMetodoPago
        .filter((m) => m.total > 0)
        .map((m) => ({
          name: getPaymentMethodLabel(m.metodoPago),
          value: m.total,
        })),
    [summary.porMetodoPago, getPaymentMethodLabel],
  );

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
      {/* Método de pago */}
      <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
        <h3 className="text-sm font-bold text-foreground flex items-center gap-2 mb-4">
          <CreditCard className="h-4 w-4 text-cyan-500" />
          Por método de pago
        </h3>
        {metodos.length > 0 ? (
          <div className="h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                layout="vertical"
                data={metodos}
                margin={{ top: 0, right: 10, left: 10, bottom: 0 }}
              >
                <XAxis
                  type="number"
                  {...AXIS_PROPS}
                  tickFormatter={(v) => fmtEjeMoneda(Number(v), moneda)}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  {...AXIS_PROPS}
                  width={90}
                />
                <Tooltip
                  cursor={{ fill: 'hsl(var(--muted)/0.4)' }}
                  content={<MetricTooltip moneda={moneda} />}
                />
                <Bar dataKey="value" name="Total" radius={[0, 4, 4, 0]} maxBarSize={24}>
                  {metodos.map((_, i) => (
                    <Cell key={i} fill={colorAt(i)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground h-[220px] flex items-center justify-center">
            Sin datos
          </p>
        )}
      </div>

      {/* Top tags */}
      <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
        <h3 className="text-sm font-bold text-foreground flex items-center gap-2 mb-4">
          <Tag className="h-4 w-4 text-violet-500" />
          Top etiquetas
        </h3>
        {summary.topTags.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {summary.topTags.slice(0, 12).map((t) => (
              <span
                key={t.tag}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-muted text-xs text-foreground"
              >
                #{t.tag}
                <span className="text-muted-foreground">
                  {fmt(t.total)} · {t.count}
                </span>
              </span>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground h-[220px] flex items-center justify-center">
            Sin etiquetas en este periodo
          </p>
        )}
      </div>

      {/* Top gastos */}
      <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
        <h3 className="text-sm font-bold text-foreground flex items-center gap-2 mb-4">
          <Trophy className="h-4 w-4 text-amber-500" />
          Gastos más altos
        </h3>
        {summary.topGastos.length > 0 ? (
          <div className="divide-y divide-border">
            {summary.topGastos.map((g, i) => (
              <div key={g.id} className="flex items-center gap-3 py-2.5">
                <span className="h-6 w-6 rounded-full bg-muted flex items-center justify-center text-[10px] font-bold text-muted-foreground flex-shrink-0">
                  {i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground truncate">
                    {g.descripcion}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    {getCategoryLabel(g.categoria)} · {g.fecha}
                  </p>
                </div>
                <span className="text-sm font-bold text-foreground">
                  {fmt(g.monto)}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground h-[220px] flex items-center justify-center">
            Sin gastos
          </p>
        )}
      </div>
    </div>
  );
}
