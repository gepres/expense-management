/**
 * Modal con historial de ejecuciones de un programado (gasto o transferencia).
 *
 * Llama al endpoint `GET /programados/{tipo}/:id/ejecuciones` del backend
 * que devuelve hasta 100 registros de la colección `ejecucionesProgramadas`.
 */

import { useEffect, useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  Wallet,
  XCircle,
} from 'lucide-react';
import Modal from '@components/common/Modal';
import CustomLoader from '@components/common/CustomLoader';
import ProgramadosService from '@services/programados';
import TransferenciasProgramadasService from '@services/transferencias-programadas';
import type { EjecucionProgramada, EstadoEjecucion } from '@app-types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  programadaId: string;
  tipo: 'gasto' | 'transferencia';
  titulo?: string;
}

const ESTADO_META: Record<
  EstadoEjecucion,
  { label: string; color: string; icon: typeof CheckCircle2 }
> = {
  exitosa: {
    label: 'Exitosa',
    color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10',
    icon: CheckCircle2,
  },
  fallida: {
    label: 'Fallida',
    color: 'text-red-600 dark:text-red-400 bg-red-500/10',
    icon: XCircle,
  },
  saldo_insuficiente: {
    label: 'Saldo insuficiente',
    color: 'text-amber-600 dark:text-amber-400 bg-amber-500/10',
    icon: Wallet,
  },
  cancelada: {
    label: 'Cancelada',
    color: 'text-muted-foreground bg-muted',
    icon: XCircle,
  },
};

function formatDate(d: Date): string {
  return d.toLocaleString('es-PE', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function HistorialEjecuciones({
  isOpen,
  onClose,
  programadaId,
  tipo,
  titulo,
}: Props) {
  const [ejecuciones, setEjecuciones] = useState<EjecucionProgramada[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    const service =
      tipo === 'gasto'
        ? ProgramadosService
        : TransferenciasProgramadasService;

    setLoading(true);
    setError(null);
    service
      .findEjecuciones(programadaId)
      .then(setEjecuciones)
      .catch((err: unknown) => {
        const msg = err instanceof Error ? err.message : 'Error al cargar';
        setError(msg);
      })
      .finally(() => setLoading(false));
  }, [isOpen, programadaId, tipo]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={titulo ?? 'Historial de ejecuciones'}
      subtitle="Últimas 100 ejecuciones procesadas por el cron"
      size="lg"
    >
      {loading && (
        <div className="flex items-center justify-center py-10">
          <CustomLoader />
        </div>
      )}

      {!loading && error && (
        <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-destructive">No se pudo cargar el historial</p>
            <p className="text-sm text-destructive/80 mt-1">{error}</p>
          </div>
        </div>
      )}

      {!loading && !error && ejecuciones.length === 0 && (
        <div className="text-center py-10">
          <Clock className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
          <p className="text-sm font-medium text-foreground mb-1">
            Aún no hay ejecuciones
          </p>
          <p className="text-xs text-muted-foreground">
            La primera aparecerá cuando el cron procese este programado.
          </p>
        </div>
      )}

      {!loading && !error && ejecuciones.length > 0 && (
        <ul className="divide-y divide-border max-h-[60vh] overflow-y-auto -mx-4 sm:-mx-6">
          {ejecuciones.map((e) => {
            const meta = ESTADO_META[e.estado];
            const Icon = meta.icon;
            return (
              <li key={e.id} className="px-4 sm:px-6 py-3">
                <div className="flex items-start gap-3">
                  <div className={`h-9 w-9 rounded-lg flex items-center justify-center flex-shrink-0 ${meta.color}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-semibold text-foreground">
                        {meta.label}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        · {formatDate(e.fechaEjecutada)}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Programada para: {formatDate(e.fechaProgramada)}
                    </p>
                    {e.errorMensaje && (
                      <p className="text-xs text-destructive mt-1 break-words">
                        {e.errorMensaje}
                      </p>
                    )}
                    {(e.gastoCreadoId || e.transferCreadoId) && (
                      <p className="text-xs text-muted-foreground mt-1 font-mono">
                        {e.gastoCreadoId
                          ? `Gasto: ${e.gastoCreadoId}`
                          : `Transferencia: ${e.transferCreadoId}`}
                      </p>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </Modal>
  );
}
