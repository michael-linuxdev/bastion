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

/** Basebau-Schalter (R7, BASEBAU B-13): Einstellung `basebau.aktiv`. */
export const BASEBAU_SCHLUESSEL = 'basebau.aktiv';

/** Standard an (B-13): Nur ein ausdrückliches „aus“ schaltet den Basebau ab. */
export const basebauAktiv = (wert: unknown): boolean => wert !== false;

/** Themen der Bastion (B-17): gleiche Mechanik, eigene Namen. Einstellung `basebau.thema`. */
export const THEMEN = ['bastion', 'garten', 'weltraum', 'dorf', 'unterwasser'] as const;
export type Thema = (typeof THEMEN)[number];
export const THEMA_SCHLUESSEL = 'basebau.thema';

/** Unbekanntes oder nicht Gewähltes gilt als Bastion. */
export const themaAus = (wert: unknown): Thema => THEMEN.find((x) => x === wert) ?? 'bastion';

/** Bauplatz als Bild zeigen (BASEBAU 2.13); nur `false` blendet es aus. */
export const BILD_SCHLUESSEL = 'basebau.bild';

/** Bastion ohne Bewegung (GRAFIK §4.5); nur `true` schaltet ruhig. */
export const RUHIG_SCHLUESSEL = 'basebau.ruhig';

/** Weniger Effekte, Wesen bleiben erlaubt (GRAFIK §4.5); nur `true` = leicht. */
export const LEICHT_SCHLUESSEL = 'basebau.leicht';

/**
 * Sound-Stufen (Design V–Z W113): aus / nur UI / Bastion+UI.
 * Schlüssel `basebau.sound` – früher boolean (`true` = Bastion+UI).
 */
export const SOUND_SCHLUESSEL = 'basebau.sound';
export const SOUND_STUFEN = ['aus', 'ui', 'bastion'] as const;
export type SoundStufe = (typeof SOUND_STUFEN)[number];
/** Unbekanntes, fehlendes oder altes `false` → aus; altes `true` → bastion. */
export const soundStufeAus = (wert: unknown): SoundStufe => {
  if (wert === true) return 'bastion';
  return SOUND_STUFEN.find((s) => s === wert) ?? 'aus';
};

/** Kräftigerer Text (Design V110); nur `true` schaltet ein. */
export const KONTRAST_SCHLUESSEL = 'darstellung.kontrast';
export const kontrastAn = (wert: unknown): boolean => wert === true;

/** Echtes Wetter von Open-Meteo (T-15); nur `true` schaltet ein. Standard aus. */
export const WETTER_ECHT_SCHLUESSEL = 'wetter.echt';

/** Freitext-Ort fürs Wetter, z. B. „Dresden“. */
export const WETTER_ORT_SCHLUESSEL = 'wetter.ort';

/** Geocoding-Ergebnis als „lat,lon,name“ – nur lokal, kein Gerät-Standort. */
export const WETTER_KOORD_SCHLUESSEL = 'wetter.koord';

/** Zoom des Bauplatzes (BASEBAU 2.13a): stufenlos, 0 heißt eingepasst. */
export const ZOOM_SCHLUESSEL = 'basebau.zoom';

/** Hell, dunkel oder wie das System (GRAFIK §2): Einstellung `darstellung.modus`. */
export const MODUS_SCHLUESSEL = 'darstellung.modus';
export const MODI = ['system', 'hell', 'dunkel'] as const;
export type Modus = (typeof MODI)[number];
/** Unbekanntes oder nicht Gewähltes folgt dem System. */
export const modusAus = (wert: unknown): Modus => MODI.find((m) => m === wert) ?? 'system';

/**
 * Bildschirm-Orientierung (Bastion + Lernen): Einstellung `darstellung.orientierung`.
 * `auto` = Gerät; `hoch`/`quer` = Wunsch, wenn die Plattform es erlaubt.
 */
export const ORIENTIERUNG_SCHLUESSEL = 'darstellung.orientierung';
export const ORIENTIERUNGEN = ['auto', 'hoch', 'quer'] as const;
export type Orientierung = (typeof ORIENTIERUNGEN)[number];
export const orientierungAus = (wert: unknown): Orientierung =>
  ORIENTIERUNGEN.find((o) => o === wert) ?? 'auto';

/** Vorgemerktes Bauvorhaben (BASEBAU B-20), als Text; leer = keins. */
export const ZIEL_SCHLUESSEL = 'basebau.ziel';

/**
 * Eltern/Test: Unendlich Rohstoffe nur zum Ansehen des Baus.
 * Virtueller Vorrat – Ledger und Lernfortschritt bleiben unberührt.
 * Einstellung `bastion.test-rohstoffe`; nur `true` schaltet ein.
 */
export const TEST_ROHSTOFFE_SCHLUESSEL = 'bastion.test-rohstoffe';
export const testRohstoffeAn = (wert: unknown): boolean => wert === true;

/** Gewählte Klassenstufe (L-12): Einstellung `lernen.klasse`, 5 bis 12; sonst 5. */
export const KLASSE_SCHLUESSEL = 'lernen.klasse';
export const klasseAus = (wert: unknown): number =>
  typeof wert === 'number' && Number.isInteger(wert) && wert >= 5 && wert <= 12 ? wert : 5;

/** Schulart (L-9, L-12), freiwillig: `lernen.schulart` – Oberschule, Gymnasium oder keine Angabe. */
export const SCHULART_SCHLUESSEL = 'lernen.schulart';
export const SCHULARTEN = ['oberschule', 'gymnasium'] as const;
export const schulartAus = (wert: unknown): (typeof SCHULARTEN)[number] | undefined =>
  SCHULARTEN.find((s) => s === wert);

/** Profil (L-15), freiwillig: Geburtsdatum „JJJJ-MM-TT“, „Ich bin erwachsen“, schon gefragt. */
export const GEBURTSDATUM_SCHLUESSEL = 'profil.geburtsdatum';
export const ERWACHSEN_SCHLUESSEL = 'profil.erwachsen';
export const PROFIL_GEFRAGT_SCHLUESSEL = 'profil.gefragt';

/** Zuletzt bestätigtes Schuljahr (L-17), z. B. 2026 für 2026/27. */
export const SCHULJAHR_SCHLUESSEL = 'lernen.schuljahr';

/** „Gerade in der Schule dran“ (L-18): Kompetenz-IDs, durch Komma getrennt. */
export const GERADE_DRAN_SCHLUESSEL = 'lernen.gerade-dran';
/** Nächste Klassenarbeit (L-19): JSON mit Termin und Themen; leer = keine. */
export const KLASSENARBEIT_SCHLUESSEL = 'lernen.klassenarbeit';

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
