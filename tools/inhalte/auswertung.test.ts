// Probelauf (INHALTSFORMAT §10.1, Punkt 6) für die Auswertung: Mit jeder Vorlage
// und jedem Niveau wird die echte Lösung als richtig und jede Fehlerbild-Antwort
// als genau dieses Fehlerbild erkannt.
import { describe, expect, it } from 'vitest';
import { auswerten, type Bruchform } from '../../src/core/learning/auswertung';
import { generatoren } from '../../src/generators';
import { pruefeInhalte } from './pruefen';

const { vorlagen } = pruefeInhalte('content', generatoren);

describe('Auswertung mit allen Vorlagen', () => {
  for (const v of vorlagen) {
    it(v.id, () => {
      const g = generatoren.get(v.generator);
      expect(g).toBeDefined();
      const form = (v.antwort?.['form'] ?? 'beliebig') as Bruchform;
      for (const niveau of v.niveaus) {
        for (let seed = 0; seed < 200; seed++) {
          const i = g?.erzeuge(seed, v.parameter[niveau]);
          if (!i) continue;
          expect(auswerten(i, i.loesung, form), `${niveau} Seed ${seed}`).toEqual({
            richtig: true,
          });
          for (const f of i.fehlerbilder)
            expect(auswerten(i, f.antwort, form), `${niveau} Seed ${seed} ${f.id}`).toEqual({
              richtig: false,
              fehlerbild: f.id,
            });
        }
      }
    });
  }
});
