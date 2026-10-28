/**
 * Hinterhof (BASEBAU B-25): das Können sichtbar, je Lernfeld (Brüche, Funktionen,
 * Kreis …). Jede Kompetenz ist ein Platz, der sich füllt, sobald sie gefestigt
 * ist – auf G wie Bronze, auf M wie Silber. Leere Plätze heißen „noch offen“.
 * Markiert wird Vorwissen (in der Diagnose nachgewiesen) und Vorausgearbeitetes
 * (aus einer späteren Klasse als der gewählten). Rein und ohne eigene Daten:
 * Alles kommt aus dem Lernstand, deshalb lässt sich der Hinterhof jederzeit
 * umbauen.
 */
import type { Kompetenz } from '../competence/kompetenz';
import type { AufgabeEreignis } from './ereignis';
import { diagnoseNachweise, type KompetenzStand } from './fortschritt';

export type Fuellung = 'offen' | 'G' | 'M';

export interface HinterhofPlatz {
  readonly kompetenz: string;
  /** typische (früheste) Klassenstufe */
  readonly klasse: number;
  readonly fuellung: Fuellung;
  readonly vorwissen: boolean;
  readonly voraus: boolean;
}

export interface HinterhofFeld {
  readonly feld: string;
  readonly plaetze: readonly HinterhofPlatz[];
  readonly gefuellt: number;
}

/**
 * Felder des Hinterhofs: alle Kompetenzen bis zur gewählten Klasse, dazu
 * gefestigte aus späteren Klassen (vorausgearbeitet). Reihenfolge der Felder wie
 * die erste Kompetenz in `kompetenzen`, Plätze nach Klasse.
 */
export function hinterhof(
  kompetenzen: readonly Kompetenz[],
  staende: readonly KompetenzStand[],
  aufgaben: readonly AufgabeEreignis[],
  klasse: number,
): HinterhofFeld[] {
  const bestes = new Map<string, Fuellung>();
  for (const s of staende) {
    if (s.gefestigtAm === undefined || s.niveau === 'E') continue;
    if (s.niveau === 'M' || !bestes.has(s.kompetenz)) bestes.set(s.kompetenz, s.niveau);
  }
  const vorwissen = diagnoseNachweise(aufgaben, staende);
  const felder = new Map<string, HinterhofPlatz[]>();
  for (const k of kompetenzen) {
    const kl = Math.min(...k.klassenstufe_typisch);
    const fuellung = bestes.get(k.id) ?? 'offen';
    if (kl > klasse && fuellung === 'offen') continue;
    const platz: HinterhofPlatz = {
      kompetenz: k.id,
      klasse: kl,
      fuellung,
      vorwissen: vorwissen.has(k.id),
      voraus: kl > klasse && fuellung !== 'offen',
    };
    const liste = felder.get(k.feld);
    if (liste) liste.push(platz);
    else felder.set(k.feld, [platz]);
  }
  return [...felder.entries()].map(([feld, plaetze]) => {
    const sortiert = [...plaetze].sort((a, b) => a.klasse - b.klasse);
    return {
      feld,
      plaetze: sortiert,
      gefuellt: sortiert.filter((p) => p.fuellung !== 'offen').length,
    };
  });
}
