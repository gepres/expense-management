import { test, expect } from '@playwright/test';

/**
 * Tests E2E para el flujo de autenticación
 */
test.describe('Autenticación', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
  });

  test('debe mostrar el formulario de login', async ({ page }) => {
    // Verificar título de la página
    await expect(page.locator('h1')).toContainText('Gestión de Gastos');

    // Verificar que aparece el formulario de login
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toContainText('Iniciar Sesión');
  });

  test('debe validar campos vacíos', async ({ page }) => {
    // Intentar submit sin llenar campos
    await page.click('button[type="submit"]');

    // Verificar mensajes de error
    await expect(page.locator('text=/email es requerido/i')).toBeVisible();
    await expect(page.locator('text=/contraseña es requerida/i')).toBeVisible();
  });

  test('debe validar formato de email inválido', async ({ page }) => {
    const emailInput = page.locator('input[type="email"]');

    // Llenar con email inválido
    await emailInput.fill('email-invalido');
    await page.locator('input[type="password"]').first().fill('password123');
    await page.click('button[type="submit"]');

    // Verificar que aparece algún mensaje de error (puede ser validación HTML5 o mensaje custom)
    // Buscamos elementos con clase de error
    const hasErrorClass = await emailInput.evaluate((el: HTMLInputElement) => {
      return el.classList.contains('border-destructive') || !el.validity.valid;
    });

    expect(hasErrorClass).toBeTruthy();
  });

  test('debe validar longitud mínima de contraseña', async ({ page }) => {
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', '123');
    await page.click('button[type="submit"]');

    // Verificar mensaje de error
    await expect(page.locator('text=/al menos 6 caracteres/i')).toBeVisible();
  });

  test('debe mostrar y ocultar contraseña', async ({ page }) => {
    const passwordInput = page.locator('input#password');

    // Llenar contraseña
    await passwordInput.fill('mipassword123');

    // Verificar que está oculta
    await expect(passwordInput).toHaveAttribute('type', 'password');

    // Encontrar el botón de toggle (el que tiene Eye/EyeOff icon)
    const toggleButton = page.locator('button[type="button"]').filter({ has: page.locator('svg') }).first();

    // Click en botón para mostrar
    await toggleButton.click();

    // Verificar que el tipo cambió a text
    await expect(passwordInput).toHaveAttribute('type', 'text');

    // Click de nuevo para ocultar
    await toggleButton.click();

    // Verificar que volvió a password
    await expect(passwordInput).toHaveAttribute('type', 'password');
  });

  test('debe navegar a la página de registro', async ({ page }) => {
    // Click en el link "Regístrate aquí"
    await page.click('text=/regístrate aquí/i');

    // Verificar que estamos en la página de registro
    await expect(page).toHaveURL(/\/registro/);
  });

  test('debe mostrar opción de login con Google', async ({ page }) => {
    // Verificar botón de Google
    const googleButton = page.locator('button').filter({ hasText: /google/i });
    await expect(googleButton).toBeVisible();

    // Verificar que tiene el icono de Google
    await expect(googleButton.locator('svg')).toBeVisible();
  });

  test.skip('debe deshabilitar botones mientras carga', async ({ page }) => {
    // Test skip: Difícil de testear sin credenciales válidas
    // El estado de carga solo aparece cuando realmente se está procesando el login

    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'password123');

    const submitButton = page.locator('button[type="submit"]');

    // Verificar que el botón no está deshabilitado antes de click
    await expect(submitButton).toBeEnabled();
  });
});
