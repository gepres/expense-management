/**
 * Utilidades para cálculos y análisis de gastos
 *
 * IMPORTANTE - Manejo de múltiples monedas:
 * Todas las funciones de cálculo asumen que los gastos están en la misma moneda.
 * Para trabajar con múltiples monedas (PEN y USD), se recomienda:
 * 1. Filtrar gastos por moneda antes de calcular totales
 * 2. Usar la función filtrarGastosPorMoneda() para separar por moneda
 * 3. Realizar cálculos separados para cada moneda
 * 4. No sumar montos de diferentes monedas sin conversión
 */

import {
  startOfMonth,
  endOfMonth,
  subMonths,
  differenceInDays,
  isWithinInterval,
} from 'date-fns';
import type {
  Gasto,
  EstadisticasPeriodo,
  ComparacionPeriodos,
  TendenciaGasto,
  GastoInusual,
  Recomendacion,
  CategoriaGasto,
  MetodoPago,
  Presupuesto,
  Moneda,
} from '@app-types';
import { CATEGORIAS_GASTO, METODOS_PAGO } from '@app-types';

/**
 * Calcular total de gastos
 */
export function calcularTotalGastos(gastos: Gasto[]): number {
  return gastos.reduce((total, gasto) => total + gasto.monto, 0);
}

/**
 * Calcular promedio de gastos
 */
export function calcularPromedioGastos(gastos: Gasto[]): number {
  if (gastos.length === 0) return 0;
  return calcularTotalGastos(gastos) / gastos.length;
}

/**
 * Obtener gasto máximo
 */
export function obtenerGastoMaximo(gastos: Gasto[]): number {
  if (gastos.length === 0) return 0;
  return Math.max(...gastos.map((g) => g.monto));
}

/**
 * Obtener gasto mínimo
 */
export function obtenerGastoMinimo(gastos: Gasto[]): number {
  if (gastos.length === 0) return 0;
  return Math.min(...gastos.map((g) => g.monto));
}

/**
 * Calcular gastos por categoría
 */
export function calcularGastosPorCategoria(
  gastos: Gasto[]
): Record<CategoriaGasto, number> {
  const resultado = {} as Record<CategoriaGasto, number>;

  // Inicializar con 0
  CATEGORIAS_GASTO.forEach((cat) => {
    resultado[cat] = 0;
  });

  // Sumar gastos
  gastos.forEach((gasto) => {
    resultado[gasto.categoria] += gasto.monto;
  });

  return resultado;
}

/**
 * Calcular gastos por método de pago
 */
export function calcularGastosPorMetodoPago(
  gastos: Gasto[]
): Record<MetodoPago, number> {
  const resultado = {} as Record<MetodoPago, number>;

  // Inicializar con 0
  METODOS_PAGO.forEach((metodo) => {
    resultado[metodo] = 0;
  });

  // Sumar gastos
  gastos.forEach((gasto) => {
    resultado[gasto.metodoPago] += gasto.monto;
  });

  return resultado;
}

/**
 * Calcular estadísticas para un período
 */
export function calcularEstadisticasPeriodo(gastos: Gasto[]): EstadisticasPeriodo {
  return {
    totalGastado: calcularTotalGastos(gastos),
    promedioGasto: calcularPromedioGastos(gastos),
    gastoMaximo: obtenerGastoMaximo(gastos),
    gastoMinimo: obtenerGastoMinimo(gastos),
    numeroGastos: gastos.length,
    gastosPorCategoria: calcularGastosPorCategoria(gastos),
    gastosPorMetodoPago: calcularGastosPorMetodoPago(gastos),
  };
}

/**
 * Filtrar gastos por rango de fechas
 */
export function filtrarGastosPorFechas(
  gastos: Gasto[],
  fechaInicio: Date,
  fechaFin: Date
): Gasto[] {
  return gastos.filter((gasto) =>
    isWithinInterval(gasto.fecha, { start: fechaInicio, end: fechaFin })
  );
}

/**
 * Filtrar gastos por moneda
 * Útil para separar gastos en PEN y USD antes de realizar cálculos
 */
export function filtrarGastosPorMoneda(gastos: Gasto[], moneda: Moneda): Gasto[] {
  return gastos.filter((gasto) => gasto.moneda === moneda);
}

/**
 * Agrupar gastos por moneda
 * Retorna un objeto con los gastos separados por moneda
 */
export function agruparGastosPorMoneda(gastos: Gasto[]): Record<Moneda, Gasto[]> {
  const resultado: Record<string, Gasto[]> = {
    PEN: [],
    USD: [],
  };

  gastos.forEach((gasto) => {
    if (!resultado[gasto.moneda]) {
      resultado[gasto.moneda] = [];
    }
    resultado[gasto.moneda].push(gasto);
  });

  return resultado as Record<Moneda, Gasto[]>;
}

