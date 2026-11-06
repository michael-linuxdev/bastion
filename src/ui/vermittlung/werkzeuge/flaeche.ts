// Fläche (VERMITTLUNG §2.3, Werkzeug flaeche@1): ein Rechteck oder eine Figur aus Rechtecken
// im Kästchenraster, mit Maßen am Rand. Auf Wunsch in Einheitsquadrate eingeteilt, Reihe für
// Reihe ausgelegt, in Teilrechtecke zerlegt (A, B, …) oder mit gestricheltem fehlendem Stück
// zum großen Rechteck ergänzt. Interaktiv legen Knöpfe Reihen aus oder nehmen sie weg, und ein
// Knopf zeigt die Zerlegung. Reine Logik; die Darstellung ist Flaeche.svelte.
import type { Bild } from '../../../core/learning/generator';
import { zahlDeutsch } from '../../../core/learning/format';
import { bild, linie, text } from '../../../generators/svg';
import { t } from '../../texte/texte';

export interface FlaecheParameter {
  /** Rechtecke [x, y, Breite, Höhe] in Einheiten, x nach rechts, y nach oben (Standard [[0, 0, 5, 3]]) */
  readonly rechtecke?: unknown;
  /** Längeneinheit der Maße: mm, cm, dm, m oder km (Standard cm) */
  readonly einheit?: unknown;
  /** false: keine Maße am Rand */
  readonly masse?: unknown;
  /** true: in Einheitsquadrate eingeteilt */
  readonly quadrate?: unknown;
  /** Zahl der ausgelegten Reihen von unten; macht das Werkzeug zum Auslegen mit Knöpfen */
  readonly reihen?: unknown;
  /** true: Teilrechtecke gestrichelt getrennt und mit A, B, … beschriftet */
  readonly zerlegt?: unknown;
  /** true: in jedem Teilrechteck sein Flächeninhalt („A = 12 cm²“) */
  readonly inhalte?: unknown;
  /** Rechtecke [x, y, Breite, Höhe], die gestrichelt als fehlendes Stück erscheinen */
  readonly fehlend?: unknown;
}

export type Rechteck = readonly [number, number, number, number];

export interface Flaeche {
  readonly rechtecke: readonly Rechteck[];
  readonly fehlend: readonly Rechteck[];
  readonly einheit: string;
  readonly masse: boolean;
  readonly quadrate: boolean;
  /** ausgelegte Reihen (undefined: kein Auslegen) */
  readonly reihen?: number;
  readonly zerlegt: boolean;
  readonly inhalte: boolean;
}

/** Ein Stück Rand: waagerecht (y fest) oder senkrecht (x fest), mit der Seite nach außen. */
export interface Randstueck {
  readonly waagerecht: boolean;
  /** fester Wert (y bei waagerecht, x bei senkrecht) */
  readonly bei: number;
  readonly von: number;
  readonly bis: number;
  /** +1: außen liegt oben bzw. rechts; −1: unten bzw. links */
  readonly aussen: 1 | -1;
}

const EINHEITEN = ['mm', 'cm', 'dm', 'm', 'km'];
export const MAX_BREITE = 14;
export const MAX_HOEHE = 10;

const STANDARD: Rechteck = [0, 0, 5, 3];

function rechteckeAus(x: unknown): Rechteck[] | undefined {
  if (!Array.isArray(x) || x.length === 0 || x.length > 6) return undefined;
  const r: Rechteck[] = [];
  for (const e of x) {
    if (!Array.isArray(e) || e.length !== 4) return undefined;
    const [a, b, c, d] = e as unknown[];
    if (![a, b, c, d].every((v) => typeof v === 'number' && Number.isInteger(v))) return undefined;
    const q: Rechteck = [a as number, b as number, c as number, d as number];
    if (q[0] < 0 || q[1] < 0 || q[2] < 1 || q[3] < 1) return undefined;
    if (q[0] + q[2] > MAX_BREITE || q[1] + q[3] > MAX_HOEHE) return undefined;
    r.push(q);
  }
  return r;
}

