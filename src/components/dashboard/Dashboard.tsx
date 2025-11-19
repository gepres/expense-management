/**
 * Dashboard principal con estadísticas y resumen de gastos
 *
 * NOTA: Actualmente los totales y estadísticas mezclan gastos en diferentes monedas (PEN y USD).
 * Los gastos individuales muestran la moneda correcta, pero los totales calculados no separan por moneda.
 * TODO: Mejorar para mostrar totales separados por moneda o implementar conversión de monedas.
 */

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useGastos } from '@hooks/useGastos';
import { usePresupuestos } from '@hooks/usePresupuestos';
import { useAuth } from '@context/AuthContext';
import {
  calcularTotalGastos,
  calcularGastosPorCategoria,
  calcularPromedioGastos,
  agruparGastosPorMoneda,
} from '@utils/calculations';
import { formatearMoneda, formatearFecha } from '@utils/formatters';
import { CATEGORIA_LABELS, CATEGORIA_GENERAL, type CategoriaGasto } from '@types';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Wallet, TrendingDown, BarChart3, UtensilsCrossed, Car, Pill, Film, ShoppingCart, BookOpen, Home, Wrench, Package, Hand, Target, Clipboard, Cloud, Plus, Bot, FileText } from 'lucide-react';

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

// Colores para las categorías
const COLORES_CATEGORIAS: Record<string, string> = {
  alimentacion: '#3b82f6',
  transporte: '#8b5cf6',
  entretenimiento: '#ec4899',
  salud: '#10b981',
  servicios: '#f59e0b',
  compras: '#ef4444',
  educacion: '#6366f1',
  vivienda: '#14b8a6',
  otros: '#6b7280',
};

