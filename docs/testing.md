# Testing

Estrategia y configuración de testing del proyecto.

## Estrategia

1. **Unit Tests** (Vitest): Funciones puras (utils)
2. **Component Tests** (Vitest + Testing Library): Componentes críticos
3. **Integration Tests**: Flujos completos
4. **E2E Tests** (Playwright): Happy paths

---

## Setup de Vitest (`src/tests/setup.ts`)

```typescript
import '@testing-library/jest-dom/vitest';

// Mock Firebase
vi.mock('firebase/app');
vi.mock('firebase/auth');
vi.mock('firebase/firestore');

// Mock localStorage
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Mock matchMedia (para tema)
Object.defineProperty(window, 'matchMedia', {
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  })),
});
```

### Patrón AAA

```typescript
it('debe calcular total correctamente', () => {
  // Arrange
  const gastos: Gasto[] = [{ monto: 100 }, { monto: 200 }];

  // Act
  const total = calcularTotalGastos(gastos);

  // Assert
  expect(total).toBe(300);
});
```

### Componentes con providers

```typescript
import { render } from '@/tests/test-utils';

it('debe renderizar componente', () => {
  render(<MiComponente />);
  expect(screen.getByText('Hello')).toBeInTheDocument();
});
```

---

## Playwright E2E

### Configuración (`playwright.config.ts`)

```typescript
export default defineConfig({
  testDir: './e2e',
  timeout: 30 * 1000,
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,

  use: {
    baseURL: 'http://localhost:5173',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'on-first-retry',
  },

  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
  },

  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
    { name: 'Mobile Chrome', use: { ...devices['Pixel 5'] } },
    { name: 'Mobile Safari', use: { ...devices['iPhone 12'] } },
  ],
});
```

### Estructura

```
e2e/
├── auth.spec.ts        # Autenticación (Login, Registro)
├── dashboard.spec.ts   # Dashboard y AI Insights
├── gastos.spec.ts      # CRUD de gastos e importación Excel
└── .gitignore         # Ignora reports y videos
```

### Ejemplo de test

```typescript
import { test, expect } from '@playwright/test';

test.describe('Autenticación', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('debe mostrar el formulario de login', async ({ page }) => {
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
  });

  test('debe validar formato de email', async ({ page }) => {
    const emailInput = page.locator('input[type="email"]');
    await emailInput.fill('email-invalido');
    const isInvalid = await emailInput.evaluate(
      (el: HTMLInputElement) => !el.validity.valid
    );
    expect(isInvalid).toBeTruthy();
  });
});
```

### Comandos

```bash
npm run test:e2e          # Ejecutar
npm run test:e2e:ui       # Modo UI (debugging interactivo)
npm run test:e2e:headed   # Ver navegador
npm run test:e2e:debug    # Debug paso a paso
npm run test:e2e:codegen  # Generar tests grabando
npm run test:e2e:report   # Ver reporte HTML
```

---

## Métricas objetivo

- **Unit Test Coverage**: > 80%
- **Component Test Coverage**: 100% (críticos)
- **E2E Tests**: Happy paths cubiertos

## Por qué Playwright sobre Cypress

- Paralelismo nativo (más rápido)
- Multi-navegador real (incluye WebKit/Safari)
- Mejor debugging (UI mode, traces)
- Menos flakiness (esperas automáticas)
- Sin servidor proxy
