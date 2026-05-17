# CLAUDE.md - Especificaciones Técnicas

> Documentación esencial para trabajar en el proyecto de Gestión de Gastos Personales.
> **Para detalle extenso ver:** `docs/components.md`, `docs/testing.md`, `CHANGELOG.md`

**Versión**: 2.7.1 · **Última actualización**: 2026-05-17

---

## 🎯 Visión General

Aplicación web React para gestionar gastos personales con análisis IA (Claude de Anthropic). Multi-cuenta, multi-moneda (PEN/USD), PWA instalable, presupuestos por categoría y general, gastos y transferencias programadas (recurrentes con soporte cross-currency), notificaciones in-app de fallos del cron, historial de ejecuciones, asistente IA conversacional.

---

## 🛠️ Stack

| Capa | Tecnologías |
|---|---|
| Frontend | React 19, TypeScript 5.9 (strict), Vite 7, React Router 7 |
| Estilos | Tailwind CSS **3.4** (NO v4 — incompatible) |
| Backend / Auth | Firebase 12 (Auth + Firestore), backend NestJS propio (`http://localhost:3000/api`) |
| IA | `@anthropic-ai/sdk` vía backend (NO desde el frontend) |
| PWA | vite-plugin-pwa, workbox-window |
| Librerías | recharts, xlsx, zod, date-fns, framer-motion, react-hot-toast, lucide-react |
| Testing | Vitest 4, Testing Library, MSW, **Playwright 1.57** (E2E principal), Cypress (legacy) |

---

## 🏗️ Arquitectura

### Flujo de datos

```
Usuario → Componente → Hook → Servicio → Firebase / Backend API
                       ↓
                    Context (estado global)
```

### Estructura de carpetas

```
src/
├── components/     # UI por feature (auth, dashboard, gastos, importar,
│                   #   asistente, presupuestos, programados, config, layout, common,
│                   #   compartidos [incl. NotificacionesSistemaPanel],
│                   #   graficos [módulo Métricas PRO], user)
├── context/        # AuthContext, ThemeContext
├── hooks/          # useGastos, usePresupuestos, useAssistant, usePWAInstall,
│                   #   useGastosProgramados, useTransferenciasProgramadas,
│                   #   useNotificaciones
├── services/       # firebase, ai, config, excel, import,
│                   #   programados, transferencias-programadas, notificaciones
├── types/          # TypeScript types (incl. notificaciones, programados)
├── utils/          # formatters, calculations, validators, tagsSugeridos
├── mocks/          # Test mocks
└── tests/          # Test setup
```

### Reglas arquitectónicas (Opción B multi-cuenta)
- **Mutations vía backend** (atomicidad), **reads vía `onSnapshot`** directo a Firestore.
- Cada cuenta ES su propio presupuesto general; suma de saldos = techo del mes.
- Sub-reservas opcionales por categoría.
- Income vs Depositar son operaciones distintas — NO unificar en tabs.
- **Programados (`gastosProgramados`, `transferenciasProgramadas`)**: write **bloqueado al cliente** desde reglas Firestore. Solo el backend (Admin SDK) escribe. En local el cron de `@nestjs/schedule` corre cada 30 min; en prod (Vercel serverless) un workflow de GitHub Actions golpea `POST /api/programados/cron/run` cada 15 min (autenticado con `CRON_SECRET`). Lock idempotente en `ejecucionesProgramadas/{programadaId}_{fechaISO}` previene duplicados aunque ambos disparen.
- **Transferencias cross-currency**: el doc programado guarda `monedaDestino` + `exchangeRate` (o `usarTasaActual: true` → API Frankfurter al ejecutar). `amountConverted` se calcula en cada ejecución, no se persiste en el doc programado.
- **Notificaciones (`notificaciones`)**: el cron crea docs cuando hay fallos. Cliente puede READ y UPDATE solo `leida` (regla `affectedKeys().hasOnly(['leida'])`). DELETE permitido al dueño.
- **Métricas (`/metricas`, módulo PRO)**: read-only analytics vía backend (`/api/analytics/*`), **PRO-gated** server-side (`ProGuard` lee `users/{uid}.role`). No-pro ve teaser y nunca llama al backend. IA cacheada 24h (control de costo). Ver [`docs/analytics-backend.md`](./docs/analytics-backend.md).

