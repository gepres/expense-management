/**
 * Versión mobile de Métricas: no invasiva.
 *
 * KPIs compactos + sparkline + top categorías + resumen IA (solo texto).
 * Sin gráficos pesados ni chat: invita a abrir el escritorio para el
 * análisis completo.
 */

import {
  ChevronLeft,
  ChevronRight,
  Monitor,
  Sparkles,
  TrendingUp,
  TrendingDown,
} from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';
import { useMetricas } from '@hooks/useMetricas';
import { useMetricasIA } from '@hooks/useMetricasIA';
import { useConfig } from '@context/ConfigContext';
import { formatearMoneda, formatearPorcentaje } from '@utils/formatters';
import CustomLoader from '@components/common/CustomLoader';
import ProBadge from '@components/common/ProBadge';
import RoastCard from '../RoastCard';
import type { Moneda } from '@app-types';

export default function MetricasMobile() {
  const {
    filtros,
    summary,
    loading,
    error,
    setPeriodo,
    refetch,
  } = useMetricas();
  const { getCategoryLabel } = useConfig();

  const enabled = (summary?.totales.numTransacciones ?? 0) > 0;
  const { insights } = useMetricasIA(filtros, undefined, enabled);

  const moneda = (summary?.moneda as Moneda) || 'PEN';
  const fmt = (n: number) => formatearMoneda(n, moneda);

  const irMes = (delta: number) => {
    const d = new Date(filtros.year, filtros.month - 1 + delta, 1);
    setPeriodo(d.getMonth() + 1, d.getFullYear());
  };
  const hoy = new Date();
  const esMesActual =
    filtros.month === hoy.getMonth() + 1 && filtros.year === hoy.getFullYear();

  return (
    <div className="space-y-4 pb-8">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
          Métricas
          <ProBadge size="sm" />
        </h1>
        <div className="flex items-center gap-1">
          <button
            onClick={() => irMes(-1)}
            className="p-1.5 rounded-lg hover:bg-accent text-muted-foreground"
            aria-label="Mes anterior"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="text-xs font-medium text-foreground capitalize min-w-[90px] text-center">
            {new Date(filtros.year, filtros.month - 1).toLocaleString('es', {
              month: 'short',
              year: '2-digit',
            })}
          </span>
          <button
            onClick={() => irMes(1)}
            disabled={esMesActual}
            className="p-1.5 rounded-lg hover:bg-accent text-muted-foreground disabled:opacity-40"
            aria-label="Mes siguiente"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {loading && !summary ? (
        <div className="flex items-center justify-center min-h-[30vh]">
          <CustomLoader />
        </div>
      ) : error && !summary ? (
        <div className="rounded-xl p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-300 dark:border-amber-700 text-amber-800 dark:text-amber-200 text-sm">
          {error}
          <button onClick={refetch} className="ml-2 underline">
            Reintentar
          </button>
        </div>
      ) : summary ? (
        <>
          {/* KPIs compactos */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-card border border-border rounded-xl p-3">
              <p className="text-[11px] text-muted-foreground">Total gastado</p>
              <p className="text-lg font-bold text-foreground">
                {fmt(summary.totales.totalGastado)}
              </p>
              <p
                className={`text-[11px] font-medium inline-flex items-center gap-0.5 ${
                  summary.comparativaMesAnterior.tendencia === 'estable'
                    ? 'text-muted-foreground'
                    : summary.comparativaMesAnterior.diferencia > 0
                      ? 'text-red-500'
                      : 'text-emerald-500'
                }`}
              >
                {summary.comparativaMesAnterior.diferencia > 0 ? (
                  <TrendingUp className="h-3 w-3" />
                ) : (
                  <TrendingDown className="h-3 w-3" />
                )}
                {formatearPorcentaje(
                  summary.comparativaMesAnterior.diferenciaPorcentaje,
                )}
              </p>
            </div>
            <div className="bg-card border border-border rounded-xl p-3">
              <p className="text-[11px] text-muted-foreground">
                Proyección fin de mes
              </p>
              <p className="text-lg font-bold text-foreground">
                {fmt(summary.proyeccionFinMes)}
              </p>
              <p className="text-[11px] text-muted-foreground">
                {summary.totales.numTransacciones} gastos
              </p>
            </div>
          </div>

          {/* Sparkline */}
          {summary.porDia.length > 0 && (
            <div className="bg-card border border-border rounded-xl p-3">
              <p className="text-[11px] text-muted-foreground mb-1">
                Gasto acumulado
              </p>
              <div className="h-20">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={summary.porDia}>
                    <defs>
                      <linearGradient id="mSpark" x1="0" y1="0" x2="0" y2="1">
                        <stop
                          offset="5%"
                          stopColor="hsl(var(--primary))"
                          stopOpacity={0.4}
                        />
                        <stop
                          offset="95%"
                          stopColor="hsl(var(--primary))"
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <Area
                      type="monotone"
                      dataKey="acumulado"
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                      fill="url(#mSpark)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Top categorías */}
          {summary.porCategoria.length > 0 && (
            <div className="bg-card border border-border rounded-xl p-4">
              <p className="text-sm font-semibold text-foreground mb-3">
                Top categorías
              </p>
              <div className="space-y-2.5">
                {summary.porCategoria.slice(0, 4).map((c) => (
                  <div key={c.categoria}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-foreground">
                        {getCategoryLabel(c.categoria)}
                      </span>
                      <span className="text-muted-foreground">
                        {fmt(c.total)}
                      </span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-1.5">
                      <div
                        className="h-full rounded-full bg-primary"
                        style={{ width: `${Math.min(c.porcentaje, 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Resumen IA (solo texto) */}
          {insights?.resumen && (
            <div className="rounded-xl p-[1px] bg-gradient-to-r from-indigo-600 to-purple-600">
              <div className="bg-card rounded-[11px] p-4">
                <p className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 mb-2 flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5" />
                  Resumen IA
                </p>
                <p className="text-sm text-foreground leading-relaxed">
                  {insights.resumen}
                </p>
                {insights.recomendaciones.slice(0, 2).map((r, i) => (
                  <p
                    key={i}
                    className="text-sm text-muted-foreground mt-2 flex gap-2"
                  >
                    <span className="text-amber-500 font-bold">{i + 1}.</span>
                    {r}
                  </p>
                ))}
              </div>
            </div>
          )}

          {/* Roast compartible (mobile-first para compartir) */}
          <RoastCard
            filtros={filtros}
            enabled={enabled}
            aiImageEnabled={summary.aiImageEnabled}
          />

          {/* Banner ir a escritorio */}
          <div className="rounded-xl border border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-900/20 p-4 flex items-start gap-3">
            <Monitor className="h-5 w-5 text-indigo-600 dark:text-indigo-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-foreground">
                Análisis completo en escritorio
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Gráficos interactivos, drilldown por categoría, presupuesto vs
                real, anomalías y chat con IA están optimizados para pantalla
                grande. Abre Gastos en tu computadora para verlo todo.
              </p>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
