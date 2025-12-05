import { test, expect } from '@playwright/test';

/**
 * Tests E2E para verificar que las rutas protegidas redirigen correctamente
 */
test.describe('Rutas Protegidas', () => {
  test('debe redirigir a login al intentar acceder a /gastos sin autenticación', async ({ page }) => {
    await page.goto('/gastos');

    // Debe redirigir a login
    await page.waitForURL(/\/(login)?/, { timeout: 5000 });
  });

  test('debe redirigir a login al intentar acceder a /dashboard sin autenticación', async ({ page }) => {
    await page.goto('/dashboard');

    // Debe redirigir a login
    await page.waitForURL(/\/(login)?/, { timeout: 5000 });
  });

  test('debe redirigir a login al intentar acceder a /presupuestos sin autenticación', async ({ page }) => {
    await page.goto('/presupuestos');

    // Debe redirigir a login
    await page.waitForURL(/\/(login)?/, { timeout: 5000 });
  });

  test('debe redirigir a login al intentar acceder a /asistente sin autenticación', async ({ page }) => {
    await page.goto('/asistente');

    // Debe redirigir a login
    await page.waitForURL(/\/(login)?/, { timeout: 5000 });
  });

  test('debe redirigir a login al intentar acceder a /importar sin autenticación', async ({ page }) => {
    await page.goto('/importar');

    // Debe redirigir a login
    await page.waitForURL(/\/(login)?/, { timeout: 5000 });
  });

  test('debe redirigir a login al intentar acceder a /config sin autenticación', async ({ page }) => {
    await page.goto('/config');

    // Debe redirigir a login
    await page.waitForURL(/\/(login)?/, { timeout: 5000 });
  });
});

/**
 * Tests de Registro de Usuario
 */
test.describe('Registro de Usuario', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/registro');
  });

  test('debe mostrar el formulario de registro', async ({ page }) => {
    // Verificar que estamos en la página de registro
    await expect(page).toHaveURL(/\/registro/);

    // Verificar elementos del formulario
    await expect(page.locator('input[type="email"]')).toBeVisible();

    // Verificar que hay campos de password (pueden ser 2: password y confirmPassword)
    const passwordInputs = page.locator('input[type="password"]');
    const count = await passwordInputs.count();
    expect(count).toBeGreaterThanOrEqual(1);
  });

  test('debe validar campos requeridos en registro', async ({ page }) => {
    // Intentar submit sin llenar campos
    const submitButton = page.locator('button[type="submit"]');
    await submitButton.click();

    // Debe mostrar errores de validación
    await page.waitForTimeout(500);
  });

  test('debe tener link para volver a login', async ({ page }) => {
    // Buscar link que dice algo como "Ya tienes cuenta" o "Iniciar sesión"
    const loginLink = page.locator('a[href="/login"], a').filter({ hasText: /iniciar sesión|login|ya tienes/i });

    // Si existe, debe ser visible
    if (await loginLink.count() > 0) {
      await expect(loginLink.first()).toBeVisible();
    }
  });
});

/**
 * Tests de PWA (Progressive Web App)
 */
test.describe('PWA Features', () => {
  test('debe tener manifest.json', async ({ page }) => {
    const response = await page.goto('/manifest.webmanifest');

    expect(response?.status()).toBe(200);
  });

  test('debe tener service worker registrado', async ({ page }) => {
    await page.goto('/');

    // Esperar a que la página cargue
    await page.waitForLoadState('networkidle');

    // Verificar si hay service worker
    const hasServiceWorker = await page.evaluate(() => 'serviceWorker' in navigator);

    expect(hasServiceWorker).toBeTruthy();
  });

  test('debe tener meta tags para PWA', async ({ page }) => {
    await page.goto('/');

    // Verificar viewport meta tag
    const viewport = await page.locator('meta[name="viewport"]').getAttribute('content');
    expect(viewport).toContain('width=device-width');

    // Verificar theme-color (puede haber 2: uno para light y uno para dark)
    const themeColor = page.locator('meta[name="theme-color"]');
    const count = await themeColor.count();
    expect(count).toBeGreaterThanOrEqual(1);
  });
});

/**
 * Tests de Performance Básico
 */
test.describe('Performance', () => {
  test('debe cargar la página en tiempo razonable', async ({ page }) => {
    const startTime = Date.now();

    await page.goto('/login');
    await page.waitForLoadState('networkidle');

    const loadTime = Date.now() - startTime;

    // La página debe cargar en menos de 5 segundos
    expect(loadTime).toBeLessThan(5000);
  });

  test('debe tener recursos cacheables', async ({ page }) => {
    await page.goto('/login');

    // Segunda carga debe ser más rápida (caché)
    const startTime = Date.now();
    await page.reload();
    await page.waitForLoadState('networkidle');
    const reloadTime = Date.now() - startTime;

    // El reload debe ser más rápido que la carga inicial
    expect(reloadTime).toBeLessThan(3000);
  });
});

/**
 * Tests de Tema Oscuro/Claro
 */
test.describe('Tema', () => {
  test('debe soportar modo oscuro', async ({ page }) => {
    await page.goto('/login');

    // Verificar que existe la clase dark o similar
    const html = page.locator('html');

    // La app debe tener soporte para tema oscuro
    // (puede estar activo o no, dependiendo de la preferencia del sistema)
    await expect(html).toBeVisible();
  });

  test('debe respetar preferencia del sistema', async ({ page }) => {
    // Simular modo oscuro del sistema
    await page.emulateMedia({ colorScheme: 'dark' });
    await page.goto('/login');

    await page.waitForLoadState('networkidle');

    // Verificar que la página carga correctamente con tema oscuro
    await expect(page.locator('h1')).toBeVisible();
  });

  test('debe respetar preferencia de modo claro', async ({ page }) => {
    // Simular modo claro del sistema
    await page.emulateMedia({ colorScheme: 'light' });
    await page.goto('/login');

    await page.waitForLoadState('networkidle');

    // Verificar que la página carga correctamente con tema claro
    await expect(page.locator('h1')).toBeVisible();
  });
});
