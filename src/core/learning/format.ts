/**
 * Zahlen deutsch schreiben (INHALTSFORMAT §11): Komma als Dezimaltrennzeichen,
 * ab fünf Stellen schmales geschütztes Leerzeichen als Tausendergliederung.
 * Nur für die Anzeige – Eingaben mit Leerzeichen werden nicht akzeptiert (I-5).
 */
const SCHMAL = ' ';

export function zahlDeutsch(n: number): string {
  if (!Number.isSafeInteger(n)) throw new RangeError(`zahlDeutsch: nur Ganzzahlen, war ${n}`);
  const ziffern = String(Math.abs(n));
  const gegliedert =
    ziffern.length <= 4 ? ziffern : ziffern.replace(/\B(?=(\d{3})+(?!\d))/g, SCHMAL);
  return n < 0 ? `−${gegliedert}` : gegliedert;
}
