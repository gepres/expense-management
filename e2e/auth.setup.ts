import { test as setup, expect } from '@playwright/test';

// Variables cargadas via global-setup.ts

const authFile = 'e2e/.auth/user.json';

setup('authenticate', async ({ browser }) => {
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    const testEmail = process.env.TEST_EMAIL;
    const testPassword = process.env.TEST_PASSWORD;

    if (!testEmail || !testPassword) {
      throw new Error('❌ TEST_EMAIL y TEST_PASSWORD requeridos (check .env.test)');
    }

    console.log('🚀 Authenticating as:', testEmail);
    
    // Explicit full URL
    await page.goto('http://localhost:5173/login', { timeout: 15000 });
    
    // Fill credentials
    await page.fill('input[type="email"]', testEmail);
    await page.fill('input[type="password"]', testPassword);
    await page.click('button[type="submit"]');

    // Wait for SUCCESSFUL login (redirect to dashboard)
    await page.waitForURL(/\/(dashboard)?/, { timeout: 15000 });
    
    // Ensure storage is populated
    await page.waitForTimeout(1000);

    // Save state
    await page.context().storageState({ path: authFile });
    console.log('✅ Authentication successful and state saved.');

  } catch (error) {
    console.error('❌ Authentication failed:', error);
    await page.screenshot({ path: 'test-results/auth-final-failure.png' });
    throw error;
  } finally {
    await context.close();
  }
});
