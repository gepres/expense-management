/**
 * Tab: Consumo IA — "consumos del aplicativo" (autogenerado) vs
 * "consumos de usuarios", top usuarios y desglose por feature/proveedor.
 *
 * Lee los rollups mensuales (top-level). Requiere las Firestore rules
 * desplegadas (`firebase deploy --only firestore`).
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  AiUsageAdminService,
  currentMonthKey,
  shiftMonthKey,
} from '@services/aiUsageAdmin';
import { authService } from '@services/firebase';
import type {
  AiUsageRollup,
  AiUsageUserRow,
  AiUsageBucketStat,
  AiUsageSortBy,
  Usuario,
} from '@app-types';
import {
  ChevronLeft,
  ChevronRight,
  Loader2,
  Cpu,
  Users,
  Bot,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { SegmentedControl } from '@components/common/SegmentedControl';
import { formatearMoneda } from '@utils/formatters';

const TOP_FETCH = 100;
const TOP_SHOW = 15;

function fmtTok(n: number): string {
  return (n || 0).toLocaleString('es-PE');
}

function mergeBuckets(
  rows: Array<Record<string, AiUsageBucketStat> | undefined>,
): Record<string, AiUsageBucketStat> {
  const out: Record<string, AiUsageBucketStat> = {};
  for (const map of rows) {
    if (!map) continue;
    for (const [k, v] of Object.entries(map)) {
      const cur = out[k] ?? { tokens: 0, calls: 0, costUsd: 0 };
      out[k] = {
        tokens: cur.tokens + (v?.tokens ?? 0),
        calls: cur.calls + (v?.calls ?? 0),
        costUsd: cur.costUsd + (v?.costUsd ?? 0),
      };
    }
  }
  return out;
}

function BreakdownList({
  titulo,
  data,
}: {
  titulo: string;
  data: Record<string, AiUsageBucketStat>;
}) {
  const entries = Object.entries(data).sort(
    (a, b) => b[1].tokens - a[1].tokens,
  );
  const max = entries[0]?.[1].tokens || 1;
  if (entries.length === 0) {
    return (
      <div>
        <p className="text-xs font-semibold text-muted-foreground mb-2">
          {titulo}
        </p>
        <p className="text-sm text-muted-foreground">Sin datos</p>
      </div>
    );
  }
  return (
    <div>
      <p className="text-xs font-semibold text-muted-foreground mb-2">
        {titulo}
      </p>
      <div className="space-y-2">
        {entries.map(([k, v]) => (
          <div key={k}>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-foreground">{k}</span>
              <span className="text-muted-foreground">
                {fmtTok(v.tokens)} tok · {formatearMoneda(v.costUsd, 'USD')}
              </span>
            </div>
            <div className="w-full bg-muted rounded-full h-1.5">
              <div
                className="h-full rounded-full bg-primary"
                style={{ width: `${Math.min((v.tokens / max) * 100, 100)}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  rollup,
  accent,
}: {
  icon: LucideIcon;
  label: string;
  rollup: AiUsageRollup | null;
  accent: string;
}) {
  return (
    <div className="bg-card border border-border rounded-xl p-4">
      <div className="flex items-center gap-2 mb-2">
        <div className="p-1.5 bg-muted rounded-lg">
          <Icon className={`h-4 w-4 ${accent}`} />
        </div>
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
      </div>
      <p className="text-2xl font-bold text-foreground">
        {fmtTok(rollup?.totalTokens ?? 0)}{' '}
        <span className="text-sm font-normal text-muted-foreground">tok</span>
      </p>
      <p className="text-xs text-muted-foreground mt-1">
        {formatearMoneda(rollup?.estimatedCostUsd ?? 0, 'USD')} ·{' '}
        {(rollup?.calls ?? 0).toLocaleString('es-PE')} llamadas
      </p>
    </div>
  );
}

export default function ConsumoIATab() {
  const [mes, setMes] = useState(() => currentMonthKey());
  const [app, setApp] = useState<AiUsageRollup | null>(null);
  const [topUsers, setTopUsers] = useState<AiUsageUserRow[]>([]);
  const [names, setNames] = useState<Record<string, Usuario>>({});
  const [sortBy, setSortBy] = useState<AiUsageSortBy>('totalTokens');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [topError, setTopError] = useState<string | null>(null);
  const [expandido, setExpandido] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    setTopError(null);
    try {
      // 1) App rollup: lectura de UN doc, no necesita índice. Si esto
      //    falla es un problema real (rules sin desplegar / permisos).
      try {
        setApp(await AiUsageAdminService.getAppMonthly(mes));
      } catch (err) {
        const msg = err instanceof Error ? err.message : '';
        setError(
          /permission|insufficient/i.test(msg)
            ? 'Sin permiso para leer el consumo IA. Despliega las reglas Firestore (firebase deploy --only firestore:rules).'
            : `No se pudo cargar el consumo del aplicativo: ${msg}`,
        );
      }

      // 2) Top usuarios: requiere índice compuesto. Si está
      //    construyéndose, NO tumbamos toda la pestaña.
      try {
        const top = await AiUsageAdminService.getTopUsers(
          mes,
          TOP_FETCH,
          sortBy,
        );
        setTopUsers(top);
        const ids = top.slice(0, TOP_SHOW).map((r) => r.userId);
        setNames(ids.length ? await authService.getUsersByIds(ids) : {});
      } catch (err) {
        setTopUsers([]);
        setNames({});
        const msg = err instanceof Error ? err.message : '';
        setTopError(
          /index is currently building|requires an index/i.test(msg)
            ? 'El índice de Firestore aún se está construyendo. Vuelve en unos minutos (Firebase Console → Firestore → Indexes).'
            : `No se pudo cargar el top de usuarios: ${msg}`,
        );
      }
    } finally {
      setLoading(false);
    }
  }, [mes, sortBy]);

  useEffect(() => {
    void load();
  }, [load]);

  const usuariosAgg = useMemo<AiUsageRollup | null>(() => {
    if (topUsers.length === 0) return null;
    return {
      mes,
      totalTokens: topUsers.reduce((s, r) => s + (r.totalTokens || 0), 0),
      inputTokens: topUsers.reduce((s, r) => s + (r.inputTokens || 0), 0),
      outputTokens: topUsers.reduce((s, r) => s + (r.outputTokens || 0), 0),
      estimatedCostUsd: topUsers.reduce(
        (s, r) => s + (r.estimatedCostUsd || 0),
        0,
      ),
      calls: topUsers.reduce((s, r) => s + (r.calls || 0), 0),
      byFeature: mergeBuckets(topUsers.map((r) => r.byFeature)),
      byProvider: mergeBuckets(topUsers.map((r) => r.byProvider)),
    };
  }, [topUsers, mes]);

  const hoyMes = currentMonthKey();

  return (
    <div className="space-y-5">
      {/* Controles */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setMes((m) => shiftMonthKey(m, -1))}
            className="p-2 rounded-lg hover:bg-accent text-muted-foreground"
            aria-label="Mes anterior"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="text-sm font-bold text-foreground min-w-[80px] text-center">
            {mes}
          </span>
          <button
            onClick={() => setMes((m) => shiftMonthKey(m, 1))}
            disabled={mes >= hoyMes}
            className="p-2 rounded-lg hover:bg-accent text-muted-foreground disabled:opacity-40"
            aria-label="Mes siguiente"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
          <button
            onClick={() => void load()}
            className="p-2 rounded-lg hover:bg-accent text-muted-foreground ml-1"
            aria-label="Refrescar"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
        <SegmentedControl
          size="sm"
          value={sortBy}
          onChange={(v) => setSortBy(v as AiUsageSortBy)}
          options={[
            { value: 'totalTokens', label: 'Por tokens' },
            { value: 'estimatedCostUsd', label: 'Por costo' },
          ]}
        />
      </div>

      {error && (
        <div className="rounded-lg p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-300 dark:border-amber-700 text-amber-800 dark:text-amber-200 text-sm flex items-start gap-2">
          <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {loading && !app && topUsers.length === 0 ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className={loading ? 'opacity-60' : ''}>
          {/* App vs Usuarios */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <StatCard
              icon={Bot}
              label="Consumo del aplicativo (autogenerado)"
              rollup={app}
              accent="text-amber-500"
            />
            <StatCard
              icon={Users}
              label={`Consumo de usuarios (top ${TOP_SHOW <= topUsers.length ? TOP_FETCH : topUsers.length})`}
              rollup={usuariosAgg}
              accent="text-indigo-500"
            />
          </div>

          {/* Desglose */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-5 bg-card border border-border rounded-xl p-5">
            <BreakdownList
              titulo="Aplicativo · por feature"
              data={app?.byFeature ?? {}}
            />
            <BreakdownList
              titulo="Usuarios · por feature"
              data={usuariosAgg?.byFeature ?? {}}
            />
            <BreakdownList
              titulo="Aplicativo · por proveedor"
              data={app?.byProvider ?? {}}
            />
            <BreakdownList
              titulo="Usuarios · por proveedor"
              data={usuariosAgg?.byProvider ?? {}}
            />
          </div>

          {/* Top usuarios */}
          <div className="bg-card border border-border rounded-xl mt-5 overflow-hidden">
            <div className="p-4 border-b border-border">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                <Cpu className="h-4 w-4 text-indigo-500" />
                Top usuarios del mes
              </h3>
            </div>
            {topError ? (
              <p className="p-6 text-sm text-amber-700 dark:text-amber-300 text-center flex items-center justify-center gap-2">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                {topError}
              </p>
            ) : topUsers.length === 0 ? (
              <p className="p-6 text-sm text-muted-foreground text-center">
                Sin consumo de usuarios este mes.
              </p>
            ) : (
              <div className="divide-y divide-border">
                {topUsers.slice(0, TOP_SHOW).map((r, i) => {
                  const u = names[r.userId];
                  const abierto = expandido === r.userId;
                  return (
                    <div key={r.docId}>
                      <button
                        onClick={() =>
                          setExpandido(abierto ? null : r.userId)
                        }
                        className="w-full flex items-center gap-3 p-3 hover:bg-accent/50 transition-colors text-left"
                      >
                        <span className="h-6 w-6 rounded-full bg-muted flex items-center justify-center text-[10px] font-bold text-muted-foreground flex-shrink-0">
                          {i + 1}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-foreground truncate">
                            {u?.nombre ?? u?.email ?? r.userId}
                          </p>
                          <p className="text-[11px] text-muted-foreground truncate">
                            {u?.email ?? `uid: ${r.userId.slice(0, 12)}…`}
                          </p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-sm font-semibold text-foreground">
                            {fmtTok(r.totalTokens)} tok
                          </p>
                          <p className="text-[11px] text-muted-foreground">
                            {formatearMoneda(r.estimatedCostUsd, 'USD')} ·{' '}
                            {r.calls} llam.
                          </p>
                        </div>
                      </button>
                      {abierto && (
                        <div className="px-4 pb-4 pt-1 bg-muted/20">
                          <BreakdownList
                            titulo="Por feature"
                            data={r.byFeature ?? {}}
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
