import { test, expect } from '@playwright/test';

/**
 * Tests E2E del módulo Presupuestos (Opción B — solo sub-reservas
 * por categoría; el bucket general legacy ya no se crea desde la UI).
 *
 * Cobertura:
 *  - Render de la cabecera con saldo / gastado / disponible
 *  - Modal "Nuevo presupuesto" muestra solo categorías
 *  - Panel "Máximo asignable" presente
 *  - Selector de cuenta y mes funcionan
 */

test.describe('Presupuestos — UI', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/presupuestos');
    await expect(page.locator('h1')).toContainText(/presupuestos/i, { timeout: 10_000 });
  });

  test('debe mostrar el título y descripción Opción B', async ({ page }) => {
    await expect(page.locator('h1')).toContainText(/presupuestos/i);
    // Subtítulo refleja el modelo Opción B.
    await expect(
      page.getByText(/saldo de cada cuenta es tu presupuesto/i),
    ).toBeVisible();
  });

  test('selectores de Cuenta y Mes presentes', async ({ page }) => {
    await expect(page.getByText('Cuenta', { exact: true }).first()).toBeVisible();
    await expect(page.getByText('Mes', { exact: true }).first()).toBeVisible();
  });

  test('cabecera muestra Saldo / Gastado / Disponible', async ({ page }) => {
    // Estos labels solo aparecen si hay al menos una cuenta activa.
    // Si no hay cuentas, el componente muestra otro estado vacío.
    const tieneCuentas = await page
      .locator('text=Saldo')
      .first()
      .isVisible({ timeout: 3_000 })
      .catch(() => false);
    if (tieneCuentas) {
      await expect(page.getByText(/saldo/i).first()).toBeVisible();
      await expect(page.getByText(/gastado/i).first()).toBeVisible();
      await expect(page.getByText(/disponible/i).first()).toBeVisible();
    }
  });

  test('modal Nuevo presupuesto solo lista categorías (sin general/efectivo)', async ({
    page,
  }) => {
    const nuevoBtn = page.getByRole('button', { name: /^nuevo$/i });
    const isVisible = await nuevoBtn.isVisible().catch(() => false);
    if (!isVisible) {
      test.skip(true, 'Sin cuenta seleccionada — botón Nuevo deshabilitado');
    }
    await nuevoBtn.click();
    // El modal debe abrir (vía portal)
    await expect(page.getByText(/nuevo presupuesto/i)).toBeVisible({ timeout: 5_000 });
    // El select NO debe ofrecer "general" ni "efectivo (sub-reserva)"
    const select = page.locator('select').first();
    const options = await select.locator('option').allTextContents();
    expect(
      options.every((opt) => !opt.toLowerCase().includes('general')),
    ).toBeTruthy();
    expect(
      options.every((opt) => !opt.toLowerCase().includes('efectivo')),
    ).toBeTruthy();
  });

  test('panel "Máximo asignable" visible al abrir modal', async ({ page }) => {
    const nuevoBtn = page.getByRole('button', { name: /^nuevo$/i });
    const isVisible = await nuevoBtn.isVisible().catch(() => false);
    if (!isVisible) test.skip(true, 'Sin cuentas activas');
    await nuevoBtn.click();
    // El panel "Máximo asignable" muestra Saldo cuenta / Ya asignado / Máx. asignable
    await expect(page.getByText(/máx\. asignable/i)).toBeVisible({ timeout: 5_000 });
    await expect(page.getByText(/saldo cuenta/i)).toBeVisible();
    await expect(page.getByText(/ya asignado/i)).toBeVisible();
  });
});

test.describe('Presupuestos — sin backend', () => {
  test('si backend está caído debe mostrar BackendOfflineBanner', async ({ page }) => {
    // Interceptar fetch al backend y simular fallo de red.
    await page.route('**/api/**', (route) => route.abort('failed'));
    await page.goto('/presupuestos');
    await expect(page.locator('h1')).toContainText(/presupuestos/i, { timeout: 10_000 });
    // Esperar a que el banner aparezca tras el primer fetch fallido
    await expect(
      page.getByText(/backend no disponible/i),
    ).toBeVisible({ timeout: 8_000 });
  });
});
