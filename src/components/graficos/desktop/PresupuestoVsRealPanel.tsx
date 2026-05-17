/**
 * Presupuesto vs real.
 * Combina los límites de `usePresupuestos` (por bucket) con el `gastado`
 * que ya calculó el backend en el summary (porCategoria / totalGastado).
 */

import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Target, AlertTriangle, ArrowRight } from 'lucide-react';
import { useConfig } from '@context/ConfigContext';
import { usePresupuestos } from '@hooks/usePresupuestos';
import { formatearMoneda, formatearPorcentaje } from '@utils/formatters';
import { CATEGORIA_GENERAL, BUCKET_EFECTIVO } from '@app-types';
import type { AnalyticsSummary, MetricasFiltros, Moneda } from '@app-types';

interface PresupuestoVsRealPanelProps {
  summary: AnalyticsSummary;
  filtros: MetricasFiltros;
}

function GaugeGeneral({
  pct,
  label,
  sub,
}: {
  pct: number;
  label: string;
  sub: string;
}) {
  const r = 52;
  const circ = 2 * Math.PI * r;
  const clamped = Math.min(pct, 100);
  const offset = circ - (clamped / 100) * circ;
  const color =
    pct >= 100 ? '#ef4444' : pct >= 80 ? '#f59e0b' : '#10b981';

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative h-[140px] w-[140px]">
        <svg className="h-full w-full -rotate-90" viewBox="0 0 120 120">
          <circle
            cx="60"
            cy="60"
            r={r}
            fill="none"
            stroke="hsl(var(--muted))"
            strokeWidth="12"
          />
          <circle
            cx="60"
            cy="60"
            r={r}
            fill="none"
            stroke={color}
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={circ}
            strokeDashoffset={offset}
            style={{ transition: 'stroke-dashoffset .6s ease' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold text-foreground">
            {formatearPorcentaje(pct)}
          </span>
          <span className="text-[10px] text-muted-foreground">{label}</span>
        </div>
      </div>
      <p className="text-xs text-muted-foreground mt-2 text-center">{sub}</p>
    </div>
  );
}

export default function PresupuestoVsRealPanel({
  summary,
  filtros,
}: PresupuestoVsRealPanelProps) {
  const { getCategoryLabel } = useConfig();
  const { presupuestosDelMes } = usePresupuestos();
  const moneda = (summary.moneda as Moneda) || 'PEN';
  const fmt = (n: number) => formatearMoneda(n, moneda);

  const mesKey = `${filtros.year}-${String(filtros.month).padStart(2, '0')}`;
  const accountId = filtros.accountIds?.[0];

  // Hoisted para que el React Compiler infiera deps consistentes con el
  // array manual (evita `preserve-manual-memoization`).
  const porCategoria = summary.porCategoria;
  const totalGastado = summary.totales.totalGastado;

  const { general, categorias } = useMemo(() => {
    const presupuestos = presupuestosDelMes(mesKey, accountId).filter(
      (p) => p.moneda === moneda,
    );

    let limiteGeneral = 0;
    const porBucket = new Map<string, number>();
    for (const p of presupuestos) {
      if (p.bucket === CATEGORIA_GENERAL) {
        limiteGeneral += p.limite;
      } else if (p.bucket === BUCKET_EFECTIVO) {
        // No aplica a métricas de gasto por categoría.
      } else {
        porBucket.set(
          p.bucket,
          (porBucket.get(p.bucket) ?? 0) + p.limite,
        );
      }
    }

    const gastadoPorCat = new Map(
      porCategoria.map((c) => [c.categoria, c.total]),
    );

    const cats = Array.from(porBucket.entries())
      .map(([bucket, limite]) => {
        const gastado = gastadoPorCat.get(bucket) ?? 0;
        return {
          bucket,
          limite,
          gastado,
          pct: limite > 0 ? (gastado / limite) * 100 : 0,
        };
      })
      .sort((a, b) => b.pct - a.pct);

    const gen =
      limiteGeneral > 0
        ? {
            limite: limiteGeneral,
            gastado: totalGastado,
            pct: (totalGastado / limiteGeneral) * 100,
          }
        : null;

    return { general: gen, categorias: cats };
  }, [
    presupuestosDelMes,
    mesKey,
    accountId,
    moneda,
    porCategoria,
    totalGastado,
  ]);

  const sinPresupuestos = !general && categorias.length === 0;

  return (
    <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
          <Target className="h-5 w-5 text-blue-500" />
          Presupuesto vs real
        </h2>
        <Link
          to="/presupuestos"
          className="text-xs font-medium text-primary hover:underline flex items-center gap-1"
        >
          Gestionar <ArrowRight className="h-3 w-3" />
        </Link>
      </div>

      {sinPresupuestos ? (
        <div className="h-[200px] flex flex-col items-center justify-center text-center text-muted-foreground bg-muted/10 rounded-lg border border-dashed border-border px-4">
          <Target className="h-10 w-10 mb-2 opacity-20" />
          <p className="text-sm">
            No hay presupuestos para {mesKey} en {moneda}
            {accountId ? ' (cuenta seleccionada)' : ''}.
          </p>
          <Link
            to="/presupuestos"
            className="mt-2 text-xs font-semibold text-primary hover:underline"
          >
            Crear presupuesto
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {general && (
            <GaugeGeneral
              pct={general.pct}
              label="del general"
              sub={`${fmt(general.gastado)} de ${fmt(general.limite)}`}
            />
          )}

          <div
            className={`${general ? 'lg:col-span-2' : 'lg:col-span-3'} space-y-3`}
          >
            {categorias.length > 0 ? (
              categorias.map((c) => {
                const excede = c.pct >= 100;
                const cerca = c.pct >= 80 && c.pct < 100;
                return (
                  <div key={c.bucket}>
                    <div className="flex justify-between items-center text-sm mb-1">
                      <span className="text-foreground inline-flex items-center gap-1.5">
                        {getCategoryLabel(c.bucket)}
                        {excede && (
                          <AlertTriangle className="h-3.5 w-3.5 text-red-500" />
                        )}
                      </span>
                      <span className="text-muted-foreground text-xs">
                        {fmt(c.gastado)} / {fmt(c.limite)} ·{' '}
                        <span
                          className={
                            excede
                              ? 'text-red-500 font-semibold'
                              : cerca
                                ? 'text-amber-500 font-semibold'
                                : 'text-emerald-500'
                          }
                        >
                          {formatearPorcentaje(c.pct)}
                        </span>
                      </span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          excede
                            ? 'bg-red-500'
                            : cerca
                              ? 'bg-amber-500'
                              : 'bg-emerald-500'
                        }`}
                        style={{ width: `${Math.min(c.pct, 100)}%` }}
                      />
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-sm text-muted-foreground">
                Solo tienes presupuesto general este mes.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
