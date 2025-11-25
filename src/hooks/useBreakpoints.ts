/**
 * Hook para detectar breakpoints de Tailwind CSS
 * Proporciona información sobre el tamaño de pantalla actual
 */

import { useState, useEffect } from 'react';
import { useMediaQuery, deviceDesktop, deviceMobile, deviceMobileAndTablet, deviceTablet } from './useMediaQuery';

export type Breakpoint = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

export interface BreakpointsReturn {
  // Breakpoints individuales (Tailwind CSS)
  isXs: boolean;      // < 640px
  isSm: boolean;      // 640px - 768px
  isMd: boolean;      // 768px - 1024px
  isLg: boolean;      // 1024px - 1280px
  isXl: boolean;      // 1280px - 1536px
  is2xl: boolean;     // >= 1536px

  // Categorías de dispositivos
  isMobile: boolean;          // <= 640px
  isTablet: boolean;          // 641px - 1024px
  isMobileAndTablet: boolean; // <= 1024px
  isDesktop: boolean;         // > 1024px

  // Breakpoint activo
  active: Breakpoint;
}

/**
 * Hook para obtener información sobre breakpoints
 * Sigue los breakpoints estándar de Tailwind CSS
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const breakpoints = useBreakpoints();
 *
 *   if (breakpoints.isMobile) {
 *     return <MobileView />;
 *   }
 *
 *   return <DesktopView />;
 * }
 * ```
 */
export function useBreakpoints(): BreakpointsReturn {
  const breakpoints: BreakpointsReturn = {
    // Tailwind CSS breakpoints
    isXs: useMediaQuery('(max-width: 639px)'),
    isSm: useMediaQuery('(min-width: 640px) and (max-width: 767px)'),
    isMd: useMediaQuery('(min-width: 768px) and (max-width: 1023px)'),
    isLg: useMediaQuery('(min-width: 1024px) and (max-width: 1279px)'),
    isXl: useMediaQuery('(min-width: 1280px) and (max-width: 1535px)'),
    is2xl: useMediaQuery('(min-width: 1536px)'),

    // Categorías de dispositivos con fallback a user agent
    isMobile: useMediaQuery('(max-width: 640px)') || deviceMobile(),
    isTablet: useMediaQuery('(min-width: 641px) and (max-width: 1024px)') || deviceTablet(),
    isMobileAndTablet: useMediaQuery('(max-width: 1024px)') || deviceMobileAndTablet(),
    isDesktop: deviceDesktop(),

    active: 'xs',
  };

  // Determinar el breakpoint activo
  if (breakpoints.isXs) breakpoints.active = 'xs';
  if (breakpoints.isSm) breakpoints.active = 'sm';
  if (breakpoints.isMd) breakpoints.active = 'md';
  if (breakpoints.isLg) breakpoints.active = 'lg';
  if (breakpoints.isXl) breakpoints.active = 'xl';
  if (breakpoints.is2xl) breakpoints.active = '2xl';

  return breakpoints;
}

/**
 * Hook simplificado que solo devuelve si es móvil
 */
export function useIsMobile(): boolean {
  return useMediaQuery('(max-width: 640px)') || deviceMobile();
}

/**
 * Hook simplificado que solo devuelve si es tablet
 */
export function useIsTablet(): boolean {
  return useMediaQuery('(min-width: 641px) and (max-width: 1024px)') || deviceTablet();
}

/**
 * Hook simplificado que solo devuelve si es desktop
 */
export function useIsDesktop(): boolean {
  return useMediaQuery('(min-width: 1025px)');
}

/**
 * Hook que devuelve el tamaño de ventana
 */
export function useWindowSize() {
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return windowSize;
}

// Re-exportar funciones de detección de dispositivos
export { deviceMobile, deviceTablet, deviceMobileAndTablet, deviceDesktop, isTouchDevice } from './useMediaQuery';
