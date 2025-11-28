# 📚 Documentación de Componentes

## Acceso a la Documentación

La aplicación ahora incluye una **página de documentación interactiva** con ejemplos de uso de todos los componentes reutilizables.

### 🌐 Cómo Acceder

1. **Inicia la aplicación**: `npm run dev`
2. **Inicia sesión** en la aplicación
3. **Navega a**: `http://localhost:5173/documentacion`

O agrega un enlace en el menú de navegación.

---

## 📦 Componentes Documentados

### 1. **Button Component** ✅

Componente de botón ultra-completo con:

- ✅ **6 Variantes**: primary, secondary, destructive, ghost, success, outline
- ✅ **5 Tamaños**: xs, sm, md, lg, xl
- ✅ **Estados**: loading, disabled, active
- ✅ **Tipos Especiales**: icon-only, pill, floating (FAB), full-width
- ✅ **Iconos**: Soporte completo para lucide-react
- ✅ **Spinners**: 5 variantes de loading

**Componentes auxiliares:**
- `ButtonGroup` - Agrupa botones con espaciado consistente
- `IconButton` - Atajo para botones solo con icono
- `FloatingActionButton` - FAB para acciones principales
- `PillButton` - Botones tipo píldora para categorías
- `LoadingButton` - Botón con loading simplificado

**Ejemplo básico:**
```tsx
import Button from '@components/common/Button';
import { Save } from 'lucide-react';

<Button variant="primary" icon={Save} loading={isLoading}>
  Guardar
</Button>
```

---

### 2. **Modal Component** ✅

Modal con estilo iOS y animaciones suaves:

- ✅ **iOS Style**: Diseño nativo de iOS
- ✅ **Swipe to Close**: Deslizar para cerrar en móvil
- ✅ **Backdrop Blur**: Efecto glassmorphism
- ✅ **Responsive**: Bottom sheet (móvil) / Centered (desktop)
- ✅ **Tamaños**: sm, md, lg, xl, full
- ✅ **Gestos**: Soporte para touch gestures

**Componentes auxiliares:**
- `ModalButton` - Botones prediseñados para footer
- `ModalFooterActions` - Footer con dos botones (cancelar/confirmar)

**Ejemplo básico:**
```tsx
import Modal, { ModalFooterActions } from '@components/common/Modal';

<Modal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  title="Confirmar Acción"
  footer={
    <ModalFooterActions
      onCancel={() => setIsOpen(false)}
      onConfirm={handleConfirm}
      confirmVariant="destructive"
    />
  }
>
  <p>¿Estás seguro de continuar?</p>
</Modal>
```

---

### 3. **LoadingSpinner Component** ✅

Spinners de carga con múltiples variantes:

- ✅ **5 Variantes**: simple, dots, dots2, dots3, material
- ✅ **3 Tamaños**: sm, md, lg
- ✅ **LoadingOverlay**: Overlay móvil con glassmorphism
- ✅ **Success State**: Checkmark animado
- ✅ **Auto-close**: Cierre automático configurable

**Componentes incluidos:**
- `LoadingSpinner` - Spinner básico
- `LoadingOverlay` - Overlay de pantalla completa
- `useLoadingOverlay` - Hook para controlar el overlay

**Ejemplo básico:**
```tsx
import LoadingSpinner, { LoadingOverlay, useLoadingOverlay } from '@components/common/LoadingSpinner';

const loading = useLoadingOverlay();

// Mostrar loading
loading.showLoading('Guardando...', 'Por favor espera');

// Mostrar éxito
loading.showSuccessState('¡Guardado!', 'Operación exitosa', 2000);

// En el JSX
<LoadingOverlay
  isOpen={loading.isLoading}
  message={loading.loadingMessage}
  success={loading.showSuccess}
/>
```

---

### 4. **LoadingScreen Component** ✅

Pantalla de carga centralizada:

- ✅ **Spinner**: CustomLoader integrado
- ✅ **Mensaje**: Personalizable
- ✅ **Full Screen**: Opción de pantalla completa
- ✅ **Min Height**: Altura mínima para contenedores

**Ejemplo básico:**
```tsx
import LoadingScreen from '@components/common/LoadingScreen';

<LoadingScreen message="Cargando categorías..." />
```

---

## 📋 Estructura de Archivos

```
src/
├── components/
│   └── common/
│       ├── Button.tsx              ✅ Componente Button completo
│       ├── Modal.tsx               ✅ Componente Modal iOS style
│       ├── LoadingSpinner.tsx      ✅ Spinners y overlay
│       ├── LoadingScreen.tsx       ✅ Pantalla de carga
│       ├── ConfirmationModal.tsx   ✅ Modal de confirmación
│       └── EditNameModal.tsx       ✅ Modal de edición
│
├── pages/
│   ├── Documentacion.tsx           ✅ Página principal de docs
│   └── ModalExamples.tsx           ✅ Ejemplos de Modal
│
└── button-examples.tsx             ✅ Ejemplos de Button
```

