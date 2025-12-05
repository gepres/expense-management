import { Page, expect } from '@playwright/test';
import * as dotenv from 'dotenv';

/**
 * Helper functions para autenticación en tests E2E
 */

// Cargar variables de entorno de .env.test
dotenv.config({ path: '.env.test' });

/**
 * Realiza login con las credenciales de prueba
 * @param page - Página de Playwright
 */
export async function loginWithTestUser(page: Page): Promise<void> {
  const testEmail = process.env.TEST_EMAIL;
  const testPassword = process.env.TEST_PASSWORD;

  if (!testEmail || !testPassword) {
    throw new Error('❌ TEST_EMAIL y TEST_PASSWORD deben estar configurados en .env.test');
  }

  // Navegar a login
  await page.goto('/login');

  // Esperar que cargue el formulario
  await expect(page.locator('h1')).toContainText('Gestión de Gastos');

  // Llenar formulario
  await page.fill('input[type="email"]', testEmail);
  await page.fill('input[type="password"]', testPassword);

  // Submit
  await page.click('button[type="submit"]');

  // Esperar redirección (a dashboard o raíz)
  await page.waitForURL(/\/(dashboard)?/, { timeout: 10000 });

  // Dar tiempo para que Firebase inicialice completamente
  // Esto es crítico para que IndexedDB guarde el auth state
  await page.waitForTimeout(2000);

  // Verificar que realmente estamos autenticados
  // Intentar navegar al dashboard y ver si persiste
  await page.goto('/dashboard');
  await page.waitForLoadState('domcontentloaded');

  const currentUrl = page.url();
  if (currentUrl.includes('/login')) {
    throw new Error('❌ El login no persistió correctamente');
  }

  // Esperar un poco más para asegurar que Firebase completó
  await page.waitForTimeout(1000);
}

/**
 * Verifica que el usuario está autenticado
 * @param page - Página de Playwright
 */
export async function ensureAuthenticated(page: Page): Promise<void> {
  // Intentar navegar a una ruta protegida
  await page.goto('/dashboard');

  // Si redirige a login, no está autenticado
  await page.waitForTimeout(500);
  const currentUrl = page.url();

  if (currentUrl.includes('/login')) {
    throw new Error('❌ Usuario no está autenticado');
  }
}

/**
 * Realiza logout
 * @param page - Página de Playwright
 */
export async function logout(page: Page): Promise<void> {
  // Buscar botón de logout
  const logoutButton = page.locator('button, a').filter({ hasText: /cerrar sesión|logout|salir/i });

  if (await logoutButton.count() > 0) {
    await logoutButton.first().click();
    await page.waitForURL(/\/(login)?/, { timeout: 5000 });
  }
}
