/**
 * Ereignis „buchung“ und Projektion `konto` (DATENMODELL §4.3, §5).
 *
 * Buchungen werden nie geändert. Neue entstehen, indem die Regeln über alle
 * Sitzungen laufen und nur fehlende Buchungen hinzukommen. Jede Buchung hat eine
 * aus ihrem Anlass abgeleitete ID (Sitzung × Ressource bzw. Kompetenz × Niveau):
 * So entsteht sie nie doppelt – weder durch erneutes Rechnen noch beim
 * Zusammenführen zweier Geräte (D-10). Bei abgeschaltetem Basebau wird genauso
 * gebucht (B-10).
 */
import type { AufgabeEreignis } from '../learning/ereignis';
import type { KompetenzStand } from '../learning/fortschritt';
import type { SitzungEreignis } from '../learning/sitzung';
import {
  alleSitzungsBuchungen,
  koennenBuchungen,
  startpaketBuchungen,
  type Buchung,
  type Ressource,
} from './regeln';

/** Schemaversion der Ereignisart `buchung` (DATENMODELL §6.2). */
export const BUCHUNG_V = 1;

export interface BuchungEreignis extends Buchung {
  readonly id: string;
  readonly art: 'buchung';
  readonly v: number;
  readonly profil: string;
  readonly ts: number;
  readonly geraet: string;
}

/** Feste ID aus dem Anlass der Buchung. */
export const buchungsId = (profil: string, b: Pick<Buchung, 'ressource' | 'bezug'>) =>
  `${profil}.${b.ressource}.${b.bezug}`;

export interface Buchungskontext {
  readonly profil: string;
  readonly geraet: string;
  /** Zeitpunkt für Bauplan-Buchungen; Sitzungsbuchungen tragen die Zeit ihrer Sitzung */
  readonly jetzt: number;
}

/**
 * Buchungen, die nach den Regeln zustehen, aber noch nicht gespeichert sind.
 * Gespeicherte Buchungen bleiben, wie sie sind – auch wenn neue Regeln
 * anders rechnen würden (DATENMODELL §6.2).
 */
export function fehlendeBuchungen(
  sitzungen: readonly SitzungEreignis[],
  aufgaben: readonly AufgabeEreignis[],
  staende: readonly KompetenzStand[],
  vorhanden: ReadonlySet<string>,
  k: Buchungskontext,
): BuchungEreignis[] {
  const zeit = new Map(sitzungen.map((s) => [s.id, s.ts]));
  const schonBauplaene = new Set(
    [...vorhanden].flatMap((id) => {
      const vorne = `${k.profil}.koennen.`;
      return id.startsWith(vorne) ? [id.slice(vorne.length)] : [];
    }),
  );
  const vorneStart = `${k.profil}.fleiss.startpaket:`;
  const schonStartpaket = new Set(
    [...vorhanden].flatMap((id) =>
      id.startsWith(vorneStart) ? [id.slice(vorneStart.length)] : [],
    ),
  );
  const alle: Buchung[] = [
    ...alleSitzungsBuchungen(sitzungen, aufgaben),
    ...koennenBuchungen(staende, schonBauplaene),
    ...startpaketBuchungen(aufgaben, staende, schonStartpaket),
  ];
  return alle
    .map((b) => ({
      ...b,
      id: buchungsId(k.profil, b),
      art: 'buchung' as const,
      v: BUCHUNG_V,
      profil: k.profil,
      ts: b.grund === 'sitzung' ? (zeit.get(b.bezug) ?? k.jetzt) : k.jetzt,
      geraet: k.geraet,
    }))
    .filter((b) => !vorhanden.has(b.id));
}

/** Projektion `konto` (DATENMODELL §5): Stand und Summe des Erworbenen je Ressource. */
export interface Konto {
  readonly profil: string;
  readonly stand: Readonly<Record<Ressource, number>>;
  /** nur Gutschriften – für den Epochenwechsel zählen erworbene, nicht ausgegebene Baupläne (§5.4) */
  readonly erworben: Readonly<Record<Ressource, number>>;
}

const null4 = (): Record<Ressource, number> => ({ fleiss: 0, behalten: 0, koennen: 0, schritt: 0 });

export const leeresKonto = (profil: string): Konto => ({
  profil,
  stand: null4(),
  erworben: null4(),
});

/** Konto um eine Buchung fortschreiben. */
export function verbuche(konto: Konto, b: Pick<Buchung, 'ressource' | 'menge'>): Konto {
  return {
    profil: konto.profil,
    stand: { ...konto.stand, [b.ressource]: konto.stand[b.ressource] + b.menge },
    erworben: {
      ...konto.erworben,
      [b.ressource]: konto.erworben[b.ressource] + Math.max(0, b.menge),
    },
  };
}

/** Konto aus allen Buchungen neu aufbauen (D-6). */
export function kontoAus(profil: string, buchungen: readonly BuchungEreignis[]): Konto {
  return buchungen.filter((b) => b.profil === profil).reduce(verbuche, leeresKonto(profil));
}
