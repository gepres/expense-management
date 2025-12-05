# 🎭 Tests E2E con Playwright

Tests End-to-End para la aplicación de Gestión de Gastos Personales usando Playwright.

## 📋 Contenido de Tests

### Tests Públicos (sin autenticación)
- `auth.spec.ts` - Tests de autenticación (Login, Registro, Validaciones) - **7 tests**
- `dashboard.spec.ts` - Tests de páginas públicas, navegación, responsive, accesibilidad - **13 tests**
- `gastos.spec.ts` - Tests de rutas protegidas, PWA, performance, tema - **15 tests**

### Tests Autenticados
- `dashboard-authenticated.spec.ts` - Tests que requieren login (Dashboard, Gastos, Presupuestos, Asistente IA, Config) - **8 tests**

**Total: 43 tests** (35 públicos + 8 autenticados)

## 🚀 Comandos Disponibles

### Ejecutar Tests

```bash
# Ejecutar todos los tests (headless)
npm run test:e2e

# Windows: Usar script batch (recomendado)
.\test-e2e.bat

# Ejecutar con navegador visible
npm run test:e2e:headed

# Ejecutar solo tests públicos (sin autenticación)
npm run test:e2e -- --grep-invert "Dashboard Autenticado|Funcionalidades Protegidas"

# Ejecutar solo tests autenticados
npm run test:e2e -- --grep "Dashboard Autenticado|Funcionalidades Protegidas"

# Ejecutar solo un archivo
npx playwright test auth.spec.ts

# Ejecutar un test específico
npx playwright test -g "debe mostrar el formulario de login"

# Ejecutar en un navegador específico
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit
```

### Debugging

```bash
# Modo UI (recomendado para debugging)
npm run test:e2e:ui

# Modo debug paso a paso
npm run test:e2e:debug

# Ver último reporte HTML
npm run test:e2e:report

# Ejecutar con inspector
npx playwright test --debug

# Ver trazas de un test fallido
npx playwright show-trace test-results/.../trace.zip
```

### Generar Tests

```bash
# Codegen: graba interacciones y genera código
npm run test:e2e:codegen
```

## 🔧 Setup Inicial

### 1. Instalar Navegadores

```bash
npx playwright install
```

### 2. Variables de Entorno para Tests Autenticados

Crear archivo `.env.test` en la raíz del proyecto:

```bash
# Credenciales de usuario de prueba (debe estar creado en Firebase)
TEST_EMAIL=test@example.com
TEST_PASSWORD=TestPassword123

# Variables de Firebase (las mismas que .env)
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123
```

### 3. Crear Usuario de Prueba en Firebase

1. Ve a Firebase Console
2. Authentication > Users > Add user
3. Email: `test@example.com` (o el que configuraste)
4. Password: `TestPassword123` (o la que configuraste)

### 4. (Solo Windows) Configurar Path de Navegadores

Si estás en Windows y los tests no encuentran los navegadores:

**Opción A: Usar script batch (recomendado)**
```bash
.\test-e2e.bat
```

**Opción B: Exportar variable manualmente**
```bash
# PowerShell
$env:PLAYWRIGHT_BROWSERS_PATH="C:\Users\User\AppData\Local\ms-playwright"
npm run test:e2e

# Git Bash
export PLAYWRIGHT_BROWSERS_PATH="C:\Users\User\AppData\Local\ms-playwright"
npm run test:e2e
```

## 🎯 Estructura de Tests

### Tests Autenticados

Los tests autenticados usan un helper de login inline para máxima confiabilidad:

```typescript
import { test, expect } from '@playwright/test';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.test' });

const TEST_EMAIL = process.env.TEST_EMAIL || '';
const TEST_PASSWORD = process.env.TEST_PASSWORD || '';

async function doLogin(page: any) {
  await page.goto('/login');
  await page.fill('input[type="email"]', TEST_EMAIL);
  await page.fill('input[type="password"]', TEST_PASSWORD);
  await page.click('button[type="submit"]');
  await page.waitForURL(/\/(dashboard)?/, { timeout: 10000 });
  await page.waitForTimeout(2000); // Esperar que Firebase guarde el estado
}

test('mi test autenticado', async ({ page }) => {
  await doLogin(page);

  // Ahora puedes navegar a rutas protegidas
  await page.goto('/dashboard');
  await expect(page).toHaveURL(/\/dashboard/);
});
```

### Patrón Básico

