/**
 * Barra de filtros del módulo de Métricas (desktop).
 * Periodo (navegación mensual) · cuenta · moneda · refrescar · exportar.
 *
 * Export Excel/CSV ya funciona (endpoint backend del Bloque 1). PNG/PDF se
 * añaden en el Bloque 6 vía `onExportVisual`.
 */

import { useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Download,
  FileSpreadsheet,
  FileText,
  Image as ImageIcon,
  CalendarDays,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAccountsContext } from '@context/AccountsContext';
import { AnalyticsService } from '@services/analytics';
import { SegmentedControl } from '@components/common/SegmentedControl';
import Button from '@components/common/Button';
import type { MetricasFiltros, Moneda, ExportMetricasFormato } from '@app-types';

interface FiltrosBarProps {
  filtros: MetricasFiltros;
  monedasDisponibles: string[];
  monedaActiva: string;
  refreshing: boolean;
  onPeriodo: (month: number, year: number) => void;
  onAccountIds: (ids: string[] | undefined) => void;
  onMoneda: (m: Moneda | undefined) => void;
  onRefresh: () => void;
  /** Exportaciones visuales (PNG/PDF) — se conecta en el Bloque 6. */
  onExportVisual?: (formato: 'png' | 'pdf') => void;
}

function nombreMes(month: number, year: number): string {
  return new Date(year, month - 1).toLocaleString('es', {
    month: 'long',
    year: 'numeric',
  });
}

export default function FiltrosBar({
  filtros,
  monedasDisponibles,
  monedaActiva,
  refreshing,
  onPeriodo,
  onAccountIds,
  onMoneda,
  onRefresh,
  onExportVisual,
}: FiltrosBarProps) {
  const { activeAccounts } = useAccountsContext();
  const [exportMenuOpen, setExportMenuOpen] = useState(false);
  const [exporting, setExporting] = useState(false);

  const irMes = (delta: number) => {
    const d = new Date(filtros.year, filtros.month - 1 + delta, 1);
    onPeriodo(d.getMonth() + 1, d.getFullYear());
  };

  const hoy = new Date();
  const esMesActual =
    filtros.month === hoy.getMonth() + 1 && filtros.year === hoy.getFullYear();

  const monedas =
    monedasDisponibles.length > 0 ? monedasDisponibles : ['PEN', 'USD'];

  const handleExportDatos = async (formato: ExportMetricasFormato) => {
    setExportMenuOpen(false);
    setExporting(true);
    try {
      const blob = await AnalyticsService.exportMetricas(filtros, formato);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `metricas_${filtros.year}_${String(filtros.month).padStart(2, '0')}.${
        formato === 'excel' ? 'xlsx' : 'csv'
      }`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success(`Exportado en ${formato.toUpperCase()}`);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'No se pudo exportar',
      );
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="bg-card border border-border rounded-xl p-4 shadow-sm flex flex-wrap items-center gap-3 justify-between">
      {/* Periodo */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => irMes(-1)}
          className="p-2 rounded-lg hover:bg-accent text-muted-foreground transition-colors"
          aria-label="Mes anterior"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <div className="min-w-[170px] text-center">
          <p className="text-sm font-bold text-foreground capitalize">
            {nombreMes(filtros.month, filtros.year)}
          </p>
        </div>
        <button
          onClick={() => irMes(1)}
          disabled={esMesActual}
          className="p-2 rounded-lg hover:bg-accent text-muted-foreground transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          aria-label="Mes siguiente"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
        {!esMesActual && (
          <Button
            variant="ghost"
            size="xs"
            icon={CalendarDays}
            onClick={() => onPeriodo(hoy.getMonth() + 1, hoy.getFullYear())}
          >
            Este mes
          </Button>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        {/* Cuenta */}
        <select
          value={filtros.accountIds?.[0] ?? ''}
          onChange={(e) =>
            onAccountIds(e.target.value ? [e.target.value] : undefined)
          }
          className="bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
        >
          <option value="">Todas las cuentas</option>
          {activeAccounts.map((a) => (
            <option key={a.id} value={a.id}>
              {a.name} · {a.currency}
            </option>
          ))}
        </select>

        {/* Moneda */}
        <SegmentedControl
          size="sm"
          value={monedaActiva}
          onChange={(v) => onMoneda(v as Moneda)}
          options={monedas.map((m) => ({ value: m, label: m }))}
        />

        {/* Refrescar */}
        <button
          onClick={onRefresh}
          disabled={refreshing}
          className="p-2 rounded-lg border border-border hover:bg-accent text-muted-foreground transition-colors disabled:opacity-50"
          title="Refrescar datos"
          aria-label="Refrescar"
        >
          <RefreshCw
            className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`}
          />
        </button>

        {/* Exportar */}
        <div className="relative">
          <Button
            variant="outline"
            size="sm"
            icon={Download}
            loading={exporting}
            onClick={() => setExportMenuOpen((o) => !o)}
          >
            Exportar
          </Button>
          {exportMenuOpen && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setExportMenuOpen(false)}
              />
              <div className="absolute right-0 mt-2 w-52 bg-card border border-border rounded-xl shadow-lg z-20 overflow-hidden py-1">
                <button
                  onClick={() => handleExportDatos('excel')}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-accent transition-colors"
                >
                  <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
                  Datos en Excel
                </button>
                <button
                  onClick={() => handleExportDatos('csv')}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-accent transition-colors"
                >
                  <FileText className="h-4 w-4 text-blue-600" />
                  Datos en CSV
                </button>
                <div className="my-1 border-t border-border" />
                <button
                  disabled={!onExportVisual}
                  onClick={() => {
                    setExportMenuOpen(false);
                    onExportVisual?.('png');
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-accent transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ImageIcon className="h-4 w-4 text-purple-600" />
                  Imagen PNG
                  {!onExportVisual && (
                    <span className="ml-auto text-[10px] text-muted-foreground">
                      pronto
                    </span>
                  )}
                </button>
                <button
                  disabled={!onExportVisual}
                  onClick={() => {
                    setExportMenuOpen(false);
                    onExportVisual?.('pdf');
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-accent transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <FileText className="h-4 w-4 text-red-600" />
                  Reporte PDF
                  {!onExportVisual && (
                    <span className="ml-auto text-[10px] text-muted-foreground">
                      pronto
                    </span>
                  )}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
