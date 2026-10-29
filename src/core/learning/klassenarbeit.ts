/**
 * Klassenarbeit vorbereiten (LEHRPLAN L-19): ein Termin und die Themen. Die App
 * zeigt das Datum, keinen Countdown, und schlägt die Themen zum Üben vor, die
 * noch nicht sicher sitzen. Nach dem Termin ist die Klassenarbeit vorbei. Rein.
 */
import type { Tag } from '../policy/lerntag';
import type { Status } from './fortschritt';

export interface Klassenarbeit {
  readonly termin: Tag;
  readonly themen: readonly string[];
}

/** Gespeicherten Text lesen; vorbei, unvollständig oder kaputt ergibt undefined. */
export function klassenarbeitAus(wert: unknown, heute: Tag): Klassenarbeit | undefined {
  if (typeof wert !== 'string' || wert === '') return undefined;
  try {
    const k = JSON.parse(wert) as { termin?: unknown; themen?: unknown };
    if (typeof k.termin !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(k.termin)) return undefined;
    if (!Array.isArray(k.themen) || k.themen.length === 0) return undefined;
    if (k.termin < heute) return undefined;
    return { termin: k.termin, themen: k.themen.filter((x): x is string => typeof x === 'string') };
  } catch {
    return undefined;
  }
}

export const klassenarbeitText = (k: Klassenarbeit) =>
  JSON.stringify({ termin: k.termin, themen: k.themen });

/**
 * Was vor der Klassenarbeit noch zu üben ist: Themen, die noch nicht gefestigt
 * sind – zuerst die neuen und die in Arbeit, dann die gekonnten.
 */
export function nochUeben(
  k: Klassenarbeit,
  status: (kompetenz: string) => Status | 'neu' | 'auffrischen',
): string[] {
  const rang = (s: ReturnType<typeof status>) =>
    s === 'neu' || s === 'in-arbeit' ? 0 : s === 'auffrischen' ? 1 : s === 'gekonnt' ? 2 : 3;
  return k.themen
    .map((id, i) => ({ id, i, r: rang(status(id)) }))
    .filter((x) => x.r < 3)
    .sort((a, b) => a.r - b.r || a.i - b.i)
    .map((x) => x.id);
}