---

## 📐 Sistema de Tipos

### Filosofía
- `strict: true`. **No usar `any`** (preferir `unknown`).
- Tipado explícito en parámetros y retornos.
- Interfaces para objetos y contratos; types para uniones literales.
- `as const` + indexed access para tipos literales seguros.
- Separar tipos Firestore (con `Timestamp`) de tipos App (con `Date`); convertir con helpers (`firestoreToGasto`).

### Tipos clave

```typescript
// Monedas
export const MONEDAS = ['PEN', 'USD'] as const;
export type Moneda = (typeof MONEDAS)[number];

// Categorías
export const CATEGORIAS_GASTO = [
  'alimentacion','transporte','entretenimiento','salud','servicios',
  'compras','educacion','vivienda','otros',
] as const;
export type CategoriaGasto = (typeof CATEGORIAS_GASTO)[number];

// Presupuesto general (categoría especial)
export const CATEGORIA_GENERAL = 'general' as const;
export type CategoriaGastoOGeneral = CategoriaGasto | typeof CATEGORIA_GENERAL;

interface Gasto {
  id: string; userId: string; fecha: Date;
  categoria: CategoriaGasto; subcategoria?: string;
  monto: number; moneda: Moneda;
  descripcion: string; metodoPago: MetodoPago;
  tags?: string[]; recurrente?: boolean;
  createdAt: Date; updatedAt: Date;
}
```

---

## ⚙️ Configuraciones clave

### Path aliases (`tsconfig.app.json` + `vite.config.ts`)
```
@/*           → ./src/*
@components/* → ./src/components/*
@hooks/*      → ./src/hooks/*
@context/*    → ./src/context/*
@services/*   → ./src/services/*
@app-types/*  → ./src/types/*
@utils/*      → ./src/utils/*
@mocks/*      → ./src/mocks/*
```

### Tailwind
- `darkMode: 'class'` (control manual)
- CSS variables HSL en `src/index.css` (`:root` + `.dark`) para temas dinámicos.

### PWA
- `registerType: 'autoUpdate'`
- Workbox: `CacheFirst` para fonts; `NetworkFirst` para Firebase Storage.

---

## 🎨 Convenciones

### Nomenclatura
- **Componentes**: `PascalCase.tsx` (`FormularioGasto.tsx`)
- **Hooks**: `useXxx.ts` (camelCase)
- **Utils/Tipos**: `camelCase.ts`
- **Tests**: `*.test.ts(x)`
- **Variables/funciones**: `camelCase`; **constantes**: `UPPER_SNAKE_CASE`; **arrays const**: `PascalCase as const`
- **Props interface**: `<Componente>Props`
- Idioma: identificadores en español (proyecto en español).

### Estructura de componente
1. Hooks de React → 2. Custom hooks → 3. Helpers → 4. `useEffect` → 5. Early returns → 6. Render

### Async / Errores
```typescript
// Usar async/await, NO .then/.catch
try {
  await service.create(data);
  toast.success('Éxito');
} catch (error) {
  const msg = error instanceof Error ? error.message : 'Error desconocido';
  toast.error(msg);
  throw error;
}
```

---

## 🔌 Servicios

