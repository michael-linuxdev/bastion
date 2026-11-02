/**
 * Niveau automatisch wählen (Entscheidung des PV vom 02.11.2026, LEHRPLAN L-22, ersetzt L-3).
 *
 * Lernende sehen keine Niveaus. Die App bestimmt je Kompetenz still, auf welchem Niveau die
 * nächste Aufgabe kommt – aus der Folge der bisherigen Aufgaben dieser Kompetenz
 * („dauernde Evaluation“). Kein Hinweis, keine Anzeige von Auf- oder Abstieg.
 *
 * Regel (Startwerte, wie L-O3 mit Testjugendlichen nachzustellen):
 * - Start auf dem niedrigsten Niveau, für das es Aufgaben gibt.
 * - **Hoch**, wenn auf dem aktuellen Niveau die Regel für „gekonnt“ erfüllt ist
 *   (von den letzten 6 Aufgaben mindestens 5 ohne Hilfe richtig, aus mindestens 2 Vorlagen).
 * - **Runter**, wenn auf dem aktuellen Niveau 3 Aufgaben nacheinander nicht ohne Hilfe
 *   richtig waren.
 * - Nach jedem Wechsel beginnt die Zählung auf dem neuen Niveau von vorn.
 * - Aufgaben auf einem anderen Niveau (fällige Wiederholungen früherer Karten, alte Stände
 *   aus der Zeit der eigenen Wahl) verschieben das Niveau nicht. Die erste Aufgabe einer
 *   Kompetenz legt das Startniveau fest, damit bisherige Lernstände erhalten bleiben.
 *
 * Rein und deterministisch: gleiche Ereignisse, gleiches Ergebnis.
 */
import type { Niveau } from '../competence/kompetenz';
import type { AufgabeEreignis } from './ereignis';
import { GEKONNT } from './fortschritt';

export const NIVEAU_WAHL = {
  /** Fenster und Schwellen für „hoch“ – dieselben wie für „gekonnt“ */
  fenster: GEKONNT.fenster,
  richtig: GEKONNT.richtig,
  vorlagen: GEKONNT.vorlagen,
  /** so viele nicht gelungene Aufgaben nacheinander → ein Niveau tiefer */
  runter: 3,
} as const;

const REIHE: readonly Niveau[] = ['G', 'M', 'E'];

export type NiveauEreignis = Pick<
  AufgabeEreignis,
  'kompetenz' | 'niveau' | 'ergebnis' | 'hilfen' | 'vorlage' | 'ts'
>;

/**
 * Niveau für die nächste Aufgabe der Kompetenz. `verfuegbar`: Niveaus, für die es Aufgaben gibt
 * (in beliebiger Reihenfolge). Ohne verfügbares Niveau: 'G'.
 */
export function niveauFuer(
  ereignisse: readonly NiveauEreignis[],
  kompetenz: string,
  verfuegbar: readonly Niveau[],
): Niveau {
  const stufen = REIHE.filter((n) => verfuegbar.includes(n));
  if (stufen.length === 0) return 'G';
  const folge = ereignisse
    .filter((e) => e.kompetenz === kompetenz && e.ergebnis !== 'uebersprungen')
    .sort((a, b) => a.ts - b.ts);

  const erste = folge[0]?.niveau;
  let i = erste !== undefined && stufen.includes(erste) ? stufen.indexOf(erste) : 0;
  let fenster: { vorlage: string; gut: boolean }[] = [];
  let fehlerFolge = 0;

  for (const e of folge) {
    if (e.niveau !== stufen[i]) continue;
    const gut = e.ergebnis === 'richtig' && e.hilfen === 0;
    fenster = [...fenster, { vorlage: e.vorlage, gut }].slice(-NIVEAU_WAHL.fenster);
    fehlerFolge = gut ? 0 : fehlerFolge + 1;

    const treffer = fenster.filter((x) => x.gut);
    const hoch =
      treffer.length >= NIVEAU_WAHL.richtig &&
      new Set(treffer.map((x) => x.vorlage)).size >= NIVEAU_WAHL.vorlagen;
    if (hoch && i < stufen.length - 1) {
      i += 1;
      fenster = [];
      fehlerFolge = 0;
    } else if (fehlerFolge >= NIVEAU_WAHL.runter && i > 0) {
      i -= 1;
      fenster = [];
      fehlerFolge = 0;
    }
  }
  return stufen[i] ?? 'G';
}