const zellenVon = (r: readonly Rechteck[]) =>
  r.flatMap(([x, y, b, h]) =>
    Array.from({ length: b * h }, (_, i) => `${x + (i % b)},${y + Math.floor(i / b)}`),
  );

/** Überlappen sich Rechtecke, ist die Figur unklar; zusammenhängen müssen sie auch. */
function gueltig(r: readonly Rechteck[]): boolean {
  const z = zellenVon(r);
  if (new Set(z).size !== z.length) return false;
  const menge = new Set(z);
  const [start] = z;
  if (start === undefined) return false;
  const gesehen = new Set([start]);
  const offen = [start];
  while (offen.length) {
    const [x, y] = (offen.pop() ?? '0,0').split(',').map(Number) as [number, number];
    for (const n of [`${x + 1},${y}`, `${x - 1},${y}`, `${x},${y + 1}`, `${x},${y - 1}`])
      if (menge.has(n) && !gesehen.has(n)) {
        gesehen.add(n);
        offen.push(n);
      }
  }
  return gesehen.size === menge.size;
}

export function flaecheAus(p: FlaecheParameter): Flaeche {
  const roh = rechteckeAus(p.rechtecke);
  const rechtecke = roh && gueltig(roh) ? roh : [STANDARD];
  const fehlend = rechteckeAus(p.fehlend) ?? [];
  const hoehe = Math.max(...rechtecke.map(([, y, , h]) => y + h));
  const reihen =
    typeof p.reihen === 'number' && Number.isInteger(p.reihen)
      ? Math.min(hoehe, Math.max(0, p.reihen))
      : undefined;
  return {
    rechtecke,
    fehlend,
    einheit: EINHEITEN.includes(p.einheit as string) ? (p.einheit as string) : 'cm',
    masse: p.masse !== false,
    quadrate: p.quadrate === true || reihen !== undefined,
    ...(reihen !== undefined ? { reihen } : {}),
    zerlegt: p.zerlegt === true || p.inhalte === true,
    inhalte: p.inhalte === true,
  };
}

/** Höhe der Figur in Einheiten (Zahl der Reihen). */
export const figurHoehe = (z: Flaeche) => Math.max(...z.rechtecke.map(([, y, , h]) => y + h));

/** Reihen auslegen (+1) oder wegnehmen (−1); bleibt zwischen 0 und der Höhe der Figur. */
export function ausgelegt(z: Flaeche, delta: number): Flaeche {
  if (z.reihen === undefined) return z;
  return { ...z, reihen: Math.min(figurHoehe(z), Math.max(0, z.reihen + delta)) };
}

export const umgeschaltet = (z: Flaeche): Flaeche => ({ ...z, zerlegt: !z.zerlegt });

/** Kästchen der Figur in Reihe `y` (von unten, ab 0). */
export const inReihe = (z: Flaeche, y: number) =>
  zellenVon(z.rechtecke).filter((c) => c.endsWith(`,${y}`)).length;

/** Rand der Figur als längste gerade Stücke (von Ecke zu Ecke). */
export function rand(r: readonly Rechteck[]): Randstueck[] {
  const menge = new Set(zellenVon(r));
  const hat = (x: number, y: number) => menge.has(`${x},${y}`);
  const kanten: Randstueck[] = [];
  for (const c of menge) {
    const [x, y] = c.split(',').map(Number) as [number, number];
    if (!hat(x, y + 1))
      kanten.push({ waagerecht: true, bei: y + 1, von: x, bis: x + 1, aussen: 1 });
    if (!hat(x, y - 1)) kanten.push({ waagerecht: true, bei: y, von: x, bis: x + 1, aussen: -1 });
    if (!hat(x + 1, y))
      kanten.push({ waagerecht: false, bei: x + 1, von: y, bis: y + 1, aussen: 1 });
    if (!hat(x - 1, y)) kanten.push({ waagerecht: false, bei: x, von: y, bis: y + 1, aussen: -1 });
  }
  const gruppen = new Map<string, Randstueck[]>();
  for (const k of kanten) {
    const s = `${k.waagerecht},${k.bei},${k.aussen}`;
    gruppen.set(s, [...(gruppen.get(s) ?? []), k]);
  }
  const stuecke: Randstueck[] = [];
  for (const g of gruppen.values()) {
    g.sort((a, b) => a.von - b.von);
    let akt: Randstueck | undefined;
    for (const k of g) {
      if (akt && akt.bis === k.von) akt = { ...akt, bis: k.bis };
      else {
        if (akt) stuecke.push(akt);
        akt = k;
      }
    }
    if (akt) stuecke.push(akt);
  }
  return stuecke;
}

