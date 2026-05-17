# Changelog

Historial de versiones del proyecto Gastos.

---

## v2.7.1 (2026-05-17)
**Fix/UX**: Copiar comando WhatsApp + rediseño Métricas mobile

- **WhatsApp Bot → Cómo usar**: el comando `join <código>` ahora tiene botón de **copiar** (icono, con feedback ✓).
- **Métricas mobile · Resumen**: los KPIs pasan de carrusel horizontal (scroll) a **grid 2 columnas** — visibles de un vistazo, sin scroll.
- **Métricas mobile · tabs**: nueva barra de tabs **icono + label, ancho parejo, sin scroll** (Resumen · Gráficos · Categorías · Rankings · Roast).
- **Nuevo tab "Gráficos"**: se movió el **flujo de caja** (es un gráfico) ahí y se agregó un **gráfico de top categorías** (barra horizontal) para acompañarlo. Resumen queda con KPIs + análisis IA.

---

## v2.7.0 (2026-05-17)
**Release**: Consumo de tokens IA — enforcement de cuotas (Fase 2)

> Multi-repo. Sigue a v2.6.0 (tracking). Decisiones: presupuesto de tokens/mes por rol (standard < pro < admin∞) + sub-límite de imágenes; bloqueo duro al 100%, aviso al 80%; todo configurable por env (`AI_QUOTA_*`).

