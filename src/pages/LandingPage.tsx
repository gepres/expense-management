/**
 * LandingPage — página pública de marketing (ruta `/` sin sesión).
 *
 * Promociona el aplicativo completo: Web/PWA + Bot de WhatsApp + Widget Windows.
 * Lista features, ventajas PRO y planes. Usa tokens HSL del tema → respeta
 * light/dark automáticamente.
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
  MessageCircle,
  Mic,
  ScanLine,
  Monitor,
  Bell,
  Brain,
  Globe,
  Receipt,
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
    icon: Mic,
    title: 'Registra por voz, foto o texto',
    desc: 'Habla, sube una foto del ticket o escribe — la IA en español lo entiende y lo registra por ti.',
  },
  {
    icon: ScanLine,
    title: 'OCR de comprobantes y Yape/Plin',
    desc: 'Foto al voucher y listo: monto, fecha, método de pago y categoría detectados automáticamente.',
  },
  {
    icon: Brain,
    title: 'Asistente que aprende de ti',
    desc: 'Cada corrección que haces afina futuras clasificaciones. Mientras más lo usas, más acertado.',
  },
  {
    icon: TrendingUp,
    title: 'Métricas PRO con insights IA',
    desc: 'Flujo de caja, presupuesto vs real, tendencias y recomendaciones generadas por IA.',
  },
  {
    icon: FileSpreadsheet,
    title: 'Importación masiva',
    desc: 'Sube Excel, CSV o JSON y deja que la IA categorice y limpie todo por ti.',
  },
  {
    icon: Users,
    title: 'Gastos compartidos',
    desc: 'Grupos para repartir cuentas con amigos, pareja o roommates. Foto del comprobante + autocompletado IA.',
  },
  {
    icon: Bell,
    title: 'Notificaciones inteligentes',
    desc: 'Te avisamos si una transferencia programada falló o si tu presupuesto está al tope.',
  },
  {
    icon: Smartphone,
    title: 'PWA instalable',
    desc: 'Instálala como app en tu celular o escritorio. Rápida, offline-ready y siempre disponible.',
  },
  {
    icon: ShieldCheck,
    title: 'Tus datos, seguros',
    desc: 'Cada usuario solo accede a su información. Reglas estrictas, auth con Google o correo.',
  },
];

type Channel = {
  icon: typeof Wallet;
  badge: string;
  badgeColor: string;
  title: string;
  desc: string;
  bullets: string[];
};

const CHANNELS: Channel[] = [
  {
    icon: Globe,
    badge: 'Web · iOS · Android',
    badgeColor:
      'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300',
    title: 'App web y PWA',
    desc: 'Tu tablero completo: dashboard, métricas, compartidos, programados, importar y configurar todo. Instálala en tu celular y úsala como una app nativa.',
    bullets: [
      'Dashboard con resumen del mes',
      'Métricas PRO con IA conversacional',
      'Funciona offline-ready',
    ],
  },
  {
    icon: MessageCircle,
    badge: 'Bot por WhatsApp',
    badgeColor:
      'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300',
    title: 'Registra desde WhatsApp',
    desc: 'Manda un mensaje, una foto del voucher o una nota de voz. El bot interpreta y registra el gasto en segundos, vinculado a tu cuenta.',
    bullets: [
      'Texto, imagen (Yape/Plin/ticket) o audio',
      'Consulta saldos y resumen del día',
      'Confirma o corrige con un “sí” / “no”',
    ],
  },
  {
    icon: Monitor,
    badge: 'Widget para Windows',
    badgeColor:
      'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300',
    title: 'Widget en tu escritorio',
    desc: 'App nativa para Windows que vive en la barra de tareas. Mira tus saldos y el gasto del día sin abrir el navegador.',
    bullets: [
      'Resumen Hoy / Ayer / Semana / Mes',
      'Saldos por cuenta al instante',
      'Vinculación 1-click desde la web',
    ],
  },
];

const PRO_ADVANTAGES = [
  { icon: TrendingUp, text: 'Módulo de Métricas con análisis e insights de IA' },
  { icon: Brain, text: 'Pregunta libre a la IA sobre tus finanzas' },
  { icon: FileSpreadsheet, text: 'Importación masiva desde Excel / CSV / JSON' },
  { icon: Repeat, text: 'Programados ilimitados (incl. cross-currency PEN↔USD)' },
  { icon: Receipt, text: 'Foto del comprobante + autocompletado IA en compartidos' },
  { icon: Zap, text: 'Cuota de IA ampliada para asistente, voz y visión' },
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
      'Bot de WhatsApp + Widget Windows',
      'Presupuestos por categoría',
      'Asistente IA con cuota básica',
      'PWA instalable + gastos compartidos',
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
              Registra gastos por <strong>WhatsApp</strong>, voz, foto del
              ticket o desde la app. Multi-cuenta, multi-moneda, presupuestos,
              programados y analítica con IA — y un{' '}
              <strong>widget para Windows</strong> que vive en tu escritorio.
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

            {/* Mini-stats / trust row */}
            <div className="mt-8 grid grid-cols-3 gap-3 max-w-md">
              <div className="rounded-xl border border-border bg-card px-3 py-2.5 text-center">
                <p className="text-[11px] text-muted-foreground">Canales</p>
                <p className="text-sm font-bold mt-0.5">Web · WSP · Win</p>
              </div>
              <div className="rounded-xl border border-border bg-card px-3 py-2.5 text-center">
                <p className="text-[11px] text-muted-foreground">Monedas</p>
                <p className="text-sm font-bold mt-0.5">PEN · USD</p>
              </div>
              <div className="rounded-xl border border-border bg-card px-3 py-2.5 text-center">
                <p className="text-[11px] text-muted-foreground">IA</p>
                <p className="text-sm font-bold mt-0.5">Claude · Voz</p>
              </div>
            </div>
          </motion.div>

          {/* Mock visual — chat WhatsApp */}
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

              {/* Mini chat WhatsApp */}
              <div className="mt-6 space-y-2">
                <div className="flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/5 px-3 py-2">
                  <MessageCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <p className="text-xs text-muted-foreground">
                    <span className="text-foreground font-medium">
                      “Gasté 45 soles en almuerzo”
                    </span>{' '}
                    → Alimentación 🍽️
                  </p>
                </div>
                <div className="flex items-center gap-2 rounded-xl border border-primary/30 bg-primary/5 px-3 py-2">
                  <Mic className="h-4 w-4 text-primary shrink-0" />
                  <p className="text-xs text-muted-foreground">
                    <span className="text-foreground font-medium">
                      Audio · 0:04
                    </span>{' '}
                    → "65 en gasolina" registrado ⛽
                  </p>
                </div>
                <div className="flex items-center gap-2 rounded-xl border border-amber-500/30 bg-amber-500/5 px-3 py-2">
                  <ScanLine className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0" />
                  <p className="text-xs text-muted-foreground">
                    <span className="text-foreground font-medium">
                      Foto Yape
                    </span>{' '}
                    → S/ 28.00 a Sodimac detectado 🧾
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ===================== CANALES (3 plataformas) ===================== */}
      <section className="max-w-6xl mx-auto px-4 pb-4">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-4">
            <Layers className="h-3.5 w-3.5" />
            Una cuenta · tres formas de usarla
          </span>
          <h2 className="text-3xl md:text-4xl font-bold">
            Donde estés, registra tus gastos
          </h2>
          <p className="mt-4 text-muted-foreground">
            Tu información se sincroniza al instante entre todos los canales.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-5">
          {CHANNELS.map((c, i) => (
            <motion.div
              key={c.title}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: '-60px' }}
              variants={fadeUp}
              transition={{ duration: 0.45, delay: i * 0.08 }}
              className="relative rounded-2xl border border-border bg-card p-6 hover:border-primary/40 hover:shadow-xl transition-all flex flex-col"
            >
              <span
                className={`inline-flex w-fit items-center gap-2 px-2.5 py-1 rounded-full text-[11px] font-semibold ${c.badgeColor}`}
              >
                {c.badge}
              </span>
              <div className="mt-4 h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                <c.icon className="h-6 w-6" />
              </div>
              <h3 className="mt-4 font-bold text-lg">{c.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{c.desc}</p>
              <ul className="mt-4 space-y-2 flex-1">
                {c.bullets.map((b) => (
                  <li
                    key={b}
                    className="flex items-start gap-2 text-sm text-muted-foreground"
                  >
                    <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ===================== WHATSAPP DEEP DIVE ===================== */}
      <section className="max-w-6xl mx-auto px-4 py-20">
        <div className="relative overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-emerald-500/10 via-card to-card p-8 md:p-12">
          <div
            aria-hidden
            className="pointer-events-none absolute -left-24 -bottom-24 h-72 w-72 rounded-full bg-emerald-500/20 blur-3xl"
          />
          <div className="relative grid lg:grid-cols-2 gap-10 items-center">
            <div>
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 text-xs font-semibold mb-4">
                <MessageCircle className="h-3.5 w-3.5" />
                Nuevo · Bot por WhatsApp
              </span>
              <h2 className="text-3xl md:text-4xl font-bold">
                Mándale un mensaje y listo
              </h2>
              <p className="mt-4 text-muted-foreground">
                El bot entiende español peruano, soles, dólares, Yape y Plin.
                Registra gastos, consulta saldos y te confirma cada operación —
                todo desde la conversación.
              </p>
              <ul className="mt-6 space-y-3">
                {[
                  {
                    icon: MessageCircle,
                    t: 'Texto natural',
                    d: '“Pagué 18 en el taxi” o “almuerzo con Pao 45”',
                  },
                  {
                    icon: ScanLine,
                    t: 'Foto del voucher',
                    d: 'Yape, Plin, ticket o pantalla — IA extrae el monto',
                  },
                  {
                    icon: Mic,
                    t: 'Nota de voz',
                    d: 'Habla y la IA lo registra. Útil cuando manejas',
                  },
                  {
                    icon: Brain,
                    t: 'Aprende de ti',
                    d: 'Cada corrección afina la siguiente clasificación',
                  },
                ].map((b) => (
                  <li key={b.t} className="flex items-start gap-3">
                    <span className="h-9 w-9 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                      <b.icon className="h-4 w-4" />
                    </span>
                    <div>
                      <p className="font-semibold text-sm">{b.t}</p>
                      <p className="text-sm text-muted-foreground">{b.d}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {/* Mock chat WhatsApp más grande */}
            <div className="rounded-2xl border border-border bg-background/60 p-4 shadow-xl">
              <div className="flex items-center gap-2 pb-3 border-b border-border">
                <span className="h-9 w-9 rounded-full bg-emerald-500 flex items-center justify-center text-white">
                  <Bot className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-sm font-semibold">Gastos · Bot</p>
                  <p className="text-[11px] text-emerald-600 dark:text-emerald-400">
                    en línea
                  </p>
                </div>
              </div>
              <div className="mt-4 space-y-3">
                <div className="ml-auto max-w-[80%] rounded-2xl rounded-br-sm bg-emerald-500 text-white px-3 py-2 text-sm">
                  almuerzo 32 soles en menú
                </div>
                <div className="max-w-[85%] rounded-2xl rounded-bl-sm bg-muted px-3 py-2 text-sm">
                  ✅ Registrado <strong>S/ 32.00</strong> · Alimentación · BCP
                  <br />
                  <span className="text-xs text-muted-foreground">
                    Saldo actualizado: S/ 7,168.00
                  </span>
                </div>
                <div className="ml-auto max-w-[80%] rounded-2xl rounded-br-sm bg-emerald-500 text-white px-3 py-2 text-sm">
                  cuánto gasté hoy?
                </div>
                <div className="max-w-[85%] rounded-2xl rounded-bl-sm bg-muted px-3 py-2 text-sm">
                  Hoy llevas <strong>S/ 92.50</strong> en 3 gastos:
                  <br />
                  🍽️ Alimentación · S/ 32.00
                  <br />
                  🚕 Transporte · S/ 18.00
                  <br />
                  🛒 Compras · S/ 42.50
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===================== FEATURES GRID ===================== */}
      <section className="max-w-6xl mx-auto px-4 py-10">
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

      {/* ===================== WIDGET WINDOWS ===================== */}
      <section className="max-w-6xl mx-auto px-4 py-10">
        <div className="relative overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-amber-500/10 via-card to-card p-8 md:p-12">
          <div
            aria-hidden
            className="pointer-events-none absolute -right-20 top-1/2 h-72 w-72 rounded-full bg-amber-500/20 blur-3xl"
          />
          <div className="relative grid lg:grid-cols-2 gap-10 items-center">
            {/* Mock widget */}
            <div className="order-2 lg:order-1">
              <div className="rounded-2xl border border-border bg-card shadow-2xl p-5 max-w-sm mx-auto">
                <div className="flex items-center justify-between pb-3 border-b border-border">
                  <span className="flex items-center gap-2 text-sm font-semibold">
                    <Wallet className="h-4 w-4 text-primary" />
                    Gastos
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    actualizado · hace 1m
                  </span>
                </div>
                <div className="mt-4">
                  <p className="text-[11px] text-muted-foreground">
                    Gasto del día
                  </p>
                  <p className="text-2xl font-bold mt-0.5">S/ 92.50</p>
                </div>
                <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                  {[
                    { l: 'Ayer', v: 'S/ 145' },
                    { l: 'Semana', v: 'S/ 612' },
                    { l: 'Mes', v: 'S/ 2.4k' },
                  ].map((s) => (
                    <div
                      key={s.l}
                      className="rounded-lg bg-muted/50 px-2 py-2"
                    >
                      <p className="text-[10px] text-muted-foreground">
                        {s.l}
                      </p>
                      <p className="text-sm font-semibold">{s.v}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-4 space-y-2">
                  {[
                    { l: 'BCP', v: 'S/ 7,168', c: 'bg-blue-500' },
                    { l: 'Efectivo', v: 'S/ 1,150', c: 'bg-emerald-500' },
                  ].map((r) => (
                    <div
                      key={r.l}
                      className="flex items-center justify-between rounded-lg bg-muted/50 px-3 py-1.5 text-xs"
                    >
                      <span className="flex items-center gap-2">
                        <span
                          className={`h-2 w-2 rounded-full ${r.c}`}
                        />
                        {r.l}
                      </span>
                      <span className="font-semibold">{r.v}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="order-1 lg:order-2">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 text-xs font-semibold mb-4">
                <Monitor className="h-3.5 w-3.5" />
                Widget para Windows
              </span>
              <h2 className="text-3xl md:text-4xl font-bold">
                Tus saldos siempre a la vista
              </h2>
              <p className="mt-4 text-muted-foreground">
                Una app nativa de Windows que vive en la barra del sistema.
                Abrila con un click, revisa cuánto llevas gastado y tus saldos
                por cuenta — sin abrir el navegador.
              </p>
              <ul className="mt-6 space-y-2">
                {[
                  'Vinculación 1-click: escaneás un QR desde la web y listo',
                  'Resumen Hoy / Ayer / Semana / Mes',
                  'Saldos por cuenta en tiempo real',
                  'Liviano · arranca con Windows · vive en el tray',
                ].map((b) => (
                  <li
                    key={b}
                    className="flex items-start gap-2 text-sm text-muted-foreground"
                  >
                    <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ===================== VENTAJAS PRO ===================== */}
      <section className="max-w-6xl mx-auto px-4 py-10">
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
      <section className="max-w-6xl mx-auto px-4 py-20">
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
