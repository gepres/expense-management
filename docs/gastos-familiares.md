# Gastos Familiares — Diseño / Exploración

> **Estado:** Diseño con decisiones de arquitectura **confirmadas** (§11.1, 2026-05-18); pendiente aprobar plan de implementación de F1. **Origen:** exploración interna, no pedido de usuario real → diseñar **genérico y flexible**.
> **Fecha:** 2026-05-18 · **Feature gating:** PRO **por creador** del grupo (server-side, `ProGuard`).
> **Relacionados:** [`docs/programados-backend.md`](./programados-backend.md), [`docs/analytics-backend.md`](./analytics-backend.md), `src/types/shared.ts`, `gastos-firebase-functions` (bot WhatsApp).

---

## 1. Tesis

`gastos compartidos` HOY es un modelo **Splitwise/Tricount: un evento que termina y se liquida** (`status: active|completed|archived`, `targetAmount` único, `Settlement` = "quién le debe a quién").

`gastos familiares` es lo **opuesto en ciclo de vida**: un **presupuesto de hogar permanente y recurrente**. Comparte ~80 % de infraestructura de datos con compartidos, pero el **modelo mental, el ciclo y el enlace con dinero real son distintos**. El usuario pidió explícitamente que **resuelva distinto**, no clonar el flujo de evento.

**Decisión de arquitectura (confirmada 2026-05-18):** `groupType: 'evento' | 'familiar'` en la **capa de datos/infra**, con **capa de dominio totalmente separada** (servicios, hooks, rutas, componentes, reglas Firestore y módulo/guards propios en backend). Llamémoslo **Opción A+**.

**Por qué A+ aunque familiar sea conceptualmente distinto de compartido** (la duda planteada): *"distinto en producto" ≠ "distinto en infraestructura"*. El ~80 % que se comparte es **plumbing genérico y aburrido de reescribir**: identidad de miembros, invitaciones por token/link, log de actividad, export, e identidad WhatsApp (teléfono→`userId`). Lo que hace a familiar **distinto** (ciclo mensual, roles jerárquicos, fondeo real, recurrencia, presupuesto por categoría) **no vive en esa plumbing** — vive en una capa de dominio propia que A+ mantiene separada. Resultado:

- UX y lógica de familiar **100 % libres de divergir** de compartido (no se "parecen" porque el discriminador no lo impone).
- **Cero duplicación** de plumbing; un solo backbone que mantener.
- Si algún día familiar diverge tanto que la infra estorba, el discriminador `groupType` **ya aísla los datos** → extraer a colección propia es una migración mecánica, no un rewrite.

Descartados: **módulo separado puro** = duplicar plumbing y mantenerlo 2× desde el día 1, para cubrir un riesgo que el discriminador ya cubre. **MVP mínimo** = no satisface el pedido explícito de que "resuelva distinto" y "maneje todo".

---

## 2. Qué se reutiliza vs. qué se resuelve distinto

| Dimensión | Compartido (hoy) | Familiar (propuesto) |
|---|---|---|
| Modelo mental | Evento que **termina** y se salda | Hogar **permanente** |
| Ciclo de vida | `active → completed → settle` (1 vez) | Recurrente, **se resetea cada mes** (`period: YYYY-MM`) |
| Liquidación | `Settlement`: deuda dura "X le debe a Z" | **Balance de aporte / equidad**, sin tono de deuda |
| Presupuesto | `targetAmount` único | **Mensual por categoría** + metas de ahorro paralelas |
| Recurrencia | Ninguna | **Core**: alquiler, servicios, colegio, mesada |
| Roles | Planos `creator | member` | **Jerárquicos** (admin / aportante / colaborador / dependiente) |
| Dinero real | No toca cuentas reales | **Enlazado a `Account`** (4 modos de fondeo) |
| Categorías | Evento (`Decoración, Regalos, Alojamiento…`) | Hogar (`Alquiler, Servicios, Mercado, Colegio, Salud…`) |
| Privacidad | Todo visible para todos | Gasto privado vs. familiar; visibilidad por rol |
| WhatsApp | Registro individual (sin contexto grupo) | Contexto "familia activa" + notificación a miembros |

