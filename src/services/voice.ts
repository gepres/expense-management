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

export const VoiceService = {
  /**
   * Procesa un texto transcrito y extrae datos del gasto usando IA
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
    
    // Log para debugging
    console.log('📝 Respuesta del backend (voz):', rawData);

    // Mapear datos del backend a la estructura esperada
    // El backend puede enviar diferentes nombres de campos
    const mappedData: VoiceExpenseData = {
      monto: rawData.monto || rawData.amount || 0,
      moneda: rawData.moneda || rawData.currency || 'PEN',
      categoria: rawData.categoria || rawData.category || 'otros',
      subcategoria: rawData.subcategoria || rawData.subcategory || rawData.subCategory,
      descripcion: rawData.descripcion || rawData.description || '',
      metodoPago: rawData.metodoPago || rawData.paymentMethod || rawData.payment_method,
      fecha: rawData.fecha || rawData.date,
      confidence: rawData.confidence || rawData.confianza || 0,
    };

    console.log('✅ Datos mapeados:', mappedData);

    return mappedData;
  },
};
