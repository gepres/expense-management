/**
 * Hook personalizado para el Asistente de IA
 */

import { useState, useCallback } from 'react';
import {
  callAssistant,
  prepareUserContext,
  validateMessage,
  type ConversationMessage,
  type UserContext,
} from '@services/ai';
import { useGastos } from './useGastos';
import { usePresupuestos } from './usePresupuestos';
import { toast } from 'react-hot-toast';

interface UseAssistantReturn {
  messages: ConversationMessage[];
  isLoading: boolean;
  error: string | null;
  sendMessage: (message: string) => Promise<void>;
  clearConversation: () => void;
}

/**
 * Hook para gestionar la conversación con el asistente de IA
 */
export function useAssistant(): UseAssistantReturn {
  const { gastos } = useGastos();
  const { presupuestos } = usePresupuestos();

  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Obtener el mes actual
  const mesActual = (() => {
    const fecha = new Date();
    return `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}`;
  })();

  /**
   * Enviar un mensaje al asistente
   */
  const sendMessage = useCallback(
    async (message: string) => {
      // Validar el mensaje
      const validation = validateMessage(message);
      if (!validation.valid) {
        toast.error(validation.error || 'Mensaje inválido');
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        // Agregar el mensaje del usuario al historial
        const userMessage: ConversationMessage = {
          role: 'user',
          content: message,
          timestamp: new Date(),
        };

        setMessages((prev) => [...prev, userMessage]);

        // Preparar el contexto del usuario
        const context: UserContext = prepareUserContext(gastos, presupuestos, mesActual);

        // Llamar al asistente
        const response = await callAssistant(message, context, messages);

        // Agregar la respuesta del asistente al historial
        const assistantMessage: ConversationMessage = {
          role: 'assistant',
          content: response.message,
          timestamp: new Date(),
        };

        setMessages((prev) => [...prev, assistantMessage]);

        // Log de uso de tokens (opcional, para debugging)
        console.log(
          `[Asistente] Tokens usados: ${response.usage.inputTokens + response.usage.outputTokens}`
        );

      } catch (err: any) {
        console.error('[useAssistant] Error:', err);
        const errorMessage = err.message || 'Error al comunicarse con el asistente';
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    },
    [gastos, presupuestos, messages, mesActual]
  );

  /**
   * Limpiar la conversación
   */
  const clearConversation = useCallback(() => {
    setMessages([]);
    setError(null);
  }, []);

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    clearConversation,
  };
}
