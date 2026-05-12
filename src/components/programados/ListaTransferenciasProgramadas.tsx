/**
 * Lista de Transferencias Programadas (subpágina dentro de /programados).
 * Sigue el mismo layout que ListaGastosProgramados pero sin header propio
 * (el header lo pone el contenedor Programados con tabs).
 */

import { useMemo, useState } from 'react';
import {
  Plus,
  Pause,
  Play,
  Pencil,
  Trash2,
  Repeat,
  Calendar as CalendarIcon,
  ArrowRight,
  AlertCircle,
  History,
} from 'lucide-react';
import Button from '@components/common/Button';
import { EmptyState } from '@components/common/EmptyState';
import CustomLoader from '@components/common/CustomLoader';
import ConfirmationModal from '@components/common/ConfirmationModal';
import FormularioTransferenciaProgramada from './FormularioTransferenciaProgramada';
import HistorialEjecuciones from './HistorialEjecuciones';
import { useTransferenciasProgramadas } from '@hooks/useTransferenciasProgramadas';
import { useAccountsContext } from '@context/AccountsContext';
import { describirFrecuencia } from '@utils/programados';
import { MONEDA_SIMBOLOS, type TransferenciaProgramada } from '@app-types';

function formatMonto(monto: number, moneda: keyof typeof MONEDA_SIMBOLOS): string {
  const simbolo = MONEDA_SIMBOLOS[moneda] ?? moneda;
  return `${simbolo} ${monto.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatProxima(fecha: Date): string {
  return fecha.toLocaleString('es-PE', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function ListaTransferenciasProgramadas() {
  const { transferenciasProgramadas, estado, eliminar, pausar, reanudar } =
    useTransferenciasProgramadas();
  const { activeAccounts } = useAccountsContext();

  const [formAbierto, setFormAbierto] = useState(false);
  const [editando, setEditando] = useState<TransferenciaProgramada | undefined>(
    undefined,
  );
  const [eliminando, setEliminando] = useState<TransferenciaProgramada | null>(null);
  const [historialDe, setHistorialDe] = useState<TransferenciaProgramada | null>(null);

  const cuentasMap = useMemo(() => {
    const m = new Map<string, (typeof activeAccounts)[number]>();
    for (const a of activeAccounts) m.set(a.id, a);
    return m;
  }, [activeAccounts]);

  const handleNuevo = () => {
    setEditando(undefined);
    setFormAbierto(true);
  };

  const handleEditar = (t: TransferenciaProgramada) => {
    setEditando(t);
    setFormAbierto(true);
  };

  const handleConfirmarEliminar = async () => {
    if (!eliminando) return;
    try {
      await eliminar(eliminando.id);
      setEliminando(null);
    } catch {
      // toast lo muestra el hook
    }
  };

  const handleTogglePausa = async (t: TransferenciaProgramada) => {
    if (t.activo) await pausar(t.id);
    else await reanudar(t.id);
  };

  if (estado.estado === 'loading' && transferenciasProgramadas.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <CustomLoader />
      </div>
    );
  }

  if (estado.estado === 'error') {
    return (
      <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 flex items-start gap-3">
        <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold text-destructive">
            Error al cargar transferencias programadas
          </p>
          <p className="text-sm text-destructive/80 mt-1">{estado.error}</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Botón nuevo */}
      <div className="flex justify-end mb-4">
        <Button variant="primary" icon={Plus} onClick={handleNuevo}>
          Nueva transferencia
        </Button>
      </div>

      {transferenciasProgramadas.length === 0 ? (
        <EmptyState
          icon={Repeat}
          title="Aún no tienes transferencias programadas"
          description="Programa movimientos automáticos entre tus cuentas: ahorro mensual, fondo de emergencia, separar para inversiones..."
          action={{
            label: 'Crear la primera',
            onClick: handleNuevo,
            icon: Plus,
          }}
        />
      ) : (
        <div className="space-y-3">
          {transferenciasProgramadas.map((t) => {
            const origen = cuentasMap.get(t.cuentaOrigenId);
            const destino = cuentasMap.get(t.cuentaDestinoId);

            return (
              <div
                key={t.id}
                className={`p-4 rounded-xl border transition-all ${
                  t.activo
                    ? 'bg-card border-border'
                    : 'bg-muted/40 border-border opacity-70'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-lg flex items-center justify-center bg-blue-500/10 text-blue-600 dark:text-blue-400 flex-shrink-0">
                    <ArrowRight className="h-5 w-5" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h3 className="font-semibold text-foreground truncate">
                          {t.descripcion || 'Transferencia programada'}
                        </h3>
                        <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1.5 flex-wrap">
                          <span className="truncate">
                            {origen?.name ?? t.cuentaOrigenId}
                          </span>
                          <ArrowRight className="h-3 w-3 flex-shrink-0" />
                          <span className="truncate">
                            {destino?.name ?? t.cuentaDestinoId}
                          </span>
                          {!t.activo && <span className="ml-1">· Pausado</span>}
                        </p>
                      </div>
                      <p className="font-bold text-lg text-foreground whitespace-nowrap">
                        {formatMonto(t.monto, t.moneda)}
                      </p>
                    </div>

                    <div className="mt-3 space-y-1 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <Repeat className="h-3.5 w-3.5" />
                        <span>{describirFrecuencia(t)}</span>
                      </div>
                      {t.activo && (
                        <div className="flex items-center gap-1.5">
                          <CalendarIcon className="h-3.5 w-3.5" />
                          <span>Próxima: {formatProxima(t.proximaEjecucion)}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center flex-wrap gap-2 mt-3">
                      <Button
                        variant="ghost"
                        size="sm"
                        icon={t.activo ? Pause : Play}
                        onClick={() => handleTogglePausa(t)}
                      >
                        {t.activo ? 'Pausar' : 'Reanudar'}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        icon={Pencil}
                        onClick={() => handleEditar(t)}
                      >
                        Editar
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        icon={History}
                        onClick={() => setHistorialDe(t)}
                      >
                        Historial
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        icon={Trash2}
                        onClick={() => setEliminando(t)}
                      >
                        Eliminar
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <FormularioTransferenciaProgramada
        isOpen={formAbierto}
        onClose={() => setFormAbierto(false)}
        transferencia={editando}
      />

      <ConfirmationModal
        isOpen={!!eliminando}
        onClose={() => setEliminando(null)}
        onConfirm={handleConfirmarEliminar}
        title="Eliminar programación"
        description={
          eliminando
            ? `¿Eliminar la transferencia programada "${eliminando.descripcion || 'sin descripción'}"? Las ejecuciones ya generadas no se borran.`
            : ''
        }
        confirmText="Eliminar"
        isDestructive
      />

      {historialDe && (
        <HistorialEjecuciones
          isOpen
          onClose={() => setHistorialDe(null)}
          programadaId={historialDe.id}
          tipo="transferencia"
          titulo={historialDe.descripcion || 'Historial de la transferencia'}
        />
      )}
    </div>
  );
}
