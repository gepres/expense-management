/**
 * Modal admin para resetear o ampliar la cuota IA de un usuario en el
 * mes en curso. No toca el rollup de tracking (costo/analytics intactos).
 */

import { useState } from 'react';
import { AiUsageAdminService } from '@services/aiUsageAdmin';
import type { QuotaSnapshot } from '@app-types';
import { X } from 'lucide-react';
import toast from 'react-hot-toast';
import Button from '../common/Button';
import { SegmentedControl } from '@components/common/SegmentedControl';

interface Props {
  userId: string;
  nombre: string;
  /** Tokens consumidos este mes (para contexto). */
  usedTokens: number;
  onClose: () => void;
  onApplied: (snap: QuotaSnapshot) => void;
}

export default function QuotaAdjustModal({
  userId,
  nombre,
  usedTokens,
  onClose,
  onApplied,
}: Props) {
  const [mode, setMode] = useState<'reset' | 'bonus'>('reset');
  const [tokens, setTokens] = useState('500000');
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);

  const aplicar = async () => {
    const n = Math.floor(Number(tokens) || 0);
    if (mode === 'bonus' && n < 1) {
      toast.error('Indica cuántos tokens extra (> 0)');
      return;
    }
    try {
      setSaving(true);
      const snap = await AiUsageAdminService.adjustUserQuota({
        userId,
        mode,
        tokens: mode === 'bonus' ? n : undefined,
        note: note.trim() || undefined,
      });
      toast.success(
        mode === 'reset'
          ? 'Cuota reseteada (consumo perdonado este mes)'
          : `+${n.toLocaleString('es-PE')} tokens otorgados`,
      );
      onApplied(snap);
      onClose();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'No se pudo ajustar');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 backdrop-blur-sm p-4">
      <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-sm">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h3 className="font-bold text-foreground">Ajustar cuota IA</h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-accent text-muted-foreground"
            aria-label="Cerrar"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          <p className="text-sm text-muted-foreground">
            Usuario: <span className="text-foreground font-medium">{nombre}</span>
            <br />
            Consumo del mes:{' '}
            <span className="text-foreground">
              {usedTokens.toLocaleString('es-PE')} tok
            </span>
          </p>

          <SegmentedControl
            options={[
              { value: 'reset', label: 'Resetear' },
              { value: 'bonus', label: 'Ampliar' },
            ]}
            value={mode}
            onChange={(v) => setMode(v as 'reset' | 'bonus')}
          />

          {mode === 'reset' ? (
            <p className="text-xs text-muted-foreground">
              Perdona el consumo del mes: el <em>restante</em> vuelve al
              límite de su rol. No altera el costo/analytics.
            </p>
          ) : (
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">
                Tokens extra este mes
              </label>
              <input
                type="number"
                min={1}
                value={tokens}
                onChange={(e) => setTokens(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border bg-background text-sm"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">
              Nota (opcional)
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="motivo del ajuste"
              className="w-full px-3 py-2 rounded-lg border bg-background text-sm"
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 p-4 border-t border-border">
          <Button variant="ghost" size="sm" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            variant="primary"
            size="sm"
            loading={saving}
            onClick={aplicar}
          >
            Aplicar
          </Button>
        </div>
      </div>
    </div>
  );
}
