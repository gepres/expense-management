/**
 * Hook personalizado para el Asistente de IA con soporte para conversaciones
 */

import { useState, useCallback } from 'react';
import {
  getConversations,
  createConversation,
  deleteConversation,
  getMessages,
  sendMessageToConversation,
  validateMessage,
  updateConversation,
  type Conversation,
  type ConversationMessage,
} from '@services/ai';
import { toast } from 'react-hot-toast';

interface UseAssistantReturn {
  conversations: Conversation[];
  currentConversationId: string | null;
  messages: ConversationMessage[];
  isLoading: boolean;
  isLoadingConversations: boolean;
  error: string | null;
  loadConversations: () => Promise<void>;
  selectConversation: (id: string) => Promise<void>;
  createNewConversation: (title?: string) => Promise<string>;
  deleteChat: (id: string) => Promise<void>;
  renameChat: (id: string, title: string) => Promise<void>;
  sendMessage: (message: string, month?: number, year?: number) => Promise<void>;
  clearCurrentConversation: () => void;
}

export function useAssistant(): UseAssistantReturn {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingConversations, setIsLoadingConversations] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cargar conversaciones al montar (opcional, puede ser llamado manualmente)
  const loadConversations = useCallback(async () => {
    setIsLoadingConversations(true);
    try {
      const data = await getConversations();
      setConversations(data);
    } catch (err) {
      console.error('Error loading conversations:', err);
      toast.error('Error al cargar el historial');
    } finally {
      setIsLoadingConversations(false);
    }
  }, []);

  // Seleccionar una conversación y cargar sus mensajes
  const selectConversation = useCallback(async (id: string) => {
    setCurrentConversationId(id);
    setIsLoading(true);
    try {
      const msgs = await getMessages(id);
      setMessages(msgs);
    } catch (err) {
      console.error('Error loading messages:', err);
      toast.error('Error al cargar los mensajes');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Crear nueva conversación
  const createNewConversation = useCallback(async (title?: string) => {
    setIsLoading(true);
    try {
      const newConv = await createConversation(title);
      setConversations((prev) => [newConv, ...prev]);
      setCurrentConversationId(newConv.id);
      setMessages([]);
      return newConv.id;
    } catch (err) {
      console.error('Error creating conversation:', err);
      toast.error('Error al crear nueva conversación');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Eliminar conversación
  const deleteChat = useCallback(async (id: string) => {
    if (!window.confirm('¿Estás seguro de eliminar este chat?')) return;
    
    try {
      await deleteConversation(id);
      setConversations((prev) => prev.filter((c) => c.id !== id));
      if (currentConversationId === id) {
        setCurrentConversationId(null);
        setMessages([]);
      }
      toast.success('Chat eliminado');
    } catch (err) {
      console.error('Error deleting conversation:', err);
      toast.error('Error al eliminar el chat');
    }
  }, [currentConversationId]);

  // Renombrar conversación
  const renameChat = useCallback(async (id: string, title: string) => {
    try {
      const updated = await updateConversation(id, title);
      setConversations((prev) => prev.map((c) => (c.id === id ? updated : c)));
    } catch (err) {
      console.error('Error updating conversation:', err);
      toast.error('Error al renombrar el chat');
    }
  }, []);

  // Enviar mensaje
  const sendMessage = useCallback(
    async (message: string, month?: number, year?: number) => {
      const validation = validateMessage(message);
      if (!validation.valid) {
        toast.error(validation.error || 'Mensaje inválido');
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        let targetId = currentConversationId;

        // Si no hay conversación seleccionada, crear una nueva primero
        if (!targetId) {
          const newConv = await createConversation(message.slice(0, 30) + '...');
          targetId = newConv.id;
          setCurrentConversationId(targetId);
          setConversations((prev) => [newConv, ...prev]);
        }

        // Agregar mensaje optimista
        const userMessage: ConversationMessage = {
          role: 'user',
          content: message,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, userMessage]);

        // Enviar al backend
        const response = await sendMessageToConversation(targetId, message, month, year);

        // Agregar respuesta
        const assistantMessage: ConversationMessage = {
          role: 'assistant',
          content: response.message,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, assistantMessage]);

        // Actualizar lista de conversaciones (para actualizar timestamp/preview si fuera necesario)
        // Por simplicidad, solo movemos la conversación al inicio si ya existe
        setConversations((prev) => {
          const convIndex = prev.findIndex((c) => c.id === targetId);
          if (convIndex > -1) {
            const updatedConv = { ...prev[convIndex], updatedAt: new Date().toISOString() };
            const newPrev = [...prev];
            newPrev.splice(convIndex, 1);
            return [updatedConv, ...newPrev];
          }
          return prev;
        });

      } catch (err: any) {
        console.error('[useAssistant] Error:', err);
        const errorMessage = err.message || 'Error al comunicarse con el asistente';
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    },
    [currentConversationId]
  );

  const clearCurrentConversation = useCallback(() => {
    setCurrentConversationId(null);
    setMessages([]);
  }, []);

  return {
    conversations,
    currentConversationId,
    messages,
    isLoading,
    isLoadingConversations,
    error,
    loadConversations,
    selectConversation,
    createNewConversation,
    deleteChat,
    renameChat,
    sendMessage,
    clearCurrentConversation,
  };
}
