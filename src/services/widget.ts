/**
 * Servicio para emparejar el widget Windows (Tauri) con la sesión web.
 *
 * Flujo:
 *  1. Usuario logueado en la web entra a `/widget-link`.
 *  2. Llama `issueWidgetToken()` → backend devuelve un Firebase custom token.
 *  3. La página redirige a `gastos://auth?customToken=<JWT>` → Tauri lo captura
 *     y hace `signInWithCustomToken` con el SDK web de Firebase.
 *  4. Tauri queda con su propia sesión Firebase (refresh token en localStorage
 *     del WebView2), independiente de la web.
 */

import { getAuth } from 'firebase/auth';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

export interface IssuedWidgetToken {
  customToken: string;
  uid: string;
  issuedAt: string;
}

export async function issueWidgetToken(): Promise<IssuedWidgetToken> {
  const auth = getAuth();
  const token = await auth.currentUser?.getIdToken();
  if (!token) throw new Error('No hay sesión activa');

  const response = await fetch(`${API_URL}/widget/issue-token`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (response.status === 429) {
    throw new Error(
      'Demasiados intentos en poco tiempo. Espera un minuto antes de reintentar.',
    );
  }
  if (!response.ok) {
    const data = (await response.json().catch(() => ({}))) as {
      message?: string;
    };
    throw new Error(
      data.message || 'No se pudo generar el token del widget',
    );
  }
  return (await response.json()) as IssuedWidgetToken;
}

/** Esquema URI registrado por el widget Tauri. */
export const WIDGET_URI_SCHEME = 'gastos';

export function buildWidgetDeepLink(customToken: string): string {
  return `${WIDGET_URI_SCHEME}://auth?customToken=${encodeURIComponent(customToken)}`;
}
