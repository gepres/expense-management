# 🎭 Tests E2E con Playwright

Tests End-to-End para la aplicación de Gestión de Gastos Personales usando Playwright.

## 📋 Contenido

- `auth.spec.ts` - Tests de autenticación (Login, Registro, Validaciones)
- `dashboard.spec.ts` - Tests del Dashboard, AI Insights y Estadísticas
- `gastos.spec.ts` - Tests CRUD de gastos e Importación/Exportación Excel

## 🚀 Comandos Disponibles

### Ejecutar Tests

```bash
# Ejecutar todos los tests (headless)
npm run test:e2e

# Ejecutar con navegador visible
npm run test:e2e:headed

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

# Codegen con autenticación
npx playwright codegen http://localhost:5173 --save-storage=e2e/.auth/user.json
```

## 🎯 Estructura de Tests

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
- **Microsoft Edge**
- **Google Chrome**

## 🔧 Configuración

Ver `playwright.config.ts` para configuración completa:

- **Base URL**: `http://localhost:5173`
- **Timeout**: 30 segundos por test
- **Reintentos**: 2 en CI, 0 en local
- **Screenshots**: Solo al fallar
- **Videos**: Solo al fallar
- **Traces**: Solo al reintentar

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
// Opción 1: Storage state (rápido)
test.use({ storageState: 'e2e/.auth/user.json' });

// Opción 2: Login en beforeEach (más lento pero más realista)
test.beforeEach(async ({ page }) => {
  await page.goto('/login');
  await page.fill('input[type="email"]', 'test@example.com');
  await page.fill('input[type="password"]', 'password');
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL('/dashboard');
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

Los tests actuales **NO requieren autenticación** y prueban funcionalidades públicas:
- Formulario de login y validaciones
- Página de registro
- Redirecciones de rutas protegidas
- PWA features
- Responsive design
- Accesibilidad básica

#### Para habilitar tests autenticados (opcional):

1. **Crear usuario de prueba en Firebase**:
   - Ve a Firebase Console
   - Authentication > Users > Add user
   - Email: `test@example.com`
   - Password: `testpassword123` (o la que prefieras)

2. **Configurar variables de entorno**:

   Crea archivo `.env.test`:
   ```bash
   TEST_EMAIL=test@example.com
   TEST_PASSWORD=testpassword123
   ```

3. **Habilitar auth.setup en `playwright.config.ts`**:

   Descomenta las líneas:
   ```typescript
   projects: [
     // Descomentar esto:
     {
       name: 'setup',
       testMatch: /.*\.setup\.ts/,
     },

     {
       name: 'chromium',
       use: {
         ...devices['Desktop Chrome'],
         storageState: 'e2e/.auth/user.json', // Descomentar
       },
       dependencies: ['setup'], // Descomentar
     },
     // ... resto de navegadores
   ]
   ```

4. **Crear tests autenticados**:

   Ahora puedes crear tests que accedan a rutas protegidas:
   ```typescript
   // e2e/dashboard-authenticated.spec.ts
   test.describe('Dashboard Autenticado', () => {
     test('debe mostrar estadísticas', async ({ page }) => {
       await page.goto('/dashboard');
       // El usuario ya está autenticado automáticamente
       await expect(page.locator('h1')).toContainText('Dashboard');
     });
   });
   ```

### Variables de Entorno

Crear archivo `.env.test`:

```bash
TEST_EMAIL=test@example.com
TEST_PASSWORD=testpassword123
VITE_FIREBASE_API_KEY=...
# ... otras variables
```

## 🎯 TODO

- [ ] Implementar setup de autenticación automática
- [ ] Agregar tests para Presupuestos
- [ ] Agregar tests para Configuración
- [ ] Agregar tests para Chat IA
- [ ] Implementar visual regression testing
- [ ] Agregar tests de performance
- [ ] Configurar CI/CD para ejecutar tests automáticamente
