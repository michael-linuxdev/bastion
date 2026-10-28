/**
 * Sicherungen (DATENMODELL §7): Format, Prüfung, Zusammenführen, Erinnerung.
 *
 * Eine Datei `.bastion` hat einen offenen Kopf und einen verschlüsselten Inhalt.
 * Der Kern kennt nur die Bytes des Kopfes und den Inhalt als Daten; das
 * Verschlüsseln (AES-GCM, Schlüssel per PBKDF2 aus dem Sicherungscode) und
 * Komprimieren übernimmt die Plattform.
 */
import { AUFGABE_V, type AufgabeEreignis } from '../learning/ereignis';
import { SITZUNG_V, type SitzungEreignis } from '../learning/sitzung';
import { EINSTELLUNG_V, type EinstellungEreignis } from '../policy/einstellung';
import type { Tag } from '../policy/lerntag';

export const FORMAT = 1;
const MAGIE = 'BASTION';
const TAG_LAENGE = 10; // "2026-10-28"
export const SALZ_LAENGE = 16;
export const IV_LAENGE = 12;
export const KOPF_LAENGE = MAGIE.length + 1 + TAG_LAENGE + SALZ_LAENGE + IV_LAENGE;

/** Sicherungscode: sechs Wörter (D-9, 48 Bit), damit Durchprobieren aussichtslos ist. */
export const CODE_WOERTER = 6;

/** Erinnerung an eine Sicherung (ARCHITEKTUR §2, D-O4): Standard monatlich. */
export const ERINNERUNG_TAGE = 30;
/** Wählbare Abstände in Tagen; 0 = keine Erinnerung. Eltern stellen ein (Einstellung `sicherung.erinnerung`). */
export const ERINNERUNG_WAHL = [14, 30, 90, 0] as const;
export const ERINNERUNG_SCHLUESSEL = 'sicherung.erinnerung';

/** Gespeicherten Wert lesen; Unbekanntes gilt als Standard. */
export const erinnerungTage = (wert: unknown): number =>
  ERINNERUNG_WAHL.find((w) => w === wert) ?? ERINNERUNG_TAGE;

export interface SicherungsProfil {
  readonly id: string;
  readonly erstellt: number;
}

export type SicherungsEreignis = AufgabeEreignis | SitzungEreignis | EinstellungEreignis;

export interface SicherungsInhalt {
  readonly format: number;
  readonly profile: readonly SicherungsProfil[];
  readonly ereignisse: readonly SicherungsEreignis[];
}

export interface Kopf {
  readonly format: number;
  readonly erstellt: Tag;
  readonly salz: Uint8Array;
  readonly iv: Uint8Array;
}

// Der Kopf enthält nur ASCII (Magie, Tag) – dafür genügt eine Umrechnung je Zeichen.
const ascii = (text: string) => Uint8Array.from(text, (c) => c.charCodeAt(0) & 0x7f);
const alsText = (bytes: Uint8Array) => String.fromCharCode(...bytes);

export function kopfSchreiben(k: Kopf): Uint8Array {
  if (
    k.salz.length !== SALZ_LAENGE ||
    k.iv.length !== IV_LAENGE ||
    k.erstellt.length !== TAG_LAENGE
  )
    throw new Error('Ungültiger Kopf');
  const bytes = new Uint8Array(KOPF_LAENGE);
  bytes.set(ascii(MAGIE), 0);
  bytes[MAGIE.length] = k.format;
  bytes.set(ascii(k.erstellt), MAGIE.length + 1);
  bytes.set(k.salz, MAGIE.length + 1 + TAG_LAENGE);
  bytes.set(k.iv, MAGIE.length + 1 + TAG_LAENGE + SALZ_LAENGE);
  return bytes;
}

export type KopfFehler = 'keine-sicherung' | 'zu-neu';

