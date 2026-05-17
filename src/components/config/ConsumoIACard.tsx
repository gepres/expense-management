/**
 * Medidor "Consumo de IA este mes" (Fase 2) — Configuración → Perfil.
 * Lee `GET /api/ai-usage/me`. Verde < warnPct, ámbar al acercarse,
 * rojo al bloquear. Admin = ilimitado. Si el endpoint falla, se oculta.
 */

import { useState, useEffect } from 'react';
import {
  Cpu,
  Loader2,
  Infinity as InfinityIcon,
  Image as ImageIcon,
} from 'lucide-react';
import { AiUsageService } from '@services/aiUsage';
import { formatearFechaCorta } from '@utils/formatters';
import type { QuotaSnapshot } from '@app-types';

export default function ConsumoIACard() {
  const [data, setData] = useState<QuotaSnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let alive = true;
    AiUsageService.getMyUsage()
      .then((d) => alive && setData(d))
      .catch(() => alive && setFailed(true))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, []);

  // Falla silenciosa: no es crítico para el perfil.
  if (failed) return null;

  if (loading) {
    return (
      <div className="my-4 p-4 rounded-xl border border-border bg-muted/30 flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        Cargando consumo de IA…
      </div>
    );
  }

  if (!data) return null;

  const ilimitado = data.limit === null;
  const barColor = data.blocked
    ? 'bg-red-500'
    : data.warn
      ? 'bg-amber-500'
      : 'bg-emerald-500';
  const reset = formatearFechaCorta(data.resetAt);

  return (
    <div className="my-4 p-4 rounded-xl border border-border bg-card">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <Cpu className="h-4 w-4 text-indigo-500" />
          Consumo de IA este mes
        </h3>
        <span className="text-[11px] text-muted-foreground">
          se reinicia el {reset}
        </span>
      </div>

      {ilimitado ? (
        <p className="text-sm text-foreground inline-flex items-center gap-1.5">
          <InfinityIcon className="h-4 w-4 text-emerald-500" />
          Ilimitado{' '}
          <span className="text-muted-foreground">
            ({data.used.toLocaleString('es-PE')} tokens usados)
          </span>
        </p>
      ) : (
        <>
          <div className="flex items-end justify-between mb-1">
            <p className="text-sm font-bold text-foreground">
              {data.used.toLocaleString('es-PE')}
              <span className="text-xs font-normal text-muted-foreground">
                {' '}
                / {(data.limit ?? 0).toLocaleString('es-PE')} tokens
              </span>
            </p>
            <span
              className={`text-xs font-semibold ${
                data.blocked
                  ? 'text-red-500'
                  : data.warn
                    ? 'text-amber-600 dark:text-amber-400'
                    : 'text-muted-foreground'
              }`}
            >
              {data.pct}%
            </span>
          </div>
          <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
            <div
              className={`h-full rounded-full ${barColor} transition-all`}
              style={{ width: `${Math.min(data.pct, 100)}%` }}
            />
          </div>

          {data.blocked ? (
            <p className="mt-2 text-xs text-red-600 dark:text-red-400">
              Alcanzaste tu límite mensual. Las funciones de IA están
              pausadas hasta el {reset}.
            </p>
          ) : data.warn ? (
            <p className="mt-2 text-xs text-amber-600 dark:text-amber-400">
              Estás cerca del límite ({data.pct}%). Te quedan{' '}
              {(data.remaining ?? 0).toLocaleString('es-PE')} tokens.
            </p>
          ) : (
            <p className="mt-2 text-xs text-muted-foreground">
              Te quedan {(data.remaining ?? 0).toLocaleString('es-PE')}{' '}
              tokens este mes.
            </p>
          )}

          {data.imagesLimit !== null && data.imagesLimit > 0 && (
            <p
              className={`mt-2 text-xs inline-flex items-center gap-1.5 ${
                data.imagesBlocked
                  ? 'text-red-500'
                  : 'text-muted-foreground'
              }`}
            >
              <ImageIcon className="h-3.5 w-3.5" />
              Imágenes IA: {data.imagesUsed}/{data.imagesLimit}
            </p>
          )}
        </>
      )}
    </div>
  );
}
