/**
 * Loading Components - Ejemplos de Uso
 *
 * Este archivo muestra todos los casos de uso de los componentes de Loading
 * Para ver estos ejemplos, importa este componente en /documentacion
 */

import { useState } from 'react';
import LoadingSpinner, { LoadingOverlay, useLoadingOverlay } from './LoadingSpinner';
import LoadingScreen from './LoadingScreen';
import CustomLoader from './CustomLoader';
import Button from './Button';
import CodePreview from "@components/common/CodePreview";
import { Card } from "@components/common/Card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@components/common/Table";
import { Loader2, RefreshCw, CheckCircle2 } from 'lucide-react';

export default function LoadingExamples() {
  const [showOverlay, setShowOverlay] = useState(false);
  const [overlayVariant, setOverlayVariant] = useState<'dots' | 'dots2' | 'dots3' | 'simple' | 'material'>('dots3');
  const [showSuccess, setShowSuccess] = useState(false);

  // Hook personalizado
  const {
    isLoading: hookIsLoading,
    loadingMessage,
    loadingSubmessage,
    showSuccess: hookShowSuccess,
    showLoading: hookShowLoading,
    hideLoading: hookHideLoading,
    showSuccessState: hookShowSuccessState,
  } = useLoadingOverlay();

  // Simular carga
  const handleShowOverlay = (variant: typeof overlayVariant, withSuccess = false) => {
    setOverlayVariant(variant);
    setShowSuccess(false);
    setShowOverlay(true);

    if (withSuccess) {
      setTimeout(() => {
        setShowSuccess(true);
        setTimeout(() => {
          setShowOverlay(false);
        }, 2000);
      }, 2000);
    } else {
        setTimeout(() => {
            setShowOverlay(false);
        }, 3000);
    }
  };

  // Simular carga con hook
  const handleHookDemo = () => {
    hookShowLoading('Procesando...', 'Esto tomará unos segundos');
    setTimeout(() => {
      hookShowSuccessState('¡Completado!', 'La operación finalizó correctamente');
    }, 2000);
  };

  return (
    <div className="space-y-12">
      <div>
        <h1 className="text-3xl font-bold mb-2">Loading Components</h1>
        <p className="text-muted-foreground text-lg">
          Spinners, overlays y pantallas de carga con múltiples variantes y estilos.
        </p>
      </div>

      {/* ========== LOADING SPINNER ========== */}
      <section className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold mb-2">LoadingSpinner</h2>
          <p className="text-muted-foreground">
            Spinners de carga con 7 variantes diferentes. Ideales para botones y estados inline.
          </p>
        </div>

        {/* Variantes */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Variantes Disponibles</h3>
          <CodePreview
            code={`<LoadingSpinner variant="simple" />
<LoadingSpinner variant="dots" />
<LoadingSpinner variant="dots2" />
<LoadingSpinner variant="dots3" />
<LoadingSpinner variant="material" />
<LoadingSpinner variant="pulse" />
<LoadingSpinner variant="ring" />`}
          >
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="flex flex-col items-center gap-2">
                    <LoadingSpinner variant="simple" size="lg" />
                    <span className="text-xs text-muted-foreground">simple</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                    <LoadingSpinner variant="dots" size="lg" />
                    <span className="text-xs text-muted-foreground">dots</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                    <LoadingSpinner variant="dots2" size="lg" />
                    <span className="text-xs text-muted-foreground">dots2</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                    <LoadingSpinner variant="dots3" size="lg" />
                    <span className="text-xs text-muted-foreground">dots3</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                    <LoadingSpinner variant="material" size="lg" />
                    <span className="text-xs text-muted-foreground">material</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                    <LoadingSpinner variant="pulse" size="lg" />
                    <span className="text-xs text-muted-foreground">pulse</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                    <LoadingSpinner variant="ring" size="lg" />
                    <span className="text-xs text-muted-foreground">ring</span>
                </div>
            </div>
          </CodePreview>
        </div>

        {/* Tamaños */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Tamaños</h3>
          <CodePreview
            code={`<LoadingSpinner size="sm" />
<LoadingSpinner size="md" />
<LoadingSpinner size="lg" />`}
          >
             <div className="flex items-end gap-8">
                <div className="flex flex-col items-center gap-2">
                    <LoadingSpinner variant="dots3" size="sm" />
                    <span className="text-xs text-muted-foreground">sm</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                    <LoadingSpinner variant="dots3" size="md" />
                    <span className="text-xs text-muted-foreground">md</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                    <LoadingSpinner variant="dots3" size="lg" />
                    <span className="text-xs text-muted-foreground">lg</span>
                </div>
             </div>
          </CodePreview>
        </div>

        {/* Uso en botones */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Uso en Botones</h3>
          <CodePreview
            code={`<Button loading loadingText="Guardando...">Guardar</Button>
<Button loading spinnerVariant="dots2">Procesando</Button>`}
          >
             <div className="flex flex-wrap gap-3">
                <Button loading loadingText="Guardando...">
                  Guardar
                </Button>
                <Button variant="secondary" loading spinnerVariant="dots2">
                  Procesando
                </Button>
                <Button variant="destructive" loading spinnerVariant="simple">
                  Eliminando
                </Button>
                <Button variant="success" loading spinnerVariant="dots3" loadingText="Completando...">
                  Completar
                </Button>
              </div>
          </CodePreview>
        </div>
      </section>

      {/* ========== LOADING OVERLAY ========== */}
      <section className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold mb-2">LoadingOverlay</h2>
          <p className="text-muted-foreground">
            Overlay modal con glassmorphism para operaciones que requieren bloqueo de UI.
          </p>
        </div>

        {/* Demos interactivas */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Demos Interactivas</h3>
          <CodePreview
            code={`<LoadingOverlay
  isOpen={isLoading}
  variant="dots3"
  message="Procesando..."
  success={showSuccess}
/>`}
          >
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button
                  variant="primary"
                  onClick={() => handleShowOverlay('dots3', false)}
                  icon={Loader2}
                >
                  Overlay Simple (dots3)
                </Button>

                <Button
                  variant="secondary"
                  onClick={() => handleShowOverlay('dots', false)}
                  icon={Loader2}
                >
                  Overlay con Dots (iOS)
                </Button>

                <Button
                  variant="success"
                  onClick={() => handleShowOverlay('dots3', true)}
                  icon={CheckCircle2}
                >
                  Con Estado de Éxito
                </Button>

                <Button
                  variant="outline"
                  onClick={() => handleShowOverlay('material', false)}
                  icon={RefreshCw}
                >
                  Overlay Material
                </Button>
              </div>
          </CodePreview>
        </div>
      </section>

      {/* ========== HOOK useLoadingOverlay ========== */}
      <section className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold mb-2">useLoadingOverlay Hook</h2>
          <p className="text-muted-foreground">
            Hook personalizado para controlar el LoadingOverlay de manera más sencilla.
          </p>
        </div>

        {/* Demo */}
        <CodePreview
            code={`const { showLoading, showSuccessState } = useLoadingOverlay();

showLoading('Procesando...');
await apiCall();
showSuccessState('¡Listo!');`}
        >
            <div className="flex flex-wrap gap-3">
                <Button
                  variant="primary"
                  onClick={handleHookDemo}
                  icon={Loader2}
                >
                  Probar Hook Demo
                </Button>

                <Button
                  variant="secondary"
                  onClick={() => hookShowLoading('Cargando datos...', 'Por favor espera')}
                >
                  Solo Loading
                </Button>

                <Button
                  variant="success"
                  onClick={() => hookShowSuccessState('¡Listo!', 'Operación completada')}
                >
                  Solo Success
                </Button>

                <Button
                  variant="ghost"
                  onClick={hookHideLoading}
                >
                  Cerrar
                </Button>
              </div>
        </CodePreview>
      </section>

      {/* ========== LOADING SCREEN ========== */}
      <section className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold mb-2">LoadingScreen</h2>
          <p className="text-muted-foreground">
            Pantalla de carga centralizada que usa CustomLoader. Ideal para carga inicial de páginas.
          </p>
        </div>

        <CodePreview
            code={`<LoadingScreen message="Cargando datos..." />`}
        >
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-muted/30 border border-border rounded-xl p-6 h-64 relative">
                    <LoadingScreen message="Cargando datos..." />
                </div>
                <div className="bg-muted/30 border border-border rounded-xl p-6 h-64 relative">
                    <LoadingScreen />
                </div>
            </div>
        </CodePreview>
      </section>

      {/* ========== CUSTOM LOADER ========== */}
      <section className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold mb-2">CustomLoader</h2>
          <p className="text-muted-foreground">
            Loader personalizado con animación de bolas.
          </p>
        </div>

        <CodePreview
            code={`<CustomLoader />`}
        >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-card border border-border rounded-xl p-8 flex flex-col items-center justify-center min-h-[200px]">
                <CustomLoader />
                <p className="text-sm text-muted-foreground mt-4">Light Mode</p>
              </div>

              <div className="bg-muted border border-border rounded-xl p-8 flex flex-col items-center justify-center min-h-[200px]">
                <CustomLoader />
                <p className="text-sm text-muted-foreground mt-4">Dark Background</p>
              </div>
            </div>
        </CodePreview>
      </section>

      {/* Overlays activos (fuera del flujo) */}
      <LoadingOverlay
        isOpen={showOverlay}
        onClose={() => setShowOverlay(false)}
        variant={overlayVariant}
        message={showSuccess ? '¡Completado!' : 'Procesando...'}
        submessage={showSuccess ? 'Operación exitosa' : 'Por favor espera'}
        success={showSuccess}
        mobileOnly={false}
      />

      <LoadingOverlay
        isOpen={hookIsLoading}
        variant="dots3"
        message={loadingMessage}
        submessage={loadingSubmessage}
        success={hookShowSuccess}
        mobileOnly={false}
      />

       {/* Props Reference */}
       <div className="space-y-4">
        <h3 className="text-2xl font-bold">Props Reference</h3>
        
        <div className="space-y-6">
            <Card>
                <div className="p-4 border-b border-border">
                    <h4 className="font-bold">LoadingSpinner Props</h4>
                </div>
                <Table>
                    <TableHeader>
                    <TableRow>
                        <TableHead>Prop</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Default</TableHead>
                        <TableHead>Description</TableHead>
                    </TableRow>
                    </TableHeader>
                    <TableBody>
                    <TableRow>
                        <TableCell className="font-mono text-xs">variant</TableCell>
                        <TableCell className="font-mono text-xs">'simple' | 'dots' | 'dots2' | 'dots3' | 'material' | 'pulse' | 'ring'</TableCell>
                        <TableCell className="font-mono text-xs">'simple'</TableCell>
                        <TableCell>Estilo visual del spinner.</TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell className="font-mono text-xs">size</TableCell>
                        <TableCell className="font-mono text-xs">'sm' | 'md' | 'lg'</TableCell>
                        <TableCell className="font-mono text-xs">'md'</TableCell>
                        <TableCell>Tamaño del spinner.</TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell className="font-mono text-xs">className</TableCell>
                        <TableCell className="font-mono text-xs">string</TableCell>
                        <TableCell className="font-mono text-xs">-</TableCell>
                        <TableCell>Clases CSS adicionales.</TableCell>
                    </TableRow>
                    </TableBody>
                </Table>
            </Card>

            <Card>
                <div className="p-4 border-b border-border">
                    <h4 className="font-bold">LoadingOverlay Props</h4>
                </div>
                <Table>
                    <TableHeader>
                    <TableRow>
                        <TableHead>Prop</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Default</TableHead>
                        <TableHead>Description</TableHead>
                    </TableRow>
                    </TableHeader>
                    <TableBody>
                    <TableRow>
                        <TableCell className="font-mono text-xs">isOpen</TableCell>
                        <TableCell className="font-mono text-xs">boolean</TableCell>
                        <TableCell className="font-mono text-xs">false</TableCell>
                        <TableCell>Controla la visibilidad del overlay.</TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell className="font-mono text-xs">message</TableCell>
                        <TableCell className="font-mono text-xs">string</TableCell>
                        <TableCell className="font-mono text-xs">-</TableCell>
                        <TableCell>Mensaje principal de carga.</TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell className="font-mono text-xs">submessage</TableCell>
                        <TableCell className="font-mono text-xs">string</TableCell>
                        <TableCell className="font-mono text-xs">-</TableCell>
                        <TableCell>Mensaje secundario o detalle.</TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell className="font-mono text-xs">success</TableCell>
                        <TableCell className="font-mono text-xs">boolean</TableCell>
                        <TableCell className="font-mono text-xs">false</TableCell>
                        <TableCell>Muestra estado de éxito (checkmark).</TableCell>
                    </TableRow>
                     <TableRow>
                        <TableCell className="font-mono text-xs">mobileOnly</TableCell>
                        <TableCell className="font-mono text-xs">boolean</TableCell>
                        <TableCell className="font-mono text-xs">false</TableCell>
                        <TableCell>Si es true, solo se muestra en dispositivos móviles.</TableCell>
                    </TableRow>
                    </TableBody>
                </Table>
            </Card>
        </div>
      </div>
    </div>
  );
}
