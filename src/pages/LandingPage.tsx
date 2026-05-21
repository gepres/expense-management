/**
 * LandingPage — página pública de marketing (ruta `/` sin sesión).
 *
 * Promociona el aplicativo, lista ventajas PRO y muestra los 3 planes
 * (Free/Standard, Promocional, PRO) con precios aún sin detallar. Usa los
 * tokens de tema (HSL CSS vars) → respeta light/dark automáticamente.
 */

import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Wallet,
  Sparkles,
  TrendingUp,
  Layers,
  Repeat,
  FileSpreadsheet,
  Bot,
  ShieldCheck,
  Smartphone,
  Users,
  PiggyBank,
  Image as ImageIcon,
  Check,
  ArrowRight,
  Crown,
  Zap,
} from 'lucide-react';
import { PROMO_TRIAL_DAYS } from '@services/firebase';

// ============================================================================
// Datos
// ============================================================================

const FEATURES = [
  {
    icon: Layers,
    title: 'Multi-cuenta y multi-moneda',
    desc: 'Bancos, efectivo, billeteras y tarjetas en PEN y USD, con tu patrimonio consolidado al instante.',
  },
  {
    icon: PiggyBank,
    title: 'Presupuestos inteligentes',
    desc: 'Presupuesto general y por categoría, con alertas cuando te acercas al límite.',
  },
  {
    icon: Repeat,
    title: 'Gastos y transferencias programadas',
    desc: 'Recurrencias automáticas, incluso cross-currency con tasa de cambio en vivo.',
  },
  {
    icon: Bot,
    title: 'Asistente con IA',
    desc: 'Registra gastos por voz, imagen o texto y conversa con tu asistente financiero.',
  },
  {
    icon: TrendingUp,
    title: 'Métricas PRO',
    desc: 'Analítica avanzada con insights de IA para entender en qué se va tu dinero.',
  },
  {
    icon: FileSpreadsheet,
    title: 'Importación masiva',
    desc: 'Sube Excel, CSV o JSON y deja que la IA categorice y limpie todo por ti.',
  },
  {
    icon: Users,
    title: 'Gastos compartidos',
    desc: 'Grupos para repartir cuentas con amigos, pareja o roommates sin fricción.',
  },
  {
    icon: Smartphone,
    title: 'PWA instalable',
    desc: 'Instálala como app en tu celular o escritorio. Rápida y siempre disponible.',
  },
  {
    icon: ShieldCheck,
    title: 'Tus datos, seguros',
    desc: 'Cada usuario solo accede a su información. Reglas estrictas en el backend.',
  },
];

const PRO_ADVANTAGES = [
  { icon: TrendingUp, text: 'Módulo de Métricas con análisis de IA' },
  { icon: FileSpreadsheet, text: 'Importación masiva desde Excel / CSV / JSON' },
  { icon: Repeat, text: 'Gastos y transferencias programadas ilimitadas' },
  { icon: Zap, text: 'Cuota de IA ampliada para el asistente' },
  { icon: ImageIcon, text: 'Generación de imágenes con IA' },
  { icon: Sparkles, text: 'Roast financiero compartible y novedades anticipadas' },
];

type Plan = {
  name: string;
  price: string;
  priceNote: string;
  highlight?: boolean;
  badge?: string;
  icon: typeof Wallet;
  features: string[];
  cta: string;
  to: string;
};

const PLANS: Plan[] = [
  {
    name: 'Free',
    price: 'Gratis',
    priceNote: 'Para siempre',
    icon: Wallet,
    features: [
      'Gastos, cuentas y multi-moneda',
      'Presupuestos por categoría',
      'Asistente IA con cuota básica',
      'PWA instalable',
      'Gastos compartidos',
    ],
    cta: 'Empezar gratis',
    to: '/registro',
  },
  {
    name: 'Promocional',
    price: 'Gratis',
    priceNote: `${PROMO_TRIAL_DAYS} días al registrarte`,
    highlight: true,
    badge: 'Más popular',
    icon: Sparkles,
    features: [
      'Todo lo de Free',
      'Acceso PRO completo por ' + PROMO_TRIAL_DAYS + ' días',
      'Métricas con IA e importación masiva',
      'Cuota IA ampliada + imágenes con IA',
      'Se activa solo: regístrate y listo',
    ],
    cta: `Probar PRO ${PROMO_TRIAL_DAYS} días`,
    to: '/registro',
  },
  {
    name: 'PRO',
    price: 'Próximamente',
    priceNote: 'Precio por anunciar',
    icon: Crown,
    features: [
      'Todo lo de Free',
      'Métricas PRO con insights de IA',
      'Importación masiva Excel / CSV / JSON',
      'Programados ilimitados (incl. cross-currency)',
      'Cuota IA alta + generación de imágenes',
    ],
    cta: 'Crear cuenta',
    to: '/registro',
  },
];

// ============================================================================
// Helpers de animación
// ============================================================================

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0 },
};

