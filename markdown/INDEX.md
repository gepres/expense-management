# 📚 Índice de documentación

Toda la documentación del proyecto vive en `/markdown/`. La raíz solo contiene `CLAUDE.md` (especificación técnica para Claude Code) y `README.md` (entrada del proyecto).

---

## 📖 Documentos vigentes

| Doc | Tema | Cuándo leerlo |
|---|---|---|
| [DOCUMENTACION.md](./DOCUMENTACION.md) | Página interna `/documentacion` con ejemplos de componentes UI | Para ver demos vivos de Modal, Button, Input, Tables, etc. |
| [FIREBASE_SETUP.md](./FIREBASE_SETUP.md) | Cómo configurar Auth + Firestore inicial | Setup nuevo del proyecto |
| [FIREBASE_ENV_CONFIG.md](./FIREBASE_ENV_CONFIG.md) | Troubleshooting de variables de entorno en Firebase Hosting | Si después de deploy falla `auth/invalid-api-key` |
| [README_ASISTENTE_IA.md](./README_ASISTENTE_IA.md) | Integración del asistente IA con backend REST | Trabajo sobre `/asistente` o el módulo `chat` del backend |
| [README_ESCANEO_RECIBOS.md](./README_ESCANEO_RECIBOS.md) | Funcionalidad de OCR de boletas/recibos | Trabajo sobre `/services/receipts.ts` o el formulario de gasto |
| [README_ESTILO_PWA.md](./README_ESTILO_PWA.md) | Decisiones de diseño + setup PWA con Workbox | Cambios de tema, dark mode, manifest, service worker |
| [TESTING.md](./TESTING.md) | Estrategia de testing (Vitest + Playwright + cobertura) | Antes de escribir tests nuevos |
| [VOICE_INPUT_GUIDE.md](./VOICE_INPUT_GUIDE.md) | Implementación de entrada de voz con Web Speech API | Trabajo sobre `useVoiceInput` o el formulario |
| [FLOWS.md](./FLOWS.md) | **Flujos de trabajo por módulo** (cuentas, gastos, presupuesto, asistente, etc) — quién consume API vs Firestore directo | Empezar por acá si es la primera vez en el proyecto |
| [SMOKE_TEST.md](./SMOKE_TEST.md) | Checklist manual end-to-end para validar la fase multi-cuenta | Antes de subir a `main` después de cambios grandes |
| [../docs/programados-backend.md](../docs/programados-backend.md) | Contrato y modelo Firestore de gastos/transferencias programadas + cron del backend | Trabajo sobre `/programados`, `useGastosProgramados`, módulo `programados` del backend |

---

## 🗄️ Documentos archivados (`/archive/`)

Históricos: planes ya ejecutados, propuestas de diseño aprobadas, snapshots de etapas anteriores. Se mantienen para referencia/auditoría.

| Doc | Por qué se archivó |
|---|---|
| [archive/ANALISIS_PROYECTO.md](./archive/ANALISIS_PROYECTO.md) | Análisis pre-multi-cuenta (Fase 0). Reemplazado por la implementación real |
| [archive/BACKEND_API_SPEC.md](./archive/BACKEND_API_SPEC.md) | Spec original de las APIs. El código real es la fuente de verdad: ver `gastos-backend/src/modules/*/`*.controller.ts |
| [archive/CATEGORIAS.md](./archive/CATEGORIAS.md) | Catálogo estático de categorías. Hoy las categorías son dinámicas por usuario (`users/{uid}/categories`) |
| [archive/DESIGN_PROPOSAL_FORM_v2.md](./archive/DESIGN_PROPOSAL_FORM_v2.md) | Propuesta de form con info tributaria. Implementada |
| [archive/FASE_0_CHECKLIST.md](./archive/FASE_0_CHECKLIST.md) | Checklist Fase 0 multi-cuenta. Cerrada |
| [archive/FASE_1_CHECKLIST.md](./archive/FASE_1_CHECKLIST.md) | Checklist Fase 1 (saneamiento Firestore rules). Cerrada |
| [archive/PLAN_MULTI_CUENTA.md](./archive/PLAN_MULTI_CUENTA.md) | Plan original del refactor multi-cuenta. Ejecutado en Fase 6 |
| [archive/PROYECTO_RESUMEN.md](./archive/PROYECTO_RESUMEN.md) | Resumen v1.0 del proyecto. CLAUDE.md es la fuente actual |

---

## ❌ Eliminados en Fase 6.8.4

Por estar duplicados, ser temporales o referenciar implementaciones legacy:

- `DESIGN_PROPOSAL_FORM.md` (v1, reemplazado por v2 archivado)
- `FIRESTORE_RULES.md` y `FIRESTORE_RULES_UPDATE.md` (las reglas reales viven en `firestore.rules`)
- `VOICE_DEBUG.md` (notas de debug temporales)
- `README_CATEGORIAS.md` (referenciaba `categorias.json` pre-modelo dinámico)
