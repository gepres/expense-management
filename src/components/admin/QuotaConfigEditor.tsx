/**
 * Editor (admin) de los límites de cuota IA por rol. Lee/escribe vía
 * backend (`/api/ai-usage/quota-config`); el override se guarda en
 * Firestore y tiene prioridad sobre los env `AI_QUOTA_*` (propaga ≤60s).
 */

import { useState, useEffect, useCallback } from 'react';
import { AiUsageAdminService } from '@services/aiUsageAdmin';
import type { QuotaConfig } from '@app-types';
import { Loader2, SlidersHorizontal, ChevronDown, RotateCcw } from 'lucide-react';
import toast from 'react-hot-toast';
import Button from '../common/Button';

type Campo = {
  key: keyof QuotaConfig;
  label: string;
  hint?: string;
  min: number;
  max?: number;
};

const CAMPOS: Campo[] = [
  { key: 'standardTokens', label: 'Tokens/mes · standard', min: 0 },
  { key: 'proTokens', label: 'Tokens/mes · PRO', min: 0 },
  { key: 'standardImages', label: 'Imágenes IA/mes · standard', min: 0 },
  { key: 'proImages', label: 'Imágenes IA/mes · PRO', min: 0 },
  { key: 'warnPct', label: 'Aviso (%)', hint: '1–100', min: 1, max: 100 },
];

export default function QuotaConfigEditor() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [cfg, setCfg] = useState<QuotaConfig | null>(null);
  const [envDefaults, setEnvDefaults] = useState<QuotaConfig | null>(null);
  const [source, setSource] = useState<'doc' | 'env'>('env');

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const r = await AiUsageAdminService.getQuotaConfig();
      setCfg(r.config);
      setEnvDefaults(r.envDefaults);
      setSource(r.source);
    } catch (e) {
      toast.error(
        e instanceof Error ? e.message : 'Error al cargar la cuota',
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (open && cfg === null) void load();
  }, [open, cfg, load]);

  const setField = (k: keyof QuotaConfig, v: string) => {
    setCfg((prev) =>
      prev ? { ...prev, [k]: Math.max(0, Math.floor(Number(v) || 0)) } : prev,
    );
  };

  const guardar = async () => {
    if (!cfg) return;
    if (cfg.warnPct < 1 || cfg.warnPct > 100) {
      toast.error('El aviso (%) debe estar entre 1 y 100');
      return;
    }
    try {
      setSaving(true);
      await AiUsageAdminService.updateQuotaConfig(cfg);
      setSource('doc');
      toast.success('Límites guardados (propagan en ≤1 min)');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'No se pudo guardar');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-card border border-border rounded-xl">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between p-4"
      >
        <span className="flex items-center gap-2 text-sm font-semibold">
          <SlidersHorizontal className="h-4 w-4 text-primary" />
          Límites de cuota IA por rol
          <span
            className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${
              source === 'doc'
                ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300'
                : 'bg-muted text-muted-foreground'
            }`}
          >
            {source === 'doc' ? 'override activo' : 'defaults env'}
          </span>
        </span>
        <ChevronDown
          className={`h-4 w-4 text-muted-foreground transition-transform ${
            open ? 'rotate-180' : ''
          }`}
        />
      </button>

      {open && (
        <div className="px-4 pb-4">
          {loading || !cfg ? (
            <div className="flex justify-center py-6">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {CAMPOS.map((c) => (
                  <div key={c.key}>
                    <label className="block text-xs font-medium text-muted-foreground mb-1">
                      {c.label}
                      {c.hint && (
                        <span className="ml-1 opacity-60">({c.hint})</span>
                      )}
                    </label>
                    <input
                      type="number"
                      min={c.min}
                      max={c.max}
                      value={cfg[c.key]}
                      onChange={(e) => setField(c.key, e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border bg-background text-sm"
                    />
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between mt-4 gap-3">
                {envDefaults && (
                  <button
                    onClick={() => setCfg(envDefaults)}
                    className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
                    type="button"
                  >
                    <RotateCcw className="h-3 w-3" />
                    Cargar defaults de env
                  </button>
                )}
                <Button
                  variant="primary"
                  size="sm"
                  loading={saving}
                  onClick={guardar}
                  className="ml-auto"
                >
                  Guardar límites
                </Button>
              </div>
              <p className="text-[11px] text-muted-foreground mt-3">
                El override se guarda en Firestore y tiene prioridad sobre
                los env <code>AI_QUOTA_*</code>. <code>admin</code> siempre
                es ilimitado.
              </p>
            </>
          )}
        </div>
      )}
    </div>
  );
}
