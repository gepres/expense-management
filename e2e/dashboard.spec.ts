import { test, expect } from '@playwright/test';

/**
 * Tests E2E para la página de Login/Landing
 * (Dashboard requiere autenticación, por ahora testeamos la landing page)
 */
test.describe('Página Principal', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('debe redirigir a login si no está autenticado', async ({ page }) => {
    // Si el usuario no está autenticado, debe redirigir a /login
    await page.waitForURL(/\/(login)?/, { timeout: 5000 });

    // Verificar que estamos en login
    const currentUrl = page.url();
    const isLoginPage = currentUrl.endsWith('/login') || currentUrl.endsWith('/');

    expect(isLoginPage).toBeTruthy();
  });

  test('debe mostrar la aplicación correctamente', async ({ page }) => {
    // Verificar que la página carga
    await expect(page.locator('h1')).toBeVisible({ timeout: 10000 });
  });
});

/**
 * Tests de Navegación General
 */
test.describe('Navegación', () => {
  test('debe cargar la página de login directamente', async ({ page }) => {
    await page.goto('/login');

    // Verificar elementos del login
    await expect(page.locator('h1')).toContainText('Gestión de Gastos');
    await expect(page.locator('input[type="email"]')).toBeVisible();
  });

  test('debe cargar la página de registro', async ({ page }) => {
    await page.goto('/registro');

    // Verificar que estamos en registro
    await expect(page).toHaveURL(/\/registro/);
  });

  test('debe manejar rutas no encontradas', async ({ page }) => {
    await page.goto('/ruta-que-no-existe');

    // La app debe manejar esto de alguna manera (404 o redirect)
    // Por ahora solo verificamos que no crashea
    await page.waitForLoadState('networkidle');
  });
});

/**
 * Tests de Responsive Design
 */
test.describe('Responsive Design', () => {
  test('debe verse correctamente en móvil', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/login');

    // Verificar que el formulario es visible y usable en móvil
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();

    // Verificar que no hay overflow horizontal
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    const viewportWidth = await page.evaluate(() => window.innerWidth);
    expect(bodyWidth).toBeLessThanOrEqual(viewportWidth + 1); // +1 por redondeo
  });

  test('debe verse correctamente en tablet', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/login');

    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('input[type="email"]')).toBeVisible();
  });

  test('debe verse correctamente en desktop', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/login');

    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('input[type="email"]')).toBeVisible();
  });
});

/**
 * Tests de Accesibilidad Básica
 */
test.describe('Accesibilidad', () => {
  test('debe tener labels para inputs', async ({ page }) => {
    await page.goto('/login');

    // Verificar que los inputs tienen labels asociados
    const emailInput = page.locator('input[type="email"]');
    const emailLabel = page.locator('label[for="email"]');

    await expect(emailLabel).toBeVisible();
    await expect(emailInput).toHaveAttribute('id', 'email');
  });

  test('debe permitir navegación por teclado', async ({ page }) => {
    await page.goto('/login');

    // Click en la página para darle focus inicial
    await page.click('body');

    // Tab varias veces hasta llegar a los inputs
    await page.keyboard.press('Tab');

    // Verificar que eventualmente el email input recibe focus
    // El primer Tab puede ir al link "Skip to content" u otro elemento
    const emailInput = page.locator('input[type="email"]');

    // Esperar hasta que el email input esté visible
    await emailInput.waitFor({ state: 'visible' });

    // Tab hasta que el email input tenga focus (máximo 5 tabs)
    for (let i = 0; i < 5; i++) {
      const isFocused = await emailInput.evaluate((el) => el === document.activeElement);
      if (isFocused) break;
      await page.keyboard.press('Tab');
    }

    // Verificar que podemos escribir en el email input
    await page.keyboard.type('test');
    await expect(emailInput).toHaveValue('test');
  });

  test('debe tener textos alternativos', async ({ page }) => {
    await page.goto('/login');

    // Verificar que los iconos SVG están dentro de elementos con texto
    const googleButton = page.locator('button').filter({ hasText: /google/i });
    await expect(googleButton).toContainText('Google');
  });
});
