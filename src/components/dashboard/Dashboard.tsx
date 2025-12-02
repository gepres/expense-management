/**
 * Dashboard principal con estadísticas y resumen de gastos
 */

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useGastos } from '@hooks/useGastos';
import { usePresupuestos } from '@hooks/usePresupuestos';
import { useAuth } from '@context/AuthContext';
import { useConfig } from '@context/ConfigContext';
import {
  calcularTotalGastos,
  calcularGastosPorCategoria,
  agruparGastosPorMoneda,
} from '@utils/calculations';
import { formatearMoneda, formatearFecha } from '@utils/formatters';
import { CATEGORIA_GENERAL } from '@app-types';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Wallet, TrendingDown, BarChart3, UtensilsCrossed, Car, Pill, Film, ShoppingCart, BookOpen, Home, Wrench, Package, Target, Plus, Bot, ArrowRight } from 'lucide-react';
import AIInsights from './AIInsights';
import InstallPWA from '../common/InstallPWA';
import PresupuestoEfectivoWidget from '../efectivo/PresupuestoEfectivoWidget';
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


export default function Dashboard() {
  const { usuario } = useAuth();
  const { gastos, estado, cargarGastos } = useGastos();
  const { presupuestos, estado: estadoPresupuestos, cargarPresupuestos } = usePresupuestos();
  const { getCategoryLabel, getPaymentMethodLabel } = useConfig();

  const [mesActual] = useState(() => {
    const fecha = new Date();
    return `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}`;
  });

  useEffect(() => {
    cargarGastos();
    cargarPresupuestos(mesActual);
  }, [cargarGastos, cargarPresupuestos, mesActual]);

  // Filtrar gastos del mes actual
  const gastosDelMes = gastos.filter((gasto) => {
    const fechaGasto = new Date(gasto.fecha);
    const mesGasto = `${fechaGasto.getFullYear()}-${String(fechaGasto.getMonth() + 1).padStart(2, '0')}`;
    return mesGasto === mesActual;
  });

  // Separar presupuestos generales de presupuestos por categoría
  const presupuestosGenerales = presupuestos.filter((p) => p.categoria === CATEGORIA_GENERAL);
  const presupuestosCategorias = presupuestos.filter((p) => p.categoria !== CATEGORIA_GENERAL);

  // Calcular totales por moneda
  const gastosAgrupados = agruparGastosPorMoneda(gastosDelMes);
  const totalGastosPEN = calcularTotalGastos(gastosAgrupados.PEN);
  const totalGastosUSD = calcularTotalGastos(gastosAgrupados.USD);
  const totalGastosDelMes = totalGastosPEN + totalGastosUSD; // Simplificado

  // Calcular presupuesto total
  const limiteTotalGeneralPEN = presupuestosGenerales
    .filter((p) => p.moneda === 'PEN')
    .reduce((total, p) => total + p.limite, 0);

  const limiteTotalGeneralUSD = presupuestosGenerales
    .filter((p) => p.moneda === 'USD')
    .reduce((total, p) => total + p.limite, 0);

  const limitePresupuestoGeneral = limiteTotalGeneralPEN + limiteTotalGeneralUSD;
  const totalPresupuestosCategorias = presupuestosCategorias.reduce((total, p) => total + p.limite, 0);

  const tienePresupuestoGeneral = presupuestosGenerales.length > 0;
  const presupuestoTotalReferencia = tienePresupuestoGeneral ? limitePresupuestoGeneral : totalPresupuestosCategorias;
  const presupuestoRestante = presupuestoTotalReferencia - totalGastosDelMes;

  const porcentajeGastado = presupuestoTotalReferencia > 0
    ? (totalGastosDelMes / presupuestoTotalReferencia) * 100
    : 0;

  // Datos para gráficos
  const gastosPorCategoria = calcularGastosPorCategoria(gastosDelMes);
  const datosGraficoBarras = Object.entries(gastosPorCategoria).map(
    ([categoria, total]) => ({
      categoria: getCategoryLabel(categoria),
      total,
    })
  );


  // Obtener últimos 5 gastos
  const ultimosGastos = [...gastos]
    .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
    .slice(0, 5);

  if (estado.estado === 'loading' || estadoPresupuestos.estado === 'loading') {
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
              Hola, {usuario?.nombre?.split(' ')[0]} <span className="animate-wave inline-block origin-[70%_70%]">👋</span>
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
        {/* Total Gastos */}
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
              {formatearMoneda(totalGastosDelMes)}
            </p>
            <div className="mt-3 flex items-center gap-3 text-xs font-medium text-muted-foreground">
              <span className="bg-background/50 px-2 py-1 rounded border border-border">S/ {totalGastosPEN.toFixed(2)}</span>
              <span className="bg-background/50 px-2 py-1 rounded border border-border">$ {totalGastosUSD.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Presupuesto */}
        <div className="bg-card border border-border rounded-xl p-5 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Wallet className="h-24 w-24 text-blue-500 transform -rotate-12 translate-x-4 -translate-y-4" />
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <Wallet className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <p className="text-sm font-medium text-muted-foreground">
                {tienePresupuestoGeneral ? 'Presupuesto General' : 'Presupuesto Categorías'}
              </p>
            </div>
            <p className="text-3xl font-bold text-foreground tracking-tight">
              {formatearMoneda(presupuestoTotalReferencia)}
            </p>
            <div className="mt-3 w-full bg-muted rounded-full h-1.5 overflow-hidden">
              <div 
                className={`h-full rounded-full ${
                  porcentajeGastado > 100 ? 'bg-red-500' : porcentajeGastado > 80 ? 'bg-yellow-500' : 'bg-blue-500'
                }`}
                style={{ width: `${Math.min(porcentajeGastado, 100)}%` }}
              />
            </div>
            <p className="mt-1.5 text-xs text-muted-foreground text-right">
              {porcentajeGastado.toFixed(1)}% usado
            </p>
          </div>
        </div>

        {/* Restante */}
        <div className="bg-card border border-border rounded-xl p-5 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Target className="h-24 w-24 text-green-500 transform rotate-6 translate-x-4 -translate-y-4" />
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <Target className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <p className="text-sm font-medium text-muted-foreground">Disponible</p>
            </div>
            <p className={`text-3xl font-bold tracking-tight ${
              presupuestoRestante < 0 ? 'text-red-500' : 'text-green-600 dark:text-green-400'
            }`}>
              {formatearMoneda(presupuestoRestante)}
            </p>
            <p className="mt-3 text-xs text-muted-foreground">
              {presupuestoRestante >= 0 ? '¡Vas bien este mes!' : 'Has excedido tu presupuesto'}
            </p>
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
                      tickFormatter={(value) => `$${value}`}
                    />
                    <Tooltip
                      cursor={{ fill: 'hsl(var(--muted)/0.5)' }}
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                      }}
                      formatter={(value: number) => [formatearMoneda(value), 'Total']}
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
          {/* Widget de Presupuesto en Efectivo */}
          <PresupuestoEfectivoWidget />

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
                        {formatearMoneda(gasto.monto, gasto.moneda)}
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

