import { useRef, useState } from 'react';
import { cn } from '@utils/cn';

export interface SwipeAction {
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  onClick: () => void;
  color?: 'primary' | 'success' | 'warning' | 'error';
}

export interface SwipeableListItemProps {
  children: React.ReactNode;
  leftActions?: SwipeAction[];
  rightActions?: SwipeAction[];
  threshold?: number;
  className?: string;
}

export function SwipeableListItem({
  children,
  leftActions = [],
  rightActions = [],
  threshold = 80,
  className,
}: SwipeableListItemProps) {
  const [offset, setOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const startX = useRef(0);
  const currentX = useRef(0);
  const itemRef = useRef<HTMLDivElement>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX;
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;

    currentX.current = e.touches[0].clientX;
    const diff = currentX.current - startX.current;

    // Apply resistance at the edges
    const maxOffset = 200;
    // const resistance = 0.5; // Unused for now, can be used for edge resistance effect

    if (Math.abs(diff) > maxOffset) {
      setOffset(diff > 0 ? maxOffset : -maxOffset);
    } else {
      setOffset(diff);
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);

    // Check if threshold is met
    if (offset > threshold && rightActions.length > 0) {
      // Trigger first right action
      rightActions[0].onClick();
      setOffset(0);
    } else if (offset < -threshold && leftActions.length > 0) {
      // Trigger first left action
      leftActions[0].onClick();
      setOffset(0);
    } else {
      // Reset position
      setOffset(0);
    }
  };

  const colorClasses = {
    primary: 'bg-primary text-primary-foreground',
    success: 'bg-green-500 text-white',
    warning: 'bg-yellow-500 text-white',
    error: 'bg-red-500 text-white',
  };

  return (
    <div className={cn('relative overflow-hidden', className)}>
      {/* Left Actions */}
      {leftActions.length > 0 && (
        <div className="absolute inset-y-0 left-0 flex">
          {leftActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <button
                key={index}
                onClick={() => {
                  action.onClick();
                  setOffset(0);
                }}
                className={cn(
                  'flex items-center justify-center px-6 font-medium',
                  'transition-all duration-200',
                  colorClasses[action.color || 'primary']
                )}
                style={{
                  opacity: offset > 0 ? Math.min(offset / threshold, 1) : 0,
                }}
              >
                {Icon && <Icon className="h-5 w-5 mr-2" />}
                {action.label}
              </button>
            );
          })}
        </div>
      )}

      {/* Right Actions */}
      {rightActions.length > 0 && (
        <div className="absolute inset-y-0 right-0 flex">
          {rightActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <button
                key={index}
                onClick={() => {
                  action.onClick();
                  setOffset(0);
                }}
                className={cn(
                  'flex items-center justify-center px-6 font-medium',
                  'transition-all duration-200',
                  colorClasses[action.color || 'error']
                )}
                style={{
                  opacity: offset < 0 ? Math.min(Math.abs(offset) / threshold, 1) : 0,
                }}
              >
                {Icon && <Icon className="h-5 w-5 mr-2" />}
                {action.label}
              </button>
            );
          })}
        </div>
      )}

      {/* Main Content */}
      <div
        ref={itemRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className={cn(
          'bg-background transition-transform',
          isDragging ? 'duration-0' : 'duration-300'
        )}
        style={{
          transform: `translateX(${offset}px)`,
        }}
      >
        {children}
      </div>
    </div>
  );
}
