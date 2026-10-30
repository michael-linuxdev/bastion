/**
 * Testprotokoll-Datei (K-14, DATENMODELL §4.8, D-18): Lern- und Nutzungsereignisse
 * seit dem Einschalten, mit der Teilnehmer-Nummer statt Profil und Gerät. Die
 * App zeigt den Inhalt vor dem Speichern lesbar an; weitergegeben wird von Hand.
 * Rein: Ereignisse werden hereingereicht.
 */
import type { AufgabeEreignis } from '../learning/ereignis';
import type { SitzungEreignis } from '../learning/sitzung';
import type { VermittlungEreignis } from '../learning/vermittlung-ereignis';
import type { EinstellungEreignis } from '../policy/einstellung';
import type { Tag } from '../policy/lerntag';
import type { NutzungEreignis } from './nutzung';

export const PROTOKOLL_FORMAT = 1;
export const TEST_AKTIV = 'test.aktiv';
export const TEST_TEILNEHMER = 'test.teilnehmer';

type Quelle =
  AufgabeEreignis | SitzungEreignis | VermittlungEreignis | NutzungEreignis | EinstellungEreignis;

/** Ereignis ohne Profil und Gerät */
export type ProtokollEreignis = Omit<Quelle, 'profil' | 'geraet'>;

/** Falsche Antwort ohne bekanntes Fehlerbild – Stoff für den Fehlerkatalog (VERMITTLUNG §3.4) */
export interface UnbekannterFehler {
  readonly ts: number;
  readonly vorlage: string;
  readonly niveau: string;
  readonly platzhalter: unknown;
  readonly loesung: unknown;
  readonly antwort: unknown;
}

export interface Testprotokoll {
  readonly format: number;
  readonly teilnehmer: string;
  readonly erstellt: Tag;
  /** Zeitpunkt des Einschaltens; nur Ereignisse ab hier */
  readonly seit: number;
  readonly ereignisse: readonly ProtokollEreignis[];
  readonly unbekannteFehler: readonly UnbekannterFehler[];
}

function ohneKennung(e: Quelle): ProtokollEreignis {
  const kopie: Record<string, unknown> = { ...e };
  delete kopie['profil'];
  delete kopie['geraet'];
  return kopie as ProtokollEreignis;
}

export function testprotokoll(a: {
  readonly teilnehmer: string;
  readonly erstellt: Tag;
  readonly seit: number;
  readonly aufgaben: readonly AufgabeEreignis[];
  readonly sitzungen: readonly SitzungEreignis[];
  readonly vermittlungen: readonly VermittlungEreignis[];
  readonly nutzungen: readonly NutzungEreignis[];
  readonly einstellungen: readonly EinstellungEreignis[];
}): Testprotokoll {
  const ab = <E extends { readonly ts: number }>(liste: readonly E[]) =>
    liste.filter((e) => e.ts >= a.seit);
  const alle: Quelle[] = [
    ...ab(a.aufgaben),
    ...ab(a.sitzungen),
    ...ab(a.vermittlungen),
    ...ab(a.nutzungen),
    // Von den Einstellungen nur die der Testphase – keine PIN, kein Spitzname
    ...ab(a.einstellungen).filter((e) => e.schluessel.startsWith('test.')),
  ].sort((x, y) => x.ts - y.ts || (x.id < y.id ? -1 : 1));
  return {
    format: PROTOKOLL_FORMAT,
    teilnehmer: a.teilnehmer,
    erstellt: a.erstellt,
    seit: a.seit,
    ereignisse: alle.map(ohneKennung),
    unbekannteFehler: ab(a.aufgaben)
      .filter(
        (e) =>
          e.ergebnis === 'falsch' && !e.fehlerbild && e.modus !== 'diagnose' && e.schnappschuss,
      )
      .map((e) => ({
        ts: e.ts,
        vorlage: e.vorlage,
        niveau: e.niveau,
        platzhalter: e.schnappschuss?.platzhalter,
        loesung: e.schnappschuss?.loesung,
        antwort: e.schnappschuss?.antwort,
      })),
  };
}

/** Für die Vorschau: Zahl der Ereignisse je Art und Zeitraum. */
export function zusammenfassung(p: Testprotokoll): {
  readonly jeArt: Readonly<Record<string, number>>;
  readonly von?: Tag;
  readonly bis?: Tag;
} {
  const jeArt: Record<string, number> = {};
  for (const e of p.ereignisse) jeArt[e.art] = (jeArt[e.art] ?? 0) + 1;
  const tage = p.ereignisse.map((e) => e.tag).sort();
  const von = tage[0];
  const bis = tage.at(-1);
  return { jeArt, ...(von ? { von } : {}), ...(bis ? { bis } : {}) };
}
