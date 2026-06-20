# Consumo de tokens IA — arquitectura y flujo

> Feature multi-repo: `gastos` (frontend + rules), `gastos-backend`,
> `gastos-firebase-functions`. **Fase 1 (tracking + panel admin)** y
> **Fase 2 (enforcement de cuotas + medidor del usuario)** — ambas
> implementadas y validadas en local.

**Versión**: 2.8.0 · **Última actualización**: 2026-06-20

---

## Modelo de datos (Firestore, top-level)

Solo el **Admin SDK** (backend / functions) escribe. El cliente nunca escribe
(evita manipular su propia cuota). Reglas en `firestore.rules`.

| Colección | Contenido | Lectura |
|---|---|---|
| `aiUsageEvents/{id}` | 1 evento por llamada IA (auditoría) | admin |
| `aiUsageMonthly/{uid}_{YYYY-MM}` | rollup incremental del usuario (`userId`, `mes`, `totalTokens`, `inputTokens`, `outputTokens`, `estimatedCostUsd`, `calls`, `byFeature`, `byProvider`) | dueño (lo suyo) + admin |
| `aiUsageAppMonthly/{YYYY-MM}` | rollup del consumo autogenerado | admin |

> El rollup por usuario es **top-level** (no `users/{uid}/…`): la regla
> recursiva `users/{uid}/{document=**}` da `write` al dueño y permitiría
> alterar la cuota. Clave de mes en **UTC** en los 3 repos.

> **Vista semanal (panel admin):** como los rollups solo existen por mes, la
> gráfica semanal agrega `aiUsageEvents` (campo `createdAt`) por semana en el
> cliente (solo admin; índice single-field automático, sin índices nuevos).

## Clasificación `scope`

Explícita por call site (no inferida). Default seguro: `app`.

- **`user`** (cuenta para cuota en Fase 2): asistente IA, métricas IA
  (insights/ask/roast/imagen), voz, y **todo el bot de WhatsApp**
  (decisión de producto: cada parseo IA lo inició el usuario).
- **`app`** (solo se registra): autocategorización, sugerencias de
  importación, parseos internos, OCR de recibo sin auth, etc.

## Captura

- Anthropic devuelve `response.usage` (tokens reales) → se lee y registra.
- OpenAI imágenes / Whisper no dan tokens → costo por unidad fija
  (`config/ai-pricing.config.ts` / env `AI_PRICE_*`). Whisper estima
  segundos por tamaño de buffer (heurística, best-effort).
- `UsageService.record()` (backend) / `recordUsage()` (functions) son
  **best-effort**: si falla el registro, NUNCA rompe la operación IA.

## Panel de Administración

`/admin` (solo `role: admin`). Tabs: Solicitudes PRO · Cuentas PRO
(rol, WhatsApp vinculado + número, consumo del mes, revocar PRO) ·
Consumo IA (app vs usuarios, top usuarios, desglose feature/proveedor,
navegación por mes). Lee los rollups vía `services/aiUsageAdmin.ts`.

El tab **Consumo IA** incluye además:
- **Gráfica de tendencia** con toggle **Mes/Semana** (mes = rollups; semana =
  agregación de `aiUsageEvents`) y marcadores ⚙ de cambios de modelo.
- **Export** del consumo del mes a **Markdown** (informe + brief para analizar
  con una IA) o **JSON** (`utils/exportConsumoIA.ts`).
- **Modelos por feature en vivo**: `GET /api/ai-usage/models` (admin) resuelve
  los modelos REALES desde las envs del backend (no estático). El changelog de
  cambios es editorial (`utils/modelConfig.ts`).

> Requiere `firebase deploy --only firestore` (rules + indexes) para que
> el admin pueda leer estas colecciones.

---

## Fase 2 — enforcement de cuota (IMPLEMENTADO)

**Presupuesto de tokens/mes por rol** (standard < pro < admin∞) + sub-límite
duro de imágenes; **bloqueo duro al 100%, aviso al `WARN_PCT`%**. Configurable
por env (`AI_QUOTA_*`, ver `.env.example` del backend).

