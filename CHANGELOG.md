# Changelog

Historial de versiones del proyecto Gastos.

---

## v2.3.0 (2026-05-11)
**Release**: Gastos y Transferencias Programadas (recurrentes)

**Nueva ruta `/programados`** con 2 tabs:
- **Gastos programados** — plantillas que generan un `expense` automáticamente según frecuencia
- **Transferencias programadas** — mueven dinero entre cuentas de forma automática

**Frecuencias soportadas**:
- `diaria` (cada día)
- `semanal` (día específico de la semana)
- `quincenal` (cada 15 días desde fechaInicio)
- `mensual` (día específico u "último día del mes" — si el día no existe, ej. 31 en febrero, usa el último)
- `personalizada` (cada N días configurable)
- `unica` (one-off, fecha y hora exactas)

**Frontend**:
- Nuevos tipos: `GastoProgramado`, `TransferenciaProgramada`, `EjecucionProgramada`, `FrecuenciaProgramado`
- Utilidad pura `calcularProximaEjecucion` con 27 tests (Vitest)
- Schema Zod `gastoProgramadoFormSchema` + `transferenciaProgramadaFormSchema` con validación cruzada por frecuencia
- Hooks `useGastosProgramados` + `useTransferenciasProgramadas` (onSnapshot + mutations)
- Componentes: `Programados` (wrapper con SegmentedControl), `ListaGastosProgramados`, `ListaTransferenciasProgramadas`, `FormularioGastoProgramado`, `FormularioTransferenciaProgramada`
- Vista previa en tiempo real de "próxima ejecución" en el formulario
- Pausar/Reanudar sin perder configuración

**Backend** (`gastos-backend`):
- Nuevo módulo `programados/` con 2 servicios + 2 controllers + 1 cron
- Endpoints `/api/programados/gastos/*` y `/api/programados/transferencias/*`
- Cron cada 30 min con `@nestjs/schedule` que procesa pendientes
- Lock idempotente con ID determinístico `{programadaId}_{fechaProgramadaISO}` en colección `ejecucionesProgramadas`
- Manejo de timezone con `date-fns-tz` (cálculo en hora local del usuario, almacenamiento UTC)
- Manejo de saldo insuficiente (no se atasca, avanza próxima ejecución y registra en auditoría)
- 19 tests Jest del cálculo de próxima ejecución
- Spec completa en [`docs/programados-backend.md`](./docs/programados-backend.md)

**Reglas Firestore**:
- `gastosProgramados` y `transferenciasProgramadas`: read solo dueño, write **bloqueado al cliente** (solo backend con Admin SDK escribe)
- `ejecucionesProgramadas`: read solo dueño, write bloqueado
- 4 índices nuevos compuestos

**Otros cambios**:
- `AIInsights` cache: TTL default cambiado de 5 min → 24 h, persistencia en `localStorage` para sobrevivir recargas
- Variable `VITE_AI_INSIGHTS_TTL_MINUTES` ahora documentada con default 1440

**Archivos creados (frontend)**:
- `src/types/programados.ts`
- `src/utils/programados.ts` + `__tests__/programados.test.ts`
- `src/utils/validators-programados.ts`
- `src/services/programados.ts`
- `src/services/transferencias-programadas.ts`
- `src/hooks/useGastosProgramados.ts`
- `src/hooks/useTransferenciasProgramadas.ts`
- `src/components/programados/*.tsx` (5 componentes)
- `docs/programados-backend.md`

**Archivos creados (backend)**:
- `src/modules/programados/` (interfaces, dto, utils, service, controller, cron, module)

**Dependencias agregadas (backend)**: `@nestjs/schedule`, `date-fns`, `date-fns-tz`

---

## v2.2.0 (2025-12-04)
**Release**: Integración de Playwright para Testing E2E

**Nuevas Herramientas**:
- Playwright como framework principal de testing E2E (v1.57.0)
- Tests multi-navegador (Chromium, Firefox, WebKit)
- Tests responsive (Desktop y Mobile: Pixel 5, iPhone 12)
- UI Mode para debugging interactivo
- Codegen para generar tests automáticamente
- Screenshots y videos de fallos
- Trazas de ejecución
- Reportes HTML interactivos

