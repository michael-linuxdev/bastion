// Einheitentafel (VERMITTLUNG §2.3, Werkzeug einheitentafel@1): eine Stellenwerttafel für
// Größen. Jede Einheit hat so viele Spalten, wie ihre Umrechnungszahl Nullen hat (Länge: km und
// m je drei, dm, cm, mm je eine; Fläche je zwei; Volumen je drei). Eine Größe wird eingetragen,
// das Komma steht hinter der Einerspalte der Einheit, in der man liest. Interaktiv wählt ein
// Knopf je Einheit, wo das Komma steht; fehlende Stellen werden mit 0 gefüllt.
// Reine Logik; die Darstellung ist Einheitentafel.svelte.
import type { Bild } from '../../../core/learning/generator';
import { zahlDeutsch } from '../../../core/learning/format';
import { bild, linie, rechteck, text } from '../../../generators/svg';
import { t, type TextSchluessel } from '../../texte/texte';

export interface EinheitentafelParameter {
  /** laenge, masse, geld, flaeche oder volumen (Standard laenge) */
  readonly groesse?: unknown;
  /** gezeigte Einheiten, zusammenhängend und in der Reihenfolge der Tafel (Standard je Größe) */
  readonly einheiten?: unknown;
  /** eingetragene Maßzahl, etwa '3,45' oder 2500 */
  readonly wert?: unknown;
  /** Einheit der Maßzahl (bei Volumen auch l und ml) */
  readonly einheit?: unknown;
  /** Einheit, in der gelesen wird: Komma dahinter, ergänzte Nullen, Zeile „3,45 m = 345 cm“ */
  readonly ziel?: unknown;
}

export const GROESSEN = ['laenge', 'masse', 'geld', 'flaeche', 'volumen'] as const;
export type Groesse = (typeof GROESSEN)[number];

interface Einheit {
  readonly name: string;
  /** Spalten der Einheit (Nullen der Umrechnungszahl zur nächstkleineren) */
  readonly stellen: number;
  /** anderer Name derselben Spalte, etwa l für dm³ */
  readonly auch?: string;
}

const TAFELN: Readonly<Record<Groesse, readonly Einheit[]>> = {
  laenge: [
    { name: 'km', stellen: 3 },
    { name: 'm', stellen: 3 },
    { name: 'dm', stellen: 1 },
    { name: 'cm', stellen: 1 },
    { name: 'mm', stellen: 1 },
  ],
  masse: [
    { name: 't', stellen: 3 },
    { name: 'kg', stellen: 3 },
    { name: 'g', stellen: 3 },
    { name: 'mg', stellen: 3 },
  ],
  geld: [
    { name: '€', stellen: 3 },
    { name: 'ct', stellen: 2 },
  ],
  flaeche: [
    { name: 'km²', stellen: 2 },
    { name: 'ha', stellen: 2 },
    { name: 'a', stellen: 2 },
    { name: 'm²', stellen: 2 },
    { name: 'dm²', stellen: 2 },
    { name: 'cm²', stellen: 2 },
    { name: 'mm²', stellen: 2 },
  ],
  volumen: [
    { name: 'm³', stellen: 3 },
    { name: 'dm³', stellen: 3, auch: 'l' },
    { name: 'cm³', stellen: 3, auch: 'ml' },
    { name: 'mm³', stellen: 3 },
  ],
};

const STANDARD: Readonly<Record<Groesse, readonly string[]>> = {
  laenge: ['km', 'm', 'dm', 'cm', 'mm'],
  masse: ['t', 'kg', 'g'],
  geld: ['€', 'ct'],
  flaeche: ['m²', 'dm²', 'cm²', 'mm²'],
  volumen: ['m³', 'dm³', 'cm³', 'mm³'],
};

/** Eine Spalte der Tafel. */
export interface Spalte {
  /** Index der Einheit in `einheiten` */
  readonly einheit: number;
  /** H, Z, E oder leer (Einheit mit einer Spalte) */
  readonly stelle: string;
}

