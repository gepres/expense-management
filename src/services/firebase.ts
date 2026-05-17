/**
 * Configuración y servicios de Firebase
 */

import { initializeApp } from 'firebase/app';
import type { FirebaseApp } from 'firebase/app';
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  updateProfile,
  onAuthStateChanged,
} from 'firebase/auth';
import type { Auth, User } from 'firebase/auth';
import {
  getFirestore,
  collection,
  doc,
  getDoc,
  getDocs,
  updateDoc,
  query,
  where,
  Timestamp,
  serverTimestamp,
  setDoc,
} from 'firebase/firestore';
import type { Firestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import type { FirebaseStorage } from 'firebase/storage';
import type {
  Usuario,
  UsuarioFirestore,
  LoginCredenciales,
  RegistroCredenciales,
} from '@app-types';

// ============================================================================
// Configuración de Firebase
// ============================================================================

// Validar que todas las variables de entorno estén presentes
const requiredEnvVars = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Verificar variables faltantes
const missingVars = Object.entries(requiredEnvVars)
  .filter(([_, value]) => !value)
  .map(([key]) => `VITE_FIREBASE_${key.replace(/([A-Z])/g, '_$1').toUpperCase()}`);

if (missingVars.length > 0) {
  console.error('❌ Variables de entorno de Firebase faltantes:', missingVars);
  console.error('📝 Asegúrate de que las siguientes variables estén definidas:');
  missingVars.forEach(varName => console.error(`   - ${varName}`));
  throw new Error(
    `Faltan variables de entorno de Firebase: ${missingVars.join(', ')}. ` +
    'Verifica tu archivo .env o la configuración de Firebase Hosting.'
  );
}

const firebaseConfig = {
  apiKey: requiredEnvVars.apiKey,
  authDomain: requiredEnvVars.authDomain,
  projectId: requiredEnvVars.projectId,
  storageBucket: requiredEnvVars.storageBucket,
  messagingSenderId: requiredEnvVars.messagingSenderId,
  appId: requiredEnvVars.appId,
};

// Log de configuración (sin exponer la API key completa)
console.log('🔧 Inicializando Firebase con configuración:', {
  projectId: firebaseConfig.projectId,
  authDomain: firebaseConfig.authDomain,
  apiKey: firebaseConfig.apiKey ? `${firebaseConfig.apiKey.substring(0, 10)}...` : 'NO DEFINIDA',
});

// Inicializar Firebase
let app: FirebaseApp;
let auth: Auth;
let db: Firestore;
let storage: FirebaseStorage;

try {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
  storage = getStorage(app);
  console.log('✅ Firebase inicializado correctamente');
} catch (error) {
  console.error('❌ Error inicializando Firebase:', error);
  throw error;
}

export { app, auth, db, storage };

// ============================================================================
// Utilidades de Manejo de Errores
// ============================================================================

/**
 * Convierte códigos de error de Firebase a mensajes en español
 */
export const obtenerMensajeError = (error: unknown): string => {
  if (!(error instanceof Error)) {
    return 'Error desconocido';
  }

  const errorCode = (error as { code?: string }).code;

  const mensajesError: Record<string, string> = {
    // Errores de autenticación
    'auth/email-already-in-use': 'Este email ya está registrado',
    'auth/invalid-email': 'El email no es válido',
    'auth/operation-not-allowed': 'Operación no permitida. Contacta al administrador',
    'auth/weak-password': 'La contraseña es muy débil. Usa al menos 6 caracteres',
    'auth/user-disabled': 'Esta cuenta ha sido deshabilitada',
    'auth/user-not-found': 'No existe una cuenta con este email',
    'auth/wrong-password': 'Contraseña incorrecta',
    'auth/invalid-credential': 'Credenciales inválidas',
    'auth/too-many-requests': 'Demasiados intentos. Intenta más tarde',
    'auth/network-request-failed': 'Error de conexión. Verifica tu internet',

    // Errores de Google Sign-In (no mostrar como error si el usuario cancela)
    'auth/popup-closed-by-user': 'POPUP_CLOSED', // Marcador especial
    'auth/cancelled-popup-request': 'POPUP_CLOSED', // Marcador especial
    'auth/popup-blocked': 'El navegador bloqueó el popup. Por favor permite popups para este sitio y vuelve a intentarlo.',
    'auth/unauthorized-domain': 'Este dominio no está autorizado. Contacta al administrador.',
    'auth/account-exists-with-different-credential': 'Ya existe una cuenta con este email usando otro método de inicio de sesión',

    // Errores de configuración
    'auth/api-key-not-valid': 'API Key de Firebase no válida. Verifica la configuración',
    'auth/invalid-api-key': 'API Key de Firebase inválida',
    'auth/app-not-authorized': 'App no autorizada. Verifica los dominios permitidos en Firebase Console',

    // Errores de Firestore
    'permission-denied': 'Permisos insuficientes. Verifica las reglas de Firestore en Firebase Console',
    'firestore/permission-denied': 'Permisos insuficientes. Verifica las reglas de Firestore en Firebase Console',
    'not-found': 'Documento no encontrado',
    'already-exists': 'El documento ya existe',
    'failed-precondition': 'Operación rechazada. Verifica las condiciones',
    'aborted': 'Operación abortada debido a un conflicto',
    'out-of-range': 'Operación fuera de rango',
    'unimplemented': 'Operación no implementada',
    'internal': 'Error interno del servidor',
    'unavailable': 'Servicio no disponible. Intenta más tarde',
    'data-loss': 'Pérdida de datos irrecuperable',
    'unauthenticated': 'Debes iniciar sesión',
  };

  if (errorCode && mensajesError[errorCode]) {
    return mensajesError[errorCode];
  }

  // Verificar mensajes específicos en el texto del error
  const errorMessage = error.message.toLowerCase();

  if (errorMessage.includes('unsupported field value') && errorMessage.includes('undefined')) {
    return 'Error de datos. Por favor intenta nuevamente o contacta al administrador';
  }

  // Si no hay un mensaje específico, retorna el mensaje original
  return error.message || 'Error desconocido';
};

// ============================================================================
// Utilidades de Conversión
// ============================================================================

/**
 * Convierte un Timestamp de Firestore a Date
 * Maneja valores undefined/null retornando la fecha actual
 * También maneja strings y numbers para compatibilidad
 */
export const timestampToDate = (timestamp: any): Date => {
  if (!timestamp) {
    return new Date();
  }

  // Si ya es un Date, retornarlo
  if (timestamp instanceof Date) {
    return timestamp;
  }

  // Si tiene método toDate (Timestamp de Firestore)
  if (timestamp && typeof timestamp.toDate === 'function') {
    return timestamp.toDate();
  }

  // Si es un string o number, intentar crear Date
  if (typeof timestamp === 'string' || typeof timestamp === 'number') {
    const date = new Date(timestamp);
    if (!isNaN(date.getTime())) {
      return date;
    }
  }

  // Si es un objeto con seconds (formato Timestamp serializado)
  if (timestamp && typeof timestamp.seconds === 'number') {
    return new Date(timestamp.seconds * 1000);
  }

  // Fallback a fecha actual
  console.warn('Timestamp inválido, usando fecha actual:', timestamp);
  return new Date();
};

/**
 * Convierte una Date a Timestamp de Firestore
 */
export const dateToTimestamp = (date: Date): Timestamp => {
  return Timestamp.fromDate(date);
};

/**
 * Convierte un documento de Firestore de Usuario a Usuario
 */
export const firestoreToUsuario = (
  id: string,
  data: UsuarioFirestore
): Usuario => {
  return {
    id,
    email: data.email,
    nombre: data.nombre,
    photoURL: data.photoURL,
    whatsappPhone: data.whatsappPhone,
    whatsappLinkedAt: data.whatsappLinkedAt ? timestampToDate(data.whatsappLinkedAt) : undefined,
    role: data.role || 'standard',
    proRequestStatus: data.proRequestStatus || 'none',
    createdAt: timestampToDate(data.createdAt),
    updatedAt: timestampToDate(data.updatedAt),
  };
};



// ============================================================================
// Servicios de Autenticación
// ============================================================================

export const authService = {
  /**
   * Registrar un nuevo usuario con email y password
   */
  async registrar({ email, password, nombre }: RegistroCredenciales): Promise<Usuario> {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);

      // Actualizar perfil con nombre
      await updateProfile(userCredential.user, { displayName: nombre });

      // Crear documento de usuario en Firestore
      // IMPORTANTE: No incluir campos undefined - Firestore los rechaza
      const usuarioData: Partial<UsuarioFirestore> = {
        email,
        nombre,
        role: 'standard',
        proRequestStatus: 'none',
        createdAt: serverTimestamp() as Timestamp,
        updatedAt: serverTimestamp() as Timestamp,
      };

      // Solo agregar photoURL si existe
      if (userCredential.user.photoURL) {
        usuarioData.photoURL = userCredential.user.photoURL;
      }

      await setDoc(doc(db, 'users', userCredential.user.uid), usuarioData);

      return {
        id: userCredential.user.uid,
        email,
        nombre,
        photoURL: userCredential.user.photoURL || undefined,
        role: 'standard',
        proRequestStatus: 'none',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    } catch (error) {
      throw new Error(obtenerMensajeError(error));
    }
  },

  /**
   * Iniciar sesión con email y password
   */
  async login({ email, password }: LoginCredenciales): Promise<Usuario> {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));

      if (!userDoc.exists()) {
        throw new Error('Usuario no encontrado en la base de datos');
      }

      return firestoreToUsuario(userCredential.user.uid, userDoc.data() as UsuarioFirestore);
    } catch (error) {
      throw new Error(obtenerMensajeError(error));
    }
  },

  /**
   * Iniciar sesión con Google
   */
  async loginConGoogle(): Promise<Usuario> {
    try {
      console.log('🔵 Iniciando Google Sign-In...');
      const provider = new GoogleAuthProvider();

      // Agregar configuraciones recomendadas
      provider.setCustomParameters({
        prompt: 'select_account'
      });

      console.log('🔵 Abriendo popup de Google...');
      const userCredential = await signInWithPopup(auth, provider);

      console.log('✅ Usuario autenticado con Google:', {
        email: userCredential.user.email,
        uid: userCredential.user.uid,
        displayName: userCredential.user.displayName
      });

      // Verificar si el usuario ya existe
      const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));

      if (!userDoc.exists()) {
        console.log('🆕 Creando nuevo usuario en Firestore...');
        // Crear nuevo usuario
        // IMPORTANTE: No incluir campos undefined - Firestore los rechaza
        const usuarioData: Partial<UsuarioFirestore> = {
          email: userCredential.user.email!,
          nombre: userCredential.user.displayName || 'Usuario',
          role: 'standard',
          proRequestStatus: 'none',
          createdAt: serverTimestamp() as Timestamp,
          updatedAt: serverTimestamp() as Timestamp,
        };

        // Solo agregar photoURL si existe
        if (userCredential.user.photoURL) {
          usuarioData.photoURL = userCredential.user.photoURL;
        }

        await setDoc(doc(db, 'users', userCredential.user.uid), usuarioData);

        console.log('✅ Usuario creado exitosamente en Firestore');

        return {
          id: userCredential.user.uid,
          email: userCredential.user.email!,
          nombre: userCredential.user.displayName || 'Usuario',
          photoURL: userCredential.user.photoURL || undefined,
          role: 'standard',
          proRequestStatus: 'none',
          createdAt: new Date(),
          updatedAt: new Date(),
        };
      }

      console.log('✅ Usuario existente encontrado en Firestore');
      return firestoreToUsuario(userCredential.user.uid, userDoc.data() as UsuarioFirestore);
    } catch (error) {
      console.error('❌ Error en Google Sign-In:', error);
      console.error('Código de error:', (error as { code?: string }).code);
      console.error('Mensaje de error:', (error as Error).message);
      throw new Error(obtenerMensajeError(error));
    }
  },

  /**
   * Cerrar sesión
   */
  async logout(): Promise<void> {
    await signOut(auth);
  },

  /**
   * Obtener usuario actual
   */
  async obtenerUsuarioActual(): Promise<Usuario | null> {
    const user = auth.currentUser;
    if (!user) return null;

    const userDoc = await getDoc(doc(db, 'users', user.uid));
    if (!userDoc.exists()) return null;

    return firestoreToUsuario(user.uid, userDoc.data() as UsuarioFirestore);
  },

  /**
   * Observar cambios en el estado de autenticación
   */
  onAuthChange(callback: (user: User | null) => void): () => void {
    return onAuthStateChanged(auth, callback);
  },

  /**
   * Actualizar perfil de usuario
   */
  async actualizarPerfil(datos: { nombre?: string; photoURL?: string }): Promise<void> {
    const user = auth.currentUser;
    if (!user) throw new Error('No hay usuario autenticado');

    try {
      // 1. Actualizar en Firebase Auth
      await updateProfile(user, {
        displayName: datos.nombre,
        photoURL: datos.photoURL,
      });

      // 2. Actualizar en Firestore
      const updateData: any = {
        updatedAt: serverTimestamp(),
      };

      if (datos.nombre) updateData.nombre = datos.nombre;
      if (datos.photoURL !== undefined) updateData.photoURL = datos.photoURL;

      await updateDoc(doc(db, 'users', user.uid), updateData);
    } catch (error) {
      throw new Error(obtenerMensajeError(error));
    }
  },

  /**
   * Vincular número de WhatsApp
   */
  async vincularWhatsApp(phoneNumber: string): Promise<void> {
    const user = auth.currentUser;
    if (!user) throw new Error('No hay usuario autenticado');

    // Validar formato de número (debe incluir código de país)
    const phoneRegex = /^\+\d{1,3}\d{9,15}$/;
    if (!phoneRegex.test(phoneNumber)) {
      throw new Error('Formato de número inválido. Debe incluir código de país (ej: +51999999999)');
    }

    try {
      await updateDoc(doc(db, 'users', user.uid), {
        whatsappPhone: phoneNumber,
        whatsappLinkedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      throw new Error(obtenerMensajeError(error));
    }
  },

  /**
   * Desvincular número de WhatsApp
   */
  async desvincularWhatsApp(): Promise<void> {
    const user = auth.currentUser;
    if (!user) throw new Error('No hay usuario autenticado');

    try {
      await updateDoc(doc(db, 'users', user.uid), {
        whatsappPhone: null,
        whatsappLinkedAt: null,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      throw new Error(obtenerMensajeError(error));
    }
  },

  /**
   * Eliminar cuenta de usuario
   */
  async deleteAccount(): Promise<void> {
    const user = auth.currentUser;
    if (!user) throw new Error('No hay usuario autenticado');

    try {
      const token = await user.getIdToken();
      const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

      const response = await fetch(`${API_URL}/users/profile`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Error al eliminar la cuenta en el servidor');
      }

      // Cerrar sesión en Firebase
      await signOut(auth);
    } catch (error) {
      throw new Error(obtenerMensajeError(error));
    }
  },

  /**
   * Solicitar rol PRO
   */
  async requestProRole(): Promise<void> {
    const user = auth.currentUser;
    if (!user) throw new Error('No hay usuario autenticado');

    try {
      await updateDoc(doc(db, 'users', user.uid), {
        proRequestStatus: 'pending',
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      throw new Error(obtenerMensajeError(error));
    }
  },

  /**
   * Aprobar solicitud PRO (Admin)
   */
  async approveProRequest(userId: string): Promise<void> {
    try {
      await updateDoc(doc(db, 'users', userId), {
        role: 'pro',
        proRequestStatus: 'approved',
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      throw new Error(obtenerMensajeError(error));
    }
  },

  /**
   * Rechazar solicitud PRO (Admin)
   */
  async rejectProRequest(userId: string): Promise<void> {
    try {
      await updateDoc(doc(db, 'users', userId), {
        proRequestStatus: 'rejected',
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      throw new Error(obtenerMensajeError(error));
    }
  },

  /**
   * Obtener solicitudes PRO pendientes (Admin)
   */
  async getPendingProRequests(): Promise<Usuario[]> {
    try {
      const q = query(
        collection(db, 'users'),
        where('proRequestStatus', '==', 'pending')
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc =>
        firestoreToUsuario(doc.id, doc.data() as UsuarioFirestore)
      );
    } catch (error) {
      throw new Error(obtenerMensajeError(error));
    }
  },

  /**
   * Listar cuentas PRO/admin (Admin). Para el panel de gestión.
   */
  async getProUsers(): Promise<Usuario[]> {
    try {
      const q = query(
        collection(db, 'users'),
        where('role', 'in', ['pro', 'admin'])
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map((d) =>
        firestoreToUsuario(d.id, d.data() as UsuarioFirestore)
      );
    } catch (error) {
      throw new Error(obtenerMensajeError(error));
    }
  },

  /**
   * Buscar usuarios por email exacto (Admin) — para activarles PRO sin
   * que medie una solicitud. Email normalizado a minúsculas (Firebase
   * Auth los entrega así); se intenta también el valor crudo por si algún
   * doc histórico lo guardó con mayúsculas.
   */
  async searchUsersByEmail(email: string): Promise<Usuario[]> {
    const raw = email.trim();
    if (!raw) return [];
    try {
      const variants = Array.from(
        new Set([raw.toLowerCase(), raw]),
      );
      const results: Usuario[] = [];
      const seen = new Set<string>();
      for (const value of variants) {
        const q = query(
          collection(db, 'users'),
          where('email', '==', value),
        );
        const snap = await getDocs(q);
        snap.docs.forEach((d) => {
          if (seen.has(d.id)) return;
          seen.add(d.id);
          results.push(
            firestoreToUsuario(d.id, d.data() as UsuarioFirestore),
          );
        });
      }
      return results;
    } catch (error) {
      throw new Error(obtenerMensajeError(error));
    }
  },

  /**
   * Otorgar PRO directamente (Admin) — sin pasar por solicitud.
   */
  async grantProRole(userId: string): Promise<void> {
    try {
      await updateDoc(doc(db, 'users', userId), {
        role: 'pro',
        proRequestStatus: 'approved',
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      throw new Error(obtenerMensajeError(error));
    }
  },

  /**
   * Revocar PRO (Admin) — vuelve a 'standard'. No aplica a admins.
   */
  async revokeProRole(userId: string): Promise<void> {
    try {
      await updateDoc(doc(db, 'users', userId), {
        role: 'standard',
        proRequestStatus: 'none',
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      throw new Error(obtenerMensajeError(error));
    }
  },

  /**
   * Resolver nombre/email de varios usuarios por ID (Admin). Best-effort:
   * los IDs no encontrados se omiten. Para mostrar nombres en el top de
   * consumo IA (algunos usuarios no son PRO).
   */
  async getUsersByIds(ids: string[]): Promise<Record<string, Usuario>> {
    const out: Record<string, Usuario> = {};
    await Promise.all(
      ids.map(async (id) => {
        try {
          const snap = await getDoc(doc(db, 'users', id));
          if (snap.exists()) {
            out[id] = firestoreToUsuario(
              id,
              snap.data() as UsuarioFirestore
            );
          }
        } catch {
          /* best-effort */
        }
      })
    );
    return out;
  },
};



export default {
  auth: authService,
};
