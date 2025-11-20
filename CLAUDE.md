# 🤖 CLAUDE.md - Especificaciones Técnicas del Proyecto

> Documentación técnica completa para replicar el proyecto de Gestión de Gastos Personales

**Fecha de creación**: 2025-11-14
**Última actualización**: 2025-11-20
**Versión**: 2.0.0

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
- CRUD de gastos con categorización y subcategorías
- Dashboard con estadísticas, gráficos y AI Insights
- Importación/Exportación Excel
- Presupuestos mensuales con alertas (por categoría y general)
- Asistente IA conversacional con historial de chats
- Soporte multi-moneda (PEN/USD)
- PWA completa (instalable, offline-first)
- Sistema de configuración dinámica (categorías, métodos de pago, monedas)
- Modo oscuro/claro con detección automática
- Layout responsive con navegación móvil optimizada
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

**Nota**: La comunicación con Anthropic ahora se hace a través de un backend propio (`http://localhost:3000/api`) en lugar de directamente desde el frontend.

### PWA
```json
{
  "vite-plugin-pwa": "^1.1.0",
  "workbox-window": "^7.3.0"
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
  "react-hot-toast": "^2.6.0",
  "lucide-react": "^0.553.0",
  "emoji-picker-react": "^4.15.1"
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
├── components/         # UI Components
│   ├── auth/          # Autenticación (Login, Registro)
│   ├── dashboard/     # Dashboard (Dashboard, AIInsights)
│   ├── gastos/        # Gestión de gastos (Lista, Formulario)
│   ├── importar/      # Import/Export Excel
│   ├── asistente/     # Chat IA con historial
│   ├── presupuestos/  # Presupuestos mensuales
│   ├── config/        # Configuración (Perfil, Apariencia, Categorías, etc.)
│   ├── layout/        # Layout y navegación (Layout, MobileMenu)
│   └── common/        # Componentes reutilizables (ErrorAlert, CustomLoader, InstallPWA, BudgetMonitor)
├── context/           # React Contexts (Auth, Theme)
├── hooks/             # Custom Hooks (useGastos, usePresupuestos, useAssistant, usePWAInstall)
├── services/          # External Services (firebase, ai, config, excel, import)
├── types/             # TypeScript Types
├── utils/             # Pure Functions (formatters, calculations, validators, tagsSugeridos)
├── mocks/             # Test Mocks
└── tests/             # Test Setup
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
  subcategoria?: string;
  monto: number;
  moneda: Moneda; // 'PEN' | 'USD'
  descripcion: string;
  metodoPago: MetodoPago;
  tags?: string[];
  recurrente?: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

#### Monedas
```typescript
export const MONEDAS = ['PEN', 'USD'] as const;
export type Moneda = (typeof MONEDAS)[number];

export const MONEDA_SIMBOLOS: Record<Moneda, string> = {
  PEN: 'S/',
  USD: '$',
};
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
// Categoría especial para presupuesto general
export const CATEGORIA_GENERAL = 'general' as const;
export type CategoriaGastoOGeneral = CategoriaGasto | typeof CATEGORIA_GENERAL;

interface Presupuesto {
  id: string;
  userId: string;
  mes: string; // YYYY-MM
  categoria: CategoriaGastoOGeneral; // Incluye 'general' para presupuesto total
  subcategoria?: string;
  limite: number;
  moneda: Moneda;
  gastado: number;
  alertaEnviada80?: boolean;
  alertaEnviada100?: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

**Nota**: Los presupuestos con categoría `general` representan el ingreso/presupuesto total del mes (ej: sueldo, CTS, etc.).

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
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg'],
      manifest: {
        name: 'Gastos - Gestor de Finanzas Personales',
        short_name: 'Gastos',
        description: 'Aplicación minimalista para gestionar tus finanzas personales',
        theme_color: '#5d6672',
        background_color: '#f7f8fa',
        display: 'standalone',
        orientation: 'portrait',
        icons: [
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: { cacheName: 'google-fonts-cache' }
          },
          {
            urlPattern: /^https:\/\/firebasestorage\.googleapis\.com\/.*/i,
            handler: 'NetworkFirst',
            options: { cacheName: 'firebase-storage-cache' }
          }
        ]
      },
      devOptions: { enabled: true }
    })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      // ... mismo que tsconfig
    },
  },
});
```

**Decisiones**:
- PWA con Workbox para caching inteligente
- Auto-update para actualizaciones automáticas
- CacheFirst para fonts, NetworkFirst para datos dinámicos

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

### AI Service (`src/services/ai.ts`)

**Responsabilidad**: Comunicación con el backend para el asistente de IA.

```typescript
// URL base del backend
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

// Funciones principales
export async function callAssistant(message: string, month: number, year: number): Promise<AssistantResponse>;
export async function getConversations(): Promise<Conversation[]>;
export async function createConversation(title?: string): Promise<Conversation>;
export async function getMessages(conversationId: string): Promise<ConversationMessage[]>;
export async function sendMessageToConversation(conversationId: string, message: string, month?: number, year?: number): Promise<AssistantResponse>;
export async function deleteConversation(id: string): Promise<void>;
export async function updateConversation(id: string, title: string): Promise<Conversation>;

