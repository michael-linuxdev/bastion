/**
 * Alter aus dem freiwilligen Geburtsdatum (LEHRPLAN L-15). Das Datum bleibt auf
 * dem Gerät. Wer volljährig ist – oder „Ich bin erwachsen“ gewählt hat –,
 * verwaltet sich selbst: kein Elternbereich (KONZEPT §6, Stufe „selbstverwaltet“).
 */
import type { Tag } from './lerntag';

/** Gültiges Geburtsdatum „JJJJ-MM-TT“ zwischen 1900 und heute – sonst undefined. */
export function geburtsdatumAus(wert: unknown, heute: Tag): string | undefined {
  if (typeof wert !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(wert)) return undefined;
  const [j, m, t] = wert.split('-').map(Number) as [number, number, number];
  const d = new Date(Date.UTC(j, m - 1, t));
  if (d.getUTCFullYear() !== j || d.getUTCMonth() !== m - 1 || d.getUTCDate() !== t)
    return undefined;
  return j >= 1900 && wert <= heute ? wert : undefined;
}

/** Volle Jahre am Lerntag `tag`. */
export function alterAm(geburtsdatum: string, tag: Tag): number {
  const [gj, gm, gt] = geburtsdatum.split('-').map(Number) as [number, number, number];
  const [j, m, t] = tag.split('-').map(Number) as [number, number, number];
  return j - gj - (m < gm || (m === gm && t < gt) ? 1 : 0);
}

export interface Profil {
  readonly geburtsdatum: string | undefined;
  readonly erwachsen: boolean;
}

/** Selbstverwaltet: ausdrücklich erwachsen oder mindestens 18 Jahre alt. */
export const selbstverwaltet = (p: Profil, tag: Tag): boolean =>
  p.erwachsen || (p.geburtsdatum !== undefined && alterAm(p.geburtsdatum, tag) >= 18);

/** Schuljahr in Sachsen ab 1. August: 2026-10-28 → 2026 (Schuljahr 2026/27), 2027-03-01 → 2026. */
export function schuljahrVon(tag: Tag): number {
  const [j, m] = tag.split('-').map(Number) as [number, number];
  return m >= 8 ? j : j - 1;
}

/**
 * Nach der Klasse fragen (L-17)? Einmal je Schuljahr, sobald ein neues begonnen
 * hat – nicht beim allerersten Mal (dann wird nur gemerkt) und nicht für
 * Erwachsene, die „Ich bin erwachsen“ gewählt haben.
 */
export const schuljahrFragen = (gemerkt: number | undefined, tag: Tag, erwachsen: boolean) =>
  !erwachsen && gemerkt !== undefined && schuljahrVon(tag) > gemerkt;
