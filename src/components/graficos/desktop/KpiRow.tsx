/**
 * Fila de KPIs del módulo de Métricas (desktop).
 */

import {
  TrendingUp,
  TrendingDown,
  Wallet,
  CalendarRange,
  Receipt,
  Crown,
  Flame,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useConfig } from '@context/ConfigContext';
import { formatearMoneda, formatearPorcentaje } from '@utils/formatters';
import { fmtFechaCorta } from '../charts/chartTheme';
import type { AnalyticsSummary, Moneda } from '@app-types';

interface KpiRowProps {
  summary: AnalyticsSummary;
}

interface KpiCardProps {
  icon: LucideIcon;
  label: string;
  value: string;
  sub?: React.ReactNode;
  accent?: string;
}

function KpiCard({ icon: Icon, label, value, sub, accent }: KpiCardProps) {
  return (
    <div className="bg-card border border-border rounded-xl p-4 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
      <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
        <Icon className={`h-16 w-16 ${accent ?? 'text-primary'}`} />
      </div>
      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-2">
          <div className="p-1.5 bg-muted rounded-lg">
            <Icon className={`h-4 w-4 ${accent ?? 'text-primary'}`} />
          </div>
          <p className="text-xs font-medium text-muted-foreground">{label}</p>
        </div>
        <p className="text-2xl font-bold text-foreground tracking-tight">
          {value}
        </p>
        {sub && <div className="mt-1.5 text-xs">{sub}</div>}
      </div>
    </div>
  );
}

export default function KpiRow({ summary }: KpiRowProps) {
  const { getCategoryLabel } = useConfig();
  const moneda = (summary.moneda as Moneda) || 'PEN';
  const fmt = (n: number) => formatearMoneda(n, moneda);

  const { totales, comparativaMesAnterior: cmp, proyeccionFinMes } = summary;
  const subio = cmp.diferencia > 0;
  const catTop = summary.porCategoria[0];
  const diaPico = summary.porDia.reduce(
    (max, d) => (d.total > max.total ? d : max),
    { fecha: '', total: 0, acumulado: 0 },
  );

  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
      <KpiCard
        icon={Wallet}
        label="Total gastado"
        value={fmt(totales.totalGastado)}
        accent="text-indigo-500"
        sub={
          <span
            className={`inline-flex items-center gap-1 font-medium ${
              cmp.tendencia === 'estable'
                ? 'text-muted-foreground'
                : subio
                  ? 'text-red-500'
                  : 'text-emerald-500'
            }`}
          >
            {cmp.tendencia !== 'estable' &&
              (subio ? (
                <TrendingUp className="h-3 w-3" />
              ) : (
                <TrendingDown className="h-3 w-3" />
              ))}
            {subio ? '+' : ''}
            {formatearPorcentaje(cmp.diferenciaPorcentaje)} vs mes anterior
          </span>
        }
      />

      <KpiCard
        icon={CalendarRange}
        label="Proyección fin de mes"
        value={fmt(proyeccionFinMes)}
        accent="text-blue-500"
        sub={
          <span className="text-muted-foreground">
            {summary.periodo.diasTranscurridos}/{summary.periodo.diasTotales}{' '}
            días
          </span>
        }
      />

      <KpiCard
        icon={TrendingDown}
        label="Promedio diario"
        value={fmt(totales.promedioDiario)}
        accent="text-emerald-500"
        sub={
          <span className="text-muted-foreground">
            {totales.diasConGasto} días con gasto
          </span>
        }
      />

      <KpiCard
        icon={Receipt}
        label="Transacciones"
        value={String(totales.numTransacciones)}
        accent="text-amber-500"
        sub={
          <span className="text-muted-foreground">
            {fmt(totales.promedioPorGasto)} c/u
          </span>
        }
      />

      <KpiCard
        icon={Crown}
        label="Categoría top"
        value={catTop ? getCategoryLabel(catTop.categoria) : '—'}
        accent="text-pink-500"
        sub={
          catTop ? (
            <span className="text-muted-foreground">
              {fmt(catTop.total)} ·{' '}
              {formatearPorcentaje(catTop.porcentaje)}
            </span>
          ) : undefined
        }
      />

      <KpiCard
        icon={Flame}
        label="Día pico"
        value={diaPico.fecha ? fmtFechaCorta(diaPico.fecha) : '—'}
        accent="text-orange-500"
        sub={
          diaPico.fecha ? (
            <span className="text-muted-foreground">
              {fmt(diaPico.total)}
            </span>
          ) : undefined
        }
      />
    </div>
  );
}
