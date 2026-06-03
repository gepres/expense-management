/**
 * Formulario para crear y editar gastos
 */

import { useState, useEffect, useRef, useMemo } from 'react';
import { trackEvent } from '@services/analyticsEvents';
import { useNavigate, useParams, Link, useLocation } from 'react-router-dom';
import { useAuth } from '@context/AuthContext';
import { useConfig } from '@context/ConfigContext';
import { usePreferences } from '@context/PreferencesContext';
import { useAccountsContext } from '@context/AccountsContext';
import { useGastos } from '@hooks/useGastos';
import { type GastoFormData, type CategoriaGasto, type MetodoPago, type Moneda } from '@app-types';
import { toast } from 'react-hot-toast';
import { scanReceipt, validateImageFormat } from '@services/receipts';
import { useVoiceInput } from '@hooks/useVoiceInput';
import { VoiceService } from '@services/voice';
import CustomLoader from '@components/common/CustomLoader';
import SelectorCuenta from '@components/cuentas/SelectorCuenta';
import { Image, Upload, Lightbulb, Check, Plus, Mic, MicOff, ChevronDown, ChevronUp, Calendar, Clock, CreditCard, Repeat, AlignLeft, CircleDollarSign, Zap, Receipt, Tag, Coins, FileText, Hash, RefreshCw, Building2, Calculator, Percent, Crown, Wallet } from 'lucide-react';
// import Button from '../common/Button';
import LoadingSpinner from '../common/LoadingSpinner';
import { obtenerFechaLocalISO } from '@utils/formatters';

// Memoria de la última cuenta usada por método de pago, persistida por usuario.
function lastAccountStorageKey(userId: string, isCash: boolean): string {
  return isCash
    ? `gasto:lastCashSourceAccount:${userId}`
    : `gasto:lastAccount:${userId}`;
}

