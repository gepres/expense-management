/**
 * Categorías + tendencias.
 * Donut por categoría con drilldown a subcategoría + comparativa mes-a-mes
 * + lista de tendencias (↑/↓ %).
 */

import { useMemo, useState } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from 'recharts';
import {
  PieChart as PieIcon,
  TrendingUp,
  TrendingDown,
  Minus,
  ChevronLeft,
} from 'lucide-react';
import { useConfig } from '@context/ConfigContext';
import { formatearMoneda, formatearPorcentaje } from '@utils/formatters';
import { MetricTooltip } from '../charts/MetricTooltip';
import { AXIS_PROPS, GRID_STROKE, fmtEjeMoneda } from '../charts/chartTheme';
import type { AnalyticsSummary, Moneda } from '@app-types';

interface CategoriasPanelProps {
  summary: AnalyticsSummary;
}

export default function CategoriasPanel({ summary }: CategoriasPanelProps) {
  const { getCategoryLabel, getCategoryColor } = useConfig();
  const moneda = (summary.moneda as Moneda) || 'PEN';
  const fmt = (n: number) => formatearMoneda(n, moneda);

  const [drill, setDrill] = useState<string | null>(null);

  const datosDonut = useMemo(
    () =>
      summary.porCategoria
        .filter((c) => c.total > 0)
        .map((c) => ({
          key: c.categoria,
          name: getCategoryLabel(c.categoria),
          value: c.total,
          porcentaje: c.porcentaje,
          color: getCategoryColor(c.categoria),
        })),
    [summary.porCategoria, getCategoryLabel, getCategoryColor],
  );

  const subcats = useMemo(
    () =>
      drill
        ? summary.porSubcategoria
            .filter((s) => s.categoria === drill)
            .sort((a, b) => b.total - a.total)
        : [],
    [drill, summary.porSubcategoria],
  );

  const comparativa = useMemo(
    () =>
      summary.tendenciasCategoria
        .filter((t) => t.actual > 0 || t.anterior > 0)
        .slice(0, 6)
        .map((t) => ({
          name: getCategoryLabel(t.categoria),
          Actual: t.actual,
          Anterior: t.anterior,
        })),
    [summary.tendenciasCategoria, getCategoryLabel],
  );

  const tendencias = summary.tendenciasCategoria
    .filter((t) => t.tendencia !== 'estable')
    .slice(0, 6);

  const totalCat = datosDonut.reduce((a, b) => a + b.value, 0);

  return (
    <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
      <h2 className="text-lg font-bold text-foreground flex items-center gap-2 mb-6">
        <PieIcon className="h-5 w-5 text-pink-500" />
        Categorías y tendencias
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Donut + drilldown */}
        <div>
          {!drill ? (
            datosDonut.length > 0 ? (
              <div className="relative h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={datosDonut}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={70}
                      outerRadius={110}
                      paddingAngle={2}
                      onClick={(d: { key?: string }) =>
                        d?.key && setDrill(d.key)
                      }
                      className="cursor-pointer focus:outline-none"
                    >
                      {datosDonut.map((d) => (
                        <Cell key={d.key} fill={d.color} stroke="none" />
                      ))}
                    </Pie>
                    <Tooltip
                      content={<MetricTooltip moneda={moneda} />}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-xs text-muted-foreground">Total</span>
                  <span className="text-xl font-bold text-foreground">
                    {fmt(totalCat)}
                  </span>
                  <span className="text-[10px] text-muted-foreground mt-1">
                    clic para detalle
                  </span>
                </div>
              </div>
            ) : (
              <div className="h-[280px] flex items-center justify-center text-muted-foreground bg-muted/10 rounded-lg border border-dashed border-border">
                Sin datos de categorías
              </div>
            )
          ) : (
            <div className="h-[280px]">
              <button
                onClick={() => setDrill(null)}
                className="flex items-center gap-1 text-xs text-primary hover:underline mb-2"
              >
                <ChevronLeft className="h-3 w-3" /> Volver a categorías
              </button>
              <p className="text-sm font-semibold text-foreground mb-3">
                {getCategoryLabel(drill)} · subcategorías
              </p>
              {subcats.length > 0 ? (
                <div className="space-y-2 overflow-y-auto max-h-[230px] pr-1">
                  {subcats.map((s) => {
                    const pct =
                      totalCat > 0 ? (s.total / totalCat) * 100 : 0;
                    return (
                      <div key={s.subcategoria}>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-foreground">
                            {s.subcategoria}
                          </span>
                          <span className="text-muted-foreground">
                            {fmt(s.total)}
                          </span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-1.5">
                          <div
                            className="h-full rounded-full bg-pink-500"
                            style={{ width: `${Math.min(pct, 100)}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Esta categoría no tiene subcategorías registradas.
                </p>
              )}
            </div>
          )}

          {/* Leyenda compacta */}
          {!drill && datosDonut.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1">
              {datosDonut.slice(0, 8).map((d) => (
                <button
                  key={d.key}
                  onClick={() => setDrill(d.key)}
                  className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: d.color }}
                  />
                  {d.name} ({formatearPorcentaje(d.porcentaje)})
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Comparativa + tendencias */}
        <div className="space-y-4">
          <div>
            <p className="text-sm font-semibold text-foreground mb-2">
              Este mes vs mes anterior
            </p>
            {comparativa.length > 0 ? (
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={comparativa}
                    margin={{ top: 5, right: 5, left: -15, bottom: 0 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke={GRID_STROKE}
                      vertical={false}
                    />
                    <XAxis dataKey="name" {...AXIS_PROPS} hide />
                    <YAxis
                      {...AXIS_PROPS}
                      tickFormatter={(v) => fmtEjeMoneda(Number(v), moneda)}
                    />
                    <Tooltip
                      cursor={{ fill: 'hsl(var(--muted)/0.4)' }}
                      content={<MetricTooltip moneda={moneda} />}
                    />
                    <Legend
                      wrapperStyle={{ fontSize: 11 }}
                      iconType="circle"
                    />
                    <Bar
                      dataKey="Anterior"
                      fill="hsl(var(--muted-foreground))"
                      radius={[3, 3, 0, 0]}
                      maxBarSize={18}
                    />
                    <Bar
                      dataKey="Actual"
                      fill="hsl(var(--primary))"
                      radius={[3, 3, 0, 0]}
                      maxBarSize={18}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Sin comparativa disponible.
              </p>
            )}
          </div>

          <div>
            <p className="text-sm font-semibold text-foreground mb-2">
              Tendencias destacadas
            </p>
            {tendencias.length > 0 ? (
              <div className="space-y-1.5">
                {tendencias.map((t) => {
                  const creciente = t.tendencia === 'creciente';
                  return (
                    <div
                      key={t.categoria}
                      className="flex items-center justify-between text-sm py-1.5 px-2 rounded-lg hover:bg-accent/50"
                    >
                      <span className="text-foreground">
                        {getCategoryLabel(t.categoria)}
                      </span>
                      <span
                        className={`inline-flex items-center gap-1 font-medium ${
                          creciente ? 'text-red-500' : 'text-emerald-500'
                        }`}
                      >
                        {creciente ? (
                          <TrendingUp className="h-3.5 w-3.5" />
                        ) : (
                          <TrendingDown className="h-3.5 w-3.5" />
                        )}
                        {creciente ? '+' : ''}
                        {formatearPorcentaje(t.porcentajeCambio)}
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground inline-flex items-center gap-1">
                <Minus className="h-3.5 w-3.5" /> Gasto estable entre meses.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
