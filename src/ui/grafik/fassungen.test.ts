import { describe, expect, it } from 'vitest';
import { FARB_ROLLEN, FASSUNGEN, type FarbRolle } from './fassungen';
import { kontrast } from './kontrast';

/** Text auf Fläche: mindestens 4,5 : 1 (GRAFIK §1). */
const TEXT: readonly [FarbRolle, FarbRolle][] = [
  ['farbe-text', 'farbe-hintergrund'],
  ['farbe-text', 'farbe-flaeche'],
  ['farbe-text', 'farbe-flaeche-leise'],
  ['farbe-text', 'farbe-hinweis-flaeche'],
  ['farbe-text-leise', 'farbe-hintergrund'],
  ['farbe-text-leise', 'farbe-flaeche'],
  ['farbe-text-leise', 'farbe-flaeche-leise'],
  ['farbe-text-leise', 'farbe-hinweis-flaeche'],
  ['farbe-auf-akzent', 'farbe-akzent'],
  ['farbe-akzent', 'farbe-hintergrund'],
  ['farbe-akzent', 'farbe-flaeche'],
  ['farbe-erfolg', 'farbe-hintergrund'],
  ['farbe-erfolg', 'farbe-flaeche'],
];

/** Bilder und Ränder, die etwas bedeuten: mindestens 3 : 1 (WCAG 1.4.11). */
const BILD: readonly [FarbRolle, FarbRolle][] = [
  ['farbe-akzent-warm', 'farbe-flaeche'],
  ['bastion-linie', 'bastion-boden'],
];

describe('Fassungen der Grafik (GRAFIK §1–§3)', () => {
  for (const [name, fassung] of Object.entries(FASSUNGEN)) {
    for (const modus of ['hell', 'dunkel'] as const) {
      const f = fassung[modus];
      it(`${name}, ${modus}: alle Rollen gefüllt`, () => {
        for (const rolle of FARB_ROLLEN) expect(f[rolle], rolle).toBeTruthy();
      });
      it(`${name}, ${modus}: Text mindestens 4,5 : 1`, () => {
        for (const [vorne, hinten] of TEXT) {
          expect(kontrast(f[vorne], f[hinten]), `${vorne} auf ${hinten}`).toBeGreaterThanOrEqual(
            4.5,
          );
        }
      });
      it(`${name}, ${modus}: Bilder mindestens 3 : 1`, () => {
        for (const [vorne, hinten] of BILD) {
          expect(kontrast(f[vorne], f[hinten]), `${vorne} auf ${hinten}`).toBeGreaterThanOrEqual(3);
        }
      });
    }
  }
});

describe('Kontrast', () => {
  it('Schwarz auf Weiß ist 21 : 1, gleiche Farben 1 : 1', () => {
    expect(kontrast('#000000', '#ffffff')).toBeCloseTo(21, 5);
    expect(kontrast('#ffffff', '#000000')).toBeCloseTo(21, 5);
    expect(kontrast('#1f7a72', '#1f7a72')).toBe(1);
  });
});