/**
 * Obtener gastos del mes actual
 */
export function obtenerGastosMesActual(gastos: Gasto[]): Gasto[] {
  const ahora = new Date();
  const inicio = startOfMonth(ahora);
  const fin = endOfMonth(ahora);
  return filtrarGastosPorFechas(gastos, inicio, fin);
}

/**
 * Obtener gastos del mes anterior
 */
export function obtenerGastosMesAnterior(gastos: Gasto[]): Gasto[] {
  const mesAnterior = subMonths(new Date(), 1);
  const inicio = startOfMonth(mesAnterior);
  const fin = endOfMonth(mesAnterior);
  return filtrarGastosPorFechas(gastos, inicio, fin);
}

/**
 * Comparar dos períodos de gastos
 */
export function compararPeriodos(
  gastosPeriodoActual: Gasto[],
  gastosPeriodoAnterior: Gasto[]
): ComparacionPeriodos {
  const periodoActual = calcularEstadisticasPeriodo(gastosPeriodoActual);
  const periodoAnterior = calcularEstadisticasPeriodo(gastosPeriodoAnterior);

  const diferencia = periodoActual.totalGastado - periodoAnterior.totalGastado;
  const diferenciaPorcentaje =
    periodoAnterior.totalGastado === 0
      ? 0
      : (diferencia / periodoAnterior.totalGastado) * 100;

  // Calcular cambios por categoría
  const categoriasMayorCambio = CATEGORIAS_GASTO.map((categoria) => {
    const actual = periodoActual.gastosPorCategoria[categoria];
    const anterior = periodoAnterior.gastosPorCategoria[categoria];
    const diff = actual - anterior;
    const diffPorcentaje = anterior === 0 ? 0 : (diff / anterior) * 100;

    return {
      categoria,
      diferencia: diff,
      diferenciaPorcentaje: diffPorcentaje,
    };
  })
    .filter((item) => Math.abs(item.diferencia) > 0)
    .sort((a, b) => Math.abs(b.diferencia) - Math.abs(a.diferencia))
    .slice(0, 5);

  return {
    periodoActual,
    periodoAnterior,
    diferencia,
    diferenciaPorcentaje,
    categoriasMayorCambio,
  };
}

/**
 * Detectar tendencias por categoría
 */
export function detectarTendencias(
  gastosActuales: Gasto[],
  gastosAnteriores: Gasto[]
): TendenciaGasto[] {
  const estadisticasActuales = calcularEstadisticasPeriodo(gastosActuales);
  const estadisticasAnteriores = calcularEstadisticasPeriodo(gastosAnteriores);

  return CATEGORIAS_GASTO.map((categoria) => {
    const actual = estadisticasActuales.gastosPorCategoria[categoria];
    const anterior = estadisticasAnteriores.gastosPorCategoria[categoria];

    const cambio = actual - anterior;
    const porcentajeCambio = anterior === 0 ? 0 : (cambio / anterior) * 100;

    let tendencia: 'creciente' | 'decreciente' | 'estable';
    if (Math.abs(porcentajeCambio) < 5) {
      tendencia = 'estable';
    } else if (porcentajeCambio > 0) {
      tendencia = 'creciente';
    } else {
      tendencia = 'decreciente';
    }

    // Proyección simple: asumir que la tendencia continúa
    const proyeccion = actual + cambio;

    return {
      categoria,
      tendencia,
      porcentajeCambio,
      proyeccion: Math.max(0, proyeccion),
    };
  }).filter((t) => t.tendencia !== 'estable' || t.porcentajeCambio !== 0);
}

/**
 * Detectar gastos inusuales (outliers)
 */
export function detectarGastosInusuales(gastos: Gasto[]): GastoInusual[] {
  if (gastos.length < 3) return [];

  const promedio = calcularPromedioGastos(gastos);
  const desviacionEstandar = Math.sqrt(
    gastos.reduce((sum, gasto) => sum + Math.pow(gasto.monto - promedio, 2), 0) /
      gastos.length
  );

  const umbral = 2; // 2 desviaciones estándar

  return gastos
    .filter((gasto) => {
      const desviacion = Math.abs(gasto.monto - promedio) / desviacionEstandar;
      return desviacion > umbral;
    })
    .map((gasto) => ({
      gasto,
      razon: gasto.monto > promedio ? 'Gasto muy alto' : 'Gasto muy bajo',
      desviacion: Math.abs(gasto.monto - promedio) / desviacionEstandar,
    }))
    .sort((a, b) => b.desviacion - a.desviacion);
}

/**
 * Generar recomendaciones basadas en análisis
 */
