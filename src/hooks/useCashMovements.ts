/**
 * Hook realtime para los movimientos entre sub-saldos de las cuentas
 * (retiros y depósitos de efectivo).
 *
 * - LECTURA: `onSnapshot` directo a Firestore.
 * - MUTATIONS: vía backend para mantener atomicidad de saldos.
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
import { CashMovementsService } from '@services/cash-movements';
import { useAuth } from '@context/AuthContext';
import toast from 'react-hot-toast';
import type {
  CashMovement,
  CashMovementFirestore,
  CreateCashMovementDto,
  CreateIncomeDto,
  Estado,
} from '@app-types';

interface UseCashMovementsReturn {
  movements: CashMovement[];
  estado: Estado<CashMovement[]>;
  retirar: (accountId: string, dto: CreateCashMovementDto) => Promise<CashMovement | null>;
  depositar: (accountId: string, dto: CreateCashMovementDto) => Promise<CashMovement | null>;
  ingresar: (accountId: string, dto: CreateIncomeDto) => Promise<CashMovement | null>;
  eliminar: (id: string) => Promise<void>;
  obtenerPorCuenta: (accountId: string) => CashMovement[];
}

function timestampToDate(ts: Timestamp | Date | undefined): Date {
  if (!ts) return new Date();
  if (ts instanceof Date) return ts;
  if (typeof (ts as Timestamp).toDate === 'function') return (ts as Timestamp).toDate();
  return new Date();
}

function firestoreToCashMovement(
  id: string,
  data: CashMovementFirestore,
): CashMovement {
  return {
    id,
    userId: data.userId,
    accountId: data.accountId,
    type: data.type,
    amount: data.amount,
    currency: data.currency,
    description: data.description,
    source: data.source,
    destination: data.destination,
    date: timestampToDate(data.date),
    createdAt: timestampToDate(data.createdAt),
    updatedAt: timestampToDate(data.updatedAt),
  };
}

export function useCashMovements(): UseCashMovementsReturn {
  const { usuario } = useAuth();
  const [movements, setMovements] = useState<CashMovement[]>([]);
  const [estado, setEstado] = useState<Estado<CashMovement[]>>({
    data: null,
    estado: 'idle',
    error: null,
  });

  useEffect(() => {
    if (!usuario) {
      setMovements([]);
      setEstado({ data: [], estado: 'success', error: null });
      return;
    }

    setEstado((prev) => ({ ...prev, estado: 'loading' }));

    const q = query(
      collection(db, 'cash-movements'),
      where('userId', '==', usuario.id),
      orderBy('date', 'desc'),
    );

    const unsub: Unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const items = snapshot.docs.map((doc) =>
          firestoreToCashMovement(doc.id, doc.data() as CashMovementFirestore),
        );
        setMovements(items);
        setEstado({ data: items, estado: 'success', error: null });
      },
      (error) => {
        console.error('[useCashMovements] Listener error:', error);
        setEstado({ data: null, estado: 'error', error: error.message });
      },
    );

    return () => unsub();
  }, [usuario]);

  const retirar = useCallback(
    async (accountId: string, dto: CreateCashMovementDto) => {
      try {
        const created = await CashMovementsService.withdraw(accountId, dto);
        toast.success('Retiro registrado');
        return created;
      } catch (error) {
        const msg = error instanceof Error ? error.message : 'Error al retirar';
        toast.error(msg);
        return null;
      }
    },
    [],
  );

  const depositar = useCallback(
    async (accountId: string, dto: CreateCashMovementDto) => {
      try {
        const created = await CashMovementsService.depositCash(accountId, dto);
        toast.success('Depósito registrado');
        return created;
      } catch (error) {
        const msg = error instanceof Error ? error.message : 'Error al depositar';
        toast.error(msg);
        return null;
      }
    },
    [],
  );

  const ingresar = useCallback(
    async (accountId: string, dto: CreateIncomeDto) => {
      try {
        const created = await CashMovementsService.addIncome(accountId, dto);
        toast.success('Ingreso registrado. Tu presupuesto general aumentó.');
        return created;
      } catch (error) {
        const msg = error instanceof Error ? error.message : 'Error al registrar ingreso';
        toast.error(msg);
        return null;
      }
    },
    [],
  );

  const eliminar = useCallback(async (id: string) => {
    try {
      await CashMovementsService.remove(id);
      toast.success('Movimiento revertido');
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Error al revertir';
      toast.error(msg);
      throw error;
    }
  }, []);

  const obtenerPorCuenta = useCallback(
    (accountId: string) => movements.filter((m) => m.accountId === accountId),
    [movements],
  );

  return {
    movements,
    estado,
    retirar,
    depositar,
    ingresar,
    eliminar,
    obtenerPorCuenta,
  };
}

export default useCashMovements;
