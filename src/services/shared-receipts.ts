/**
 * Servicio de fotos adjuntas para gastos y aportes compartidos.
 *
 * Las imágenes se almacenan en Firebase Storage bajo
 *   shared-groups/{groupId}/{kind}s/{userId}_{timestamp}.{ext}
 * y la URL/path se persisten en el doc del expense/budget vía backend.
 *
 * Solo disponible para usuarios PRO. El gate vive en el componente
 * (ReceiptUploader); este servicio asume que la llamada ya pasó el gate.
 */

import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from 'firebase/storage';
import { auth, storage } from './firebase';

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB
const COMPRESS_THRESHOLD_BYTES = 500 * 1024; // > 500 KB → comprimir
const MAX_DIMENSION_PX = 1600; // lado mayor tras compresión
const JPEG_QUALITY = 0.82;
const SUPPORTED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

export type ReceiptKind = 'expense' | 'budget';

export interface UploadReceiptResult {
  url: string;
  path: string;
}

export function validateReceiptFile(file: File): { valid: boolean; error?: string } {
  if (!SUPPORTED_TYPES.includes(file.type)) {
    return { valid: false, error: 'Formato no soportado. Usa JPG, PNG o WEBP.' };
  }
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return { valid: false, error: 'La imagen supera los 5 MB.' };
  }
  return { valid: true };
}

/**
 * Comprime y redimensiona la imagen en cliente si supera el umbral.
 * Mantiene el tipo original cuando es PNG/WEBP transparente; convierte a JPEG en otros casos.
 */
async function compressIfNeeded(file: File): Promise<Blob> {
  if (file.size <= COMPRESS_THRESHOLD_BYTES) return file;

  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('No se pudo leer la imagen'));
    reader.readAsDataURL(file);
  });

  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const i = new Image();
    i.onload = () => resolve(i);
    i.onerror = () => reject(new Error('No se pudo procesar la imagen'));
    i.src = dataUrl;
  });

  const { width, height } = img;
  const longest = Math.max(width, height);
  const scale = longest > MAX_DIMENSION_PX ? MAX_DIMENSION_PX / longest : 1;
  const targetW = Math.round(width * scale);
  const targetH = Math.round(height * scale);

  const canvas = document.createElement('canvas');
  canvas.width = targetW;
  canvas.height = targetH;
  const ctx = canvas.getContext('2d');
  if (!ctx) return file;
  ctx.drawImage(img, 0, 0, targetW, targetH);

  const blob = await new Promise<Blob | null>(resolve =>
    canvas.toBlob(resolve, 'image/jpeg', JPEG_QUALITY),
  );
  if (!blob) return file;
  return blob.size < file.size ? blob : file;
}

function extensionFor(blob: Blob, original: File): string {
  if (blob.type === 'image/jpeg') return 'jpg';
  if (blob.type === 'image/png') return 'png';
  if (blob.type === 'image/webp') return 'webp';
  const fromName = original.name.includes('.')
    ? original.name.substring(original.name.lastIndexOf('.') + 1).toLowerCase()
    : 'jpg';
  return fromName || 'jpg';
}

export async function uploadReceipt(
  groupId: string,
  kind: ReceiptKind,
  file: File,
): Promise<UploadReceiptResult> {
  const user = auth.currentUser;
  if (!user) throw new Error('Debes iniciar sesión para subir la foto.');

  const check = validateReceiptFile(file);
  if (!check.valid) throw new Error(check.error);

  const blob = await compressIfNeeded(file);
  const ext = extensionFor(blob, file);
  const path = `shared-groups/${groupId}/${kind}s/${user.uid}_${Date.now()}.${ext}`;
  const storageRef = ref(storage, path);
  const contentType = blob.type || file.type || 'image/jpeg';

  await uploadBytes(storageRef, blob, { contentType });
  const url = await getDownloadURL(storageRef);
  return { url, path };
}

export async function deleteReceipt(path: string): Promise<void> {
  if (!path) return;
  try {
    await deleteObject(ref(storage, path));
  } catch (error) {
    // Tolerar si ya no existe; el doc queda limpio igual.
    console.warn('[shared-receipts] No se pudo eliminar la foto:', error);
  }
}
