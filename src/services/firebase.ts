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
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  Timestamp,
  serverTimestamp,
  setDoc,
} from 'firebase/firestore';
import type { Firestore, QueryConstraint } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import type { FirebaseStorage } from 'firebase/storage';
import type {
  Usuario,
  UsuarioFirestore,
  Gasto,
  GastoFirestore,
  Presupuesto,
  PresupuestoFirestore,
  LoginCredenciales,
  RegistroCredenciales,
} from '@types';

// ============================================================================
// Configuración de Firebase
// ============================================================================

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

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
} catch (error) {
  console.error('Error inicializando Firebase:', error);
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
    'auth/popup-closed-by-user': 'Inicio de sesión cancelado',
    'auth/cancelled-popup-request': 'Inicio de sesión cancelado',

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
 */
export const timestampToDate = (timestamp: Timestamp): Date => {
  return timestamp.toDate();
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
    createdAt: timestampToDate(data.createdAt),
    updatedAt: timestampToDate(data.updatedAt),
  };
};

/**
 * Convierte un documento de Firestore de Gasto a Gasto
 */
export const firestoreToGasto = (
  id: string,
  data: GastoFirestore
): Gasto => {
  return {
    id,
    userId: data.userId,
    fecha: timestampToDate(data.fecha),
    categoria: data.categoria,
    subcategoria: data.subcategoria,
    monto: data.monto,
    moneda: data.moneda,
    descripcion: data.descripcion,
    metodoPago: data.metodoPago,
    tags: data.tags,
    recurrente: data.recurrente,
    createdAt: timestampToDate(data.createdAt),
    updatedAt: timestampToDate(data.updatedAt),
  };
};

/**
 * Convierte un Gasto a GastoFirestore (sin id)
 * IMPORTANTE: No incluir campos undefined - Firestore los rechaza
 */
export const gastoToFirestore = (gasto: Partial<Gasto>): Partial<GastoFirestore> => {
  const firestoreData: Partial<GastoFirestore> = {
    userId: gasto.userId,
    categoria: gasto.categoria,
    monto: gasto.monto,
    moneda: gasto.moneda,
    descripcion: gasto.descripcion,
    metodoPago: gasto.metodoPago,
    recurrente: gasto.recurrente,
  };

  // Solo agregar subcategoria si existe
  if (gasto.subcategoria) {
    firestoreData.subcategoria = gasto.subcategoria;
  }

  // Solo agregar tags si existe y tiene elementos
  if (gasto.tags && gasto.tags.length > 0) {
    firestoreData.tags = gasto.tags;
  }

  if (gasto.fecha) {
    firestoreData.fecha = dateToTimestamp(gasto.fecha);
  }

  return firestoreData;
};

/**
 * Convierte un documento de Firestore de Presupuesto a Presupuesto
 */
export const firestoreToPresupuesto = (
  id: string,
  data: PresupuestoFirestore
): Presupuesto => {
  return {
    id,
    userId: data.userId,
    mes: data.mes,
    categoria: data.categoria,
    subcategoria: data.subcategoria,
    limite: data.limite,
    moneda: data.moneda,
    gastado: data.gastado,
    alertaEnviada80: data.alertaEnviada80,
    alertaEnviada100: data.alertaEnviada100,
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
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);

      // Verificar si el usuario ya existe
      const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));

      if (!userDoc.exists()) {
        // Crear nuevo usuario
        // IMPORTANTE: No incluir campos undefined - Firestore los rechaza
        const usuarioData: Partial<UsuarioFirestore> = {
          email: userCredential.user.email!,
          nombre: userCredential.user.displayName || 'Usuario',
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
          email: userCredential.user.email!,
          nombre: userCredential.user.displayName || 'Usuario',
          photoURL: userCredential.user.photoURL || undefined,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
      }

      return firestoreToUsuario(userCredential.user.uid, userDoc.data() as UsuarioFirestore);
    } catch (error) {
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
};

// ============================================================================
// Servicios de Gastos
// ============================================================================