/** Summe aller Randstücke (Umfang in Einheiten). */
export const umfang = (z: Flaeche) => rand(z.rechtecke).reduce((a, s) => a + s.bis - s.von, 0);
/** Zahl der Einheitsquadrate (Flächeninhalt in Einheiten²). */
export const inhalt = (z: Flaeche) => zellenVon(z.rechtecke).length;

const buchstabe = (i: number) => String.fromCharCode(65 + i);
const mal = (z: Flaeche, b: number, h: number) =>
  `${zahlDeutsch(b)} ${z.einheit} ${t('werkzeug.flaeche.mal')} ${zahlDeutsch(h)} ${z.einheit}`;

/** Text für den Bildschirmleser: Form, Maße am Rand, Einteilung, Reihen, Zerlegung. */
export function beschreibung(z: Flaeche): string {
  const saetze: string[] = [];
  const [erstes] = z.rechtecke;
  if (z.rechtecke.length === 1 && erstes)
    saetze.push(
      `${t('werkzeug.flaeche.rechteck')} ${zahlDeutsch(erstes[2])} ${z.einheit} ${t('werkzeug.flaeche.lang')}, ${zahlDeutsch(erstes[3])} ${z.einheit} ${t('werkzeug.flaeche.breit')}.`,
    );
  else
    saetze.push(
      `${t('werkzeug.flaeche.figur')} ${z.rechtecke.length} ${t('werkzeug.flaeche.rechtecken')}${
        z.zerlegt
          ? `: ${z.rechtecke.map(([, , b, h], i) => `${buchstabe(i)} ${mal(z, b, h)}${z.inhalte ? ` = ${zahlDeutsch(b * h)} ${z.einheit}²` : ''}`).join(', ')}`
          : ''
      }.`,
    );
  if (z.masse && z.rechtecke.length > 1)
    saetze.push(
      `${t('werkzeug.flaeche.rand')} ${rand(z.rechtecke)
        .map((s) => `${zahlDeutsch(s.bis - s.von)} ${z.einheit}`)
        .join(', ')}.`,
    );
  if (z.inhalte && z.rechtecke.length === 1 && erstes)
    saetze.push(
      `${t('werkzeug.flaeche.inhalt')} ${zahlDeutsch(erstes[2] * erstes[3])} ${z.einheit}².`,
    );
  if (z.quadrate)
    saetze.push(
      `${t('werkzeug.flaeche.quadrate')} 1 ${z.einheit} ${t('werkzeug.flaeche.mal')} 1 ${z.einheit}.`,
    );
  if (z.reihen !== undefined) saetze.push(reihenText(z));
  z.fehlend.forEach(([, , b, h]) =>
    saetze.push(`${t('werkzeug.flaeche.fehlend')} ${mal(z, b, h)}.`),
  );
  return saetze.join(' ');
}

/** „2 von 3 Reihen ausgelegt, in jeder Reihe 5 Quadrate.“ */
export function reihenText(z: Flaeche): string {
  const hoehe = figurHoehe(z);
  const laengen = Array.from({ length: hoehe }, (_, y) => inReihe(z, y));
  const gleich = laengen.every((l) => l === laengen[0]);
  return `${z.reihen ?? 0} ${t('werkzeug.flaeche.von')} ${hoehe} ${t('werkzeug.flaeche.reihen')}${
    gleich
      ? `, ${t('werkzeug.flaeche.je-reihe')} ${laengen[0] ?? 0} ${t('werkzeug.flaeche.quadrate-kurz')}`
      : ''
  }.`;
}