**Se reutiliza tal cual:** miembros + invitaciones (token/link), actividad (`ActivityLog`), stats base + breakdown por categoría, export JSON/Excel, infra de notificaciones in-app, motor de `programados` + cron prod, `useMetricasIA` (caché 24h, control de costo), bot WhatsApp (resolución teléfono→`userId`).

### 2.1 Capa compartida (plumbing) vs. capa de dominio (separada)

A+ traza una línea explícita entre lo que se comparte y lo que NO:

| Capa | Compartida (un solo backbone) | Dominio familiar (separado) |
|---|---|---|
| **Datos** | Colección de grupos con `groupType` discriminador; miembros, invitaciones, actividad | `FamilyBudget`, `FamilyGoal`, campos `familiar`-only, periodos |
| **Backend** | Endpoints CRUD de grupo/miembro/invitación/actividad/export | Módulo/guards propios: `ProGuard` familiar, lógica de fondeo, cierre de mes, programados de grupo |
| **Frontend servicios/hooks** | — (cada dominio su servicio) | `services/familiar.ts`, `hooks/useFamilia*` (no se mezclan con `SharedService`) |
| **Frontend UI** | Componentes genéricos (`common/`) | Carpeta y rutas propias (`components/familiar/`, `/familia`) — UX libre de divergir |
| **Firestore rules** | Acceso por membresía de grupo (genérico) | Reglas familiar-only (mesada, visibilidad por rol) |

Regla práctica: **si el código pregunta `if (groupType === 'familiar')` más de una vez en el mismo archivo, ese archivo pertenece a la capa de dominio y debe vivir separado**, no en el módulo compartido.

---

## 3. Modelo de fondeo (el punto que el usuario pidió ampliar)

El usuario planteó: *"el fondo puede ser colocado (pozo), o asociado a la cuenta de uno de los miembros; cada gasto puede salir de la cuenta del usuario (opcional)"*. Lo formalizo en **4 modos de fondo + 4 orígenes por gasto**.

### 3.1 `fundMode` del grupo familiar

| `fundMode` | Cómo funciona | Caso real |
|---|---|---|
| `pooled` | Pozo virtual del grupo. Aportes suman, gastos restan. Saldo = Σaportes − Σgastos. **No toca cuentas reales.** | "Juntamos plata de la casa en un sobre/cuenta mental" |
| `anchored` | El fondo **está asociado a una `Account` real** de un miembro (cuenta sueldo, cuenta conjunta). Gastos debitan esa cuenta vía backend → `movement`. Los demás aportan transfiriendo a ella. | "La cuenta de la casa es el BCP de papá" |
| `distributed` | Sin fondo central. Cada gasto sale de la `Account` personal de quien lo registró. El sistema mide **equidad de aporte** del mes (quién puso más al hogar) y sugiere compensación — **no** deuda punitiva. | "Cada uno paga lo que le toca y vemos si quedamos parejos" |
| `hybrid` | Fijos (alquiler, servicios) → pozo / cuenta ancla. Variables (mercado, delivery) → cada uno de lo suyo + se equilibra. | El caso más común en la práctica |

> **Decisión confirmada:** `fundMode` se elige **explícitamente al crear la familia** — sin default silencioso. El wizard de creación obliga a seleccionar uno (con explicación corta de cada modo y ejemplo), porque el modo de fondeo cambia radicalmente cómo se interpreta cada gasto y no debe asumirse.

### 3.2 `fundingSource` por gasto familiar (override puntual)

| `fundingSource` | Efecto sobre dinero real |
|---|---|
| `pool` | Descuenta del pozo (`pooled`/`hybrid`). No toca cuentas reales. |
| `account` | Debita una `Account` concreta (`fundingAccountId`): la cuenta ancla **o** la cuenta personal del registrante. Genera `Gasto` espejo + `movement`. |
| `reimbursable` | Lo pagó alguien de su bolsillo y **el grupo le debe**. Genera **crédito de aporte** a su favor (no deuda Splitwise: suma a su balance de equidad). |
| `informational` | Solo trackeo/presupuesto. **No toca ningún saldo.** Útil para registrar sin afectar plata real (ej. gasto de un abuelo que no usa la app). |

