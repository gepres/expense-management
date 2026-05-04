/**
 * SelectorCuenta — selector de cuenta para usar dentro de formularios.
 *
 * Comportamiento:
 *  - Desktop: dropdown clásico con preview de saldo + moneda.
 *  - Mobile (<sm): bottom sheet estilo iOS Wallet con cards grandes.
 *
 * Filtros:
 *  - `currency`: muestra solo cuentas en esa moneda.
 *  - `excludeAccountId`: oculta una cuenta (útil para evitar transferir a sí mismo).
 */

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, Check, AlertCircle, Star } from 'lucide-react';
import Modal from '@components/common/Modal';
import AccountIcon from './AccountIcon';
import { useAccountsContext } from '@context/AccountsContext';
import { getAccountTotalBalance } from '@app-types';
import type { Account } from '@app-types';
import { useBreakpoints } from '@/hooks/useBreakpoints';

interface SelectorCuentaProps {
  value?: string;
  onChange: (accountId: string, account: Account) => void;
  /** Filtra solo cuentas en esta moneda (PEN, USD, etc.). */
  currency?: string;
  /** Oculta una cuenta (ej: la cuenta origen al elegir destino). */
  excludeAccountId?: string;
  label?: string;
  required?: boolean;
  error?: string;
  /** Si true, no muestra el saldo (útil cuando se usa para crear gasto y no debe distraer). */
  hideBalance?: boolean;
  disabled?: boolean;
  placeholder?: string;
}