| Servicio | Responsabilidad |
|---|---|
| `services/firebase.ts` | Auth, gastos, presupuestos. Convierte Timestamp ↔ Date. `serverTimestamp()` para fechas |
| `services/ai.ts` | Llama backend (`/api`). Conversaciones persistentes, validación 1000 chars. Auth por Firebase ID Token |
| `services/config.ts` | CRUD dinámico de categorías, subcategorías, métodos de pago, monedas |
| `services/excel.ts` | Import/Export Excel. Validación Zod, normalización de categorías, vista previa |
| `services/programados.ts` | CRUD + pause/resume + `findEjecuciones` de gastos programados (`/api/programados/gastos`) |
| `services/transferencias-programadas.ts` | CRUD + pause/resume + `findEjecuciones` de transferencias (`/api/programados/transferencias`). Soporta cross-currency (`monedaDestino`, `exchangeRate`, `usarTasaActual`) |
| `services/notificaciones.ts` | List, marcar leída, marcar todas leídas, eliminar (`/api/notificaciones`). Read principal vía `onSnapshot` desde el hook |
| `services/analytics.ts` | Métricas PRO (`/api/analytics/*`): `getSummary`, `getAiInsights`, `askAi`, `getRoast`, `exportMetricas`. `ProRequiredError` mapea el 403 → teaser |
| `services/aiUsageAdmin.ts` | Lectura admin de consumo IA: `getAppMonthly`, `getUserMonthly`, `getTopUsers` (rollups `aiUsage*`). Solo lectura; escribe el Admin SDK del backend/functions |
| `services/aiUsage.ts` | `getMyUsage()` → `GET /api/ai-usage/me` (snapshot de cuota del usuario, Fase 2). `analytics.ts` lanza `QuotaExceededError` en 429 de cuota |

---

## 🔄 Estado y Contextos

| Context | Provee |
|---|---|
| `AuthContext` | `usuario`, `login`, `loginConGoogle`, `registrar`, `logout`, `actualizarUsuario` |
| `ThemeContext` | `tema` (`light`/`dark`/`system`), `temaEfectivo`, `toggleTema`, `toastInvertido`. Persiste en `localStorage`. Aliases en/es para flexibilidad |

Patrón: `Context + Provider + custom hook` que lanza error si se usa fuera del Provider.

---

## 🪝 Hooks Personalizados

| Hook | Función |
|---|---|
| `useGastos` | CRUD + filtrar gastos. Carga inicial, operaciones optimistas, toasts |
| `usePresupuestos` | CRUD presupuestos mensuales |
| `useAssistant` | Conversaciones IA: cargar/seleccionar/crear/renombrar/eliminar, mensajes optimistas |
| `usePWAInstall` | Escucha `beforeinstallprompt`, expone `install()` |
| `useGastosProgramados` | onSnapshot a `gastosProgramados` + mutations vía backend. Pausar/reanudar |
| `useTransferenciasProgramadas` | onSnapshot a `transferenciasProgramadas` + mutations vía backend (incl. cross-currency) |
| `useNotificaciones` | onSnapshot a `notificaciones` + `marcarLeida`/`marcarTodasLeidas`/`eliminar`. Expone `noLeidasCount` para el badge |
| `useMetricas` | Filtros + `GET /analytics/summary`. Caché 10 min memoria+localStorage, stale-while-revalidate. Solo PRO llama |
| `useMetricasIA` | `POST /analytics/ai-insights` (caché 24h) + `ask()` contextual (`/ai-ask`). Solo PRO; no llama si sin datos |
| `useMetricasRoast` | `POST /analytics/ai-roast` (roast compartible). Disparo manual, caché por periodo, solo PRO. Render → PNG → WhatsApp (`RoastCard`) |

---

## 🛠️ Utilidades

```typescript
// formatters.ts
formatearMoneda(cantidad, moneda='USD', locale='es-ES'): string
formatearFechaCorta(fecha): string         // DD/MM/YYYY
formatearFechaLarga(fecha): string         // DD de MMMM de YYYY
formatearPorcentaje(valor, decimales=1): string
formatearMesKey(fecha): string             // YYYY-MM

// calculations.ts
calcularTotalGastos / calcularEstadisticasPeriodo
compararPeriodos / detectarTendencias
detectarGastosInusuales(gastos)            // Outliers con desviación 2σ
generarRecomendaciones(gastos, presupuestos)

// validators.ts → schemas Zod (gastoFormSchema, etc.)
```

Decisión: usar `Intl` nativo (sin librerías de formato extra).

---

## 🔒 Seguridad

- **Firestore rules**: `request.auth.uid == userId` / `resource.data.userId == request.auth.uid`. Users solo acceden a su propia data.
- **Validación**: Zod en frontend + sanitización (`sanitizarInput`: trim, strip HTML, max 500 chars).
- **Secrets**: NUNCA en código. Solo `import.meta.env.VITE_*`.

### Variables de entorno (`.env`)
```bash
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_API_BASE_URL=http://localhost:3000/api
```

---

## ⚡ Performance

