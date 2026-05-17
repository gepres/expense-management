/**
 * Panel de IA del módulo de Métricas (Bloque 4).
 *
 * - Narrativa + recomendaciones + insights (`/analytics/ai-insights`, cache 24h).
 * - Anomalías: combina outliers 2σ del summary (factuales) con la
 *   interpretación de la IA (severidad).
 * - Mini-chat contextual "pregunta sobre tus métricas" (`/analytics/ai-ask`).
 * - Selector de foco para reorientar el análisis a un flujo concreto.
 *
 * Solo PRO dispara llamadas; `enabled` evita gastar IA si no hay datos.
 */

import { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  RefreshCw,
  Lightbulb,
  AlertTriangle,
  Send,
  MessageSquareText,
  Loader2,
  TrendingDown,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useMetricasIA } from '@hooks/useMetricasIA';
import { useConfig } from '@context/ConfigContext';
import { formatearMoneda } from '@utils/formatters';
import type { AnalyticsSummary, MetricasFiltros, Moneda } from '@app-types';

interface IAPanelProps {
  summary: AnalyticsSummary;
  filtros: MetricasFiltros;
}

const FOCOS: Array<{ value: string; label: string }> = [
  { value: '', label: 'General' },
  { value: 'oportunidades de ahorro concretas', label: 'Ahorro' },
  { value: 'categorías con mayor alza vs mes anterior', label: 'Alzas' },
  { value: 'gastos hormiga y fugas pequeñas', label: 'Gastos hormiga' },
  { value: 'cumplimiento de presupuesto', label: 'Presupuesto' },
];

const PREGUNTAS_SUGERIDAS = [
  '¿En qué puedo recortar sin afectar lo esencial?',
  '¿Por qué cambió mi gasto vs el mes pasado?',
  '¿Mis gastos hormiga son significativos?',
  '¿Voy bien para cerrar el mes dentro de presupuesto?',
];

const SEVERIDAD_STYLE: Record<string, string> = {
  alta: 'border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300',
  media:
    'border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300',
  baja: 'border-blue-300 dark:border-blue-700 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300',
};

interface ChatMsg {
  role: 'user' | 'assistant';
  content: string;
}

function formatRelative(ts: number): string {
  const s = Math.floor((Date.now() - ts) / 1000);
  if (s < 60) return 'recién';
  const m = Math.floor(s / 60);
  if (m < 60) return `hace ${m} min`;
  const h = Math.floor(m / 60);
  if (h < 24) return `hace ${h} h`;
  return `hace ${Math.floor(h / 24)} d`;
}

