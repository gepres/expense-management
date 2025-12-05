import { defineConfig, devices } from '@playwright/test';

/**
 * Configuración de Playwright para tests E2E
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './e2e',

  /* Tiempo máximo por test */
  timeout: 30 * 1000,

  /* Configuración de expects */
  expect: {
    timeout: 5000
  },

  /* Ejecutar tests en paralelo */
  fullyParallel: true,

  /* Fallar build en CI si tests se dejan con .only */
  forbidOnly: !!process.env.CI,

  /* Reintentos en CI */
  retries: process.env.CI ? 2 : 0,

  /* Workers: máximo paralelismo */
  workers: process.env.CI ? 1 : undefined,

  /* Reporter de resultados */
  reporter: [
    ['html'],
    ['list'],
    ['json', { outputFile: 'playwright-report/results.json' }]
  ],

  /* Configuración compartida para todos los proyectos */
  use: {
    /* URL base de la aplicación */
    baseURL: 'http://localhost:5173',

    /* Captura de screenshots al fallar */
    screenshot: 'only-on-failure',

    /* Videos solo al fallar */
    video: 'retain-on-failure',

    /* Trace solo al reintentar */
    trace: 'on-first-retry',
  },

  /* Configurar servidor local para desarrollo */
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },

  /* Proyectos para diferentes navegadores */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },

    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },

    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },

    /* Test en móviles */
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },

    /* Navegadores branded (deshabilitados por defecto para velocidad) */
    // {
    //   name: 'Microsoft Edge',
    //   use: { ...devices['Desktop Edge'], channel: 'msedge' },
    // },
    // {
    //   name: 'Google Chrome',
    //   use: { ...devices['Desktop Chrome'], channel: 'chrome' },
    // },
  ],
});
