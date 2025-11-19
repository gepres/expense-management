import { useState, useEffect } from 'react';
import { callAssistant } from '@services/ai';
import { Sparkles } from 'lucide-react';

interface AIInsightsProps {
  month: number;
  year: number;
}

export default function AIInsights({ month, year }: AIInsightsProps) {
  const [insights, setInsights] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    let mounted = true;

    const fetchInsights = async () => {
      try {
        // Solicitamos insights específicos y cortos
        const prompt = `Analiza mis gastos de ${month}/${year} y dame 3 consejos o datos clave muy breves (máximo 15 palabras cada uno). Sepáralos por el símbolo "|". Sé motivador o directo.`;
        
        const response = await callAssistant(prompt, month, year);
        
        if (mounted && response.success) {
          // Limpiamos y separamos la respuesta
          const parts = response.message
            .split('|')
            .map(s => s.trim())
            .filter(s => s.length > 0);
            
          if (parts.length > 0) {
            setInsights(parts);
          } else {
            // Fallback si el formato no es el esperado
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

    fetchInsights();

    return () => { mounted = false; };
  }, [month, year]);

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
    <div className="relative overflow-hidden bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-1 shadow-lg">
      <div className="absolute top-0 left-0 w-full h-full bg-white/10 backdrop-blur-[1px]"></div>
      
      <div className="relative bg-card/95 backdrop-blur-sm rounded-lg p-4 flex items-start gap-4">
        <div className="flex-shrink-0 p-2 bg-indigo-100 dark:bg-indigo-900/50 rounded-full">
          <Sparkles className="h-5 w-5 text-indigo-600 dark:text-indigo-400 animate-pulse" />
        </div>
        
        <div className="flex-1 min-w-0 flex flex-col justify-center min-h-[3rem]">
          <h3 className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mb-1 flex items-center gap-2">
            AI Insights <span className="text-[10px] px-1.5 py-0.5 bg-indigo-100 dark:bg-indigo-900 rounded-full">BETA</span>
          </h3>
          
          <p 
            className={`text-sm font-medium text-foreground transition-opacity duration-500 ease-in-out ${
              isVisible ? 'opacity-100' : 'opacity-0'
            }`}
          >
            {insights[currentIndex]}
          </p>
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
