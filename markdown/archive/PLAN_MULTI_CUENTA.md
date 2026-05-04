# 💼 Plan de Implementación — Soporte Multi-Cuenta

> Plan de impacto y ejecución para evolucionar el modelo "una cuenta por moneda" a **múltiples cuentas por usuario**.

- **Fecha:** 2026-04-26
- **Autor:** Claude (Opus 4.7)
- **Repos involucrados:**
  - Frontend: `D:\PROYECTOS\gepres\gastos`
  - Backend NestJS: `D:\PROYECTOS\gepres\gastos-backend`
  - Firebase Functions: `D:\PROYECTOS\gepres\gastos-firebase-functions`
- **Producción:** ya desplegada → requiere migración de datos.
- **Equipo:** 1 desarrollador → fases pequeñas, mergeables independientemente.

---

## 📑 Índice

1. [Estado actual del modelo "una cuenta"](#1-estado-actual-del-modelo-una-cuenta)
2. [Modelo objetivo "multi-cuenta"](#2-modelo-objetivo-multi-cuenta)
3. [Decisiones de diseño que necesito confirmar](#3-decisiones-de-diseño-que-necesito-confirmar)
4. [Análisis de impacto por capa](#4-análisis-de-impacto-por-capa)
5. [Estrategia de migración de datos](#5-estrategia-de-migración-de-datos)
6. [Fases de implementación](#6-fases-de-implementación)
7. [Riesgos y mitigaciones](#7-riesgos-y-mitigaciones)
8. [Áreas de mejora del análisis previo — encaje en este plan](#8-áreas-de-mejora-del-análisis-previo--encaje-en-este-plan)
9. [Variables de entorno nuevas](#9-variables-de-entorno-nuevas)
10. [Definición de "Done"](#10-definición-de-done)

---

## 1. Estado actual del modelo "una cuenta"

Después de revisar los 3 repositorios, así está hoy:

### 1.1 Frontend (`gastos`)

| Concepto | Implementación actual |
|---|---|
| **Cuenta efectivo** | `PresupuestoEfectivo { userId, moneda, saldoActual }` → 1 documento por (usuario, moneda). Solo soporta PEN y USD. |
| **Movimientos bancarios** | `Movimiento { tipo: 'retiro_banco' \| 'transferencia_cuentas', origen: string, destino?: string, aplicadoAEfectivo: boolean }`. El "banco" es solo un texto (`BCP`, `BBVA`, etc.) sin entidad propia. |
| **Abonos efectivo** | `AbonoEfectivo { monto, moneda, concepto, movimientoId? }` → entrada de dinero al efectivo. |
| **Asociación gasto → cuenta** | **NO EXISTE.** Los gastos solo tienen `metodoPago: 'efectivo'\|'tarjeta_credito'\|'yape'\|...`. Si es `efectivo`, se descuenta del único `PresupuestoEfectivo` de esa moneda. |
| **Vista en dashboard** | `PresupuestoEfectivoWidget` → 2 cards fijas (PEN, USD). |

### 1.2 Backend NestJS (`gastos-backend`)

- Maneja `expenses` (CRUD), `categories`, `payment-methods`, `currencies`, `chat`, `import`, `shared`, `shopping-lists`, `whatsapp`.
- **No tiene ningún módulo de cuentas / efectivo / movimientos.** Todo eso vive solo en el frontend (escritura directa a Firestore).
- El borrado de cuenta de usuario en `users.service.ts` borra explícitamente `presupuestosEfectivo`, `movimientos`, `abonosEfectivo` → confirmando que son colecciones top-level.

### 1.3 Firebase Functions (`gastos-firebase-functions`)

- Procesa cola WhatsApp (`whatsapp_queue` → trigger Firestore).
- Crea gastos directamente vía `db.collection("expenses").add(...)`.
- **No toca el saldo de efectivo** — los gastos creados por WhatsApp no se descuentan de ningún `PresupuestoEfectivo` aunque tengan `metodoPago: 'efectivo'`. ⚠️ **Bug existente.**

### 1.4 Reglas Firestore — situación crítica

Hay **2 archivos `firestore.rules`** desplegables:

```
gastos/firestore.rules                     → match /gastos    (colección INEXISTENTE)
gastos-firebase-functions/firestore.rules  → match /expenses  (allow write: if false)
```

- La colección real es `expenses` (frontend, NestJS y Functions coinciden en eso).
- Si están desplegadas las reglas del repo `gastos`, **no protegen nada** (la colección `gastos` no existe).
- Si están desplegadas las del repo `gastos-firebase-functions`, **bloquearían el frontend** (write: false).
- Conclusión más probable: hay reglas en Firebase Console **distintas** a ambos archivos (probablemente abiertas para auth users) → riesgo de exposición.

> 🚨 **Acción 0 (antes de empezar el multi-cuenta):** verificar y consolidar `firestore.rules` desplegadas. Lo dejamos como Fase 1 del plan.

---

## 2. Modelo objetivo "multi-cuenta"

### 2.1 Concepto

Un **usuario** puede tener **N cuentas** (efectivo bolsillo, banco BCP soles, banco BBVA dólares, ahorros, Yape, tarjeta Visa, etc.). Cada cuenta tiene:

- Identidad (nombre, ícono, color)
- Tipo (`cash`, `bank`, `wallet`, `card`, `savings`, `other`)
- Moneda (`PEN`, `USD`, …)
- Saldo actual (calculado o manual)
- Estado (activa / archivada)

Los **gastos** se descuentan de una cuenta. Los **ingresos/abonos** entran a una cuenta. Las **transferencias** mueven dinero entre dos cuentas (con conversión opcional de moneda).

### 2.2 Nuevas entidades

#### `Account` (nueva colección Firestore: `accounts`)

```ts
interface Account {
  id: string;
  userId: string;
  name: string;                    // "BCP Soles", "Efectivo", "Yape Personal"
  type: 'cash' | 'bank' | 'wallet' | 'card' | 'savings' | 'other';
  bank?: string;                   // "BCP", "BBVA"... (libre)
  currency: 'PEN' | 'USD';         // o cualquier código de Currency
  icon?: string;                   // emoji o lucide name
  color?: string;                  // hex
  initialBalance: number;          // saldo de apertura
  currentBalance: number;          // saldo cacheado (recalculable)
  includeInTotal: boolean;         // si suma al patrimonio del dashboard
  status: 'active' | 'archived';
  isDefault?: boolean;             // cuenta por defecto al crear gasto
  createdAt: Date;
  updatedAt: Date;
}
```

#### `Transfer` (nueva colección Firestore: `transfers`) — reemplaza/complementa `Movimiento`

```ts
interface Transfer {
  id: string;
  userId: string;
  fromAccountId: string;
  toAccountId: string;
  amount: number;                  // monto debitado de origen
  amountConverted?: number;        // monto acreditado en destino (si cambia moneda)
  exchangeRate?: number;           // tipo de cambio aplicado
  fromCurrency: 'PEN' | 'USD';
  toCurrency: 'PEN' | 'USD';
  fee?: number;                    // comisión
  description?: string;
  date: Date;
  createdAt: Date;
  updatedAt: Date;
}
```

#### Modificación a `Gasto` (`expenses`)

```diff
interface Gasto {
   id: string;
   userId: string;
+  accountId: string;              // 🆕 cuenta de la que sale el dinero
   fecha: Date;
   categoria: CategoriaGasto;
   monto: number;
   moneda: Moneda;
   ...
}
```

#### Modificación a `Presupuesto`

> Decisión a confirmar: ¿los presupuestos siguen siendo por (mes, categoría) o también por cuenta? Por defecto **NO** lo asociamos a cuenta — el presupuesto es un techo de gasto, no de saldo.

### 2.3 Entidades que se retiran / migran

| Entidad actual | Acción |
|---|---|
| `PresupuestoEfectivo` | ⚠️ Se reemplaza por `Account` con `type='cash'`. Migración 1-a-1 (uno por moneda). |
| `Movimiento` | 🔄 Se renombra/migra a `Transfer`. El "retiro de banco" pasa a ser una transferencia desde cuenta-banco a cuenta-efectivo. |
| `AbonoEfectivo` | 🔄 Se modela como ingreso (entry positivo) sobre la cuenta o como `Transfer` desde cuenta externa virtual. Decisión en §3. |

### 2.4 Saldo: ¿calculado o cacheado?

**Recomendación:** **cacheado con recálculo on-demand y triggers**.

- `currentBalance` se persiste en el doc `Account`.
- Se actualiza atomicamente con cada gasto/abono/transfer (transaction Firestore).
- Una Cloud Function `recalculateAccountBalance` permite reconciliar bajo demanda (botón "Recalcular saldo" en UI).

Esto es lo que ya hace `usePresupuestoEfectivo` con `calcularSaldoReal` — lo formalizamos.

---

## 3. Decisiones de diseño que necesito confirmar

Antes de codear, decide estas (puedo proponer defaults si quieres):

1. **¿Tipos de cuenta?** Mi propuesta: `cash | bank | wallet | card | savings | other`. ¿Alguno más (crypto, inversión)?

2. **¿Las tarjetas de crédito son cuentas con saldo negativo o un caso especial (deuda)?**
   - Opción A (simple): cuenta normal, saldo puede ser negativo, no hay diferencia con débito.
   - Opción B (correcta contablemente): cuenta tipo `credit_card` con `creditLimit`, `availableCredit` y ciclo de facturación.
   - **Default sugerido:** A para v1, evolucionar a B en v2.

3. **¿`PresupuestoEfectivo` se borra después de migrar o se mantiene como compatibilidad?**
   - **Default sugerido:** se borra después de migración + grace period de 1 release. La lógica nueva ignora la colección vieja.

4. **`Movimiento` actual tiene tipos `retiro_banco` y `transferencia_cuentas`. ¿Se reemplazan por `Transfer` único?**
   - **Default sugerido:** sí. "Retiro de banco" = `Transfer` desde cuenta-banco a cuenta-efectivo.

5. **¿El `metodoPago` de `Gasto` se conserva o se deduce de la cuenta?**
   - Hoy hay redundancia: si elijo cuenta "Yape Personal", el `metodoPago` debería ser `yape` automáticamente.
   - **Default sugerido:** mantener `metodoPago` (puede no coincidir con la cuenta, p. ej. pagué con tarjeta de un familiar pero el gasto es mío). Pero en la UI, autocompletar a partir de la cuenta seleccionada.

6. **¿Conversión de moneda en transferencias?**
   - **Default sugerido:** sí, manual. El usuario ingresa monto destino o tipo de cambio. Sin tabla de FX automática (eso vendría como integración futura).

7. **¿Una cuenta por defecto?** Sí — se marca `isDefault: true` en una. Al crear gasto, viene preseleccionada.

8. **¿Migración automática para usuarios existentes?**
   - **Default sugerido:** sí, idempotente. Crea cuentas `Efectivo PEN` / `Efectivo USD` desde `presupuestosEfectivo`, asigna todos los gastos en efectivo a estas cuentas.
   - Para gastos no-efectivo (yape, tarjeta, etc.): crear cuentas placeholder (`Yape (sin asignar)`, `Tarjeta (sin asignar)`) o dejar `accountId: null` y exigir al usuario asignar.

9. **¿Los gastos compartidos (`shared`) también se asocian a cuenta personal del miembro?** Hoy son aportes simbólicos. **Default:** NO en v1. Queda como mejora.

10. **¿UI de cuentas en mobile?** Bottom sheet con selector tipo iOS Wallet.

---

## 4. Análisis de impacto por capa

### 4.1 Frontend (`D:\PROYECTOS\gepres\gastos`)

#### Archivos a CREAR

```
src/types/index.ts               + interfaces Account, Transfer, AccountType
src/services/accounts.ts         🆕 CRUD de cuentas (vía backend)
src/services/transfers.ts        🆕 CRUD de transfers (vía backend o Firestore directo)
src/hooks/useAccounts.ts         🆕 hook con cache + listeners realtime
src/hooks/useTransfers.ts        🆕
src/context/AccountsContext.tsx  🆕 (provider global con saldos consolidados)
src/components/cuentas/          🆕 carpeta completa
  ├── ListaCuentas.tsx
  ├── FormularioCuenta.tsx
  ├── DetalleCuenta.tsx          (con tabs: movimientos, gastos)
  ├── SelectorCuenta.tsx         (componente reutilizable para formularios)
  ├── TransferModal.tsx          (transferir entre cuentas)
  └── CuentasWidget.tsx          🔄 reemplaza PresupuestoEfectivoWidget
src/components/dashboard/PatrimonioWidget.tsx  🆕 suma total por moneda
```

#### Archivos a MODIFICAR

| Archivo | Cambio |
|---|---|
| `src/App.tsx` | Agregar rutas `/cuentas`, `/cuentas/:id`, `/cuentas/nueva`. Agregar `AccountsProvider`. |
| `src/types/index.ts` | Añadir `accountId` a `Gasto`, `GastoFirestore`, `GastoFormData`. |
| `src/components/gastos/FormularioGasto.tsx` | Añadir `SelectorCuenta` (auto-default). Eliminar `descontarEfectivo` directo (ahora se hace en backend o en Cloud Function que escucha `expenses`). |
| `src/components/gastos/ListaGastos.tsx` | Filtro por cuenta. Mostrar columna de cuenta. |
| `src/components/dashboard/Dashboard.tsx` | Reemplazar `PresupuestoEfectivoWidget` por `CuentasWidget` + `PatrimonioWidget`. |
| `src/components/movimientos/FormularioMovimiento.tsx` | Refactor: ahora es `FormularioTransfer` (selecciona cuenta origen + destino reales). |
| `src/components/efectivo/HistorialEfectivo.tsx` | Convertir en `HistorialCuenta.tsx` (parametrizable por accountId). |
| `src/components/layout/Layout.tsx` y `MobileMenu.tsx` | Añadir entrada "Cuentas" en navegación. |
| `src/hooks/usePresupuestoEfectivo.ts` | **DEPRECAR** → wrapper temporal sobre `useAccounts` para no romper consumidores; eliminar tras Fase 5. |
| `src/components/asistente/AsistenteIA.tsx` | El contexto enviado al asistente debe incluir cuentas y saldos. |
| `src/services/import.ts` y backend | El flujo de importación debe mapear a `accountId`. |

#### Archivos a ELIMINAR (después de la migración)

```
src/context/PresupuestoEfectivoContext.tsx
src/hooks/usePresupuestoEfectivo.ts
src/components/efectivo/PresupuestoEfectivoWidget.tsx
```

### 4.2 Backend NestJS (`D:\PROYECTOS\gepres\gastos-backend`)

#### Módulos a CREAR

```
src/modules/accounts/
  ├── accounts.module.ts
  ├── accounts.controller.ts        # CRUD + endpoint recalculate
  ├── accounts.service.ts           # lógica de saldos
  ├── dto/
  │   ├── create-account.dto.ts
  │   ├── update-account.dto.ts
  │   └── transfer.dto.ts
  └── interfaces/account.interface.ts

src/modules/transfers/
  ├── transfers.module.ts
  ├── transfers.controller.ts
  ├── transfers.service.ts           # transactional: debit + credit en una transaction
  └── dto/
```

#### Endpoints nuevos

```
GET    /api/accounts                 # listar cuentas del usuario
POST   /api/accounts                 # crear cuenta
GET    /api/accounts/:id             # detalle
PATCH  /api/accounts/:id             # editar (nombre, color, status…)
DELETE /api/accounts/:id             # archivar (soft) o eliminar si está vacía
POST   /api/accounts/:id/recalculate # forzar recálculo de saldo
GET    /api/accounts/:id/transactions  # historial unificado (gastos + transfers in/out)

POST   /api/transfers                # transferir entre cuentas (transactional)
GET    /api/transfers                # listar transfers del usuario
DELETE /api/transfers/:id            # revertir (atomicamente)

# Migración (one-shot, admin o auto en primer login)
POST   /api/accounts/migrate         # idempotente, crea cuentas iniciales y rellena accountId
```

#### Cambios en módulos existentes

- `expenses.service.ts`:
  - `CreateExpenseDto` añade `accountId: string`.
  - `create()`: en una **transaction**, crea expense + decrementa `account.currentBalance`.
  - `update()`: si cambia monto/cuenta, ajustar saldos.
  - `remove()`: revertir saldo.
- `import.service.ts`: el wizard (validate → analyze → upload) debe pedir `accountId` por defecto y permitir mapping en analyze.
- `chat.service.ts`: el contexto enviado al asistente debe incluir cuentas y saldos para preguntas tipo "¿cuánto tengo en BCP?".

### 4.3 Firebase Functions (`D:\PROYECTOS\gepres\gastos-firebase-functions`)

#### Triggers nuevos

```ts
// Trigger onWrite sobre expenses → mantener saldos sincronizados
export const onExpenseWrite = functions.firestore
  .document('expenses/{expenseId}')
  .onWrite(async (change, context) => {
    // before/after diff → ajustar account.currentBalance
  });

// Trigger sobre transfers
export const onTransferWrite = functions.firestore
  .document('transfers/{transferId}')
  .onWrite(...)

// Función callable para migración (alternativa al endpoint NestJS)
export const migrateUserToAccounts = functions.https.onCall(...)
```

#### Cambios en `expense.service.ts` (la función WhatsApp crea gastos)

- Antes de crear el expense, determinar la `accountId` (preguntar al usuario qué cuenta usar, o usar la default).
- O asociar a una cuenta especial "WhatsApp Inbox" para que el usuario las clasifique después.

### 4.4 Firestore — colecciones e índices

#### Colecciones nuevas

```
accounts/{accountId}
  - userId, name, type, currency, currentBalance, status, ...

transfers/{transferId}
  - userId, fromAccountId, toAccountId, amount, ...
```

#### Índices compuestos nuevos (`firestore.indexes.json`)

```
expenses     | userId ASC, accountId ASC, fecha DESC
transfers    | userId ASC, fromAccountId ASC, date DESC
transfers    | userId ASC, toAccountId ASC, date DESC
accounts     | userId ASC, status ASC, isDefault DESC
```

#### Reglas Firestore — versión consolidada

```
match /accounts/{accountId} {
  allow read, update, delete: if request.auth != null && resource.data.userId == request.auth.uid;
  allow create: if request.auth != null && request.resource.data.userId == request.auth.uid;
}

match /transfers/{transferId} {
  allow read, delete: if request.auth != null && resource.data.userId == request.auth.uid;
  allow create: if request.auth != null && request.resource.data.userId == request.auth.uid;
  allow update: if false;  // las transfers son inmutables; revertir = delete + create
}
```

> **Aprovechamos para arreglar `expenses` y todas las colecciones que hoy NO tienen reglas:** `presupuestosEfectivo`, `movimientos`, `abonosEfectivo`, `expenses`, `shopping-lists`, etc.

---

## 5. Estrategia de migración de datos

### 5.1 Algoritmo (idempotente)

Para cada usuario `U`:

```
1. Si U ya tiene Accounts → SKIP.

2. Crear Account "Efectivo PEN":
   - type: 'cash', currency: 'PEN'
   - currentBalance = presupuestoEfectivo.PEN.saldoActual (si existe, sino 0)
   - isDefault: true (si no hay otra default)

3. Crear Account "Efectivo USD" (mismo patrón).

4. Para cada metodoPago distinto presente en sus gastos
   excepto 'efectivo':
   - Crear Account "Yape (sin clasificar)" / "Tarjeta (sin clasificar)" / etc.
   - currency = la moneda más frecuente de gastos con ese método.
   - currentBalance = 0 (placeholder, el usuario lo ajusta).

5. UPDATE batch sobre todos los gastos de U:
   - Asignar accountId según mapeo:
     * metodoPago='efectivo' + moneda='PEN' → cuenta "Efectivo PEN"
     * metodoPago='yape' → cuenta "Yape (sin clasificar)"
     * etc.

6. Para cada Movimiento de U → crear Transfer equivalente.

7. Marcar usuario con flag `migratedToAccounts: true` en /users.
```

### 5.2 Cómo se ejecuta

Tres opciones, en orden de preferencia:

- **A. Auto-migración en login** (frontend detecta `usuario.migratedToAccounts !== true` → llama POST `/api/accounts/migrate`). Transparente, no rompe nada.
- **B. Cloud Function `onCall` migrate**, disparada por la app.
- **C. Script manual `scripts/migrate-to-accounts.ts`** ejecutado por ti contra prod.

**Recomendación:** A + C de respaldo.

### 5.3 Compatibilidad temporal

Durante 1-2 releases, el frontend lee:

```ts
// Si Account no tiene accountId aún → fallback al modelo viejo
const cuenta = expense.accountId
  ? accounts.find(a => a.id === expense.accountId)
  : { name: expense.metodoPago, currency: expense.moneda };
```

Eliminar el fallback en Fase 6.

---

## 6. Fases de implementación

Cada fase es un PR mergeable independientemente. Tiempo estimado solo para ti.

### 🟦 Fase 0 — Pre-requisitos (1 día)

- [ ] Verificar reglas Firestore desplegadas en producción (Firebase Console).
- [ ] Backup de colecciones críticas (`expenses`, `presupuestosEfectivo`, `movimientos`, `abonosEfectivo`).
- [ ] Confirmar decisiones de §3.
- [ ] Crear branch `feat/multi-cuenta` en los 3 repos.

### 🟦 Fase 1 — Saneamiento Firestore (1-2 días) **BLOQUEANTE**

- [ ] Consolidar `firestore.rules` en un único archivo (recomiendo el de `gastos-firebase-functions` pero con reglas reales).
- [ ] Cubrir TODAS las colecciones: `users`, `expenses`, `presupuestos`, `presupuestosEfectivo`, `movimientos`, `abonosEfectivo`, `shopping-lists`, `shared_*`, `whatsapp_queue`.
- [ ] Desplegar y probar (login → crear gasto → verificar que no se rompe nada).
- [ ] Migrar `expenses` a usar nombre consistente (mantener `expenses`, alinear todos los repos).

### 🟦 Fase 2 — Backend: módulo `accounts` y `transfers` (3-4 días)

- [ ] NestJS: crear `accounts.module`, `transfers.module` con CRUD básico.
- [ ] DTOs + class-validator + Swagger.
- [ ] Tests unitarios para `accounts.service.ts` (creación, recálculo, transacciones).
- [ ] Endpoint `POST /api/accounts/migrate` idempotente.
- [ ] Reglas Firestore para `accounts` y `transfers`.
- [ ] Índices compuestos.
- **No tocar frontend aún.**

### 🟦 Fase 3 — Frontend: tipos + servicios + hooks (2 días)

- [ ] Añadir interfaces a `types/index.ts`.
- [ ] Crear `services/accounts.ts`, `services/transfers.ts`.
- [ ] Crear `hooks/useAccounts.ts`, `hooks/useTransfers.ts` con listeners `onSnapshot` (realtime).
- [ ] Crear `AccountsContext` y añadir provider en `App.tsx`.
- [ ] **Sin cambios visibles aún.** El nuevo modelo coexiste con el viejo.

### 🟦 Fase 4 — Frontend: UI de cuentas (4-5 días)

- [ ] `ListaCuentas`, `FormularioCuenta`, `DetalleCuenta` (con sus rutas).
- [ ] `SelectorCuenta` reutilizable.
- [ ] `TransferModal`.
- [ ] `CuentasWidget` (reemplaza `PresupuestoEfectivoWidget` en Dashboard).
- [ ] `PatrimonioWidget` (suma total por moneda con conversión opcional).
- [ ] Entrada en `Layout` y `MobileMenu`.
- [ ] Aplicar consistentemente el sistema `Input.tsx` iOS-style.

### 🟦 Fase 5 — Integración: gastos ↔ cuentas (3 días)

- [ ] Modificar `FormularioGasto` para incluir `SelectorCuenta` (auto-default).
- [ ] Modificar backend `expenses.service.ts` para usar transaction (expense + saldo).
- [ ] Modificar Cloud Function de WhatsApp para asignar `accountId` (cuenta default o "Inbox WhatsApp").
- [ ] Modificar `ListaGastos` con filtro/columna por cuenta.
- [ ] Modificar `FormularioMovimiento` → `FormularioTransfer` real.
- [ ] Modificar contexto enviado al asistente IA.

### 🟦 Fase 6 — Migración + cleanup (2 días)

- [ ] Ejecutar migración auto en login (con flag `migratedToAccounts`).
- [ ] Después de monitorear 1 semana en prod:
  - Eliminar `PresupuestoEfectivoContext`, hook y widget viejos.
  - Eliminar colecciones `presupuestosEfectivo`, `movimientos`, `abonosEfectivo` (con backup previo).
  - Eliminar fallbacks en código.

### 🟦 Fase 7 — Mejoras del análisis previo (oportunista, ver §8)

- Lo que se pueda incluir en el camino, sin alargar el scope.

---

## 7. Riesgos y mitigaciones

| Riesgo | Probabilidad | Impacto | Mitigación |
|---|---|---|---|
| Reglas Firestore inconsistentes rompen la app durante el cambio | Alta | Alto | Fase 1 dedicada antes de tocar nada de cuentas. Rollback plan. |
| Saldos calculados ≠ saldos reales tras migración | Media | Alto | Endpoint `/recalculate` + dashboard de "saldos sospechosos" interno. |
| Race condition al crear gastos concurrentes (saldo desalineado) | Media | Medio | Usar `runTransaction` de Firestore en `expenses.service.create`. |
| Usuarios con muchísimos gastos hacen migración lenta | Baja | Medio | Migración en batches de 500 docs, con progreso visible. |
| WhatsApp/voz crea gastos sin cuenta asignable | Alta | Bajo | Cuenta "Inbox" + notificación al usuario para clasificar. |
| Romper cypress/playwright tests | Media | Bajo | Tests E2E críticos quedan parados → habrá que revisarlos. |
| Producción se cae por reglas Firestore mal escritas | Media | Alto | Probar reglas en emulator antes de desplegar. |

---

## 8. Áreas de mejora del análisis previo — encaje en este plan

Del archivo `ANALISIS_PROYECTO.md`, así se integran las mejoras:

| Mejora del análisis | Encaje | Fase |
|---|---|---|
| Alinear `expenses` vs `gastos` y reglas Firestore | ✅ Resuelto | Fase 1 |
| Reglas para todas las colecciones | ✅ Resuelto | Fase 1 |
| Splitear `firebase.ts` monolítico (1.237 líneas) | 🟡 Oportunista | Al crear `services/accounts.ts` ya nace dividido. Se podría hacer por dominio en paralelo. |
| Refactor `FormularioGasto.tsx` (74 KB) | 🟢 Recomendado | Fase 5 obliga a tocarlo → buen momento para extraer subcomponentes. |
| Migrar inputs nativos → sistema `Input.tsx` | 🟢 Oportunista | Fase 4 (formularios nuevos ya nacen con el sistema). |
| Eliminar componentes huérfanos (`asistente-ia/Chat.tsx`, `services/anthropic.ts`) | 🟢 Limpieza | Fase 6. |
| Paginación en `gastosService.obtenerPorUsuario` | 🟡 Necesario | Fase 5 (con multi-cuenta los gastos crecen más rápido). |
| Mover límite IA al backend | ✅ Confirmado | Variable de entorno `AI_DAILY_LIMIT_STANDARD` en backend NestJS. |
| Tests E2E faltantes | ⏸️ Aplazado | Después del MVP multi-cuenta. |
| Limpieza de archivos sueltos en raíz (`*-demo.html`, `lint_output*.txt`) | 🟢 Limpieza | Cualquier momento. |
| `console.log` en producción | 🟢 Limpieza | Eslint rule en Fase 1. |
| `window.confirm` y `window.location.reload()` | 🟢 UX | Cuando se toque cada componente. |

---

## 9. Variables de entorno nuevas

### Frontend (`gastos/.env`)

```bash
# Sin nuevas variables obligatorias.
# El AccountsContext se nutre del backend.
```

### Backend NestJS (`gastos-backend/.env`)

```bash
# Límites del plan (movidos del frontend para no ser eludibles)
AI_DAILY_LIMIT_STANDARD=1
AI_DAILY_LIMIT_PRO=999

# Multi-cuenta
ACCOUNTS_MAX_PER_USER=20         # límite de cuentas por usuario
ACCOUNTS_DEFAULT_TYPES=cash,bank,wallet,card,savings,other

# Migración
ENABLE_AUTO_MIGRATION=true
MIGRATION_BATCH_SIZE=500
```

### Firebase Functions (`gastos-firebase-functions/.env`)

```bash
# Default account para gastos creados por WhatsApp si el usuario no lo definió
WHATSAPP_DEFAULT_ACCOUNT_NAME=Inbox WhatsApp
```

---

## 10. Definición de "Done"

Multi-cuenta está listo cuando:

- [ ] Un usuario nuevo puede crear, editar, archivar y borrar cuentas desde la UI.
- [ ] Cada gasto exige seleccionar cuenta (con default sensato).
- [ ] El saldo de cada cuenta se actualiza atómicamente al crear/editar/borrar gasto.
- [ ] Las transferencias entre cuentas funcionan (mismo currency y cross-currency con tipo de cambio manual).
- [ ] El Dashboard muestra widget de cuentas + patrimonio total.
- [ ] Un usuario existente, al loguearse, migra automáticamente sin perder datos.
- [ ] Los gastos creados desde WhatsApp se asocian a una cuenta (default o "Inbox").
- [ ] Las reglas Firestore protegen `accounts` y `transfers` (y se aprovechó para sanear el resto).
- [ ] El asistente IA puede responder "¿cuánto tengo en BCP?" porque recibe el contexto de cuentas.
- [ ] La migración es idempotente (correr 2 veces no duplica nada).
- [ ] Hay un botón "Recalcular saldo" en cada cuenta para emergencias.

---

## 🎯 Próxima acción sugerida

Confirmar las **decisiones de §3** y arrancar con **Fase 0 + Fase 1** (saneamiento Firestore). Sin eso, el resto del plan camina sobre cimientos riesgosos.

¿Procedemos con Fase 1, o prefieres ajustar alguna decisión antes?
