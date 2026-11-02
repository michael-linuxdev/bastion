/**
 * Prüfbogen für die fachliche Prüfung (INHALTSFORMAT §8, Stufe 2) als Daten: Erstvermittlungen
 * Schritt für Schritt (Teil A), die Fehlvorstellungen, auf die sie zeigen (B), die Vorlagen mit
 * Stichprobe je Niveau (C) und die markierten Fachbegriffe (D). Dazu die Bewertung der
 * prüfenden Person und ihr Export für `pnpm pruefbogen einlesen`.
 *
 * Rein und deterministisch: alle Inhalte und Generatoren werden hereingereicht, die Stichprobe
 * nutzt die Seeds 1 … n. Kein HTML, keine Browser-API: Den Satz machen `pnpm pruefbogen`
 * (tools/pruefbogen/bogen.ts, Druck) und der Elternbereich der App (src/ui/eltern/Pruefen.svelte)
 * je für sich. Die Prüffragen stehen als Texte in der Textdatei (`pruefen.frage.*`).
 */
import type { Kompetenz, Niveau } from '../competence/kompetenz';
import type { Begriff } from './begriffe';
import type { Fehlvorstellung } from './fehlvorstellung';
import type { Generator, Instanz, Loesung, Wert } from './generator';
import type { Schritt, Vermittlung } from './vermittlung';
import type { GeneratorVorlage } from './vorlage';
import { musterweg } from './zwischenschritte';

/** Aufgaben je Vorlage und Niveau (INHALTSFORMAT §8, Stufe 2) */
export const STICHPROBE = 20;

export interface PruefEingabe {
  /** Die zu prüfenden Kompetenzen, in dieser Reihenfolge */
  readonly kompetenzen: readonly Kompetenz[];
  /** Alle Kompetenzen, für Titel in Rückwegen */
  readonly alleKompetenzen: ReadonlyMap<string, Kompetenz>;
  readonly vermittlungen: ReadonlyMap<string, Vermittlung>;
  readonly vorlagen: readonly GeneratorVorlage[];
  readonly fehlvorstellungen: ReadonlyMap<string, Fehlvorstellung>;
  readonly begriffe: readonly Begriff[];
  readonly generatoren: ReadonlyMap<string, Generator<unknown>>;
  /** Aufgaben je Vorlage und Niveau, sonst STICHPROBE */
  readonly stichprobe?: number;
}

/** Teile des Bogens und die Zahl ihrer Prüffragen (Texte `pruefen.frage.<Teil><Nr>`, ab 1) */
export const FRAGEN = { A: 8, B: 4, C: 4, D: 2 } as const;
export type Teil = keyof typeof FRAGEN;

/** Wohin eine Antwort oder ein Rückweg führt, lesbar gemacht. */
export type Verweis =
  | { readonly art: 'weiter' }
  /** Schritt derselben Erstvermittlung */
  | { readonly art: 'schritt'; readonly nr: number }
  /** Schritt einer anderen Erstvermittlung; `nr` fehlt, wenn sie nicht im Bogen steht */
  | {
      readonly art: 'erstvermittlung';
      readonly titel: string;
      readonly schritt: string;
      readonly nr?: number;
    }
  | { readonly art: 'voraussetzung'; readonly titel: string }
  | { readonly art: 'unbekannt'; readonly text: string };

export interface AntwortZeile {
  readonly wert: string;
  readonly richtig: boolean;
  /** Antwort zum Eintippen (Wert ist roher Text) statt Auswahl-Option (Wert mit Markierungen) */
  readonly eingabe: boolean;
  readonly fv?: string;
  /** nur bei falschen Antworten mit Fehlvorstellung */
  readonly ziel?: Verweis;
}

export interface SchrittZeile {
  /** Nummer im Bogen, ab 1 (Feld `s<nr>` und `k<nr>` der Bewertung) */
  readonly nr: number;
  readonly schritt: Schritt;
  readonly antworten: readonly AntwortZeile[];
  /** Ziel für jede andere falsche Antwort (`bei.sonst`) */
  readonly sonst?: Verweis;
}

