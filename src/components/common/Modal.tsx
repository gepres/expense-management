/**
 * Modal/Popup Component - iOS Style
 * Componente modal reutilizable con diseño iOS
 * Con soporte para gestos de deslizamiento en móvil
 */

import { useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  showCloseButton?: boolean;
  closeOnBackdrop?: boolean;
  closeOnEscape?: boolean;
  footer?: React.ReactNode;
  className?: string;
}

export default function Modal({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  size = 'md',
  showCloseButton = true,
  closeOnBackdrop = true,
  closeOnEscape = true,
  footer,
  className = '',
}: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState(0);
  const [dragOffset, setDragOffset] = useState(0);

  // Handle escape key
  useEffect(() => {
    if (!isOpen || !closeOnEscape) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, closeOnEscape, onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Handle touch gestures for swipe down to close (mobile only)
  const handleTouchStart = (e: React.TouchEvent) => {
    // Solo en móvil y si el scroll está arriba
    if (window.innerWidth > 640) return;

    const scrollContainer = modalRef.current?.querySelector('.overflow-y-auto');
    if (scrollContainer && scrollContainer.scrollTop > 0) return;

    setIsDragging(true);
    setDragStart(e.touches[0].clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;

    const currentY = e.touches[0].clientY;
    const offset = currentY - dragStart;

    // Solo permitir deslizar hacia abajo
    if (offset > 0) {
      setDragOffset(offset);
    }
  };

  const handleTouchEnd = () => {
    if (!isDragging) return;

    setIsDragging(false);

    // Si el deslizamiento es mayor a 100px, cerrar el modal
    if (dragOffset > 100) {
      onClose();
    }

    // Reset
    setDragOffset(0);
  };

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    full: 'max-w-full mx-4',
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (closeOnBackdrop && e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center !mt-0 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={handleBackdropClick}
      style={{
        opacity: isDragging ? 1 - dragOffset / 300 : 1,
      }}
    >
      <div
        ref={modalRef}
        className={`
          bg-card w-full ${sizeClasses[size]}
          rounded-t-3xl sm:rounded-2xl
          shadow-xl border border-border
          max-h-[90vh] overflow-hidden
          modal-mobile-enter sm:zoom-in-95 sm:duration-200
          flex flex-col
          ${className}
        `}
        style={{
          transform: isDragging ? `translateY(${dragOffset}px)` : undefined,
          transition: isDragging ? 'none' : 'transform 0.3s cubic-bezier(0.32, 0.72, 0, 1)',
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Drag Handle - Solo móvil */}
        <div className="sm:hidden sticky top-0 bg-card z-20 pt-3 pb-2 flex justify-center shrink-0 cursor-grab active:cursor-grabbing">
          <div
            className="w-10 h-1 bg-muted-foreground/30 rounded-full transition-all duration-200"
            style={{
              width: isDragging ? '16px' : '40px',
              backgroundColor: isDragging ? 'hsl(var(--primary))' : undefined,
            }}
          />
        </div>

        {/* Header */}
        {(title || showCloseButton) && (
          <div className="sticky top-0 bg-card z-10 px-6 py-4 border-b border-border flex items-center justify-between shrink-0">
            <div className="flex-1 min-w-0">
              {title && (
                <h2 className="text-xl font-bold text-foreground truncate">
                  {title}
                </h2>
              )}
              {subtitle && (
                <p className="text-sm text-muted-foreground mt-0.5 truncate">
                  {subtitle}
                </p>
              )}
            </div>
            {showCloseButton && (
              <button
                onClick={onClose}
                className="p-2 hover:bg-muted rounded-full transition-colors ml-2 shrink-0"
                aria-label="Cerrar"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
        )}

        {/* Content */}
        <div className="overflow-y-auto flex-1 p-6">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="sticky bottom-0 bg-card z-10 px-6 py-4 border-t border-border shrink-0">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

// Botones prediseñados para usar en el footer
export function ModalButton({
  children,
  onClick,
  variant = 'primary',
  disabled = false,
  type = 'button',
  className = '',
}: {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'destructive' | 'ghost';
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
}) {
  const variants = {
    primary: 'bg-primary hover:bg-primary/90 text-primary-foreground',
    secondary: 'bg-muted hover:bg-muted/80 text-foreground',
    destructive: 'bg-destructive hover:bg-destructive/90 text-destructive-foreground',
    ghost: 'bg-transparent hover:bg-muted text-foreground',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`
        flex-1 py-3 rounded-xl font-semibold text-sm
        transition-all active:scale-[0.98]
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variants[variant]}
        ${className}
      `}
    >
      {children}
    </button>
  );
}

// Footer prediseñado con dos botones
export function ModalFooterActions({
  onCancel,
  onConfirm,
  cancelText = 'Cancelar',
  confirmText = 'Confirmar',
  confirmVariant = 'primary',
  disabled = false,
}: {
  onCancel: () => void;
  onConfirm: () => void;
  cancelText?: string;
  confirmText?: string;
  confirmVariant?: 'primary' | 'destructive';
  disabled?: boolean;
}) {
  return (
    <div className="flex gap-3">
      <ModalButton variant="secondary" onClick={onCancel} disabled={disabled}>
        {cancelText}
      </ModalButton>
      <ModalButton variant={confirmVariant} onClick={onConfirm} disabled={disabled}>
        {confirmText}
      </ModalButton>
    </div>
  );
}
