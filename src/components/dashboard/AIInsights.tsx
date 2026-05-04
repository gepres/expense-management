import { useState, useEffect, useCallback } from 'react';
import { callAssistant } from '@services/ai';
import { Sparkles, Crown, RefreshCw } from 'lucide-react';
import { useAuth } from '@context/AuthContext';
import { Link } from 'react-router-dom';
import { isNetworkError } from '@utils/api-errors';

interface AIInsightsProps {
  month: number;
  year: number;
}

// TTL del cache configurable vía env. Default: 5 min.
// Vite expone los env como strings; convertimos a número con fallback.
const TTL_MINUTES = (() => {
  const raw = import.meta.env.VITE_AI_INSIGHTS_TTL_MINUTES;
  const parsed = Number(raw);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 5;
})();
const TTL_MS = TTL_MINUTES * 60 * 1000;

interface CacheEntry {
  insights: string[];
  timestamp: number;
}

// Cache a nivel de módulo: sobrevive desmontes/remontes del componente
// dentro de la misma sesión, pero no entre recargas de página (apropiado
// para tips de IA que dependen del momento del día).
const insightsCache = new Map<string, CacheEntry>();

function cacheKey(month: number, year: number, userId: string | undefined): string {
  return `${userId ?? 'anon'}:${year}-${month}`;
}

function isCacheFresh(entry: CacheEntry | undefined): entry is CacheEntry {
  if (!entry) return false;
  return Date.now() - entry.timestamp < TTL_MS;
}

const FALLBACK_INSIGHTS = [
  'Tus finanzas están bajo control. ¡Sigue así!',
  'Revisa tus gastos hormiga este mes.',
  'Mantén tu presupuesto actualizado.',
];

const NON_PRO_INSIGHTS = [
  'Desbloquea todo el potencial de tu asistente financiero con una cuenta PRO.',
  'Obtén análisis detallados y consejos personalizados para mejorar tus finanzas.',
];