export interface AbschnittA {
  readonly teil: 'A';
  readonly id: string;
  readonly kompetenz: Kompetenz;
  readonly vermittlung?: Vermittlung;
  readonly schritte: readonly SchrittZeile[];
}

/** Rückmeldung einer Vorlage, unter der die kurze Erklärung einer Fehlvorstellung erscheint */
export interface Rueckmeldung {
  readonly vorlage: string;
  readonly schritt?: string;
  readonly fehlerbild: string;
  readonly text: string;
}

export interface AbschnittB {
  readonly teil: 'B';
  readonly id: string;
  readonly fv: Fehlvorstellung;
  readonly rueckmeldungen: readonly Rueckmeldung[];
  readonly rueckweg: { readonly erklaerung: Verweis; readonly voraussetzung?: Verweis };
}

export interface WegZeile {
  readonly id: string;
  /** Frage mit Platzhaltern; `platzhalter` füllt sie */
  readonly frage?: string;
  readonly platzhalter: Readonly<Record<string, Wert>>;
  readonly loesung: Loesung;
  readonly falsch: readonly { readonly id: string; readonly antwort: Loesung }[];
}

export interface NiveauStichprobe {
  readonly niveau: Niveau;
  /** Aufgabe Nr. i hat den Seed i (Feld `<Niveau><Nr>` der Bewertung) */
  readonly aufgaben: readonly Instanz[];
  /** Zwischenschritte am Beispiel der ersten Aufgabe */
  readonly weg?: { readonly beispiel: Instanz; readonly zeilen: readonly WegZeile[] };
}

export interface AbschnittC {
  readonly teil: 'C';
  readonly id: string;
  readonly vorlage: GeneratorVorlage;
  /** leer, wenn der Generator fehlt */
  readonly niveaus: readonly NiveauStichprobe[];
  readonly generatorFehlt: boolean;
}

export interface AbschnittD {
  readonly teil: 'D';
  readonly id: 'D-begriffe';
  /** Begriff Nr. i ist Feld `b<i>` der Bewertung */
  readonly begriffe: readonly Begriff[];
}

export type Abschnitt = AbschnittA | AbschnittB | AbschnittC | AbschnittD;

export interface Pruefbogen {
  readonly a: readonly AbschnittA[];
  readonly b: readonly AbschnittB[];
  readonly c: readonly AbschnittC[];
  readonly d: AbschnittD;
}

type Nummern = ReadonlyMap<string, ReadonlyMap<string, number>>;

/** Verweis (`schritt`, `KOMPETENZ#schritt` oder `KOMPETENZ`) lesbar machen. */
export function verweis(
  e: Pick<PruefEingabe, 'alleKompetenzen'>,
  nummern: Nummern,
  ziel: string,
  eigene?: string,
): Verweis {
  const [kid, sid] = ziel.includes('#') ? ziel.split('#') : [undefined, ziel];
  if (kid === undefined && eigene !== undefined) {
    const nr = nummern.get(eigene)?.get(sid ?? '');
    if (nr !== undefined) return { art: 'schritt', nr };
  }
  const kompetenz = e.alleKompetenzen.get(kid ?? sid ?? '');
  if (kid !== undefined && kompetenz) {
    const nr = nummern.get(kid)?.get(sid ?? '');
    return {
      art: 'erstvermittlung',
      titel: kompetenz.titel.de,
      schritt: sid ?? '',
      ...(nr !== undefined ? { nr } : {}),
    };
  }
  if (kompetenz) return { art: 'voraussetzung', titel: kompetenz.titel.de };
  return { art: 'unbekannt', text: ziel };
}

