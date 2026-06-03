/**
 * Tipos y interfaces principales de la aplicación de gestión de gastos
 */

import { Timestamp } from 'firebase/firestore';

// ============================================================================
// Usuario
// ============================================================================

export type UserRole = 'admin' | 'pro' | 'standard' | 'promocional';
export type ProRequestStatus = 'none' | 'pending' | 'approved' | 'rejected';

export interface Usuario {
  id: string;
  email: string;
  nombre: string;
  photoURL?: string;
  role: UserRole;
  proRequestStatus: ProRequestStatus;
  /** Vencimiento del trial promocional (solo si role === 'promocional'). */
  promoExpiresAt?: Date;
  whatsappPhone?: string;
  whatsappLinkedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface UsuarioFirestore {
  email: string;
  nombre: string;
  photoURL?: string;
  role: UserRole;
  proRequestStatus: ProRequestStatus;
  promoExpiresAt?: Timestamp | null;
  whatsappPhone?: string;
  whatsappLinkedAt?: Timestamp;
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
  /** Cuenta de la que sale el dinero. Opcional durante migración (Fase 6). */
  accountId?: string;
  fecha: Date;
  categoria: CategoriaGasto;
  subcategoria?: string;
  monto: number;
  moneda: Moneda;
  descripcion: string;
  metodoPago: MetodoPago;
  tags?: string[];
  recurrente?: boolean;
  shoppingListId?: string;
  // Campos de información tributaria
  voucherType?: VoucherType;
  voucherNumber?: string;
  ruc?: string;
  igv?: number;
  subtotal?: number;
  reimbursementStatus?: ReimbursementStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface GastoFirestore {
  userId: string;
  accountId?: string;
  fecha: Timestamp;
  categoria: CategoriaGasto;
  subcategoria?: string;
  monto: number;
  moneda: Moneda;
  descripcion: string;
  metodoPago: MetodoPago;
  tags?: string[];
  recurrente?: boolean;
  shoppingListId?: string;
  // Campos de información tributaria
  voucherType?: VoucherType;
  voucherNumber?: string;
  ruc?: string;
  igv?: number;
  subtotal?: number;
  reimbursementStatus?: ReimbursementStatus;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Tipos para información tributaria
export const VOUCHER_TYPES = ['boleta', 'factura', 'recibo', 'ticket', 'nota-debito', 'nota-credito'] as const;
export type VoucherType = (typeof VOUCHER_TYPES)[number];

export const REIMBURSEMENT_STATUSES = ['pending', 'approved', 'rejected', 'paid'] as const;
export type ReimbursementStatus = (typeof REIMBURSEMENT_STATUSES)[number];

export interface GastoFormData {
  fecha: string;
  hora: string;
  accountId?: string;
  categoria: CategoriaGasto;
  subcategoria?: string;
  monto: string;
  moneda: Moneda;
  descripcion: string;
  metodoPago: MetodoPago;
  tags?: string[];
  recurrente?: boolean;
  shoppingListId?: string;
  // Campos de información tributaria
  voucherType: VoucherType;
  voucherNumber?: string;
  ruc?: string;
  igv?: string;
  subtotal?: string;
  reimbursementStatus: ReimbursementStatus;
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

/**
 * Bucket especial "efectivo": dentro del presupuesto general de una cuenta,
 * representa cuánto del total el usuario piensa retirar / gastar en efectivo.
 * Un gasto en efectivo descuenta de SU CATEGORÍA (alimento, transporte, …) Y
 * además de este bucket "efectivo" en paralelo.
 */
export const BUCKET_EFECTIVO = 'efectivo' as const;

/**
 * Tipo del bucket dentro del presupuesto de una cuenta.
 * - 'general': el techo total de la cuenta para el mes.
 * - 'efectivo': cuánto del general piensas mover a/gastar en efectivo.
 * - <categoriaId>: una subasignación a una categoría real (string libre porque
 *   las categorías son configurables por el usuario, no solo el enum por defecto).
 *
 * Validación: limiteGeneral >= Σ(limitesCategorias) + limiteEfectivo
 */
export type PresupuestoBucket = 'general' | typeof BUCKET_EFECTIVO | string;

export interface Presupuesto {
  id: string;
  userId: string;
  /** Cuenta a la que pertenece este presupuesto. */
  accountId: string;
  mes: string; // formato: YYYY-MM
  bucket: PresupuestoBucket;
  limite: number;
  moneda: Moneda;
  /**
   * Carry-over POSITIVO o NEGATIVO desde el mes anterior. Solo aplica al
   * bucket 'general'. Se calcula lazy en el backend al consultar el mes.
   */
  rolloverEntrada?: number;
  /** Calculado por el backend al consultar (no persistido). */
  gastado?: number;
  /** Calculado por el backend al consultar (no persistido). */
  disponible?: number;
  /** True cuando `gastado` supera el `limite + rollover`. */
  excede?: boolean;
  /** Porcentaje gastado respecto al techo (limite + rollover). */
  porcentaje?: number;
  alertaEnviada80?: boolean;
  alertaEnviada100?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Estado puntual de un bucket. Lo devuelve el backend tras crear/editar/borrar
 * un gasto, para que el frontend pueda mostrar inmediatamente alertas de
 * sobregiro de la categoría sin volver a pedir el resumen completo.
 */
export interface BucketAlert {
  bucket: string;
  limite: number;
  gastado: number;
  disponible: number;
  excede: boolean;
  porcentaje: number;
}

export interface PresupuestoFirestore {
  userId: string;
  accountId: string;
  mes: string;
  bucket: PresupuestoBucket;
  limite: number;
  moneda: Moneda;
  rolloverEntrada?: number;
  alertaEnviada80?: boolean;
  alertaEnviada100?: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface PresupuestoFormData {
  accountId: string;
  mes: string;
  bucket: PresupuestoBucket;
  limite: string;
}

/**
 * Snapshot del presupuesto de una cuenta para un mes específico.
 *
 * Modelo Opción B: el techo del mes es el saldo de la cuenta (`accountBalance`).
 * El bucket `general` queda LEGACY (se sigue devolviendo si existe pero el
 * frontend nuevo no lo crea).
 */
export interface PresupuestoMensualResumen {
  accountId: string;
  mes: string;
  moneda: string;
  /** Bucket general LEGACY. Solo aparece si existe en datos viejos. */
  general?: Presupuesto;
  /** Buckets de categorías (excluye 'efectivo'). */
  categorias: Presupuesto[];
  /** Bucket de efectivo. */
  efectivo?: Presupuesto;
  /** Total gastado en el mes (suma de gastos de la cuenta). */
  totalGastado: number;
  /** Total asignado en categorías + efectivo. */
  totalAsignado: number;
  /** Saldo actual de la cuenta = bankBalance + cashBalance. */
  accountBalance: number;
  /** True cuando totalAsignado > accountBalance. */
  excedeAsignacion: boolean;
  /** Disponible no asignado a ningún bucket. */
  disponibleSinAsignar: number;
}

export interface CreatePresupuestoDto {
  accountId: string;
  mes: string;
  bucket: PresupuestoBucket;
  limite: number;
  moneda?: Moneda;
}

export interface UpdatePresupuestoDto {
  limite?: number;
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
// LEGACY: tipos del modelo viejo (PresupuestoEfectivo, Movimientos, AbonosEfectivo)
// ============================================================================
// Eliminados en Fase 6.7. Las colecciones Firestore correspondientes
// (`presupuestosEfectivo`, `movimientos`, `abonosEfectivo`) ya no se usan.
// El cleanup de datos viejos para usuarios al borrarlos se mantiene en el
// backend (`users.service.ts`) por compatibilidad con bases existentes.
// El modelo Opción B (multi-cuenta + cash-movements) cubre todos estos casos.

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

export type TemaApp = 'light' | 'dark' | 'medium' | 'system';

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

// ============================================================================
// Cuentas (Multi-cuenta — Fase 2/3)
// ============================================================================

export const ACCOUNT_TYPES = ['bank', 'savings', 'wallet', 'card', 'other'] as const;
export type AccountType = (typeof ACCOUNT_TYPES)[number];

export const ACCOUNT_STATUSES = ['active', 'archived'] as const;
export type AccountStatus = (typeof ACCOUNT_STATUSES)[number];

export const ACCOUNT_TYPE_LABELS: Record<AccountType, string> = {
  bank: 'Banco',
  savings: 'Ahorros',
  wallet: 'Billetera digital',
  card: 'Tarjeta',
  other: 'Otro',
};

export const ACCOUNT_TYPE_ICONS: Record<AccountType, string> = {
  bank: '🏦',
  savings: '🐷',
  wallet: '📱',
  card: '💳',
  other: '📦',
};

/**
 * Lista sugerida de bancos peruanos. El campo `bank` admite texto libre,
 * por lo que el usuario puede escribir cualquier otro.
 */
export const BANCOS_PERU = [
  'BCP',
  'BBVA',
  'Interbank',
  'Scotiabank',
  'Banco de la Nación',
  'BanBif',
  'Pichincha',
  'Banco Falabella',
  'Banco Ripley',
  'Banco GNB',
  'ICBC',
  'Citibank',
  'Alfin',
  'Mibanco',
  'Compartamos',
] as const;

/**
 * Cuenta del usuario. Tiene 2 sub-saldos:
 *   - bankBalance: dinero en la cuenta bancaria/wallet/tarjeta.
 *   - cashBalance: dinero ya retirado (en efectivo) que vino de esta cuenta.
 *
 * El saldo total disponible = bankBalance + cashBalance.
 * El "Efectivo total" del usuario es la suma de cashBalance de todas sus cuentas.
 */
export interface Account {
  id: string;
  userId: string;
  name: string;
  type: AccountType;
  bank?: string;
  /** Código ISO de la moneda (PEN, USD, …). Coincide con `Moneda` por ahora. */
  currency: string;
  icon?: string;
  color?: string;
  initialBankBalance: number;
  initialCashBalance: number;
  bankBalance: number;
  cashBalance: number;
  /** Si suma al patrimonio total del Dashboard. */
  includeInTotal: boolean;
  isDefault: boolean;
  status: AccountStatus;
  /** Solo para type=card. Modelo simple: saldo puede ser negativo. */
  creditLimit?: number;
  /**
   * Datos de tarjeta cifrados (solo para type='card'). El número completo va
   * encriptado con AES-GCM y una clave derivada del userId. CVC NUNCA se
   * almacena (PCI-DSS). Mostramos `cardLast4` en plano para identificación.
   */
  cardData?: EncryptedCardData;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Datos de tarjeta listos para persistir. El campo `cardNumberEnc` contiene
 * el número de tarjeta cifrado en base64 (formato: salt:iv:ciphertext).
 * CVC NO se incluye en este modelo: el usuario debe recordarlo o guardarlo
 * en su gestor de contraseñas.
 */
export interface EncryptedCardData {
  /** Número completo cifrado (formato base64 "salt.iv.ciphertext"). */
  cardNumberEnc: string;
  /** Últimos 4 dígitos en plano para mostrar "•••• 4321" en listados. */
  cardLast4: string;
  /** Nombre del titular tal como figura en la tarjeta. */
  holderName: string;
  /** Mes de vencimiento (1–12). */
  expMonth: number;
  /** Año de vencimiento (4 dígitos). */
  expYear: number;
  /** Marca: visa, mastercard, amex, otra. */
  brand?: 'visa' | 'mastercard' | 'amex' | 'other';
}

export interface AccountFirestore {
  userId: string;
  name: string;
  type: AccountType;
  bank?: string;
  currency: string;
  icon?: string;
  color?: string;
  initialBankBalance: number;
  initialCashBalance: number;
  bankBalance: number;
  cashBalance: number;
  includeInTotal: boolean;
  isDefault: boolean;
  status: AccountStatus;
  creditLimit?: number;
  cardData?: EncryptedCardData;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface CreateAccountDto {
  name: string;
  type: AccountType;
  bank?: string;
  currency: string;
  icon?: string;
  color?: string;
  initialBankBalance?: number;
  initialCashBalance?: number;
  includeInTotal?: boolean;
  isDefault?: boolean;
  creditLimit?: number;
  cardData?: EncryptedCardData;
}

export type UpdateAccountDto = Partial<Omit<CreateAccountDto, 'currency'>> & {
  status?: AccountStatus;
};

/** Saldo total = bankBalance + cashBalance. Helper centralizado. */
export function getAccountTotalBalance(account: Pick<Account, 'bankBalance' | 'cashBalance'>): number {
  return account.bankBalance + account.cashBalance;
}

// ============================================================================
// Cash Movements (retiros / depósitos dentro de la misma cuenta)
// ============================================================================

export type CashMovementType =
  | 'withdrawal'
  | 'deposit_cash'
  | 'income'
  | 'reversal';

export const CASH_MOVEMENT_LABELS: Record<CashMovementType, string> = {
  withdrawal: 'Retiro al efectivo',
  deposit_cash: 'Depósito de efectivo',
  income: 'Ingreso externo',
  reversal: 'Reverso',
};

/** Origen de un ingreso externo (solo aplica cuando type='income'). */
export type IncomeSource =
  | 'unspecified'
  | 'salary'
  | 'loan'
  | 'debt'
  | 'cts'
  | 'afp'
  | 'other';

export const INCOME_SOURCES: readonly IncomeSource[] = [
  'unspecified',
  'salary',
  'loan',
  'debt',
  'cts',
  'afp',
  'other',
] as const;

export const INCOME_SOURCE_LABELS: Record<IncomeSource, string> = {
  unspecified: 'Sin especificar',
  salary: 'Cuenta sueldo',
  loan: 'Préstamo',
  debt: 'Deuda',
  cts: 'CTS',
  afp: 'AFP',
  other: 'Otros',
};

/** Sub-saldo destino del ingreso. Default: 'bank'. */
export type IncomeDestination = 'bank' | 'cash';

export interface CashMovement {
  id: string;
  userId: string;
  accountId: string;
  type: CashMovementType;
  amount: number;
  currency: string;
  description?: string;
  /** Solo presente cuando type='income'. */
  source?: IncomeSource;
  /** Solo presente cuando type='income'. Default 'bank'. */
  destination?: IncomeDestination;
  /** Solo presente cuando type='reversal': id del movimiento que revierte. */
  revertsMovementId?: string;
  /** Cuando un movimiento fue revertido, guarda el id del 'reversal'. */
  revertedBy?: string;
  /** Timestamp en que fue revertido. */
  revertedAt?: Date;
  date: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface CashMovementFirestore {
  userId: string;
  accountId: string;
  type: CashMovementType;
  amount: number;
  currency: string;
  description?: string;
  source?: IncomeSource;
  destination?: IncomeDestination;
  revertsMovementId?: string;
  revertedBy?: string;
  revertedAt?: Timestamp;
  date: Timestamp;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface CreateCashMovementDto {
  amount: number;
  description?: string;
  /** ISO datetime. Default: ahora. */
  date?: string;
}

export interface CreateIncomeDto extends CreateCashMovementDto {
  source: IncomeSource;
  destination?: IncomeDestination;
}

// ============================================================================
// Transferencias entre cuentas
// ============================================================================

export interface Transfer {
  id: string;
  userId: string;
  fromAccountId: string;
  toAccountId: string;
  amount: number;
  amountConverted?: number;
  exchangeRate?: number;
  fromCurrency: string;
  toCurrency: string;
  fee?: number;
  description?: string;
  date: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface TransferFirestore {
  userId: string;
  fromAccountId: string;
  toAccountId: string;
  amount: number;
  amountConverted?: number;
  exchangeRate?: number;
  fromCurrency: string;
  toCurrency: string;
  fee?: number;
  description?: string;
  date: Timestamp;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface CreateTransferDto {
  fromAccountId: string;
  toAccountId: string;
  amount: number;
  amountConverted?: number;
  exchangeRate?: number;
  fee?: number;
  description?: string;
  /** ISO datetime. Default: ahora. */
  date?: string;
}

// ============================================================================
// Programaciones (Gastos / Transferencias recurrentes)
// ============================================================================

export type {
  FrecuenciaProgramado,
  EstadoEjecucion,
  ScheduleConfig,
  GastoProgramado,
  GastoProgramadoFirestore,
  CreateGastoProgramadoDto,
  UpdateGastoProgramadoDto,
  TransferenciaProgramada,
  TransferenciaProgramadaFirestore,
  CreateTransferenciaProgramadaDto,
  UpdateTransferenciaProgramadaDto,
  EjecucionProgramada,
} from './programados';

export {
  FRECUENCIAS_PROGRAMADO,
  FRECUENCIA_LABELS,
  DIAS_SEMANA_LABELS,
  ESTADOS_EJECUCION,
} from './programados';

// ============================================================================
// Notificaciones
// ============================================================================

export type {
  TipoNotificacion,
  EntidadNotificacion,
  NotificacionMetadata,
  Notificacion,
  NotificacionFirestore,
} from './notificaciones';

export {
  TIPOS_NOTIFICACION,
  TIPO_NOTIFICACION_LABELS,
  TIPO_NOTIFICACION_ICONS,
} from './notificaciones';

// ============================================================================
// Métricas (módulo PRO de gráficos/analytics)
// ============================================================================

export type {
  TendenciaMetrica,
  AnalyticsSummary,
  MetricsAiResult,
  MetricsAiAnswer,
  MetricasFiltros,
  ExportMetricasFormato,
  RoastTono,
  MetricsRoast,
  MetricsRoastImage,
} from './metricas';

// ============================================================================
// Consumo IA (Fase 1: tracking — panel admin)
// ============================================================================

export type {
  AiUsageBucketStat,
  AiUsageRollup,
  AiUsageUserRow,
  AiUsageSortBy,
  QuotaSnapshot,
  QuotaConfig,
  QuotaConfigResponse,
  ProviderCost,
  VendorCost,
} from './aiUsage';

// ============================================================================
// Analítica de flujos (diagnóstico de producto — panel admin)
// ============================================================================

export type {
  UsageSnapshot,
  UsageOverview,
  ClientEventName,
  SessionSummary,
} from './analyticsEvents';

