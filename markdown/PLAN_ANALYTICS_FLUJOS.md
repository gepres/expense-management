# 📊 Plan — Diagnóstico de producto (analítica de flujos)

> Analítica de producto **propia** (no GA4) para un **diagnóstico completo** del uso de la app: gastos (todos sus canales), recurrentes, grupos compartidos, chat IA, bot de WhatsApp, listas, import y captura (escaneo/voz). Datos **generales (app-wide)** y **por usuario**, en una tab del Panel de Administración. Objetivo: base de datos para detectar fricción y priorizar mejoras.

**Fecha:** 2026-06-03 · **Versión plan:** 2 (alcance ampliado a diagnóstico completo) · **Estado:** 📝 Plan (sin código) · **Patrón base:** rollups `aiUsage*`

---

## 🎯 Objetivo

1. **Diagnóstico integral por feature**: adopción (% de usuarios que la usan), volumen, tendencia, funnel de abandono y errores/fricción.
2. **Origen de cada gasto** (web / WhatsApp / escaneo / import / voz / grupo) — el gráfico estrella del diagnóstico.
3. Llamados al **bot de WhatsApp** clasificados; flujos de **recurrentes**; uso de **chat IA**; **grupos** (creación, aportes, liquidaciones).
4. Datos generales **y por usuario**, sin añadir costo desproporcionado de Firestore ni romper runtime.

---

## 🔎 Validación: ¿qué flujos ya dejan rastro? (no estaban en el plan v1)

| Flujo | ¿En taxonomía v1? | ¿Datos ya en Firestore? | Qué falta |
|---|:--:|---|---|
| Agregar gasto (6 canales) | ❌ | ✅ `expenses.createdAt` | **Marcar el `origen`** (no uniforme) + funnel del form |
| Editar / eliminar gasto | ❌ | ✅ `expenses.updatedAt` | nada (server event opcional) |
| Listar / filtrar gastos | ❌ | ⚠️ es read | Evento client si se quiere medir uso de filtros |
| Chat IA | ❌ | ✅ `users/{uid}/conversations(/messages)` + `aiUsage` (tokens) | nada crítico (derivable) |
| Crear grupo / aporte / gasto-grupo | ❌ | ✅ `shared_groups(/budgets,/expenses)` | invitación aceptada + liquidación (sin rastro) |
| Listas de compra | ❌ | ✅ `shopping-lists` | "lista → gasto" derivable por `shoppingListId` |
| Import Excel | ❌ | ✅ `expenses` (batch) | intentos fallidos de validación (no persisten) |
| Escaneo recibo | ❌ | ✅ `receipts.createdAt` | preview descartado (no se crea gasto) |
| Recurrentes | ✅ | ✅ `gastosProgramados`,`ejecucionesProgramadas` | (ya planificado) |
| Bot WhatsApp | ✅ | ✅ `whatsapp_queue` | (ya planificado) |

➡️ **Conclusión:** "diagnóstico completo" **no** significa instrumentar todo. La mayoría de los conteos son **derivables** de colecciones existentes; solo instrumentamos **origen del gasto, funnels de abandono, y errores/fricción**.

---

## ❓ Decisión: propio, no GA4

GA4 es analítica de marketing/web: sus datos viven en Google (no en tu BD), pierde ~30-40% por adblock, funnels no son journeys, y embeberlo en tu admin es construir otro dashboard. Propio = datos tuyos, cruzables por `uid`, server-side (0% pérdida), reutiliza el patrón `aiUsage`. (Tabla comparativa completa en la v1 de este doc / git.)

---

## 🧠 Filosofía: derivable vs evento

| Tipo de dato | Cómo se obtiene | Ejemplos |
|---|---|---|
| **Derivable** (ya existe) | Query/rollup nocturno de colecciones | Gastos creados, conversaciones, grupos, recibos, recurrentes activos, ejecuciones por estado |
| **Dimensión faltante** | Estampar un campo en el doc al crear | **`origen` en `expenses`** (web/wsp/scan/import/voice/shopping/shared) |
| **Evento server** | `track()` en el backend donde ocurre | Bot WhatsApp clasificado, cron éxito/fallo, errores de creación, invitación aceptada, liquidación |
| **Evento client (beacon)** | `trackEvent()` fire-and-forget desde la UI | Form abierto→abandonado, preview de recibo descartado, filtros aplicados |

Regla: **si ya está en la BD, no se instrumenta** (se agrega en Fase 0). Solo se crean eventos para lo que la BD no captura.

---

## 🧭 Arquitectura — rollups con contadores

Replica `aiUsage*`: el **Admin SDK escribe rollups**, el admin **los lee directo de Firestore** (`getDoc`). Un `FieldValue.increment` por evento; el panel lee pocos docs. Nada de doc-por-evento (evita el data swamp y la factura).