export default function IAPanel({ summary, filtros }: IAPanelProps) {
  const { getCategoryLabel } = useConfig();
  const moneda = (summary.moneda as Moneda) || 'PEN';
  const fmt = (n: number) => formatearMoneda(n, moneda);

  const [focus, setFocus] = useState('');
  const enabled = summary.totales.numTransacciones > 0;

  const {
    insights,
    loading,
    refreshing,
    error,
    lastUpdated,
    refresh,
    ask,
    asking,
  } = useMetricasIA(filtros, focus || undefined, enabled);

  // Mini-chat contextual (transitorio).
  const [mensajes, setMensajes] = useState<ChatMsg[]>([]);
  const [input, setInput] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [mensajes]);

  const enviarPregunta = async (texto: string) => {
    const q = texto.trim();
    if (!q || asking) return;
    setInput('');
    setMensajes((m) => [...m, { role: 'user', content: q }]);
    try {
      const respuesta = await ask(q);
      setMensajes((m) => [...m, { role: 'assistant', content: respuesta }]);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'No se pudo obtener respuesta',
      );
      setMensajes((m) => m.slice(0, -1));
    }
  };

  return (
    <div className="rounded-xl p-[1px] bg-gradient-to-r from-indigo-600 to-purple-600 shadow-lg">
      <div className="bg-card rounded-[11px] p-6 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <span className="p-1.5 rounded-full bg-indigo-100 dark:bg-indigo-900/50">
              <Sparkles className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
            </span>
            Análisis con IA
            {lastUpdated && (
              <span className="text-[11px] font-normal text-muted-foreground">
                · {formatRelative(lastUpdated)}
              </span>
            )}
          </h2>
          <div className="flex items-center gap-2">
            <div className="flex flex-wrap gap-1">
              {FOCOS.map((f) => (
                <button
                  key={f.value}
                  onClick={() => setFocus(f.value)}
                  className={`text-[11px] px-2 py-1 rounded-full border transition-colors ${
                    focus === f.value
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'border-border text-muted-foreground hover:bg-accent'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
            <button
              onClick={refresh}
              disabled={refreshing || loading || !enabled}
              className="p-1.5 rounded-md hover:bg-indigo-100 dark:hover:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 transition-colors disabled:opacity-50"
              title="Regenerar análisis"
              aria-label="Regenerar"
            >
              <RefreshCw
                className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`}
              />
            </button>
          </div>
        </div>

        {!enabled ? (
          <p className="text-sm text-muted-foreground py-6 text-center">
            Registra gastos en este periodo para obtener análisis con IA.
          </p>
        ) : loading && !insights ? (
          <div className="space-y-3 animate-pulse">
            <div className="h-4 bg-muted rounded w-3/4" />
            <div className="h-4 bg-muted rounded w-2/3" />
            <div className="h-4 bg-muted rounded w-1/2" />
          </div>
        ) : error && !insights ? (
          <div className="flex items-center gap-2 text-sm text-amber-600 dark:text-amber-400 py-4">
            <AlertTriangle className="h-4 w-4" />
            {error}
            <button
              onClick={refresh}
              className="underline hover:no-underline ml-1"
            >
              Reintentar
            </button>
          </div>
        ) : insights ? (
          <div
            className={`space-y-5 ${refreshing ? 'opacity-60' : ''}`}
          >
            {/* Resumen narrativo */}
            {insights.resumen && (
              <p className="text-sm text-foreground leading-relaxed">
                {insights.resumen}
              </p>
            )}

            {typeof insights.ahorroEstimado === 'number' &&
              insights.ahorroEstimado > 0 && (
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-sm">
                  <TrendingDown className="h-4 w-4" />
                  Ahorro potencial estimado:{' '}
                  <span className="font-bold">
                    {fmt(insights.ahorroEstimado)}
                  </span>
                </div>
              )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {/* Recomendaciones */}
              {insights.recomendaciones.length > 0 && (
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5">
                    <Lightbulb className="h-3.5 w-3.5 text-amber-500" />
                    Recomendaciones
                  </h3>
                  <ul className="space-y-2">
                    {insights.recomendaciones.map((r, i) => (
                      <li
                        key={i}
                        className="text-sm text-foreground flex gap-2"
                      >
                        <span className="text-amber-500 font-bold flex-shrink-0">
                          {i + 1}.
                        </span>
                        {r}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Insights */}
              {insights.insights.length > 0 && (
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5 text-indigo-500" />
                    Observaciones
                  </h3>
                  <ul className="space-y-2">
                    {insights.insights.map((s, i) => (
                      <li
                        key={i}
                        className="text-sm text-foreground flex gap-2"
                      >
                        <span className="text-indigo-500 flex-shrink-0">
                          •
                        </span>
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Anomalías: IA + outliers locales */}
            {(insights.anomalias.length > 0 ||
              summary.anomalias.length > 0) && (
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5">
                  <AlertTriangle className="h-3.5 w-3.5 text-red-500" />
                  Anomalías detectadas
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {insights.anomalias.map((a, i) => (
                    <div
                      key={`ia-${i}`}
                      className={`rounded-lg border p-3 text-sm ${
                        SEVERIDAD_STYLE[a.severidad] ?? SEVERIDAD_STYLE.baja
                      }`}
                    >
                      <p className="font-semibold flex items-center gap-1.5">
                        {a.titulo}
                        <span className="text-[10px] uppercase opacity-70">
                          {a.severidad}
                        </span>
                      </p>
                      <p className="opacity-90 mt-0.5">{a.detalle}</p>
                    </div>
                  ))}
                  {summary.anomalias.slice(0, 4).map((o) => (
                    <div
                      key={`out-${o.id}`}
                      className="rounded-lg border border-border bg-muted/30 p-3 text-sm"
                    >
                      <p className="font-semibold text-foreground flex items-center justify-between gap-2">
                        <span className="truncate">{o.descripcion}</span>
                        <span className="flex-shrink-0">{fmt(o.monto)}</span>
                      </p>
                      <p className="text-muted-foreground mt-0.5 text-xs">
                        {getCategoryLabel(o.categoria)} · {o.razon} (
                        {o.desviacion.toFixed(1)}σ) · {o.fecha}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : null}

        {/* Mini-chat contextual */}
        {enabled && (
          <div className="border-t border-border pt-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5">
              <MessageSquareText className="h-3.5 w-3.5 text-purple-500" />
              Pregunta sobre tus métricas
            </h3>

            {mensajes.length > 0 && (
              <div className="space-y-2 mb-3 max-h-64 overflow-y-auto pr-1">
                {mensajes.map((m, i) => (
                  <div
                    key={i}
                    className={`flex ${
                      m.role === 'user' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm ${
                        m.role === 'user'
                          ? 'bg-primary text-primary-foreground rounded-br-sm'
                          : 'bg-muted text-foreground rounded-bl-sm'
                      }`}
                    >
                      {m.content}
                    </div>
                  </div>
                ))}
                {asking && (
                  <div className="flex justify-start">
                    <div className="bg-muted text-muted-foreground rounded-2xl rounded-bl-sm px-3 py-2 text-sm flex items-center gap-2">
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      Analizando…
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>
            )}

            {mensajes.length === 0 && (
              <div className="flex flex-wrap gap-1.5 mb-3">
                {PREGUNTAS_SUGERIDAS.map((q) => (
                  <button
                    key={q}
                    onClick={() => enviarPregunta(q)}
                    disabled={asking}
                    className="text-[11px] px-2.5 py-1 rounded-full border border-border text-muted-foreground hover:bg-accent transition-colors disabled:opacity-50"
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}

            <form
              onSubmit={(e) => {
                e.preventDefault();
                void enviarPregunta(input);
              }}
              className="flex items-center gap-2"
            >
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                maxLength={500}
                placeholder="Escribe tu pregunta…"
                className="flex-1 bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
              <button
                type="submit"
                disabled={asking || !input.trim()}
                className="p-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
                aria-label="Enviar"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
