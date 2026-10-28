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

/**
 * Dezimalzahl deutsch, z. B. 0,75 oder 12,8. Rechnet intern auf `stellen`
 * Nachkommastellen genau und lässt Nullen am Ende weg.
 */
export function dezimalDeutsch(x: number, stellen = 6): string {
  if (!Number.isFinite(x)) throw new RangeError(`dezimalDeutsch: ${x}`);
  const gerundet = runde10(x, stellen);
  const [ganz, nach] = Math.abs(gerundet).toFixed(stellen).split('.');
  const nachkomma = (nach ?? '').replace(/0+$/, '');
  const vorne = zahlDeutsch(Number(ganz));
  return `${gerundet < 0 ? '−' : ''}${vorne}${nachkomma ? `,${nachkomma}` : ''}`;
}

/** Rundet auf `stellen` Nachkommastellen (vermeidet 0,1 + 0,2 = 0,30000000000000004). */
export function runde10(x: number, stellen: number): number {
  const f = 10 ** stellen;
  return Math.round(x * f) / f;
}