/** Fehlvorstellungen in der Reihenfolge, in der die Kompetenzen und ihre Dateien sie nennen. */
export function genannteFehlvorstellungen(e: PruefEingabe): string[] {
  const ids = new Set<string>();
  const sammle = (x: unknown) => {
    for (const m of JSON.stringify(x ?? null).matchAll(/FV\.[A-Z]{2}\.[A-Z0-9-]+/g)) ids.add(m[0]);
  };
  for (const komp of e.kompetenzen) {
    sammle(e.vermittlungen.get(komp.id));
    for (const v of e.vorlagen) if (v.kompetenz === komp.id) sammle(v);
  }
  return [...ids].filter((id) => e.fehlvorstellungen.has(id));
}

/** Fachbegriffe, die in den Texten der gewählten Kompetenzen markiert sind. */
export function genannteBegriffe(e: PruefEingabe, fvIds: readonly string[]): Begriff[] {
  const roh = JSON.stringify([
    ...e.kompetenzen.map((k) => e.vermittlungen.get(k.id)),
    ...vorlagenVon(e),
    ...fvIds.map((id) => e.fehlvorstellungen.get(id)),
  ]);
  const formen = new Set([...roh.matchAll(/\[\[([^\]]+)\]\]/g)].map((m) => m[1]));
  return e.begriffe.filter((b) => b.formen.some((f) => formen.has(f)));
}

/** Vorlagen mit Generator der gewählten Kompetenzen, in deren Reihenfolge. */
const vorlagenVon = (e: PruefEingabe) =>
  e.kompetenzen.flatMap((k) =>
    e.vorlagen.filter((v) => v.kompetenz === k.id && v.quelle === 'generator'),
  );

function schrittZeile(
  e: PruefEingabe,
  nummern: Nummern,
  kid: string,
  s: Schritt,
  nr: number,
): SchrittZeile {
  const zurueck = (fv: string): Verweis => {
    const z = s.bei?.[fv];
    return z ? verweis(e, nummern, z, kid) : { art: 'weiter' };
  };
  const antworten: AntwortZeile[] = [];
  if (s.antwort && 'optionen' in s.antwort) {
    for (const o of s.antwort.optionen)
      antworten.push({
        wert: o.wert.de,
        richtig: o.richtig === true,
        eingabe: false,
        ...(o.fv ? { fv: o.fv, ziel: zurueck(o.fv) } : {}),
      });
  } else if (s.antwort) {
    const ein = s.antwort.eingabe;
    antworten.push({ wert: ein.loesung, richtig: true, eingabe: true });
    for (const f of ein.fehler ?? [])
      antworten.push({
        wert: f.wert,
        richtig: false,
        eingabe: true,
        fv: f.fv,
        ziel: zurueck(f.fv),
      });
  }
  const sonst = s.bei?.['sonst'];
  return {
    nr,
    schritt: s,
    antworten,
    ...(sonst ? { sonst: verweis(e, nummern, sonst, kid) } : {}),
  };
}

function rueckmeldungenZu(e: PruefEingabe, fvId: string): Rueckmeldung[] {
  return e.vorlagen.flatMap((v) => [
    ...Object.entries(v.fehlerbilder)
      .filter(([, f]) => f.fv === fvId)
      .map(([id, f]) => ({ vorlage: v.id, fehlerbild: id, text: f.de })),
    ...(v.schritte ?? []).flatMap((s) =>
      Object.entries(s.fehlerbilder)
        .filter(([, f]) => f.fv === fvId)
        .map(([id, f]) => ({ vorlage: v.id, schritt: s.id, fehlerbild: id, text: f.de })),
    ),
  ]);
}

function weg(v: GeneratorVorlage, g: Generator<unknown>, niveau: Niveau): NiveauStichprobe['weg'] {
  if (!v.schritte) return undefined;
  const parameter = v.parameter[niveau];
  const beispiel = g.erzeuge(1, parameter);
  const pfad = musterweg(
    g,
    1,
    parameter,
    v.schritte.map((x) => x.id),
  );
  const bisher: Record<string, Wert> = {};
  const zeilen = pfad.map(({ id, aufgabe }): WegZeile => {
    const s = v.schritte?.find((x) => x.id === id);
    const platzhalter = { ...beispiel.platzhalter, ...aufgabe.platzhalter, ...bisher };
    const l = aufgabe.loesung;
    if (l.typ === 'bruch' || l.typ === 'zahl') bisher[id] = l.wert;
    return {
      id,
      ...(s ? { frage: s.frage.de } : {}),
      platzhalter,
      loesung: l,
      falsch: aufgabe.fehlerbilder.map((f) => ({ id: f.id, antwort: f.antwort })),
    };
  });
  return { beispiel, zeilen };
}

