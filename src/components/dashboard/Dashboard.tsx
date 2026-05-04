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
  agruparGastosPorMoneda,
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
import { Wallet, TrendingDown, BarChart3, UtensilsCrossed, Car, Pill, Film, ShoppingCart, BookOpen, Home, Wrench, Package, Target, Plus, Bot, ArrowRight, Crown } from 'lucide-react';
import AIInsights from './AIInsights';
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
  const { patrimonioPorMoneda, activeAccounts, estado: estadoCuentas } = useAccountsContext();
  const { getCategoryLabel, getPaymentMethodLabel } = useConfig();

  const [mesActual] = useState(() => {
    const fecha = new Date();
    return `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}`;
  });

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
  // OPCIÓN B: cuenta = presupuesto.
  //   Presupuesto disponible(moneda) = patrimonio(moneda)
  //   Gastado(moneda)                = Σ gastos del mes en esa moneda
  //   Disponible(moneda)             = patrimonio(moneda) − gastado(moneda)
  //
  // No mezclar monedas. Cada card muestra la moneda principal en grande +
  // las demás como pills.
  // ===========================================================================

  const gastosPorMoneda = useMemo(() => {
    const agr = agruparGastosPorMoneda(gastosDelMes);
    const out: Record<string, number> = {};
    for (const [moneda, lista] of Object.entries(agr)) {
      out[moneda] = calcularTotalGastos(lista);
    }
    return out;
  }, [gastosDelMes]);

  // Lista unificada de monedas (las que tienen patrimonio O gastos en el mes)
  const monedasActivas = useMemo(() => {
    const set = new Set<string>([
      ...Object.keys(patrimonioPorMoneda),
      ...Object.keys(gastosPorMoneda).filter((m) => gastosPorMoneda[m] > 0),
    ]);
    return Array.from(set).sort((a) => (a === 'PEN' ? -1 : 1));
  }, [patrimonioPorMoneda, gastosPorMoneda]);

  const monedaPrincipal = monedasActivas[0] ?? 'PEN';

  const presupuestoPrincipal = patrimonioPorMoneda[monedaPrincipal] ?? 0;
  const gastosPrincipal = gastosPorMoneda[monedaPrincipal] ?? 0;
  const disponiblePrincipal = presupuestoPrincipal - gastosPrincipal;

  const porcentajeGastado = presupuestoPrincipal > 0
    ? (gastosPrincipal / presupuestoPrincipal) * 100
    : 0;

  // Para mostrar pills de monedas secundarias en cada card.
  const monedasSecundarias = monedasActivas.slice(1);

  // Datos para gráficos (en moneda principal — el chart tampoco debe mezclar)
  const gastosDelMesPrincipal = useMemo(
    () => gastosDelMes.filter((g) => g.moneda === monedaPrincipal),
    [gastosDelMes, monedaPrincipal],
  );
  const gastosPorCategoria = calcularGastosPorCategoria(gastosDelMesPrincipal);
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
  const sinCuentas = activeAccounts.length === 0;

  return (
    <div className="space-y-6 pb-8">
      {/* Header & AI Insights */}
      <div className="flex flex-col gap-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground flex items-center gap-2">
              Hola, {usuario?.nombre?.split(' ')[0]} 
              <span className="animate-wave inline-block origin-[70%_70%]">👋</span>
              {
                isPro && (
                  <div className="ml-2 flex  items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 text-success text-xs font-medium">
                    <Crown className="h-5 w-5 text-amber-500 fill-amber-500" />
                  </div>
                )
              }
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
        
        {/* PWA Install Banner */}
        <InstallPWA />
      </div>

      {/* Tarjetas de estadísticas principales */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Gastos del Mes */}
        <div className="bg-card border border-border rounded-xl p-5 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <TrendingDown className="h-24 w-24 text-red-500 transform rotate-12 translate-x-4 -translate-y-4" />
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                <TrendingDown className="h-5 w-5 text-red-600 dark:text-red-400" />
              </div>
              <p className="text-sm font-medium text-muted-foreground">Gastos del Mes</p>
            </div>
            <p className="text-3xl font-bold text-foreground tracking-tight">
              {formatMoney(gastosPrincipal, monedaPrincipal)}
            </p>
            {monedasSecundarias.length > 0 && (
              <div className="mt-3 flex flex-wrap items-center gap-2 text-xs font-medium text-muted-foreground">
                {monedasSecundarias.map((m) => (
                  <span key={m} className="bg-background/50 px-2 py-1 rounded border border-border">
                    {formatMoney(gastosPorMoneda[m] ?? 0, m)}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Presupuesto = Saldo de cuentas (Opción B: cuenta = presupuesto) */}
        <div className="bg-card border border-border rounded-xl p-5 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Wallet className="h-24 w-24 text-blue-500 transform -rotate-12 translate-x-4 -translate-y-4" />
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <Wallet className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Presupuesto del Mes</p>
                <p className="text-[10px] text-muted-foreground/80">Saldo de tus cuentas activas</p>
              </div>
            </div>
            <p className="text-3xl font-bold text-foreground tracking-tight">
              {formatMoney(presupuestoPrincipal, monedaPrincipal)}
            </p>
            {presupuestoPrincipal > 0 && (
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
                  {porcentajeGastado.toFixed(1)}% gastado
                </p>
              </>
            )}
            {monedasSecundarias.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2 text-xs font-medium text-muted-foreground">
                {monedasSecundarias.map((m) => (
                  <span key={m} className="bg-background/50 px-2 py-1 rounded border border-border">
                    {formatMoney(patrimonioPorMoneda[m] ?? 0, m)}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Disponible = Presupuesto − Gastos */}
        <div className="bg-card border border-border rounded-xl p-5 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Target className="h-24 w-24 text-green-500 transform rotate-6 translate-x-4 -translate-y-4" />
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <Target className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Disponible</p>
                <p className="text-[10px] text-muted-foreground/80">Saldo − gastos del mes</p>
              </div>
            </div>
            <p className={`text-3xl font-bold tracking-tight ${
              disponiblePrincipal < 0 ? 'text-red-500' : 'text-green-600 dark:text-green-400'
            }`}>
              {formatMoney(disponiblePrincipal, monedaPrincipal)}
            </p>
            <p className="mt-3 text-xs text-muted-foreground">
              {sinCuentas
                ? 'Crea una cuenta para empezar'
                : disponiblePrincipal >= 0
                  ? '¡Vas bien este mes!'
                  : 'Has excedido tu saldo disponible'}
            </p>
            {monedasSecundarias.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2 text-xs font-medium">
                {monedasSecundarias.map((m) => {
                  const disp = (patrimonioPorMoneda[m] ?? 0) - (gastosPorMoneda[m] ?? 0);
                  return (
                    <span
                      key={m}
                      className={`px-2 py-1 rounded border ${
                        disp < 0
                          ? 'border-red-300 dark:border-red-700 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/10'
                          : 'border-border bg-background/50 text-muted-foreground'
                      }`}
                    >
                      {formatMoney(disp, m)}
                    </span>
                  );
                })}
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
              {monedasActivas.length > 1 && (
                <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                  {monedaPrincipal}
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

