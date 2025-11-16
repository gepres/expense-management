# 💰 Gastos - Gestor de Finanzas Personales

Aplicación web progresiva (PWA) minimalista para la gestión de gastos y presupuestos personales.

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![React](https://img.shields.io/badge/React-19.2.0-61dafb.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9.3-3178c6.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

---

## ✨ Características

### 📱 Progressive Web App (PWA)
- ✅ Instalable en cualquier dispositivo (móvil, tablet, desktop)
- ✅ Funciona offline con Service Worker
- ✅ Caché inteligente de recursos
- ✅ Experiencia similar a app nativa

### 🎨 Diseño Minimalista
- ✅ Colores mates y opacos
- ✅ Dark mode fluido
- ✅ Tipografía limpia y espaciado amplio
- ✅ Interfaz intuitiva y moderna

### 💸 Gestión de Gastos
- ✅ Registro de gastos con categorías y subcategorías
- ✅ Soporte multi-moneda (PEN y USD)
- ✅ Métodos de pago variados (efectivo, tarjetas, Yape, Plin)
- ✅ Filtros avanzados por fecha, categoría, método de pago
- ✅ Búsqueda en tiempo real
- ✅ Edición y eliminación de gastos

### 🎯 Presupuestos
- ✅ Presupuestos por categoría
- ✅ Presupuesto general del mes (múltiples ingresos)
- ✅ Seguimiento de límites y alertas
- ✅ Visualización de gastos vs presupuesto
- ✅ Cálculo automático de saldos

### 📊 Dashboard
- ✅ Resumen de gastos del mes actual
- ✅ Gráficos interactivos (por categoría)
- ✅ Estadísticas detalladas
- ✅ Comparación con presupuesto
- ✅ Separación por moneda

### 📥 Importación
- ✅ Importar gastos desde Excel/CSV
- ✅ Validación de archivo antes de importar
- ✅ Preview de datos
- ✅ Descarga de plantilla
- ✅ Manejo de errores detallado

### 🤖 Asistente IA (Próximamente)
- 🔄 Chat inteligente para análisis de gastos
- 🔄 Recomendaciones personalizadas
- 🔄 Integración con Claude AI

---

## 🚀 Inicio Rápido

### Requisitos Previos

- Node.js 18+ ([descargar](https://nodejs.org/))
- npm o yarn
- Cuenta de Firebase ([crear cuenta](https://firebase.google.com/))

### Instalación

```bash
# Clonar el repositorio
git clone https://github.com/tu-usuario/gastos.git
cd gastos

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales de Firebase
```

### Configuración de Firebase

1. Crea un proyecto en [Firebase Console](https://console.firebase.google.com/)
2. Habilita **Authentication** con Email/Password
3. Crea una base de datos **Firestore**
4. Copia las credenciales de configuración a `.env`

### Desarrollo

```bash
# Iniciar servidor de desarrollo
npm run dev

# Abrir en el navegador
# http://localhost:5173
```

### Producción

```bash
# Construir para producción
npm run build

# Preview de producción local
npm run preview

# Los archivos estarán en /dist
```

---

## 📁 Estructura del Proyecto

```
gastos/
├── public/                  # Archivos estáticos
│   ├── pwa-*.png           # Iconos PWA
│   ├── favicon.svg         # Favicon
│   └── GENERAR_ICONOS.md   # Guía para regenerar iconos
├── scripts/                # Scripts de utilidades
│   └── generate-icons.js   # Generador de iconos PWA
├── src/
│   ├── components/         # Componentes React
│   │   ├── asistente/      # Asistente IA
│   │   ├── auth/           # Login y registro
│   │   ├── dashboard/      # Dashboard principal
│   │   ├── gastos/         # Gestión de gastos
│   │   ├── importar/       # Importación de archivos
│   │   ├── layout/         # Layout y navegación
│   │   └── presupuestos/   # Gestión de presupuestos
│   ├── context/            # Contextos de React
│   │   ├── AuthContext.tsx # Autenticación
│   │   └── ThemeContext.tsx# Dark mode
│   ├── hooks/              # Custom hooks
│   ├── services/           # Servicios de API
│   │   ├── ai.ts           # Servicio de IA
│   │   ├── firebase.ts     # Firebase
│   │   ├── gastos.ts       # CRUD de gastos
│   │   ├── import.ts       # Importación
│   │   └── presupuestos.ts # CRUD de presupuestos
│   ├── types/              # TypeScript types
│   ├── utils/              # Utilidades
│   ├── App.tsx             # Componente principal
│   ├── index.css           # Estilos globales
│   └── main.tsx            # Entry point
├── categorias.json         # Catálogo de categorías (para backend)
├── categorias-types.ts     # Tipos TypeScript de categorías
├── CATEGORIAS.md           # Documentación de categorías
├── BACKEND_API_SPEC.md     # Especificación de APIs del backend
├── README_ASISTENTE_IA.md  # Documentación del asistente IA
├── README_CATEGORIAS.md    # Guía de categorías
├── README_ESTILO_PWA.md    # Documentación de diseño y PWA
├── .env.example            # Ejemplo de variables de entorno
├── package.json            # Dependencias
├── tailwind.config.js      # Configuración de Tailwind
├── tsconfig.json           # Configuración de TypeScript
└── vite.config.ts          # Configuración de Vite y PWA
```

---

## 🛠️ Tecnologías

### Frontend
- **React 19.2** - Librería de UI
- **TypeScript 5.9** - Tipado estático
- **Vite 7.2** - Build tool y dev server
- **Tailwind CSS 3.4** - Framework de estilos
- **React Router 7** - Enrutamiento
- **Framer Motion** - Animaciones

### Backend / Servicios
- **Firebase 12.6** - Backend as a Service
  - Authentication (Email/Password)
  - Firestore (Base de datos NoSQL)
  - Hosting (opcional)
- **REST API** (separado) - Para IA e importación
  - Ver `BACKEND_API_SPEC.md`

### Herramientas
- **ESLint** - Linting
- **Prettier** - Formateo de código
- **Vitest** - Testing unitario
- **Cypress** - Testing E2E
- **Sharp** - Procesamiento de imágenes

### PWA
- **Vite PWA Plugin** - Generación de Service Worker
- **Workbox** - Estrategias de caché

---

## 📚 Documentación

- **[BACKEND_API_SPEC.md](./BACKEND_API_SPEC.md)** - Especificación completa de APIs del backend
- **[CATEGORIAS.md](./CATEGORIAS.md)** - Catálogo de categorías y subcategorías
- **[README_ASISTENTE_IA.md](./README_ASISTENTE_IA.md)** - Implementación del asistente IA
- **[README_CATEGORIAS.md](./README_CATEGORIAS.md)** - Guía de uso de categorías
- **[README_ESTILO_PWA.md](./README_ESTILO_PWA.md)** - Diseño minimalista y PWA

---

## 🧪 Scripts Disponibles

```bash
# Desarrollo
npm run dev              # Servidor de desarrollo
npm run build            # Build de producción
npm run preview          # Preview de producción

# Calidad de código
npm run lint             # Linter
npm run type-check       # Verificación de tipos
npm run format           # Formatear código
npm run format:check     # Verificar formato

# Testing
npm run test             # Tests unitarios
npm run test:ui          # Tests con UI
npm run test:run         # Tests sin watch
npm run test:coverage    # Coverage
npm run test:e2e         # Tests E2E
npm run test:e2e:headless # Tests E2E headless

# Utilidades
node scripts/generate-icons.js  # Generar iconos PWA
```

---

## 🌐 Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto:

```bash
# Firebase Configuration
VITE_FIREBASE_API_KEY=tu-api-key
VITE_FIREBASE_AUTH_DOMAIN=tu-proyecto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=tu-proyecto-id
VITE_FIREBASE_STORAGE_BUCKET=tu-proyecto.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef

# Backend API (para IA e importación)
VITE_API_BASE_URL=http://localhost:3000/api
# O en producción: https://tu-backend.com/api
```

Ver `.env.example` para más detalles.

---

**Hecho con ❤️ en Perú 🇵🇪**

