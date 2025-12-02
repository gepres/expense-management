/**
 * Hook personalizado para gestionar presupuesto en efectivo
 */

import { useState, useEffect, useCallback } from 'react';
import {
  presupuestoEfectivoService,
  abonosEfectivoService,
  gastosService,
} from '@services/firebase';
import type {
  PresupuestoEfectivo,
  AbonoEfectivo,
  Gasto,
  Moneda,
  Estado,
  TransaccionEfectivo,
} from '@app-types';
import { useAuth } from '@context/AuthContext';
import toast from 'react-hot-toast';

interface UsePresupuestoEfectivoReturn {
  presupuestosEfectivo: Record<Moneda, PresupuestoEfectivo | null>;
  abonos: AbonoEfectivo[];
  estado: Estado<Record<Moneda, PresupuestoEfectivo | null>>;
  cargarPresupuestos: () => Promise<void>;
  obtenerSaldo: (moneda: Moneda) => number;
  abonar: (monto: number, moneda: Moneda, concepto: string, movimientoId?: string) => Promise<AbonoEfectivo | null>;
  descontar: (monto: number, moneda: Moneda) => Promise<boolean>;
  obtenerHistorial: (moneda: Moneda, fechaInicio?: Date, fechaFin?: Date) => Promise<TransaccionEfectivo[]>;
  recargar: () => Promise<void>;
}

