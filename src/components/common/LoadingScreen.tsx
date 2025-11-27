/**
 * LoadingScreen Component
 * Componente de pantalla de carga centralizada con el diseño de la aplicación
 */

import CustomLoader from './CustomLoader';

interface LoadingScreenProps {
  message?: string;
  fullScreen?: boolean;
  className?: string;
}

export default function LoadingScreen({
  message = 'Cargando...',
  fullScreen = false,
  className = '',
}: LoadingScreenProps) {
  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
        <div className="flex flex-col items-center gap-4">
          <CustomLoader />
          {message && (
            <p className="text-sm text-muted-foreground animate-pulse">
              {message}
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col items-center justify-center min-h-[400px] ${className}`}>
      <div className="flex flex-col items-center gap-4">
        <CustomLoader />
        {message && (
          <p className="text-sm text-muted-foreground animate-pulse">
            {message}
          </p>
        )}
      </div>
    </div>
  );
}
