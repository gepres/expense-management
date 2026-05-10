/**
 * Cálculo de próxima ejecución de una programación.
 *
 * NOTA: Esta utilidad se usa en el frontend para mostrar al usuario "cuándo
 * será la próxima ejecución" antes de que el backend confirme. El cron del
 * backend es la fuente autoritativa y maneja timezone con date-fns-tz.
 *
 * Aquí usamos hora local del navegador (que en 99% de casos coincide con la
 * zona que el usuario configuró). Si difieren significativamente, el backend
 * recalculará al persistir.
 */

import {
  addDays,
  addMonths,
  setDate,
  setHours,
  setMinutes,
  setSeconds,
  setMilliseconds,
  endOfMonth,
  isBefore,
  isAfter,
  startOfDay,
  isSameDay,
  getDay,
  getDate,
  isValid,
} from 'date-fns';
import type {
  FrecuenciaProgramado,
  ScheduleConfig,
} from '@app-types';

export interface CalcularProximaEjecucionInput {
  frecuencia: FrecuenciaProgramado;
  /** 'HH:mm'. */
  hora: string;
  fechaInicio: Date;
  fechaFin?: Date;
  ultimaEjecucion?: Date;
  /** Solo semanal (0-6) o mensual (1-31). */
  diaEjecucion?: number;
  /** Solo mensual. */
  ultimoDiaDelMes?: boolean;
  /** Solo personalizada. */
  intervaloDias?: number;
  /** Solo unica. */
  fechaUnica?: Date;
  /** "Ahora" para tests. Default: new Date(). */
  ahora?: Date;
}

/**
 * Devuelve la próxima fecha en que se debe ejecutar la programación.
 * Devuelve `null` si ya no quedan ejecuciones (frecuencia única ya disparada,
 * o fechaFin alcanzada).
 */
export function calcularProximaEjecucion(
  input: CalcularProximaEjecucionInput,
): Date | null {
  const ahora = input.ahora ?? new Date();
  const { hora, frecuencia, fechaInicio, fechaFin, ultimaEjecucion } = input;

  if (!isValid(fechaInicio)) {
    throw new Error('fechaInicio inválida');
  }

  const [horas, minutos] = parseHora(hora);

  // Para frecuencia única
  if (frecuencia === 'unica') {
    if (!input.fechaUnica) return null;
    if (ultimaEjecucion) return null; // ya se ejecutó
    const candidata = aplicarHora(input.fechaUnica, horas, minutos);
    if (isBefore(candidata, ahora)) return null;
    return candidata;
  }

  // Base: si ya hubo una ejecución, partimos desde el día siguiente.
  // Si no, partimos desde fechaInicio.
  const base = ultimaEjecucion
    ? aplicarHora(addDays(ultimaEjecucion, 1), horas, minutos)
    : aplicarHora(fechaInicio, horas, minutos);

  let candidata: Date;

  switch (frecuencia) {
    case 'semanal': {
      const diaTarget = input.diaEjecucion ?? getDay(fechaInicio);
      candidata = siguienteDiaSemana(base, diaTarget);
      // Si la base ya cae en el día target pero la hora ya pasó (y no hubo ultimaEjecucion), pasa a la próxima semana.
      if (
        !ultimaEjecucion &&
        isSameDay(candidata, ahora) &&
        isBefore(candidata, ahora)
      ) {
        candidata = addDays(candidata, 7);
      }
      break;
    }

    case 'quincenal': {
      // Cada 15 días desde fechaInicio.
      const refStart = aplicarHora(fechaInicio, horas, minutos);
      if (ultimaEjecucion) {
        candidata = aplicarHora(addDays(ultimaEjecucion, 15), horas, minutos);
      } else {
        // Buscar el primer múltiplo de 15 días desde fechaInicio que sea >= ahora.
        candidata = refStart;
        while (isBefore(candidata, ahora)) {
          candidata = addDays(candidata, 15);
        }
      }
      break;
    }

    case 'mensual': {
      candidata = siguienteEjecucionMensual(
        base,
        ahora,
        ultimaEjecucion,
        input.diaEjecucion,
        input.ultimoDiaDelMes,
        horas,
        minutos,
        fechaInicio,
      );
      break;
    }

    case 'personalizada': {
      const intervalo = input.intervaloDias;
      if (!intervalo || intervalo < 1) {
        throw new Error('intervaloDias debe ser >= 1 para personalizada');
      }
      const refStart = aplicarHora(fechaInicio, horas, minutos);
      if (ultimaEjecucion) {
        candidata = aplicarHora(
          addDays(ultimaEjecucion, intervalo),
          horas,
          minutos,
        );
      } else {
        candidata = refStart;
        while (isBefore(candidata, ahora)) {
          candidata = addDays(candidata, intervalo);
        }
      }
      break;
    }

    default: {
      const _exhaustive: never = frecuencia;
      throw new Error(`Frecuencia no soportada: ${String(_exhaustive)}`);
    }
  }

  // Respetar fechaFin
  if (fechaFin && isAfter(candidata, fechaFin)) {
    return null;
  }

  return candidata;
}

