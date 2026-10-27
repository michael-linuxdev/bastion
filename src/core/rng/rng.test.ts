import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { rng } from './rng';

describe('rng', () => {
  it('liefert für feste Seeds immer dieselben Werte (Verfahren darf sich nicht ändern)', () => {
    const erste4 = (seed: number) => {
      const r = rng(seed);
      return [r.uint32(), r.uint32(), r.uint32(), r.uint32()];
    };
    expect(erste4(0)).toEqual([548183886, 1097162541, 2219297441, 1664216021]);
    expect(erste4(1)).toEqual([1130556604, 2591592147, 3014952990, 960850752]);
    expect(erste4(42)).toEqual([3825871779, 1851418855, 1383259262, 890322987]);
    expect(erste4(0xffffffff)).toEqual([2246433216, 2156899173, 2040853526, 3823104220]);

    const wuerfel = rng(7);
    expect(Array.from({ length: 10 }, () => wuerfel.int(1, 6))).toEqual([
      2, 2, 6, 2, 5, 2, 2, 6, 5, 5,
    ]);
  });

  it('gleicher Seed → gleiche Folge', () => {
    fc.assert(
      fc.property(fc.nat({ max: 0xffffffff }), (seed) => {
        const a = rng(seed);
        const b = rng(seed);
        for (let i = 0; i < 20; i++) expect(a.uint32()).toBe(b.uint32());
      }),
    );
  });

  it('benachbarte Seeds liefern verschiedene Folgen', () => {
    const ersteWerte = new Set(Array.from({ length: 1000 }, (_, seed) => rng(seed).uint32()));
    expect(ersteWerte.size).toBe(1000);
  });

  it('int bleibt in den Grenzen', () => {
    fc.assert(
      fc.property(
        fc.nat({ max: 0xffffffff }),
        fc.integer({ min: -1_000_000, max: 1_000_000 }),
        fc.nat({ max: 1_000_000 }),
        (seed, min, breite) => {
          const r = rng(seed);
          for (let i = 0; i < 20; i++) {
            const x = r.int(min, min + breite);
            expect(Number.isInteger(x)).toBe(true);
            expect(x).toBeGreaterThanOrEqual(min);
            expect(x).toBeLessThanOrEqual(min + breite);
          }
        },
      ),
    );
  });

  it('int ist annähernd gleichverteilt', () => {
    const r = rng(123);
    const anzahl = [0, 0, 0, 0, 0, 0];
    for (let i = 0; i < 60_000; i++) {
      const augen = r.int(1, 6);
      anzahl[augen - 1] = (anzahl[augen - 1] ?? 0) + 1;
    }
    for (const n of anzahl) expect(Math.abs(n - 10_000)).toBeLessThan(500);
  });

  it('zahl liegt in [0, 1)', () => {
    const r = rng(5);
    for (let i = 0; i < 10_000; i++) {
      const x = r.zahl();
      expect(x).toBeGreaterThanOrEqual(0);
      expect(x).toBeLessThan(1);
    }
  });

  it('pick wählt nur aus der Liste und erreicht jedes Element', () => {
    const r = rng(9);
    const liste = ['a', 'b', 'c'] as const;
    const gesehen = new Set<string>();
    for (let i = 0; i < 100; i++) gesehen.add(r.pick(liste));
    expect([...gesehen].sort()).toEqual(['a', 'b', 'c']);
  });

  it('weist ungültige Eingaben ab', () => {
    expect(() => rng(-1)).toThrow(RangeError);
    expect(() => rng(1.5)).toThrow(RangeError);
    expect(() => rng(2 ** 32)).toThrow(RangeError);
    expect(() => rng(1).int(5, 4)).toThrow(RangeError);
    expect(() => rng(1).int(0, 2 ** 32)).toThrow(RangeError);
    expect(() => rng(1).pick([])).toThrow(RangeError);
  });
});
