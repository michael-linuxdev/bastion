/**
 * Erstvermittlung (VERMITTLUNG §2, INHALTSFORMAT §15): eine kurze, interaktive
 * Unterrichtsstunde je Kompetenz. Alles ist vorab geschrieben; zur Laufzeit wird
 * nur verzweigt – nach richtig, nach erkannter Fehlvorstellung oder „sonst“.
 *
 * Rein: Kompetenzen, Vorlagen und Fehlvorstellungen werden hereingereicht.
 */
import type { Kompetenz, Niveau } from '../competence/kompetenz';
import type { Sprachobjekt } from './generator';

export const SCHRITT_TYPEN = [
  'ziel',
  'anknuepfen',
  'entdecken',
  'erklaeren',
  'beispiel',
  'ergaenzen',
  'gegenbeispiel',
  'merksatz',
  'pruefen',
  'uebergang',
] as const;
export type SchrittTyp = (typeof SCHRITT_TYPEN)[number];

/** Schritte, die eine Antwort verlangen */
export const MIT_ANTWORT: ReadonlySet<SchrittTyp> = new Set([
  'anknuepfen',
  'entdecken',
  'ergaenzen',
  'gegenbeispiel',
  'pruefen',
]);

/** Pflicht-Bausteine einer Sequenz (V4–V6) */
const PFLICHT: readonly SchrittTyp[] = [
  'beispiel',
  'ergaenzen',
  'gegenbeispiel',
  'merksatz',
  'pruefen',
];

/** Interaktive Werkzeuge (VERMITTLUNG §2.3); die Umsetzung liegt in src/ui. */
export const WERKZEUGE: ReadonlySet<string> = new Set(['bruchstreifen@1', 'zahlenstrahl@1']);

/** Höchstens so viele Wörter je Schritt (V8) und Minuten je Sequenz (V7). */
export const SCHRITT_WOERTER = 40;
export const DAUER_MAX = 15;

export interface WerkzeugAngabe {
  readonly werkzeug: string;
  readonly parameter?: Readonly<Record<string, unknown>>;
}

export interface Option {
  readonly wert: Sprachobjekt;
  readonly richtig?: boolean;
  readonly fv?: string;
}

export type Antwort =
  | { readonly optionen: readonly Option[] }
  | {
      readonly eingabe: {
        readonly art: 'zahl' | 'bruch';
        readonly loesung: string;
        readonly fehler?: readonly { readonly wert: string; readonly fv: string }[];
      };
    };

export interface Schritt {
  readonly id: string;
  readonly typ: SchrittTyp;
  readonly text: Sprachobjekt;
  readonly bild?: WerkzeugAngabe;
  readonly werkzeug?: {
    readonly id: string;
    readonly parameter?: Readonly<Record<string, unknown>>;
  };
  readonly antwort?: Antwort;
  readonly weiter?: string;
  /** Fehlvorstellung oder „sonst“ → Schritt-ID oder Kompetenz-ID (Rückweg) */
  readonly bei?: Readonly<Record<string, string>>;
  /** nur bei uebergang */
  readonly vorlagen?: readonly string[];
  readonly anzahl?: number;
}

export interface Vermittlung {
  readonly id: string;
  readonly kompetenz: string;
  readonly niveau: Niveau;
  readonly dauer_min: number;
  readonly schritte: readonly Schritt[];
  readonly herkunft: 'eigen' | 'ki-entwurf' | 'oer';
  readonly version: number;
}

const istObjekt = (x: unknown): x is Record<string, unknown> =>
  typeof x === 'object' && x !== null && !Array.isArray(x);
const istSprachobjekt = (x: unknown): x is Sprachobjekt =>
  istObjekt(x) && typeof x['de'] === 'string' && x['de'].trim() !== '';
const woerter = (t: string) => t.split(/\s+/).filter(Boolean).length;

function pruefeWerkzeug(roh: unknown, wo: string, name: 'werkzeug' | 'id', f: string[]): void {
  if (!istObjekt(roh)) {
    f.push(`${wo}: keine Angabe`);
    return;
  }
  const w = roh[name];
  if (typeof w !== 'string' || !WERKZEUGE.has(w))
    f.push(`${wo}: unbekanntes Werkzeug ${String(w)}`);
  if (roh['parameter'] !== undefined && !istObjekt(roh['parameter']))
    f.push(`${wo}: parameter ist keine Zuordnung`);
}

/** Fehlvorstellungen, die eine Antwort nennt */
function fvsDerAntwort(a: Record<string, unknown>): string[] {
  const optionen = Array.isArray(a['optionen']) ? (a['optionen'] as unknown[]) : [];
  const eingabe = istObjekt(a['eingabe']) ? a['eingabe'] : undefined;
  const fehler =
    eingabe && Array.isArray(eingabe['fehler']) ? (eingabe['fehler'] as unknown[]) : [];
  return [...optionen, ...fehler].flatMap((o) =>
    istObjekt(o) && typeof o['fv'] === 'string' ? [o['fv']] : [],
  );
}

