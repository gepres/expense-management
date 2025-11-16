# 🧪 Guía de Testing - Gestión de Gastos

Esta guía describe la estrategia de testing completa para la aplicación de gestión de gastos personales.

## 📑 Tabla de Contenidos

- [Herramientas](#-herramientas)
- [Estructura](#️-estructura-de-testing)
- [Objetivos de Cobertura](#-objetivos-de-cobertura)
- [Unit Tests](#-unit-tests)
- [Component Tests](#️-component-tests)
- [Integration Tests](#-integration-tests)
- [E2E Tests](#-e2e-tests)
- [Mocking](#-mocking)
- [Ejecutar Tests](#-ejecutar-tests)
- [Mejores Prácticas](#-mejores-prácticas)

## 🛠️ Herramientas

| Herramienta | Versión | Propósito |
|-------------|---------|-----------|
| **Vitest** | 4.x | Test runner |
| **React Testing Library** | 16.x | Component testing |
| **MSW** | 2.x | API mocking |
| **Cypress** | 15.x | E2E testing |

## 🗂️ Estructura de Testing

```
src/
├── utils/tests/
├── hooks/tests/
├── services/tests/
├── context/tests/
├── components/**/__tests__/
├── mocks/
└── tests/setup.ts

cypress/
├── e2e/
├── fixtures/
└── support/
```

## 🎯 Objetivos de Cobertura

- ✅ **Unit Tests**: >80%
- ✅ **Component Tests**: 100% en críticos
- ✅ **Integration Tests**: Flujos principales
- ✅ **E2E Tests**: Happy paths

## 🧪 Unit Tests

```typescript
// src/utils/tests/formatters.test.ts
import { describe, it, expect } from 'vitest';
import { formatearMoneda } from '../formatters';

describe('formatearMoneda', () => {
  it('debe formatear montos correctamente', () => {
    expect(formatearMoneda(1234.56)).toBe('$1,234.56');
  });
});
```

## 🖼️ Component Tests

```typescript
// src/components/gastos/__tests__/FormularioGasto.test.tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import FormularioGasto from '../FormularioGasto';

it('debe validar campos requeridos', async () => {
  render(<FormularioGasto onSubmit={vi.fn()} />);

  const submitButton = screen.getByRole('button', { name: /guardar/i });
  await userEvent.click(submitButton);

  expect(await screen.findByText(/requerido/i)).toBeInTheDocument();
});
```

## 🌐 E2E Tests

```typescript
// cypress/e2e/login.cy.ts
describe('Login', () => {
  it('debe permitir login válido', () => {
    cy.visit('/login');
    cy.get('[data-testid="email"]').type('user@example.com');
    cy.get('[data-testid="password"]').type('password');
    cy.get('[data-testid="login-btn"]').click();

    cy.url().should('include', '/dashboard');
  });
});
```

## ▶️ Ejecutar Tests

```bash
# Unit e Integration
npm run test              # Watch mode
npm run test:run          # Una vez
npm run test:ui           # UI interactiva
npm run test:coverage     # Con coverage

# E2E
npm run test:e2e          # Interactivo
npm run test:e2e:headless # Headless
```

## ✅ Mejores Prácticas

### General
1. **AAA Pattern**: Arrange, Act, Assert
2. **Un concepto por test**
3. **Nombres descriptivos**
4. **Tests independientes**

### React Testing Library
1. **Evitar detalles de implementación**
2. **Queries por prioridad**: getByRole > getByText > getByTestId
3. **Usar userEvent en lugar de fireEvent**
4. **Esperar actualizaciones asíncronas**

### Cypress
1. **Usar data-testid**
2. **No usar wait() fijos**
3. **Flujo completo por test**
4. **Limpiar estado**

## 📊 Coverage

```bash
npm run test:coverage
```

Genera reporte en `coverage/index.html`

## 🎭 Mocking

### MSW

```typescript
// src/mocks/handlers.ts
import { http, HttpResponse } from 'msw';

export const handlers = [
  http.get('/api/gastos', () => {
    return HttpResponse.json([]);
  }),
];
```

### Firebase Mock

```typescript
vi.mock('firebase/auth', () => ({
  getAuth: vi.fn(),
  signInWithEmailAndPassword: vi.fn(),
}));
```

## 📚 Recursos

- [Vitest](https://vitest.dev)
- [React Testing Library](https://testing-library.com/react)
- [Cypress](https://docs.cypress.io)
- [MSW](https://mswjs.io)

---

<p align="center">Tests confiables = Código confiable 🧪</p>
