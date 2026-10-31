/**
 * Layout der Hinterhof-Plätze (P4 Feinschliff): bei vielen Kompetenzen
 * nicht alles in eine zu schmale Reihe zwängen – sonst überlappen die Sprites.
 */

/** Zielabstand der Platz-Zentren in Feld-Einheiten. */
export const HINTERHOF_PLATZ_ABSTAND = 0.55;

/** Maximale Plätze pro Reihe, bevor umgebrochen wird. */
export const HINTERHOF_PRO_REIHE = 10;

export interface HinterhofPlatzLayout {
  readonly breite: number;
  readonly skala: number;
  readonly abstand: number;
  readonly reihen: number;
  readonly proReihe: number;
}

/** Breite, Skala und Zeilenanzahl für `anzahl` Plätze eines Lernfelds. */
export function hinterhofPlatzLayout(anzahl: number): HinterhofPlatzLayout {
  const n = Math.max(1, Math.floor(anzahl));
  const proReihe = Math.min(HINTERHOF_PRO_REIHE, n);
  const reihen = Math.ceil(n / proReihe);
  const breite = Math.max(3.2, Math.min(12, proReihe * HINTERHOF_PLATZ_ABSTAND + 0.6));
  const abstand = breite / proReihe;
  // Dichte → kleinere Sprites; offene Mulden kleiner als gefüllte Objekte
  const skala = Math.min(0.72, Math.max(0.28, (abstand / HINTERHOF_PLATZ_ABSTAND) * 0.62));
  return { breite, skala, abstand, reihen, proReihe };
}

/** Index → (Reihe, Spalte) für Umbruch. */
export function hinterhofPlatzZelle(
  index: number,
  proReihe: number,
): { readonly reihe: number; readonly spalte: number } {
  const pr = Math.max(1, proReihe);
  return { reihe: Math.floor(index / pr), spalte: index % pr };
}
