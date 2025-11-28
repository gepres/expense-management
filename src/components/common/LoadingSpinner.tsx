/**
 * LoadingSpinner Component
 * Componente de spinner de carga con múltiples variantes estilo iOS
 */

import { useEffect, useState } from 'react';
import { Check } from 'lucide-react';
import { useBreakpoints } from '@/hooks/useBreakpoints';

interface LoadingSpinnerProps {
  variant?: 'simple' | 'dots' | 'dots2' | 'dots3' | 'material' | 'pulse' | 'ring';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function LoadingSpinner({
  variant = 'dots',
  size = 'md',
  className = '',
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: {
      spinner: 'w-3 h-3',
      dot: 'w-1 h-1',
      dot2: 'w-1 h-1',
      gap: 'gap-0.5',
    },
    md: {
      spinner: 'w-4 h-4',
      dot: 'w-1.5 h-1.5',
      dot2: 'w-1.5 h-1.5',
      gap: 'gap-1',
    },
    lg: {
      spinner: 'w-5 h-5',
      dot: 'w-2 h-2',
      dot2: 'w-2 h-2',
      gap: 'gap-1.5',
    },
  };

  // Dots Bounce (iOS Style - Recomendado)
  if (variant === 'dots') {
    return (
      <div className={`flex ${sizeClasses[size].gap} ${className}`}>
        <span
          className={`${sizeClasses[size].dot} bg-current rounded-full animate-ios-bounce`}
          style={{ animationDelay: '-0.32s' }}
        />
        <span
          className={`${sizeClasses[size].dot} bg-current rounded-full animate-ios-bounce`}
          style={{ animationDelay: '-0.16s' }}
        />
        <span
          className={`${sizeClasses[size].dot} bg-current rounded-full animate-ios-bounce`}
        />
      </div>
    );
  }

  if (variant === 'dots2') {
    return (
      <div className={`flex ${sizeClasses[size].gap} ${className}`}>
        <span
          className={`${sizeClasses[size].dot} bg-current rounded-full animate-ios-bounce-v2`}
          style={{ animationDelay: '-0.32s' }}
        />
        <span
          className={`${sizeClasses[size].dot} bg-current rounded-full animate-ios-bounce-v2`}
          style={{ animationDelay: '-0.16s' }}
        />
        <span
          className={`${sizeClasses[size].dot} bg-current rounded-full animate-ios-bounce-v2`}
        />
      </div>
    );
  }

  if (variant === 'dots3') {
    return (
      <div className={`flex ${sizeClasses[size].gap} ${className}`}>
        <span
          className={`${sizeClasses[size].dot} bg-current rounded-full animate-ios-bounce-v3`}
          style={{ animationDelay: '-0.32s' }}
        />
        <span
          className={`${sizeClasses[size].dot} bg-current rounded-full animate-ios-bounce-v3`}
          style={{ animationDelay: '-0.16s' }}
        />
        <span
          className={`${sizeClasses[size].dot} bg-current rounded-full animate-ios-bounce-v3`}
          style={{ animationDelay: '0s' }}
        />
      </div>
    );
  }

  // Material Spinner
  if (variant === 'material') {
    return (
      <div
        className={`${sizeClasses[size].spinner} border-2 border-transparent border-t-current border-l-current rounded-full animate-spin ${className}`}
        style={{ animationDuration: '0.5s' }}
      />
    );
  }

  // Pulse Ring
  if (variant === 'pulse') {
    return (
      <div className={`${sizeClasses[size].spinner} ${className}`}>
        <div className="w-full h-full border-2 border-current rounded-full animate-pulse" />
      </div>
    );
  }

  // Double Ring
  if (variant === 'ring') {
    return (
      <div
        className={`${sizeClasses[size].spinner} border-2 border-transparent border-t-current border-b-current rounded-full animate-spin ${className}`}
        style={{ animationDuration: '0.8s' }}
      />
    );
  }

  // Simple Spinner (Default)
  return (
    <div
      className={`${sizeClasses[size].spinner} border-2 border-current border-t-transparent rounded-full animate-spin ${className}`}
      style={{ animationDuration: '0.6s' }}
    />
  );
}

export function ContainerLoading({
  textLoading,
}: { textLoading: string }) {
  const { isMobile } = useBreakpoints();
  return (
    <div className={`flex items-center justify-center gap-2`}>
      {
        isMobile ? <LoadingOverlay isOpen={true} variant="dots3" message={textLoading} /> : textLoading
      }
      <LoadingSpinner variant='dots3' />
    </div>
  );
}
    


/**
 * LoadingOverlay Component
 * Overlay de carga estilo iOS para móvil/tablet con glassmorphism
 * ✨ Características:
 * - Efecto blur con backdrop-filter
 * - Bloquea interacción y scroll
 * - 3 tipos de spinners
 * - Estado de éxito con checkmark
 * - Cierre opcional al hacer clic fuera
 */

interface LoadingOverlayProps {
  isOpen: boolean;
  onClose?: () => void;
  variant?: 'dots' | 'simple' | 'material' | 'dots2' | 'dots3';
  message?: string;
  submessage?: string;
  success?: boolean;
  closeOnBackdrop?: boolean;
  mobileOnly?: boolean; // Solo mostrar en móvil/tablet
}

export function LoadingOverlay({
  isOpen,
  onClose,
  variant = 'dots',
  message = 'Cargando...',
  submessage,
  success = false,
  closeOnBackdrop = false,
  mobileOnly = true,
}: LoadingOverlayProps) {
  // Bloquear scroll cuando el overlay está abierto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      // Para iOS Safari
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
    } else {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
    }

