import { describe, expect, it } from 'vitest';
import { bodenLeben } from './boden-leben';
import { feldSchluessel } from './pfad';

describe('Boden mit Leben (Schritt 7)', () => {
  it('ist fest und lässt bebaute Felder frei', () => {
    const belegt = new Set([feldSchluessel(2, 3), feldSchluessel(5, 5)]);
    const a = bodenLeben(12, 12, 'sommer', belegt);
    expect(a).toEqual(bodenLeben(12, 12, 'sommer', belegt));
    expect(a.length).toBeGreaterThan(100);
    for (const d of a) {
      expect(belegt.has(feldSchluessel(Math.floor(d.x), Math.floor(d.y)))).toBe(false);
      expect(d.x).toBeGreaterThan(0);
      expect(d.x).toBeLessThan(12);
    }
  });

  it('je Jahreszeit das Passende: Blüten, Laub, Spuren', () => {
    const arten = (jz: 'fruehling' | 'sommer' | 'herbst' | 'winter') =>
      new Set(bodenLeben(12, 12, jz, new Set()).map((d) => d.art));
    expect(arten('fruehling').has('bluete')).toBe(true);
    expect(arten('herbst').has('laub')).toBe(true);
    expect(arten('herbst').has('bluete')).toBe(false);
    expect(arten('winter').has('spur')).toBe(true);
    expect(arten('winter').has('bluete')).toBe(false);
  });
});
