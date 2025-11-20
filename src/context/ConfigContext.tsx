/**
 * ConfigContext - Manejo global de categorías, métodos de pago y monedas
 *
 * Carga los datos desde Firebase y los proporciona globalmente
 */

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { useAuth } from './AuthContext';
import {
  ConfigService,
  type Category,
  type PaymentMethod,
  type Currency,
  type Shortcut,
} from '@services/config';

// ============================================================================
// TIPOS
// ============================================================================

interface ConfigContextType {
  // Datos
  categories: Category[];
  paymentMethods: PaymentMethod[];
  currencies: Currency[];
  shortcuts: Shortcut[];

  // Estado de carga
  isLoading: boolean;
  error: string | null;

  // Helpers derivados
  getCategoryLabel: (id: string) => string;
  getCategoryColor: (id: string) => string;
  getCategoryIcon: (id: string) => string;
  getSubcategories: (categoryId: string) => string[];
  getPaymentMethodLabel: (id: string) => string;
  getCurrencySymbol: (code: string) => string;
  getCurrencyLabel: (code: string) => string;

  // Acciones
  reloadCategories: () => Promise<void>;
  reloadPaymentMethods: () => Promise<void>;
  reloadCurrencies: () => Promise<void>;
  reloadShortcuts: () => Promise<void>;
  reloadAll: () => Promise<void>;
}

// ============================================================================
// VALORES POR DEFECTO
// ============================================================================

const DEFAULT_CATEGORIES: Category[] = [
  { id: 'alimentacion', nombre: 'Alimentación', color: '#10b981', subcategorias: [] },
  { id: 'transporte', nombre: 'Transporte', color: '#3b82f6', subcategorias: [] },
  { id: 'entretenimiento', nombre: 'Entretenimiento', color: '#f59e0b', subcategorias: [] },
  { id: 'salud', nombre: 'Salud', color: '#ef4444', subcategorias: [] },
  { id: 'servicios', nombre: 'Servicios', color: '#8b5cf6', subcategorias: [] },
  { id: 'compras', nombre: 'Compras', color: '#ec4899', subcategorias: [] },
  { id: 'educacion', nombre: 'Educación', color: '#06b6d4', subcategorias: [] },
  { id: 'vivienda', nombre: 'Vivienda', color: '#f97316', subcategorias: [] },
  { id: 'otros', nombre: 'Otros', color: '#6b7280', subcategorias: [] },
];

const DEFAULT_PAYMENT_METHODS: PaymentMethod[] = [
  { id: 'efectivo', nombre: 'Efectivo' },
  { id: 'tarjeta_debito', nombre: 'Tarjeta de Débito' },
  { id: 'tarjeta_credito', nombre: 'Tarjeta de Crédito' },
  { id: 'transferencia', nombre: 'Transferencia' },
  { id: 'yape', nombre: 'Yape' },
  { id: 'plin', nombre: 'Plin' },
  { id: 'otros', nombre: 'Otros' },
];

const DEFAULT_CURRENCIES: Currency[] = [
  { id: 'PEN', codigoISO: 'PEN', simbolo: 'S/', nombre: 'Soles' },
  { id: 'USD', codigoISO: 'USD', simbolo: '$', nombre: 'Dólares' },
];

// ============================================================================
// CONTEXT
// ============================================================================

const ConfigContext = createContext<ConfigContextType | undefined>(undefined);

// ============================================================================
// PROVIDER
// ============================================================================

interface ConfigProviderProps {
  children: ReactNode;
}

