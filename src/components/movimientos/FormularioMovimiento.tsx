/**
 * Formulario para crear movimientos bancarios
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@context/AuthContext';
import { useMovimientos } from '@hooks/useMovimientos';
import { usePresupuestoEfectivo } from '@context/PresupuestoEfectivoContext';
import type { MovimientoFormData, TipoMovimiento } from '@app-types';
import { TIPOS_MOVIMIENTO, TIPO_MOVIMIENTO_LABELS, MONEDAS, MONEDA_LABELS } from '@app-types';
import { toast } from 'react-hot-toast';
import Button from '@components/common/Button';
import { Input, Select, TextArea, InputGroup, InputRow, Switch } from '@components/common/Input';
import { ArrowLeft, Save, ArrowRightLeft, Building2, DollarSign, Calendar, Clock, AlignLeft } from 'lucide-react';
import { obtenerFechaLocalISO } from '@utils/formatters';
import { useBreakpoints } from '@/hooks/useBreakpoints';

// Bancos principales en Perú
const BANCOS_PERU = [
  'BCP',
  'BBVA',
  'Interbank',
  'Scotiabank',
  'Banco de la Nación',
  'BanBif',
  'Pichincha',
  'Banco Falabella',
  'Banco Ripley',
  'Banco GNB',
  'ICBC',
  'Citibank',
  'Alfin',
  'Otro',
] as const;

interface FormularioMovimientoProps {
  onSuccess?: () => void;
  showBackButton?: boolean;
}

export default function FormularioMovimiento({ onSuccess, showBackButton = true }: FormularioMovimientoProps) {
  const navigate = useNavigate();
  const { usuario } = useAuth();
  const { crear } = useMovimientos();
  const { abonar } = usePresupuestoEfectivo();
  const { isMobile } = useBreakpoints();

  // Estado del formulario
  const [formData, setFormData] = useState<MovimientoFormData>({
    fecha: obtenerFechaLocalISO(),
    hora: new Date().toTimeString().slice(0, 5),
    tipo: 'retiro_banco',
    monto: '',
    moneda: 'PEN',
    origen: 'BCP', // Banco por defecto
    destino: '',
    descripcion: '',
    aplicadoAEfectivo: true,
  });

  const [errores, setErrores] = useState<Partial<Record<keyof MovimientoFormData, string>>>({});
  const [cargando, setCargando] = useState(false);

  /**
   * Validar formulario
   */
  const validarFormulario = (): boolean => {
    const nuevosErrores: Partial<Record<keyof MovimientoFormData, string>> = {};

    if (!formData.fecha) {
      nuevosErrores.fecha = 'La fecha es requerida';
    }

    if (!formData.hora) {
      nuevosErrores.hora = 'La hora es requerida';
    }

    if (!formData.monto || parseFloat(formData.monto) <= 0) {
      nuevosErrores.monto = 'El monto debe ser mayor a 0';
    }

    if (!formData.tipo) {
      nuevosErrores.tipo = 'El tipo de movimiento es requerido';
    }

    // Validar origen según el tipo
    if (formData.tipo === 'retiro_banco' && !formData.origen) {
      nuevosErrores.origen = 'El banco de origen es requerido';
    }

    // Validar origen y destino para transferencias
    if (formData.tipo === 'transferencia_cuentas') {
      if (!formData.origen) {
        nuevosErrores.origen = 'La cuenta de origen es requerida';
      }
      if (!formData.destino) {
        nuevosErrores.destino = 'La cuenta de destino es requerida';
      }
    }

    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  /**
   * Manejar cambio de campos del formulario
   */
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;

    // Si cambia el tipo de movimiento, resetear origen
    if (name === 'tipo') {
      setFormData((prev) => ({
        ...prev,
        tipo: value as TipoMovimiento,
        origen: value === 'retiro_banco' ? 'BCP' : '', // Auto-completar BCP para retiros
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
      }));
    }

    // Limpiar error del campo
    if (errores[name as keyof MovimientoFormData]) {
      setErrores((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  /**
   * Manejar cambio de switch
   */
  const handleSwitchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      aplicadoAEfectivo: e.target.checked,
    }));
  };

  /**
   * Manejar envío del formulario
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!usuario) {
      toast.error('Debes iniciar sesión');
      return;
    }

    if (!validarFormulario()) {
      toast.error('Por favor completa todos los campos requeridos');
      return;
    }

    setCargando(true);

    try {
      // Combinar fecha y hora
      const [year, month, day] = formData.fecha.split('-').map(Number);
      const [hours, minutes] = formData.hora.split(':').map(Number);
      const fechaCompleta = new Date(year, month - 1, day, hours, minutes);

      const monto = parseFloat(formData.monto);

      // Crear el movimiento
      const nuevoMovimiento = await crear({
        userId: usuario.id,
        fecha: fechaCompleta,
        tipo: formData.tipo,
        monto,
        moneda: formData.moneda,
        origen: formData.origen || undefined,
        destino: formData.destino || undefined,
        descripcion: formData.descripcion || undefined,
        aplicadoAEfectivo: formData.aplicadoAEfectivo,
      });

      if (!nuevoMovimiento) {
        throw new Error('Error al crear movimiento');
      }

      // Si se marcó "aplicar a efectivo", crear el abono
      if (formData.aplicadoAEfectivo) {
        const concepto = formData.tipo === 'retiro_banco'
          ? `Retiro de ${formData.origen || 'banco'}`
          : `Transferencia de ${formData.origen || 'cuenta'} a ${formData.destino || 'cuenta'}`;

        await abonar(monto, formData.moneda, concepto, nuevoMovimiento.id);
      }

      toast.success('Movimiento registrado exitosamente');

      if (onSuccess) {
        onSuccess();
      } else {
        navigate('/movimientos');
      }
    } catch (error) {
      console.error('Error al crear movimiento:', error);
      toast.error(
        error instanceof Error ? error.message : 'Error al registrar movimiento'
      );
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="mb-6 flex items-center gap-4">
        {showBackButton && (
          <Button
            variant="ghost"
            size="sm"
            icon={ArrowLeft}
            onClick={() => navigate(-1)}
            className="hidden md:flex"
          >
            Volver
          </Button>
        )}
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-foreground">
            Nuevo Movimiento
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Registra retiros de banco o transferencias entre cuentas
          </p>
        </div>
      </div>

      {/* Banner Informativo */}
      <div className="mb-6 bg-card border border-border rounded-xl shadow-sm relative overflow-hidden">
        {/* Icono decorativo de fondo */}
        <div className="absolute top-0 right-0 p-4 opacity-5 hidden sm:block">
          <ArrowRightLeft className="h-32 w-32 text-blue-500 transform rotate-12" />
        </div>

        <div className="relative z-10 p-4 sm:p-5">
          <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4">
            <div className="p-2 sm:p-2.5 bg-blue-100 dark:bg-blue-900/30 rounded-lg shrink-0">
              <ArrowRightLeft className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm sm:text-base font-semibold text-foreground mb-2">
                ¿Qué es un movimiento?
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed mb-3 sm:mb-4">
                Los movimientos son operaciones bancarias que <strong>no son gastos</strong>.
                Por ejemplo: retirar dinero del banco o transferir entre tus cuentas.
                Si marcas "Abonar a efectivo", el monto se sumará a tu efectivo disponible.
              </p>

              {/* Tips */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div className="flex items-start gap-2 p-2.5 sm:p-2 bg-muted/50 rounded-lg">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0"></div>
                  <p className="text-xs text-muted-foreground">
                    <strong className="text-foreground">Retiro de banco:</strong> Sacaste efectivo del cajero
                  </p>
                </div>
                <div className="flex items-start gap-2 p-2.5 sm:p-2 bg-muted/50 rounded-lg">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0"></div>
                  <p className="text-xs text-muted-foreground">
                    <strong className="text-foreground">Transferencia:</strong> Moviste dinero entre cuentas
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Formulario */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Fecha y Hora */}
        <InputGroup title="Fecha y Hora">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 px-3">
            <Input
              variant="ios"
              label="Fecha"
              type="date"
              name="fecha"
              value={formData.fecha}
              onChange={handleChange}
              icon={Calendar}
              error={!!errores.fecha}
              errorMessage={errores.fecha}
              required
            />
            <Input
              variant="ios"
              label="Hora"
              type="time"
              name="hora"
              value={formData.hora}
              onChange={handleChange}
              icon={Clock}
              error={!!errores.hora}
              errorMessage={errores.hora}
              required
            />
          </div>
        </InputGroup>

        {/* Tipo y Monto */}
        <InputGroup title="Detalles del Movimiento">
          <InputRow label="Tipo" icon={ArrowRightLeft} iconColor="bg-blue-500/10">
            <Select
              variant="ios"
              name="tipo"
              value={formData.tipo}
              onChange={handleChange}
              required
            >
              {TIPOS_MOVIMIENTO.map((tipo) => (
                <option key={tipo} value={tipo}>
                  {TIPO_MOVIMIENTO_LABELS[tipo]}
                </option>
              ))}
            </Select>
          </InputRow>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 px-3">
            <Input
              variant="ios"
              label="Monto"
              type="number"
              name="monto"
              value={formData.monto}
              onChange={handleChange}
              placeholder="0.00"
              step="0.01"
              icon={DollarSign}
              iconColor="text-green-500"
              error={!!errores.monto}
              errorMessage={errores.monto}
              required
            />
            <Select
              variant="ios"
              label="Moneda"
              name="moneda"
              value={formData.moneda}
              onChange={handleChange}
              required
            >
              {MONEDAS.map((moneda) => (
                <option key={moneda} value={moneda}>
                  {MONEDA_LABELS[moneda]}
                </option>
              ))}
            </Select>
          </div>
        </InputGroup>

        {/* Origen y Destino */}
        <InputGroup title="Cuentas">
          <InputRow
            label={formData.tipo === 'retiro_banco' ? 'Banco' : 'Origen'}
            icon={Building2}
            iconColor="bg-purple-500/10"
          >
            {formData.tipo === 'retiro_banco' ? (
              <Select
                variant="ios"
                name="origen"
                value={formData.origen}
                onChange={handleChange}
                error={!!errores.origen}
                errorMessage={errores.origen}
                required
              >
                {BANCOS_PERU.map((banco) => (
                  <option key={banco} value={banco}>
                    {banco}
                  </option>
                ))}
              </Select>
            ) : (
              <Input
                variant="ios"
                name="origen"
                value={formData.origen}
                onChange={handleChange}
                placeholder="Cuenta origen"
                error={!!errores.origen}
                errorMessage={errores.origen}
                required={formData.tipo === 'transferencia_cuentas'}
              />
            )}
          </InputRow>

          {formData.tipo === 'transferencia_cuentas' && (
            <InputRow label="Destino" icon={Building2} iconColor="bg-orange-500/10">
              <Input
                variant="ios"
                name="destino"
                value={formData.destino}
                onChange={handleChange}
                placeholder="Cuenta destino"
                error={!!errores.destino}
                errorMessage={errores.destino}
                required
              />
            </InputRow>
          )}
        </InputGroup>

        {/* Descripción y Opciones */}
        <InputGroup title="Información Adicional">
          <div className="px-3">
            <TextArea
              variant="ios"
              label="Descripción (opcional)"
              name="descripcion"
              value={formData.descripcion}
              onChange={handleChange}
              placeholder="Agrega notas sobre este movimiento..."
              autoResize
              maxHeight={150}
              icon={AlignLeft}
            />
          </div>

          <Switch
            label="Abonar a efectivo"
            description="Sumar este monto al presupuesto en efectivo"
            icon={DollarSign}
            iconColor="bg-green-500/10"
            checked={formData.aplicadoAEfectivo}
            onChange={handleSwitchChange}
          />
        </InputGroup>

        {/* Botones */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4">
          <Button
            type="button"
            variant="secondary"
            fullWidth
            onClick={() => navigate(-1)}
            disabled={cargando}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="primary"
            fullWidth
            icon={Save}
            iconOnly={cargando}
            loading={cargando}
            loadingText="Guardando..."
          >
            {isMobile ? 'Guardar' : 'Guardar Movimiento'}
          </Button>
        </div>
      </form>
    </div>
  );
}
