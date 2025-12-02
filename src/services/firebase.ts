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
  PresupuestoEfectivo,
  PresupuestoEfectivoFirestore,
  Movimiento,
  MovimientoFirestore,
  AbonoEfectivo,
  AbonoEfectivoFirestore,
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
    shoppingListId: data.shoppingListId,
    // Campos de información tributaria
    voucherType: data.voucherType,
    voucherNumber: data.voucherNumber,
    ruc: data.ruc,
    igv: data.igv,
    subtotal: data.subtotal,
    reimbursementStatus: data.reimbursementStatus,
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

  // Solo agregar shoppingListId si existe
  if (gasto.shoppingListId) {
    firestoreData.shoppingListId = gasto.shoppingListId;
  }

  // Campos de información tributaria - solo agregar si existen
  if (gasto.voucherType) {
    firestoreData.voucherType = gasto.voucherType;
  }

  if (gasto.voucherNumber) {
    firestoreData.voucherNumber = gasto.voucherNumber;
  }

  if (gasto.ruc) {
    firestoreData.ruc = gasto.ruc;
  }

  if (gasto.igv !== undefined && gasto.igv !== null) {
    firestoreData.igv = gasto.igv;
  }

  if (gasto.subtotal !== undefined && gasto.subtotal !== null) {
    firestoreData.subtotal = gasto.subtotal;
  }

  if (gasto.reimbursementStatus) {
    firestoreData.reimbursementStatus = gasto.reimbursementStatus;
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

/**
 * Convierte un documento de Firestore de PresupuestoEfectivo a PresupuestoEfectivo
 */
export const firestoreToPresupuestoEfectivo = (
  id: string,
  data: PresupuestoEfectivoFirestore
): PresupuestoEfectivo => {
  return {
    id,
    userId: data.userId,
    moneda: data.moneda,
    saldoActual: data.saldoActual,
    createdAt: timestampToDate(data.createdAt),
    updatedAt: timestampToDate(data.updatedAt),
  };
};

/**
 * Convierte un documento de Firestore de Movimiento a Movimiento
 */
export const firestoreToMovimiento = (
  id: string,
  data: MovimientoFirestore
): Movimiento => {
  return {
    id,
    userId: data.userId,
    fecha: timestampToDate(data.fecha),
    tipo: data.tipo,
    monto: data.monto,
    moneda: data.moneda,
    origen: data.origen,
    destino: data.destino,
    descripcion: data.descripcion,
    aplicadoAEfectivo: data.aplicadoAEfectivo,
    createdAt: timestampToDate(data.createdAt),
    updatedAt: timestampToDate(data.updatedAt),
  };
};

/**
 * Convierte un Movimiento a MovimientoFirestore (sin id)
 */
export const movimientoToFirestore = (movimiento: Partial<Movimiento>): Partial<MovimientoFirestore> => {
  const firestoreData: Partial<MovimientoFirestore> = {
    userId: movimiento.userId,
    tipo: movimiento.tipo,
    monto: movimiento.monto,
    moneda: movimiento.moneda,
    aplicadoAEfectivo: movimiento.aplicadoAEfectivo ?? false,
  };

  if (movimiento.origen) {
    firestoreData.origen = movimiento.origen;
  }

  if (movimiento.destino) {
    firestoreData.destino = movimiento.destino;
  }

  if (movimiento.descripcion) {
    firestoreData.descripcion = movimiento.descripcion;
  }

  if (movimiento.fecha) {
    firestoreData.fecha = dateToTimestamp(movimiento.fecha);
  }

  return firestoreData;
};

/**
 * Convierte un documento de Firestore de AbonoEfectivo a AbonoEfectivo
 */
export const firestoreToAbonoEfectivo = (
  id: string,
  data: AbonoEfectivoFirestore
): AbonoEfectivo => {
  return {
    id,
    userId: data.userId,
    fecha: timestampToDate(data.fecha),
    monto: data.monto,
    moneda: data.moneda,
    concepto: data.concepto,
    movimientoId: data.movimientoId,
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

    const docRef = await addDoc(collection(db, 'expenses'), firestoreData);
    const docSnap = await getDoc(docRef);

    return firestoreToGasto(docRef.id, docSnap.data() as GastoFirestore);
  },

  /**
   * Obtener un gasto por ID
   */
  async obtenerPorId(id: string): Promise<Gasto | null> {
    const docSnap = await getDoc(doc(db, 'expenses', id));
    if (!docSnap.exists()) return null;

    return firestoreToGasto(docSnap.id, docSnap.data() as GastoFirestore);
  },

  /**
   * Obtener todos los gastos de un usuario
   */
  async obtenerPorUsuario(userId: string, constraints: QueryConstraint[] = []): Promise<Gasto[]> {
    const gastosQuery = query(
      collection(db, 'expenses'),
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

    await updateDoc(doc(db, 'expenses', id), firestoreData);
  },

  /**
   * Eliminar un gasto
   */
  async eliminar(id: string): Promise<void> {
    await deleteDoc(doc(db, 'expenses', id));
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
      collection(db, 'expenses'),
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

// ============================================================================
// Servicios de Presupuesto en Efectivo
// ============================================================================

export const presupuestoEfectivoService = {
  /**
   * Obtener o crear presupuesto en efectivo para una moneda
   */
  async obtenerOCrear(userId: string, moneda: string): Promise<PresupuestoEfectivo> {
    const presupuestosQuery = query(
      collection(db, 'presupuestosEfectivo'),
      where('userId', '==', userId),
      where('moneda', '==', moneda)
    );

    const querySnapshot = await getDocs(presupuestosQuery);

    // Si existe, retornarlo
    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0];
      return firestoreToPresupuestoEfectivo(doc.id, doc.data() as PresupuestoEfectivoFirestore);
    }

    // Si no existe, crearlo con saldo 0
    const firestoreData: PresupuestoEfectivoFirestore = {
      userId,
      moneda: moneda as any,
      saldoActual: 0,
      createdAt: serverTimestamp() as Timestamp,
      updatedAt: serverTimestamp() as Timestamp,
    };

    const docRef = await addDoc(collection(db, 'presupuestosEfectivo'), firestoreData);
    const docSnap = await getDoc(docRef);

    return firestoreToPresupuestoEfectivo(docRef.id, docSnap.data() as PresupuestoEfectivoFirestore);
  },

  /**
   * Obtener todos los presupuestos en efectivo de un usuario
   */
  async obtenerTodos(userId: string): Promise<PresupuestoEfectivo[]> {
    const presupuestosQuery = query(
      collection(db, 'presupuestosEfectivo'),
      where('userId', '==', userId)
    );

    const querySnapshot = await getDocs(presupuestosQuery);
    return querySnapshot.docs.map(doc =>
      firestoreToPresupuestoEfectivo(doc.id, doc.data() as PresupuestoEfectivoFirestore)
    );
  },

  /**
   * Actualizar saldo de presupuesto en efectivo
   */
  async actualizarSaldo(id: string, nuevoSaldo: number): Promise<void> {
    await updateDoc(doc(db, 'presupuestosEfectivo', id), {
      saldoActual: nuevoSaldo,
      updatedAt: serverTimestamp(),
    });
  },

  /**
   * Incrementar saldo (para abonos)
   */
  async incrementarSaldo(id: string, monto: number): Promise<void> {
    const docSnap = await getDoc(doc(db, 'presupuestosEfectivo', id));
    if (!docSnap.exists()) throw new Error('Presupuesto en efectivo no encontrado');

    const presupuesto = firestoreToPresupuestoEfectivo(docSnap.id, docSnap.data() as PresupuestoEfectivoFirestore);
    const nuevoSaldo = presupuesto.saldoActual + monto;

    await this.actualizarSaldo(id, nuevoSaldo);
  },

  /**
   * Decrementar saldo (para gastos)
   */
  async decrementarSaldo(id: string, monto: number): Promise<void> {
    const docSnap = await getDoc(doc(db, 'presupuestosEfectivo', id));
    if (!docSnap.exists()) throw new Error('Presupuesto en efectivo no encontrado');

    const presupuesto = firestoreToPresupuestoEfectivo(docSnap.id, docSnap.data() as PresupuestoEfectivoFirestore);
    const nuevoSaldo = presupuesto.saldoActual - monto;

    await this.actualizarSaldo(id, nuevoSaldo);
  },
};

// ============================================================================
// Servicios de Movimientos
// ============================================================================

export const movimientosService = {
  /**
   * Crear un nuevo movimiento
   */
  async crear(movimientoData: Omit<Movimiento, 'id' | 'createdAt' | 'updatedAt'>): Promise<Movimiento> {
    const firestoreData: MovimientoFirestore = {
      ...movimientoToFirestore(movimientoData) as MovimientoFirestore,
      createdAt: serverTimestamp() as Timestamp,
      updatedAt: serverTimestamp() as Timestamp,
    };

    const docRef = await addDoc(collection(db, 'movimientos'), firestoreData);
    const docSnap = await getDoc(docRef);

    return firestoreToMovimiento(docRef.id, docSnap.data() as MovimientoFirestore);
  },

  /**
   * Obtener un movimiento por ID
   */
  async obtenerPorId(id: string): Promise<Movimiento | null> {
    const docSnap = await getDoc(doc(db, 'movimientos', id));
    if (!docSnap.exists()) return null;

    return firestoreToMovimiento(docSnap.id, docSnap.data() as MovimientoFirestore);
  },

  /**
   * Obtener todos los movimientos de un usuario
   */
  async obtenerPorUsuario(userId: string): Promise<Movimiento[]> {
    const movimientosQuery = query(
      collection(db, 'movimientos'),
      where('userId', '==', userId),
      orderBy('fecha', 'desc')
    );

    const querySnapshot = await getDocs(movimientosQuery);
    return querySnapshot.docs.map(doc =>
      firestoreToMovimiento(doc.id, doc.data() as MovimientoFirestore)
    );
  },

  /**
   * Actualizar un movimiento
   */
  async actualizar(id: string, movimientoData: Partial<Movimiento>): Promise<void> {
    const firestoreData = {
      ...movimientoToFirestore(movimientoData),
      updatedAt: serverTimestamp(),
    };

    await updateDoc(doc(db, 'movimientos', id), firestoreData);
  },

  /**
   * Eliminar un movimiento
   */
  async eliminar(id: string): Promise<void> {
    await deleteDoc(doc(db, 'movimientos', id));
  },

  /**
   * Obtener movimientos por rango de fechas
   */
  async obtenerPorRangoFechas(
    userId: string,
    fechaInicio: Date,
    fechaFin: Date
  ): Promise<Movimiento[]> {
    const movimientosQuery = query(
      collection(db, 'movimientos'),
      where('userId', '==', userId),
      where('fecha', '>=', dateToTimestamp(fechaInicio)),
      where('fecha', '<=', dateToTimestamp(fechaFin)),
      orderBy('fecha', 'desc')
    );

    const querySnapshot = await getDocs(movimientosQuery);
    return querySnapshot.docs.map(doc =>
      firestoreToMovimiento(doc.id, doc.data() as MovimientoFirestore)
    );
  },
};

// ============================================================================
// Servicios de Abonos a Efectivo
// ============================================================================

export const abonosEfectivoService = {
  /**
   * Crear un nuevo abono
   */
  async crear(abonoData: Omit<AbonoEfectivo, 'id' | 'createdAt' | 'updatedAt'>): Promise<AbonoEfectivo> {
    const firestoreData: AbonoEfectivoFirestore = {
      userId: abonoData.userId,
      monto: abonoData.monto,
      moneda: abonoData.moneda,
      concepto: abonoData.concepto,
      fecha: dateToTimestamp(abonoData.fecha),
      createdAt: serverTimestamp() as Timestamp,
      updatedAt: serverTimestamp() as Timestamp,
    };

    // Solo agregar movimientoId si existe
    if (abonoData.movimientoId) {
      firestoreData.movimientoId = abonoData.movimientoId;
    }

    const docRef = await addDoc(collection(db, 'abonosEfectivo'), firestoreData);
    const docSnap = await getDoc(docRef);

    return firestoreToAbonoEfectivo(docRef.id, docSnap.data() as AbonoEfectivoFirestore);
  },

  /**
   * Obtener todos los abonos de un usuario
   */
  async obtenerPorUsuario(userId: string): Promise<AbonoEfectivo[]> {
    const abonosQuery = query(
      collection(db, 'abonosEfectivo'),
      where('userId', '==', userId),
      orderBy('fecha', 'desc')
    );

    const querySnapshot = await getDocs(abonosQuery);
    return querySnapshot.docs.map(doc =>
      firestoreToAbonoEfectivo(doc.id, doc.data() as AbonoEfectivoFirestore)
    );
  },

  /**
   * Obtener abonos por moneda
   */
  async obtenerPorMoneda(userId: string, moneda: string): Promise<AbonoEfectivo[]> {
    const abonosQuery = query(
      collection(db, 'abonosEfectivo'),
      where('userId', '==', userId),
      where('moneda', '==', moneda),
      orderBy('fecha', 'desc')
    );

    const querySnapshot = await getDocs(abonosQuery);
    return querySnapshot.docs.map(doc =>
      firestoreToAbonoEfectivo(doc.id, doc.data() as AbonoEfectivoFirestore)
    );
  },

  /**
   * Eliminar un abono
   */
  async eliminar(id: string): Promise<void> {
    await deleteDoc(doc(db, 'abonosEfectivo', id));
  },

  /**
   * Obtener abonos por rango de fechas
   */
  async obtenerPorRangoFechas(
    userId: string,
    fechaInicio: Date,
    fechaFin: Date
  ): Promise<AbonoEfectivo[]> {
    const abonosQuery = query(
      collection(db, 'abonosEfectivo'),
      where('userId', '==', userId),
      where('fecha', '>=', dateToTimestamp(fechaInicio)),
      where('fecha', '<=', dateToTimestamp(fechaFin)),
      orderBy('fecha', 'desc')
    );

    const querySnapshot = await getDocs(abonosQuery);
    return querySnapshot.docs.map(doc =>
      firestoreToAbonoEfectivo(doc.id, doc.data() as AbonoEfectivoFirestore)
    );
  },
};

export default {
  auth: authService,
  gastos: gastosService,
  presupuestos: presupuestosService,
  presupuestoEfectivo: presupuestoEfectivoService,
  movimientos: movimientosService,
  abonosEfectivo: abonosEfectivoService,
};
