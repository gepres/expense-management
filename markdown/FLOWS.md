# 🔀 Flujos de trabajo — Multi-cuenta + módulos

> Mapa de módulos de la app. Para cada uno documenta los flujos de usuario, los hooks/services que orquestan datos y dónde "vive" la operación: **Backend NestJS** (mutations atómicas) vs **Firestore directo** (reads realtime).

**Fecha:** 2026-05-04 · **Modelo de datos:** Opción B (cuenta = presupuesto general).

---

## 🧭 Regla arquitectónica

```
                           ┌──────────────────┐
                           │   Frontend (FE)  │
                           │   React + Vite   │
                           └────────┬─────────┘
                                    │
              ┌─────────────────────┼─────────────────────┐
              │                     │                     │
       (mutations)             (reads realtime)     (one-shot reads
              │                     │                  + bulk ops)
              ▼                     ▼                     │
   ┌──────────────────┐   ┌──────────────────┐           │
   │  Backend NestJS  │   │  Firestore SDK   │◄──────────┘
   │  /api/*          │   │  onSnapshot/get  │
   └────────┬─────────┘   └────────┬─────────┘
            │                       │
            └───────────┬───────────┘
                        ▼
                 ┌─────────────┐
                 │  Firestore  │
                 │  (db real)  │
                 └─────────────┘
```

- **Mutations** (write atómica que toca múltiples docs) → siempre via backend con `firestore.runTransaction(...)`
- **Reads** (lecturas que necesitan realtime) → directo a Firestore con `onSnapshot`
- **Reads one-shot complejos** (resumenes, exports) → backend
- **Catálogos del usuario** (`users/{uid}/categories`, etc.) → directo a Firestore

---

## 💼 Multi-cuenta — Flujo end-to-end

```
1. Crear cuenta  →  POST /api/accounts          → tx: insert account doc
                                                   (auto-default si es la 1ra)

2. Ingreso S/3000 (sueldo)  →  POST /api/accounts/:id/income
                            →  tx: account.bankBalance += 3000
                                  + insert cash-movement{type:'income',source:'salary'}

3. Gasto S/200 alimentación →  POST /api/expenses
                            →  tx: account.bankBalance -= 200
                                  + insert expense
                            ←  bucketAlert (si excede sub-reserva categoría)

4. Asignar S/500 sub-reserva alimentación  →  POST /api/presupuestos
                                            →  bucket=alimentacion, limite=500
                                                (NO bloquea si sumAsignado > saldo;
                                                 solo warning)

5. Ver dashboard  →  Firestore onSnapshot (accounts, expenses)
                  →  card "Presupuesto del mes" usa SOLO la cuenta default
                  →  card "Efectivo en bolsillo" suma cashBalance de TODAS

6. Revertir gasto erróneo  →  POST /api/cash-movements/:id/revert
                            →  tx: insert reversal + mark original revertedBy

7. Recalcular saldo (admin)  →  POST /api/accounts/:id/recalculate
                              (deshabilitado en UI; usar solo desde scripts)
```

---

## 📋 Módulos

### 🏦 Cuentas (`/cuentas`)

**Vistas:** `ListaCuentas`, `DetalleCuenta`, `FormularioCuenta`, `CuentasWidget` (dashboard).

**Operaciones:**

| Acción | Hook / Service | Path | Notas |
|---|---|---|---|
| Listar cuentas (realtime) | `useAccounts` | **Firestore directo** `onSnapshot('accounts')` | Filtra por `userId` |
| Crear cuenta | `crear()` → `AccountsService.create` | **API** `POST /api/accounts` | Auto-default si `accounts.length===0` |
| Editar cuenta | `actualizar()` | **API** `PATCH /api/accounts/:id` | NO permite cambiar moneda |
| Toggle default | `actualizar({isDefault:!})` | **API** `PATCH` | Backend hace promote/demote atómico |
| Archivar | `archivar()` | **API** `DELETE /api/accounts/:id?archive=true` | |
| Eliminar | `eliminar()` | **API** `DELETE /api/accounts/:id` | Falla si tiene gastos asociados |
| Recalcular saldo | `recalcular()` | **API** `POST /api/accounts/:id/recalculate` | Botón **deshabilitado en UI** (Fase 6.7.4) |
| Datos de tarjeta cifrados | `card-crypto.ts` | **Firestore** (en doc account) | AES-GCM 256, PBKDF2 250k iter, NUNCA CVC |

---

### 💸 Gastos (`/gastos`)

**Vistas:** `ListaGastos`, `FormularioGasto`.

**Operaciones:**