> Default de `fundingSource` lo fija el `fundMode` del grupo; el miembro puede overridear por gasto si su rol lo permite.

---

## 4. Sinergia con las cuentas del usuario (lo central del pedido)

Objetivo: que el módulo familiar **no sea una isla** sino que se enlace con el modelo multi-cuenta (Opción B) y los gastos personales.

### 4.1 Puntos de enlace

| Enlace | Mecanismo | Beneficio |
|---|---|---|
| Cuenta familiar como `Account` | `Account.ownerType?: 'individual' | 'family'` + `Account.familyGroupId?`. Reutiliza `AccountTipo='compartida'` ya tipado. | El miembro decide con `includeInTotal` si esa cuenta suma a **su** patrimonio del Dashboard (no se infla con plata que no es suya). |
| Gasto familiar → gasto personal espejo | `Gasto.familyGroupId?` + `Gasto.familyExpenseId?`; `FamilyExpense.mirrorGastoId?` (back-ref). | Si pagás un gasto familiar desde **tu** cuenta, cuenta en tu presupuesto personal **y** en el familiar, **sin doble registro manual**. |
| Aporte = transferencia real (opcional) | `FamilyContribution.realTransfer` → dispara transferencia entre cuentas (reusa motor de transferencias + cross-currency Frankfurter ya existente). | "Mamá aporta S/500 al fondo casa" debita su cuenta y acredita la cuenta ancla, registrado y conciliado. |
| Programado familiar enlazado a cuenta | `GastoProgramado/TransferenciaProgramada + familyGroupId? + fundingSource`. El cron prod (GH Actions cada 15 min, lock idempotente) ya existe. | Alquiler/servicios/mesada automáticos generan `FamilyExpense` + `Gasto` espejo + `movement` en un solo disparo. |
| Multi-moneda | Si la cuenta ancla es USD y el gasto PEN, reusar cross-currency (`monedaDestino`, `exchangeRate`, `usarTasaActual`) ya implementado en transferencias. | Hogares con ingresos en distinta moneda. |
| Conciliación aporte ⇄ gasto personal | Si pagaste el alquiler de tu cuenta, se cuenta como **aporte** y ajusta tu balance de equidad sin registrar dos veces. | Cero fricción, números cuadran solos. |

### 4.2 Flujo de datos (sinergia)

```
WhatsApp / Web (miembro)
        │  registra "casa: 120 mercado"
        ▼
 FamilyExpense (groupId, period=YYYY-MM, fundingSource)
        │
        ├─ pool ─────────────► saldo pozo = Σ aportes − Σ gastos
        ├─ account(ancla) ───► backend → movement → Account ancla (saldo real)
        ├─ account(propia) ──► Gasto espejo (accountId) + FamilyExpense  ◄── 1 registro, 2 vistas
        ├─ reimbursable ─────► crédito de aporte al pagador (balance equidad)
        └─ informational ────► solo trackeo (no toca saldos)
        │
        ▼
 FamilyBudget(period, category) ──► si excede ──► notificaciones in-app + WhatsApp a miembros
        │
        ▼
 Métricas familiar (PRO, IA caché 24h) ──► cierre de mes / proyección / roast familiar
```

---

## 5. Modelo de datos propuesto

> Extiende `src/types/shared.ts` con un discriminador. Nada se renombra; los tipos `familiar`-only son opcionales en el modelo base o viven en `src/types/familiar.ts`.

