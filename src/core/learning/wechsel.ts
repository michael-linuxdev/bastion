/**
 * Wechsel begleiten (LEHRPLAN L-12): Wer Klassen überspringt (oder neu einsteigt),
 * bekommt eine Diagnose der übersprungenen Klassen angeboten; wer die Schulart
 * wechselt, sieht die Themen, die die neue Schulart bis zur eigenen Klasse schon
 * hatte. Zurückstellen (Sitzenbleiben) ist neutral: keine Meldung, nichts geht
 * verloren. Rein.
 */
import type { Kompetenz, Schulart } from '../competence/kompetenz';
import type { KompetenzStand } from './fortschritt';

/** Hinweis nach einem Wechsel; Zurückstellen ergibt keinen. */
export type WechselHinweis =
  | { readonly art: 'klassen'; readonly klassen: readonly number[] }
  | {
      readonly art: 'schulart';
      readonly alt: Schulart;
      readonly neu: Schulart;
      readonly klasse: number;
    };

/** Übersprungene Klassen beim Hochstellen von `alt` auf `neu` – nur solche mit Inhalten. */
export function uebersprungeneKlassen(
  alt: number,
  neu: number,
  verfuegbar: readonly number[],
): number[] {
  return verfuegbar.filter((k) => k > alt && k < neu);
}

/**
 * Lücken nach einem Schulartwechsel: Kompetenzen, die die neue Schulart bis zur
 * Klasse `klasse` schon hatte, die alte aber erst später (oder gar nicht), und
 * die noch nicht gekonnt sind.
 */
export function schulartLuecken(
  kompetenzen: readonly Kompetenz[],
  staende: readonly KompetenzStand[],
  alt: Schulart,
  neu: Schulart,
  klasse: number,
): Kompetenz[] {
  if (alt === neu) return [];
  const gekonnt = new Set(staende.filter((s) => s.gekonntAm !== undefined).map((s) => s.kompetenz));
  return kompetenzen.filter((k) => {
    const n = k.sachsen[neu]?.klassenstufe;
    const a = k.sachsen[alt]?.klassenstufe;
    return n !== undefined && n <= klasse && (a === undefined || a > klasse) && !gekonnt.has(k.id);
  });
}
