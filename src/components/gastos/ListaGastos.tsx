/**
 * Vista de lista de gastos con filtros y acciones
 */

import { useEffect, useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useGastos } from '@hooks/useGastos';
import {
  CATEGORIAS_GASTO,
  CATEGORIA_LABELS,
  METODOS_PAGO,
  METODO_PAGO_LABELS,
  SUBCATEGORIAS,
  type CategoriaGasto,
  type MetodoPago,
  type Moneda,
} from '@types';
import { formatearMoneda, formatearFecha } from '@utils/formatters';
import { calcularTotalGastos, agruparGastosPorMoneda } from '@utils/calculations';
import { toast } from 'react-hot-toast';
import { Plus, FileText, UtensilsCrossed, Car, Pill, Film, ShoppingCart, BookOpen, Home, Wrench, Package } from 'lucide-react';

export default function ListaGastos() {
  const navigate = useNavigate();
  const { gastos, estado, cargarGastos, eliminar } = useGastos();

  // Estados de filtros
  const [busqueda, setBusqueda] = useState('');
  const [categoriaFiltro, setCategoriaFiltro] = useState<CategoriaGasto | 'todas'>('todas');
  const [subcategoriaFiltro, setSubcategoriaFiltro] = useState<string>('todas');
  const [metodoPagoFiltro, setMetodoPagoFiltro] = useState<MetodoPago | 'todos'>('todos');
  const [monedaFiltro, setMonedaFiltro] = useState<Moneda | 'todas'>('todas');
  const [mesActual, setMesActual] = useState(() => {
    const fecha = new Date();
    return `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}`;
  });

  // Estado para confirmación de eliminación
  const [gastoAEliminar, setGastoAEliminar] = useState<string | null>(null);

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

    // Filtrar por moneda
    if (monedaFiltro !== 'todas') {
      resultado = resultado.filter((gasto) => gasto.moneda === monedaFiltro);
    }

    // Filtrar por búsqueda
    if (busqueda.trim()) {
      const busquedaLower = busqueda.toLowerCase();
      resultado = resultado.filter(
        (gasto) =>
          gasto.descripcion.toLowerCase().includes(busquedaLower) ||
          CATEGORIA_LABELS[gasto.categoria].toLowerCase().includes(busquedaLower) ||
          gasto.tags?.some((tag) => tag.toLowerCase().includes(busquedaLower))
      );
    }

    return resultado;
  }, [gastos, categoriaFiltro, subcategoriaFiltro, metodoPagoFiltro, monedaFiltro, busqueda, mesActual]);

  // Calcular totales por moneda
  const totalesPorMoneda = useMemo(() => {
    const agrupados = agruparGastosPorMoneda(gastosFiltrados);
    return {
      PEN: calcularTotalGastos(agrupados.PEN),
      USD: calcularTotalGastos(agrupados.USD),
    };
  }, [gastosFiltrados]);

  // Manejar eliminación
  const handleEliminar = async (id: string) => {
    try {
      await eliminar(id);
      toast.success('Gasto eliminado exitosamente');
      setGastoAEliminar(null);
    } catch (error) {
      console.error('Error al eliminar gasto:', error);
      toast.error('Error al eliminar el gasto');
    }
  };

  // Manejar cambio de categoría (resetear subcategoría)
  const handleCategoriaChange = (nuevaCategoria: CategoriaGasto | 'todas') => {
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
    return SUBCATEGORIAS[categoriaFiltro] || [];
  }, [categoriaFiltro, gastos]);

  // Obtener icono de categoría
  const obtenerIconoCategoria = (categoria: CategoriaGasto, className: string = "h-5 w-5") => {
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

  if (estado.estado === 'loading') {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando gastos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Mis Gastos</h1>
          <p className="text-muted-foreground mt-1">
            {gastosFiltrados.length} {gastosFiltrados.length === 1 ? 'gasto' : 'gastos'}{' '}
            {categoriaFiltro !== 'todas' && `en ${CATEGORIA_LABELS[categoriaFiltro]}`}
          </p>
        </div>
        <Link
          to="/gastos/nuevo"
          className="inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-2 px-4 rounded-md transition-colors"
        >
          <Plus className="h-5 w-5" />
          <span>Nuevo Gasto</span>
        </Link>
      </div>

      {/* Resumen por moneda */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-card border border-border rounded-lg p-4">
          <p className="text-sm text-muted-foreground">Total en Soles</p>
          <p className="text-2xl font-bold text-foreground">
            {formatearMoneda(totalesPorMoneda.PEN, 'PEN')}
          </p>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <p className="text-sm text-muted-foreground">Total en Dólares</p>
          <p className="text-2xl font-bold text-foreground">
            {formatearMoneda(totalesPorMoneda.USD, 'USD')}
          </p>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-card border border-border rounded-lg p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Búsqueda */}
          <div className="md:col-span-2">
            <label htmlFor="busqueda" className="block text-sm font-medium text-foreground mb-1">
              Buscar
            </label>
            <input
              type="text"
              id="busqueda"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Descripción o etiqueta..."
              className="w-full px-4 py-2 rounded-md border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Categoría */}
          <div>
            <label htmlFor="categoria" className="block text-sm font-medium text-foreground mb-1">
              Categoría
            </label>
            <select
              id="categoria"
              value={categoriaFiltro}
              onChange={(e) => handleCategoriaChange(e.target.value as CategoriaGasto | 'todas')}
              className="w-full px-4 py-2 rounded-md border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="todas">Todas</option>
              {CATEGORIAS_GASTO.map((cat) => (
                <option key={cat} value={cat}>
                  {CATEGORIA_LABELS[cat]}
                </option>
              ))}
            </select>
          </div>

          {/* Moneda */}
          <div>
            <label htmlFor="moneda" className="block text-sm font-medium text-foreground mb-1">
              Moneda
            </label>
            <select
              id="moneda"
              value={monedaFiltro}
              onChange={(e) => setMonedaFiltro(e.target.value as Moneda | 'todas')}
              className="w-full px-4 py-2 rounded-md border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="todas">Todas</option>
              <option value="PEN">Soles (S/)</option>
              <option value="USD">Dólares ($)</option>
            </select>
          </div>
        </div>

        {/* Segunda fila de filtros */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          {/* Subcategoría */}
          <div>
            <label htmlFor="subcategoria" className="block text-sm font-medium text-foreground mb-1">
              Subcategoría
            </label>
            <select
              id="subcategoria"
              value={subcategoriaFiltro}
              onChange={(e) => setSubcategoriaFiltro(e.target.value)}
              className="w-full px-4 py-2 rounded-md border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              disabled={subcategoriasDisponibles.length === 0}
            >
              <option value="todas">Todas</option>
              {subcategoriasDisponibles.map((sub) => (
                <option key={sub} value={sub}>
                  {sub}
                </option>
              ))}
            </select>
          </div>

          {/* Método de Pago */}
          <div>
            <label htmlFor="metodoPago" className="block text-sm font-medium text-foreground mb-1">
              Método de Pago
            </label>
            <select
              id="metodoPago"
              value={metodoPagoFiltro}
              onChange={(e) => setMetodoPagoFiltro(e.target.value as MetodoPago | 'todos')}
              className="w-full px-4 py-2 rounded-md border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="todos">Todos</option>
              {METODOS_PAGO.map((metodo) => (
                <option key={metodo} value={metodo}>
                  {METODO_PAGO_LABELS[metodo]}
                </option>
              ))}
            </select>
          </div>

          {/* Mes */}
          <div>
            <label htmlFor="mes" className="block text-sm font-medium text-foreground mb-1">
              Mes
            </label>
            <input
              type="month"
              id="mes"
              value={mesActual}
              onChange={(e) => setMesActual(e.target.value)}
              className="w-full px-4 py-2 rounded-md border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>
      </div>

      {/* Lista de gastos */}
      {gastosFiltrados.length > 0 ? (
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50 border-b border-border">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-foreground">
                    Fecha
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-foreground">
                    Categoría
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-foreground">
                    Descripción
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-foreground">
                    Método
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-foreground">
                    Monto
                  </th>
                  <th className="px-4 py-3 text-center text-sm font-medium text-foreground">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {gastosFiltrados.map((gasto) => (
                  <tr key={gasto.id} className="hover:bg-accent transition-colors">
                    <td className="px-4 py-3 text-sm text-foreground whitespace-nowrap">
                      {formatearFecha(gasto.fecha)}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <div className="flex items-center gap-2">
                        {obtenerIconoCategoria(gasto.categoria, "h-5 w-5 text-primary")}
                        <div>
                          <p className="text-foreground">
                            {CATEGORIA_LABELS[gasto.categoria]}
                          </p>
                          {gasto.subcategoria && (
                            <p className="text-xs text-muted-foreground">
                              {gasto.subcategoria}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <div>
                        <p className="text-foreground font-medium">{gasto.descripcion}</p>
                        {gasto.tags && gasto.tags.length > 0 && (
                          <div className="flex gap-1 mt-1 flex-wrap">
                            {gasto.tags.map((tag, index) => (
                              <span
                                key={index}
                                className="inline-block px-2 py-0.5 text-xs rounded-full bg-primary/10 text-primary"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {METODO_PAGO_LABELS[gasto.metodoPago]}
                    </td>
                    <td className="px-4 py-3 text-sm text-right">
                      <span className="font-semibold text-foreground">
                        {formatearMoneda(gasto.monto, gasto.moneda)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => navigate(`/gastos/editar/${gasto.id}`)}
                          className="p-1.5 rounded hover:bg-primary/10 text-primary transition-colors"
                          title="Editar"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                            />
                          </svg>
                        </button>
                        <button
                          onClick={() => setGastoAEliminar(gasto.id)}
                          className="p-1.5 rounded hover:bg-destructive/10 text-destructive transition-colors"
                          title="Eliminar"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-lg p-12 text-center">
          <FileText className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <p className="text-lg font-medium text-foreground mb-2">No hay gastos para mostrar</p>
          <p className="text-sm text-muted-foreground mb-4">
            {busqueda || categoriaFiltro !== 'todas' || subcategoriaFiltro !== 'todas' || metodoPagoFiltro !== 'todos'
              ? 'Intenta cambiar los filtros'
              : 'Comienza agregando tu primer gasto'}
          </p>
          <Link
            to="/gastos/nuevo"
            className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-2 px-4 rounded-md transition-colors"
          >
            <Plus className="h-5 w-5" />
            <span>Nuevo Gasto</span>
          </Link>
        </div>
      )}

      {/* Modal de confirmación de eliminación */}
      {gastoAEliminar && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-bold text-foreground mb-2">
              ¿Eliminar gasto?
            </h3>
            <p className="text-sm text-muted-foreground mb-6">
              Esta acción no se puede deshacer. El gasto será eliminado permanentemente.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => handleEliminar(gastoAEliminar)}
                className="flex-1 bg-destructive hover:bg-destructive/90 text-destructive-foreground font-semibold py-2 px-4 rounded-md transition-colors"
              >
                Eliminar
              </button>
              <button
                onClick={() => setGastoAEliminar(null)}
                className="flex-1 bg-secondary hover:bg-secondary/90 text-secondary-foreground font-semibold py-2 px-4 rounded-md transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
