import { X } from 'lucide-react';
import { cn } from '@utils/cn';

export interface ChipProps extends React.HTMLAttributes<HTMLDivElement> {
  label: string;
  onRemove?: () => void;
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'error' | 'info';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ComponentType<{ className?: string }>;
  removable?: boolean;
  selected?: boolean;
}

export function Chip({
  label,
  onRemove,
  variant = 'default',
  size = 'md',
  icon: Icon,
  removable = false,
  selected = false,
  className,
  onClick,
  ...props
}: ChipProps) {
  const variantClasses = {
    default: selected
      ? 'bg-muted text-foreground border-border'
      : 'bg-muted/50 text-muted-foreground border-transparent hover:bg-muted',
    primary: selected
      ? 'bg-primary text-primary-foreground border-primary'
      : 'bg-primary/10 text-primary border-transparent hover:bg-primary/20',
    success: selected
      ? 'bg-green-500 text-white border-green-500'
      : 'bg-green-500/10 text-green-700 dark:text-green-400 border-transparent hover:bg-green-500/20',
    warning: selected
      ? 'bg-yellow-500 text-white border-yellow-500'
      : 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-transparent hover:bg-yellow-500/20',
    error: selected
      ? 'bg-red-500 text-white border-red-500'
      : 'bg-red-500/10 text-red-700 dark:text-red-400 border-transparent hover:bg-red-500/20',
    info: selected
      ? 'bg-blue-500 text-white border-blue-500'
      : 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-transparent hover:bg-blue-500/20',
  };

  const sizeClasses = {
    sm: 'h-6 text-xs px-2 gap-1',
    md: 'h-7 text-sm px-3 gap-1.5',
    lg: 'h-8 text-base px-4 gap-2',
  };

  const iconSizeClasses = {
    sm: 'h-3 w-3',
    md: 'h-3.5 w-3.5',
    lg: 'h-4 w-4',
  };

  return (
    <div
      className={cn(
        'inline-flex items-center rounded-full border font-medium',
        'transition-all duration-200',
        variantClasses[variant],
        sizeClasses[size],
        (onClick || removable) && 'cursor-pointer',
        className
      )}
      onClick={onClick}
      {...props}
    >
      {Icon && <Icon className={cn('flex-shrink-0', iconSizeClasses[size])} />}
      <span className="truncate">{label}</span>
      {(removable || onRemove) && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove?.();
          }}
          className={cn(
            'flex-shrink-0 rounded-full p-0.5',
            'hover:bg-black/10 dark:hover:bg-white/10',
            'transition-colors'
          )}
          aria-label="Eliminar"
        >
          <X className={iconSizeClasses[size]} />
        </button>
      )}
    </div>
  );
}

// ChipGroup for managing multiple chips
export interface ChipGroupProps {
  chips: Array<{
    id: string;
    label: string;
    icon?: React.ComponentType<{ className?: string }>;
  }>;
  selected?: string[];
  onSelect?: (id: string) => void;
  onRemove?: (id: string) => void;
  variant?: ChipProps['variant'];
  size?: ChipProps['size'];
  removable?: boolean;
  multiSelect?: boolean;
  className?: string;
}

export function ChipGroup({
  chips,
  selected = [],
  onSelect,
  onRemove,
  variant = 'default',
  size = 'md',
  removable = false,
  multiSelect: _multiSelect = false,
  className,
}: ChipGroupProps) {
  const handleSelect = (id: string) => {
    if (!onSelect) return;
    onSelect(id);
  };

  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      {chips.map((chip) => (
        <Chip
          key={chip.id}
          label={chip.label}
          icon={chip.icon}
          variant={variant}
          size={size}
          selected={selected.includes(chip.id)}
          onClick={onSelect ? () => handleSelect(chip.id) : undefined}
          onRemove={onRemove ? () => onRemove(chip.id) : undefined}
          removable={removable}
        />
      ))}
    </div>
  );
}
