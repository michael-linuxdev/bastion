import { describe, expect, it } from 'vitest';
import { platzHindernisse, type Bastion } from './bauen';
import {
  bauplatzFuer,
  einfassungHoechstens,
  epocheFreigeschaltet,
  kernMaxStufe,
  turmHoechstens,
} from './epochen';
import { START } from './katalog';

describe('Epochen-Hilfen (BASEBAU §5.5)', () => {
  it('Bauplatz wächst 12 → 16 → 20 → 24', () => {
    expect(bauplatzFuer(1)).toEqual({ breite: 12, tiefe: 12 });
    expect(bauplatzFuer(2)).toEqual({ breite: 16, tiefe: 16 });
    expect(bauplatzFuer(3)).toEqual({ breite: 20, tiefe: 20 });
    expect(bauplatzFuer(4)).toEqual({ breite: 24, tiefe: 24 });
  });

  it('Freischaltung braucht Kern und Baupläne', () => {
    expect(epocheFreigeschaltet(3, 14)).toBe(1);
    expect(epocheFreigeschaltet(3, 15)).toBe(2);
    expect(epocheFreigeschaltet(5, 40)).toBe(3);
    expect(epocheFreigeschaltet(7, 80)).toBe(4);
  });

  it('Höchstzahlen und Kern-Grenze je Epoche', () => {
    expect(turmHoechstens(1)).toBe(2);
    expect(turmHoechstens(4)).toBe(8);
    expect(einfassungHoechstens(1)).toBe(40);
    expect(einfassungHoechstens(4)).toBe(100);
    expect(kernMaxStufe(1)).toBe(3);
    expect(kernMaxStufe(4)).toBe(9);
  });

  it('Migration: Startgebäude bleiben auf größerem Bauplatz gültig (Erweiterung nach außen)', () => {
    const b: Bastion = {
      bauwerke: [...START],
      vorhaben: [],
      fertig: [],
      vorrat: 0,
      lager: [],
    };
    const gross = bauplatzFuer(4);
    for (const g of START) expect(platzHindernisse(b, g.typ, g.pos, g.id, gross)).toEqual([]);
  });
});
