import { test as setup, expect } from '@playwright/test';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Setup global de autenticación. Se ejecuta UNA vez antes de cualquier
 * suite y guarda el storageState (cookies + localStorage) en
 * `e2e/.auth/user.json`. Cada proyecto del config lo carga vía
 * `use.storageState`.
 *
 * Requiere `TEST_EMAIL` y `TEST_PASSWORD` en `.env.test`.
 *
 * Si las variables no están seteadas, el setup queda en skip (los tests
 * que dependan de auth fallarán con un mensaje claro).
 */

const authFile = path.resolve(__dirname, '.auth/user.json');

setup('authenticate', async ({ page }) => {
  const email = process.env.TEST_EMAIL;
  const password = process.env.TEST_PASSWORD;

  if (!email || !password) {
    setup.skip(true, 'TEST_EMAIL/TEST_PASSWORD no configurados en .env.test');
  }

  // Asegurar que la carpeta .auth/ exista
  fs.mkdirSync(path.dirname(authFile), { recursive: true });

  await page.goto('/login');

  // Login con email/password
  await page.locator('input[type="email"]').fill(email!);
  await page.locator('input[type="password"]').fill(password!);
  await page.locator('button[type="submit"]').click();

  // Esperar redirect al dashboard
  await page.waitForURL(/\/dashboard/, { timeout: 15_000 });
  await expect(page.locator('h1')).toContainText(/hola/i, { timeout: 10_000 });

  // Guardar el state autenticado
  await page.context().storageState({ path: authFile });
});
