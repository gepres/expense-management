# 💰 Gastos — Gestor de finanzas personales multi-cuenta

PWA minimalista para gestionar gastos, presupuestos y múltiples cuentas (banco / efectivo / tarjeta) con asistente IA integrado.

![React](https://img.shields.io/badge/React-19-61dafb.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178c6.svg)
![Vite](https://img.shields.io/badge/Vite-7-646cff.svg)
![Firebase](https://img.shields.io/badge/Firebase-12-ffca28.svg)
![NestJS](https://img.shields.io/badge/Backend-NestJS%2011-e0234e.svg)

---

## 🧱 Arquitectura en 30 segundos

Dos repos. Frontend en este directorio, backend NestJS en `D:\PROYECTOS\gepres\gastos-backend`.

```
┌──────────────┐     ┌──────────────┐     ┌─────────────┐
│   React PWA  │────▶│  NestJS API  │────▶│  Firestore  │
│  localhost   │     │  :3000/api   │     │  (Firebase) │
│  :5173       │◀────│              │◀────│             │
└──────┬───────┘     └──────────────┘     └──────┬──────┘
       │                                          │
       └──────── onSnapshot (realtime reads) ────┘
```

- **Mutations** (todo lo que toca saldos atómicamente): `frontend → backend → Firestore`
- **Reads** (listas que se actualizan vivas): `frontend → Firestore directo` con `onSnapshot`
- **Modelo de datos:** "Opción B" — cada cuenta ES su propio presupuesto general del mes. Las sub-reservas por categoría son opcionales.

📖 **Ver [`markdown/FLOWS.md`](./markdown/FLOWS.md)** para el detalle de cada módulo, qué endpoint usa y qué colección lee.

---

## ⚡ Quick start

### Frontend

```powershell
npm install
cp .env.example .env       # rellenar con credenciales reales
npm run dev                # http://localhost:5173
```

### Backend

```powershell
cd ../gastos-backend
npm install
cp .env.example .env       # incluir CORS_ORIGIN con http://localhost:5173
npm run start:dev          # http://localhost:3000/api
```

Swagger del backend: http://localhost:3000/api/docs

---

## 🌐 Variables de entorno

Ver [`.env.example`](./.env.example) para la lista completa con comentarios. Resumen:

| Variable | Default | Para qué |
|---|---|---|
| `VITE_FIREBASE_*` | — | Credenciales del proyecto Firebase (cliente) |
| `VITE_API_BASE_URL` | `http://localhost:3000/api` | URL del backend NestJS |
| `VITE_APP_URL` | `http://localhost:5173` | URL pública del frontend (deep-links de WhatsApp) |
| `VITE_APP_ENV` | `development` | `development` \| `production` \| `test` |
| `VITE_AI_INSIGHTS_TTL_MINUTES` | `1440` | Cache de tips IA del dashboard (default 24 h) |
| `VITE_TWILIO_WHATSAPP_NUMBER` | — | Número del bot (formato `whatsapp:+51...`) |

Para tests E2E: ver [`.env.test.example`](./.env.test.example).

---

## 📋 Scripts

```bash
# Dev
npm run dev                  # servidor + HMR
npm run build                # build de producción
npm run preview              # preview del build

# Calidad
npm run type-check           # tsc --noEmit
npm run lint
npm run format

# Testing
npm run test                 # vitest watch
npm run test:run             # vitest una vez
npm run test:coverage        # cobertura
npm run test:e2e             # playwright
npm run test:e2e:ui          # playwright modo UI

# Deploy Firestore
firebase deploy --only firestore:rules
firebase deploy --only firestore:indexes
```

---

## 📚 Documentación

Toda la documentación vive en [`/markdown/`](./markdown/) con un índice navegable:

👉 **[`markdown/INDEX.md`](./markdown/INDEX.md)** — punto de entrada

Documentos clave:

- [**FLOWS.md**](./markdown/FLOWS.md) — flujos por módulo (cuentas, gastos, presupuesto, asistente, compartidos, importar, configuración…) con detalle de qué consume API vs Firestore directo
- [**TESTING.md**](./markdown/TESTING.md) — estrategia de testing (Vitest + Playwright)
- [**FIREBASE_SETUP.md**](./markdown/FIREBASE_SETUP.md) — setup inicial de Firebase
- [**README_ASISTENTE_IA.md**](./markdown/README_ASISTENTE_IA.md) — integración con Anthropic Claude
- [**README_ESTILO_PWA.md**](./markdown/README_ESTILO_PWA.md) — diseño + service worker
- [**CLAUDE.md**](./CLAUDE.md) — especificación técnica completa (para Claude Code y futuros desarrolladores)

---

## ✨ Features destacadas

- **Multi-cuenta:** banco, efectivo, tarjeta de crédito/débito, ahorros. Cada cuenta es su propio presupuesto.
- **Multi-moneda:** PEN, USD (sin mezclar — cards y filtros separados por moneda).
- **Sub-reservas por categoría:** opcionales, con alerta amber cuando el gasto supera la asignación.
- **Movimientos:** ingreso externo (sueldo, préstamo, CTS, AFP), retiro al efectivo, depósito de efectivo, transferencias entre cuentas. Todos atómicos y reversibles.
- **Programados:** gastos y transferencias recurrentes (diaria/semanal/quincenal/mensual/personalizada/única) que el backend ejecuta automáticamente vía cron, con manejo de saldo insuficiente y zona horaria del usuario.
- **Tarjetas:** datos cifrados (AES-GCM 256, PBKDF2 250k iter). Botón "Copiar" para usarlas como gestor. CVC nunca se almacena.
- **Asistente IA:** chat con Claude, insights del dashboard cacheados.
- **OCR de boletas:** sube una foto y autocompleta el gasto.
- **Entrada de voz:** describe el gasto verbalmente.
- **Importación masiva:** Excel/JSON con validación + sugerencia de categorías por IA.
- **Gastos compartidos:** grupos para gastos colectivos con settlement automático.
- **WhatsApp Bot:** registra gastos por mensaje (Twilio).
- **Dark mode + PWA:** instalable, offline-first.

---

## 🛠️ Stack

| Capa | Tech |
|---|---|
| UI | React 19, Tailwind 3, Lucide icons, Framer Motion |
| State | Context API + custom hooks |
| Build | Vite 7 + vite-plugin-pwa (Workbox) |
| Lang | TypeScript estricto |
| Routing | React Router 7 |
| Charts | Recharts |
| Backend | NestJS 11 + Firebase Admin SDK + Anthropic SDK |
| DB | Firestore (NoSQL) |
| Auth | Firebase Auth (Email/Password + Google) |
| Testing | Vitest + Playwright |

---

## 🤝 Contribuir

Esta es una app personal del autor. No acepta PRs externos por ahora, pero el código es MIT.

---

**Hecho con ❤️ en Perú 🇵🇪**
