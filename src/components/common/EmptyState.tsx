import { cn } from '@utils/cn';
import Button, { type LucideIcon } from './Button';

export interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
    icon?: LucideIcon;
  };
  illustration?: React.ReactNode;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  illustration,
  className,
  size = 'md',
}: EmptyStateProps) {
  const sizeClasses = {
    sm: {
      container: 'py-8',
      icon: 'h-12 w-12',
      title: 'text-lg',
      description: 'text-sm',
    },
    md: {
      container: 'py-12',
      icon: 'h-16 w-16',
      title: 'text-xl',
      description: 'text-base',
    },
    lg: {
      container: 'py-16',
      icon: 'h-20 w-20',
      title: 'text-2xl',
      description: 'text-lg',
    },
  };

  const sizes = sizeClasses[size];

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center',
        sizes.container,
        className
      )}
    >
      {/* Illustration or Icon */}
      {illustration ? (
        <div className="mb-6">{illustration}</div>
      ) : Icon ? (
        <div className="mb-6 p-4 rounded-full bg-muted/50">
          <Icon className={cn('text-muted-foreground', sizes.icon)} />
        </div>
      ) : null}

      {/* Title */}
      <h3 className={cn('font-bold text-foreground mb-2', sizes.title)}>
        {title}
      </h3>

      {/* Description */}
      {description && (
        <p className={cn('text-muted-foreground max-w-md mb-6', sizes.description)}>
          {description}
        </p>
      )}

      {/* Action Button */}
      {action && (
        <Button
          onClick={action.onClick}
          icon={action.icon}
          variant="primary"
        >
          {action.label}
        </Button>
      )}
    </div>
  );
}
