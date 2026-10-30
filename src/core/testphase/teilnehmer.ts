/**
 * Teilnehmer-Nummern der Testphase (K-14, STRATEGIE §7): „T-07-4“ – laufende
 * Nummer und Prüfziffer (Luhn). Die Nummer ist zugleich der Testcode: Nur eine
 * gültige Nummer schaltet das Testprotokoll ein. Geheim ist sie nicht – sie
 * verhindert nur, dass jemand es aus Versehen einschaltet.
 */

/** Prüfziffer nach Luhn für eine Ziffernfolge. */
export function pruefziffer(ziffern: string): number {
  let summe = 0;
  // Von rechts: jede zweite Ziffer (beginnend mit der letzten) verdoppeln
  [...ziffern].reverse().forEach((z, i) => {
    let d = Number(z);
    if (i % 2 === 0) {
      d *= 2;
      if (d > 9) d -= 9;
    }
    summe += d;
  });
  return (10 - (summe % 10)) % 10;
}

/** Teilnehmer-Nummer zu einer laufenden Nummer 1 … 99. */
export function teilnehmerNummer(n: number): string {
  if (!Number.isInteger(n) || n < 1 || n > 99) throw new RangeError('Nummer 1 … 99');
  const nn = String(n).padStart(2, '0');
  return `T-${nn}-${pruefziffer(nn)}`;
}

/** Eingabe prüfen und einheitlich schreiben; undefined, wenn sie nicht gültig ist. */
export function teilnehmerLesen(eingabe: string): string | undefined {
  const m = /^\s*T\s*-?\s*(\d{2})\s*-?\s*(\d)\s*$/i.exec(eingabe);
  if (!m || m[1] === '00') return undefined;
  const [, nn = '', p = ''] = m;
  return pruefziffer(nn) === Number(p) ? `T-${nn}-${p}` : undefined;
}
