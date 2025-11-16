/**
 * Servicio de Escaneo de Recibos
 *
 * Maneja el escaneo de imágenes de recibos/boletas y extracción de datos
 */

import { auth } from './firebase';

// URL base del backend API
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

/**
 * Datos extraídos de un recibo
 */
export interface ReceiptData {
  amount: number;
  currency: 'PEN' | 'USD';
  date: string; // ISO format YYYY-MM-DD
  time?: string; // HH:mm:ss
  paymentMethod: string;
  merchant?: string;
  referenceNumber?: string;
  category?: string;
  subcategory?: string;
  description?: string;
  confidence: number; // 0-100
}

/**
 * Resultado del escaneo de recibo
 */
export interface ScanReceiptResult {
  success: boolean;
  receiptId: string;
  imageUrl: string;
  cloudinaryPublicId: string;
  data: ReceiptData;
  suggestions: string[];
  status: 'processing' | 'processed' | 'error';
  error?: string;
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
 * Escanear un recibo/boleta
 *
 * @param imageFile - Archivo de imagen del recibo
 * @returns Datos extraídos del recibo
 */
export async function scanReceipt(imageFile: File): Promise<ScanReceiptResult> {
  try {
    const token = await getAuthToken();

    const formData = new FormData();
    formData.append('image', imageFile);

    const response = await fetch(`${API_BASE_URL}/receipts/scan`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));

      if (response.status === 401) {
        throw new Error('Debes iniciar sesión para escanear recibos.');
      }

      if (response.status === 400) {
        throw new Error(errorData.message || 'Imagen inválida');
      }

      if (response.status === 413) {
        throw new Error('La imagen es demasiado grande (máximo 5MB)');
      }

      throw new Error(errorData.message || 'Error al escanear el recibo');
    }

    const data: ScanReceiptResult = await response.json();
    return data;

  } catch (error: any) {
    console.error('[Receipt Service] Error al escanear recibo:', error);
    throw error;
  }
}

/**
 * Validar formato de imagen
 */
export function validateImageFormat(file: File): { valid: boolean; error?: string } {
  const validExtensions = ['.jpg', '.jpeg', '.png', '.webp'];
  const extension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();

  if (!validExtensions.includes(extension)) {
    return {
      valid: false,
      error: 'Formato de imagen no válido. Solo se permiten archivos .jpg, .jpeg, .png y .webp'
    };
  }

  // 5MB max
  if (file.size > 5 * 1024 * 1024) {
    return {
      valid: false,
      error: 'La imagen es demasiado grande. Tamaño máximo: 5MB'
    };
  }

  return { valid: true };
}

/**
 * Formatos de imagen soportados
 */
export const SUPPORTED_IMAGE_FORMATS = ['.jpg', '.jpeg', '.png', '.webp'];
