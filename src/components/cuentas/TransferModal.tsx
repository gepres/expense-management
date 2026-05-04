/**
 * TransferModal — modal para transferir dinero entre 2 cuentas del usuario.
 *
 * Soporta cross-currency: si las monedas difieren, exige `amountConverted` o
 * `exchangeRate` (calcula el otro automáticamente).
 *
 * El backend hace la operación atómica (debit + credit + create transfer).
 */

import { useEffect, useMemo, useState } from 'react';
import { ArrowRight, ArrowRightLeft, Calculator } from 'lucide-react';
import Modal, { ModalFooterActions } from '@components/common/Modal';
import { Input, TextArea } from '@components/common/Input';
import SelectorCuenta from './SelectorCuenta';
import { useTransfers } from '@hooks/useTransfers';
import { useAccountsContext } from '@context/AccountsContext';
import { obtenerFechaLocalISO } from '@utils/formatters';
import type { Account } from '@app-types';

interface TransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Pre-seleccionar la cuenta origen (ej: desde detalle de cuenta). */
  initialFromAccountId?: string;
  /** Llamado tras transfer exitosa con el id creado. */
  onSuccess?: (transferId: string) => void;
}

export default function TransferModal({
  isOpen,
  onClose,
  initialFromAccountId,
  onSuccess,
}: TransferModalProps) {
  const { activeAccounts } = useAccountsContext();
  const { crear } = useTransfers();

  const [fromId, setFromId] = useState<string>(initialFromAccountId ?? '');
  const [toId, setToId] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [amountConverted, setAmountConverted] = useState<string>('');
  const [exchangeRate, setExchangeRate] = useState<string>('');
  const [fee, setFee] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [date, setDate] = useState<string>(obtenerFechaLocalISO());
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset al abrir
  useEffect(() => {
    if (isOpen) {
      setFromId(initialFromAccountId ?? '');
      setToId('');
      setAmount('');
      setAmountConverted('');
      setExchangeRate('');
      setFee('');
      setDescription('');
      setDate(obtenerFechaLocalISO());
      setError(null);
    }
  }, [isOpen, initialFromAccountId]);

  const fromAccount: Account | undefined = useMemo(
    () => activeAccounts.find((a) => a.id === fromId),
    [activeAccounts, fromId],
  );
  const toAccount: Account | undefined = useMemo(
    () => activeAccounts.find((a) => a.id === toId),
    [activeAccounts, toId],
  );

  const isCrossCurrency = useMemo(
    () =>
      Boolean(
        fromAccount && toAccount && fromAccount.currency !== toAccount.currency,
      ),
    [fromAccount, toAccount],
  );

  // Auto-calcular contraparte cuando cambia uno de los campos
  const handleAmountChange = (val: string) => {
    setAmount(val);
    if (isCrossCurrency && exchangeRate) {
      const a = parseFloat(val);
      const r = parseFloat(exchangeRate);
      if (!isNaN(a) && !isNaN(r) && r > 0) {
        setAmountConverted((a * r).toFixed(2));
      }
    }
  };

  const handleConvertedChange = (val: string) => {
    setAmountConverted(val);
    const a = parseFloat(amount);
    const c = parseFloat(val);
    if (!isNaN(a) && !isNaN(c) && a > 0) {
      setExchangeRate((c / a).toFixed(6));
    }
  };

  const handleRateChange = (val: string) => {
    setExchangeRate(val);
    const a = parseFloat(amount);
    const r = parseFloat(val);
    if (!isNaN(a) && !isNaN(r) && r > 0) {
      setAmountConverted((a * r).toFixed(2));
    }
  };

  const validate = (): string | null => {
    if (!fromId) return 'Selecciona la cuenta de origen';
    if (!toId) return 'Selecciona la cuenta de destino';
    if (fromId === toId) return 'La cuenta origen y destino no pueden ser iguales';
    const a = parseFloat(amount);
    if (isNaN(a) || a <= 0) return 'Ingresa un monto válido';
    if (isCrossCurrency) {
      const c = parseFloat(amountConverted);
      const r = parseFloat(exchangeRate);
      if ((isNaN(c) || c <= 0) && (isNaN(r) || r <= 0)) {
        return 'Para monedas distintas, ingresa el monto destino o el tipo de cambio';
      }
    }
    if (fromAccount && a + parseFloat(fee || '0') > fromAccount.bankBalance) {
      // No bloqueamos, solo aviso visual; backend acepta saldos negativos
    }
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
      const result = await crear({
        fromAccountId: fromId,
        toAccountId: toId,
        amount: parseFloat(amount),
        amountConverted: amountConverted ? parseFloat(amountConverted) : undefined,
        exchangeRate: exchangeRate ? parseFloat(exchangeRate) : undefined,
        fee: fee ? parseFloat(fee) : undefined,
        description: description.trim() || undefined,
        date: date ? new Date(date).toISOString() : undefined,
      });

      if (result) {
        onSuccess?.(result.id);
        onClose();
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Transferencia entre cuentas"
      subtitle="El monto sale de una cuenta y entra a otra atómicamente"
      size="lg"
      footer={
        <ModalFooterActions
          onCancel={onClose}
          onConfirm={handleSubmit}
          confirmText={submitting ? 'Transfiriendo...' : 'Transferir'}
          disabled={submitting}
        />
      }
    >
      <div className="space-y-4">
        {/* Cuenta origen */}
        <SelectorCuenta
          label="Desde"
          value={fromId}
          onChange={(id) => setFromId(id)}
          excludeAccountId={toId}
          required
        />

        {/* Flecha visual */}
        <div className="flex justify-center text-muted-foreground">
          <ArrowRight className="h-5 w-5" />
        </div>

        {/* Cuenta destino */}
        <SelectorCuenta
          label="Hacia"
          value={toId}
          onChange={(id) => setToId(id)}
          excludeAccountId={fromId}
          required
        />

        {/* Monto */}
        <div className="grid grid-cols-2 gap-3">
          <Input
            label={`Monto ${fromAccount ? `(${fromAccount.currency})` : ''}`}
            type="number"
            step="0.01"
            min="0"
            value={amount}
            onChange={(e) => handleAmountChange(e.target.value)}
            placeholder="0.00"
            required
          />
          {isCrossCurrency && (
            <Input
              label={`Recibe ${toAccount ? `(${toAccount.currency})` : ''}`}
              type="number"
              step="0.01"
              min="0"
              value={amountConverted}
              onChange={(e) => handleConvertedChange(e.target.value)}
              placeholder="0.00"
            />
          )}
        </div>

        {/* Tipo de cambio (cross-currency) */}
        {isCrossCurrency && (
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Tipo de cambio"
              icon={Calculator}
              type="number"
              step="0.000001"
              value={exchangeRate}
              onChange={(e) => handleRateChange(e.target.value)}
              placeholder={`1 ${fromAccount?.currency} = ?`}
              helperText={`1 ${fromAccount?.currency ?? ''} → ${toAccount?.currency ?? ''}`}
            />
            <Input
              label={`Comisión ${fromAccount ? `(${fromAccount.currency})` : ''}`}
              type="number"
              step="0.01"
              min="0"
              value={fee}
              onChange={(e) => setFee(e.target.value)}
              placeholder="0.00"
              helperText="Se debita extra de la cuenta origen"
            />
          </div>
        )}
        {!isCrossCurrency && (
          <Input
            label={`Comisión ${fromAccount ? `(${fromAccount.currency})` : ''}`}
            type="number"
            step="0.01"
            min="0"
            value={fee}
            onChange={(e) => setFee(e.target.value)}
            placeholder="0.00"
            helperText="Opcional. Se debita extra de la cuenta origen."
          />
        )}

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
          placeholder="Ej: Cambio mensual de soles a dólares"
          autoResize
          maxHeight={120}
        />

        {/* Error */}
        {error && (
          <div className="flex items-start gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
            <ArrowRightLeft className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        {/* Saldo proyectado (solo bankBalance — el efectivo no participa) */}
        {fromAccount && amount && parseFloat(amount) > 0 && (
          <div className="p-3 rounded-lg bg-muted/50 text-xs text-muted-foreground">
            Saldo en banco de <strong className="text-foreground">{fromAccount.name}</strong>{' '}
            después de la transferencia:{' '}
            <strong
              className={
                fromAccount.bankBalance -
                  parseFloat(amount) -
                  parseFloat(fee || '0') <
                0
                  ? 'text-destructive'
                  : 'text-foreground'
              }
            >
              {fromAccount.currency}{' '}
              {(
                fromAccount.bankBalance -
                parseFloat(amount) -
                parseFloat(fee || '0')
              ).toFixed(2)}
            </strong>
          </div>
        )}
      </div>
    </Modal>
  );
}
