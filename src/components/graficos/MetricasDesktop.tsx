/**
 * Vista de Métricas en escritorio: dashboard completo y detallado.
 *
 * El panel de IA + anomalías se integra en el Bloque 4.
 * El gating PRO / mobile / teaser se resuelve en `MetricasPage` (Bloque 5).
 */

import { Crown, BarChart3, WifiOff, AlertCircle } from 'lucide-react';
import { useMetricas } from '@hooks/useMetricas';
import CustomLoader from '@components/common/CustomLoader';
import FiltrosBar from './desktop/FiltrosBar';
import KpiRow from './desktop/KpiRow';
import FlujoCajaChart from './desktop/FlujoCajaChart';
import CategoriasPanel from './desktop/CategoriasPanel';
import PresupuestoVsRealPanel from './desktop/PresupuestoVsRealPanel';
import ExtrasPanel from './desktop/ExtrasPanel';

export default function MetricasDesktop() {
  const {
    filtros,
    summary,
    loading,
    refreshing,
    error,
    isOffline,
    setPeriodo,
    setAccountIds,
    setMoneda,
    refetch,
  } = useMetricas();

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground flex items-center gap-2">
            <BarChart3 className="h-7 w-7 text-indigo-500" />
            Métricas
            <span className="ml-1 inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-[11px] font-semibold">
              <Crown className="h-3 w-3" />
              PRO
            </span>
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Análisis profundo de tus finanzas con IA
          </p>
        </div>
      </div>

      <FiltrosBar
        filtros={filtros}
        monedasDisponibles={summary?.monedasDisponibles ?? []}
        monedaActiva={summary?.moneda ?? filtros.moneda ?? 'PEN'}
        refreshing={refreshing}
        onPeriodo={setPeriodo}
        onAccountIds={setAccountIds}
        onMoneda={setMoneda}
        onRefresh={refetch}
      />

      {/* Estados */}
      {error && (
        <div
          className={`rounded-xl p-4 flex items-center gap-3 border ${
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
          <span className="text-sm">{error}</span>
          <button
            onClick={refetch}
            className="ml-auto text-sm font-medium underline hover:no-underline"
          >
            Reintentar
          </button>
        </div>
      )}

      {loading && !summary ? (
        <div className="flex items-center justify-center min-h-[40vh]">
          <div className="text-center">
            <CustomLoader />
            <p className="text-muted-foreground animate-pulse mt-4">
              Analizando tus finanzas...
            </p>
          </div>
        </div>
      ) : summary ? (
        <div
          className={`space-y-6 transition-opacity ${
            refreshing ? 'opacity-60' : 'opacity-100'
          }`}
        >
          <KpiRow summary={summary} />
          <FlujoCajaChart summary={summary} />

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <CategoriasPanel summary={summary} />
            <PresupuestoVsRealPanel summary={summary} filtros={filtros} />
          </div>

          {/* Bloque 4: panel IA + anomalías + chat contextual se inserta aquí */}

          <ExtrasPanel summary={summary} />
        </div>
      ) : (
        !error && (
          <div className="flex flex-col items-center justify-center min-h-[40vh] text-muted-foreground">
            <BarChart3 className="h-12 w-12 mb-3 opacity-20" />
            <p>No hay datos para el periodo seleccionado.</p>
          </div>
        )
      )}
    </div>
  );
}
