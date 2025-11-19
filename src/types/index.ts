/**
 * Tipos y interfaces principales de la aplicación de gestión de gastos
 */

import { Timestamp } from 'firebase/firestore';

// ============================================================================
// Usuario
// ============================================================================

export interface Usuario {
  id: string;
  email: string;
  nombre: string;
  photoURL?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UsuarioFirestore {
  email: string;
  nombre: string;
  photoURL?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// ============================================================================
// Categorías y Métodos de Pago
// ============================================================================

export const CATEGORIAS_GASTO = [
  'alimentacion',
  'transporte',
  'entretenimiento',
  'salud',
  'servicios',
  'compras',
  'educacion',
  'vivienda',
  'otros',
] as const;

// Categoría especial para presupuesto general
export const CATEGORIA_GENERAL = 'general' as const;

export type CategoriaGastoOGeneral = CategoriaGasto | typeof CATEGORIA_GENERAL;

export type CategoriaGasto = (typeof CATEGORIAS_GASTO)[number];

// ============================================================================
// Monedas
// ============================================================================

export const MONEDAS = ['PEN', 'USD'] as const;

export type Moneda = (typeof MONEDAS)[number];

export const MONEDA_LABELS: Record<Moneda, string> = {
  PEN: 'Soles (S/)',
  USD: 'Dólares ($)',
};

export const MONEDA_SIMBOLOS: Record<Moneda, string> = {
  PEN: 'S/',
  USD: '$',
};

// ============================================================================
// Métodos de Pago
// ============================================================================

export const METODOS_PAGO = [
  'efectivo',
  'tarjeta_debito',
  'tarjeta_credito',
  'transferencia',
  'yape',
  'plin',
  'otros',
] as const;

export type MetodoPago = (typeof METODOS_PAGO)[number];

// Labels para UI
export const CATEGORIA_LABELS: Record<CategoriaGasto, string> = {
  alimentacion: 'Alimentación',
  transporte: 'Transporte',
  entretenimiento: 'Entretenimiento',
  salud: 'Salud',
  servicios: 'Servicios',
  compras: 'Compras',
  educacion: 'Educación',
  vivienda: 'Vivienda',
  otros: 'Otros',
};

export const CATEGORIA_LABELS_CON_GENERAL: Record<CategoriaGastoOGeneral, string> = {
  ...CATEGORIA_LABELS,
  general: 'Presupuesto General',
};

export const METODO_PAGO_LABELS: Record<MetodoPago, string> = {
  efectivo: 'Efectivo',
  tarjeta_debito: 'Tarjeta de Débito',
  tarjeta_credito: 'Tarjeta de Crédito',
  transferencia: 'Transferencia',
  yape: 'Yape',
  plin: 'Plin',
  otros: 'Otros',
};

// Colores para categorías (para gráficos)
export const CATEGORIA_COLORS: Record<CategoriaGasto, string> = {
  alimentacion: '#10b981',
  transporte: '#3b82f6',
  entretenimiento: '#f59e0b',
  salud: '#ef4444',
  servicios: '#8b5cf6',
  compras: '#ec4899',
  educacion: '#06b6d4',
  vivienda: '#f97316',
  otros: '#6b7280',
};

export const CATEGORIA_COLORS_CON_GENERAL: Record<CategoriaGastoOGeneral, string> = {
  ...CATEGORIA_COLORS,
  general: '#1e40af',
};

// Subcategorías por categoría
export const SUBCATEGORIAS: Record<CategoriaGasto, string[]> = {
  alimentacion: ['Bodega', 'Market', 'Pollería', 'Cena', 'Menú', 'Panadería', 'Otros'],
  transporte: ['Taxi', 'Micro', 'Metro', 'Bus','Didi' ,'Uber', 'Otros'],
  entretenimiento: ['Cine', 'Concierto', 'Bar','Trekking', 'Streaming', 'Otros'],
  salud: ['Farmacia', 'Consulta', 'Exámenes', 'Otros'],
  servicios: ['Luz', 'Agua', 'Internet', 'Teléfono', 'Gas', 'Otros'],
  compras: ['Ropa', 'Electrónica', 'Muebles', 'Otros'],
  educacion: ['Libros', 'Cursos', 'Material', 'Otros'],
  vivienda: ['Alquiler', 'Mantenimiento', 'Limpieza', 'Otros'],
  otros: ['Varios'],
};

// Subcategorías para presupuesto general (conceptos de origen de dinero)
export const SUBCATEGORIAS_PRESUPUESTO_GENERAL = [
  'Cuenta Sueldos',
  'Préstamo',
  'Deuda',
  'CTS',
  'AFP',
  'Otros',
] as const;

// ============================================================================
// Gastos
// ============================================================================

export interface Gasto {
  id: string;
  userId: string;
  fecha: Date;
  categoria: CategoriaGasto;
  subcategoria?: string;
  monto: number;
  moneda: Moneda;
  descripcion: string;
  metodoPago: MetodoPago;
  tags?: string[];
  recurrente?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface GastoFirestore {
  userId: string;
  fecha: Timestamp;
  categoria: CategoriaGasto;
  subcategoria?: string;
  monto: number;
  moneda: Moneda;
  descripcion: string;
  metodoPago: MetodoPago;
  tags?: string[];
  recurrente?: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface GastoFormData {
  fecha: string;
  hora: string;
  categoria: CategoriaGasto;
  subcategoria?: string;
  monto: string;
  moneda: Moneda;
  descripcion: string;
  metodoPago: MetodoPago;
  tags?: string[];
  recurrente?: boolean;
}

export interface FiltrosGastos {
  fechaInicio?: Date;
  fechaFin?: Date;
  categorias?: CategoriaGasto[];
  montoMin?: number;
  montoMax?: number;
  metodoPago?: MetodoPago;
  busqueda?: string;
}

// ============================================================================
// Presupuestos
// ============================================================================

export interface Presupuesto {
  id: string;
  userId: string;
  mes: string; // formato: YYYY-MM
  categoria: CategoriaGastoOGeneral;
  subcategoria?: string;
  limite: number;
  moneda: Moneda;
  gastado: number;
  alertaEnviada80?: boolean;
  alertaEnviada100?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface PresupuestoFirestore {
  userId: string;
  mes: string;
  categoria: CategoriaGastoOGeneral;
  subcategoria?: string;
  limite: number;
  moneda: Moneda;
  gastado: number;
  alertaEnviada80?: boolean;
  alertaEnviada100?: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface PresupuestoFormData {
  mes: string;
  categoria: CategoriaGastoOGeneral;
  subcategoria?: string;
  limite: string;
}

export interface AlertaPresupuesto {
  id: string;
  presupuestoId: string;
  categoria: CategoriaGasto;
  porcentaje: number;
  mensaje: string;
  fecha: Date;
  leida: boolean;
}

// ============================================================================
// Análisis y Estadísticas
// ============================================================================

export interface EstadisticasPeriodo {
  totalGastado: number;
  promedioGasto: number;
  gastoMaximo: number;
  gastoMinimo: number;
  numeroGastos: number;
  gastosPorCategoria: Record<CategoriaGasto, number>;
  gastosPorMetodoPago: Record<MetodoPago, number>;
}

export interface ComparacionPeriodos {
  periodoActual: EstadisticasPeriodo;
  periodoAnterior: EstadisticasPeriodo;
  diferencia: number;
  diferenciaPorcentaje: number;
  categoriasMayorCambio: Array<{
    categoria: CategoriaGasto;
    diferencia: number;
    diferenciaPorcentaje: number;
  }>;
}

export interface TendenciaGasto {
  categoria: CategoriaGasto;
  tendencia: 'creciente' | 'decreciente' | 'estable';
  porcentajeCambio: number;
  proyeccion: number;
}

export interface GastoInusual {
  gasto: Gasto;
  razon: string;
  desviacion: number;
}

export interface Recomendacion {
  id: string;
  tipo: 'ahorro' | 'presupuesto' | 'categoria' | 'general';
  prioridad: 'alta' | 'media' | 'baja';
  titulo: string;
  descripcion: string;
  categoria?: CategoriaGasto;
  ahorroPotencial?: number;
  accion?: string;
}

// ============================================================================
// Asistente IA
// ============================================================================

export interface MensajeChat {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  metadata?: {
    gastos?: Gasto[];
    estadisticas?: EstadisticasPeriodo;
    categoriasMencionadas?: CategoriaGasto[];
  };
}

export interface ConversacionChat {
  id: string;
  userId: string;
  titulo: string;
  mensajes: MensajeChat[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ContextoUsuario {
  gastosRecientes: Gasto[];
  estadisticasMes: EstadisticasPeriodo;
  presupuestos: Presupuesto[];
  tendencias: TendenciaGasto[];
  recomendaciones: Recomendacion[];
}

// ============================================================================
// Importación/Exportación
// ============================================================================

export interface DatosImportacion {
  fecha: string;
  categoria: string;
  monto: string | number;
  descripcion: string;
  metodoPago?: string;
}

export interface ResultadoImportacion {
  exitosos: number;
  fallidos: number;
  errores: Array<{
    fila: number;
    error: string;
    datos: DatosImportacion;
  }>;
  gastosCreados: Gasto[];
}

export interface ConfiguracionColumnas {
  fecha: number;
  categoria: number;
  monto: number;
  descripcion: number;
  metodoPago?: number;
}

// ============================================================================
// Gráficos
// ============================================================================

export interface DatosGraficoPastel {
  name: string;
  value: number;
  color: string;
}

export interface DatosGraficoLinea {
  fecha: string;
  monto: number;
  categoria?: string;
}

export interface DatosGraficoBarra {
  categoria: string;
  mesActual: number;
  mesAnterior: number;
}

export type PeriodoGrafico = 'semana' | 'mes' | 'trimestre' | 'anio' | 'personalizado';

export interface FiltroGrafico {
  periodo: PeriodoGrafico;
  fechaInicio?: Date;
  fechaFin?: Date;
  categorias?: CategoriaGasto[];
}

// ============================================================================
// UI y Estados
// ============================================================================

export type EstadoCarga = 'idle' | 'loading' | 'success' | 'error';

export interface Estado<T> {
  data: T | null;
  estado: EstadoCarga;
  error: string | null;
}

export interface PaginacionState {
  pagina: number;
  porPagina: number;
  total: number;
  totalPaginas: number;
}

export type TemaApp = 'light' | 'dark' | 'system';

export interface ConfiguracionUsuario {
  tema: TemaApp;
  moneda: string;
  idioma: string;
  notificaciones: {
    email: boolean;
    push: boolean;
    alertasPresupuesto: boolean;
  };
}

// ============================================================================
// Autenticación
// ============================================================================

export interface AuthState {
  usuario: Usuario | null;
  cargando: boolean;
  error: string | null;
}

export interface LoginCredenciales {
  email: string;
  password: string;
}

export interface RegistroCredenciales {
  email: string;
  password: string;
  nombre: string;
}

// ============================================================================
// Utilidades de Tipo
// ============================================================================

export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

export type PartialFields<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export type OmitFirestoreFields<T> = Omit<T, 'id' | 'createdAt' | 'updatedAt'>;

// ============================================================================
// Errores Personalizados
// ============================================================================

export class GastosAppError extends Error {
  code: string;
  details?: unknown;

  constructor(
    message: string,
    code: string,
    details?: unknown
  ) {
    super(message);
    this.name = 'GastosAppError';
    this.code = code;
    this.details = details;
  }
}

export type ErrorCode =
  | 'AUTH_ERROR'
  | 'VALIDATION_ERROR'
  | 'NETWORK_ERROR'
  | 'FIREBASE_ERROR'
  | 'IMPORT_ERROR'
  | 'UNKNOWN_ERROR';
