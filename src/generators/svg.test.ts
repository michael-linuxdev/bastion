import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { bild, flaeche, gestrichelt, koordinatensystemBereich, kurve } from './svg';

const ks = koordinatensystemBereich(-5, 5, -3, 9);
const zahlen = (pfad: string) => [...pfad.matchAll(/-?\d+(?:\.\d+)?/g)].map((m) => Number(m[0]));

describe('Kurven im Bild (B5)', () => {
  it('Koordinatensystem für einen Ausschnitt: Größe und Umrechnung', () => {
    expect(ks.breite).toBe(2 * 22 + 10 * 26);
    expect(ks.hoehe).toBe(2 * 22 + 12 * 26);
    expect(ks.px(-5)).toBe(22);
    expect(ks.py(9)).toBe(22);
    expect(ks.py(-3)).toBe(22 + 12 * 26);
  });

  it('Parabel: ein durchgehender Pfad, alle Punkte im Bild', () => {
    const p = kurve(ks, (x) => x * x - 2, -5, 5, ks);
    expect(p.match(/M/g)?.length).toBe(1);
    expect(p).not.toContain('NaN');
    const d = /d="([^"]+)"/.exec(p)?.[1] ?? '';
    // genau im Gitter: x zwischen px(−5) und px(5), y zwischen py(9) und py(−3)
    const z = zahlen(d);
    for (let i = 0; i < z.length; i += 2) {
      expect(z[i]).toBeGreaterThanOrEqual(ks.px(-5) - 0.01);
      expect(z[i]).toBeLessThanOrEqual(ks.px(5) + 0.01);
      expect(z[i + 1]).toBeGreaterThanOrEqual(ks.py(9) - 0.01);
      expect(z[i + 1]).toBeLessThanOrEqual(ks.py(-3) + 0.01);
    }
  });

  it('1/x: zwei Äste, nicht über die Polstelle verbunden, bis an den Rand', () => {
    const b = koordinatensystemBereich(-5, 5, -5, 5);
    const p = kurve(b, (x) => 1 / x, -5, 5, b);
    expect(p.match(/M/g)?.length).toBe(2);
    expect(p).not.toContain('Infinity');
    // der untere Ast reicht bis y = −5, der obere bis y = 5
    expect(p).toContain(` ${b.py(-5)}`);
    expect(p).toContain(` ${b.py(5)}`);
  });

  it('Wurzel: nur wo definiert', () => {
    const p = kurve(ks, (x) => Math.sqrt(x), -5, 5, ks);
    expect(p.match(/M/g)?.length).toBe(1);
    const erstes = /M(-?[\d.]+)/.exec(p)?.[1];
    expect(Number(erstes)).toBeGreaterThanOrEqual(ks.px(0) - 1);
  });

  it('ganz außerhalb: kein Pfad', () => {
    expect(kurve(ks, () => 100, -5, 5, ks)).toBe('');
  });

  it('Pfad ohne NaN für beliebige Polynome (Eigenschaft)', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: -3, max: 3 }),
        fc.integer({ min: -5, max: 5 }),
        fc.integer({ min: -5, max: 5 }),
        (a, b, c) => {
          const p = kurve(ks, (x) => a * x * x + b * x + c, -5, 5, ks);
          expect(p).not.toMatch(/NaN|Infinity/);
        },
      ),
    );
  });

  it('Asymptote gestrichelt, Fläche halb durchsichtig', () => {
    expect(gestrichelt(0, 0, 10, 0)).toContain('stroke-dasharray');
    const f = flaeche(
      ks,
      (x) => x * x,
      () => 0,
      0,
      2,
    );
    expect(f).toContain('fill-opacity');
    expect(f).not.toContain('NaN');
  });

  it('das Bild enthält keine Skripte oder Verweise', () => {
    const b = bild(ks.breite, ks.hoehe, [...ks.teile, kurve(ks, Math.sin, -5, 5, ks)], {
      de: 'Sinus',
    });
    expect(b.svg).not.toMatch(/<script|href=|on\w+=/i);
  });
});
