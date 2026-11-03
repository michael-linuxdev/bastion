import { describe, expect, it } from 'vitest';
import { pfuetzen, REGENBOGEN_FARBEN, schneeFlecken, wolkenSchatten } from './wetter-optik';

describe('Wetter-Optik (Auftrag Grafik Punkt 2)', () => {
  it('Pfützen und Schneeflecken liegen fest auf dem Bauplatz', () => {
    const a = pfuetzen(12, 12);
    expect(a).toEqual(pfuetzen(12, 12));
    expect(a.length).toBeGreaterThanOrEqual(4);
    for (const p of [...a, ...schneeFlecken(12, 12)]) {
      expect(p.pos.x).toBeGreaterThanOrEqual(0);
      expect(p.pos.x).toBeLessThan(12);
      expect(p.pos.y).toBeGreaterThanOrEqual(0);
      expect(p.pos.y).toBeLessThan(12);
    }
    expect(schneeFlecken(16, 16).length).toBeGreaterThan(schneeFlecken(12, 12).length);
  });

  it('Wolkenschatten ziehen nur mit Bewegung', () => {
    expect(wolkenSchatten(5000, 600, 500, false)).toEqual(wolkenSchatten(0, 600, 500, false));
    expect(wolkenSchatten(5000, 600, 500, true)[0]?.x).not.toBe(
      wolkenSchatten(0, 600, 500, true)[0]?.x,
    );
  });

  it('Regenbogen hat sieben sanfte Bänder', () => {
    expect(REGENBOGEN_FARBEN).toHaveLength(7);
  });
});
