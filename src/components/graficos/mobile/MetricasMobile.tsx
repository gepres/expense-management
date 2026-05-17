/**
 * Vista de Métricas en mobile — experiencia COMPLETA (uso principal).
 *
 * Patrón: filtro sticky + tabs segmentados (Resumen · Categorías · Rankings ·
 * Roast) con render diferido por tab. Reutiliza los paneles desktop ya
 * probados para consistencia. Best practices mobile: divulgación progresiva,
 * targets ≥44px, carrusel snap de KPIs, tap-para-detalle, sin hover.
 */

import { useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  WifiOff,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  Wallet,
  CalendarRange,
  Receipt,
  Crown,
  Flame,
  AlertTriangle,
} from 'lucide-react';
import { useMetricas } from '@hooks/useMetricas';
import { useConfig } from '@context/ConfigContext';
import { formatearMoneda, formatearPorcentaje } from '@utils/formatters';
import { fmtFechaCorta } from '../charts/chartTheme';
import CustomLoader from '@components/common/CustomLoader';
import ProBadge from '@components/common/ProBadge';
import { SegmentedControl } from '@components/common/SegmentedControl';
import FlujoCajaChart from '../desktop/FlujoCajaChart';
import CategoriasPanel from '../desktop/CategoriasPanel';
import PresupuestoVsRealPanel from '../desktop/PresupuestoVsRealPanel';
import ExtrasPanel from '../desktop/ExtrasPanel';
import IAPanel from '../desktop/IAPanel';
import RoastCard from '../RoastCard';
import type { AnalyticsSummary, Moneda } from '@app-types';

type Tab = 'resumen' | 'categorias' | 'rankings' | 'roast';

// ---------------------------------------------------------------------------
// KPI carrusel (snap horizontal, touch-friendly)
// ---------------------------------------------------------------------------

