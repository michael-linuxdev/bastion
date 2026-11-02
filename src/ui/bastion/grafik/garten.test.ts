import { describe, expect, it } from 'vitest';
import { GEBAEUDE_TYPEN } from '../../../core/bastion/katalog';
import { BUEHNE_H } from './iso';
import { gartenBodenKachel, gartenBodenTint, gartenHoehe, gartenStrauchLagen } from './garten';

describe('Gartenbilder (GRAFIK P2)', () => {
  it('Höhen bleiben im Bild und wachsen bei Kern und Aussichtsbaum', () => {
    for (const typ of GEBAEUDE_TYPEN) {
      expect(gartenHoehe(typ, 1)).toBeGreaterThan(0);
      expect(gartenHoehe(typ, 1)).toBeLessThan(BUEHNE_H);
    }
    expect(gartenHoehe('kern', 2)).toBeGreaterThan(gartenHoehe('kern', 1));
    expect(gartenHoehe('turm', 3)).toBeGreaterThan(gartenHoehe('turm', 1));
    expect(gartenHoehe('einfassung', 2)).toBe(gartenHoehe('einfassung', 1));
  });

  it('Atlas-Boden-Kachel: Rand außen, innen Schachbrett/hell, fest', () => {
    expect(gartenBodenKachel(-1, 0, 12, 12)).toBe('rand');
    expect(gartenBodenKachel(0, -1, 12, 12)).toBe('rand');
    expect(gartenBodenKachel(12, 0, 12, 12)).toBe('rand');
    const a = gartenBodenKachel(2, 3, 12, 12);
    expect(a === 'flaeche' || a === 'flaeche_b' || a === 'flaeche_hell').toBe(true);
    expect(gartenBodenKachel(2, 3, 12, 12)).toBe(a);
    expect(gartenBodenTint(false)).toBe(0xffffff);
    expect(gartenBodenTint(true)).not.toBe(0xffffff);
  });
});

describe('Garten-Sträucher aus dem Atlas (G3)', () => {
  it('feste Plätze, abwechselnd grün und blühend (kein Zufall)', () => {
    const lagen = gartenStrauchLagen();
    expect(lagen).toEqual(gartenStrauchLagen());
    expect(lagen.filter((b) => b.art === 'strauch_b').length).toBe(Math.floor(lagen.length / 2));
    for (const b of lagen) expect(b.bild).toBeLessThan(b.s);
  });
});