// Preguntas sugeridas
export const SUGGESTED_QUESTIONS = [
  '¿Cómo van mis gastos este mes?',
  '¿En qué categoría gasto más?',
  '¿Qué puedo hacer para ahorrar más?',
  '¿Cómo puedo empezar a invertir?',
  // ... más sugerencias
];
```

**Características**:
- Autenticación via Firebase ID Token
- Conversaciones persistentes
- Historial de mensajes
- Validación de mensajes (máx 1000 caracteres)

**Arquitectura**:
```
Frontend → API Backend (localhost:3000) → Anthropic Claude
              ↓
         Firebase Auth (validación token)
         Firestore (conversaciones)
```

### Config Service (`src/services/config.ts`)

**Responsabilidad**: CRUD de configuración dinámica (categorías, métodos de pago, monedas).

```typescript
export const ConfigService = {
  // Categories
  getCategories(): Promise<Category[]>;
  createCategory(data: CreateCategoryDto): Promise<Category>;
  updateCategory(id: string, data: UpdateCategoryDto): Promise<Category>;
  deleteCategory(id: string): Promise<void>;

  // Subcategories
  createSubcategory(categoryId: string, data: CreateSubcategoryDto): Promise<Subcategory>;
  updateSubcategory(categoryId: string, subcategoryId: string, data: UpdateSubcategoryDto): Promise<Subcategory>;
  deleteSubcategory(categoryId: string, subcategoryId: string): Promise<void>;

  // Payment Methods
  getPaymentMethods(): Promise<PaymentMethod[]>;
  createPaymentMethod(data: CreatePaymentMethodDto): Promise<PaymentMethod>;
  updatePaymentMethod(id: string, data: UpdatePaymentMethodDto): Promise<PaymentMethod>;
  deletePaymentMethod(id: string): Promise<void>;

  // Currencies
  getCurrencies(): Promise<Currency[]>;
  createCurrency(data: CreateCurrencyDto): Promise<Currency>;
  updateCurrency(id: string, data: UpdateCurrencyDto): Promise<Currency>;
  deleteCurrency(id: string): Promise<void>;
};
```

**Características**:
- Permite al usuario personalizar categorías, métodos de pago y monedas
- Sincronizado con backend vía REST API
- Autenticación via Firebase token

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

**Responsabilidad**: Modo oscuro/claro con personalización de toasts.

```typescript
interface ThemeContextType {
  tema: TemaApp; // 'light' | 'dark' | 'system'
  temaEfectivo: 'light' | 'dark';
  setTema: (tema: TemaApp) => void;
  toggleTema: () => void;
  toastInvertido: boolean;
  setToastInvertido: (invertido: boolean) => void;
  // Aliases en inglés para compatibilidad
  theme: TemaApp;
  effectiveTheme: 'light' | 'dark';
  setTheme: (tema: TemaApp) => void;
  toggleTheme: () => void;
}
```

**Características**:
- Detecta preferencia del sistema
- Persiste en localStorage (`tema-app`, `toast-invertido`)
- Aplica clase al `<html>`
- Opción de invertir colores de toast
- Aliases en inglés/español para flexibilidad

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

### useAssistant

**Responsabilidad**: Gestión del asistente IA con conversaciones persistentes.

```typescript
interface UseAssistantReturn {
  conversations: Conversation[];
  currentConversationId: string | null;
  messages: ConversationMessage[];
  isLoading: boolean;
  isLoadingConversations: boolean;
  error: string | null;
  loadConversations: () => Promise<void>;
  selectConversation: (id: string) => Promise<void>;
  createNewConversation: (title?: string) => Promise<string>;
  deleteChat: (id: string) => Promise<void>;
  renameChat: (id: string, title: string) => Promise<void>;
  sendMessage: (message: string, month?: number, year?: number) => Promise<void>;
  clearCurrentConversation: () => void;
}
```

**Patrón**:
1. Carga de historial de conversaciones
2. Selección y carga de mensajes
3. Creación automática de conversación al primer mensaje
4. Mensajes optimistas (actualiza UI antes de respuesta)
5. Manejo de errores con toast

### usePWAInstall

**Responsabilidad**: Gestión de instalación PWA.

```typescript
interface UsePWAInstallReturn {
  isInstallable: boolean;
  install: () => Promise<void>;
}
```

**Patrón**:
1. Escucha evento `beforeinstallprompt`
2. Almacena el evento para uso posterior
3. Muestra botón de instalación cuando disponible
4. Ejecuta prompt de instalación

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

**Variables requeridas** (`.env`):
```bash
# Firebase
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=

# Backend API
VITE_API_BASE_URL=http://localhost:3000/api

