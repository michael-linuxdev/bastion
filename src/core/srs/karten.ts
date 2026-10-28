/**
 * Wiederholungskarten (DATENMODELL §5, Projektion `karten`): eine Karte je
 * Aufgabenvorlage und Niveau, geplant mit FSRS (T-5, Bibliothek ts-fsrs).
 *
 * Rein und wiederholbar: Zeitpunkte kommen aus den Ereignissen; Zufall in
 * den Abständen („fuzz“) ist aus, Lernschritte in Minuten auch – Bastion
 * plant in Lerntagen. Gespeichert werden nur Zahlen, keine Date-Objekte.
 */
import { createEmptyCard, fsrs, generatorParameters, Rating, type Card, type Grade } from 'ts-fsrs';
import type { Niveau } from '../competence/kompetenz';
import type { AufgabeEreignis, Bewertung } from '../learning/ereignis';

/** Angestrebte Erinnerungswahrscheinlichkeit beim Fälligwerden. */
export const ZIEL_ERINNERUNG = 0.9;

const planer = fsrs(
  generatorParameters({
    enable_fuzz: false,
    enable_short_term: false,
    request_retention: ZIEL_ERINNERUNG,
  }),
);

const NOTE: Record<Bewertung, Grade> = {
  nochmal: Rating.Again,
  schwer: Rating.Hard,
  gut: Rating.Good,
};

export interface Karte {
  readonly profil: string;
  readonly kompetenz: string;
  readonly vorlage: string;
  readonly niveau: Niveau;
  /** Nächste Fälligkeit, ms seit 1970 (UTC) */
  readonly faellig: number;
  readonly stabilitaet: number;
  readonly schwierigkeit: number;
  readonly geplanteTage: number;
  readonly lernschritte: number;
  readonly wiederholungen: number;
  readonly fehler: number;
  readonly zustand: number;
  readonly letzte: number;
  /** Wie oft die Karte als fällige Wiederholung richtig beantwortet wurde (LEHRPLAN §6). */
  readonly bestandenFaellig: number;
}

function alsFsrs(k: Karte): Card {
  return {
    due: new Date(k.faellig),
    stability: k.stabilitaet,
    difficulty: k.schwierigkeit,
    elapsed_days: 0,
    scheduled_days: k.geplanteTage,
    learning_steps: k.lernschritte,
    reps: k.wiederholungen,
    lapses: k.fehler,
    state: k.zustand,
    last_review: new Date(k.letzte),
  };
}

/** Schreibt die Karte mit einem Ereignis fort; Ereignisse ohne Bewertung ändern nichts. */
export function fortschreibenKarte(
  karte: Karte | undefined,
  e: AufgabeEreignis,
): Karte | undefined {
  if (e.bewertung === null) return karte;
  const jetzt = new Date(e.ts);
  const alt = karte ? alsFsrs(karte) : createEmptyCard(jetzt);
  const { card } = planer.next(alt, jetzt, NOTE[e.bewertung]);
  return {
    profil: e.profil,
    kompetenz: e.kompetenz,
    vorlage: e.vorlage,
    niveau: e.niveau,
    faellig: card.due.getTime(),
    stabilitaet: card.stability,
    schwierigkeit: card.difficulty,
    geplanteTage: card.scheduled_days,
    lernschritte: card.learning_steps,
    wiederholungen: card.reps,
    fehler: card.lapses,
    zustand: card.state,
    letzte: e.ts,
    bestandenFaellig:
      (karte?.bestandenFaellig ?? 0) + (e.faellig && e.ergebnis === 'richtig' ? 1 : 0),
  };
}

/** Geschätzte Erinnerungswahrscheinlichkeit (0 … 1) zum Zeitpunkt `jetzt`. */
export function erinnerung(karte: Karte, jetzt: number): number {
  return planer.get_retrievability(alsFsrs(karte), new Date(jetzt), false);
}

export const istFaellig = (karte: Karte, jetzt: number) => karte.faellig <= jetzt;

export const kartenSchluessel = (k: Pick<Karte, 'profil' | 'vorlage' | 'niveau'>) =>
  `${k.profil}|${k.vorlage}|${k.niveau}`;