export default function FormularioGasto() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams<{ id: string }>();
  const { usuario, isPro } = useAuth();
  const { crear, actualizar, obtenerPorId } = useGastos();
  const { activeAccounts, defaultAccount } = useAccountsContext();
  const {
    categories,
    paymentMethods,
    currencies,
    shortcuts,
    getSubcategories
  } = useConfig();
  const { preferences } = usePreferences();

  const esEdicion = Boolean(id);
  const [cargandoGasto, setCargandoGasto] = useState(esEdicion);

  // Estado del formulario
  const [formData, setFormData] = useState<GastoFormData>({
    fecha: obtenerFechaLocalISO(),
    hora: new Date().toTimeString().slice(0, 5), // HH:MM actual
    accountId: '',
    categoria: 'alimentacion',
    subcategoria: '',
    monto: '',
    moneda: 'PEN',
    descripcion: '',
    metodoPago: 'efectivo',
    tags: [],
    recurrente: false,
    // Nuevos campos
    voucherType: 'boleta',
    voucherNumber: '',
    ruc: '',
    igv: '',
    subtotal: '',
    reimbursementStatus: 'pending',
  });

  // Pre-selección inteligente de la cuenta:
  //   1. Si el usuario eligió antes una cuenta para este metodoPago, usarla.
  //   2. Si no, usar la cuenta default.
  //   3. Si no hay default, la primera activa.
  // Solo aplica cuando NO estamos editando un gasto existente.
  useEffect(() => {
    if (esEdicion || !usuario) return;
    if (formData.accountId) return; // ya seleccionada manualmente
    if (activeAccounts.length === 0) return;

    const isCash = formData.metodoPago === 'efectivo';
    const memoryKey = lastAccountStorageKey(usuario.id, isCash);
    const lastUsed = localStorage.getItem(memoryKey);

    let candidateId: string | undefined;
    if (lastUsed && activeAccounts.some((a) => a.id === lastUsed)) {
      candidateId = lastUsed;
    } else if (defaultAccount) {
      candidateId = defaultAccount.id;
    } else {
      candidateId = activeAccounts[0]?.id;
    }

    if (candidateId) {
      setFormData((prev) => ({
        ...prev,
        accountId: candidateId,
        moneda: activeAccounts.find((a) => a.id === candidateId)?.currency as Moneda ?? prev.moneda,
      }));
    }
  }, [esEdicion, usuario, activeAccounts, defaultAccount, formData.metodoPago, formData.accountId]);

  // Cuando el usuario cambia el método de pago entre efectivo/no-efectivo,
  // re-evaluamos la cuenta sugerida (puede tener una preferida distinta).
  const previousMetodoPago = useRef(formData.metodoPago);
  useEffect(() => {
    if (esEdicion || !usuario) return;
    if (formData.metodoPago === previousMetodoPago.current) return;

    const wasCash = previousMetodoPago.current === 'efectivo';
    const isCashNow = formData.metodoPago === 'efectivo';
    previousMetodoPago.current = formData.metodoPago;

    if (wasCash !== isCashNow) {
      // Cambió la "categoría" de método (efectivo vs no-efectivo) → re-sugerir cuenta
      const memoryKey = lastAccountStorageKey(usuario.id, isCashNow);
      const lastUsed = localStorage.getItem(memoryKey);
      if (lastUsed && activeAccounts.some((a) => a.id === lastUsed)) {
        setFormData((prev) => ({
          ...prev,
          accountId: lastUsed,
          moneda: activeAccounts.find((a) => a.id === lastUsed)?.currency as Moneda ?? prev.moneda,
        }));
      }
    }
  }, [formData.metodoPago, esEdicion, usuario, activeAccounts]);

  const cuentaSeleccionada = useMemo(
    () => activeAccounts.find((a) => a.id === formData.accountId),
    [activeAccounts, formData.accountId],
  );

  const [errores, setErrores] = useState<Partial<Record<keyof GastoFormData, string>>>({});
  const [cargando, setCargando] = useState(false);
  const [tagsInput, setTagsInput] = useState('');
  const [combinacionSeleccionada, setCombinacionSeleccionada] = useState<string>('');

  // Estado para escaneo de recibos
  const [escaneando, setEscaneando] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Estado para entrada de voz
  const { isListening, audioBlob, startListening, stopListening, resetRecording, isSupported, error: voiceError } = useVoiceInput();
  const [processingVoice, setProcessingVoice] = useState(false);
  // Origen IA del gasto (Fase 3 learning_log): se setea al autocompletar
  // por voz/imagen y viaja al backend al guardar para alimentar la
  // bitácora (corrección si el usuario cambió la categoría sugerida).
  const [iaOrigen, setIaOrigen] = useState<{
    origenIA: 'voz' | 'imagen';
    categoriaSugerida: string;
    descripcionOrigen: string;
  } | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  // Obtener sugerencias desde ConfigContext
  const currentCategory = categories.find(cat => cat.id === formData.categoria);
  // La subcategoría se guarda por nombre en el formulario
  const currentSubcategory = currentCategory?.subcategorias?.find(sub => sub.nombre === formData.subcategoria || sub.id === formData.subcategoria);
  const subcategorySuggestions = currentSubcategory?.suggestions_ideas || [];
  const subcategoryName = currentSubcategory?.nombre || formData.subcategoria;

  // Funnel de creación (diagnóstico): vista del form de nuevo gasto.
  // El abandono se deriva en el panel como opened - saved.
  useEffect(() => {
    if (!esEdicion) void trackEvent('expense.form.opened');
  }, [esEdicion]);

  // Cargar gasto si es edición o si viene data por location.state
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
          const fechaGasto = gasto.fecha instanceof Date ? gasto.fecha : new Date(gasto.fecha);

          // Validar que la fecha sea válida
          if (isNaN(fechaGasto.getTime())) {
            toast.error('Fecha del gasto inválida');
            navigate('/gastos');
            return;
          }

          setFormData({
            fecha: obtenerFechaLocalISO(fechaGasto),
            hora: fechaGasto.toTimeString().slice(0, 5),
            accountId: gasto.accountId || '',
            categoria: gasto.categoria,
            subcategoria: gasto.subcategoria || '',
            monto: gasto.monto.toString(),
            moneda: gasto.moneda,
            descripcion: gasto.descripcion,
            metodoPago: gasto.metodoPago,
            tags: gasto.tags || [],
            recurrente: gasto.recurrente || false,
            shoppingListId: gasto.shoppingListId,
            // Nuevos campos
            voucherType: gasto.voucherType || 'boleta',
            voucherNumber: gasto.voucherNumber || '',
            ruc: gasto.ruc || '',
            igv: gasto.igv?.toString() || '',
            subtotal: gasto.subtotal?.toString() || '',
            reimbursementStatus: gasto.reimbursementStatus || 'pending',
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
    } else if (location.state?.initialData) {
      // Pre-fill from location state (e.g. from Shopping List)
      const initialData = location.state.initialData;
      setFormData(prev => ({
        ...prev,
        ...initialData
      }));
      if (initialData.tags) {
        setTagsInput(initialData.tags.join(', '));
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, location.state]);

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

    // Auto-calculo de IGV y Subtotal si cambia el monto y es factura
    if (name === 'monto' && formData.voucherType === 'factura') {
      const amount = parseFloat(value);
      if (!isNaN(amount)) {
        const subtotal = (amount / 1.18).toFixed(2);
        const igv = (amount - parseFloat(subtotal)).toFixed(2);
        setFormData(prev => ({ ...prev, subtotal, igv }));
      } else {
        setFormData(prev => ({ ...prev, subtotal: '', igv: '' }));
      }
    }
  };

  // Manejar cambio de tipo de comprobante
  const handleVoucherTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    const type = value as any;
    
    setFormData(prev => {
      const newData = { ...prev, voucherType: type };
      
      // Si cambia a factura y hay monto, recalcular
      if (type === 'factura' && prev.monto) {
        const amount = parseFloat(prev.monto);
        if (!isNaN(amount)) {
          const subtotal = (amount / 1.18).toFixed(2);
          const igv = (amount - parseFloat(subtotal)).toFixed(2);
          newData.subtotal = subtotal;
          newData.igv = igv;
        }
      }
      return newData;
    });

    // Limpiar error del campo
    if (errores[name as keyof GastoFormData]) {
      setErrores((prev) => ({ ...prev, [name]: undefined }));
    }

    // Limpiar combinación seleccionada al hacer cambios manuales
    if (combinacionSeleccionada) {
      setCombinacionSeleccionada('');
    }
  };

  // Manejar selección de atajo rápido
  const handleShortcutSelect = (shortcutId: string) => {
    setCombinacionSeleccionada(shortcutId);

    const shortcut = shortcuts.find(s => s.id === shortcutId);
    if (shortcut) {
      setFormData(prev => ({
        ...prev,
        ...(shortcut.category && { categoria: shortcut.category as CategoriaGasto }),
        ...(shortcut.subcategory && { subcategoria: shortcut.subcategory }),
        ...(shortcut.paymentMethod && { metodoPago: shortcut.paymentMethod as MetodoPago }),
        ...(shortcut.amount && { monto: shortcut.amount.toString() }),
        ...(shortcut.currency && { moneda: shortcut.currency as Moneda }),
        ...(shortcut.description && { descripcion: shortcut.description }),
        ...(shortcut.tags && { tags: shortcut.tags }),
        ...(shortcut.isRecurring !== undefined && { recurrente: shortcut.isRecurring }),
      }));

      // Actualizar tagsInput si hay tags
      if (shortcut.tags && shortcut.tags.length > 0) {
        setTagsInput(shortcut.tags.join(', '));
      }
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

        // Origen IA (learning_log): `categoriaSugerida` = la categoría que
        // el clasificador devolvió; `descripcionOrigen` = el mismo texto
        // que el backend clasificó (descripción + comercio).
        setIaOrigen({
          origenIA: 'imagen',
          categoriaSugerida: data.category ?? '',
          descripcionOrigen: `${data.description ?? ''} ${
            data.merchant ?? ''
          }`.trim(),
        });

        // Autocompletar formulario con los datos extraídos
        setFormData(prev => ({
          ...prev,
          monto: data.amount?.toString() || prev.monto,
          moneda: data.currency || prev.moneda,
          fecha: data.date || prev.fecha,
          // El backend devuelve la hora en HH:mm:ss; el form (y el input
          // type=time) trabaja en HH:MM → normalizar o el new Date() de
          // handleSubmit queda "Invalid Date".
          hora: data.time ? data.time.slice(0, 5) : prev.hora,
          metodoPago: data.paymentMethod as MetodoPago || prev.metodoPago,
          descripcion: data.description || prev.descripcion,
        }));

        // Si hay categoría y subcategoría, intentar mapearlas
        if (data.category) {
          const categoriaEncontrada = categories.find(
            cat => cat.nombre.toLowerCase() === data.category?.toLowerCase()
          );
          if (categoriaEncontrada) {
            setFormData(prev => ({
              ...prev,
              categoria: categoriaEncontrada.id as CategoriaGasto,
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

  // Procesar el audio grabado cuando termina la grabación
  useEffect(() => {
    if (audioBlob && !isListening) {
      handleVoiceAudio(audioBlob);
    }
  }, [audioBlob, isListening]);

  // Mostrar error de voz si existe
  useEffect(() => {
    if (voiceError) {
      toast.error(voiceError);
    }
  }, [voiceError]);

  // Handler para procesar el audio grabado (transcripción server-side)
  const handleVoiceAudio = async (blob: Blob) => {
    setProcessingVoice(true);
    try {
      const expenseData = await VoiceService.processAudioExpense(blob);

      console.log('🎤 Datos recibidos de voz:', expenseData);

      // Origen IA (learning_log): la categoría sugerida es la que devolvió
      // la clasificación; si el usuario la cambia antes de guardar, el
      // backend lo registra como corrección.
      const origenInfo = {
        origenIA: 'voz' as const,
        categoriaSugerida: expenseData.categoria,
        descripcionOrigen: expenseData.descripcion,
      };
      setIaOrigen(origenInfo);

      // Autocompletar formulario si la confianza es alta
      if (expenseData.confidence > 0.6) {
        const today = new Date();
        const formattedDate = obtenerFechaLocalISO(today);
        const formattedTime = today.toTimeString().slice(0, 5);

        // Normalizar subcategoría (capitalizar primera letra)
        let normalizedSubcategory = expenseData.subcategoria || '';
        if (normalizedSubcategory) {
          normalizedSubcategory = normalizedSubcategory.charAt(0).toUpperCase() + 
                                  normalizedSubcategory.slice(1).toLowerCase();
        }

        // Validar y corregir fecha si es necesaria
        let validDate = expenseData.fecha || formattedDate;
        const dateObj = new Date(validDate);
        const currentYear = today.getFullYear();
        
        // Si la fecha es del año pasado, usar fecha actual
        if (dateObj.getFullYear() < currentYear) {
          console.warn('⚠️ Fecha del año pasado detectada, usando fecha actual');
          validDate = formattedDate;
        }

        const newFormData = {
          ...formData,
          monto: expenseData.monto.toString(),
          moneda: expenseData.moneda,
          categoria: expenseData.categoria as CategoriaGasto,
          subcategoria: normalizedSubcategory,
          descripcion: expenseData.descripcion,
          metodoPago: (expenseData.metodoPago as MetodoPago) || formData.metodoPago,
          fecha: validDate,
          hora: formData.hora || formattedTime,
        };

        console.log('📝 Nuevo FormData después de voz:', newFormData);

        setFormData(newFormData);
        
        const confidencePercent = Math.round(expenseData.confidence * 100);
        toast.success(`Gasto detectado por voz (${confidencePercent}% confianza)`);

        // Autoguardar si la preferencia está activada
        if (preferences.autoSaveAfterVoice) {
          console.log('💾 Autoguardado activado, guardando gasto...');
          // Esperar un momento para que el estado se actualice
          setTimeout(async () => {
            try {
              if (!usuario) {
                toast.error('Debes iniciar sesión');
                return;
              }

              const fechaHora = new Date(`${newFormData.fecha}T${newFormData.hora}:00`);
              
              const gastoData: any = {
                userId: usuario.id,
                fecha: fechaHora,
                categoria: newFormData.categoria,
                monto: parseFloat(newFormData.monto),
                moneda: newFormData.moneda,
                descripcion: newFormData.descripcion.trim(),
                metodoPago: newFormData.metodoPago,
                recurrente: newFormData.recurrente || false,
                // Origen IA (learning_log) — autoguardado por voz.
                ...origenInfo,
              };

              if (newFormData.subcategoria) {
                gastoData.subcategoria = newFormData.subcategoria;
              }

              console.log('💾 Autoguardando gasto:', gastoData);

              await crear(gastoData);
              toast.success('¡Gasto guardado automáticamente!');
              navigate('/gastos');
            } catch (error: any) {
              console.error('Error al autoguardar:', error);
              toast.error('Error al guardar automáticamente. Revisa y guarda manualmente.');
            }
          }, 500);
        }
      } else {
        toast.error('No pude entender bien el gasto. Intenta de nuevo o completa manualmente.');
      }
    } catch (error: any) {
      console.error('Error al procesar voz:', error);
      toast.error(error.message || 'Error al procesar entrada de voz');
    } finally {
      setProcessingVoice(false);
      resetRecording();
    }
  };

  // Handler para botón de voz
  const handleVoiceButtonClick = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
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

    // Descripción ya no es requerida
    // if (!formData.descripcion.trim()) {
    //   nuevosErrores.descripcion = 'La descripción es requerida';
    // } else if (formData.descripcion.trim().length < 3) {
    //   nuevosErrores.descripcion = 'La descripción debe tener al menos 3 caracteres';
    // }

    // Método de pago requerido
    if (!formData.metodoPago) {
      nuevosErrores.metodoPago = 'El método de pago es requerido';
    }

    // Cuenta requerida
    if (!formData.accountId) {
      nuevosErrores.accountId = 'Selecciona la cuenta de la que sale el dinero';
    } else if (cuentaSeleccionada && cuentaSeleccionada.currency !== formData.moneda) {
      nuevosErrores.accountId = `La cuenta es en ${cuentaSeleccionada.currency} pero el gasto es en ${formData.moneda}`;
    }

    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  // Manejar envío del formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validarFormulario()) {
      toast.error('Por favor corrige los errores en el formulario');
      void trackEvent('expense.form.validation_error');
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

      // Combinar fecha y hora. Defensivo: una combinación inválida no debe
      // propagarse como "Invalid time value" críptico al serializar.
      const fechaHora = new Date(`${formData.fecha}T${formData.hora}:00`);
      if (isNaN(fechaHora.getTime())) {
        toast.error('Fecha u hora inválida. Revisa los campos.');
        setCargando(false);
        return;
      }

      // Preparar datos del gasto
      // IMPORTANTE: No incluir campos undefined - Firestore los rechaza
      const gastoData: any = {
        userId: usuario.id,
        accountId: formData.accountId,
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

      // Agregar shoppingListId si existe
      if (formData.shoppingListId) {
        gastoData.shoppingListId = formData.shoppingListId;
      }

      // Agregar campos de información tributaria si existen
      if (formData.voucherType) {
        gastoData.voucherType = formData.voucherType;
      }

      if (formData.voucherNumber && formData.voucherNumber.trim()) {
        gastoData.voucherNumber = formData.voucherNumber.trim();
      }

      if (formData.ruc && formData.ruc.trim()) {
        gastoData.ruc = formData.ruc.trim();
      }

      if (formData.igv && formData.igv.trim()) {
        gastoData.igv = parseFloat(formData.igv);
      }

      if (formData.subtotal && formData.subtotal.trim()) {
        gastoData.subtotal = parseFloat(formData.subtotal);
      }

      if (formData.reimbursementStatus) {
        gastoData.reimbursementStatus = formData.reimbursementStatus;
      }

      // Log para debugging (especialmente útil con entrada de voz)
      console.log('💾 Datos del gasto a guardar:', gastoData);
      console.log('📋 FormData actual:', formData);

      if (esEdicion && id) {
        // Actualizar gasto existente (el backend ajusta saldos atómicamente)
        await actualizar(id, gastoData);
        toast.success('Gasto actualizado exitosamente');
      } else {
        // Crear nuevo gasto. El backend descuenta atómicamente del bankBalance
        // o cashBalance de la cuenta según `metodoPago`.
        // Si vino de IA (voz/imagen), adjuntar origen para el learning_log:
        // si el usuario cambió la categoría sugerida → corrección.
        if (iaOrigen) Object.assign(gastoData, iaOrigen);
        await crear(gastoData);

        // Recordar la cuenta usada para futuros gastos del mismo "tipo" (efectivo / no-efectivo)
        if (usuario && formData.accountId) {
          const isCash = formData.metodoPago === 'efectivo';
          localStorage.setItem(
            lastAccountStorageKey(usuario.id, isCash),
            formData.accountId,
          );
        }

        // Si viene de una lista de compras, actualizar su estado localmente (simulación de backend)
        if (formData.shoppingListId) {
          try {
             // Import dynamically to avoid circular dependencies if any, or just use localStorage directly
             // Since ShoppingListService uses localStorage, we can update it here for the demo
             const listKey = `shopping_lists`;
             const storedLists = localStorage.getItem(listKey);
             if (storedLists) {
               const lists = JSON.parse(storedLists);
               const updatedLists = lists.map((l: any) => 
                 l.id === formData.shoppingListId ? { ...l, status: 'archived' } : l
               );
               localStorage.setItem(listKey, JSON.stringify(updatedLists));
             }
          } catch (err) {
            console.error('Error updating local shopping list status', err);
          }
        }

        toast.success('Gasto creado exitosamente');
        void trackEvent('expense.form.saved');
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
          <CustomLoader />
          <p className="text-muted-foreground mt-4">Cargando gasto...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* class-border: bg-card border border-border */}
      <div className="rounded-xl shadow-sm p-4 pt-0 lg:pt-4 md:p-6 lg:bg-card lg:border lg:border-border">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-foreground">
            {/* {esEdicion ? 'Editar Gasto' : 'Nuevo Gasto'} */}
            {esEdicion ? 'Editar Gasto' : 
              <div>
                <button
                  type="button"
                  onClick={isPro ? handleEscanearClick : () => navigate('/configuracion?tab=perfil')}
                  disabled={escaneando}
                  className={`p-3 rounded-full transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed ${
                    isPro 
                      ? 'bg-primary text-primary-foreground hover:scale-105' 
                      : 'bg-muted text-muted-foreground'
                  } lg:hidden relative`}
                  title={isPro ? 'Scanea yape/plin' : 'Disponible en PRO'}
                >
                 {escaneando ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary-foreground border-t-transparent"></div>
                    </>
                  ) : (
                    <>
                      {isPro ? <Image className="h-5 w-5" /> : <Crown className="h-5 w-5 text-amber-500" />}
                    </>
                  )}
                  {!isPro && (
                    <span className="absolute -top-1 -right-1 flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
                    </span>
                  )}
                </button>
                <span className='hidden lg:inline'>Nuevo Gasto</span>
              </div>}
          </h2>
          
          {/* Botón de Voz */}
          {!esEdicion && isSupported && (
            <button
              type="button"
              onClick={isPro ? handleVoiceButtonClick : () => navigate('/configuracion?tab=perfil')}
              disabled={processingVoice || cargando}
              className={`p-3 rounded-full transition-all shadow-lg ${
                isPro
                  ? isListening 
                    ? 'bg-destructive text-destructive-foreground animate-pulse' 
                    : 'bg-primary text-primary-foreground hover:scale-105'
                  : 'bg-muted text-muted-foreground'
              } disabled:opacity-50 disabled:cursor-not-allowed relative`}
              title={isPro ? (isListening ? 'Detener grabación' : 'Agregar gasto por voz') : 'Disponible en PRO'}
            >
              {isPro ? (
                isListening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />
              ) : (
                <Crown className="h-5 w-5 text-amber-500" />
              )}
              {!isPro && (
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
                </span>
              )}
            </button>
          )}
        </div>

        {/* Modal de Escucha */}
        {isListening && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 backdrop-blur-sm">
            <div className="bg-card p-8 rounded-2xl text-center shadow-2xl border border-border max-w-sm mx-4">
              <div className="relative mb-6">
                <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full animate-pulse" />
                <div className="relative bg-primary/10 p-6 rounded-full inline-block">
                  <Mic className="h-16 w-16 text-primary animate-pulse" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">Escuchando...</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Describe tu gasto con naturalidad
              </p>
              <div className="bg-muted/50 rounded-lg p-3 mb-4">
                <p className="text-xs text-muted-foreground mb-1">Ejemplos:</p>
                <p className="text-xs text-foreground">"Gasté 50 soles en almuerzo"</p>
                <p className="text-xs text-foreground">"Compré gasolina por 100 con yape"</p>
              </div>
              <button
                onClick={stopListening}
                className="w-full bg-destructive text-destructive-foreground px-6 py-3 rounded-lg font-semibold hover:bg-destructive/90 transition-colors"
              >
                Detener
              </button>
            </div>
          </div>
        )}

        {/* Modal de Procesamiento */}
        {processingVoice && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 backdrop-blur-sm">
            <div className="bg-card p-8 rounded-2xl text-center shadow-2xl border border-border">
              <CustomLoader />
              <p className="text-lg font-medium text-foreground mt-4">Procesando...</p>
              <p className="text-sm text-muted-foreground mt-2">Analizando tu gasto con IA</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* ========== VERSIÓN MOBILE/TABLET (md:hidden) - iOS STYLE ========== */}
          <div className="md:hidden space-y-6">
            
            {/* 1. Atajos Rápidos (Horizontal Scroll) */}
            {!esEdicion && (
              <div className="overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
                <div className="flex gap-2 w-max">
                  {shortcuts.map((shortcut) => (
                    <button
                      key={shortcut.id}
                      type="button"
                      onClick={() => handleShortcutSelect(shortcut.id)}
                      className={`flex flex-col items-center justify-center w-20 h-20 rounded-2xl transition-all active:scale-95 border ${
                        combinacionSeleccionada === shortcut.id
                          ? 'bg-primary text-primary-foreground border-primary'
                          : 'bg-card text-card-foreground border-border shadow-sm'
                      }`}
                    >
                      <span className="text-2xl mb-1">{shortcut.icon || <Zap />}</span>
                      <span className="text-[10px] font-medium truncate w-full text-center px-1">
                        {shortcut.name}
                      </span>
                    </button>
                  ))}
                  <Link
                    to="/configuracion?tab=atajos"
                    className="flex flex-col items-center justify-center w-20 h-20 rounded-2xl bg-muted/50 border border-dashed border-muted-foreground/30 text-muted-foreground active:scale-95"
                  >
                    <Plus className="h-6 w-6 mb-1" />
                    <span className="text-[10px] font-medium">Nuevo</span>
                  </Link>
                </div>
              </div>
            )}

            {/* 2. Monto Principal (Hero) */}
            <div className="text-center py-2">
              <label className="text-sm font-medium text-muted-foreground mb-2 block">
                ¿Cuánto gastaste?
              </label>
              <div className="relative inline-block">
                <span className="absolute left-8 top-1/2 -translate-y-1/2 -translate-x-full pr-2 text-2xl font-bold text-muted-foreground">
                  {currencies.find(c => c.codigoISO === formData.moneda)?.simbolo}
                </span>
                <input
                  type="number"
                  name="monto"
                  value={formData.monto}
                  onChange={handleChange}
                  placeholder="0.00"
                  className="w-full bg-transparent text-6xl font-bold text-center focus:outline-none placeholder:text-muted-foreground/20 p-0 border-none"
                  autoFocus={!esEdicion}
                  min="0"
                  step="0.01"
                />
              </div>
              {errores.monto && (
                <p className="text-sm text-destructive mt-1 font-medium animate-pulse">
                  {errores.monto}
                </p>
              )}
            </div>

            {/* 3. Categoría (Horizontal Scroll Pills) */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground px-1">
                Categoría
              </label>
              <div className="overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
                <div className="flex gap-2 w-max">
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, categoria: cat.id as any, subcategoria: '' }))}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap border ${
                        formData.categoria === cat.id
                          ? 'bg-primary text-primary-foreground border-primary shadow-md'
                          : 'bg-card text-card-foreground border-border hover:bg-accent'
                      }`}
                    >
                      {cat.nombre}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {formData.categoria && getSubcategories(formData.categoria).length > 0 && (
              <div className="space-y-2 animate-in slide-in-from-top-2 duration-200">
                <label className="text-sm font-medium text-muted-foreground px-1">
                  Subcategoría
                </label>
                <div className="overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
                  <div className="flex gap-2 w-max">
                    {getSubcategories(formData.categoria).map((sub) => (
                      <button
                        key={sub.id}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, subcategoria: sub.id }))}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap border ${
                          formData.subcategoria === sub.id
                            ? 'bg-secondary text-secondary-foreground border-secondary shadow-sm'
                            : 'bg-card text-card-foreground border-border hover:bg-accent'
                        }`}
                      >
                        {sub.nombre}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* 4. Descripción */}
            <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
              <div className="p-3 border-b border-border/50 flex items-start gap-3">
                <AlignLeft className="h-5 w-5 text-muted-foreground mt-0.5" />
                <textarea
                  name="descripcion"
                  value={formData.descripcion}
                  onChange={handleChange}
                  placeholder="¿En qué gastaste? (Opcional)"
                  rows={2}
                  className="flex-1 bg-transparent resize-none focus:outline-none text-base placeholder:text-muted-foreground/50"
                />
              </div>
              
              {/* Sugerencias rápidas */}
              {subcategorySuggestions.length > 0 && (
                <div className="p-2 bg-muted/30 flex gap-2 overflow-x-auto scrollbar-hide">
                  {subcategorySuggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => agregarTagSugerido(suggestion)}
                      className="px-3 py-1 text-xs font-medium rounded-full bg-background border border-border shadow-sm active:scale-95 whitespace-nowrap"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* 5. Detalles Adicionales (Accordion) */}
            <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
              <button
                type="button"
                onClick={() => setShowDetails(!showDetails)}
                className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
              >
                <span className="font-medium text-sm flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-primary" />
                  Detalles (Fecha, Pago, Etiquetas)
                </span>
                {showDetails ? (
                  <ChevronUp className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                )}
              </button>

              {showDetails && (
                <div className="p-4 pt-0 space-y-4 mt-3 animate-in slide-in-from-top-2 duration-200">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5" /> Fecha
                      </label>
                      <input
                        type="date"
                        name="fecha"
                        value={formData.fecha}
                        onChange={handleChange}
                        className="w-full bg-muted/50 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5" /> Hora
                      </label>
                      <input
                        type="time"
                        name="hora"
                        value={formData.hora}
                        onChange={handleChange}
                        className="w-full bg-muted/50 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                      <CreditCard className="h-3.5 w-3.5" /> Método de Pago
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {paymentMethods.map((method) => (
                        <button
                          key={method.id}
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, metodoPago: method.id as any }))}
                          className={`px-3 py-2 rounded-lg text-xs font-medium border transition-all ${
                            formData.metodoPago === method.id
                              ? 'bg-primary/10 border-primary text-primary'
                              : 'bg-background border-border hover:bg-muted'
                          }`}
                        >
                          {method.nombre}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Selector de cuenta (obligatorio) */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                      <Wallet className="h-3.5 w-3.5" />
                      {formData.metodoPago === 'efectivo'
                        ? '¿De qué cuenta sale este efectivo?'
                        : 'Cuenta'}
                    </label>
                    <SelectorCuenta
                      value={formData.accountId}
                      onChange={(accountId, account) => {
                        setFormData((prev) => ({
                          ...prev,
                          accountId,
                          moneda: account.currency as Moneda,
                        }));
                        if (errores.accountId) {
                          setErrores((prev) => ({ ...prev, accountId: undefined }));
                        }
                      }}
                      currency={formData.moneda}
                      error={errores.accountId}
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                      <CircleDollarSign className="h-3.5 w-3.5" /> Moneda
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {currencies.map((currency) => (
                        <button
                          key={currency.id}
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, moneda: currency.codigoISO as any }))}
                          className={`px-3 py-2 rounded-lg text-xs font-medium border transition-all ${
                            formData.moneda === currency.codigoISO
                              ? 'bg-primary/10 border-primary text-primary'
                              : 'bg-background border-border hover:bg-muted'
                          }`}
                        >
                          {currency.simbolo} {currency.nombre}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between pt-2">
                    <label className="text-sm font-medium flex items-center gap-2 cursor-pointer">
                      <Repeat className="h-4 w-4 text-muted-foreground" />
                      Gasto recurrente
                    </label>
                    <input
                      type="checkbox"
                      name="recurrente"
                      checked={formData.recurrente}
                      onChange={handleChange}
                      className="h-5 w-5 rounded border-primary text-primary focus:ring-primary"
                    />
                  </div>

                  {/* Sección de Comprobante (Mobile) */}
                  <div className="pt-4 border-t border-border mt-2">
                    <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                      <Receipt className="h-4 w-4 text-primary" />
                      Comprobante de Pago
                    </h4>
                    
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                          <label className="text-xs font-medium text-muted-foreground">Tipo</label>
                          <select
                            name="voucherType"
                            value={formData.voucherType}
                            onChange={handleVoucherTypeChange}
                            className="w-full bg-muted/50 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                          >
                            <option value="boleta">Boleta</option>
                            <option value="factura">Factura</option>
                            <option value="recibo">Recibo</option>
                            <option value="ticket">Ticket</option>
                            <option value="nota-debito">Nota Débito</option>
                            <option value="nota-credito">Nota Crédito</option>
                          </select>
                        </div>
                        
                        <div className="space-y-1.5">
                          <label className="text-xs font-medium text-muted-foreground">Número</label>
                          <input
                            type="text"
                            name="voucherNumber"
                            value={formData.voucherNumber}
                            onChange={handleChange}
                            placeholder="B001-123"
                            className="w-full bg-muted/50 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                          />
                        </div>
                      </div>

                      {formData.voucherType === 'factura' && (
                        <div className="space-y-3 animate-in slide-in-from-top-2">
                          <div className="space-y-1.5">
                            <label className="text-xs font-medium text-muted-foreground">RUC</label>
                            <input
                              type="text"
                              name="ruc"
                              value={formData.ruc}
                              onChange={handleChange}
                              placeholder="20123456789"
                              className="w-full bg-muted/50 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                            />
                          </div>
                          
                          <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                              <label className="text-xs font-medium text-muted-foreground">Subtotal</label>
                              <input
                                type="number"
                                name="subtotal"
                                value={formData.subtotal}
                                onChange={handleChange}
                                className="w-full bg-muted/50 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                              />
                            </div>
                            <div className="space-y-1.5">
                              <label className="text-xs font-medium text-muted-foreground">IGV (18%)</label>
                              <input
                                type="number"
                                name="igv"
                                value={formData.igv}
                                onChange={handleChange}
                                className="w-full bg-muted/50 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 6. Botones de Acción (Fixed Bottom) */}
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-card/80 backdrop-blur-md border-t border-border z-50 pb-safe">
              <div className="grid grid-cols-2 gap-3 max-w-2xl mx-auto">
                <button
                  type="button"
                  onClick={() => navigate('/gastos')}
                  className="w-full py-3.5 rounded-xl font-semibold text-muted-foreground hover:bg-muted transition-colors bg-muted/20"
                >
                  Cancelar
                </button>
                {/* <Button size='xl' disabled={cargando} variant='secondary' type="button" onClick={() => navigate('/gastos')}>
                  <span className='font-bold'>
                  Cancelar
                  </span>
                </Button>
              <Button loading={cargando} size='xl' type='submit' disabled={cargando} spinnerVariant="dots3" loadingText={(cargando && esEdicion) ? 'Actualizando...' : 'Guardando...'}>

                <span className='font-bold flex items-center gap-2'>
                   <>
                      <Check className="h-5 w-5" />
                      {esEdicion ? 'Actualizar' : 'Guardar'}
                    </>
                </span>
              </Button> */}

                <button
                  type="submit"
                  disabled={cargando}
                  className="w-full py-3.5 bg-primary text-primary-foreground rounded-xl font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {cargando ? (
                    <LoadingSpinner variant="dots3" size="md"/>
                  ) : (
                    <>
                      <Check className="h-5 w-5" />
                      {esEdicion ? 'Actualizar' : 'Guardar'}
                    </>
                  )}
                </button>
              </div>
            </div>
            
            {/* Espaciador para que el contenido no quede oculto por los botones fijos */}
            <div className="h-24" />
          </div>

          {/* ========== VERSIÓN DESKTOP (hidden md:block) - FORMULARIO ORIGINAL ========== */}
          <div className="hidden md:block space-y-4">
            {/* 1. Atajos Rápidos */}
            {!esEdicion && (
              <div className="bg-muted/30 border border-border rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-medium text-foreground">
                    Atajos Rápidos
                  </label>
                  <Link
                    to="/configuracion?tab=atajos"
                    className="h-7 w-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                  </Link>
                </div>
                {shortcuts.length > 0 ? (
                <div className="grid grid-cols-4 gap-2">
                  {shortcuts.map((shortcut) => (
                    <button
                      key={shortcut.id}
                      type="button"
                      onClick={() => handleShortcutSelect(shortcut.id)}
                      className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center justify-center gap-1.5 ${
                        combinacionSeleccionada === shortcut.id
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-background hover:bg-accent text-foreground border border-border'
                      }`}
                    >
                      {shortcut.icon && <span>{shortcut.icon}</span>}
                      <span className="truncate">{shortcut.name}</span>
                    </button>
                  ))}
                </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-3">
                    No hay atajos configurados. Haz clic en + para crear uno.
                  </p>
                )}
              </div>
            )}

            {/* 2. Escanear Boleta (Desktop) */}
            {!esEdicion && (
              <div className="bg-accent/30 border border-border rounded-xl p-4">
                <label className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                  <Image className="h-4 w-4" />
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
                  onClick={isPro ? handleEscanearClick : () => navigate('/configuracion?tab=perfil')}
                  disabled={escaneando}
                  className={`w-full px-4 py-2 font-semibold rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 relative ${
                    isPro 
                      ? 'bg-primary hover:bg-primary/90 text-primary-foreground' 
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  }`}
                >
                  {escaneando ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary-foreground border-t-transparent"></div>
                      <span>Escaneando...</span>
                    </>
                  ) : (
                    <>
                      {isPro ? <Upload className="h-4 w-4" /> : <Crown className="h-4 w-4 text-amber-500" />}
                      <span>{isPro ? 'Subir Boleta (Yape + Plin + Trans.)' : 'Subir Boleta (Solo PRO)'}</span>
                    </>
                  )}
                  {!isPro && (
                    <span className="absolute -top-1 -right-1 flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
                    </span>
                  )}
                </button>
              </div>
            )}

            {/* 3. Campos Principales - Estilo iOS Settings */}
            <div className="bg-card border border-border rounded-xl overflow-hidden divide-y divide-border">
              {/* Fecha y Hora */}
              <div className="flex divide-x divide-border">
                <div className="flex-1 p-3 flex items-center gap-3">
                  <div className="p-1.5 bg-blue-500/10 rounded-lg text-blue-600 dark:text-blue-400">
                    <Calendar className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <label className="text-[10px] text-muted-foreground block mb-0.5">
                      Fecha <span className="text-destructive">*</span>
                    </label>
                    <input
                      type="date"
                      name="fecha"
                      value={formData.fecha}
                      onChange={handleChange}
                      max={obtenerFechaLocalISO()}
                      className="bg-transparent text-sm w-full focus:outline-none font-medium"
                      disabled={cargando}
                    />
                  </div>
                </div>

                <div className="w-1/3 p-3 flex items-center gap-3">
                  <div className="p-1.5 bg-blue-500/10 rounded-lg text-blue-600 dark:text-blue-400">
                    <Clock className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <label className="text-[10px] text-muted-foreground block mb-0.5">
                      Hora <span className="text-destructive">*</span>
                    </label>
                    <input
                      type="time"
                      name="hora"
                      value={formData.hora}
                      onChange={handleChange}
                      className="bg-transparent text-sm w-full focus:outline-none font-medium"
                      disabled={cargando}
                    />
                  </div>
                </div>
              </div>

              {/* Categoría y Subcategoría */}
              <div className="flex divide-x divide-border">
                <div className="flex-1 p-3 flex items-center gap-3">
                  <div className="p-1.5 bg-orange-500/10 rounded-lg text-orange-600 dark:text-orange-400">
                    <Tag className="h-4 w-4" />
                  </div>
                  <select
                    name="categoria"
                    value={formData.categoria}
                    onChange={handleChange}
                    className={`bg-transparent text-sm w-full focus:outline-none appearance-none font-medium ${
                      formData.categoria ? 'text-foreground' : 'text-muted-foreground'
                    }`}
                    disabled={cargando}
                  >
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.nombre}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex-1 p-3">
                  <select
                    name="subcategoria"
                    value={formData.subcategoria}
                    onChange={handleChange}
                    className={`bg-transparent text-sm w-full focus:outline-none appearance-none font-medium ${
                      formData.subcategoria ? 'text-foreground' : 'text-muted-foreground'
                    }`}
                    disabled={cargando}
                  >
                    <option value="">Subcategoría</option>
                    {getSubcategories(formData.categoria).map((sub) => (
                      <option key={sub.id} value={sub.id}>
                        {sub.nombre}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Monto y Método de Pago */}
              <div className="flex divide-x divide-border">
                <div className="flex-1 p-3 flex items-center gap-3">
                  <div className="p-1.5 bg-green-500/10 rounded-lg text-green-600 dark:text-green-400">
                    <CircleDollarSign className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <label className="text-[10px] text-muted-foreground block mb-0.5">
                      Monto <span className="text-destructive">*</span>
                    </label>
                    <input
                      type="number"
                      name="monto"
                      value={formData.monto}
                      onChange={handleChange}
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      className="bg-transparent text-sm w-full focus:outline-none font-semibold"
                      disabled={cargando}
                      autoFocus={!esEdicion}
                    />
                  </div>
                </div>

                <div className="flex-1 p-3 flex items-center gap-3">
                  <div className="p-1.5 bg-green-500/10 rounded-lg text-green-600 dark:text-green-400">
                    <CreditCard className="h-4 w-4" />
                  </div>
                  <select
                    name="metodoPago"
                    value={formData.metodoPago}
                    onChange={handleChange}
                    className="bg-transparent text-sm w-full focus:outline-none appearance-none font-medium"
                    disabled={cargando}
                  >
                    {paymentMethods.map((method) => (
                      <option key={method.id} value={method.id}>
                        {method.nombre}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Cuenta (obligatoria) */}
              <div className="p-3 flex items-center gap-3 border-t border-border">
                <div className="p-1.5 bg-cyan-500/10 rounded-lg text-cyan-600 dark:text-cyan-400">
                  <Wallet className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <label className="text-[10px] text-muted-foreground block mb-0.5">
                    {formData.metodoPago === 'efectivo'
                      ? '¿De qué cuenta sale este efectivo? *'
                      : 'Cuenta *'}
                  </label>
                  <SelectorCuenta
                    value={formData.accountId}
                    onChange={(accountId, account) => {
                      setFormData((prev) => ({
                        ...prev,
                        accountId,
                        moneda: account.currency as Moneda,
                      }));
                      if (errores.accountId) {
                        setErrores((prev) => ({ ...prev, accountId: undefined }));
                      }
                    }}
                    currency={formData.moneda}
                    error={errores.accountId}
                  />
                </div>
              </div>

              {/* Moneda */}
              <div className="p-3 flex items-center gap-3">
                <div className="p-1.5 bg-purple-500/10 rounded-lg text-purple-600 dark:text-purple-400">
                  <Coins className="h-4 w-4" />
                </div>
                <span className="text-sm font-medium flex-1">Moneda</span>
                <select
                  name="moneda"
                  value={formData.moneda}
                  onChange={handleChange}
                  className="bg-transparent text-sm focus:outline-none appearance-none font-semibold text-right pr-2"
                  disabled={cargando}
                >
                  {currencies.map((curr) => (
                    <option key={curr.id} value={curr.codigoISO}>
                      {curr.simbolo} {curr.codigoISO}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* 6. Descripción con tags sugeridos debajo */}
            <div>
              <label htmlFor="descripcion" className="block text-xs font-medium text-muted-foreground mb-1.5">
                Descripción
              </label>
              <textarea
                id="descripcion"
                name="descripcion"
                value={formData.descripcion}
                onChange={handleChange}
                rows={3}
                placeholder="Ej: Almuerzo en restaurante"
                className={`w-full px-3 py-2.5 rounded-lg border ${
                  errores.descripcion ? 'border-destructive focus:ring-destructive' : 'border-border focus:ring-primary/50'
                } bg-muted/50 text-foreground focus:outline-none focus:ring-2 transition-colors resize-none`}
                disabled={cargando}
              />
              {errores.descripcion && <p className="mt-1 text-xs text-destructive">{errores.descripcion}</p>}

              {/* Sugerencias de subcategoría */}
              <div className="mt-3 bg-muted/30 border border-border rounded-xl p-3">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-medium text-foreground flex items-center gap-2">
                    <Lightbulb className="h-4 w-4" />
                    <span>Sugerencias para {subcategoryName || 'descripción'}</span>
                  </p>
                  <Link
                    to="/configuracion?tab=categorias"
                    className="h-6 w-6 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center hover:bg-secondary/80 transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                  </Link>
                </div>
                {subcategorySuggestions.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {subcategorySuggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => agregarTagSugerido(suggestion)}
                        className="px-3 py-1 text-xs font-medium rounded-full bg-background hover:bg-primary hover:text-primary-foreground border border-border transition-colors"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground text-center py-1">
                    {formData.subcategoria ? 'No hay sugerencias configuradas' : 'Selecciona una subcategoría'}
                  </p>
                )}
              </div>
            </div>

            {/* 7. Tags opcionales */}
            <div>
              <label htmlFor="tags" className="block text-xs font-medium text-muted-foreground mb-1.5">
                Etiquetas (opcional)
              </label>
              <input
                type="text"
                id="tags"
                name="tags"
                value={tagsInput}
                onChange={handleTagsChange}
                placeholder="Ej: trabajo, urgente (separadas por comas)"
                className="w-full px-3 py-2.5 rounded-lg border border-border focus:ring-primary/50 bg-muted/50 text-foreground focus:outline-none focus:ring-2 transition-colors"
                disabled={cargando}
              />
            {/* 8. Recurrente */}
            <div className="flex items-center gap-2 pt-4 mb-4">
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

            {/* Información Tributaria (Desktop) - Estilo iOS Settings */}
            <div className="bg-card border border-border rounded-xl overflow-hidden">
              <div className="p-3 bg-muted/30 border-b border-border">
                <h3 className="text-sm font-semibold flex items-center gap-2">
                  <Receipt className="h-4 w-4 text-primary" />
                  Información Tributaria
                </h3>
              </div>

              <div className="divide-y divide-border">
                {/* Tipo de Comprobante y Número */}
                <div className="flex divide-x divide-border">
                  <div className="flex-1 p-3 flex items-center gap-3">
                    <div className="p-1.5 bg-indigo-500/10 rounded-lg text-indigo-600 dark:text-indigo-400">
                      <FileText className="h-4 w-4" />
                    </div>
                    <div className="flex-1">
                      <label className="text-[10px] text-muted-foreground block mb-0.5">
                        Tipo de Comprobante
                      </label>
                      <select
                        name="voucherType"
                        value={formData.voucherType}
                        onChange={handleVoucherTypeChange}
                        className="bg-transparent text-sm w-full focus:outline-none appearance-none font-medium"
                        disabled={cargando}
                      >
                        <option value="boleta">Boleta</option>
                        <option value="factura">Factura</option>
                        <option value="recibo">Recibo</option>
                        <option value="ticket">Ticket</option>
                        <option value="nota-debito">Nota Débito</option>
                        <option value="nota-credito">Nota Crédito</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex-1 p-3 flex items-center gap-3">
                    <div className="p-1.5 bg-indigo-500/10 rounded-lg text-indigo-600 dark:text-indigo-400">
                      <Hash className="h-4 w-4" />
                    </div>
                    <div className="flex-1">
                      <label className="text-[10px] text-muted-foreground block mb-0.5">
                        Número de Comprobante
                      </label>
                      <input
                        type="text"
                        name="voucherNumber"
                        value={formData.voucherNumber}
                        onChange={handleChange}
                        placeholder="B001-12345"
                        className="bg-transparent text-sm w-full focus:outline-none font-medium"
                        disabled={cargando}
                      />
                    </div>
                  </div>
                </div>

                {/* Estado de Reembolso */}
                <div className="p-3 flex items-center gap-3">
                  <div className="p-1.5 bg-amber-500/10 rounded-lg text-amber-600 dark:text-amber-400">
                    <RefreshCw className="h-4 w-4" />
                  </div>
                  <span className="text-sm font-medium flex-1">Estado de Reembolso</span>
                  <select
                    name="reimbursementStatus"
                    value={formData.reimbursementStatus}
                    onChange={handleChange as any}
                    className="bg-transparent text-sm focus:outline-none appearance-none font-semibold text-right pr-2"
                    disabled={cargando}
                  >
                    <option value="pending">⏳ Pendiente</option>
                    <option value="approved">✅ Aprobado</option>
                    <option value="rejected">❌ Rechazado</option>
                    <option value="paid">💰 Pagado</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Datos de Factura (Condicional) - Estilo iOS Settings */}
            {formData.voucherType === 'factura' && (
              <div className="bg-card border border-amber-200 dark:border-amber-900 rounded-xl overflow-hidden animate-in slide-in-from-top-2 duration-200 mt-4">
                <div className="p-3 bg-amber-500/5 border-b border-amber-200 dark:border-amber-900">
                  <h3 className="text-sm font-semibold flex items-center gap-2 text-amber-700 dark:text-amber-400">
                    <Building2 className="h-4 w-4" />
                    Datos de Factura
                  </h3>
                </div>

                <div className="divide-y divide-border">
                  {/* RUC del Emisor */}
                  <div className="p-3 flex items-center gap-3">
                    <div className="p-1.5 bg-amber-500/10 rounded-lg text-amber-600 dark:text-amber-400">
                      <Building2 className="h-4 w-4" />
                    </div>
                    <div className="flex-1">
                      <label className="text-[10px] text-muted-foreground block mb-0.5">
                        RUC del Emisor <span className="text-destructive">*</span>
                      </label>
                      <input
                        type="text"
                        name="ruc"
                        value={formData.ruc}
                        onChange={handleChange}
                        placeholder="20123456789"
                        maxLength={11}
                        className="bg-transparent text-sm w-full focus:outline-none font-medium"
                        disabled={cargando}
                      />
                    </div>
                  </div>

                  {/* Subtotal e IGV */}
                  <div className="flex divide-x divide-border">
                    <div className="flex-1 p-3 flex items-center gap-3">
                      <div className="p-1.5 bg-blue-500/10 rounded-lg text-blue-600 dark:text-blue-400">
                        <Calculator className="h-4 w-4" />
                      </div>
                      <div className="flex-1">
                        <label className="text-[10px] text-muted-foreground block mb-0.5">
                          Subtotal
                        </label>
                        <input
                          type="number"
                          name="subtotal"
                          value={formData.subtotal}
                          onChange={handleChange}
                          step="0.01"
                          className="bg-transparent text-sm w-full focus:outline-none font-semibold text-muted-foreground"
                          disabled={cargando}
                          readOnly
                        />
                      </div>
                    </div>

                    <div className="flex-1 p-3 flex items-center gap-3">
                      <div className="p-1.5 bg-blue-500/10 rounded-lg text-blue-600 dark:text-blue-400">
                        <Percent className="h-4 w-4" />
                      </div>
                      <div className="flex-1">
                        <label className="text-[10px] text-muted-foreground block mb-0.5">
                          IGV (18%)
                        </label>
                        <input
                          type="number"
                          name="igv"
                          value={formData.igv}
                          onChange={handleChange}
                          step="0.01"
                          className="bg-transparent text-sm w-full focus:outline-none font-semibold text-muted-foreground"
                          disabled={cargando}
                          readOnly
                        />
                      </div>
                    </div>
                  </div>

                  {/* Tip de Auto-cálculo */}
                  <div className="p-3 bg-blue-500/5">
                    <p className="text-xs text-blue-700 dark:text-blue-400 flex items-center gap-2">
                      <Lightbulb className="h-3.5 w-3.5 flex-shrink-0" />
                      <span>
                        El subtotal e IGV se calculan automáticamente basándose en el monto total (Monto / 1.18)
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* 9. Botones al final (Desktop) */}
            <div className="flex gap-3 pt-6">
{/* 
              <Button fullWidth loading={cargando} size='xl' type='submit' disabled={cargando} spinnerVariant="dots3" loadingText={(cargando && esEdicion) ? 'Actualizando...' : 'Guardando...'}>

                <span className='font-bold'>
                {esEdicion
                  ? 'Actualizar Gasto'
                  : 'Guardar Gasto'}
                </span>
              </Button> */}
              
              <button
                type="submit"
                disabled={cargando}
                className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-2 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                
                {cargando
                  ? esEdicion
                    ? <div className="flex items-center justify-center gap-2">
                    <LoadingSpinner variant="dots3" size="md"/>
                    Actualizando...
                    </div>
                    : <div className="flex items-center justify-center gap-2">
                    <LoadingSpinner variant="dots3" size="md"/>
                    Guardando...
                    </div>
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

              {/* <Button size='xl' disabled={cargando} variant='secondary' type="button" onClick={() => navigate('/gastos')}>

                <span className='font-bold'>
                Cancelar
                </span>
              </Button> */}
            </div>
          </div>
        </div>
      </form>
    </div>
  </div>
);
}
