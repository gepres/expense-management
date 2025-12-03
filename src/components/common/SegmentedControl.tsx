import { useState, useRef, useEffect } from 'react';
import { cn } from '@utils/cn';

export interface SegmentedControlOption {
  value: string;
  label: React.ReactNode;
  disabled?: boolean;
}

interface SegmentedControlProps {
  options: SegmentedControlOption[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

export function SegmentedControl({
  options,
  value,
  onChange,
  className,
  size = 'md',
  fullWidth = false,
}: SegmentedControlProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [indicatorStyle, setIndicatorStyle] = useState({});
  const containerRef = useRef<HTMLDivElement>(null);
  const itemsRef = useRef<(HTMLButtonElement | null)[]>([]);

  // Update active index when value changes
  useEffect(() => {
    const index = options.findIndex((opt) => opt.value === value);
    if (index !== -1) {
      setActiveIndex(index);
    }
  }, [value, options]);

  // Update indicator position and size
  useEffect(() => {
    const activeItem = itemsRef.current[activeIndex];
    if (activeItem && containerRef.current) {
      const { offsetLeft, offsetWidth } = activeItem;
      setIndicatorStyle({
        transform: `translateX(${offsetLeft}px)`,
        width: `${offsetWidth}px`,
      });
    }
  }, [activeIndex, options]);

  const sizeClasses = {
    sm: 'h-8 text-xs',
    md: 'h-10 text-sm',
    lg: 'h-12 text-base',
  };

  return (
    <div
      ref={containerRef}
      className={cn(
        'relative flex items-center bg-muted/50 p-1 rounded-lg select-none',
        sizeClasses[size],
        fullWidth ? 'w-full' : 'w-fit',
        className
      )}
    >
      {/* Sliding Indicator */}
      <div
        className="absolute top-1 bottom-1 left-0 bg-background shadow-sm rounded-md transition-all duration-300 ease-out-expo"
        style={indicatorStyle}
      />

      {/* Options */}
      {options.map((option, index) => {
        const isActive = option.value === value;
        return (
          <button
            key={option.value}
            ref={(el) => {
              itemsRef.current[index] = el;
            }}
            type="button"
            onClick={() => !option.disabled && onChange(option.value)}
            disabled={option.disabled}
            className={cn(
              'relative z-10 flex-1 px-3 py-1 font-medium transition-colors duration-200 text-center truncate',
              isActive ? 'text-foreground' : 'text-muted-foreground hover:text-foreground/70',
              option.disabled && 'opacity-50 cursor-not-allowed',
              fullWidth && 'w-full'
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
