/**
 * Tests para calcularProximaEjecucion y describirFrecuencia.
 */

import { describe, it, expect } from 'vitest';
import { calcularProximaEjecucion, describirFrecuencia } from '../programados';

const HORA = '12:00';
const MAYO_10_2026 = new Date(2026, 4, 10, 8, 0, 0); // domingo 10 mayo 2026, 08:00 local

describe('calcularProximaEjecucion', () => {
  describe('frecuencia diaria', () => {
    it('cada día desde fechaInicio si la hora no ha pasado', () => {
      const ahora = new Date(2026, 4, 10, 8, 0, 0);
      const res = calcularProximaEjecucion({
        frecuencia: 'diaria',
        hora: HORA,
        fechaInicio: ahora,
        ahora,
      });
      expect(res!.getDate()).toBe(10);
      expect(res!.getHours()).toBe(12);
    });

    it('si la hora de hoy ya pasó, salta a mañana', () => {
      const ahora = new Date(2026, 4, 10, 13, 0, 0);
      const res = calcularProximaEjecucion({
        frecuencia: 'diaria',
        hora: HORA,
        fechaInicio: new Date(2026, 4, 10, 8, 0, 0),
        ahora,
      });
      expect(res!.getDate()).toBe(11);
    });

    it('después de ejecutar, suma 1 día', () => {
      const res = calcularProximaEjecucion({
        frecuencia: 'diaria',
        hora: HORA,
        fechaInicio: new Date(2026, 4, 10),
        ultimaEjecucion: new Date(2026, 4, 10, 12, 0, 0),
        ahora: new Date(2026, 4, 11, 0, 0, 0),
      });
      expect(res!.getDate()).toBe(11);
    });
  });

  describe('frecuencia única', () => {
    it('devuelve la fecha única si está en el futuro', () => {
      const res = calcularProximaEjecucion({
        frecuencia: 'unica',
        hora: HORA,
        fechaInicio: MAYO_10_2026,
        fechaUnica: new Date(2026, 5, 15, 0, 0, 0),
        ahora: MAYO_10_2026,
      });
      expect(res).not.toBeNull();
      expect(res!.getFullYear()).toBe(2026);
      expect(res!.getMonth()).toBe(5); // junio
      expect(res!.getDate()).toBe(15);
      expect(res!.getHours()).toBe(12);
    });

    it('devuelve null si la fecha única ya pasó', () => {
      const res = calcularProximaEjecucion({
        frecuencia: 'unica',
        hora: HORA,
        fechaInicio: MAYO_10_2026,
        fechaUnica: new Date(2026, 3, 1, 12, 0, 0),
        ahora: MAYO_10_2026,
      });
      expect(res).toBeNull();
    });

    it('devuelve null si ya se ejecutó antes', () => {
      const res = calcularProximaEjecucion({
        frecuencia: 'unica',
        hora: HORA,
        fechaInicio: MAYO_10_2026,
        fechaUnica: new Date(2026, 5, 15, 12, 0, 0),
        ultimaEjecucion: new Date(2026, 5, 15, 12, 0, 0),
        ahora: new Date(2026, 5, 16, 0, 0, 0),
      });
      expect(res).toBeNull();
    });
  });

  describe('frecuencia semanal', () => {
    it('encuentra el próximo lunes', () => {
      // 10 mayo 2026 es domingo. Próximo lunes = 11 mayo.
      const res = calcularProximaEjecucion({
        frecuencia: 'semanal',
        hora: HORA,
        fechaInicio: MAYO_10_2026,
        diaEjecucion: 1, // lunes
        ahora: MAYO_10_2026,
      });
      expect(res!.getDate()).toBe(11);
      expect(res!.getDay()).toBe(1);
      expect(res!.getHours()).toBe(12);
    });

    it('si hay última ejecución, salta a la próxima semana', () => {
      const res = calcularProximaEjecucion({
        frecuencia: 'semanal',
        hora: HORA,
        fechaInicio: MAYO_10_2026,
        diaEjecucion: 1,
        ultimaEjecucion: new Date(2026, 4, 11, 12, 0, 0), // lun 11 mayo
        ahora: new Date(2026, 4, 12, 0, 0, 0),
      });
      expect(res!.getDate()).toBe(18); // siguiente lunes
    });
  });

  describe('frecuencia quincenal', () => {
    it('cada 15 días desde fechaInicio', () => {
      const res = calcularProximaEjecucion({
        frecuencia: 'quincenal',
        hora: HORA,
        fechaInicio: MAYO_10_2026,
        ahora: MAYO_10_2026,
      });
      // fechaInicio es 10/5 08:00, hora 12:00 → candidata 10/5 12:00 >= ahora 08:00 → primera ejecución hoy.
      expect(res!.getDate()).toBe(10);
      expect(res!.getHours()).toBe(12);
    });

    it('si la fecha de inicio + hora ya pasó hoy, busca el siguiente múltiplo de 15', () => {
      const res = calcularProximaEjecucion({
        frecuencia: 'quincenal',
        hora: HORA,
        fechaInicio: MAYO_10_2026, // 10 mayo 08:00
        ahora: new Date(2026, 4, 10, 13, 0, 0), // 10 mayo 13:00 (después de las 12)
      });
      expect(res!.getDate()).toBe(25); // 10 + 15
    });

    it('después de una ejecución, suma 15 días', () => {
      const res = calcularProximaEjecucion({
        frecuencia: 'quincenal',
        hora: HORA,
        fechaInicio: MAYO_10_2026,
        ultimaEjecucion: new Date(2026, 4, 10, 12, 0, 0),
        ahora: new Date(2026, 4, 11, 0, 0, 0),
      });
      expect(res!.getDate()).toBe(25);
    });
  });

  describe('frecuencia mensual', () => {
    it('día específico del mes', () => {
      const res = calcularProximaEjecucion({
        frecuencia: 'mensual',
        hora: HORA,
        fechaInicio: MAYO_10_2026,
        diaEjecucion: 5,
        ahora: MAYO_10_2026,
      });
      // 10/5 ya pasó día 5 → próximo es 5 junio
      expect(res!.getMonth()).toBe(5);
      expect(res!.getDate()).toBe(5);
    });

    it('día 31 en febrero usa último día del mes', () => {
      const res = calcularProximaEjecucion({
        frecuencia: 'mensual',
        hora: HORA,
        fechaInicio: new Date(2027, 0, 1), // 1 enero 2027
        diaEjecucion: 31,
        ultimaEjecucion: new Date(2027, 0, 31, 12, 0, 0), // ejecutado 31 enero
        ahora: new Date(2027, 1, 1, 0, 0, 0),
      });
      // Próximo mes: febrero 2027 (no bisiesto) tiene 28 días.
      expect(res!.getMonth()).toBe(1);
      expect(res!.getDate()).toBe(28);
    });

    it('opción ultimoDiaDelMes ignora diaEjecucion', () => {
      const res = calcularProximaEjecucion({
        frecuencia: 'mensual',
        hora: HORA,
        fechaInicio: new Date(2026, 4, 1),
        ultimoDiaDelMes: true,
        ahora: new Date(2026, 4, 1),
      });
      expect(res!.getMonth()).toBe(4); // mayo
      expect(res!.getDate()).toBe(31);
    });

    it('respeta fechaFin devolviendo null', () => {
      const res = calcularProximaEjecucion({
        frecuencia: 'mensual',
        hora: HORA,
        fechaInicio: MAYO_10_2026,
        fechaFin: new Date(2026, 4, 31), // fin de mayo
        diaEjecucion: 5,
        ultimaEjecucion: new Date(2026, 4, 5, 12, 0, 0),
        ahora: new Date(2026, 4, 6, 0, 0, 0),
      });
      // próximo sería 5 junio, pero fechaFin es 31 mayo → null
      expect(res).toBeNull();
    });
  });

  describe('frecuencia personalizada', () => {
    it('cada N días desde fechaInicio', () => {
      const res = calcularProximaEjecucion({
        frecuencia: 'personalizada',
        hora: HORA,
        fechaInicio: MAYO_10_2026,
        intervaloDias: 10,
        ahora: MAYO_10_2026,
      });
      expect(res!.getDate()).toBe(10);
      expect(res!.getHours()).toBe(12);
    });

    it('después de ejecutar, suma intervalo', () => {
      const res = calcularProximaEjecucion({
        frecuencia: 'personalizada',
        hora: HORA,
        fechaInicio: MAYO_10_2026,
        intervaloDias: 10,
        ultimaEjecucion: new Date(2026, 4, 10, 12, 0, 0),
        ahora: new Date(2026, 4, 11, 0, 0, 0),
      });
      expect(res!.getDate()).toBe(20);
    });

    it('lanza error si intervaloDias < 1', () => {
      expect(() =>
        calcularProximaEjecucion({
          frecuencia: 'personalizada',
          hora: HORA,
          fechaInicio: MAYO_10_2026,
          intervaloDias: 0,
        }),
      ).toThrow();
    });
  });

  describe('validaciones', () => {
    it('lanza error con hora inválida', () => {
      expect(() =>
        calcularProximaEjecucion({
          frecuencia: 'mensual',
          hora: '25:00',
          fechaInicio: MAYO_10_2026,
          diaEjecucion: 5,
        }),
      ).toThrow();
    });

    it('lanza error con formato de hora incorrecto', () => {
      expect(() =>
        calcularProximaEjecucion({
          frecuencia: 'mensual',
          hora: '12-00',
          fechaInicio: MAYO_10_2026,
          diaEjecucion: 5,
        }),
      ).toThrow();
    });
  });
});

