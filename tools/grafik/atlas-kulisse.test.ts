import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { kulisseFuer, kulissenDinge } from '../../src/ui/bastion/grafik/kulisse.ts';

const THEMEN = ['bastion', 'dorf', 'garten', 'unterwasser', 'weltraum'] as const;
const JZ = ['fruehling', 'herbst', 'winter'] as const;
const datei = (thema: string, name: string) =>
  resolve(`public/grafik/atlas/kulisse/${thema}/dinge/${name}.png`);

describe('Kulisse mit Leben (G14, Wunsch PV)', () => {
  it('jedes Ding und jede Fläche hat ein Bild, Pflanzliches auch je Jahreszeit', () => {
    for (const thema of THEMEN) {
      const k = kulisseFuer(thema);
      if (!k) throw new Error(thema);
      for (const name of [...k.dinge, ...k.weitere, ...k.flaechen])
        expect(existsSync(datei(thema, name)), `${thema}/${name}`).toBe(true);
      for (const name of k.jahreszeitDinge)
        for (const jz of JZ)
          expect(existsSync(datei(thema, `${name}_${jz}`)), `${thema}/${name}_${jz}`).toBe(true);
      expect(k.leben.length).toBeGreaterThan(0);
    }
  });

  it('füllt die Fläche: deutlich mehr als die sechs Dinge am Bauplatz, nichts auf dem Bauplatz', () => {
    for (const thema of THEMEN) {
      const k = kulisseFuer(thema);
      if (!k) throw new Error(thema);
      for (const [b, t] of [
        [12, 12],
        [24, 24],
      ] as const) {
        const d = kulissenDinge(b, t, k);
        expect(d.length).toBeGreaterThan(30);
        expect(d.length).toBeLessThan(160);
        for (const x of d) {
          const innen = x.gx > -1 && x.gx < b + 1 && x.gy > -1 && x.gy < t + 1;
          expect(innen, `${thema} ${x.bild} ${x.gx},${x.gy}`).toBe(false);
        }
        // Flächen zuerst (liegen unten)
        const ersteNichtFlach = d.findIndex((x) => !x.flach);
        expect(d.slice(ersteNichtFlach).some((x) => x.flach)).toBe(false);
      }
    }
  });

  it('ist fest: gleiche Größe, gleiche Dinge an gleichen Plätzen', () => {
    const k = kulisseFuer('dorf');
    if (!k) throw new Error('dorf');
    expect(kulissenDinge(16, 16, k)).toEqual(kulissenDinge(16, 16, k));
  });
});
