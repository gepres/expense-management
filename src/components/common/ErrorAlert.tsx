/**
 * Componente para mostrar alertas de error
 */

import React from 'react';
import { Lock, X as XCircle } from 'lucide-react';

interface ErrorAlertProps {
  error: string | null;
  onDismiss?: () => void;
}

export default function ErrorAlert({ error, onDismiss }: ErrorAlertProps): JSX.Element | null {
  if (!error) return null;

  const isPermissionError = error.toLowerCase().includes('permission') ||
                            error.toLowerCase().includes('permisos');

  return (
    <div className="fixed top-4 right-4 max-w-md z-50 animate-slide-in">
      <div className={`rounded-lg border p-4 shadow-lg ${
        isPermissionError
          ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-300 dark:border-yellow-700'
          : 'bg-red-50 dark:bg-red-900/20 border-red-300 dark:border-red-700'
      }`}>
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            {isPermissionError ? (
              <Lock className={`h-6 w-6 text-yellow-600 dark:text-yellow-400`} />
            ) : (
              <XCircle className={`h-6 w-6 text-red-600 dark:text-red-400`} />
            )}
          </div>
          <div className="flex-1">
            <h3 className={`text-sm font-semibold mb-1 ${
              isPermissionError
                ? 'text-yellow-800 dark:text-yellow-200'
                : 'text-red-800 dark:text-red-200'
            }`}>
              {isPermissionError ? 'Error de Permisos' : 'Error'}
            </h3>
            <p className={`text-sm ${
              isPermissionError
                ? 'text-yellow-700 dark:text-yellow-300'
                : 'text-red-700 dark:text-red-300'
            }`}>
              {error}
            </p>
            {isPermissionError && (
              <div className="mt-2 pt-2 border-t border-yellow-300 dark:border-yellow-700">
                <p className="text-xs text-yellow-600 dark:text-yellow-400 mb-2">
                  <strong>Solución rápida:</strong>
                </p>
                <ol className="text-xs text-yellow-700 dark:text-yellow-300 list-decimal list-inside space-y-1">
                  <li>Ve a Firebase Console → Firestore Database → Rules</li>
                  <li>Publica las reglas de desarrollo</li>
                  <li>Recarga esta página</li>
                </ol>
                <a
                  href="https://console.firebase.google.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block mt-2 text-xs font-medium text-yellow-800 dark:text-yellow-200 hover:underline"
                >
                  Abrir Firebase Console →
                </a>
              </div>
            )}
          </div>
          {onDismiss && (
            <button
              onClick={onDismiss}
              className={`flex-shrink-0 rounded-md p-1 hover:bg-opacity-20 transition-colors ${
                isPermissionError
                  ? 'text-yellow-600 hover:bg-yellow-600 dark:text-yellow-400'
                  : 'text-red-600 hover:bg-red-600 dark:text-red-400'
              }`}
            >
              <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