```typescript
import { test, expect } from '@playwright/test';

test.describe('Nombre del Grupo', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/ruta');
  });

  test('debe hacer algo específico', async ({ page }) => {
    // Interactuar con la página
    await page.click('button');

    // Verificar resultado
    await expect(page.locator('selector')).toBeVisible();
  });
});
```

### Localizadores Recomendados

```typescript
// ✅ Por rol (accesible, robusto)
page.getByRole('button', { name: 'Iniciar sesión' })

// ✅ Por texto
page.getByText('Dashboard')

// ✅ Por placeholder
page.getByPlaceholder('Email')

// ✅ Por label
page.getByLabel('Contraseña')

// ⚠️ Por selector CSS (menos robusto)
page.locator('input[type="email"]')

// ❌ Por ID o clase (frágil)
page.locator('#btn-submit') // Evitar
```

### Esperas Automáticas

Playwright espera automáticamente por:
- Elementos visibles
- Elementos habilitados
- Elementos estables (no en movimiento)
- Peticiones de red completadas

```typescript
// ✅ No necesitas waitFor, Playwright espera automáticamente
await page.click('button'); // Espera hasta que el botón sea clickeable

// ❌ Evitar timeouts manuales
await page.waitForTimeout(1000); // Mal

// ✅ Usa expect con timeout si necesario
await expect(page.locator('text=Cargando')).toBeVisible({ timeout: 10000 });
```

## 📊 Navegadores Configurados

- **Desktop Chrome** (Chromium)
- **Desktop Firefox**
- **Desktop Safari** (WebKit)
- **Mobile Chrome** (Pixel 5)
- **Mobile Safari** (iPhone 12)

## 🔧 Configuración

Ver `playwright.config.ts` para configuración completa:

- **Base URL**: `http://localhost:5173`
- **Timeout**: 30 segundos por test
- **Reintentos**: 2 en CI, 0 en local
- **Screenshots**: Solo al fallar
- **Videos**: Solo al fallar
- **Traces**: Solo al reintentar
- **Web Server**: Auto-start con `npm run dev`

## 📝 Mejores Prácticas

### 1. Tests Independientes

Cada test debe ser independiente y poder ejecutarse en cualquier orden.

```typescript
// ✅ Correcto
test('debe crear gasto', async ({ page }) => {
  await page.goto('/gastos');
  // ... setup y test completo
});

// ❌ Incorrecto (depende de test anterior)
test('debe editar gasto', async ({ page }) => {
  // Asume que ya hay un gasto creado
});
```

### 2. Usa beforeEach para Setup

```typescript
test.describe('Gastos', () => {
  test.beforeEach(async ({ page }) => {
    // Setup común
    await page.goto('/gastos');
  });

  test('test 1', async ({ page }) => {
    // Ya estamos en /gastos
  });
});
```

### 3. Verifica Estados Intermedios

```typescript
test('debe crear gasto', async ({ page }) => {
  await page.click('button:has-text("Nuevo")');

  // ✅ Verificar que el modal se abrió
  await expect(page.locator('form')).toBeVisible();

  await page.fill('input[type="number"]', '100');

  // ✅ Verificar que el valor se llenó
  await expect(page.locator('input[type="number"]')).toHaveValue('100');

  await page.click('button[type="submit"]');

  // ✅ Verificar éxito
  await expect(page.locator('text=Éxito')).toBeVisible();
});
```

### 4. Nombres Descriptivos

```typescript
// ✅ Descriptivo
test('debe mostrar error al intentar login con credenciales inválidas', async ({ page }) => {
  // ...
});

// ❌ Vago
test('test login', async ({ page }) => {
  // ...
});
```

### 5. Manejo de Autenticación

```typescript
// Opción: Login inline en cada test (usado actualmente)
async function doLogin(page: any) {
  await page.goto('/login');
  await page.fill('input[type="email"]', TEST_EMAIL);
  await page.fill('input[type="password"]', TEST_PASSWORD);
  await page.click('button[type="submit"]');
  await page.waitForURL(/\/(dashboard)?/, { timeout: 10000 });
  await page.waitForTimeout(2000);
}

test('mi test', async ({ page }) => {
  await doLogin(page);
  // Ya estamos autenticados
});
```

## 🐛 Debugging Tips

### 1. Modo UI (Recomendado)

```bash
npm run test:e2e:ui
```

