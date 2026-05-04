/**
 * WithdrawModal — modal para mover dinero entre los sub-saldos de UNA misma cuenta.
 *
 *  - Retiro:    bankBalance → cashBalance (saco efectivo del cajero / banco al bolsillo)
 *  - Depósito:  cashBalance → bankBalance (deposito efectivo en el banco)
 *
 * No es lo mismo que un Transfer (movimiento entre 2 cuentas distintas).
 * El backend hace la operación atómica (un solo `update` con ambos saldos).
 */

import { useEffect, useMemo, useState } from 'react';
import { ArrowDownToLine, ArrowUpFromLine, Banknote } from 'lucide-react';
import Modal, { ModalFooterActions } from '@components/common/Modal';
import { Input, TextArea } from '@components/common/Input';
import SelectorCuenta from './SelectorCuenta';
import { useCashMovements } from '@hooks/useCashMovements';
import { useAccountsContext } from '@context/AccountsContext';
import { obtenerFechaLocalISO } from '@utils/formatters';
import type { CashMovementType } from '@app-types';

interface WithdrawModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Pre-seleccionar la cuenta. */
  initialAccountId?: string;
  /** Tipo inicial de operación. */
  initialType?: CashMovementType;
  onSuccess?: (movementId: string) => void;
}

function formatBalance(value: number, currency: string): string {
  const sign = value < 0 ? '-' : '';
  const abs = Math.abs(value).toLocaleString('es-PE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `${sign}${currency} ${abs}`;
}

export default function WithdrawModal({
  isOpen,
  onClose,
  initialAccountId,
  initialType = 'withdrawal',
  onSuccess,
}: WithdrawModalProps) {
  const { activeAccounts } = useAccountsContext();
  const { retirar, depositar } = useCashMovements();

  const [type, setType] = useState<CashMovementType>(initialType);
  const [accountId, setAccountId] = useState<string>(initialAccountId ?? '');
  const [amount, setAmount] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [date, setDate] = useState<string>(obtenerFechaLocalISO());
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset al abrir
  useEffect(() => {
    if (isOpen) {
      setType(initialType);
      setAccountId(initialAccountId ?? '');
      setAmount('');
      setDescription('');
      setDate(obtenerFechaLocalISO());
      setError(null);
    }
  }, [isOpen, initialAccountId, initialType]);

  const account = useMemo(
    () => activeAccounts.find((a) => a.id === accountId),
    [activeAccounts, accountId],
  );

  const isWithdraw = type === 'withdrawal';
  const sourceBalance = isWithdraw ? account?.bankBalance ?? 0 : account?.cashBalance ?? 0;
  const sourceLabel = isWithdraw ? 'Saldo en banco' : 'Saldo en efectivo';
  const targetLabel = isWithdraw ? 'Efectivo (bolsillo)' : 'Cuenta bancaria';

  const validate = (): string | null => {
    if (!accountId) return 'Selecciona una cuenta';
    const a = parseFloat(amount);
    if (isNaN(a) || a <= 0) return 'Ingresa un monto válido';
    return null;
  };

  const handleSubmit = async () => {
    const err = validate();
    if (err) {
      setError(err);
      return;
    }
    setError(null);
    setSubmitting(true);

    try {
      const dto = {
        amount: parseFloat(amount),
        description: description.trim() || undefined,
        date: date ? new Date(date).toISOString() : undefined,
      };

      const result = isWithdraw
        ? await retirar(accountId, dto)
        : await depositar(accountId, dto);

      if (result) {
        onSuccess?.(result.id);
        onClose();
      }
    } finally {
      setSubmitting(false);
    }
  };

  const projectedSource = sourceBalance - parseFloat(amount || '0');
  const projectedTarget = isWithdraw
    ? (account?.cashBalance ?? 0) + parseFloat(amount || '0')
    : (account?.bankBalance ?? 0) + parseFloat(amount || '0');

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isWithdraw ? 'Retirar al efectivo' : 'Depositar efectivo'}
      subtitle={
        isWithdraw
          ? 'Mueve dinero de tu cuenta bancaria a tu bolsillo'
          : 'Guarda efectivo de tu bolsillo en la cuenta bancaria'
      }
      size="lg"
      footer={
        <ModalFooterActions
          onCancel={onClose}
          onConfirm={handleSubmit}
          confirmText={
            submitting
              ? 'Procesando...'
              : isWithdraw
              ? 'Retirar'
              : 'Depositar'
          }
          disabled={submitting}
        />
      }
    >
      <div className="space-y-4">
        {/* Tipo de operación */}
        <div className="grid grid-cols-2 gap-2 p-1 bg-muted rounded-lg">
          <button
            type="button"
            onClick={() => setType('withdrawal')}
            className={`flex items-center justify-center gap-2 py-2.5 rounded-md text-sm font-medium transition-colors ${
              isWithdraw
                ? 'bg-card text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <ArrowDownToLine className="h-4 w-4" />
            Retirar al efectivo
          </button>
          <button
            type="button"
            onClick={() => setType('deposit_cash')}
            className={`flex items-center justify-center gap-2 py-2.5 rounded-md text-sm font-medium transition-colors ${
              !isWithdraw
                ? 'bg-card text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <ArrowUpFromLine className="h-4 w-4" />
            Depositar efectivo
          </button>
        </div>

        {/* Cuenta */}
        <SelectorCuenta
          label="Cuenta"
          value={accountId}
          onChange={(id) => setAccountId(id)}
          required
        />

        {/* Monto */}
        <Input
          label={`Monto ${account ? `(${account.currency})` : ''}`}
          type="number"
          step="0.01"
          min="0"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="0.00"
          icon={Banknote}
          required
        />

        {/* Fecha */}
        <Input
          label="Fecha"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />

        {/* Descripción */}
        <TextArea
          label="Descripción (opcional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder={
            isWithdraw
              ? 'Ej: Retiro en cajero del óvalo Higuereta'
              : 'Ej: Deposité ahorros del freelance'
          }
          autoResize
          maxHeight={120}
        />

        {/* Error */}
        {error && (
          <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        {/* Saldos proyectados */}
        {account && amount && parseFloat(amount) > 0 && (
          <div className="p-3 rounded-lg bg-muted/50 space-y-1.5">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Después de la operación
            </p>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">{sourceLabel}</span>
              <span
                className={`font-bold ${
                  projectedSource < 0 ? 'text-destructive' : 'text-foreground'
                }`}
              >
                {formatBalance(projectedSource, account.currency)}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">{targetLabel}</span>
              <span className="font-bold text-foreground">
                {formatBalance(projectedTarget, account.currency)}
              </span>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
