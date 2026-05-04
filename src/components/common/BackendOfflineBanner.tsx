/**
 * Banner reutilizable que se muestra cuando el backend NestJS no responde.
 * Se renderiza inline (no fixed) para no taparse con otros toasts.
 */

import { ServerCrash, RefreshCw } from 'lucide-react';

interface BackendOfflineBannerProps {
  /** Mensaje contextual ("No se pudo cargar el resumen", etc.) */
  context?: string;
  /** Callback opcional para reintentar la operación. */
  onRetry?: () => void;
  retrying?: boolean;
}

export default function BackendOfflineBanner({
  context,
  onRetry,
  retrying,
}: BackendOfflineBannerProps) {
  return (
    <div
      role="alert"
      className="rounded-xl border border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-900/20 p-4 flex items-start gap-3"
    >
      <div className="flex-shrink-0 p-2 bg-amber-100 dark:bg-amber-900/40 rounded-lg">
        <ServerCrash className="h-5 w-5 text-amber-700 dark:text-amber-300" />
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-semibold text-amber-900 dark:text-amber-100">
          Backend no disponible
        </h3>
        <p className="text-xs text-amber-800 dark:text-amber-200 mt-0.5">
          {context ?? 'No se pudo conectar al servidor.'}{' '}
          Verifica que esté corriendo en{' '}
          <code className="px-1 py-0.5 bg-amber-100 dark:bg-amber-900/40 rounded font-mono">
            localhost:3000
          </code>
          .
        </p>
        <details className="mt-2 text-xs text-amber-700 dark:text-amber-300">
          <summary className="cursor-pointer font-medium">¿Cómo arreglarlo?</summary>
          <ol className="mt-1.5 ml-4 list-decimal space-y-0.5">
            <li>Abre la carpeta del backend</li>
            <li>
              Ejecuta{' '}
              <code className="px-1 py-0.5 bg-amber-100 dark:bg-amber-900/40 rounded font-mono">
                npm run start:dev
              </code>
            </li>
            <li>Reintenta la operación cuando veas "Application is running"</li>
          </ol>
        </details>
      </div>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          disabled={retrying}
          className="flex-shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-amber-100 dark:bg-amber-900/40 text-amber-900 dark:text-amber-100 hover:bg-amber-200 dark:hover:bg-amber-900/60 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`h-3 w-3 ${retrying ? 'animate-spin' : ''}`} />
          Reintentar
        </button>
      )}
    </div>
  );
}
