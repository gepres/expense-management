/**
 * Dashboard principal con estadísticas y resumen de gastos
 */

import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useGastos } from '@hooks/useGastos';
import { useAuth } from '@context/AuthContext';
import { useConfig } from '@context/ConfigContext';
import { useAccountsContext } from '@context/AccountsContext';
import {
  calcularTotalGastos,
  calcularGastosPorCategoria,
} from '@utils/calculations';
import { formatearFecha } from '@utils/formatters';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Wallet, TrendingDown, BarChart3, UtensilsCrossed, Car, Pill, Film, ShoppingCart, BookOpen, Home, Wrench, Package, Target, Plus, Bot, ArrowRight, Banknote, Star, Eye, EyeOff } from 'lucide-react';
import AIInsights from './AIInsights';
import ProBadge from '../common/ProBadge';
import MetricasPromoCard from './MetricasPromoCard';
import InstallPWA from '../common/InstallPWA';
import CuentasWidget from '../cuentas/CuentasWidget';
import PatrimonioWidget from '../cuentas/PatrimonioWidget';
import CustomLoader from '../common/CustomLoader';

// Función helper para obtener el icono de la categoría
const getCategoryIcon = (categoria: string, className?: string) => {
  const iconProps = { className: className || "h-5 w-5" };

  switch (categoria) {
    case 'alimentacion':
      return <UtensilsCrossed {...iconProps} />;
    case 'transporte':
      return <Car {...iconProps} />;
    case 'salud':
      return <Pill {...iconProps} />;
    case 'entretenimiento':
      return <Film {...iconProps} />;
    case 'compras':
      return <ShoppingCart {...iconProps} />;
    case 'educacion':
      return <BookOpen {...iconProps} />;
    case 'vivienda':
      return <Home {...iconProps} />;
    case 'servicios':
      return <Wrench {...iconProps} />;
    default:
      return <Package {...iconProps} />;
  }
};

// Símbolo de moneda corto para el monto principal de cada card.
function currencyPrefix(currency: string): string {
  if (currency === 'PEN') return 'S/';
  if (currency === 'USD') return '$';
  return currency;
}

