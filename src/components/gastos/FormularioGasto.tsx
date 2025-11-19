/**
 * Formulario para crear y editar gastos
 */

import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@context/AuthContext';
import { useGastos } from '@hooks/useGastos';
import {
  CATEGORIAS_GASTO,
  CATEGORIA_LABELS,
  METODOS_PAGO,
  METODO_PAGO_LABELS,
  MONEDAS,
  MONEDA_LABELS,
  SUBCATEGORIAS,
  type CategoriaGasto,
  type MetodoPago,
  type GastoFormData,
} from '@types';
import { toast } from 'react-hot-toast';
import { scanReceipt, validateImageFormat } from '@services/receipts';
import { obtenerTagsSugeridos, tieneTagsSugeridos } from '@utils/tagsSugeridos';
import { Camera, Upload, CircleDollarSign, Lightbulb, Check } from 'lucide-react';

// Combinaciones predefinidas (atajos rápidos)
interface CombinacionRapida {
  id: string;
  label: string;
  categoria: CategoriaGasto;
  subcategoria: string;
  metodoPago: MetodoPago;
}

const COMBINACIONES_RAPIDAS: CombinacionRapida[] = [
  {
    id: 'polleria-yape',
    label: 'Pollería + Yape',
    categoria: 'alimentacion',
    subcategoria: 'Pollería',
    metodoPago: 'yape',
  },
  {
    id: 'bodega-yape',
    label: 'Bodega + Yape',
    categoria: 'alimentacion',
    subcategoria: 'Bodega',
    metodoPago: 'yape',
  },
  {
    id: 'market-yape',
    label: 'Market + Yape',
    categoria: 'alimentacion',
    subcategoria: 'Market',
    metodoPago: 'yape',
  },
  {
    id: 'taxi-yape',
    label: 'Taxi + Yape',
    categoria: 'transporte',
    subcategoria: 'Taxi',
    metodoPago: 'yape',
  },
];

