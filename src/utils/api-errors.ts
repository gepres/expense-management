/**
 * Utilidades para distinguir errores de red (backend caído / CORS) de errores
 * de API (HTTP 4xx/5xx con respuesta JSON). Permite a los hooks/vistas
 * mostrar UX diferenciada (banner persistente vs toast puntual).
 */

export class BackendOfflineError extends Error {
  readonly isBackendOffline = true;

  constructor(message = 'No se pudo conectar con el servidor') {
    super(message);
    this.name = 'BackendOfflineError';
  }
}

/**
 * Detecta si un error proviene de una falla de red (servidor caído, CORS,
 * DNS, etc.) en lugar de una respuesta HTTP de error. `fetch()` lanza un
 * `TypeError` con mensaje "Failed to fetch" / "NetworkError" en estos casos.
 */
export function isNetworkError(error: unknown): boolean {
  if (error instanceof BackendOfflineError) return true;
  if (!(error instanceof Error)) return false;
  if (error.name === 'TypeError') {
    const msg = error.message.toLowerCase();
    return (
      msg.includes('failed to fetch') ||
      msg.includes('networkerror') ||
      msg.includes('load failed') ||
      msg.includes('network request failed')
    );
  }
  return false;
}

/**
 * Wrapper estándar para `fetch()` que convierte fallas de red en
 * `BackendOfflineError`, dejando pasar los demás errores tal cual.
 */
export async function fetchOrThrowOffline(
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<Response> {
  try {
    return await fetch(input, init);
  } catch (err) {
    if (isNetworkError(err)) {
      throw new BackendOfflineError();
    }
    throw err;
  }
}
