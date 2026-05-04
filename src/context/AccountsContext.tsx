/**
 * AccountsContext — estado global de cuentas.
 *
 * Responsabilidades:
 *  1. Exponer el listado realtime (vía useAccounts).
 *  2. Calcular patrimonio total por moneda.
 *
 * El usuario nuevo ve el listado vacío y la UI ofrece "Crea tu primera cuenta".
 * No hay migración automática (el modelo viejo ya no aplica).
 */

import {
  createContext,
  useContext,
  useMemo,
  type ReactNode,
} from 'react';
import { useAccounts } from '@hooks/useAccounts';
import type {
  Account,
  CreateAccountDto,
  UpdateAccountDto,
  Estado,
} from '@app-types';

interface AccountsContextType {
  accounts: Account[];
  activeAccounts: Account[];
  defaultAccount: Account | null;
  estado: Estado<Account[]>;
  /**
   * Suma (bankBalance + cashBalance) de cuentas activas con
   * `includeInTotal: true`, agrupado por moneda.
   */
  patrimonioPorMoneda: Record<string, number>;
  // Mutations (proxy a useAccounts)
  crear: (dto: CreateAccountDto) => Promise<Account | null>;
  actualizar: (id: string, dto: UpdateAccountDto) => Promise<Account | null>;
  archivar: (id: string) => Promise<void>;
  eliminar: (id: string, force?: boolean) => Promise<void>;
  recalcular: (id: string) => Promise<Account | null>;
  obtenerPorId: (id: string) => Account | undefined;
}

const AccountsContext = createContext<AccountsContextType | undefined>(undefined);

interface AccountsProviderProps {
  children: ReactNode;
}

export function AccountsProvider({ children }: AccountsProviderProps) {
  const accountsHook = useAccounts();

  const patrimonioPorMoneda = useMemo(() => {
    const acc: Record<string, number> = {};
    for (const a of accountsHook.activeAccounts) {
      if (!a.includeInTotal) continue;
      acc[a.currency] = (acc[a.currency] ?? 0) + a.bankBalance + a.cashBalance;
    }
    return acc;
  }, [accountsHook.activeAccounts]);

  const value: AccountsContextType = {
    accounts: accountsHook.accounts,
    activeAccounts: accountsHook.activeAccounts,
    defaultAccount: accountsHook.defaultAccount,
    estado: accountsHook.estado,
    patrimonioPorMoneda,
    crear: accountsHook.crear,
    actualizar: accountsHook.actualizar,
    archivar: accountsHook.archivar,
    eliminar: accountsHook.eliminar,
    recalcular: accountsHook.recalcular,
    obtenerPorId: accountsHook.obtenerPorId,
  };

  return <AccountsContext.Provider value={value}>{children}</AccountsContext.Provider>;
}

export function useAccountsContext(): AccountsContextType {
  const ctx = useContext(AccountsContext);
  if (!ctx) {
    throw new Error('useAccountsContext debe usarse dentro de AccountsProvider');
  }
  return ctx;
}

export default AccountsContext;
