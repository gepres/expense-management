/**
 * CuentasWidget — widget del Dashboard que muestra las cuentas activas
 * con saldos en tiempo real.
 *
 * Diseño:
 *  - Card scrolleable horizontalmente con cada cuenta como mini-card.
 *  - Acción rápida "Transferir" en la cabecera.
 *  - Click en cualquier cuenta → /cuentas/:id.
 *  - Click en "Ver todas" → /cuentas.
 */

import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  CreditCard,
  ArrowRightLeft,
  ArrowRight,
  Plus,
  Star,
  Building2,
  Banknote,
  TrendingUp,
} from 'lucide-react';
import { useAccountsContext } from '@context/AccountsContext';
import { getAccountTotalBalance } from '@app-types';
import AccountIcon from './AccountIcon';
import TransferModal from './TransferModal';
import IncomeModal from './IncomeModal';
import LoadingSpinner from '@components/common/LoadingSpinner';

function formatBalance(value: number, currency: string): string {
  const sign = value < 0 ? '-' : '';
  const abs = Math.abs(value).toLocaleString('es-PE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `${sign}${currency} ${abs}`;
}

export default function CuentasWidget() {
  const { activeAccounts, estado, defaultAccount } = useAccountsContext();
  const [transferOpen, setTransferOpen] = useState(false);
  const [incomeOpen, setIncomeOpen] = useState(false);

  if (estado.estado === 'loading' && activeAccounts.length === 0) {
    return (
      <div className="bg-card border border-border rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-center h-32">
          <LoadingSpinner variant="dots" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-xl shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
      {/* Decoración */}
      <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity pointer-events-none">
        <CreditCard className="h-24 w-24 text-cyan-500 transform -rotate-12 translate-x-4 -translate-y-4" />
      </div>

      <div className="relative z-10 p-5">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-cyan-100 dark:bg-cyan-900/30 rounded-lg">
              <CreditCard className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-foreground">Cuentas</h3>
              <p className="text-xs text-muted-foreground">
                {activeAccounts.length} {activeAccounts.length === 1 ? 'cuenta' : 'cuentas'} activa
                {activeAccounts.length === 1 ? '' : 's'}
              </p>
            </div>
          </div>
          <div className="flex gap-1">
            <button
              onClick={() => setIncomeOpen(true)}
              disabled={activeAccounts.length === 0}
              className="p-1.5 rounded hover:bg-emerald-100 dark:hover:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              title="Registrar ingreso (sueldo, préstamo…)"
            >
              <TrendingUp className="h-4 w-4" />
            </button>
            <button
              onClick={() => setTransferOpen(true)}
              disabled={activeAccounts.length < 2}
              className="p-1.5 rounded hover:bg-cyan-100 dark:hover:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              title="Transferir entre cuentas"
            >
              <ArrowRightLeft className="h-4 w-4" />
            </button>
            <Link
              to="/cuentas/nueva"
              className="p-1.5 rounded hover:bg-cyan-100 dark:hover:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400 transition-colors"
              title="Nueva cuenta"
            >
              <Plus className="h-4 w-4" />
            </Link>
          </div>
        </div>

        {/* Lista de cuentas */}
        {activeAccounts.length === 0 ? (
          <div className="text-center py-6">
            <CreditCard className="h-10 w-10 text-muted-foreground/30 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">
              Aún no tienes cuentas creadas.
            </p>
            <Link
              to="/cuentas/nueva"
              className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
            >
              <Plus className="h-3 w-3" /> Crear la primera
            </Link>
          </div>
        ) : (
          <div className="space-y-2 mb-3 max-h-72 overflow-y-auto pr-1 -mr-1">
            {activeAccounts.slice(0, 6).map((acc) => {
              const total = getAccountTotalBalance(acc);
              const positive = total >= 0;
              return (
                <Link
                  key={acc.id}
                  to={`/cuentas/${acc.id}`}
                  className="flex items-center gap-3 bg-muted/40 hover:bg-muted/80 rounded-lg p-3 transition-colors"
                >
                  <AccountIcon account={acc} size="sm" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1">
                      <p className="text-sm font-medium text-foreground truncate">
                        {acc.name}
                      </p>
                      {acc.isDefault && (
                        <Star className="h-3 w-3 text-amber-500 fill-amber-500 shrink-0" />
                      )}
                    </div>
                    <p
                      className={`text-xs font-semibold ${
                        positive ? 'text-foreground' : 'text-destructive'
                      }`}
                    >
                      {formatBalance(total, acc.currency)}
                    </p>
                    {acc.cashBalance !== 0 && (
                      <p className="text-[10px] text-muted-foreground flex items-center gap-1.5 flex-wrap">
                        <span className="inline-flex items-center gap-1">
                          <Building2 className="h-3 w-3" aria-hidden="true" />
                          {formatBalance(acc.bankBalance, acc.currency)}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span className="inline-flex items-center gap-1">
                          <Banknote className="h-3 w-3" aria-hidden="true" />
                          {formatBalance(acc.cashBalance, acc.currency)}
                        </span>
                      </p>
                    )}
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground/60 shrink-0" />
                </Link>
              );
            })}
          </div>
        )}

        {/* Footer */}
        <Link
          to="/cuentas"
          className="w-full flex items-center justify-between text-muted-foreground hover:text-foreground transition-colors group p-2 rounded-lg hover:bg-muted/50"
        >
          <span className="text-sm font-medium">Ver todas las cuentas</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      <TransferModal
        isOpen={transferOpen}
        onClose={() => setTransferOpen(false)}
      />
      <IncomeModal
        isOpen={incomeOpen}
        onClose={() => setIncomeOpen(false)}
        initialAccountId={defaultAccount?.id}
      />
    </div>
  );
}
