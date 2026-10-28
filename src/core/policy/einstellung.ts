/**
 * Ereignis „einstellung“ (DATENMODELL §4.5, D-5): Auch Einstellungen sind
 * Ereignisse – Jugendliche sehen im Protokoll, was wann eingestellt wurde.
 * Geheime Werte (Eltern-PIN) erscheinen dort nur als „geändert“.
 */
import { ulid } from '../rng/ulid';
import type { ZufallsQuelle } from '../rng/zufallsquelle';
import { lerntag, type Tag } from './lerntag';

export const EINSTELLUNG_V = 1;

/** Schlüssel, deren Wert nie angezeigt wird. */
export const GEHEIM = new Set(['eltern.pin', 'eltern.wiederherstellung']);

export interface EinstellungEreignis {
  readonly id: string;
  readonly art: 'einstellung';
  readonly v: number;
  readonly profil: string;
  readonly ts: number;
  readonly tag: Tag;
  readonly geraet: string;
  readonly schluessel: string;
  readonly wert: unknown;
  readonly durch: 'jugendlich' | 'eltern';
}

export function einstellungEreignis(
  angaben: Pick<EinstellungEreignis, 'profil' | 'geraet' | 'schluessel' | 'wert' | 'durch'>,
  tsUtc: number,
  utcVersatzMinuten: number,
  zufall: ZufallsQuelle,
): EinstellungEreignis {
  return {
    id: ulid(tsUtc, zufall),
    art: 'einstellung',
    v: EINSTELLUNG_V,
    ts: tsUtc,
    tag: lerntag(tsUtc, utcVersatzMinuten),
    ...angaben,
  };
}
