/**
 * Renderiza el icono visual de una cuenta.
 *
 * Si la cuenta tiene `icon` (emoji), lo usa.
 * Si no, usa el icono por defecto del tipo (cash → 💵, bank → 🏦, etc.).
 */

import type { Account, AccountType } from '@app-types';
import { ACCOUNT_TYPE_ICONS } from '@app-types';

interface AccountIconProps {
  account?: Pick<Account, 'icon' | 'color' | 'type'> | null;
  type?: AccountType;
  icon?: string;
  color?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  className?: string;
}

const SIZE_CLASSES = {
  xs: 'h-7 w-7 text-base',
  sm: 'h-9 w-9 text-lg',
  md: 'h-11 w-11 text-xl',
  lg: 'h-14 w-14 text-2xl',
};

export default function AccountIcon({
  account,
  type,
  icon,
  color,
  size = 'sm',
  className = '',
}: AccountIconProps) {
  const resolvedIcon =
    icon ??
    account?.icon ??
    (account?.type ? ACCOUNT_TYPE_ICONS[account.type] : undefined) ??
    (type ? ACCOUNT_TYPE_ICONS[type] : undefined) ??
    '📦';

  const resolvedColor = color ?? account?.color ?? '#3b82f6';

  return (
    <div
      className={`
        ${SIZE_CLASSES[size]}
        rounded-full flex items-center justify-center shrink-0
        border border-border
        ${className}
      `}
      style={{
        backgroundColor: `${resolvedColor}20`, // 20 = ~12% opacity en hex
      }}
    >
      <span aria-hidden="true">{resolvedIcon}</span>
    </div>
  );
}
