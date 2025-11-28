# Loading Components

Spinners, overlays y pantallas de carga con múltiples variantes y estilos optimizados para iOS.

## 📁 Ubicación
- **LoadingSpinner**: `src/components/common/LoadingSpinner.tsx`
- **LoadingScreen**: `src/components/common/LoadingScreen.tsx`
- **CustomLoader**: `src/components/common/CustomLoader.tsx`
- **Ejemplos**: `src/components/common/LoadingExamples.tsx`
- **Documentación**: Ver en `/documentacion` (sección "Loading States")

## 🎨 Componentes Disponibles

### 1. LoadingSpinner
Spinner de carga con 7 variantes diferentes. Ideal para estados inline y botones.

```tsx
import LoadingSpinner from '@components/common/LoadingSpinner';

<LoadingSpinner variant="dots3" size="md" />
```

**Variantes**:
- `simple` - Spinner circular básico
- `dots` - 3 puntos rebotando (iOS Style) ⭐ **Recomendado**
- `dots2` - Variante alternativa de puntos
- `dots3` - Animación de puntos suave
- `material` - Estilo Material Design
- `pulse` - Anillo pulsante
- `ring` - Doble anillo giratorio

**Tamaños**:
- `sm` - Pequeño (12px)
- `md` - Mediano (16px) - Default
- `lg` - Grande (20px)

**Props**:
```typescript
interface LoadingSpinnerProps {
  variant?: 'simple' | 'dots' | 'dots2' | 'dots3' | 'material' | 'pulse' | 'ring';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}
```

**Uso en Botones**:
```tsx
<Button loading loadingText="Guardando..." spinnerVariant="dots3">
  Guardar
</Button>
```

### 2. LoadingOverlay
Overlay modal con glassmorphism para operaciones que requieren bloqueo de UI.

```tsx
import { LoadingOverlay } from '@components/common/LoadingSpinner';

const [isLoading, setIsLoading] = useState(false);
const [showSuccess, setShowSuccess] = useState(false);

<LoadingOverlay
  isOpen={isLoading}
  variant="dots3"
  message="Procesando..."
  submessage="Esto puede tomar unos segundos"
  success={showSuccess}
  closeOnBackdrop={false}
  mobileOnly={true}
/>
```

**Props**:
```typescript
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
```

**Características**:
- ✅ Efecto glassmorphism con backdrop blur
- ✅ Bloquea scroll e interacción automáticamente
- ✅ Estado de éxito con checkmark animado
- ✅ Cierre opcional al hacer clic en backdrop
- ✅ Modo solo móvil (oculto en desktop)
- ✅ Mensaje principal y submensaje
- ✅ Animaciones suaves iOS style

**Uso típico**:
```tsx
const handleSubmit = async () => {
  setIsLoading(true);
  try {
    await api.submit();
    setShowSuccess(true);
    setTimeout(() => {
      setIsLoading(false);
      navigate('/success');
    }, 2000);
  } catch (error) {
    setIsLoading(false);
    toast.error('Error al procesar');
  }
};
```

### 3. useLoadingOverlay Hook
Hook personalizado para controlar el LoadingOverlay de manera más sencilla.

```tsx
import { useLoadingOverlay } from '@components/common/LoadingSpinner';

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
    showLoading('Guardando...', 'Espera un momento');

    try {
      await api.save();
      showSuccessState('¡Guardado!', 'Cambios aplicados correctamente');
    } catch (error) {
      hideLoading();
      toast.error('Error');
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
}
```

**API del Hook**:
```typescript
interface UseLoadingOverlayReturn {
  isLoading: boolean;
  loadingMessage: string;
  loadingSubmessage?: string;
  showSuccess: boolean;
  showLoading: (message?: string, submessage?: string) => void;
  hideLoading: () => void;
  showSuccessState: (message?: string, submessage?: string, duration?: number) => void;
}
```

**Métodos**:
- `showLoading()` - Muestra el overlay en estado de carga
- `hideLoading()` - Oculta el overlay
- `showSuccessState()` - Muestra el estado de éxito y auto-cierra en 2s (configurable)

### 4. LoadingScreen
Pantalla de carga centralizada que usa CustomLoader. Ideal para carga inicial de páginas.

```tsx
import LoadingScreen from '@components/common/LoadingScreen';

// Normal (centrado en contenedor)
<LoadingScreen message="Cargando datos..." />

// Full screen (overlay)
<LoadingScreen message="Cargando..." fullScreen />
```

**Props**:
```typescript
interface LoadingScreenProps {
  message?: string;
  fullScreen?: boolean;
  className?: string;
}
```

**Uso en páginas**:
```tsx
function MyPage() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData().finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <LoadingScreen message="Cargando página..." />;
  }

  return <div>Contenido...</div>;
}
```

### 5. CustomLoader
Loader personalizado con animación de bolas. Usado internamente por LoadingScreen.

```tsx
import CustomLoader from '@components/common/CustomLoader';

<CustomLoader />
```

**Características**:
- Animación única con 2 bolas que rotan
- Adapta colores al tema (light/dark)
- Usa variables CSS de Tailwind (--primary)
- Animación suave y fluida

## 🎯 Cuándo usar cada componente