export function generarRecomendaciones(
  gastos: Gasto[],
  presupuestos: Presupuesto[]
): Recomendacion[] {
  const recomendaciones: Recomendacion[] = [];
  const estadisticas = calcularEstadisticasPeriodo(gastos);

  // Verificar presupuestos excedidos o cerca del límite
  presupuestos.forEach((presupuesto) => {
    const porcentaje = (presupuesto.gastado / presupuesto.limite) * 100;

    if (porcentaje >= 100) {
      recomendaciones.push({
        id: `presupuesto-${presupuesto.id}-excedido`,
        tipo: 'presupuesto',
        prioridad: 'alta',
        titulo: `Presupuesto excedido en ${presupuesto.categoria}`,
        descripcion: `Has excedido tu presupuesto en un ${(porcentaje - 100).toFixed(1)}%. Considera reducir gastos en esta categoría.`,
        categoria: presupuesto.categoria === 'general' ? undefined : (presupuesto.categoria as CategoriaGasto),
        ahorroPotencial: presupuesto.gastado - presupuesto.limite,
        accion: 'Revisar gastos recientes y eliminar gastos innecesarios',
      });
    } else if (porcentaje >= 80) {
      recomendaciones.push({
        id: `presupuesto-${presupuesto.id}-cerca`,
        tipo: 'presupuesto',
        prioridad: 'media',
        titulo: `Cerca del límite en ${presupuesto.categoria}`,
        descripcion: `Has usado el ${porcentaje.toFixed(1)}% de tu presupuesto. Quedan ${(presupuesto.limite - presupuesto.gastado).toFixed(2)} disponibles.`,
        categoria: presupuesto.categoria === 'general' ? undefined : (presupuesto.categoria as CategoriaGasto),
        accion: 'Moderar gastos hasta fin de mes',
      });
    }
  });

  // Identificar categorías con gastos más altos
  const categoriasMasAltas = Object.entries(estadisticas.gastosPorCategoria)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .filter(([, monto]) => monto > 0);

  categoriasMasAltas.forEach(([categoria, monto], index) => {
    if (index === 0) {
      recomendaciones.push({
        id: `categoria-alta-${categoria}`,
        tipo: 'categoria',
        prioridad: 'media',
        titulo: `${categoria} es tu mayor gasto`,
        descripcion: `Has gastado ${monto.toFixed(2)} en ${categoria}, que representa el ${((monto / estadisticas.totalGastado) * 100).toFixed(1)}% de tus gastos totales.`,
        categoria: categoria as CategoriaGasto,
        ahorroPotencial: monto * 0.1, // Potencial de ahorro del 10%
        accion: 'Buscar alternativas más económicas o reducir frecuencia',
      });
    }
  });

  // Detectar gastos inusuales
  const gastosInusuales = detectarGastosInusuales(gastos);
  if (gastosInusuales.length > 0) {
    const gasto = gastosInusuales[0];
    recomendaciones.push({
      id: `gasto-inusual-${gasto.gasto.id}`,
      tipo: 'general',
      prioridad: 'baja',
      titulo: 'Gasto inusual detectado',
      descripcion: `El gasto "${gasto.gasto.descripcion}" de ${gasto.gasto.monto} es significativamente ${gasto.razon.toLowerCase()} al habitual.`,
      categoria: gasto.gasto.categoria,
      accion: 'Verificar si fue un gasto único o si se repetirá',
    });
  }

  return recomendaciones.sort((a, b) => {
    const prioridadOrden = { alta: 0, media: 1, baja: 2 };
    return prioridadOrden[a.prioridad] - prioridadOrden[b.prioridad];
  });
}

/**
 * Proyectar gastos para fin de mes
 */
export function proyectarGastosMes(gastos: Gasto[]): number {
  if (gastos.length === 0) return 0;

  const ahora = new Date();
  const inicioMes = startOfMonth(ahora);
  const finMes = endOfMonth(ahora);
  const diasTranscurridos = differenceInDays(ahora, inicioMes) + 1;
  const diasTotales = differenceInDays(finMes, inicioMes) + 1;

  const gastoActual = calcularTotalGastos(gastos);
  const promediodiario = gastoActual / diasTranscurridos;

  return promediodiario * diasTotales;
}

/**
 * Calcular porcentaje de presupuesto usado
 */
export function calcularPorcentajePresupuesto(
  gastado: number,
  limite: number
): number {
  if (limite === 0) return 0;
  return (gastado / limite) * 100;
}

/**
 * Verificar si debe enviar alerta de presupuesto
 */
export function debeEnviarAlerta(presupuesto: Presupuesto): {
  debe: boolean;
  tipo: '80' | '100' | null;
} {
  const porcentaje = calcularPorcentajePresupuesto(
    presupuesto.gastado,
    presupuesto.limite
  );

  if (porcentaje >= 100 && !presupuesto.alertaEnviada100) {
    return { debe: true, tipo: '100' };
  }

  if (porcentaje >= 80 && !presupuesto.alertaEnviada80) {
    return { debe: true, tipo: '80' };
  }

  return { debe: false, tipo: null };
}
