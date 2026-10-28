/**
 * Ereignis „aufgabe“ (DATENMODELL §3.4, §4.1): eine bearbeitete Aufgabe.
 * Rein: Zeit, Zeitzone, Zufall und Gerät werden hereingereicht (T-2).
 */
import { lerntag, type Tag } from '../policy/lerntag';
import { ulid } from '../rng/ulid';
import type { ZufallsQuelle } from '../rng/zufallsquelle';
import type { Niveau } from '../competence/kompetenz';
import type { Ergebnis } from './auswertung';
import type { Loesung, Wert } from './generator';

/** Schemaversion der Ereignisart `aufgabe` (DATENMODELL §6.2). */
export const AUFGABE_V = 1;

/** Bearbeitungszeit wird bei 10 Minuten gekappt (DATENMODELL §4.1). */
export const DAUER_MAX_MS = 10 * 60_000;

export type Bewertung = 'nochmal' | 'schwer' | 'gut';

export interface Schnappschuss {
  readonly platzhalter: Readonly<Record<string, Wert>>;
  readonly loesung: Loesung;
  readonly antwort: Loesung;
}

export interface AufgabeEreignis {
  readonly id: string;
  readonly art: 'aufgabe';
  readonly v: number;
  readonly profil: string;
  readonly ts: number;
  readonly tag: Tag;
  readonly geraet: string;
  readonly sitzung: string;
  readonly modus: 'ueben' | 'wiederholen' | 'diagnose' | 'fehlerwerkstatt' | 'pruefung';
  readonly kompetenz: string;
  readonly vorlage: string;
  readonly niveau: Niveau;
  readonly quelle: { readonly generator: string; readonly version: number; readonly seed: number };
  readonly paket: string;
  readonly ergebnis: 'richtig' | 'falsch' | 'teilweise' | 'uebersprungen';
  readonly hilfen: number;
  readonly dauerMs: number;
  readonly faellig: boolean;
  readonly bewertung: Bewertung | null;
  readonly fehlerbild?: string;
  readonly schnappschuss?: Schnappschuss;
  /** Fehlerwerkstatt: ID des früheren falschen Ereignisses, das hier korrigiert wurde. */
  readonly korrigiert?: string;
}

/** FSRS-Bewertung nach der Tabelle in DATENMODELL §4.1; Zeit zählt bewusst nicht. */
export function bewertung(richtig: boolean, hilfen: number): Bewertung {
  if (!richtig) return 'nochmal';
  return hilfen > 0 ? 'schwer' : 'gut';
}

export interface AufgabeAngaben {
  readonly profil: string;
  readonly geraet: string;
  readonly sitzung: string;
  readonly modus: AufgabeEreignis['modus'];
  readonly kompetenz: string;
  readonly vorlage: string;
  readonly niveau: Niveau;
  /** "id@version" des Generators */
  readonly generator: string;
  readonly seed: number;
  readonly paket: string;
  readonly hilfen: number;
  readonly dauerMs: number;
  readonly faellig: boolean;
  readonly platzhalter: Readonly<Record<string, Wert>>;
  readonly loesung: Loesung;
  readonly antwort: Loesung;
  readonly ergebnis: Ergebnis;
  readonly korrigiert?: string;
}

/** Baut das Ereignis; Schnappschuss nur bei falschen Antworten (I-6, Datensparsamkeit). */
export function aufgabeEreignis(
  a: AufgabeAngaben,
  tsUtc: number,
  utcVersatzMinuten: number,
  zufall: ZufallsQuelle,
): AufgabeEreignis {
  const [generator = '', version = ''] = a.generator.split('@');
  const richtig = a.ergebnis.richtig;
  return {
    id: ulid(tsUtc, zufall),
    art: 'aufgabe',
    v: AUFGABE_V,
    profil: a.profil,
    ts: tsUtc,
    tag: lerntag(tsUtc, utcVersatzMinuten),
    geraet: a.geraet,
    sitzung: a.sitzung,
    modus: a.modus,
    kompetenz: a.kompetenz,
    vorlage: a.vorlage,
    niveau: a.niveau,
    quelle: { generator, version: Number(version), seed: a.seed },
    paket: a.paket,
    ergebnis: richtig ? 'richtig' : 'falsch',
    hilfen: a.hilfen,
    dauerMs: Math.min(Math.max(0, Math.round(a.dauerMs)), DAUER_MAX_MS),
    faellig: a.faellig,
    bewertung: bewertung(richtig, a.hilfen),
    ...(!a.ergebnis.richtig && a.ergebnis.fehlerbild ? { fehlerbild: a.ergebnis.fehlerbild } : {}),
    ...(a.korrigiert ? { korrigiert: a.korrigiert } : {}),
    ...(richtig
      ? {}
      : { schnappschuss: { platzhalter: a.platzhalter, loesung: a.loesung, antwort: a.antwort } }),
  };
}