Permite:
- Ver tests en tiempo real
- Inspeccionar localizadores
- Ver timeline de acciones
- Ejecutar tests paso a paso

### 2. Modo Headed

```bash
npm run test:e2e:headed
```

Ver el navegador mientras se ejecutan los tests.

### 3. Screenshots al Fallar

Los screenshots se guardan automáticamente en `test-results/` cuando un test falla.

### 4. Ver Trazas

```bash
npx playwright show-trace test-results/.../trace.zip
```

Abre una UI con timeline detallado de todo lo que pasó en el test.

### 5. Pausar Ejecución

```typescript
test('mi test', async ({ page }) => {
  await page.goto('/');

  // Pausa aquí
  await page.pause();

  await page.click('button');
});
```

## 📚 Recursos

- [Documentación Oficial Playwright](https://playwright.dev/docs/intro)
- [Best Practices](https://playwright.dev/docs/best-practices)
- [API Reference](https://playwright.dev/docs/api/class-playwright)
- [Selector Guide](https://playwright.dev/docs/selectors)

## ⚠️ Notas Importantes

### Autenticación con Firebase

Los tests están divididos en dos categorías:

#### Tests Públicos (no requieren autenticación)
- Formulario de login y validaciones
- Página de registro
- Redirecciones de rutas protegidas
- PWA features
- Responsive design
- Accesibilidad básica

#### Tests Autenticados (requieren usuario de prueba)
- Dashboard autenticado
- Navegación a páginas protegidas (Gastos, Presupuestos, Asistente IA)
- Importar/Exportar
- Configuración
- Logout

**Importante**: Los tests autenticados hacen login inline en cada test para máxima confiabilidad. Firebase usa IndexedDB para persistir autenticación, y el estado se mantiene entre navegaciones dentro del mismo test.

### Archivos Importantes

- `e2e/helpers/auth.ts` - Helper functions para autenticación
- `e2e/auth.setup.ts` - Setup de autenticación (legacy, ya no se usa)
- `.env.test` - Variables de entorno para tests
- `test-e2e.bat` - Script helper para Windows
- `playwright.config.ts` - Configuración de Playwright

## 🎯 Cobertura de Tests

### ✅ Implementado
- [x] Tests de autenticación (Login, Registro, Validaciones)
- [x] Tests de navegación y responsive
- [x] Tests de rutas protegidas
- [x] Tests de PWA (manifest, service worker, meta tags)
- [x] Tests de performance básico
- [x] Tests de tema (modo oscuro/claro)
- [x] Tests de accesibilidad básica
- [x] Tests autenticados (Dashboard, Gastos, Presupuestos, Asistente IA, Importar, Config)

### 📋 TODO
- [ ] Tests de CRUD de gastos completo
- [ ] Tests de importación/exportación Excel
- [ ] Tests de presupuestos (crear, editar, alertas)
- [ ] Tests de chat IA (enviar mensajes, historial)
- [ ] Visual regression testing
- [ ] Tests de performance avanzado
- [ ] Configurar CI/CD para ejecutar tests automáticamente

## 🚨 Troubleshooting

### Problema: "Executable doesn't exist" en Windows

**Solución**: Usa el script `test-e2e.bat` o exporta la variable `PLAYWRIGHT_BROWSERS_PATH`:

```bash
.\test-e2e.bat
```

### Problema: Tests autenticados fallan con "redirected to login"

**Causa**: El usuario de prueba no existe en Firebase o las credenciales en `.env.test` son incorrectas.

**Solución**:
1. Verifica que el usuario existe en Firebase Authentication
2. Verifica que las credenciales en `.env.test` sean correctas
3. Verifica que `.env.test` esté en la raíz del proyecto

### Problema: "Test timeout of 30000ms exceeded"

**Causas comunes**:
1. El servidor de desarrollo no está corriendo
2. La página tiene un loop infinito o error de JavaScript
3. La página nunca alcanza el estado "networkidle"

**Solución**:
1. Asegúrate de que `npm run dev` esté corriendo
2. Usa `await page.waitForLoadState('domcontentloaded')` en lugar de `'networkidle'`
3. Aumenta el timeout en `playwright.config.ts`

### Problema: Tests fallan aleatoriamente

**Causa**: Race conditions o dependencia entre tests.

**Solución**:
1. Asegúrate de que cada test sea independiente
2. Usa `--workers=1` para ejecutar tests secuencialmente durante debugging
3. Agrega esperas explícitas donde sea necesario