```ts
// Discriminador en el grupo
groupType: 'evento' | 'familiar';            // NUEVO en SharedExpenseGroup

// FamilyGroup (campos familiar-only)
interface FamilyGroupExt {
  fundMode: 'pooled' | 'anchored' | 'distributed' | 'hybrid'; // requerido — elegido explícitamente al crear (sin default)
  anchorAccountId?: string;                   // si anchored|hybrid
  cycle: 'monthly';                           // único por ahora
  currentPeriod: string;                      // 'YYYY-MM' activo
  // status nunca pasa a 'completed' en familiar
}

interface FamilyMemberExt {                   // extiende SharedMember
  role: 'admin' | 'aportante' | 'colaborador' | 'dependiente';
  monthlyAllowance?: number;                  // mesada (dependiente)
  allowanceSpent?: number;                    // consumido del periodo
  linkedAccountId?: string;                   // cuenta personal para fondeo distributed
  visibility: 'full' | 'limited';             // qué ve del feed financiero
}

interface FamilyBudget {                      // NUEVO — recurrente por mes
  id: string; groupId: string;
  period: string;                             // 'YYYY-MM'
  category: string; limit: number; spent: number;
  carryOver?: boolean;                        // saldo no usado pasa al mes siguiente
}

interface FamilyExpenseExt {                  // extiende SharedExpense
  period: string;                             // 'YYYY-MM'
  fundingSource: 'pool' | 'account' | 'reimbursable' | 'informational';
  fundingAccountId?: string;
  mirrorGastoId?: string;                     // back-ref a Gasto personal espejo
  isPrivate?: boolean;                        // no entra al feed familiar
}

interface FamilyContributionExt {             // extiende SharedBudget type='contribution'
  realTransfer?: boolean;                     // dispara transferencia real
  fromAccountId?: string; toAccountId?: string;
}

interface FamilyGoal {                        // NUEVO — metas colaborativas
  id: string; groupId: string;
  name: string; targetAmount: number; savedAmount: number;
  deadline?: string;                          // distinto de targetAmount de evento
}
```

**Enlace en tipos existentes:**
```ts
// src/types/index.ts
Account.ownerType?: 'individual' | 'family';
Account.familyGroupId?: string;
Gasto.familyGroupId?: string;
Gasto.familyExpenseId?: string;
```

---

## 6. Roles (multigeneracional — el usuario quiere que maneje todo)

| Rol | Quién (típico) | Puede |
|---|---|---|
| `admin` | Padres / cabeza de familia (**uno o varios**) | Todo: presupuesto, miembros, programados, fondeo, cerrar mes |
| `aportante` | Adultos que meten plata | Registrar gastos/aportes, ver todo, **no** administra config ni miembros |
| `colaborador` | Adulto con acceso parcial | Registrar gastos, ver lo propio + resumen; no ve detalle financiero sensible |
| `dependiente` | Hijos / abuelos a cargo | **Mesada** con límite mensual; registra dentro del límite; vista read-only configurable |

- **Multi-admin** obligatorio (papá + mamá, o varios cuidadores).
- **Promoción de rol** en el tiempo (un dependiente con mesada → aportante cuando empieza a generar ingresos).
- No hardcodear "papá/mamá": el modelo es por **rol**, no por parentesco (hay hogares de un solo padre, abuelos a cargo, hermanos compartiendo depto).

---

## 7. WhatsApp familiar

**Estado actual del bot (`gastos-firebase-functions`):** registra gastos **individuales** contra la cuenta default/activa del usuario, escribiendo **directo a Firestore con Admin SDK** (no vía NestJS). El backend es dueño de `movements`/saldo (desacoplamiento deliberado). **No hay** contexto de grupo ni notificación entre miembros todavía (`AccountTipo='compartida'` está tipado pero el flujo grupal no está implementado).

**Puntos de enganche (del análisis del repo):**

| Punto | Archivo | Extensión para familiar |
|---|---|---|
| Resolución de cuenta | `src/services/account.service.ts` `resolveActiveAccount()` · `src/index.ts` (~175) | Antes de resolver cuenta, resolver **familia activa** si el usuario pertenece a una. Sesión "familia activa" con TTL (mismo patrón que `sessions/whatsapp`). |
| Registro de gasto | `src/index.ts` `finalizeAndRegisterExpense()` (~850) · `expense.service.ts` `saveExpense()` | Propagar `familyGroupId`, `period`, `fundingSource`, `paidByUserId` al doc. |
| Confirmación | `src/index.ts` (~900) tras `learningLog.append()` | Loop de notificación a los demás miembros (`twilioService.sendMessage` ya existe, iterar lista). |
| Help / parser | `src/config/help.ts`, `src/utils/message-parser.ts` `parseAccountCommand()` | Comando/prefijo de familia: `casa: 120 mercado`, `familia activa`, `cambiar a familia <nombre>`, `ya aporté 500`. |