function pruefeAntwort(roh: unknown, typ: SchrittTyp, wo: string, f: string[]) {
  if (!istObjekt(roh)) return void f.push(`${wo}: antwort fehlt`);
  const optionen = roh['optionen'];
  const eingabe = roh['eingabe'];
  if ((optionen === undefined) === (eingabe === undefined))
    return void f.push(`${wo}: antwort braucht genau eins von optionen oder eingabe`);
  if (optionen !== undefined) {
    if (!Array.isArray(optionen) || optionen.length < 2)
      return void f.push(`${wo}: mindestens zwei optionen`);
    let richtig = 0;
    optionen.forEach((o: unknown, i) => {
      if (!istObjekt(o) || !istSprachobjekt(o['wert']))
        f.push(`${wo}: option ${i + 1} ohne wert.de`);
      else if (o['richtig'] === true) richtig += 1;
      else if (typ === 'pruefen' && typeof o['fv'] !== 'string')
        f.push(`${wo}: falsche option ${i + 1} ohne fv (V6)`);
    });
    if (richtig !== 1) f.push(`${wo}: genau eine option mit richtig: true`);
  } else if (
    !istObjekt(eingabe) ||
    !['zahl', 'bruch'].includes(String(eingabe['art'])) ||
    typeof eingabe['loesung'] !== 'string'
  ) {
    f.push(`${wo}: eingabe braucht art (zahl|bruch) und loesung`);
  } else if (eingabe['fehler'] !== undefined) {
    const fehler = eingabe['fehler'];
    if (
      !Array.isArray(fehler) ||
      !fehler.every(
        (x: unknown) =>
          istObjekt(x) && typeof x['wert'] === 'string' && typeof x['fv'] === 'string',
      )
    )
      f.push(`${wo}: eingabe.fehler braucht je wert und fv`);
  }
}