export interface Einheitentafel {
  readonly groesse: Groesse;
  readonly einheiten: readonly Einheit[];
  readonly spalten: readonly Spalte[];
  /** Ziffer je Spalte, null für leer */
  readonly ziffern: readonly (string | null)[];
  /** Index der Einheit der Maßzahl, wenn eine eingetragen ist */
  readonly einheit?: number;
  /** wie die Maßzahl angegeben war, als Text („3,45“) */
  readonly wert?: string;
  /** Name der Einheit, wie angegeben (bei Volumen auch l oder ml) */
  readonly name?: string;
  /** Index der Einheit, in der gelesen wird */
  readonly ziel?: number;
}

const STELLEN_NAMEN: Readonly<Record<number, readonly string[]>> = {
  1: [''],
  2: ['Z', 'E'],
  3: ['H', 'Z', 'E'],
};

function spaltenAus(einheiten: readonly Einheit[]): Spalte[] {
  return einheiten.flatMap((e, i) =>
    (STELLEN_NAMEN[e.stellen] ?? ['']).map((stelle) => ({ einheit: i, stelle })),
  );
}

/** Spalte der Einer einer Einheit (die letzte ihrer Spalten). */
export function einerSpalte(z: Pick<Einheitentafel, 'spalten'>, einheit: number): number {
  let letzte = -1;
  z.spalten.forEach((s, i) => {
    if (s.einheit === einheit) letzte = i;
  });
  return letzte;
}

const indexVon = (einheiten: readonly Einheit[], x: unknown): number =>
  typeof x === 'string' ? einheiten.findIndex((e) => e.name === x || e.auch === x) : -1;

function einheitenAus(groesse: Groesse, x: unknown): Einheit[] {
  const alle = TAFELN[groesse];
  const namen = Array.isArray(x) && x.length >= 2 ? x : STANDARD[groesse];
  const idx = namen.map((n) => alle.findIndex((e) => e.name === n));
  const zusammen = idx.every((i, k) => i >= 0 && (k === 0 || i === (idx[k - 1] ?? -2) + 1));
  const gewaehlt = zusammen
    ? idx
    : STANDARD[groesse].map((n) => alle.findIndex((e) => e.name === n));
  return gewaehlt.flatMap((i) => (alle[i] ? [alle[i]] : []));
}

export function einheitentafelAus(p: EinheitentafelParameter): Einheitentafel {
  const groesse: Groesse = GROESSEN.includes(p.groesse as Groesse)
    ? (p.groesse as Groesse)
    : 'laenge';
  const einheiten = einheitenAus(groesse, p.einheiten);
  const spalten = spaltenAus(einheiten);
  const leer = spalten.map((): string | null => null);
  const ziel = indexVon(einheiten, p.ziel);
  const basis: Einheitentafel = {
    groesse,
    einheiten,
    spalten,
    ziffern: leer,
    ...(ziel >= 0 ? { ziel } : {}),
  };
  const roh =
    typeof p.wert === 'number' && Number.isFinite(p.wert) && p.wert >= 0
      ? String(p.wert).replace('.', ',')
      : p.wert;
  const einheit = indexVon(einheiten, p.einheit);
  if (typeof roh !== 'string' || !/^\d{1,9}(,\d{1,9})?$/.test(roh) || einheit < 0) return basis;
  const [ganz = '', nach = ''] = roh.split(',');
  const e = einerSpalte(basis, einheit);
  const start = e - ganz.length + 1;
  if (start < 0 || e + nach.length >= spalten.length) return basis;
  const ziffern = [...leer];
  [...ganz].forEach((c, i) => (ziffern[start + i] = c));
  [...nach].forEach((c, i) => (ziffern[e + 1 + i] = c));
  return { ...basis, ziffern, einheit, wert: roh, name: String(p.einheit) };
}

/** Lesen in einer anderen Einheit (Index) oder ohne Komma (undefined). */
export function gelesenIn(z: Einheitentafel, ziel: number | undefined): Einheitentafel {
  const ohne: Einheitentafel = {
    groesse: z.groesse,
    einheiten: z.einheiten,
    spalten: z.spalten,
    ziffern: z.ziffern,
    ...(z.einheit !== undefined ? { einheit: z.einheit } : {}),
    ...(z.wert !== undefined ? { wert: z.wert } : {}),
    ...(z.name !== undefined ? { name: z.name } : {}),
  };
  return ziel !== undefined && ziel >= 0 && ziel < z.einheiten.length ? { ...ohne, ziel } : ohne;
}

