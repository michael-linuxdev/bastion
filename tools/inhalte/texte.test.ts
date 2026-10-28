// Probelauf (INHALTSFORMAT §10.1, Punkt 6): Jede Vorlage lässt sich mit 50 Seeds
// je Niveau füllen, ohne dass Platzhalter, $ oder ** übrig bleiben.
import { describe, expect, it } from 'vitest';
import { alsText, fuelle } from '../../src/core/learning/text';
import { generatoren } from '../../src/generators/alle';
import { pruefeInhalte } from './pruefen';

const { vorlagen } = pruefeInhalte('content', generatoren);

describe('Texte aller Vorlagen', () => {
  for (const v of vorlagen) {
    it(v.id, () => {
      const g = generatoren.get(v.generator);
      for (const niveau of v.niveaus) {
        for (let seed = 0; seed < 50; seed++) {
          const i = g?.erzeuge(seed, v.parameter[niveau]);
          if (!i) continue;
          const texte = [v.text.aufgabe, ...v.hilfen, ...Object.values(v.fehlerbilder)];
          for (const t of texte) {
            const fertig = alsText(fuelle(t.de, i.platzhalter));
            expect(fertig, `${niveau} ${seed}: ${t.de}`).not.toMatch(/[{}$]|\*\*/);
          }
        }
      }
    });
  }
});
