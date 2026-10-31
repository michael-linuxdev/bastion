import { describe, expect, it } from 'vitest';
import { GEBAEUDE_TYPEN } from '../../../core/bastion/katalog';
import { BUEHNE_H } from './iso';
import {
  DORF_BILD,
  dorfBodenKachel,
  dorfBodenTint,
  dorfHoehe,
  hash01,
  schattieren,
  wiesenFarbe,
} from './dorf';

describe('Dorfbilder (GRAFIK §6)', () => {
  it('jede Gebäude-Rolle hat ein eigenes Bild', () => {
    for (const typ of GEBAEUDE_TYPEN) expect(DORF_BILD[typ], typ).toBeTruthy();
    expect(new Set(Object.values(DORF_BILD)).size).toBe(GEBAEUDE_TYPEN.length);
  });

  it('die Wiese nutzt die Farben aus Dorfkrieg, am Abend dunkler', () => {
    expect(wiesenFarbe(false, 0, 0, false)).toBe('#67a24a');
    expect(wiesenFarbe(false, 1, 0, false)).toBe('#5b9342');
    expect(wiesenFarbe(false, 0, 0, true)).toBe('#1c3124');
    expect(wiesenFarbe(true, 0, 0, false)).not.toBe(wiesenFarbe(false, 0, 0, false));
    expect(wiesenFarbe(true, -1, 0, true)).toBe('#121c16');
  });

  it('Wandtöne und die Höhen bleiben im Bild und wachsen bei Kern und Mühle', () => {
    expect(schattieren('#c4b29a', -32)).toBe('#a4927a');
    expect(schattieren('#010101', -32)).toBe('#000000');
    for (const typ of GEBAEUDE_TYPEN) {
      expect(dorfHoehe(typ, 1)).toBeGreaterThan(0);
      expect(dorfHoehe(typ, 1)).toBeLessThan(BUEHNE_H);
    }
    expect(dorfHoehe('kern', 2)).toBeGreaterThan(dorfHoehe('kern', 1));
    expect(dorfHoehe('turm', 3)).toBeGreaterThan(dorfHoehe('turm', 1));
    expect(dorfHoehe('einfassung', 2)).toBe(dorfHoehe('einfassung', 1));
  });

  it('dieselbe Stelle ergibt immer dieselbe Zahl, ohne Zufall', () => {
    expect(hash01(2, 5)).toBe(hash01(2, 5));
    expect(hash01(2, 5)).toBeGreaterThanOrEqual(0);
    expect(hash01(2, 5)).toBeLessThan(1);
    expect(hash01(2, 5)).not.toBe(hash01(3, 5));
  });

  it('Atlas-Boden-Kachel: Rand außen, innen Schachbrett/hell, fest', () => {
    expect(dorfBodenKachel(-1, 0, 12, 12)).toBe('rand');
    expect(dorfBodenKachel(0, -1, 12, 12)).toBe('rand');
    expect(dorfBodenKachel(12, 0, 12, 12)).toBe('rand');
    const a = dorfBodenKachel(2, 3, 12, 12);
    expect(a === 'flaeche' || a === 'flaeche_b' || a === 'flaeche_hell').toBe(true);
    expect(dorfBodenKachel(2, 3, 12, 12)).toBe(a);
    expect(dorfBodenTint(false)).toBe(0xffffff);
    expect(dorfBodenTint(true)).not.toBe(0xffffff);
  });
});
