/**
 * Schemas Zod para validación de Gastos Programados.
 *
 * Validaciones condicionales por frecuencia mediante .superRefine.
 */

import { z } from 'zod';
import {
  CATEGORIAS_GASTO,
  METODOS_PAGO,
  MONEDAS,
  FRECUENCIAS_PROGRAMADO,
} from '@app-types';
import type { FrecuenciaProgramado } from '@app-types';

/**
 * Refines compartidos para validar el bloque de schedule según frecuencia.
 * Reutilizado por gasto y transferencia programada.
 */
function aplicarValidacionesSchedule(
  data: {
    frecuencia: FrecuenciaProgramado;
    diaEjecucion?: number;
    ultimoDiaDelMes?: boolean;
    intervaloDias?: number;
    fechaUnica?: string;
    fechaInicio: string;
    fechaFin?: string;
  },
  ctx: z.RefinementCtx,
): void {
  switch (data.frecuencia) {
    case 'diaria':
      // Sin campos extra
      break;
    case 'semanal':
      if (
        data.diaEjecucion === undefined ||
        data.diaEjecucion < 0 ||
        data.diaEjecucion > 6
      ) {
        ctx.addIssue({
          code: 'custom',
          path: ['diaEjecucion'],
          message: 'Selecciona un día de la semana (0-6)',
        });
      }
      break;
    case 'mensual': {
      const tieneDia = data.diaEjecucion !== undefined;
      const usaUltimo = data.ultimoDiaDelMes === true;
      if (tieneDia && usaUltimo) {
        ctx.addIssue({
          code: 'custom',
          path: ['ultimoDiaDelMes'],
          message: 'No combines día específico con "último día del mes"',
        });
      }
      if (!tieneDia && !usaUltimo) {
        ctx.addIssue({
          code: 'custom',
          path: ['diaEjecucion'],
          message: 'Indica el día del mes o marca "último día del mes"',
        });
      }
      if (tieneDia && (data.diaEjecucion! < 1 || data.diaEjecucion! > 31)) {
        ctx.addIssue({
          code: 'custom',
          path: ['diaEjecucion'],
          message: 'El día debe estar entre 1 y 31',
        });
      }
      break;
    }
    case 'personalizada':
      if (!data.intervaloDias || data.intervaloDias < 1) {
        ctx.addIssue({
          code: 'custom',
          path: ['intervaloDias'],
          message: 'Indica cada cuántos días repetir (mínimo 1)',
        });
      }
      break;
    case 'unica':
      if (!data.fechaUnica) {
        ctx.addIssue({
          code: 'custom',
          path: ['fechaUnica'],
          message: 'Selecciona una fecha',
        });
      } else if (new Date(data.fechaUnica).getTime() < Date.now()) {
        ctx.addIssue({
          code: 'custom',
          path: ['fechaUnica'],
          message: 'La fecha debe estar en el futuro',
        });
      }
      break;
  }

  if (
    data.fechaFin &&
    new Date(data.fechaFin).getTime() <= new Date(data.fechaInicio).getTime()
  ) {
    ctx.addIssue({
      code: 'custom',
      path: ['fechaFin'],
      message: 'La fecha fin debe ser posterior al inicio',
    });
  }
}

const horaRegex = /^([01]?\d|2[0-3]):[0-5]\d$/;
const isoDateRegex = /^\d{4}-\d{2}-\d{2}T/;

export const gastoProgramadoFormSchema = z
  .object({
    cuentaOrigenId: z.string().min(1, 'Selecciona una cuenta de origen'),
    monto: z
      .number({ message: 'El monto debe ser un número' })
      .positive('El monto debe ser mayor a 0'),
    moneda: z.enum(MONEDAS),
    descripcion: z
      .string()
      .min(3, 'Mínimo 3 caracteres')
      .max(200, 'Máximo 200 caracteres'),
    categoria: z.enum(CATEGORIAS_GASTO),
    subcategoria: z.string().optional(),
    metodoPago: z.enum(METODOS_PAGO),
    tags: z.array(z.string()).optional(),

    frecuencia: z.enum(FRECUENCIAS_PROGRAMADO),
    diaEjecucion: z.number().int().optional(),
    ultimoDiaDelMes: z.boolean().optional(),
    intervaloDias: z.number().int().min(1).optional(),
    fechaUnica: z.string().regex(isoDateRegex, 'Fecha única inválida').optional(),
    hora: z.string().regex(horaRegex, "Formato 'HH:mm'"),
    zonaHoraria: z.string().min(1, 'Zona horaria requerida'),
    fechaInicio: z.string().regex(isoDateRegex, 'Fecha de inicio inválida'),
    fechaFin: z.string().regex(isoDateRegex, 'Fecha fin inválida').optional(),
  })
  .superRefine(aplicarValidacionesSchedule);

export type GastoProgramadoFormData = z.infer<typeof gastoProgramadoFormSchema>;

// ============================================================================
// TRANSFERENCIA PROGRAMADA
// ============================================================================

export const transferenciaProgramadaFormSchema = z
  .object({
    cuentaOrigenId: z.string().min(1, 'Selecciona la cuenta de origen'),
    cuentaDestinoId: z.string().min(1, 'Selecciona la cuenta de destino'),
    monto: z
      .number({ message: 'El monto debe ser un número' })
      .positive('El monto debe ser mayor a 0'),
    moneda: z.enum(MONEDAS),
    descripcion: z.string().max(200).optional(),

    frecuencia: z.enum(FRECUENCIAS_PROGRAMADO),
    diaEjecucion: z.number().int().optional(),
    ultimoDiaDelMes: z.boolean().optional(),
    intervaloDias: z.number().int().min(1).optional(),
    fechaUnica: z.string().regex(isoDateRegex, 'Fecha única inválida').optional(),
    hora: z.string().regex(horaRegex, "Formato 'HH:mm'"),
    zonaHoraria: z.string().min(1, 'Zona horaria requerida'),
    fechaInicio: z.string().regex(isoDateRegex, 'Fecha de inicio inválida'),
    fechaFin: z.string().regex(isoDateRegex, 'Fecha fin inválida').optional(),
  })
  .superRefine((data, ctx) => {
    if (data.cuentaOrigenId === data.cuentaDestinoId) {
      ctx.addIssue({
        code: 'custom',
        path: ['cuentaDestinoId'],
        message: 'Las cuentas origen y destino deben ser distintas',
      });
    }
    aplicarValidacionesSchedule(data, ctx);
  });

export type TransferenciaProgramadaFormData = z.infer<
  typeof transferenciaProgramadaFormSchema
>;