| Acción | Hook / Service | Path | Notas |
|---|---|---|---|
| Listar gastos (realtime) | `useGastos` | **Firestore directo** `onSnapshot('expenses')` | Index: `userId+fecha DESC` |
| Obtener por id | `useGastos.obtenerPorId` | Cache local + **fallback Firestore** `getDoc` | Cubre race condition de deep-link |
| Crear gasto | `crear()` | **API** `POST /api/expenses` | tx: ajusta saldo cuenta + chequea bucket categoría |
| Editar gasto | `actualizar()` | **API** `PATCH /api/expenses/:id` | tx: revert old + apply new (cruza cuentas si cambia accountId) |
| Eliminar gasto | `eliminar()` | **API** `DELETE /api/expenses/:id` | tx: delete + revert balance |
| Exportar Excel/JSON | `ExpensesService.exportExpenses` | **API** `GET /api/expenses/export?month&year&format` | Backend genera con ExcelJS |
| Bucket alert | (return de mutación) | API devuelve `bucketAlert` | Toast amber si excede categoría |

---

### 🎯 Presupuestos (`/presupuestos`)

**Vistas:** `ListaPresupuestos` + sub-componentes `ResumenSection`, `BucketCard`, `DistribucionMesWidget` (en DetalleCuenta).

**Modelo Opción B:** la cuenta ES el presupuesto general. Las sub-reservas son opcionales por categoría.

| Acción | Hook / Service | Path | Notas |
|---|---|---|---|
| Listar presupuestos (realtime) | `usePresupuestos` | **Firestore directo** `onSnapshot('presupuestos')` | Index: `userId+accountId+mes+bucket` |
| Resumen mensual de cuenta | `obtenerResumen()` | **API** `GET /api/presupuestos/resumen?accountId&mes` | Cálculo con rollover, gastado por bucket |
| Crear sub-reserva | `crear()` | **API** `POST /api/presupuestos` | Solo `bucket=<categoria>` (general legacy, efectivo se gestiona desde cuenta) |
| Editar sub-reserva | `actualizar()` | **API** `PATCH /api/presupuestos/:id` | NO bloquea si excede saldo cuenta (warning) |
| Eliminar | `eliminar()` | **API** `DELETE /api/presupuestos/:id` | |

---

### 🤖 Asistente IA (`/asistente`)

**Vistas:** `AsistenteIA`, `AIInsights` (widget dashboard).

| Acción | Service | Path | Notas |
|---|---|---|---|
| Chat con conversaciones | `callAssistant`, `useAssistant` | **API** `POST /api/chat/message` | Backend invoca Anthropic Claude con contexto del mes |
| Listar conversaciones | `useAssistant` | **API** `GET /api/chat/conversations` | Persistido en `users/{uid}/conversations` (subcoll Firestore vía backend) |
| Insights del dashboard | `AIInsights` | **API** `POST /api/chat/message` con prompt resumen | Cache module-level con TTL `VITE_AI_INSIGHTS_TTL_MINUTES` (default 5min) |
| Análisis del mes | `analyzeExpenses` | **API** | Recibe gastos + presupuestos del mes, devuelve recomendaciones |

**Anthropic SDK:** vive **solo** en el backend (`gastos-backend/src/modules/anthropic`). El frontend nunca importa `@anthropic-ai/sdk`.

---

### 🛒 Compras / Listas (`/compras`)

**Vistas:** `ListaCompras` con flujo "lista → gasto".

| Acción | Path | Notas |
|---|---|---|
| CRUD de listas | **Firestore directo** `shopping-lists` | El frontend escribe directo, las rules garantizan ownership |
| Convertir lista en gasto | **API** `POST /api/expenses` con `shoppingListId` | Backend marca la lista como `archived` |

---

### 👥 Compartidos (`/compartidos`)

**Vistas:** `SharedGroupsList`, `SharedGroupDetail`.

| Acción | Service | Path | Notas |
|---|---|---|---|
| CRUD de grupo | `SharedService` | **API** `/api/shared-groups/*` | Backend valida membership |
| Gastos del grupo | **Firestore directo** `shared_groups/{id}/expenses` | Realtime para colaboración |
| Aportes (budgets) | **Firestore directo** `shared_groups/{id}/budgets` | |
| Invitaciones | `SharedService.createInvitation` | **API** | Token JWT, ruta pública para preview |
| Activity log | **Firestore read-only** `shared_groups/{id}/activity` | Backend escribe (auditoría) |
| Settlement / stats | **API** `GET /api/shared-groups/:id/{settlement,stats,insights}` | Cálculos costosos en backend |

---

### 📥 Importar (`/importar`)

**Vista:** `Importar`.

| Acción | Service | Path | Notas |
|---|---|---|---|
| Subir Excel/JSON | `ImportService.preview` | **API** `POST /api/imports/preview` | Backend valida con Zod, detecta duplicados, sugiere categorías con IA |
| Confirmar import | `ImportService.commit` | **API** `POST /api/imports/commit` | Backend hace batch atómico |

