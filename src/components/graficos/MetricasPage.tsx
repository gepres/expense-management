/**
 * Punto de entrada del módulo de Métricas (route `/metricas`).
 *
 * Bloque 3: renderiza el dashboard desktop.
 * Bloque 5 añadirá: gating PRO (teaser para no-pro) + versión mobile
 * no invasiva con CTA "ver en escritorio".
 */

import MetricasDesktop from './MetricasDesktop';

export default function MetricasPage() {
  return <MetricasDesktop />;
}