### Backend (`gastos-backend`)
- `config/ai-quota.config.ts` (límites por rol vía env).
- `QuotaService` (`ai-usage/quota.service.ts`): `assertWithinQuota()` lee rol + rollup mensual (O(1)) y lanza **429** (`AiQuotaExceeded` / `AiImageQuotaExceeded`, con `resetAt`) si excede. admin = ilimitado; `scope:'app'` no descuenta.
- Enforcement antes de cada llamada `scope:'user'`: asistente (chat), métricas IA (insights/ask/roast/**imagen** con sub-límite), voz.
- **`GET /api/ai-usage/me`** → snapshot de cuota del usuario.

### Firebase Functions (`gastos-firebase-functions`)
- `quota.service.ts` `checkQuota()` + `aiQuotaBlocked()` antes de los 3 caminos con IA del bot (imagen/audio/parse de texto por LLM). Si excede → responde por WhatsApp con la fecha de reinicio y cierra el item sin retry. Comandos/queries/regex **no** se bloquean. Best-effort: si falla la lectura, no bloquea.

### Frontend (`gastos`)
- **`ConsumoIACard`** en Configuración → Perfil: barra usado/límite/%, fecha de reinicio, verde/ámbar(aviso)/rojo(bloqueado); admin = ilimitado; sub-línea de imágenes. Lee `GET /api/ai-usage/me`.
- 429 de cuota mapeado a `QuotaExceededError` (mensaje claro del backend con fecha de reset) en métricas y asistente — ya no muestra el genérico de throttle.

### Importante
- Define los `AI_QUOTA_*` en el `.env` de backend (y functions si querés valores propios); si no, usa los defaults del código. Ver [`docs/ai-usage.md`](./docs/ai-usage.md) §Fase 2.

---

## v2.6.1 (2026-05-17)
**Fix**: Análisis IA mobile + instrucción Sandbox WhatsApp

- **Métricas mobile**: el tab Resumen ahora renderiza el `IAPanel` completo (igual que escritorio: resumen, recomendaciones, observaciones, anomalías IA + outliers 2σ, selector de foco y mini-chat contextual). Antes solo mostraba un resumen de texto recortado.
- **WhatsApp Bot → Cómo usar**: nuevo "Paso 1: Conéctate al bot" con el comando `join <código>` al número del Sandbox de Twilio (faltaba; sin ese paso el bot no recibe mensajes). Código configurable por `VITE_TWILIO_SANDBOX_KEYWORD` (fallback a instrucción genérica).

---

## v2.6.0 (2026-05-17)
**Release**: Consumo de tokens IA — tracking multi-repo + Panel Admin (Fase 1)

> Feature multi-repo (`gastos`, `gastos-backend`, `gastos-firebase-functions`). **Fase 1 = tracking + visualización**; el enforcement de cuotas es Fase 2 (pendiente de confirmación).

### Modelo de datos (Firestore, top-level, solo Admin SDK escribe)
- `aiUsageEvents/{id}` — auditoría, 1 por llamada IA.
- `aiUsageMonthly/{uid}_{YYYY-MM}` — rollup incremental por usuario (campo `userId`). **Top-level** a propósito: una subcolección de `users/` heredaría `write` del dueño y permitiría manipular su cuota.
- `aiUsageAppMonthly/{YYYY-MM}` — rollup del consumo autogenerado del aplicativo.

### Backend (`gastos-backend`)
- Módulo global `ai-usage` (`UsageService.record()` best-effort, nunca rompe el flujo IA). `config/ai-pricing.config.ts` (tarifas por env).
- `AnthropicService`/`OpenAiImageService` capturan `response.usage` y reciben `usageCtx{userId,scope,feature}` por call site.
- Clasificación `scope`: `user` (asistente, métricas IA, voz) cuenta para cuota Fase 2; `app` (autocategorize, import, etc.) solo se registra.

### Firebase Functions (`gastos-firebase-functions`)
- `recordUsage()` gemelo (mismo esquema, `repo:"functions"`). Captura `usage` de Anthropic y costo estimado de Whisper. Todo el bot WhatsApp = `scope:"user"` (uid vía `findByWhatsAppPhone`).

### Frontend (`gastos`)
- **Firestore rules + indexes** para las 3 colecciones (admin read; cliente sin write; dueño lee su rollup).
- **Panel de Administración rediseñado** con tabs: **Solicitudes PRO** · **Cuentas PRO** (rol, email, WhatsApp vinculado + número + fecha, consumo IA del mes, revocar PRO) · **Consumo IA** (app vs usuarios, top usuarios, desglose por feature/proveedor, navegación por mes).
- `authService`: `getProUsers`, `grantProRole`, `revokeProRole`, `getUsersByIds`. Servicio `services/aiUsageAdmin.ts`.

### Importante
- El tracking funciona vía Admin SDK (ignora rules). El **panel admin requiere** `firebase deploy --only firestore` (rules+indexes) — acción del usuario.
- Sin enforcement de cuotas aún (Fase 2). Ver [`docs/ai-usage.md`](./docs/ai-usage.md).

---

## v2.5.4 (2026-05-17)
**Release**: Métricas mobile = experiencia completa (uso principal)

- Rediseño de `MetricasMobile`: mobile deja de ser "no invasivo". Patrón **tabs segmentados** (Resumen · Categorías · Rankings · Roast) con filtro **sticky** (periodo + refresh + ProBadge) y render **diferido por tab** (performance + control de costo IA).
- **Resumen**: carrusel snap de KPIs + flujo de caja + resumen IA (texto).
- **Categorías**: donut con drilldown + tendencias + presupuesto vs real.
- **Rankings**: método de pago, top etiquetas, top gastos + lista de gastos inusuales (2σ).
- **Roast**: `RoastCard` completo (incluye ilustración IA).
- Reutiliza los paneles desktop ya probados (consistencia desktop↔mobile, menos código/riesgo). Eliminado el banner "ver en escritorio". **Desktop sin cambios.**
- Best practices aplicadas: divulgación progresiva, targets ≥44px, sin hover, scroll-snap, skeleton de carga, tabs para no abrumar.

---

## v2.5.3 (2026-05-16)
**Release**: Badge PRO homologado

- Nuevo componente común `<ProBadge/>` (degradado dorado `amber-500→amber-600`, corona + "PRO", tamaños `sm|md|lg`, `showText`).
- Reemplaza las 3 variantes que existían (degradado índigo/púrpura en Métricas+nav, chip ámbar en Perfil, corona ámbar suelta en Home) en: Dashboard, PerfilConfig, ProRequestButton, MetricasDesktop/Teaser/Mobile, MetricasPromoCard, Layout (nav "Más" + avatar) y MobileMenu (item + avatar). Apariencia consistente en toda la app.

---

## v2.5.2 (2026-05-16)
**Release**: Ilustración IA del roast (OpenAI) + fix export desktop

- **Ilustración IA**: nuevo `POST /api/analytics/ai-image` (PRO) → OpenAI `gpt-image-1` genera una ilustración cómica a partir del roast (sin texto en la imagen, family-friendly). Devuelve data URL PNG.
- **Opcional/env-gated**: módulo `openai` (`OpenAiImageService`, `OPENAI_API_KEY` + `OPENAI_IMAGE_MODEL`). Si no hay key → endpoint 400 y el flag `AnalyticsSummary.aiImageEnabled=false` oculta el botón en el cliente.
- Frontend: `RoastCard` con botón extra **"Ilustración IA ✨"** (junto a la tarjeta diseñada), imagen en caché de memoria, Descargar/Compartir propios. Disparo manual (control de costo).
- **Fix**: la descarga del roast en **desktop** salía mal — `html-to-image` con glitch de primer render + gradiente Tailwind (CSS vars) no capturado. Solución: espera `document.fonts.ready` + render de calentamiento (doble) + gradiente inline con colores explícitos en la tarjeta.

---

## v2.5.1 (2026-05-16)
**Release**: Roast financiero compartible (humor IA) en Métricas PRO

- Nuevo `POST /api/analytics/ai-roast` (PRO) → `AnthropicService.roastMetrics()` devuelve JSON `MetricsRoast` (título, índice de desastre 0-100, frases sarcásticas, veredicto, hashtags). Humor amigable español LatAm, tono `suave|picante`.
- Frontend: `useMetricasRoast` (disparo **manual**, caché por periodo, solo PRO), `RoastCard` (tarjeta estilo "Wrapped" exportable).
- **Compartir**: `compartirImagenNodo()` — Web Share API con archivo (móvil → WhatsApp directo) y fallback descarga PNG + `wa.me` con el texto (desktop).
- Integrado en `MetricasDesktop` y `MetricasMobile`. Control de costo: no consume IA hasta que el usuario pulsa "Generar".
- **Seam fase-2**: `MetricsRoast.imagenUrl` reservado para una futura ilustración por modelo de imágenes (OpenAI/Gemini) — hoy no se genera, el contrato no cambia al añadirla.

---

## v2.5.0 (2026-05-16)
**Release**: Módulo de Métricas PRO — gráficos, analytics e IA

### Nuevo módulo `/metricas` (PRO)
- Ruta lazy `/metricas` en el menú **"Más"** (desktop + mobile) con badge **PRO**.
- **Gating**: no-pro → teaser (preview borroso + beneficios + CTA `ProRequestButton`); PRO mobile → resumen no invasivo + "ver en escritorio"; PRO desktop → dashboard completo.
- Promo en Dashboard (`MetricasPromoCard`) solo para no-pro.

### Backend (`gastos-backend`)
- Modelos Anthropic actualizados a Claude 4.x modernos, configurables por env (`ANTHROPIC_MODEL`, nuevo `ANTHROPIC_ANALYTICS_MODEL`).
- `ProGuard` + `@RequirePro()`: autorización PRO leyendo `users/{uid}.role` de Firestore (no se confía en el cliente).
- Módulo `analytics`: `GET /api/analytics/summary` (KPIs/series sin IA), `POST /api/analytics/ai-insights` (análisis IA estructurado), `POST /api/analytics/ai-ask` (pregunta libre), `GET /api/analytics/export?format=excel|csv`. Todo PRO-gated.
- `AnthropicService.analyzeMetrics()` → JSON estructurado (`MetricsAiResult`).

### Frontend
- Tipos `types/metricas.ts` (espejo del contrato backend), `services/analytics.ts`, hooks `useMetricas` (caché 10 min, stale-while-revalidate) y `useMetricasIA` (caché 24h, solo PRO).
- **Flujos**: flujo de caja temporal (área acumulado + proyección / diario), categorías + drilldown subcategoría + comparativa mes-a-mes + tendencias, presupuesto vs real (gauge + barras), método de pago / top tags / top gastos.
- **Panel IA**: resumen narrativo, recomendaciones, observaciones, anomalías (IA + outliers 2σ), selector de foco y mini-chat contextual.
- **Export**: PNG del dashboard y reporte PDF paginado (`html-to-image` + `jspdf`); Excel/CSV vía backend.

### Cambios técnicos
- Deps frontend: `html-to-image`, `jspdf`.
- `vitest.config.ts`: añadido alias `@app-types` (faltaba; alineado con tsconfig/vite).
- Control de costo IA: caché 24h + refresh manual + no se llama si no hay transacciones; no-pro nunca dispara IA.
- Doc nuevo: [`docs/analytics-backend.md`](./docs/analytics-backend.md).

---

## v2.4.0 (2026-05-12)
**Release**: Notificaciones in-app, historial de ejecuciones, cross-currency en transferencias programadas, cron en producción

### Producción del cron
- El backend corre en Vercel serverless, donde `@nestjs/schedule` **no se ejecuta** (proceso no persistente).
- **Solución**: nuevo endpoint `POST /api/programados/cron/run` protegido por `CRON_SECRET` + **GitHub Actions** que lo dispara cada 15 min (`.github/workflows/cron-programados.yml` en el backend).
- En local, el `@Cron(EVERY_30_MINUTES)` sigue funcionando. El lock idempotente previene duplicados si ambos disparan.

### Notificaciones in-app
- Nueva colección Firestore `notificaciones` (solo el backend escribe; cliente puede leer, marcar leída y borrar).
- El cron genera notificación cuando hay `saldo_insuficiente`, `ejecucion_fallida`, `cuenta_destino_eliminada` o `fx_api_error`.
- **Frontend**: nuevo botón `AlertCircle` (ámbar) en navbar con badge de no leídas + panel deslizante (`NotificacionesSistemaPanel`).
- Tipos: `Notificacion`, `TipoNotificacion`, `NotificacionFirestore` (en `types/notificaciones.ts`).
- Servicio: `services/notificaciones.ts` + hook `useNotificaciones` (read reactivo vía `onSnapshot`).
- Backend: módulo `notificaciones/` con CRUD + `crear()` invocado desde el cron tras fallos.
- Reglas Firestore: update permitido SOLO al campo `leida` (preserva integridad de auditoría).

### Historial de ejecuciones
- Endpoints nuevos: `GET /api/programados/{gastos|transferencias}/:id/ejecuciones` → array de hasta 100 ejecuciones ordenadas por `fechaEjecutada` desc.
- Componente `HistorialEjecuciones` (modal reutilizable) accesible desde el botón "Historial" en ambas listas.
- Muestra estado (exitosa/fallida/saldo_insuficiente), fecha programada vs ejecutada, errorMensaje y ref al `expense`/`transfer` generado.

### Cross-currency en transferencias programadas
- Nuevos campos en `transferenciasProgramadas`: `monedaDestino`, `exchangeRate`, `usarTasaActual`.
- **Modo "tasa fija"**: el usuario fija `exchangeRate` al crear; se aplica en cada ejecución (default recomendado).
- **Modo "tasa actual"**: `usarTasaActual: true` → el cron consulta la API pública [Frankfurter](https://www.frankfurter.app/) al ejecutar (cache 1h en memoria). Si falla → ejecución marcada `fallida` + notificación `fx_api_error`.
- El cron crea `transfers/` con `amount` (debitado) + `amountConverted` (acreditado) + `exchangeRate` + `fromCurrency`/`toCurrency`.
- Frontend: `SelectorCuenta` destino permite cuentas con moneda distinta a origen; bloque ámbar con switch "Usar tasa del día", input de exchangeRate y preview en vivo del monto convertido.
- Validador Zod actualizado.

### Cambios técnicos
- **Indexes Firestore nuevos**: `ejecucionesProgramadas(programadaId, userId, fechaEjecutada DESC)`, `notificaciones(userId, createdAt DESC)`, `notificaciones(userId, leida, createdAt DESC)`.
- **Rules Firestore**: nueva sección para `notificaciones`.
- Doc actualizado: [`docs/programados-backend.md`](./docs/programados-backend.md) §5.1–5.4.

---

## v2.3.0 (2026-05-11)
**Release**: Gastos y Transferencias Programadas (recurrentes)

**Nueva ruta `/programados`** con 2 tabs:
- **Gastos programados** — plantillas que generan un `expense` automáticamente según frecuencia
- **Transferencias programadas** — mueven dinero entre cuentas de forma automática

**Frecuencias soportadas**:
- `diaria` (cada día)
- `semanal` (día específico de la semana)
- `quincenal` (cada 15 días desde fechaInicio)
- `mensual` (día específico u "último día del mes" — si el día no existe, ej. 31 en febrero, usa el último)
- `personalizada` (cada N días configurable)
- `unica` (one-off, fecha y hora exactas)

**Frontend**:
- Nuevos tipos: `GastoProgramado`, `TransferenciaProgramada`, `EjecucionProgramada`, `FrecuenciaProgramado`
- Utilidad pura `calcularProximaEjecucion` con 27 tests (Vitest)
- Schema Zod `gastoProgramadoFormSchema` + `transferenciaProgramadaFormSchema` con validación cruzada por frecuencia
- Hooks `useGastosProgramados` + `useTransferenciasProgramadas` (onSnapshot + mutations)
- Componentes: `Programados` (wrapper con SegmentedControl), `ListaGastosProgramados`, `ListaTransferenciasProgramadas`, `FormularioGastoProgramado`, `FormularioTransferenciaProgramada`
- Vista previa en tiempo real de "próxima ejecución" en el formulario
- Pausar/Reanudar sin perder configuración

**Backend** (`gastos-backend`):
- Nuevo módulo `programados/` con 2 servicios + 2 controllers + 1 cron
- Endpoints `/api/programados/gastos/*` y `/api/programados/transferencias/*`
- Cron cada 30 min con `@nestjs/schedule` que procesa pendientes
- Lock idempotente con ID determinístico `{programadaId}_{fechaProgramadaISO}` en colección `ejecucionesProgramadas`
- Manejo de timezone con `date-fns-tz` (cálculo en hora local del usuario, almacenamiento UTC)
- Manejo de saldo insuficiente (no se atasca, avanza próxima ejecución y registra en auditoría)
- 19 tests Jest del cálculo de próxima ejecución
- Spec completa en [`docs/programados-backend.md`](./docs/programados-backend.md)

**Reglas Firestore**:
- `gastosProgramados` y `transferenciasProgramadas`: read solo dueño, write **bloqueado al cliente** (solo backend con Admin SDK escribe)
- `ejecucionesProgramadas`: read solo dueño, write bloqueado
- 4 índices nuevos compuestos

**Otros cambios**:
- `AIInsights` cache: TTL default cambiado de 5 min → 24 h, persistencia en `localStorage` para sobrevivir recargas
- Variable `VITE_AI_INSIGHTS_TTL_MINUTES` ahora documentada con default 1440

**Archivos creados (frontend)**:
- `src/types/programados.ts`
- `src/utils/programados.ts` + `__tests__/programados.test.ts`
- `src/utils/validators-programados.ts`
- `src/services/programados.ts`
- `src/services/transferencias-programadas.ts`
- `src/hooks/useGastosProgramados.ts`
- `src/hooks/useTransferenciasProgramadas.ts`
- `src/components/programados/*.tsx` (5 componentes)
- `docs/programados-backend.md`

**Archivos creados (backend)**:
- `src/modules/programados/` (interfaces, dto, utils, service, controller, cron, module)

**Dependencias agregadas (backend)**: `@nestjs/schedule`, `date-fns`, `date-fns-tz`

---

## v2.2.0 (2025-12-04)
**Release**: Integración de Playwright para Testing E2E

**Nuevas Herramientas**:
- Playwright como framework principal de testing E2E (v1.57.0)
- Tests multi-navegador (Chromium, Firefox, WebKit)
- Tests responsive (Desktop y Mobile: Pixel 5, iPhone 12)
- UI Mode para debugging interactivo
- Codegen para generar tests automáticamente
- Screenshots y videos de fallos
- Trazas de ejecución
- Reportes HTML interactivos

**Tests Implementados**:
- `e2e/auth.spec.ts` - Autenticación (Login, Registro, Validaciones)
- `e2e/dashboard.spec.ts` - Dashboard, AI Insights, Estadísticas
- `e2e/gastos.spec.ts` - CRUD de gastos, Importación/Exportación Excel

**Configuración**:
- `playwright.config.ts` - Configuración multi-navegador con auto-start del dev server
- Auto-retry en CI (2 reintentos)
- Ejecución paralela

**Scripts agregados**:
```bash
npm run test:e2e          # Ejecutar tests E2E
npm run test:e2e:ui       # Modo UI (debugging)
npm run test:e2e:headed   # Con navegador visible
npm run test:e2e:debug    # Modo debug paso a paso
npm run test:e2e:report   # Ver reporte HTML
npm run test:e2e:codegen  # Generar tests grabando
```

**Ventajas sobre Cypress**:
- Más rápido (paralelismo nativo)
- Mejor soporte multi-navegador (WebKit/Safari)
- Mejor debugging (UI mode, traces)
- Menos flakiness (esperas automáticas)
- Sin servidor proxy

---

## v2.1.0 (2025-11-28)
**Release**: Sistema de componentes de Input estilo iOS

**Nuevos Componentes** (`src/components/common/Input.tsx`):
- **Input**: 4 variantes (default, filled, underlined, ios)
- **TextArea**: Auto-resize opcional
- **Select**: Personalizado con iconos y estados
- **InputGroup**: Contenedor estilo iOS Settings
- **InputRow**: Fila para usar dentro de InputGroup
- **Switch**: Toggle estilo iOS con animaciones

**Características**:
- Labels flotantes opcionales
- Estados de validación (error, success)
- Iconos personalizables (izquierda/derecha)
- Helper text y mensajes de error
- Animaciones suaves
- Auto-resize en TextArea

**Archivos creados**:
- `src/components/common/Input.tsx`
- `src/components/common/InputExamples.tsx`

---

## v2.0.0 (2025-11-20)
**Release**: Implementación completa de UI y funcionalidades avanzadas

**Nuevas funcionalidades**:
- PWA completa con Workbox (instalable, offline-first)
- Backend API propio para comunicación con Anthropic
- Sistema de conversaciones persistentes para el asistente IA
- Soporte multi-moneda (PEN/USD)
- Presupuesto General (además de por categoría)
- Subcategorías para gastos
- Configuración dinámica (categorías, métodos de pago, monedas)
- Página de Configuración con tabs
- Layout responsive con bottom navigation móvil
- AIInsights en Dashboard
- BudgetMonitor para alertas de presupuesto
- Toast invertido (opción de apariencia)

**Componentes implementados**:
- Dashboard, AIInsights, InstallPWA
- AsistenteIA con historial de chats
- ListaPresupuestos con soporte general
- Configuracion (Perfil, Apariencia, Categorías, Métodos, Monedas)
- Layout con MobileMenu y BudgetMonitor
- CustomLoader, ErrorAlert

**Nuevos hooks**: `useAssistant`, `usePWAInstall`
**Nuevos servicios**: `ai.ts`, `config.ts`
**Dependencias**: vite-plugin-pwa, workbox-window, lucide-react, emoji-picker-react, sharp

---

## v1.0.1 (2025-11-14)
**Cambio**: Downgrade de Tailwind CSS v4 a v3
- Problema: v4.1.17 (beta) instalado automáticamente — configuración incompatible con v3
- Solución: `npm install -D tailwindcss@^3.4.0`
- Estado: Resuelto

---

## v1.0.0 (2025-11-14)
- Setup inicial del proyecto
- Configuración TypeScript estricto
- Servicios Firebase, Anthropic, Excel
- Utilidades, Contexts, Hooks
- Configuración de testing
- Documentación completa