/** Kopf lesen; Fehler, wenn die Datei keine Bastion-Sicherung ist oder aus einer neueren App stammt. */
export function kopfLesen(datei: Uint8Array): Kopf | KopfFehler {
  if (datei.length <= KOPF_LAENGE) return 'keine-sicherung';
  if (alsText(datei.subarray(0, MAGIE.length)) !== MAGIE) return 'keine-sicherung';
  const format = datei[MAGIE.length] ?? 0;
  if (format > FORMAT) return 'zu-neu';
  if (format < 1) return 'keine-sicherung';
  const a = MAGIE.length + 1;
  return {
    format,
    erstellt: alsText(datei.subarray(a, a + TAG_LAENGE)),
    salz: datei.slice(a + TAG_LAENGE, a + TAG_LAENGE + SALZ_LAENGE),
    iv: datei.slice(a + TAG_LAENGE + SALZ_LAENGE, KOPF_LAENGE),
  };
}

export type InhaltFehler = 'beschaedigt' | 'zu-neu';

const istText = (x: unknown): x is string => typeof x === 'string' && x.length > 0;
const istZahl = (x: unknown): x is number => typeof x === 'number' && Number.isFinite(x);
const VERSION: Readonly<Record<string, number>> = {
  aufgabe: AUFGABE_V,
  sitzung: SITZUNG_V,
  einstellung: EINSTELLUNG_V,
};

/**
 * Entschlüsselten Inhalt prüfen. Die Datei ist durch AES-GCM gegen Veränderung
 * geschützt; geprüft wird deshalb vor allem, ob diese App sie versteht.
 */
export function inhaltPruefen(daten: unknown): SicherungsInhalt | InhaltFehler {
  if (typeof daten !== 'object' || daten === null) return 'beschaedigt';
  const d = daten as Record<string, unknown>;
  if (!istZahl(d['format'])) return 'beschaedigt';
  if (d['format'] > FORMAT) return 'zu-neu';
  const profile = d['profile'];
  const ereignisse = d['ereignisse'];
  if (!Array.isArray(profile) || !Array.isArray(ereignisse)) return 'beschaedigt';
  for (const p of profile as unknown[]) {
    const q = p as Record<string, unknown> | null;
    if (!q || !istText(q['id']) || !istZahl(q['erstellt'])) return 'beschaedigt';
  }
  const ids = new Set((profile as SicherungsProfil[]).map((p) => p.id));
  for (const e of ereignisse as unknown[]) {
    const f = e as Record<string, unknown> | null;
    if (!f || !istText(f['id']) || !istText(f['art']) || !istZahl(f['ts'])) return 'beschaedigt';
    if (!istText(f['profil']) || !ids.has(f['profil'])) return 'beschaedigt';
    if (!istText(f['geraet']) || !istText(f['tag']) || !istZahl(f['v'])) return 'beschaedigt';
    const bekannt = VERSION[f['art']];
    // Ereignisart oder Schemaversion, die diese App noch nicht kennt → aus einer neueren App
    if (bekannt === undefined || f['v'] > bekannt) return 'zu-neu';
  }
  return daten as SicherungsInhalt;
}

/** Zusammenführen (D-10): nur Ereignisse, deren ID es noch nicht gibt. */
export function fehlende<E extends { readonly id: string }>(
  vorhanden: ReadonlySet<string>,
  eingehend: readonly E[],
): E[] {
  const gesehen = new Set(vorhanden);
  return eingehend.filter((e) => !gesehen.has(e.id) && gesehen.add(e.id));
}

const TAG_MS = 24 * 60 * 60 * 1000;

/**
 * Ist eine Erinnerung an eine Sicherung fällig? Erst wenn es etwas zu sichern
 * gibt; dann `tage` Tage nach der letzten Sicherung bzw. nach der ersten Aufgabe.
 * `tage` = 0: keine Erinnerung.
 */
export function sicherungFaellig(
  letzteSicherung: number | undefined,
  ersteAufgabe: number | undefined,
  jetzt: number,
  tage: number = ERINNERUNG_TAGE,
): boolean {
  if (ersteAufgabe === undefined || tage <= 0) return false;
  const seit = letzteSicherung ?? ersteAufgabe;
  return jetzt - seit >= tage * TAG_MS;
}

/** Dateiname, z. B. "bastion-sicherung-2026-10-28.bastion". */
export const dateiname = (tag: Tag) => `bastion-sicherung-${tag}.bastion`;
