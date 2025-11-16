/**
 * Utilidades para formatear datos
 */

import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import type { CategoriaGasto, MetodoPago, Moneda } from '@types/index';
import { CATEGORIA_LABELS, METODO_PAGO_LABELS } from '@types/index';

/**
 * Formatear cantidad monetaria
 * @param cantidad - Monto a formatear
 * @param moneda - Moneda (PEN o USD)
 * @param locale - Locale para formateo (por defecto es-PE)
 */
export function formatearMoneda(
  cantidad: number,
  moneda: Moneda = 'PEN',
  locale: string = 'es-PE'
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: moneda,
  }).format(cantidad);
}

/**
 * Formatear número con separadores de miles
 */
export function formatearNumero(numero: number, decimales: number = 2): string {
  return new Intl.NumberFormat('es-ES', {
    minimumFractionDigits: decimales,
    maximumFractionDigits: decimales,
  }).format(numero);
}

/**
 * Formatear porcentaje
 */
export function formatearPorcentaje(valor: number, decimales: number = 1): string {
  return `${valor.toFixed(decimales)}%`;
}

/**
 * Formatear fecha en formato corto (DD/MM/YYYY)
 */
export function formatearFechaCorta(fecha: Date | string): string {
  const fechaDate = typeof fecha === 'string' ? parseISO(fecha) : fecha;
  return format(fechaDate, 'dd/MM/yyyy', { locale: es });
}

/**
 * Formatear fecha (alias de formatearFechaCorta para compatibilidad)
 */
export function formatearFecha(fecha: Date | string): string {
  return formatearFechaCorta(fecha);
}

/**
 * Formatear fecha en formato largo (DD de MMMM de YYYY)
 */
export function formatearFechaLarga(fecha: Date | string): string {
  const fechaDate = typeof fecha === 'string' ? parseISO(fecha) : fecha;
  return format(fechaDate, "dd 'de' MMMM 'de' yyyy", { locale: es });
}

/**
 * Formatear fecha en formato mes/año (MMMM YYYY)
 */
export function formatearMesAnio(fecha: Date | string): string {
  const fechaDate = typeof fecha === 'string' ? parseISO(fecha) : fecha;
  return format(fechaDate, 'MMMM yyyy', { locale: es });
}

/**
 * Formatear fecha relativa (hace 2 días, etc.)
 */
export function formatearFechaRelativa(fecha: Date): string {
  const ahora = new Date();
  const diffMs = ahora.getTime() - fecha.getTime();
  const diffDias = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDias === 0) return 'Hoy';
  if (diffDias === 1) return 'Ayer';
  if (diffDias < 7) return `Hace ${diffDias} días`;
  if (diffDias < 30) return `Hace ${Math.floor(diffDias / 7)} semanas`;
  if (diffDias < 365) return `Hace ${Math.floor(diffDias / 30)} meses`;
  return `Hace ${Math.floor(diffDias / 365)} años`;
}

/**
 * Formatear categoría
 */
export function formatearCategoria(categoria: CategoriaGasto): string {
  return CATEGORIA_LABELS[categoria];
}

/**
 * Formatear método de pago
 */
export function formatearMetodoPago(metodo: MetodoPago): string {
  return METODO_PAGO_LABELS[metodo];
}

/**
 * Formatear mes en formato YYYY-MM
 */
export function formatearMesKey(fecha: Date): string {
  return format(fecha, 'yyyy-MM');
}

/**
 * Parsear mes desde formato YYYY-MM a nombre legible
 */
export function parsearMesKey(mesKey: string): string {
  const [anio, mes] = mesKey.split('-');
  const fecha = new Date(parseInt(anio), parseInt(mes) - 1);
  return format(fecha, 'MMMM yyyy', { locale: es });
}

/**
 * Abreviar texto largo
 */
export function abreviarTexto(texto: string, maxLength: number = 50): string {
  if (texto.length <= maxLength) return texto;
  return texto.substring(0, maxLength - 3) + '...';
}

/**
 * Formatear número compacto (1.2K, 1.5M, etc.)
 */
export function formatearNumeroCompacto(numero: number): string {
  if (numero < 1000) return numero.toString();
  if (numero < 1000000) return `${(numero / 1000).toFixed(1)}K`;
  if (numero < 1000000000) return `${(numero / 1000000).toFixed(1)}M`;
  return `${(numero / 1000000000).toFixed(1)}B`;
}

/**
 * Capitalizar primera letra
 */
export function capitalizarPrimeraLetra(texto: string): string {
  return texto.charAt(0).toUpperCase() + texto.slice(1).toLowerCase();
}

/**
 * Formatear lista de elementos
 */
export function formatearLista(elementos: string[]): string {
  if (elementos.length === 0) return '';
  if (elementos.length === 1) return elementos[0];
  if (elementos.length === 2) return `${elementos[0]} y ${elementos[1]}`;

  const ultimos = elementos.slice(-2);
  const primeros = elementos.slice(0, -2);

  return `${primeros.join(', ')}, ${ultimos[0]} y ${ultimos[1]}`;
}

/**
 * Formatear duración en minutos/horas/días
 */
export function formatearDuracion(minutos: number): string {
  if (minutos < 60) return `${minutos} min`;
  if (minutos < 1440) return `${Math.floor(minutos / 60)}h ${minutos % 60}min`;
  const dias = Math.floor(minutos / 1440);
  const horas = Math.floor((minutos % 1440) / 60);
  return `${dias}d ${horas}h`;
}

/**
 * Formatear tamaño de archivo
 */
export function formatearTamanioArchivo(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

/**
 * Sanitizar string para uso en nombres de archivo
 */
export function sanitizarNombreArchivo(nombre: string): string {
  return nombre
    .replace(/[^a-z0-9]/gi, '_')
    .replace(/_+/g, '_')
    .toLowerCase();
}
