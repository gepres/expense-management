/**
 * Servicio de Importación de Gastos
 *
 * Maneja la importación de gastos desde archivos Excel/CSV con flujo de 3 pasos:
 * 1. Validate - Validar archivo y obtener datos
 * 2. Analyze - Analizar con IA y aplicar mejoras
 * 3. Upload - Guardar en base de datos
 */

import { auth } from './firebase';
import { read, utils } from 'xlsx';

// URL base del backend API
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

// ============================================================================
// TIPOS E INTERFACES
// ============================================================================

/**
 * Gasto validado (después del paso 1)
 */
export interface ValidatedExpense {
  rowNumber: number;
  fecha: string;
  categoria: string;
  subcategoria?: string;
  monto: number;
  moneda: string;
  descripcion: string;
  metodoPago: string;
  tags?: string[];
  valid: boolean;
  errors: string[];
}

/**
 * Gasto mejorado (después del paso 2)
 */
export interface EnhancedExpense extends ValidatedExpense {
  categoriaOriginal?: string;
  categoriaSugerida?: string;
  confianzaCategoria?: number;
  isDuplicate?: boolean;
  duplicateOf?: string;
}

/**
 * Error de importación
 */
export interface ImportError {
  row: number;
  field?: string;
  message: string;
  value?: any;
}

/**
 * Sugerencia de IA
 */
export interface AISuggestion {
  type: 'category' | 'duplicate' | 'format' | 'missing' | 'improvement';
  message: string;
  affectedRows: number[];
  suggestion: string;
  confidence?: number;
}

// ============================================================================
// RESPUESTAS DE API
// ============================================================================

/**
 * Respuesta del endpoint /api/import/validate
 */
export interface ValidateResponse {
  success: boolean;
  totalRows: number;
  validCount: number;
  invalidCount: number;
  data: ValidatedExpense[];
  errors: ImportError[];
  warnings: string[];
}

/**
 * Respuesta del endpoint /api/import/analyze
 */
export interface AnalyzeResponse {
  success: boolean;
  totalProcessed: number;
  data: EnhancedExpense[];
  duplicatesRemoved: number;
  categorized: number;
  aiSuggestions: AISuggestion[];
  summary?: string;
}

/**
 * Respuesta del endpoint /api/import/upload
 */
export interface UploadResponse {
  success: boolean;
  totalRows: number;
  imported: number;
  failed: number;
  importId: string;
  errors: ImportError[];
}

/**
 * Opciones para el análisis
 */
export interface AnalyzeOptions {
  skipDuplicates: boolean;
  autoCategorizate: boolean;
  batchSize: number;
}

/**
 * Opciones de importación (legacy - para compatibilidad)
 */
export interface ImportOptions {
  batchSize: number;
  skipDuplicates: boolean;
  autoCategorizate: boolean;
  validateOnly?: boolean;
}

// ============================================================================
// FUNCIONES DE AUTENTICACIÓN Y UTILIDADES
// ============================================================================

/**
 * Obtener el token de autenticación
 */
async function getAuthToken(): Promise<string> {
  const user = auth.currentUser;
  if (!user) {
    throw new Error('Usuario no autenticado');
  }
  return await user.getIdToken();
}

/**
 * Convertir archivo Excel/CSV a JSON
 */
async function convertFileToJson(file: File): Promise<any[]> {
  if (file.name.toLowerCase().endsWith('.json')) {
    const text = await file.text();
    return JSON.parse(text);
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const jsonData = utils.sheet_to_json(worksheet);
        resolve(jsonData);
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = (error) => reject(error);
    reader.readAsArrayBuffer(file);
  });
}

/**
 * Convertir archivo a File JSON para enviar
 */
async function convertToJsonFile(file: File): Promise<File> {
  if (file.name.toLowerCase().endsWith('.json')) {
    return file;
  }

  const jsonData = await convertFileToJson(file);
  const jsonString = JSON.stringify(jsonData);
  const jsonBlob = new Blob([jsonString], { type: 'application/json' });
  return new File([jsonBlob], file.name.replace(/\.[^/.]+$/, ".json"), { type: 'application/json' });
}

