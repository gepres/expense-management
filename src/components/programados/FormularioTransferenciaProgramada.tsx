/**
 * Modal para crear/editar una Transferencia Programada.
 * Sin categoría/subcategoría/método. Dos cuentas (origen + destino) que
 * deben tener la misma moneda.
 */

import { useEffect, useMemo, useState } from 'react';
import {
  ArrowRight,
  Calendar,
  CircleDollarSign,
  Clock,
  Repeat,
} from 'lucide-react';
import Modal, { ModalFooterActions } from '@components/common/Modal';
import { Input, Select } from '@components/common/Input';
import SelectorCuenta from '@components/cuentas/SelectorCuenta';
import { useTransferenciasProgramadas } from '@hooks/useTransferenciasProgramadas';
import { calcularProximaEjecucion, describirFrecuencia } from '@utils/programados';
import { transferenciaProgramadaFormSchema } from '@utils/validators-programados';
import {
  FRECUENCIAS_PROGRAMADO,
  FRECUENCIA_LABELS,
  DIAS_SEMANA_LABELS,
  type FrecuenciaProgramado,
  type Moneda,
  type TransferenciaProgramada,
} from '@app-types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  transferencia?: TransferenciaProgramada;
  onSuccess?: (t: TransferenciaProgramada) => void;
}

interface FormState {
  cuentaOrigenId: string;
  cuentaDestinoId: string;
  monto: string;
  moneda: Moneda;
  descripcion: string;

  frecuencia: FrecuenciaProgramado;
  diaEjecucion: number;
  ultimoDiaDelMes: boolean;
  intervaloDias: number;
  fechaUnica: string;
  hora: string;
  fechaInicio: string;
  fechaFin: string;
}

function dateToInputValue(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function dateTimeToInputValue(d: Date): string {
  return `${dateToInputValue(d)}T${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

function buildInitialState(t?: TransferenciaProgramada): FormState {
  const now = new Date();
  if (!t) {
    return {
      cuentaOrigenId: '',
      cuentaDestinoId: '',
      monto: '',
      moneda: 'PEN',
      descripcion: '',
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
    cuentaOrigenId: t.cuentaOrigenId,
    cuentaDestinoId: t.cuentaDestinoId,
    monto: String(t.monto),
    moneda: t.moneda,
    descripcion: t.descripcion ?? '',
    frecuencia: t.frecuencia,
    diaEjecucion: t.diaEjecucion ?? new Date().getDate(),
    ultimoDiaDelMes: t.ultimoDiaDelMes ?? false,
    intervaloDias: t.intervaloDias ?? 7,
    fechaUnica: t.fechaUnica ? dateTimeToInputValue(t.fechaUnica) : '',
    hora: t.hora,
    fechaInicio: dateToInputValue(t.fechaInicio),
    fechaFin: t.fechaFin ? dateToInputValue(t.fechaFin) : '',
  };
}

function getZonaHorariaUsuario(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'America/Lima';
  } catch {
    return 'America/Lima';
  }
}

export default function FormularioTransferenciaProgramada({
  isOpen,
  onClose,
  transferencia,
  onSuccess,
}: Props) {
  const { crear, actualizar } = useTransferenciasProgramadas();
  const esEdicion = Boolean(transferencia);
  const [state, setState] = useState<FormState>(() =>
    buildInitialState(transferencia),
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setState(buildInitialState(transferencia));
      setErrors({});
    }
  }, [isOpen, transferencia]);

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
      cuentaDestinoId: state.cuentaDestinoId,
      monto: parseFloat(state.monto),
      moneda: state.moneda,
      descripcion: state.descripcion.trim() || undefined,

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

    const result = transferenciaProgramadaFormSchema.safeParse(dto);
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
        ? await actualizar(transferencia!.id, dto)
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
      title={esEdicion ? 'Editar transferencia programada' : 'Nueva transferencia programada'}
      subtitle="Mueve dinero entre tus cuentas automáticamente"
      size="lg"
      footer={
        <ModalFooterActions
          onCancel={onClose}
          onConfirm={handleSubmit}
          confirmText={
            submitting
              ? 'Guardando...'
              : esEdicion
              ? 'Guardar cambios'
              : 'Crear programación'
          }
          disabled={submitting}
        />
      }
    >
      <div className="space-y-4">
        {/* Cuenta origen */}
        <SelectorCuenta
          label="Cuenta origen"
          value={state.cuentaOrigenId}
          onChange={(id, account) => {
            setField('cuentaOrigenId', id);
            if (account) setField('moneda', account.currency as Moneda);
            // Si la cuenta destino es la misma, limpiarla
            if (id === state.cuentaDestinoId) {
              setField('cuentaDestinoId', '');
            }
          }}
          required
          error={errors.cuentaOrigenId}
        />

        {/* Flecha visual */}
        <div className="flex items-center justify-center text-muted-foreground">
          <ArrowRight className="h-5 w-5" />
        </div>

        {/* Cuenta destino — filtrada por currency, excluye origen */}
        <SelectorCuenta
          label="Cuenta destino"
          value={state.cuentaDestinoId}
          currency={state.moneda}
          excludeAccountId={state.cuentaOrigenId}
          onChange={(id) => setField('cuentaDestinoId', id)}
          required
          error={errors.cuentaDestinoId}
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

        {/* Descripción opcional */}
        <Input
          label="Descripción (opcional)"
          value={state.descripcion}
          onChange={(e) => setField('descripcion', e.target.value)}
          placeholder="Ej: Apartar para emergencias"
        />

        {/* Separador */}
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
                helperText="Si el día no existe en el mes, se usará el último día"
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
