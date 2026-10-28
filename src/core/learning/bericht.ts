/**
 * Elternbericht (DATENMODELL §5.2, D-14): Wochenzusammenfassung für die
 * einfache Ansicht, einzelne Aufgaben für die ausführliche. Rein.
 */
import type { Tag } from '../policy/lerntag';
import type { AufgabeEreignis } from './ereignis';

export interface Woche {
  /** ISO-Woche, z. B. "2026-W44" */
  readonly woche: string;
  /** Montag der Woche, z. B. "2026-10-26" */
  readonly montag: Tag;
  readonly aufgaben: number;
  readonly richtig: number;
  /** An wie vielen Lerntagen geübt wurde */
  readonly lerntage: number;
}

/** ISO-Woche und Montag zu einem Lerntag „JJJJ-MM-TT“. */
export function isoWoche(tag: Tag): { woche: string; montag: Tag } {
  const [j, m, t] = tag.split('-').map(Number) as [number, number, number];
  const d = new Date(Date.UTC(j, m - 1, t));
  const wochentag = (d.getUTCDay() + 6) % 7; // Montag = 0
  const montag = new Date(d.getTime() - wochentag * 86_400_000);
  const donnerstag = new Date(montag.getTime() + 3 * 86_400_000);
  // ISO 8601: Die Woche gehört zu dem Jahr, in dem ihr Donnerstag liegt.
  const jahr = donnerstag.getUTCFullYear();
  const tagImJahr = (donnerstag.getTime() - Date.UTC(jahr, 0, 1)) / 86_400_000;
  const nr = Math.floor(tagImJahr / 7) + 1;
  return {
    woche: `${jahr}-W${String(nr).padStart(2, '0')}`,
    montag: montag.toISOString().slice(0, 10),
  };
}

/** Wochen mit Aufgaben, neueste zuerst. */
export function wochen(ereignisse: readonly AufgabeEreignis[]): Woche[] {
  const nachWoche = new Map<
    string,
    { montag: Tag; aufgaben: number; richtig: number; tage: Set<Tag> }
  >();
  for (const e of ereignisse) {
    if (e.ergebnis === 'uebersprungen') continue;
    const { woche, montag } = isoWoche(e.tag);
    const w = nachWoche.get(woche) ?? { montag, aufgaben: 0, richtig: 0, tage: new Set<Tag>() };
    w.aufgaben += 1;
    if (e.ergebnis === 'richtig') w.richtig += 1;
    w.tage.add(e.tag);
    nachWoche.set(woche, w);
  }
  return [...nachWoche.entries()]
    .map(([woche, w]) => ({
      woche,
      montag: w.montag,
      aufgaben: w.aufgaben,
      richtig: w.richtig,
      lerntage: w.tage.size,
    }))
    .sort((a, b) => b.woche.localeCompare(a.woche));
}

/** Einzelne Aufgaben für die ausführliche Ansicht, neueste zuerst. */
export const einzelne = (ereignisse: readonly AufgabeEreignis[]): AufgabeEreignis[] =>
  [...ereignisse].sort((a, b) => b.ts - a.ts);
