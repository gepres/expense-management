/**
 * Badge PRO unificado de la app.
 *
 * Estilo canónico: degradado dorado (amber-500 → amber-600) con corona y
 * texto "PRO" en blanco. Úsalo en TODOS los sitios donde se indique cuenta
 * PRO (home, perfil, métricas, nav, menú móvil) para mantener consistencia.
 */

import { Crown } from 'lucide-react';
import { cn } from '@utils/cn';

interface ProBadgeProps {
  size?: 'sm' | 'md' | 'lg';
  /** Mostrar el texto "PRO" (false = solo corona). Default true. */
  showText?: boolean;
  className?: string;
}

const SIZES = {
  sm: { box: 'px-1.5 py-0.5 text-[10px] gap-0.5', icon: 'h-2.5 w-2.5' },
  md: { box: 'px-2.5 py-1 text-[11px] gap-1', icon: 'h-3 w-3' },
  lg: { box: 'px-3 py-1 text-xs gap-1', icon: 'h-3.5 w-3.5' },
} as const;

export default function ProBadge({
  size = 'md',
  showText = true,
  className,
}: ProBadgeProps) {
  const s = SIZES[size];
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full font-semibold text-white bg-gradient-to-r from-amber-500 to-amber-600 shadow-sm',
        s.box,
        className,
      )}
    >
      <Crown className={cn(s.icon, 'fill-white')} />
      {showText && 'PRO'}
    </span>
  );
}
