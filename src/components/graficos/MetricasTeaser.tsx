/**
 * Teaser del módulo de Métricas para usuarios NO-pro.
 *
 * Muestra un preview decorativo borroso del dashboard + los beneficios
 * concretos que se desbloquean + CTA para solicitar PRO (reusa
 * `ProRequestButton`, que ya maneja todos los estados de la solicitud).
 */

import {
  BarChart3,
  Crown,
  TrendingUp,
  PieChart,
  Target,
  Sparkles,
  FileDown,
  Check,
} from 'lucide-react';
import ProRequestButton from '@components/user/ProRequestButton';
import ProBadge from '@components/common/ProBadge';

const BENEFICIOS = [
  {
    icon: TrendingUp,
    titulo: 'Flujo de caja con proyección',
    desc: 'Mira cómo evoluciona tu gasto día a día y cuánto cerrarás a fin de mes.',
  },
  {
    icon: PieChart,
    titulo: 'Categorías con drilldown',
    desc: 'Desglose por categoría y subcategoría + tendencias vs el mes anterior.',
  },
  {
    icon: Target,
    titulo: 'Presupuesto vs real',
    desc: 'Cumplimiento por categoría y general, con alertas de exceso.',
  },
  {
    icon: Sparkles,
    titulo: 'Análisis con IA',
    desc: 'Recomendaciones personalizadas, anomalías y chat sobre tus métricas.',
  },
  {
    icon: FileDown,
    titulo: 'Exporta todo',
    desc: 'Descarga reportes en PDF, gráficos en PNG y datos en Excel/CSV.',
  },
] as const;

/** Mock decorativo (sin datos reales) que se muestra borroso de fondo. */
function PreviewMock() {
  return (
    <div
      aria-hidden
      className="grid grid-cols-1 lg:grid-cols-3 gap-4 select-none"
    >
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="bg-card border border-border rounded-xl p-4 h-28"
        >
          <div className="h-3 w-20 bg-muted rounded mb-3" />
          <div className="h-6 w-28 bg-muted rounded mb-2" />
          <div className="h-2 w-16 bg-muted rounded" />
        </div>
      ))}
      <div className="lg:col-span-2 bg-card border border-border rounded-xl p-5 h-56">
        <div className="h-4 w-32 bg-muted rounded mb-6" />
        <div className="flex items-end gap-2 h-32">
          {[40, 70, 55, 90, 60, 80, 45, 75, 65, 95, 50, 85].map((h, i) => (
            <div
              key={i}
              className="flex-1 rounded-t bg-gradient-to-t from-indigo-500/60 to-purple-500/60"
              style={{ height: `${h}%` }}
            />
          ))}
        </div>
      </div>
      <div className="bg-card border border-border rounded-xl p-5 h-56">
        <div className="h-4 w-24 bg-muted rounded mb-6" />
        <div className="mx-auto h-32 w-32 rounded-full border-[14px] border-indigo-500/50 border-r-purple-500/50 border-b-emerald-500/50" />
      </div>
    </div>
  );
}

export default function MetricasTeaser() {
  return (
    <div className="space-y-6 pb-10">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground flex items-center gap-2">
          <BarChart3 className="h-7 w-7 text-indigo-500" />
          Métricas
          <ProBadge size="lg" className="ml-1" />
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Análisis profundo de tus finanzas con IA — disponible para cuentas PRO
        </p>
      </div>

      {/* Preview borroso + overlay */}
      <div className="relative rounded-2xl overflow-hidden border border-border">
        <div className="blur-sm scale-[1.02] p-4 pointer-events-none">
          <PreviewMock />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/80 to-background flex flex-col items-center justify-center text-center px-6">
          <div className="p-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 shadow-lg mb-4">
            <Crown className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-xl md:text-2xl font-bold text-foreground">
            Desbloquea Métricas PRO
          </h2>
          <p className="text-sm text-muted-foreground mt-2 max-w-md">
            Convierte tus gastos en decisiones: gráficos interactivos, proyecciones
            y un asistente de IA que analiza tu mes por ti.
          </p>
          <div className="mt-5">
            <ProRequestButton />
          </div>
        </div>
      </div>

      {/* Beneficios */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {BENEFICIOS.map((b) => (
          <div
            key={b.titulo}
            className="bg-card border border-border rounded-xl p-5 hover:shadow-md transition-all"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-indigo-100 dark:bg-indigo-900/40">
                <b.icon className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              </div>
              <h3 className="font-semibold text-foreground text-sm">
                {b.titulo}
              </h3>
            </div>
            <p className="text-sm text-muted-foreground">{b.desc}</p>
          </div>
        ))}
        <div className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl p-5 text-white flex flex-col justify-center">
          <p className="text-sm font-medium opacity-90 mb-3">
            Todo esto incluido en PRO:
          </p>
          <ul className="space-y-1.5 text-sm">
            {[
              'Gráficos interactivos en escritorio',
              'IA: recomendaciones y anomalías',
              'Exporta PDF / PNG / Excel',
              'Sin límites de consultas',
            ].map((t) => (
              <li key={t} className="flex items-center gap-2">
                <Check className="h-4 w-4 flex-shrink-0" />
                {t}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