**UX WhatsApp propuesta:** prefijo o contexto. `casa: 120 mercado` → `FamilyExpense` en la familia activa, `fundingSource` según `fundMode` del grupo (override: `casa(efectivo): 120 mercado`). Tras registrar, notifica a los miembros: *"👨‍👩‍👧 Papá registró S/120 en Mercado (Familia López). Quedan S/340 del presupuesto del mes."*

---

## 8. Plus / diferenciales investigados

Ordenados por (valor ⨯ reuso de infra existente):

| # | Plus | Reusa | Valor |
|---|---|---|---|
| 1 | **Programados de grupo** (alquiler/servicios/colegio) | Motor `programados` + cron prod | ⭐⭐⭐ alto, baja fricción |
| 2 | **Presupuesto mensual recurrente por categoría** + vista anual | `usePresupuestos`, Métricas PRO | ⭐⭐⭐ |
| 3 | **Mesada automática** a dependientes (programado + límite + saldo visible) | Programados + roles | ⭐⭐⭐ diferencial real |
| 4 | **IA familiar conversacional**: "¿en qué se nos fue la plata?", proyección fin de mes, fugas (subs olvidadas) | `useMetricasIA` (caché 24h, control costo) + asistente | ⭐⭐⭐ |
| 5 | **Cierre de mes familiar**: snapshot + estado de cuenta exportable | Métricas + export JSON/Excel existente | ⭐⭐ |
| 6 | **Metas familiares colaborativas** (vacaciones, fondo emergencia) | Aportes + barra progreso | ⭐⭐ |
| 7 | **Alertas inteligentes por categoría** (in-app + WhatsApp) | Notificaciones + cron | ⭐⭐ |
| 8 | **Equidad de aporte** del mes (no deuda Splitwise) | Stats existentes, otra fórmula | ⭐⭐ |
| 9 | **Roast familiar compartible** ("el que más gastó en delivery fue…") | `RoastCard` → PNG → WhatsApp | ⭐ gamificación |
| 10 | **Privacidad granular**: gasto privado, visibilidad por rol | `isPrivate`, `visibility` | ⭐⭐ confianza |
| 11 | **Multi-familia** (tu hogar + ayudar a tus padres) | Selector familia activa (web + WhatsApp) | ⭐⭐ |
| 12 | **Patrimonio familiar consolidado** opt-in (cada uno elige qué cuenta expone) | `includeInTotal` + Dashboard | ⭐ |

---

## 9. PRO gating

Gating **server-side** (`ProGuard` lee `users/{uid}.role`, `UserRole = 'admin' | 'pro' | 'standard'`), igual que Métricas. La IA familiar reutiliza la caché de 24h para control de costo.

**Decisión confirmada — gating por CREADOR del grupo:**

- El `ProGuard` familiar evalúa el rol del **creador** del grupo (`createdBy`), **no** del miembro que hace el request.
- Un miembro `standard` **puede participar plenamente** en una familia cuyo creador es `pro` (registrar gastos/aportes, ver según su rol familiar). No necesita PRO propio.
- Crear/ser dueño de una familia **sí** requiere `pro` (o `admin`). Un `standard` que intenta crear familia ve el **teaser** (qué es + captura + CTA a solicitar PRO) y nunca llama al backend.
- **Comportamiento si el creador pierde PRO** (default propuesto, sub-decisión en §11): la familia pasa a **read-only con CTA de renovación** — se conservan datos e historial, se bloquean escrituras hasta recuperar PRO o transferir la titularidad a otro miembro `pro`. Nunca se borra data.
- Implicación de invitación: invitar a un `standard` es válido y esperado (hijos, abuelos, pareja sin PRO). El costo PRO lo "paga" quien sostiene la familia.

