/**
 * Modal para crear/editar un Gasto Programado.
 *
 * Los campos del schedule se adaptan dinámicamente a la frecuencia elegida.
 * Validación con Zod (gastoProgramadoFormSchema).
 */

import { useEffect, useMemo, useState } from 'react';
import {
  Calendar,
  CircleDollarSign,
  Clock,
  CreditCard,
  Repeat,
  Tag,
  AlignLeft,
} from 'lucide-react';
import Modal, { ModalFooterActions } from '@components/common/Modal';
import { Input, Select } from '@components/common/Input';
import SelectorCuenta from '@components/cuentas/SelectorCuenta';
import { useConfig } from '@context/ConfigContext';
import { useGastosProgramados } from '@hooks/useGastosProgramados';
import { calcularProximaEjecucion, describirFrecuencia } from '@utils/programados';
import { gastoProgramadoFormSchema } from '@utils/validators-programados';
import {
  FRECUENCIAS_PROGRAMADO,
  FRECUENCIA_LABELS,
  DIAS_SEMANA_LABELS,
  type CategoriaGasto,
  type FrecuenciaProgramado,
  type GastoProgramado,
  type MetodoPago,
  type Moneda,
} from '@app-types';

interface FormularioGastoProgramadoProps {
  isOpen: boolean;
  onClose: () => void;
  /** Si está presente, modo edición. */
  gasto?: GastoProgramado;
  onSuccess?: (g: GastoProgramado) => void;
}

interface FormState {
  cuentaOrigenId: string;
  monto: string;
  moneda: Moneda;
  descripcion: string;
  categoria: string;
  subcategoria: string;
  metodoPago: string;

  frecuencia: FrecuenciaProgramado;
  diaEjecucion: number;          // 0-6 o 1-31 según frecuencia
  ultimoDiaDelMes: boolean;
  intervaloDias: number;
  fechaUnica: string;            // 'YYYY-MM-DDTHH:mm'
  hora: string;                  // 'HH:mm'
  fechaInicio: string;           // 'YYYY-MM-DD'
  fechaFin: string;              // 'YYYY-MM-DD' (vacío = sin fin)
}

