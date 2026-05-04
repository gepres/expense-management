/**
 * DetalleCuenta — vista de una cuenta con su historial completo.
 *
 * Muestra:
 *  - Cabecera con icono, saldo, moneda, banco.
 *  - Acciones: Editar, Transferir, Recalcular saldo, Archivar/Activar, Eliminar.
 *  - Historial unificado: gastos asociados + transfers in/out.
 */

import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  ChevronLeft,
  Edit2,
  ArrowRightLeft,
  ArrowDownToLine,
  ArrowUpFromLine,
  Archive,
  ArchiveRestore,
  Trash2,
  Star,
  TrendingUp,
  TrendingDown,
  Calendar,
  AlertTriangle,
  ExternalLink,
  Building2,
  Banknote,
  MoreVertical,
  RotateCcw,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react';
import { useAccountsContext } from '@context/AccountsContext';
import { useGastos } from '@hooks/useGastos';
import { useTransfers } from '@hooks/useTransfers';
import { useCashMovements } from '@hooks/useCashMovements';
import AccountIcon from './AccountIcon';
import TransferModal from './TransferModal';
import WithdrawModal from './WithdrawModal';
import IncomeModal from './IncomeModal';
import DistribucionMesWidget from './DistribucionMesWidget';
import Button from '@components/common/Button';
import CustomLoader from '@components/common/CustomLoader';
import ConfirmationModal from '@components/common/ConfirmationModal';
import { ACCOUNT_TYPE_LABELS, getAccountTotalBalance } from '@app-types';
import type { CashMovementType } from '@app-types';
import { formatearFechaCorta } from '@utils/formatters';

interface UnifiedRow {
  id: string;
  date: Date;
  type:
    | 'expense'
    | 'transfer_in'
    | 'transfer_out'
    | 'withdrawal'
    | 'deposit_cash'
    | 'income'
    | 'reversal';
  concept: string;
  amount: number;
  /** Para enlaces a la cuenta contraparte de la transfer. */
  counterpartyAccountId?: string;
  link?: string;
  /** Id del cash-movement original (para llamar revertir/eliminar). */
  cashMovementId?: string;
  /** True si el movimiento ya fue revertido (no se puede revertir de nuevo). */
  alreadyReverted?: boolean;
  /** True si este row ES un reversal. */
  isReversal?: boolean;
}

