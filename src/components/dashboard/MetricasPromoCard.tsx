/**
 * Promo del módulo de Métricas PRO en el Dashboard.
 * Solo se muestra a usuarios NO-pro (los pro ya tienen acceso por el menú).
 */

import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight } from 'lucide-react';
import { useAuth } from '@context/AuthContext';
import ProBadge from '../common/ProBadge';

export default function MetricasPromoCard() {
  const { isPro } = useAuth();
  if (isPro) return null;

  return (
    <Link
      to="/metricas"
      className="block rounded-xl p-[1px] bg-gradient-to-r from-indigo-600 to-purple-600 shadow-lg hover:shadow-xl transition-shadow group"
    >
      <div className="bg-card rounded-[11px] p-4 flex items-center gap-4">
        <div className="p-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 flex-shrink-0">
          <Sparkles className="h-6 w-6 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5">
            Métricas avanzadas con IA
            <ProBadge size="sm" />
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Flujo de caja con proyección, presupuesto vs real, anomalías y un
            asistente que analiza tu mes. Exporta en PDF/Excel.
          </p>
        </div>
        <span className="hidden sm:flex items-center gap-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 group-hover:gap-2 transition-all flex-shrink-0">
          Descúbrelo
          <ArrowRight className="h-4 w-4" />
        </span>
      </div>
    </Link>
  );
}
