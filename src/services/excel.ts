/**
 * Servicio para importar y exportar datos en formato Excel
 */

import * as XLSX from 'xlsx';
import { z } from 'zod';
import type {
  Gasto,
  DatosImportacion,
  ResultadoImportacion,
  ConfiguracionColumnas,
  CategoriaGasto,
  MetodoPago,
} from '@types';
import { CATEGORIAS_GASTO, METODOS_PAGO, CATEGORIA_LABELS, METODO_PAGO_LABELS } from '@types';

// ============================================================================
// Validación con Zod
// ============================================================================

const gastoImportacionSchema = z.object({
  fecha: z.string().refine(
    (val) => {
      const fecha = new Date(val);
      return !isNaN(fecha.getTime());
    },
    { message: 'Fecha inválida' }
  ),
  categoria: z.string().refine(
    (val) => CATEGORIAS_GASTO.includes(val as CategoriaGasto),
    { message: 'Categoría inválida' }
  ),
  monto: z.union([z.string(), z.number()]).transform((val) => {
    const numero = typeof val === 'string' ? parseFloat(val.replace(',', '.')) : val;
    if (isNaN(numero) || numero <= 0) {
      throw new Error('Monto inválido');
    }
    return numero;
  }),
  descripcion: z.string().min(1, 'Descripción requerida'),
  metodoPago: z.string().optional().transform((val) => {
    if (!val) return 'otros';
    if (!METODOS_PAGO.includes(val as MetodoPago)) {
      return 'otros';
    }
    return val;
  }),
});

// ============================================================================
// Mapeo de Categorías
// ============================================================================

const categoriasAlternativas: Record<string, CategoriaGasto> = {
  'comida': 'alimentacion',
  'comidas': 'alimentacion',
  'alimentos': 'alimentacion',
  'supermercado': 'alimentacion',
  'restaurante': 'alimentacion',
  'transporte': 'transporte',
  'gasolina': 'transporte',
  'combustible': 'transporte',
  'uber': 'transporte',
  'taxi': 'transporte',
  'entretenimiento': 'entretenimiento',
  'ocio': 'entretenimiento',
  'diversión': 'entretenimiento',
  'cine': 'entretenimiento',
  'salud': 'salud',
  'medicina': 'salud',
  'médico': 'salud',
  'farmacia': 'salud',
  'servicios': 'servicios',
  'luz': 'servicios',
  'agua': 'servicios',
  'internet': 'servicios',
  'teléfono': 'servicios',
  'compras': 'compras',
  'ropa': 'compras',
  'tecnología': 'compras',
  'educación': 'educacion',
  'educacion': 'educacion',
  'cursos': 'educacion',
  'libros': 'educacion',
  'vivienda': 'vivienda',
  'alquiler': 'vivienda',
  'renta': 'vivienda',
  'hipoteca': 'vivienda',
  'otros': 'otros',
};

/**
 * Normalizar nombre de categoría
 */
function normalizarCategoria(categoria: string): CategoriaGasto {
  const normalizada = categoria.toLowerCase().trim();

  // Buscar coincidencia directa
  if (CATEGORIAS_GASTO.includes(normalizada as CategoriaGasto)) {
    return normalizada as CategoriaGasto;
  }

  // Buscar en alternativas
  if (categoriasAlternativas[normalizada]) {
    return categoriasAlternativas[normalizada];
  }

  // Por defecto: otros
  return 'otros';
}

/**
 * Normalizar método de pago
 */
function normalizarMetodoPago(metodo: string): MetodoPago {
  const normalizado = metodo.toLowerCase().trim().replace(/\s+/g, '_');

  if (METODOS_PAGO.includes(normalizado as MetodoPago)) {
    return normalizado as MetodoPago;
  }

  // Alternativas comunes
  const alternativas: Record<string, MetodoPago> = {
    'efectivo': 'efectivo',
    'cash': 'efectivo',
    'debito': 'tarjeta_debito',
    'débito': 'tarjeta_debito',
    'credito': 'tarjeta_credito',
    'crédito': 'tarjeta_credito',
    'tarjeta': 'tarjeta_credito',
    'transferencia': 'transferencia',
    'transfer': 'transferencia',
  };

  return alternativas[normalizado] || 'otros';
}

