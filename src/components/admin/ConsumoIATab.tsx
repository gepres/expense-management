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
  QuotaConfig,
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
  Download,
  FileText,
  FileJson,
  Settings,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import { SegmentedControl } from '@components/common/SegmentedControl';
import { formatearMoneda } from '@utils/formatters';
import {
  buildConsumoIAMarkdown,
  buildConsumoIAJson,
  downloadConsumoIA,
  type ExportConsumoIAInput,
} from '@utils/exportConsumoIA';
import {
  MODELOS_ACTUALES,
  MODEL_CHANGELOG,
  cambiosEnVentana,
} from '@utils/modelConfig';
import ConsumoIATrendChart, { type TrendPoint } from './ConsumoIATrendChart';
import QuotaConfigEditor from './QuotaConfigEditor';
import QuotaAdjustModal from './QuotaAdjustModal';
import VendorCostPanel from './VendorCostPanel';

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
  const [ajustar, setAjustar] = useState<{
    userId: string;
    nombre: string;
    used: number;
  } | null>(null);
  const [quotaCfg, setQuotaCfg] = useState<QuotaConfig | null>(null);
  const [exportOpen, setExportOpen] = useState(false);
  const [trend, setTrend] = useState<TrendPoint[]>([]);
  const [trendLoading, setTrendLoading] = useState(true);

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
      // 3) Límites de cuota (para % y alertas por usuario). Best-effort:
      //    si falla, simplemente no se muestran los indicadores.
      try {
        setQuotaCfg((await AiUsageAdminService.getQuotaConfig()).config);
      } catch {
        /* sin config → sin indicadores de cuota */
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

  // Ventana de 6 meses terminando en el mes seleccionado (antiguo → reciente).
  const ventana = useMemo(
    () => Array.from({ length: 6 }, (_, i) => shiftMonthKey(mes, -(5 - i))),
    [mes],
  );

  // Tendencia: total (app + usuarios) por mes de la ventana. App = 1 doc/mes;
  // usuarios = suma del top 100/mes. Best-effort: si falta el índice, degrada
  // a solo-app sin tumbar la gráfica.
  useEffect(() => {
    let cancel = false;
    setTrendLoading(true);
    void (async () => {
      try {
        const pts = await Promise.all(
          ventana.map(async (m) => {
            const [appM, usersM] = await Promise.all([
              AiUsageAdminService.getAppMonthly(m).catch(() => null),
              AiUsageAdminService.getTopUsers(m, 100, 'totalTokens').catch(
                () => [] as AiUsageUserRow[],
              ),
            ]);
            const uTok = usersM.reduce((s, r) => s + (r.totalTokens || 0), 0);
            const uCost = usersM.reduce(
              (s, r) => s + (r.estimatedCostUsd || 0),
              0,
            );
            return {
              mes: m,
              tokens: (appM?.totalTokens || 0) + uTok,
              costUsd: (appM?.estimatedCostUsd || 0) + uCost,
            };
          }),
        );
        if (!cancel) setTrend(pts);
      } finally {
        if (!cancel) setTrendLoading(false);
      }
    })();
    return () => {
      cancel = true;
    };
  }, [ventana]);

  // Métrica de la gráfica: reusa el toggle "Por tokens / Por costo".
  const metric: 'tokens' | 'cost' =
    sortBy === 'estimatedCostUsd' ? 'cost' : 'tokens';
  const cambiosVentana = useMemo(() => cambiosEnVentana(ventana), [ventana]);

  const hoyMes = currentMonthKey();
  const esMesActual = mes === hoyMes;
  const warnPct = quotaCfg?.warnPct ?? 80;

  // % de cuota usada por usuario, según su rol y los límites de config.
  // Aproximación liviana: NO refleja bonus/reset por-usuario (ADM-3) ni
  // tiene sentido en meses pasados (la cuota es mensual).
  const cuotaInfo = (
    uid: string,
    used: number,
  ):
    | { kind: 'unlimited' }
    | { kind: 'pct'; pct: number; blocked: boolean; warn: boolean }
    | null => {
    if (!esMesActual || !quotaCfg) return null;
    const role = names[uid]?.role;
    if (!role) return null;
    if (role === 'admin') return { kind: 'unlimited' };
    const limit =
      role === 'pro' ? quotaCfg.proTokens : quotaCfg.standardTokens;
    if (!limit || limit <= 0) return null;
    const pct = Math.min(100, Math.round((used / limit) * 100));
    return {
      kind: 'pct',
      pct,
      blocked: used >= limit,
      warn: pct >= warnPct && pct < 100,
    };
  };

  // Exporta el consumo del mes a un archivo descargable: Markdown (informe +
  // "brief" listo para que una IA proponga optimizaciones) o JSON (volcado).
  const handleExport = (formato: 'md' | 'json'): void => {
    setExportOpen(false);
    if (!app && topUsers.length === 0) {
      toast('No hay datos de consumo para exportar este mes', { icon: 'ℹ️' });
      return;
    }
    try {
      const input: ExportConsumoIAInput = {
        mes,
        app,
        usuarios: usuariosAgg,
        topUsers,
        names,
        generadoEn: new Date().toISOString(),
      };
      const archivo =
        formato === 'md'
          ? {
              name: `consumo-ia-${mes}.md`,
              content: buildConsumoIAMarkdown(input),
              mime: 'text/markdown;charset=utf-8;',
            }
          : {
              name: `consumo-ia-${mes}.json`,
              content: buildConsumoIAJson(input),
              mime: 'application/json;charset=utf-8;',
            };
      downloadConsumoIA(archivo.name, archivo.content, archivo.mime);
      toast.success(`Consumo exportado (${formato.toUpperCase()})`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'No se pudo exportar');
    }
  };

  return (
    <div className="space-y-5">
      <QuotaConfigEditor />

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
        <div className="flex items-center gap-2">
          <SegmentedControl
            size="sm"
            value={sortBy}
            onChange={(v) => setSortBy(v as AiUsageSortBy)}
            options={[
              { value: 'totalTokens', label: 'Por tokens' },
              { value: 'estimatedCostUsd', label: 'Por costo' },
            ]}
          />
          <div className="relative">
            <button
              onClick={() => setExportOpen((v) => !v)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-sm text-foreground hover:bg-accent"
              aria-haspopup="menu"
              aria-expanded={exportOpen}
              title="Exportar consumo IA para análisis"
            >
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline">Exportar</span>
            </button>
            {exportOpen && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setExportOpen(false)}
                  aria-hidden="true"
                />
                <div className="absolute right-0 mt-2 w-60 bg-card border border-border rounded-lg shadow-lg z-20 overflow-hidden py-1">
                  <button
                    onClick={() => handleExport('md')}
                    className="w-full flex items-start gap-2 px-3 py-2 text-sm text-foreground hover:bg-accent text-left"
                  >
                    <FileText className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>
                      Informe Markdown
                      <span className="block text-[11px] text-muted-foreground">
                        Listo para analizar con IA
                      </span>
                    </span>
                  </button>
                  <button
                    onClick={() => handleExport('json')}
                    className="w-full flex items-start gap-2 px-3 py-2 text-sm text-foreground hover:bg-accent text-left"
                  >
                    <FileJson className="h-4 w-4 text-indigo-500 mt-0.5 flex-shrink-0" />
                    <span>
                      Datos JSON
                      <span className="block text-[11px] text-muted-foreground">
                        Volcado estructurado completo
                      </span>
                    </span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <VendorCostPanel mes={mes} />

      <ConsumoIATrendChart
        data={trend}
        metric={metric}
        cambios={cambiosVentana}
        loading={trendLoading}
      />

      {/* Modelos por feature + bitácora de cambios (cuándo se cambió y a qué afecta) */}
      <div className="bg-card border border-border rounded-xl p-5">
        <h3 className="text-sm font-bold text-foreground flex items-center gap-2 mb-4">
          <Settings className="h-4 w-4 text-indigo-500" />
          Modelos por feature y cambios recientes
        </h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <p className="text-xs font-semibold text-muted-foreground mb-2">
              Configuración actual
            </p>
            <div className="space-y-1.5">
              {MODELOS_ACTUALES.map((g) => (
                <div
                  key={g.grupo}
                  className="flex justify-between gap-3 text-xs"
                  title={`${g.env} · ${g.features.join(', ')}`}
                >
                  <span className="text-foreground">{g.grupo}</span>
                  <span className="text-muted-foreground text-right">
                    {g.modelo}
                  </span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold text-muted-foreground mb-2">
              Cambios de modelo
            </p>
            <div className="space-y-2.5">
              {MODEL_CHANGELOG.map((c) => (
                <div key={`${c.fecha}-${c.titulo}`} className="text-xs">
                  <p className="text-foreground font-medium">
                    {c.fecha} · {c.titulo}
                  </p>
                  {c.detalle && (
                    <p className="text-muted-foreground mt-0.5">{c.detalle}</p>
                  )}
                  <p className="text-muted-foreground mt-0.5">
                    Afecta: {c.afecta.join(', ')}{' '}
                    <span className="opacity-70">
                      (todos los usuarios de esas funciones)
                    </span>
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
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
                  const ci = cuotaInfo(r.userId, r.totalTokens);
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
                          <p className="text-sm text-foreground truncate flex items-center gap-2">
                            <span className="truncate">
                              {u?.nombre ?? u?.email ?? r.userId}
                            </span>
                            {ci?.kind === 'pct' && ci.blocked && (
                              <span className="flex-shrink-0 text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300">
                                100% · bloqueado
                              </span>
                            )}
                            {ci?.kind === 'pct' && !ci.blocked && ci.warn && (
                              <span className="flex-shrink-0 text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300">
                                ≥{warnPct}%
                              </span>
                            )}
                            {ci?.kind === 'unlimited' && (
                              <span className="flex-shrink-0 text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground">
                                ∞ admin
                              </span>
                            )}
                          </p>
                          <p className="text-[11px] text-muted-foreground truncate">
                            {u?.email ?? `uid: ${r.userId.slice(0, 12)}…`}
                          </p>
                          {ci?.kind === 'pct' && (
                            <div className="mt-1 flex items-center gap-2">
                              <div className="flex-1 max-w-[140px] bg-muted rounded-full h-1.5">
                                <div
                                  className={`h-full rounded-full ${
                                    ci.blocked
                                      ? 'bg-red-500'
                                      : ci.warn
                                        ? 'bg-amber-500'
                                        : 'bg-emerald-500'
                                  }`}
                                  style={{ width: `${ci.pct}%` }}
                                />
                              </div>
                              <span className="text-[10px] text-muted-foreground flex-shrink-0">
                                {ci.pct}% cuota
                              </span>
                            </div>
                          )}
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
                          <button
                            onClick={() =>
                              setAjustar({
                                userId: r.userId,
                                nombre:
                                  u?.nombre ?? u?.email ?? r.userId,
                                used: r.totalTokens,
                              })
                            }
                            className="mt-3 text-xs font-medium text-primary hover:underline"
                          >
                            Ajustar cuota de este usuario →
                          </button>
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

      {ajustar && (
        <QuotaAdjustModal
          userId={ajustar.userId}
          nombre={ajustar.nombre}
          usedTokens={ajustar.used}
          onClose={() => setAjustar(null)}
          onApplied={() => void load()}
        />
      )}
    </div>
  );
}
