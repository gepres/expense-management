# Consumo de tokens IA — arquitectura y flujo

> Feature multi-repo: `gastos` (frontend + rules), `gastos-backend`,
> `gastos-firebase-functions`. **Fase 1 = tracking + admin** (implementado).
> **Fase 2 = enforcement de cuotas** (pendiente de confirmación del usuario).

**Versión**: 2.6.0 · **Última actualización**: 2026-05-17

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

> Requiere `firebase deploy --only firestore` (rules + indexes) para que
> el admin pueda leer estas colecciones.

---

## Fase 2 — flujo recomendado de validación de cuota (no implementado)

Decisiones ya tomadas con el usuario: **presupuesto de tokens/mes por rol**
(standard < pro < admin∞) + sub-límite duro de imágenes; **bloqueo duro al
100% con aviso al 80%**.

Flujo propuesto:

1. **Pre-chequeo barato** antes de cada operación `user`: leer
   `aiUsageMonthly/{uid}_{mesActual}` (1 doc). Si `totalTokens >=
   límiteRol` → **429** con `Retry-After`/fecha de reset (1° del mes
   siguiente). Si `>= 80%` → seguir, pero devolver un flag para que el
   front muestre un aviso.
2. **Límites por env**: `AI_QUOTA_STANDARD_TOKENS`, `AI_QUOTA_PRO_TOKENS`
   (admin = ilimitado) + `AI_QUOTA_*_IMAGES` (sub-límite duro de imágenes,
   caras). Configurable sin redeploy de código.
3. **Post-llamada**: el `record()` actual ya hace el `increment` atómico
   (idempotente por evento). No cambia.
4. **Sólo `scope: user` consume cuota.** `scope: app` se sigue registrando
   pero no descuenta.
5. **Reset**: natural por la clave `YYYY-MM` (no hay job de reset).
6. **Backend y functions** comparten el mismo chequeo (en functions el
   uid se resuelve por `whatsappPhone`). Si no hay uid → no se aplica
   cuota (se registra como antes).
7. **Punto de enforcement**: un guard/interceptor en el backend
   (`@RequireQuota('feature')`) y un check equivalente al inicio del
   procesamiento en functions, ambos leyendo el mismo rollup.

Ventajas: O(1) por request (1 lectura de doc), justo (alineado al costo
real), a prueba de manipulación (rollup write-blocked), sin jobs de reset.
