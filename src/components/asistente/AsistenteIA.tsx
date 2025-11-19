/**
 * Componente del Asistente de IA
 *
 * Interfaz de chat para interactuar con el asistente financiero
 */

import { useState, useRef, useEffect } from 'react';
import { useAssistant } from '@hooks/useAssistant';
import { SUGGESTED_QUESTIONS } from '@services/ai';
import { useAuth } from '@context/AuthContext';
import { formatearFecha } from '@utils/formatters';
import { Lightbulb, Send } from 'lucide-react';

export default function AsistenteIA() {
  const { usuario } = useAuth();
  const { messages, isLoading, sendMessage, clearConversation } = useAssistant();
  const [inputMessage, setInputMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll al último mensaje
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus en el input al cargar
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  /**
   * Enviar mensaje
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (inputMessage.trim() && !isLoading) {
      await sendMessage(inputMessage.trim());
      setInputMessage('');
    }
  };

  /**
   * Usar una pregunta sugerida
   */
  const handleSuggestedQuestion = async (question: string) => {
    if (!isLoading) {
      setInputMessage(question);
      await sendMessage(question);
      setInputMessage('');
    }
  };

  /**
   * Limpiar chat
   */
  const handleClearChat = () => {
    if (window.confirm('¿Estás seguro de que quieres limpiar la conversación?')) {
      clearConversation();
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-6 rounded-t-lg shadow-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center">
              <span className="text-2xl">🤖</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold">Asistente Financiero</h1>
              <p className="text-purple-100 text-sm">
                Powered by Claude AI • {usuario?.nombre}
              </p>
            </div>
          </div>
          <button
            onClick={handleClearChat}
            disabled={messages.length === 0}
            className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
          >
            Limpiar Chat
          </button>
        </div>
      </div>

      {/* Mensajes */}
      <div className="flex-1 overflow-y-auto bg-muted/30 p-6 space-y-4">
        {/* Mensaje de bienvenida */}
        {messages.length === 0 && (
          <div className="text-center py-12">
            <div className="inline-block p-6 bg-gradient-to-br from-purple-100 to-indigo-100 dark:from-purple-900/30 dark:to-indigo-900/30 rounded-2xl shadow-lg mb-6">
              <span className="text-6xl">🤖</span>
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">
              ¡Hola! Soy tu asistente financiero
            </h2>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Puedo ayudarte a analizar tus gastos, identificar oportunidades de ahorro
              y responder preguntas sobre tus finanzas.
            </p>

            {/* Preguntas sugeridas */}
            <div className="max-w-2xl mx-auto">
              <p className="text-sm font-medium text-muted-foreground mb-3">
                Prueba preguntando:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {SUGGESTED_QUESTIONS.slice(0, 6).map((question, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestedQuestion(question)}
                    disabled={isLoading}
                    className="px-4 py-3 bg-card hover:bg-accent border border-border rounded-lg text-sm text-left transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    <Lightbulb className="h-4 w-4 text-purple-600 dark:text-purple-400 flex-shrink-0" />
                    <span>{question}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Lista de mensajes */}
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-2xl px-5 py-3 ${
                message.role === 'user'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-card border border-border text-foreground'
              }`}
            >
              {/* Avatar y nombre */}
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">
                  {message.role === 'user' ? '👤' : '🤖'}
                </span>
                <span className="text-xs font-semibold">
                  {message.role === 'user' ? usuario?.nombre || 'Tú' : 'Asistente'}
                </span>
              </div>

              {/* Contenido del mensaje */}
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <p className="whitespace-pre-wrap">{message.content}</p>
              </div>

              {/* Timestamp */}
              {message.timestamp && (
                <p className="text-xs opacity-70 mt-2">
                  {formatearFecha(message.timestamp)}
                </p>
              )}
            </div>
          </div>
        ))}

        {/* Indicador de carga */}
        {isLoading && (
          <div className="flex justify-start">
            <div className="max-w-[80%] rounded-2xl px-5 py-3 bg-card border border-border">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">🤖</span>
                <span className="text-xs font-semibold">Asistente</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0s' }}></div>
                  <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                </div>
                <span className="text-sm text-muted-foreground">Pensando...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="bg-card border-t border-border p-4">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Escribe tu pregunta..."
            disabled={isLoading}
            className="flex-1 px-4 py-3 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
            maxLength={1000}
          />
          <button
            type="submit"
            disabled={!inputMessage.trim() || isLoading}
            className="px-6 py-3 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Enviando...</span>
              </>
            ) : (
              <>
                <span>Enviar</span>
                <Send className="h-4 w-4" />
              </>
            )}
          </button>
        </form>

        {/* Contador de caracteres */}
        <p className="text-xs text-muted-foreground mt-2 text-right">
          {inputMessage.length}/1000 caracteres
        </p>
      </div>
    </div>
  );
}
