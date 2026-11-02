import { describe, expect, it } from 'vitest';
import { inselUmgebung } from './insel-umgebung';

describe('Umgebung am Inselrand (G3)', () => {
  for (const [b, t] of [
    [12, 12],
    [16, 16],
  ] as const) {
    it(`liegt bei ${b}×${t} Feldern nie auf einem Feld`, () => {
      for (const u of inselUmgebung(b, t)) {
        const aufFeld = u.x > -1 && u.x < b && u.y > -1 && u.y < t;
        expect(aufFeld).toBe(false);
      }
    });
  }

  it('ist fest (kein Zufall)', () => {
    expect(inselUmgebung(12, 12)).toEqual(inselUmgebung(12, 12));
  });
});
