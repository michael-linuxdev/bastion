import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import {
  bruch,
  ggT,
  gleichGeschrieben,
  istGekuerzt,
  teilerfremdeZaehler,
  wertgleich,
} from './bruch';

describe('bruch', () => {
  it('ggT stimmt mit Teilersuche überein', () => {
    fc.assert(
      fc.property(fc.integer({ min: 1, max: 500 }), fc.integer({ min: 1, max: 500 }), (a, b) => {
        let erwartet = 1;
        for (let t = 1; t <= Math.min(a, b); t++) if (a % t === 0 && b % t === 0) erwartet = t;
        expect(ggT(a, b)).toBe(erwartet);
      }),
    );
    expect(ggT(0, 7)).toBe(7);
    expect(ggT(-12, 18)).toBe(6);
  });

  it('unterscheidet gleiche Schreibweise und gleichen Wert', () => {
    expect(gleichGeschrieben(bruch(1, 2), bruch(1, 2))).toBe(true);
    expect(gleichGeschrieben(bruch(1, 2), bruch(2, 4))).toBe(false);
    expect(wertgleich(bruch(1, 2), bruch(2, 4))).toBe(true);
    expect(wertgleich(bruch(1, 2), bruch(2, 3))).toBe(false);
  });

  it('erkennt gekürzte Brüche', () => {
    expect(istGekuerzt(bruch(3, 4))).toBe(true);
    expect(istGekuerzt(bruch(6, 8))).toBe(false);
  });

  it('liefert teilerfremde Zähler', () => {
    expect(teilerfremdeZaehler(2)).toEqual([1]);
    expect(teilerfremdeZaehler(6)).toEqual([1, 5]);
    expect(teilerfremdeZaehler(7)).toEqual([1, 2, 3, 4, 5, 6]);
  });

  it('weist ungültige Brüche ab', () => {
    expect(() => bruch(1, 0)).toThrow(RangeError);
    expect(() => bruch(1, -2)).toThrow(RangeError);
    expect(() => bruch(1.5, 2)).toThrow(RangeError);
  });
});
