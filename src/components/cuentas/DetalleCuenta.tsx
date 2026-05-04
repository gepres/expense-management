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
  RefreshCw,
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
  Info,
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
    | 'income';
  concept: string;
  amount: number;
  /** Para enlaces a la cuenta contraparte de la transfer. */
  counterpartyAccountId?: string;
  link?: string;
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
    recalcular,
  } = useAccountsContext();
  const { gastos } = useGastos();
  const { transfers } = useTransfers();
  const { movements: cashMovements } = useCashMovements();

  const [transferOpen, setTransferOpen] = useState(false);
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [withdrawType, setWithdrawType] = useState<CashMovementType>('withdrawal');
  const [incomeOpen, setIncomeOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [recalculating, setRecalculating] = useState(false);
  const [showRecalculateInfo, setShowRecalculateInfo] = useState(false);

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
    for (const cm of cashMovements) {
      if (cm.accountId !== account.id) continue;
      const conceptDefault =
        cm.type === 'withdrawal'
          ? 'Retiro al efectivo'
          : cm.type === 'deposit_cash'
          ? 'Depósito de efectivo'
          : 'Ingreso externo';
      out.push({
        id: `cm_${cm.id}`,
        date: cm.date,
        type: cm.type,
        concept: cm.description || conceptDefault,
        amount: cm.type === 'income' ? cm.amount : cm.amount, // income suma; los demás son visuales
      });
    }

    return out.sort((a, b) => b.date.getTime() - a.date.getTime());
  }, [account, gastos, transfers, cashMovements]);

  const handleRecalculate = async () => {
    if (!account) return;
    setRecalculating(true);
    try {
      await recalcular(account.id);
    } finally {
      setRecalculating(false);
    }
  };

  const handleToggleArchive = async () => {
    if (!account) return;
    if (account.status === 'archived') {
      await actualizar(account.id, { status: 'active' });
    } else {
      await archivar(account.id);
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
          <div className="relative">
            <Button
              variant="secondary"
              icon={RefreshCw}
              onClick={handleRecalculate}
              loading={recalculating}
              fullWidth
              title="Recalcula el saldo desde cero sumando todos los movimientos"
            >
              Recalcular
            </Button>
            <button
              type="button"
              onClick={() => setShowRecalculateInfo((v) => !v)}
              className="absolute -top-1 -right-1 p-1 rounded-full bg-card border border-border text-muted-foreground hover:text-foreground hover:border-primary/40 transition-colors"
              aria-label="¿Qué hace este botón?"
            >
              <Info className="h-3 w-3" />
            </button>
          </div>
          <Button
            variant={account.status === 'archived' ? 'success' : 'secondary'}
            icon={account.status === 'archived' ? ArchiveRestore : Archive}
            onClick={handleToggleArchive}
          >
            {account.status === 'archived' ? 'Activar' : 'Archivar'}
          </Button>
        </div>

        {showRecalculateInfo && (
          <div className="mt-4 rounded-lg border border-blue-300 dark:border-blue-700 bg-blue-50 dark:bg-blue-900/20 p-4 text-sm">
            <div className="flex items-start gap-2">
              <Info className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
              <div className="flex-1">
                <p className="font-semibold text-blue-900 dark:text-blue-100 mb-1">
                  ¿Qué hace "Recalcular"?
                </p>
                <p className="text-blue-800 dark:text-blue-200">
                  Reconstruye el saldo de la cuenta desde cero sumando el saldo
                  inicial + ingresos + transferencias recibidas − gastos −
                  transferencias enviadas. El resultado <strong>sobrescribe</strong>{' '}
                  los campos <code className="px-1 bg-blue-100 dark:bg-blue-900/40 rounded">bankBalance</code>{' '}
                  y <code className="px-1 bg-blue-100 dark:bg-blue-900/40 rounded">cashBalance</code>{' '}
                  de la cuenta.
                </p>
                <p className="text-blue-800 dark:text-blue-200 mt-2 font-medium">¿Cuándo usarlo?</p>
                <ul className="text-blue-800 dark:text-blue-200 list-disc ml-5 mt-1 space-y-0.5">
                  <li>El saldo no cuadra con el historial de movimientos.</li>
                  <li>Importaste gastos masivamente desde Excel.</li>
                  <li>Editaste o borraste un gasto antiguo y dudas del saldo.</li>
                  <li>Después de migrar datos o restaurar un backup.</li>
                </ul>
                <p className="text-xs text-blue-700 dark:text-blue-300 mt-2">
                  ⚠️ La operación es segura (solo lee y suma) pero requiere conexión al backend.
                </p>
              </div>
            </div>
          </div>
        )}
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
              } as const)[row.type];

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
                    <p className="text-xs text-muted-foreground">
                      {formatearFechaCorta(row.date)} · {typeLabel}
                    </p>
                  </div>
                  <p
                    className={`text-sm font-bold whitespace-nowrap ${
                      isCashMovement
                        ? 'text-muted-foreground'
                        : isPositive
                        ? 'text-emerald-600'
                        : 'text-foreground'
                    }`}
                  >
                    {!isCashMovement && isPositive && '+'}
                    {!isCashMovement && isNegative && ''}
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
    </div>
  );
}
