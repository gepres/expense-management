/**
 * Servicio de Importación de Gastos
 *
 * Maneja la importación de gastos desde archivos Excel/CSV
 */

import { auth } from './firebase';

// URL base del backend API
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

/**
 * Resultado de la validación de un archivo
 */
export interface FileValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  rowCount?: number;
  preview?: ImportPreviewRow[];
}

/**
 * Fila de preview antes de importar
 */
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

/**
 * Resultado de la importación
 */
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

/**
 * Configuración de mapeo de columnas
 */
export interface ColumnMapping {
  fecha: string;
  categoria: string;
  subcategoria?: string;
  monto: string;
  moneda: string;
  descripcion: string;
  metodoPago: string;
}

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
 * Validar archivo antes de importar
 *
 * @param file - Archivo a validar
 * @param columnMapping - Mapeo de columnas (opcional)
 * @returns Resultado de la validación
 */
export async function validateImportFile(
  file: File,
  columnMapping?: ColumnMapping
): Promise<FileValidationResult> {
  try {
    const token = await getAuthToken();

    const formData = new FormData();
    formData.append('file', file);

    if (columnMapping) {
      formData.append('columnMapping', JSON.stringify(columnMapping));
    }

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

    const data: FileValidationResult = await response.json();
    return data;

  } catch (error: any) {
    console.error('[Import Service] Error al validar archivo:', error);
    throw error;
  }
}

/**
 * Importar gastos desde un archivo
 *
 * @param file - Archivo a importar
 * @param columnMapping - Mapeo de columnas (opcional)
 * @returns Resultado de la importación
 */
export async function importGastos(
  file: File,
  columnMapping?: ColumnMapping
): Promise<ImportResult> {
  try {
    const token = await getAuthToken();

    const formData = new FormData();
    formData.append('file', file);

    if (columnMapping) {
      formData.append('columnMapping', JSON.stringify(columnMapping));
    }

    const response = await fetch(`${API_BASE_URL}/import/gastos`, {
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
        throw new Error(errorData.message || 'Datos del archivo inválidos');
      }

      if (response.status === 413) {
        throw new Error('El archivo es demasiado grande (máximo 5MB)');
      }

      throw new Error(errorData.message || 'Error al importar gastos');
    }

    const data: ImportResult = await response.json();
    return data;

  } catch (error: any) {
    console.error('[Import Service] Error al importar gastos:', error);
    throw error;
  }
}

/**
 * Descargar plantilla de Excel
 *
 * @returns Blob del archivo de plantilla
 */
export async function downloadTemplate(): Promise<Blob> {
  try {
    const token = await getAuthToken();

    const response = await fetch(`${API_BASE_URL}/import/template`, {
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
  const validExtensions = ['.xlsx', '.xls', '.csv'];
  const extension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();

  if (!validExtensions.includes(extension)) {
    return {
      valid: false,
      error: 'Formato de archivo no válido. Solo se permiten archivos .xlsx, .xls y .csv'
    };
  }

  // 5MB max
  if (file.size > 5 * 1024 * 1024) {
    return {
      valid: false,
      error: 'El archivo es demasiado grande. Tamaño máximo: 5MB'
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
  ALL: ['.xlsx', '.xls', '.csv'],
};

/**
 * Columnas requeridas en el archivo
 */
export const REQUIRED_COLUMNS = [
  'fecha',
  'categoria',
  'monto',
  'descripcion',
] as const;

/**
 * Columnas opcionales en el archivo
 */
export const OPTIONAL_COLUMNS = [
  'subcategoria',
  'moneda',
  'metodoPago',
  'tags',
] as const;
