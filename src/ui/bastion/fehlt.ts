// Was fehlt für ein Bauvorhaben, und wie lange dauert es noch? (Paket G5, FOKUS.md)
// Rein und ohne Texte: Die Oberfläche macht daraus Sätze wie „Noch 130 Stein“.
import type { Kosten } from '../../core/bastion/katalog';
import type { Ressource } from '../../core/ledger/regeln';

export type Rohstoff = Exclude<Ressource, 'schritt'>;

export interface Fehlbetrag {
  readonly ressource: Rohstoff;
  /** So viel fehlt noch (immer > 0) */
  readonly fehlt: number;
}

const ROHSTOFFE: readonly Rohstoff[] = ['fleiss', 'behalten', 'koennen'];

/** Je Rohstoff, der nicht reicht, die fehlende Menge – in fester Reihenfolge. */
export function fehlbetraege(
  kosten: Kosten,
  stand: Readonly<Record<Rohstoff, number>>,
): Fehlbetrag[] {
  return ROHSTOFFE.flatMap((r) => {
    const fehlt = kosten[r] - Math.max(0, stand[r]);
    return fehlt > 0 ? [{ ressource: r, fehlt }] : [];
  });
}

/**
 * Wie viele Lerneinheiten nach dem Baubeginn noch nötig sind, bis das Gebäude steht.
 * Bauschritte im Vorrat werden sofort eingesetzt; jede Lerneinheit bringt einen weiteren
 * (BASEBAU §3.4). 0 = steht sofort.
 */
export function restLerneinheiten(kosten: Kosten, vorratSchritte: number): number {
  return Math.max(0, kosten.schritt - Math.max(0, vorratSchritte));
}
