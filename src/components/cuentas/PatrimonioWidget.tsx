/**
 * PatrimonioWidget — muestra el patrimonio total agrupado por moneda.
 *
 * Suma (bankBalance + cashBalance) de cuentas activas con `includeInTotal: true`.
 * Si hay múltiples monedas, las muestra por separado (sin conversión automática).
 */

import { useMemo } from 'react';
import { TrendingUp, TrendingDown, Wallet } from 'lucide-react';
import { useAccountsContext } from '@context/AccountsContext';

function formatBalance(value: number, currency: string): string {
  const sign = value < 0 ? '-' : '';
  const abs = Math.abs(value).toLocaleString('es-PE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `${sign}${currency} ${abs}`;
}

export default function PatrimonioWidget() {
  const { patrimonioPorMoneda, activeAccounts } = useAccountsContext();

  const entries = useMemo(
    () => Object.entries(patrimonioPorMoneda),
    [patrimonioPorMoneda],
  );

  // Determinar moneda principal (la primera, o PEN por default)
  const principalEntry = entries[0];

  if (!principalEntry) {
    return (
      <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
            <Wallet className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <p className="text-sm font-medium text-muted-foreground">Patrimonio</p>
        </div>
        <p className="text-3xl font-bold text-muted-foreground">—</p>
        <p className="mt-2 text-xs text-muted-foreground">
          Activa "Sumar al patrimonio total" en alguna cuenta.
        </p>
      </div>
    );
  }

  const [principalCurrency, principalTotal] = principalEntry;
  const positive = principalTotal >= 0;

  return (
    <div className="bg-card border border-border rounded-xl p-5 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
      <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity pointer-events-none">
        <Wallet className="h-24 w-24 text-emerald-500 transform rotate-6 translate-x-4 -translate-y-4" />
      </div>

      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
            <Wallet className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Patrimonio</p>
            <p className="text-[10px] text-muted-foreground/80 uppercase tracking-wider">
              Suma de cuentas activas
            </p>
          </div>
        </div>

        <p
          className={`text-3xl font-bold tracking-tight ${
            positive ? 'text-foreground' : 'text-destructive'
          }`}
        >
          {formatBalance(principalTotal, principalCurrency)}
        </p>

        {/* Otras monedas (si hay más de 1) */}
        {entries.length > 1 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {entries.slice(1).map(([currency, total]) => (
              <span
                key={currency}
                className="bg-background/50 px-2 py-1 rounded border border-border text-xs font-medium"
              >
                {formatBalance(total, currency)}
              </span>
            ))}
          </div>
        )}

        <div className="mt-3 flex items-center gap-1 text-xs text-muted-foreground">
          {positive ? (
            <TrendingUp className="h-3 w-3 text-emerald-500" />
          ) : (
            <TrendingDown className="h-3 w-3 text-destructive" />
          )}
          <span>
            {activeAccounts.filter((a) => a.includeInTotal).length} cuenta(s) sumando
          </span>
        </div>
      </div>
    </div>
  );
}