export default function FormularioGasto() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { usuario } = useAuth();
  const { crear, actualizar, obtenerPorId } = useGastos();

  const esEdicion = Boolean(id);
  const [cargandoGasto, setCargandoGasto] = useState(esEdicion);

  // Estado del formulario
  const [formData, setFormData] = useState<GastoFormData>({
    fecha: new Date().toISOString().split('T')[0],
    hora: new Date().toTimeString().slice(0, 5), // HH:MM actual
    categoria: 'alimentacion',
    subcategoria: '',
    monto: '',
    moneda: 'PEN',
    descripcion: '',
    metodoPago: 'efectivo',
    tags: [],
    recurrente: false,
  });

  const [errores, setErrores] = useState<Partial<Record<keyof GastoFormData, string>>>({});
  const [cargando, setCargando] = useState(false);
  const [tagsInput, setTagsInput] = useState('');
  const [combinacionSeleccionada, setCombinacionSeleccionada] = useState<string>('');

  // Estado para escaneo de recibos
  const [escaneando, setEscaneando] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Tags sugeridos basados en la subcategoría
  const tagsSugeridos = obtenerTagsSugeridos(formData.subcategoria);
  const mostrarTagsSugeridos = tieneTagsSugeridos(formData.subcategoria) && tagsSugeridos.length > 0;

  // Cargar gasto si es edición
  useEffect(() => {
    if (id && esEdicion) {
      const cargarGasto = async () => {
        try {
          setCargandoGasto(true);
          const gasto = await obtenerPorId(id);

          if (!gasto) {
            toast.error('Gasto no encontrado');
            navigate('/gastos');
            return;
          }

          // Convertir gasto a formato del formulario
          const fechaGasto = new Date(gasto.fecha);
          setFormData({
            fecha: fechaGasto.toISOString().split('T')[0],
            hora: fechaGasto.toTimeString().slice(0, 5),
            categoria: gasto.categoria,
            subcategoria: gasto.subcategoria || '',
            monto: gasto.monto.toString(),
            moneda: gasto.moneda,
            descripcion: gasto.descripcion,
            metodoPago: gasto.metodoPago,
            tags: gasto.tags || [],
            recurrente: gasto.recurrente || false,
          });

          setTagsInput(gasto.tags?.join(', ') || '');
        } catch (error) {
          console.error('Error al cargar gasto:', error);
          toast.error('Error al cargar el gasto');
          navigate('/gastos');
        } finally {
          setCargandoGasto(false);
        }
      };

      cargarGasto();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // Manejar cambios en inputs
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;

    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => {
        // Si cambia la categoría, resetear subcategoría
        if (name === 'categoria') {
          return { ...prev, [name]: value as CategoriaGasto, subcategoria: '' };
        }
        return { ...prev, [name]: value };
      });
    }

    // Limpiar error del campo
    if (errores[name as keyof GastoFormData]) {
      setErrores((prev) => ({ ...prev, [name]: undefined }));
    }

    // Limpiar combinación seleccionada al hacer cambios manuales
    if (combinacionSeleccionada) {
      setCombinacionSeleccionada('');
    }
  };

  // Manejar selección de combinación rápida
  const handleCombinacionRapida = (combinacionId: string) => {
    setCombinacionSeleccionada(combinacionId);

    const combinacion = COMBINACIONES_RAPIDAS.find(c => c.id === combinacionId);
    if (combinacion) {
      setFormData(prev => ({
        ...prev,
        categoria: combinacion.categoria,
        subcategoria: combinacion.subcategoria,
        metodoPago: combinacion.metodoPago,
      }));
    }
  };

  // Manejar cambio de tags
  const handleTagsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTagsInput(e.target.value);
  };

  // Agregar tag sugerido al campo de descripción
  const agregarTagSugerido = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      descripcion: prev.descripcion ? `${prev.descripcion}, ${tag}` : tag
    }));
  };

  // Manejar click en botón de escanear
  const handleEscanearClick = () => {
    fileInputRef.current?.click();
  };

  // Manejar selección de imagen para escanear
  const handleImagenSeleccionada = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar formato
    const validacion = validateImageFormat(file);
    if (!validacion.valid) {
      toast.error(validacion.error || 'Imagen inválida');
      return;
    }

    setEscaneando(true);

    try {
      const resultado = await scanReceipt(file);

      if (resultado.success && resultado.data) {
        const data = resultado.data;

        // Autocompletar formulario con los datos extraídos
        setFormData(prev => ({
          ...prev,
          monto: data.amount?.toString() || prev.monto,
          moneda: data.currency || prev.moneda,
          fecha: data.date || prev.fecha,
          hora: data.time || prev.hora,
          metodoPago: data.paymentMethod as MetodoPago || prev.metodoPago,
          descripcion: data.description || prev.descripcion,
        }));

        // Si hay categoría y subcategoría, intentar mapearlas
        if (data.category) {
          const categoriaEncontrada = CATEGORIAS_GASTO.find(
            cat => CATEGORIA_LABELS[cat].toLowerCase() === data.category?.toLowerCase()
          );
          if (categoriaEncontrada) {
            setFormData(prev => ({
              ...prev,
              categoria: categoriaEncontrada,
              subcategoria: data.subcategory || prev.subcategoria,
            }));
          }
        }

        toast.success(`Recibo escaneado (${data.confidence}% confianza)`);
      } else {
        toast.error('No se pudo procesar el recibo');
      }
    } catch (error: any) {
      console.error('Error al escanear recibo:', error);
      toast.error(error.message || 'Error al escanear el recibo');
    } finally {
      setEscaneando(false);
      // Limpiar input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Validar formulario
  const validarFormulario = (): boolean => {
    const nuevosErrores: Partial<Record<keyof GastoFormData, string>> = {};

    // Fecha requerida
    if (!formData.fecha) {
      nuevosErrores.fecha = 'La fecha es requerida';
    }

    // Categoría requerida
    if (!formData.categoria) {
      nuevosErrores.categoria = 'La categoría es requerida';
    }

    // Monto requerido y válido
    if (!formData.monto) {
      nuevosErrores.monto = 'El monto es requerido';
    } else {
      const montoNum = parseFloat(formData.monto);
      if (isNaN(montoNum) || montoNum <= 0) {
        nuevosErrores.monto = 'El monto debe ser mayor a 0';
      }
    }

    // Moneda requerida
    if (!formData.moneda) {
      nuevosErrores.moneda = 'La moneda es requerida';
    }

    // Descripción requerida
    if (!formData.descripcion.trim()) {
      nuevosErrores.descripcion = 'La descripción es requerida';
    } else if (formData.descripcion.trim().length < 3) {
      nuevosErrores.descripcion = 'La descripción debe tener al menos 3 caracteres';
    }

    // Método de pago requerido
    if (!formData.metodoPago) {
      nuevosErrores.metodoPago = 'El método de pago es requerido';
    }

    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  // Manejar envío del formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validarFormulario()) {
      toast.error('Por favor corrige los errores en el formulario');
      return;
    }

    if (!usuario) {
      toast.error('Debes iniciar sesión');
      return;
    }

    setCargando(true);

    try {
      // Procesar tags
      const tags = tagsInput
        .split(',')
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0);

      // Combinar fecha y hora
      const fechaHora = new Date(`${formData.fecha}T${formData.hora}:00`);

      // Preparar datos del gasto
      // IMPORTANTE: No incluir campos undefined - Firestore los rechaza
      const gastoData: any = {
        userId: usuario.id,
        fecha: fechaHora,
        categoria: formData.categoria,
        monto: parseFloat(formData.monto),
        moneda: formData.moneda,
        descripcion: formData.descripcion.trim(),
        metodoPago: formData.metodoPago,
        recurrente: formData.recurrente,
      };

      // Solo agregar subcategoria si existe
      if (formData.subcategoria) {
        gastoData.subcategoria = formData.subcategoria;
      }

      // Solo agregar tags si hay elementos
      if (tags.length > 0) {
        gastoData.tags = tags;
      }

      if (esEdicion && id) {
        // Actualizar gasto existente
        await actualizar(id, gastoData);
        toast.success('Gasto actualizado exitosamente');
      } else {
        // Crear nuevo gasto
        await crear(gastoData);
        toast.success('Gasto creado exitosamente');
      }

      navigate('/gastos');
    } catch (error) {
      console.error('Error al guardar gasto:', error);
      toast.error(
        error instanceof Error ? error.message : 'Error al guardar el gasto'
      );
    } finally {
      setCargando(false);
    }
  };

  // Mostrar pantalla de carga mientras se carga el gasto
  if (cargandoGasto) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando gasto...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-card border border-border rounded-lg shadow-sm p-4 md:p-6">
        <h2 className="text-2xl font-bold text-foreground mb-4 md:mb-6">
          {esEdicion ? 'Editar Gasto' : 'Nuevo Gasto'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* ========== VERSIÓN MOBILE/TABLET (md:hidden) ========== */}
          <div className="md:hidden space-y-4">
            {/* 1. Atajos Rápidos */}
            {!esEdicion && (
              <div className="bg-muted/30 border border-border rounded-lg p-3">
                <label className="block text-sm font-medium text-foreground mb-2">
                  Atajos Rápidos
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {COMBINACIONES_RAPIDAS.map((combinacion) => (
                    <button
                      key={combinacion.id}
                      type="button"
                      onClick={() => handleCombinacionRapida(combinacion.id)}
                      className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        combinacionSeleccionada === combinacion.id
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-background hover:bg-accent text-foreground border border-border'
                      }`}
                    >
                      {combinacion.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 2. Escanear Boleta */}
            {!esEdicion && (
              <div className="bg-accent/30 border border-border rounded-lg p-3">
                <label className="block text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                  <Camera className="h-4 w-4" />
                  <span>Escanear Boleta</span>
                </label>
                <p className="text-xs text-muted-foreground mb-3">
                  Sube tu recibo y autocompletamos el formulario
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImagenSeleccionada}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={handleEscanearClick}
                  disabled={escaneando}
                  className="w-full px-4 py-3 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
                >
                  {escaneando ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary-foreground border-t-transparent"></div>
                      <span>Escaneando...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4" />
                      <span>Yape + Plin + Trans.</span>
                    </>
                  )}
                </button>
              </div>
            )}

            {/* 3. Campo Monto - SOLO MONTO (sin moneda) */}
            <div className="bg-primary/5 border-2 border-primary/20 rounded-lg p-4">
              <label
                htmlFor="monto-mobile"
                className="block text-base font-bold text-foreground mb-3 text-center flex items-center justify-center gap-2"
              >
                <CircleDollarSign className="h-5 w-5" />
                <span>¿Cuánto gastaste? <span className="text-destructive">*</span></span>
              </label>
              <input
                type="number"
                id="monto-mobile"
                name="monto"
                value={formData.monto}
                onChange={handleChange}
                step="0.01"
                min="0"
                placeholder="0.00"
                className={`w-full px-6 py-4 text-3xl font-bold rounded-lg border-2 ${
                  errores.monto
                    ? 'border-destructive focus:ring-destructive'
                    : 'border-primary/30 focus:ring-primary'
                } bg-background text-foreground focus:outline-none focus:ring-2 transition-colors text-center`}
                disabled={cargando}
                autoFocus={!esEdicion}
              />
              {errores.monto && (
                <p className="mt-2 text-sm text-destructive text-center font-medium">{errores.monto}</p>
              )}
            </div>

            {/* 4. Sugerencias de Tags */}
            {mostrarTagsSugeridos && (
              <div className="bg-muted/30 border border-border rounded-lg p-3">
                <p className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
                  <Lightbulb className="h-4 w-4" />
                  <span>Sugerencias para {formData.subcategoria}</span>
                </p>
                <div className="flex flex-wrap gap-2">
                  {tagsSugeridos.map((tag, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => agregarTagSugerido(tag)}
                      className="px-3 py-1.5 text-xs font-medium rounded-full bg-background hover:bg-primary hover:text-primary-foreground border border-border transition-colors active:scale-95"
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 5. Botones de Acción */}
            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={cargando}
                className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm shadow-sm flex items-center justify-center gap-2"
              >
                {cargando ? (
                  esEdicion ? 'Actualizando...' : 'Guardando...'
                ) : (
                  <>
                    <Check className="h-4 w-4" />
                    <span>{esEdicion ? 'Actualizar' : 'Guardar'}</span>
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => navigate('/gastos')}
                disabled={cargando}
                className="flex-1 bg-secondary hover:bg-secondary/90 text-secondary-foreground font-semibold py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm shadow-sm"
              >
                Cancelar
              </button>
            </div>

            {/* 6. Resto de campos */}
            <div className="pt-4 border-t border-border space-y-4">
              {/* Fecha y Hora */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="fecha-mobile" className="block text-sm font-medium text-foreground mb-1">
                    Fecha <span className="text-destructive">*</span>
                  </label>
                  <input
                    type="date"
                    id="fecha-mobile"
                    name="fecha"
                    value={formData.fecha}
                    onChange={handleChange}
                    max={new Date().toISOString().split('T')[0]}
                    className={`w-full px-3 py-2 rounded-md border text-sm ${
                      errores.fecha ? 'border-destructive focus:ring-destructive' : 'border-input focus:ring-primary'
                    } bg-background text-foreground focus:outline-none focus:ring-2 transition-colors`}
                    disabled={cargando}
                  />
                  {errores.fecha && <p className="mt-1 text-xs text-destructive">{errores.fecha}</p>}
                </div>

                <div>
                  <label htmlFor="hora-mobile" className="block text-sm font-medium text-foreground mb-1">
                    Hora <span className="text-destructive">*</span>
                  </label>
                  <input
                    type="time"
                    id="hora-mobile"
                    name="hora"
                    value={formData.hora}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 rounded-md border text-sm ${
                      errores.hora ? 'border-destructive focus:ring-destructive' : 'border-input focus:ring-primary'
                    } bg-background text-foreground focus:outline-none focus:ring-2 transition-colors`}
                    disabled={cargando}
                  />
                  {errores.hora && <p className="mt-1 text-xs text-destructive">{errores.hora}</p>}
                </div>
              </div>

              {/* Categoría y Subcategoría */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="categoria-mobile" className="block text-sm font-medium text-foreground mb-1">
                    Categoría <span className="text-destructive">*</span>
                  </label>
                  <select
                    id="categoria-mobile"
                    name="categoria"
                    value={formData.categoria}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 rounded-md border text-sm ${
                      errores.categoria ? 'border-destructive focus:ring-destructive' : 'border-input focus:ring-primary'
                    } bg-background text-foreground focus:outline-none focus:ring-2 transition-colors`}
                    disabled={cargando}
                  >
                    {CATEGORIAS_GASTO.map((cat) => (
                      <option key={cat} value={cat}>
                        {CATEGORIA_LABELS[cat]}
                      </option>
                    ))}
                  </select>
                  {errores.categoria && <p className="mt-1 text-xs text-destructive">{errores.categoria}</p>}
                </div>

                <div>
                  <label htmlFor="subcategoria-mobile" className="block text-sm font-medium text-foreground mb-1">
                    Subcategoría
                  </label>
                  <select
                    id="subcategoria-mobile"
                    name="subcategoria"
                    value={formData.subcategoria}
                    onChange={handleChange}
                    className="w-full px-3 py-2 rounded-md border border-input focus:ring-primary bg-background text-foreground focus:outline-none focus:ring-2 transition-colors text-sm"
                    disabled={cargando}
                  >
                    <option value="">Sin subcategoría</option>
                    {SUBCATEGORIAS[formData.categoria].map((sub) => (
                      <option key={sub} value={sub}>
                        {sub}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Moneda */}
              <div>
                <label htmlFor="moneda-mobile" className="block text-sm font-medium text-foreground mb-1">
                  Moneda <span className="text-destructive">*</span>
                </label>
                <select
                  id="moneda-mobile"
                  name="moneda"
                  value={formData.moneda}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 rounded-md border text-sm ${
                    errores.moneda ? 'border-destructive focus:ring-destructive' : 'border-input focus:ring-primary'
                  } bg-background text-foreground focus:outline-none focus:ring-2 transition-colors`}
                  disabled={cargando}
                >
                  {MONEDAS.map((moneda) => (
                    <option key={moneda} value={moneda}>
                      {MONEDA_LABELS[moneda]}
                    </option>
                  ))}
                </select>
                {errores.moneda && <p className="mt-1 text-xs text-destructive">{errores.moneda}</p>}
              </div>

              {/* Método de Pago */}
              <div>
                <label htmlFor="metodoPago-mobile" className="block text-sm font-medium text-foreground mb-1">
                  Método de Pago <span className="text-destructive">*</span>
                </label>
                <select
                  id="metodoPago-mobile"
                  name="metodoPago"
                  value={formData.metodoPago}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 rounded-md border text-sm ${
                    errores.metodoPago ? 'border-destructive focus:ring-destructive' : 'border-input focus:ring-primary'
                  } bg-background text-foreground focus:outline-none focus:ring-2 transition-colors`}
                  disabled={cargando}
                >
                  {METODOS_PAGO.map((metodo) => (
                    <option key={metodo} value={metodo}>
                      {METODO_PAGO_LABELS[metodo]}
                    </option>
                  ))}
                </select>
                {errores.metodoPago && <p className="mt-1 text-xs text-destructive">{errores.metodoPago}</p>}
              </div>

              {/* Descripción */}
              <div>
                <label htmlFor="descripcion-mobile" className="block text-sm font-medium text-foreground mb-1">
                  Descripción <span className="text-destructive">*</span>
                </label>
                <textarea
                  id="descripcion-mobile"
                  name="descripcion"
                  value={formData.descripcion}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Ej: Almuerzo en restaurante"
                  className={`w-full px-3 py-2 rounded-md border text-sm ${
                    errores.descripcion ? 'border-destructive focus:ring-destructive' : 'border-input focus:ring-primary'
                  } bg-background text-foreground focus:outline-none focus:ring-2 transition-colors resize-none`}
                  disabled={cargando}
                />
                {errores.descripcion && <p className="mt-1 text-xs text-destructive">{errores.descripcion}</p>}
              </div>

              {/* Tags (opcional) */}
              <div>
                <label htmlFor="tags-mobile" className="block text-sm font-medium text-foreground mb-1">
                  Etiquetas (opcional)
                </label>
                <input
                  type="text"
                  id="tags-mobile"
                  name="tags"
                  value={tagsInput}
                  onChange={handleTagsChange}
                  placeholder="Ej: trabajo, urgente (separadas por comas)"
                  className="w-full px-3 py-2 rounded-md border border-input focus:ring-primary bg-background text-foreground focus:outline-none focus:ring-2 transition-colors text-sm"
                  disabled={cargando}
                />
                <p className="mt-1 text-xs text-muted-foreground">
                  Separa las etiquetas con comas
                </p>
              </div>

              {/* Recurrente (opcional) */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="recurrente-mobile"
                  name="recurrente"
                  checked={formData.recurrente}
                  onChange={handleChange}
                  className="h-4 w-4 rounded border-input text-primary focus:ring-primary focus:ring-offset-0"
                  disabled={cargando}
                />
                <label htmlFor="recurrente-mobile" className="text-sm font-medium text-foreground cursor-pointer">
                  Gasto recurrente
                </label>
              </div>
            </div>
          </div>

          {/* ========== VERSIÓN DESKTOP (hidden md:block) - FORMULARIO ORIGINAL ========== */}
          <div className="hidden md:block space-y-4">
            {/* 1. Atajos Rápidos */}
            {!esEdicion && (
              <div className="bg-muted/30 border border-border rounded-lg p-4">
                <label className="block text-sm font-medium text-foreground mb-3">
                  Atajos Rápidos
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {COMBINACIONES_RAPIDAS.map((combinacion) => (
                    <button
                      key={combinacion.id}
                      type="button"
                      onClick={() => handleCombinacionRapida(combinacion.id)}
                      className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                        combinacionSeleccionada === combinacion.id
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-background hover:bg-accent text-foreground border border-border'
                      }`}
                    >
                      {combinacion.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 2. Escanear Boleta (Desktop) */}
            {!esEdicion && (
              <div className="bg-accent/30 border border-border rounded-lg p-4">
                <label className="block text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                  <Camera className="h-4 w-4" />
                  <span>Escanear Recibo</span>
                </label>
                <p className="text-sm text-muted-foreground mb-3">
                  Sube tu recibo y autocompletamos el formulario
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImagenSeleccionada}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={handleEscanearClick}
                  disabled={escaneando}
                  className="w-full px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {escaneando ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary-foreground border-t-transparent"></div>
                      <span>Escaneando...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4" />
                      <span>Subir Boleta (Yape + Plin + Trans.)</span>
                    </>
                  )}
                </button>
              </div>
            )}

            {/* 3. Fecha y Hora */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="fecha" className="block text-sm font-medium text-foreground mb-1">
                  Fecha <span className="text-destructive">*</span>
                </label>
                <input
                  type="date"
                  id="fecha"
                  name="fecha"
                  value={formData.fecha}
                  onChange={handleChange}
                  max={new Date().toISOString().split('T')[0]}
                  className={`w-full px-4 py-2 rounded-md border ${
                    errores.fecha ? 'border-destructive focus:ring-destructive' : 'border-input focus:ring-primary'
                  } bg-background text-foreground focus:outline-none focus:ring-2 transition-colors`}
                  disabled={cargando}
                />
                {errores.fecha && <p className="mt-1 text-sm text-destructive">{errores.fecha}</p>}
              </div>

              <div>
                <label htmlFor="hora" className="block text-sm font-medium text-foreground mb-1">
                  Hora <span className="text-destructive">*</span>
                </label>
                <input
                  type="time"
                  id="hora"
                  name="hora"
                  value={formData.hora}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 rounded-md border ${
                    errores.hora ? 'border-destructive focus:ring-destructive' : 'border-input focus:ring-primary'
                  } bg-background text-foreground focus:outline-none focus:ring-2 transition-colors`}
                  disabled={cargando}
                />
                {errores.hora && <p className="mt-1 text-sm text-destructive">{errores.hora}</p>}
              </div>
            </div>

            {/* 4. Categoría, Subcategoría y Moneda */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label htmlFor="categoria" className="block text-sm font-medium text-foreground mb-1">
                  Categoría <span className="text-destructive">*</span>
                </label>
                <select
                  id="categoria"
                  name="categoria"
                  value={formData.categoria}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 rounded-md border ${
                    errores.categoria ? 'border-destructive focus:ring-destructive' : 'border-input focus:ring-primary'
                  } bg-background text-foreground focus:outline-none focus:ring-2 transition-colors`}
                  disabled={cargando}
                >
                  {CATEGORIAS_GASTO.map((cat) => (
                    <option key={cat} value={cat}>
                      {CATEGORIA_LABELS[cat]}
                    </option>
                  ))}
                </select>
                {errores.categoria && <p className="mt-1 text-sm text-destructive">{errores.categoria}</p>}
              </div>

              <div>
                <label htmlFor="subcategoria" className="block text-sm font-medium text-foreground mb-1">
                  Subcategoría
                </label>
                <select
                  id="subcategoria"
                  name="subcategoria"
                  value={formData.subcategoria}
                  onChange={handleChange}
                  className="w-full px-4 py-2 rounded-md border border-input focus:ring-primary bg-background text-foreground focus:outline-none focus:ring-2 transition-colors"
                  disabled={cargando}
                >
                  <option value="">Sin subcategoría</option>
                  {SUBCATEGORIAS[formData.categoria].map((sub) => (
                    <option key={sub} value={sub}>
                      {sub}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="moneda" className="block text-sm font-medium text-foreground mb-1">
                  Moneda <span className="text-destructive">*</span>
                </label>
                <select
                  id="moneda"
                  name="moneda"
                  value={formData.moneda}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 rounded-md border ${
                    errores.moneda ? 'border-destructive focus:ring-destructive' : 'border-input focus:ring-primary'
                  } bg-background text-foreground focus:outline-none focus:ring-2 transition-colors`}
                  disabled={cargando}
                >
                  {MONEDAS.map((moneda) => (
                    <option key={moneda} value={moneda}>
                      {MONEDA_LABELS[moneda]}
                    </option>
                  ))}
                </select>
                {errores.moneda && <p className="mt-1 text-sm text-destructive">{errores.moneda}</p>}
              </div>
            </div>

            {/* 5. Monto y Método de Pago */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="monto" className="block text-sm font-medium text-foreground mb-1">
                  Monto <span className="text-destructive">*</span>
                </label>
                <input
                  type="number"
                  id="monto"
                  name="monto"
                  value={formData.monto}
                  onChange={handleChange}
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  className={`w-full px-4 py-2 rounded-md border ${
                    errores.monto ? 'border-destructive focus:ring-destructive' : 'border-input focus:ring-primary'
                  } bg-background text-foreground focus:outline-none focus:ring-2 transition-colors`}
                  disabled={cargando}
                  autoFocus={!esEdicion}
                />
                {errores.monto && <p className="mt-1 text-sm text-destructive">{errores.monto}</p>}
              </div>

              <div>
                <label htmlFor="metodoPago" className="block text-sm font-medium text-foreground mb-1">
                  Método de Pago <span className="text-destructive">*</span>
                </label>
                <select
                  id="metodoPago"
                  name="metodoPago"
                  value={formData.metodoPago}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 rounded-md border ${
                    errores.metodoPago ? 'border-destructive focus:ring-destructive' : 'border-input focus:ring-primary'
                  } bg-background text-foreground focus:outline-none focus:ring-2 transition-colors`}
                  disabled={cargando}
                >
                  {METODOS_PAGO.map((metodo) => (
                    <option key={metodo} value={metodo}>
                      {METODO_PAGO_LABELS[metodo]}
                    </option>
                  ))}
                </select>
                {errores.metodoPago && <p className="mt-1 text-sm text-destructive">{errores.metodoPago}</p>}
              </div>
            </div>

            {/* 6. Descripción con tags sugeridos debajo */}
            <div>
              <label htmlFor="descripcion" className="block text-sm font-medium text-foreground mb-1">
                Descripción <span className="text-destructive">*</span>
              </label>
              <textarea
                id="descripcion"
                name="descripcion"
                value={formData.descripcion}
                onChange={handleChange}
                rows={3}
                placeholder="Ej: Almuerzo en restaurante"
                className={`w-full px-4 py-2 rounded-md border ${
                  errores.descripcion ? 'border-destructive focus:ring-destructive' : 'border-input focus:ring-primary'
                } bg-background text-foreground focus:outline-none focus:ring-2 transition-colors resize-none`}
                disabled={cargando}
              />
              {errores.descripcion && <p className="mt-1 text-sm text-destructive">{errores.descripcion}</p>}

              {/* Tags sugeridos */}
              {mostrarTagsSugeridos && (
                <div className="mt-3 bg-muted/30 border border-border rounded-lg p-3">
                  <p className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                    <Lightbulb className="h-4 w-4" />
                    <span>Sugerencias para {formData.subcategoria}</span>
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {tagsSugeridos.map((tag, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => agregarTagSugerido(tag)}
                        className="px-3 py-1 text-xs font-medium rounded-full bg-background hover:bg-primary hover:text-primary-foreground border border-border transition-colors"
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* 7. Tags opcionales */}
            <div>
              <label htmlFor="tags" className="block text-sm font-medium text-foreground mb-1">
                Etiquetas (opcional)
              </label>
              <input
                type="text"
                id="tags"
                name="tags"
                value={tagsInput}
                onChange={handleTagsChange}
                placeholder="Ej: trabajo, urgente (separadas por comas)"
                className="w-full px-4 py-2 rounded-md border border-input focus:ring-primary bg-background text-foreground focus:outline-none focus:ring-2 transition-colors"
                disabled={cargando}
              />
              <p className="mt-1 text-sm text-muted-foreground">
                Separa las etiquetas con comas
              </p>
            </div>

            {/* 8. Recurrente */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="recurrente"
                name="recurrente"
                checked={formData.recurrente}
                onChange={handleChange}
                className="h-4 w-4 rounded border-input text-primary focus:ring-primary focus:ring-offset-0"
                disabled={cargando}
              />
              <label htmlFor="recurrente" className="text-sm font-medium text-foreground cursor-pointer">
                Gasto recurrente
              </label>
            </div>

            {/* 9. Botones al final (Desktop) */}
            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={cargando}
                className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-2 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {cargando
                  ? esEdicion
                    ? 'Actualizando...'
                    : 'Guardando...'
                  : esEdicion
                  ? 'Actualizar Gasto'
                  : 'Guardar Gasto'}
              </button>
              <button
                type="button"
                onClick={() => navigate('/gastos')}
                disabled={cargando}
                className="px-6 py-2 bg-secondary hover:bg-secondary/90 text-secondary-foreground font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancelar
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
