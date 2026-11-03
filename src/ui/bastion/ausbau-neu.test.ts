import { describe, expect, it } from 'vitest';
import { KATALOG } from '../../core/bastion/katalog';
import { ausbauNeu } from './ausbau-neu';

describe('Satz zum Ausbau (G4, GRAFIK-SPRITES.md §13.2)', () => {
  for (const thema of ['bastion', 'dorf', 'garten', 'unterwasser', 'weltraum'] as const) {
    it(`hat für jede Ausbau-Stufe im Thema ${thema} einen Satz`, () => {
      for (const typ of ['kern', 'wissen', 'turm', 'werkstatt', 'eingang'] as const) {
        const stufen = KATALOG[typ].stufen.length;
        for (let s = 2; s <= stufen; s++)
          expect(ausbauNeu(thema, 1, typ, s), `${typ} ${s}`).toMatch(/\S/);
      }
    });
  }

  it('der Satz hängt nicht von der Epoche ab (eine Stufe, ein Bild)', () => {
    expect(ausbauNeu('weltraum', 3, 'kern', 4)).toBe(ausbauNeu('weltraum', 2, 'kern', 4));
  });

  it('ohne Satz (Stufe 1, nichts auszubauen) gibt es nichts', () => {
    expect(ausbauNeu('weltraum', 1, 'kern', 1)).toBeUndefined();
  });
});