function KpiCarousel({ summary }: { summary: AnalyticsSummary }) {
  const { getCategoryLabel } = useConfig();
  const moneda = (summary.moneda as Moneda) || 'PEN';
  const fmt = (n: number) => formatearMoneda(n, moneda);
  const { totales, comparativaMesAnterior: cmp } = summary;
  const subio = cmp.diferencia > 0;
  const catTop = summary.porCategoria[0];
  const diaPico = summary.porDia.reduce(
    (max, d) => (d.total > max.total ? d : max),
    { fecha: '', total: 0, acumulado: 0 },
  );

  const items = [
    {
      icon: Wallet,
      label: 'Total gastado',
      value: fmt(totales.totalGastado),
      accent: 'text-indigo-500',
      sub: (
        <span
          className={`inline-flex items-center gap-0.5 font-medium ${
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
          {formatearPorcentaje(cmp.diferenciaPorcentaje)} vs mes ant.
        </span>
      ),
    },
    {
      icon: CalendarRange,
      label: 'Proyección fin de mes',
      value: fmt(summary.proyeccionFinMes),
      accent: 'text-blue-500',
      sub: (
        <span className="text-muted-foreground">
          {summary.periodo.diasTranscurridos}/{summary.periodo.diasTotales} días
        </span>
      ),
    },
    {
      icon: TrendingDown,
      label: 'Promedio diario',
      value: fmt(totales.promedioDiario),
      accent: 'text-emerald-500',
      sub: (
        <span className="text-muted-foreground">
          {totales.diasConGasto} días con gasto
        </span>
      ),
    },
    {
      icon: Receipt,
      label: 'Transacciones',
      value: String(totales.numTransacciones),
      accent: 'text-amber-500',
      sub: (
        <span className="text-muted-foreground">
          {fmt(totales.promedioPorGasto)} c/u
        </span>
      ),
    },
    {
      icon: Crown,
      label: 'Categoría top',
      value: catTop ? getCategoryLabel(catTop.categoria) : '—',
      accent: 'text-pink-500',
      sub: catTop ? (
        <span className="text-muted-foreground">
          {fmt(catTop.total)} · {formatearPorcentaje(catTop.porcentaje)}
        </span>
      ) : null,
    },
    {
      icon: Flame,
      label: 'Día pico',
      value: diaPico.fecha ? fmtFechaCorta(diaPico.fecha) : '—',
      accent: 'text-orange-500',
      sub: diaPico.fecha ? (
        <span className="text-muted-foreground">{fmt(diaPico.total)}</span>
      ) : null,
    },
  ];

  return (
    <div className="-mx-4 px-4 overflow-x-auto snap-x snap-mandatory flex gap-3 pb-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
      {items.map((it) => (
        <div
          key={it.label}
          className="snap-start shrink-0 w-[62%] max-w-[230px] bg-card border border-border rounded-xl p-4 shadow-sm"
        >
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 bg-muted rounded-lg">
              <it.icon className={`h-4 w-4 ${it.accent}`} />
            </div>
            <p className="text-[11px] font-medium text-muted-foreground truncate">
              {it.label}
            </p>
          </div>
          <p className="text-xl font-bold text-foreground tracking-tight truncate">
            {it.value}
          </p>
          {it.sub && <div className="mt-1 text-[11px]">{it.sub}</div>}
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Anomalías (Rankings)
// ---------------------------------------------------------------------------

function AnomaliasList({ summary }: { summary: AnalyticsSummary }) {
  const { getCategoryLabel } = useConfig();
  const moneda = (summary.moneda as Moneda) || 'PEN';
  if (summary.anomalias.length === 0) return null;
  return (
    <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
      <h3 className="text-sm font-bold text-foreground flex items-center gap-2 mb-3">
        <AlertTriangle className="h-4 w-4 text-red-500" />
        Gastos inusuales
      </h3>
      <div className="divide-y divide-border">
        {summary.anomalias.slice(0, 6).map((a) => (
          <div key={a.id} className="flex items-center gap-3 py-2.5">
            <div className="flex-1 min-w-0">
              <p className="text-sm text-foreground truncate">
                {a.descripcion}
              </p>
              <p className="text-[11px] text-muted-foreground">
                {getCategoryLabel(a.categoria)} · {a.razon} (
                {a.desviacion.toFixed(1)}σ)
              </p>
            </div>
            <span className="text-sm font-bold text-foreground">
              {formatearMoneda(a.monto, moneda)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------

export default function MetricasMobile() {
  const { filtros, summary, loading, error, isOffline, setPeriodo, refetch } =
    useMetricas();
  const [tab, setTab] = useState<Tab>('resumen');

  const enabled = (summary?.totales.numTransacciones ?? 0) > 0;

  const irMes = (delta: number) => {
    const d = new Date(filtros.year, filtros.month - 1 + delta, 1);
    setPeriodo(d.getMonth() + 1, d.getFullYear());
  };
  const hoy = new Date();
  const esMesActual =
    filtros.month === hoy.getMonth() + 1 && filtros.year === hoy.getFullYear();

  return (
    <div className="pb-8">
      {/* Header + filtro + tabs (sticky) */}
      <div className="sticky top-0 z-20 -mx-4 px-4 pt-2 pb-3 bg-background/95 backdrop-blur-sm border-b border-border space-y-3">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
            Métricas
            <ProBadge size="sm" />
          </h1>
          <div className="flex items-center gap-1">
            <button
              onClick={() => irMes(-1)}
              className="p-2 rounded-lg hover:bg-accent text-muted-foreground"
              aria-label="Mes anterior"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="text-xs font-medium text-foreground capitalize min-w-[78px] text-center">
              {new Date(filtros.year, filtros.month - 1).toLocaleString('es', {
                month: 'short',
                year: '2-digit',
              })}
            </span>
            <button
              onClick={() => irMes(1)}
              disabled={esMesActual}
              className="p-2 rounded-lg hover:bg-accent text-muted-foreground disabled:opacity-40"
              aria-label="Mes siguiente"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
            <button
              onClick={refetch}
              className="p-2 rounded-lg hover:bg-accent text-muted-foreground"
              aria-label="Refrescar"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>
        </div>

        <SegmentedControl
          size="sm"
          fullWidth
          value={tab}
          onChange={(v) => setTab(v as Tab)}
          options={[
            { value: 'resumen', label: 'Resumen' },
            { value: 'categorias', label: 'Categorías' },
            { value: 'rankings', label: 'Rankings' },
            { value: 'roast', label: '🔥 Roast' },
          ]}
        />
      </div>

      <div className="pt-4">
        {loading && !summary ? (
          <div className="flex items-center justify-center min-h-[40vh]">
            <CustomLoader />
          </div>
        ) : error && !summary ? (
          <div
            className={`rounded-xl p-4 flex items-start gap-3 border text-sm ${
              isOffline
                ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-300 dark:border-amber-700 text-amber-800 dark:text-amber-200'
                : 'bg-red-50 dark:bg-red-900/20 border-red-300 dark:border-red-700 text-red-700 dark:text-red-300'
            }`}
          >
            {isOffline ? (
              <WifiOff className="h-5 w-5 flex-shrink-0" />
            ) : (
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
            )}
            <span>{error}</span>
            <button onClick={refetch} className="ml-auto underline font-medium">
              Reintentar
            </button>
          </div>
        ) : summary ? (
          <div className="space-y-4">
            {tab === 'resumen' && (
              <>
                <KpiCarousel summary={summary} />
                <FlujoCajaChart summary={summary} />
                {/* Análisis IA completo (mismo panel que escritorio:
                    resumen, recomendaciones, observaciones, anomalías,
                    selector de foco y mini-chat contextual). */}
                <IAPanel summary={summary} filtros={filtros} />
              </>
            )}

            {tab === 'categorias' && (
              <>
                <CategoriasPanel summary={summary} />
                <PresupuestoVsRealPanel summary={summary} filtros={filtros} />
              </>
            )}

            {tab === 'rankings' && (
              <>
                <ExtrasPanel summary={summary} />
                <AnomaliasList summary={summary} />
              </>
            )}

            {tab === 'roast' && (
              <RoastCard
                filtros={filtros}
                enabled={enabled}
                aiImageEnabled={summary.aiImageEnabled}
              />
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
}