    return () => {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (closeOnBackdrop && onClose && e.target === e.currentTarget) {
      onClose();
    }
  };

  // Clase condicional para solo móvil/tablet
  const responsiveClass = mobileOnly ? 'md:hidden' : '';

  return (
    <div
      className={`fixed inset-0 z-[99999] flex items-center justify-center p-6 animate-in fade-in duration-200 ${responsiveClass}`}
      onClick={handleBackdropClick}
      style={{
        // Fondo oscuro semi-transparente con blur
        background: 'rgba(0, 0, 0, 0.4)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)', // Safari support
      }}
    >
      {/* Card con glassmorphism */}
      <div
        className="relative bg-card/95 backdrop-blur-xl rounded-3xl shadow-2xl p-8 max-w-sm w-full animate-in zoom-in-95 duration-300 border border-border/50"
        style={{
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        }}
      >
        {/* Spinner o Success */}
        <div className="flex justify-center mb-6 text-primary">
          {success ? (
            <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center animate-in zoom-in duration-500">
              <div className="w-16 h-16 rounded-full bg-green-500 flex items-center justify-center">
                <Check className="h-10 w-10 text-white animate-in zoom-in duration-300 delay-100" />
              </div>
            </div>
          ) : variant === 'dots' ? (
           <LoadingSpinner />
          ) : variant === 'dots2' ? (
            <LoadingSpinner variant="dots2" />
          ) : variant === 'dots3' ? (
            <LoadingSpinner variant="dots3" />
          ) : (
            <div
              className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"
              style={{ animationDuration: '0.8s' }}
            />
          )}
        </div>

        {/* Mensaje principal */}
        <div className="text-center">
          <h3 className="text-lg font-bold text-foreground mb-2 animate-in slide-in-from-bottom-2 duration-300 delay-100">
            {success ? '¡Éxito!' : message}
          </h3>

          {submessage && (
            <p className="text-sm text-muted-foreground animate-in slide-in-from-bottom-2 duration-300 delay-150">
              {submessage}
            </p>
          )}
        </div>

        {/* Indicador de que se puede cerrar (opcional) */}
        {closeOnBackdrop && onClose && (
          <div className="text-center mt-4">
            <p className="text-xs text-muted-foreground animate-pulse">
              Toca fuera para cerrar
            </p>
          </div>
        )}
      </div>
    </div>
  );
}




/**
 * Hook para controlar LoadingOverlay fácilmente
 */
export function useLoadingOverlay() {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('Cargando...');
  const [loadingSubmessage, setLoadingSubmessage] = useState<string | undefined>();
  const [showSuccess, setShowSuccess] = useState(false);

  const showLoading = (message?: string, submessage?: string) => {
    setLoadingMessage(message || 'Cargando...');
    setLoadingSubmessage(submessage);
    setShowSuccess(false);
    setIsLoading(true);
  };

  const hideLoading = () => {
    setIsLoading(false);
    setShowSuccess(false);
  };

  const showSuccessState = (message?: string, submessage?: string, duration = 2000) => {
    setLoadingMessage(message || '¡Éxito!');
    setLoadingSubmessage(submessage);
    setShowSuccess(true);
    setIsLoading(true);

    // Auto-cerrar después de la duración especificada
    setTimeout(() => {
      hideLoading();
    }, duration);
  };

  return {
    isLoading,
    loadingMessage,
    loadingSubmessage,
    showSuccess,
    showLoading,
    hideLoading,
    showSuccessState,
  };
}