// ============================================================================
// Helpers internos
// ============================================================================

function parseHora(hora: string): [number, number] {
  const m = /^(\d{1,2}):(\d{2})$/.exec(hora);
  if (!m) throw new Error(`Hora inválida: ${hora}. Esperado 'HH:mm'.`);
  const h = Number(m[1]);
  const min = Number(m[2]);
  if (h < 0 || h > 23 || min < 0 || min > 59) {
    throw new Error(`Hora fuera de rango: ${hora}`);
  }
  return [h, min];
}

function aplicarHora(fecha: Date, horas: number, minutos: number): Date {
  return setMilliseconds(setSeconds(setMinutes(setHours(fecha, horas), minutos), 0), 0);
}

function siguienteDiaSemana(desde: Date, diaTarget: number): Date {
  const diaActual = getDay(desde);
  let diff = diaTarget - diaActual;
  if (diff < 0) diff += 7;
  return addDays(desde, diff);
}

function siguienteEjecucionMensual(
  base: Date,
  ahora: Date,
  ultimaEjecucion: Date | undefined,
  diaEjecucion: number | undefined,
  ultimoDiaDelMes: boolean | undefined,
  horas: number,
  minutos: number,
  fechaInicio: Date,
): Date {
  // Determinar día target dentro del mes
  const calcularDelMes = (mes: Date): Date => {
    if (ultimoDiaDelMes) {
      const ultimo = endOfMonth(mes);
      return aplicarHora(ultimo, horas, minutos);
    }
    const dia = diaEjecucion ?? getDate(fechaInicio);
    // Si el día no existe en ese mes (ej: 31 en febrero), usar último día.
    const ultimo = getDate(endOfMonth(mes));
    const diaReal = Math.min(dia, ultimo);
    return aplicarHora(setDate(mes, diaReal), horas, minutos);
  };

  // Punto de partida: si hay última ejecución, mes siguiente al de la última.
  // Si no, mes de la base (que es fechaInicio).
  let cursor = ultimaEjecucion ? addMonths(ultimaEjecucion, 1) : base;
  let candidata = calcularDelMes(cursor);

  // Avanzar mes a mes hasta encontrar una candidata >= ahora.
  while (isBefore(candidata, ahora)) {
    cursor = addMonths(cursor, 1);
    candidata = calcularDelMes(cursor);
  }

  return candidata;
}

// ============================================================================
// Formato humano de la frecuencia (para UI)
// ============================================================================

const DIAS_NOMBRE = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];

export function describirFrecuencia(
  config: Pick<
    ScheduleConfig,
    'frecuencia' | 'diaEjecucion' | 'ultimoDiaDelMes' | 'intervaloDias' | 'fechaUnica'
  >,
): string {
  const f = config.frecuencia;
  switch (f) {
    case 'semanal': {
      // diaEjecucion debe estar en 0-6; si viene fuera de rango (ej. al
      // cambiar de mensual donde era 10) caemos a lunes para no romper.
      const dia = config.diaEjecucion;
      const valido = typeof dia === 'number' && dia >= 0 && dia <= 6;
      return `Cada ${DIAS_NOMBRE[valido ? dia : 1]}`;
    }
    case 'quincenal':
      return 'Cada 15 días';
    case 'mensual': {
      if (config.ultimoDiaDelMes) return 'Último día de cada mes';
      // diaEjecucion debe estar en 1-31; clamp si quedó en 0 (de semanal).
      const dia = config.diaEjecucion;
      const valido = typeof dia === 'number' && dia >= 1 && dia <= 31;
      return `Día ${valido ? dia : 1} de cada mes`;
    }
    case 'personalizada':
      return `Cada ${config.intervaloDias ?? 1} días`;
    case 'unica':
      return 'Una sola vez';
    default: {
      const _exhaustive: never = f;
      return String(_exhaustive);
    }
  }
}

// Ya no usado pero exportado por si lo quiere otro consumidor.
export function startOfDayLocal(d: Date): Date {
  return startOfDay(d);
}