### LoadingSpinner
✅ **Usar cuando**:
- Necesitas un indicador inline
- Estás en un botón con estado de carga
- Quieres un spinner pequeño y discreto
- El usuario puede seguir interactuando con otras partes de la UI

❌ **No usar cuando**:
- Necesitas bloquear toda la UI
- La operación es crítica y no se debe interrumpir

### LoadingOverlay
✅ **Usar cuando**:
- Necesitas bloquear la UI durante una operación
- La operación toma más de 2 segundos
- Quieres mostrar un mensaje descriptivo
- Necesitas mostrar un estado de éxito
- Estás en móvil y quieres una experiencia optimizada

❌ **No usar cuando**:
- La operación es instantánea (< 500ms)
- El usuario necesita ver el contenido debajo
- Estás en un botón (usa LoadingSpinner)

### LoadingScreen
✅ **Usar cuando**:
- Cargas inicial de una página/vista
- Necesitas un loader full-screen
- Quieres el diseño consistente de la app

❌ **No usar cuando**:
- Solo cargas una parte pequeña de la UI
- El usuario ya está viendo contenido

### CustomLoader
✅ **Usar cuando**:
- Quieres el diseño específico de la app
- Necesitas un loader único y distintivo
- Usas LoadingScreen (ya lo incluye)

❌ **No usar cuando**:
- Necesitas variantes (usa LoadingSpinner)
- Quieres un diseño estándar

## 🎨 Variantes Recomendadas

### Para la mayoría de casos
```tsx
<LoadingSpinner variant="dots3" size="md" />
```
**Por qué**: Suave, iOS style, no distrae

### Para botones
```tsx
<Button loading spinnerVariant="dots3">Guardar</Button>
```
**Por qué**: Compacto, se ve bien en texto

### Para overlays
```tsx
<LoadingOverlay variant="dots3" message="Procesando..." />
```
**Por qué**: Consistente con el resto de la app

### Para spinners circulares tradicionales
```tsx
<LoadingSpinner variant="simple" size="lg" />
```
**Por qué**: Familiar, universal

## 💡 Mejores Prácticas

### Mensajes Descriptivos
```tsx
// ❌ Malo
<LoadingOverlay message="Cargando..." />

// ✅ Bueno
<LoadingOverlay
  message="Guardando cambios..."
  submessage="Esto puede tomar unos segundos"
/>
```

### Estados de Éxito
```tsx
// Muestra confirmación visual
const handleSave = async () => {
  setLoading(true);
  try {
    await api.save();
    setShowSuccess(true);
    setTimeout(() => {
      setLoading(false);
      // Usuario ve el checkmark antes de continuar
    }, 2000);
  } catch (error) {
    setLoading(false);
  }
};
```

### Usando el Hook
```tsx
// ✅ Más limpio y fácil de mantener
const { showLoading, showSuccessState } = useLoadingOverlay();

const handleAction = async () => {
  showLoading('Procesando...');
  try {
    await api.action();
    showSuccessState('¡Listo!'); // Auto-cierra en 2s
  } catch (error) {
    hideLoading();
  }
};
```

### Performance
```tsx
// ✅ Solo en móvil si no necesitas en desktop
<LoadingOverlay mobileOnly={true} />

// ✅ Cierra automáticamente con el hook
showSuccessState('¡Éxito!', 'Completado', 1500); // Auto-cierra en 1.5s
```

### UX Tips
- Siempre proporciona feedback visual durante operaciones largas
- Usa estado de éxito para confirmar operaciones importantes
- Evita múltiples spinners simultáneos en la misma pantalla
- En móvil, LoadingOverlay es más amigable que un spinner pequeño
- Para cargas progresivas, considera skeleton loaders

## 🔧 Personalización

### Colores
Los spinners heredan el color del texto (usando `currentColor`):

```tsx
<div className="text-primary">
  <LoadingSpinner variant="dots3" />
</div>

<div className="text-green-500">
  <LoadingSpinner variant="material" />
</div>
```

### Tamaños Personalizados
```tsx
<div className="scale-150">
  <LoadingSpinner variant="dots" />
</div>
```

### Animaciones
Todas las animaciones están definidas en Tailwind config:
- `animate-ios-bounce` - Dots variant 1
- `animate-ios-bounce-v2` - Dots variant 2
- `animate-ios-bounce-v3` - Dots variant 3
- `animate-spin` - Spinners circulares
- `animate-pulse` - Pulse variant

## 📖 Ver Ejemplos Completos

Para ver todos los ejemplos interactivos:
1. Ejecuta la aplicación: `npm run dev`
2. Ve a `/documentacion`
3. Selecciona la sección "Loading States"

Encontrarás:
- Todas las variantes de LoadingSpinner
- Demos interactivas de LoadingOverlay
- Uso del hook useLoadingOverlay
- LoadingScreen en diferentes modos
- CustomLoader visual
- Código de ejemplo completo
- Mejores prácticas detalladas

## 🔗 Referencias

- **CLAUDE.md**: Sección "Componentes Comunes"
- **LoadingExamples.tsx**: Ejemplos completos e interactivos
- **Tailwind Animations**: https://tailwindcss.com/docs/animation
