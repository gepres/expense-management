/**
 * Servicio de Asistente IA
 *
 * Maneja la comunicación con el backend para el asistente de IA
 */

import { auth } from './firebase';

// URL base del backend API (configurable por entorno)
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

/**
 * Interfaz para el historial de conversación
 */
export interface ConversationMessage {
  id?: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp?: Date;
}

/**
 * Interfaz para una conversación
 */
export interface Conversation {
  id: string;
  title: string;
  messageCount: number;
  lastMessagePreview?: string;
  updatedAt: string;
}

/**
 * Interfaz para la respuesta del asistente
 */
export interface AssistantResponse {
  success: boolean;
  message: string;
  usage?: {
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
 * Helper para realizar peticiones fetch con autenticación y manejo de errores
 */
async function fetchWithAuth(endpoint: string, options: RequestInit = {}) {
  const token = await getAuthToken();
  
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...options.headers,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    
    if (response.status === 401) throw new Error('Debes iniciar sesión.');
    if (response.status === 429) throw new Error('Límite de solicitudes excedido.');
    if (response.status === 500) throw new Error('Error del servidor.');
    
    throw new Error(errorData.message || 'Error en la petición.');
  }

  return response.json();
}

/**
 * Llamar al asistente de IA (Mensaje simple sin conversación persistente)
 */
export async function callAssistant(
  message: string,
  month: number,
  year: number
): Promise<AssistantResponse> {
  try {
    const data = await fetchWithAuth('/chat/message', {
      method: 'POST',
      body: JSON.stringify({ message, month, year }),
    });
    
    console.log('data asistent',data);
    
    return {
      success: true,
      message: data.response || 'No pude generar una respuesta.',
      usage: data.usage
    };
  } catch (error: any) {
    console.error('[AI Service] Error:', error);
    throw error;
  }
}

// --- Conversation APIs ---

/**
 * Obtener todas las conversaciones
 */
export async function getConversations(): Promise<Conversation[]> {
  return await fetchWithAuth('/chat/conversations');
}

/**
 * Crear una nueva conversación
 */
export async function createConversation(title?: string): Promise<Conversation> {
  return await fetchWithAuth('/chat/conversations', {
    method: 'POST',
    body: JSON.stringify({ title }),
  });
}

/**
 * Obtener una conversación por ID
 */
export async function getConversation(id: string): Promise<Conversation> {
  return await fetchWithAuth(`/chat/conversations/${id}`);
}

/**
 * Actualizar una conversación
 */
export async function updateConversation(id: string, title: string): Promise<Conversation> {
  return await fetchWithAuth(`/chat/conversations/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ title }),
  });
}

/**
 * Eliminar una conversación
 */
export async function deleteConversation(id: string): Promise<void> {
  await fetchWithAuth(`/chat/conversations/${id}`, {
    method: 'DELETE',
  });
}

/**
 * Obtener mensajes de una conversación
 */
export async function getMessages(conversationId: string): Promise<ConversationMessage[]> {
  const messages = await fetchWithAuth(`/chat/conversations/${conversationId}/messages`);
  return messages.map((msg: any) => ({
    id: msg.id,
    role: msg.role,
    content: msg.content,
    timestamp: new Date(msg.timestamp),
  }));
}

/**
 * Enviar mensaje a una conversación específica
 */
export async function sendMessageToConversation(
  conversationId: string,
  message: string,
  month?: number,
  year?: number
): Promise<AssistantResponse> {
  const data = await fetchWithAuth(`/chat/conversations/${conversationId}/messages`, {
    method: 'POST',
    body: JSON.stringify({ message, month, year }),
  });

  return {
    success: true,
    message: data.response,
    usage: data.usage
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
  '¿Cómo puedo empezar a invertir?',
  '¿Qué opciones de inversión tengo con poco dinero?',
  'Dame ideas para generar ingresos extra',
  '¿Cómo crear un fondo de emergencia?',
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