# Anthropic (solo si se usa directamente, ahora va en backend)
# VITE_ANTHROPIC_API_KEY=
```

### Scripts Disponibles

```bash
# Desarrollo
npm run dev              # Servidor de desarrollo
npm run build            # Build de producción
npm run preview          # Preview del build

# Linting y Formato
npm run lint             # ESLint
npm run lint:fix         # ESLint con auto-fix
npm run format           # Prettier
npm run format:check     # Verificar formato

# Testing
npm run test             # Vitest en modo watch
npm run test:run         # Vitest una vez
npm run test:coverage    # Coverage
npm run test:e2e         # Cypress

# Utilidades
npm run type-check       # TypeScript check
npm run generate:icons   # Generar iconos PWA
npm run check            # Type-check + Lint + Tests
npm run clean            # Limpiar dist
npm run reinstall        # Reinstalar dependencias
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
2. Hook useAssistant.sendMessage()
3. Si no hay conversación activa, crear una nueva
4. Agregar mensaje optimista a UI
5. Llamar API Backend (/chat/conversations/:id/messages)
6. Backend obtiene contexto del usuario (gastos, presupuestos)
7. Backend llama a Anthropic Claude con contexto
8. Respuesta del asistente
9. Agregar respuesta a mensajes
10. Actualizar lista de conversaciones
```

**Características adicionales**:
- Selección de mes/año para análisis
- Historial de conversaciones persistente
- Renombrar y eliminar chats
- Preguntas sugeridas predefinidas

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
- [x] ~~Implementar Service Worker (PWA)~~ ✅ Implementado v2.0.0
- [ ] Agregar i18n (internacionalización)
- [ ] WebSockets para tiempo real
- [x] ~~Backend propio para Anthropic API~~ ✅ Implementado v2.0.0

### Features
- [ ] Gastos compartidos (multi-usuario)
- [ ] Escaneo de recibos con OCR
- [ ] Notificaciones push
- [ ] Exportar a PDF
- [x] ~~Categorías personalizadas~~ ✅ Implementado v2.0.0
- [x] ~~Múltiples monedas~~ ✅ Implementado v2.0.0 (PEN/USD)
- [ ] Subcategorías dinámicas via UI
- [ ] Dashboard con más métricas
- [ ] Gráficos comparativos multi-periodo

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

### Fase 3: UI ✅
- [x] Componentes de autenticación (Login, Registro)
- [x] Dashboard con gráficos y AI Insights
- [x] CRUD de gastos con subcategorías
- [x] Importar/Exportar Excel
- [x] Chat IA con historial de conversaciones
- [x] Presupuestos (categorías + general)
- [x] Configuración (Perfil, Apariencia, Categorías, Métodos, Monedas)
- [x] Layout responsive con navegación móvil
- [x] PWA (instalable, offline-first)

### Fase 4: Testing (En progreso)
- [ ] Unit tests (utils)
- [ ] Component tests
- [ ] Integration tests
- [ ] E2E tests
- [ ] Coverage > 80%

### Fase 5: Deploy (En progreso)
- [x] Configurar Firebase
- [x] Variables de entorno
- [ ] Build de producción optimizado
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

### v2.0.0 (2025-11-20)
**Release**: Implementación completa de UI y funcionalidades avanzadas

**Nuevas Funcionalidades**:
- ✅ PWA completa con Workbox (instalable, offline-first)
- ✅ Backend API propio para comunicación con Anthropic
- ✅ Sistema de conversaciones persistentes para el asistente IA
- ✅ Soporte multi-moneda (PEN/USD)
- ✅ Presupuesto General (además de por categoría)
- ✅ Subcategorías para gastos
- ✅ Configuración dinámica (categorías, métodos de pago, monedas)
- ✅ Página de Configuración con tabs (Perfil, Apariencia, Categorías, etc.)
- ✅ Layout responsive con bottom navigation móvil
- ✅ AIInsights en Dashboard
- ✅ BudgetMonitor para alertas de presupuesto
- ✅ Toast invertido (opción de apariencia)

**Componentes Implementados**:
- Dashboard, AIInsights, InstallPWA
- AsistenteIA con historial de chats
- ListaPresupuestos con soporte general
- Configuracion (Perfil, Apariencia, Categorías, Métodos, Monedas)
- Layout con MobileMenu y BudgetMonitor
- CustomLoader, ErrorAlert

**Nuevos Hooks**:
- useAssistant (gestión de chat IA)
- usePWAInstall (instalación PWA)

**Nuevos Servicios**:
- ai.ts (comunicación con backend)
- config.ts (CRUD de configuración)

**Dependencias Agregadas**:
- vite-plugin-pwa, workbox-window
- lucide-react, emoji-picker-react, sharp

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

**Última actualización**: 2025-11-20
**Mantenedor**: Claude (Anthropic)
**Versión del proyecto**: 2.0.0

---

<p align="center">
  Este documento es una <strong>especificación viva</strong>.
  Actualizar con cada cambio técnico importante.
</p>
