import { getAuth } from 'firebase/auth';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

export interface VoiceExpenseData {
  monto: number;
  moneda: 'PEN' | 'USD';
  categoria: string;
  subcategoria?: string;
  descripcion: string;
  metodoPago?: string;
  fecha?: string;
  confidence: number;
}

/** Mapea la respuesta del backend (puede variar nombres) a VoiceExpenseData. */
function mapExpenseResponse(rawData: any): VoiceExpenseData {
  const mappedData: VoiceExpenseData = {
    monto: rawData.monto || rawData.amount || 0,
    moneda: rawData.moneda || rawData.currency || 'PEN',
    categoria: rawData.categoria || rawData.category || 'otros',
    subcategoria:
      rawData.subcategoria || rawData.subcategory || rawData.subCategory,
    descripcion: rawData.descripcion || rawData.description || '',
    metodoPago:
      rawData.metodoPago || rawData.paymentMethod || rawData.payment_method,
    fecha: rawData.fecha || rawData.date,
    confidence: rawData.confidence || rawData.confianza || 0,
  };
  console.log('✅ Datos mapeados:', mappedData);
  return mappedData;
}

/** Extensión por mimeType del Blob (para el nombre del archivo multipart). */
function audioFilename(blob: Blob): string {
  const t = blob.type || 'audio/webm';
  const ext = t.includes('ogg')
    ? 'ogg'
    : t.includes('mp4') || t.includes('mpeg')
      ? 'mp4'
      : t.includes('wav')
        ? 'wav'
        : 'webm';
  return `voz.${ext}`;
}

export const VoiceService = {
  /**
   * Procesa un texto ya transcrito (compat / fallback de texto).
   */
  async processExpenseFromVoice(transcript: string): Promise<VoiceExpenseData> {
    const auth = getAuth();
    const token = await auth.currentUser?.getIdToken();

    if (!token) {
      throw new Error('No hay sesión activa');
    }

    const response = await fetch(`${API_BASE_URL}/voice/process-expense`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ transcript }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Error al procesar entrada de voz');
    }

    const rawData = await response.json();
    console.log('📝 Respuesta del backend (voz):', rawData);
    return mapExpenseResponse(rawData);
  },

  /**
   * Envía el audio grabado; el backend transcribe (Whisper server-side) y
   * devuelve el gasto ya clasificado contra la taxonomía del usuario.
   */
  async processAudioExpense(audio: Blob): Promise<VoiceExpenseData> {
    const auth = getAuth();
    const token = await auth.currentUser?.getIdToken();

    if (!token) {
      throw new Error('No hay sesión activa');
    }

    const formData = new FormData();
    formData.append('audio', audio, audioFilename(audio));

    const response = await fetch(`${API_BASE_URL}/voice/process-audio`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      if (response.status === 429) {
        throw new Error(
          errorData.message || 'Alcanzaste tu cuota de IA por este periodo.',
        );
      }
      throw new Error(errorData.message || 'Error al procesar el audio');
    }

    const rawData = await response.json();
    console.log('🎙️ Respuesta del backend (audio):', rawData);
    return mapExpenseResponse(rawData);
  },
};
