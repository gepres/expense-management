import { Download, X, Smartphone, Chrome } from 'lucide-react';
import { usePWAInstall } from '@hooks/usePWAInstall';
import { useState, useEffect } from 'react';

export default function InstallPWA() {
  const { isInstallable, install } = usePWAInstall();
  const [isVisible, setIsVisible] = useState(true);
  const [isPWA, setIsPWA] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);

  useEffect(() => {
    // Check if already running as PWA
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    setIsPWA(isStandalone);
  }, []);

  // Don't show if already installed as PWA or user dismissed it
  if (isPWA || !isVisible) return null;

  // Detect browser type for manual instructions
  const isChrome = /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor);
  const isSafari = /Safari/.test(navigator.userAgent) && /Apple Computer/.test(navigator.vendor);
  const isFirefox = /Firefox/.test(navigator.userAgent);

  return (
    <div className="bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 rounded-2xl p-4 mb-6 relative overflow-hidden">
      <div className="flex items-start gap-4">
        <div className="p-3 bg-primary/10 rounded-xl text-primary">
          <Download className="h-6 w-6" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-foreground mb-1">
            Instala la Aplicación
          </h3>
          <p className="text-sm text-muted-foreground mb-3">
            Descarga nuestra app para un acceso más rápido y notificaciones de tus gastos.
          </p>
          
          {isInstallable ? (
            <button
              onClick={install}
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-2 px-4 rounded-lg text-sm transition-colors shadow-sm"
            >
              Instalar Ahora
            </button>
          ) : (
            <div>
              <button
                onClick={() => setShowInstructions(!showInstructions)}
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-2 px-4 rounded-lg text-sm transition-colors shadow-sm flex items-center gap-2"
              >
                <Smartphone className="h-4 w-4" />
                Ver Instrucciones
              </button>
              
              {showInstructions && (
                <div className="mt-3 p-3 bg-background/50 rounded-lg border border-border text-xs space-y-2">
                  {isChrome && (
                    <div className="flex items-start gap-2">
                      <Chrome className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-foreground">Chrome/Edge:</p>
                        <p className="text-muted-foreground">Toca el menú (⋮) → "Instalar aplicación" o "Agregar a pantalla de inicio"</p>
                      </div>
                    </div>
                  )}
                  {isSafari && (
                    <div className="flex items-start gap-2">
                      <Smartphone className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-foreground">Safari (iOS):</p>
                        <p className="text-muted-foreground">Toca el botón de compartir (□↑) → "Agregar a pantalla de inicio"</p>
                      </div>
                    </div>
                  )}
                  {isFirefox && (
                    <div className="flex items-start gap-2">
                      <Smartphone className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-foreground">Firefox:</p>
                        <p className="text-muted-foreground">Toca el menú (⋮) → "Instalar" o "Agregar a pantalla de inicio"</p>
                      </div>
                    </div>
                  )}
                  {!isChrome && !isSafari && !isFirefox && (
                    <p className="text-muted-foreground">Busca la opción "Instalar aplicación" o "Agregar a pantalla de inicio" en el menú de tu navegador.</p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
        <button 
          onClick={() => setIsVisible(false)}
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
