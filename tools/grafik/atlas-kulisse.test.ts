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
        expect(d.length).toBeLessThan(320);
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

  it('Varianten (G15): jede Form hat ein Bild, Pflanzliches auch je Jahreszeit', () => {
    for (const thema of THEMEN) {
      const k = kulisseFuer(thema);
      if (!k) throw new Error(thema);
      for (const [name, n] of Object.entries(k.varianten))
        for (let v = 2; v <= n; v++) {
          expect(existsSync(datei(thema, `${name}_${v}`)), `${thema}/${name}_${v}`).toBe(true);
          if (k.jahreszeitDinge.includes(name))
            for (const jz of JZ)
              expect(existsSync(datei(thema, `${name}_${v}_${jz}`)), `${name}_${v}_${jz}`).toBe(
                true,
              );
        }
    }
  });

  it('eigene Szenerie: anderer Startwert, andere Umgebung; gleicher Startwert, gleiche', () => {
    const k = kulisseFuer('weltraum');
    if (!k) throw new Error('weltraum');
    const a = kulissenDinge(12, 12, k, 0);
    const b = kulissenDinge(12, 12, k, 123456);
    expect(kulissenDinge(12, 12, k, 123456)).toEqual(b);
    expect(b).not.toEqual(a);
    // Varianten kommen vor, alle Formen
    const formen = new Set(b.filter((d) => d.bild === 'kraterfeld').map((d) => d.variante ?? 1));
    expect(formen.size).toBeGreaterThan(1);
  });

  it('oben und unten etwa gleich voll (PV: unten waren mehr)', () => {
    const k = kulisseFuer('bastion');
    if (!k) throw new Error('bastion');
    const d = kulissenDinge(12, 12, k).filter((x) => Math.abs(x.gx - x.gy) < 14);
    // nah am Bauplatz, bis 14 Felder darüber bzw. darunter (Bildschirm-y folgt gx + gy)
    const oben = d.filter((x) => x.gx + x.gy < 0 && x.gx + x.gy > -28).length;
    const unten = d.filter((x) => x.gx + x.gy > 24 && x.gx + x.gy < 52).length;
    expect(oben / unten).toBeGreaterThan(0.8);
  });
});
