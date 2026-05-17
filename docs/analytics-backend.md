# Contrato backend — Módulo de Métricas (Analytics)

> Endpoints del módulo `analytics` en `gastos-backend`. Consumidos por el
> frontend vía `services/analytics.ts`. **Todos son PRO-gated.**

**Versión**: 2.5.0 · **Repo backend**: `D:\PROYECTOS\gepres\gastos-backend`

---

## Autorización

```
FirebaseAuthGuard → ProGuard (@RequirePro a nivel de controlador)
```

- `ProGuard` (`src/common/guards/pro.guard.ts`) lee `users/{uid}.role` directo
  de Firestore. `role ∈ {pro, admin}` pasa; cualquier otro → **403**.
- El frontend además bloquea a no-pro con el teaser (no llega a llamar).
  El 403 se mapea a `ProRequiredError` en `services/analytics.ts`.

## Modelos IA (configurables por env)

| Variable | Default | Uso |
|---|---|---|
| `ANTHROPIC_MODEL` | `claude-sonnet-4-6` | Chat, recibos, categorización |
| `ANTHROPIC_ANALYTICS_MODEL` | hereda `ANTHROPIC_MODEL` | `analyzeMetrics()` (ai-insights) |

---

## Endpoints (`/api/analytics`)

### `GET /summary`
KPIs y series calculados server-side. **Sin IA**, rápido, cacheable (cliente: 10 min).

Query: `month` (1-12), `year`, `accountIds?` (comma-separated; vacío = todas),
`moneda?` (`PEN|USD`; si se omite el backend usa la de mayor gasto — **nunca se mezclan monedas**).

Respuesta: `AnalyticsSummary` (ver `src/modules/analytics/interfaces/analytics.interface.ts`
y el espejo en frontend `src/types/metricas.ts`). Incluye: `periodo`, `moneda`,
`totales`, `comparativaMesAnterior`, `proyeccionFinMes`, `porCategoria`,
`porSubcategoria`, `porMetodoPago`, `porDia` (con `acumulado`),
`tendenciasCategoria`, `topGastos`, `anomalias` (outliers 2σ), `topTags`,
`monedasDisponibles`.

### `POST /ai-insights`
Análisis IA estructurado. Body: `{ month, year, accountIds?, moneda?, focus? }`.
Respuesta: `MetricsAiResult` → `{ resumen, recomendaciones[], insights[],
anomalias[{titulo,detalle,severidad}], ahorroEstimado?, contextUsed }`.
El backend computa el summary, lo compacta y se lo pasa a `analyzeMetrics()`.

### `POST /ai-ask`
Pregunta libre con el summary como contexto. Body:
`{ question, month, year, accountIds?, moneda? }` → `{ respuesta, contextUsed }`.

### `GET /export`
Descarga binaria. Query igual que `/summary` + `format=excel|csv`.
- `excel`: libro multi-hoja (KPIs, Por categoría, Serie diaria, Top gastos, Anomalías).
- `csv`: con BOM (acentos OK en Excel).

---

## Control de costo IA

- Frontend cachea `ai-insights` 24h (memoria + localStorage), refresh manual.
- No se llama si `numTransacciones === 0`.
- No-pro nunca dispara IA (hooks cortan antes; el guard es defensa en profundidad).
- Throttler backend: tier `ai` (20 req/min) aplica a estos endpoints.

## Notas de implementación

- `getExpensesByDateRange(userId, month, year, accountIds?)` (ExpensesService)
  es la fuente; el mes anterior se consulta para comparativa/tendencias.
- Proyección lineal **solo** si el periodo es el mes en curso; meses pasados
  devuelven el total real.
- `AnalyticsModule` importa `ExpensesModule`; `AnthropicService` y
  `FirebaseService` son `@Global`.
