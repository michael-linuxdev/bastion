import { describe, expect, it } from 'vitest';
import { uwKoralleLagen } from './unterwasser';

describe('Korallen aus dem Atlas (G3)', () => {
  it('feste Plätze, abwechselnd Ast und Fächer (kein Zufall)', () => {
    const lagen = uwKoralleLagen();
    expect(lagen).toEqual(uwKoralleLagen());
    expect(lagen.filter((k) => k.art === 'koralle_b').length).toBe(Math.floor(lagen.length / 2));
    for (const k of lagen) expect(k.bild).toBeLessThan(k.s);
  });
});
