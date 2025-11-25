/**
 * Hook para detectar media queries en JavaScript
 * Permite verificar breakpoints de forma reactiva
 */

import { useState, useEffect } from 'react';

/**
 * Hook principal para detectar media queries
 * @param query - Media query string (ej: "(max-width: 768px)")
 * @returns boolean indicando si el media query coincide
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState<boolean>(() => {
    // Check si estamos en el navegador
    if (typeof window === 'undefined') return false;

    return window.matchMedia(query).matches;
  });

  useEffect(() => {
    // Check si estamos en el navegador
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia(query);

    // Actualizar el estado inicial
    setMatches(mediaQuery.matches);

    // Handler para cambios
    const handler = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    // Agregar listener
    mediaQuery.addEventListener('change', handler);

    // Cleanup
    return () => {
      mediaQuery.removeEventListener('change', handler);
    };
  }, [query]);

  return matches;
}

/**
 * Detecta si el dispositivo es móvil mediante User Agent
 */
export function deviceMobile(): boolean {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    return false;
  }

  const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;

  return /android|webos|iphone|ipod|blackberry|iemobile|opera mini/i.test(
    userAgent.toLowerCase()
  );
}

/**
 * Detecta si el dispositivo es tablet mediante User Agent
 */
export function deviceTablet(): boolean {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    return false;
  }

  const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;

  return /ipad|android|tablet|playbook|silk/i.test(userAgent.toLowerCase()) &&
         !/mobile/i.test(userAgent.toLowerCase());
}

/**
 * Detecta si el dispositivo es móvil o tablet
 */
export function deviceMobileAndTablet(): boolean {
  return deviceMobile() || deviceTablet();
}

/**
 * Detecta si el dispositivo es desktop
 */
export function deviceDesktop(): boolean {
  if (typeof window === 'undefined') return false;

  return !deviceMobileAndTablet();
}

/**
 * Detecta si está en modo táctil
 */
export function isTouchDevice(): boolean {
  if (typeof window === 'undefined') return false;

  return (
    'ontouchstart' in window ||
    navigator.maxTouchPoints > 0 ||
    (navigator as any).msMaxTouchPoints > 0
  );
}