export function pruefeVermittlung(
  daten: unknown,
  kontext: {
    readonly ordnerKompetenz: string;
    readonly kompetenzen: ReadonlyMap<string, Kompetenz>;
    /** Vorlagen-ID → Kompetenz-ID und Niveaus */
    readonly vorlagen: ReadonlyMap<
      string,
      { readonly kompetenz: string; readonly niveaus: readonly Niveau[] }
    >;
    readonly fehlvorstellungen: ReadonlySet<string>;
  },
): string[] {
  if (!istObjekt(daten)) return ['keine YAML-Zuordnung (Objekt) gefunden'];
  const f: string[] = [];
  const kid = typeof daten['kompetenz'] === 'string' ? daten['kompetenz'] : '';
  const kompetenz = kontext.kompetenzen.get(kid);
  if (!kompetenz) f.push(`kompetenz ${kid} existiert nicht`);
  if (kid !== kontext.ordnerKompetenz) f.push('liegt im Ordner einer anderen Kompetenz');
  if (daten['id'] !== kid) f.push('id muss gleich der Kompetenz-ID sein');
  const niveau = daten['niveau'];
  if (!['G', 'M', 'E'].includes(String(niveau))) f.push('niveau fehlt (G, M oder E)');
  const dauer = daten['dauer_min'];
  if (typeof dauer !== 'number' || dauer <= 0 || dauer > DAUER_MAX)
    f.push(`dauer_min muss zwischen 1 und ${DAUER_MAX} liegen (V7)`);
  if (!['eigen', 'ki-entwurf', 'oer'].includes(String(daten['herkunft']))) f.push('herkunft fehlt');
  if (!Number.isInteger(daten['version'])) f.push('version fehlt');

  const roh = daten['schritte'];
  if (!Array.isArray(roh) || roh.length === 0) return [...f, 'schritte fehlen'];
  const schritte = roh.filter(istObjekt);
  if (schritte.length !== roh.length) f.push('jeder Schritt muss eine Zuordnung sein');
  const ids = new Map<string, Record<string, unknown>>();
  for (const s of schritte) {
    const id = s['id'];
    if (typeof id !== 'string' || !/^[a-z0-9-]+$/.test(id)) {
      f.push(`Schritt mit ungültiger id ${String(id)}`);
      continue;
    }
    if (ids.has(id)) f.push(`${id}: id doppelt`);
    ids.set(id, s);
  }
  const voraussetzungen = new Set(kompetenz?.voraussetzungen ?? []);

  schritte.forEach((s, i) => {
    const wo = String(s['id']);
    const typ = s['typ'] as SchrittTyp;
    if (!SCHRITT_TYPEN.includes(typ)) return void f.push(`${wo}: unbekannter typ ${String(typ)}`);
    if (!istSprachobjekt(s['text'])) f.push(`${wo}: text.de fehlt`);
    else if (woerter(s['text'].de) > SCHRITT_WOERTER)
      f.push(`${wo}: mehr als ${SCHRITT_WOERTER} Wörter (V8)`);
    if (s['bild'] !== undefined) pruefeWerkzeug(s['bild'], `${wo}.bild`, 'werkzeug', f);
    if (s['werkzeug'] !== undefined) pruefeWerkzeug(s['werkzeug'], `${wo}.werkzeug`, 'id', f);

    if (MIT_ANTWORT.has(typ)) {
      pruefeAntwort(s['antwort'], typ, wo, f);
      if (istObjekt(s['antwort']))
        for (const fv of fvsDerAntwort(s['antwort']))
          if (!kontext.fehlvorstellungen.has(fv))
            f.push(`${wo}: Fehlvorstellung ${fv} fehlt im Katalog`);
    } else if (s['antwort'] !== undefined) f.push(`${wo}: ${typ} hat keine antwort`);

    if (typ === 'uebergang') {
      if (i !== schritte.length - 1) f.push(`${wo}: uebergang muss der letzte Schritt sein`);
      if (s['weiter'] !== undefined) f.push(`${wo}: uebergang hat kein weiter`);
      const vorlagen = s['vorlagen'];
      if (!Array.isArray(vorlagen) || vorlagen.length === 0)
        f.push(`${wo}: uebergang braucht vorlagen`);
      else
        for (const v of vorlagen) {
          const vl = kontext.vorlagen.get(String(v));
          if (!vl || vl.kompetenz !== kid)
            f.push(`${wo}: Vorlage ${String(v)} gehört nicht zu ${kid}`);
          else if (!vl.niveaus.includes(niveau as Niveau))
            f.push(`${wo}: Vorlage ${String(v)} hat kein Niveau ${String(niveau)}`);
        }
      if (!Number.isInteger(s['anzahl']) || (s['anzahl'] as number) < 1)
        f.push(`${wo}: anzahl fehlt`);
    } else {
      if (typeof s['weiter'] !== 'string' || !ids.has(s['weiter']))
        f.push(`${wo}: weiter zeigt auf keinen Schritt`);
    }

    const bei = s['bei'];
    if (bei !== undefined) {
      if (!MIT_ANTWORT.has(typ)) f.push(`${wo}: bei nur bei Schritten mit antwort`);
      if (!istObjekt(bei)) f.push(`${wo}: bei ist keine Zuordnung`);
      else
        for (const [wenn, ziel] of Object.entries(bei)) {
          if (wenn !== 'sonst' && !kontext.fehlvorstellungen.has(wenn))
            f.push(`${wo}: bei ${wenn} ist keine Fehlvorstellung`);
          if (typeof ziel !== 'string' || (!ids.has(ziel) && !voraussetzungen.has(ziel)))
            f.push(`${wo}: bei ${wenn} zeigt weder auf einen Schritt noch auf eine Voraussetzung`);
        }
    }
  });

  if (schritte[0]?.['typ'] !== 'ziel') f.push('der erste Schritt muss ziel sein');
  if (schritte.filter((s) => s['typ'] === 'uebergang').length !== 1)
    f.push('genau ein uebergang nötig');
  for (const typ of PFLICHT)
    if (!schritte.some((s) => s['typ'] === typ)) f.push(`es fehlt ein Schritt ${typ} (V4–V6)`);

  // Wege: alles vom Start erreichbar; von überall führt weiter zum uebergang
  const nachfolger = (s: Record<string, unknown>) => [
    ...(typeof s['weiter'] === 'string' ? [s['weiter']] : []),
    ...(istObjekt(s['bei']) ? Object.values(s['bei']).map(String) : []),
  ];
  const start = schritte[0]?.['id'];
  if (typeof start === 'string' && f.length === 0) {
    const erreicht = new Set<string>([start]);
    const offen = [start];
    while (offen.length > 0) {
      const s = ids.get(offen.pop() ?? '');
      for (const n of s ? nachfolger(s) : [])
        if (ids.has(n) && !erreicht.has(n)) {
          erreicht.add(n);
          offen.push(n);
        }
    }
    for (const id of ids.keys()) if (!erreicht.has(id)) f.push(`${id}: vom Start nicht erreichbar`);
    for (const id of ids.keys()) {
      const gesehen = new Set<string>();
      let jetzt: string | undefined = id;
      while (jetzt && !gesehen.has(jetzt) && ids.get(jetzt)?.['typ'] !== 'uebergang') {
        gesehen.add(jetzt);
        const w: unknown = ids.get(jetzt)?.['weiter'];
        jetzt = typeof w === 'string' ? w : undefined;
      }
      if (!jetzt || ids.get(jetzt)?.['typ'] !== 'uebergang')
        f.push(`${id}: über weiter kein Weg zum uebergang`);
    }
  }
  return f;
}
