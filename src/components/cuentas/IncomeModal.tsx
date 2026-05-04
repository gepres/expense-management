/**
 * IncomeModal — registro de un ingreso externo a una cuenta.
 *
 * En modelo Opción B "la cuenta es el presupuesto general": este movimiento
 * aumenta el saldo de la cuenta y por ende el presupuesto disponible del mes.
 *
 * Sources soportados: sin especificar, sueldo, préstamo, deuda, CTS, AFP, otros.
 * Destination: por defecto va al saldo bancario; opcionalmente al efectivo.
 */

import { useEffect, useMemo, useState } from 'react';
import {
  Briefcase,
  Building2,
  Banknote,
  TrendingUp,
} from 'lucide-react';
import Modal, { ModalFooterActions } from '@components/common/Modal';
import { Input, TextArea, Select } from '@components/common/Input';
import SelectorCuenta from './SelectorCuenta';
import { useCashMovements } from '@hooks/useCashMovements';
import { useAccountsContext } from '@context/AccountsContext';
import { obtenerFechaLocalISO } from '@utils/formatters';
import {
  INCOME_SOURCES,
  INCOME_SOURCE_LABELS,
  type IncomeDestination,
  type IncomeSource,
} from '@app-types';

interface IncomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Pre-seleccionar la cuenta. */
  initialAccountId?: string;
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

export default function IncomeModal({
  isOpen,
  onClose,
  initialAccountId,
  onSuccess,
}: IncomeModalProps) {
  const { activeAccounts } = useAccountsContext();
  const { ingresar } = useCashMovements();

  const [accountId, setAccountId] = useState<string>(initialAccountId ?? '');
  const [source, setSource] = useState<IncomeSource>('salary');
  const [destination, setDestination] = useState<IncomeDestination>('bank');
  const [amount, setAmount] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [date, setDate] = useState<string>(obtenerFechaLocalISO());
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset al abrir
  useEffect(() => {
    if (isOpen) {
      setAccountId(initialAccountId ?? '');
      setSource('salary');
      setDestination('bank');
      setAmount('');
      setDescription('');
      setDate(obtenerFechaLocalISO());
      setError(null);
    }
  }, [isOpen, initialAccountId]);

  const account = useMemo(
    () => activeAccounts.find((a) => a.id === accountId),
    [activeAccounts, accountId],
  );

  const validate = (): string | null => {
    if (!accountId) return 'Selecciona una cuenta';
    const a = parseFloat(amount);
    if (isNaN(a) || a <= 0) return 'Ingresa un monto válido';
    if (!source) return 'Selecciona el origen del ingreso';
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
      const result = await ingresar(accountId, {
        amount: parseFloat(amount),
        source,
        destination,
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

  const projectedBank =
    (account?.bankBalance ?? 0) +
    (destination === 'bank' ? parseFloat(amount || '0') : 0);
  const projectedCash =
    (account?.cashBalance ?? 0) +
    (destination === 'cash' ? parseFloat(amount || '0') : 0);
  const projectedTotal = projectedBank + projectedCash;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Registrar ingreso externo"
      subtitle="Aumenta el saldo de la cuenta y tu presupuesto del mes"
      size="lg"
      footer={
        <ModalFooterActions
          onCancel={onClose}
          onConfirm={handleSubmit}
          confirmText={submitting ? 'Procesando...' : 'Registrar ingreso'}
          disabled={submitting}
        />
      }
    >
      <div className="space-y-4">
        {/* Cuenta */}
        <SelectorCuenta
          label="Cuenta destino"
          value={accountId}
          onChange={(id) => setAccountId(id)}
          required
        />

        {/* Origen */}
        <Select
          label="Origen del ingreso"
          icon={Briefcase}
          value={source}
          onChange={(e) => setSource(e.target.value as IncomeSource)}
          required
        >
          {INCOME_SOURCES.map((s) => (
            <option key={s} value={s}>
              {INCOME_SOURCE_LABELS[s]}
            </option>
          ))}
        </Select>

        {/* Monto */}
        <Input
          label={`Monto ${account ? `(${account.currency})` : ''}`}
          type="number"
          step="0.01"
          min="0"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="0.00"
          icon={TrendingUp}
          required
        />

        {/* Destino dentro de la cuenta */}
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
            ¿Dónde se acredita?
          </label>
          <div className="grid grid-cols-2 gap-2 p-1 bg-muted rounded-lg">
            <button
              type="button"
              onClick={() => setDestination('bank')}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-md text-sm font-medium transition-colors ${
                destination === 'bank'
                  ? 'bg-card text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Building2 className="h-4 w-4" />
              Cuenta bancaria
            </button>
            <button
              type="button"
              onClick={() => setDestination('cash')}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-md text-sm font-medium transition-colors ${
                destination === 'cash'
                  ? 'bg-card text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Banknote className="h-4 w-4" />
              Efectivo
            </button>
          </div>
        </div>

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
            source === 'salary'
              ? 'Ej: Sueldo abril 2026'
              : source === 'cts'
              ? 'Ej: Depósito CTS noviembre'
              : 'Ej: Detalle del ingreso'
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
          <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 space-y-1.5">
            <p className="text-xs font-semibold text-emerald-900 dark:text-emerald-100 uppercase tracking-wider">
              Después del ingreso
            </p>
            <div className="flex items-center justify-between text-sm">
              <span className="text-emerald-800 dark:text-emerald-200 inline-flex items-center gap-1.5">
                <Building2 className="h-3.5 w-3.5" /> Banco
              </span>
              <span className="font-bold text-emerald-900 dark:text-emerald-100">
                {formatBalance(projectedBank, account.currency)}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-emerald-800 dark:text-emerald-200 inline-flex items-center gap-1.5">
                <Banknote className="h-3.5 w-3.5" /> Efectivo
              </span>
              <span className="font-bold text-emerald-900 dark:text-emerald-100">
                {formatBalance(projectedCash, account.currency)}
              </span>
            </div>
            <div className="border-t border-emerald-300 dark:border-emerald-700 pt-1.5 flex items-center justify-between text-sm">
              <span className="text-emerald-900 dark:text-emerald-100 font-semibold">
                Saldo total = Presupuesto del mes
              </span>
              <span className="font-bold text-emerald-900 dark:text-emerald-100">
                {formatBalance(projectedTotal, account.currency)}
              </span>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
