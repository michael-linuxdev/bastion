/**
 * Projektion `kompetenzen` (DATENMODELL §5) mit dem Status nach LEHRPLAN §6:
 * neu → in Arbeit → gekonnt. „Gefestigt“ und „auffrischen“ brauchen die
 * Wiederholungsplanung (FSRS, Phase 1b) und folgen dann.
 *
 * Rein: fortschreiben() für jedes neue Ereignis, neuAufbauen() aus allen.
 * Beides muss dasselbe ergeben (Pflicht-Test D-6).
 */
import type { Niveau } from '../competence/kompetenz';
import type { Tag } from '../policy/lerntag';
import type { AufgabeEreignis } from './ereignis';

/** Fenster und Schwellen für „gekonnt“ (LEHRPLAN §6, Startwerte L-O3). */
export const GEKONNT = { fenster: 6, richtig: 5, vorlagen: 2 } as const;

export type Status = 'in-arbeit' | 'gekonnt';

export interface KompetenzStand {
  readonly profil: string;
  readonly kompetenz: string;
  readonly niveau: Niveau;
  readonly status: Status;
  /** Lerntag, an dem „gekonnt“ zum ersten Mal erreicht wurde. */
  readonly gekonntAm?: Tag;
  readonly aufgaben: number;
  /** Die letzten Aufgaben (höchstens GEKONNT.fenster), älteste zuerst. */
  readonly letzte: readonly { readonly vorlage: string; readonly ohneHilfeRichtig: boolean }[];
}

/** Schlüssel wie in der Datenbank: Profil × Kompetenz × Niveau. */
export const standSchluessel = (e: Pick<KompetenzStand, 'profil' | 'kompetenz' | 'niveau'>) =>
  `${e.profil}|${e.kompetenz}|${e.niveau}`;

function istGekonnt(letzte: KompetenzStand['letzte']): boolean {
  const gut = letzte.filter((x) => x.ohneHilfeRichtig);
  return (
    gut.length >= GEKONNT.richtig && new Set(gut.map((x) => x.vorlage)).size >= GEKONNT.vorlagen
  );
}

/**
 * Schreibt den Stand mit einem neuen Ereignis fort. undefined = Status „neu“;
 * übersprungene Aufgaben zählen nicht als bearbeitet.
 */
export function fortschreiben(
  stand: KompetenzStand | undefined,
  e: AufgabeEreignis,
): KompetenzStand | undefined {
  if (e.ergebnis === 'uebersprungen') return stand;
  const letzte = [
    ...(stand?.letzte ?? []),
    { vorlage: e.vorlage, ohneHilfeRichtig: e.ergebnis === 'richtig' && e.hilfen === 0 },
  ].slice(-GEKONNT.fenster);
  // Einmal gekonnt bleibt gekonnt; ob es hält, zeigt später die Wiederholung (FSRS).
  const gekonntAm = stand?.gekonntAm ?? (istGekonnt(letzte) ? e.tag : undefined);
  return {
    profil: e.profil,
    kompetenz: e.kompetenz,
    niveau: e.niveau,
    status: gekonntAm ? 'gekonnt' : 'in-arbeit',
    ...(gekonntAm ? { gekonntAm } : {}),
    aufgaben: (stand?.aufgaben ?? 0) + 1,
    letzte,
  };
}

/** Alle Stände aus den Ereignissen neu berechnen (nach Zeit und ID sortiert). */
export function neuAufbauen(ereignisse: readonly AufgabeEreignis[]): Map<string, KompetenzStand> {
  const staende = new Map<string, KompetenzStand>();
  const sortiert = [...ereignisse].sort((a, b) => a.ts - b.ts || (a.id < b.id ? -1 : 1));
  for (const e of sortiert) {
    const k = standSchluessel(e);
    const neu = fortschreiben(staende.get(k), e);
    if (neu) staende.set(k, neu);
  }
  return staende;
}