export default function AIInsights({ month, year }: AIInsightsProps) {
  const { isPro, usuario } = useAuth();
  const [insights, setInsights] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<number | null>(null);

  const key = cacheKey(month, year, usuario?.id);

  const loadInsights = useCallback(
    async (force: boolean): Promise<void> => {
      // Tier free: no llama al backend. Tampoco cachea.
      if (!isPro) {
        setInsights(NON_PRO_INSIGHTS);
        setLoading(false);
        setLastUpdated(null);
        return;
      }

      // Cache hit y no forzamos refresh → usar lo guardado.
      const cached = insightsCache.get(key);
      if (!force && isCacheFresh(cached)) {
        setInsights(cached.insights);
        setLastUpdated(cached.timestamp);
        setLoading(false);
        return;
      }

      if (force) setRefreshing(true);
      else setLoading(true);

      try {
        const prompt = `Analiza mis gastos de ${month}/${year} y dame 3 consejos o datos clave muy breves (máximo 15 palabras cada uno). Sepáralos por el símbolo "|". Sé motivador o directo.`;
        const response = await callAssistant(prompt, month, year);

        if (response.success) {
          const parts = response.message
            .split('|')
            .map((s: string) => s.trim())
            .filter((s: string) => s.length > 0);
          const finalInsights = parts.length > 0 ? parts : [response.message];
          const now = Date.now();
          insightsCache.set(key, { insights: finalInsights, timestamp: now });
          setInsights(finalInsights);
          setLastUpdated(now);
        }
      } catch (error) {
        console.error('Error fetching AI insights:', error);
        // Si el backend está caído, mostramos fallback pero no cacheamos
        // para que el siguiente intento no devuelva el placeholder.
        if (isNetworkError(error)) {
          setInsights([
            'No se pudo conectar con el asistente. Revisa que el backend esté arriba.',
          ]);
        } else {
          setInsights(FALLBACK_INSIGHTS);
        }
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [isPro, key, month, year],
  );

  // Carga inicial al montar / cambiar mes-año / cambiar usuario
  useEffect(() => {
    let mounted = true;
    setCurrentIndex(0);
    void loadInsights(false).then(() => {
      if (!mounted) return;
    });
    return () => {
      mounted = false;
    };
  }, [loadInsights]);

  // Rotación automática cada 8s
  useEffect(() => {
    if (insights.length <= 1) return;
    const interval = setInterval(() => {
      setIsVisible(false);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % insights.length);
        setIsVisible(true);
      }, 500);
    }, 8000);
    return () => clearInterval(interval);
  }, [insights]);

  const handleRefresh = () => {
    if (refreshing || loading) return;
    void loadInsights(true);
  };

  if (loading) {
    return (
      <div className="bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 rounded-xl p-4 animate-pulse flex items-center gap-3">
        <div className="h-8 w-8 bg-indigo-500/20 rounded-full"></div>
        <div className="h-4 bg-indigo-500/20 rounded w-3/4"></div>
      </div>
    );
  }

  if (insights.length === 0) return null;

  return (
    <div
      className={`relative overflow-hidden rounded-xl p-1 shadow-lg transition-all duration-300 ${
        isPro
          ? 'bg-gradient-to-r from-indigo-600 to-purple-600'
          : 'bg-muted/50 grayscale opacity-80'
      }`}
    >
      <div className="absolute top-0 left-0 w-full h-full bg-white/10 backdrop-blur-[1px]"></div>

      <div className="relative bg-card/95 backdrop-blur-sm rounded-lg p-4 flex items-start gap-4">
        <div
          className={`flex-shrink-0 p-2 rounded-full ${
            isPro
              ? 'bg-indigo-100 dark:bg-indigo-900/50'
              : 'bg-muted'
          }`}
        >
          <Sparkles
            className={`h-5 w-5 ${
              isPro
                ? 'text-indigo-600 dark:text-indigo-400 animate-pulse'
                : 'text-muted-foreground'
            }`}
          />
        </div>

        <div className="flex-1 min-w-0 flex flex-col justify-center min-h-[3rem]">
          <h3
            className={`text-xs font-bold uppercase tracking-wider mb-1 flex items-center gap-2 ${
              isPro ? 'text-indigo-600 dark:text-indigo-400' : 'text-muted-foreground'
            }`}
          >
            AI Insights{' '}
            <span
              className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                isPro ? 'bg-indigo-100 dark:bg-indigo-900' : 'bg-muted'
              }`}
            >
              BETA
            </span>
            {isPro && lastUpdated && (
              <span className="text-[10px] font-normal text-muted-foreground normal-case ml-auto pr-1">
                {formatRelativeTime(lastUpdated)}
              </span>
            )}
          </h3>

          <p
            className={`text-sm font-medium text-foreground transition-opacity duration-500 ease-in-out ${
              isVisible ? 'opacity-100' : 'opacity-0'
            }`}
          >
            {insights[currentIndex]}
          </p>

          {!isPro && (
            <Link
              to="/configuracion?tab=perfil"
              className="mt-2 text-xs font-semibold !text-amber-600 !dark:text-amber-500 hover:underline flex items-center gap-1"
            >
              <Crown className="w-3 h-3" />
              Actualizar a PRO
            </Link>
          )}
        </div>

        <div className="flex flex-col items-end gap-1.5 justify-between h-full pt-1">
          {isPro && (
            <button
              type="button"
              onClick={handleRefresh}
              disabled={refreshing}
              className="p-1.5 rounded-md hover:bg-indigo-100 dark:hover:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 transition-colors disabled:opacity-50"
              title={`Refrescar insights (cache ${TTL_MINUTES} min)`}
              aria-label="Refrescar insights"
            >
              <RefreshCw
                className={`h-3.5 w-3.5 ${refreshing ? 'animate-spin' : ''}`}
              />
            </button>
          )}

          {insights.length > 1 && (
            <div className="flex flex-col gap-1 justify-center">
              {insights.map((_, idx) => (
                <div
                  key={idx}
                  className={`w-1.5 h-1.5 rounded-full transition-colors duration-300 ${
                    idx === currentIndex
                      ? 'bg-indigo-600 dark:bg-indigo-400'
                      : 'bg-indigo-200 dark:bg-indigo-800'
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function formatRelativeTime(timestamp: number): string {
  const diffSec = Math.floor((Date.now() - timestamp) / 1000);
  if (diffSec < 60) return 'recién';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `hace ${diffMin} min`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `hace ${diffHr} h`;
  return `hace ${Math.floor(diffHr / 24)} d`;
}
