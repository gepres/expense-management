/**
 * Utilidades de validación
 */

import { z } from 'zod';
import type { CategoriaGasto, MetodoPago } from '@types/index';
import { CATEGORIAS_GASTO, METODOS_PAGO } from '@types/index';

// ============================================================================
// Schemas de Validación con Zod
// ============================================================================

export const gastoFormSchema = z.object({
  fecha: z.string().refine(
    (val) => {
      const fecha = new Date(val);
      return !isNaN(fecha.getTime());
    },
    { message: 'Fecha inválida' }
  ),
  categoria: z.enum(CATEGORIAS_GASTO as [CategoriaGasto, ...CategoriaGasto[]], {
    errorMap: () => ({ message: 'Selecciona una categoría válida' }),
  }),
  monto: z
    .string()
    .min(1, 'El monto es requerido')
    .refine(
      (val) => {
        const numero = parseFloat(val);
        return !isNaN(numero) && numero > 0;
      },
      { message: 'El monto debe ser un número positivo' }
    ),
  descripcion: z
    .string()
    .min(3, 'La descripción debe tener al menos 3 caracteres')
    .max(200, 'La descripción no puede exceder 200 caracteres'),
  metodoPago: z.enum(METODOS_PAGO as [MetodoPago, ...MetodoPago[]], {
    errorMap: () => ({ message: 'Selecciona un método de pago válido' }),
  }),
  tags: z.array(z.string()).optional(),
  recurrente: z.boolean().optional(),
});

export const presupuestoFormSchema = z.object({
  mes: z.string().regex(/^\d{4}-\d{2}$/, 'Formato de mes inválido (YYYY-MM)'),
  categoria: z.enum(CATEGORIAS_GASTO as [CategoriaGasto, ...CategoriaGasto[]], {
    errorMap: () => ({ message: 'Selecciona una categoría válida' }),
  }),
  limite: z
    .string()
    .min(1, 'El límite es requerido')
    .refine(
      (val) => {
        const numero = parseFloat(val);
        return !isNaN(numero) && numero > 0;
      },
      { message: 'El límite debe ser un número positivo' }
    ),
});

export const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
});

export const registroSchema = z
  .object({
    nombre: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
    email: z.string().email('Email inválido'),
    password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
    confirmarPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmarPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmarPassword'],
  });

export const filtrosGastosSchema = z.object({
  fechaInicio: z.string().optional(),
  fechaFin: z.string().optional(),
  categorias: z.array(z.enum(CATEGORIAS_GASTO as [CategoriaGasto, ...CategoriaGasto[]])).optional(),
  montoMin: z.number().min(0).optional(),
  montoMax: z.number().min(0).optional(),
  metodoPago: z.enum(METODOS_PAGO as [MetodoPago, ...MetodoPago[]]).optional(),
  busqueda: z.string().optional(),
});

// ============================================================================
// Validadores Personalizados
// ============================================================================

/**
 * Validar email
 */
