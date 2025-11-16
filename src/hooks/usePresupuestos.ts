/**
 * Hook personalizado para gestionar presupuestos
 */

import { useState, useEffect, useCallback } from 'react';
import { presupuestosService } from '@services/firebase';
import type { Presupuesto, Estado } from '@types/index';
import { useAuth } from '@context/AuthContext';
import { formatearMesKey } from '@utils/formatters';
import toast from 'react-hot-toast';

interface UsePresupuestosReturn {
  presupuestos: Presupuesto[];
  estado: Estado<Presupuesto[]>;
  cargarPresupuestos: (mes?: string) => Promise<void>;
  crear: (
    presupuesto: Omit<Presupuesto, 'id' | 'createdAt' | 'updatedAt'>
  ) => Promise<Presupuesto | null>;
  actualizar: (id: string, presupuesto: Partial<Presupuesto>) => Promise<void>;
  eliminar: (id: string) => Promise<void>;
  obtenerPorMes: (mes: string) => Promise<Presupuesto[]>;
  recargar: () => Promise<void>;
}

export function usePresupuestos(mesInicial?: string): UsePresupuestosReturn {
  const { usuario } = useAuth();
  const [mesActual, setMesActual] = useState(mesInicial || formatearMesKey(new Date()));
  const [presupuestos, setPresupuestos] = useState<Presupuesto[]>([]);
  const [estado, setEstado] = useState<Estado<Presupuesto[]>>({
    data: null,
    estado: 'idle',
    error: null,
  });

  /**
   * Cargar presupuestos de un mes (por defecto el mes actual)
   */
  const cargarPresupuestos = useCallback(async (mes?: string) => {
    const mesACargar = mes || mesActual;

    // Actualizar el mes actual si se proporciona uno nuevo
    if (mes && mes !== mesActual) {
      setMesActual(mes);
    }

    if (!usuario) {
      setPresupuestos([]);
      setEstado({ data: [], estado: 'success', error: null });
      return;
    }

    try {
      setEstado((prev) => ({ ...prev, estado: 'loading' }));
      const presupuestosData = await presupuestosService.obtenerPorMes(
        usuario.id,
        mesACargar
      );
      setPresupuestos(presupuestosData);
      setEstado({ data: presupuestosData, estado: 'success', error: null });
    } catch (error) {
      const errorMsg =
        error instanceof Error ? error.message : 'Error al cargar presupuestos';
      setEstado({ data: null, estado: 'error', error: errorMsg });
      toast.error(errorMsg);
    }
  }, [usuario, mesActual]);

  useEffect(() => {
    cargarPresupuestos();
  }, [cargarPresupuestos]);

  /**
   * Crear un nuevo presupuesto
   */
  const crear = async (
    presupuestoData: Omit<Presupuesto, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<Presupuesto | null> => {
    if (!usuario) {
      toast.error('Debes iniciar sesión');
      return null;
    }

    try {
      const nuevoPresupuesto = await presupuestosService.crear(presupuestoData);
      setPresupuestos((prev) => [...prev, nuevoPresupuesto]);
      toast.success('Presupuesto creado exitosamente');
      return nuevoPresupuesto;
    } catch (error) {
      const errorMsg =
        error instanceof Error ? error.message : 'Error al crear presupuesto';
      toast.error(errorMsg);
      return null;
    }
  };

  /**
   * Actualizar un presupuesto existente
   */
  const actualizar = async (
    id: string,
    presupuestoData: Partial<Presupuesto>
  ): Promise<void> => {
    try {
      await presupuestosService.actualizar(id, presupuestoData);
      setPresupuestos((prev) =>
        prev.map((presupuesto) =>
          presupuesto.id === id
            ? { ...presupuesto, ...presupuestoData, updatedAt: new Date() }
            : presupuesto
        )
      );
      toast.success('Presupuesto actualizado exitosamente');
    } catch (error) {
      const errorMsg =
        error instanceof Error ? error.message : 'Error al actualizar presupuesto';
      toast.error(errorMsg);
      throw error;
    }
  };

  /**
   * Eliminar un presupuesto
   */
  const eliminar = async (id: string): Promise<void> => {
    try {
      await presupuestosService.eliminar(id);
      setPresupuestos((prev) => prev.filter((presupuesto) => presupuesto.id !== id));
      toast.success('Presupuesto eliminado exitosamente');
    } catch (error) {
      const errorMsg =
        error instanceof Error ? error.message : 'Error al eliminar presupuesto';
      toast.error(errorMsg);
      throw error;
    }
  };

  /**
   * Obtener presupuestos de un mes específico
   */
  const obtenerPorMes = async (mes: string): Promise<Presupuesto[]> => {
    if (!usuario) return [];

    try {
      return await presupuestosService.obtenerPorMes(usuario.id, mes);
    } catch (error) {
      const errorMsg =
        error instanceof Error ? error.message : 'Error al obtener presupuestos';
      toast.error(errorMsg);
      return [];
    }
  };

  /**
   * Recargar presupuestos
   */
  const recargar = async (): Promise<void> => {
    await cargarPresupuestos();
  };

  return {
    presupuestos,
    estado,
    cargarPresupuestos,
    crear,
    actualizar,
    eliminar,
    obtenerPorMes,
    recargar,
  };
}

export default usePresupuestos;
