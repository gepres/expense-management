/**
 * Componente para compartir link de invitación
 */

import { useState } from 'react';
import { Copy, Check, Share2, MessageCircle } from 'lucide-react';
import toast from 'react-hot-toast';

interface Props {
  groupId: string;
  invitationLink?: string;
}

export default function InviteLinkButton({ groupId, invitationLink }: Props) {
  const [copied, setCopied] = useState(false);

  // Construir la URL completa
  const fullLink = invitationLink
    ? `${window.location.origin}${invitationLink}`
    : null;

  const copyToClipboard = async () => {
    if (!fullLink) return;

    try {
      await navigator.clipboard.writeText(fullLink);
      setCopied(true);
      toast.success('Link copiado al portapapeles');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Error al copiar');
    }
  };

  const shareNative = async () => {
    if (!fullLink) return;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Únete a mi grupo de gastos',
          text: 'Te invito a unirte a nuestro grupo de gastos compartidos',
          url: fullLink,
        });
      } catch (error) {
        // User cancelled or error
        if ((error as Error).name !== 'AbortError') {
          copyToClipboard();
        }
      }
    } else {
      copyToClipboard();
    }
  };

  const shareToWhatsApp = () => {
    if (!fullLink) return;

    const message = encodeURIComponent(
      `¡Únete a nuestro grupo de gastos compartidos!\n\n${fullLink}`
    );
    window.open(`https://wa.me/?text=${message}`, '_blank');
  };

  if (!fullLink) {
    return (
      <div className="text-center py-4 text-muted-foreground text-sm">
        No hay link de invitación disponible
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Link Display */}
      <div className="flex items-center gap-2 p-3 bg-muted rounded-xl">
        <input
          type="text"
          value={fullLink}
          readOnly
          className="flex-1 bg-transparent text-sm truncate outline-none"
        />
        <button
          onClick={copyToClipboard}
          className="p-2 hover:bg-background rounded-lg transition-colors flex-shrink-0"
        >
          {copied ? (
            <Check className="h-4 w-4 text-green-500" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
        </button>
      </div>

      {/* Share Buttons */}
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={shareNative}
          className="flex items-center justify-center gap-2 px-4 py-3 bg-secondary text-secondary-foreground rounded-xl font-medium transition-all active:scale-[0.98]"
        >
          <Share2 className="h-4 w-4" />
          Compartir
        </button>
        <button
          onClick={shareToWhatsApp}
          className="flex items-center justify-center gap-2 px-4 py-3 bg-green-500 text-white rounded-xl font-medium transition-all active:scale-[0.98]"
        >
          <MessageCircle className="h-4 w-4" />
          WhatsApp
        </button>
      </div>

      {/* Info */}
      <p className="text-xs text-muted-foreground text-center">
        Comparte este link para invitar a otros al grupo
      </p>
    </div>
  );
}
