/**
 * Widget de Presupuesto en Efectivo para Dashboard
 * Muestra saldos en PEN y USD con diseño consistente
 */

import { useNavigate } from 'react-router-dom';
import { usePresupuestoEfectivo } from '@context/PresupuestoEfectivoContext';
import { Wallet, Plus, TrendingUp, TrendingDown, Eye, ArrowRight, Coins } from 'lucide-react';
import { MONEDA_SIMBOLOS } from '@app-types';
import LoadingSpinner from '@components/common/LoadingSpinner';

export default function PresupuestoEfectivoWidget() {
  const navigate = useNavigate();
  const { presupuestosEfectivo, estado } = usePresupuestoEfectivo();

  const saldoPEN = presupuestosEfectivo.PEN?.saldoActual || 0;
  const saldoUSD = presupuestosEfectivo.USD?.saldoActual || 0;

  if (estado.estado === 'loading') {
    return (
      <div className="bg-card border border-border rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-center h-40">
          <LoadingSpinner variant="dots" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-xl shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
      {/* Icono de fondo decorativo */}
      <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
        <Wallet className="h-24 w-24 text-emerald-500 transform -rotate-12 translate-x-4 -translate-y-4" />
      </div>

      <div className="relative z-10 p-5">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
              <Wallet className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-foreground">Efectivo</h3>
              <p className="text-xs text-muted-foreground">Dinero en el bolsillo</p>
            </div>
          </div>
          <button
            onClick={() => navigate('/movimientos/nuevo')}
            className="p-1.5 rounded hover:bg-emerald-100 dark:hover:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 transition-colors"
            title="Nuevo movimiento"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>

        {/* Saldos */}
        <div className="space-y-3 mb-4">
          {/* PEN */}
          <div
            className="bg-muted/50 rounded-lg p-3 cursor-pointer hover:bg-muted transition-colors"
            onClick={() => navigate('/efectivo/historial?moneda=PEN')}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-md bg-background flex items-center justify-center">
                  <Coins className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Soles</p>
                  <p className={`text-lg font-bold ${saldoPEN >= 0 ? 'text-foreground' : 'text-red-500'}`}>
                    {MONEDA_SIMBOLOS.PEN} {Math.abs(saldoPEN).toFixed(2)}
                  </p>
                </div>
              </div>
              <div>
                {saldoPEN >= 0 ? (
                  <TrendingUp className="w-4 h-4 text-emerald-500" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-red-500" />
                )}
              </div>
            </div>
            {saldoPEN < 0 && (
              <p className="mt-1 text-xs text-red-500 font-medium">⚠️ Saldo negativo</p>
            )}
          </div>

          {/* USD */}
          <div
            className="bg-muted/50 rounded-lg p-3 cursor-pointer hover:bg-muted transition-colors"
            onClick={() => navigate('/efectivo/historial?moneda=USD')}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-md bg-background flex items-center justify-center">
                  <Coins className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Dólares</p>
                  <p className={`text-lg font-bold ${saldoUSD >= 0 ? 'text-foreground' : 'text-red-500'}`}>
                    {MONEDA_SIMBOLOS.USD} {Math.abs(saldoUSD).toFixed(2)}
                  </p>
                </div>
              </div>
              <div>
                {saldoUSD >= 0 ? (
                  <TrendingUp className="w-4 h-4 text-emerald-500" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-red-500" />
                )}
              </div>
            </div>
            {saldoUSD < 0 && (
              <p className="mt-1 text-xs text-red-500 font-medium">⚠️ Saldo negativo</p>
            )}
          </div>
        </div>

        {/* Footer Link */}
        <button
          onClick={() => navigate('/efectivo/historial')}
          className="w-full flex items-center justify-between text-muted-foreground hover:text-foreground transition-colors group p-2 rounded-lg hover:bg-muted/50"
        >
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4" />
            <span className="text-sm font-medium">Ver historial completo</span>
          </div>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  );
}