```
            EVENTO server (bot, cron, mutations)   ·   EVENTO client (funnels)
                              │                              │ POST /usage-events/track
                              └──────────────┬───────────────┘   (allowlist client)
                                             ▼
              UsageEventsService.track(event, { userId?, dim? })   ← Admin SDK, nunca lanza
                ┌──────────────┬──────────────┴───────────────┐
                ▼              ▼                               ▼
          AppMonthly       AppDaily                  Monthly/{uid}_{mes}
          (general)      (tendencia)                  (por usuario)

   + Rollup nocturno (cron) de lo DERIVABLE → mismos docs (gastos por origen, adopción, etc.)
                                             ▼
                Panel "Diagnóstico" lee rollups (getDoc, estilo aiUsageAdmin.ts)
```

---

## 🗄️ Modelo de datos

Colecciones nuevas (paralelas a `aiUsageAppMonthly`/`aiUsageMonthly`):

| Doc | Para |
|---|---|
| `usageEventsAppMonthly/{YYYY-MM}` | Contadores generales del mes |
| `usageEventsAppDaily/{YYYY-MM-DD}` | Serie diaria (tendencias ~90 días) |
| `usageEventsMonthly/{uid}_{YYYY-MM}` | Contadores por usuario (top users, drill-down) |

Doc: `{ scope, mes|dia, userId?, counters: map<eventName,number>, updatedAt }`. Reglas: READ admin + dueño su propio doc; WRITE solo Admin SDK (igual que `aiUsage*`).

**Cambio clave en el dominio — campo `origen` en `expenses`:** el backend estampa `origen: 'web'|'whatsapp'|'scan'|'import'|'voice'|'shopping'|'shared'` en cada creación de gasto. Permite el diagnóstico de canales **de forma permanente y derivable** (sin depender de eventos). Es un cambio pequeño pero transversal (todos los puntos de creación deben pasarlo).

---

## 🏷️ Taxonomía por feature

> `D` = derivable (sin evento) · `S` = evento server · `C` = evento client. Solo se instrumenta `S`/`C`.

### 💸 Gastos `expense.*`
| Evento/métrica | Tipo | Nota |
|---|:--:|---|
| creados por `origen` | **campo+D** | gráfico estrella; web/wsp/scan/import/voice/shopping/shared |
| editados / eliminados | D | `updatedAt` / borrado |
| `expense.form.opened` / `.abandoned` / `.validation_error` | C | funnel del form web |
| `expense.create.failed` | S | fricción (saldo, error backend) |

### 🔁 Recurrentes `rec.*`
`gasto.created|paused|resumed|deleted`, `transf.*` (S, mutations) · `cron.success|failed` (S, cron) · `form.opened|saved|abandoned` (C).

### 🤖 Bot WhatsApp `wsp.*`
`inbound`(+`.text|.image`), `command.welcome|resumen|ayuda`, `expense.created|failed`, `parse_failed`, `unregistered`, `ocr`, `linked|unlinked` — todos **S**. (Conteo histórico ya en `whatsapp_queue`.)

### 💬 Chat IA `chat.*`
`conversation.created`, `message.sent`, `conversation.deleted` → **D** (subcolección + `aiUsage` ya cuenta tokens). Solo evento: `ai.quota_exceeded` (S, fricción).

### 👥 Grupos `group.*`
`created`, `budget.created` (aporte), `expense.created` → **D** (colección + subcolecciones) · `invitation.joined` (S, no deja auditoría) · `settlement.completed` (S, acción sin rastro).

### 🛒 Listas `list.*` *(módulo Compras — confirmar alcance)*
`created`, `item.added` → **D** (`shopping-lists`) · `converted_to_expense` → **D** (gasto con `shoppingListId`, además marca `origen='shopping'`).

### 📥 Import `import.*`
`committed` → **D** (gastos batch) · `import.attempted` (S, con `{validCount, invalidCount}` — los fallidos no persisten).

### 📸 Captura `capture.*`
`receipt.scanned` → **D** (`receipts`) · `receipt.preview.discarded` (C, no se crea gasto) · `voice.used` / `voice.confidence_low` (S).

### 🧭 Navegación `view.*` / `nav.*` *(incluida — confirmado)*
`view.<ruta>` (normalizada + allowlist) · `nav.session.count|bounce|viewsSum|durationMsSum`. **C** (beacon). Diseño en §🧭 Navegación (SPA).

---

## 📦 Datos ya existentes → Fase 0 (sin instrumentar)

