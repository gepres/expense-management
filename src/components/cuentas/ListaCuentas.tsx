/**
 * ListaCuentas — vista principal del módulo de cuentas.
 *
 * Muestra todas las cuentas activas + archivadas (toggle), con saldo destacado,
 * y permite crear nuevas, archivar, eliminar y ejecutar transfers desde aquí.
 */

import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Plus,
  Wallet,
  ArrowRightLeft,
  Archive,
  Star,
  TrendingUp,
  TrendingDown,
  Search,
  Eye,
  EyeOff,
  Building2,
  Banknote,
} from 'lucide-react';
import { useAccountsContext } from '@context/AccountsContext';
import AccountIcon from './AccountIcon';
import TransferModal from './TransferModal';
import IncomeModal from './IncomeModal';
import Button from '@components/common/Button';
import CustomLoader from '@components/common/CustomLoader';
import { ACCOUNT_TYPE_LABELS, getAccountTotalBalance } from '@app-types';

function formatBalance(value: number, currency: string): string {
  const sign = value < 0 ? '-' : '';
  const abs = Math.abs(value).toLocaleString('es-PE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `${sign}${currency} ${abs}`;
}

export default function ListaCuentas() {
  const {
    accounts,
    activeAccounts,
    patrimonioPorMoneda,
    estado,
    defaultAccount,
    actualizar,
  } = useAccountsContext();

  const [showArchived, setShowArchived] = useState(false);
  const [search, setSearch] = useState('');
  const [transferOpen, setTransferOpen] = useState(false);
  const [incomeOpen, setIncomeOpen] = useState(false);
  const [togglingDefault, setTogglingDefault] = useState<string | null>(null);

  const handleToggleDefault = async (
    e: React.MouseEvent,
    accountId: string,
    isCurrentlyDefault: boolean,
  ) => {
    // El card es un <Link>; evitamos navegar al hacer click en la estrella.
    e.preventDefault();
    e.stopPropagation();
    if (togglingDefault) return;
    setTogglingDefault(accountId);
    try {
      await actualizar(accountId, { isDefault: !isCurrentlyDefault });
    } finally {
      setTogglingDefault(null);
    }
  };

  const archivedAccounts = useMemo(
    () => accounts.filter((a) => a.status === 'archived'),
    [accounts],
  );

  const visibleAccounts = useMemo(() => {
    const list = showArchived ? archivedAccounts : activeAccounts;
    if (!search.trim()) return list;
    const q = search.toLowerCase();
    return list.filter(
      (a) =>
        a.name.toLowerCase().includes(q) ||
        a.bank?.toLowerCase().includes(q) ||
        a.currency.toLowerCase().includes(q),
    );
  }, [activeAccounts, archivedAccounts, showArchived, search]);

  // Agrupar por banco para visualización tipo "BCP → Soles + Dólares"
  const groupedByBank = useMemo(() => {
    const map = new Map<string, typeof visibleAccounts>();
    for (const acc of visibleAccounts) {
      const key = acc.bank || acc.type;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(acc);
    }
    return Array.from(map.entries());
  }, [visibleAccounts]);

  if (estado.estado === 'loading' && accounts.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <CustomLoader />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground flex items-center gap-2">
            <Wallet className="h-7 w-7 text-primary" />
            Mis Cuentas
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Gestiona tus cuentas, transfiere dinero y consulta saldos.
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button
            variant="success"
            icon={TrendingUp}
            onClick={() => setIncomeOpen(true)}
            disabled={activeAccounts.length === 0}
            title="Registrar ingreso (sueldo, préstamo…)"
          >
            Ingreso
          </Button>
          <Button
            variant="secondary"
            icon={ArrowRightLeft}
            onClick={() => setTransferOpen(true)}
            disabled={activeAccounts.length < 2}
          >
            Transferir
          </Button>
          <Link to="/cuentas/nueva">
            <Button variant="primary" icon={Plus}>
              Nueva
            </Button>
          </Link>
        </div>
      </div>

      {/* Patrimonio por moneda */}
      {Object.keys(patrimonioPorMoneda).length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {Object.entries(patrimonioPorMoneda).map(([currency, total]) => {
            const positive = total >= 0;
            return (
              <div
                key={currency}
                className="bg-card border border-border rounded-xl p-4 shadow-sm"
              >
                <p className="text-xs uppercase text-muted-foreground tracking-wider">
                  Patrimonio {currency}
                </p>
                <div className="mt-1 flex items-baseline gap-2">
                  <p
                    className={`text-2xl font-bold ${
                      positive ? 'text-foreground' : 'text-destructive'
                    }`}
                  >
                    {formatBalance(total, currency)}
                  </p>
                </div>
                <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                  {positive ? (
                    <TrendingUp className="h-3 w-3 text-emerald-500" />
                  ) : (
                    <TrendingDown className="h-3 w-3 text-destructive" />
                  )}
                  <span>{activeAccounts.filter((a) => a.currency === currency).length} cuenta(s)</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar cuenta, banco o moneda..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-input bg-background text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary"
          />
        </div>
        <Button
          variant={showArchived ? 'primary' : 'secondary'}
          icon={showArchived ? Eye : EyeOff}
          onClick={() => setShowArchived(!showArchived)}
        >
          {showArchived ? 'Ver activas' : `Archivadas (${archivedAccounts.length})`}
        </Button>
      </div>

      {/* Lista agrupada */}
      {visibleAccounts.length === 0 ? (
        <div className="bg-card border border-dashed border-border rounded-xl p-10 text-center">
          <Wallet className="h-12 w-12 text-muted-foreground/40 mx-auto mb-3" />
          <p className="text-foreground font-medium">
            {showArchived ? 'No hay cuentas archivadas' : 'No tienes cuentas todavía'}
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            {!showArchived && 'Crea tu primera cuenta para empezar.'}
          </p>
          {!showArchived && (
            <Link to="/cuentas/nueva" className="inline-block mt-4">
              <Button variant="primary" icon={Plus}>
                Crear cuenta
              </Button>
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {groupedByBank.map(([groupKey, group]) => (
            <div key={groupKey} className="space-y-2">
              {group.length > 1 && (
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground px-1">
                  {groupKey}
                </p>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {group.map((acc) => {
                  const total = getAccountTotalBalance(acc);
                  const positive = total >= 0;
                  return (
                    <Link
                      key={acc.id}
                      to={`/cuentas/${acc.id}`}
                      className="bg-card border border-border rounded-xl p-4 hover:border-primary/40 hover:shadow-md transition-all group"
                    >
                      <div className="flex items-start gap-3">
                        <AccountIcon account={acc} size="md" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <h3 className="font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                              {acc.name}
                            </h3>
                            <button
                              type="button"
                              onClick={(e) => handleToggleDefault(e, acc.id, acc.isDefault)}
                              disabled={
                                togglingDefault === acc.id ||
                                acc.status === 'archived'
                              }
                              className="p-0.5 rounded hover:bg-amber-100 dark:hover:bg-amber-900/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              title={
                                acc.isDefault
                                  ? 'Quitar como cuenta predeterminada'
                                  : 'Marcar como cuenta predeterminada'
                              }
                              aria-label={
                                acc.isDefault
                                  ? 'Quitar default'
                                  : 'Marcar como default'
                              }
                            >
                              <Star
                                className={`h-3.5 w-3.5 shrink-0 transition-colors ${
                                  acc.isDefault
                                    ? 'text-amber-500 fill-amber-500'
                                    : 'text-muted-foreground/40 hover:text-amber-500'
                                }`}
                              />
                            </button>
                            {acc.status === 'archived' && (
                              <span className="text-[10px] uppercase font-bold text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                                <Archive className="h-3 w-3 inline -mt-0.5" /> Archivada
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {ACCOUNT_TYPE_LABELS[acc.type]}
                            {acc.bank ? ` · ${acc.bank}` : ''}
                          </p>
                          <p
                            className={`mt-2 text-xl font-bold ${
                              positive ? 'text-foreground' : 'text-destructive'
                            }`}
                          >
                            {formatBalance(total, acc.currency)}
                          </p>
                          <div className="mt-1 flex items-center gap-2 text-[10px] text-muted-foreground">
                            <span className="inline-flex items-center gap-1">
                              <Building2 className="h-3 w-3" aria-hidden="true" />
                              {formatBalance(acc.bankBalance, acc.currency)}
                            </span>
                            {acc.cashBalance !== 0 && (
                              <span className="inline-flex items-center gap-1">
                                <Banknote className="h-3 w-3" aria-hidden="true" />
                                {formatBalance(acc.cashBalance, acc.currency)}
                              </span>
                            )}
                          </div>
                          {!acc.includeInTotal && (
                            <p className="text-[10px] text-muted-foreground mt-1">
                              No suma al patrimonio
                            </p>
                          )}
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

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
