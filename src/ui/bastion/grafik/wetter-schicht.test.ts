import { describe, expect, it } from 'vitest';
import { WETTER_BILDER, WETTER_STAERKEN } from './wetter';
import { regenKachel, schneeKachel, wetterschicht } from './wetter-schicht';

describe('Wetterschicht über dem ganzen Bild', () => {
  it('ist deterministisch', () => {
    expect(wetterschicht('regen', 'stark', true)).toEqual(wetterschicht('regen', 'stark', true));
    expect(regenKachel(180, 10, 16, 0, 1)).toBe(regenKachel(180, 10, 16, 0, 1));
    expect(schneeKachel(200, 9, 2, 3)).toBe(schneeKachel(200, 9, 2, 3));
  });

  it('unter Wasser und im Weltraum gibt es kein Wetter, bei Sonne auch nicht', () => {
    for (const b of WETTER_BILDER) expect(wetterschicht(b, 'stark', false).ebenen).toEqual([]);
    expect(wetterschicht('klar', 'mittel', true)).toEqual({
      ebenen: [],
      schleier: 0,
      nebel: 0,
      wolkenschatten: 0,
    });
  });

  it('stärker heißt dichter: Niesel < Regen < Starkregen', () => {
    const striche = (s: (typeof WETTER_STAERKEN)[number]) =>
      wetterschicht('regen', s, true)
        .ebenen.map((e) => decodeURIComponent(e.kachel).split('<line').length)
        .reduce((a, b) => a + b, 0);
    expect(striche('leicht')).toBeLessThan(striche('mittel'));
    expect(striche('mittel')).toBeLessThan(striche('stark'));
    expect(wetterschicht('regen', 'stark', true).schleier).toBeGreaterThan(
      wetterschicht('regen', 'leicht', true).schleier,
    );
  });

  it('die Schleife ist nahtlos: der Weg ist ein Vielfaches der Kachel', () => {
    for (const b of WETTER_BILDER)
      for (const s of WETTER_STAERKEN)
        for (const e of wetterschicht(b, s, true).ebenen) {
          expect(Math.abs(e.weg.x % e.groesse)).toBe(0);
          expect(e.weg.y % e.groesse).toBe(0);
          // je Abschnitt genau eine Kachel nach unten: die Ebene ragt nur so weit über
          expect(e.weg.y / e.abschnitte).toBe(e.groesse);
          // waagrecht höchstens eine Kachel
          expect(Math.abs(e.weg.x)).toBeLessThanOrEqual(e.groesse);
        }
  });

  it('senkrechter Regen zieht eine Kachel je Durchlauf, so schnell wie vorher (GRAFIK §32)', () => {
    // Die Ebene ist Fenster plus Weg hoch: eine Kachel statt zwei spart Grafikspeicher
    for (const e of wetterschicht('regen', 'mittel', true).ebenen) {
      expect(Math.abs(e.weg.x)).toBe(0);
      expect(e.weg.y).toBe(e.groesse);
      expect(e.weg.y / e.dauer).toBeGreaterThanOrEqual(450);
    }
    const [vorn] = wetterschicht('regen', 'mittel', true).ebenen;
    // vorher 360 px in 0,8 s
    expect((vorn?.weg.y ?? 0) / (vorn?.dauer ?? 1)).toBeCloseTo(360 / 0.8);
  });

  it('„leicht“ zeigt nur eine Ebene', () => {
    expect(wetterschicht('schnee', 'mittel', true, true).ebenen).toHaveLength(1);
    expect(wetterschicht('schnee', 'mittel', true).ebenen.length).toBeGreaterThan(1);
  });
});
