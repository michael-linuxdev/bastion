import { describe, expect, it } from 'vitest';
import { aufInsel, inselRand, RAND_MAX, RAND_MIN } from './insel-rand';
import { inselBewuchs, kulisseFuer, kulissenDinge } from './kulisse';

describe('Unförmige Insel (§20, Wunsch PV)', () => {
  it('Küste fest je Startwert, anders bei anderem Startwert', () => {
    expect(inselRand(12, 12, 7)).toEqual(inselRand(12, 12, 7));
    expect(inselRand(12, 12, 7)).not.toEqual(inselRand(12, 12, 8));
  });

  it('der ganze Bauplatz samt Einfassung liegt auf der Insel, mit Rand davor', () => {
    for (const s of [0, 1, 99, 123456]) {
      const r = inselRand(16, 16, s);
      for (const [gx, gy] of [
        [-1, -1],
        [17, -1],
        [17, 17],
        [-1, 17],
        [8, 8],
      ] as const)
        expect(aufInsel({ gx, gy }, r), `${s}: ${gx},${gy}`).toBe(true);
      // mindestens RAND_MIN, höchstens RAND_MAX über die Einfassung hinaus (etwa)
      const weit = (p: { gx: number; gy: number }) =>
        Math.max(-1 - p.gx, p.gx - 17, -1 - p.gy, p.gy - 17);
      for (const p of r) {
        // an den Ecken geht die Küste schräg hinaus: achsenweise nur etwa 0,7-mal so weit
        expect(weit(p)).toBeGreaterThanOrEqual(RAND_MIN * 0.7 - 0.01);
        expect(weit(p)).toBeLessThanOrEqual(RAND_MAX * 1.5);
      }
    }
  });

  it('Bewuchs steht auf dem Inselrand, nicht im Wasser und nicht auf dem Bauplatz', () => {
    for (const thema of ['bastion', 'dorf', 'garten', 'unterwasser'] as const)
      for (const s of [0, 42]) {
        const r = inselRand(12, 12, s);
        const b = inselBewuchs(12, 12, thema, s);
        expect(b.length).toBeGreaterThan(5);
        for (const w of b) {
          expect(aufInsel(w, r), `${thema} ${w.pfad} im Wasser`).toBe(true);
          const aufPlatz = w.gx > -1 && w.gx < 13 && w.gy > -1 && w.gy < 13;
          expect(aufPlatz, `${thema} ${w.pfad} auf dem Bauplatz`).toBe(false);
          // Hohes nur hinten (sonst verschwände es hinter der Bühne)
          if (/baum/.test(w.pfad)) expect(w.gx + w.gy).toBeLessThan(12);
        }
      }
  });

  it('Dinge der Kulisse liegen nicht auf dem Inselrand', () => {
    const k = kulisseFuer('bastion');
    if (!k) throw new Error('bastion');
    for (const s of [0, 5]) {
      const r = inselRand(12, 12, s);
      for (const d of kulissenDinge(12, 12, k, s)) expect(aufInsel(d, r), d.bild).toBe(false);
    }
  });
});
