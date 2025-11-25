# useBreakpoints & useMediaQuery - Documentación

Hooks personalizados para detectar breakpoints y media queries en React.

## 📦 Hooks Disponibles

### 1. `useMediaQuery(query: string)`
Hook base para detectar cualquier media query.

### 2. `useBreakpoints()`
Hook completo que detecta todos los breakpoints de Tailwind CSS.

### 3. `useIsMobile()`
Hook simplificado que solo detecta móvil.

### 4. `useIsTablet()`
Hook simplificado que solo detecta tablet.

### 5. `useIsDesktop()`
Hook simplificado que solo detecta desktop.

### 6. `useWindowSize()`
Hook que retorna el tamaño actual de la ventana.

## 🚀 Uso Básico

### useBreakpoints (Recomendado)

```tsx
import { useBreakpoints } from '@hooks/useBreakpoints';

function MyComponent() {
  const breakpoints = useBreakpoints();

  return (
    <div>
      {/* Renderizado condicional por breakpoint */}
      {breakpoints.isMobile && <MobileView />}
      {breakpoints.isTablet && <TabletView />}
      {breakpoints.isDesktop && <DesktopView />}

      {/* Mostrar breakpoint actual */}
      <p>Breakpoint activo: {breakpoints.active}</p>

      {/* Tailwind breakpoints específicos */}
      {breakpoints.isXs && <p>Extra Small (< 640px)</p>}
      {breakpoints.isSm && <p>Small (640px - 768px)</p>}
      {breakpoints.isMd && <p>Medium (768px - 1024px)</p>}
      {breakpoints.isLg && <p>Large (1024px - 1280px)</p>}
      {breakpoints.isXl && <p>Extra Large (1280px - 1536px)</p>}
      {breakpoints.is2xl && <p>2X Large (>= 1536px)</p>}
    </div>
  );
}
```

### useMediaQuery (Personalizado)

```tsx
import { useMediaQuery } from '@hooks/useMediaQuery';

function CustomBreakpoint() {
  const isPortrait = useMediaQuery('(orientation: portrait)');
  const isDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
  const isPrint = useMediaQuery('print');
  const isHighRes = useMediaQuery('(min-resolution: 2dppx)');

  return (
    <div>
      <p>Orientación vertical: {isPortrait ? 'Sí' : 'No'}</p>
      <p>Modo oscuro preferido: {isDarkMode ? 'Sí' : 'No'}</p>
      <p>Modo impresión: {isPrint ? 'Sí' : 'No'}</p>
      <p>Pantalla retina: {isHighRes ? 'Sí' : 'No'}</p>
    </div>
  );
}
```

### Hooks Simplificados

```tsx
import { useIsMobile, useIsTablet, useIsDesktop } from '@hooks/useBreakpoints';

function Navigation() {
  const isMobile = useIsMobile();
  const isTablet = useIsTablet();
  const isDesktop = useIsDesktop();

  if (isMobile) {
    return <MobileNav />;
  }

  if (isTablet) {
    return <TabletNav />;
  }

  return <DesktopNav />;
}
```

### useWindowSize

```tsx
import { useWindowSize } from '@hooks/useBreakpoints';

function WindowInfo() {
  const { width, height } = useWindowSize();

  return (
    <div>
      <p>Ancho: {width}px</p>
      <p>Alto: {height}px</p>
      <p>Área: {width * height}px²</p>
    </div>
  );
}
```

## 📊 Breakpoints de Tailwind CSS

| Breakpoint | Rango | Descripción |
|------------|-------|-------------|
| `xs` | < 640px | Extra Small (móviles) |
| `sm` | 640px - 767px | Small (móviles grandes) |
| `md` | 768px - 1023px | Medium (tablets) |
| `lg` | 1024px - 1279px | Large (laptops) |
| `xl` | 1280px - 1535px | Extra Large (desktops) |
| `2xl` | >= 1536px | 2X Large (pantallas grandes) |

## 🎯 Casos de Uso

### 1. Navegación Responsive

```tsx
import { useBreakpoints } from '@hooks/useBreakpoints';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';

function Header() {
  const { isMobile } = useBreakpoints();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header>
      {isMobile ? (
        <>
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X /> : <Menu />}
          </button>
          {mobileMenuOpen && <MobileMenu />}
        </>
      ) : (
        <DesktopMenu />
      )}
    </header>
  );
}
```

### 2. Layout Adaptativo

```tsx
import { useBreakpoints } from '@hooks/useBreakpoints';

function Dashboard() {
  const { isDesktop, isTablet, isMobile } = useBreakpoints();

  const columns = isDesktop ? 3 : isTablet ? 2 : 1;

  return (
    <div style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
      <Card />
      <Card />
      <Card />
    </div>
  );
}
```

### 3. Modal Comportamiento por Dispositivo

```tsx
import { useBreakpoints } from '@hooks/useBreakpoints';

function Modal({ isOpen, onClose, children }) {
  const { isMobile } = useBreakpoints();

  return (
    <div className={isMobile ? 'modal-mobile' : 'modal-desktop'}>
      {children}
    </div>
  );
}
```

### 4. Cambiar Componentes por Breakpoint

```tsx
import { useBreakpoints } from '@hooks/useBreakpoints';

function DataTable({ data }) {
  const { active } = useBreakpoints();

  const renderMap = {
    xs: () => <MobileCards data={data} />,
    sm: () => <MobileCards data={data} />,
    md: () => <CompactTable data={data} />,
    lg: () => <FullTable data={data} />,
    xl: () => <FullTable data={data} />,
    '2xl': () => <FullTable data={data} />
  };

  return renderMap[active]();
}
```

