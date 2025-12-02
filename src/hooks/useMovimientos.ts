/**
 * Hook personalizado para gestionar movimientos bancarios
 */

import { useState, useEffect, useCallback } from 'react';
import { movimientosService } from '@services/firebase';
import type { Movimiento, Estado } from '@app-types';
import { useAuth } from '@context/AuthContext';
import toast from 'react-hot-toast';

interface UseMovimientosReturn {
  movimientos: Movimiento[];
  estado: Estado<Movimiento[]>;
  cargarMovimientos: () => Promise<void>;
  crear: (
    movimiento: Omit<Movimiento, 'id' | 'createdAt' | 'updatedAt'>
  ) => Promise<Movimiento | null>;
  actualizar: (id: string, movimiento: Partial<Movimiento>) => Promise<void>;
  eliminar: (id: string) => Promise<void>;
  obtenerPorId: (id: string) => Promise<Movimiento | null>;
  obtenerPorRangoFechas: (fechaInicio: Date, fechaFin: Date) => Promise<Movimiento[]>;
  recargar: () => Promise<void>;
}

export function useMovimientos(): UseMovimientosReturn {
  const { usuario } = useAuth();
  const [movimientos, setMovimientos] = useState<Movimiento[]>([]);
  const [estado, setEstado] = useState<Estado<Movimiento[]>>({
    data: null,
    estado: 'idle',
    error: null,
  });

  /**
   * Cargar todos los movimientos del usuario
   */
  const cargarMovimientos = useCallback(async () => {
    if (!usuario) {
      setMovimientos([]);
      setEstado({ data: [], estado: 'success', error: null });
      return;
    }

    try {
      setEstado((prev) => ({ ...prev, estado: 'loading' }));
      const movimientosData = await movimientosService.obtenerPorUsuario(usuario.id);
      setMovimientos(movimientosData);
      setEstado({ data: movimientosData, estado: 'success', error: null });
    } catch (error) {
      const errorMsg =
        error instanceof Error ? error.message : 'Error al cargar movimientos';
      setEstado({ data: null, estado: 'error', error: errorMsg });
      toast.error(errorMsg);
    }
  }, [usuario]);

  useEffect(() => {
    cargarMovimientos();
  }, [cargarMovimientos]);

  /**
   * Crear un nuevo movimiento
   */
  const crear = async (
    movimientoData: Omit<Movimiento, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<Movimiento | null> => {
    if (!usuario) {
      toast.error('Debes iniciar sesión');
      return null;
    }

    try {
      const nuevoMovimiento = await movimientosService.crear(movimientoData);
      setMovimientos((prev) => [nuevoMovimiento, ...prev]);
      toast.success('Movimiento registrado exitosamente');
      return nuevoMovimiento;
    } catch (error) {
      const errorMsg =
        error instanceof Error ? error.message : 'Error al crear movimiento';
      toast.error(errorMsg);
      return null;
    }
  };

  /**
   * Actualizar un movimiento existente
   */
  const actualizar = async (
    id: string,
    movimientoData: Partial<Movimiento>
  ): Promise<void> => {
    try {
      await movimientosService.actualizar(id, movimientoData);
      setMovimientos((prev) =>
        prev.map((movimiento) =>
          movimiento.id === id
            ? { ...movimiento, ...movimientoData, updatedAt: new Date() }
            : movimiento
        )
      );
      toast.success('Movimiento actualizado exitosamente');
    } catch (error) {
      const errorMsg =
        error instanceof Error ? error.message : 'Error al actualizar movimiento';
      toast.error(errorMsg);
      throw error;
    }
  };

  /**
   * Eliminar un movimiento
   */
  const eliminar = async (id: string): Promise<void> => {
    try {
      await movimientosService.eliminar(id);
      setMovimientos((prev) => prev.filter((movimiento) => movimiento.id !== id));
      toast.success('Movimiento eliminado exitosamente');
    } catch (error) {
      const errorMsg =
        error instanceof Error ? error.message : 'Error al eliminar movimiento';
      toast.error(errorMsg);
      throw error;
    }
  };

  /**
   * Obtener un movimiento por ID
   */
  const obtenerPorId = async (id: string): Promise<Movimiento | null> => {
    try {
      return await movimientosService.obtenerPorId(id);
    } catch (error) {
      const errorMsg =
        error instanceof Error ? error.message : 'Error al obtener movimiento';
      toast.error(errorMsg);
      return null;
    }
  };

  /**
   * Obtener movimientos por rango de fechas
   */
  const obtenerPorRangoFechas = async (
    fechaInicio: Date,
    fechaFin: Date
  ): Promise<Movimiento[]> => {
    if (!usuario) return [];

    try {
      return await movimientosService.obtenerPorRangoFechas(
        usuario.id,
        fechaInicio,
        fechaFin
      );
    } catch (error) {
      const errorMsg =
        error instanceof Error ? error.message : 'Error al obtener movimientos';
      toast.error(errorMsg);
      return [];
    }
  };

  /**
   * Recargar movimientos
   */
  const recargar = async (): Promise<void> => {
    await cargarMovimientos();
  };

  return {
    movimientos,
    estado,
    cargarMovimientos,
    crear,
    actualizar,
    eliminar,
    obtenerPorId,
    obtenerPorRangoFechas,
    recargar,
  };
}

export default useMovimientos;