// ============================================================================
// Servicio de Excel
// ============================================================================

export const excelService = {
  /**
   * Importar gastos desde archivo Excel o CSV
   */
  async importar(
    archivo: File,
    userId: string,
    _configuracion?: ConfiguracionColumnas
  ): Promise<ResultadoImportacion> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        try {
          const data = e.target?.result;
          const workbook = XLSX.read(data, { type: 'binary' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet);

          const resultado: ResultadoImportacion = {
            exitosos: 0,
            fallidos: 0,
            errores: [],
            gastosCreados: [],
          };

          jsonData.forEach((fila: any, index: number) => {
            try {
              // Normalizar datos
              const datosNormalizados: DatosImportacion = {
                fecha: fila.fecha || fila.Fecha || fila.date || fila.Date || '',
                categoria: normalizarCategoria(
                  fila.categoria || fila.Categoria || fila.category || ''
                ),
                monto: fila.monto || fila.Monto || fila.amount || fila.Amount || 0,
                descripcion:
                  fila.descripcion || fila.Descripcion || fila.description || '',
                metodoPago: normalizarMetodoPago(
                  fila.metodoPago || fila.metodo_pago || fila.paymentMethod || 'otros'
                ),
              };

              // Validar con Zod
              const validado = gastoImportacionSchema.parse(datosNormalizados);

              // Crear objeto Gasto
              const gasto: Omit<Gasto, 'id' | 'createdAt' | 'updatedAt'> = {
                userId,
                fecha: new Date(validado.fecha),
                categoria: validado.categoria as CategoriaGasto,
                monto: validado.monto,
                moneda: 'PEN',
                descripcion: validado.descripcion,
                metodoPago: (validado.metodoPago || 'otros') as MetodoPago,
              };

              resultado.gastosCreados.push(gasto as Gasto);
              resultado.exitosos++;
            } catch (error) {
              resultado.fallidos++;
              resultado.errores.push({
                fila: index + 2, // +2 porque las filas empiezan en 1 y hay encabezado
                error: error instanceof Error ? error.message : 'Error desconocido',
                datos: fila,
              });
            }
          });

          resolve(resultado);
        } catch (error) {
          reject(new Error('Error al procesar el archivo Excel'));
        }
      };

      reader.onerror = () => {
        reject(new Error('Error al leer el archivo'));
      };

      reader.readAsBinaryString(archivo);
    });
  },

  /**
   * Exportar gastos a Excel
   */
  exportarGastos(gastos: Gasto[], nombreArchivo = 'gastos.xlsx'): void {
    // Formatear datos para Excel
    const datos = gastos.map((gasto) => ({
      Fecha: gasto.fecha.toLocaleDateString('es-ES'),
      Categoría: CATEGORIA_LABELS[gasto.categoria],
      Monto: gasto.monto,
      Descripción: gasto.descripcion,
      'Método de Pago': METODO_PAGO_LABELS[gasto.metodoPago],
      Tags: gasto.tags?.join(', ') || '',
      Recurrente: gasto.recurrente ? 'Sí' : 'No',
    }));

    // Crear libro y hoja
    const worksheet = XLSX.utils.json_to_sheet(datos);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Gastos');

    // Ajustar anchos de columna
    const maxWidth = 30;
    worksheet['!cols'] = [
      { wch: 12 }, // Fecha
      { wch: 15 }, // Categoría
      { wch: 12 }, // Monto
      { wch: maxWidth }, // Descripción
      { wch: 18 }, // Método de Pago
      { wch: 20 }, // Tags
      { wch: 12 }, // Recurrente
    ];

    // Descargar archivo
    XLSX.writeFile(workbook, nombreArchivo);
  },

  /**
   * Exportar estadísticas a Excel
   */
  exportarEstadisticas(
    estadisticas: any,
    _periodo: string,
    nombreArchivo = 'estadisticas.xlsx'
  ): void {
    // Resumen general
    const resumen = [
      { Métrica: 'Total Gastado', Valor: estadisticas.totalGastado },
      { Métrica: 'Promedio por Gasto', Valor: estadisticas.promedioGasto },
      { Métrica: 'Gasto Máximo', Valor: estadisticas.gastoMaximo },
      { Métrica: 'Gasto Mínimo', Valor: estadisticas.gastoMinimo },
      { Métrica: 'Número de Gastos', Valor: estadisticas.numeroGastos },
    ];

    // Gastos por categoría
    const porCategoria = Object.entries(estadisticas.gastosPorCategoria).map(
      ([cat, monto]) => ({
        Categoría: CATEGORIA_LABELS[cat as CategoriaGasto],
        Monto: monto as number,
        Porcentaje: (((monto as number) / estadisticas.totalGastado) * 100).toFixed(2) + '%',
      })
    );

    // Gastos por método de pago
    const porMetodoPago = Object.entries(estadisticas.gastosPorMetodoPago).map(
      ([metodo, monto]) => ({
        'Método de Pago': METODO_PAGO_LABELS[metodo as MetodoPago],
        Monto: monto as number,
        Porcentaje: (((monto as number) / estadisticas.totalGastado) * 100).toFixed(2) + '%',
      })
    );

    // Crear libro con múltiples hojas
    const workbook = XLSX.utils.book_new();

    const wsResumen = XLSX.utils.json_to_sheet(resumen);
    XLSX.utils.book_append_sheet(workbook, wsResumen, 'Resumen');

    const wsCategoria = XLSX.utils.json_to_sheet(porCategoria);
    XLSX.utils.book_append_sheet(workbook, wsCategoria, 'Por Categoría');

    const wsMetodoPago = XLSX.utils.json_to_sheet(porMetodoPago);
    XLSX.utils.book_append_sheet(workbook, wsMetodoPago, 'Por Método de Pago');

    // Descargar archivo
    XLSX.writeFile(workbook, nombreArchivo);
  },

  /**
   * Generar plantilla de importación
   */
  generarPlantilla(nombreArchivo = 'plantilla_gastos.xlsx'): void {
    const datos = [
      {
        fecha: '2025-11-14',
        categoria: 'alimentacion',
        monto: 50.0,
        descripcion: 'Compra en supermercado',
        metodoPago: 'tarjeta_debito',
      },
      {
        fecha: '2025-11-13',
        categoria: 'transporte',
        monto: 15.5,
        descripcion: 'Taxi al trabajo',
        metodoPago: 'efectivo',
      },
    ];

    const worksheet = XLSX.utils.json_to_sheet(datos);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Gastos');

    // Agregar hoja de categorías válidas
    const categorias = CATEGORIAS_GASTO.map((cat) => ({
      Código: cat,
      Nombre: CATEGORIA_LABELS[cat],
    }));
    const wsCategorias = XLSX.utils.json_to_sheet(categorias);
    XLSX.utils.book_append_sheet(workbook, wsCategorias, 'Categorías');

    // Agregar hoja de métodos de pago válidos
    const metodosPago = METODOS_PAGO.map((metodo) => ({
      Código: metodo,
      Nombre: METODO_PAGO_LABELS[metodo],
    }));
    const wsMetodos = XLSX.utils.json_to_sheet(metodosPago);
    XLSX.utils.book_append_sheet(workbook, wsMetodos, 'Métodos de Pago');

    XLSX.writeFile(workbook, nombreArchivo);
  },
};

export default excelService;