export function usePresupuestoEfectivo(): UsePresupuestoEfectivoReturn {
  const { usuario } = useAuth();
  const [presupuestosEfectivo, setPresupuestosEfectivo] = useState<Record<Moneda, PresupuestoEfectivo | null>>({
    PEN: null,
    USD: null,
  });
  const [abonos, setAbonos] = useState<AbonoEfectivo[]>([]);
  const [estado, setEstado] = useState<Estado<Record<Moneda, PresupuestoEfectivo | null>>>({
    data: null,
    estado: 'idle',
    error: null,
  });

  /**
   * Cargar presupuestos en efectivo de todas las monedas
   */
  const cargarPresupuestos = useCallback(async () => {
    if (!usuario) {
      setPresupuestosEfectivo({ PEN: null, USD: null });
      setEstado({ data: { PEN: null, USD: null }, estado: 'success', error: null });
      return;
    }

    try {
      setEstado((prev) => ({ ...prev, estado: 'loading' }));

      // Cargar o crear presupuestos para PEN y USD
      const [presupuestoPEN, presupuestoUSD, abonosData, gastosData] = await Promise.all([
        presupuestoEfectivoService.obtenerOCrear(usuario.id, 'PEN'),
        presupuestoEfectivoService.obtenerOCrear(usuario.id, 'USD'),
        abonosEfectivoService.obtenerPorUsuario(usuario.id),
        gastosService.obtenerPorUsuario(usuario.id),
      ]);

      // Calcular saldo REAL basado en abonos y gastos
      const calcularSaldoReal = (moneda: Moneda): number => {
        // Sumar todos los abonos de esta moneda
        const totalAbonos = abonosData
          .filter((a) => a.moneda === moneda)
          .reduce((sum, a) => sum + a.monto, 0);

        // Sumar todos los gastos en efectivo de esta moneda
        const totalGastosEfectivo = gastosData
          .filter((g) => g.metodoPago === 'efectivo' && g.moneda === moneda)
          .reduce((sum, g) => sum + g.monto, 0);

        // Saldo real = abonos - gastos
        return totalAbonos - totalGastosEfectivo;
      };

      const saldoRealPEN = calcularSaldoReal('PEN');
      const saldoRealUSD = calcularSaldoReal('USD');

      // Actualizar en Firebase si el saldo calculado es diferente
      if (Math.abs(presupuestoPEN.saldoActual - saldoRealPEN) > 0.01) {
        await presupuestoEfectivoService.actualizarSaldo(presupuestoPEN.id, saldoRealPEN);
        presupuestoPEN.saldoActual = saldoRealPEN;
      }

      if (Math.abs(presupuestoUSD.saldoActual - saldoRealUSD) > 0.01) {
        await presupuestoEfectivoService.actualizarSaldo(presupuestoUSD.id, saldoRealUSD);
        presupuestoUSD.saldoActual = saldoRealUSD;
      }

      const presupuestos = {
        PEN: presupuestoPEN,
        USD: presupuestoUSD,
      };

      setPresupuestosEfectivo(presupuestos);
      setEstado({ data: presupuestos, estado: 'success', error: null });

      // Cargar historial de abonos
      setAbonos(abonosData);
    } catch (error) {
      const errorMsg =
        error instanceof Error ? error.message : 'Error al cargar presupuesto en efectivo';
      setEstado({ data: null, estado: 'error', error: errorMsg });
      toast.error(errorMsg);
    }
  }, [usuario]);

  useEffect(() => {
    cargarPresupuestos();
  }, [cargarPresupuestos]);

  /**
   * Obtener saldo actual de una moneda
   */
  const obtenerSaldo = (moneda: Moneda): number => {
    return presupuestosEfectivo[moneda]?.saldoActual || 0;
  };

  /**
   * Abonar dinero al efectivo
   */
  const abonar = async (
    monto: number,
    moneda: Moneda,
    concepto: string,
    movimientoId?: string
  ): Promise<AbonoEfectivo | null> => {
    if (!usuario) {
      toast.error('Debes iniciar sesión');
      return null;
    }

    if (monto <= 0) {
      toast.error('El monto debe ser mayor a 0');
      return null;
    }

    const presupuesto = presupuestosEfectivo[moneda];
    if (!presupuesto) {
      toast.error('Error al obtener presupuesto en efectivo');
      return null;
    }

    try {
      // Crear el abono
      const nuevoAbono = await abonosEfectivoService.crear({
        userId: usuario.id,
        fecha: new Date(),
        monto,
        moneda,
        concepto,
        movimientoId,
      });

      // Incrementar saldo
      await presupuestoEfectivoService.incrementarSaldo(presupuesto.id, monto);

      // Actualizar estado local
      setPresupuestosEfectivo((prev) => ({
        ...prev,
        [moneda]: {
          ...presupuesto,
          saldoActual: presupuesto.saldoActual + monto,
          updatedAt: new Date(),
        },
      }));

      setAbonos((prev) => [nuevoAbono, ...prev]);

      toast.success(`Abono de ${moneda} ${monto.toFixed(2)} registrado`);
      return nuevoAbono;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Error al abonar';
      toast.error(errorMsg);
      return null;
    }
  };

  /**
   * Descontar dinero del efectivo (cuando se registra un gasto)
   * Retorna true si fue exitoso, false si hubo error
   */
  const descontar = async (monto: number, moneda: Moneda): Promise<boolean> => {
    if (!usuario) {
      toast.error('Debes iniciar sesión');
      return false;
    }

    if (monto <= 0) {
      toast.error('El monto debe ser mayor a 0');
      return false;
    }

    const presupuesto = presupuestosEfectivo[moneda];
    if (!presupuesto) {
      toast.error('Error al obtener presupuesto en efectivo');
      return false;
    }

    try {
      // Decrementar saldo
      await presupuestoEfectivoService.decrementarSaldo(presupuesto.id, monto);

      const nuevoSaldo = presupuesto.saldoActual - monto;

      // Actualizar estado local
      setPresupuestosEfectivo((prev) => ({
        ...prev,
        [moneda]: {
          ...presupuesto,
          saldoActual: nuevoSaldo,
          updatedAt: new Date(),
        },
      }));

      // Alertar si el saldo quedó negativo
      if (nuevoSaldo < 0) {
        toast.error(
          `⚠️ Saldo en efectivo negativo: ${moneda} ${nuevoSaldo.toFixed(2)}`,
          { duration: 4000 }
        );
      }

      return true;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Error al descontar del efectivo';
      toast.error(errorMsg);
      return false;
    }
  };

  /**
   * Obtener historial completo de transacciones (abonos + gastos)
   * ordenado por fecha descendente
   */
  const obtenerHistorial = useCallback(async (
    moneda: Moneda,
    fechaInicio?: Date,
    fechaFin?: Date
  ): Promise<TransaccionEfectivo[]> => {
    if (!usuario) return [];

    try {
      // Obtener abonos
      let abonosData: AbonoEfectivo[];
      if (fechaInicio && fechaFin) {
        abonosData = await abonosEfectivoService.obtenerPorRangoFechas(
          usuario.id,
          fechaInicio,
          fechaFin
        );
      } else {
        abonosData = await abonosEfectivoService.obtenerPorMoneda(usuario.id, moneda);
      }

      // Obtener gastos en efectivo
      let gastos: Gasto[];
      if (fechaInicio && fechaFin) {
        gastos = await gastosService.obtenerPorRangoFechas(usuario.id, fechaInicio, fechaFin);
      } else {
        gastos = await gastosService.obtenerPorUsuario(usuario.id);
      }

      // Filtrar solo gastos en efectivo de la moneda especificada
      const gastosEfectivo = gastos.filter(
        (g) => g.metodoPago === 'efectivo' && g.moneda === moneda
      );

      // Combinar abonos y gastos en un solo array de transacciones
      const transacciones: TransaccionEfectivo[] = [];

      // Agregar abonos
      abonosData
        .filter((a) => a.moneda === moneda)
        .forEach((abono) => {
          transacciones.push({
            id: abono.id,
            fecha: abono.fecha,
            tipo: 'abono',
            concepto: abono.concepto,
            monto: abono.monto,
            moneda: abono.moneda,
            saldo: 0, // Se calculará después
          });
        });

      // Agregar gastos
      gastosEfectivo.forEach((gasto) => {
        transacciones.push({
          id: gasto.id,
          fecha: gasto.fecha,
          tipo: 'gasto',
          concepto: gasto.descripcion,
          monto: gasto.monto,
          moneda: gasto.moneda,
          categoria: gasto.categoria,
          metodoPago: gasto.metodoPago,
          saldo: 0, // Se calculará después
        });
      });

      // Ordenar por fecha descendente
      transacciones.sort((a, b) => b.fecha.getTime() - a.fecha.getTime());

      // Calcular saldo acumulado (empezando desde el final)
      let saldoAcumulado = presupuestosEfectivo[moneda]?.saldoActual || 0;
      for (let i = 0; i < transacciones.length; i++) {
        transacciones[i].saldo = saldoAcumulado;

        // Restar para calcular el saldo anterior
        if (transacciones[i].tipo === 'abono') {
          saldoAcumulado -= transacciones[i].monto;
        } else {
          saldoAcumulado += transacciones[i].monto;
        }
      }

      return transacciones;
    } catch (error) {
      const errorMsg =
        error instanceof Error ? error.message : 'Error al obtener historial';
      toast.error(errorMsg);
      return [];
    }
  }, [usuario, presupuestosEfectivo]);

  /**
   * Recargar presupuestos
   */
  const recargar = async (): Promise<void> => {
    await cargarPresupuestos();
  };

  return {
    presupuestosEfectivo,
    abonos,
    estado,
    cargarPresupuestos,
    obtenerSaldo,
    abonar,
    descontar,
    obtenerHistorial,
    recargar,
  };
}

export default usePresupuestoEfectivo;
