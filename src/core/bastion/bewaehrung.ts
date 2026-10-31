/**
 * Bewährungsprobe = Belagerung (BASEBAU §5.6, B-28 / G11).
 * Freiwillig, thema-neutraler Kern; Optik und Wörter je Thema in der UI.
 * Darf nur aus ledger/ und bastion/katalog lesen (K-1).
 */
import type { Buchung } from '../ledger/regeln';
import type { Bauwerk } from './katalog';

export type BewaehrungModus = 'ueben' | 'ernstfall';

/** Höchstzahl Hinweis-Joker in der Üben-Variante (§5.6). */
export const JOKER_MAX = 5;

/** Mindestens so viele Aufgaben; sonst keine Auswertung als bestanden. */
export const MIN_AUFGABEN = 3;

/** Anteil richtig für „bestanden“ (Ernstfall und Üben). */
export const BESTANDEN_ANTEIL = 0.75;

const REGEL = 1;

/** Summe der Turm-Stufen, gedeckelt – je Stufe ein Joker. */
export function turmJoker(bauwerke: readonly Bauwerk[]): number {
  const summe = bauwerke.filter((b) => b.typ === 'turm').reduce((s, b) => s + b.stufe, 0);
  return Math.min(JOKER_MAX, summe);
}

export function bewaehrungBestanden(richtig: number, gesamt: number): boolean {
  if (gesamt < MIN_AUFGABEN) return false;
  return richtig / gesamt >= BESTANDEN_ANTEIL;
}

/**
 * Bauplan für bestandenen Ernstfall (§5.6 Punkt 3).
 * `bezug` einmalig, z. B. `bewaehrung:2026-10-31:abc` – nie doppelt verbuchen.
 */
/** `tag` ist der Lerntag „JJJJ-MM-TT“ (wie in Buchungen). */
export function bewaehrungBauplan(bezug: string, tag: string): Buchung {
  return {
    ressource: 'koennen',
    menge: 1,
    grund: 'belagerung',
    bezug,
    tag,
    aufschluesselung: {},
    regel: REGEL,
  };
}
