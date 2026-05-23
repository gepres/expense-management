/**
 * Página `/widget-link` — empareja la sesión web con el widget Windows (Tauri).
 *
 * Usuario debe estar autenticado. Al hacer click en "Conectar widget", emitimos
 * un custom token Firebase desde el backend y redirigimos a `gastos://auth?...`.
 * El widget instalado intercepta el esquema y se autentica solo.
 *
 * Si el usuario no tiene el widget instalado, mostramos un CTA con instrucciones
 * (link de descarga — se rellenará en F3 / instalador).
 */

import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { ArrowLeft, Download, Loader2, Sparkles, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '@context/AuthContext';
import {
  issueWidgetToken,
  buildWidgetDeepLink,
} from '@services/widget';
import CustomLoader from '@components/common/CustomLoader';

export default function WidgetLinkPage() {
  const { usuario, cargando } = useAuth();
  const [linking, setLinking] = useState(false);
  const [linkedAt, setLinkedAt] = useState<Date | null>(null);

  if (cargando) return <CustomLoader />;
  if (!usuario) return <Navigate to="/login?redirect=/widget-link" replace />;

  const handleConnect = async () => {
    setLinking(true);
    try {
      const { customToken } = await issueWidgetToken();
      const url = buildWidgetDeepLink(customToken);
      // Lanzar el deep link. Si el widget no está instalado el navegador
      // muestra el diálogo "no se encontró aplicación".
      window.location.href = url;
      setLinkedAt(new Date());
      toast.success('Token emitido — el widget debería abrirse');
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Error inesperado';
      toast.error(msg);
    } finally {
      setLinking(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
      {/* Glow ambiental del tema (como LandingPage) */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 left-1/2 -translate-x-1/2 h-[420px] w-[420px] rounded-full bg-primary/20 blur-[120px]"
      />

      <div className="relative w-full max-w-md bg-card border border-border rounded-2xl shadow-xl overflow-hidden">
        {/* Hero — gradiente sobre el primary del tema */}
        <div className="relative overflow-hidden p-6 bg-gradient-to-br from-primary/10 via-card to-card border-b border-border">
          <div
            aria-hidden
            className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-primary/20 blur-3xl"
          />
          <Link
            to="/"
            className="relative inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors mb-3"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Volver al inicio
          </Link>
          <div className="relative flex items-center gap-2 mb-1">
            <span className="h-8 w-8 rounded-lg bg-primary/15 flex items-center justify-center text-primary">
              <Sparkles className="h-4 w-4" />
            </span>
            <h1 className="text-lg font-bold text-foreground">
              Conectar widget Windows
            </h1>
          </div>
          <p className="relative text-sm text-muted-foreground">
            Resumen rápido de tus gastos y cuentas en tu escritorio.
          </p>
        </div>

        <div className="p-6 space-y-4">
          <ol className="space-y-3 text-sm text-foreground">
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center">
                1
              </span>
              <span>
                Descarga e instala el widget Windows{' '}
                <a
                  href="#"
                  className="text-primary font-medium hover:underline inline-flex items-center gap-1"
                  aria-disabled
                >
                  <Download className="h-3.5 w-3.5" />
                  Próximamente
                </a>
              </span>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center">
                2
              </span>
              <span>
                Pulsa el botón de abajo. Tu navegador abrirá el widget y quedará
                conectado a tu cuenta.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center">
                3
              </span>
              <span>
                Listo: el widget refresca cada 10 minutos y vive en la bandeja
                del sistema.
              </span>
            </li>
          </ol>

          <button
            type="button"
            onClick={handleConnect}
            disabled={linking}
            className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-semibold shadow-lg shadow-primary/25 hover:opacity-90 transition-opacity disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {linking ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Generando token…
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Conectar widget
              </>
            )}
          </button>

          {linkedAt && (
            <p className="text-xs text-muted-foreground text-center">
              Último intento: {linkedAt.toLocaleTimeString('es-PE')}. Si nada
              ocurre, asegúrate de tener el widget instalado.
            </p>
          )}

          <div className="text-[11px] text-muted-foreground bg-muted/40 border border-border rounded-lg p-3 flex gap-2">
            <ShieldCheck className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
            <span>
              El token expira en 1 hora y solo sirve para iniciar sesión una vez
              en el widget. Tu contraseña nunca sale del navegador.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