### 5. Cargar Imágenes Responsive

```tsx
import { useBreakpoints } from '@hooks/useBreakpoints';

function HeroImage() {
  const { isXs, isSm, isMd, isLg } = useBreakpoints();

  const imageSrc = isXs || isSm
    ? '/images/hero-mobile.jpg'
    : isMd
    ? '/images/hero-tablet.jpg'
    : '/images/hero-desktop.jpg';

  return <img src={imageSrc} alt="Hero" />;
}
```

### 6. Sidebar Collapsible

```tsx
import { useBreakpoints } from '@hooks/useBreakpoints';
import { useState } from 'react';

function Layout() {
  const { isMobile, isTablet } = useBreakpoints();
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);

  // Auto-cerrar sidebar en móvil
  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  }, [isMobile]);

  return (
    <div>
      {(sidebarOpen || !isMobile) && <Sidebar />}
      <Main />
    </div>
  );
}
```

### 7. Detectar Orientación

```tsx
import { useMediaQuery } from '@hooks/useMediaQuery';

function OrientationAlert() {
  const isPortrait = useMediaQuery('(orientation: portrait)');

  if (isPortrait) {
    return (
      <div className="alert">
        Por favor, gira tu dispositivo para una mejor experiencia
      </div>
    );
  }

  return <GameView />;
}
```

### 8. Touch vs Mouse

```tsx
import { isTouchDevice } from '@hooks/useBreakpoints';

function InteractiveElement() {
  const isTouch = isTouchDevice();

  return (
    <button
      onMouseEnter={!isTouch ? handleHover : undefined}
      onTouchStart={isTouch ? handleTouch : undefined}
    >
      Interactuar
    </button>
  );
}
```

## 🔍 Detección de Dispositivos

### Funciones de Utilidad

```tsx
import {
  deviceMobile,
  deviceTablet,
  deviceMobileAndTablet,
  deviceDesktop,
  isTouchDevice
} from '@hooks/useBreakpoints';

// Detectar tipo de dispositivo por User Agent
const isMobileDevice = deviceMobile();      // iPhone, Android, etc.
const isTabletDevice = deviceTablet();      // iPad, Android Tablet, etc.
const isMobileOrTablet = deviceMobileAndTablet();
const isDesktopDevice = deviceDesktop();
const hasTouchScreen = isTouchDevice();     // Detecta capacidad táctil
```

## 📏 Interfaz BreakpointsReturn

```typescript
interface BreakpointsReturn {
  // Breakpoints Tailwind CSS
  isXs: boolean;      // < 640px
  isSm: boolean;      // 640px - 768px
  isMd: boolean;      // 768px - 1024px
  isLg: boolean;      // 1024px - 1280px
  isXl: boolean;      // 1280px - 1536px
  is2xl: boolean;     // >= 1536px

  // Categorías
  isMobile: boolean;          // <= 640px
  isTablet: boolean;          // 641px - 1024px
  isMobileAndTablet: boolean; // <= 1024px
  isDesktop: boolean;         // > 1024px

  // Breakpoint activo
  active: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
}
```

## ⚡ Performance

Los hooks usan `window.matchMedia()` que es nativo y muy eficiente:
- ✅ No hay polling
- ✅ Eventos nativos del navegador
- ✅ Actualización instantánea al cambiar tamaño
- ✅ Limpieza automática de listeners
- ✅ SSR-safe (verifica `window`)

## 🎨 Integración con Tailwind

Los breakpoints coinciden exactamente con Tailwind CSS:

```tsx
// En JSX con clases Tailwind
<div className="hidden sm:block md:hidden">
  Solo visible en sm
</div>

// Equivalente con hook
function MyComponent() {
  const { isSm } = useBreakpoints();

  if (!isSm) return null;

  return <div>Solo visible en sm</div>;
}
```

## 🔧 Tips

1. **Usa hooks simplificados cuando sea posible:**
   ```tsx
   // ✅ Más simple
   const isMobile = useIsMobile();

   // ❌ Más complejo
   const { isMobile } = useBreakpoints();
   ```

2. **Evita múltiples instancias del mismo hook:**
   ```tsx
   // ❌ Evitar
   function Parent() {
     const { isMobile } = useBreakpoints();
     return <Child />;
   }

   function Child() {
     const { isMobile } = useBreakpoints(); // Duplicado
   }

   // ✅ Mejor: Pasar como prop
   function Parent() {
     const { isMobile } = useBreakpoints();
     return <Child isMobile={isMobile} />;
   }
   ```

3. **Para detección de dispositivo permanente, usa las funciones:**
   ```tsx
   // Si solo necesitas detectar una vez (no reactivo)
   const isMobile = deviceMobile();

   // Si necesitas detectar cambios de ventana (reactivo)
   const isMobile = useIsMobile();
   ```

## 🐛 Troubleshooting

**El hook no se actualiza al cambiar tamaño:**
- Verifica que estés usando el hook correctamente
- Asegúrate de no estar memorizando el valor

**Detección de dispositivo incorrecta:**
- User Agent puede ser engañoso
- Usa media queries para decisiones de UI
- User Agent solo como fallback

**Problemas con SSR:**
- Los hooks verifican `typeof window`
- Valores por defecto son `false` en servidor

## 📚 Referencias

- [MDN - Window.matchMedia()](https://developer.mozilla.org/en-US/docs/Web/API/Window/matchMedia)
- [Tailwind CSS Breakpoints](https://tailwindcss.com/docs/responsive-design)
- [CSS Media Queries](https://developer.mozilla.org/en-US/docs/Web/CSS/Media_Queries)

---

**Última actualización**: 2025-11-25
**Versión**: 1.0.0
