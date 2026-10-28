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

/**
 * Gilt nur auf dem Gerät, auf dem sie festgelegt wurden (D-15): Eltern-PIN und
 * Wiederherstellungscode. Ihre Ereignisse reisen in Sicherungen mit, zählen auf
 * einem anderen Gerät aber nicht.
 */
export const JE_GERAET = GEHEIM;

/** Vermerk, dass die PIN nach dem Einspielen einer Sicherung neu festgelegt wurde (D-15). */
export const PIN_NACH_SICHERUNG = 'eltern.pin-nach-sicherung';

/** Reihenfolge „gilt später“: jüngere Änderung; bei gleicher Zeit die der Eltern (§7.3); dann ID. */
function spaeter(a: EinstellungEreignis, b: EinstellungEreignis): boolean {
  if (a.ts !== b.ts) return a.ts > b.ts;
  if (a.durch !== b.durch) return a.durch === 'eltern';
  return a.id > b.id;
}

/** Aktueller Wert je Profil und Schlüssel aus allen Ereignissen (Projektion `einstellungen`). */
export function aktuelleEinstellungen(
  ereignisse: readonly EinstellungEreignis[],
): EinstellungEreignis[] {
  const neueste = new Map<string, EinstellungEreignis>();
  for (const e of ereignisse) {
    const k = `${e.profil}|${e.schluessel}`;
    const alt = neueste.get(k);
    if (!alt || spaeter(e, alt)) neueste.set(k, e);
  }
  return [...neueste.values()];
}

/** Geltender Wert eines geräteweiten Schlüssels (D-15): nur Ereignisse dieses Geräts zählen. */
export function aufDiesemGeraet(
  ereignisse: readonly EinstellungEreignis[],
  schluessel: string,
  geraet: string,
): EinstellungEreignis | undefined {
  return aktuelleEinstellungen(
    ereignisse.filter((e) => e.schluessel === schluessel && e.geraet === geraet),
  )[0];
}

/** Gab es für diesen Schlüssel schon Werte auf anderen Geräten (z. B. eine PIN aus einer Sicherung)? */
export const vonAnderemGeraet = (
  ereignisse: readonly EinstellungEreignis[],
  schluessel: string,
  geraet: string,
) => ereignisse.some((e) => e.schluessel === schluessel && e.geraet !== geraet);
