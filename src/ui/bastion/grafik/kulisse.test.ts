import { describe, expect, it } from 'vitest';
import {
  cullKamera,
  cullRand,
  dingBild,
  sichtKasten,
  sichtRand,
  dingeUmBauplatz,
  kulisseFuer,
  kulissenLage,
  stimmungAus,
} from './kulisse';

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

  it('Culling mit Abstand: die Cull-Kamera springt bei 10 % Zoom oder bevor der Sichtkasten endet', () => {
    const fenster = { breite: 400, hoehe: 800 };
    const rand = sichtRand(fenster);
    // ein Achtel plus 24 Bildpunkte je Achse
    expect(rand).toEqual({ x: 74, y: 124 });
    const start = { x: 0, y: 0, zoom: 1 };
    expect(cullKamera(undefined, start, fenster)).toBe(start);
    // ein Achtel verschoben, zusammen mit 9 % Zoom: der Kasten deckt das Fenster noch
    expect(cullKamera(start, { x: 49, y: 99, zoom: 1.09 }, fenster)).toBe(start);
    expect(cullKamera(start, { x: -60, y: -110, zoom: 1 }, fenster)).toBe(start);
    // bis 8 Bildpunkte vor den Rand des Kastens: springt
    const weit = { x: 67, y: 0, zoom: 1 };
    expect(cullKamera(start, weit, fenster)).toBe(weit);
    const hoch = { x: 0, y: -117, zoom: 1 };
    expect(cullKamera(start, hoch, fenster)).toBe(hoch);
    const nah = { x: 0, y: 0, zoom: 1.1 };
    expect(cullKamera(start, nah, fenster)).toBe(nah);
    // Herauszoomen um 9 % mit Verschieben: der Kasten reicht rechts nicht mehr – springt
    const heraus = { x: -49, y: -99, zoom: 1 / 1.09 };
    expect(cullKamera(start, heraus, fenster)).toBe(heraus);
    // der Rand für Dinge und Figuren ist größer als der Kasten
    expect(cullRand(fenster)).toBeGreaterThanOrEqual(rand.y + 100);
  });

  it('kein Fenster-Bildpunkt liegt je außerhalb des Sichtkastens (Zoomen und Verschieben)', () => {
    const fenster = { breite: 390, hoehe: 844 };
    let cull = { x: -300, y: -500, zoom: 2.4 };
    let k = cull;
    // feste Folge kleiner Gesten: zwei Finger zoomen um einen Punkt und schieben dabei
    for (let i = 0; i < 2000; i++) {
      const f = { x: (i * 37) % 390, y: (i * 53) % 844 };
      const r = 1 + Math.sin(i / 7) * 0.03;
      const zoom = Math.min(2.4, Math.max(0.4, k.zoom * r));
      const q = zoom / k.zoom;
      k = {
        x: f.x - q * (f.x - k.x) + Math.cos(i / 5) * 9,
        y: f.y - q * (f.y - k.y) + Math.sin(i / 3) * 14,
        zoom,
      };
      cull = cullKamera(cull, k, fenster);
      const kasten = sichtKasten(cull, fenster, sichtRand(fenster));
      // Kasten mit der echten Kamera ins Fenster
      expect(k.x + kasten.x0 * k.zoom).toBeLessThanOrEqual(0);
      expect(k.y + kasten.y0 * k.zoom).toBeLessThanOrEqual(0);
      expect(k.x + (kasten.x0 + kasten.b) * k.zoom).toBeGreaterThanOrEqual(fenster.breite);
      expect(k.y + (kasten.y0 + kasten.h) * k.zoom).toBeGreaterThanOrEqual(fenster.hoehe);
    }
  });

  it('Sichtkasten: Fenster plus Rand, oben und unten auf den Inhalt der Ebene begrenzt', () => {
    const fenster = { breite: 400, hoehe: 800 };
    const rand = { x: 50, y: 100 };
    expect(sichtKasten({ x: 0, y: 0, zoom: 2 }, fenster, rand)).toEqual({
      x0: -25,
      y0: -50,
      b: 250,
      h: 500,
    });
    // Welt: über der Wasserlinie nichts
    expect(sichtKasten({ x: 0, y: 0, zoom: 1 }, fenster, rand, { oben: 300 })).toMatchObject({
      y0: 300,
      h: 600,
    });
    // Ferne ganz über dem Fenster: Höhe 0
    expect(sichtKasten({ x: 0, y: -2000, zoom: 0.5 }, fenster, rand, { unten: 26 }).h).toBe(0);
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
