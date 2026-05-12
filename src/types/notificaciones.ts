/**
 * Tipos para Notificaciones in-app.
 *
 * Las genera el backend cuando el cron de programados encuentra fallos:
 * saldo insuficiente, cuenta destino eliminada, error de API de tipo de
 * cambio, etc.
 *
 * El frontend las lee directamente desde Firestore vía `onSnapshot`. Las
 * mutaciones (marcar leída, borrar) pasan por la API o directo a Firestore
 * (las reglas permiten `update` SOLO del campo `leida` y `delete`).
 */

import { Timestamp } from 'firebase/firestore';

export const TIPOS_NOTIFICACION = [
  'saldo_insuficiente',
  'ejecucion_fallida',
  'cuenta_destino_eliminada',
  'fx_api_error',
] as const;

export type TipoNotificacion = (typeof TIPOS_NOTIFICACION)[number];

export const TIPO_NOTIFICACION_LABELS: Record<TipoNotificacion, string> = {
  saldo_insuficiente: 'Saldo insuficiente',
  ejecucion_fallida: 'Ejecución fallida',
  cuenta_destino_eliminada: 'Cuenta destino eliminada',
  fx_api_error: 'Error de tipo de cambio',
};

export const TIPO_NOTIFICACION_ICONS: Record<TipoNotificacion, string> = {
  saldo_insuficiente: '💸',
  ejecucion_fallida: '⚠️',
  cuenta_destino_eliminada: '🗑️',
  fx_api_error: '🌐',
};

export type EntidadNotificacion = 'gasto' | 'transferencia';

export interface NotificacionMetadata {
  monto?: number;
  moneda?: string;
  saldoActual?: number;
  [key: string]: string | number | boolean | undefined;
}

export interface Notificacion {
  id: string;
  userId: string;
  tipo: TipoNotificacion;
  programadaId: string;
  programadaTipo: EntidadNotificacion;
  mensaje: string;
  metadata?: NotificacionMetadata;
  leida: boolean;
  fechaEjecucionId?: string;
  createdAt: Date;
}

export interface NotificacionFirestore {
  userId: string;
  tipo: TipoNotificacion;
  programadaId: string;
  programadaTipo: EntidadNotificacion;
  mensaje: string;
  metadata?: NotificacionMetadata;
  leida: boolean;
  fechaEjecucionId?: string;
  createdAt: Timestamp;
}
