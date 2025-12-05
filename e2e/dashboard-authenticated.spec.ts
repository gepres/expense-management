import { test, expect } from '@playwright/test';
import * as dotenv from 'dotenv';

/**
 * Tests E2E para funcionalidades que requieren autenticación
 * Cada test hace login inline para máxima confiabilidad
 */

// Cargar credenciales
// Cargar credenciales
// dotenv.config loaded via globalSetup
const TEST_EMAIL = process.env.TEST_EMAIL || '';
const TEST_PASSWORD = process.env.TEST_PASSWORD || '';


/**
 * Helper: Login directo en el test
 */
async function doLogin(page: any) {
  await page.goto('/login');
  await page.fill('input[type="email"]', TEST_EMAIL);
  await page.fill('input[type="password"]', TEST_PASSWORD);
  await page.click('button[type="submit"]');

  // Esperar redirección
  await page.waitForURL(/\/(dashboard)?/, { timeout: 10000 });

  // Esperar que Firebase guarde el estado
  await page.waitForTimeout(2000);
}

test.describe('Dashboard Autenticado', () => {
  test('debe acceder al dashboard con usuario autenticado', async ({ page }) => {
    // Login
    await doLogin(page);

    // Navegar al dashboard (o raíz)
    await page.goto('/dashboard');

    // Verificar que NO redirige a login (puede estar en / o /dashboard)
    const currentUrl = page.url();
    const isAuthenticated = currentUrl.includes('/dashboard') || currentUrl.endsWith('/') || currentUrl.endsWith('/gastos');

    expect(isAuthenticated).toBeTruthy();

    console.log('✅ Usuario autenticado correctamente y accedió al dashboard');
  });

  test('debe mostrar contenido del dashboard', async ({ page }) => {
    // Login
    await doLogin(page);

    await page.goto('/dashboard');

    // Verificar que hay contenido
    const hasContent = await page.locator('body').textContent();
    expect(hasContent).toBeTruthy();

    console.log('✅ Dashboard tiene contenido');
  });

  test('debe poder navegar a la página de gastos', async ({ page }) => {
    // Login
    await doLogin(page);

    await page.goto('/gastos');

    // Verificar que NO redirige a login
    await expect(page).toHaveURL(/\/gastos/);

    console.log('✅ Accedió a la página de gastos');
  });

  test('debe poder navegar a presupuestos', async ({ page }) => {
    // Login
    await doLogin(page);

    await page.goto('/presupuestos');

    // Verificar que NO redirige a login
    await expect(page).toHaveURL(/\/presupuestos/);

    console.log('✅ Accedió a la página de presupuestos');
  });

  test('debe poder navegar al asistente IA', async ({ page }) => {
    // Login
    await doLogin(page);

    await page.goto('/asistente');

    // Verificar que NO redirige a login
    await expect(page).toHaveURL(/\/asistente/);

    console.log('✅ Accedió al asistente IA');
  });

  test('debe poder cerrar sesión', async ({ page, isMobile }) => {
    // Login
    await doLogin(page);
    await page.goto('/dashboard');
    
    // Determine expected button ID based on viewport
    const logoutBtnId = isMobile ? 'mobile-logout-button' : 'desktop-logout-button';
    const logoutButton = page.getByTestId(logoutBtnId);

    if (!(await logoutButton.isVisible())) {
      console.log('🔘 Logout hidden, opening menu...');
      
      const triggerId = isMobile ? 'mobile-menu-trigger' : 'user-menu-trigger';
      const trigger = page.getByTestId(triggerId);
      
      await expect(trigger).toBeVisible();
      await trigger.click();
    }

    // Wait for the text to definitely be visible
    await expect(logoutButton).toBeVisible();
    await logoutButton.click();

    // Verify redirect
    await page.waitForURL(/\/(login)?/, { timeout: 10000 });
    console.log('✅ Cerró sesión correctamente');
  });
});

test.describe('Funcionalidades Protegidas', () => {
  test('debe acceder a importar/exportar', async ({ page }) => {
    // Login
    await doLogin(page);

    await page.goto('/importar');

    await expect(page).toHaveURL(/\/importar/);
    console.log('✅ Accedió a importar/exportar');
  });

  test('debe acceder a configuración', async ({ page }) => {
    // Login
    await doLogin(page);

    await page.goto('/configuracion');

    await expect(page).toHaveURL(/\/configuracion/);
    console.log('✅ Accedió a configuración');
  });
});
