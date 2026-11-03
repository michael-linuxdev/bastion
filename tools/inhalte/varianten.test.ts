// Varianten (src/generators/hilfen.ts `variante`): gleiche Aufgaben wie die Basis, nur mit
// weniger Fehlerbildern. Die Pflicht-Tests der Basis decken darum auch die Variante ab; hier
// wird geprüft, dass das stimmt – mit den Parametern jeder Vorlage, die eine Variante nutzt.
import { describe, expect, it } from 'vitest';
import { generatoren } from '../../src/generators/alle';
import { pruefeInhalte } from './pruefen';

const { vorlagen } = pruefeInhalte('content', generatoren);
const mitBasis = vorlagen.filter((v) => generatoren.get(v.generator)?.basis);

describe('Varianten liefern die Aufgaben ihrer Basis', () => {
  it('es gibt Varianten in Vorlagen', () => {
    expect(mitBasis.length).toBeGreaterThan(0);
  });

  for (const v of mitBasis) {
    it(`${v.id} (${v.generator})`, () => {
      const g = generatoren.get(v.generator);
      const b = generatoren.get(g?.basis ?? '');
      // Ältere Varianten bauen auf internen, nie registrierten Generatoren auf (z. B. tb.kgv-ggt):
      // Für sie gibt es keine gespeicherten Aufgaben der Basis, also nichts zu vergleichen.
      if (!g || !b) return;
      for (const id of g.fehlerbildIds) expect(b.fehlerbildIds).toContain(id);
      for (const niveau of v.niveaus)
        for (let seed = 0; seed < 200; seed++) {
          const p = v.parameter[niveau];
          const i = g.erzeuge(seed, p);
          const j = b.erzeuge(seed, { ...(p as object), ...g.basisParameter });
          expect({ ...i, fehlerbilder: [] }).toEqual({ ...j, fehlerbilder: [] });
          expect(i.fehlerbilder).toEqual(
            j.fehlerbilder.filter((f) => g.fehlerbildIds.includes(f.id)),
          );
        }
    });
  }
});
