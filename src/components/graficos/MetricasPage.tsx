/**
 * Punto de entrada del módulo de Métricas (route `/metricas`).
 *
 * Gating:
 *  - NO-pro            → MetricasTeaser (preview borroso + beneficios + CTA)
 *  - PRO en mobile      → MetricasMobile (resumen no invasivo + "ve a escritorio")
 *  - PRO en escritorio  → MetricasDesktop (dashboard completo)
 */

import { useAuth } from '@context/AuthContext';
import { useIsMobile } from '@hooks/useBreakpoints';
import MetricasDesktop from './MetricasDesktop';
import MetricasMobile from './mobile/MetricasMobile';
import MetricasTeaser from './MetricasTeaser';

export default function MetricasPage() {
  const { isPro } = useAuth();
  const isMobile = useIsMobile();

  if (!isPro) return <MetricasTeaser />;
  if (isMobile) return <MetricasMobile />;
  return <MetricasDesktop />;
}
