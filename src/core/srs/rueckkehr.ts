/**
 * Rückkehrmodus und Portionierung (BASEBAU §6.3, B-9; R5 natürliche Pausenpunkte).
 * Nach einer Pause sind viele Karten fällig. Statt eines Bergs gibt es eine
 * machbare Portion, die wichtigsten zuerst – ohne Zähler verpasster Tage.
 */
import { erinnerung, istFaellig, type Karte } from './karten';

export const RUECKKEHR = {
  /** Ab so vielen Tagen ohne bearbeitete Aufgabe gilt ein Start als Rückkehr. */
  pauseTage: 7,
  /** Höchstens so viele Wiederholungen in einer Runde. */
  portion: 20,
} as const;

const TAG_MS = 86_400_000;

/** Zeitpunkt der letzten bearbeiteten Aufgabe (aus den Karten), undefined = noch nie. */
export const letzteAktivitaet = (karten: readonly Karte[]): number | undefined =>
  karten.length === 0 ? undefined : Math.max(...karten.map((k) => k.letzte));

/** Rückkehr: Es wurde schon geübt, aber seit mehr als 7 Tagen nicht mehr. */
export function istRueckkehr(karten: readonly Karte[], jetzt: number): boolean {
  const letzte = letzteAktivitaet(karten);
  return letzte !== undefined && jetzt - letzte > RUECKKEHR.pauseTage * TAG_MS;
}

/**
 * Fällige Karten für eine Wiederholungsrunde: die wichtigsten zuerst – die
 * mit der niedrigsten Erinnerungswahrscheinlichkeit, also die, die am
 * ehesten verloren gehen –, höchstens eine Portion.
 */
export function wiederholRunde(karten: readonly Karte[], jetzt: number): Karte[] {
  return karten
    .filter((k) => istFaellig(k, jetzt))
    .map((k) => ({ k, r: erinnerung(k, jetzt) }))
    .sort((a, b) => a.r - b.r || a.k.faellig - b.k.faellig)
    .slice(0, RUECKKEHR.portion)
    .map((x) => x.k);
}