function formatBalance(value: number, currency: string): string {
  const sign = value < 0 ? '-' : '';
  const abs = Math.abs(value).toLocaleString('es-PE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `${sign}${currency} ${abs}`;
}

export default function SelectorCuenta({
  value,
  onChange,
  currency,
  excludeAccountId,
  label,
  required,
  error,
  hideBalance,
  disabled,
  placeholder = 'Seleccionar cuenta',
}: SelectorCuentaProps) {
  const { activeAccounts } = useAccountsContext();
  const { isMobile } = useBreakpoints();
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  // Posición del popover desktop calculada desde el trigger.
  // Usamos `position: fixed` + portal a body para escapar de cualquier
  // overflow:hidden o stacking context del padre (cards, modales).
  const [popoverPos, setPopoverPos] = useState<{
    top: number;
    left: number;
    width: number;
    placeBelow: boolean;
  } | null>(null);

  const recomputePopoverPos = () => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const POPOVER_MAX_HEIGHT = 320; // tailwind max-h-80
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;
    const placeBelow = spaceBelow >= POPOVER_MAX_HEIGHT || spaceBelow >= spaceAbove;
    setPopoverPos({
      top: placeBelow ? rect.bottom + 4 : Math.max(8, rect.top - 4),
      left: rect.left,
      width: rect.width,
      placeBelow,
    });
  };

  // Recalcular cuando se abre + en scroll/resize mientras está abierto.
  useLayoutEffect(() => {
    if (!open || isMobile) return;
    recomputePopoverPos();
    const handler = () => recomputePopoverPos();
    window.addEventListener('scroll', handler, true);
    window.addEventListener('resize', handler);
    return () => {
      window.removeEventListener('scroll', handler, true);
      window.removeEventListener('resize', handler);
    };
  }, [open, isMobile]);

  const filteredAccounts = useMemo(
    () =>
      activeAccounts.filter((a) => {
        if (currency && a.currency !== currency) return false;
        if (excludeAccountId && a.id === excludeAccountId) return false;
        return true;
      }),
    [activeAccounts, currency, excludeAccountId],
  );

  const selected = useMemo(
    () => filteredAccounts.find((a) => a.id === value) ?? null,
    [filteredAccounts, value],
  );

  // Cerrar dropdown al hacer click fuera (desktop). El popover ahora vive en
  // un portal a body, así que verificamos contra trigger Y popover por
  // separado.
  useEffect(() => {
    if (!open || isMobile) return;
    const handler = (e: MouseEvent) => {
      const target = e.target as Node;
      if (containerRef.current?.contains(target)) return;
      if (popoverRef.current?.contains(target)) return;
      setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open, isMobile]);

  const handleSelect = (account: Account) => {
    onChange(account.id, account);
    setOpen(false);
  };

  // Estado vacío cuando no hay cuentas en esa moneda
  const isEmpty = filteredAccounts.length === 0;

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-foreground mb-1.5">
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </label>
      )}

      {/* Trigger + popover envueltos: para que el click-outside funcione */}
      <div ref={containerRef} className="relative">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => !disabled && !isEmpty && setOpen(true)}
        disabled={disabled || isEmpty}
        className={`
          w-full flex items-center gap-3 px-3 py-2.5
          rounded-lg border bg-background
          text-left
          transition-colors
          ${error ? 'border-destructive' : 'border-input'}
          ${disabled || isEmpty ? 'opacity-60 cursor-not-allowed' : 'hover:border-primary/50 cursor-pointer'}
        `}
      >
        {selected ? (
          <>
            <AccountIcon account={selected} size="sm" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <p className="text-sm font-medium text-foreground truncate">
                  {selected.name}
                </p>
                {selected.isDefault && (
                  <Star className="h-3 w-3 text-amber-500 fill-amber-500 shrink-0" />
                )}
              </div>
              {!hideBalance && (
                <p
                  className={`text-xs ${
                    getAccountTotalBalance(selected) < 0
                      ? 'text-destructive'
                      : 'text-muted-foreground'
                  }`}
                >
                  {formatBalance(getAccountTotalBalance(selected), selected.currency)}
                </p>
              )}
            </div>
          </>
        ) : (
          <>
            <div className="h-9 w-9 rounded-full bg-muted flex items-center justify-center text-muted-foreground shrink-0">
              {isEmpty ? <AlertCircle className="h-4 w-4" /> : '?'}
            </div>
            <span className="flex-1 text-sm text-muted-foreground">
              {isEmpty
                ? currency
                  ? `Sin cuentas en ${currency}`
                  : 'No hay cuentas activas'
                : placeholder}
            </span>
          </>
        )}
        <ChevronDown
          className={`h-4 w-4 text-muted-foreground shrink-0 transition-transform ${
            open ? 'rotate-180' : ''
          }`}
        />
      </button>

      {error && <p className="mt-1 text-xs text-destructive">{error}</p>}

      </div>

      {/* Desktop: popover en portal a body para escapar overflow/stacking */}
      {open && !isMobile && popoverPos &&
        createPortal(
          <div
            ref={popoverRef}
            style={{
              position: 'fixed',
              top: popoverPos.placeBelow ? popoverPos.top : undefined,
              bottom: popoverPos.placeBelow
                ? undefined
                : window.innerHeight - popoverPos.top,
              left: popoverPos.left,
              width: popoverPos.width,
            }}
            className="z-[100] bg-card border border-border rounded-xl shadow-lg max-h-80 overflow-y-auto py-1"
          >
            {filteredAccounts.map((acc) => (
              <button
                key={acc.id}
                type="button"
                onClick={() => handleSelect(acc)}
                className={`
                  w-full flex items-center gap-3 px-3 py-2.5
                  hover:bg-accent transition-colors text-left
                  ${value === acc.id ? 'bg-primary/5' : ''}
                `}
              >
                <AccountIcon account={acc} size="sm" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="text-sm font-medium text-foreground truncate">
                      {acc.name}
                    </p>
                    {acc.isDefault && (
                      <Star className="h-3 w-3 text-amber-500 fill-amber-500 shrink-0" />
                    )}
                  </div>
                  {!hideBalance && (
                    <p
                      className={`text-xs ${
                        getAccountTotalBalance(acc) < 0
                          ? 'text-destructive'
                          : 'text-muted-foreground'
                      }`}
                    >
                      {formatBalance(getAccountTotalBalance(acc), acc.currency)}
                    </p>
                  )}
                </div>
                {value === acc.id && (
                  <Check className="h-4 w-4 text-primary shrink-0" />
                )}
              </button>
            ))}
          </div>,
          document.body,
        )}

      {/* Mobile: bottom sheet con cards grandes */}
      {open && isMobile && (
        <Modal
          isOpen={open}
          onClose={() => setOpen(false)}
          title="Seleccionar cuenta"
          size="md"
        >
          <div className="space-y-2">
            {filteredAccounts.map((acc) => (
              <button
                key={acc.id}
                type="button"
                onClick={() => handleSelect(acc)}
                className={`
                  w-full flex items-center gap-3 p-3
                  rounded-xl border transition-colors text-left
                  ${
                    value === acc.id
                      ? 'border-primary bg-primary/5'
                      : 'border-border bg-card hover:bg-accent'
                  }
                `}
              >
                <AccountIcon account={acc} size="md" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="font-medium text-foreground truncate">
                      {acc.name}
                    </p>
                    {acc.isDefault && (
                      <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500 shrink-0" />
                    )}
                  </div>
                  {!hideBalance && (
                    <p
                      className={`text-sm ${
                        getAccountTotalBalance(acc) < 0
                          ? 'text-destructive'
                          : 'text-muted-foreground'
                      }`}
                    >
                      {formatBalance(getAccountTotalBalance(acc), acc.currency)}
                    </p>
                  )}
                </div>
                {value === acc.id && (
                  <Check className="h-5 w-5 text-primary shrink-0" />
                )}
              </button>
            ))}
          </div>
        </Modal>
      )}
    </div>
  );
}
