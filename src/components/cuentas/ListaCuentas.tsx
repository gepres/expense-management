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
  CreditCard,
  Copy,
  Check,
} from 'lucide-react';
import { useAuth } from '@context/AuthContext';
import { useAccountsContext } from '@context/AccountsContext';
import AccountIcon from './AccountIcon';
import TransferModal from './TransferModal';
import IncomeModal from './IncomeModal';
import Button from '@components/common/Button';
import CustomLoader from '@components/common/CustomLoader';
import Modal, { ModalButton } from '@components/common/Modal';
import { ACCOUNT_TYPE_LABELS, getAccountTotalBalance, type Account } from '@app-types';
import { decryptCardField, maskCardNumber } from '@utils/card-crypto';
import toast from 'react-hot-toast';

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
  const { usuario } = useAuth();

  const [showArchived, setShowArchived] = useState(false);
  const [search, setSearch] = useState('');
  const [transferOpen, setTransferOpen] = useState(false);
  const [incomeOpen, setIncomeOpen] = useState(false);
  const [togglingDefault, setTogglingDefault] = useState<string | null>(null);
  // Estado del modal "Datos de tarjeta": cuenta seleccionada + número descifrado.
  const [cardModalAccount, setCardModalAccount] = useState<Account | null>(null);
  const [revealedCardNumber, setRevealedCardNumber] = useState<string | null>(null);
  const [decryptingCard, setDecryptingCard] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

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

  const handleOpenCardModal = (e: React.MouseEvent, acc: Account) => {
    e.preventDefault();
    e.stopPropagation();
    setCardModalAccount(acc);
    setRevealedCardNumber(null);
  };

  const handleRevealAndCopy = async (
    field: 'number' | 'holder' | 'exp',
  ): Promise<void> => {
    if (!cardModalAccount?.cardData || !usuario) return;
    let value: string | null = null;
    try {
      if (field === 'number') {
        if (!revealedCardNumber) {
          setDecryptingCard(true);
          const plain = await decryptCardField(
            cardModalAccount.cardData.cardNumberEnc,
            usuario.id,
          );
          setRevealedCardNumber(plain);
          value = plain;
        } else {
          value = revealedCardNumber;
        }
      } else if (field === 'holder') {
        value = cardModalAccount.cardData.holderName;
      } else if (field === 'exp') {
        const m = String(cardModalAccount.cardData.expMonth).padStart(2, '0');
        value = `${m}/${cardModalAccount.cardData.expYear}`;
      }
      if (value) {
        await navigator.clipboard.writeText(value);
        setCopiedField(field);
        toast.success('Copiado al portapapeles');
        setTimeout(() => setCopiedField(null), 1500);
      }
    } catch (err) {
      console.error('Decrypt/copy failed:', err);
      toast.error('Error al copiar (portapapeles bloqueado o clave inválida)');
    } finally {
      setDecryptingCard(false);
    }
  };

  const closeCardModal = () => {
    setCardModalAccount(null);
    setRevealedCardNumber(null);
    setCopiedField(null);
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
                          {acc.type === 'card' && acc.cardData && (
                            <button
                              type="button"
                              onClick={(e) => handleOpenCardModal(e, acc)}
                              className="mt-1 inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
                              title="Ver y copiar datos de tarjeta"
                            >
                              <CreditCard className="h-3 w-3" />
                              {maskCardNumber(acc.cardData.cardLast4)}
                              <Copy className="h-2.5 w-2.5" />
                            </button>
                          )}
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

      {/* Modal: gestor de datos de tarjeta */}
      <Modal
        isOpen={!!cardModalAccount}
        onClose={closeCardModal}
        title={cardModalAccount?.name ?? ''}
        subtitle="Datos de tarjeta"
        size="md"
      >
        {cardModalAccount?.cardData && (
          <div className="space-y-4">
            <div className="rounded-xl bg-gradient-to-br from-slate-700 to-slate-900 dark:from-slate-800 dark:to-black text-white p-5 shadow-lg">
              <div className="flex items-start justify-between mb-6">
                <CreditCard className="h-7 w-7 opacity-80" />
                <span className="text-xs uppercase tracking-wider opacity-80">
                  {cardModalAccount.cardData.brand ?? 'card'}
                </span>
              </div>
              <p className="text-2xl font-mono tracking-widest mb-3">
                {revealedCardNumber
                  ? revealedCardNumber.replace(/(.{4})/g, '$1 ').trim()
                  : maskCardNumber(cardModalAccount.cardData.cardLast4)}
              </p>
              <div className="flex items-end justify-between text-sm">
                <div>
                  <p className="text-[10px] uppercase opacity-70 tracking-wider">Titular</p>
                  <p className="font-medium">{cardModalAccount.cardData.holderName}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] uppercase opacity-70 tracking-wider">Vence</p>
                  <p className="font-medium">
                    {String(cardModalAccount.cardData.expMonth).padStart(2, '0')}/
                    {String(cardModalAccount.cardData.expYear).slice(-2)}
                  </p>
                </div>
              </div>
            </div>

            {/* Botones de copia */}
            <div className="space-y-2">
              <ModalButton
                variant="primary"
                onClick={() => void handleRevealAndCopy('number')}
                disabled={decryptingCard}
                className="!justify-start !text-left flex items-center gap-2"
              >
                {copiedField === 'number' ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
                {revealedCardNumber
                  ? copiedField === 'number'
                    ? 'Número copiado'
                    : 'Copiar número'
                  : decryptingCard
                  ? 'Descifrando...'
                  : 'Revelar y copiar número'}
              </ModalButton>

              <ModalButton
                variant="secondary"
                onClick={() => void handleRevealAndCopy('holder')}
                className="!justify-start !text-left flex items-center gap-2"
              >
                {copiedField === 'holder' ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
                {copiedField === 'holder' ? 'Titular copiado' : 'Copiar titular'}
              </ModalButton>

              <ModalButton
                variant="secondary"
                onClick={() => void handleRevealAndCopy('exp')}
                className="!justify-start !text-left flex items-center gap-2"
              >
                {copiedField === 'exp' ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
                {copiedField === 'exp' ? 'Vencimiento copiado' : 'Copiar vencimiento'}
              </ModalButton>
            </div>

            <div className="text-[11px] text-muted-foreground border-t border-border pt-3">
              ⓘ El CVC nunca se almacena. Si lo necesitás, sacalo de tu plástico
              o de tu app del banco.
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
