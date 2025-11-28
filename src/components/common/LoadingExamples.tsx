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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Simple */}
            <SpinnerCard
              title="Simple"
              description="Spinner circular básico"
              variant="simple"
            />

            {/* Dots */}
            <SpinnerCard
              title="Dots (iOS Style)"
              description="3 puntos que rebotan - Recomendado"
              variant="dots"
              recommended
            />

            {/* Dots2 */}
            <SpinnerCard
              title="Dots V2"
              description="Variante alternativa de puntos"
              variant="dots2"
            />

            {/* Dots3 */}
            <SpinnerCard
              title="Dots V3"
              description="Animación de puntos suave"
              variant="dots3"
            />

            {/* Material */}
            <SpinnerCard
              title="Material"
              description="Estilo Material Design"
              variant="material"
            />

            {/* Pulse */}
            <SpinnerCard
              title="Pulse"
              description="Anillo pulsante"
              variant="pulse"
            />

            {/* Ring */}
            <SpinnerCard
              title="Ring"
              description="Doble anillo giratorio"
              variant="ring"
            />
          </div>
        </div>

        {/* Tamaños */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Tamaños</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <SizeCard size="sm" label="Small" />
            <SizeCard size="md" label="Medium (Default)" />
            <SizeCard size="lg" label="Large" />
          </div>
        </div>

        {/* Uso en botones */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Uso en Botones</h3>
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
        </div>

        {/* Código de ejemplo */}
        <CodeExample
          title="Código básico"
          code={`import LoadingSpinner from '@components/common/LoadingSpinner';

// Básico
<LoadingSpinner variant="dots3" size="md" />

// En botón
<Button loading loadingText="Guardando..." spinnerVariant="dots3">
  Guardar
</Button>

// Inline con color personalizado
<div className="text-primary">
  <LoadingSpinner variant="dots" size="lg" />
</div>`}
        />
      </section>

      {/* ========== LOADING OVERLAY ========== */}
      <section className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold mb-2">LoadingOverlay</h2>
          <p className="text-muted-foreground">
            Overlay modal con glassmorphism para operaciones que requieren bloqueo de UI.
            Optimizado para móvil con gestos y animaciones iOS.
          </p>
        </div>

        {/* Características */}
        <div className="bg-muted/30 border border-border rounded-xl p-6">
          <h3 className="font-semibold mb-3">Características</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
              <span>Efecto glassmorphism con backdrop blur</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
              <span>Bloquea scroll e interacción del usuario</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
              <span>Estado de éxito con checkmark animado</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
              <span>Cierre opcional al hacer clic en backdrop</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
              <span>Modo solo móvil (oculto en desktop)</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
              <span>Mensaje principal y submensaje</span>
            </li>
          </ul>
        </div>

        {/* Demos interactivas */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Demos Interactivas</h3>
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
        </div>

        {/* Código de ejemplo */}
        <CodeExample
          title="Código básico"
          code={`import { LoadingOverlay } from '@components/common/LoadingSpinner';

const [isLoading, setIsLoading] = useState(false);
const [showSuccess, setShowSuccess] = useState(false);

// Mostrar overlay
<LoadingOverlay
  isOpen={isLoading}
  variant="dots3"
  message="Procesando..."
  submessage="Esto puede tomar unos segundos"
  success={showSuccess}
  closeOnBackdrop={false}
  mobileOnly={true}
/>

// Uso típico
const handleSubmit = async () => {
  setIsLoading(true);
  try {
    await api.submit();
    setShowSuccess(true);
    setTimeout(() => setIsLoading(false), 2000);
  } catch (error) {
    setIsLoading(false);
  }
};`}
        />
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
        <div className="bg-card border border-border rounded-xl p-6">
          <h3 className="font-semibold mb-4">Demo Interactiva</h3>
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
        </div>

        {/* Código de ejemplo */}
        <CodeExample
          title="Código completo"
          code={`import { useLoadingOverlay } from '@components/common/LoadingSpinner';

function MyComponent() {
  const {
    isLoading,
    loadingMessage,
    loadingSubmessage,
    showSuccess,
    showLoading,
    hideLoading,
    showSuccessState,
  } = useLoadingOverlay();

  const handleAction = async () => {
    // Mostrar loading
    showLoading('Guardando...', 'Espera un momento');

    try {
      await api.save();
      // Mostrar éxito (auto-cierra en 2s)
      showSuccessState('¡Guardado!', 'Cambios aplicados correctamente');
    } catch (error) {
      hideLoading();
      toast.error('Error al guardar');
    }
  };

  return (
    <>
      <Button onClick={handleAction}>Guardar</Button>

      <LoadingOverlay
        isOpen={isLoading}
        message={loadingMessage}
        submessage={loadingSubmessage}
        success={showSuccess}
        variant="dots3"
      />
    </>
  );
}`}
        />
      </section>

      {/* ========== LOADING SCREEN ========== */}
      <section className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold mb-2">LoadingScreen</h2>
          <p className="text-muted-foreground">
            Pantalla de carga centralizada que usa CustomLoader. Ideal para carga inicial de páginas.
          </p>
        </div>

        {/* Demo visual */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Versión normal */}
          <div className="bg-muted/30 border border-border rounded-xl p-6">
            <h3 className="font-semibold mb-4">Versión Normal</h3>
            <LoadingScreen message="Cargando datos..." />
          </div>

          {/* Sin mensaje */}
          <div className="bg-muted/30 border border-border rounded-xl p-6">
            <h3 className="font-semibold mb-4">Sin Mensaje</h3>
            <LoadingScreen />
          </div>
        </div>

        {/* Código de ejemplo */}
        <CodeExample
          title="Código básico"
          code={`import LoadingScreen from '@components/common/LoadingScreen';

// Normal (centrado en contenedor)
<LoadingScreen message="Cargando datos..." />

// Full screen (overlay)
<LoadingScreen message="Cargando..." fullScreen />

// En páginas
function MyPage() {
  const [loading, setLoading] = useState(true);

  if (loading) {
    return <LoadingScreen message="Cargando página..." />;
  }

  return <div>Contenido...</div>;
}`}
        />
      </section>

      {/* ========== CUSTOM LOADER ========== */}
      <section className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold mb-2">CustomLoader</h2>
          <p className="text-muted-foreground">
            Loader personalizado con animación de bolas. Usado internamente por LoadingScreen.
          </p>
        </div>

        {/* Demo visual */}
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

        {/* Código de ejemplo */}
        <CodeExample
          title="Código básico"
          code={`import CustomLoader from '@components/common/CustomLoader';

// Simple
<CustomLoader />

// En contenedor centrado
<div className="flex items-center justify-center min-h-screen">
  <CustomLoader />
</div>`}
        />
      </section>

      {/* ========== MEJORES PRÁCTICAS ========== */}
      <section className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold mb-2">Mejores Prácticas</h2>
        </div>

        <div className="space-y-4">
          <BestPracticeCard
            title="Cuándo usar cada componente"
            items={[
              'LoadingSpinner: Estados inline, botones, indicadores pequeños',
              'LoadingOverlay: Operaciones que bloquean UI (guardar, eliminar, procesar)',
              'LoadingScreen: Carga inicial de páginas/vistas',
              'CustomLoader: Cuando necesitas el diseño específico de la app',
            ]}
          />

          <BestPracticeCard
            title="Variantes recomendadas"
            items={[
              'dots3: Recomendado para la mayoría de casos (iOS style, suave)',
              'dots: Alternativa iOS con animación diferente',
              'simple/material: Para casos donde necesitas spinner circular tradicional',
              'pulse/ring: Para indicadores de estado persistente',
            ]}
          />

          <BestPracticeCard
            title="UX Tips"
            items={[
              'Siempre proporciona mensajes descriptivos en overlays',
              'Usa estado de éxito para confirmar operaciones importantes',
              'Evita múltiples spinners simultáneos en la misma pantalla',
              'Considera usar skeleton loaders para contenido que se carga progresivamente',
              'En móvil, usa LoadingOverlay para operaciones largas',
            ]}
          />

          <BestPracticeCard
            title="Performance"
            items={[
              'LoadingOverlay bloquea scroll automáticamente',
              'useLoadingOverlay maneja auto-cierre en estado de éxito',
              'Los spinners son livianos y no afectan performance',
              'Usa mobileOnly={true} en LoadingOverlay si solo necesitas en móvil',
            ]}
          />
        </div>
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
    </div>
  );
}

// ========================================
// COMPONENTES AUXILIARES
// ========================================

interface SpinnerCardProps {
  title: string;
  description: string;
  variant: 'simple' | 'dots' | 'dots2' | 'dots3' | 'material' | 'pulse' | 'ring';
  recommended?: boolean;
}

function SpinnerCard({ title, description, variant, recommended }: SpinnerCardProps) {
  return (
    <div className="bg-card border border-border rounded-xl p-6 hover:border-primary/50 transition-colors relative">
      {recommended && (
        <div className="absolute top-2 right-2">
          <span className="px-2 py-1 bg-primary text-primary-foreground text-xs font-semibold rounded-full">
            Recomendado
          </span>
        </div>
      )}
      <div className="flex items-center justify-center h-24 text-primary">
        <LoadingSpinner variant={variant} size="lg" />
      </div>
      <div className="text-center mt-4">
        <h4 className="font-semibold mb-1">{title}</h4>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <div className="mt-4 p-2 bg-muted/50 rounded-lg">
        <code className="text-xs text-foreground">
          variant="{variant}"
        </code>
      </div>
    </div>
  );
}

interface SizeCardProps {
  size: 'sm' | 'md' | 'lg';
  label: string;
}

function SizeCard({ size, label }: SizeCardProps) {
  return (
    <div className="bg-card border border-border rounded-xl p-6">
      <div className="flex items-center justify-center h-20 text-primary">
        <LoadingSpinner variant="dots3" size={size} />
      </div>
      <div className="text-center mt-4">
        <h4 className="font-semibold mb-1">{label}</h4>
        <code className="text-xs text-muted-foreground">size="{size}"</code>
      </div>
    </div>
  );
}

interface CodeExampleProps {
  title: string;
  code: string;
}

function CodeExample({ title, code }: CodeExampleProps) {
  return (
    <div className="bg-muted/30 border border-border rounded-xl overflow-hidden">
      <div className="px-4 py-2 bg-muted/50 border-b border-border">
        <h4 className="text-sm font-semibold">{title}</h4>
      </div>
      <pre className="p-4 overflow-x-auto">
        <code className="text-xs text-foreground">{code}</code>
      </pre>
    </div>
  );
}

interface BestPracticeCardProps {
  title: string;
  items: string[];
}

function BestPracticeCard({ title, items }: BestPracticeCardProps) {
  return (
    <div className="bg-card border border-border rounded-xl p-6">
      <h3 className="font-semibold mb-3">{title}</h3>
      <ul className="space-y-2">
        {items.map((item, index) => (
          <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
            <span className="text-primary mt-1">•</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
