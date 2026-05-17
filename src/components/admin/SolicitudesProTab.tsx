/**
 * Tab: solicitudes PRO pendientes (aprobar / rechazar).
 * Lógica extraída del AdminDashboard original.
 */

import { useState, useEffect, useCallback } from 'react';
import { authService } from '@services/firebase';
import type { Usuario } from '@app-types';
import { Check, X, Loader2, User } from 'lucide-react';
import toast from 'react-hot-toast';
import Button from '../common/Button';
import { formatearFechaCorta } from '@utils/formatters';

export default function SolicitudesProTab() {
  const [requests, setRequests] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setRequests(await authService.getPendingProRequests());
    } catch {
      toast.error('Error al cargar solicitudes');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const resolver = async (
    userId: string,
    accion: 'approve' | 'reject',
  ) => {
    try {
      setProcessingId(userId);
      if (accion === 'approve') {
        await authService.approveProRequest(userId);
        toast.success('Solicitud aprobada');
      } else {
        await authService.rejectProRequest(userId);
        toast.success('Solicitud rechazada');
      }
      setRequests((prev) => prev.filter((u) => u.id !== userId));
    } catch {
      toast.error('Error al procesar la solicitud');
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (requests.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <User className="w-12 h-12 mx-auto mb-4 opacity-20" />
        <p>No hay solicitudes pendientes</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {requests.map((user) => (
        <div
          key={user.id}
          className="flex items-center justify-between p-4 bg-muted/50 rounded-lg border hover:border-primary/50 transition-colors"
        >
          <div className="flex items-center gap-4 min-w-0">
            {user.photoURL ? (
              <img
                src={user.photoURL}
                alt={user.nombre}
                className="w-10 h-10 rounded-full flex-shrink-0"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <User className="w-5 h-5 text-primary" />
              </div>
            )}
            <div className="min-w-0">
              <p className="font-medium truncate">{user.nombre}</p>
              <p className="text-sm text-muted-foreground truncate">
                {user.email}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Registrado: {formatearFechaCorta(user.createdAt)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <Button
              iconOnly
              variant="ghost"
              className="text-red-600 hover:bg-red-50 rounded-full"
              onClick={() => resolver(user.id, 'reject')}
              loading={processingId === user.id}
              disabled={processingId !== null}
              icon={X}
              title="Rechazar"
            />
            <Button
              iconOnly
              variant="ghost"
              className="text-green-600 hover:bg-green-50 rounded-full"
              onClick={() => resolver(user.id, 'approve')}
              loading={processingId === user.id}
              disabled={processingId !== null}
              icon={Check}
              title="Aprobar"
            />
          </div>
        </div>
      ))}
    </div>
  );
}
