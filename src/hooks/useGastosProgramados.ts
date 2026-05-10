/**
 * Hook para gestionar Gastos Programados.
 *
 * - LECTURA: listener `onSnapshot` directo a Firestore.
 * - MUTATIONS: pasan por el backend (atomicidad y validación de schedule).
 *
 * Patrón idéntico a useTransfers.
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
import { ProgramadosService } from '@services/programados';
import { useAuth } from '@context/AuthContext';
import toast from 'react-hot-toast';
import type {
  GastoProgramado,
  GastoProgramadoFirestore,
  CreateGastoProgramadoDto,
  UpdateGastoProgramadoDto,
  Estado,
} from '@app-types';

interface UseGastosProgramadosReturn {
  gastosProgramados: GastoProgramado[];
  estado: Estado<GastoProgramado[]>;
  crear: (dto: CreateGastoProgramadoDto) => Promise<GastoProgramado | null>;
  actualizar: (
    id: string,
    dto: UpdateGastoProgramadoDto,
  ) => Promise<GastoProgramado | null>;
  eliminar: (id: string) => Promise<void>;
  pausar: (id: string) => Promise<void>;
  reanudar: (id: string) => Promise<void>;
  obtenerPorId: (id: string) => GastoProgramado | undefined;
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

function firestoreToGastoProgramado(
  id: string,
  data: GastoProgramadoFirestore,
): GastoProgramado {
  return {
    id,
    userId: data.userId,
    cuentaOrigenId: data.cuentaOrigenId,
    monto: data.monto,
    moneda: data.moneda,
    descripcion: data.descripcion,
    categoria: data.categoria,
    subcategoria: data.subcategoria,
    metodoPago: data.metodoPago,
    tags: data.tags,

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

export function useGastosProgramados(): UseGastosProgramadosReturn {
  const { usuario } = useAuth();
  const [gastosProgramados, setGastosProgramados] = useState<GastoProgramado[]>([]);
  const [estado, setEstado] = useState<Estado<GastoProgramado[]>>({
    data: null,
    estado: 'idle',
    error: null,
  });

  useEffect(() => {
    if (!usuario) {
      setGastosProgramados([]);
      setEstado({ data: [], estado: 'success', error: null });
      return;
    }

    setEstado((prev) => ({ ...prev, estado: 'loading' }));

    const q = query(
      collection(db, 'gastosProgramados'),
      where('userId', '==', usuario.id),
      orderBy('proximaEjecucion', 'asc'),
    );

    const unsub: Unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const items = snapshot.docs.map((doc) =>
          firestoreToGastoProgramado(doc.id, doc.data() as GastoProgramadoFirestore),
        );
        setGastosProgramados(items);
        setEstado({ data: items, estado: 'success', error: null });
      },
      (error) => {
        console.error('[useGastosProgramados] Listener error:', error);
        setEstado({ data: null, estado: 'error', error: error.message });
      },
    );

    return () => unsub();
  }, [usuario]);

  const crear = useCallback(
    async (dto: CreateGastoProgramadoDto): Promise<GastoProgramado | null> => {
      try {
        const created = await ProgramadosService.create(dto);
        toast.success('Gasto programado creado');
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
      dto: UpdateGastoProgramadoDto,
    ): Promise<GastoProgramado | null> => {
      try {
        const updated = await ProgramadosService.update(id, dto);
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
      await ProgramadosService.remove(id);
      toast.success('Programación eliminada');
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Error al eliminar';
      toast.error(msg);
      throw error;
    }
  }, []);

  const pausar = useCallback(async (id: string): Promise<void> => {
    try {
      await ProgramadosService.pause(id);
      toast.success('Programación pausada');
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Error al pausar';
      toast.error(msg);
      throw error;
    }
  }, []);

  const reanudar = useCallback(async (id: string): Promise<void> => {
    try {
      await ProgramadosService.resume(id);
      toast.success('Programación reanudada');
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Error al reanudar';
      toast.error(msg);
      throw error;
    }
  }, []);

  const obtenerPorId = useCallback(
    (id: string) => gastosProgramados.find((g) => g.id === id),
    [gastosProgramados],
  );

  return {
    gastosProgramados,
    estado,
    crear,
    actualizar,
    eliminar,
    pausar,
    reanudar,
    obtenerPorId,
  };
}

export default useGastosProgramados;
