/**
 * Vista de presupuestos con gestión completa
 */

import { useEffect, useState, useMemo } from 'react';
import { usePresupuestos } from '@hooks/usePresupuestos';
import { useGastos } from '@hooks/useGastos';
import { useAuth } from '@context/AuthContext';
import { useConfig } from '@context/ConfigContext';
import {
  CATEGORIA_GENERAL,
  SUBCATEGORIAS_PRESUPUESTO_GENERAL,
  type CategoriaGasto,
  type CategoriaGastoOGeneral,
  type Moneda,
  type Presupuesto,
} from '@app-types';
import { formatearMoneda, parsearMesKey } from '@utils/formatters';
import { calcularGastosPorCategoria } from '@utils/calculations';
import { toast } from 'react-hot-toast';
import { Plus, Target, Wallet, UtensilsCrossed, Car, Pill, Film, ShoppingCart, BookOpen, Home, Wrench, Package, Tag, Coins, DollarSign, AlertTriangle } from 'lucide-react';
import CustomLoader from '@components/common/CustomLoader';
import Modal, { ModalFooterActions } from '@components/common/Modal';

interface FormPresupuesto {
  categoria: CategoriaGastoOGeneral;
  subcategoria: string;
  limite: string;
  moneda: Moneda;
}

export default function ListaPresupuestos() {
  const { usuario } = useAuth();
  const { presupuestos, estado, cargarPresupuestos, crear, actualizar, eliminar } = usePresupuestos();
  const { gastos, cargarGastos } = useGastos();
  const { categories, currencies, getCategoryLabel } = useConfig();

  const [mesActual, setMesActual] = useState(() => {
    const fecha = new Date();
    return `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}`;
  });

  const [mostrarModal, setMostrarModal] = useState(false);
  const [presupuestoEditando, setPresupuestoEditando] = useState<Presupuesto | null>(null);
  const [presupuestoAEliminar, setPresupuestoAEliminar] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);

  const [formData, setFormData] = useState<FormPresupuesto>({
    categoria: 'alimentacion',
    subcategoria: '',
    limite: '',
    moneda: 'PEN',
  });

  useEffect(() => {
    cargarPresupuestos(mesActual);
    cargarGastos();
  }, [mesActual, cargarPresupuestos, cargarGastos]);

  // Calcular gastos por categoría del mes actual
  const gastosPorCategoria = useMemo(() => {
    const gastosDelMes = gastos.filter((gasto) => {
      const fechaGasto = new Date(gasto.fecha);
      const mesGasto = `${fechaGasto.getFullYear()}-${String(fechaGasto.getMonth() + 1).padStart(2, '0')}`;
      return mesGasto === mesActual;
    });
    return calcularGastosPorCategoria(gastosDelMes);
  }, [gastos, mesActual]);

  // Separar presupuestos generales de presupuestos por categoría
  const { presupuestosGenerales, presupuestosCategorias } = useMemo(() => {
    const generales = presupuestos.filter((p) => p.categoria === CATEGORIA_GENERAL);
    const categorias = presupuestos.filter((p) => p.categoria !== CATEGORIA_GENERAL);
    return { presupuestosGenerales: generales, presupuestosCategorias: categorias };
  }, [presupuestos]);

  // Calcular totales asignados y no asignados (por moneda)
  const totales = useMemo(() => {
    const totalAsignadoPEN = presupuestosCategorias
      .filter((p) => p.moneda === 'PEN')
      .reduce((sum, p) => sum + p.limite, 0);

    const totalAsignadoUSD = presupuestosCategorias
      .filter((p) => p.moneda === 'USD')
      .reduce((sum, p) => sum + p.limite, 0);

    // Sumar todos los presupuestos generales por moneda
    const limiteTotalPEN = presupuestosGenerales
      .filter((p) => p.moneda === 'PEN')
      .reduce((sum, p) => sum + p.limite, 0);

    const limiteTotalUSD = presupuestosGenerales
      .filter((p) => p.moneda === 'USD')
      .reduce((sum, p) => sum + p.limite, 0);

    return {
      limiteTotalPEN,
      limiteTotalUSD,
      asignadoPEN: totalAsignadoPEN,
      asignadoUSD: totalAsignadoUSD,
      noAsignadoPEN: limiteTotalPEN - totalAsignadoPEN,
      noAsignadoUSD: limiteTotalUSD - totalAsignadoUSD,
    };
  }, [presupuestosCategorias, presupuestosGenerales]);

  // Abrir modal para crear nuevo presupuesto
  const handleNuevo = () => {
    setPresupuestoEditando(null);
    setFormData({
      categoria: 'alimentacion',
      subcategoria: '',
      limite: '',
      moneda: 'PEN',
    });
    setMostrarModal(true);
  };

  // Abrir modal para editar presupuesto
  const handleEditar = (presupuesto: Presupuesto) => {
    setPresupuestoEditando(presupuesto);
    setFormData({
      categoria: presupuesto.categoria,
      subcategoria: presupuesto.subcategoria || '',
      limite: presupuesto.limite.toString(),
      moneda: presupuesto.moneda,
    });
    setMostrarModal(true);
  };

  // Manejar cambios en el formulario
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    // Si cambia la categoría, resetear subcategoría
    if (name === 'categoria') {
      setFormData((prev) => ({ ...prev, [name]: value as CategoriaGastoOGeneral, subcategoria: '' }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  // Validar formulario
  const validarFormulario = (): boolean => {
    if (!formData.limite || parseFloat(formData.limite) <= 0) {
      toast.error('El límite debe ser mayor a 0');
      return false;
    }

    // Solo validar duplicados para categorías (no para presupuesto general)
    if (formData.categoria !== CATEGORIA_GENERAL) {
      const existePresupuesto = presupuestos.some(
        (p) =>
          p.categoria === formData.categoria &&
          p.moneda === formData.moneda &&
          (!presupuestoEditando || p.id !== presupuestoEditando.id)
      );

      if (existePresupuesto) {
        const currencyObj = currencies.find(c => c.codigoISO === formData.moneda);
        const currencyLabel = currencyObj ? currencyObj.nombre : formData.moneda;
        toast.error(
          `Ya existe un presupuesto para ${getCategoryLabel(formData.categoria)} en ${currencyLabel}`
        );
        return false;
      }
    }

    return true;
  };

  // Guardar presupuesto
  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();

    if (!validarFormulario()) return;
    if (!usuario) {
      toast.error('Debes iniciar sesión');
      return;
    }

    setCargando(true);

    try {
      const limite = parseFloat(formData.limite);
      // Para presupuesto general, gastado es 0; para categorías, usar gastos reales
      const gastado = formData.categoria === CATEGORIA_GENERAL
        ? 0
        : (gastosPorCategoria[formData.categoria as CategoriaGasto] || 0);

      if (presupuestoEditando) {
        // Actualizar presupuesto existente
        const updateData: any = {
          limite,
          moneda: formData.moneda,
        };

        // Solo agregar subcategoría si existe
        if (formData.subcategoria) {
          updateData.subcategoria = formData.subcategoria;
        }

        await actualizar(presupuestoEditando.id, updateData);
      } else {
        // Crear nuevo presupuesto
        const createData: any = {
          userId: usuario.id,
          mes: mesActual,
          categoria: formData.categoria,
          limite,
          moneda: formData.moneda,
          gastado,
        };

        // Solo agregar subcategoría si existe
        if (formData.subcategoria) {
          createData.subcategoria = formData.subcategoria;
        }

        await crear(createData);
      }

      setMostrarModal(false);
      setPresupuestoEditando(null);
    } catch (error) {
      console.error('Error al guardar presupuesto:', error);
    } finally {
      setCargando(false);
    }
  };

  // Eliminar presupuesto
  const handleEliminar = async (id: string) => {
    try {
      await eliminar(id);
      setPresupuestoAEliminar(null);
    } catch (error) {
      console.error('Error al eliminar presupuesto:', error);
    }
  };

  // Calcular porcentaje gastado
  const calcularPorcentaje = (gastado: number, limite: number): number => {
    if (limite === 0) return 0;
    return (gastado / limite) * 100;
  };

  // Obtener color según porcentaje
  const obtenerColor = (porcentaje: number): string => {
    if (porcentaje >= 100) return 'bg-destructive';
    if (porcentaje >= 80) return 'bg-yellow-500';
    return 'bg-primary';
  };

  // Obtener icono de categoría
  const obtenerIconoCategoria = (categoria: CategoriaGastoOGeneral, className: string = "h-5 w-5") => {
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
      case 'general':
        return <Wallet {...iconProps} />;
      default:
        return <Package {...iconProps} />;
    }
  };

  if (estado.estado === 'loading') {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-center">
          <CustomLoader />
          <p className="text-muted-foreground mt-4">Cargando presupuestos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Presupuestos</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {parsearMesKey(mesActual)} • {presupuestos.length}{' '}
            {presupuestos.length === 1 ? 'presupuesto' : 'presupuestos'}
          </p>
        </div>
        
        {/* Desktop Button */}
        <button
          onClick={handleNuevo}
          className="hidden sm:inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-2.5 px-5 rounded-xl transition-all shadow-sm hover:shadow-md"
        >
          <Plus className="h-5 w-5" />
          <span>Nuevo Presupuesto</span>
        </button>
      </div>

      {/* Mobile FABs */}
      <div className="sm:hidden fixed bottom-20 right-4 z-30 flex flex-col gap-3">
        {/* Add Income FAB (Blue) */}
        <button
          onClick={() => {
            setPresupuestoEditando(null);
            setFormData({
              categoria: CATEGORIA_GENERAL,
              subcategoria: '',
              limite: '',
              moneda: 'PEN',
            });
            setMostrarModal(true);
          }}
          className="h-14 w-14 bg-blue-600 text-white rounded-full shadow-lg flex items-center justify-center hover:scale-105 active:scale-95 transition-all"
        >
          <Wallet className="h-7 w-7" />
        </button>

        {/* New Budget FAB (Primary) */}
        <button
          onClick={handleNuevo}
          className="h-14 w-14 bg-primary text-primary-foreground rounded-full shadow-lg flex items-center justify-center hover:scale-105 active:scale-95 transition-all"
        >
          <Plus className="h-7 w-7" />
        </button>
      </div>

      {/* Selector de mes */}
      <div className="bg-card border border-border rounded-lg p-4">
        <label htmlFor="mes" className="block text-sm font-medium text-foreground mb-2">
          Seleccionar Mes
        </label>
        <input
          type="month"
          id="mes"
          value={mesActual}
          onChange={(e) => setMesActual(e.target.value)}
          className="px-4 py-2 rounded-md border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      {/* Presupuestos Generales */}
      {presupuestosGenerales.length > 0 ? (
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 border-2 border-blue-300 dark:border-blue-700 rounded-lg p-6 shadow-md">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="h-14 w-14 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
                <Wallet className="h-8 w-8 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-foreground">
                  Presupuestos Generales
                </h3>
                <p className="text-sm text-muted-foreground">
                  {presupuestosGenerales.length} {presupuestosGenerales.length === 1 ? 'ingreso' : 'ingresos'}
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                setPresupuestoEditando(null);
                setFormData({
                  categoria: CATEGORIA_GENERAL,
                  subcategoria: '',
                  limite: '',
                  moneda: 'PEN',
                });
                setMostrarModal(true);
              }}
              className="hidden sm:inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md transition-colors"
            >
              <Plus className="h-5 w-5" />
              <span>Agregar Ingreso</span>
            </button>
          </div>

          {/* Lista de presupuestos generales */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
            {presupuestosGenerales.map((presupuesto) => (
              <div
                key={presupuesto.id}
                className="bg-white/50 dark:bg-black/20 rounded-lg p-4 flex items-center justify-between"
              >
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground mb-1">
                    {presupuesto.subcategoria || 'Sin especificar'}
                  </p>
                  <p className="text-xl font-bold text-foreground">
                    {formatearMoneda(presupuesto.limite, presupuesto.moneda)}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEditar(presupuesto)}
                    className="p-1.5 rounded hover:bg-blue-100 dark:hover:bg-blue-900 text-blue-600 dark:text-blue-400 transition-colors"
                    title="Editar"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => setPresupuestoAEliminar(presupuesto.id)}
                    className="p-1.5 rounded hover:bg-red-100 dark:hover:bg-red-900 text-red-600 dark:text-red-400 transition-colors"
                    title="Eliminar"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Resumen de totales por moneda */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Totales PEN */}
            {totales.limiteTotalPEN > 0 && (
              <div className="bg-white/70 dark:bg-black/30 rounded-lg p-4 border-2 border-blue-400 dark:border-blue-600">
                <p className="text-xs text-muted-foreground mb-2">TOTALES EN SOLES (S/)</p>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Límite Total</span>
                    <span className="text-lg font-bold text-foreground">
                      {formatearMoneda(totales.limiteTotalPEN, 'PEN')}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Asignado</span>
                    <span className="text-lg font-semibold text-blue-600">
                      {formatearMoneda(totales.asignadoPEN, 'PEN')}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-blue-300 dark:border-blue-700">
                    <span className="text-sm font-medium text-foreground">No Asignado</span>
                    <span className={`text-lg font-bold ${
                      totales.noAsignadoPEN < 0 ? 'text-destructive' : 'text-primary'
                    }`}>
                      {formatearMoneda(totales.noAsignadoPEN, 'PEN')}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Totales USD */}
            {totales.limiteTotalUSD > 0 && (
              <div className="bg-white/70 dark:bg-black/30 rounded-lg p-4 border-2 border-blue-400 dark:border-blue-600">
                <p className="text-xs text-muted-foreground mb-2">TOTALES EN DÓLARES ($)</p>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Límite Total</span>
                    <span className="text-lg font-bold text-foreground">
                      {formatearMoneda(totales.limiteTotalUSD, 'USD')}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Asignado</span>
                    <span className="text-lg font-semibold text-blue-600">
                      {formatearMoneda(totales.asignadoUSD, 'USD')}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-blue-300 dark:border-blue-700">
                    <span className="text-sm font-medium text-foreground">No Asignado</span>
                    <span className={`text-lg font-bold ${
                      totales.noAsignadoUSD < 0 ? 'text-destructive' : 'text-primary'
                    }`}>
                      {formatearMoneda(totales.noAsignadoUSD, 'USD')}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Advertencia si se excede */}
          {(totales.noAsignadoPEN < 0 || totales.noAsignadoUSD < 0) && (
            <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-3 mt-4">
              <p className="text-sm text-destructive font-medium">
                ⚠️ Has asignado más presupuesto del disponible en los presupuestos generales
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-card border-2 border-dashed border-border rounded-lg p-6 text-center">
          <Wallet className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-sm font-medium text-foreground mb-1">
            No hay presupuestos generales
          </p>
          <p className="text-xs text-muted-foreground mb-3">
            Crea presupuestos generales para controlar el total mensual por origen de ingresos
          </p>
          <button
            onClick={() => {
              setPresupuestoEditando(null);
              setFormData({
                categoria: CATEGORIA_GENERAL,
                subcategoria: '',
                limite: '',
                moneda: 'PEN',
              });
              setMostrarModal(true);
            }}
            className="text-sm bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-2 px-4 rounded-md transition-colors"
          >
            Crear Presupuesto General
          </button>
        </div>
      )}

      {/* Título de presupuestos por categoría */}
      {presupuestosCategorias.length > 0 && (
        <div>
          <h2 className="text-xl font-bold text-foreground">Presupuestos por Categoría</h2>
          <p className="text-sm text-muted-foreground">
            {presupuestosCategorias.length} {presupuestosCategorias.length === 1 ? 'categoría' : 'categorías'}
          </p>
        </div>
      )}

      {/* Lista de presupuestos por categoría */}
      {presupuestosCategorias.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {presupuestosCategorias.map((presupuesto) => {
            const gastado = presupuesto.categoria === 'general' ? 0 : (gastosPorCategoria[presupuesto.categoria as CategoriaGasto] || 0);
            const porcentaje = calcularPorcentaje(gastado, presupuesto.limite);
            const restante = presupuesto.limite - gastado;

            return (
              <div
                key={presupuesto.id}
                className="bg-card border border-border rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                {/* Header de la tarjeta */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      {obtenerIconoCategoria(presupuesto.categoria, "h-6 w-6 text-primary")}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-foreground">
                        {presupuesto.categoria === CATEGORIA_GENERAL
                          ? 'Presupuesto General'
                          : getCategoryLabel(presupuesto.categoria)}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {currencies.find(c => c.codigoISO === presupuesto.moneda)?.nombre || presupuesto.moneda}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditar(presupuesto)}
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
                      onClick={() => setPresupuestoAEliminar(presupuesto.id)}
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
                </div>

                {/* Montos */}
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Gastado</span>
                    <span className="text-lg font-bold text-foreground">
                      {formatearMoneda(gastado, presupuesto.moneda)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Límite</span>
                    <span className="text-lg font-semibold text-muted-foreground">
                      {formatearMoneda(presupuesto.limite, presupuesto.moneda)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-border">
                    <span className="text-sm font-medium text-foreground">Restante</span>
                    <span
                      className={`text-lg font-bold ${
                        restante < 0 ? 'text-destructive' : 'text-primary'
                      }`}
                    >
                      {formatearMoneda(restante, presupuesto.moneda)}
                    </span>
                  </div>
                </div>

                {/* Barra de progreso */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-foreground">Progreso</span>
                    <span
                      className={`text-sm font-bold ${
                        porcentaje >= 100
                          ? 'text-destructive'
                          : porcentaje >= 80
                          ? 'text-yellow-500'
                          : 'text-primary'
                      }`}
                    >
                      {porcentaje.toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${obtenerColor(
                        porcentaje
                      )}`}
                      style={{ width: `${Math.min(porcentaje, 100)}%` }}
                    />
                  </div>
                  {porcentaje >= 100 && (
                    <p className="text-xs text-destructive font-medium">
                      ⚠️ Has excedido el presupuesto
                    </p>
                  )}
                  {porcentaje >= 80 && porcentaje < 100 && (
                    <p className="text-xs text-yellow-600 font-medium">
                      ⚠️ Cerca del límite del presupuesto
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-card border border-border rounded-lg p-12 text-center">
          <Target className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <p className="text-lg font-medium text-foreground mb-2">
            No hay presupuestos por categoría
          </p>
          <p className="text-sm text-muted-foreground mb-4">
            Crea presupuestos para categorías específicas
          </p>
          <button
            onClick={handleNuevo}
            className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-2 px-4 rounded-md transition-colors"
          >
            <Plus className="h-5 w-5" />
            <span>Crear Presupuesto por Categoría</span>
          </button>
        </div>
      )}

      {/* Modal de formulario - iOS Style */}
      <Modal
        isOpen={mostrarModal}
        onClose={() => {
          setMostrarModal(false);
          setPresupuestoEditando(null);
        }}
        title={presupuestoEditando ? 'Editar Presupuesto' :
               formData.categoria === CATEGORIA_GENERAL ? 'Agregar Ingreso' : 'Nuevo Presupuesto'}
        size="md"
        footer={
          <ModalFooterActions
            onCancel={() => {
              setMostrarModal(false);
              setPresupuestoEditando(null);
            }}
            onConfirm={handleSubmit}
            cancelText="Cancelar"
            confirmText={cargando ? 'Guardando...' : presupuestoEditando ? 'Actualizar' : 'Crear'}
            disabled={cargando}
          />
        }
      >
        <form className="space-y-3" onSubmit={handleSubmit}>
              {/* Categoría */}
              <div className="bg-card border border-border rounded-xl overflow-hidden">
                <div className="p-3 flex items-center gap-3">
                  <div className="p-1.5 bg-indigo-500/10 rounded-lg text-indigo-600 dark:text-indigo-400">
                    <Tag className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <label className="text-[10px] text-muted-foreground block mb-0.5">
                      Categoría <span className="text-destructive">*</span>
                    </label>
                    <select
                      id="categoria"
                      name="categoria"
                      value={formData.categoria}
                      onChange={handleChange}
                      className="bg-transparent text-sm w-full focus:outline-none font-medium appearance-none disabled:opacity-50"
                      disabled={cargando || !!presupuestoEditando}
                    >
                      <option value={CATEGORIA_GENERAL}>
                        Presupuesto General
                      </option>
                      <option disabled>──────────</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.nombre}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Subcategoría - Solo para presupuesto general */}
              {formData.categoria === CATEGORIA_GENERAL && (
                <div className="bg-card border border-blue-200 dark:border-blue-900 rounded-xl overflow-hidden animate-in slide-in-from-top-2 duration-200">
                  <div className="p-3 flex items-center gap-3 bg-blue-500/5">
                    <div className="p-1.5 bg-blue-500/10 rounded-lg text-blue-600 dark:text-blue-400">
                      <Wallet className="h-4 w-4" />
                    </div>
                    <div className="flex-1">
                      <label className="text-[10px] text-muted-foreground block mb-0.5">
                        Tipo de Ingreso
                      </label>
                      <select
                        id="subcategoria"
                        name="subcategoria"
                        value={formData.subcategoria}
                        onChange={handleChange}
                        className="bg-transparent text-sm w-full focus:outline-none font-medium appearance-none disabled:opacity-50"
                        disabled={cargando}
                      >
                        <option value="">Sin especificar</option>
                        {SUBCATEGORIAS_PRESUPUESTO_GENERAL.map((sub) => (
                          <option key={sub} value={sub}>
                            {sub}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Moneda y Límite */}
              <div className="bg-card border border-border rounded-xl overflow-hidden divide-y divide-border">
                <div className="p-3 flex items-center gap-3">
                  <div className="p-1.5 bg-orange-500/10 rounded-lg text-orange-600 dark:text-orange-400">
                    <Coins className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <label className="text-[10px] text-muted-foreground block mb-0.5">
                      Moneda <span className="text-destructive">*</span>
                    </label>
                    <select
                      id="moneda"
                      name="moneda"
                      value={formData.moneda}
                      onChange={handleChange}
                      className="bg-transparent text-sm w-full focus:outline-none font-medium appearance-none disabled:opacity-50"
                      disabled={cargando || !!presupuestoEditando}
                    >
                      {currencies.map((currency) => (
                        <option key={currency.id} value={currency.codigoISO}>
                          {currency.simbolo} {currency.nombre}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="p-3 flex items-center gap-3">
                  <div className="p-1.5 bg-green-500/10 rounded-lg text-green-600 dark:text-green-400">
                    <DollarSign className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <label className="text-[10px] text-muted-foreground block mb-0.5">
                      {formData.categoria === CATEGORIA_GENERAL ? 'Monto' : 'Límite'} <span className="text-destructive">*</span>
                    </label>
                    <input
                      type="number"
                      id="limite"
                      name="limite"
                      value={formData.limite}
                      onChange={handleChange}
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      className="bg-transparent text-sm w-full focus:outline-none font-medium disabled:opacity-50"
                      disabled={cargando}
                      required
                      autoFocus
                    />
                  </div>
                </div>
              </div>

        </form>
      </Modal>

      {/* Modal de confirmación de eliminación */}
      <Modal
        isOpen={!!presupuestoAEliminar}
        onClose={() => setPresupuestoAEliminar(null)}
        title="¿Eliminar presupuesto?"
        size="sm"
        footer={
          <ModalFooterActions
            onCancel={() => setPresupuestoAEliminar(null)}
            onConfirm={() => presupuestoAEliminar && handleEliminar(presupuestoAEliminar)}
            cancelText="Cancelar"
            confirmText="Eliminar"
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
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              Esta acción no se puede deshacer. El presupuesto será eliminado permanentemente.
            </p>
          </div>
        </div>
      </Modal>
    </div>
  );
}
