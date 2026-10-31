// Probelauf für die Anzeige: Was ein Kind liest, enthält keine Formelzeichen mehr.
// Aufgabentext und Antwortmöglichkeiten laufen durch `fuelle` (Formel-Teilmenge,
// INHALTSFORMAT §11); der Lösungsweg wird als reiner Text gezeigt und darf darum keine
// Formel enthalten.
import { describe, expect, it } from 'vitest';
import { generatoren } from '../../src/generators/alle';
import { alsText, fuelle } from '../../src/core/learning/text';
import { pruefeInhalte } from './pruefen';

const { vorlagen } = pruefeInhalte('content', generatoren);
const ROH = /\$|\\(frac|sqrt|cdot)/;

describe('Anzeige mit allen Vorlagen', () => {
  for (const v of vorlagen) {
    it(v.id, () => {
      const g = generatoren.get(v.generator);
      for (const niveau of v.niveaus) {
        for (let seed = 0; seed < 30; seed++) {
          const i = g?.erzeuge(seed, v.parameter[niveau]);
          if (!i) continue;
          const wo = `${niveau} Seed ${seed}`;
          expect(alsText(fuelle(v.text.aufgabe.de, i.platzhalter)), wo).not.toMatch(ROH);
          for (const o of i.optionen ?? [])
            if (o.text) expect(alsText(fuelle(o.text.de, {})), wo).not.toMatch(ROH);
          for (const s of i.loesungsweg) expect(s.de, `${wo} Lösungsweg`).not.toMatch(ROH);
        }
      }
    });
  }
});