function dateToInputValue(d: Date): string {
  // 'YYYY-MM-DD' en hora local
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function dateTimeToInputValue(d: Date): string {
  // 'YYYY-MM-DDTHH:mm'
  return `${dateToInputValue(d)}T${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

function buildInitialState(gasto?: GastoProgramado): FormState {
  const now = new Date();
  if (!gasto) {
    return {
      cuentaOrigenId: '',
      monto: '',
      moneda: 'PEN',
      descripcion: '',
      categoria: 'alimentacion',
      subcategoria: '',
      metodoPago: 'efectivo',
      frecuencia: 'mensual',
      diaEjecucion: now.getDate(),
      ultimoDiaDelMes: false,
      intervaloDias: 7,
      fechaUnica: dateTimeToInputValue(now),
      hora: '12:00',
      fechaInicio: dateToInputValue(now),
      fechaFin: '',
    };
  }
  return {
    cuentaOrigenId: gasto.cuentaOrigenId,
    monto: String(gasto.monto),
    moneda: gasto.moneda,
    descripcion: gasto.descripcion,
    categoria: gasto.categoria,
    subcategoria: gasto.subcategoria ?? '',
    metodoPago: gasto.metodoPago,
    frecuencia: gasto.frecuencia,
    diaEjecucion: gasto.diaEjecucion ?? new Date().getDate(),
    ultimoDiaDelMes: gasto.ultimoDiaDelMes ?? false,
    intervaloDias: gasto.intervaloDias ?? 7,
    fechaUnica: gasto.fechaUnica ? dateTimeToInputValue(gasto.fechaUnica) : '',
    hora: gasto.hora,
    fechaInicio: dateToInputValue(gasto.fechaInicio),
    fechaFin: gasto.fechaFin ? dateToInputValue(gasto.fechaFin) : '',
  };
}

function getZonaHorariaUsuario(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'America/Lima';
  } catch {
    return 'America/Lima';
  }
}

export default function FormularioGastoProgramado({
  isOpen,
  onClose,
  gasto,
  onSuccess,
}: FormularioGastoProgramadoProps) {
  const { categories, paymentMethods, getSubcategories } = useConfig();
  const { crear, actualizar } = useGastosProgramados();

  const esEdicion = Boolean(gasto);
  const [state, setState] = useState<FormState>(() => buildInitialState(gasto));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  // Reset al abrir/editar
  useEffect(() => {
    if (isOpen) {
      setState(buildInitialState(gasto));
      setErrors({});
    }
  }, [isOpen, gasto]);

  // Subcategorías derivadas
  const subcategoriasDisponibles = useMemo(
    () => getSubcategories(state.categoria),
    [state.categoria, getSubcategories],
  );

  // Vista previa de próxima ejecución
  const proximaPreview = useMemo(() => {
    try {
      const fechaInicio = new Date(`${state.fechaInicio}T${state.hora}:00`);
      if (isNaN(fechaInicio.getTime())) return null;
      const fechaUnica = state.fechaUnica ? new Date(state.fechaUnica) : undefined;
      return calcularProximaEjecucion({
        frecuencia: state.frecuencia,
        hora: state.hora,
        fechaInicio,
        diaEjecucion: state.diaEjecucion,
        ultimoDiaDelMes: state.ultimoDiaDelMes,
        intervaloDias: state.intervaloDias,
        fechaUnica,
      });
    } catch {
      return null;
    }
  }, [state]);

  const setField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setState((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async () => {
    const dto = {
      cuentaOrigenId: state.cuentaOrigenId,
      monto: parseFloat(state.monto),
      moneda: state.moneda,
      descripcion: state.descripcion.trim(),
      categoria: state.categoria as CategoriaGasto,
      subcategoria: state.subcategoria.trim() || undefined,
      metodoPago: state.metodoPago as MetodoPago,

      frecuencia: state.frecuencia,
      diaEjecucion:
        state.frecuencia === 'semanal' || state.frecuencia === 'mensual'
          ? state.diaEjecucion
          : undefined,
      ultimoDiaDelMes:
        state.frecuencia === 'mensual' ? state.ultimoDiaDelMes : undefined,
      intervaloDias:
        state.frecuencia === 'personalizada' ? state.intervaloDias : undefined,
      fechaUnica:
        state.frecuencia === 'unica' && state.fechaUnica
          ? new Date(state.fechaUnica).toISOString()
          : undefined,
      hora: state.hora,
      zonaHoraria: getZonaHorariaUsuario(),
      fechaInicio: new Date(`${state.fechaInicio}T${state.hora}:00`).toISOString(),
      fechaFin: state.fechaFin
        ? new Date(`${state.fechaFin}T23:59:59`).toISOString()
        : undefined,
    };

    const result = gastoProgramadoFormSchema.safeParse(dto);
    if (!result.success) {
      const errs: Record<string, string> = {};
      for (const issue of result.error.issues) {
        const key = issue.path[0]?.toString() ?? '_';
        if (!errs[key]) errs[key] = issue.message;
      }
      setErrors(errs);
      return;
    }

    setErrors({});
    setSubmitting(true);
    try {
      const created = esEdicion
        ? await actualizar(gasto!.id, dto)
        : await crear(dto);
      if (created) {
        onSuccess?.(created);
        onClose();
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={esEdicion ? 'Editar gasto programado' : 'Nuevo gasto programado'}
      subtitle="Se ejecutará automáticamente según la frecuencia elegida"
      size="lg"
      footer={
        <ModalFooterActions
          onCancel={onClose}
          onConfirm={handleSubmit}
          confirmText={submitting ? 'Guardando...' : esEdicion ? 'Guardar cambios' : 'Crear programación'}
          disabled={submitting}
        />
      }
    >
      <div className="space-y-4">
        {/* Cuenta */}
        <SelectorCuenta
          label="Cuenta de origen"
          value={state.cuentaOrigenId}
          onChange={(id, account) => {
            setField('cuentaOrigenId', id);
            if (account) setField('moneda', account.currency as Moneda);
          }}
          required
          error={errors.cuentaOrigenId}
        />

        {/* Monto */}
        <Input
          label={`Monto (${state.moneda})`}
          type="number"
          step="0.01"
          min="0"
          icon={CircleDollarSign}
          value={state.monto}
          onChange={(e) => setField('monto', e.target.value)}
          placeholder="0.00"
          required
          error={!!errors.monto}
          errorMessage={errors.monto}
        />

        {/* Descripción */}
        <Input
          label="Descripción"
          icon={AlignLeft}
          value={state.descripcion}
          onChange={(e) => setField('descripcion', e.target.value)}
          placeholder="Ej: Alquiler depto, Internet, Gym..."
          required
          error={!!errors.descripcion}
          errorMessage={errors.descripcion}
        />

        {/* Categoría */}
        <Select
          label="Categoría"
          icon={Tag}
          value={state.categoria}
          onChange={(e) => {
            setField('categoria', e.target.value);
            setField('subcategoria', '');
          }}
          required
        >
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nombre}
            </option>
          ))}
        </Select>

        {/* Subcategoría (si hay) */}
        {subcategoriasDisponibles.length > 0 && (
          <Select
            label="Subcategoría (opcional)"
            value={state.subcategoria}
            onChange={(e) => setField('subcategoria', e.target.value)}
          >
            <option value="">Sin subcategoría</option>
            {subcategoriasDisponibles.map((s) => (
              <option key={s.id} value={s.id}>
                {s.nombre}
              </option>
            ))}
          </Select>
        )}

        {/* Método de pago */}
        <Select
          label="Método de pago"
          icon={CreditCard}
          value={state.metodoPago}
          onChange={(e) => setField('metodoPago', e.target.value)}
          required
        >
          {paymentMethods.map((m) => (
            <option key={m.id} value={m.id}>
              {m.nombre}
            </option>
          ))}
        </Select>

        {/* Separador visual */}
        <div className="border-t border-border pt-4">
          <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
            <Repeat className="h-4 w-4" />
            Cuándo ejecutar
          </h3>
        </div>

        {/* Frecuencia */}
        <Select
          label="Frecuencia"
          icon={Repeat}
          value={state.frecuencia}
          onChange={(e) => {
            const nueva = e.target.value as FrecuenciaProgramado;
            // Resetear diaEjecucion al cambiar a una frecuencia con rango distinto:
            //   semanal: 0-6 (default lunes)
            //   mensual: 1-31 (default día actual)
            // Sin esto, un valor heredado (ej. día 10 de mensual → semanal) rompe la vista.
            setState((prev) => {
              const next = { ...prev, frecuencia: nueva };
              if (nueva === 'semanal' && (prev.diaEjecucion < 0 || prev.diaEjecucion > 6)) {
                next.diaEjecucion = 1;
              } else if (
                nueva === 'mensual' &&
                (prev.diaEjecucion < 1 || prev.diaEjecucion > 31)
              ) {
                next.diaEjecucion = new Date().getDate();
              }
              return next;
            });
          }}
          required
        >
          {FRECUENCIAS_PROGRAMADO.map((f) => (
            <option key={f} value={f}>
              {FRECUENCIA_LABELS[f]}
            </option>
          ))}
        </Select>

        {/* Campos dinámicos por frecuencia */}
        {state.frecuencia === 'semanal' && (
          <Select
            label="Día de la semana"
            value={String(state.diaEjecucion)}
            onChange={(e) => setField('diaEjecucion', Number(e.target.value))}
            error={!!errors.diaEjecucion}
            errorMessage={errors.diaEjecucion}
          >
            {[1, 2, 3, 4, 5, 6, 0].map((d) => (
              <option key={d} value={d}>
                {DIAS_SEMANA_LABELS[d]}
              </option>
            ))}
          </Select>
        )}

        {state.frecuencia === 'mensual' && (
          <>
            {!state.ultimoDiaDelMes && (
              <Input
                label="Día del mes (1-31)"
                type="number"
                min="1"
                max="31"
                value={state.diaEjecucion}
                onChange={(e) =>
                  setField('diaEjecucion', Math.max(1, Math.min(31, Number(e.target.value))))
                }
                helperText="Si el día no existe en el mes (ej. 31 en febrero), se usará el último día"
                error={!!errors.diaEjecucion}
                errorMessage={errors.diaEjecucion}
              />
            )}
            <label className="flex items-center gap-2 cursor-pointer text-sm">
              <input
                type="checkbox"
                checked={state.ultimoDiaDelMes}
                onChange={(e) => setField('ultimoDiaDelMes', e.target.checked)}
                className="h-4 w-4 rounded border-border"
              />
              <span>Usar último día del mes</span>
            </label>
          </>
        )}

        {state.frecuencia === 'personalizada' && (
          <Input
            label="Repetir cada cuántos días"
            type="number"
            min="1"
            value={state.intervaloDias}
            onChange={(e) =>
              setField('intervaloDias', Math.max(1, Number(e.target.value)))
            }
            helperText="Ej. 10 = cada 10 días desde la fecha de inicio"
            error={!!errors.intervaloDias}
            errorMessage={errors.intervaloDias}
          />
        )}

        {state.frecuencia === 'unica' && (
          <Input
            label="Fecha y hora de ejecución"
            type="datetime-local"
            value={state.fechaUnica}
            onChange={(e) => setField('fechaUnica', e.target.value)}
            error={!!errors.fechaUnica}
            errorMessage={errors.fechaUnica}
          />
        )}

        {/* Hora (no aplica si es única) */}
        {state.frecuencia !== 'unica' && (
          <Input
            label="Hora de ejecución"
            type="time"
            icon={Clock}
            value={state.hora}
            onChange={(e) => setField('hora', e.target.value)}
            helperText="Por defecto 12:00"
            error={!!errors.hora}
            errorMessage={errors.hora}
          />
        )}

        {/* Fechas inicio/fin (no aplican si es única) */}
        {state.frecuencia !== 'unica' && (
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Fecha de inicio"
              type="date"
              icon={Calendar}
              value={state.fechaInicio}
              onChange={(e) => setField('fechaInicio', e.target.value)}
              error={!!errors.fechaInicio}
              errorMessage={errors.fechaInicio}
            />
            <Input
              label="Fecha fin (opcional)"
              type="date"
              value={state.fechaFin}
              onChange={(e) => setField('fechaFin', e.target.value)}
              error={!!errors.fechaFin}
              errorMessage={errors.fechaFin}
            />
          </div>
        )}

        {/* Vista previa */}
        {proximaPreview && (
          <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
            <p className="text-xs font-semibold text-blue-900 dark:text-blue-100 uppercase tracking-wider mb-1">
              Vista previa
            </p>
            <p className="text-sm text-blue-800 dark:text-blue-200">
              {describirFrecuencia({
                frecuencia: state.frecuencia,
                diaEjecucion: state.diaEjecucion,
                ultimoDiaDelMes: state.ultimoDiaDelMes,
                intervaloDias: state.intervaloDias,
                fechaUnica: state.fechaUnica ? new Date(state.fechaUnica) : undefined,
              })}{' '}
              · próxima ejecución:{' '}
              <strong>
                {proximaPreview.toLocaleString('es-PE', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </strong>
            </p>
          </div>
        )}
      </div>
    </Modal>
  );
}
