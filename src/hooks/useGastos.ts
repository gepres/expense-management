/**
 * Hook personalizado para gestionar gastos
 */

import { useState, useEffect, useCallback } from 'react';
import { gastosService } from '@services/firebase';
import type { Gasto, FiltrosGastos, Estado } from '@types';
import { useAuth } from '@context/AuthContext';
import toast from 'react-hot-toast';

interface UseGastosReturn {
  gastos: Gasto[];
  estado: Estado<Gasto[]>;
  cargarGastos: () => Promise<void>;
  crear: (gasto: Omit<Gasto, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Gasto | null>;
  actualizar: (id: string, gasto: Partial<Gasto>) => Promise<void>;
  eliminar: (id: string) => Promise<void>;
  obtenerPorId: (id: string) => Promise<Gasto | null>;
  recargar: () => Promise<void>;
  filtrar: (filtros: FiltrosGastos) => Gasto[];
}

export function useGastos(): UseGastosReturn {
  const { usuario } = useAuth();
  const [gastos, setGastos] = useState<Gasto[]>([]);
  const [estado, setEstado] = useState<Estado<Gasto[]>>({
    data: null,
    estado: 'idle',
    error: null,
  });

  /**
   * Cargar gastos del usuario
   */
  const cargarGastos = useCallback(async () => {
    if (!usuario) {
      setGastos([]);
      setEstado({ data: [], estado: 'success', error: null });
      return;
    }

    try {
      setEstado((prev) => ({ ...prev, estado: 'loading' }));
      const gastosData = await gastosService.obtenerPorUsuario(usuario.id);
      setGastos(gastosData);
      setEstado({ data: gastosData, estado: 'success', error: null });
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Error al cargar gastos';
      setEstado({ data: null, estado: 'error', error: errorMsg });
      toast.error(errorMsg);
    }
  }, [usuario]);

  // Cargar gastos al montar el componente o cuando cambie el usuario
  useEffect(() => {
    cargarGastos();
  }, [cargarGastos]);

  /**
   * Crear un nuevo gasto
   */
  const crear = async (
    gastoData: Omit<Gasto, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<Gasto | null> => {
    if (!usuario) {
      toast.error('Debes iniciar sesión');
      return null;
    }

    try {
      const nuevoGasto = await gastosService.crear(gastoData);
      setGastos((prev) => [nuevoGasto, ...prev]);
      toast.success('Gasto creado exitosamente');
      return nuevoGasto;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Error al crear gasto';
      toast.error(errorMsg);
      return null;
    }
  };

  /**
   * Actualizar un gasto existente
   */
  const actualizar = async (id: string, gastoData: Partial<Gasto>): Promise<void> => {
    try {
      await gastosService.actualizar(id, gastoData);
      setGastos((prev) =>
        prev.map((gasto) =>
          gasto.id === id ? { ...gasto, ...gastoData, updatedAt: new Date() } : gasto
        )
      );
      toast.success('Gasto actualizado exitosamente');
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Error al actualizar gasto';
      toast.error(errorMsg);
      throw error;
    }
  };

  /**
   * Eliminar un gasto
   */
  const eliminar = async (id: string): Promise<void> => {
    try {
      await gastosService.eliminar(id);
      setGastos((prev) => prev.filter((gasto) => gasto.id !== id));
      toast.success('Gasto eliminado exitosamente');
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Error al eliminar gasto';
      toast.error(errorMsg);
      throw error;
    }
  };

  /**
   * Obtener un gasto por ID
   */
  const obtenerPorId = async (id: string): Promise<Gasto | null> => {
    try {
      return await gastosService.obtenerPorId(id);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Error al obtener gasto';
      toast.error(errorMsg);
      return null;
    }
  };

  /**
   * Recargar gastos
   */
  const recargar = async (): Promise<void> => {
    await cargarGastos();
  };

  /**
   * Filtrar gastos localmente
   */
  const filtrar = (filtros: FiltrosGastos): Gasto[] => {
    return gastos.filter((gasto) => {
      // Filtro por rango de fechas
      if (filtros.fechaInicio && gasto.fecha < filtros.fechaInicio) {
        return false;
      }
      if (filtros.fechaFin && gasto.fecha > filtros.fechaFin) {
        return false;
      }

      // Filtro por categorías
      if (filtros.categorias && filtros.categorias.length > 0) {
        if (!filtros.categorias.includes(gasto.categoria)) {
          return false;
        }
      }

      // Filtro por rango de montos
      if (filtros.montoMin !== undefined && gasto.monto < filtros.montoMin) {
        return false;
      }
      if (filtros.montoMax !== undefined && gasto.monto > filtros.montoMax) {
        return false;
      }

      // Filtro por método de pago
      if (filtros.metodoPago && gasto.metodoPago !== filtros.metodoPago) {
        return false;
      }

      // Filtro por búsqueda de texto
      if (filtros.busqueda) {
        const busqueda = filtros.busqueda.toLowerCase();
        const coincide =
          gasto.descripcion.toLowerCase().includes(busqueda) ||
          gasto.categoria.toLowerCase().includes(busqueda) ||
          gasto.metodoPago.toLowerCase().includes(busqueda);
        if (!coincide) {
          return false;
        }
      }

      return true;
    });
  };

  return {
    gastos,
    estado,
    cargarGastos,
    crear,
    actualizar,
    eliminar,
    obtenerPorId,
    recargar,
    filtrar,
  };
}

export default useGastos;
