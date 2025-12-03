import { cn } from '@utils/cn';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'error' | 'info';
  size?: 'sm' | 'md' | 'lg';
  dot?: boolean;
  count?: number;
  maxCount?: number;
  showZero?: boolean;
  pulse?: boolean;
}

export function Badge({
  variant = 'default',
  size = 'md',
  dot = false,
  count,
  maxCount = 99,
  showZero = false,
  pulse = false,
  className,
  children,
  ...props
}: BadgeProps) {
  // Don't render if count is 0 and showZero is false
  if (count !== undefined && count === 0 && !showZero && !children) {
    return null;
  }

  const variantClasses = {
    default: 'bg-muted text-muted-foreground',
    primary: 'bg-primary text-primary-foreground',
    success: 'bg-green-500 text-white',
    warning: 'bg-yellow-500 text-white',
    error: 'bg-red-500 text-white',
    info: 'bg-blue-500 text-white',
  };

  const sizeClasses = {
    sm: dot ? 'h-2 w-2' : 'h-5 min-w-[1.25rem] text-[10px] px-1',
    md: dot ? 'h-2.5 w-2.5' : 'h-6 min-w-[1.5rem] text-xs px-1.5',
    lg: dot ? 'h-3 w-3' : 'h-7 min-w-[1.75rem] text-sm px-2',
  };

  const displayCount = count !== undefined && count > maxCount ? `${maxCount}+` : count;

  return (
    <span
      className={cn(
        'inline-flex items-center justify-center font-semibold rounded-full',
        'transition-all duration-200',
        variantClasses[variant],
        sizeClasses[size],
        pulse && 'animate-pulse',
        dot && 'p-0',
        className
      )}
      {...props}
    >
      {!dot && (children || displayCount)}
    </span>
  );
}

// Badge with positioning wrapper
export interface BadgeWrapperProps {
  children: React.ReactNode;
  badge: React.ReactNode;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  offset?: { x?: number; y?: number };
}

export function BadgeWrapper({
  children,
  badge,
  position = 'top-right',
  offset = {},
}: BadgeWrapperProps) {
  const positionClasses = {
    'top-right': 'top-0 right-0 translate-x-1/2 -translate-y-1/2',
    'top-left': 'top-0 left-0 -translate-x-1/2 -translate-y-1/2',
    'bottom-right': 'bottom-0 right-0 translate-x-1/2 translate-y-1/2',
    'bottom-left': 'bottom-0 left-0 -translate-x-1/2 translate-y-1/2',
  };

  const offsetStyle = {
    transform: `translate(${offset.x || 0}px, ${offset.y || 0}px)`,
  };

  return (
    <div className="relative inline-flex">
      {children}
      <span
        className={cn('absolute', positionClasses[position])}
        style={offset.x || offset.y ? offsetStyle : undefined}
      >
        {badge}
      </span>
    </div>
  );
}
