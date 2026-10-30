import { describe, expect, it } from 'vitest';
import { START } from '../../../core/bastion/katalog';
import {
  LEERE_EINGABE,
  STUFEN,
  freigabe,
  gartenFreigabe,
  punkte,
  type GartenEingabe,
} from './freischalten';

const eingabe = (teil: Partial<GartenEingabe>): GartenEingabe => ({ ...LEERE_EINGABE, ...teil });

describe('Freischalt-Tabelle Garten', () => {
  it('beginnt bei null Punkten mit einem Zwerg und steigt nur an', () => {
    expect(STUFEN[0]?.ab).toBe(0);
    expect(STUFEN[0]?.zwerge).toBe(1);
    for (let i = 1; i < STUFEN.length; i++) {
      const vorher = STUFEN[i - 1];
      const jetzt = STUFEN[i];
      expect(vorher && jetzt && jetzt.ab).toBeGreaterThan(vorher?.ab ?? 0);
      expect(vorher && jetzt && jetzt.zwerge).toBeGreaterThanOrEqual(vorher?.zwerge ?? 0);
    }
    for (const zeile of STUFEN) {
      expect(zeile.taetigkeiten).toContain('laufen');
      expect(zeile.taetigkeiten).toContain('beet');
      expect(zeile.taetigkeiten).toContain('teich');
    }
  });

  it('der Anfang hat keine Punkte und einen Zwerg', () => {
    expect(punkte(LEERE_EINGABE, START)).toBe(0);
    expect(gartenFreigabe(LEERE_EINGABE, START).zwerge).toBe(1);
    expect(freigabe(11).zwerge).toBe(1);
    expect(freigabe(12).zwerge).toBe(2);
    expect(freigabe(39).zwerge).toBe(2);
    expect(freigabe(40).zwerge).toBe(3);
  });

  it('zählt nur Erworbenes, den Ausbau und Gebäude jenseits des Starts', () => {
    expect(punkte(eingabe({ fleiss: 5, behalten: 1, koennen: 1, schritt: 1 }), [])).toBe(
      5 + 2 + 5 + 4,
    );
    const kern2 = START.map((b) => (b.typ === 'kern' ? { ...b, stufe: 2 } : b));
    expect(punkte(LEERE_EINGABE, kern2)).toBe(8);
    const mitBeet = [...START, { typ: 'flaeche' as const, stufe: 1, pos: { x: 0, y: 0 } }];
    expect(punkte(LEERE_EINGABE, mitBeet)).toBe(4);
    expect(punkte(eingabe({ fertig: 2 }), START)).toBe(6);
    expect(gartenFreigabe(eingabe({ fleiss: 12 }), START).stufe).toBe(1);
  });
});
