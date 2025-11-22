import { useState } from 'react';
import { useAuth } from '@context/AuthContext';
import { authService } from '@services/firebase';
import { MessageCircle, Link2, Unlink, Info, Check, X, Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import toast from 'react-hot-toast';

export default function WhatsAppConfig() {
  const { usuario, actualizarUsuario } = useAuth();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const [showUnlinkConfirm, setShowUnlinkConfirm] = useState(false);

  const isLinked = !!usuario?.whatsappPhone;

  const handleLink = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!phoneNumber.trim()) {
      toast.error('Ingresa tu número de WhatsApp');
      return;
    }

    setLoading(true);
    try {
      await authService.vincularWhatsApp(phoneNumber);
      toast.success('¡WhatsApp vinculado exitosamente!');
      setPhoneNumber('');
      // Actualizar el contexto en lugar de recargar la página
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
      await authService.desvincularWhatsApp();
      toast.success('WhatsApp desvinculado');
      setShowUnlinkConfirm(false);
      // Actualizar el contexto en lugar de recargar la página
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
            <h3 className="font-semibold text-foreground mb-1">
              {isLinked ? '✅ WhatsApp Vinculado' : '⚠️ WhatsApp No Vinculado'}
            </h3>
            {isLinked ? (
              <>
                <p className="text-sm text-muted-foreground mb-2">
                  Número: <span className="font-mono">{usuario?.whatsappPhone}</span>
                </p>
                <p className="text-xs text-muted-foreground">
                  Vinculado el: {usuario?.whatsappLinkedAt ? new Date(usuario.whatsappLinkedAt).toLocaleDateString() : 'N/A'}
                </p>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">
                Vincula tu número para empezar a usar el bot de WhatsApp.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Formulario de Vinculación */}
      {!isLinked && (
        <div className="p-6 rounded-xl bg-card border border-border mb-6">
          <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <Link2 className="h-5 w-5" />
            Vincular WhatsApp
          </h3>
          <form onSubmit={handleLink} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Número de WhatsApp
              </label>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="+51999999999"
                className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent transition-all font-mono"
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
      {isLinked && !showUnlinkConfirm && (
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

      {/* Confirmación de Desvinculación */}
      {showUnlinkConfirm && (
        <div className="p-6 rounded-xl bg-destructive/5 border-2 border-destructive/20 mb-6">
          <h3 className="font-semibold text-destructive mb-2">
            ¿Estás seguro?
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            Al desvincular tu número, ya no podrás usar el bot de WhatsApp hasta que lo vincules nuevamente.
          </p>
          <div className="flex gap-3">
            <button
              onClick={handleUnlink}
              disabled={loading}
              className="flex-1 bg-destructive hover:bg-destructive/90 text-destructive-foreground py-2 rounded-lg font-medium flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Unlink className="h-4 w-4" />
                  Sí, desvincular
                </>
              )}
            </button>
            <button
              onClick={() => setShowUnlinkConfirm(false)}
              disabled={loading}
              className="flex-1 bg-muted hover:bg-muted/80 text-foreground py-2 rounded-lg font-medium transition-all"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

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