---

## 10. Roadmap por fases (propuesto)

> **Decisión confirmada — alcance "todo":** los 4 diferenciales (programados de grupo, presupuesto recurrente, roles+mesada, IA familiar) están **comprometidos, no opcionales**. No hay un "diferencial #1" único: la priorización **es la secuencia de fases** (F1→F5 los entrega todos en orden de dependencia).

| Fase | Alcance | Depende de |
|---|---|---|
| **F0** | Validación y decisión de arquitectura (este doc) | — |
| **F1 — Core** | `groupType: 'familiar'`, roles, ciclo mensual, `FamilyBudget` por categoría. Solo web, PRO, **sin** recurrencia ni WhatsApp | F0 |
| **F2 — Fondeo** | `fundMode` + enlace `Account` + `Gasto` espejo + aportes con transferencia real opcional | F1 |
| **F3 — Recurrencia** | Programados de grupo (alquiler/servicios/mesada) reusando cron prod | F2 |
| **F4 — WhatsApp** | Contexto familia activa, comando, notificación a miembros | F1+ |
| **F5 — Plus** | Metas, IA familiar/proyección, cierre de mes exportable, roast familiar | F2/F3 |
| **F6 — Hardening** | Privacidad/visibilidad por rol, multi-familia, E2E Playwright | F1–F5 |

---

## 11. Decisiones

### 11.1 Tomadas (2026-05-18)

| # | Decisión | Resolución |
|---|---|---|
| 1 | Arquitectura | **Opción A+**: `groupType` discriminador en datos/infra + capa de dominio separada (ver §1, §2.1) |
| 2 | Alcance de diferenciales | **Todo**: los 4 comprometidos; la priorización es la secuencia F1→F5 (§10) |
| 3 | PRO gating | **Por creador**; un `standard` participa en familia de un `pro`; creador sin PRO → read-only sin pérdida de data (§9) |
| 4 | Fondeo default | **Elección explícita** obligatoria al crear (sin default silencioso) (§3.1) |

### 11.2 Abiertas (validar antes/durante F2–F4)

5. **Gasto espejo**: ¿automático siempre que `fundingSource=account` propia, u opt-in por gasto? *(Recomiendo: automático con toggle "no reflejar en mi presupuesto" por gasto; resolver en F2.)*
6. **WhatsApp**: ¿prefijo (`casa:`) vs. modo persistente (`cambiar a familia X`) vs. ambos? *(Recomiendo: ambos — prefijo para puntual, modo persistente con TTL para sesión; resolver en F4.)*
7. **Equidad**: ¿mostrar "sugerencia de compensación" entre miembros o solo balance informativo sin sugerir pagos? *(Tensión con la tesis anti-Splitwise; resolver en F2/F5.)*
8. **Sub-decisión §9**: confirmar comportamiento exacto cuando el creador pierde PRO (read-only vs. ventana de gracia N días vs. transferir titularidad). Default propuesto: read-only + CTA + opción de transferir a otro miembro `pro`.

---

## 12. Riesgos / notas

- **Discrepancia detectada**: el commit `F2 - implementacion de logica compartidad wsp` sugiere lógica compartida en WhatsApp, pero el análisis del repo `gastos-firebase-functions` indica que el flujo grupal **no está implementado** (solo tipado `AccountTipo='compartida'`; ROADMAP del bot marca "familia" fuera de alcance). Confirmar qué cubrió F2 realmente antes de F4.
- **Doble conteo**: el `Gasto` espejo debe excluirse de reportes personales **o** marcarse claramente, para no inflar el gasto personal del miembro. Definir en F2.
- **Backend dueño del saldo**: el bot WhatsApp no toca `movements`/saldo. Todo fondeo `account`/`anchored` debe pasar por el backend NestJS, no por el bot.
- **Firestore rules**: `familiar` necesita reglas distintas a las personales (acceso por membresía de grupo, no solo `request.auth.uid == userId`). Diseñar junto con el backend.
```
