import { describe, expect, it } from 'vitest';
import { KATALOG } from '../../core/bastion/katalog';
import { ausbauNeu } from './ausbau-neu';

describe('Satz zum Ausbau (G4)', () => {
  for (const thema of ['bastion', 'dorf', 'garten', 'unterwasser'] as const) {
    it(`hat für jede Ausbau-Stufe der Epoche 1 im Thema ${thema} einen Satz`, () => {
      for (const typ of ['kern', 'wissen', 'turm'] as const) {
        const stufen = KATALOG[typ].stufen.length;
        for (let s = 2; s <= Math.min(stufen, typ === 'kern' ? 3 : 2); s++)
          expect(ausbauNeu(thema, 1, typ, s)).toMatch(/\S/);
      }
    });
  }

  it('ohne Satz (anderes Thema) gibt es nichts', () => {
    expect(ausbauNeu('weltraum', 1, 'kern', 2)).toBeUndefined();
  });
});
