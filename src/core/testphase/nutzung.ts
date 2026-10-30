/**
 * Ereignis „nutzung“ (DATENMODELL §4.8, D-18): Nutzungsprotokoll der Testphase.
 * Entsteht nur, solange das Testprotokoll eingeschaltet ist; reist nicht in
 * Sicherungen und lässt sich vollständig löschen.
 * Rein: Zeit, Zeitzone, Zufall und Gerät werden hereingereicht (T-2).
 */
import { lerntag, type Tag } from '../policy/lerntag';
import { ulid } from '../rng/ulid';
import type { ZufallsQuelle } from '../rng/zufallsquelle';

/** Schemaversion der Ereignisart `nutzung` (DATENMODELL §6.2). */
export const NUTZUNG_V = 1;

/** Verweildauer wird bei 10 Minuten gekappt (wie bei Aufgaben). */
export const VERWEIL_MAX_MS = 10 * 60_000;

export const NUTZUNG_ARTEN = ['ansicht', 'abbruch', 'weg-uebersprungen', 'hilfe', 'app'] as const;
export type NutzungArt = (typeof NUTZUNG_ARTEN)[number];

export interface NutzungEreignis {
  readonly id: string;
  readonly art: 'nutzung';
  readonly v: number;
  readonly profil: string;
  readonly ts: number;
  readonly tag: Tag;
  readonly geraet: string;
  readonly was: NutzungArt;
  /** Name der Ansicht, Kompetenz- oder Vorlagen-ID – nie freier Text */
  readonly ziel?: string;
  /** Verweildauer der vorigen Ansicht */
  readonly dauerMs?: number;
}

export function nutzungEreignis(
  a: Pick<NutzungEreignis, 'profil' | 'geraet' | 'was'> & {
    readonly ziel?: string | undefined;
    readonly dauerMs?: number | undefined;
  },
  tsUtc: number,
  utcVersatzMinuten: number,
  zufall: ZufallsQuelle,
): NutzungEreignis {
  return {
    id: ulid(tsUtc, zufall),
    art: 'nutzung',
    v: NUTZUNG_V,
    profil: a.profil,
    ts: tsUtc,
    tag: lerntag(tsUtc, utcVersatzMinuten),
    geraet: a.geraet,
    was: a.was,
    ...(a.ziel ? { ziel: a.ziel } : {}),
    ...(a.dauerMs !== undefined
      ? { dauerMs: Math.min(Math.max(0, Math.round(a.dauerMs)), VERWEIL_MAX_MS) }
      : {}),
  };
}
