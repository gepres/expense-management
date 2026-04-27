# 🔎 Análisis Detallado del Proyecto — Gestión de Gastos

> Documento de análisis técnico, funcional y de arquitectura preparado para planificar cambios futuros.

- **Fecha de análisis:** 2026-04-26
- **Autor:** Claude (Opus 4.7)
- **Versión analizada:** 2.2.0 (según `CLAUDE.md`)
- **Rama actual:** `main`
- **Último commit:** `56e2d4b implementación y validacion test playwright, autentication`

---

## 📑 Índice

1. [Resumen ejecutivo](#1-resumen-ejecutivo)
2. [Arquitectura general](#2-arquitectura-general)
3. [Stack y dependencias](#3-stack-y-dependencias)
4. [Modelo de dominio (entidades clave)](#4-modelo-de-dominio-entidades-clave)
5. [Mapa de funcionalidades por módulo](#5-mapa-de-funcionalidades-por-módulo)
6. [Flujos de trabajo end-to-end](#6-flujos-de-trabajo-end-to-end)
7. [Capas: contextos, hooks, servicios](#7-capas-contextos-hooks-servicios)
8. [Backend / API externa](#8-backend--api-externa)
9. [Estado actual de testing y CI](#9-estado-actual-de-testing-y-ci)
10. [Hallazgos: fortalezas](#10-hallazgos-fortalezas)
11. [Hallazgos: deuda técnica y riesgos](#11-hallazgos-deuda-técnica-y-riesgos)
12. [Áreas potenciales de mejora](#12-áreas-potenciales-de-mejora)
13. [Preguntas para el usuario antes de planificar cambios](#13-preguntas-para-el-usuario-antes-de-planificar-cambios)

---

## 1. Resumen ejecutivo

**Tipo de proyecto:** Aplicación web SPA + PWA construida con React 19 + TypeScript estricto + Vite, con Firebase Auth/Firestore como backend de datos del usuario y un **backend NestJS-style propio** (en `http://localhost:3000/api`) que orquesta llamadas a Anthropic Claude, importación inteligente, escaneo de recibos, gastos compartidos, configuración dinámica y un bot de WhatsApp (Twilio).

**Madurez del proyecto:**

- ✅ Arquitectura por features bien establecida (`components/<feature>` + `hooks` + `services` + `context`).
- ✅ TypeScript estricto, path aliases, validación Zod, PWA con Workbox.
- ✅ E2E con Playwright multinavegador implementado.
- ✅ Sistema de **roles** (`admin`, `pro`, `standard`) y solicitud de upgrade a PRO.
- ⚠️ Coexisten dos componentes de asistente IA (`asistente/` y `asistente-ia/`), sugerente de migración inacabada.
- ⚠️ Mezcla de inputs nativos vs sistema `Input.tsx` iOS-style (consistencia visual desigual entre formularios).
- ⚠️ El nombre de la colección Firestore para gastos en código es `'expenses'` pero las reglas Firestore (`firestore.rules`) protegen `'gastos'` → **inconsistencia crítica de seguridad / nombres**.
- ⚠️ Múltiples archivos de demo (`*-demo.html`, `loading-overlay-example.tsx`, `pages/*Examples.tsx`) y READMEs duplicados conviven con el código de producción.

**Líneas y archivos clave:**

- `src/services/firebase.ts` ≈ 1.237 líneas (monolítico, agrupa auth + 5 servicios CRUD).
- `src/components/gastos/FormularioGasto.tsx` ≈ 74 KB (formulario hiper-rico con voz, OCR, atajos, info tributaria).
- `src/components/presupuestos/ListaPresupuestos.tsx` ≈ 42 KB.
- `src/types/index.ts` ≈ 670 líneas (todos los tipos del dominio).

---

## 2. Arquitectura general

### 2.1 Capas

```
┌──────────────────────────────────────────────────────────┐
│ UI (React + Tailwind + Recharts + Framer Motion)         │
│  - components/<feature>                                   │
│  - pages/ (catálogos de ejemplos, no rutas reales)        │
│  - modules/shopping-list (módulo aislado)                 │
└──────────────────────────────────────────────────────────┘
              │
┌─────────────▼────────────────────────────────────────────┐
│ Hooks de feature (useGastos, usePresupuestos, …)         │
│ + Contextos globales (Auth, Theme, Config, Preferences,  │
│   SharedExpenses, PresupuestoEfectivo)                   │
└──────────────────────────────────────────────────────────┘
              │
┌─────────────▼────────────────────────────────────────────┐
│ Servicios                                                │
│  - firebase.ts (Auth, Firestore directo, Storage)        │
│  - ai.ts / anthropic.ts (chat IA + conversaciones)       │
│  - config.ts (categorías, métodos, monedas, atajos)      │
│  - shared.ts (gastos compartidos)                        │
│  - import.ts (3 pasos: validate → analyze IA → upload)   │
│  - excel.ts / receipts.ts / voice.ts                     │
│  - shopping-list.ts (¡localStorage!)                     │
└──────────────────────────────────────────────────────────┘
              │
┌─────────────▼────────────────────────────────────────────┐
│ Backends                                                 │
│  - Firebase (Auth + Firestore + Storage)  → directo      │
│  - Backend propio en :3000/api → IA, config, shared,     │
│    import, whatsapp, users (DELETE /users/profile)       │
└──────────────────────────────────────────────────────────┘
```

### 2.2 Particularidad arquitectónica

**El backend propio es la fuente de verdad para 5 dominios** (categorías, métodos de pago, monedas, atajos, gastos compartidos, asistente IA, importación, WhatsApp), mientras que **Firebase es la fuente de verdad para los 4 dominios del usuario individual** (gastos, presupuestos, presupuesto en efectivo, movimientos, abonos).

Esto crea un modelo **híbrido** que es razonable pero tiene riesgos:
- El borrado de cuenta llama al backend (`DELETE /users/profile`) → asume que el backend cascadea borrado en todos lados (Firestore incluido).
- Las categorías personalizadas viven en backend, pero los `expenses` en Firestore usan el `id` de la categoría → cualquier inconsistencia produce gastos huérfanos.

### 2.3 Estructura de carpetas observada

```
src/
├── App.tsx                   # 16 rutas + 6 providers anidados
├── components/
│   ├── admin/                # Panel admin (solicitudes PRO)
│   ├── asistente/            # AsistenteIA.tsx (versión activa)
│   ├── asistente-ia/         # Chat.tsx (¿legacy / huérfano?)
│   ├── auth/                 # Login, Registro
│   ├── common/               # 30+ componentes reutilizables
│   ├── compartidos/          # Shared groups (4 tabs internos)
│   ├── config/               # 8 tabs: perfil, apariencia, categorías…
│   ├── dashboard/            # Dashboard + AIInsights
│   ├── efectivo/             # PresupuestoEfectivoWidget + Historial
│   ├── gastos/               # Lista + Formulario (74 KB)
│   ├── importar/             # Wizard de import
│   ├── layout/               # Layout + MobileMenu
│   ├── movimientos/          # Retiros / transferencias bancarias
│   ├── presupuestos/         # Lista (42 KB)
│   └── user/                 # ProRequestButton
├── context/                  # 6 providers
├── hooks/                    # 11 hooks personalizados
├── modules/shopping-list/    # ⚠️ usa localStorage, no Firebase
├── pages/                    # 26 archivos *Examples.tsx (showroom)
├── services/                 # 11 servicios
├── types/                    # index.ts + shared.ts + shopping-list.ts
└── utils/                    # formatters, calculations, validators
```

---

## 3. Stack y dependencias

### 3.1 Producción

| Dependencia | Versión | Uso |
|---|---|---|
| `react` / `react-dom` | 19.2.0 | UI base (RC/estable según fecha) |
| `react-router-dom` | 7.9.6 | Routing v7 |
| `firebase` | 12.6.0 | Auth + Firestore + Storage |
| `@anthropic-ai/sdk` | 0.68.0 | Instalado pero **el backend hace las llamadas** (queda como vestigio en `services/anthropic.ts`) |
| `recharts` | 3.4.1 | Gráficos del Dashboard |
| `xlsx` | 0.18.5 | Lectura/escritura Excel |
| `zod` | 4.1.12 | Validación |
| `date-fns` | 4.1.0 | Fechas |
| `framer-motion` | 12.23.24 | Animaciones |
| `lucide-react` | 0.553.0 | Iconografía |
| `emoji-picker-react` | 4.15.1 | Emoji picker para categorías |
| `react-hot-toast` | 2.6.0 | Toasts |
| `vite-plugin-pwa` + `workbox-window` | 1.1.0 / 7.3.0 | PWA |

### 3.2 Tooling y testing

`vitest 4`, `@testing-library/react 16`, `msw 2`, `playwright 1.57`, `cypress 15` (legacy), `eslint 9`, `prettier`, `typescript 5.9`, `tailwindcss 3.4` (decisión consciente: no migrar a v4).

### 3.3 Variables de entorno

- 6 variables `VITE_FIREBASE_*` → frontend.
- `VITE_API_BASE_URL` → backend (default `http://localhost:3000/api`).
- `VITE_TWILIO_WHATSAPP_NUMBER` → solo para construir el deep-link `wa.me/`.
- Existen `.env`, `.env.example`, `.env.test`, `.env.test.example`, `.env.playwright`.

---

## 4. Modelo de dominio (entidades clave)

### 4.1 Usuario

```ts
Usuario {
  id, email, nombre, photoURL?,
  role: 'admin' | 'pro' | 'standard',
  proRequestStatus: 'none' | 'pending' | 'approved' | 'rejected',
  whatsappPhone?, whatsappLinkedAt?,
  createdAt, updatedAt
}
```

**Sistema de roles:**
- `standard` → acceso básico (sin AI Insights detallado, sin WhatsApp, **límite diario de 1 mensaje al asistente**).
- `pro` → todo desbloqueado.
- `admin` → además accede al panel `/admin` para aprobar/rechazar solicitudes PRO.

Las reglas Firestore impiden self-promote (`role` no se puede cambiar excepto por admin; `proRequestStatus` solo a `pending`).

### 4.2 Gasto

```ts
Gasto {
  id, userId, fecha, categoria, subcategoria?,
  monto, moneda: 'PEN' | 'USD',
  descripcion, metodoPago,
  tags?, recurrente?, shoppingListId?,
  // Información tributaria (Perú)
  voucherType?: 'boleta'|'factura'|'recibo'|'ticket'|'nota-debito'|'nota-credito',
  voucherNumber?, ruc?, igv?, subtotal?,
  reimbursementStatus?: 'pending'|'approved'|'rejected'|'paid',
  createdAt, updatedAt
}
```

### 4.3 Presupuesto

- Por categoría **o** general (`categoria === 'general'`).
- Subcategorías predefinidas para presupuesto general: `Cuenta Sueldos`, `Préstamo`, `Deuda`, `CTS`, `AFP`, `Otros`.
- Flags `alertaEnviada80` / `alertaEnviada100` para evitar spamear notificaciones.

### 4.4 Presupuesto en Efectivo + Movimientos + Abonos

Sistema bancario simplificado:

- `PresupuestoEfectivo` → saldo actual por moneda (`PEN`, `USD`).
- `Movimiento` → operación bancaria (retiro de banco, transferencia entre cuentas) — **no es gasto**.
- `AbonoEfectivo` → entrada de dinero al efectivo (típicamente generada por un movimiento con `aplicadoAEfectivo: true`).

El hook `usePresupuestoEfectivo` **recalcula el saldo real cada carga** comparando suma de abonos vs. suma de gastos en efectivo y persiste si difiere — esto **enmascara desincronizaciones** pero las corrige automáticamente.

### 4.5 Gastos Compartidos

Modelo completo con grupos, miembros, aportes (`SharedBudget`), gastos del grupo (`SharedExpense`), invitaciones por token, log de actividad, settlements (quién debe a quién) y AI insights del grupo.

### 4.6 Shopping List

⚠️ **Persistencia en `localStorage`** (`services/shopping-list.ts`). No sincroniza con Firebase ni backend. Si el usuario cambia de dispositivo, pierde sus listas.

### 4.7 Asistente IA

- `Conversation` (id, title, messageCount, lastMessagePreview, updatedAt).
- `ConversationMessage` (id, role: user|assistant, content, timestamp).
- Persistidas en backend.

---

## 5. Mapa de funcionalidades por módulo

| Módulo | Ruta | Estado | Notas |
|---|---|---|---|
| Login / Registro | `/login` `/registro` | ✅ | Email/password + Google Sign-In con popup |
| Dashboard | `/` | ✅ | Stats por moneda + AIInsights + Widget efectivo + accesos rápidos |
| Lista Gastos | `/gastos` | ✅ | Filtros, búsqueda, eliminación, exportación Excel/JSON |
| Formulario Gasto | `/gastos/nuevo`, `/gastos/editar/:id` | ✅ | OCR de recibos, voz, atajos rápidos, info tributaria, autocálculo IGV (factura) |
| Movimientos | `/movimientos/nuevo` | ✅ | Retiro / transferencia, opción "abonar a efectivo" |
| Historial Efectivo | `/efectivo/historial` | ✅ | Estado de cuenta unificado por moneda |
| Presupuestos | `/presupuestos` | ✅ | Categoría + general, alertas BudgetMonitor |
| Importar | `/importar` | ✅ | Wizard 3 pasos: validar → analizar IA → subir |
| Asistente IA | `/asistente` | ✅ | Chat con historial, sugerencias, **límite 1/día para standard** |
| Compartidos | `/compartidos`, `/compartidos/:id`, `/compartidos/unirse/:token` | ✅ | 4 tabs internos, invitaciones por link, settlement |
| Listas Compras | `/compras`, `/compras/:id` | ⚠️ | Solo `localStorage` |
| Configuración | `/configuracion` | ✅ | 8 tabs: Perfil, Apariencia, Categorías, Métodos, Monedas, Atajos, WhatsApp, Avanzada |
| Admin | `/admin` | ✅ | Aprueba/rechaza solicitudes PRO |
| Documentación | `/documentacion` | ✅ | Documentación interna en la app |

**Componentes huérfanos / showroom (no rutas):** todos los `pages/*Examples.tsx` (≈ 26 archivos) son catálogos de UI-kit, no se exponen en `App.tsx` salvo `Documentacion.tsx`.

---

## 6. Flujos de trabajo end-to-end

### 6.1 Autenticación

```
Usuario → Login.tsx
       → useAuth.login() / loginConGoogle()
       → authService → Firebase Auth
       → Crea/lee doc en /users/{uid}
       → AuthContext expone usuario + isAdmin + isPro
       → onAuthChange escucha cambios y reactiva contexts dependientes
```

**Punto importante:** `AuthProvider` orquesta todo. Cuando hay usuario, `ConfigProvider`, `SharedExpensesProvider` y `PresupuestoEfectivoProvider` cargan sus datos en cascada (cada uno con `useEffect` sobre `usuario`).

### 6.2 Crear gasto (caso completo)

```
FormularioGasto.tsx
 ├─ (opcional) Escanear recibo → POST backend → autocompleta campos
 ├─ (opcional) Voz → Web Speech API → VoiceService.processExpenseFromVoice() (LLM)
 ├─ (opcional) Atajo rápido (shortcuts) → autocompleta categoría/monto/etc.
 ├─ (factura) Autocálculo IGV: subtotal = monto/1.18, igv = monto - subtotal
 ├─ Validación local (validarFormulario)
 └─ submit:
     ├─ useGastos.crear() → gastosService.crear() → Firestore /expenses
     ├─ Si metodoPago === 'efectivo':
     │    └─ usePresupuestoEfectivo.descontar()
     │        ├─ Decrementa saldo en /presupuestosEfectivo
     │        └─ Si quedó negativo, toast de advertencia
     ├─ Si shoppingListId presente:
     │    └─ Marca item de la lista como completado en localStorage
     └─ navigate('/gastos')
```

### 6.3 Crear movimiento bancario

```
FormularioMovimiento.tsx → useMovimientos.crear() → Firestore /movimientos
 └─ Si aplicadoAEfectivo === true:
     └─ usePresupuestoEfectivo.abonar()
         ├─ Crea AbonoEfectivo en /abonosEfectivo
         └─ Incrementa saldo en /presupuestosEfectivo
```

### 6.4 Chat con IA

```
AsistenteIA.tsx
 ├─ checkDailyLimit() → si !isPro y count >= 1 → modal upgrade PRO
 ├─ useAssistant.sendMessage(msg, month, year)
 │   ├─ Si no hay conversation: createConversation(title=primeros 30 chars)
 │   ├─ Optimistic UI: agrega user message
 │   ├─ POST /chat/conversations/:id/messages → backend
 │   │   └─ Backend obtiene contexto (gastos, presupuestos del mes/año)
 │   │   └─ Backend llama Anthropic con system prompt
 │   └─ Agrega assistant message a la UI
 └─ incrementDailyUsage() en localStorage por usuario
```

### 6.5 Importación Excel/JSON (wizard de 3 pasos)

```
Paso 1: validateFile() → POST /import/validate → backend valida + retorna ValidatedExpense[]
Paso 2: analyzeExpenses() → POST /import/analyze → backend con IA aplica:
        - Normalización de categorías
        - Detección de duplicados
        - Sugerencias de mejora
Paso 3: upload → POST /import/upload → backend graba en Firestore
```

### 6.6 Gastos compartidos

```
Crear grupo → POST /shared-groups
 ├─ Generar invitación (POST /shared-groups/:id/invitations)
 ├─ Invitado abre /compartidos/unirse/:token (semi-público)
 │   └─ verifyInvitation → preview → acceptInvitation (requiere login)
 ├─ Cada miembro:
 │   ├─ Aporta presupuesto (SharedBudget)
 │   └─ Registra gasto del grupo (SharedExpense)
 ├─ Stats: balance por miembro, breakdown por categoría
 └─ Settlement: algoritmo del backend dice "X debe Y a Z"
```

### 6.7 Vinculación WhatsApp (PRO)

```
WhatsAppConfig.tsx
 ├─ Validación PRO (overlay con CTA upgrade si no PRO)
 ├─ POST /whatsapp/link { phoneNumber } con Bearer token
 ├─ Backend asocia número Twilio → uid
 └─ Usuario envía mensajes tipo "50 almuerzo" o "resumen" al número Twilio
     └─ Bot procesa y crea gastos / responde
```

---

## 7. Capas: contextos, hooks, servicios

### 7.1 Contextos (orden de anidamiento en `App.tsx`)

```
BrowserRouter
└─ ThemeProvider                # tema light/dark/system + toast invertido
   └─ AuthProvider               # usuario, login/logout, roles
      └─ PresupuestoEfectivoProvider
         └─ ConfigProvider       # categories/paymentMethods/currencies/shortcuts
            └─ PreferencesProvider
               └─ SharedExpensesProvider
                  └─ <App>
```

> ⚠️ El orden importa: `PresupuestoEfectivoProvider` está **encima** de `ConfigProvider`, pero su hook usa `useAuth` (correcto). Funciona, pero el anidamiento es profundo (6 providers) — riesgo de re-renders innecesarios.

### 7.2 Hooks

| Hook | Propósito | Dependencias |
|---|---|---|
| `useGastos` | CRUD + filtros locales | Firestore vía `gastosService` |
| `usePresupuestos(mes)` | CRUD por mes | Firestore vía `presupuestosService` |
| `usePresupuestoEfectivo` | Saldo, abonar, descontar, historial | Firestore (3 colecciones) |
| `useMovimientos` | CRUD movimientos bancarios | Firestore |
| `useAssistant` | Chat IA + conversaciones | Backend |
| `usePWAInstall` | beforeinstallprompt | Browser API |
| `useVoiceInput` | Web Speech API | Browser API |
| `useBreakpoints` / `useMediaQuery` | Responsive | Browser API |
| `useModal` | Helpers de modales | — |

### 7.3 Servicios

- **`firebase.ts`**: monolítico, agrupa `authService`, `gastosService`, `presupuestosService`, `presupuestoEfectivoService`, `movimientosService`, `abonosEfectivoService` y todos los converters Firestore↔App. **1.237 líneas**.
- **`ai.ts`**: chat con backend (conversaciones persistentes).
- **`anthropic.ts`**: parece legacy (llama directamente a Anthropic SDK sin pasar por backend) — verificar si está en uso.
- **`config.ts`**: CRUD del catálogo de categorías/métodos/monedas/shortcuts via backend.
- **`shared.ts`**: gastos compartidos via backend.
- **`import.ts`**: 3 pasos de importación.
- **`receipts.ts`**: OCR de recibos.
- **`voice.ts`**: procesamiento de voz a estructura de gasto.
- **`excel.ts`**: importación/exportación local con `xlsx`.
- **`expenses.ts`**: helpers cortos para exportación.
- **`shopping-list.ts`**: persistencia en localStorage.

---

## 8. Backend / API externa

Documentado en `BACKEND_API_SPEC.md` (≈ 42 KB). Endpoints inferidos del código frontend:

```
Auth: usa Firebase ID Token (Bearer) en todos los requests.

/users
  DELETE /users/profile         # eliminar cuenta

/categories                     # GET/POST/PATCH/DELETE
/categories/:id/subcategories   # GET/POST/PATCH/DELETE
/payment-methods                # CRUD
/currencies                     # CRUD
/shortcuts                      # CRUD

/chat
  POST /chat/message            # one-shot
  GET  /chat/conversations
  POST /chat/conversations
  GET  /chat/conversations/:id/messages
  POST /chat/conversations/:id/messages
  PATCH /chat/conversations/:id
  DELETE /chat/conversations/:id

/import
  POST /import/validate         # multipart, retorna ValidatedExpense[]
  POST /import/analyze          # JSON, retorna EnhancedExpense[] + sugerencias IA
  POST /import/upload           # graba en DB

/shared-groups                  # CRUD + members + budgets + expenses + invitations + activity + stats + settlement + insights + export
/shared-groups/invitations/:token/verify    # público
/shared-groups/invitations/:token/accept    # requiere auth

/whatsapp
  POST /whatsapp/link
  POST /whatsapp/unlink
```

> El backend NO está en este repositorio (no veo carpeta `server/` o `api/`). Vive en otro proyecto / servidor.

---

## 9. Estado actual de testing y CI

- **Vitest** configurado con `jsdom`, mocks de Firebase, localStorage, matchMedia.
- **Playwright** con 5 proyectos (Chromium, Firefox, WebKit, Pixel 5, iPhone 12), 3 specs implementados (`auth`, `dashboard`, `gastos`).
- **Cypress** queda como alternativa legacy.
- **MSW 2** instalado pero su uso real no fue inspeccionado en profundidad.
- **No hay GitHub Actions visible** que ejecute los tests automáticamente (solo `.github/` existe — habría que verificar el contenido).

---

## 10. Hallazgos: fortalezas

1. **TypeScript estricto y modelo de dominio claro** (`types/index.ts` define todo, incluso converters Firestore↔App).
2. **Separación de capas correcta** (UI → hooks → servicios).
3. **PWA completa** con Workbox, runtime caching diferenciado (CacheFirst para fonts, NetworkFirst para Firebase Storage).
4. **Validación con Zod** y normalización (categorías, fechas).
5. **Multi-moneda real** (PEN/USD), agrupación por moneda en cálculos.
6. **Modo PRO con feature flags claros** (`isPro`, límite diario IA, overlay en WhatsApp).
7. **Diseño responsive con bottom navigation móvil** y header adaptado.
8. **Sistema de gastos compartidos** completo (settlement, invitaciones, actividad).
9. **Información tributaria peruana** integrada (RUC, IGV, voucherType, autocálculo de factura).
10. **AI Insights con cache de promesas** (evita doble llamada al re-render).
11. **Reconocimiento de voz** + OCR de recibos como atajos de captura.
12. **Reglas Firestore con principio de mínimo privilegio** para `users/`.

---

## 11. Hallazgos: deuda técnica y riesgos

### 🔴 Críticos

1. **Inconsistencia de colecciones Firestore.**
   - Código (`gastosService.crear`) escribe en `collection(db, 'expenses')`.
   - `firestore.rules` protege `match /gastos/{gastoId}`.
   - **Resultado probable:** las reglas no aplican a la colección real → **cualquier usuario autenticado puede leer gastos de otros** (si Firestore tiene reglas default abiertas) o **nada funciona** (si están en deny default).
   - **Acción urgente:** alinear nombre (a `expenses` o `gastos`) en código y reglas, y verificar las reglas reales desplegadas.

2. **Reglas Firestore incompletas.** `firestore.rules` solo cubre `users`, `gastos` y `presupuestos`. Faltan reglas para: `presupuestosEfectivo`, `movimientos`, `abonosEfectivo`. Si la base está en modo "permitir todo si auth", hay exposición.

3. **`actualizarPerfil` y `vincularWhatsApp` permiten que el usuario altere `whatsappPhone` directamente desde Firestore** (aunque también hay endpoint backend) — la regla `update` permite cualquier campo si `request.auth.uid == userId` salvo `role` y `proRequestStatus`. Verificar si conviene endurecer.

### 🟡 Importantes

4. **Componentes duplicados / huérfanos:**
   - `components/asistente/AsistenteIA.tsx` (rutas) vs `components/asistente-ia/Chat.tsx` (¿en uso?).
   - `services/anthropic.ts` (8.9 KB, llama Anthropic SDK directamente desde frontend, riesgo de exponer API key) vs `services/ai.ts` (vía backend, es el camino oficial).
   - `services/expenses.ts` (800 bytes, vacío en propósito claro).

5. **Shopping list en localStorage** sin migración a backend → datos no portables, no compartibles, no respaldados.

6. **`firebase.ts` monolítico** (1.237 líneas). Debería dividirse por dominio (`auth.ts`, `gastos.ts`, `presupuestos.ts`, …).

7. **`FormularioGasto.tsx` con 74 KB y 1.500+ líneas**: maneja OCR, voz, atajos, info tributaria, edición, creación, autocálculo IGV, integración con shopping list, descuento de efectivo. Difícil de testear y mantener. Candidato fuerte a refactor.

8. **Mezcla de inputs** (nativos en Login/Perfil vs sistema `Input.tsx` iOS-style en Movimientos). Inconsistencia visual.

9. **`DEFAULT_CATEGORIES` y constantes hardcoded** (en `types/index.ts` y `ConfigContext.tsx`) divergen de la fuente backend → gastos antiguos pueden quedar referenciando IDs ya borrados sin reflejar bien el label.

10. **`window.location.reload()` después de actualizar perfil** (PerfilConfig) es brusco. Hay `actualizarUsuario()` en context que debería usarse.

11. **Logs `console.log` en producción** abundantes (`firebase.ts`, `ai.ts`, `auth`, voz). Debería filtrarse por `import.meta.env.DEV`.

12. **`window.confirm` en `useAssistant.deleteChat`** rompe la consistencia visual (se usan `Modal`/`ConfirmationModal` en otros lugares).

13. **El límite diario de 1 mensaje al asistente para `standard` está en localStorage**: trivial de eludir borrando el storage. Debería validarse en backend.

14. **`recargar/recalcular saldo` automático en `usePresupuestoEfectivo`** corrige drift pero genera escrituras silenciosas — puede ocultar bugs.

15. **No hay paginación en `gastosService.obtenerPorUsuario()`**: trae TODOS los gastos del usuario en cada carga. Para usuarios con cientos/miles de gastos, esto crece sin límite.

### 🟢 Menores

16. Múltiples archivos sueltos en raíz: `*-demo.html`, `loading-overlay-example.tsx`, `loading-buttons-demo.html`, `lint_output*.txt`, `categorias-types.ts`, `test-google-*.html`, `TEMP_FORM_STRUCTURE.txt`. Limpieza recomendada.
17. READMEs múltiples (`README.md`, `README_ASISTENTE_IA.md`, `README_CATEGORIAS.md`, `README_ESCANEO_RECIBOS.md`, `README_ESTILO_PWA.md`) — riesgo de quedar desincronizados con CLAUDE.md.
18. `pages/*Examples.tsx` (26 archivos) son showroom interno → considerar moverlos a `src/showroom/` o eliminarlos del bundle de producción.
19. `useAuth` retorna `cargando` pero el contexto setea `cargando` también en operaciones de login/registro → puede crear estados intermedios indeseados en `ProtectedRoute` (parpadeos).
20. Naming mixto español/inglés (`gastos`/`expenses`, `usuario`/`user`) — funciona, pero requiere disciplina al expandir.

---

## 12. Áreas potenciales de mejora

### 12.1 Seguridad y datos

- [ ] Alinear nombre de colección Firestore (gastos vs expenses) y completar `firestore.rules` para todas las colecciones en uso.
- [ ] Mover validación del límite diario de IA al backend.
- [ ] Verificar que `DELETE /users/profile` realmente cascadea borrado en Firestore (gastos, presupuestos, movimientos, abonos, conversaciones, grupos compartidos…).
- [ ] Audit de las reglas Firestore desplegadas en producción vs el archivo del repo.

### 12.2 Performance

- [ ] Paginación / lazy loading para `gastosService.obtenerPorUsuario` (cursor o `startAfter`).
- [ ] Considerar Firestore listeners (`onSnapshot`) en lugar de pull manual + recargas.
- [ ] Splitear `firebase.ts` por dominio para mejorar tree-shaking.
- [ ] Evaluar si los 6 providers anidados se pueden colapsar (uno orquestador) o reemplazar por Zustand/Jotai si la complejidad crece.

### 12.3 UX y consistencia

- [ ] Migrar formularios de Login/Perfil al sistema `Input.tsx` iOS-style.
- [ ] Reemplazar `window.confirm` y `window.location.reload()` por flujos basados en `Modal` y `actualizarUsuario`.
- [ ] Unificar componentes asistente (`asistente/` vs `asistente-ia/`).
- [ ] Migrar shopping-list a Firebase para portabilidad y compartir.

### 12.4 Arquitectura

- [ ] Dividir `FormularioGasto.tsx` en sub-componentes (BasicInfo, TaxInfo, OCR, Voice, Shortcuts) más un orquestador.
- [ ] Extraer `firebase.ts` en `services/firebase/{auth,gastos,presupuestos,…}.ts`.
- [ ] Crear `services/api/` para todos los servicios que llaman backend, con un cliente HTTP único (interceptor de auth, manejo de errores estandarizado, retries).
- [ ] Ajustar `eslint.config.js` para prohibir `console.log` salvo bajo flag DEV.

### 12.5 Calidad y CI

- [ ] Confirmar/configurar GitHub Actions: lint + type-check + test:run + Playwright en cada PR.
- [ ] Aumentar cobertura de tests unitarios sobre `utils/calculations` y `utils/validators`.
- [ ] Tests E2E para flujos críticos pendientes: presupuestos, movimientos, gastos compartidos, importación.

### 12.6 Limpieza

- [ ] Eliminar / archivar: `*-demo.html`, `loading-overlay-example.tsx`, `lint_output*.txt`, `TEMP_FORM_STRUCTURE.txt`, `test-google-*.html`, `categorias-types.ts` (si está duplicado del backend).
- [ ] Mover `pages/*Examples.tsx` a `src/showroom/` o componente único de Documentación.
- [ ] Consolidar `README*.md` en `docs/` con un índice único.

---

## 13. Preguntas para el usuario antes de planificar cambios

Para poder proponer un plan concreto, necesito entender qué cambios tienes en mente. Por favor responde las que apliquen:

### 📌 Sobre el alcance del cambio

1. **¿Qué tipo de cambio quieres hacer?** Marca todos los que apliquen:
   - [ ] Nueva feature (¿cuál?)
   - [ ] Refactor / limpieza técnica (¿qué área?)
   - [ ] Cambio de UX/UI (¿qué pantallas?)
   - [ ] Cambio de modelo de datos / backend
   - [ ] Mejora de performance
   - [ ] Cambios para llegar a producción

2. **¿Hay algún módulo en concreto que sea el foco?** (gastos, presupuestos, asistente, compartidos, efectivo, importación, configuración, admin, shopping list, WhatsApp…)

### 📌 Sobre prioridades técnicas detectadas

3. **¿Eres consciente de la inconsistencia `expenses` vs `gastos` en Firestore?** ¿Quieres que la abordemos primero (es un riesgo de seguridad si las reglas no aplican)?

4. **¿El backend (`localhost:3000/api`) está en otro repositorio?** ¿Tienes acceso para cambios coordinados, o trabajaremos solo el frontend?

5. **¿Quieres mantener el sistema híbrido (Firebase + backend propio) o moverlo todo a uno u otro?**

6. **¿La shopping list debería sincronizar con el backend?** ¿O es deliberado que sea local?

### 📌 Sobre el modelo de negocio

7. **¿El plan PRO sigue siendo "1 mensaje IA por día para standard"?** ¿Hay otros límites que aplicar (gastos, categorías, monedas)?

8. **¿Hay nuevas integraciones planeadas?** (Apple Pay, bancos por API, otros bots, exportación tributaria…)

### 📌 Sobre calidad

9. **¿Quieres que monte un plan de cobertura de tests E2E para los flujos críticos faltantes?**

10. **¿Producción ya está desplegada (Firebase Hosting, Vercel, etc.) o vamos a desplegar ahora?**

### 📌 Sobre el equipo

11. **¿Trabajas solo en este proyecto o hay más colaboradores?** Esto afecta cómo planificamos los refactors grandes (PRs pequeños vs uno grande).

---

> Una vez respondas estas preguntas, podemos generar un plan detallado paso a paso (con fases, riesgos y entregables) y/o entrar a implementar.
