/**
 * Componente del Asistente de IA Avanzado
 *
 * Incluye historial de conversaciones y chat interactivo
 */

import { useState, useRef, useEffect } from 'react';
import { useAssistant } from '@hooks/useAssistant';
import { SUGGESTED_QUESTIONS } from '@services/ai';
import { useAuth } from '@context/AuthContext';
import { formatearFecha } from '@utils/formatters';
import { Lightbulb, Send, Calendar, MessageSquare, Plus, Trash2, Menu, X, Edit2, Check } from 'lucide-react';

export default function AsistenteIA() {
  const { usuario } = useAuth();
  const {
    conversations,
    currentConversationId,
    messages,
    isLoading,
    isLoadingConversations,
    loadConversations,
    selectConversation,
    createNewConversation,
    deleteChat,
    renameChat,
    sendMessage,
    clearCurrentConversation
  } = useAssistant();

  const [inputMessage, setInputMessage] = useState('');
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [showSidebar, setShowSidebar] = useState(false);
  const [editingConvId, setEditingConvId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Cargar historial al iniciar
  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  // Auto-scroll al último mensaje
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus en el input al cargar o cambiar de chat
  useEffect(() => {
    if (!isLoading) {
      inputRef.current?.focus();
    }
  }, [currentConversationId, isLoading]);

  // Cerrar sidebar en mobile al seleccionar chat
  const handleSelectChat = (id: string) => {
    selectConversation(id);
    setShowSidebar(false);
  };

  const handleNewChat = async () => {
    clearCurrentConversation();
    setShowSidebar(false);
    // Opcional: Crear inmediatamente o esperar al primer mensaje
    // await createNewConversation(); 
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (inputMessage.trim() && !isLoading) {
      await sendMessage(inputMessage.trim(), selectedMonth, selectedYear);
      setInputMessage('');
    }
  };

  const handleSuggestedQuestion = async (question: string) => {
    if (!isLoading) {
      setInputMessage(question);
      await sendMessage(question, selectedMonth, selectedYear);
      setInputMessage('');
    }
  };

  const startEditing = (id: string, currentTitle: string) => {
    setEditingConvId(id);
    setEditTitle(currentTitle);
  };

  const saveTitle = async (id: string) => {
    if (editTitle.trim()) {
      await renameChat(id, editTitle);
    }
    setEditingConvId(null);
  };

  return (
    <div className="flex h-[calc(100dvh-9rem)] md:h-[calc(100vh-10rem)] overflow-hidden bg-background rounded-2xl border border-border shadow-sm">
      
      {/* Sidebar (Desktop & Mobile Drawer) */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-72 bg-card/95 backdrop-blur-xl border-r border-border transform transition-transform duration-300 cubic-bezier(0.4, 0, 0.2, 1)
        md:relative md:translate-x-0 md:w-64 md:bg-card
        ${showSidebar ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex flex-col h-full">
          <div className="p-4 border-b border-border flex items-center justify-between bg-muted/30">
            <h2 className="font-semibold text-foreground flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-primary" />
              Historial
            </h2>
            <button 
              onClick={() => setShowSidebar(false)} 
              className="md:hidden p-2 hover:bg-accent rounded-full transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="p-4">
            <button
              onClick={handleNewChat}
              className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground py-2.5 px-4 rounded-xl transition-all shadow-sm hover:shadow font-medium"
            >
              <Plus className="h-4 w-4" />
              Nuevo Chat
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-1 scrollbar-thin">
            {isLoadingConversations ? (
              <div className="flex justify-center p-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              </div>
            ) : conversations.length === 0 ? (
              <p className="text-center text-sm text-muted-foreground p-4">
                No hay conversaciones previas.
              </p>
            ) : (
              conversations.map((conv) => (
                <div
                  key={conv.id}
                  className={`group flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all ${
                    currentConversationId === conv.id 
                      ? 'bg-primary/10 text-primary font-medium' 
                      : 'hover:bg-muted text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {editingConvId === conv.id ? (
                    <div className="flex items-center gap-1 w-full">
                      <input
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className="flex-1 bg-background border border-input rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                        autoFocus
                        onKeyDown={(e) => e.key === 'Enter' && saveTitle(conv.id)}
                        onClick={(e) => e.stopPropagation()}
                      />
                      <button onClick={(e) => { e.stopPropagation(); saveTitle(conv.id); }} className="p-1 text-green-600 hover:bg-green-50 rounded">
                        <Check className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <button 
                        className="flex-1 text-left truncate text-sm"
                        onClick={() => handleSelectChat(conv.id)}
                      >
                        {conv.title || 'Nueva conversación'}
                      </button>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={(e) => { e.stopPropagation(); startEditing(conv.id, conv.title); }}
                          className="p-1.5 hover:bg-background rounded-lg hover:text-primary transition-colors"
                          title="Renombrar"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        <button 
                          onClick={(e) => { e.stopPropagation(); deleteChat(conv.id); }}
                          className="p-1.5 hover:bg-background rounded-lg hover:text-destructive transition-colors"
                          title="Eliminar"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Overlay for mobile sidebar */}
      {showSidebar && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden animate-in fade-in duration-200"
          onClick={() => setShowSidebar(false)}
        />
      )}

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col h-full w-full bg-muted/10">
        {/* Header */}
        <div className="bg-card/80 backdrop-blur-md border-b border-border p-3 md:p-4 flex items-center justify-between shadow-sm z-10 sticky top-0">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setShowSidebar(true)}
              className="md:hidden p-2 -ml-2 hover:bg-accent rounded-full transition-colors"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="h-9 w-9 md:h-10 md:w-10 rounded-full bg-primary/10 flex items-center justify-center text-lg md:text-xl ring-2 ring-background shadow-sm">
              🤖
            </div>
            <div>
              <h1 className="text-base md:text-lg font-bold text-foreground leading-tight">Asistente</h1>
              <p className="text-[10px] md:text-xs text-muted-foreground hidden sm:block">
                {usuario?.nombre ? `Hola, ${usuario.nombre}` : 'Bienvenido'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-muted/50 px-3 py-1.5 rounded-md border border-border text-sm">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              className="bg-transparent border-none focus:ring-0 p-0 text-foreground font-medium cursor-pointer text-xs sm:text-sm"
            >
              {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                <option key={m} value={m}>
                  {new Date(0, m - 1).toLocaleString('es', { month: 'short' })}
                </option>
              ))}
            </select>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="bg-transparent border-none focus:ring-0 p-0 text-foreground font-medium cursor-pointer text-xs sm:text-sm"
            >
              <option value={2023}>2023</option>
              <option value={2024}>2024</option>
              <option value={2025}>2025</option>
            </select>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6 scroll-smooth bg-background/50">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full py-12 text-center animate-in fade-in duration-500">
              <div className="w-20 h-20 bg-primary/5 rounded-full flex items-center justify-center mb-6 animate-bounce-slow">
                <span className="text-4xl">👋</span>
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-2">
                ¿En qué puedo ayudarte hoy?
              </h2>
              <p className="text-muted-foreground mb-8 max-w-md">
                Selecciona un mes y año para analizar tus gastos o haz una pregunta general.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl w-full px-4">
                {SUGGESTED_QUESTIONS.slice(0, 4).map((question, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestedQuestion(question)}
                    disabled={isLoading}
                    className="p-4 bg-card hover:bg-accent border border-border hover:border-primary/50 rounded-xl text-sm text-left transition-all hover:shadow-md group flex items-start gap-3"
                  >
                    <Lightbulb className="h-5 w-5 text-yellow-500 group-hover:text-yellow-600 mt-0.5 flex-shrink-0" />
                    <span className="group-hover:text-foreground text-muted-foreground">{question}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2 duration-300`}
              >
                <div
                  className={`max-w-[85%] sm:max-w-[75%] rounded-2xl px-5 py-4 shadow-sm ${
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground rounded-tr-none'
                      : 'bg-card border border-border text-foreground rounded-tl-none'
                  }`}
                >
                  <div className="prose prose-sm dark:prose-invert max-w-none break-words">
                    <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
                  </div>
                  {message.timestamp && !isNaN(new Date(message.timestamp).getTime()) && (
                    <p className={`text-[10px] mt-2 text-right ${
                      message.role === 'user' ? 'text-primary-foreground/70' : 'text-muted-foreground'
                    }`}>
                      {formatearFecha(message.timestamp)}
                    </p>
                  )}
                </div>
              </div>
            ))
          )}

          {isLoading && (
            <div className="flex justify-start animate-in fade-in duration-300">
              <div className="bg-card border border-border rounded-2xl rounded-tl-none px-5 py-4 shadow-sm flex items-center gap-3">
                <div className="flex gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-primary/60 animate-bounce [animation-delay:-0.3s]"></div>
                  <div className="w-2 h-2 rounded-full bg-primary/60 animate-bounce [animation-delay:-0.15s]"></div>
                  <div className="w-2 h-2 rounded-full bg-primary/60 animate-bounce"></div>
                </div>
                <span className="text-xs text-muted-foreground font-medium">Analizando...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="bg-background border-t border-border p-3 md:p-4">
          <div className="max-w-4xl mx-auto relative">
            <form onSubmit={handleSubmit} className="flex items-end">
              <div className="flex-1 relative">
                <textarea
                  ref={inputRef}
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSubmit(e);
                    }
                  }}
                  placeholder="Escribe tu pregunta aquí..."
                  disabled={isLoading}
                  className="w-full px-4 py-3 pr-12 rounded-2xl border border-input bg-muted/30 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:bg-background transition-all resize-none min-h-[48px] max-h-[150px] text-sm md:text-base leading-relaxed"
                  rows={1}
                  style={{ height: 'auto', minHeight: '48px' }}
                />
                <div className="absolute right-3 bottom-3 text-[10px] text-muted-foreground pointer-events-none">
                  {inputMessage.length}/1000
                </div>
              </div>
              
              <button
                type="submit"
                disabled={!inputMessage.trim() || isLoading}
                className="h-[48px] w-[48px] mb-1 ml-2 flex-shrink-0 bg-primary hover:bg-primary/90 text-primary-foreground rounded-2xl flex items-center justify-center transition-all disabled:opacity-50 disabled:scale-95 shadow-sm hover:shadow-md"
              >
                {isLoading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                ) : (
                  <Send className="h-5 w-5 ml-0.5" />
                )}
              </button>
            </form>
            <p className="text-[10px] text-center text-muted-foreground mt-2">
              La IA puede cometer errores. Verifica la información importante.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