| Métrica | Colección | Campo de fecha |
|---|---|---|
| Gastos creados (vol/usuario/mes, por categoría) | `expenses` | `createdAt` / `fecha` |
| Recibos escaneados | `receipts` | `createdAt` |
| Conversaciones IA + mensajes | `users/{uid}/conversations(/messages)` | `createdAt` |
| Grupos / aportes / gastos-grupo | `shared_groups(/budgets,/expenses)` | `createdAt` |
| Listas de compra | `shopping-lists` | `createdAt` |
| Recurrentes activos / pausados | `gastosProgramados`, `transferenciasProgramadas` | `proximaEjecucion`, `activo` |
| Cron éxito/fallo | `ejecucionesProgramadas` | `fechaEjecutada`, `estado` |
| Llamados al bot (histórico) | `whatsapp_queue` | `createdAt`, `status` |
| Adopción WhatsApp | `users.whatsappPhone` | `whatsappLinkedAt` |

➡️ Fase 0 entrega un diagnóstico amplio **sin tocar runtime**, vía un rollup nocturno (o endpoint que escanea con caché).

---

## 🔌 Backend (`gastos-backend`)

Módulo nuevo **`usage-events`** (distinto del `analytics` PRO de gastos y de `ai-usage`):
- `UsageEventsService.track(event, { userId?, count? })` — allowlist + `FieldValue.increment` a los 3 rollups, batched. **Nunca lanza.**
- `POST /usage-events/track` (FirebaseAuth) — beacon cliente; allowlist solo eventos `C`.
- `POST /usage-events/session-end` (FirebaseAuth) — resumen de sesión de navegación (valida rutas vs allowlist → contadores `view.*` + `nav.session.*`).
- `GET /usage-events/admin/{snapshot,overview,daily,top-users}` (AdminGuard).
- **Rollup nocturno** (cron) que agrega lo derivable (gastos por origen, adopción por feature, etc.) a los rollups.
- **`origen` en `expenses`**: aceptar/inferir el campo en `ExpensesService.create` y propagarlo desde cada canal (web, whatsapp, import, receipts, voice, shared).

**Puntos de instrumentación (`track()`):**

| Evento(s) | Lugar |
|---|---|
| `wsp.inbound` | `whatsapp-queue.controller.ts::webhook` (encolar) |
| `wsp.*` clasificación, `ocr` | procesador de la cola (⚠️ localizar; lógica en `whatsapp.controller.ts`) |
| `wsp.linked/unlinked` | `whatsapp.controller.ts::link/unlink` |
| `rec.*` + `rec.cron.*` | mutations de programados + `programados.cron.ts` |
| `expense.create.failed` | `expenses.service.ts::create` (catch) |
| `import.attempted` | `import.controller.ts::validate/analyze` |
| `group.invitation.joined`, `settlement.completed` | `shared.controller.ts` (join, settlement) |
| `voice.*`, `ai.quota_exceeded` | `voice`/`anthropic` services |

---

## 🖥️ Frontend (`gastos`)

- `services/analyticsEvents.ts`: `trackEvent(event)` fire-and-forget (`keepalive:true`) + lecturas admin (rollups directo Firestore estilo `aiUsageAdmin.ts`; snapshot vía backend).
- `types/analyticsEvents.ts`: `UsageEventName`, `ClientEventName`, `ExpenseOrigen`, rollups, `DiagnosticoOverview`.
- Beacons client: form de gasto (`expense.form.*`), form de recurrente (`rec.form.*`), preview de recibo (`receipt.preview.discarded`), filtros de gastos (opcional).
- **`usePageTracking`** (en el Layout): navegación SPA (page-views + sesiones). Ver §🧭 Navegación.
- Tab **"Diagnóstico"** en `AdminDashboard` (`SegmentedControl` → `{ value:'diagnostico', label:'Diagnóstico' }`) + `components/admin/DiagnosticoTab.tsx` (recharts).

---

## 🧭 Navegación (SPA) — page-views + sesiones

Se rastrea la navegación **sin convertirla en data swamp**: contadores por ruta + métricas de sesión **agregadas** (no un doc por sesión).

**Contadores:**
- `view.<ruta>` — por cambio de ruta. **Rutas normalizadas** (`/gastos/:id` → `view.gastos.detalle`) + **allowlist** (cardinalidad acotada, sin IDs ni datos en la clave).
- `nav.session.count` · `nav.session.bounce` (sesión con ≤1 vista) · `nav.session.viewsSum` · `nav.session.durationMsSum` → el panel calcula **bounce %**, **vistas/sesión** y **duración media** como cocientes.

**Client (`usePageTracking`, en el Layout):**
- `useLocation` (React Router 7): acumula el recorrido en `sessionStorage` (sessionId + entryRoute + timestamp). Sesión expira por inactividad (>30 min).
- En `visibilitychange→hidden` / `pagehide`: **flush** del resumen vía `fetch(..., { keepalive:true })` (permite header `Authorization`, a diferencia de `sendBeacon`). Manda `{ views:{ruta:n}, totalViews, durationMs, entryRoute, exitRoute }`.
- **Costo:** 1 write por flush/sesión (no por navegación). Perder una sesión si el browser mata la pestaña = aceptable para analítica.

