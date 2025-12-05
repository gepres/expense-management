import { useState, useEffect, useRef } from 'react';
import { callAssistant } from '@services/ai';
import { Sparkles, Crown } from 'lucide-react';
import { useAuth } from '@context/AuthContext';
import { Link } from 'react-router-dom';

interface AIInsightsProps {
  month: number;
  year: number;
}

export default function AIInsights({ month, year }: AIInsightsProps) {
  const { isPro } = useAuth();
  const [insights, setInsights] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  // Cache para almacenar las promesas de las peticiones en curso o completadas
  const promiseCache = useRef<{[key: string]: Promise<any>}>({});

  useEffect(() => {
    let mounted = true;
    const currentKey = `${month}-${year}`;

    const loadInsights = async () => {
      if (!isPro) {
        setInsights([
          "Desbloquea todo el potencial de tu asistente financiero con una cuenta PRO.",
          "Obtén análisis detallados y consejos personalizados para mejorar tus finanzas."
        ]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        // Si no hay una petición en curso para esta fecha, la iniciamos
        if (!promiseCache.current[currentKey]) {
          const prompt = `Analiza mis gastos de ${month}/${year} y dame 3 consejos o datos clave muy breves (máximo 15 palabras cada uno). Sepáralos por el símbolo "|". Sé motivador o directo.`;
          promiseCache.current[currentKey] = callAssistant(prompt, month, year);
        }

        // Esperamos a que la promesa (nueva o existente) se resuelva
        const response = await promiseCache.current[currentKey];
        
        if (mounted && response.success) {
          // Limpiamos y separamos la respuesta
          const parts = response.message
            .split('|')
            .map((s: string) => s.trim())
            .filter((s: string) => s.length > 0);
            
          if (parts.length > 0) {
            setInsights(parts);
          } else {
            setInsights([response.message]);
          }
        }
      } catch (error) {
        console.error("Error fetching AI insights:", error);
        if (mounted) {
          setInsights(["Tus finanzas están bajo control. ¡Sigue así!", "Revisa tus gastos hormiga este mes.", "Mantén tu presupuesto actualizado."]);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadInsights();

    return () => { mounted = false; };
  }, [month, year, isPro]);

  useEffect(() => {
    if (insights.length <= 1) return;

    const interval = setInterval(() => {
      setIsVisible(false);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % insights.length);
        setIsVisible(true);
      }, 500); // Tiempo para el fade out
    }, 8000); // Cambiar cada 8 segundos

    return () => clearInterval(interval);
  }, [insights]);

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
    <div className={`relative overflow-hidden rounded-xl p-1 shadow-lg transition-all duration-300 ${
      isPro 
        ? 'bg-gradient-to-r from-indigo-600 to-purple-600' 
        : 'bg-muted/50 grayscale opacity-80'
    }`}>
      <div className="absolute top-0 left-0 w-full h-full bg-white/10 backdrop-blur-[1px]"></div>
      
      <div className="relative bg-card/95 backdrop-blur-sm rounded-lg p-4 flex items-start gap-4">
        <div className={`flex-shrink-0 p-2 rounded-full ${
          isPro 
            ? 'bg-indigo-100 dark:bg-indigo-900/50' 
            : 'bg-muted'
        }`}>
          <Sparkles className={`h-5 w-5 ${
            isPro 
              ? 'text-indigo-600 dark:text-indigo-400 animate-pulse' 
              : 'text-muted-foreground'
          }`} />
        </div>
        
        <div className="flex-1 min-w-0 flex flex-col justify-center min-h-[3rem]">
          <h3 className={`text-xs font-bold uppercase tracking-wider mb-1 flex items-center gap-2 ${
            isPro ? 'text-indigo-600 dark:text-indigo-400' : 'text-muted-foreground'
          }`}>
            AI Insights <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
              isPro ? 'bg-indigo-100 dark:bg-indigo-900' : 'bg-muted'
            }`}>BETA</span>
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

        {insights.length > 1 && (
          <div className="flex flex-col gap-1 justify-center h-full pt-2">
            {insights.map((_, idx) => (
              <div 
                key={idx}
                className={`w-1.5 h-1.5 rounded-full transition-colors duration-300 ${
                  idx === currentIndex ? 'bg-indigo-600 dark:bg-indigo-400' : 'bg-indigo-200 dark:bg-indigo-800'
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