// ============================================================================
// Componente
// ============================================================================

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* ===================== NAV ===================== */}
      <header className="sticky top-0 z-30 backdrop-blur-lg bg-background/80 border-b border-border">
        <div className="max-w-6xl mx-auto px-3 sm:px-4 h-16 flex items-center justify-between gap-3">
          <span className="flex items-center gap-2 font-bold text-base sm:text-lg text-primary min-w-0">
            <Wallet className="h-6 w-6 shrink-0" />
            <span className="hidden sm:inline truncate">
              Gestión de Gastos
            </span>
            <span className="sm:hidden truncate">Gastos</span>
          </span>
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <Link
              to="/login"
              className="px-2.5 sm:px-4 py-2 text-sm font-medium rounded-lg hover:bg-muted transition-colors whitespace-nowrap"
            >
              <span className="hidden sm:inline">Iniciar sesión</span>
              <span className="sm:hidden">Entrar</span>
            </Link>
            <Link
              to="/registro"
              className="px-3 sm:px-4 py-2 text-sm font-semibold rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity whitespace-nowrap"
            >
              <span className="hidden sm:inline">Crear cuenta</span>
              <span className="sm:hidden">Registrarme</span>
            </Link>
          </div>
        </div>
      </header>

      {/* ===================== HERO ===================== */}
      <section className="relative overflow-hidden">
        {/* Glow decorativo */}
        <div
          aria-hidden
          className="pointer-events-none absolute -top-32 left-1/2 -translate-x-1/2 h-[480px] w-[480px] rounded-full bg-primary/20 blur-[120px]"
        />
        <div className="relative max-w-6xl mx-auto px-4 pt-16 pb-20 grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial="hidden"
            animate="show"
            variants={fadeUp}
            transition={{ duration: 0.5 }}
          >
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-5">
              <Sparkles className="h-3.5 w-3.5" />
              {PROMO_TRIAL_DAYS} días PRO gratis al registrarte
            </span>
            <h1 className="text-4xl md:text-5xl font-extrabold leading-tight tracking-tight">
              Tus finanzas personales,{' '}
              <span className="text-primary">claras y bajo control</span>
            </h1>
            <p className="mt-5 text-lg text-muted-foreground max-w-xl">
              Registra gastos por voz, imagen o texto. Multi-cuenta,
              multi-moneda, presupuestos, programados y analítica con IA — todo
              en una PWA rápida que instalas en segundos.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/registro"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold shadow-lg shadow-primary/25 hover:scale-[1.02] active:scale-[0.98] transition-transform"
              >
                Empezar gratis
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-border font-semibold hover:bg-muted transition-colors"
              >
                Ya tengo cuenta
              </Link>
            </div>
            <p className="mt-4 text-xs text-muted-foreground">
              Sin tarjeta. El trial PRO se activa automáticamente al crear tu
              cuenta.
            </p>
          </motion.div>

          {/* Mock visual */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="relative"
          >
            <div className="rounded-2xl border border-border bg-card shadow-2xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">
                    Patrimonio total
                  </p>
                  <p className="text-3xl font-bold mt-1">S/ 12,480.50</p>
                </div>
                <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300">
                  <TrendingUp className="h-3.5 w-3.5" />
                  +8.2%
                </span>
              </div>
              <div className="mt-6 space-y-3">
                {[
                  { l: 'BCP · Cuenta sueldo', v: 'S/ 7,200.00', c: 'bg-blue-500' },
                  { l: 'Efectivo', v: 'S/ 1,150.50', c: 'bg-emerald-500' },
                  { l: 'Ahorros USD', v: '$ 1,100.00', c: 'bg-amber-500' },
                ].map((r) => (
                  <div
                    key={r.l}
                    className="flex items-center justify-between rounded-xl bg-muted/50 px-4 py-3"
                  >
                    <span className="flex items-center gap-3 text-sm">
                      <span className={`h-2.5 w-2.5 rounded-full ${r.c}`} />
                      {r.l}
                    </span>
                    <span className="font-semibold text-sm">{r.v}</span>
                  </div>
                ))}
              </div>
              <div className="mt-6 flex items-center gap-2 rounded-xl border border-primary/30 bg-primary/5 px-4 py-3">
                <Bot className="h-5 w-5 text-primary shrink-0" />
                <p className="text-xs text-muted-foreground">
                  <span className="text-foreground font-medium">
                    "Gasté 45 soles en almuerzo"
                  </span>{' '}
                  → registrado en Alimentación 🍽️
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ===================== FEATURES ===================== */}
      <section className="max-w-6xl mx-auto px-4 py-20">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <h2 className="text-3xl md:text-4xl font-bold">
            Todo lo que necesitas para ordenar tu plata
          </h2>
          <p className="mt-4 text-muted-foreground">
            Pensado para personas reales: rápido de usar, bonito y potente.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.title}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: '-60px' }}
              variants={fadeUp}
              transition={{ duration: 0.4, delay: (i % 3) * 0.05 }}
              className="rounded-2xl border border-border bg-card p-6 hover:border-primary/40 hover:shadow-lg transition-all"
            >
              <div className="h-11 w-11 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-4">
                <f.icon className="h-5 w-5" />
              </div>
              <h3 className="font-semibold text-lg">{f.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ===================== VENTAJAS PRO ===================== */}
      <section className="max-w-6xl mx-auto px-4 pb-20">
        <div className="relative overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-primary/10 via-card to-card p-8 md:p-12">
          <div
            aria-hidden
            className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-primary/20 blur-3xl"
          />
          <div className="relative grid lg:grid-cols-2 gap-10 items-center">
            <div>
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 text-xs font-semibold mb-4">
                <Crown className="h-3.5 w-3.5" />
                Ventajas PRO
              </span>
              <h2 className="text-3xl md:text-4xl font-bold">
                Lleva tus finanzas al siguiente nivel
              </h2>
              <p className="mt-4 text-muted-foreground">
                Al registrarte pruebas <strong>PRO gratis</strong> por{' '}
                {PROMO_TRIAL_DAYS} días. Esto es lo que desbloqueas:
              </p>
            </div>
            <ul className="space-y-3">
              {PRO_ADVANTAGES.map((a) => (
                <li
                  key={a.text}
                  className="flex items-center gap-3 rounded-xl bg-background/60 border border-border px-4 py-3"
                >
                  <span className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                    <a.icon className="h-4 w-4" />
                  </span>
                  <span className="text-sm font-medium">{a.text}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ===================== PRICING ===================== */}
      <section className="max-w-6xl mx-auto px-4 pb-20">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <h2 className="text-3xl md:text-4xl font-bold">Planes simples</h2>
          <p className="mt-4 text-muted-foreground">
            Empieza gratis. Los precios de PRO se anunciarán pronto — los
            usuarios nuevos prueban PRO sin costo {PROMO_TRIAL_DAYS} días.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-6 items-stretch">
          {PLANS.map((p) => (
            <motion.div
              key={p.name}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: '-60px' }}
              variants={fadeUp}
              transition={{ duration: 0.4 }}
              className={`relative flex flex-col rounded-2xl border p-7 ${
                p.highlight
                  ? 'border-primary shadow-xl shadow-primary/15 bg-card'
                  : 'border-border bg-card'
              }`}
            >
              {p.badge && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-primary text-primary-foreground text-[11px] font-bold">
                  {p.badge}
                </span>
              )}
              <div className="flex items-center gap-3">
                <span
                  className={`h-10 w-10 rounded-xl flex items-center justify-center ${
                    p.highlight
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-primary/10 text-primary'
                  }`}
                >
                  <p.icon className="h-5 w-5" />
                </span>
                <h3 className="text-xl font-bold">{p.name}</h3>
              </div>
              <div className="mt-5">
                <p className="text-3xl font-extrabold">{p.price}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {p.priceNote}
                </p>
              </div>
              <ul className="mt-6 space-y-3 flex-1">
                {p.features.map((feat) => (
                  <li key={feat} className="flex items-start gap-2 text-sm">
                    <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                    <span className="text-muted-foreground">{feat}</span>
                  </li>
                ))}
              </ul>
              <Link
                to={p.to}
                className={`mt-7 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-semibold transition-all ${
                  p.highlight
                    ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/25 hover:scale-[1.02]'
                    : 'border border-border hover:bg-muted'
                }`}
              >
                {p.cta}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ===================== CTA FINAL ===================== */}
      <section className="max-w-6xl mx-auto px-4 pb-24">
        <div className="rounded-3xl bg-primary text-primary-foreground text-center px-6 py-14">
          <h2 className="text-3xl md:text-4xl font-bold">
            Toma el control hoy mismo
          </h2>
          <p className="mt-4 text-primary-foreground/80 max-w-xl mx-auto">
            Crea tu cuenta gratis y obtén {PROMO_TRIAL_DAYS} días de PRO sin
            costo. Sin tarjeta, sin compromisos.
          </p>
          <Link
            to="/registro"
            className="mt-8 inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-background text-foreground font-semibold hover:scale-[1.02] active:scale-[0.98] transition-transform"
          >
            Crear mi cuenta gratis
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* ===================== FOOTER ===================== */}
      <footer className="border-t border-border">
        <div className="max-w-6xl mx-auto px-4 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-2 font-semibold text-foreground">
            <Wallet className="h-5 w-5 text-primary" />
            Gestión de Gastos
          </span>
          <span>
            © {new Date().getFullYear()} · Hecho para ordenar tu plata.
          </span>
          <div className="flex gap-4">
            <Link to="/login" className="hover:text-foreground">
              Iniciar sesión
            </Link>
            <Link to="/registro" className="hover:text-foreground">
              Crear cuenta
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
