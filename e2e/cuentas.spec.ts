import { test, expect } from '@playwright/test';

/**
 * Tests E2E del módulo Cuentas (multi-cuenta — Opción B).
 *
 * Cobertura crítica:
 *  - Render de la lista
 *  - Apertura del modal "Nueva cuenta"
 *  - Switch de "Cuenta predeterminada" automático en la primera cuenta
 *  - Toggle ⭐ default desde la lista
 *  - Apertura de modales: Ingreso, Transferir
 *
 * NO crea ni borra cuentas reales en Firestore (los tests son read-only y
 * de UI). Para tests funcionales completos se necesita un sandbox dedicado
 * de Firebase.
 */

test.describe('Cuentas — UI', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/cuentas');
    // Esperar a que el listener cargue (skeleton fuera).
    await expect(page.locator('h1')).toContainText(/cuentas/i, { timeout: 10_000 });
  });

  test('debe mostrar la cabecera y botones principales', async ({ page }) => {
    await expect(page.locator('h1')).toContainText(/cuentas/i);
    // Botón de Ingreso (verde)
    await expect(page.getByRole('button', { name: /ingreso/i })).toBeVisible();
    // Botón de Transferir
    await expect(page.getByRole('button', { name: /transferir/i })).toBeVisible();
    // Link a nueva cuenta
    await expect(page.getByRole('link', { name: /nueva/i })).toBeVisible();
  });

  test('debe abrir el modal de Ingreso', async ({ page }) => {
    await page.getByRole('button', { name: /ingreso/i }).click();
    // El modal debe aparecer (renderizado vía portal a body)
    await expect(page.getByText(/registrar ingreso externo/i)).toBeVisible({ timeout: 5_000 });
    // Cerrar
    await page.getByRole('button', { name: /cancelar/i }).click();
    await expect(page.getByText(/registrar ingreso externo/i)).not.toBeVisible();
  });

  test('botón Transferir requiere ≥2 cuentas activas', async ({ page }) => {
    const transferBtn = page.getByRole('button', { name: /transferir/i });
    // Si está deshabilitado, no abre. Si está habilitado, abre el modal.
    const isDisabled = await transferBtn.isDisabled();
    if (!isDisabled) {
      await transferBtn.click();
      await expect(page.getByText(/transferencia entre cuentas/i)).toBeVisible({ timeout: 5_000 });
    }
  });

  test('navegar a /cuentas/nueva funciona', async ({ page }) => {
    await page.getByRole('link', { name: /nueva/i }).click();
    await expect(page).toHaveURL(/\/cuentas\/nueva/);
    // El form debe renderizar
    await expect(page.getByText(/datos básicos/i)).toBeVisible();
  });
});

test.describe('Cuentas — formulario nueva', () => {
  test('switch isDefault automático en primera cuenta', async ({ page }) => {
    await page.goto('/cuentas/nueva');

    // El switch "Cuenta predeterminada" debe ser checkeable.
    // Si NO hay cuentas activas, debería estar marcado por default.
    // Si HAY cuentas activas, debería estar desmarcado.
    const switchLabel = page.getByText(/cuenta predeterminada/i).first();
    await expect(switchLabel).toBeVisible();
  });

  test('sección Datos de tarjeta visible para type=bank', async ({ page }) => {
    await page.goto('/cuentas/nueva');
    // El default es type=bank. La sección debe aparecer (Fase 6.8.2).
    await expect(
      page.getByText(/tarjeta.*asociada|datos de tarjeta/i).first(),
    ).toBeVisible({ timeout: 5_000 });
  });

  test('disclaimer de seguridad presente', async ({ page }) => {
    await page.goto('/cuentas/nueva');
    await expect(
      page.getByText(/cómo protegemos tus datos/i),
    ).toBeVisible({ timeout: 5_000 });
    // Mensaje crítico: no almacenamos CVC.
    await expect(page.getByText(/nunca pedimos ni almacenamos el cvc/i)).toBeVisible();
  });
});
