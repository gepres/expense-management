import { useState, useRef, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { cn } from '@utils/cn';

export interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  onClear?: () => void;
  placeholder?: string;
  autoFocus?: boolean;
  showCancelButton?: boolean;
  cancelLabel?: string;
  className?: string;
  variant?: 'default' | 'filled';
  size?: 'sm' | 'md' | 'lg';
}

export function SearchBar({
  value,
  onChange,
  onFocus,
  onBlur,
  onClear,
  placeholder = 'Buscar...',
  autoFocus = false,
  showCancelButton = true,
  cancelLabel = 'Cancelar',
  className,
  variant = 'filled',
  size = 'md',
}: SearchBarProps) {
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  const handleFocus = () => {
    setIsFocused(true);
    onFocus?.();
  };

  const handleBlur = () => {
    setIsFocused(false);
    onBlur?.();
  };

  const handleClear = () => {
    onChange('');
    onClear?.();
    inputRef.current?.focus();
  };

  const handleCancel = () => {
    onChange('');
    inputRef.current?.blur();
  };

  const variantClasses = {
    default: 'bg-background border border-border',
    filled: 'bg-muted/50 border border-transparent',
  };

  const sizeClasses = {
    sm: 'h-8 text-sm',
    md: 'h-10 text-base',
    lg: 'h-12 text-lg',
  };

  const iconSizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
  };

  const showCancel = isFocused || value;

  return (
    <div className={cn('flex items-center gap-2', className)}>
      {/* Search Input Container */}
      <div
        className={cn(
          'flex items-center gap-2 px-3 rounded-xl transition-all duration-200',
          variantClasses[variant],
          sizeClasses[size],
          isFocused && 'ring-2 ring-primary/50',
          showCancelButton && showCancel ? 'flex-1' : 'w-full'
        )}
      >
        <Search className={cn('text-muted-foreground flex-shrink-0', iconSizeClasses[size])} />
        
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          className={cn(
            'flex-1 bg-transparent outline-none',
            'placeholder:text-muted-foreground',
            'text-foreground'
          )}
        />

        {value && (
          <button
            type="button"
            onClick={handleClear}
            className={cn(
              'flex-shrink-0 p-1 rounded-full',
              'bg-muted-foreground/20 hover:bg-muted-foreground/30',
              'transition-all duration-200',
              'animate-in fade-in zoom-in-50'
            )}
            aria-label="Limpiar búsqueda"
          >
            <X className={cn('text-muted-foreground', iconSizeClasses[size])} />
          </button>
        )}
      </div>

      {/* Cancel Button (iOS style) - slides in from right */}
      {showCancelButton && (
        <div
          className={cn(
            'overflow-hidden transition-all duration-300 ease-out',
            showCancel ? 'max-w-[100px] opacity-100' : 'max-w-0 opacity-0'
          )}
        >
          <button
            type="button"
            onClick={handleCancel}
            className={cn(
              'font-medium text-primary whitespace-nowrap px-2',
              'transition-transform duration-300',
              showCancel ? 'translate-x-0' : 'translate-x-4'
            )}
          >
            {cancelLabel}
          </button>
        </div>
      )}
    </div>
  );
}

// Compact SearchBar variant (icon only, expands on click)
export interface CompactSearchBarProps extends Omit<SearchBarProps, 'showCancelButton'> {
  expandOnFocus?: boolean;
}

export function CompactSearchBar({
  expandOnFocus = true,
  variant = 'filled',
  size = 'md',
  placeholder = 'Buscar...',
  ...props
}: CompactSearchBarProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFocus = () => {
    if (expandOnFocus) {
      setIsExpanded(true);
    }
    props.onFocus?.();
  };

  const handleBlur = () => {
    if (expandOnFocus && !props.value) {
      setIsExpanded(false);
    }
    props.onBlur?.();
  };

  const handleClick = () => {
    if (!isExpanded) {
      setIsExpanded(true);
      // Focus input after expansion
      setTimeout(() => {
        inputRef.current?.focus();
      }, 150);
    }
  };

  const sizeClasses = {
    sm: 'h-8',
    md: 'h-10',
    lg: 'h-12',
  };

  const iconSizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
  };

  const variantClasses = {
    default: 'bg-background border border-border',
    filled: 'bg-muted/50 border border-transparent',
  };

  return (
    <div
      className={cn(
        'transition-all duration-300 ease-out overflow-hidden',
        isExpanded ? 'w-full max-w-md' : 'w-10',
        props.className
      )}
    >
      <div
        onClick={handleClick}
        className={cn(
          'flex items-center gap-2 px-3 rounded-xl transition-all duration-200 cursor-text',
          variantClasses[variant],
          sizeClasses[size],
          isExpanded && 'ring-2 ring-primary/50'
        )}
      >
        <Search className={cn('text-muted-foreground flex-shrink-0', iconSizeClasses[size])} />
        
        <input
          ref={inputRef}
          type="text"
          value={props.value}
          onChange={(e) => props.onChange(e.target.value)}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          className={cn(
            'flex-1 bg-transparent outline-none',
            'placeholder:text-muted-foreground',
            'text-foreground',
            'transition-opacity duration-200',
            isExpanded ? 'opacity-100' : 'opacity-0 w-0'
          )}
        />

        {props.value && isExpanded && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              props.onChange('');
              props.onClear?.();
              inputRef.current?.focus();
            }}
            className={cn(
              'flex-shrink-0 p-1 rounded-full',
              'bg-muted-foreground/20 hover:bg-muted-foreground/30',
              'transition-all duration-200'
            )}
            aria-label="Limpiar búsqueda"
          >
            <X className={cn('text-muted-foreground', iconSizeClasses[size])} />
          </button>
        )}
      </div>
    </div>
  );
}