const BREITE = 340;

export function flaecheBild(z: Flaeche): Bild {
  const alle = [...z.rechtecke, ...z.fehlend];
  const xmin = Math.min(...alle.map(([x]) => x));
  const xmax = Math.max(...alle.map(([x, , b]) => x + b));
  const ymin = Math.min(...alle.map(([, y]) => y));
  const ymax = Math.max(...alle.map(([, y, , h]) => y + h));
  const k = Math.min(30, (BREITE - 110) / (xmax - xmin), 190 / (ymax - ymin));
  const ox = (BREITE - (xmax - xmin) * k) / 2 - xmin * k;
  const hoehe = (ymax - ymin) * k + 64;
  const oy = 30 + (ymax - ymin) * k + ymin * k;
  const px = (x: number) => ox + x * k;
  const py = (y: number) => oy - y * k;
  const teile: string[] = [];
  const zellen = zellenVon(z.rechtecke).map((c) => c.split(',').map(Number) as [number, number]);
  for (const [x, y] of zellen) {
    const voll = z.reihen !== undefined && y < z.reihen;
    teile.push(
      `<rect x="${px(x)}" y="${py(y + 1)}" width="${k}" height="${k}" fill="currentColor" fill-opacity="${voll ? 0.35 : 0.1}" stroke="none"/>`,
    );
    if (z.quadrate)
      teile.push(
        `<rect x="${px(x)}" y="${py(y + 1)}" width="${k}" height="${k}" stroke-width="0.75"/>`,
      );
  }
  for (const [x, y, b, h] of z.fehlend)
    teile.push(
      `<rect x="${px(x)}" y="${py(y + h)}" width="${b * k}" height="${h * k}" stroke-width="1.5" stroke-dasharray="6 4"/>`,
      text(px(x + b / 2), py(y + h / 2) + 5, '?', 16),
    );
  if (z.zerlegt && z.rechtecke.length > 1)
    z.rechtecke.forEach(([x, y, b, h]) =>
      teile.push(
        `<rect x="${px(x)}" y="${py(y + h)}" width="${b * k}" height="${h * k}" stroke-width="1.5" stroke-dasharray="6 4"/>`,
      ),
    );
  if (z.zerlegt)
    z.rechtecke.forEach(([x, y, b, h], i) => {
      const name = z.rechtecke.length > 1 ? buchstabe(i) : '';
      const wert = z.inhalte ? `${zahlDeutsch(b * h)} ${z.einheit}²` : '';
      const inhaltText = [name, wert].filter(Boolean).join(' = ');
      const [mx, my] = [px(x + b / 2), py(y + h / 2)];
      // In schmale Teile passt „B = 6 cm²“ nicht in eine Zeile: Buchstabe darüber, Wert darunter.
      if (name && wert && b * k < 15 + inhaltText.length * 8)
        teile.push(text(mx, my - 4, name, 15), text(mx, my + 14, wert, 13));
      else if (inhaltText) teile.push(text(mx, my + 6, inhaltText, 16));
    });
  for (const s of rand(z.rechtecke)) {
    const [x1, y1, x2, y2] = s.waagerecht
      ? [px(s.von), py(s.bei), px(s.bis), py(s.bei)]
      : [px(s.bei), py(s.von), px(s.bei), py(s.bis)];
    teile.push(linie(x1, y1, x2, y2, 3));
    if (!z.masse) continue;
    const inhaltText = `${zahlDeutsch(s.bis - s.von)} ${z.einheit}`;
    if (s.waagerecht)
      teile.push(text((x1 + x2) / 2, y1 + (s.aussen === 1 ? -9 : 20), inhaltText, 13));
    else
      teile.push(
        text(x1 + s.aussen * (8 + inhaltText.length * 3.6), (y1 + y2) / 2 + 5, inhaltText, 13),
      );
  }
  return bild(BREITE, hoehe, teile, { de: beschreibung(z) });
}