describe('describirFrecuencia', () => {
  it('diaria', () => {
    expect(describirFrecuencia({ frecuencia: 'diaria' })).toBe('Cada día');
  });

  it('semanal con día', () => {
    expect(describirFrecuencia({ frecuencia: 'semanal', diaEjecucion: 1 })).toBe('Cada lunes');
    expect(describirFrecuencia({ frecuencia: 'semanal', diaEjecucion: 5 })).toBe('Cada viernes');
  });

  it('quincenal', () => {
    expect(describirFrecuencia({ frecuencia: 'quincenal' })).toBe('Cada 15 días');
  });

  it('mensual día específico', () => {
    expect(describirFrecuencia({ frecuencia: 'mensual', diaEjecucion: 5 })).toBe('Día 5 de cada mes');
  });

  it('mensual último día', () => {
    expect(describirFrecuencia({ frecuencia: 'mensual', ultimoDiaDelMes: true })).toBe(
      'Último día de cada mes',
    );
  });

  it('personalizada', () => {
    expect(describirFrecuencia({ frecuencia: 'personalizada', intervaloDias: 10 })).toBe(
      'Cada 10 días',
    );
  });

  it('única', () => {
    expect(describirFrecuencia({ frecuencia: 'unica' })).toBe('Una sola vez');
  });
});
