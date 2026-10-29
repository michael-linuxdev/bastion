import { describe, expect, it } from 'vitest';
import { BAUPLATZ } from '../../../core/bastion/katalog';
import { BUEHNE_B, BUEHNE_H, feldUnter, punkt } from './iso';

describe('Schräg von oben (GRAFIK §1)', () => {
  it('die Mitte jedes Feldes führt zurück zu genau diesem Feld', () => {
    for (let x = 0; x < BAUPLATZ.breite; x++)
      for (let y = 0; y < BAUPLATZ.tiefe; y++) {
        const p = punkt(x + 0.5, y + 0.5);
        expect(feldUnter(p.x, p.y)).toEqual({ x, y });
      }
  });

  it('der ganze Bauplatz liegt auf der Bühne; daneben ist kein Feld', () => {
    for (const [gx, gy] of [
      [0, 0],
      [BAUPLATZ.breite, 0],
      [0, BAUPLATZ.tiefe],
      [BAUPLATZ.breite, BAUPLATZ.tiefe],
    ] as const) {
      const p = punkt(gx, gy);
      expect(p.x).toBeGreaterThanOrEqual(0);
      expect(p.x).toBeLessThanOrEqual(BUEHNE_B);
      expect(p.y).toBeGreaterThan(0);
      expect(p.y).toBeLessThan(BUEHNE_H);
    }
    expect(feldUnter(2, 2)).toBeUndefined();
    expect(feldUnter(BUEHNE_B - 2, BUEHNE_H - 2)).toBeUndefined();
  });
});