function formatBalance(value: number, currency: string): string {
  const sign = value < 0 ? '-' : '';
  const abs = Math.abs(value).toLocaleString('es-PE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `${sign}${currency} ${abs}`;
}

export default function DetalleCuenta() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const {
    obtenerPorId,
    accounts,
    archivar,
    actualizar,
    eliminar,
  } = useAccountsContext();
  const { gastos } = useGastos();
  const { transfers } = useTransfers();
  const {
    movements: cashMovements,
    revertir,
    eliminar: eliminarMovement,
  } = useCashMovements();

  const [transferOpen, setTransferOpen] = useState(false);
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [withdrawType, setWithdrawType] = useState<CashMovementType>('withdrawal');
  const [incomeOpen, setIncomeOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  // Estados de acciones del historial: id del movimiento en proceso.
  const [actionsOpenForRow, setActionsOpenForRow] = useState<string | null>(null);
  const [busyActionMovementId, setBusyActionMovementId] = useState<string | null>(null);
  const [confirmDeleteMovementId, setConfirmDeleteMovementId] = useState<string | null>(null);

  const account = id ? obtenerPorId(id) : undefined;

  // Si la cuenta no llegó aún por listener, esperar
  useEffect(() => {
    if (id && !account && accounts.length > 0) {
      // ya cargaron pero no existe → 404
      navigate('/cuentas', { replace: true });
    }
  }, [id, account, accounts, navigate]);

  // Historial unificado
  const rows: UnifiedRow[] = useMemo(() => {
    if (!account) return [];
    const out: UnifiedRow[] = [];

    for (const g of gastos) {
      if (g.accountId === account.id) {
        out.push({
          id: `e_${g.id}`,
          date: g.fecha,
          type: 'expense',
          concept: g.descripcion || g.categoria,
          amount: -g.monto,
          link: `/gastos/editar/${g.id}`,
        });
      }
    }
    for (const t of transfers) {
      if (t.fromAccountId === account.id) {
        out.push({
          id: `to_${t.id}`,
          date: t.date,
          type: 'transfer_out',
          concept: t.description || 'Transferencia',
          amount: -(t.amount + (t.fee ?? 0)),
          counterpartyAccountId: t.toAccountId,
        });
      }
      if (t.toAccountId === account.id) {
        out.push({
          id: `ti_${t.id}`,
          date: t.date,
          type: 'transfer_in',
          concept: t.description || 'Transferencia recibida',
          amount: t.amountConverted ?? t.amount,
          counterpartyAccountId: t.fromAccountId,
        });
      }
    }

    // Cash movements:
    //   - withdrawal/deposit_cash: no afectan el saldo TOTAL (solo
    //     redistribuyen entre bank/cash). Mostramos el monto real pero no
    //     suma al neto del historial.
    //   - income: SI aumenta el saldo total. Va con signo positivo.
    //   - reversal: contra-asiento, su amount se muestra negativo respecto
    //     del original.
    for (const cm of cashMovements) {
      if (cm.accountId !== account.id) continue;
      const conceptDefault =
        cm.type === 'withdrawal'
          ? 'Retiro al efectivo'
          : cm.type === 'deposit_cash'
          ? 'Depósito de efectivo'
          : cm.type === 'reversal'
          ? cm.description ?? 'Reverso'
          : 'Ingreso externo';
      out.push({
        id: `cm_${cm.id}`,
        date: cm.date,
        type: cm.type,
        concept: cm.description || conceptDefault,
        amount: cm.amount,
        cashMovementId: cm.id,
        alreadyReverted: !!cm.revertedBy,
        isReversal: cm.type === 'reversal',
      });
    }

    return out.sort((a, b) => b.date.getTime() - a.date.getTime());
  }, [account, gastos, transfers, cashMovements]);


  const handleToggleArchive = async () => {
    if (!account) return;
    if (account.status === 'archived') {
      await actualizar(account.id, { status: 'active' });
    } else {
      await archivar(account.id);
    }
  };

  const handleRevertMovement = async (movementId: string) => {
    if (busyActionMovementId) return;
    setBusyActionMovementId(movementId);
    setActionsOpenForRow(null);
    try {
      await revertir(movementId);
    } finally {
      setBusyActionMovementId(null);
    }
  };

  const handleDeleteMovement = async () => {
    if (!confirmDeleteMovementId) return;
    setBusyActionMovementId(confirmDeleteMovementId);
    try {
      await eliminarMovement(confirmDeleteMovementId);
      setConfirmDeleteMovementId(null);
    } catch {
      // toast ya emitido
    } finally {
      setBusyActionMovementId(null);
    }
  };

  const handleDelete = async () => {
    if (!account) return;
    try {
      await eliminar(account.id);
      navigate('/cuentas', { replace: true });
    } catch {
      // toast ya mostrado
    } finally {
      setConfirmDelete(false);
    }
  };

  if (!account) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <CustomLoader />
      </div>
    );
  }

  const totalBalance = getAccountTotalBalance(account);
  const positive = totalBalance >= 0;

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => navigate('/cuentas')}
          className="p-2 hover:bg-muted rounded-full transition-colors"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <h1 className="text-xl font-bold">Detalle de cuenta</h1>
      </div>

      {/* Card principal */}
      <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
        <div className="flex items-start gap-4">
          <AccountIcon account={account} size="lg" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-2xl font-bold truncate">{account.name}</h2>
              {account.isDefault && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">
                  <Star className="h-3 w-3 fill-current" /> Default
                </span>
              )}
              {account.status === 'archived' && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full bg-muted text-muted-foreground">
                  <Archive className="h-3 w-3" /> Archivada
                </span>
              )}
            </div>
            <p className="text-sm text-muted-foreground mt-0.5">
              {ACCOUNT_TYPE_LABELS[account.type]}
              {account.bank ? ` · ${account.bank}` : ''} · {account.currency}
            </p>
            <p
              className={`mt-4 text-4xl font-bold ${
                positive ? 'text-foreground' : 'text-destructive'
              }`}
            >
              {formatBalance(totalBalance, account.currency)}
            </p>
            <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
              <div className="bg-muted/40 rounded-lg p-2">
                <p className="text-muted-foreground inline-flex items-center gap-1.5">
                  <Building2 className="h-3.5 w-3.5" aria-hidden="true" />
                  En banco
                </p>
                <p
                  className={`font-bold ${
                    account.bankBalance < 0 ? 'text-destructive' : 'text-foreground'
                  }`}
                >
                  {formatBalance(account.bankBalance, account.currency)}
                </p>
              </div>
              <div className="bg-muted/40 rounded-lg p-2">
                <p className="text-muted-foreground inline-flex items-center gap-1.5">
                  <Banknote className="h-3.5 w-3.5" aria-hidden="true" />
                  En efectivo
                </p>
                <p
                  className={`font-bold ${
                    account.cashBalance < 0 ? 'text-destructive' : 'text-foreground'
                  }`}
                >
                  {formatBalance(account.cashBalance, account.currency)}
                </p>
              </div>
            </div>
            {!account.includeInTotal && (
              <p className="text-xs text-muted-foreground mt-1">
                ⓘ No suma al patrimonio total
              </p>
            )}
            {account.type === 'card' && account.creditLimit !== undefined && (
              <p className="text-xs text-muted-foreground mt-1">
                Límite de crédito: {formatBalance(account.creditLimit, account.currency)}
              </p>
            )}
          </div>
        </div>

        {/* Acciones */}
        <div className="mt-6 grid grid-cols-2 md:grid-cols-3 gap-2">
          <Button
            variant="success"
            icon={TrendingUp}
            onClick={() => setIncomeOpen(true)}
            disabled={account.status === 'archived'}
            title="Registrar un ingreso externo (sueldo, préstamo, CTS…)"
          >
            Ingreso
          </Button>
          <Button
            variant="secondary"
            icon={ArrowDownToLine}
            onClick={() => {
              setWithdrawType('withdrawal');
              setWithdrawOpen(true);
            }}
            disabled={account.status === 'archived'}
          >
            Retirar
          </Button>
          <Button
            variant="secondary"
            icon={ArrowUpFromLine}
            onClick={() => {
              setWithdrawType('deposit_cash');
              setWithdrawOpen(true);
            }}
            disabled={account.status === 'archived'}
          >
            Depositar
          </Button>
          <Button
            variant="secondary"
            icon={ArrowRightLeft}
            onClick={() => setTransferOpen(true)}
            disabled={account.status === 'archived'}
          >
            Transferir
          </Button>
          <Link to={`/cuentas/editar/${account.id}`}>
            <Button variant="secondary" icon={Edit2} fullWidth>
              Editar
            </Button>
          </Link>
          {/* Botón Recalcular desactivado: el saldo se mantiene consistente
              automáticamente vía transacciones backend. Solo necesario para
              casos de migración o inconsistencia detectada (no UI actualmente). */}
          <Button
            variant={account.status === 'archived' ? 'success' : 'secondary'}
            icon={account.status === 'archived' ? ArchiveRestore : Archive}
            onClick={handleToggleArchive}
          >
            {account.status === 'archived' ? 'Activar' : 'Archivar'}
          </Button>
        </div>

      </div>

      {/* Distribución del mes (cuenta = presupuesto) */}
      <DistribucionMesWidget account={account} />

      {/* Historial */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Calendar className="h-5 w-5 text-muted-foreground" />
            Historial
          </h2>
          <span className="text-xs text-muted-foreground">
            {rows.length} movimiento(s)
          </span>
        </div>

        {rows.length === 0 ? (
          <div className="bg-card border border-dashed border-border rounded-xl p-8 text-center text-muted-foreground text-sm">
            Aún no hay movimientos en esta cuenta.
          </div>
        ) : (
          <div className="bg-card border border-border rounded-xl divide-y divide-border overflow-hidden">
            {rows.map((row) => {
              const isCashMovement =
                row.type === 'withdrawal' || row.type === 'deposit_cash';
              const isIncome = row.type === 'income';
              const isPositive = row.amount >= 0 && !isCashMovement;
              const isNegative = row.amount < 0;

              const Icon = isIncome
                ? TrendingUp
                : isCashMovement
                ? row.type === 'withdrawal'
                  ? ArrowDownToLine
                  : ArrowUpFromLine
                : isPositive
                ? TrendingUp
                : TrendingDown;

              const iconColor = isIncome
                ? 'bg-emerald-500/10 text-emerald-600'
                : isCashMovement
                ? 'bg-blue-500/10 text-blue-600'
                : isPositive
                ? 'bg-emerald-500/10 text-emerald-600'
                : 'bg-rose-500/10 text-rose-600';

              const typeLabel = ({
                expense: 'Gasto',
                transfer_in: 'Transferencia recibida',
                transfer_out: 'Transferencia enviada',
                withdrawal: 'Retiro al efectivo',
                deposit_cash: 'Depósito de efectivo',
                income: 'Ingreso externo',
                reversal: 'Reverso',
              } as const)[row.type];

              // Solo movimientos de cash (income, withdrawal, deposit_cash,
              // reversal) tienen acciones revertir/eliminar. Gastos y
              // transfers se editan/eliminan en sus vistas propias.
              const showCashActions = !!row.cashMovementId;
              const canRevert =
                showCashActions && !row.alreadyReverted && !row.isReversal;
              const isBusy = busyActionMovementId === row.cashMovementId;
              const menuOpen = actionsOpenForRow === row.id;

              return (
                <div
                  key={row.id}
                  className="flex items-center gap-3 p-3 hover:bg-accent/30 transition-colors"
                >
                  <div
                    className={`h-9 w-9 rounded-full flex items-center justify-center shrink-0 ${iconColor}`}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {row.concept}
                    </p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1.5 flex-wrap">
                      <span>
                        {formatearFechaCorta(row.date)} · {typeLabel}
                      </span>
                      {row.alreadyReverted && (
                        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200">
                          <CheckCircle2 className="h-2.5 w-2.5" /> Revertido
                        </span>
                      )}
                      {row.isReversal && (
                        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200">
                          <RotateCcw className="h-2.5 w-2.5" /> Reverso
                        </span>
                      )}
                    </p>
                  </div>
                  <p
                    className={`text-sm font-bold whitespace-nowrap ${
                      row.isReversal
                        ? 'text-blue-600 dark:text-blue-400'
                        : row.alreadyReverted
                        ? 'line-through text-muted-foreground'
                        : isCashMovement
                        ? 'text-muted-foreground'
                        : isPositive
                        ? 'text-emerald-600'
                        : 'text-foreground'
                    }`}
                  >
                    {!isCashMovement && isPositive && '+'}
                    {!isCashMovement && isNegative && ''}
                    {row.isReversal && '-'}
                    {formatBalance(
                      isCashMovement ? Math.abs(row.amount) : row.amount,
                      account.currency,
                    )}
                  </p>
                  {row.link && (
                    <Link
                      to={row.link}
                      className="text-muted-foreground hover:text-primary"
                      title="Ver"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Link>
                  )}
                  {showCashActions && (
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() =>
                          setActionsOpenForRow(menuOpen ? null : row.id)
                        }
                        disabled={isBusy}
                        className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
                        title="Acciones"
                        aria-label="Acciones del movimiento"
                      >
                        {isBusy ? (
                          <RefreshCw className="h-4 w-4 animate-spin" />
                        ) : (
                          <MoreVertical className="h-4 w-4" />
                        )}
                      </button>
                      {menuOpen && (
                        <>
                          {/* Backdrop para cerrar al click fuera */}
                          <div
                            className="fixed inset-0 z-20"
                            onClick={() => setActionsOpenForRow(null)}
                          />
                          <div className="absolute right-0 top-full mt-1 z-30 min-w-[180px] bg-card border border-border rounded-lg shadow-lg overflow-hidden">
                            {canRevert && (
                              <button
                                type="button"
                                onClick={() =>
                                  row.cashMovementId &&
                                  handleRevertMovement(row.cashMovementId)
                                }
                                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-left text-foreground hover:bg-muted transition-colors"
                              >
                                <RotateCcw className="h-3.5 w-3.5" />
                                Revertir
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => {
                                setActionsOpenForRow(null);
                                setConfirmDeleteMovementId(
                                  row.cashMovementId ?? null,
                                );
                              }}
                              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-left text-destructive hover:bg-destructive/10 transition-colors"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                              Eliminar
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Zona de peligro */}
      <div className="bg-destructive/5 border border-destructive/20 rounded-xl p-4">
        <h3 className="text-sm font-semibold text-destructive mb-1 flex items-center gap-2">
          <AlertTriangle className="h-4 w-4" />
          Zona de peligro
        </h3>
        <p className="text-xs text-muted-foreground mb-3">
          Eliminar la cuenta permanentemente. Si tiene gastos asociados, deberás
          archivarla en su lugar.
        </p>
        <Button
          variant="destructive"
          icon={Trash2}
          onClick={() => setConfirmDelete(true)}
        >
          Eliminar cuenta
        </Button>
      </div>

      <TransferModal
        isOpen={transferOpen}
        onClose={() => setTransferOpen(false)}
        initialFromAccountId={account.id}
      />

      <WithdrawModal
        isOpen={withdrawOpen}
        onClose={() => setWithdrawOpen(false)}
        initialAccountId={account.id}
        initialType={withdrawType}
      />

      <IncomeModal
        isOpen={incomeOpen}
        onClose={() => setIncomeOpen(false)}
        initialAccountId={account.id}
      />

      <ConfirmationModal
        isOpen={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={handleDelete}
        title="¿Eliminar esta cuenta?"
        description={`Vas a eliminar "${account.name}" permanentemente. Si tiene gastos asociados la operación fallará y deberás archivarla.`}
        confirmText="Sí, eliminar"
        cancelText="Cancelar"
        isDestructive
      />

      <ConfirmationModal
        isOpen={!!confirmDeleteMovementId}
        onClose={() => setConfirmDeleteMovementId(null)}
        onConfirm={handleDeleteMovement}
        title="¿Eliminar este movimiento?"
        description="El monto se devolverá automáticamente al saldo de la cuenta. Esta acción no se puede deshacer."
        confirmText="Sí, eliminar"
        cancelText="Cancelar"
        isDestructive
      />
    </div>
  );
}