- **Code splitting**: `lazy()` + `<Suspense>` por ruta.
- **Memoización**: `useMemo` para cálculos costosos; `useCallback` para funciones en deps.
- **Targets**: FCP < 1.5s · TTI < 3.5s · Bundle < 500KB gzip.

---

## 🧪 Testing — resumen

- Vitest para unit/components, **Playwright** para E2E (multi-navegador + responsive).
- Coverage objetivo > 80% en utils.
- **Detalle completo en `docs/testing.md`**.

---

## 🎨 Componentes Comunes — resumen

`src/components/common/`: `Button`, `Input` (4 variantes), `TextArea`, `Select`, `InputGroup`/`InputRow`, `Switch`, `Modal`, `ConfirmationModal`, `CustomLoader`, `LoadingSpinner`, `ErrorAlert`, `InstallPWA`, `BudgetMonitor`, `ProBadge` (badge PRO unificado de la app).

**Detalle completo, props y ejemplos en `docs/components.md`**.

---

## 🚀 Scripts

```bash
# Dev / build
npm run dev / build / preview

# Calidad
npm run lint / lint:fix / format / format:check / type-check
npm run check               # type-check + lint + tests

# Tests
npm run test / test:run / test:coverage
npm run test:e2e[:ui|:headed|:debug|:report|:codegen]
npm run test:cypress        # legacy

# Utilidades
npm run generate:icons / clean / reinstall
```

---

## 🚢 Deployment

- **Vercel**: `vercel --prod` (env vars en dashboard)
- **Firebase Hosting**: `npm run build && firebase deploy`
- **Netlify**: `netlify deploy --prod --dir=dist`

---

## 📝 Decisiones técnicas (resumen)

| Decisión | Razón |
|---|---|
| TypeScript estricto | Bugs en compile-time, mejor DX |
| Path aliases | Imports limpios, refactor fácil |
| Context API (no Zustand) | Suficiente, menor bundle |
| Recharts | Declarativo, integra bien con React |
| date-fns | Tree-shakeable; Moment deprecated |
| Zod | Tipos auto-generados desde schema |
| Vitest | Más rápido, integra con Vite |
| MSW | Realista, browser + Node |
| Playwright sobre Cypress | Paralelo, multi-browser real, menos flaky |

---

## 🔄 Flujos principales

### Crear Gasto
`Form → Zod → useGastos.crear → gastosService.crear → Firestore → estado local → toast`

### Importar Excel
`File → excelService.importar → XLSX → validar Zod → normalizar → preview → batch create → reload`

### Chat IA
`Mensaje → useAssistant.sendMessage → (crear conversación si nueva) → mensaje optimista → POST /chat/conversations/:id/messages → backend obtiene contexto + llama Anthropic → respuesta → update UI`

---

## 📚 Documentación adicional

- [`CHANGELOG.md`](./CHANGELOG.md) — historial de versiones
- [`docs/components.md`](./docs/components.md) — componentes comunes (props, ejemplos, patrones)
- [`docs/testing.md`](./docs/testing.md) — Vitest setup, Playwright config, ejemplos
- [`docs/programados-backend.md`](./docs/programados-backend.md) — contrato backend completo de programados: endpoints, modelo Firestore, cron en local + prod (GH Actions), idempotencia, notificaciones, auditoría, cross-currency
- [`docs/analytics-backend.md`](./docs/analytics-backend.md) — contrato backend del módulo de Métricas PRO: endpoints `/api/analytics/*`, ProGuard, modelos IA por env, control de costo
- [`docs/ai-usage.md`](./docs/ai-usage.md) — consumo de tokens IA: modelo de datos multi-repo, clasificación app/user, panel admin, y flujo recomendado de cuotas (Fase 2)
- [`markdown/FLOWS.md`](./markdown/FLOWS.md) — mapa de módulos y dónde "vive" cada operación (API vs Firestore directo)

---

## 💡 Al modificar

1. Verificar tipos afectados.
2. Actualizar tests.
3. Probar localmente (`npm run check`).
4. Si cambia decisión técnica → actualizar este `CLAUDE.md` o el doc correspondiente.
5. Si añades feature: tipos → servicio → hook → componente → tests.
