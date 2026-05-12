/**
 * Página /programados — lista los gastos programados del usuario.
 *
 * Cada card muestra: descripción, monto, frecuencia humana, próxima ejecución,
 * estado activo/pausado, y acciones (Pausar/Reanudar, Editar, Eliminar).
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
  Wallet,
  AlertCircle,
  History,
} from 'lucide-react';
import Button from '@components/common/Button';
import { EmptyState } from '@components/common/EmptyState';
import CustomLoader from '@components/common/CustomLoader';
import ConfirmationModal from '@components/common/ConfirmationModal';
import FormularioGastoProgramado from './FormularioGastoProgramado';
import HistorialEjecuciones from './HistorialEjecuciones';
import { useGastosProgramados } from '@hooks/useGastosProgramados';
import { useAccountsContext } from '@context/AccountsContext';
import { useConfig } from '@context/ConfigContext';
import { describirFrecuencia } from '@utils/programados';
import { MONEDA_SIMBOLOS, type GastoProgramado } from '@app-types';

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

export default function ListaGastosProgramados() {
  const { gastosProgramados, estado, eliminar, pausar, reanudar } = useGastosProgramados();
  const { activeAccounts } = useAccountsContext();
  const { getCategoryLabel, getCategoryColor, getCategoryIcon } = useConfig();

  const [formAbierto, setFormAbierto] = useState(false);
  const [editando, setEditando] = useState<GastoProgramado | undefined>(undefined);
  const [eliminando, setEliminando] = useState<GastoProgramado | null>(null);
  const [historialDe, setHistorialDe] = useState<GastoProgramado | null>(null);

  const cuentasMap = useMemo(() => {
    const m = new Map<string, (typeof activeAccounts)[number]>();
    for (const a of activeAccounts) m.set(a.id, a);
    return m;
  }, [activeAccounts]);

  const handleNuevo = () => {
    setEditando(undefined);
    setFormAbierto(true);
  };

  const handleEditar = (g: GastoProgramado) => {
    setEditando(g);
    setFormAbierto(true);
  };

  const handleConfirmarEliminar = async () => {
    if (!eliminando) return;
    try {
      await eliminar(eliminando.id);
      setEliminando(null);
    } catch {
      // toast ya mostrado por el hook
    }
  };

  const handleTogglePausa = async (g: GastoProgramado) => {
    if (g.activo) await pausar(g.id);
    else await reanudar(g.id);
  };

  // Loading
  if (estado.estado === 'loading' && gastosProgramados.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <CustomLoader />
      </div>
    );
  }

  // Error
  if (estado.estado === 'error') {
    return (
      <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 flex items-start gap-3">
        <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold text-destructive">Error al cargar programaciones</p>
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
          Nuevo gasto
        </Button>
      </div>

      {/* Empty state */}
      {gastosProgramados.length === 0 ? (
        <EmptyState
          icon={Repeat}
          title="Aún no tienes gastos programados"
          description="Crea tu primer gasto recurrente: alquiler, internet, gimnasio, suscripciones..."
          action={{
            label: 'Crear el primero',
            onClick: handleNuevo,
            icon: Plus,
          }}
        />
      ) : (
        <div className="space-y-3">
          {gastosProgramados.map((g) => {
            const cuenta = cuentasMap.get(g.cuentaOrigenId);
            const categoriaColor = getCategoryColor(g.categoria);
            const categoriaIcon = getCategoryIcon(g.categoria);
            const categoriaLabel = getCategoryLabel(g.categoria);

            return (
              <div
                key={g.id}
                className={`p-4 rounded-xl border transition-all ${
                  g.activo
                    ? 'bg-card border-border'
                    : 'bg-muted/40 border-border opacity-70'
                }`}
              >
                <div className="flex items-start gap-3">
                  {/* Icono categoría */}
                  <div
                    className="h-10 w-10 rounded-lg flex items-center justify-center text-xl flex-shrink-0"
                    style={{ backgroundColor: `${categoriaColor}20`, color: categoriaColor }}
                  >
                    {categoriaIcon}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h3 className="font-semibold text-foreground truncate">
                          {g.descripcion}
                        </h3>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {categoriaLabel}
                          {!g.activo && ' · Pausado'}
                        </p>
                      </div>
                      <p className="font-bold text-lg text-foreground whitespace-nowrap">
                        {formatMonto(g.monto, g.moneda)}
                      </p>
                    </div>

                    {/* Detalles */}
                    <div className="mt-3 space-y-1 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <Repeat className="h-3.5 w-3.5" />
                        <span>{describirFrecuencia(g)}</span>
                      </div>
                      {g.activo && (
                        <div className="flex items-center gap-1.5">
                          <CalendarIcon className="h-3.5 w-3.5" />
                          <span>Próxima: {formatProxima(g.proximaEjecucion)}</span>
                        </div>
                      )}
                      {cuenta && (
                        <div className="flex items-center gap-1.5">
                          <Wallet className="h-3.5 w-3.5" />
                          <span>{cuenta.name}</span>
                        </div>
                      )}
                    </div>

                    {/* Acciones */}
                    <div className="flex items-center gap-2 mt-3">
                      <Button
                        variant="ghost"
                        size="sm"
                        icon={g.activo ? Pause : Play}
                        onClick={() => handleTogglePausa(g)}
                      >
                        {g.activo ? 'Pausar' : 'Reanudar'}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        icon={Pencil}
                        onClick={() => handleEditar(g)}
                      >
                        Editar
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        icon={History}
                        onClick={() => setHistorialDe(g)}
                      >
                        Historial
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        icon={Trash2}
                        onClick={() => setEliminando(g)}
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

      {/* Modal formulario */}
      <FormularioGastoProgramado
        isOpen={formAbierto}
        onClose={() => setFormAbierto(false)}
        gasto={editando}
      />

      {/* Modal confirmación de eliminar */}
      <ConfirmationModal
        isOpen={!!eliminando}
        onClose={() => setEliminando(null)}
        onConfirm={handleConfirmarEliminar}
        title="Eliminar programación"
        description={
          eliminando
            ? `¿Eliminar "${eliminando.descripcion}"? Las ejecuciones ya generadas no se borran.`
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
          tipo="gasto"
          titulo={historialDe.descripcion}
        />
      )}
    </div>
  );
}