**No se usa Firestore directo** porque el import requiere validación + AI categorization en serie.

---

### ⚙️ Configuración (`/configuracion?tab=*`)

Todos los catálogos del usuario viven en `users/{uid}/<subcoll>` y se gestionan vía backend (write) + Firestore directo (read).

| Tab | Componente | Datos | Path |
|---|---|---|---|
| **Perfil** | `PerfilConfig` | `users/{uid}` (nombre, email, photo, role, isPro) | **API** `PATCH /api/users/profile` para edits + Firebase Auth para email/avatar |
| **Apariencia** | `AparienciaConfig` | localStorage (`tema-app`, `toast-invertido`) | Cliente puro (no toca Firestore) |
| **Categorías** | `CategoriasConfig` | `users/{uid}/categories` | **API** `/api/categories` para CRUD; lectura realtime via Firestore desde `ConfigContext` |
| **Métodos de pago** | `MetodosPagoConfig` | `users/{uid}/paymentMethods` | **API** `/api/payment-methods` |
| **Monedas** | `MonedasConfig` | `users/{uid}/currencies` | **API** `/api/currencies` |
| **Atajos** | `AtajosConfig` | `users/{uid}/shortcuts` | **API** `/api/shortcuts` (atajos rápidos para crear gastos) |
| **WhatsApp Bot** | `WhatsAppConfig` | `users/{uid}` (whatsappNumber, whatsappEnabled) | **API** `/api/whatsapp/link-number` para vincular; webhook entrante en `/api/whatsapp/webhook` (solo Twilio) |
| **Avanzada** | `AvanzadaConfig` | Múltiples acciones | **API** `DELETE /api/users/me` (borrar cuenta), exportar JSON, etc. |

---

## 🔌 Servicios del frontend (`src/services/`)

| Service | Backend module | Tipo |
|---|---|---|
| `accounts.ts` | `accounts` | Mutations API |
| `expenses.ts` | `expenses` | Mutations API + export |
| `transfers.ts` | `transfers` | Mutations API |
| `cash-movements.ts` | `cash-movements` | Mutations API (income/withdraw/deposit/revert) |
| `presupuestos.ts` | `presupuestos` | Mutations API + resumen |
| `ai.ts` | `chat` | API chat |
| `config.ts` | `categories`, `payment-methods`, `currencies`, `shortcuts` | Mutations API + init |
| `import.ts` | `import` | API |
| `receipts.ts` | `receipts` | API (Claude Vision OCR) |
| `voice.ts` | `voice` | API (Web Speech → backend procesa) |
| `shared.ts` | `shared-groups` | API |
| `shopping-list.ts` | (Firestore directo) | Mixto |
| `firebase.ts` | — | Wrapper del SDK + helpers |

## 🔧 Hooks principales (`src/hooks/`)

| Hook | Suscribe a Firestore | Llama a backend |
|---|---|---|
| `useAccounts` | `accounts` | `AccountsService.*` |
| `useGastos` | `expenses` | `ExpensesService.*` (+ fallback `getDoc` |
| `usePresupuestos` | `presupuestos` | `PresupuestosService.*` |
| `useTransfers` | `transfers` | `TransfersService.*` |
| `useCashMovements` | `cash-movements` | `CashMovementsService.*` |
| `useAssistant` | (no — pull on-demand) | `ai.ts` |
| `useSharedExpenses` | `shared_groups/*` | `SharedService.*` |
| `useVoiceInput` | — | Web Speech API + `voice.ts` |
| `usePWAInstall` | — | `beforeinstallprompt` |

---

## 🛡️ Manejo de errores backend

Wrapper `src/utils/api-errors.ts`:
- **`fetchOrThrowOffline()`**: distingue network errors de API errors
- **`<BackendOfflineBanner />`**: banner amber con botón Reintentar cuando el backend no responde
- Hooks no muestran toast en network errors (solo flag `backendOffline` para banner)
- Hooks SÍ muestran toast en API errors (4xx/5xx con mensaje)

---

## 📌 Decisiones arquitectónicas notables

1. **Opción B (cuenta = presupuesto)**: el saldo de la cuenta ES el techo del mes. Sub-reservas opcionales. NO bloquea si excede.
2. **Atomicidad transaccional**: cualquier mutación que toca múltiples docs (saldo + movement) pasa por backend con `runTransaction`.
3. **Income vs Depositar**: 3 operaciones distintas, modales separados. NO unificar (decisión del usuario, Fase 6.7).
4. **Card data**: AES-GCM 256-bit + PBKDF2 250k iter, clave derivada del `userId`. CVC NUNCA se persiste.
5. **Realtime selectivo**: solo collections que el usuario ve cambiar en tiempo real (gastos, accounts, transfers, etc.). Resumenes y stats van por API.