export interface Lesung {
  /** Maßzahl deutsch, etwa „345“ oder „0,005“ */
  readonly zahl: string;
  /** Spalten, in denen eine 0 ergänzt wird */
  readonly ergaenzt: readonly number[];
}

/** Maßzahl in der Zieleinheit mit den ergänzten Nullen; undefined ohne Eintrag oder Ziel. */
export function lesung(z: Einheitentafel, ziel = z.ziel): Lesung | undefined {
  if (ziel === undefined || z.einheit === undefined) return undefined;
  const belegt = z.ziffern.flatMap((c, i) => (c === null ? [] : [i]));
  const erste = belegt[0];
  const letzte = belegt[belegt.length - 1];
  if (erste === undefined || letzte === undefined) return undefined;
  const e = einerSpalte(z, ziel);
  const ergaenzt: number[] = [];
  const ziffer = (i: number) => {
    const c = z.ziffern[i];
    if (c !== null && c !== undefined) return c;
    ergaenzt.push(i);
    return '0';
  };
  let ganz = '';
  for (let i = Math.min(erste, e); i <= e; i++) ganz += ziffer(i);
  let nach = '';
  for (let i = e + 1; i <= letzte; i++) nach += ziffer(i);
  // Nullen am Ende fallen weg (5000 m = 5 km), außer bei Geld (3,50 €).
  if (z.groesse !== 'geld') nach = nach.replace(/0+$/, '');
  const ganzText = zahlDeutsch(Number(ganz.replace(/^0+(?=\d)/, '')));
  return { zahl: nach ? `${ganzText},${nach}` : ganzText, ergaenzt };
}

const nameMit = (e: Einheit | undefined) => (e ? e.name : '');

/** Die eingetragene Größe als Text, etwa „3,45 m“ oder „1 l“. */
function eintragText(z: Einheitentafel): string {
  if (z.wert === undefined || z.einheit === undefined) return '';
  const [ganz = '', nach] = z.wert.split(',');
  const zahl = `${zahlDeutsch(Number(ganz))}${nach === undefined ? '' : `,${nach}`}`;
  return `${zahl} ${z.name ?? nameMit(z.einheiten[z.einheit])}`;
}

/**
 * „3,45 m = 345 cm“ (bei Volumen mit Liter: „… = 2,5 dm³ = 2,5 l“); in derselben Einheit nur
 * „3,45 m“. Undefined ohne Lesung.
 */
export function lesungText(z: Einheitentafel): string | undefined {
  const l = lesung(z);
  if (!l || z.ziel === undefined) return undefined;
  const ziel = z.einheiten[z.ziel];
  const teile = [eintragText(z), `${l.zahl} ${nameMit(ziel)}`];
  if (ziel?.auch) teile.push(`${l.zahl} ${ziel.auch}`);
  return [...new Set(teile)].join(' = ');
}

const STELLEN_WORT: Readonly<Record<string, TextSchluessel>> = {
  H: 'werkzeug.einheitentafel.hunderter',
  Z: 'werkzeug.einheitentafel.zehner',
  E: 'werkzeug.einheitentafel.einer',
};

function spaltenName(z: Einheitentafel, i: number): string {
  const s = z.spalten[i];
  if (!s) return '';
  const name = nameMit(z.einheiten[s.einheit]);
  const wort = STELLEN_WORT[s.stelle];
  return wort ? `${name} (${t(wort)})` : name;
}

