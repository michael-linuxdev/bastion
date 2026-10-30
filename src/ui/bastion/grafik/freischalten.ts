// Freischalt-Tabelle des Gartens (GRAFIK §7).
// Der Fortschritt kommt nur aus dem, was der Basebau schon kennt: erworbene
// Ressourcen aus dem Ledger, Stufe des Kerns, zusätzliche Gebäude, fertige
// Vorhaben. Nichts hängt an der Uhr oder am Zufall. Die Grafik liest diese
// Zahlen und ändert nichts.
//
// Später kommen weitere Felder in `Freigabe` und Zeilen in `STUFEN` dazu:
// Tageszeit, Jahreszeiten, Wetter, Lernbelohnung, mitwachsende Bauten,
// Antippen, weitere Tiere. Die Zeichenlogik fragt nur diese Tabelle.
import type { GebaeudeTyp } from '../../../core/bastion/katalog';

/** Was ein Zwerg in dieser Stufe tun darf. */
export type ZwergTat = 'laufen' | 'stehen' | 'beet' | 'teich';

/**
 * Was eine Fortschrittsstufe freischaltet.
 * Neue Ideen werden neue Felder, keine Sonderfälle in der Zeichenlogik.
 */
export interface Freigabe {
  readonly stufe: 0 | 1 | 2;
  /** Ab so vielen Punkten gilt die Zeile. */
  readonly ab: number;
  readonly zwerge: 1 | 2 | 3;
  readonly taetigkeiten: readonly ZwergTat[];
}

/**
 * Punkte → Zwerge. Die Tätigkeiten (Laufen, Stehen, Beet, Teich) gibt es
 * von Anfang an; mit dem Fortschritt kommen weitere Zwerge dazu.
 */
export const STUFEN: readonly Freigabe[] = [
  {
    ab: 0,
    stufe: 0,
    zwerge: 1,
    taetigkeiten: ['laufen', 'stehen', 'beet', 'teich'],
  },
  {
    ab: 12,
    stufe: 1,
    zwerge: 2,
    taetigkeiten: ['laufen', 'stehen', 'beet', 'teich'],
  },
  {
    ab: 40,
    stufe: 2,
    zwerge: 3,
    taetigkeiten: ['laufen', 'stehen', 'beet', 'teich'],
  },
];

/** Erworbene Ressourcen und fertige Vorhaben, nur gelesen. */
export interface GartenEingabe {
  readonly fleiss: number;
  readonly behalten: number;
  readonly koennen: number;
  readonly schritt: number;
  readonly fertig: number;
}

export const LEERE_EINGABE: GartenEingabe = {
  fleiss: 0,
  behalten: 0,
  koennen: 0,
  schritt: 0,
  fertig: 0,
};

const OHNE_PUNKTE = new Set<GebaeudeTyp>(['kern', 'ursprung', 'einfassung']);

/**
 * Fortschrittspunkte. Fleiß, Behalten, Können und Bauschritte sind das
 * Erworbene aus dem Ledger (nicht der ausgegebene Vorrat). Der Kern zählt
 * ab Stufe 2, Gebäude außer Kern, Bank und Hecke zählen einzeln, jedes
 * fertige Vorhaben auch.
 */
export function punkte(
  eingabe: GartenEingabe,
  bauwerke: readonly { typ: GebaeudeTyp; stufe: number }[],
): number {
  const kern = bauwerke.filter((b) => b.typ === 'kern').reduce((m, b) => Math.max(m, b.stufe), 1);
  const extra = bauwerke.filter((b) => !OHNE_PUNKTE.has(b.typ)).length;
  return (
    eingabe.fleiss +
    eingabe.behalten * 2 +
    eingabe.koennen * 5 +
    eingabe.schritt * 4 +
    (kern - 1) * 8 +
    extra * 4 +
    eingabe.fertig * 3
  );
}

/** Die höchste Zeile, deren Schwelle erreicht ist. */
export function freigabe(wert: number): Freigabe {
  let gewaehlt = STUFEN[0];
  if (!gewaehlt) return { ab: 0, stufe: 0, zwerge: 1, taetigkeiten: ['laufen', 'stehen'] };
  for (const zeile of STUFEN) if (wert >= zeile.ab) gewaehlt = zeile;
  return gewaehlt;
}

export function gartenFreigabe(
  eingabe: GartenEingabe,
  bauwerke: readonly { typ: GebaeudeTyp; stufe: number }[],
): Freigabe {
  return freigabe(punkte(eingabe, bauwerke));
}
