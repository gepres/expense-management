/**
 * Historial de Efectivo - Estado de Cuenta
 * Muestra todas las transacciones (abonos y gastos) con saldo acumulado
 */

import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { usePresupuestoEfectivo } from '@context/PresupuestoEfectivoContext';
import type { TransaccionEfectivo, Moneda } from '@app-types';
import { MONEDA_SIMBOLOS } from '@app-types';
import { formatearFechaCorta } from '@utils/formatters';
import {
  ArrowLeft,
  Plus,
  Minus,
  Calendar,
  Wallet,
  TrendingUp,
  TrendingDown,
  Receipt,
  Coins,
  BarChart3,
} from 'lucide-react';
import Button from '@components/common/Button';
import LoadingSpinner from '@components/common/LoadingSpinner';

export default function HistorialEfectivo() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { presupuestosEfectivo, obtenerHistorial, estado } = usePresupuestoEfectivo();

  const monedaParam = (searchParams.get('moneda') as Moneda) || 'PEN';
  const [monedaSeleccionada, setMonedaSeleccionada] = useState<Moneda>(monedaParam);
  const [transacciones, setTransacciones] = useState<TransaccionEfectivo[]>([]);
  const [cargandoHistorial, setCargandoHistorial] = useState(true);

  const saldoActual = presupuestosEfectivo[monedaSeleccionada]?.saldoActual || 0;

  /**
   * Cargar historial cuando cambia la moneda
   */
  useEffect(() => {
    const cargarHistorial = async () => {
      setCargandoHistorial(true);
      try {
        const historial = await obtenerHistorial(monedaSeleccionada);
        setTransacciones(historial);
      } catch (error) {
        console.error('Error al cargar historial:', error);
      } finally {
        setCargandoHistorial(false);
      }
    };

    cargarHistorial();
  }, [monedaSeleccionada, obtenerHistorial]);

  /**
   * Calcular estadísticas del historial
   */
  const estadisticas = useMemo(() => {
    const totalAbonos = transacciones
      .filter(t => t.tipo === 'abono')
      .reduce((sum, t) => sum + t.monto, 0);

    const totalGastos = transacciones
      .filter(t => t.tipo === 'gasto')
      .reduce((sum, t) => sum + t.monto, 0);

    const cantidadAbonos = transacciones.filter(t => t.tipo === 'abono').length;
    const cantidadGastos = transacciones.filter(t => t.tipo === 'gasto').length;

    return {
      totalAbonos,
      totalGastos,
      cantidadAbonos,
      cantidadGastos,
      diferencia: totalAbonos - totalGastos,
    };
  }, [transacciones]);

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-4 mb-4">
          <Button
            variant="ghost"
            size="sm"
            icon={ArrowLeft}
            onClick={() => navigate(-1)}
            className="hidden md:flex"
          >
            Volver
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-foreground">
              Historial de Efectivo
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Estado de cuenta completo de tu efectivo
            </p>
          </div>
        </div>

        {/* Filtros */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          {/* Selector de Moneda estilo iOS */}
          <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
            <div className="flex items-center gap-3 p-3">
              <div className="hidden sm:flex items-center gap-2">
                <Coins className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium text-muted-foreground">Moneda:</span>
              </div>
              {/* Segmented Control iOS style */}
              <div className="flex bg-muted rounded-lg p-1 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => {
                    setMonedaSeleccionada('PEN');
                    setSearchParams({ moneda: 'PEN' });
                  }}
                  className={`flex-1 sm:flex-initial px-4 sm:px-5 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                    monedaSeleccionada === 'PEN'
                      ? 'bg-card text-foreground shadow-sm scale-[0.98]'
                      : 'text-muted-foreground hover:text-foreground active:scale-95'
                  }`}
                >
                  <span className="flex items-center justify-center gap-1.5">
                    <span className="font-semibold">{MONEDA_SIMBOLOS.PEN}</span>
                    <span className="hidden sm:inline">Soles</span>
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMonedaSeleccionada('USD');
                    setSearchParams({ moneda: 'USD' });
                  }}
                  className={`flex-1 sm:flex-initial px-4 sm:px-5 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                    monedaSeleccionada === 'USD'
                      ? 'bg-card text-foreground shadow-sm scale-[0.98]'
                      : 'text-muted-foreground hover:text-foreground active:scale-95'
                  }`}
                >
                  <span className="flex items-center justify-center gap-1.5">
                    <span className="font-semibold">{MONEDA_SIMBOLOS.USD}</span>
                    <span className="hidden sm:inline">Dólares</span>
                  </span>
                </button>
              </div>
            </div>
          </div>

          <div className="sm:ml-auto">
            <Button
              variant="primary"
              icon={Plus}
              onClick={() => navigate('/movimientos/nuevo')}
              fullWidth
              className="sm:w-auto"
            >
              Nuevo Abono
            </Button>
          </div>
        </div>
      </div>

      {/* Saldo Actual */}
      <div className="mb-6 bg-card border border-border rounded-xl shadow-sm relative overflow-hidden">
        {/* Icono decorativo de fondo */}
        <div className="absolute top-0 right-0 p-6 opacity-5">
          <Wallet className="h-32 sm:h-40 w-32 sm:w-40 text-emerald-500" />
        </div>

        <div className="relative z-10 p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="p-2.5 sm:p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl shrink-0">
                <Wallet className="w-6 h-6 sm:w-7 sm:h-7 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground font-medium mb-1">
                  Saldo Actual en {monedaSeleccionada}
                </p>
                <p className={`text-3xl sm:text-4xl font-bold ${
                  saldoActual >= 0
                    ? 'text-foreground'
                    : 'text-red-600 dark:text-red-400'
                }`}>
                  {MONEDA_SIMBOLOS[monedaSeleccionada]} {Math.abs(saldoActual).toFixed(2)}
                </p>
              </div>
            </div>
            <div>
              {saldoActual >= 0 ? (
                <div className="p-2 sm:p-2.5 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
                  <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600 dark:text-emerald-400" />
                </div>
              ) : (
                <div className="p-2 sm:p-2.5 bg-red-100 dark:bg-red-900/30 rounded-lg">
                  <TrendingDown className="w-5 h-5 sm:w-6 sm:h-6 text-red-600 dark:text-red-400" />
                </div>
              )}
            </div>
          </div>

          {saldoActual < 0 && (
            <div className="mt-4 p-3 bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-xs sm:text-sm text-red-700 dark:text-red-300 font-medium">
                ⚠️ Tienes un saldo negativo en efectivo
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Estadísticas */}
      {!cargandoHistorial && transacciones.length > 0 && (
        <div className="mb-6 grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          {/* Total Abonos */}
          <div className="bg-card border border-border rounded-xl p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <Plus className="w-4 h-4 text-green-600 dark:text-green-400" />
              </div>
              <p className="text-xs text-muted-foreground font-medium">Total Abonos</p>
            </div>
            <p className="text-xl sm:text-2xl font-bold text-green-600 dark:text-green-400">
              {MONEDA_SIMBOLOS[monedaSeleccionada]} {estadisticas.totalAbonos.toFixed(2)}
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              {estadisticas.cantidadAbonos} transacción{estadisticas.cantidadAbonos !== 1 ? 'es' : ''}
            </p>
          </div>

          {/* Total Gastos */}
          <div className="bg-card border border-border rounded-xl p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                <Minus className="w-4 h-4 text-red-600 dark:text-red-400" />
              </div>
              <p className="text-xs text-muted-foreground font-medium">Total Gastos</p>
            </div>
            <p className="text-xl sm:text-2xl font-bold text-red-600 dark:text-red-400">
              {MONEDA_SIMBOLOS[monedaSeleccionada]} {estadisticas.totalGastos.toFixed(2)}
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              {estadisticas.cantidadGastos} transacción{estadisticas.cantidadGastos !== 1 ? 'es' : ''}
            </p>
          </div>

          {/* Diferencia */}
          <div className="bg-card border border-border rounded-xl p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <BarChart3 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </div>
              <p className="text-xs text-muted-foreground font-medium">Diferencia</p>
            </div>
            <p className={`text-xl sm:text-2xl font-bold ${
              estadisticas.diferencia >= 0
                ? 'text-green-600 dark:text-green-400'
                : 'text-red-600 dark:text-red-400'
            }`}>
              {estadisticas.diferencia >= 0 ? '+' : '-'}
              {MONEDA_SIMBOLOS[monedaSeleccionada]} {Math.abs(estadisticas.diferencia).toFixed(2)}
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              Abonos - Gastos
            </p>
          </div>
        </div>
      )}

      {/* Tabla de Transacciones */}
      {cargandoHistorial || estado.estado === 'loading' ? (
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner variant="dots" />
        </div>
      ) : transacciones.length === 0 ? (
        <div className="bg-card border border-border rounded-xl shadow-sm p-12 text-center">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
            <Receipt className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">
            No hay transacciones
          </h3>
          <p className="text-muted-foreground mb-6">
            Aún no has registrado ningún movimiento en efectivo
          </p>
          <Button
            variant="primary"
            icon={Plus}
            onClick={() => navigate('/movimientos/nuevo')}
          >
            Registrar primer movimiento
          </Button>
        </div>
      ) : (
        <>
          {/* Vista Desktop - Tabla */}
          <div className="hidden md:block bg-card border border-border rounded-xl shadow-sm overflow-hidden">
            {/* Header de tabla */}
            <div className="bg-muted/50 px-6 py-3 border-b border-border">
              <div className="grid grid-cols-12 gap-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                <div className="col-span-2">Fecha</div>
                <div className="col-span-1">Tipo</div>
                <div className="col-span-4">Concepto</div>
                <div className="col-span-2 text-right">Monto</div>
                <div className="col-span-3 text-right">Saldo</div>
              </div>
            </div>

            {/* Filas de transacciones */}
            <div className="divide-y divide-border">
              {transacciones.map((transaccion, index) => (
                <div
                  key={transaccion.id}
                  className="px-6 py-4 hover:bg-muted/50 transition-colors animate-fade-in"
                  style={{ animationDelay: `${index * 30}ms` }}
                >
                  <div className="grid grid-cols-12 gap-4 items-center">
                    {/* Fecha */}
                    <div className="col-span-2 flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm text-foreground font-medium">
                        {formatearFechaCorta(transaccion.fecha)}
                      </span>
                    </div>

                    {/* Tipo */}
                    <div className="col-span-1">
                      {transaccion.tipo === 'abono' ? (
                        <div className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-green-100 dark:bg-green-900/30">
                          <Plus className="w-3 h-3 text-green-600 dark:text-green-400" />
                          <span className="text-xs font-medium text-green-700 dark:text-green-400">
                            Abono
                          </span>
                        </div>
                      ) : (
                        <div className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-red-100 dark:bg-red-900/30">
                          <Minus className="w-3 h-3 text-red-600 dark:text-red-400" />
                          <span className="text-xs font-medium text-red-700 dark:text-red-400">
                            Gasto
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Concepto */}
                    <div className="col-span-4">
                      <p className="text-sm font-medium text-foreground">
                        {transaccion.concepto}
                      </p>
                      {transaccion.categoria && (
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {transaccion.categoria}
                        </p>
                      )}
                    </div>

                    {/* Monto */}
                    <div className="col-span-2 text-right">
                      <span
                        className={`text-sm font-semibold ${
                          transaccion.tipo === 'abono'
                            ? 'text-green-600 dark:text-green-400'
                            : 'text-red-600 dark:text-red-400'
                        }`}
                      >
                        {transaccion.tipo === 'abono' ? '+' : '-'}
                        {MONEDA_SIMBOLOS[transaccion.moneda]} {transaccion.monto.toFixed(2)}
                      </span>
                    </div>

                    {/* Saldo */}
                    <div className="col-span-3 text-right">
                      <span
                        className={`text-sm font-bold ${
                          transaccion.saldo >= 0
                            ? 'text-foreground'
                            : 'text-red-600 dark:text-red-400'
                        }`}
                      >
                        {MONEDA_SIMBOLOS[transaccion.moneda]} {transaccion.saldo.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Vista Móvil - Cards */}
          <div className="md:hidden space-y-3">
            {transacciones.map((transaccion, index) => (
              <div
                key={transaccion.id}
                className="bg-card border border-border rounded-xl shadow-sm p-4 animate-fade-in"
                style={{ animationDelay: `${index * 30}ms` }}
              >
                {/* Header del Card */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-foreground font-medium">
                      {formatearFechaCorta(transaccion.fecha)}
                    </span>
                  </div>
                  {transaccion.tipo === 'abono' ? (
                    <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-green-100 dark:bg-green-900/30">
                      <Plus className="w-3.5 h-3.5 text-green-600 dark:text-green-400" />
                      <span className="text-xs font-medium text-green-700 dark:text-green-400">
                        Abono
                      </span>
                    </div>
                  ) : (
                    <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-red-100 dark:bg-red-900/30">
                      <Minus className="w-3.5 h-3.5 text-red-600 dark:text-red-400" />
                      <span className="text-xs font-medium text-red-700 dark:text-red-400">
                        Gasto
                      </span>
                    </div>
                  )}
                </div>

                {/* Concepto */}
                <div className="mb-3">
                  <p className="text-base font-semibold text-foreground mb-1">
                    {transaccion.concepto}
                  </p>
                  {transaccion.categoria && (
                    <p className="text-xs text-muted-foreground">
                      Categoría: {transaccion.categoria}
                    </p>
                  )}
                </div>

                {/* Monto y Saldo */}
                <div className="grid grid-cols-2 gap-3 pt-3 border-t border-border">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Monto</p>
                    <p
                      className={`text-lg font-bold ${
                        transaccion.tipo === 'abono'
                          ? 'text-green-600 dark:text-green-400'
                          : 'text-red-600 dark:text-red-400'
                      }`}
                    >
                      {transaccion.tipo === 'abono' ? '+' : '-'}
                      {MONEDA_SIMBOLOS[transaccion.moneda]} {transaccion.monto.toFixed(2)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground mb-1">Saldo</p>
                    <p
                      className={`text-lg font-bold ${
                        transaccion.saldo >= 0
                          ? 'text-foreground'
                          : 'text-red-600 dark:text-red-400'
                      }`}
                    >
                      {MONEDA_SIMBOLOS[transaccion.moneda]} {transaccion.saldo.toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