/** Text für den Bildschirmleser: Spalten, Eintrag, Komma und ergänzte Nullen. */
export function beschreibung(z: Einheitentafel): string {
  const saetze = [
    `${t(`werkzeug.einheitentafel.tafel.${z.groesse}`)}: ${z.einheiten.map((e) => (e.auch ? `${e.name} (${e.auch})` : e.name)).join(', ')}.`,
  ];
  if (z.einheit !== undefined && z.wert !== undefined) {
    const eintraege = z.ziffern.flatMap((c, i) =>
      c === null ? [] : [`${c} ${t('werkzeug.einheitentafel.unter')} ${spaltenName(z, i)}`],
    );
    saetze.push(
      `${t('werkzeug.einheitentafel.eingetragen')} ${eintragText(z)}: ${eintraege.join(', ')}.`,
    );
  }
  const l = lesung(z);
  const text = lesungText(z);
  if (l && text && z.ziel !== undefined) {
    saetze.push(`${t('werkzeug.einheitentafel.komma')} ${nameMit(z.einheiten[z.ziel])}: ${text}.`);
    if (l.ergaenzt.length)
      saetze.push(
        `${t('werkzeug.einheitentafel.nullen')} ${l.ergaenzt.map((i) => spaltenName(z, i)).join(', ')}.`,
      );
  }
  return saetze.join(' ');
}

const BREITE = 340;

/** Bild der Tafel; `mitZeile` false lässt die Zeile „3,45 m = 345 cm“ weg (steht dann im Stand). */
export function einheitentafelBild(z: Einheitentafel, mitZeile = true): Bild {
  const n = z.spalten.length;
  const k = Math.min(48, (BREITE - 10) / n);
  const x0 = (BREITE - n * k) / 2;
  const mehrstellig = z.einheiten.some((e) => e.stellen > 1);
  const kopf = 28;
  const unter = mehrstellig ? 20 : 0;
  const zeile = 38;
  const y0 = 6;
  const yZiffern = y0 + kopf + unter;
  const l = lesung(z);
  const text2 = mitZeile ? lesungText(z) : undefined;
  const hoehe = yZiffern + zeile + (text2 ? 40 : 10);
  const teile: string[] = [];
  const eZiel = z.ziel === undefined ? -1 : einerSpalte(z, z.ziel);
  if (eZiel >= 0)
    teile.push(
      `<rect x="${x0 + eZiel * k}" y="${yZiffern}" width="${k}" height="${zeile}" fill="currentColor" fill-opacity="0.12" stroke="none"/>`,
    );
  // Köpfe der Einheiten
  z.einheiten.forEach((e, i) => {
    const spalten = z.spalten.flatMap((s, j) => (s.einheit === i ? [j] : []));
    const von = spalten[0] ?? 0;
    const breite = spalten.length * k;
    const x = x0 + von * k;
    teile.push(rechteck(x, y0, breite, kopf, i === z.ziel));
    const name = e.auch ? `${e.name} (${e.auch})` : e.name;
    teile.push(text(x + breite / 2, y0 + kopf / 2 + 6, name, breite < 40 ? 13 : 15));
  });
  // Stellen H, Z, E
  if (mehrstellig)
    z.spalten.forEach((s, i) => {
      teile.push(rechteck(x0 + i * k, y0 + kopf, k, unter));
      if (s.stelle) teile.push(text(x0 + i * k + k / 2, y0 + kopf + 15, s.stelle, 11));
    });
  // Ziffernzeile
  z.spalten.forEach((s, i) => {
    const grenze = z.spalten[i + 1]?.einheit !== s.einheit;
    teile.push(rechteck(x0 + i * k, yZiffern, k, zeile));
    if (grenze && i < n - 1)
      teile.push(linie(x0 + (i + 1) * k, y0, x0 + (i + 1) * k, yZiffern + zeile, 2.5));
    const c = z.ziffern[i];
    if (c !== null && c !== undefined)
      teile.push(text(x0 + i * k + k / 2, yZiffern + zeile / 2 + 8, c, 22));
    else if (l?.ergaenzt.includes(i))
      teile.push(
        text(x0 + i * k + k / 2, yZiffern + zeile / 2 + 8, '0', 22).replace(
          'stroke="none"',
          'stroke="none" fill-opacity="0.55" font-style="italic"',
        ),
      );
  });
  if (eZiel >= 0 && l) {
    const xk = x0 + (eZiel + 1) * k;
    teile.push(
      `<circle cx="${xk}" cy="${yZiffern + zeile - 7}" r="4.5" fill="currentColor" stroke="none"/>`,
    );
  }
  if (text2) teile.push(text(BREITE / 2, yZiffern + zeile + 28, text2, 17));
  return bild(BREITE, hoehe, teile, { de: beschreibung(z) });
}