// ============================================================================
// API ENDPOINTS - FLUJO DE 3 PASOS
// ============================================================================

/**
 * PASO 1: Validar archivo
 *
 * Valida el archivo Excel/JSON y retorna un array de registros validados
 */
export async function validateFile(file: File): Promise<ValidateResponse> {
  try {
    const token = await getAuthToken();
    const fileToSend = await convertToJsonFile(file);

    const formData = new FormData();
    formData.append('file', fileToSend);

    const response = await fetch(`${API_BASE_URL}/import/validate`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));

      if (response.status === 401) {
        throw new Error('Debes iniciar sesión para importar gastos.');
      }
      if (response.status === 400) {
        throw new Error(errorData.message || 'Archivo inválido');
      }
      throw new Error(errorData.message || 'Error al validar el archivo');
    }

    return await response.json();
  } catch (error: any) {
    console.error('[Import Service] Error al validar archivo:', error);
    throw error;
  }
}

/**
 * PASO 2: Analizar con IA
 *
 * Recibe los datos validados y aplica mejoras con IA
 */
export async function analyzeExpenses(
  expenses: ValidatedExpense[],
  options: AnalyzeOptions
): Promise<AnalyzeResponse> {
  try {
    const token = await getAuthToken();

    const response = await fetch(`${API_BASE_URL}/import/analyze`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        expenses,
        options: {
          skipDuplicates: options.skipDuplicates,
          autoCategorizate: options.autoCategorizate,
          batchSize: options.batchSize,
        },
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));

      if (response.status === 401) {
        throw new Error('Debes iniciar sesión.');
      }
      throw new Error(errorData.message || 'Error al analizar los datos');
    }

    return await response.json();
  } catch (error: any) {
    console.error('[Import Service] Error al analizar:', error);
    throw error;
  }
}

/**
 * PASO 3: Subir a base de datos
 *
 * Guarda los gastos mejorados en Firestore
 */
