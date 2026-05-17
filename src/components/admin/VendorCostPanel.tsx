/**
 * Costo REAL facturado por Anthropic/OpenAI en el mes (Cost APIs admin).
 * IMPORTANTE: es gasto del periodo, NO el crédito restante (ningún
 * proveedor expone el saldo por API — eso solo en su consola).
 */

import { useState, useEffect } from 'react';
import { AiUsageAdminService } from '@services/aiUsageAdmin';
import type { VendorCost, ProviderCost } from '@app-types';
import { Loader2, ExternalLink, Banknote, Info } from 'lucide-react';
import { formatearMoneda } from '@utils/formatters';

const CONSOLAS = {
  anthropic: 'https://console.anthropic.com/settings/usage',
  openai: 'https://platform.openai.com/usage',
} as const;

function ProviderRow({
  nombre,
  cost,
  consolaUrl,
}: {
  nombre: string;
  cost: ProviderCost;
  consolaUrl: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3 p-3 bg-muted/40 rounded-lg">
      <div className="min-w-0">
        <p className="text-sm font-medium text-foreground">{nombre}</p>
        {cost.enabled ? (
          cost.error ? (
            <p className="text-[11px] text-amber-600 dark:text-amber-400">
              {cost.error}
            </p>
          ) : (
            <p className="text-[11px] text-muted-foreground">
              gasto facturado del mes
            </p>
          )
        ) : (
          <p className="text-[11px] text-muted-foreground">
            Sin Admin key — configúrala para ver el gasto real
          </p>
        )}
      </div>
      <div className="text-right flex-shrink-0">
        {cost.enabled && cost.amountUsd !== undefined ? (
          <p className="text-base font-bold text-foreground">
            {formatearMoneda(cost.amountUsd, 'USD')}
          </p>
        ) : (
          <a
            href={consolaUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-primary hover:underline inline-flex items-center gap-1"
          >
            Ver en consola <ExternalLink className="h-3 w-3" />
          </a>
        )}
      </div>
    </div>
  );
}

export default function VendorCostPanel({ mes }: { mes: string }) {
  const [data, setData] = useState<VendorCost | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let activo = true;
    setLoading(true);
    setErr(null);
    AiUsageAdminService.getVendorCost(mes)
      .then((d) => activo && setData(d))
      .catch(
        (e) =>
          activo &&
          setErr(e instanceof Error ? e.message : 'Error al leer el costo'),
      )
      .finally(() => activo && setLoading(false));
    return () => {
      activo = false;
    };
  }, [mes]);

  return (
    <div className="bg-card border border-border rounded-xl p-4">
      <div className="flex items-center gap-2 mb-1">
        <Banknote className="h-4 w-4 text-emerald-500" />
        <h3 className="text-sm font-bold text-foreground">
          Gasto real facturado · {mes}
        </h3>
      </div>
      <p className="text-[11px] text-muted-foreground mb-3 flex items-start gap-1">
        <Info className="h-3 w-3 mt-0.5 flex-shrink-0" />
        Es el gasto del periodo según el proveedor, <strong>no</strong> el
        crédito restante (ese solo se ve en su consola).
      </p>

      {loading ? (
        <div className="flex justify-center py-6">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      ) : err ? (
        <p className="text-sm text-amber-700 dark:text-amber-300">{err}</p>
      ) : data ? (
        <div className="space-y-2">
          <ProviderRow
            nombre="Anthropic (Claude)"
            cost={data.anthropic}
            consolaUrl={CONSOLAS.anthropic}
          />
          <ProviderRow
            nombre="OpenAI (Whisper / imágenes)"
            cost={data.openai}
            consolaUrl={CONSOLAS.openai}
          />
        </div>
      ) : null}
    </div>
  );
}
