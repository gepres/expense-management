/**
 * Hook para gestionar Transferencias Programadas.
 *
 * Reads vía onSnapshot, mutations vía backend.
 * Patrón idéntico a useGastosProgramados.
 */

import { useEffect, useState, useCallback } from 'react';
import {
  collection,
  query,
  where,
  onSnapshot,
  orderBy,
  Timestamp,
} from 'firebase/firestore';
import type { Unsubscribe } from 'firebase/firestore';
import { db } from '@services/firebase';
import { TransferenciasProgramadasService } from '@services/transferencias-programadas';
import { useAuth } from '@context/AuthContext';
import toast from 'react-hot-toast';
import type {
  TransferenciaProgramada,
  TransferenciaProgramadaFirestore,
  CreateTransferenciaProgramadaDto,
  UpdateTransferenciaProgramadaDto,
  Estado,
} from '@app-types';

interface UseTransferenciasProgramadasReturn {
  transferenciasProgramadas: TransferenciaProgramada[];
  estado: Estado<TransferenciaProgramada[]>;
  crear: (
    dto: CreateTransferenciaProgramadaDto,
  ) => Promise<TransferenciaProgramada | null>;
  actualizar: (
    id: string,
    dto: UpdateTransferenciaProgramadaDto,
  ) => Promise<TransferenciaProgramada | null>;
  eliminar: (id: string) => Promise<void>;
  pausar: (id: string) => Promise<void>;
  reanudar: (id: string) => Promise<void>;
  obtenerPorId: (id: string) => TransferenciaProgramada | undefined;
}

function timestampToDate(ts: Timestamp | Date | undefined): Date | undefined {
  if (!ts) return undefined;
  if (ts instanceof Date) return ts;
  if (typeof (ts as Timestamp).toDate === 'function') return (ts as Timestamp).toDate();
  return undefined;
}

function timestampToDateRequired(ts: Timestamp | Date | undefined): Date {
  return timestampToDate(ts) ?? new Date();
}

function firestoreToTransferenciaProgramada(
  id: string,
  data: TransferenciaProgramadaFirestore,
): TransferenciaProgramada {
  return {
    id,
    userId: data.userId,
    cuentaOrigenId: data.cuentaOrigenId,
    cuentaDestinoId: data.cuentaDestinoId,
    monto: data.monto,
    moneda: data.moneda,
    descripcion: data.descripcion,

    frecuencia: data.frecuencia,
    diaEjecucion: data.diaEjecucion,
    ultimoDiaDelMes: data.ultimoDiaDelMes,
    intervaloDias: data.intervaloDias,
    fechaUnica: timestampToDate(data.fechaUnica),
    hora: data.hora,
    zonaHoraria: data.zonaHoraria,
    fechaInicio: timestampToDateRequired(data.fechaInicio),
    fechaFin: timestampToDate(data.fechaFin),

    activo: data.activo,
    proximaEjecucion: timestampToDateRequired(data.proximaEjecucion),
    ultimaEjecucion: timestampToDate(data.ultimaEjecucion),
    totalEjecuciones: data.totalEjecuciones,

    createdAt: timestampToDateRequired(data.createdAt),
    updatedAt: timestampToDateRequired(data.updatedAt),
  };
}

export function useTransferenciasProgramadas(): UseTransferenciasProgramadasReturn {
  const { usuario } = useAuth();
  const [transferenciasProgramadas, setTransferenciasProgramadas] = useState<
    TransferenciaProgramada[]
  >([]);
  const [estado, setEstado] = useState<Estado<TransferenciaProgramada[]>>({
    data: null,
    estado: 'idle',
    error: null,
  });

  useEffect(() => {
    if (!usuario) {
      setTransferenciasProgramadas([]);
      setEstado({ data: [], estado: 'success', error: null });
      return;
    }

    setEstado((prev) => ({ ...prev, estado: 'loading' }));

    const q = query(
      collection(db, 'transferenciasProgramadas'),
      where('userId', '==', usuario.id),
      orderBy('proximaEjecucion', 'asc'),
    );

    const unsub: Unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const items = snapshot.docs.map((doc) =>
          firestoreToTransferenciaProgramada(
            doc.id,
            doc.data() as TransferenciaProgramadaFirestore,
          ),
        );
        setTransferenciasProgramadas(items);
        setEstado({ data: items, estado: 'success', error: null });
      },
      (error) => {
        console.error('[useTransferenciasProgramadas] Listener error:', error);
        setEstado({ data: null, estado: 'error', error: error.message });
      },
    );

    return () => unsub();
  }, [usuario]);

  const crear = useCallback(
    async (
      dto: CreateTransferenciaProgramadaDto,
    ): Promise<TransferenciaProgramada | null> => {
      try {
        const created = await TransferenciasProgramadasService.create(dto);
        toast.success('Transferencia programada creada');
        return created;
      } catch (error) {
        const msg = error instanceof Error ? error.message : 'Error al crear';
        toast.error(msg);
        return null;
      }
    },
    [],
  );

  const actualizar = useCallback(
    async (
      id: string,
      dto: UpdateTransferenciaProgramadaDto,
    ): Promise<TransferenciaProgramada | null> => {
      try {
        const updated = await TransferenciasProgramadasService.update(id, dto);
        toast.success('Programación actualizada');
        return updated;
      } catch (error) {
        const msg = error instanceof Error ? error.message : 'Error al actualizar';
        toast.error(msg);
        return null;
      }
    },
    [],
  );

  const eliminar = useCallback(async (id: string): Promise<void> => {
    try {
      await TransferenciasProgramadasService.remove(id);
      toast.success('Programación eliminada');
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Error al eliminar';
      toast.error(msg);
      throw error;
    }
  }, []);

  const pausar = useCallback(async (id: string): Promise<void> => {
    try {
      await TransferenciasProgramadasService.pause(id);
      toast.success('Programación pausada');
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Error al pausar';
      toast.error(msg);
      throw error;
    }
  }, []);

  const reanudar = useCallback(async (id: string): Promise<void> => {
    try {
      await TransferenciasProgramadasService.resume(id);
      toast.success('Programación reanudada');
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Error al reanudar';
      toast.error(msg);
      throw error;
    }
  }, []);

  const obtenerPorId = useCallback(
    (id: string) => transferenciasProgramadas.find((t) => t.id === id),
    [transferenciasProgramadas],
  );

  return {
    transferenciasProgramadas,
    estado,
    crear,
    actualizar,
    eliminar,
    pausar,
    reanudar,
    obtenerPorId,
  };
}

export default useTransferenciasProgramadas;
