// Hilfsmittelfreie Vorlagen (B10, Teil A von Abitur und Realschulabschluss): Jede Aufgabe muss
// ohne Taschenrechner lösbar sein. Geprüft wird je Vorlage und Niveau an 300 Aufgaben: kein
// gerundetes Ergebnis, und eine Zahl als Lösung ist ganz oder ein Bruch mit Nenner bis 12.
// Auswahlaufgaben gelten als lösbar, wenn sie kein gerundetes Ergebnis haben (exakte Werte wie
// √2 oder π stehen dort als Möglichkeit, B4).
import { describe, expect, it } from 'vitest';
import type { Loesung } from '../../src/core/learning/generator';
import { generatoren } from '../../src/generators/alle';
import { pruefeInhalte } from './pruefen';

/** Ganz oder Bruch mit kleinem Nenner: 0,25 und 2/3 ja, 0,477 nein */
export function schoeneZahl(w: number): boolean {
  for (let n = 1; n <= 12; n++) if (Math.abs(w * n - Math.round(w * n)) < 1e-9) return true;
  return false;
}

export function ohneRechner(l: Loesung): boolean {
  if (l.typ === 'zahl') return schoeneZahl(l.wert);
  return true;
}

const { vorlagen } = pruefeInhalte('content', generatoren);
const hf = vorlagen.filter((v) => v.hilfsmittelfrei === true);

describe('Hilfsmittelfreie Vorlagen (B10)', () => {
  it('erkennt schöne Zahlen', () => {
    expect([3, -2, 0.5, 0.25, 2 / 3, 1.75].every(schoeneZahl)).toBe(true);
    expect([0.477, Math.SQRT2, 3.14].some(schoeneZahl)).toBe(false);
  });

  it('es gibt hilfsmittelfreie Vorlagen', () => {
    expect(hf.length).toBeGreaterThan(0);
  });

  for (const v of hf) {
    it(`${v.id} ist ohne Taschenrechner lösbar`, () => {
      const g = generatoren.get(v.generator);
      expect(g, v.generator).toBeDefined();
      for (const niveau of v.niveaus)
        for (let seed = 0; seed < 300; seed++) {
          const i = g?.erzeuge(seed, v.parameter[niveau]);
          if (!i) continue;
          expect(i.runden, `${v.id} ${niveau} Seed ${seed}: gerundet`).toBeUndefined();
          expect(ohneRechner(i.loesung), `${v.id} ${niveau} Seed ${seed}`).toBe(true);
        }
    });
  }
});
