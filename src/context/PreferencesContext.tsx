/**
 * PreferencesContext - Manejo de preferencias de usuario
 * Incluye configuraciones avanzadas como autoguardado
 */

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { useAuth } from './AuthContext';

// ============================================================================
// TIPOS
// ============================================================================

export interface UserPreferences {
  // Autoguardado
  autoSaveAfterVoice: boolean;
  autoSaveAfterReceipt: boolean;
  
  // Futuras preferencias
  // confirmBeforeSave?: boolean;
  // defaultCurrency?: string;
  // etc.
}

interface PreferencesContextType {
  preferences: UserPreferences;
  updatePreference: <K extends keyof UserPreferences>(
    key: K,
    value: UserPreferences[K]
  ) => void;
  resetPreferences: () => void;
  isLoading: boolean;
}

// ============================================================================
// VALORES POR DEFECTO
// ============================================================================

const DEFAULT_PREFERENCES: UserPreferences = {
  autoSaveAfterVoice: false,
  autoSaveAfterReceipt: false,
};

const STORAGE_KEY = 'user_preferences';

// ============================================================================
// CONTEXT
// ============================================================================

const PreferencesContext = createContext<PreferencesContextType | undefined>(undefined);

// ============================================================================
// PROVIDER
// ============================================================================

interface PreferencesProviderProps {
  children: ReactNode;
}

export function PreferencesProvider({ children }: PreferencesProviderProps) {
  const { usuario } = useAuth();
  const [preferences, setPreferences] = useState<UserPreferences>(DEFAULT_PREFERENCES);
  const [isLoading, setIsLoading] = useState(true);

  // Cargar preferencias desde localStorage cuando el usuario se autentica
  useEffect(() => {
    if (usuario) {
      try {
        const storageKey = `${STORAGE_KEY}_${usuario.id}`;
        const stored = localStorage.getItem(storageKey);
        
        if (stored) {
          const parsed = JSON.parse(stored);
          setPreferences({ ...DEFAULT_PREFERENCES, ...parsed });
        } else {
          setPreferences(DEFAULT_PREFERENCES);
        }
      } catch (error) {
        console.error('[PreferencesContext] Error loading preferences:', error);
        setPreferences(DEFAULT_PREFERENCES);
      } finally {
        setIsLoading(false);
      }
    } else {
      setPreferences(DEFAULT_PREFERENCES);
      setIsLoading(false);
    }
  }, [usuario]);

  // Guardar preferencias en localStorage cuando cambian
  useEffect(() => {
    if (usuario && !isLoading) {
      try {
        const storageKey = `${STORAGE_KEY}_${usuario.id}`;
        localStorage.setItem(storageKey, JSON.stringify(preferences));
      } catch (error) {
        console.error('[PreferencesContext] Error saving preferences:', error);
      }
    }
  }, [preferences, usuario, isLoading]);

  // Actualizar una preferencia específica
  const updatePreference = <K extends keyof UserPreferences>(
    key: K,
    value: UserPreferences[K]
  ) => {
    setPreferences(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  // Resetear a valores por defecto
  const resetPreferences = () => {
    setPreferences(DEFAULT_PREFERENCES);
  };

  const value: PreferencesContextType = {
    preferences,
    updatePreference,
    resetPreferences,
    isLoading,
  };

  return (
    <PreferencesContext.Provider value={value}>
      {children}
    </PreferencesContext.Provider>
  );
}

// ============================================================================
// HOOK
// ============================================================================

export function usePreferences() {
  const context = useContext(PreferencesContext);
  if (!context) {
    throw new Error('usePreferences must be used within PreferencesProvider');
  }
  return context;
}
