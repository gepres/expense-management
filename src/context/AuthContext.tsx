/**
 * Context de autenticación
 */

import { createContext, useContext, useState, useEffect } from 'react';
import type { User } from 'firebase/auth';
import { authService } from '@services/firebase';
import type {
  Usuario,
  AuthState,
  LoginCredenciales,
  RegistroCredenciales,
} from '@app-types';

// ============================================================================
// Tipos
// ============================================================================

interface AuthContextType extends AuthState {
  login: (credenciales: LoginCredenciales) => Promise<void>;
  loginConGoogle: () => Promise<void>;
  registrar: (credenciales: RegistroCredenciales) => Promise<void>;
  logout: () => Promise<void>;
  actualizarUsuario: () => Promise<void>;
  requestProRole: () => Promise<void>;
  isAdmin: boolean;
  isPro: boolean;
}

// ============================================================================
// Context
// ============================================================================

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ============================================================================
// Provider
// ============================================================================

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [cargando, setCargando] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Escuchar cambios en el estado de autenticación
  useEffect(() => {
    const unsubscribe = authService.onAuthChange(async (user: User | null) => {
      try {
        if (user) {
          const usuarioData = await authService.obtenerUsuarioActual();
          setUsuario(usuarioData);
        } else {
          setUsuario(null);
        }
      } catch (err) {
        console.error('Error al obtener datos del usuario:', err);

        // Verificar si es un error de permisos
        const errorMessage = err instanceof Error ? err.message : '';
        if (errorMessage.includes('permission') || errorMessage.includes('permisos')) {
          setError(
            'Error de permisos de Firestore. Verifica las reglas en Firebase Console. ' +
            'Consulta FIREBASE_SETUP.md para más información.'
          );
        } else {
          setError('Error al cargar datos del usuario');
        }
      } finally {
        setCargando(false);
      }
    });

    return () => unsubscribe();
  }, []);

  /**
   * Iniciar sesión con email y password
   */
  const login = async (credenciales: LoginCredenciales): Promise<void> => {
    try {
      setError(null);
      setCargando(true);
      const usuarioData = await authService.login(credenciales);
      setUsuario(usuarioData);
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : 'Error al iniciar sesión';
      setError(errorMessage);
      throw err;
    } finally {
      setCargando(false);
    }
  };

  /**
   * Iniciar sesión con Google
   */
  const loginConGoogle = async (): Promise<void> => {
    try {
      setError(null);
      setCargando(true);
      const usuarioData = await authService.loginConGoogle();
      console.log('usuarioData',usuarioData);
      
      setUsuario(usuarioData);
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : 'Error al iniciar sesión con Google';
      setError(errorMessage);
      throw err;
    } finally {
      setCargando(false);
    }
  };

  /**
   * Registrar nuevo usuario
   */
  const registrar = async (credenciales: RegistroCredenciales): Promise<void> => {
    try {
      setError(null);
      setCargando(true);
      const usuarioData = await authService.registrar(credenciales);
      setUsuario(usuarioData);
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : 'Error al registrar usuario';
      setError(errorMessage);
      throw err;
    } finally {
      setCargando(false);
    }
  };

  /**
   * Cerrar sesión
   */
  const logout = async (): Promise<void> => {
    try {
      setError(null);
      await authService.logout();
      setUsuario(null);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cerrar sesión';
      setError(errorMessage);
      throw err;
    }
  };

  /**
   * Actualizar datos del usuario
   */
  const actualizarUsuario = async (): Promise<void> => {
    try {
      const usuarioActualizado = await authService.obtenerUsuarioActual();
      setUsuario(usuarioActualizado);
    } catch (err) {
      console.error('Error al actualizar usuario:', err);
    }
  };

  /**
   * Solicitar rol PRO
   */
  const requestProRole = async (): Promise<void> => {
    try {
      await authService.requestProRole();
      await actualizarUsuario();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al solicitar rol PRO';
      throw new Error(errorMessage);
    }
  };

  const isAdmin = usuario?.role === 'admin';
  const isPro = usuario?.role === 'pro' || usuario?.role === 'admin';

  const value: AuthContextType = {
    usuario,
    cargando,
    error,
    login,
    loginConGoogle,
    registrar,
    logout,
    actualizarUsuario,
    requestProRole,
    isAdmin,
    isPro,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ============================================================================
// Hook personalizado
// ============================================================================

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
}

export default AuthContext;
