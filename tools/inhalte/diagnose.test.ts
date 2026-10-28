// Simulation mit dem echten Graphen der Klasse 5: Personen mit zufälligem, aber
// in sich stimmigem Wissen (wer etwas kann, kann auch die Voraussetzungen)
// werden diagnostiziert. Jedes Urteil muss stimmen, das Budget muss reichen.
import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { nachGraph } from '../../src/core/competence/kompetenz';
import {
  diagnose,
  DIAGNOSE,
  empfehlungen,
  kann,
  type Antwort,
} from '../../src/core/learning/diagnose';
import { generatoren } from '../../src/generators';
import { pruefeInhalte } from './pruefen';

const kompetenzen = nachGraph(pruefeInhalte('content', generatoren).kompetenzen);
const nachId = new Map(kompetenzen.map((k) => [k.id, k]));

/** Abschluss nach unten: mit jeder Kompetenz auch alle Voraussetzungen. */
function abgeschlossen(start: Iterable<string>): Set<string> {
  const s = new Set<string>();
  const offen = [...start];
  for (let id = offen.pop(); id !== undefined; id = offen.pop()) {
    if (s.has(id)) continue;
    s.add(id);
    offen.push(...(nachId.get(id)?.voraussetzungen ?? []));
  }
  return s;
}

describe('Diagnose mit dem Graphen der Klasse 5', () => {
  it('urteilt richtig und bleibt im Budget', () => {
    fc.assert(
      fc.property(fc.subarray(kompetenzen.map((k) => k.id)), (auswahl) => {
        const kenntnis = abgeschlossen(auswahl);
        const antworten: Antwort[] = [];
        let s = diagnose(kompetenzen, antworten);
        while (s.naechste) {
          antworten.push({ kompetenz: s.naechste, richtig: kenntnis.has(s.naechste) });
          s = diagnose(kompetenzen, antworten);
        }
        expect(s.aufgaben).toBeLessThanOrEqual(DIAGNOSE.hoechstens);
        for (const id of [...s.getestet.keys(), ...s.gefolgert.keys()])
          expect(kann(s, id), id).toBe(kenntnis.has(id));
        // Empfohlen wird nur, was nicht als „kann“ gilt; was entschieden ist, stimmt.
        for (const id of empfehlungen(kompetenzen, s)) {
          expect(kann(s, id)).toBe(false);
          if (s.getestet.has(id) || s.gefolgert.has(id)) expect(kenntnis.has(id)).toBe(false);
        }
      }),
      { numRuns: 500 },
    );
  });

  it('Bericht: Aufgaben bis zum Ergebnis', () => {
    const faelle = [
      ['kann nichts', new Set<string>()],
      ['kann alles', new Set(kompetenzen.map((k) => k.id))],
      [
        'natürliche Zahlen',
        abgeschlossen(kompetenzen.filter((k) => k.feld === 'natuerliche-zahlen').map((k) => k.id)),
      ],
    ] as const;
    for (const [name, kenntnis] of faelle) {
      const antworten: Antwort[] = [];
      let s = diagnose(kompetenzen, antworten);
      while (s.naechste) {
        antworten.push({ kompetenz: s.naechste, richtig: kenntnis.has(s.naechste) });
        s = diagnose(kompetenzen, antworten);
      }
      const offen = kompetenzen.length - s.getestet.size - s.gefolgert.size;
      console.log(
        `${name}: ${s.aufgaben} Aufgaben, ${s.getestet.size} getestet, ${s.gefolgert.size} gefolgert, ${offen} offen`,
      );
    }
  });
});