**Backend:** `POST /usage-events/session-end` valida rutas contra allowlist e incrementa `view.*` + `nav.session.*` en un batch.

---

## 📈 El panel de diagnóstico

**Salud global:** usuarios activos (DAU/MAU), acciones/día, errores/día.

**Por feature (tarjeta):** adopción (% usuarios), volumen + tendencia, funnel si aplica, errores.

| Feature | KPIs destacados |
|---|---|
| **Gastos** | **Creados por origen** (web/wsp/scan/import/voz/grupo) · funnel form (abierto→guardado, % abandono) · `create.failed` |
| **Recurrentes** | Activos/pausados, por frecuencia · cron éxito/fallo · abandono form |
| **Bot WhatsApp** | Llamados por tipo · tasa de éxito de registro · `parse_failed` · adopción |
| **Chat IA** | Conversaciones, mensajes, usuarios activos · `quota_exceeded` |
| **Grupos** | Creados, miembros, aportes · invitaciones aceptadas · liquidaciones |
| **Import / Captura** | Volumen, adopción · intentos fallidos · previews descartados |

**Fricción (transversal):** `parse_failed`, `expense.create.failed`, `ai.quota_exceeded`, `import.attempted` inválidos, `voice.confidence_low`.

**Navegación:** rutas más visitadas, vistas/usuario, **bounce %**, duración media de sesión, profundidad (vistas/sesión), entry/exit pages.

---

## 🔒 Privacidad · 💸 Costo

- Rollups guardan evento + contador + `uid` (y dimensión acotada como `origen`). **Nunca** mensaje, monto ni teléfono.
- Contadores agregados (no doc-por-evento). Lo derivable se calcula en un **rollup nocturno**; la **navegación** se manda como resumen por sesión (1 write/sesión), no por página. Nada de escanear colecciones en cada carga.
- **Rutas normalizadas + allowlist** en navegación (sin IDs ni datos en la clave del contador).
- `track()` nunca propaga errores; beacon client fire-and-forget.

---

## 🚦 Fases

| Fase | Entrega |
|---|---|
| **0 · Snapshot/diagnóstico base** | Rollup nocturno + tab "Diagnóstico" con todo lo **derivable** (gastos, chat, grupos, recurrentes, bot histórico, adopción por feature). Cero riesgo en runtime. |
| **1 · Origen + eventos server** | Campo `origen` en `expenses` (gráfico de canales) + módulo `usage-events` + instrumentar bot/cron/mutations/errores. |
| **2 · Funnels + navegación (client)** | Beacon `trackEvent` + forms (gasto, recurrente) + preview recibo · `usePageTracking` (page-views + sesiones: bounce/duración/profundidad). |
| **3 · Refinos (opcional)** | Drill-down por usuario, export CSV, alertas (cron-fail, fricción), profundidad de scroll. |

### ✅ Checklist
**Fase 0** — [ ] rollup nocturno derivable · [ ] tab "Diagnóstico" + tarjetas por feature · [ ] type-check + resumen
**Fase 1** — [ ] campo `origen` en `expenses` (todos los canales) · [ ] módulo `usage-events` + reglas + deploy · [ ] instrumentar bot/cron/mutations/errores · [ ] type-check + resumen
**Fase 2** — [ ] `trackEvent` + `POST /track` + `POST /session-end` (allowlist client) · [ ] beacons en forms + preview recibo · [ ] `usePageTracking` (navegación + sesiones) · [ ] tarjetas de funnel + navegación · [ ] type-check + resumen

---

## ⚙️ Decisiones por defecto (alcance) · ⚠️ A confirmar

1. **Navegación incluida** (✅ confirmado): page-views por ruta + sesiones (bounce, duración, profundidad), con **rutas normalizadas + allowlist** para acotar cardinalidad/costo. Ver §🧭 Navegación.
2. **"Listas" = ambos** (✅ confirmado): módulo Compras (`shopping-lists`) + listado/CRUD de gastos.
3. **Origen del gasto** se resuelve con un **campo en el doc** (no solo evento), porque es la forma permanente y derivable. Requiere tocar todos los canales de creación.
4. **Procesador de la cola `whatsapp_queue`**: localizar al iniciar Fase 1 (`grep whatsapp_queue`) — ahí va la clasificación fina del bot.
5. **`whatsapp_queue` ¿se purga?** Si se limpia, el histórico de Fase 0 es parcial; los rollups son la fuente permanente.

---

## 📚 Relacionado
`docs/ai-usage.md` (patrón rollups) · `src/services/aiUsageAdmin.ts` (molde lectura admin) · `markdown/FLOWS.md` (dónde vive cada operación) · `docs/programados-backend.md` · `gastos-backend/docs/SHARED_RECEIPTS.md`.
