/**
 * Hook para gestionar las notificaciones del sistema (programados, FX, etc.).
 *
 * Read vía `onSnapshot` directo a Firestore (en tiempo real).
 * Mutaciones (marcar leída, borrar) vía backend.
 */

import { useCallback, useEffect, useState } from 'react';
import {
  collection,
  onSnapshot,
  orderBy,
  query,
  where,
  Timestamp,
} from 'firebase/firestore';
import type { Unsubscribe } from 'firebase/firestore';
import { db } from '@services/firebase';
import { useAuth } from '@context/AuthContext';
import { NotificacionesService } from '@services/notificaciones';
import toast from 'react-hot-toast';
import type {
  Notificacion,
  NotificacionFirestore,
  Estado,
} from '@app-types';

interface UseNotificacionesReturn {
  notificaciones: Notificacion[];
  noLeidasCount: number;
  estado: Estado<Notificacion[]>;
  marcarLeida: (id: string) => Promise<void>;
  marcarTodasLeidas: () => Promise<void>;
  eliminar: (id: string) => Promise<void>;
}

function timestampToDate(ts: Timestamp | Date | undefined): Date {
  if (!ts) return new Date();
  if (ts instanceof Date) return ts;
  if (typeof (ts as Timestamp).toDate === 'function') return (ts as Timestamp).toDate();
  return new Date();
}

function firestoreToNotificacion(
  id: string,
  data: NotificacionFirestore,
): Notificacion {
  return {
    id,
    userId: data.userId,
    tipo: data.tipo,
    programadaId: data.programadaId,
    programadaTipo: data.programadaTipo,
    mensaje: data.mensaje,
    metadata: data.metadata,
    leida: data.leida,
    fechaEjecucionId: data.fechaEjecucionId,
    createdAt: timestampToDate(data.createdAt),
  };
}

export function useNotificaciones(): UseNotificacionesReturn {
  const { usuario } = useAuth();
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([]);
  const [estado, setEstado] = useState<Estado<Notificacion[]>>({
    data: null,
    estado: 'idle',
    error: null,
  });

  useEffect(() => {
    if (!usuario) {
      setNotificaciones([]);
      setEstado({ data: [], estado: 'success', error: null });
      return;
    }

    setEstado((prev) => ({ ...prev, estado: 'loading' }));

    const q = query(
      collection(db, 'notificaciones'),
      where('userId', '==', usuario.id),
      orderBy('createdAt', 'desc'),
    );

    const unsub: Unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const items = snapshot.docs.map((doc) =>
          firestoreToNotificacion(doc.id, doc.data() as NotificacionFirestore),
        );
        setNotificaciones(items);
        setEstado({ data: items, estado: 'success', error: null });
      },
      (error) => {
        console.error('[useNotificaciones] Listener error:', error);
        setEstado({ data: null, estado: 'error', error: error.message });
      },
    );

    return () => unsub();
  }, [usuario]);

  const marcarLeida = useCallback(async (id: string) => {
    try {
      await NotificacionesService.marcarLeida(id);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'No se pudo actualizar';
      toast.error(msg);
    }
  }, []);

  const marcarTodasLeidas = useCallback(async () => {
    try {
      const { actualizadas } = await NotificacionesService.marcarTodasLeidas();
      if (actualizadas > 0) {
        toast.success(`${actualizadas} notificacion${actualizadas === 1 ? '' : 'es'} marcada${actualizadas === 1 ? '' : 's'} como leída${actualizadas === 1 ? '' : 's'}`);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'No se pudo actualizar';
      toast.error(msg);
    }
  }, []);

  const eliminar = useCallback(async (id: string) => {
    try {
      await NotificacionesService.eliminar(id);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'No se pudo eliminar';
      toast.error(msg);
    }
  }, []);

  const noLeidasCount = notificaciones.filter((n) => !n.leida).length;

  return {
    notificaciones,
    noLeidasCount,
    estado,
    marcarLeida,
    marcarTodasLeidas,
    eliminar,
  };
}

export default useNotificaciones;
