/**
 * Aufgabenvorlagen und ihre Prüfung (INHALTSFORMAT §4, §10.1).
 *
 * Rein: Kompetenzen und Generator-Angaben werden hereingereicht, damit die
 * Prüfung im Werkzeug und später in der App gleich funktioniert.
 */
import type { Kompetenz, Niveau } from '../competence/kompetenz';
import type { Sprachobjekt } from './generator';

export const AUFGABENTYPEN = [
  'zahl-eingabe',
  'bruch-eingabe',
  'groesse-eingabe',
  'auswahl',
  'ordnen',
  'zuordnen',
  'fehler-finden',
  'bruch-bild',
  // I-11 (bestätigt 27.10.2026)
  'bild-zahl',
  'koordinaten-eingabe',
  'bild-auswahl',
  // Division mit Rest: zwei Eingabefelder (Ergebnis, Rest)
  'rest-eingabe',
  // Primfaktorzerlegung: Faktoren eingeben, Lösung als aufsteigende Reihenfolge
  'faktoren-eingabe',
] as const;
export type Aufgabentyp = (typeof AUFGABENTYPEN)[number];

export interface GeneratorVorlage {
  readonly id: string;
  readonly kompetenz: string;
  readonly niveaus: readonly Niveau[];
  readonly typ: Aufgabentyp;
  readonly quelle: 'generator';
  /** "id@version" aus src/generators/index.ts */
  readonly generator: string;
  readonly parameter: Readonly<Partial<Record<Niveau, Readonly<Record<string, unknown>>>>>;
  readonly antwort?: Readonly<Record<string, unknown>>;
  readonly text: { readonly aufgabe: Sprachobjekt };
  readonly hilfen: readonly Sprachobjekt[];
  readonly fehlerbilder: Readonly<Record<string, Sprachobjekt>>;
  readonly herkunft: 'eigen' | 'ki-entwurf' | 'oer';
  readonly version: number;
}

/** Was die Prüfung über einen Generator wissen muss. */
export interface GeneratorAngaben {
  readonly platzhalter: readonly string[];
  readonly fehlerbildIds: readonly string[];
}

const istSprachobjekt = (x: unknown): x is Sprachobjekt =>
  typeof x === 'object' &&
  x !== null &&
  typeof (x as { de?: unknown }).de === 'string' &&
  (x as { de: string }).de.trim() !== '';

const istObjekt = (x: unknown): x is Record<string, unknown> =>
  typeof x === 'object' && x !== null && !Array.isArray(x);

/** Namen aller {platzhalter} in einem Text. */
export function platzhalterIn(text: string): string[] {
  return [...text.matchAll(/\{([a-z_]+)\}/g)].map((m) => m[1] ?? '');
}

/**
 * Prüft eine Vorlage mit Generator (handverfasste Vorlagen folgen später).
 * @param dateiname Name der Datei ohne Endung, z. B. "ziffer-an-stelle"
 * @param ordnerKompetenz ID der Kompetenz, in deren Ordner die Datei liegt
 */
export function pruefeVorlage(
  daten: unknown,
  kontext: {
    readonly dateiname: string;
    readonly ordnerKompetenz: string;
    readonly kompetenzen: ReadonlyMap<string, Kompetenz>;
    readonly generatoren: ReadonlyMap<string, GeneratorAngaben>;
  },
): string[] {
  if (!istObjekt(daten)) return ['keine YAML-Zuordnung (Objekt) gefunden'];
  const f: string[] = [];
  const d = daten;
  const id = typeof d['id'] === 'string' ? d['id'] : '';

  const kompetenzId = typeof d['kompetenz'] === 'string' ? d['kompetenz'] : '';
  const kompetenz = kontext.kompetenzen.get(kompetenzId);
  if (!kompetenz) f.push(`kompetenz ${kompetenzId} existiert nicht`);
  if (kompetenzId !== kontext.ordnerKompetenz) f.push('liegt im Ordner einer anderen Kompetenz');
  const erwarteteId = `${kompetenzId}.${kontext.dateiname.toUpperCase()}`;
  if (id !== erwarteteId) f.push(`id muss „${erwarteteId}“ lauten (Kompetenz + Dateiname)`);

  const niveaus = d['niveaus'];
  if (!Array.isArray(niveaus) || niveaus.length === 0) f.push('niveaus fehlt');
  else if (kompetenz) {
    for (const n of niveaus) {
      if (!(n in kompetenz.niveaus)) f.push(`Niveau ${String(n)} gibt es bei ${kompetenzId} nicht`);
    }
  }

  if (!AUFGABENTYPEN.includes(d['typ'] as Aufgabentyp))
    f.push(`unbekannter typ ${String(d['typ'])}`);
  if (d['quelle'] !== 'generator')
    f.push('quelle muss „generator“ sein (handverfasst folgt später)');
  if (!['eigen', 'ki-entwurf', 'oer'].includes(d['herkunft'] as string)) {
    f.push('herkunft muss eigen, ki-entwurf oder oer sein');
  }
  if (d['herkunft'] === 'oer')
    f.push('herkunft oer braucht lizenz, quelle und urheber (noch nicht unterstützt)');
  if (!Number.isInteger(d['version']) || (d['version'] as number) < 1)
    f.push('version muss ≥ 1 sein');

  const generatorName = typeof d['generator'] === 'string' ? d['generator'] : '';
  const generator = kontext.generatoren.get(generatorName);
  if (!generator) f.push(`Generator ${generatorName} ist nicht registriert (id@version)`);

  const parameter = d['parameter'];
  if (!istObjekt(parameter)) f.push('parameter fehlt');
  else if (Array.isArray(niveaus)) {
    for (const n of niveaus) {
      if (!istObjekt(parameter[n as string])) f.push(`parameter für Niveau ${String(n)} fehlt`);
    }
  }

  // Texte und Platzhalter
  const texte: [string, unknown][] = [];
  const text = d['text'];
  if (!istObjekt(text) || !istSprachobjekt(text['aufgabe'])) f.push('text.aufgabe fehlt');
  else texte.push(['text.aufgabe', text['aufgabe']]);
  const hilfen = d['hilfen'];
  if (!Array.isArray(hilfen) || hilfen.length === 0) f.push('hilfen: mindestens eine Hilfe');
  else
    hilfen.forEach((h, i) => {
      if (!istSprachobjekt(h)) f.push(`hilfen[${i}] ist kein Sprachobjekt`);
      else texte.push([`hilfen[${i}]`, h]);
    });
  const fehlerbilder = d['fehlerbilder'];
  if (!istObjekt(fehlerbilder)) f.push('fehlerbilder fehlt');
  else
    for (const [fid, t] of Object.entries(fehlerbilder)) {
      if (!istSprachobjekt(t)) f.push(`fehlerbilder.${fid} ist kein Sprachobjekt`);
      else texte.push([`fehlerbilder.${fid}`, t]);
    }

  if (generator) {
    for (const [wo, t] of texte) {
      for (const p of platzhalterIn((t as Sprachobjekt).de)) {
        if (!generator.platzhalter.includes(p))
          f.push(`${wo}: Platzhalter {${p}} liefert der Generator nicht`);
      }
    }
    if (istObjekt(fehlerbilder)) {
      for (const fid of generator.fehlerbildIds) {
        if (!(fid in fehlerbilder)) f.push(`Rückmeldung für Fehlerbild „${fid}“ fehlt`);
      }
      for (const fid of Object.keys(fehlerbilder)) {
        if (!generator.fehlerbildIds.includes(fid))
          f.push(`Fehlerbild „${fid}“ kennt der Generator nicht`);
      }
    }
  }
  return f;
}