---

## 🎨 Demos HTML Standalone

Además de la documentación en la app, hay demos HTML que puedes abrir directamente en el navegador:

### `button-demo.html`
Demo interactivo del componente Button con:
- Todas las variantes y tamaños
- Estados (loading, disabled, active)
- Icon-only buttons
- Pill buttons
- FAB examples
- Modo claro/oscuro

### `loading-overlay-demo.html`
Demo del LoadingOverlay con:
- 3 variantes de spinner
- Estados de éxito
- Diferentes duraciones
- Cierre opcional
- Modo claro/oscuro

### `loading-buttons-demo.html`
Demo de diferentes estilos de loading en botones con:
- 10+ estilos de spinners
- Múltiples contextos
- Recomendaciones de uso
- Código de ejemplo React

---

## 🚀 Uso Rápido

### Button
```tsx
import Button from '@components/common/Button';

// Básico
<Button>Texto</Button>

// Con variante y tamaño
<Button variant="primary" size="lg">Grande</Button>

// Con icono
<Button icon={Plus} iconPosition="left">Agregar</Button>

// Loading
<Button loading loadingText="Guardando...">Guardar</Button>

// Icon only
<Button icon={Edit2} iconOnly aria-label="Editar" />

// Pill (categorías)
<PillButton selected={isSelected}>Categoría</PillButton>

// FAB
<FloatingActionButton icon={Plus} position="bottom-right" />
```

### Modal
```tsx
import Modal, { ModalButton } from '@components/common/Modal';

<Modal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  title="Título"
  size="md"
  footer={
    <div className="flex gap-3">
      <ModalButton variant="secondary" onClick={onCancel}>
        Cancelar
      </ModalButton>
      <ModalButton variant="primary" onClick={onConfirm}>
        Confirmar
      </ModalButton>
    </div>
  }
>
  <p>Contenido del modal</p>
</Modal>
```

### LoadingOverlay
```tsx
import { LoadingOverlay, useLoadingOverlay } from '@components/common/LoadingSpinner';

const loading = useLoadingOverlay();

// Mostrar
loading.showLoading('Mensaje', 'Submensaje');

// Éxito
loading.showSuccessState('¡Éxito!', 'Detalles', 2000);

// Ocultar
loading.hideLoading();

// JSX
<LoadingOverlay
  isOpen={loading.isLoading}
  variant="dots3"
  message={loading.loadingMessage}
  success={loading.showSuccess}
/>
```

---

## 💡 Mejores Prácticas

### Button
- ✅ Usa `variant="primary"` para acciones principales
- ✅ Usa `variant="destructive"` para acciones peligrosas
- ✅ Siempre proporciona `aria-label` en `IconButton`
- ✅ Usa `loading` en operaciones async
- ✅ Usa `PillButton` para categorías seleccionables

### Modal
- ✅ Usa `size="sm"` para confirmaciones
- ✅ Usa `ModalFooterActions` para acciones estándar
- ✅ Siempre proporciona `title` descriptivo
- ✅ Usa `closeOnBackdrop={false}` para operaciones críticas

### Loading
- ✅ Usa `LoadingOverlay` solo en móvil para operaciones largas
- ✅ Usa `LoadingScreen` para páginas completas
- ✅ Usa `loading` en Button para feedback inline
- ✅ Muestra `showSuccessState` para confirmar acciones importantes

---

## 📖 Recursos Adicionales

### Archivos de Referencia
- `Button.tsx` - Implementación completa del componente
- `button-examples.tsx` - 12 ejemplos de uso
- `Modal.tsx` - Implementación con gestos y animaciones
- `ModalExamples.tsx` - 6 ejemplos interactivos
- `LoadingSpinner.tsx` - Spinners y overlay

### Demos HTML
- `button-demo.html` - Visualización interactiva de Button
- `loading-overlay-demo.html` - Demo de LoadingOverlay
- `loading-buttons-demo.html` - Estilos de loading

---

## 🔗 Enlaces Rápidos

- **Documentación Web**: `/documentacion` (cuando la app está corriendo)
- **Button Demo**: Abre `button-demo.html` en tu navegador
- **Loading Demo**: Abre `loading-overlay-demo.html` en tu navegador
- **CLAUDE.md**: Documentación técnica completa del proyecto

---

**Última actualización**: 2025-11-27
**Versión**: 1.0.0
