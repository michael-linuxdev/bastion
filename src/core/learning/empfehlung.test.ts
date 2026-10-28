import { describe, expect, it } from 'vitest';
import { empfohlen, rueckweg, RUECKWEG_AB } from './empfehlung';

// A → B → C, und D braucht B
const ks = [
  { id: 'A', voraussetzungen: [] },
  { id: 'B', voraussetzungen: ['A'] },
  { id: 'C', voraussetzungen: ['B'] },
  { id: 'D', voraussetzungen: ['B'] },
];

describe('Empfehlungen (L-5)', () => {
  it('empfiehlt, was als Nächstes dran ist', () => {
    expect(empfohlen(ks, () => false)).toEqual(['A']);
    expect(empfohlen(ks, (id) => id === 'A')).toEqual(['B']);
    expect(empfohlen(ks, (id) => id === 'A' || id === 'B')).toEqual(['C', 'D']);
    expect(empfohlen(ks, () => true)).toEqual([]);
  });
});

describe('Rückweg bei Fehlern (LEHRPLAN §7)', () => {
  it('erst nach mehreren Fehlern in Folge', () => {
    expect(rueckweg('C', ks, () => false, RUECKWEG_AB - 1)).toBeUndefined();
  });
  it('schlägt die grundlegendste offene Voraussetzung vor', () => {
    expect(rueckweg('C', ks, () => false, RUECKWEG_AB)).toBe('A');
    expect(rueckweg('C', ks, (id) => id === 'A', RUECKWEG_AB)).toBe('B');
  });
  it('nichts, wenn alle Voraussetzungen sitzen', () => {
    expect(rueckweg('C', ks, (id) => id !== 'C', RUECKWEG_AB)).toBeUndefined();
    expect(rueckweg('A', ks, () => false, RUECKWEG_AB)).toBeUndefined();
  });
});