/** Den Bogen zu den gewählten Kompetenzen zusammenstellen. */
export function pruefbogenModell(e: PruefEingabe): Pruefbogen {
  const n = e.stichprobe ?? STICHPROBE;
  const nummern: Nummern = new Map(
    [...e.vermittlungen].map(([id, v]) => [id, new Map(v.schritte.map((s, i) => [s.id, i + 1]))]),
  );
  const a = e.kompetenzen.map((kompetenz): AbschnittA => {
    const v = e.vermittlungen.get(kompetenz.id);
    return {
      teil: 'A',
      id: `A-${kompetenz.id}`,
      kompetenz,
      ...(v ? { vermittlung: v } : {}),
      schritte: (v?.schritte ?? []).map((s, i) => schrittZeile(e, nummern, kompetenz.id, s, i + 1)),
    };
  });
  const fvIds = genannteFehlvorstellungen(e);
  const b = fvIds.flatMap((id): AbschnittB[] => {
    const fv = e.fehlvorstellungen.get(id);
    if (!fv) return [];
    const vor = fv.rueckweg.voraussetzung;
    return [
      {
        teil: 'B',
        id: `B-${fv.id}`,
        fv,
        rueckmeldungen: rueckmeldungenZu(e, fv.id),
        rueckweg: {
          erklaerung: verweis(e, nummern, fv.rueckweg.vermittlung),
          ...(vor ? { voraussetzung: verweis(e, nummern, vor) } : {}),
        },
      },
    ];
  });
  const c = vorlagenVon(e).map((vorlage): AbschnittC => {
    const g = e.generatoren.get(vorlage.generator);
    const niveaus = g
      ? vorlage.niveaus.map((niveau): NiveauStichprobe => {
          const w = weg(vorlage, g, niveau);
          return {
            niveau,
            aufgaben: Array.from({ length: n }, (_, i) =>
              g.erzeuge(i + 1, vorlage.parameter[niveau]),
            ),
            ...(w ? { weg: w } : {}),
          };
        })
      : [];
    return { teil: 'C', id: `C-${vorlage.id}`, vorlage, niveaus, generatorFehlt: !g };
  });
  return { a, b, c, d: { teil: 'D', id: 'D-begriffe', begriffe: genannteBegriffe(e, fvIds) } };
}

/** Alle Abschnitte in Bogen-Reihenfolge */
export const abschnitte = (p: Pruefbogen): readonly Abschnitt[] => [...p.a, ...p.b, ...p.c, p.d];

// ---------------------------------------------------------------------------------------------
// Bewertung: je Abschnitt ein Satz Werte, dazu `kopf` (Name, Schule, Gesamturteil).
// Felder: f<i> Prüffrage abgehakt (ab 0) · urteil · notiz · s<nr> und k<nr> Urteil und
// Kommentar je Schritt (Teil A) · <Niveau><nr> Aufgabe stimmt (Teil C) · b<nr> Begriff stimmt.
// Diese Form liest `pnpm pruefbogen einlesen` (tools/pruefbogen/einlesen.ts).

export const KOPF = 'kopf';
export const URTEILE = ['passt', 'aendern', 'falsch'] as const;
export type Urteil = (typeof URTEILE)[number];
export const SCHRITT_URTEILE = ['passt', 'nicht'] as const;

export type Werte = Readonly<Record<string, string | boolean>>;
export type Bewertung = Readonly<Record<string, Werte>>;

