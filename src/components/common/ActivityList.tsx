import { cn } from '@utils/cn';
import type { LucideIcon } from 'lucide-react';
import React from 'react';
import { ArrowRight } from 'lucide-react';

export interface ActivityItem {
  id: string;
  icon?: LucideIcon | React.ReactNode;
  iconColor?: string;
  title: string;
  subtitle?: string;
  value?: string;
  valueSubtext?: string;
  badge?: React.ReactNode;
  onClick?: () => void;
}

export interface ActivityListProps {
  title: string;
  items: ActivityItem[];
  emptyMessage?: string;
  emptyIcon?: LucideIcon;
  headerAction?: {
    label: string;
    onClick?: () => void;
    href?: string;
  };
  footerAction?: {
    label: string;
    onClick?: () => void;
    href?: string;
  };
  showDividers?: boolean;
  maxHeight?: string;
  className?: string;
}

export function ActivityList({
  title,
  items,
  emptyMessage = 'No hay elementos',
  emptyIcon: EmptyIcon,
  headerAction,
  footerAction,
  showDividers = true,
  maxHeight,
  className,
}: ActivityListProps) {
  const renderHeaderAction = () => {
    if (!headerAction) return null;

    if (headerAction.href) {
      return (
        <a
          href={headerAction.href}
          className="text-xs font-medium text-primary hover:underline flex items-center gap-1"
        >
          {headerAction.label} <ArrowRight className="h-3 w-3" />
        </a>
      );
    }

    return (
      <button
        onClick={headerAction.onClick}
        className="text-xs font-medium text-primary hover:underline flex items-center gap-1"
      >
        {headerAction.label} <ArrowRight className="h-3 w-3" />
      </button>
    );
  };

  const renderFooterAction = () => {
    if (!footerAction) return null;

    if (footerAction.href) {
      return (
        <a
          href={footerAction.href}
          className="text-xs font-medium text-muted-foreground hover:text-primary transition-colors"
        >
          {footerAction.label}
        </a>
      );
    }

    return (
      <button
        onClick={footerAction.onClick}
        className="text-xs font-medium text-muted-foreground hover:text-primary transition-colors"
      >
        {footerAction.label}
      </button>
    );
  };

  return (
    <div className={cn('bg-card border border-border rounded-xl shadow-sm overflow-hidden', className)}>
      {/* Header */}
      <div className="p-5 border-b border-border flex items-center justify-between bg-muted/20">
        <h2 className="text-lg font-bold text-foreground">{title}</h2>
        {renderHeaderAction()}
      </div>

      {/* Items List */}
      <div
        className={cn(showDividers && 'divide-y divide-border', 'overflow-y-auto')}
        style={maxHeight ? { maxHeight } : undefined}
      >
        {items.length > 0 ? (
          items.map((item) => (
            <div
              key={item.id}
              onClick={item.onClick}
              className={cn(
                'p-4 transition-colors flex items-center gap-3',
                item.onClick && 'cursor-pointer hover:bg-accent/50'
              )}
            >
              {/* Icon */}
              {item.icon && (
                <div
                  className={cn(
                    'h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0',
                    item.iconColor || 'bg-primary/10'
                  )}
                >
                  {React.isValidElement(item.icon) ? (
                    item.icon
                  ) : typeof item.icon === 'function' ? (
                    <item.icon className={cn('h-5 w-5', item.iconColor || 'text-primary')} />
                  ) : null}
                </div>
              )}

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-sm text-foreground truncate">
                    {item.title}
                  </p>
                  {item.badge && item.badge}
                </div>
                {item.subtitle && (
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {item.subtitle}
                  </p>
                )}
              </div>

              {/* Value */}
              {item.value && (
                <div className="text-right flex-shrink-0">
                  <p className="font-bold text-sm text-foreground">
                    {item.value}
                  </p>
                  {item.valueSubtext && (
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wide">
                      {item.valueSubtext}
                    </p>
                  )}
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="p-8 text-center">
            {EmptyIcon && <EmptyIcon className="h-10 w-10 mx-auto mb-2 text-muted-foreground opacity-20" />}
            <p className="text-sm text-muted-foreground">{emptyMessage}</p>
          </div>
        )}
      </div>

      {/* Footer */}
      {footerAction && items.length > 0 && (
        <div className="p-3 bg-muted/20 text-center border-t border-border">
          {renderFooterAction()}
        </div>
      )}
    </div>
  );
}
