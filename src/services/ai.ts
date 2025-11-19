/**
 * Servicio de Asistente IA
 *
 * Maneja la comunicación con el backend para el asistente de IA
 */

import { auth } from './firebase';
import type { Gasto, Presupuesto } from '@types';

// URL base del backend API (configurable por entorno)
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

/**
 * Interfaz para el contexto del usuario que se envía a la IA
 */
export interface UserContext {
  gastos: Gasto[];
  presupuestos: Presupuesto[];
  mes: string;
}

/**
 * Interfaz para el historial de conversación
 */
export interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: Date;
}

/**
 * Interfaz para la solicitud al asistente
 */
interface AssistantRequest {
  message: string;
  context: UserContext;
  conversationHistory?: ConversationMessage[];
}

/**
 * Interfaz para la respuesta del asistente
 */
export interface AssistantResponse {
  success: boolean;
  message: string;
  usage: {
    inputTokens: number;
    outputTokens: number;
  };
}

/**
 * Obtener el token de autenticación del usuario actual
 */
async function getAuthToken(): Promise<string> {
  const user = auth.currentUser;
  if (!user) {
    throw new Error('Usuario no autenticado');
  }
  return await user.getIdToken();
}

/**
 * Llamar al asistente de IA
 *
 * @param message - Mensaje del usuario
 * @param context - Contexto financiero del usuario
 * @param conversationHistory - Historial de conversación (opcional)
 * @returns Respuesta del asistente
 */
export async function callAssistant(
  message: string,
  context: UserContext,
  conversationHistory?: ConversationMessage[]
): Promise<AssistantResponse> {
  try {
    // Obtener token de autenticación
    const token = await getAuthToken();

    // Preparar la solicitud
    const request: AssistantRequest = {
      message,
      context,
      conversationHistory: conversationHistory || [],
    };

    // Llamar a la API del backend
    const response = await fetch(`${API_BASE_URL}/assistant/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(request),
    });

    // Verificar errores HTTP
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));

      // Manejar errores específicos por código de estado
      if (response.status === 401) {
        throw new Error('Debes iniciar sesión para usar el asistente.');
      }

      if (response.status === 429) {
        throw new Error('Se ha excedido el límite de solicitudes. Por favor, intenta más tarde.');
      }

      if (response.status === 400) {
        throw new Error(errorData.message || 'Los datos enviados al asistente no son válidos.');
      }

      if (response.status === 500) {
        throw new Error('Error en el servidor. Por favor, intenta más tarde.');
      }

      throw new Error(errorData.message || 'Error al comunicarse con el asistente.');
    }

    // Parsear la respuesta
    const data: AssistantResponse = await response.json();
    return data;

  } catch (error: any) {
    console.error('[AI Service] Error al llamar al asistente:', error);

    // Si ya es un error conocido, re-lanzarlo
    if (error.message.includes('iniciar sesión') ||
        error.message.includes('límite de solicitudes') ||
        error.message.includes('datos enviados')) {
      throw error;
    }

    // Error genérico
    throw new Error(
      error.message || 'Error al comunicarse con el asistente. Por favor, intenta de nuevo.'
    );
  }
}

/**
 * Preparar el contexto del usuario para enviar al asistente
 *
 * @param gastos - Gastos del usuario
 * @param presupuestos - Presupuestos del usuario
 * @param mes - Mes actual en formato YYYY-MM
 * @returns Contexto formateado
 */
export function prepareUserContext(
  gastos: Gasto[],
  presupuestos: Presupuesto[],
  mes: string
): UserContext {
  // Filtrar solo los gastos del mes actual
  const gastosDelMes = gastos.filter((gasto) => {
    const fechaGasto = new Date(gasto.fecha);
    const mesGasto = `${fechaGasto.getFullYear()}-${String(fechaGasto.getMonth() + 1).padStart(2, '0')}`;
    return mesGasto === mes;
  });

  // Filtrar solo los presupuestos del mes actual
  const presupuestosDelMes = presupuestos.filter((presupuesto) => presupuesto.mes === mes);

  return {
    gastos: gastosDelMes,
    presupuestos: presupuestosDelMes,
    mes,
  };
}

/**
 * Sugerencias de preguntas predefinidas para el asistente
 */
export const SUGGESTED_QUESTIONS = [
  '¿Cómo van mis gastos este mes?',
  '¿En qué categoría gasto más?',
  '¿Tengo gastos inusuales este mes?',
  '¿Qué puedo hacer para ahorrar más?',
  '¿Cómo está mi presupuesto?',
  '¿Cuál es mi patrón de gastos?',
  'Dame consejos para mejorar mis finanzas',
  '¿Debo ajustar mis presupuestos?',
];

/**
 * Validar que el mensaje no esté vacío
 */
export function validateMessage(message: string): { valid: boolean; error?: string } {
  if (!message || message.trim().length === 0) {
    return { valid: false, error: 'El mensaje no puede estar vacío' };
  }

  if (message.length > 1000) {
    return { valid: false, error: 'El mensaje es demasiado largo (máximo 1000 caracteres)' };
  }

  return { valid: true };
}
