/**
 * Fehlerkatalog (VERMITTLUNG §3, INHALTSFORMAT §16): Fehlvorstellungen mit
 * Erklärung, Gegenbeispiel, Rückweg und Kontrastaufgaben. Fehlerbilder der
 * Vorlagen verweisen über `fv` darauf.
 *
 * Rein: Kompetenzen, Vorlagen und Schritte der Erstvermittlungen werden hereingereicht.
 */
import type { Kompetenz } from '../competence/kompetenz';
import type { Sprachobjekt } from './generator';
import { WERKZEUGE } from './vermittlung';

export const FV_ARTEN = [
  'falsche-grundvorstellung',
  'falsche-regel',
  'uebergeneralisiert',
  'verwechslung',
  'lesefehler',
  'rechenfehler',
] as const;
export type FvArt = (typeof FV_ARTEN)[number];

/** Die lange Erklärung hat genau diese Teile, in dieser Reihenfolge (F3, F4). */
export const ERKLAERUNG_TEILE = ['so-denkst-du', 'warum-nicht', 'so-stimmt-es'] as const;

/** Kurze Erklärung: höchstens so viele Wörter (wie Fachbegriffe, L-7). */
export const KURZ_WOERTER = 35;

export interface Fehlvorstellung {
  readonly id: string;
  readonly name: Sprachobjekt;
  readonly art: FvArt;
  readonly beschreibung: Sprachobjekt;
  readonly kompetenzen: readonly string[];
  readonly erklaerung: {
    readonly kurz: Sprachobjekt;
    readonly lang: readonly (Sprachobjekt & {
      readonly teil: (typeof ERKLAERUNG_TEILE)[number];
      readonly bild?: {
        readonly werkzeug: string;
        readonly parameter?: Readonly<Record<string, unknown>>;
      };
    })[];
  };
  readonly gegenbeispiel: Sprachobjekt;
  readonly rueckweg: { readonly vermittlung: string; readonly voraussetzung?: string };
  readonly kontrast: readonly string[];
  readonly quelle?: Sprachobjekt;
  readonly herkunft: 'eigen' | 'ki-entwurf' | 'oer';
  readonly version: number;
}

export const FV_ID = /^FV\.[A-Z]{2}\.[A-Z0-9-]+$/;

const istObjekt = (x: unknown): x is Record<string, unknown> =>
  typeof x === 'object' && x !== null && !Array.isArray(x);
const istSprachobjekt = (x: unknown): x is Sprachobjekt =>
  istObjekt(x) && typeof x['de'] === 'string' && x['de'].trim() !== '';

export function pruefeFehlvorstellung(
  daten: unknown,
  kontext: {
    readonly dateiname: string;
    readonly kompetenzen: ReadonlyMap<string, Kompetenz>;
    readonly vorlagen: ReadonlySet<string>;
    /** Kompetenz-ID → Schritt-IDs ihrer Erstvermittlung (nur, wo es schon eine gibt) */
    readonly vermittlungen: ReadonlyMap<string, ReadonlySet<string>>;
  },
): string[] {
  if (!istObjekt(daten)) return ['keine YAML-Zuordnung (Objekt) gefunden'];
  const f: string[] = [];
  const id = daten['id'];
  if (typeof id !== 'string' || !FV_ID.test(id)) f.push('id muss FV.<FELD>.<NAME> lauten');
  else if (id !== kontext.dateiname) f.push(`id ${id} passt nicht zum Dateinamen`);
  if (!istSprachobjekt(daten['name'])) f.push('name.de fehlt');
  if (!FV_ARTEN.includes(daten['art'] as FvArt)) f.push('art fehlt oder unbekannt');
  if (!istSprachobjekt(daten['beschreibung'])) f.push('beschreibung.de fehlt');

  const ks = daten['kompetenzen'];
  if (!Array.isArray(ks) || ks.length === 0) f.push('kompetenzen: mindestens eine');
  else
    for (const k of ks)
      if (!kontext.kompetenzen.has(String(k))) f.push(`Kompetenz ${String(k)} fehlt`);

  const e = daten['erklaerung'];
  if (!istObjekt(e)) f.push('erklaerung fehlt');
  else {
    if (!istSprachobjekt(e['kurz'])) f.push('erklaerung.kurz.de fehlt');
    else if (e['kurz'].de.split(/\s+/).filter(Boolean).length > KURZ_WOERTER)
      f.push(`erklaerung.kurz länger als ${KURZ_WOERTER} Wörter`);
    const lang = e['lang'];
    const teile = Array.isArray(lang)
      ? lang.map((t: unknown) => (istObjekt(t) ? t['teil'] : ''))
      : [];
    if (
      !Array.isArray(lang) ||
      teile.join() !== ERKLAERUNG_TEILE.join() ||
      !lang.every(istSprachobjekt)
    )
      f.push(`erklaerung.lang braucht genau ${ERKLAERUNG_TEILE.join(', ')} mit de (F3, F4)`);
    else
      for (const t of lang as unknown as Record<string, unknown>[]) {
        const bild = t['bild'];
        if (bild !== undefined && (!istObjekt(bild) || !WERKZEUGE.has(String(bild['werkzeug']))))
          f.push(`erklaerung.lang.${String(t['teil'])}: unbekanntes Werkzeug`);
      }
  }
  if (!istSprachobjekt(daten['gegenbeispiel'])) f.push('gegenbeispiel.de fehlt (F3)');

  const r = daten['rueckweg'];
  if (!istObjekt(r) || typeof r['vermittlung'] !== 'string')
    f.push('rueckweg.vermittlung fehlt (F3)');
  else {
    const [kid = '', schritt = ''] = r['vermittlung'].split('#');
    if (!kontext.kompetenzen.has(kid) || schritt === '')
      f.push('rueckweg.vermittlung muss <Kompetenz-ID>#<Schritt-ID> sein');
    else {
      const schritte = kontext.vermittlungen.get(kid);
      if (schritte && !schritte.has(schritt))
        f.push(`rueckweg.vermittlung: Schritt ${schritt} fehlt in der Erstvermittlung von ${kid}`);
    }
    if (r['voraussetzung'] !== undefined && !kontext.kompetenzen.has(String(r['voraussetzung'])))
      f.push(`rueckweg.voraussetzung ${String(r['voraussetzung'])} fehlt`);
  }

  const kontrast = daten['kontrast'];
  if (!Array.isArray(kontrast) || kontrast.length === 0)
    f.push('kontrast: mindestens eine Vorlage (F3)');
  else
    for (const v of kontrast)
      if (!kontext.vorlagen.has(String(v))) f.push(`Vorlage ${String(v)} fehlt`);

  if (daten['quelle'] !== undefined && !istSprachobjekt(daten['quelle'])) f.push('quelle.de fehlt');
  if (!['eigen', 'ki-entwurf', 'oer'].includes(String(daten['herkunft']))) f.push('herkunft fehlt');
  if (!Number.isInteger(daten['version'])) f.push('version fehlt');
  return f;
}
