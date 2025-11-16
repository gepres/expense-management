/**
 * Tipos TypeScript para Categorías
 *
 * Este archivo puede ser usado tanto en el frontend como en el backend
 * para mantener consistencia en los tipos de datos.
 */

export interface Subcategoria {
  id: string;
  nombre: string;
  descripcion: string;
}

export interface Categoria {
  id: string;
  nombre: string;
  icono: string;
  color: string;
  descripcion: string;
  subcategorias: Subcategoria[];
}

export interface MetodoPago {
  id: string;
  nombre: string;
  icono: string;
  descripcion: string;
}

export interface Moneda {
  id: string;
  nombre: string;
  simbolo: string;
  icono: string;
  codigoISO: string;
}

export interface CategoriaEspecial {
  id: string;
  nombre: string;
  icono: string;
  color: string;
  descripcion: string;
}

export interface CategoriasData {
  version: string;
  lastUpdated: string;
  categorias: Categoria[];
  metodosPago: MetodoPago[];
  monedas: Moneda[];
  categoriaEspecial: CategoriaEspecial;
}

// IDs de categorías como tipos literales
export type CategoriaId =
  | 'alimentacion'
  | 'transporte'
  | 'entretenimiento'
  | 'salud'
  | 'servicios'
  | 'compras'
  | 'educacion'
  | 'vivienda'
  | 'otros'
  | 'general'; // Categoría especial

export type MetodoPagoId =
  | 'efectivo'
  | 'tarjeta_debito'
  | 'tarjeta_credito'
  | 'transferencia'
  | 'yape'
  | 'plin'
  | 'otros';

export type MonedaId = 'PEN' | 'USD';

// Helper types para validación
export type SubcategoriasPorCategoria = {
  alimentacion: 'supermercado' | 'restaurantes' | 'delivery' | 'cafe_snacks' | 'bebidas';
  transporte: 'combustible' | 'taxi_uber' | 'transporte_publico' | 'estacionamiento' | 'mantenimiento_vehiculo' | 'peajes';
  entretenimiento: 'cine_teatro' | 'streaming' | 'videojuegos' | 'deportes' | 'hobbies' | 'viajes';
  salud: 'medicinas' | 'consultas_medicas' | 'examenes' | 'dental' | 'vision' | 'terapias' | 'seguro_medico';
  servicios: 'luz' | 'agua' | 'gas' | 'internet' | 'telefono' | 'limpieza' | 'seguridad' | 'otros_servicios';
  compras: 'ropa' | 'electronica' | 'muebles' | 'electrodomesticos' | 'mascotas' | 'cuidado_personal' | 'regalos';
  educacion: 'colegiatura' | 'libros' | 'cursos' | 'utiles' | 'uniformes' | 'plataformas_educativas';
  vivienda: 'alquiler' | 'hipoteca' | 'mantenimiento' | 'impuestos_vivienda' | 'seguro_hogar' | 'mejoras_hogar';
  otros: 'impuestos' | 'multas' | 'donaciones' | 'cuotas_asociaciones' | 'legales' | 'bancarios' | 'varios';
  general: never; // La categoría general no tiene subcategorías
};

// Validación de subcategoría según categoría
export type SubcategoriaValida<T extends CategoriaId> = T extends keyof SubcategoriasPorCategoria
  ? SubcategoriasPorCategoria[T]
  : never;

/**
 * Constantes para uso en validaciones y lógica de negocio
 */
export const CATEGORIA_IDS: CategoriaId[] = [
  'alimentacion',
  'transporte',
  'entretenimiento',
  'salud',
  'servicios',
  'compras',
  'educacion',
  'vivienda',
  'otros',
  'general'
];

export const METODO_PAGO_IDS: MetodoPagoId[] = [
  'efectivo',
  'tarjeta_debito',
  'tarjeta_credito',
  'transferencia',
  'yape',
  'plin',
  'otros'
];

export const MONEDA_IDS: MonedaId[] = ['PEN', 'USD'];

/**
 * Funciones helper para validación
 */

export function isCategoriaValida(id: string): id is CategoriaId {
  return CATEGORIA_IDS.includes(id as CategoriaId);
}

export function isMetodoPagoValido(id: string): id is MetodoPagoId {
  return METODO_PAGO_IDS.includes(id as MetodoPagoId);
}

export function isMonedaValida(id: string): id is MonedaId {
  return MONEDA_IDS.includes(id as MonedaId);
}

/**
 * Mapas para acceso rápido (usar con los datos de categorias.json)
 */
export type CategoriaMap = Map<CategoriaId, Categoria>;
export type MetodoPagoMap = Map<MetodoPagoId, MetodoPago>;
export type MonedaMap = Map<MonedaId, Moneda>;

/**
 * Función para crear mapas desde el JSON
 */
export function crearMapasCategorias(data: CategoriasData): {
  categorias: CategoriaMap;
  metodosPago: MetodoPagoMap;
  monedas: MonedaMap;
} {
  const categorias = new Map<CategoriaId, Categoria>();
  const metodosPago = new Map<MetodoPagoId, MetodoPago>();
  const monedas = new Map<MonedaId, Moneda>();

  data.categorias.forEach(cat => {
    categorias.set(cat.id as CategoriaId, cat);
  });

  data.metodosPago.forEach(mp => {
    metodosPago.set(mp.id as MetodoPagoId, mp);
  });

  data.monedas.forEach(mon => {
    monedas.set(mon.id as MonedaId, mon);
  });

  return { categorias, metodosPago, monedas };
}

/**
 * Ejemplo de uso:
 *
 * ```typescript
 * import categoriasData from './categorias.json';
 * import { crearMapasCategorias, isCategoriaValida } from './categorias-types';
 *
 * const { categorias, metodosPago, monedas } = crearMapasCategorias(categoriasData);
 *
 * // Validar categoría
 * if (isCategoriaValida('alimentacion')) {
 *   const cat = categorias.get('alimentacion');
 *   console.log(cat?.nombre); // "Alimentación"
 * }
 *
 * // Obtener subcategorías
 * const subcats = categorias.get('alimentacion')?.subcategorias;
 * ```
 */