export function validarEmail(email: string): boolean {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

/**
 * Validar contraseña (mínimo 8 caracteres, al menos una letra y un número)
 */
export function validarPassword(password: string): {
  valida: boolean;
  errores: string[];
} {
  const errores: string[] = [];

  if (password.length < 8) {
    errores.push('Debe tener al menos 8 caracteres');
  }

  if (!/[a-zA-Z]/.test(password)) {
    errores.push('Debe contener al menos una letra');
  }

  if (!/[0-9]/.test(password)) {
    errores.push('Debe contener al menos un número');
  }

  return {
    valida: errores.length === 0,
    errores,
  };
}

/**
 * Validar monto
 */
export function validarMonto(monto: string | number): {
  valido: boolean;
  valor?: number;
  error?: string;
} {
  const numero = typeof monto === 'string' ? parseFloat(monto) : monto;

  if (isNaN(numero)) {
    return { valido: false, error: 'El monto debe ser un número' };
  }

  if (numero <= 0) {
    return { valido: false, error: 'El monto debe ser mayor a 0' };
  }

  if (numero > 1000000) {
    return { valido: false, error: 'El monto parece ser demasiado alto' };
  }

  return { valido: true, valor: numero };
}

/**
 * Validar fecha
 */
export function validarFecha(fecha: string | Date): {
  valida: boolean;
  fecha?: Date;
  error?: string;
} {
  const fechaDate = typeof fecha === 'string' ? new Date(fecha) : fecha;

  if (isNaN(fechaDate.getTime())) {
    return { valida: false, error: 'Fecha inválida' };
  }

  const ahora = new Date();
  const hace10Años = new Date();
  hace10Años.setFullYear(ahora.getFullYear() - 10);

  if (fechaDate < hace10Años) {
    return { valida: false, error: 'La fecha es demasiado antigua' };
  }

  if (fechaDate > ahora) {
    return { valida: false, error: 'La fecha no puede ser futura' };
  }

  return { valida: true, fecha: fechaDate };
}

/**
 * Validar categoría
 */
export function validarCategoria(categoria: string): categoria is CategoriaGasto {
  return CATEGORIAS_GASTO.includes(categoria as CategoriaGasto);
}

/**
 * Validar método de pago
 */
export function validarMetodoPago(metodo: string): metodo is MetodoPago {
  return METODOS_PAGO.includes(metodo as MetodoPago);
}

/**
 * Validar descripción
 */
export function validarDescripcion(descripcion: string): {
  valida: boolean;
  error?: string;
} {
  if (descripcion.trim().length < 3) {
    return { valida: false, error: 'La descripción debe tener al menos 3 caracteres' };
  }

  if (descripcion.length > 200) {
    return { valida: false, error: 'La descripción no puede exceder 200 caracteres' };
  }

  return { valida: true };
}

/**
 * Validar archivo Excel/CSV
 */
export function validarArchivoImportacion(archivo: File): {
  valido: boolean;
  error?: string;
} {
  const extensionesValidas = ['.xlsx', '.xls', '.csv'];
  const extension = archivo.name.substring(archivo.name.lastIndexOf('.')).toLowerCase();

  if (!extensionesValidas.includes(extension)) {
    return {
      valido: false,
      error: 'Formato de archivo no válido. Usa .xlsx, .xls o .csv',
    };
  }

  const maxSize = 10 * 1024 * 1024; // 10 MB
  if (archivo.size > maxSize) {
    return {
      valido: false,
      error: 'El archivo es demasiado grande. Máximo 10 MB',
    };
  }

  return { valido: true };
}

/**
 * Validar rango de fechas
 */
export function validarRangoFechas(
  fechaInicio: Date,
  fechaFin: Date
): {
  valido: boolean;
  error?: string;
} {
  if (fechaInicio > fechaFin) {
    return {
      valido: false,
      error: 'La fecha de inicio debe ser anterior a la fecha de fin',
    };
  }

  const diferenciaDias = Math.ceil(
    (fechaFin.getTime() - fechaInicio.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (diferenciaDias > 365) {
    return {
      valido: false,
      error: 'El rango no puede ser mayor a un año',
    };
  }

  return { valido: true };
}

/**
 * Sanitizar input de usuario
 */
export function sanitizarInput(input: string): string {
  return input
    .trim()
    .replace(/<[^>]*>/g, '') // Remover tags HTML
    .replace(/[<>'"]/g, '') // Remover caracteres peligrosos
    .substring(0, 500); // Limitar longitud
}

/**
 * Validar URL
 */
export function validarURL(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Validar número de teléfono (formato internacional básico)
 */
export function validarTelefono(telefono: string): boolean {
  const regex = /^[\+]?[(]?[0-9]{1,3}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,4}[-\s\.]?[0-9]{1,9}$/;
  return regex.test(telefono);
}

// ============================================================================
// Tipos de Validación
// ============================================================================

export type ValidationResult<T> = {
  success: boolean;
  data?: T;
  errors?: Record<string, string[]>;
};

/**
 * Validar datos con schema de Zod
 */
export function validarConSchema<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): ValidationResult<T> {
  const result = schema.safeParse(data);

  if (result.success) {
    return {
      success: true,
      data: result.data,
    };
  }

  const errors: Record<string, string[]> = {};
  result.error.errors.forEach((err) => {
    const path = err.path.join('.');
    if (!errors[path]) {
      errors[path] = [];
    }
    errors[path].push(err.message);
  });

  return {
    success: false,
    errors,
  };
}
