/**
 * Brüche als Wert (Zähler/Nenner, beide ganzzahlig, Nenner > 0).
 * Rein und ohne Abhängigkeiten – genutzt von Generatoren und Auswertung.
 */

export interface Bruch {
  readonly zaehler: number;
  readonly nenner: number;
}

export function bruch(zaehler: number, nenner: number): Bruch {
  if (!Number.isSafeInteger(zaehler) || !Number.isSafeInteger(nenner) || nenner <= 0) {
    throw new RangeError(`Ungültiger Bruch ${zaehler}/${nenner}`);
  }
  return { zaehler, nenner };
}

/** Größter gemeinsamer Teiler (euklidischer Algorithmus), ggT(0, 0) = 0. */
export function ggT(a: number, b: number): number {
  let x = Math.abs(a);
  let y = Math.abs(b);
  while (y !== 0) [x, y] = [y, x % y];
  return x;
}

/** Gleiche Schreibweise: gleicher Zähler und gleicher Nenner (z. B. für `form: exakt`). */
export function gleichGeschrieben(a: Bruch, b: Bruch): boolean {
  return a.zaehler === b.zaehler && a.nenner === b.nenner;
}

/** Gleicher Wert: 1/2 und 2/4 sind wertgleich (z. B. für `form: beliebig`). */
export function wertgleich(a: Bruch, b: Bruch): boolean {
  return a.zaehler * b.nenner === b.zaehler * a.nenner;
}

/** Vollständig gekürzt? */
export function istGekuerzt(b: Bruch): boolean {
  return ggT(b.zaehler, b.nenner) === 1;
}

/** Alle Zähler 1 … nenner−1, die mit dem Nenner teilerfremd sind (echte, gekürzte Brüche). */
export function teilerfremdeZaehler(nenner: number): number[] {
  const ergebnis: number[] = [];
  for (let z = 1; z < nenner; z++) if (ggT(z, nenner) === 1) ergebnis.push(z);
  return ergebnis;
}
