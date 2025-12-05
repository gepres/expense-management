import { test as setup, expect } from '@playwright/test';
import path from 'path';
import * as dotenv from 'dotenv';

/**
 * Setup de autenticación para tests E2E
 * Este archivo se ejecuta antes de todos los tests para crear
 * un estado de autenticación que se puede reutilizar.
 */

// Cargar variables de entorno de .env.test
dotenv.config({ path: '.env.test' });

const authFile = 'e2e/.auth/user.json';

setup('authenticate', async ({ page }) => {
  // Cargar credenciales desde variables de entorno
  const testEmail = process.env.TEST_EMAIL;
  const testPassword = process.env.TEST_PASSWORD;

  if (!testEmail || !testPassword) {
    throw new Error('❌ TEST_EMAIL y TEST_PASSWORD deben estar configurados en .env.test');
  }

  console.log('🔐 Iniciando autenticación de prueba...');
  console.log('📧 Email:', testEmail);

  // Navegar a la página de login
  await page.goto('/login');

  // Esperar que la página cargue
  await expect(page.locator('h1')).toContainText('Gestión de Gastos');

  // Llenar el formulario de login
  await page.fill('input[type="email"]', testEmail);
  await page.fill('input[type="password"]', testPassword);

  // Click en el botón de login
  await page.click('button[type="submit"]');

  // Esperar a que la autenticación complete
  // Esto puede fallar si las credenciales no son válidas
  try {
    // Esperar redirección al dashboard
    await page.waitForURL(/\/(dashboard)?/, { timeout: 10000 });

    console.log('✅ Autenticación exitosa');

    // Esperar a que Firebase guarde el estado de autenticación
    // Firebase v9+ usa IndexedDB por defecto, no localStorage
    await page.waitForTimeout(2000);
  } catch (error) {
    console.error('❌ Error en autenticación:', error);
    console.error('⚠️  Asegúrate de:');
    console.error('   1. Tener un usuario de prueba creado en Firebase');
    console.error('   2. Configurar TEST_EMAIL y TEST_PASSWORD en .env.test');
    console.error('   3. Las credenciales sean correctas');

    // Capturar screenshot para debugging
    await page.screenshot({ path: 'test-results/auth-setup-failed.png' });

    throw error;
  }

  // Guardar el estado de autenticación (incluyendo localStorage de Firebase)
  await page.context().storageState({ path: authFile });

  console.log('💾 Estado de autenticación guardado en:', authFile);
});
