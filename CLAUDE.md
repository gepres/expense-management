# 🤖 CLAUDE.md - Especificaciones Técnicas del Proyecto

> Documentación técnica completa para replicar el proyecto de Gestión de Gastos Personales

**Fecha de creación**: 2025-11-14
**Última actualización**: 2025-11-14
**Versión**: 1.0.1

---

## 📋 Índice

1. [Visión General](#-visión-general)
2. [Stack Tecnológico](#-stack-tecnológico)
3. [Arquitectura](#-arquitectura)
4. [Sistema de Tipos](#-sistema-de-tipos)
5. [Configuraciones](#-configuraciones)
6. [Patrones y Convenciones](#-patrones-y-convenciones)
7. [Servicios](#-servicios)
8. [Estado y Contextos](#-estado-y-contextos)
9. [Hooks Personalizados](#-hooks-personalizados)
10. [Utilidades](#-utilidades)
11. [Testing](#-testing)
12. [Seguridad](#-seguridad)
13. [Performance](#-performance)
14. [Deployment](#-deployment)

---

## 🎯 Visión General

### Objetivo del Proyecto
Aplicación web para gestionar gastos personales con análisis inteligente mediante IA (Claude de Anthropic).

### Características Principales
- CRUD de gastos con categorización
- Dashboard con estadísticas y gráficos
- Importación/Exportación Excel
- Presupuestos mensuales con alertas
- Asistente IA conversacional
- Modo oscuro/claro
- Testing comprehensivo

### Usuarios Target
Personas que quieren llevar un control detallado de sus finanzas personales.

---

## 🛠️ Stack Tecnológico

### Frontend
```json
{
  "react": "^19.2.0",
  "typescript": "~5.9.3",
  "vite": "^7.2.2",
  "tailwindcss": "^3.4.18",
  "react-router-dom": "^7.9.6"
}
```

**⚠️ Nota sobre Tailwind CSS**: Se usa la versión 3.x estable. La v4 (beta) tiene una configuración diferente incompatible con la actual.

### Backend/Servicios
```json
{
  "firebase": "^12.6.0",
  "@anthropic-ai/sdk": "^0.68.0"
}
```

### Librerías Clave
```json
{
  "recharts": "^3.4.1",
  "xlsx": "^0.18.5",
  "zod": "^4.1.12",
  "date-fns": "^4.1.0",
  "framer-motion": "^12.23.24",
  "react-hot-toast": "^2.6.0"
}
```

### Testing
```json
{
  "vitest": "^4.0.9",
  "@testing-library/react": "^16.3.0",
  "msw": "^2.12.1",
  "cypress": "^15.6.0"
}
```

---

## 🏗️ Arquitectura

### Principios de Diseño

1. **Separación de Concerns**
   - Componentes solo para UI
   - Lógica en hooks personalizados
   - Servicios para APIs externas
   - Utilidades para funciones puras

2. **Composición sobre Herencia**
   - Componentes funcionales con hooks
   - HOCs solo cuando es necesario (ProtectedRoute)
   - Contexts para estado compartido

3. **Single Responsibility**
   - Cada archivo/función tiene una responsabilidad clara
   - Archivos pequeños y enfocados

4. **DRY (Don't Repeat Yourself)**
   - Utilidades reutilizables
   - Componentes comunes
   - Hooks personalizados

### Flujo de Datos

```
Usuario → Componente → Hook → Servicio → Firebase/API
                ↓
              Context (estado global)
                ↓
         Otros Componentes
```

### Estructura de Carpetas

```
src/
├── components/      # UI Components
│   ├── auth/       # Autenticación
│   ├── dashboard/  # Dashboard
│   ├── gastos/     # Gestión de gastos
│   ├── graficos/   # Gráficos con Recharts
│   ├── importar/   # Import/Export
│   ├── asistente-ia/ # Chat IA
│   ├── presupuestos/ # Presupuestos
│   ├── layout/     # Layout y navegación
│   └── common/     # Componentes reutilizables
├── context/        # React Contexts
├── hooks/          # Custom Hooks
├── services/       # External Services
├── types/          # TypeScript Types
├── utils/          # Pure Functions
├── mocks/          # Test Mocks
└── tests/          # Test Setup
```

**Razón**: Organización por feature facilita escalabilidad y mantenimiento.

---

## 📐 Sistema de Tipos

### Filosofía TypeScript

- **Modo Estricto Habilitado**: `strict: true` en tsconfig
- **No usar `any`**: Preferir `unknown` si es necesario
- **Tipado explícito**: En parámetros de función y valores de retorno
- **Interfaces sobre Types**: Para objetos y contratos
- **Types para Unions**: Para tipos literales y uniones

### Tipos Principales

#### Usuario
```typescript
interface Usuario {
  id: string;
  email: string;
  nombre: string;
  photoURL?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

#### Gasto
```typescript
interface Gasto {
  id: string;
  userId: string;
  fecha: Date;
  categoria: CategoriaGasto;
  monto: number;
  descripcion: string;
  metodoPago: MetodoPago;
  tags?: string[];
  recurrente?: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

#### Categorías (Type Literal)
```typescript
export const CATEGORIAS_GASTO = [
  'alimentacion',
  'transporte',
  'entretenimiento',
  'salud',
  'servicios',
  'compras',
  'educacion',
  'vivienda',
  'otros',
] as const;

export type CategoriaGasto = (typeof CATEGORIAS_GASTO)[number];
```

**Razón**: `as const` + indexed access type crea tipos literales seguros.

#### Presupuesto
```typescript
interface Presupuesto {
  id: string;
  userId: string;
  mes: string; // YYYY-MM
  categoria: CategoriaGasto;
  limite: number;
  gastado: number;
  alertaEnviada80?: boolean;
  alertaEnviada100?: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

### Conversión Firestore ↔ App

```typescript
// Firestore usa Timestamp, app usa Date
interface GastoFirestore {
  // ... campos
  fecha: Timestamp;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Función de conversión
export const firestoreToGasto = (
  id: string,
  data: GastoFirestore
): Gasto => {
  return {
    id,
    // ...
    fecha: timestampToDate(data.fecha),
    createdAt: timestampToDate(data.createdAt),
    updatedAt: timestampToDate(data.updatedAt),
  };
};
```

**Razón**: Separar tipos de Firestore de tipos de la app para mayor claridad.

---

## ⚙️ Configuraciones

### TypeScript (`tsconfig.app.json`)

```json
{
  "compilerOptions": {
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitAny": true,
    "strictNullChecks": true,

    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"],
      "@components/*": ["./src/components/*"],
      "@hooks/*": ["./src/hooks/*"],
      "@context/*": ["./src/context/*"],
      "@services/*": ["./src/services/*"],
      "@types/*": ["./src/types/*"],
      "@utils/*": ["./src/utils/*"],
      "@mocks/*": ["./src/mocks/*"]
    }
  }
}
```

**Decisión**: Path aliases para imports limpios y refactoring más fácil.

### Vite (`vite.config.ts`)

```typescript
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      // ... mismo que tsconfig
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/tests/setup.ts',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/tests/',
        '**/*.test.{ts,tsx}',
        '**/*.spec.{ts,tsx}',
        '**/types/**',
      ],
    },
  },
});
```

**Decisión**: v8 para coverage (más rápido que Istanbul).

### Tailwind CSS

```javascript
// tailwind.config.js
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: 'class', // Control manual del modo oscuro
  theme: {
    extend: {},
  },
};
```

**CSS Variables** en `src/index.css`:
```css
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --primary: 221.2 83.2% 53.3%;
  /* ... más variables */
}

.dark {
  --background: 222.2 84% 4.9%;
  --foreground: 210 40% 98%;
  /* ... versiones oscuras */
}
```

**Razón**: Variables CSS permiten cambio dinámico de tema.

---

## 🎨 Patrones y Convenciones

### Nomenclatura

#### Archivos
- **Componentes**: PascalCase (`FormularioGasto.tsx`)
- **Hooks**: camelCase con prefijo `use` (`useGastos.ts`)
- **Utilidades**: camelCase (`formatters.ts`)
- **Tipos**: camelCase (`index.ts`)
- **Tests**: `.test.ts` o `.test.tsx`

#### Variables y Funciones
```typescript
// Variables: camelCase
const totalGastos = 100;
const gastosDelMes = [];

// Funciones: camelCase, verbos descriptivos
function calcularTotalGastos() {}
async function obtenerGastos() {}

// Constantes: UPPER_SNAKE_CASE
const MAX_FILE_SIZE = 10 * 1024 * 1024;

// Enums/Arrays constantes: PascalCase + as const
export const CATEGORIAS_GASTO = [...] as const;
```

#### Componentes
```typescript
// PascalCase
function FormularioGasto() {}
export default FormularioGasto;

// Props interface: NombreComponente + Props
interface FormularioGastoProps {
  onSubmit: (data: Gasto) => void;
}
```

### Estructura de Componentes

```typescript
/**
 * Descripción del componente
 */
import React from 'react';
// imports externos
// imports internos

// Types/Interfaces
interface ComponentProps {
  // ...
}

// Componente principal
export default function Component({ prop1, prop2 }: ComponentProps): JSX.Element {
  // 1. Hooks de React
  const [state, setState] = useState();

  // 2. Custom hooks
  const { data } = useCustomHook();

  // 3. Funciones helper
  const handleClick = () => {};

  // 4. useEffect
  useEffect(() => {}, []);

  // 5. Early returns
  if (loading) return <Loading />;

  // 6. Render
  return (
    <div>
      {/* JSX */}
    </div>
  );
}
```

### Manejo de Errores

```typescript
// Try-catch con tipos específicos
try {
  await service.create(data);
  toast.success('Éxito');
} catch (error) {
  const errorMsg = error instanceof Error
    ? error.message
    : 'Error desconocido';
  toast.error(errorMsg);
  throw error; // Re-throw si necesario
}
```

### Async/Await

```typescript
// ✅ Correcto: async/await
async function fetchData() {
  const data = await api.get();
  return data;
}

// ❌ Evitar: .then/.catch
function fetchData() {
  return api.get()
    .then(data => data)
    .catch(err => console.error(err));
}
```

---

## 🔌 Servicios

### Firebase Service (`src/services/firebase.ts`)

**Responsabilidad**: Toda la comunicación con Firebase.

```typescript
// Estructura
export { app, auth, db, storage };

export const authService = {
  registrar,
  login,
  loginConGoogle,
  logout,
  obtenerUsuarioActual,
  onAuthChange,
};

export const gastosService = {
  crear,
  obtenerPorId,
  obtenerPorUsuario,
  actualizar,
  eliminar,
  obtenerPorRangoFechas,
};

export const presupuestosService = {
  crear,
  obtenerPorMes,
  actualizar,
  eliminar,
};
```

**Decisiones**:
- Funciones de conversión separadas (`firestoreToGasto`)
- Manejo de Timestamp ↔ Date
- Tipos específicos para Firestore vs App
- `serverTimestamp()` para fechas en Firestore

### Anthropic Service (`src/services/anthropic.ts`)

**Responsabilidad**: Comunicación con Claude AI.

```typescript
export const anthropicService = {
  enviarMensaje,
  analizarGastos,
  consejosAhorro,
  explicarTendencia,
  ayudarConPresupuesto,
  compararPeriodos,
};
```

**Características**:
- Contexto automático del usuario
- Mensajes del sistema predefinidos
- Streaming deshabilitado (respuesta completa)
- Modelo: `claude-3-5-sonnet-20241022`

**⚠️ Seguridad**:
```typescript
// DESARROLLO: OK usar en frontend
const anthropic = new Anthropic({
  apiKey: import.meta.env.VITE_ANTHROPIC_API_KEY,
  dangerouslyAllowBrowser: true,
});

// PRODUCCIÓN: Mover a backend
// - Crear API intermedia
// - Rate limiting
// - Autenticación
```

### Excel Service (`src/services/excel.ts`)

**Responsabilidad**: Import/Export de datos Excel.

```typescript
export const excelService = {
  importar,           // File → Gastos[]
  exportarGastos,     // Gastos[] → File
  exportarEstadisticas, // Stats → File
  generarPlantilla,   // → Template file
};
```

**Características**:
- Validación con Zod
- Normalización de categorías (alternativas)
- Vista previa antes de importar
- Múltiples hojas en exportación

---

## 🔄 Estado y Contextos

### AuthContext

**Responsabilidad**: Estado global de autenticación.

```typescript
interface AuthContextType {
  usuario: Usuario | null;
  cargando: boolean;
  error: string | null;
  login: (credenciales: LoginCredenciales) => Promise<void>;
  loginConGoogle: () => Promise<void>;
  registrar: (credenciales: RegistroCredenciales) => Promise<void>;
  logout: () => Promise<void>;
  actualizarUsuario: () => Promise<void>;
}
```

**Patrón**:
```typescript
// 1. Crear Context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// 2. Provider
export function AuthProvider({ children }) {
  // Estado y lógica
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// 3. Hook personalizado
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
```

**Decisión**: Hook personalizado previene uso fuera del provider.

### ThemeContext

**Responsabilidad**: Modo oscuro/claro.

```typescript
interface ThemeContextType {
  tema: TemaApp; // 'light' | 'dark' | 'system'
  temaEfectivo: 'light' | 'dark';
  setTema: (tema: TemaApp) => void;
  toggleTema: () => void;
}
```

**Características**:
- Detecta preferencia del sistema
- Persiste en localStorage
- Aplica clase al `<html>`

---

## 🪝 Hooks Personalizados

### useGastos

**Responsabilidad**: Gestión completa de gastos.

```typescript
interface UseGastosReturn {
  gastos: Gasto[];
  estado: Estado<Gasto[]>;
  crear: (gasto: Omit<Gasto, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Gasto | null>;
  actualizar: (id: string, gasto: Partial<Gasto>) => Promise<void>;
  eliminar: (id: string) => Promise<void>;
  obtenerPorId: (id: string) => Promise<Gasto | null>;
  recargar: () => Promise<void>;
  filtrar: (filtros: FiltrosGastos) => Gasto[];
}
```

**Patrón**:
1. Carga inicial automática (useEffect)
2. Estado local sincronizado
3. Operaciones optimistas (actualiza UI inmediatamente)
4. Toast notifications
5. Manejo de errores

### usePresupuestos

Similar a useGastos pero para presupuestos mensuales.

---

## 🛠️ Utilidades

### Formatters (`src/utils/formatters.ts`)

**Funciones Clave**:
```typescript
formatearMoneda(cantidad, moneda = 'USD', locale = 'es-ES'): string
formatearFechaCorta(fecha): string  // DD/MM/YYYY
formatearFechaLarga(fecha): string  // DD de MMMM de YYYY
formatearPorcentaje(valor, decimales = 1): string
formatearMesKey(fecha): string  // YYYY-MM
```

**Decisión**: Usar `Intl` nativo en lugar de librerías externas.

### Calculations (`src/utils/calculations.ts`)

**Funciones Clave**:
```typescript
calcularTotalGastos(gastos: Gasto[]): number
calcularEstadisticasPeriodo(gastos: Gasto[]): EstadisticasPeriodo
compararPeriodos(actual, anterior): ComparacionPeriodos
detectarTendencias(actual, anterior): TendenciaGasto[]
detectarGastosInusuales(gastos): GastoInusual[]  // Algoritmo de outliers
generarRecomendaciones(gastos, presupuestos): Recomendacion[]
```

**Algoritmo de Outliers**:
```typescript
// Usa desviación estándar
const umbral = 2; // 2σ
const desviacion = Math.abs(gasto.monto - promedio) / desviacionEstandar;
if (desviacion > umbral) {
  // Es outlier
}
```

### Validators (`src/utils/validators.ts`)

**Schemas Zod**:
```typescript
export const gastoFormSchema = z.object({
  fecha: z.string().refine(validarFecha),
  categoria: z.enum(CATEGORIAS_GASTO),
  monto: z.string().min(1).refine(esNumeroPositivo),
  descripcion: z.string().min(3).max(200),
  metodoPago: z.enum(METODOS_PAGO),
});
```

**Decisión**: Zod para validación en tiempo de ejecución + tipos TypeScript.

---

## 🧪 Testing

### Estrategia

1. **Unit Tests**: Funciones puras (utils)
2. **Component Tests**: Componentes críticos
3. **Integration Tests**: Flujos completos
4. **E2E Tests**: Happy paths

### Setup (`src/tests/setup.ts`)

```typescript
import '@testing-library/jest-dom/vitest';

// Mock Firebase
vi.mock('firebase/app');
vi.mock('firebase/auth');
vi.mock('firebase/firestore');

// Mock localStorage
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock matchMedia (para tema)
Object.defineProperty(window, 'matchMedia', {
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  })),
});
```

### Patrón AAA

```typescript
it('debe calcular total correctamente', () => {
  // Arrange
  const gastos: Gasto[] = [
    { monto: 100 },
    { monto: 200 },
  ];

  // Act
  const total = calcularTotalGastos(gastos);

  // Assert
  expect(total).toBe(300);
});
```

### Testing de Componentes

```typescript
// Custom render con providers
import { render } from '@/tests/test-utils';

it('debe renderizar componente', () => {
  render(<MiComponente />);
  expect(screen.getByText('Hello')).toBeInTheDocument();
});
```

---

## 🔒 Seguridad

### Reglas de Firestore

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null
        && request.auth.uid == userId;
    }

    match /gastos/{gastoId} {
      allow read, update, delete: if request.auth != null
        && resource.data.userId == request.auth.uid;
      allow create: if request.auth != null
        && request.resource.data.userId == request.auth.uid;
    }
  }
}
```

**Principio**: Users can only access their own data.

### Validación de Inputs

```typescript
// 1. Frontend: Zod schemas
const result = gastoFormSchema.safeParse(data);

// 2. Sanitización
export function sanitizarInput(input: string): string {
  return input
    .trim()
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/[<>'"]/g, '')  // Remove dangerous chars
    .substring(0, 500);      // Limit length
}
```

### Variables de Entorno

```typescript
// ❌ NUNCA en el código
const API_KEY = 'sk-ant-1234...';

// ✅ Siempre desde .env
const API_KEY = import.meta.env.VITE_ANTHROPIC_API_KEY;
```

---

## ⚡ Performance

### Code Splitting

```typescript
// App.tsx
const Dashboard = lazy(() => import('@components/dashboard/Dashboard'));
const Gastos = lazy(() => import('@components/gastos/ListaGastos'));

<Suspense fallback={<LoadingScreen />}>
  <Routes>
    <Route path="/" element={<Dashboard />} />
  </Routes>
</Suspense>
```

### Memoización

```typescript
// useMemo para cálculos costosos
const estadisticas = useMemo(
  () => calcularEstadisticasPeriodo(gastos),
  [gastos]
);

// useCallback para funciones en dependencias
const handleSubmit = useCallback((data) => {
  // ...
}, [dependency]);
```

### Paginación

```typescript
interface PaginacionState {
  pagina: number;
  porPagina: number;
  total: number;
  totalPaginas: number;
}
```

---

## 🚀 Deployment

### Vercel

```bash
vercel --prod
```

**Variables de entorno**: Configurar en dashboard de Vercel.

### Firebase Hosting

```bash
npm run build
firebase deploy
```

### Netlify

```bash
npm run build
netlify deploy --prod --dir=dist
```

---

## 📝 Decisiones Técnicas Importantes

### 1. TypeScript Estricto
**Razón**: Prevenir bugs en tiempo de compilación, mejor DX.

### 2. Path Aliases
**Razón**: Imports limpios, refactoring más fácil.

### 3. Context API vs Zustand
**Razón**: Context API suficiente para este tamaño de app, menor bundle size.

### 4. Recharts vs Chart.js
**Razón**: Recharts es declarativo, mejor integración con React.

### 5. date-fns vs Moment
**Razón**: date-fns es modular (tree-shakeable), Moment deprecated.

### 6. Zod vs Yup
**Razón**: Zod mejor integración con TypeScript, genera tipos automáticamente.

### 7. Vitest vs Jest
**Razón**: Vitest más rápido, mejor integración con Vite.

### 8. MSW vs Jest Mock
**Razón**: MSW más realista, funciona en browser y Node.

---

## 🔄 Flujos Principales

### Crear Gasto

```
1. Usuario llena FormularioGasto
2. Validación con Zod
3. Hook useGastos.crear()
4. Service gastosService.crear()
5. Firebase Firestore
6. Actualización estado local
7. Toast notification
8. Redirect/Update UI
```

### Importar Excel

```
1. Usuario sube archivo
2. excelService.importar()
3. Leer con XLSX
4. Validar cada fila con Zod
5. Normalizar categorías
6. Vista previa
7. Confirmar → Batch create en Firebase
8. Actualizar lista de gastos
```

### Chat con IA

```
1. Usuario escribe mensaje
2. Recopilar contexto (gastos, estadísticas, presupuestos)
3. anthropicService.enviarMensaje()
4. API Anthropic con contexto
5. Streaming response (opcional)
6. Mostrar en UI
7. Guardar historial
```

---

## 📊 Métricas y Objetivos

### Performance
- **First Contentful Paint**: < 1.5s
- **Time to Interactive**: < 3.5s
- **Bundle Size**: < 500KB (gzipped)

### Testing
- **Unit Test Coverage**: > 80%
- **Component Test Coverage**: 100% (críticos)
- **E2E Tests**: Happy paths cubiertos

### Code Quality
- **TypeScript Errors**: 0
- **ESLint Warnings**: 0
- **Prettier**: Formato consistente

---

## 🔮 Futuras Mejoras

### Técnicas
- [ ] Migrar a Server Components (Next.js)
- [ ] Implementar Service Worker (PWA)
- [ ] Agregar i18n (internacionalización)
- [ ] WebSockets para tiempo real
- [ ] Backend propio para Anthropic API

### Features
- [ ] Gastos compartidos (multi-usuario)
- [ ] Escaneo de recibos con OCR
- [ ] Notificaciones push
- [ ] Exportar a PDF
- [ ] Categorías personalizadas
- [ ] Múltiples monedas

---

## 📚 Referencias

### Documentación
- [React Docs](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [Firebase Docs](https://firebase.google.com/docs)
- [Anthropic API](https://docs.anthropic.com)

### Guías de Estilo
- [Google TypeScript Style Guide](https://google.github.io/styleguide/tsguide.html)
- [Airbnb React Style Guide](https://github.com/airbnb/javascript/tree/master/react)

### Blogs y Recursos
- [Kent C. Dodds Blog](https://kentcdodds.com/blog)
- [Dan Abramov Blog](https://overreacted.io)
- [Josh Comeau CSS](https://www.joshwcomeau.com)

---

## 📋 Checklist de Implementación

### Fase 1: Setup ✅
- [x] Inicializar proyecto
- [x] Configurar TypeScript estricto
- [x] Setup Tailwind CSS
- [x] Configurar testing
- [x] Definir tipos principales

### Fase 2: Core ✅
- [x] Servicios Firebase
- [x] Servicios Anthropic
- [x] Servicios Excel
- [x] Utilidades
- [x] Contexts
- [x] Hooks personalizados

### Fase 3: UI (Pendiente)
- [ ] Componentes de autenticación
- [ ] Dashboard con gráficos
- [ ] CRUD de gastos
- [ ] Importar/Exportar
- [ ] Chat IA
- [ ] Presupuestos

### Fase 4: Testing (Pendiente)
- [ ] Unit tests (utils)
- [ ] Component tests
- [ ] Integration tests
- [ ] E2E tests
- [ ] Coverage > 80%

### Fase 5: Deploy (Pendiente)
- [ ] Configurar Firebase
- [ ] Variables de entorno
- [ ] Build de producción
- [ ] Deploy a hosting
- [ ] Monitoreo

---

## 🤝 Contribución

### Agregar Nueva Funcionalidad

1. **Definir tipos** en `src/types/index.ts`
2. **Crear servicio** si requiere API externa
3. **Crear hook** si requiere estado/lógica
4. **Crear componentes** UI
5. **Agregar tests**
6. **Actualizar documentación**

### Modificar Existente

1. **Verificar tipos** afectados
2. **Actualizar tests**
3. **Probar localmente**
4. **Actualizar CLAUDE.md** si cambia decisión técnica

---

## 💡 Tips para Replicar

### 1. Comenzar con los Tipos
Definir todos los tipos primero facilita el desarrollo posterior.

### 2. Servicios antes que UI
Implementar lógica de negocio antes que componentes visuales.

### 3. Testing desde el Inicio
Escribir tests mientras desarrollas, no al final.

### 4. Documentar Decisiones
Cada decisión técnica importante debe documentarse.

### 5. Usar los Hooks
Los custom hooks (useGastos, usePresupuestos) ya tienen toda la lógica.

---

## 📜 Changelog

### v1.0.1 (2025-11-14)
**Cambio**: Downgrade de Tailwind CSS v4 a v3
- **Problema**: Tailwind CSS v4.1.17 (beta) instalado automáticamente por npm
- **Razón**: v4 usa configuración basada en CSS incompatible con v3
- **Solución**: Downgrade a v3.4.18 (versión estable)
- **Comando**: `npm install -D tailwindcss@^3.4.0`
- **Impacto**: Configuración `tailwind.config.js` ahora compatible
- **Estado**: ✅ Resuelto - Servidor corriendo sin errores

### v1.0.0 (2025-11-14)
- ✅ Setup inicial del proyecto
- ✅ Configuración TypeScript estricto
- ✅ Servicios Firebase, Anthropic, Excel
- ✅ Utilidades completas
- ✅ Contexts y Hooks
- ✅ Configuración de testing
- ✅ Documentación completa

---

**Última actualización**: 2025-11-14
**Mantenedor**: Claude (Anthropic)
**Versión del proyecto**: 1.0.1

---

<p align="center">
  Este documento es una <strong>especificación viva</strong>.
  Actualizar con cada cambio técnico importante.
</p>
