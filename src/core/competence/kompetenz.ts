/**
 * Kompetenzen und ihre Prüfung (LEHRPLAN §3, INHALTSFORMAT §3).
 *
 * Rein und ohne Datei- oder Browserzugriff: Werkzeuge lesen die YAML-Dateien
 * und reichen die Daten herein; später nutzt die App dieselbe Prüfung für
 * geladene Inhaltspakete.
 */
import type { Sprachobjekt } from '../learning/generator';

export type Niveau = 'G' | 'M' | 'E';
export type Schulart = 'oberschule' | 'gymnasium';

export interface LehrplanBezug {
  readonly klassenstufe: number;
  readonly lernbereich: string;
}

export interface Kompetenz {
  readonly id: string;
  readonly fach: string;
  readonly bereich: string;
  readonly feld: string;
  readonly titel: Sprachobjekt;
  readonly kann_satz: Sprachobjekt;
  readonly klassenstufe_typisch: readonly number[];
  readonly voraussetzungen: readonly string[];
  readonly niveaus: Readonly<Partial<Record<Niveau, { readonly beschreibung: Sprachobjekt }>>>;
  readonly kmk: { readonly leitidee: string; readonly prozesse: readonly string[] };
  readonly anforderungsbereiche: readonly string[];
  readonly abdeckung: 'generator' | 'handverfasst' | 'gemischt';
  /** Zeichnen/Konstruieren wird erklärt, nicht bewertet (LEHRPLAN L-10). */
  readonly zeichnen_erklaert?: boolean;
  /** Lehrplanbezug Sachsen je Schulart (LEHRPLAN L-9). */
  readonly sachsen: Readonly<Partial<Record<Schulart, LehrplanBezug>>>;
  readonly version: number;
}

/** Kürzel im ID-Schema ↔ Ordnername (INHALTSFORMAT §2). */
export const BEREICHE: Readonly<Record<string, { slug: string; leitidee: string }>> = {
  ZO: { slug: 'zahl-und-operation', leitidee: 'L1' },
  GM: { slug: 'groessen-und-messen', leitidee: 'L2' },
  SF: { slug: 'strukturen-und-funktionaler-zusammenhang', leitidee: 'L3' },
  RF: { slug: 'raum-und-form', leitidee: 'L4' },
  DZ: { slug: 'daten-und-zufall', leitidee: 'L5' },
};

export const FELDER: Readonly<Record<string, string>> = {
  NZ: 'natuerliche-zahlen',
  TB: 'teilbarkeit',
  BR: 'brueche-und-dezimalzahlen',
  GR: 'groessen',
  GF: 'geometrische-grundformen',
  SY: 'symmetrie',
  FL: 'flaechen',
  KP: 'koerper',
  DA: 'daten',
  ZU: 'zuordnungen',
  ZF: 'zufall',
  DV: 'dreiecke-und-vierecke',
  RZ: 'rationale-zahlen',
  GL: 'gleichungen',
  PZ: 'prozent-und-zins',
  KR: 'kreis',
  TU: 'terme',
  FK: 'funktionen',
  GS: 'gleichungssysteme',
  AE: 'aehnlichkeit',
};

const ID_MUSTER = /^M\.([A-Z]{2})\.([A-Z]{2})\.[A-Z0-9]+(?:-[A-Z0-9]+)*$/;
const NIVEAUS: readonly string[] = ['G', 'M', 'E'];
const PROZESSE = /^K[1-6]$/;
const ABS: readonly string[] = ['I', 'II', 'III'];

function istSprachobjekt(x: unknown): x is Sprachobjekt {
  return (
    typeof x === 'object' &&
    x !== null &&
    typeof (x as { de?: unknown }).de === 'string' &&
    (x as { de: string }).de.trim() !== ''
  );
}

function istObjekt(x: unknown): x is Record<string, unknown> {
  return typeof x === 'object' && x !== null && !Array.isArray(x);
}

/**
 * Prüft eine einzelne, aus YAML gelesene Kompetenz.
 * @param pfadTeile Ordner unterhalb des Fachs: [bereich-slug, feld-slug, id]
 * @returns Liste der Fehler; leer, wenn alles stimmt.
 */
