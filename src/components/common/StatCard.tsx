import { cn } from '@utils/cn';
import type { LucideIcon } from 'lucide-react';

export interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  iconColor?: 'red' | 'blue' | 'green' | 'yellow' | 'purple' | 'orange';
  subtitle?: React.ReactNode;
  footer?: React.ReactNode;
  progress?: {
    percentage: number;
    color?: 'red' | 'blue' | 'green' | 'yellow' | 'purple' | 'orange';
    label?: string;
  };
  variant?: 'default' | 'gradient';
  className?: string;
}

export function StatCard({
  title,
  value,
  icon: Icon,
  iconColor = 'blue',
  subtitle,
  footer,
  progress,
  variant = 'default',
  className,
}: StatCardProps) {
  const colorClasses = {
    red: {
      bg: 'bg-red-100 dark:bg-red-900/30',
      text: 'text-red-600 dark:text-red-400',
      iconBg: 'text-red-500',
      progressBg: 'bg-red-500',
    },
    blue: {
      bg: 'bg-blue-100 dark:bg-blue-900/30',
      text: 'text-blue-600 dark:text-blue-400',
      iconBg: 'text-blue-500',
      progressBg: 'bg-blue-500',
    },
    green: {
      bg: 'bg-green-100 dark:bg-green-900/30',
      text: 'text-green-600 dark:text-green-400',
      iconBg: 'text-green-500',
      progressBg: 'bg-green-500',
    },
    yellow: {
      bg: 'bg-yellow-100 dark:bg-yellow-900/30',
      text: 'text-yellow-600 dark:text-yellow-400',
      iconBg: 'text-yellow-500',
      progressBg: 'bg-yellow-500',
    },
    purple: {
      bg: 'bg-purple-100 dark:bg-purple-900/30',
      text: 'text-purple-600 dark:text-purple-400',
      iconBg: 'text-purple-500',
      progressBg: 'bg-purple-500',
    },
    orange: {
      bg: 'bg-orange-100 dark:bg-orange-900/30',
      text: 'text-orange-600 dark:text-orange-400',
      iconBg: 'text-orange-500',
      progressBg: 'bg-orange-500',
    },
  };

  const colors = colorClasses[iconColor];
  const progressColor = progress?.color ? colorClasses[progress.color].progressBg : colors.progressBg;

  return (
    <div
      className={cn(
        'bg-card border border-border rounded-xl p-5 shadow-sm relative overflow-hidden group hover:shadow-md transition-all',
        variant === 'gradient' && 'bg-gradient-to-br from-card to-muted/20',
        className
      )}
    >
      {/* Background Icon */}
      <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
        <Icon className={cn('h-24 w-24 transform', colors.iconBg)} />
      </div>

      {/* Content */}
      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center gap-3 mb-3">
          <div className={cn('p-2 rounded-lg', colors.bg)}>
            <Icon className={cn('h-5 w-5', colors.text)} />
          </div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
        </div>

        {/* Value */}
        <p className="text-3xl font-bold text-foreground tracking-tight">
          {value}
        </p>

        {/* Subtitle */}
        {subtitle && (
          <div className="mt-3">
            {subtitle}
          </div>
        )}

        {/* Progress Bar */}
        {progress && (
          <div className="mt-3">
            <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
              <div
                className={cn('h-full rounded-full transition-all duration-300', progressColor)}
                style={{ width: `${Math.min(progress.percentage, 100)}%` }}
              />
            </div>
            {progress.label && (
              <p className="mt-1.5 text-xs text-muted-foreground text-right">
                {progress.label}
              </p>
            )}
          </div>
        )}

        {/* Footer */}
        {footer && (
          <div className="mt-3">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
