import { describe, expect, it } from 'vitest';
import { HINTERHOF_PRO_REIHE, hinterhofPlatzLayout, hinterhofPlatzZelle } from './hinterhof-layout';

describe('hinterhofPlatzLayout', () => {
  it('hält wenige Plätze in einer Reihe ohne Überlappungs-Skala', () => {
    const l = hinterhofPlatzLayout(4);
    expect(l.reihen).toBe(1);
    expect(l.proReihe).toBe(4);
    expect(l.skala).toBeGreaterThan(0.45);
  });

  it('bricht ab PRO_REIHE um und verkleinert die Sprites', () => {
    const l = hinterhofPlatzLayout(24);
    expect(l.reihen).toBe(Math.ceil(24 / HINTERHOF_PRO_REIHE));
    expect(l.proReihe).toBe(HINTERHOF_PRO_REIHE);
    expect(l.skala).toBeLessThanOrEqual(0.72);
    // Abstand der Zentren bleibt am Ziel – keine Stapelung in eine 11er-Breite
    expect(l.abstand).toBeGreaterThanOrEqual(0.5);
  });

  it('liefert stabile Zellenindizes', () => {
    expect(hinterhofPlatzZelle(0, 10)).toEqual({ reihe: 0, spalte: 0 });
    expect(hinterhofPlatzZelle(10, 10)).toEqual({ reihe: 1, spalte: 0 });
    expect(hinterhofPlatzZelle(23, 10)).toEqual({ reihe: 2, spalte: 3 });
  });
});