export function ConfigProvider({ children }: ConfigProviderProps) {
  const { usuario } = useAuth();

  // Estado
  const [categories, setCategories] = useState<Category[]>(DEFAULT_CATEGORIES);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>(DEFAULT_PAYMENT_METHODS);
  const [currencies, setCurrencies] = useState<Currency[]>(DEFAULT_CURRENCIES);
  const [shortcuts, setShortcuts] = useState<Shortcut[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ============================================================================
  // FUNCIONES DE CARGA
  // ============================================================================

  const reloadCategories = useCallback(async () => {
    if (!usuario) return;

    try {
      const data = await ConfigService.getCategories();
      if (data && data.length > 0) {
        setCategories(data);
      } else {
        setCategories(DEFAULT_CATEGORIES);
      }
    } catch (err) {
      console.error('[ConfigContext] Error loading categories:', err);
      setCategories(DEFAULT_CATEGORIES);
    }
  }, [usuario]);

  const reloadPaymentMethods = useCallback(async () => {
    if (!usuario) return;

    try {
      const data = await ConfigService.getPaymentMethods();
      if (data && data.length > 0) {
        setPaymentMethods(data);
      } else {
        setPaymentMethods(DEFAULT_PAYMENT_METHODS);
      }
    } catch (err) {
      console.error('[ConfigContext] Error loading payment methods:', err);
      setPaymentMethods(DEFAULT_PAYMENT_METHODS);
    }
  }, [usuario]);

  const reloadCurrencies = useCallback(async () => {
    if (!usuario) return;

    try {
      const data = await ConfigService.getCurrencies();
      if (data && data.length > 0) {
        setCurrencies(data);
      } else {
        setCurrencies(DEFAULT_CURRENCIES);
      }
    } catch (err) {
      console.error('[ConfigContext] Error loading currencies:', err);
      setCurrencies(DEFAULT_CURRENCIES);
    }
  }, [usuario]);

  const reloadShortcuts = useCallback(async () => {
    if (!usuario) return;

    try {
      const data = await ConfigService.getShortcuts();
      setShortcuts(data || []);
    } catch (err) {
      console.error('[ConfigContext] Error loading shortcuts:', err);
      setShortcuts([]);
    }
  }, [usuario]);

  const reloadAll = useCallback(async () => {
    if (!usuario) return;

    setIsLoading(true);
    setError(null);

    try {
      await Promise.all([
        reloadCategories(),
        reloadPaymentMethods(),
        reloadCurrencies(),
        reloadShortcuts(),
      ]);
    } catch (err) {
      console.error('[ConfigContext] Error loading config:', err);
      setError('Error al cargar configuración');
    } finally {
      setIsLoading(false);
    }
  }, [usuario, reloadCategories, reloadPaymentMethods, reloadCurrencies, reloadShortcuts]);

  // Cargar datos cuando el usuario se autentica
  useEffect(() => {
    if (usuario) {
      reloadAll();
    } else {
      // Reset a valores por defecto cuando no hay usuario
      setCategories(DEFAULT_CATEGORIES);
      setPaymentMethods(DEFAULT_PAYMENT_METHODS);
      setCurrencies(DEFAULT_CURRENCIES);
      setShortcuts([]);
    }
  }, [usuario, reloadAll]);

  // ============================================================================
  // HELPERS
  // ============================================================================

  const getCategoryLabel = useCallback((id: string): string => {
    if (id === 'general') return 'Presupuesto General';
    const category = categories.find(c => c.id === id);
    return category?.nombre || id;
  }, [categories]);

  const getCategoryColor = useCallback((id: string): string => {
    if (id === 'general') return '#1e40af';
    const category = categories.find(c => c.id === id);
    return category?.color || '#6b7280';
  }, [categories]);

  const getCategoryIcon = useCallback((id: string): string => {
    const category = categories.find(c => c.id === id);
    return category?.icono || 'Package';
  }, [categories]);

  const getSubcategories = useCallback((categoryId: string): string[] => {
    const category = categories.find(c => c.id === categoryId);
    return category?.subcategorias?.map(s => s.nombre) || [];
  }, [categories]);

  const getPaymentMethodLabel = useCallback((id: string): string => {
    const method = paymentMethods.find(m => m.id === id);
    return method?.nombre || id;
  }, [paymentMethods]);

  const getCurrencySymbol = useCallback((code: string): string => {
    const currency = currencies.find(c => c.codigoISO === code || c.id === code);
    return currency?.simbolo || code;
  }, [currencies]);

  const getCurrencyLabel = useCallback((code: string): string => {
    const currency = currencies.find(c => c.codigoISO === code || c.id === code);
    return currency ? `${currency.nombre} (${currency.simbolo})` : code;
  }, [currencies]);

  // ============================================================================
  // VALOR DEL CONTEXTO
  // ============================================================================

  const value: ConfigContextType = {
    categories,
    paymentMethods,
    currencies,
    shortcuts,
    isLoading,
    error,
    getCategoryLabel,
    getCategoryColor,
    getCategoryIcon,
    getSubcategories,
    getPaymentMethodLabel,
    getCurrencySymbol,
    getCurrencyLabel,
    reloadCategories,
    reloadPaymentMethods,
    reloadCurrencies,
    reloadShortcuts,
    reloadAll,
  };

  return (
    <ConfigContext.Provider value={value}>
      {children}
    </ConfigContext.Provider>
  );
}

// ============================================================================
// HOOK
// ============================================================================

export function useConfig() {
  const context = useContext(ConfigContext);
  if (!context) {
    throw new Error('useConfig must be used within ConfigProvider');
  }
  return context;
}

// ============================================================================
// EXPORTS ADICIONALES PARA COMPATIBILIDAD
// ============================================================================

// Export defaults para uso cuando no hay contexto disponible
export { DEFAULT_CATEGORIES, DEFAULT_PAYMENT_METHODS, DEFAULT_CURRENCIES };