| Pieza | Dónde |
|---|---|
| `QuotaService.assertWithinQuota()` | `gastos-backend` `ai-usage/quota.service.ts` — lee rol + `aiUsageMonthly/{uid}_{mes}` (O(1)); si `usado >= límite` lanza **429** `{ error:'AiQuotaExceeded', message, used, limit, resetAt }`. Sub-límite imágenes (`metrics_image.calls`) → `AiImageQuotaExceeded` |
| Puntos de enforcement (backend) | Antes de cada llamada `scope:'user'`: `chat` (asistente), `analytics` (insights/ask/roast/**image**), `voice`. `scope:'app'` y `admin` no se bloquean |
| `GET /api/ai-usage/me` | Snapshot de cuota del usuario (`QuotaSnapshot`) para el medidor |
| WhatsApp (functions) | `quota.service.ts` `checkQuota()` + `aiQuotaBlocked()` antes de los 3 caminos IA (imagen/audio/parse texto LLM). Si excede → responde con fecha de reinicio y cierra el item sin retry. Comandos/regex NO se bloquean. Best-effort: si la lectura falla, no bloquea |
| Frontend | `ConsumoIACard` (Configuración → Perfil): barra usado/límite/%/reset, verde/ámbar(warn)/rojo(blocked), admin = ilimitado, sub-línea de imágenes. 429 mapeado a `QuotaExceededError` (analytics) y mensaje claro en el asistente |

Propiedades: O(1) por request (1 lectura de doc), justo (alineado al costo
real), a prueba de manipulación (rollup write-blocked top-level), reset
natural por `YYYY-MM` (sin jobs), best-effort en functions (no rompe el bot).

---

## Variables de entorno

| Variable | Repo(s) | Default | Para |
|---|---|---|---|
| `ANTHROPIC_MODEL` | backend | `claude-sonnet-4-6` | Chat asistente |
| `ANTHROPIC_ANALYTICS_MODEL` | backend | hereda `ANTHROPIC_MODEL` | Métricas PRO (insights/ask/roast) |
| `ANTHROPIC_MODEL_PRIMARY` | backend, functions | `claude-sonnet-4-6` | Parse de texto/voz |
| `ANTHROPIC_MODEL_VISION` | backend, functions | `claude-sonnet-4-6` | OCR de comprobantes (tier aislado; en prod `claude-haiku-4-5`) |
| `ANTHROPIC_MODEL_HELPER` | backend, functions | `claude-haiku-4-5` | Helpers/clasificación acotada |
| `OPENAI_MODEL_TRANSCRIBE` | backend, functions | `gpt-4o-mini-transcribe` | Transcripción de audio |
| `OPENAI_IMAGE_MODEL` | backend | `gpt-image-1` | Imagen del roast |
| `AI_PRICE_ANTHROPIC_INPUT_PER_1M` | backend, functions | `3` | Costo estimado tokens input |
| `AI_PRICE_ANTHROPIC_OUTPUT_PER_1M` | backend, functions | `15` | Costo estimado tokens output |
| `AI_PRICE_OPENAI_IMAGE_USD` | backend | `0.04` | Costo por imagen |
| `AI_PRICE_WHISPER_PER_MIN_USD` | functions | `0.006` | Costo por minuto de audio |
| `AI_QUOTA_STANDARD_TOKENS` | backend, functions | `100000` | Cuota mensual rol standard |
| `AI_QUOTA_PRO_TOKENS` | backend, functions | `2000000` | Cuota mensual rol pro |
| `AI_QUOTA_STANDARD_IMAGES` | backend | `0` | Sub-límite imágenes standard |
| `AI_QUOTA_PRO_IMAGES` | backend | `50` | Sub-límite imágenes pro |
| `AI_QUOTA_WARN_PCT` | backend | `80` | % para el aviso |

> Todas opcionales (defaults razonables). `admin` siempre ilimitado, no
> usa estas vars. Cambiarlas requiere redeploy (no tocan código). En
> functions van en el `.env` bundled (no son secrets).

## Despliegue y operación

Orden recomendado:

1. **Firestore** (una vez, desde `gastos`, repo dueño):
   `firebase deploy --only firestore` (rules + indexes). Sin esto el panel
   admin no puede leer; los índices tardan minutos en construirse.
2. **Backend** `gastos-backend`: deploy normal. Empieza a registrar y a
   aplicar cuotas (`assertWithinQuota`).
3. **Functions** `gastos-firebase-functions`: deploy normal. Registra y
   pre-bloquea el bot de WhatsApp.

El **tracking** funciona sin (1) — backend/functions escriben con Admin SDK
que ignora rules. (1) solo habilita la **lectura** del panel admin.

### Smoke test

- Bajar `AI_QUOTA_STANDARD_TOKENS` a un valor chico (p.ej. `500`).
- Consultar el asistente IA → al exceder, **429** con mensaje y fecha de
  reset; la card de Configuración → Perfil pasa a ámbar y luego rojo.
- Enviar un mensaje al bot de WhatsApp estando excedido → responde con la
  fecha de reinicio y NO procesa; `saldo`/`ayuda` siguen funcionando.
- Admin → `/admin` → Consumo IA: ver app vs usuarios, top y desglose.
