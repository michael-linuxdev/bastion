import { describe, expect, it } from 'vitest';
import { dingBild, dingeUmBauplatz, kulisseFuer, kulissenLage, stimmungAus } from './kulisse';

const zeiten = { aufgangMin: 7 * 60, untergangMin: 17 * 60 };
const um = (h: number, m = 0) => new Date(2026, 10, 2, h, m);

describe('Kulisse (GRAFIK §13)', () => {
  it('Stimmung: Tag, eine Stunde Dämmerung nach Untergang und vor Aufgang, sonst Nacht', () => {
    expect(stimmungAus(false, um(22), zeiten)).toBe('tag');
    expect(stimmungAus(true, um(17, 30), zeiten)).toBe('daemmerung');
    expect(stimmungAus(true, um(18, 30), zeiten)).toBe('nacht');
    expect(stimmungAus(true, um(3), zeiten)).toBe('nacht');
    expect(stimmungAus(true, um(6, 30), zeiten)).toBe('daemmerung');
  });

  it('Variante C: Horizont weit über der Insel – herausgezoomt im Bild, hineingezoomt darüber', () => {
    const fern = kulissenLage({ x: 0, y: 200, zoom: 0.5 }, 160);
    const nah = kulissenLage({ x: 0, y: 200, zoom: 1.5 }, 160);
    expect(fern.horizontY).toBeGreaterThan(0);
    expect(nah.horizontY).toBeLessThan(0);
    // weit weg: der Horizont bewegt sich beim Verschieben kaum
    expect(kulissenLage({ x: 100, y: 0, zoom: 1 }, 160).horizontX).toBe(25);
  });

  it('Dinge liegen außerhalb des Bauplatzes', () => {
    for (const d of dingeUmBauplatz(12, 12)) {
      const innen = d.gx >= 0 && d.gx <= 12 && d.gy >= 0 && d.gy <= 12;
      expect(innen, d.bild).toBe(false);
    }
  });

  it('jedes Thema hat eine Kulisse (Grafik Punkt 3); Wasser und Boot nur bei der Bastion', () => {
    for (const t of ['bastion', 'dorf', 'garten', 'unterwasser', 'weltraum'] as const) {
      const k = kulisseFuer(t);
      expect(k, t).toBeDefined();
      expect(k?.dinge.length, t).toBeGreaterThan(0);
    }
    expect(kulisseFuer('bastion')?.wasser).toBe(true);
    expect(kulisseFuer('dorf')?.boot).toBe(false);
    expect(kulisseFuer('weltraum')?.sterneImmer).toBe(true);
  });

  it('die Dinge eines Themas liegen an den festen Plätzen', () => {
    const d = dingeUmBauplatz(12, 12, ['a', 'b']);
    expect(d.map((x) => x.bild)).toEqual(['a', 'b', 'a', 'b', 'a', 'b']);
  });

  it('Dinge je Jahreszeit: eigenes Bild nur, wo es eines gibt; Sommer ohne Zusatz', () => {
    const dorf = kulisseFuer('dorf');
    if (!dorf) throw new Error('dorf');
    expect(dingBild(dorf, 'obstbaum', 'herbst')).toBe('obstbaum_herbst');
    expect(dingBild(dorf, 'obstbaum', 'sommer')).toBe('obstbaum');
    expect(dingBild(dorf, 'heuballen', 'winter')).toBe('heuballen');
    expect(kulisseFuer('weltraum')?.jahreszeitBoden).toBe(false);
  });
});
