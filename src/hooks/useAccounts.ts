/**
 * Hook personalizado para gestionar cuentas (multi-cuenta) con realtime.
 *
 * - LECTURA: listener `onSnapshot` directo a Firestore → realtime sin polling.
 * - MUTATIONS: pasan por el backend NestJS (transactional, valida default flag,
 *   bloquea borrar default si hay otras activas, etc.).
 */

import { useEffect, useMemo, useState, useCallback } from 'react';
import {
  collection,
  query,
  where,
  onSnapshot,
  Timestamp,
} from 'firebase/firestore';
import type { Unsubscribe } from 'firebase/firestore';
import { db } from '@services/firebase';
import { AccountsService } from '@services/accounts';
import { useAuth } from '@context/AuthContext';
import toast from 'react-hot-toast';
import type {
  Account,
  AccountFirestore,
  CreateAccountDto,
  UpdateAccountDto,
  Estado,
} from '@app-types';

interface UseAccountsReturn {
  accounts: Account[];
  /** Solo activas, ordenadas por isDefault desc → name asc. */
  activeAccounts: Account[];
  /** Cuenta marcada como default (puede ser null si aún no migró). */
  defaultAccount: Account | null;
  estado: Estado<Account[]>;
  // Mutations
  crear: (dto: CreateAccountDto) => Promise<Account | null>;
  actualizar: (id: string, dto: UpdateAccountDto) => Promise<Account | null>;
  archivar: (id: string) => Promise<void>;
  eliminar: (id: string, force?: boolean) => Promise<void>;
  recalcular: (id: string) => Promise<Account | null>;
  // Helpers
  obtenerPorId: (id: string) => Account | undefined;
}

function timestampToDate(ts: Timestamp | Date | undefined): Date {
  if (!ts) return new Date();
  if (ts instanceof Date) return ts;
  if (typeof (ts as Timestamp).toDate === 'function') return (ts as Timestamp).toDate();
  return new Date();
}

function firestoreToAccount(id: string, data: AccountFirestore): Account {
  return {
    id,
    userId: data.userId,
    name: data.name,
    type: data.type,
    bank: data.bank,
    currency: data.currency,
    icon: data.icon,
    color: data.color,
    initialBankBalance: data.initialBankBalance ?? 0,
    initialCashBalance: data.initialCashBalance ?? 0,
    bankBalance: data.bankBalance ?? 0,
    cashBalance: data.cashBalance ?? 0,
    includeInTotal: data.includeInTotal,
    isDefault: data.isDefault,
    status: data.status,
    creditLimit: data.creditLimit,
    createdAt: timestampToDate(data.createdAt),
    updatedAt: timestampToDate(data.updatedAt),
  };
}

export function useAccounts(): UseAccountsReturn {
  const { usuario } = useAuth();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [estado, setEstado] = useState<Estado<Account[]>>({
    data: null,
    estado: 'idle',
    error: null,
  });

  // ==========================================================================
  // REALTIME LISTENER
  // ==========================================================================

  useEffect(() => {
    if (!usuario) {
      setAccounts([]);
      setEstado({ data: [], estado: 'success', error: null });
      return;
    }

    setEstado((prev) => ({ ...prev, estado: 'loading' }));

    const q = query(collection(db, 'accounts'), where('userId', '==', usuario.id));

    const unsub: Unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const items = snapshot.docs.map((doc) =>
          firestoreToAccount(doc.id, doc.data() as AccountFirestore),
        );
        setAccounts(items);
        setEstado({ data: items, estado: 'success', error: null });
      },
      (error) => {
        console.error('[useAccounts] Listener error:', error);
        setEstado({ data: null, estado: 'error', error: error.message });
        toast.error('Error al sincronizar cuentas');
      },
    );

    return () => unsub();
  }, [usuario]);

  // ==========================================================================
  // DERIVADOS
  // ==========================================================================

  const activeAccounts = useMemo(
    () =>
      [...accounts]
        .filter((a) => a.status === 'active')
        .sort((a, b) => {
          if (a.isDefault !== b.isDefault) return a.isDefault ? -1 : 1;
          return a.name.localeCompare(b.name);
        }),
    [accounts],
  );

  const defaultAccount = useMemo(
    () => accounts.find((a) => a.isDefault && a.status === 'active') ?? null,
    [accounts],
  );

  // ==========================================================================
  // MUTATIONS (vía backend)
  // ==========================================================================

  const crear = useCallback(async (dto: CreateAccountDto): Promise<Account | null> => {
    try {
      const created = await AccountsService.create(dto);
      toast.success(`Cuenta "${created.name}" creada`);
      return created;
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Error al crear cuenta';
      toast.error(msg);
      return null;
    }
  }, []);

  const actualizar = useCallback(
    async (id: string, dto: UpdateAccountDto): Promise<Account | null> => {
      try {
        const updated = await AccountsService.update(id, dto);
        return updated;
      } catch (error) {
        const msg = error instanceof Error ? error.message : 'Error al actualizar cuenta';
        toast.error(msg);
        return null;
      }
    },
    [],
  );

  const archivar = useCallback(async (id: string): Promise<void> => {
    try {
      await AccountsService.update(id, { status: 'archived' });
      toast.success('Cuenta archivada');
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Error al archivar';
      toast.error(msg);
      throw error;
    }
  }, []);

  const eliminar = useCallback(async (id: string, force = false): Promise<void> => {
    try {
      await AccountsService.remove(id, force);
      toast.success('Cuenta eliminada');
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Error al eliminar';
      toast.error(msg);
      throw error;
    }
  }, []);

  const recalcular = useCallback(async (id: string): Promise<Account | null> => {
    try {
      const updated = await AccountsService.recalculate(id);
      toast.success('Saldo recalculado');
      return updated;
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Error al recalcular';
      toast.error(msg);
      return null;
    }
  }, []);

  const obtenerPorId = useCallback(
    (id: string) => accounts.find((a) => a.id === id),
    [accounts],
  );

  return {
    accounts,
    activeAccounts,
    defaultAccount,
    estado,
    crear,
    actualizar,
    archivar,
    eliminar,
    recalcular,
    obtenerPorId,
  };
}

export default useAccounts;
