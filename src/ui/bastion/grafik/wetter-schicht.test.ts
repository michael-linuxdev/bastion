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
        }
  });

  it('„leicht“ zeigt nur eine Ebene', () => {
    expect(wetterschicht('schnee', 'mittel', true, true).ebenen).toHaveLength(1);
    expect(wetterschicht('schnee', 'mittel', true).ebenen.length).toBeGreaterThan(1);
  });
});
