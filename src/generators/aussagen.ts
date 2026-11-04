// Fabrik für Niveau-E-Aufgaben „Welche Aussage stimmt?“ (LEHRPLAN §5.3, K-31): eine Situation,
// eine richtige Aussage mit Begründung und falsche Aussagen, jede mit einem Fehlerbild, das auf
// eine Fehlvorstellung zeigt. Der Generator liefert nur die Situation; Mischen, Lösung und
// Fehlerbilder erledigt die Fabrik. Platzhalter: `situation` (Text) und die Zahlen aus `werte`,
// damit die Pflicht-Tests die Lösung unabhängig nachrechnen können.
import type { Generator, Sprachobjekt } from '../core/learning/generator';
import { rng, type Rng } from '../core/rng/rng';
import { auswahl, de, mische } from './hilfen';

export interface Aussagen {
  /** Situation und Frage, z. B. „Lena sagt: … Stimmt das?“ */
  readonly situation: string;
  /** Zahlen der Situation für die Pflicht-Tests (Platzhalter) */
  readonly werte: Readonly<Record<string, number>>;
  /** Die richtige Aussage mit Begründung */
  readonly richtig: string;
  /** Falsche Aussagen: [Fehlerbild-ID, Text] */
  readonly falsch: readonly (readonly [string, string])[];
  /** Lösungsweg, zwei bis drei kurze Schritte */
  readonly weg: readonly string[];
}

export function aussagenGenerator(
  id: string,
  fehlerbildIds: readonly string[],
  werteNamen: readonly string[],
  baue: (r: Rng) => Aussagen,
  /** Fassung des Generators; steigt, wenn sich ein Text ändert (INHALTSFORMAT §6.1, Regel 5) */
  version = 1,
): Generator<Record<string, never>> {
  return {
    id,
    version,
    platzhalter: ['situation', ...werteNamen],
    fehlerbildIds,
    erzeuge(seed) {
      const r = rng(seed);
      const a = baue(r);
      const liste = mische(r, [['richtig', a.richtig] as const, ...a.falsch]);
      const index = (k: string) => auswahl(liste.findIndex(([q]) => q === k));
      const platzhalter: Record<string, Sprachobjekt | number> = { situation: de(a.situation) };
      for (const n of werteNamen) platzhalter[n] = a.werte[n] ?? 0;
      return {
        platzhalter,
        optionen: liste.map(([, t]) => ({ text: de(t) })),
        loesung: index('richtig'),
        loesungsweg: a.weg.map(de),
        fehlerbilder: a.falsch.map(([k]) => ({ id: k, antwort: index(k) })),
      };
    },
  };
}