export async function uploadExpenses(
  expenses: EnhancedExpense[],
  batchSize?: number
): Promise<UploadResponse> {
  try {
    const token = await getAuthToken();

    const response = await fetch(`${API_BASE_URL}/import/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        expenses,
        batchSize: batchSize || 100,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));

      if (response.status === 401) {
        throw new Error('Debes iniciar sesión.');
      }
      if (response.status === 413) {
        throw new Error('Demasiados registros para procesar');
      }
      throw new Error(errorData.message || 'Error al importar gastos');
    }

    return await response.json();
  } catch (error: any) {
    console.error('[Import Service] Error al subir:', error);
    throw error;
  }
}

// ============================================================================
// FUNCIONES LEGACY (para compatibilidad con código existente)
// ============================================================================

/**
 * Resultado de validación legacy
 */
export interface FileValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  rowCount?: number;
  preview?: ImportPreviewRow[];
  success?: boolean;
  totalRows?: number;
  imported?: number;
  skipped?: number;
}

export interface ImportPreviewRow {
  rowNumber: number;
  fecha: string;
  categoria: string;
  subcategoria?: string;
  monto: number;
  moneda: string;
  descripcion: string;
  metodoPago: string;
  valid: boolean;
  errors: string[];
}

export interface ImportResult {
  success: boolean;
  totalRows: number;
  successCount: number;
  errorCount: number;
  errors: Array<{
    row: number;
    field?: string;
    message: string;
  }>;
  importedGastos?: any[];
}

export interface AIAnalysisResult {
  suggestions: AISuggestion[];
  summary: string;
}

/**
 * Validar archivo (legacy)
 */
export async function validateImportFile(file: File): Promise<FileValidationResult> {
  try {
    const result = await validateFile(file);

    return {
      valid: result.success && result.invalidCount === 0,
      errors: result.errors.map(e => e.message),
      warnings: result.warnings,
      rowCount: result.totalRows,
      preview: result.data as ImportPreviewRow[],
      success: result.success,
      totalRows: result.totalRows,
    };
  } catch (error: any) {
    throw error;
  }
}

/**
 * Importar gastos (legacy - ahora usa el flujo completo)
 */
export async function importGastos(
  file: File,
  options?: ImportOptions
): Promise<ImportResult> {
  try {
    // Paso 1: Validar
    const validateResult = await validateFile(file);

    if (!validateResult.success) {
      return {
        success: false,
        totalRows: validateResult.totalRows,
        successCount: 0,
        errorCount: validateResult.invalidCount,
        errors: validateResult.errors.map(e => ({
          row: e.row,
          field: e.field,
          message: e.message,
        })),
      };
    }

    // Paso 2: Analizar
    const analyzeResult = await analyzeExpenses(validateResult.data, {
      skipDuplicates: options?.skipDuplicates ?? true,
      autoCategorizate: options?.autoCategorizate ?? true,
      batchSize: options?.batchSize ?? 100,
    });

    // Paso 3: Subir
    const uploadResult = await uploadExpenses(analyzeResult.data, options?.batchSize);

    return {
      success: uploadResult.success,
      totalRows: uploadResult.totalRows,
      successCount: uploadResult.imported,
      errorCount: uploadResult.failed,
      errors: uploadResult.errors.map(e => ({
        row: e.row,
        field: e.field,
        message: e.message,
      })),
    };
  } catch (error: any) {
    throw error;
  }
}

/**
 * Analizar con IA (legacy)
 */
export async function analyzeImportWithAI(file: File): Promise<AIAnalysisResult> {
  try {
    const validateResult = await validateFile(file);

    const analyzeResult = await analyzeExpenses(validateResult.data, {
      skipDuplicates: false,
      autoCategorizate: true,
      batchSize: 100,
    });

    return {
      suggestions: analyzeResult.aiSuggestions,
      summary: analyzeResult.summary || `Se procesaron ${analyzeResult.totalProcessed} registros.`,
    };
  } catch (error) {
    console.error('[Import Service] Error al analizar:', error);
    return {
      suggestions: [],
      summary: 'No se pudo realizar el análisis de IA.',
    };
  }
}

// ============================================================================
// UTILIDADES
// ============================================================================

/**
 * Descargar plantilla de importación
 */
export async function downloadTemplate(format: 'excel' | 'json' = 'excel'): Promise<Blob> {
  try {
    const token = await getAuthToken();

    const response = await fetch(`${API_BASE_URL}/import/template?format=${format}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Error al descargar la plantilla');
    }

    return await response.blob();
  } catch (error: any) {
    console.error('[Import Service] Error al descargar plantilla:', error);
    throw error;
  }
}

/**
 * Validar formato de archivo
 */
export function validateFileFormat(file: File): { valid: boolean; error?: string } {
  const validExtensions = ['.xlsx', '.xls', '.csv', '.json'];
  const extension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();

  if (!validExtensions.includes(extension)) {
    return {
      valid: false,
      error: 'Formato no válido. Solo .xlsx, .xls, .csv y .json'
    };
  }

  // 5MB max
  if (file.size > 5 * 1024 * 1024) {
    return {
      valid: false,
      error: 'Archivo muy grande. Máximo: 5MB'
    };
  }

  return { valid: true };
}

/**
 * Formatos de archivo soportados
 */
export const SUPPORTED_FORMATS = {
  EXCEL: ['.xlsx', '.xls'],
  CSV: ['.csv'],
  JSON: ['.json'],
  ALL: ['.xlsx', '.xls', '.csv', '.json'],
};

/**
 * Columnas requeridas
 */
export const REQUIRED_COLUMNS = [
  'fecha',
  'categoria',
  'monto',
  'descripcion',
] as const;

/**
 * Columnas opcionales
 */
export const OPTIONAL_COLUMNS = [
  'subcategoria',
  'moneda',
  'metodoPago',
  'tags',
] as const;
