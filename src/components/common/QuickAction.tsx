import { cn } from '@utils/cn';
import type { LucideIcon } from 'lucide-react';
import React from 'react';

export interface QuickActionProps {
  icon: LucideIcon;
  label: string;
  iconColor?: string;
  badge?: React.ReactNode;
  onClick?: () => void;
  href?: string;
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function QuickAction({
  icon: Icon,
  label,
  iconColor,
  badge,
  onClick,
  href,
  variant = 'default',
  size = 'md',
  className,
}: QuickActionProps) {
  const variantClasses = {
    default: 'bg-card hover:bg-accent border-border',
    primary: 'bg-primary/5 hover:bg-primary/10 border-primary/20',
    success: 'bg-green-500/5 hover:bg-green-500/10 border-green-500/20',
    warning: 'bg-yellow-500/5 hover:bg-yellow-500/10 border-yellow-500/20',
    danger: 'bg-red-500/5 hover:bg-red-500/10 border-red-500/20',
  };

  const sizeClasses = {
    sm: {
      container: 'p-3',
      icon: 'h-5 w-5',
      text: 'text-xs',
    },
    md: {
      container: 'p-4',
      icon: 'h-6 w-6',
      text: 'text-xs',
    },
    lg: {
      container: 'p-5',
      icon: 'h-8 w-8',
      text: 'text-sm',
    },
  };

  const sizes = sizeClasses[size];
  const baseClasses = cn(
    'border rounded-xl flex flex-col items-center justify-center gap-2 text-center transition-all hover:shadow-sm group relative',
    variantClasses[variant],
    sizes.container,
    className
  );

  const content = (
    <>
      {badge && (
        <div className="absolute -top-1 -right-1 z-10">
          {badge}
        </div>
      )}
      <Icon
        className={cn(
          sizes.icon,
          'group-hover:scale-110 transition-transform',
          iconColor || 'text-primary'
        )}
      />
      <span className={cn('font-medium', sizes.text)}>{label}</span>
    </>
  );

  if (href) {
    return (
      <a href={href} className={baseClasses}>
        {content}
      </a>
    );
  }

  return (
    <button onClick={onClick} className={baseClasses} type="button">
      {content}
    </button>
  );
}

export interface QuickActionGridProps {
  children:React.ReactNode;
  columns?: 2 | 3 | 4;
  gap?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function QuickActionGrid({
  children,
  columns = 2,
  gap = 'md',
  className,
}: QuickActionGridProps) {
  const gapClasses = {
    sm: 'gap-2',
    md: 'gap-3',
    lg: 'gap-4',
  };

  return (
    <div
      className={cn(
        'grid',
        `grid-cols-${columns}`,
        gapClasses[gap],
        className
      )}
      style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
    >
      {children}
    </div>
  );
}