export default function Dashboard() {
  const { usuario } = useAuth();
  const { gastos, estado, cargarGastos } = useGastos();
  const { presupuestos, estado: estadoPresupuestos, cargarPresupuestos } = usePresupuestos();

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
  const totalGastosDelMes = totalGastosPEN + totalGastosUSD; // Simplificado (debería convertir a una moneda)

  // Calcular presupuesto total (sumar todos los presupuestos generales)
  const limiteTotalGeneralPEN = presupuestosGenerales
    .filter((p) => p.moneda === 'PEN')
    .reduce((total, p) => total + p.limite, 0);

  const limiteTotalGeneralUSD = presupuestosGenerales
    .filter((p) => p.moneda === 'USD')
    .reduce((total, p) => total + p.limite, 0);

  const limitePresupuestoGeneral = limiteTotalGeneralPEN + limiteTotalGeneralUSD;
  const totalPresupuestosCategorias = presupuestosCategorias.reduce((total, p) => total + p.limite, 0);

  // Si hay presupuestos generales, usarlos como referencia principal
  const tienePresupuestoGeneral = presupuestosGenerales.length > 0;
  const presupuestoTotalReferencia = tienePresupuestoGeneral ? limitePresupuestoGeneral : totalPresupuestosCategorias;
  const presupuestoRestante = presupuestoTotalReferencia - totalGastosDelMes;
  const presupuestoNoAsignado = tienePresupuestoGeneral ? limitePresupuestoGeneral - totalPresupuestosCategorias : 0;

  const porcentajeGastado = presupuestoTotalReferencia > 0
    ? (totalGastosDelMes / presupuestoTotalReferencia) * 100
    : 0;
  const promedioGastos = calcularPromedioGastos(gastosDelMes);

  // Datos para gráficos
  const gastosPorCategoria = calcularGastosPorCategoria(gastosDelMes);
  const datosGraficoBarras = Object.entries(gastosPorCategoria).map(
    ([categoria, total]) => ({
      categoria: CATEGORIA_LABELS[categoria as CategoriaGasto],
      total,
    })
  );

  const datosGraficoPie = Object.entries(gastosPorCategoria)
    .filter(([, total]) => total > 0)
    .map(([categoria, total]) => ({
      name: CATEGORIA_LABELS[categoria as CategoriaGasto],
      value: total,
      color: COLORES_CATEGORIAS[categoria] || '#6b7280',
    }));

  // Obtener últimos 5 gastos
  const ultimosGastos = [...gastos]
    .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
    .slice(0, 5);

  if (estado.estado === 'loading' || estadoPresupuestos.estado === 'loading') {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
          ¡Bienvenido, {usuario?.nombre}! <Hand className="h-8 w-8" />
        </h1>
        <p className="text-muted-foreground mt-1">
          Aquí está el resumen de tus gastos de este mes
        </p>
      </div>

      {/* Tarjetas de estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Total Gastos del Mes */}
        <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-muted-foreground">
              Gastos del Mes
            </p>
            <div className="h-10 w-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
              <TrendingDown className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
          </div>
          <p className="text-2xl font-bold text-foreground">
            {formatearMoneda(totalGastosDelMes)}
          </p>
          <div className="mt-2 text-xs text-muted-foreground flex gap-3">
            <span>S/ {totalGastosPEN.toFixed(2)}</span>
            <span>$ {totalGastosUSD.toFixed(2)}</span>
          </div>
        </div>

        {/* Presupuesto General */}
        {tienePresupuestoGeneral ? (
          <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-muted-foreground">
                Presupuesto General
              </p>
              <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <Wallet className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <p className="text-2xl font-bold text-foreground">
              {formatearMoneda(limitePresupuestoGeneral)}
            </p>
            <div className="mt-2 text-xs text-muted-foreground flex gap-3">
              {limiteTotalGeneralPEN > 0 && <span>S/ {limiteTotalGeneralPEN.toFixed(2)}</span>}
              {limiteTotalGeneralUSD > 0 && <span>$ {limiteTotalGeneralUSD.toFixed(2)}</span>}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              {presupuestosGenerales.length} {presupuestosGenerales.length === 1 ? 'ingreso' : 'ingresos'}
            </p>
          </div>
        ) : (
          <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-muted-foreground">
                Presupuestos Categorías
              </p>
              <div className="h-10 w-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                <Clipboard className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
            <p className="text-2xl font-bold text-foreground">
              {formatearMoneda(totalPresupuestosCategorias)}
            </p>
            <p className="mt-2 text-xs text-muted-foreground">
              {presupuestosCategorias.length} categorías
            </p>
          </div>
        )}

        {/* Presupuesto Restante */}
        <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-muted-foreground">
              Presupuesto Restante
            </p>
            <div className="h-10 w-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <Target className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
          <p className={`text-2xl font-bold ${
            presupuestoRestante < 0 ? 'text-destructive' : 'text-green-600 dark:text-green-400'
          }`}>
            {formatearMoneda(presupuestoRestante)}
          </p>
          <p className="mt-2 text-xs text-muted-foreground">
            {tienePresupuestoGeneral ? 'General - Gastos' : 'Categorías - Gastos'}
          </p>
        </div>
      </div>

      {/* Segunda fila de tarjetas - Solo si hay presupuesto general */}
      {tienePresupuestoGeneral && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Asignado a Categorías */}
          <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-muted-foreground">
                Asignado
              </p>
              <div className="h-10 w-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                <Clipboard className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
              </div>
            </div>
            <p className="text-2xl font-bold text-foreground">
              {formatearMoneda(totalPresupuestosCategorias)}
            </p>
            <p className="mt-2 text-xs text-muted-foreground">
              {presupuestosCategorias.length} categorías
            </p>
          </div>

          {/* No Asignado */}
          <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-muted-foreground">
                No Asignado
              </p>
              <div className="h-10 w-10 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
                <Cloud className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
              </div>
            </div>
            <p className={`text-2xl font-bold ${
              presupuestoNoAsignado < 0 ? 'text-destructive' : 'text-foreground'
            }`}>
              {formatearMoneda(presupuestoNoAsignado)}
            </p>
            <p className="mt-2 text-xs text-muted-foreground">
              Disponible para asignar
            </p>
          </div>

          {/* Porcentaje Gastado */}
          <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-muted-foreground">
                % Gastado
              </p>
              <div className="h-10 w-10 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                <BarChart3 className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
            <p className={`text-2xl font-bold ${
              porcentajeGastado > 100
                ? 'text-destructive'
                : porcentajeGastado > 80
                ? 'text-yellow-500'
                : 'text-foreground'
            }`}>
              {porcentajeGastado.toFixed(1)}%
            </p>
            <p className="mt-2 text-xs text-muted-foreground">
              del presupuesto general
            </p>
          </div>

          {/* Número de gastos */}
          <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-muted-foreground">
                Total Gastos
              </p>
              <div className="h-10 w-10 rounded-full bg-gray-100 dark:bg-gray-900/30 flex items-center justify-center">
                <FileText className="h-6 w-6 text-gray-600 dark:text-gray-400" />
              </div>
            </div>
            <p className="text-2xl font-bold text-foreground">
              {gastosDelMes.length}
            </p>
            <p className="mt-2 text-xs text-muted-foreground">
              Promedio: {formatearMoneda(promedioGastos)}
            </p>
          </div>
        </div>
      )}

      {/* Acciones rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link
          to="/gastos/nuevo"
          className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg p-4 flex items-center justify-center gap-2 transition-colors shadow-sm"
        >
          <Plus className="h-5 w-5" />
          <span className="font-medium">Nuevo Gasto</span>
        </Link>
        <Link
          to="/presupuestos"
          className="bg-card hover:bg-accent border border-border text-foreground rounded-lg p-4 flex items-center justify-center gap-2 transition-colors shadow-sm"
        >
          <Target className="h-5 w-5" />
          <span className="font-medium">Ver Presupuestos</span>
        </Link>
        <Link
          to="/asistente"
          className="bg-card hover:bg-accent border border-border text-foreground rounded-lg p-4 flex items-center justify-center gap-2 transition-colors shadow-sm"
        >
          <Bot className="h-5 w-5" />
          <span className="font-medium">Asistente IA</span>
        </Link>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de Barras - Gastos por Categoría */}
        <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
          <h2 className="text-xl font-bold text-foreground mb-4">
            Gastos por Categoría
          </h2>
          {datosGraficoBarras.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={datosGraficoBarras}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="categoria"
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '6px',
                  }}
                  formatter={(value: number) => formatearMoneda(value)}
                />
                <Bar dataKey="total" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-muted-foreground">
              No hay gastos para mostrar
            </div>
          )}
        </div>

        {/* Gráfico de Pie - Distribución */}
        <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
          <h2 className="text-xl font-bold text-foreground mb-4">
            Distribución de Gastos
          </h2>
          {datosGraficoPie.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={datosGraficoPie}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) =>
                    `${name}: ${((percent ?? 0) * 100).toFixed(0)}%`
                  }
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {datosGraficoPie.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => formatearMoneda(value)} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-muted-foreground">
              No hay gastos para mostrar
            </div>
          )}
        </div>
      </div>

      {/* Últimos Gastos */}
      <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-foreground">Últimos Gastos</h2>
          <Link
            to="/gastos"
            className="text-primary hover:text-primary/80 text-sm font-medium transition-colors"
          >
            Ver todos →
          </Link>
        </div>

        {ultimosGastos.length > 0 ? (
          <div className="space-y-3">
            {ultimosGastos.map((gasto) => (
              <div
                key={gasto.id}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-accent transition-colors"
              >
                <div className="flex items-center gap-3 flex-1">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    {getCategoryIcon(gasto.categoria, "h-5 w-5 text-primary")}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground truncate">
                      {gasto.descripcion}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {CATEGORIA_LABELS[gasto.categoria]} •{' '}
                      {formatearFecha(gasto.fecha)}
                    </p>
                  </div>
                </div>
                <div className="text-right flex-shrink-0 ml-4">
                  <p className="font-bold text-foreground">
                    {formatearMoneda(gasto.monto, gasto.moneda)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {gasto.metodoPago}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p>No tienes gastos registrados aún</p>
            <Link
              to="/gastos/nuevo"
              className="inline-block mt-4 text-primary hover:text-primary/80 font-medium"
            >
              Crear tu primer gasto →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