export function pruefeKompetenz(daten: unknown, pfadTeile?: readonly string[]): string[] {
  if (!istObjekt(daten)) return ['keine YAML-Zuordnung (Objekt) gefunden'];
  const f: string[] = [];
  const d = daten;
  const id = typeof d['id'] === 'string' ? d['id'] : '';
  const treffer = ID_MUSTER.exec(id);
  if (!treffer) f.push(`id „${id}“ entspricht nicht dem Schema M.BEREICH.FELD.NAME`);
  const bereichKz = treffer?.[1] ?? '';
  const feldKz = treffer?.[2] ?? '';
  const bereich = BEREICHE[bereichKz];
  const feld = FELDER[feldKz];
  if (treffer && !bereich) f.push(`unbekannter Bereich ${bereichKz}`);
  if (treffer && !feld) f.push(`unbekanntes Feld ${feldKz}`);

  if (d['fach'] !== 'mathematik') f.push('fach muss „mathematik“ sein');
  if (bereich && d['bereich'] !== bereich.slug) f.push(`bereich muss „${bereich.slug}“ sein`);
  if (feld && d['feld'] !== feld) f.push(`feld muss „${feld}“ sein`);
  if (pfadTeile && bereich && feld) {
    const erwartet = [bereich.slug, feld, id].join('/');
    if (pfadTeile.join('/') !== erwartet)
      f.push(`liegt im falschen Ordner, erwartet …/${erwartet}/`);
  }

  if (!istSprachobjekt(d['titel'])) f.push('titel fehlt oder ist kein Sprachobjekt { de: … }');
  if (!istSprachobjekt(d['kann_satz'])) f.push('kann_satz fehlt oder ist kein Sprachobjekt');
  else if (!(d['kann_satz'] as Sprachobjekt).de.startsWith('Ich kann')) {
    f.push('kann_satz beginnt nicht mit „Ich kann“');
  }

  const stufen = d['klassenstufe_typisch'];
  if (
    !Array.isArray(stufen) ||
    stufen.length === 0 ||
    !stufen.every((s) => Number.isInteger(s) && s >= 5 && s <= 13)
  ) {
    f.push('klassenstufe_typisch muss eine Liste von Klassenstufen 5–13 sein');
  }

  const vor = d['voraussetzungen'];
  if (!Array.isArray(vor) || !vor.every((v) => typeof v === 'string')) {
    f.push('voraussetzungen muss eine Liste von IDs sein');
  } else if (vor.includes(id)) f.push('Kompetenz setzt sich selbst voraus');

  const niv = d['niveaus'];
  if (!istObjekt(niv) || Object.keys(niv).length === 0) f.push('niveaus fehlt');
  else {
    for (const [n, inhalt] of Object.entries(niv)) {
      if (!NIVEAUS.includes(n)) f.push(`unbekanntes Niveau ${n}`);
      if (!istObjekt(inhalt) || !istSprachobjekt(inhalt['beschreibung'])) {
        f.push(`Niveau ${n}: beschreibung fehlt`);
      }
    }
  }

  const kmk = d['kmk'];
  if (!istObjekt(kmk)) f.push('kmk fehlt');
  else {
    if (bereich && kmk['leitidee'] !== bereich.leitidee) {
      f.push(`kmk.leitidee muss zum Bereich passen (${bereich.leitidee})`);
    }
    const p = kmk['prozesse'];
    if (
      !Array.isArray(p) ||
      p.length === 0 ||
      !p.every((x) => typeof x === 'string' && PROZESSE.test(x))
    ) {
      f.push('kmk.prozesse muss eine Liste aus K1–K6 sein');
    }
  }

  const ab = d['anforderungsbereiche'];
  if (!Array.isArray(ab) || ab.length === 0 || !ab.every((x) => ABS.includes(x as string))) {
    f.push('anforderungsbereiche muss eine Liste aus I, II, III sein');
  }
  if (!['generator', 'handverfasst', 'gemischt'].includes(d['abdeckung'] as string)) {
    f.push('abdeckung muss generator, handverfasst oder gemischt sein');
  }
  if (d['zeichnen_erklaert'] !== undefined && typeof d['zeichnen_erklaert'] !== 'boolean') {
    f.push('zeichnen_erklaert muss true oder false sein');
  }

  const sachsen = d['sachsen'];
  if (!istObjekt(sachsen) || Object.keys(sachsen).length === 0) {
    f.push('sachsen fehlt (Lehrplanbezug, LEHRPLAN L-9)');
  } else {
    for (const [art, bezug] of Object.entries(sachsen)) {
      if (art !== 'oberschule' && art !== 'gymnasium')
        f.push(`sachsen: unbekannte Schulart ${art}`);
      if (
        !istObjekt(bezug) ||
        !Number.isInteger(bezug['klassenstufe']) ||
        typeof bezug['lernbereich'] !== 'string' ||
        !/^LB \d+ /.test(bezug['lernbereich'])
      ) {
        f.push(`sachsen.${art}: braucht klassenstufe und lernbereich („LB n Titel“)`);
      }
    }
  }

  if (!Number.isInteger(d['version']) || (d['version'] as number) < 1)
    f.push('version muss ≥ 1 sein');
  return f;
}

