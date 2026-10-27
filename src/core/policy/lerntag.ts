/**
 * Lerntag (DATENMODELL §3.3, D-2): Ein Lerntag beginnt um 4:00 Uhr Ortszeit.
 * Wer um 0:30 Uhr eine Einheit beendet, gehört noch zum Vortag.
 *
 * Der Lerntag wird beim Schreiben eines Ereignisses berechnet und gespeichert,
 * damit ein späterer Zeitzonenwechsel die Geschichte nicht umsortiert.
 */

/** Kalendertag im Format "JJJJ-MM-TT", z. B. "2026-10-27". */
export type Tag = string;

/** Stunde (Ortszeit), zu der ein neuer Lerntag beginnt. */
export const LERNTAG_BEGINN_STUNDE = 4;

/**
 * @param tsUtc Zeitpunkt in ms seit 1970 (UTC)
 * @param utcVersatzMinuten Abstand der Ortszeit zu UTC in Minuten zu diesem
 *   Zeitpunkt, z. B. +60 für Winterzeit und +120 für Sommerzeit in Deutschland.
 *   Die App ermittelt ihn mit `-new Date(tsUtc).getTimezoneOffset()`;
 *   der Kern selbst kennt keine Zeitzonen.
 */
export function lerntag(tsUtc: number, utcVersatzMinuten: number): Tag {
  if (!Number.isFinite(tsUtc)) throw new RangeError(`Ungültiger Zeitpunkt: ${tsUtc}`);
  if (!Number.isInteger(utcVersatzMinuten) || Math.abs(utcVersatzMinuten) > 18 * 60) {
    throw new RangeError(`Ungültiger UTC-Versatz: ${utcVersatzMinuten}`);
  }

  const verschoben = tsUtc + (utcVersatzMinuten - LERNTAG_BEGINN_STUNDE * 60) * 60_000;
  const d = new Date(verschoben);
  const jahr = String(d.getUTCFullYear()).padStart(4, '0');
  const monat = String(d.getUTCMonth() + 1).padStart(2, '0');
  const tag = String(d.getUTCDate()).padStart(2, '0');
  return `${jahr}-${monat}-${tag}`;
}
