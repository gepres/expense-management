/**
 * Subida opcional de foto adjunta (boleta/comprobante) para gastos y aportes
 * de grupos compartidos. Funcionalidad **exclusiva PRO**: a usuarios no-PRO
 * se les muestra un teaser con CTA al upgrade.
 */

import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Camera, ImagePlus, Loader2, Trash2, Crown, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '@context/AuthContext';
import ProBadge from '@components/common/ProBadge';
import {
  uploadReceipt,
  deleteReceipt,
  validateReceiptFile,
  type ReceiptKind,
} from '@services/shared-receipts';

interface Props {
  groupId: string;
  kind: ReceiptKind;
  value: { url?: string; path?: string };
  onChange: (next: { url?: string; path?: string }) => void;
  /** Si true, no borra el blob anterior al reemplazarlo (caso edición sin guardar todavía). */
  keepPreviousOnReplace?: boolean;
  /** Callback opcional para disparar autocompletado IA. Si no se provee, el botón no se muestra. */
  onExtractRequest?: () => Promise<void> | void;
  /** True mientras la extracción IA está en curso (controlado por el padre). */
  extracting?: boolean;
  /** Notifica al padre cuándo está subiendo, para que pueda bloquear "Guardar". */
  onUploadingChange?: (uploading: boolean) => void;
}

export default function ReceiptUploader({
  groupId,
  kind,
  value,
  onChange,
  keepPreviousOnReplace = false,
  onExtractRequest,
  extracting = false,
  onUploadingChange,
}: Props) {
  const { isPro } = useAuth();
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploadingState] = useState(false);
  const setUploading = (next: boolean) => {
    setUploadingState(next);
    onUploadingChange?.(next);
  };

  // --------- Gate PRO ---------
  if (!isPro) {
    return (
      <div className="bg-card border border-amber-200 dark:border-amber-900/40 rounded-xl overflow-hidden">
        <div className="p-3 flex items-start gap-3 bg-gradient-to-r from-amber-50 to-amber-100/50 dark:from-amber-950/20 dark:to-amber-900/10">
          <div className="p-1.5 bg-amber-500/15 rounded-lg text-amber-600 dark:text-amber-400 flex-shrink-0">
            <Crown className="h-4 w-4" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[11px] font-semibold uppercase tracking-wide text-amber-700 dark:text-amber-300">
                Adjuntar foto del comprobante
              </span>
              <ProBadge size="sm" />
            </div>
            <p className="text-[11px] text-muted-foreground mt-1 leading-snug">
              Sube la boleta o factura junto al movimiento. Disponible para
              cuentas PRO.
            </p>
            <Link
              to="/perfil"
              className="inline-flex items-center gap-1 mt-2 text-[11px] font-semibold text-amber-700 dark:text-amber-400 hover:underline"
            >
              Activar PRO →
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const handlePick = () => fileRef.current?.click();

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    const check = validateReceiptFile(file);
    if (!check.valid) {
      toast.error(check.error || 'Imagen no válida');
      return;
    }

    setUploading(true);
    try {
      const previousPath = value.path;
      const result = await uploadReceipt(groupId, kind, file);
      onChange({ url: result.url, path: result.path });
      if (previousPath && !keepPreviousOnReplace) {
        deleteReceipt(previousPath).catch(() => undefined);
      }
      toast.success('Foto adjuntada');
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Error al subir';
      toast.error(msg);
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = async () => {
    const path = value.path;
    onChange({ url: undefined, path: undefined });
    if (path) {
      deleteReceipt(path).catch(() => undefined);
    }
  };

  // --------- Estado: con foto ---------
  if (value.url) {
    return (
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="p-3 flex items-center gap-3">
          <img
            src={value.url}
            alt="Comprobante"
            className="w-16 h-16 rounded-lg object-cover border border-border flex-shrink-0"
          />
          <div className="flex-1 min-w-0">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wide">
              Comprobante adjunto
            </p>
            <a
              href={value.url}
              target="_blank"
              rel="noreferrer"
              className="text-xs font-medium text-primary hover:underline"
            >
              Ver foto completa
            </a>
          </div>
          <div className="flex flex-col gap-1.5 flex-shrink-0">
            <button
              type="button"
              onClick={handlePick}
              disabled={uploading || extracting}
              className="px-2.5 py-1 text-[11px] font-medium rounded-lg border border-border hover:bg-muted transition-colors disabled:opacity-50"
            >
              {uploading ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                'Reemplazar'
              )}
            </button>
            <button
              type="button"
              onClick={handleRemove}
              disabled={uploading || extracting}
              className="px-2.5 py-1 text-[11px] font-medium rounded-lg border border-destructive/30 text-destructive hover:bg-destructive/10 transition-colors disabled:opacity-50 flex items-center justify-center gap-1"
            >
              <Trash2 className="h-3 w-3" />
              Quitar
            </button>
          </div>
        </div>
        {onExtractRequest && (
          <button
            type="button"
            onClick={() => onExtractRequest()}
            disabled={uploading || extracting}
            className="w-full px-3 py-2.5 flex items-center justify-center gap-2 text-xs font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 transition-colors disabled:opacity-60 disabled:cursor-not-allowed border-t border-border"
          >
            {extracting ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Analizando con IA…
              </>
            ) : (
              <>
                <Sparkles className="h-3.5 w-3.5" />
                Autocompletar con IA
                <ProBadge size="sm" showText={false} className="bg-white/20 from-white/0 to-white/0" />
              </>
            )}
          </button>
        )}
        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          capture="environment"
          className="hidden"
          onChange={handleFile}
        />
      </div>
    );
  }

  // --------- Estado: sin foto ---------
  return (
    <div className="bg-card border border-dashed border-border rounded-xl overflow-hidden">
      <button
        type="button"
        onClick={handlePick}
        disabled={uploading}
        className="w-full p-3 flex items-center gap-3 hover:bg-muted/50 transition-colors disabled:opacity-50"
      >
        <div className="p-1.5 bg-primary/10 rounded-lg text-primary flex-shrink-0">
          {uploading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Camera className="h-4 w-4" />
          )}
        </div>
        <div className="flex-1 text-left min-w-0">
          <p className="text-xs font-medium">
            {uploading ? 'Subiendo foto…' : 'Adjuntar foto del comprobante'}
          </p>
          <p className="text-[10px] text-muted-foreground">
            Opcional · JPG/PNG/WEBP · Máx 5 MB
          </p>
        </div>
        <ImagePlus className="h-4 w-4 text-muted-foreground flex-shrink-0" />
      </button>
      <input
        ref={fileRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        capture="environment"
        className="hidden"
        onChange={handleFile}
      />
    </div>
  );
}
