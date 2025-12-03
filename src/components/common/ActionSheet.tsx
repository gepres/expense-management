import { useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@utils/cn';

export interface ActionSheetAction {
  label: string;
  onClick: () => void;
  icon?: React.ComponentType<{ className?: string }>;
  destructive?: boolean;
  disabled?: boolean;
}

interface ActionSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  actions: ActionSheetAction[];
  cancelLabel?: string;
  showCancel?: boolean;
}

export function ActionSheet({
  isOpen,
  onClose,
  title,
  description,
  actions,
  cancelLabel = 'Cancelar',
  showCancel = true,
}: ActionSheetProps) {
  const [mounted, setMounted] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const sheetRef = useRef<HTMLDivElement>(null);
  const startY = useRef<number>(0);
  const currentY = useRef<number>(0);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        handleClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen]);

  const handleClose = () => {
    setIsAnimating(false);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  // Touch handlers for swipe to dismiss
  const handleTouchStart = (e: React.TouchEvent) => {
    startY.current = e.touches[0].clientY;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    currentY.current = e.touches[0].clientY;
    const diff = currentY.current - startY.current;

    if (diff > 0 && sheetRef.current) {
      sheetRef.current.style.transform = `translateY(${diff}px)`;
    }
  };

  const handleTouchEnd = () => {
    const diff = currentY.current - startY.current;

    if (sheetRef.current) {
      if (diff > 100) {
        // Swipe down threshold
        handleClose();
      } else {
        // Reset position
        sheetRef.current.style.transform = 'translateY(0)';
      }
    }

    startY.current = 0;
    currentY.current = 0;
  };

  if (!mounted || !isOpen) return null;

  return createPortal(
    <div
      className={cn(
        'fixed inset-0 z-[9998] flex items-end justify-center',
        'transition-colors duration-300',
        isAnimating ? 'bg-black/40' : 'bg-transparent'
      )}
      onClick={handleBackdropClick}
    >
      <div
        ref={sheetRef}
        className={cn(
          'w-full max-w-lg bg-background rounded-t-3xl shadow-2xl',
          'transition-transform duration-300 ease-out',
          isAnimating ? 'translate-y-0' : 'translate-y-full'
        )}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Drag Handle */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-10 h-1 bg-muted-foreground/30 rounded-full" />
        </div>

        {/* Header */}
        {(title || description) && (
          <div className="px-6 py-4 border-b border-border">
            {title && (
              <h3 className="text-lg font-semibold text-foreground">{title}</h3>
            )}
            {description && (
              <p className="text-sm text-muted-foreground mt-1">{description}</p>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="py-2">
          {actions.map((action, index) => {
            const Icon = action.icon;
            return (
              <button
                key={index}
                onClick={() => {
                  if (!action.disabled) {
                    action.onClick();
                    handleClose();
                  }
                }}
                disabled={action.disabled}
                className={cn(
                  'w-full flex items-center gap-3 px-6 py-4',
                  'text-left transition-colors',
                  'hover:bg-muted/50 active:bg-muted',
                  action.destructive
                    ? 'text-destructive hover:bg-destructive/10'
                    : 'text-foreground',
                  action.disabled && 'opacity-50 cursor-not-allowed'
                )}
              >
                {Icon && <Icon className="h-5 w-5 flex-shrink-0" />}
                <span className="text-base font-medium">{action.label}</span>
              </button>
            );
          })}
        </div>

        {/* Cancel Button */}
        {showCancel && (
          <div className="p-4 border-t border-border">
            <button
              onClick={handleClose}
              className="w-full py-3 px-4 rounded-xl bg-muted/50 hover:bg-muted text-foreground font-semibold transition-colors"
            >
              {cancelLabel}
            </button>
          </div>
        )}

        {/* Safe area for iOS */}
        <div className="h-safe-area-inset-bottom" />
      </div>
    </div>,
    document.body
  );
}
