/**
 * „Gerade in der Schule dran“ (LEHRPLAN L-18): Lernbereiche aus dem Lehrplan der
 * eigenen Klasse und Schulart, darin einzelne Themen. Ohne Schulart wird nach
 * Lernfeldern gruppiert. Die Auswahl ist eine Liste von Kompetenz-IDs. Rein.
 */
import type { Kompetenz, Schulart } from '../competence/kompetenz';

export interface Lernbereich {
  /** „LB 3 Quadratische Funktionen …“ (mit Schulart) oder der Feld-Name (ohne) */
  readonly name: string;
  readonly art: 'lehrplan' | 'feld';
  readonly kompetenzen: readonly Kompetenz[];
}

export function lernbereiche(
  kompetenzen: readonly Kompetenz[],
  klasse: number,
  schulart: Schulart | undefined,
): Lernbereich[] {
  const gruppen = new Map<string, Kompetenz[]>();
  for (const k of kompetenzen) {
    const bezug = schulart ? k.sachsen[schulart] : undefined;
    const passt = schulart
      ? bezug?.klassenstufe === klasse
      : k.klassenstufe_typisch.includes(klasse);
    if (!passt) continue;
    const name = schulart ? (bezug?.lernbereich ?? '') : k.feld;
    const liste = gruppen.get(name);
    if (liste) liste.push(k);
    else gruppen.set(name, [k]);
  }
  return [...gruppen.entries()]
    .sort(([a], [b]) => a.localeCompare(b, 'de', { numeric: true }))
    .map(([name, ks]) => ({ name, art: schulart ? 'lehrplan' : 'feld', kompetenzen: ks }));
}

/** Gespeicherte Auswahl lesen: durch Komma getrennte IDs; Unbekanntes fällt weg. */
export function auswahlAus(wert: unknown, bekannt: ReadonlySet<string>): string[] {
  if (typeof wert !== 'string' || wert === '') return [];
  return [...new Set(wert.split(','))].filter((id) => bekannt.has(id));
}