**Tests Implementados**:
- `e2e/auth.spec.ts` - Autenticación (Login, Registro, Validaciones)
- `e2e/dashboard.spec.ts` - Dashboard, AI Insights, Estadísticas
- `e2e/gastos.spec.ts` - CRUD de gastos, Importación/Exportación Excel

**Configuración**:
- `playwright.config.ts` - Configuración multi-navegador con auto-start del dev server
- Auto-retry en CI (2 reintentos)
- Ejecución paralela

**Scripts agregados**:
```bash
npm run test:e2e          # Ejecutar tests E2E
npm run test:e2e:ui       # Modo UI (debugging)
npm run test:e2e:headed   # Con navegador visible
npm run test:e2e:debug    # Modo debug paso a paso
npm run test:e2e:report   # Ver reporte HTML
npm run test:e2e:codegen  # Generar tests grabando
```

**Ventajas sobre Cypress**:
- Más rápido (paralelismo nativo)
- Mejor soporte multi-navegador (WebKit/Safari)
- Mejor debugging (UI mode, traces)
- Menos flakiness (esperas automáticas)
- Sin servidor proxy

---

## v2.1.0 (2025-11-28)
**Release**: Sistema de componentes de Input estilo iOS

**Nuevos Componentes** (`src/components/common/Input.tsx`):
- **Input**: 4 variantes (default, filled, underlined, ios)
- **TextArea**: Auto-resize opcional
- **Select**: Personalizado con iconos y estados
- **InputGroup**: Contenedor estilo iOS Settings
- **InputRow**: Fila para usar dentro de InputGroup
- **Switch**: Toggle estilo iOS con animaciones

**Características**:
- Labels flotantes opcionales
- Estados de validación (error, success)
- Iconos personalizables (izquierda/derecha)
- Helper text y mensajes de error
- Animaciones suaves
- Auto-resize en TextArea

**Archivos creados**:
- `src/components/common/Input.tsx`
- `src/components/common/InputExamples.tsx`

---

## v2.0.0 (2025-11-20)
**Release**: Implementación completa de UI y funcionalidades avanzadas

**Nuevas funcionalidades**:
- PWA completa con Workbox (instalable, offline-first)
- Backend API propio para comunicación con Anthropic
- Sistema de conversaciones persistentes para el asistente IA
- Soporte multi-moneda (PEN/USD)
- Presupuesto General (además de por categoría)
- Subcategorías para gastos
- Configuración dinámica (categorías, métodos de pago, monedas)
- Página de Configuración con tabs
- Layout responsive con bottom navigation móvil
- AIInsights en Dashboard
- BudgetMonitor para alertas de presupuesto
- Toast invertido (opción de apariencia)

**Componentes implementados**:
- Dashboard, AIInsights, InstallPWA
- AsistenteIA con historial de chats
- ListaPresupuestos con soporte general
- Configuracion (Perfil, Apariencia, Categorías, Métodos, Monedas)
- Layout con MobileMenu y BudgetMonitor
- CustomLoader, ErrorAlert

**Nuevos hooks**: `useAssistant`, `usePWAInstall`
**Nuevos servicios**: `ai.ts`, `config.ts`
**Dependencias**: vite-plugin-pwa, workbox-window, lucide-react, emoji-picker-react, sharp

---

## v1.0.1 (2025-11-14)
**Cambio**: Downgrade de Tailwind CSS v4 a v3
- Problema: v4.1.17 (beta) instalado automáticamente — configuración incompatible con v3
- Solución: `npm install -D tailwindcss@^3.4.0`
- Estado: Resuelto

---

## v1.0.0 (2025-11-14)
- Setup inicial del proyecto
- Configuración TypeScript estricto
- Servicios Firebase, Anthropic, Excel
- Utilidades, Contexts, Hooks
- Configuración de testing
- Documentación completa
