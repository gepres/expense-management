/**
 * Lightbox simple para mostrar la foto adjunta de un gasto o aporte.
 * Click en backdrop o tecla Escape cierran.
 */

import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, ExternalLink } from 'lucide-react';

interface Props {
  url: string | null;
  onClose: () => void;
}

export default function ReceiptViewer({ url, onClose }: Props) {
  useEffect(() => {
    if (!url) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [url, onClose]);

  if (!url) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <button
        type="button"
        onClick={onClose}
        className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
        aria-label="Cerrar"
      >
        <X className="h-5 w-5" />
      </button>
      <a
        href={url}
        target="_blank"
        rel="noreferrer"
        onClick={(e) => e.stopPropagation()}
        className="absolute top-4 left-4 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-medium transition-colors"
      >
        <ExternalLink className="h-3.5 w-3.5" />
        Abrir
      </a>
      <img
        src={url}
        alt="Comprobante"
        onClick={(e) => e.stopPropagation()}
        className="max-h-full max-w-full rounded-lg shadow-2xl object-contain"
      />
    </div>,
    document.body,
  );
}