/** Gültige Abschnitts- und Feldnamen: wie Datenbank-Pfade, ohne Schrägstrich */
const NAME = /^[A-Za-z0-9_\-.~:@+]{1,200}$/;

/** Werte aus einer unbekannten Quelle (Speicher) übernehmen, Fremdes verwerfen. */
export function werteAus(roh: unknown): Werte {
  if (typeof roh !== 'object' || roh === null || Array.isArray(roh)) return {};
  const werte: Record<string, string | boolean> = {};
  for (const [k, v] of Object.entries(roh))
    if (NAME.test(k) && (typeof v === 'boolean' || (typeof v === 'string' && v.length <= 20_000)))
      werte[k] = v;
  return werte;
}

export const gueltigerAbschnitt = (id: string): boolean => id === KOPF || NAME.test(id);

/** Ein Feld setzen; leerer Text und `false` entfernen es. */
export function setze(
  b: Bewertung,
  abschnitt: string,
  feld: string,
  wert: string | boolean,
): Bewertung {
  const ohne = Object.entries(b[abschnitt] ?? {}).filter(([k]) => k !== feld);
  const leer = wert === false || wert === '';
  return { ...b, [abschnitt]: Object.fromEntries(leer ? ohne : [...ohne, [feld, wert]]) };
}

/** Wie viele der Abschnitte ein Urteil haben */
export const beurteilt = (b: Bewertung, ids: readonly string[]): number =>
  ids.filter((id) => URTEILE.includes(b[id]?.['urteil'] as Urteil)).length;

export interface ExportDokument {
  readonly id: string;
  readonly data: { readonly werte: Werte; readonly stand: string };
}

/**
 * Export für `pnpm pruefbogen einlesen`: ein Dokument je Abschnitt mit Eingaben, `kopf` zuerst.
 * `stand` ist der Zeitpunkt der letzten Änderung je Abschnitt (ISO 8601).
 */
export function exportDokumente(
  b: Bewertung,
  stand: Readonly<Record<string, string>>,
): ExportDokument[] {
  return Object.keys(b)
    .filter((id) => gueltigerAbschnitt(id) && Object.keys(b[id] ?? {}).length > 0)
    .sort((x, y) => (x === KOPF ? -1 : y === KOPF ? 1 : x < y ? -1 : x > y ? 1 : 0))
    .map((id) => ({ id, data: { werte: b[id] ?? {}, stand: stand[id] ?? '' } }));
}

/** Einstellung `pruefen.<Abschnitt>`: Werte eines Abschnitts als JSON-Text (Ereignis `einstellung`). */
export const PRUEF_PRAEFIX = 'pruefen.';

/**
 * Bewertung aus den Einstellungs-Ereignissen: je Abschnitt gilt das jüngste Ereignis
 * (DATENMODELL §7.3), `stand` ist sein Zeitpunkt. Unlesbares wird übergangen.
 */
export function bewertungAus(
  ereignisse: readonly {
    readonly schluessel: string;
    readonly wert: unknown;
    readonly ts: number;
  }[],
): { readonly bewertung: Bewertung; readonly stand: Readonly<Record<string, string>> } {
  const juengste = new Map<string, { wert: unknown; ts: number }>();
  for (const e of ereignisse) {
    if (!e.schluessel.startsWith(PRUEF_PRAEFIX)) continue;
    const id = e.schluessel.slice(PRUEF_PRAEFIX.length);
    const alt = juengste.get(id);
    if (gueltigerAbschnitt(id) && (!alt || e.ts >= alt.ts)) juengste.set(id, e);
  }
  const bewertung: Record<string, Werte> = {};
  const stand: Record<string, string> = {};
  for (const [id, { wert, ts }] of juengste) {
    let roh: unknown;
    try {
      roh = typeof wert === 'string' ? JSON.parse(wert) : undefined;
    } catch {
      continue;
    }
    bewertung[id] = werteAus(roh);
    stand[id] = new Date(ts).toISOString();
  }
  return { bewertung, stand };
}
