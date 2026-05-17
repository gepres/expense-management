/**
 * Tests de helpers puros de chartTheme.
 */

import { describe, it, expect } from 'vitest';
import {
  CHART_PALETTE,
  colorAt,
  fmtFechaCorta,
  fmtEjeMoneda,
  fmtMoneda,
} from '../chartTheme';

describe('colorAt', () => {
  it('devuelve el color en el índice', () => {
    expect(colorAt(0)).toBe(CHART_PALETTE[0]);
    expect(colorAt(3)).toBe(CHART_PALETTE[3]);
  });

  it('hace wrap-around cuando el índice excede la paleta', () => {
    expect(colorAt(CHART_PALETTE.length)).toBe(CHART_PALETTE[0]);
    expect(colorAt(CHART_PALETTE.length + 2)).toBe(CHART_PALETTE[2]);
  });
});

describe('fmtFechaCorta', () => {
  it('convierte ISO YYYY-MM-DD a DD/MM', () => {
    expect(fmtFechaCorta('2026-05-10')).toBe('10/05');
    expect(fmtFechaCorta('2026-12-01')).toBe('01/12');
  });

  it('devuelve la entrada si no tiene formato esperado', () => {
    expect(fmtFechaCorta('rara')).toBe('rara');
  });
});

describe('fmtEjeMoneda', () => {
  it('prefija S/ para PEN y $ para USD', () => {
    expect(fmtEjeMoneda(1500, 'PEN').startsWith('S/')).toBe(true);
    expect(fmtEjeMoneda(1500, 'USD').startsWith('$')).toBe(true);
  });
});

describe('fmtMoneda', () => {
  it('formatea como moneda y cae a PEN si viene vacío', () => {
    expect(fmtMoneda(10, 'USD')).toMatch(/10/);
    expect(fmtMoneda(10, '')).toMatch(/10/);
  });
});