/**
 * Prüft den Graphen: Voraussetzungen existieren, keine Kreise.
 * @returns Liste der Fehler; leer, wenn alles stimmt.
 */
export function pruefeGraph(
  kompetenzen: readonly Pick<Kompetenz, 'id' | 'voraussetzungen'>[],
): string[] {
  const f: string[] = [];
  const nachId = new Map<string, Pick<Kompetenz, 'id' | 'voraussetzungen'>>();
  for (const k of kompetenzen) {
    if (nachId.has(k.id)) f.push(`${k.id}: doppelt vorhanden`);
    nachId.set(k.id, k);
  }
  for (const k of kompetenzen) {
    for (const v of k.voraussetzungen) {
      if (!nachId.has(v)) f.push(`${k.id}: Voraussetzung ${v} existiert nicht`);
    }
  }

  // Kreise finden: Tiefensuche mit Farben (0 = neu, 1 = in Arbeit, 2 = fertig).
  const farbe = new Map<string, number>();
  const besuche = (id: string, weg: string[]): void => {
    farbe.set(id, 1);
    for (const v of nachId.get(id)?.voraussetzungen ?? []) {
      if (!nachId.has(v)) continue;
      if (farbe.get(v) === 1)
        f.push(`Kreis in den Voraussetzungen: ${[...weg, id, v].join(' → ')}`);
      else if (!farbe.get(v)) besuche(v, [...weg, id]);
    }
    farbe.set(id, 2);
  };
  for (const k of kompetenzen) if (!farbe.get(k.id)) besuche(k.id, []);
  return f;
}

/**
 * Reihenfolge entlang des Graphen (K-15): erst Kompetenzen ohne Voraussetzungen,
 * dann nach Länge der längsten Voraussetzungskette; bei Gleichstand bleibt die
 * gegebene Reihenfolge. Setzt einen kreisfreien Graphen voraus (pruefeGraph).
 */
export function nachGraph<K extends Pick<Kompetenz, 'id' | 'voraussetzungen'>>(
  kompetenzen: readonly K[],
): K[] {
  const nachId = new Map(kompetenzen.map((k) => [k.id, k]));
  const tiefe = new Map<string, number>();
  const tiefeVon = (id: string): number => {
    const bekannt = tiefe.get(id);
    if (bekannt !== undefined) return bekannt;
    const vor = (nachId.get(id)?.voraussetzungen ?? []).filter((v) => nachId.has(v));
    const t = vor.length === 0 ? 0 : 1 + Math.max(...vor.map(tiefeVon));
    tiefe.set(id, t);
    return t;
  };
  return kompetenzen
    .map((k, i) => ({ k, i, t: tiefeVon(k.id) }))
    .sort((a, b) => a.t - b.t || a.i - b.i)
    .map((x) => x.k);
}
