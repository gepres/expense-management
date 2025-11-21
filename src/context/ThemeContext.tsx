/**
 * Context para manejo de tema (modo oscuro/claro)
 */

import { createContext, useContext, useState, useEffect } from 'react';
import type { TemaApp } from '@app-types';

// ============================================================================
// Tipos
// ============================================================================

interface ThemeContextType {
  tema: TemaApp;
  temaEfectivo: 'light' | 'dark';
  setTema: (tema: TemaApp) => void;
  toggleTema: () => void;
  toastInvertido: boolean;
  setToastInvertido: (invertido: boolean) => void;
  // Aliases en inglés para compatibilidad
  theme: TemaApp;
  effectiveTheme: 'light' | 'dark';
  setTheme: (tema: TemaApp) => void;
  toggleTheme: () => void;
  toastInverted: boolean;
  setToastInverted: (invertido: boolean) => void;
}

// ============================================================================
// Context
// ============================================================================

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// ============================================================================
// Provider
// ============================================================================

interface ThemeProviderProps {
  children: React.ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [tema, setTemaState] = useState<TemaApp>(() => {
    // Obtener tema guardado en localStorage
    const temaGuardado = localStorage.getItem('tema-app') as TemaApp;
    return temaGuardado || 'system';
  });

  const [temaEfectivo, setTemaEfectivo] = useState<'light' | 'dark'>('light');
  
  const [toastInvertido, setToastInvertidoState] = useState<boolean>(() => {
    // Obtener preferencia guardada en localStorage
    const preferencia = localStorage.getItem('toast-invertido');
    return preferencia === 'true';
  });

  // Detectar preferencia del sistema
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const actualizarTemaEfectivo = (): void => {
      if (tema === 'system') {
        setTemaEfectivo(mediaQuery.matches ? 'dark' : 'light');
      } else {
        setTemaEfectivo(tema as 'light' | 'dark');
      }
    };

    actualizarTemaEfectivo();

    // Escuchar cambios en la preferencia del sistema
    const listener = (e: MediaQueryListEvent): void => {
      if (tema === 'system') {
        setTemaEfectivo(e.matches ? 'dark' : 'light');
      }
    };

    mediaQuery.addEventListener('change', listener);
    return () => mediaQuery.removeEventListener('change', listener);
  }, [tema]);

  // Aplicar clase al documento
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(temaEfectivo);
  }, [temaEfectivo]);

  /**
   * Establecer tema
   */
  const setTema = (nuevoTema: TemaApp): void => {
    setTemaState(nuevoTema);
    localStorage.setItem('tema-app', nuevoTema);

    // Actualizar tema efectivo inmediatamente
    if (nuevoTema === 'light' || nuevoTema === 'dark') {
      setTemaEfectivo(nuevoTema);
    } else {
      const preferenciaSistema = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setTemaEfectivo(preferenciaSistema ? 'dark' : 'light');
    }
  };

  /**
   * Alternar entre modo claro y oscuro
   */
  const toggleTema = (): void => {
    const nuevoTema = temaEfectivo === 'light' ? 'dark' : 'light';
    setTema(nuevoTema);
  };

  /**
   * Establecer inversión de toast
   */
  const setToastInvertido = (invertido: boolean): void => {
    setToastInvertidoState(invertido);
    localStorage.setItem('toast-invertido', String(invertido));
  };

  const value: ThemeContextType = {
    tema,
    temaEfectivo,
    setTema,
    toggleTema,
    toastInvertido,
    setToastInvertido,
    // Aliases en inglés para compatibilidad
    theme: tema,
    effectiveTheme: temaEfectivo,
    setTheme: setTema,
    toggleTheme: toggleTema,
    toastInverted: toastInvertido,
    setToastInverted: setToastInvertido,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

// ============================================================================
// Hook personalizado
// ============================================================================

export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme debe ser usado dentro de un ThemeProvider');
  }
  return context;
}

export default ThemeContext;
