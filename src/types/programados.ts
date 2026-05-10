/**
 * Tipos para Programaciones (Gastos y Transferencias recurrentes).
 *
 * Una "programación" es una plantilla que el backend ejecuta automáticamente
 * según su frecuencia, generando un Gasto (o Transfer) real en cada disparo.
 *
 * Fase 1: GastoProgramado únicamente. Las TransferenciaProgramada se incluyen
 * tipadas pero su CRUD se implementa en Fase 2.
 */

import { Timestamp } from 'firebase/firestore';
import type {
  CategoriaGasto,
  MetodoPago,
  Moneda,
} from './index';

// ============================================================================
// FRECUENCIA
// ============================================================================

export const FRECUENCIAS_PROGRAMADO = [
  'semanal',
  'quincenal',
  'mensual',
  'personalizada',
  'unica',
] as const;

export type FrecuenciaProgramado = (typeof FRECUENCIAS_PROGRAMADO)[number];

export const FRECUENCIA_LABELS: Record<FrecuenciaProgramado, string> = {
  semanal: 'Semanal',
  quincenal: 'Quincenal (cada 15 días)',
  mensual: 'Mensual',
  personalizada: 'Personalizada (cada N días)',
  unica: 'Única',
};

// Día de la semana (0 = domingo, 6 = sábado) — coincide con Date.getDay()
export const DIAS_SEMANA_LABELS: Record<number, string> = {
  0: 'Domingo',
  1: 'Lunes',
  2: 'Martes',
  3: 'Miércoles',
  4: 'Jueves',
  5: 'Viernes',
  6: 'Sábado',
};

// ============================================================================
// ESTADO DE EJECUCIÓN
// ============================================================================

export const ESTADOS_EJECUCION = [
  'exitosa',
  'fallida',
  'saldo_insuficiente',
  'cancelada',
] as const;

export type EstadoEjecucion = (typeof ESTADOS_EJECUCION)[number];

// ============================================================================
// SCHEDULE (campos comunes a Gasto y Transferencia programada)
// ============================================================================

/**
 * Configuración de cuándo ejecutar la programación.
 * Los campos opcionales se aplican solo según `frecuencia`:
 *   - semanal       → diaEjecucion (0-6)
 *   - quincenal     → ningún campo extra (usa fechaInicio + cada 15 días)
 *   - mensual       → diaEjecucion (1-31) O ultimoDiaDelMes
 *   - personalizada → intervaloDias (>= 1)
 *   - unica         → fechaUnica (>= ahora al crear)
 */
export interface ScheduleConfig {
  frecuencia: FrecuenciaProgramado;
  /** 0-6 si semanal; 1-31 si mensual. Ignorado en otros casos. */
  diaEjecucion?: number;
  /** Si true (solo mensual), ignora diaEjecucion y usa último día. */
  ultimoDiaDelMes?: boolean;
  /** Solo si frecuencia === 'personalizada'. Mínimo 1. */
  intervaloDias?: number;
  /** Solo si frecuencia === 'unica'. */
  fechaUnica?: Date;
  /** Hora local 'HH:mm'. Default '12:00'. */
  hora: string;
  /** IANA timezone. Ej: 'America/Lima'. Default zona del usuario. */
  zonaHoraria: string;
  /** Desde cuándo aplica. Required. */
  fechaInicio: Date;
  /** Hasta cuándo (inclusive). Opcional, si null nunca termina. */
  fechaFin?: Date;
}

// ============================================================================
// GASTO PROGRAMADO
// ============================================================================

export interface GastoProgramado extends ScheduleConfig {
  id: string;
  userId: string;

  // Datos del gasto a generar
  cuentaOrigenId: string;
  monto: number;
  moneda: Moneda;
  descripcion: string;
  categoria: CategoriaGasto;
  subcategoria?: string;
  metodoPago: MetodoPago;
  tags?: string[];

  // Estado
  activo: boolean;
  proximaEjecucion: Date;
  ultimaEjecucion?: Date;
  totalEjecuciones: number;

  createdAt: Date;
  updatedAt: Date;
}

export interface GastoProgramadoFirestore {
  userId: string;
  cuentaOrigenId: string;
  monto: number;
  moneda: Moneda;
  descripcion: string;
  categoria: CategoriaGasto;
  subcategoria?: string;
  metodoPago: MetodoPago;
  tags?: string[];

  frecuencia: FrecuenciaProgramado;
  diaEjecucion?: number;
  ultimoDiaDelMes?: boolean;
  intervaloDias?: number;
  fechaUnica?: Timestamp;
  hora: string;
  zonaHoraria: string;
  fechaInicio: Timestamp;
  fechaFin?: Timestamp;

  activo: boolean;
  proximaEjecucion: Timestamp;
  ultimaEjecucion?: Timestamp;
  totalEjecuciones: number;

  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface CreateGastoProgramadoDto {
  cuentaOrigenId: string;
  monto: number;
  moneda: Moneda;
  descripcion: string;
  categoria: CategoriaGasto;
  subcategoria?: string;
  metodoPago: MetodoPago;
  tags?: string[];

  frecuencia: FrecuenciaProgramado;
  diaEjecucion?: number;
  ultimoDiaDelMes?: boolean;
  intervaloDias?: number;
  /** ISO datetime si frecuencia === 'unica'. */
  fechaUnica?: string;
  hora: string;
  zonaHoraria: string;
  /** ISO datetime. */
  fechaInicio: string;
  /** ISO datetime. */
  fechaFin?: string;
}

export type UpdateGastoProgramadoDto = Partial<CreateGastoProgramadoDto> & {
  activo?: boolean;
};

// ============================================================================
// TRANSFERENCIA PROGRAMADA (Fase 2 — tipos definidos, CRUD pendiente)
// ============================================================================

export interface TransferenciaProgramada extends ScheduleConfig {
  id: string;
  userId: string;

  cuentaOrigenId: string;
  cuentaDestinoId: string;
  monto: number;
  moneda: Moneda;
  descripcion?: string;

  activo: boolean;
  proximaEjecucion: Date;
  ultimaEjecucion?: Date;
  totalEjecuciones: number;

  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// EJECUCIÓN (auditoría de cada disparo del cron)
// ============================================================================

export interface EjecucionProgramada {
  id: string;
  programadaId: string;
  tipo: 'gasto' | 'transferencia';
  /** Cuándo debió ejecutarse según el schedule. */
  fechaProgramada: Date;
  /** Cuándo el cron lo procesó. */
  fechaEjecutada: Date;
  estado: EstadoEjecucion;
  /** ID del Gasto/Transfer real generado, si exitosa. */
  gastoCreadoId?: string;
  transferCreadoId?: string;
  errorMensaje?: string;
}