export const gastosService = {
  /**
   * Crear un nuevo gasto
   */
  async crear(gastoData: Omit<Gasto, 'id' | 'createdAt' | 'updatedAt'>): Promise<Gasto> {
    const firestoreData: GastoFirestore = {
      ...gastoToFirestore(gastoData) as GastoFirestore,
      createdAt: serverTimestamp() as Timestamp,
      updatedAt: serverTimestamp() as Timestamp,
    };

    const docRef = await addDoc(collection(db, 'gastos'), firestoreData);
    const docSnap = await getDoc(docRef);

    return firestoreToGasto(docRef.id, docSnap.data() as GastoFirestore);
  },

  /**
   * Obtener un gasto por ID
   */
  async obtenerPorId(id: string): Promise<Gasto | null> {
    const docSnap = await getDoc(doc(db, 'gastos', id));
    if (!docSnap.exists()) return null;

    return firestoreToGasto(docSnap.id, docSnap.data() as GastoFirestore);
  },

  /**
   * Obtener todos los gastos de un usuario
   */
  async obtenerPorUsuario(userId: string, constraints: QueryConstraint[] = []): Promise<Gasto[]> {
    const gastosQuery = query(
      collection(db, 'gastos'),
      where('userId', '==', userId),
      orderBy('fecha', 'desc'),
      ...constraints
    );

    const querySnapshot = await getDocs(gastosQuery);
    return querySnapshot.docs.map(doc =>
      firestoreToGasto(doc.id, doc.data() as GastoFirestore)
    );
  },

  /**
   * Actualizar un gasto
   */
  async actualizar(id: string, gastoData: Partial<Gasto>): Promise<void> {
    const firestoreData = {
      ...gastoToFirestore(gastoData),
      updatedAt: serverTimestamp(),
    };

    await updateDoc(doc(db, 'gastos', id), firestoreData);
  },

  /**
   * Eliminar un gasto
   */
  async eliminar(id: string): Promise<void> {
    await deleteDoc(doc(db, 'gastos', id));
  },

  /**
   * Obtener gastos por rango de fechas
   */
  async obtenerPorRangoFechas(
    userId: string,
    fechaInicio: Date,
    fechaFin: Date
  ): Promise<Gasto[]> {
    const gastosQuery = query(
      collection(db, 'gastos'),
      where('userId', '==', userId),
      where('fecha', '>=', dateToTimestamp(fechaInicio)),
      where('fecha', '<=', dateToTimestamp(fechaFin)),
      orderBy('fecha', 'desc')
    );

    const querySnapshot = await getDocs(gastosQuery);
    return querySnapshot.docs.map(doc =>
      firestoreToGasto(doc.id, doc.data() as GastoFirestore)
    );
  },
};

// ============================================================================
// Servicios de Presupuestos
// ============================================================================

export const presupuestosService = {
  /**
   * Crear un nuevo presupuesto
   */
  async crear(
    presupuestoData: Omit<Presupuesto, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<Presupuesto> {
    const firestoreData: any = {
      userId: presupuestoData.userId,
      mes: presupuestoData.mes,
      categoria: presupuestoData.categoria,
      limite: presupuestoData.limite,
      moneda: presupuestoData.moneda,
      gastado: presupuestoData.gastado,
      alertaEnviada80: false,
      alertaEnviada100: false,
      createdAt: serverTimestamp() as Timestamp,
      updatedAt: serverTimestamp() as Timestamp,
    };

    // Solo agregar subcategoria si existe
    if (presupuestoData.subcategoria) {
      firestoreData.subcategoria = presupuestoData.subcategoria;
    }

    const docRef = await addDoc(collection(db, 'presupuestos'), firestoreData);
    const docSnap = await getDoc(docRef);

    return firestoreToPresupuesto(docRef.id, docSnap.data() as PresupuestoFirestore);
  },

  /**
   * Obtener presupuestos de un usuario para un mes
   */
  async obtenerPorMes(userId: string, mes: string): Promise<Presupuesto[]> {
    const presupuestosQuery = query(
      collection(db, 'presupuestos'),
      where('userId', '==', userId),
      where('mes', '==', mes)
    );

    const querySnapshot = await getDocs(presupuestosQuery);
    return querySnapshot.docs.map(doc =>
      firestoreToPresupuesto(doc.id, doc.data() as PresupuestoFirestore)
    );
  },

  /**
   * Actualizar un presupuesto
   */
  async actualizar(id: string, presupuestoData: Partial<Presupuesto>): Promise<void> {
    const updateData: any = {
      ...presupuestoData,
      updatedAt: serverTimestamp(),
    };

    // Eliminar campos que no deben estar en la actualización
    delete updateData.id;
    delete updateData.createdAt;

    await updateDoc(doc(db, 'presupuestos', id), updateData);
  },

  /**
   * Eliminar un presupuesto
   */
  async eliminar(id: string): Promise<void> {
    await deleteDoc(doc(db, 'presupuestos', id));
  },
};

export default {
  auth: authService,
  gastos: gastosService,
  presupuestos: presupuestosService,
};
