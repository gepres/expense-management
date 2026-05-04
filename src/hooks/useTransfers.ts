/**
 * Hook para gestionar transferencias entre cuentas.
 *
 * - LECTURA: listener `onSnapshot` directo a Firestore.
 * - MUTATIONS (create/delete): pasan por el backend para mantener atomicidad
 *   (debit + credit en una transacción).
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
import { TransfersService } from '@services/transfers';
import { useAuth } from '@context/AuthContext';
import toast from 'react-hot-toast';
import type {
  Transfer,
  TransferFirestore,
  CreateTransferDto,
  Estado,
} from '@app-types';

interface UseTransfersReturn {
  transfers: Transfer[];
  estado: Estado<Transfer[]>;
  crear: (dto: CreateTransferDto) => Promise<Transfer | null>;
  eliminar: (id: string) => Promise<void>;
  obtenerPorCuenta: (accountId: string) => Transfer[];
}

function timestampToDate(ts: Timestamp | Date | undefined): Date {
  if (!ts) return new Date();
  if (ts instanceof Date) return ts;
  if (typeof (ts as Timestamp).toDate === 'function') return (ts as Timestamp).toDate();
  return new Date();
}

function firestoreToTransfer(id: string, data: TransferFirestore): Transfer {
  return {
    id,
    userId: data.userId,
    fromAccountId: data.fromAccountId,
    toAccountId: data.toAccountId,
    amount: data.amount,
    amountConverted: data.amountConverted,
    exchangeRate: data.exchangeRate,
    fromCurrency: data.fromCurrency,
    toCurrency: data.toCurrency,
    fee: data.fee,
    description: data.description,
    date: timestampToDate(data.date),
    createdAt: timestampToDate(data.createdAt),
    updatedAt: timestampToDate(data.updatedAt),
  };
}

export function useTransfers(): UseTransfersReturn {
  const { usuario } = useAuth();
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [estado, setEstado] = useState<Estado<Transfer[]>>({
    data: null,
    estado: 'idle',
    error: null,
  });

  useEffect(() => {
    if (!usuario) {
      setTransfers([]);
      setEstado({ data: [], estado: 'success', error: null });
      return;
    }

    setEstado((prev) => ({ ...prev, estado: 'loading' }));

    const q = query(
      collection(db, 'transfers'),
      where('userId', '==', usuario.id),
      orderBy('date', 'desc'),
    );

    const unsub: Unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const items = snapshot.docs.map((doc) =>
          firestoreToTransfer(doc.id, doc.data() as TransferFirestore),
        );
        setTransfers(items);
        setEstado({ data: items, estado: 'success', error: null });
      },
      (error) => {
        console.error('[useTransfers] Listener error:', error);
        setEstado({ data: null, estado: 'error', error: error.message });
      },
    );

    return () => unsub();
  }, [usuario]);

  const crear = useCallback(async (dto: CreateTransferDto): Promise<Transfer | null> => {
    try {
      const created = await TransfersService.create(dto);
      toast.success('Transferencia registrada');
      return created;
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Error al transferir';
      toast.error(msg);
      return null;
    }
  }, []);

  const eliminar = useCallback(async (id: string): Promise<void> => {
    try {
      await TransfersService.remove(id);
      toast.success('Transferencia revertida');
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Error al revertir';
      toast.error(msg);
      throw error;
    }
  }, []);

  const obtenerPorCuenta = useCallback(
    (accountId: string) =>
      transfers.filter(
        (t) => t.fromAccountId === accountId || t.toAccountId === accountId,
      ),
    [transfers],
  );

  return {
    transfers,
    estado,
    crear,
    eliminar,
    obtenerPorCuenta,
  };
}

export default useTransfers;
