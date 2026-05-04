/**
 * Vista de lista de gastos con filtros y acciones
 */

import { useEffect, useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useGastos } from '@hooks/useGastos';
import { useConfig } from '@context/ConfigContext';
import { formatearMoneda, formatearFecha } from '@utils/formatters';
import { calcularTotalGastos, agruparGastosPorMoneda } from '@utils/calculations';
import { toast } from 'react-hot-toast';
import { Plus, FileText, UtensilsCrossed, Car, Pill, Film, ShoppingCart, BookOpen, Home, Wrench, Package, Download, Search, Filter, Calendar, CreditCard, TrendingUp, Lightbulb, ChevronRight, Trash2, AlertTriangle, FileSpreadsheet, FileJson, CalendarSearch } from 'lucide-react';
import CustomLoader from '@components/common/CustomLoader';
import Modal, { ModalFooterActions, ModalButton } from '@components/common/Modal';
import { ExpensesService } from '../../services/expenses';
import { ContainerLoadingButton } from '../common/Button';

export default function ListaGastos() {
  const navigate = useNavigate();
  const { gastos, estado, cargarGastos, eliminar } = useGastos();
  const {
    categories,
    paymentMethods,
    getCategoryLabel,
    getPaymentMethodLabel,
    getSubcategories,
    getSubcategoryLabel
  } = useConfig();

  // Estados de filtros
  const [busqueda, setBusqueda] = useState('');
  const [categoriaFiltro, setCategoriaFiltro] = useState<string>('todas');
  const [subcategoriaFiltro, setSubcategoriaFiltro] = useState<string>('todas');
  const [metodoPagoFiltro, setMetodoPagoFiltro] = useState<string>('todos');
  const [mesActual, setMesActual] = useState(() => {
    const fecha = new Date();
    return `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}`;
  });
  const [showFilters, setShowFilters] = useState(false);

  // Estado para confirmación de eliminación
  const [gastoAEliminar, setGastoAEliminar] = useState<string | null>(null);

  // Estado para modal de exportación
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportMonth, setExportMonth] = useState(new Date().getMonth() + 1);
  const [exportYear, setExportYear] = useState(new Date().getFullYear());
  const [exportFormat, setExportFormat] = useState<'json' | 'excel'>('excel');
  const [isExporting, setIsExporting] = useState(false);

  const [loadingDelete, setLoadingDelete] = useState(false);

  useEffect(() => {
    cargarGastos();
  }, [cargarGastos]);

  // Filtrar gastos
  const gastosFiltrados = useMemo(() => {
    let resultado = [...gastos];

    // Filtrar por mes
    resultado = resultado.filter((gasto) => {
      const fechaGasto = new Date(gasto.fecha);
      const mesGasto = `${fechaGasto.getFullYear()}-${String(fechaGasto.getMonth() + 1).padStart(2, '0')}`;
      return mesGasto === mesActual;
    });

    // Filtrar por categoría
    if (categoriaFiltro !== 'todas') {
      resultado = resultado.filter((gasto) => gasto.categoria === categoriaFiltro);
    }

    // Filtrar por subcategoría
    if (subcategoriaFiltro !== 'todas') {
      resultado = resultado.filter((gasto) => gasto.subcategoria === subcategoriaFiltro);
    }

    // Filtrar por método de pago
    if (metodoPagoFiltro !== 'todos') {
      resultado = resultado.filter((gasto) => gasto.metodoPago === metodoPagoFiltro);
    }

    // Filtrar por búsqueda
    if (busqueda.trim()) {
      const busquedaLower = busqueda.toLowerCase();
      resultado = resultado.filter(
        (gasto) =>
          gasto.descripcion.toLowerCase().includes(busquedaLower) ||
          getCategoryLabel(gasto.categoria).toLowerCase().includes(busquedaLower) ||
          gasto.tags?.some((tag) => tag.toLowerCase().includes(busquedaLower))
      );
    }

    return resultado;
  }, [gastos, categoriaFiltro, subcategoriaFiltro, metodoPagoFiltro, busqueda, mesActual, getCategoryLabel]);

  // Calcular totales por moneda
  const totalesPorMoneda = useMemo(() => {
    const agrupados = agruparGastosPorMoneda(gastosFiltrados);
    return {
      PEN: calcularTotalGastos(agrupados.PEN),
      USD: calcularTotalGastos(agrupados.USD),
    };
  }, [gastosFiltrados]);

  // Si el mes seleccionado no tiene gastos pero existen en otros meses,
  // sugerir saltar al mes más reciente que sí tenga.
  const sugerenciaMesConGastos = useMemo(() => {
    if (gastosFiltrados.length > 0 || gastos.length === 0) return null;
    const mesesConGastos = new Set<string>();
    for (const g of gastos) {
      const f = new Date(g.fecha);
      mesesConGastos.add(
        `${f.getFullYear()}-${String(f.getMonth() + 1).padStart(2, '0')}`,
      );
    }
    const masReciente = Array.from(mesesConGastos).sort().reverse()[0];
    if (!masReciente || masReciente === mesActual) return null;
    return masReciente;
  }, [gastos, gastosFiltrados, mesActual]);

  const formatearMesLabel = (mesKey: string): string => {
    const [y, m] = mesKey.split('-').map(Number);
    return new Date(y, m - 1).toLocaleString('es', { month: 'long', year: 'numeric' });
  };

  // Manejar eliminación
  const handleEliminar = async (id: string) => {
    try {
      setLoadingDelete(true);
      await eliminar(id);
      toast.success('Gasto eliminado exitosamente');
      setGastoAEliminar(null);
    } catch (error) {
      console.error('Error al eliminar gasto:', error);
      toast.error('Error al eliminar el gasto');
    } finally {
      setLoadingDelete(false);
    }
  };

  // Manejar cambio de categoría (resetear subcategoría)
  const handleCategoriaChange = (nuevaCategoria: string) => {
    setCategoriaFiltro(nuevaCategoria);
    setSubcategoriaFiltro('todas'); // Resetear subcategoría cuando cambia la categoría
  };

  // Obtener subcategorías disponibles según la categoría seleccionada
  const subcategoriasDisponibles = useMemo(() => {
    if (categoriaFiltro === 'todas') {
      // Si no hay categoría seleccionada, mostrar todas las subcategorías únicas de los gastos filtrados
      const subcategoriasSet = new Set<string>();
      gastos.forEach((gasto) => {
        if (gasto.subcategoria) {
          subcategoriasSet.add(gasto.subcategoria);
        }
      });
      return Array.from(subcategoriasSet).sort();
    }
    // Si hay categoría seleccionada, mostrar sus subcategorías
    return getSubcategories(categoriaFiltro).map(sub => sub.nombre);
  }, [categoriaFiltro, gastos, getSubcategories]);

  // Obtener icono de categoría
  const obtenerIconoCategoria = (categoria: string, className: string = "h-5 w-5") => {
    const iconProps = { className };

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

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const blob = await ExpensesService.exportExpenses(exportMonth, exportYear, exportFormat);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `reporte_gastos_${exportYear}_${String(exportMonth).padStart(2, '0')}.${exportFormat === 'excel' ? 'xlsx' : 'json'}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('Reporte descargado exitosamente');
      setShowExportModal(false);
    } catch {
      toast.error('Error al descargar el reporte');
    } finally {
      setIsExporting(false);
    }
  };

  if (estado.estado === 'loading') {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-center">
          <CustomLoader />
          <p className="text-muted-foreground mt-4">Cargando gastos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20 md:pb-0">
        {/* Header */}
        <div className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground tracking-tight">Mis Gastos</h1>
              <p className="text-muted-foreground mt-1">
                {gastosFiltrados.length} {gastosFiltrados.length === 1 ? 'gasto' : 'gastos'}{' '}
                {categoriaFiltro !== 'todas' && `en ${getCategoryLabel(categoriaFiltro)}`}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowExportModal(true)}
                className="inline-flex items-center justify-center gap-2 bg-secondary/80 hover:bg-secondary text-secondary-foreground font-semibold py-2 px-4 rounded-xl transition-all backdrop-blur-sm"
              >
                <Download className="h-5 w-5" />
                <span className="hidden sm:inline">Descargar</span>
              </button>
              <Link
                to="/gastos/nuevo"
                className="inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-2 px-4 rounded-xl transition-all shadow-sm hover:shadow-md hover:scale-[1.02] active:scale-[0.98]"
              >
                <Plus className="h-5 w-5" />
                <span className="hidden sm:inline">Nuevo Gasto</span>
                <span className="sm:hidden">Nuevo</span>
              </Link>
            </div>
          </div>

          {/* AI Financial Tip Widget (Mobile & Desktop) */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-100 dark:border-blue-800 rounded-2xl p-4 relative overflow-hidden group cursor-pointer transition-all hover:shadow-md" onClick={() => navigate('/asistente')}>
            <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
              <TrendingUp className="h-24 w-24 text-blue-600" />
            </div>
            <div className="relative z-10 flex items-start gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-800 rounded-xl text-blue-600 dark:text-blue-300">
                <Lightbulb className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-blue-900 dark:text-blue-100 text-sm mb-1">
                  Consejo Financiero IA
                </h3>
                <p className="text-sm text-blue-700 dark:text-blue-300 leading-relaxed">
                  ¿Quieres aprender a invertir tus ahorros? Pregúntame sobre opciones de bajo riesgo y cómo generar ingresos pasivos.
                </p>
                <div className="mt-2 flex items-center text-xs font-medium text-blue-600 dark:text-blue-400 group-hover:translate-x-1 transition-transform">
                  Ir al Asistente <ChevronRight className="h-3 w-3 ml-1" />
                </div>
              </div>
            </div>
          </div>

        {/* Resumen por moneda */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-card border border-border rounded-lg p-4 flex flex-col items-center sm:items-start">
            <p className="text-xs sm:text-sm text-muted-foreground mb-1">Total Soles</p>
            <p className="text-xl sm:text-2xl font-bold text-foreground">
              {formatearMoneda(totalesPorMoneda.PEN, 'PEN')}
            </p>
          </div>
          <div className="bg-card border border-border rounded-lg p-4 flex flex-col items-center sm:items-start">
            <p className="text-xs sm:text-sm text-muted-foreground mb-1">Total Dólares</p>
            <p className="text-xl sm:text-2xl font-bold text-foreground">
              {formatearMoneda(totalesPorMoneda.USD, 'USD')}
            </p>
          </div>
        </div>

        {/* Barra de búsqueda y botón de filtros móvil (iOS Style) */}
        <div className="flex gap-3">
          <div className="relative flex-1 group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <input
              type="text"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar gastos..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-input bg-background/50 backdrop-blur-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`p-2.5 rounded-xl border transition-all shadow-sm ${
              showFilters 
                ? 'bg-primary text-primary-foreground border-primary shadow-md' 
                : 'bg-background/50 backdrop-blur-sm text-foreground border-input hover:bg-accent hover:border-accent'
            }`}
          >
            <Filter className="h-5 w-5" />
          </button>
        </div>

        {/* Panel de Filtros */}
        {showFilters && (
          <div className="bg-card border border-border rounded-lg p-4 animate-in slide-in-from-top-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Mes</label>
                <input
                  type="month"
                  value={mesActual}
                  onChange={(e) => setMesActual(e.target.value)}
                  className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Categoría</label>
                <select
                  value={categoriaFiltro}
                  onChange={(e) => handleCategoriaChange(e.target.value)}
                  className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm"
                >
                  <option value="todas">Todas</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.nombre}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Subcategoría</label>
                <select
                  value={subcategoriaFiltro}
                  onChange={(e) => setSubcategoriaFiltro(e.target.value)}
                  className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm"
                  disabled={subcategoriasDisponibles.length === 0}
                >
                  <option value="todas">Todas</option>
                  {subcategoriasDisponibles.map((sub) => (
                    <option key={sub} value={sub}>{sub}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Método de Pago</label>
                <select
                  value={metodoPagoFiltro}
                  onChange={(e) => setMetodoPagoFiltro(e.target.value)}
                  className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm"
                >
                  <option value="todos">Todos</option>
                  {paymentMethods.map((metodo) => (
                    <option key={metodo.id} value={metodo.id}>{metodo.nombre}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Sugerencia: hay gastos pero en otro mes */}
      {sugerenciaMesConGastos && (
        <div className="rounded-xl border border-blue-300 dark:border-blue-700 bg-blue-50 dark:bg-blue-900/20 p-4 flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex items-start gap-3 flex-1">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/40 rounded-lg shrink-0">
              <CalendarSearch className="h-5 w-5 text-blue-700 dark:text-blue-300" />
            </div>
            <div>
              <p className="text-sm font-semibold text-blue-900 dark:text-blue-100">
                No hay gastos en {formatearMesLabel(mesActual)}
              </p>
              <p className="text-xs text-blue-800 dark:text-blue-200 mt-0.5">
                Tienes gastos registrados en {formatearMesLabel(sugerenciaMesConGastos)}.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setMesActual(sugerenciaMesConGastos)}
            className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors"
          >
            Ver {formatearMesLabel(sugerenciaMesConGastos)}
            <ChevronRight className="h-3 w-3" />
          </button>
        </div>
      )}

      {/* Lista de gastos (Vista Desktop) */}
      <div className="hidden md:block bg-card border border-border rounded-lg overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Fecha</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Categoría</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Subcategoría</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Descripción</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Método</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">Monto</th>
                <th className="px-4 py-3 text-center text-sm font-medium text-muted-foreground">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {gastosFiltrados.length > 0 ? (
                gastosFiltrados.map((gasto) => (
                  <tr key={gasto.id} className="hover:bg-accent/50 transition-colors">
                    <td className="px-4 py-3 text-sm whitespace-nowrap">
                      {formatearFecha(gasto.fecha)}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <div className="flex items-center gap-2">
                        {obtenerIconoCategoria(gasto.categoria, "h-4 w-4 text-primary")}
                        <span>{getCategoryLabel(gasto.categoria)}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {getSubcategoryLabel(gasto.subcategoria || '', gasto.categoria)}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <div className="font-medium">{gasto.descripcion}</div>
                      {gasto.tags && gasto.tags.length > 0 && (
                        <div className="flex gap-1 mt-1 flex-wrap">
                          {gasto.tags.map((tag, index) => (
                            <span key={index} className="text-[10px] px-1.5 py-0.5 rounded-full bg-secondary text-secondary-foreground">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {getPaymentMethodLabel(gasto.metodoPago)}
                    </td>
                    <td className="px-4 py-3 text-sm text-right font-semibold">
                      {formatearMoneda(gasto.monto, gasto.moneda)}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => navigate(`/gastos/editar/${gasto.id}`)}
                          className="p-1.5 rounded hover:bg-primary/10 text-primary transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => setGastoAEliminar(gasto.id)}
                          className="p-1.5 rounded hover:bg-destructive/10 text-destructive transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-muted-foreground">
                    <FileText className="h-12 w-12 mx-auto mb-3 opacity-20" />
                    <p>No se encontraron gastos</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Vista Móvil (Tarjetas iOS Style) */}
      <div className="md:hidden space-y-4">
        {gastosFiltrados.length > 0 ? (
          gastosFiltrados.map((gasto) => (
            <div 
              key={gasto.id} 
              onClick={() => navigate(`/gastos/editar/${gasto.id}`)}
              className="bg-card/80 backdrop-blur-md border border-border/50 rounded-2xl p-4 shadow-sm active:scale-[0.98] transition-all duration-200 cursor-pointer hover:shadow-md"
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-3.5">
                  <div className={`p-2.5 rounded-xl bg-primary/10 text-primary shadow-sm`}>
                    {obtenerIconoCategoria(gasto.categoria)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground line-clamp-1 text-base">{gasto.descripcion}</h3>
                    <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5">
                      <Calendar className="h-3 w-3" />
                      {formatearFecha(gasto.fecha)}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-foreground text-lg tracking-tight">
                    {formatearMoneda(gasto.monto, gasto.moneda)}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/50">
                <div className="flex flex-wrap gap-2">
                  <span className="text-[10px] font-medium px-2 py-1 rounded-lg bg-secondary/80 text-secondary-foreground backdrop-blur-sm">
                    {getCategoryLabel(gasto.categoria)}
                  </span>
                  {gasto.subcategoria && (
                    <span className="text-[10px] font-medium px-2 py-1 rounded-lg bg-muted/80 text-muted-foreground backdrop-blur-sm">
                      {gasto.subcategoria}
                    </span>
                  )}
                  <span className="text-[10px] font-medium px-2 py-1 rounded-lg bg-muted/50 text-muted-foreground flex items-center gap-1">
                    <CreditCard className="h-3 w-3" />
                    {getPaymentMethodLabel(gasto.metodoPago)}
                  </span>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setGastoAEliminar(gasto.id);
                  }}
                  className="p-2 -mr-2 rounded-full hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-16 text-muted-foreground bg-card/30 rounded-3xl border border-dashed border-border">
            <FileText className="h-12 w-12 mx-auto mb-3 opacity-20" />
            <p>No se encontraron gastos</p>
          </div>
        )}
      </div>

      {/* Modal de confirmación de eliminación */}
      <Modal
        isOpen={!!gastoAEliminar}
        onClose={() => setGastoAEliminar(null)}
        title="Eliminar gasto"
        size="sm"
        footer={
          <ModalFooterActions
            onCancel={() => setGastoAEliminar(null)}
            onConfirm={() => gastoAEliminar && handleEliminar(gastoAEliminar)}
            cancelText="Cancelar"
            disabled={loadingDelete}
            confirmText={<ContainerLoadingButton isLoading={loadingDelete} loadingText="Eliminando..." text="Eliminar" />}
            confirmVariant="destructive"
          />
        }
      >
        <div className="space-y-4">
          <div className="flex items-center justify-center">
            <div className="p-4 bg-destructive/10 rounded-full">
              <AlertTriangle className="h-12 w-12 text-destructive" />
            </div>
          </div>

          <div className="text-center space-y-2">
            <h3 className="font-semibold text-foreground">
              ¿Estás seguro?
            </h3>
            <p className="text-sm text-muted-foreground">
              Esta acción no se puede deshacer. El gasto será eliminado permanentemente.
            </p>
          </div>
        </div>
      </Modal>

      {/* Modal de Exportación */}
      <Modal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        title="Descargar Reporte"
        subtitle="Selecciona el periodo y formato del reporte"
        size="md"
        footer={
          <ModalButton
            variant="primary"
            onClick={handleExport}
            disabled={isExporting}
            className="w-full"
          >
            {isExporting ? (
              <div className="flex items-center justify-center gap-2">
                <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
                <span>Descargando...</span>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2">
                <Download className="h-4 w-4" />
                <span>Descargar</span>
              </div>
            )}
          </ModalButton>
        }
      >
        <div className="space-y-4">
          {/* Icono principal */}
          <div className="flex items-center justify-center mb-2">
            <div className="p-4 bg-primary/10 rounded-full">
              <FileSpreadsheet className="h-12 w-12 text-primary" />
            </div>
          </div>

          {/* Periodo (Mes y Año) */}
          <div className="bg-card border border-border rounded-xl overflow-hidden divide-y divide-border">
            <div className="flex divide-x divide-border">
              {/* Mes */}
              <div className="flex-1 p-3 flex items-center gap-3">
                <div className="p-1.5 bg-blue-500/10 rounded-lg text-blue-600 dark:text-blue-400">
                  <Calendar className="h-4 w-4" />
                </div>
                <div className="flex-1">
                  <label className="text-[10px] text-muted-foreground block mb-0.5">
                    Mes
                  </label>
                  <select
                    value={exportMonth}
                    onChange={(e) => setExportMonth(Number(e.target.value))}
                    className="bg-transparent text-sm w-full focus:outline-none font-medium appearance-none"
                  >
                    {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                      <option key={m} value={m}>
                        {new Date(0, m - 1).toLocaleString('es', { month: 'long' })}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Año */}
              <div className="flex-1 p-3 flex items-center gap-3">
                <div className="p-1.5 bg-indigo-500/10 rounded-lg text-indigo-600 dark:text-indigo-400">
                  <Calendar className="h-4 w-4" />
                </div>
                <div className="flex-1">
                  <label className="text-[10px] text-muted-foreground block mb-0.5">
                    Año
                  </label>
                  <input
                    type="number"
                    value={exportYear}
                    onChange={(e) => setExportYear(Number(e.target.value))}
                    className="bg-transparent text-sm w-full focus:outline-none font-medium"
                    min="2000"
                    max="2099"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Formato */}
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="p-3">
              <label className="text-[10px] text-muted-foreground uppercase tracking-wide block mb-3">
                Formato de exportación
              </label>
              <div className="space-y-2">
                {/* Excel */}
                <label className="flex items-center gap-3 p-3 border border-border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                  <input
                    type="radio"
                    name="format"
                    value="excel"
                    checked={exportFormat === 'excel'}
                    onChange={() => setExportFormat('excel')}
                    className="w-4 h-4 text-primary"
                  />
                  <div className="p-1.5 bg-green-500/10 rounded-lg text-green-600 dark:text-green-400">
                    <FileSpreadsheet className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Excel</p>
                    <p className="text-xs text-muted-foreground">.xlsx - Formato de hoja de cálculo</p>
                  </div>
                </label>

                {/* JSON */}
                <label className="flex items-center gap-3 p-3 border border-border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                  <input
                    type="radio"
                    name="format"
                    value="json"
                    checked={exportFormat === 'json'}
                    onChange={() => setExportFormat('json')}
                    className="w-4 h-4 text-primary"
                  />
                  <div className="p-1.5 bg-orange-500/10 rounded-lg text-orange-600 dark:text-orange-400">
                    <FileJson className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">JSON</p>
                    <p className="text-xs text-muted-foreground">.json - Formato de datos estructurados</p>
                  </div>
                </label>
              </div>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
