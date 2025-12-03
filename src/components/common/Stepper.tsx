import { cn } from '@utils/cn';
import { Minus, Plus } from 'lucide-react';

export interface StepperProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'primary' | 'outline' | 'filled';
  className?: string;
  showValue?: boolean;
  formatValue?: (value: number) => string;
}

export function Stepper({
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  disabled = false,
  size = 'md',
  variant = 'default',
  className,
  showValue = true,
  formatValue = (v) => v.toString(),
}: StepperProps) {
  const handleDecrement = () => {
    const newValue = Math.max(min, value - step);
    onChange(newValue);
  };

  const handleIncrement = () => {
    const newValue = Math.min(max, value + step);
    onChange(newValue);
  };

  const canDecrement = value > min && !disabled;
  const canIncrement = value < max && !disabled;

  const sizeClasses = {
    sm: {
      container: 'h-9 gap-2',
      button: 'h-8 w-8',
      icon: 'h-3.5 w-3.5',
      text: 'text-sm min-w-[45px]',
    },
    md: {
      container: 'h-11 gap-2.5',
      button: 'h-10 w-10',
      icon: 'h-4 w-4',
      text: 'text-base min-w-[55px]',
    },
    lg: {
      container: 'h-14 gap-3',
      button: 'h-12 w-12',
      icon: 'h-5 w-5',
      text: 'text-lg min-w-[65px]',
    },
  };

  const variantClasses = {
    default: {
      container: 'bg-muted/50 border border-border/50',
      button: cn(
        'bg-background border border-border/50',
        'hover:bg-muted hover:border-border',
        'active:scale-95',
        'shadow-sm hover:shadow'
      ),
      buttonActive: 'text-foreground',
      buttonDisabled: 'opacity-40 cursor-not-allowed hover:bg-background hover:border-border/50 active:scale-100',
      text: 'text-foreground',
    },
    primary: {
      container: 'bg-primary/10 border border-primary/20',
      button: cn(
        'bg-primary text-primary-foreground',
        'hover:bg-primary/90',
        'active:scale-95',
        'shadow-md hover:shadow-lg',
        'transition-all duration-200'
      ),
      buttonActive: 'text-primary-foreground',
      buttonDisabled: 'opacity-40 cursor-not-allowed hover:bg-primary active:scale-100',
      text: 'text-primary font-bold',
    },
    outline: {
      container: 'bg-transparent border-2 border-border',
      button: cn(
        'bg-transparent border-2 border-border',
        'hover:bg-muted/50 hover:border-foreground/20',
        'active:scale-95',
        'transition-all duration-200'
      ),
      buttonActive: 'text-foreground',
      buttonDisabled: 'opacity-40 cursor-not-allowed hover:bg-transparent hover:border-border active:scale-100',
      text: 'text-foreground font-semibold',
    },
    filled: {
      container: 'bg-muted border border-muted',
      button: cn(
        'bg-background/80 backdrop-blur-sm',
        'hover:bg-background',
        'active:scale-95',
        'shadow hover:shadow-md',
        'transition-all duration-200'
      ),
      buttonActive: 'text-foreground',
      buttonDisabled: 'opacity-40 cursor-not-allowed hover:bg-background/80 active:scale-100',
      text: 'text-foreground font-semibold',
    },
  };

  const sizes = sizeClasses[size];
  const variants = variantClasses[variant];

  return (
    <div
      className={cn(
        'inline-flex items-center rounded-xl p-[2px]',
        'transition-all duration-200',
        sizes.container,
        variants.container,
        disabled && 'opacity-60 pointer-events-none',
        className
      )}
    >
      {/* Decrement Button */}
      <button
        type="button"
        onClick={handleDecrement}
        disabled={!canDecrement}
        className={cn(
          'flex items-center justify-center rounded-lg',
          'transition-all duration-200',
          'focus:outline-none focus:ring-2 focus:ring-primary/20',
          sizes.button,
          variants.button,
          canDecrement ? variants.buttonActive : variants.buttonDisabled
        )}
        aria-label="Decrement"
      >
        <Minus className={cn(sizes.icon, 'transition-transform duration-200')} />
      </button>

      {/* Value Display */}
      {showValue && (
        <div
          className={cn(
            'text-center font-bold tabular-nums select-none',
            'transition-all duration-200',
            sizes.text,
            variants.text
          )}
        >
          {formatValue(value)}
        </div>
      )}

      {/* Increment Button */}
      <button
        type="button"
        onClick={handleIncrement}
        disabled={!canIncrement}
        className={cn(
          'flex items-center justify-center rounded-lg',
          'transition-all duration-200',
          'focus:outline-none focus:ring-2 focus:ring-primary/20',
          sizes.button,
          variants.button,
          canIncrement ? variants.buttonActive : variants.buttonDisabled
        )}
        aria-label="Increment"
      >
        <Plus className={cn(sizes.icon, 'transition-transform duration-200')} />
      </button>
    </div>
  );
}
