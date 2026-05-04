/**
 * Hook de presupuestos v2 — multi-cuenta con buckets y rollover.
 *
 * - LECTURA: onSnapshot directo a Firestore para todos los presupuestos del usuario.
 * - MUTATIONS: vía backend (validación de asignación + rollover lazy).
 * - RESUMEN MENSUAL: pull on-demand via `obtenerResumen(accountId, mes)`.
 */

import { useCallback, useEffect, useState } from 'react';
import {
  collection,
  query,
  where,
  onSnapshot,
  Timestamp,
} from 'firebase/firestore';
import type { Unsubscribe } from 'firebase/firestore';
import { db } from '@services/firebase';
import { PresupuestosService } from '@services/presupuestos';
import { useAuth } from '@context/AuthContext';
import { isNetworkError } from '@utils/api-errors';
import toast from 'react-hot-toast';
import type {
  Presupuesto,
  PresupuestoFirestore,
  CreatePresupuestoDto,
  UpdatePresupuestoDto,
  PresupuestoMensualResumen,
  Estado,
} from '@app-types';

interface UsePresupuestosReturn {
  presupuestos: Presupuesto[];
  estado: Estado<Presupuesto[]>;
  /** Presupuestos del mes activo (no incluye gastado/disponible). */
  presupuestosDelMes: (mes: string, accountId?: string) => Presupuesto[];
  crear: (dto: CreatePresupuestoDto) => Promise<Presupuesto | null>;
  actualizar: (id: string, dto: UpdatePresupuestoDto) => Promise<Presupuesto | null>;
  eliminar: (id: string) => Promise<void>;
  /**
   * Snapshot mensual de una cuenta con `gastado`, `disponible` y rollover
   * calculados en el backend.
   */
  obtenerResumen: (
    accountId: string,
    mes: string,
  ) => Promise<PresupuestoMensualResumen | null>;
  /** True cuando la última llamada al backend falló por red caída. */
  backendOffline: boolean;
}

function timestampToDate(ts: Timestamp | Date | undefined): Date {
  if (!ts) return new Date();
  if (ts instanceof Date) return ts;
  if (typeof (ts as Timestamp).toDate === 'function') return (ts as Timestamp).toDate();
  return new Date();
}

function firestoreToPresupuesto(id: string, data: PresupuestoFirestore): Presupuesto {
  return {
    id,
    userId: data.userId,
    accountId: data.accountId,
    mes: data.mes,
    bucket: data.bucket,
    limite: data.limite,
    moneda: data.moneda,
    rolloverEntrada: data.rolloverEntrada,
    alertaEnviada80: data.alertaEnviada80,
    alertaEnviada100: data.alertaEnviada100,
    createdAt: timestampToDate(data.createdAt),
    updatedAt: timestampToDate(data.updatedAt),
  };
}

export function usePresupuestos(): UsePresupuestosReturn {
  const { usuario } = useAuth();
  const [presupuestos, setPresupuestos] = useState<Presupuesto[]>([]);
  const [estado, setEstado] = useState<Estado<Presupuesto[]>>({
    data: null,
    estado: 'idle',
    error: null,
  });
  const [backendOffline, setBackendOffline] = useState(false);

  /**
   * Centraliza el handling de errores de mutations/queries: si es de red,
   * marca offline (sin spamear toast); si es del API, dispara toast con el
   * mensaje específico.
   */
  const handleApiError = useCallback((error: unknown, fallbackMsg: string) => {
    if (isNetworkError(error)) {
      setBackendOffline(true);
      return;
    }
    setBackendOffline(false);
    const msg = error instanceof Error ? error.message : fallbackMsg;
    toast.error(msg);
  }, []);

  // Realtime listener
  useEffect(() => {
    if (!usuario) {
      setPresupuestos([]);
      setEstado({ data: [], estado: 'success', error: null });
      return;
    }

    setEstado((prev) => ({ ...prev, estado: 'loading' }));

    const q = query(
      collection(db, 'presupuestos'),
      where('userId', '==', usuario.id),
    );

    const unsub: Unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const items = snapshot.docs.map((doc) =>
          firestoreToPresupuesto(doc.id, doc.data() as PresupuestoFirestore),
        );
        setPresupuestos(items);
        setEstado({ data: items, estado: 'success', error: null });
      },
      (error) => {
        console.error('[usePresupuestos] Listener error:', error);
        setEstado({ data: null, estado: 'error', error: error.message });
      },
    );

    return () => unsub();
  }, [usuario]);

  // Filtrado local por mes y opcional cuenta
  const presupuestosDelMes = useCallback(
    (mes: string, accountId?: string) =>
      presupuestos.filter(
        (p) => p.mes === mes && (!accountId || p.accountId === accountId),
      ),
    [presupuestos],
  );

  // Mutations
  const crear = useCallback(
    async (dto: CreatePresupuestoDto): Promise<Presupuesto | null> => {
      try {
        const created = await PresupuestosService.create(dto);
        setBackendOffline(false);
        toast.success('Presupuesto creado');
        return created;
      } catch (error) {
        handleApiError(error, 'Error al crear presupuesto');
        return null;
      }
    },
    [handleApiError],
  );

  const actualizar = useCallback(
    async (id: string, dto: UpdatePresupuestoDto): Promise<Presupuesto | null> => {
      try {
        const updated = await PresupuestosService.update(id, dto);
        setBackendOffline(false);
        toast.success('Presupuesto actualizado');
        return updated;
      } catch (error) {
        handleApiError(error, 'Error al actualizar presupuesto');
        return null;
      }
    },
    [handleApiError],
  );

  const eliminar = useCallback(
    async (id: string): Promise<void> => {
      try {
        await PresupuestosService.remove(id);
        setBackendOffline(false);
        toast.success('Presupuesto eliminado');
      } catch (error) {
        handleApiError(error, 'Error al eliminar');
        throw error;
      }
    },
    [handleApiError],
  );

  const obtenerResumen = useCallback(
    async (accountId: string, mes: string): Promise<PresupuestoMensualResumen | null> => {
      try {
        const resumen = await PresupuestosService.getResumen(accountId, mes);
        setBackendOffline(false);
        return resumen;
      } catch (error) {
        // Para queries silenciosas (lectura) no mostramos toast: el banner
        // y el badge `backendOffline` son suficientes.
        if (isNetworkError(error)) {
          setBackendOffline(true);
        } else {
          const msg = error instanceof Error ? error.message : 'Error al obtener resumen';
          toast.error(msg);
        }
        return null;
      }
    },
    [],
  );

  return {
    presupuestos,
    estado,
    presupuestosDelMes,
    crear,
    actualizar,
    eliminar,
    obtenerResumen,
    backendOffline,
  };
}

export default usePresupuestos;
