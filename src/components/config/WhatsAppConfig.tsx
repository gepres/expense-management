import { useState } from 'react';
import { useAuth } from '@context/AuthContext';
import { MessageCircle, Link2, Unlink, Info, Check, X, Loader2, ChevronDown, ChevronUp, ExternalLink, CheckCircle2, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';
import Modal, { ModalFooterActions } from '@components/common/Modal';
import { auth } from '@services/firebase';

export default function WhatsAppConfig() {
  const { usuario, actualizarUsuario } = useAuth();
  const [phoneNumber, setPhoneNumber] = useState('+51');
  const [loading, setLoading] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const [showUnlinkConfirm, setShowUnlinkConfirm] = useState(false);

  const isLinked = !!usuario?.whatsappPhone;

  // Obtener número de WhatsApp de Twilio desde variables de entorno
  const twilioWhatsAppNumber = import.meta.env.VITE_TWILIO_WHATSAPP_NUMBER || '';

  console.log('twilioWhatsAppNumber', twilioWhatsAppNumber);
  // Extraer solo el número (remover 'whatsapp:' si existe)
  const whatsappNumber = twilioWhatsAppNumber.replace('whatsapp:', '');
  // Crear link de WhatsApp
  const whatsappLink = whatsappNumber ? `https://wa.me/${whatsappNumber.replace(/[^0-9]/g, '')}` : '';

  const handleLink = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!phoneNumber.trim()) {
      toast.error('Ingresa tu número de WhatsApp');
      return;
    }

    setLoading(true);
    try {
      // Obtener el token de Firebase
      const user = auth.currentUser;
      if (!user) {
        throw new Error('Usuario no autenticado');
      }
      const token = await user.getIdToken();

      // Llamar al backend
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';
      const response = await fetch(`${API_BASE_URL}/whatsapp/link`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ phoneNumber })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Error al vincular WhatsApp');
      }

      toast.success('¡WhatsApp vinculado exitosamente!');
      setPhoneNumber('');
      // Actualizar el contexto
      await actualizarUsuario();
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || 'Error al vincular WhatsApp');
    } finally {
      setLoading(false);
    }
  };

  const handleUnlink = async () => {
    setLoading(true);
    try {
      // Obtener el token de Firebase
      const user = auth.currentUser;
      if (!user) {
        throw new Error('Usuario no autenticado');
      }
      const token = await user.getIdToken();

      // Llamar al backend
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';
      const response = await fetch(`${API_BASE_URL}/whatsapp/unlink`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Error al desvincular WhatsApp');
      }

      toast.success('WhatsApp desvinculado');
      setShowUnlinkConfirm(false);
      // Actualizar el contexto
      await actualizarUsuario();
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || 'Error al desvincular WhatsApp');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto pb-10">
      <div className="mb-8">
        <h2 className="text-xl font-bold text-foreground mb-2 flex items-center gap-2">
          <MessageCircle className="h-6 w-6" />
          WhatsApp Bot
        </h2>
        <p className="text-muted-foreground">
          Registra gastos y consulta tu resumen directamente desde WhatsApp.
        </p>
      </div>

      {/* Estado de Vinculación */}
      <div className={`p-6 rounded-xl border-2 mb-6 ${
        isLinked 
          ? 'bg-success/5 border-success/20' 
          : 'bg-muted/50 border-border'
      }`}>
        <div className="flex items-start gap-4">
          <div className={`p-3 rounded-full ${
            isLinked ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'
          }`}>
            {isLinked ? <Check className="h-6 w-6" /> : <X className="h-6 w-6" />}
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-foreground mb-1 flex items-center gap-2">
              {isLinked ? (
                <>
                  <CheckCircle2 className="h-5 w-5 text-success" />
                  WhatsApp Vinculado
                </>
              ) : (
                <>
                  <AlertTriangle className="h-5 w-5 text-yellow-500" />
                  WhatsApp No Vinculado
                </>
              )}
            </h3>
            {isLinked ? (
              <>
                <p className="text-sm text-muted-foreground mb-2">
                  Número: <span className="font-mono">{usuario?.whatsappPhone}</span>
                </p>
                <p className="text-xs text-muted-foreground mb-3">
                  Vinculado el: {usuario?.whatsappLinkedAt ? new Date(usuario.whatsappLinkedAt).toLocaleDateString() : 'N/A'}
                </p>
                {whatsappLink && (
                  <a
                    href={whatsappLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-success hover:bg-success/90 text-white rounded-lg font-medium text-sm transition-all active:scale-95"
                  >
                    <MessageCircle className="h-4 w-4" />
                    Abrir WhatsApp
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                )}
              </>
            ) : (
              <p className="text-sm text-muted-foreground">
                Vincula tu número para empezar a usar el bot de WhatsApp.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Formulario de Vinculación - iOS Style */}
      {!isLinked && (
        <div className="bg-card rounded-2xl border border-border shadow-sm mb-6">
          <div className="p-4 border-b border-border/50">
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              <Link2 className="h-5 w-5" />
              Vincular WhatsApp
            </h3>
          </div>
          <form onSubmit={handleLink} className="p-4 space-y-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                Número de WhatsApp
              </label>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="+51999999999"
                className="w-full bg-transparent border-0 focus:outline-none focus:ring-0 text-base font-mono border-b border-border/50 pb-2"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Incluye el código de país (ej: +51 para Perú)
              </p>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-2.5 rounded-lg font-medium flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Vinculando...
                </>
              ) : (
                <>
                  <Link2 className="h-4 w-4" />
                  Vincular WhatsApp
                </>
              )}
            </button>
          </form>
        </div>
      )}

      {/* Botón de Desvincular */}
      {isLinked && (
        <div className="mb-6">
          <button
            onClick={() => setShowUnlinkConfirm(true)}
            className="w-full bg-destructive/10 hover:bg-destructive/20 text-destructive py-2.5 rounded-lg font-medium flex items-center justify-center gap-2 transition-all border border-destructive/20"
          >
            <Unlink className="h-4 w-4" />
            Desvincular WhatsApp
          </button>
        </div>
      )}

      {/* Modal de Confirmación de Desvinculación */}
      <Modal
        isOpen={showUnlinkConfirm}
        onClose={() => setShowUnlinkConfirm(false)}
        title="¿Desvincular WhatsApp?"
        size="sm"
        footer={
          <ModalFooterActions
            onCancel={() => setShowUnlinkConfirm(false)}
            onConfirm={handleUnlink}
            confirmText={loading ? 'Desvinculando...' : 'Sí, desvincular'}
            confirmVariant="destructive"
            disabled={loading}
          />
        }
      >
        <div className="space-y-4">
          <div className="flex items-center justify-center">
            <div className="p-4 bg-destructive/10 rounded-full">
              <AlertTriangle className="h-12 w-12 text-destructive" />
            </div>
          </div>
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              Al desvincular tu número, ya no podrás usar el bot de WhatsApp hasta que lo vincules nuevamente.
            </p>
          </div>
        </div>
      </Modal>

      {/* Instrucciones de Uso */}
      <div className="p-6 rounded-xl bg-muted/50 border border-border">
        <button
          onClick={() => setShowInstructions(!showInstructions)}
          className="w-full flex items-center justify-between text-left"
        >
          <h3 className="font-semibold text-foreground flex items-center gap-2">
            <Info className="h-5 w-5" />
            Cómo usar el bot
          </h3>
          {showInstructions ? (
            <ChevronUp className="h-5 w-5 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-5 w-5 text-muted-foreground" />
          )}
        </button>

        {showInstructions && (
          <div className="mt-4 space-y-4 text-sm">
            <div>
              <h4 className="font-medium text-foreground mb-2">📝 Registrar un gasto</h4>
              <div className="bg-background p-3 rounded-lg font-mono text-xs space-y-1">
                <div>"50 almuerzo"</div>
                <div>"25.50 taxi"</div>
                <div>"100 en supermercado"</div>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-foreground mb-2">📊 Ver resumen del día</h4>
              <div className="bg-background p-3 rounded-lg font-mono text-xs">
                "resumen"
              </div>
            </div>

            <div>
              <h4 className="font-medium text-foreground mb-2">❓ Ver ayuda</h4>
              <div className="bg-background p-3 rounded-lg font-mono text-xs">
                "ayuda"
              </div>
            </div>

            <div className="pt-2 border-t border-border">
              <p className="text-xs text-muted-foreground">
                💡 <strong>Tip:</strong> El bot detecta automáticamente la categoría según las palabras clave en tu mensaje.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
