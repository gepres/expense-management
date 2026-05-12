/**
 * Panel de notificaciones del SISTEMA (separado de las de compartidos).
 *
 * Muestra eventos generados por el cron del backend de programados:
 *   - saldo_insuficiente
 *   - ejecucion_fallida
 *   - cuenta_destino_eliminada
 *   - fx_api_error
 *
 * El read es reactivo (onSnapshot a Firestore). Marcar como leída / borrar
 * pasan por el backend (las reglas Firestore permiten ambas ops al dueño).
 */

import { useNavigate } from 'react-router-dom';
import { AlertCircle, Check, CheckCheck, Trash2, X } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { useNotificaciones } from '@hooks/useNotificaciones';
import {
  TIPO_NOTIFICACION_ICONS,
  TIPO_NOTIFICACION_LABELS,
  type Notificacion,
} from '@app-types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function NotificacionesSistemaPanel({ isOpen, onClose }: Props) {
  const navigate = useNavigate();
  const {
    notificaciones,
    noLeidasCount,
    estado,
    marcarLeida,
    marcarTodasLeidas,
    eliminar,
  } = useNotificaciones();

  if (!isOpen) return null;

  const handleClick = async (n: Notificacion) => {
    if (!n.leida) await marcarLeida(n.id);
    onClose();
    navigate('/programados');
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 z-40"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div
        role="dialog"
        aria-label="Notificaciones del sistema"
        className="fixed top-0 right-0 h-full w-full sm:w-96 bg-card border-l border-border shadow-xl z-50 flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-amber-500" />
            <h2 className="text-sm font-semibold text-foreground">
              Alertas del sistema
            </h2>
            {noLeidasCount > 0 && (
              <span className="text-xs bg-destructive text-destructive-foreground rounded-full px-2 py-0.5 font-bold">
                {noLeidasCount}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1">
            {noLeidasCount > 0 && (
              <button
                onClick={marcarTodasLeidas}
                className="p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                title="Marcar todas como leídas"
              >
                <CheckCheck className="h-4 w-4" />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
              title="Cerrar"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto">
          {estado.estado === 'loading' && (
            <div className="flex items-center justify-center h-32 text-sm text-muted-foreground">
              Cargando...
            </div>
          )}

          {estado.estado === 'success' && notificaciones.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full px-6 text-center">
              <AlertCircle className="h-10 w-10 text-muted-foreground/40 mb-3" />
              <p className="text-sm font-medium text-foreground mb-1">
                Sin alertas
              </p>
              <p className="text-xs text-muted-foreground">
                Cuando un gasto o transferencia programada no pueda ejecutarse,
                aparecerá aquí.
              </p>
            </div>
          )}

          {estado.estado === 'error' && (
            <div className="px-4 py-6 text-sm text-destructive">
              Error al cargar notificaciones: {estado.error}
            </div>
          )}

          <ul className="divide-y divide-border">
            {notificaciones.map((n) => (
              <li
                key={n.id}
                className={`relative group ${
                  n.leida ? 'bg-card' : 'bg-amber-50/40 dark:bg-amber-900/10'
                }`}
              >
                <button
                  type="button"
                  onClick={() => handleClick(n)}
                  className="w-full text-left px-4 py-3 hover:bg-accent transition-colors"
                >
                  <div className="flex gap-3">
                    <span className="text-2xl flex-shrink-0" aria-hidden="true">
                      {TIPO_NOTIFICACION_ICONS[n.tipo]}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-xs font-semibold text-foreground">
                          {TIPO_NOTIFICACION_LABELS[n.tipo]}
                        </span>
                        {!n.leida && (
                          <span className="h-2 w-2 rounded-full bg-amber-500" />
                        )}
                      </div>
                      <p className="text-sm text-foreground line-clamp-2">
                        {n.mensaje}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatDistanceToNow(n.createdAt, {
                          addSuffix: true,
                          locale: es,
                        })}
                      </p>
                    </div>
                  </div>
                </button>

                {/* Acciones */}
                <div className="absolute right-2 top-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  {!n.leida && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        marcarLeida(n.id);
                      }}
                      className="p-1.5 rounded bg-card border border-border hover:bg-accent transition-colors"
                      title="Marcar como leída"
                    >
                      <Check className="h-3.5 w-3.5 text-foreground" />
                    </button>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      eliminar(n.id);
                    }}
                    className="p-1.5 rounded bg-card border border-border hover:bg-destructive hover:text-destructive-foreground transition-colors"
                    title="Eliminar"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
}