function formatMoney(value: number, currency: string): string {
  const sign = value < 0 ? '-' : '';
  const abs = Math.abs(value).toLocaleString('es-PE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `${sign}${currencyPrefix(currency)} ${abs}`;
}


export default function Dashboard() {
  const { usuario, isPro } = useAuth();
  const { gastos, estado } = useGastos();
  const {
    activeAccounts,
    defaultAccount,
    estado: estadoCuentas,
  } = useAccountsContext();
  const { getCategoryLabel, getPaymentMethodLabel } = useConfig();

  const [mesActual] = useState(() => {
    const fecha = new Date();
    return `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}`;
  });

  // Visibilidad de montos sensibles (Gastos / Presupuesto del Mes).
  // Por defecto ocultos; se persiste la preferencia en localStorage.
  const [montosVisibles, setMontosVisibles] = useState(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem('dashboard-montos-visibles') === 'true';
  });

  const toggleMontosVisibles = () => {
    setMontosVisibles((prev) => {
      const next = !prev;
      if (typeof window !== 'undefined') {
        localStorage.setItem('dashboard-montos-visibles', String(next));
      }
      return next;
    });
  };

  const maskMoney = (value: number, currency: string): string =>
    montosVisibles ? formatMoney(value, currency) : `${currencyPrefix(currency)} ••••••`;

  // Gastos del mes actual
  const gastosDelMes = useMemo(
    () =>
      gastos.filter((g) => {
        const f = new Date(g.fecha);
        const mes = `${f.getFullYear()}-${String(f.getMonth() + 1).padStart(2, '0')}`;
        return mes === mesActual;
      }),
    [gastos, mesActual],
  );

  // ===========================================================================
  // OPCIÓN B con foco en la cuenta default:
  //   - Card "Presupuesto del Mes": SOLO la cuenta default (su saldo)
  //   - Card "Gastos del Mes": SOLO gastos de esa cuenta
  //   - Card "Efectivo en Bolsillo": SUMA de cashBalance de TODAS las cuentas
  //     activas (alerta cuando es bajo o negativo)
  // ===========================================================================

  // Cuenta foco: la default; si no existe, la primera activa.
  const cuentaFoco = defaultAccount ?? activeAccounts[0] ?? null;
  const monedaFoco = cuentaFoco?.currency ?? 'PEN';
  const presupuestoFoco = cuentaFoco
    ? cuentaFoco.bankBalance + cuentaFoco.cashBalance
    : 0;

  // Gastos del mes filtrados a la cuenta foco.
  const gastosCuentaFoco = useMemo(
    () => (cuentaFoco ? gastosDelMes.filter((g) => g.accountId === cuentaFoco.id) : []),
    [gastosDelMes, cuentaFoco],
  );
  const gastadoFoco = calcularTotalGastos(gastosCuentaFoco);
  const disponibleFoco = presupuestoFoco - gastadoFoco;
  const porcentajeGastado = presupuestoFoco > 0
    ? (gastadoFoco / presupuestoFoco) * 100
    : 0;

  // Efectivo en bolsillo = suma de cashBalance por moneda de cuentas activas.
  const efectivoPorMoneda = useMemo(() => {
    const out: Record<string, number> = {};
    for (const a of activeAccounts) {
      out[a.currency] = (out[a.currency] ?? 0) + a.cashBalance;
    }
    return out;
  }, [activeAccounts]);
  const efectivoFoco = efectivoPorMoneda[monedaFoco] ?? 0;
  const monedasEfectivoExtra = Object.keys(efectivoPorMoneda)
    .filter((m) => m !== monedaFoco && efectivoPorMoneda[m] !== 0)
    .sort();

  // Umbral para alertar "poco efectivo" en mobile.
  const efectivoBajo = efectivoFoco > 0 && efectivoFoco < 50;
  const efectivoCritico = efectivoFoco <= 0 && activeAccounts.length > 0;

  // El chart de categorías refleja la cuenta foco (consistente con los cards).
  const monedaPrincipal = monedaFoco;

  // Datos para gráficos: gastos de la cuenta foco (consistente con cards).
  const gastosPorCategoria = calcularGastosPorCategoria(gastosCuentaFoco);
  const datosGraficoBarras = Object.entries(gastosPorCategoria)
    .filter(([, total]) => total > 0)
    .map(([categoria, total]) => ({
      categoria: getCategoryLabel(categoria),
      total,
    }));

  // Obtener últimos 5 gastos
  const ultimosGastos = [...gastos]
    .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
    .slice(0, 5);

  if (estado.estado === 'loading' || estadoCuentas.estado === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <CustomLoader />
          <p className="text-muted-foreground animate-pulse mt-4">Cargando tus finanzas...</p>
        </div>
      </div>
    );
  }

  const [year, month] = mesActual.split('-').map(Number);

  return (
    <div className="space-y-6 pb-8">
      {/* Header & AI Insights */}
      <div className="flex flex-col gap-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground flex items-center gap-2">
              Hola, {usuario?.nombre?.split(' ')[0]} 
              <span className="animate-wave inline-block origin-[70%_70%]">👋</span>
              {isPro && <ProBadge size="md" className="ml-2" />}
            </h1>
            <p className="text-muted-foreground text-sm md:text-base">
              Resumen de {new Date(year, month - 1).toLocaleString('es', { month: 'long', year: 'numeric' })}
            </p>
          </div>
          <div className="flex gap-2">
             <Link
              to="/gastos/nuevo"
              className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-4 py-2 text-sm font-medium flex items-center gap-2 shadow-lg shadow-primary/20 transition-all hover:scale-105"
            >
              <Plus className="h-4 w-4" />
              Nuevo Gasto
            </Link>
          </div>
        </div>

        {/* AI Insights Component */}
        <AIInsights month={month} year={year} />

        {/* Promo Métricas PRO (solo no-pro) */}
        <MetricasPromoCard />

        {/* PWA Install Banner */}
        <InstallPWA />
      </div>

      {/* Tarjetas de estadísticas principales */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Gastos del Mes (cuenta default) */}
        <div className="bg-card border border-border rounded-xl p-5 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <TrendingDown className="h-24 w-24 text-red-500 transform rotate-12 translate-x-4 -translate-y-4" />
          </div>
          <button
            type="button"
            onClick={toggleMontosVisibles}
            aria-label={montosVisibles ? 'Ocultar montos' : 'Mostrar montos'}
            title={montosVisibles ? 'Ocultar montos' : 'Mostrar montos'}
            className="absolute top-3 right-3 z-20 p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors"
          >
            {montosVisibles ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                <TrendingDown className="h-5 w-5 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Gastos del Mes</p>
                {cuentaFoco && (
                  <p className="text-[10px] text-muted-foreground/80 truncate">
                    {cuentaFoco.name}
                  </p>
                )}
              </div>
            </div>
            <p className="text-3xl font-bold text-foreground tracking-tight">
              {maskMoney(gastadoFoco, monedaFoco)}
            </p>
          </div>
        </div>

        {/* Presupuesto del Mes = saldo de la cuenta DEFAULT */}
        <div className="bg-card border border-border rounded-xl p-5 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Wallet className="h-24 w-24 text-blue-500 transform -rotate-12 translate-x-4 -translate-y-4" />
          </div>
          <button
            type="button"
            onClick={toggleMontosVisibles}
            aria-label={montosVisibles ? 'Ocultar montos' : 'Mostrar montos'}
            title={montosVisibles ? 'Ocultar montos' : 'Mostrar montos'}
            className="absolute top-3 right-3 z-20 p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors"
          >
            {montosVisibles ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <Wallet className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-muted-foreground">Presupuesto del Mes</p>
                <p className="text-[10px] text-muted-foreground/80 truncate inline-flex items-center gap-1">
                  {cuentaFoco ? (
                    <>
                      <Star className="h-2.5 w-2.5 fill-amber-500 text-amber-500" />
                      {cuentaFoco.name} · {monedaFoco}
                    </>
                  ) : (
                    'Sin cuenta default'
                  )}
                </p>
              </div>
            </div>
            <p className="text-3xl font-bold text-foreground tracking-tight">
              {maskMoney(presupuestoFoco, monedaFoco)}
            </p>
            {presupuestoFoco > 0 && (
              <>
                <div className="mt-3 w-full bg-muted rounded-full h-1.5 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      porcentajeGastado > 100 ? 'bg-red-500' : porcentajeGastado > 80 ? 'bg-yellow-500' : 'bg-blue-500'
                    }`}
                    style={{ width: `${Math.min(porcentajeGastado, 100)}%` }}
                  />
                </div>
                <p className="mt-1.5 text-xs text-muted-foreground text-right">
                  {montosVisibles
                    ? `${porcentajeGastado.toFixed(1)}% gastado · disponible ${formatMoney(disponibleFoco, monedaFoco)}`
                    : `${porcentajeGastado.toFixed(1)}% gastado · disponible ${currencyPrefix(monedaFoco)} ••••`}
                </p>
              </>
            )}
            {!cuentaFoco && (
              <p className="mt-3 text-xs text-muted-foreground">
                Marca una cuenta como predeterminada para ver su presupuesto.
              </p>
            )}
          </div>
        </div>

        {/* Efectivo en Bolsillo (suma cashBalance de cuentas activas) */}
        <div
          className={`border rounded-xl p-5 shadow-sm relative overflow-hidden group hover:shadow-md transition-all ${
            efectivoCritico
              ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-300 dark:border-amber-700'
              : 'bg-card border-border'
          }`}
        >
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Banknote className="h-24 w-24 text-emerald-500 transform rotate-6 translate-x-4 -translate-y-4" />
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-3">
              <div className={`p-2 rounded-lg ${
                efectivoCritico
                  ? 'bg-amber-200 dark:bg-amber-900/50'
                  : 'bg-emerald-100 dark:bg-emerald-900/30'
              }`}>
                <Banknote className={`h-5 w-5 ${
                  efectivoCritico
                    ? 'text-amber-700 dark:text-amber-300'
                    : 'text-emerald-600 dark:text-emerald-400'
                }`} />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Efectivo en bolsillo</p>
                <p className="text-[10px] text-muted-foreground/80">Suma de todas tus cuentas</p>
              </div>
            </div>
            <p className={`text-3xl font-bold tracking-tight ${
              efectivoFoco < 0
                ? 'text-red-500'
                : efectivoCritico || efectivoBajo
                  ? 'text-amber-700 dark:text-amber-300'
                  : 'text-emerald-600 dark:text-emerald-400'
            }`}>
              {formatMoney(efectivoFoco, monedaFoco)}
            </p>
            <p className="mt-3 text-xs text-muted-foreground">
              {activeAccounts.length === 0
                ? 'Crea una cuenta para empezar'
                : efectivoCritico
                  ? '⚠️ No tienes efectivo. Considera retirar de tu cuenta bancaria.'
                  : efectivoBajo
                    ? '💡 Te queda poco efectivo en mano.'
                    : 'Disponible para gastos en efectivo.'}
            </p>
            {monedasEfectivoExtra.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2 text-xs font-medium">
                {monedasEfectivoExtra.map((m) => (
                  <span
                    key={m}
                    className="px-2 py-1 rounded border border-border bg-background/50 text-muted-foreground"
                  >
                    {formatMoney(efectivoPorMoneda[m], m)}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Gráficos y Listado */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Columna Izquierda: Gráficos (2/3 ancho en desktop) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-foreground">Gastos por Categoría</h2>
              {cuentaFoco && (
                <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded inline-flex items-center gap-1">
                  <Star className="h-2.5 w-2.5 fill-amber-500 text-amber-500" />
                  {cuentaFoco.name}
                </span>
              )}
            </div>
            {datosGraficoBarras.length > 0 ? (
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={datosGraficoBarras} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                    <XAxis 
                      dataKey="categoria" 
                      stroke="hsl(var(--muted-foreground))" 
                      fontSize={11} 
                      tickLine={false}
                      axisLine={false}
                      dy={10}
                    />
                    <YAxis 
                      stroke="hsl(var(--muted-foreground))" 
                      fontSize={11} 
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(value) => `${currencyPrefix(monedaPrincipal)}${value}`}
                    />
                    <Tooltip
                      cursor={{ fill: 'hsl(var(--muted)/0.5)' }}
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                      }}
                      formatter={(value: number) => [formatMoney(value, monedaPrincipal), 'Total']}
                    />
                    <Bar 
                      dataKey="total" 
                      fill="hsl(var(--primary))" 
                      radius={[6, 6, 0, 0]} 
                      barSize={32}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-[300px] flex flex-col items-center justify-center text-muted-foreground bg-muted/10 rounded-lg border border-dashed border-border">
                <BarChart3 className="h-10 w-10 mb-2 opacity-20" />
                <p>No hay datos suficientes</p>
              </div>
            )}
          </div>
        </div>

        {/* Columna Derecha: Últimos Gastos (1/3 ancho en desktop) */}
        <div className="space-y-6">
          {/* Widget de Patrimonio total */}
          <PatrimonioWidget />

          {/* Widget de Cuentas (multi-cuenta) */}
          <CuentasWidget />

          <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
            <div className="p-5 border-b border-border flex items-center justify-between bg-muted/20">
              <h2 className="text-lg font-bold text-foreground">Últimos Movimientos</h2>
              <Link to="/gastos" className="text-xs font-medium text-primary hover:underline flex items-center gap-1">
                Ver todo <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
            
            <div className="divide-y divide-border">
              {ultimosGastos.length > 0 ? (
                ultimosGastos.map((gasto) => (
                  <div key={gasto.id} className="p-4 hover:bg-accent/50 transition-colors flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      {getCategoryIcon(gasto.categoria, "h-5 w-5 text-primary")}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-foreground truncate">
                        {gasto.descripcion}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatearFecha(gasto.fecha)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-sm text-foreground">
                        {formatMoney(gasto.monto, gasto.moneda)}
                      </p>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wide">
                        {getPaymentMethodLabel(gasto.metodoPago)}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center">
                  <p className="text-sm text-muted-foreground">No hay movimientos recientes</p>
                </div>
              )}
            </div>
            
            {ultimosGastos.length > 0 && (
              <div className="p-3 bg-muted/20 text-center">
                <Link to="/gastos/nuevo" className="text-xs font-medium text-muted-foreground hover:text-primary transition-colors">
                  + Registrar nuevo gasto
                </Link>
              </div>
            )}
          </div>

          {/* Accesos rápidos adicionales */}
          <div className="grid grid-cols-2 gap-3">
            <Link
              to="/presupuestos"
              className="bg-card hover:bg-accent border border-border p-4 rounded-xl flex flex-col items-center justify-center gap-2 text-center transition-all hover:shadow-sm group"
            >
              <Target className="h-6 w-6 text-blue-500 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-medium">Presupuestos</span>
            </Link>
            <Link
              to="/asistente"
              className="bg-card hover:bg-accent border border-border p-4 rounded-xl flex flex-col items-center justify-center gap-2 text-center transition-all hover:shadow-sm group"
            >
              <Bot className="h-6 w-6 text-purple-500 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-medium">Asistente IA</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

