// Gitter (VERMITTLUNG §2.3, Werkzeug gitter@1): Koordinatensystem oder Rasterpapier mit
// Punkten, Figuren, Kästchen, Spiegelachse und Pfeilen. Interaktiv wird ein Punkt mit Knöpfen
// bewegt; sein Spiegelbild oder sein verschobener Bildpunkt wandert mit. Reine Logik; die
// Darstellung ist Gitter.svelte.
import type { Bild, Punkt } from '../../../core/learning/generator';
import {
  bild,
  gestrichelt,
  kreis,
  linie,
  punkt as punktSvg,
  rechteck,
  text,
  vieleck,
} from '../../../generators/svg';
import { t } from '../../texte/texte';

export interface GitterParameter {
  /** Größe in beide Richtungen, 4 … 12 (Standard 8); xmax/ymax einzeln möglich */
  readonly max?: unknown;
  readonly xmax?: unknown;
  readonly ymax?: unknown;
  /** false: Rasterpapier ohne Achsen und Zahlen (Standard true) */
  readonly achsen?: unknown;
  /** Punkte [{ x, y, name }] */
  readonly punkte?: unknown;
  /**
   * Figuren [{ ecken: [[x, y], …], namen: ['A', …], bild: true }] – `bild` zeichnet sie als
   * Bildfigur gestrichelt, `leer` nur als Umriss ohne Füllung (etwa der Rest eines Ganzen)
   */
  readonly figuren?: unknown;
  /** gefüllte Kästchen [[x, y], …] (linke untere Ecke) */
  readonly kaestchen?: unknown;
  /** Spiegelachse { x: 4 } (senkrecht) oder { y: 3 } (waagerecht) */
  readonly spiegelachse?: unknown;
  /** Pfeile [{ von: [x, y], nach: [x, y] }] */
  readonly pfeile?: unknown;
  /** Linien [{ von: [x, y], nach: [x, y], gestrichelt: true }], etwa Diagonalen oder Faltlinien */
  readonly linien?: unknown;
  /** true: gestrichelte Hilfslinien von jedem Punkt zu den Achsen */
  readonly hilfslinien?: unknown;
  /** beweglicher Punkt { x, y, name } (interaktiv mit Knöpfen) */
  readonly beweglich?: unknown;
  /** Verschiebung [dx, dy]: der Bildpunkt des beweglichen Punktes wandert mit */
  readonly verschiebung?: unknown;
  /** true: Die Beschreibung nennt die Verschiebung nicht (das Bild gehört zu einer Frage danach) */
  readonly frage?: unknown;
}

export interface NamensPunkt extends Punkt {
  readonly name: string;
}

export interface Figur {
  readonly ecken: readonly (readonly [number, number])[];
  readonly namen: readonly string[];
  readonly bild: boolean;
  /** nur Umriss, keine Füllung */
  readonly leer: boolean;
}

export interface Pfeil {
  readonly von: readonly [number, number];
  readonly nach: readonly [number, number];
}

export interface Linie extends Pfeil {
  readonly gestrichelt: boolean;
}

export type Achse = { readonly x: number } | { readonly y: number };

export interface Gitter {
  readonly xmax: number;
  readonly ymax: number;
  readonly achsen: boolean;
  readonly punkte: readonly NamensPunkt[];
  readonly figuren: readonly Figur[];
  readonly kaestchen: readonly (readonly [number, number])[];
  readonly achse?: Achse;
  readonly pfeile: readonly Pfeil[];
  readonly linien: readonly Linie[];
  readonly hilfslinien: boolean;
  readonly beweglich?: NamensPunkt;
  readonly verschiebung?: readonly [number, number];
  readonly frage: boolean;
}

const ganz = (x: unknown, von: number, bis: number, sonst: number) =>
  typeof x === 'number' && Number.isInteger(x) && x >= von && x <= bis ? x : sonst;
const istObjekt = (x: unknown): x is Record<string, unknown> =>
  typeof x === 'object' && x !== null && !Array.isArray(x);

function paar(x: unknown, xmax: number, ymax: number): readonly [number, number] | undefined {
  if (!Array.isArray(x) || x.length !== 2) return undefined;
  const [a, b] = x as unknown[];
  if (typeof a !== 'number' || typeof b !== 'number') return undefined;
  if (!Number.isInteger(a) || !Number.isInteger(b) || a < 0 || b < 0 || a > xmax || b > ymax)
    return undefined;
  return [a, b];
}

function namensPunkt(
  x: unknown,
  xmax: number,
  ymax: number,
  sonst: string,
): NamensPunkt | undefined {
  if (!istObjekt(x)) return undefined;
  const p = paar([x['x'], x['y']], xmax, ymax);
  if (!p) return undefined;
  const name = typeof x['name'] === 'string' && x['name'].length <= 3 ? x['name'] : sonst;
  return { x: p[0], y: p[1], name };
}

export function gitterAus(p: GitterParameter): Gitter {
  const max = ganz(p.max, 4, 12, 8);
  const xmax = ganz(p.xmax, 4, 12, max);
  const ymax = ganz(p.ymax, 4, 12, max);
  const punkte = (Array.isArray(p.punkte) ? p.punkte : []).slice(0, 8).flatMap((q, i) => {
    const n = namensPunkt(q, xmax, ymax, String.fromCharCode(65 + i));
    return n ? [n] : [];
  });
  const figuren = (Array.isArray(p.figuren) ? p.figuren : []).slice(0, 4).flatMap((f) => {
    if (!istObjekt(f) || !Array.isArray(f['ecken'])) return [];
    const ecken = f['ecken'].slice(0, 8).flatMap((e) => {
      const q = paar(e, xmax, ymax);
      return q ? [q] : [];
    });
    if (ecken.length < 2) return [];
    const namen = Array.isArray(f['namen'])
      ? f['namen'].map((n) => (typeof n === 'string' && n.length <= 3 ? n : ''))
      : [];
    return [{ ecken, namen, bild: f['bild'] === true, leer: f['leer'] === true }];
  });
  const kaestchen = (Array.isArray(p.kaestchen) ? p.kaestchen : []).slice(0, 40).flatMap((k) => {
    const q = paar(k, xmax - 1, ymax - 1);
    return q ? [q] : [];
  });
  let achse: Achse | undefined;
  if (istObjekt(p.spiegelachse)) {
    const ax = p.spiegelachse['x'];
    const ay = p.spiegelachse['y'];
    if (typeof ax === 'number' && Number.isInteger(ax) && ax >= 0 && ax <= xmax) achse = { x: ax };
    else if (typeof ay === 'number' && Number.isInteger(ay) && ay >= 0 && ay <= ymax)
      achse = { y: ay };
  }
  const pfeile = (Array.isArray(p.pfeile) ? p.pfeile : []).slice(0, 6).flatMap((f) => {
    if (!istObjekt(f)) return [];
    const von = paar(f['von'], xmax, ymax);
    const nach = paar(f['nach'], xmax, ymax);
    return von && nach ? [{ von, nach }] : [];
  });
  const linien = (Array.isArray(p.linien) ? p.linien : []).slice(0, 8).flatMap((f) => {
    if (!istObjekt(f)) return [];
    const von = paar(f['von'], xmax, ymax);
    const nach = paar(f['nach'], xmax, ymax);
    return von && nach ? [{ von, nach, gestrichelt: f['gestrichelt'] === true }] : [];
  });
  const beweglich = namensPunkt(p.beweglich, xmax, ymax, 'P');
  let verschiebung: readonly [number, number] | undefined;
  if (Array.isArray(p.verschiebung) && p.verschiebung.length === 2) {
    const [dx, dy] = p.verschiebung as unknown[];
    if (
      typeof dx === 'number' &&
      typeof dy === 'number' &&
      Number.isInteger(dx) &&
      Number.isInteger(dy)
    )
      verschiebung = [Math.max(-xmax, Math.min(xmax, dx)), Math.max(-ymax, Math.min(ymax, dy))];
  }
  return {
    xmax,
    ymax,
    achsen: p.achsen !== false,
    punkte,
    figuren,
    kaestchen,
    ...(achse ? { achse } : {}),
    pfeile,
    linien,
    hilfslinien: p.hilfslinien === true,
    ...(beweglich ? { beweglich } : {}),
    ...(verschiebung ? { verschiebung } : {}),
    frage: p.frage === true,
  };
}

/** Beweglichen Punkt um (dx, dy) rücken, innerhalb des Gitters. */
export function bewegt(z: Gitter, dx: number, dy: number): Gitter {
  if (!z.beweglich) return z;
  return {
    ...z,
    beweglich: {
      ...z.beweglich,
      x: Math.max(0, Math.min(z.xmax, z.beweglich.x + dx)),
      y: Math.max(0, Math.min(z.ymax, z.beweglich.y + dy)),
    },
  };
}

/** Spiegelbild eines Punktes an der Achse; undefined, wenn es außerhalb des Gitters läge. */
export function gespiegelt(p: Punkt, achse: Achse): Punkt {
  return 'x' in achse ? { x: 2 * achse.x - p.x, y: p.y } : { x: p.x, y: 2 * achse.y - p.y };
}

/** Bildpunkt des beweglichen Punktes: gespiegelt oder verschoben, sonst undefined. */
export function bildpunkt(z: Gitter): NamensPunkt | undefined {
  if (!z.beweglich) return undefined;
  const name = `${z.beweglich.name}′`;
  if (z.verschiebung) {
    const [dx, dy] = z.verschiebung;
    return { x: z.beweglich.x + dx, y: z.beweglich.y + dy, name };
  }
  if (z.achse) return { ...gespiegelt(z.beweglich, z.achse), name };
  return undefined;
}

const imGitter = (z: Gitter, p: Punkt) => p.x >= 0 && p.y >= 0 && p.x <= z.xmax && p.y <= z.ymax;

export const koordinaten = (p: Punkt) => `(${p.x}|${p.y})`;

/** Verschiebung in Worten: „3 nach rechts, 2 nach oben“ */
export function verschiebungText(v: readonly [number, number]): string {
  const teile: string[] = [];
  if (v[0] !== 0)
    teile.push(
      `${Math.abs(v[0])} ${t(v[0] > 0 ? 'werkzeug.gitter.nach-rechts' : 'werkzeug.gitter.nach-links')}`,
    );
  if (v[1] !== 0)
    teile.push(
      `${Math.abs(v[1])} ${t(v[1] > 0 ? 'werkzeug.gitter.nach-oben' : 'werkzeug.gitter.nach-unten')}`,
    );
  return teile.join(', ') || '0';
}

/** Text für den Bildschirmleser. */
export function beschreibung(z: Gitter): string {
  const saetze: string[] = [];
  saetze.push(
    z.achsen
      ? `${t('werkzeug.gitter.koordinatensystem')} ${Math.max(z.xmax, z.ymax)}.`
      : `${t('werkzeug.gitter.raster')} ${z.xmax} × ${z.ymax} ${t('werkzeug.gitter.kaestchen')}.`,
  );
  const alle = [...z.punkte, ...(z.beweglich ? [z.beweglich] : [])];
  if (alle.length)
    saetze.push(
      `${t('werkzeug.gitter.punkte')} ${alle.map((p) => `${p.name}${koordinaten(p)}`).join(', ')}.`,
    );
  if (z.achse)
    saetze.push(
      'x' in z.achse
        ? `${t('werkzeug.gitter.achse-senkrecht')} ${z.achse.x}.`
        : `${t('werkzeug.gitter.achse-waagerecht')} ${z.achse.y}.`,
    );
  if (z.verschiebung && !z.frage)
    saetze.push(`${t('werkzeug.gitter.verschiebung')} ${verschiebungText(z.verschiebung)}.`);
  const b = bildpunkt(z);
  if (b)
    saetze.push(
      imGitter(z, b)
        ? `${t('werkzeug.gitter.bildpunkt')} ${b.name}${koordinaten(b)}.`
        : `${t('werkzeug.gitter.bildpunkt')} ${b.name} ${t('werkzeug.gitter.ausserhalb')}`,
    );
  for (const f of z.figuren)
    saetze.push(
      `${t(f.bild ? 'werkzeug.gitter.bildfigur' : f.leer ? 'werkzeug.gitter.umriss' : 'werkzeug.gitter.figur')} ${f.ecken
        .map(([x, y], i) => `${f.namen[i] ?? ''}${koordinaten({ x, y })}`)
        .join(', ')}.`,
    );
  if (z.kaestchen.length)
    saetze.push(`${t('werkzeug.gitter.figur-kaestchen')} ${z.kaestchen.length}.`);
  for (const p of z.pfeile)
    saetze.push(
      `${t('werkzeug.gitter.pfeil')} ${koordinaten({ x: p.von[0], y: p.von[1] })} ${t('werkzeug.gitter.nach')} ${koordinaten({ x: p.nach[0], y: p.nach[1] })}.`,
    );
  for (const l of z.linien)
    saetze.push(
      `${t(l.gestrichelt ? 'werkzeug.gitter.linie-gestrichelt' : 'werkzeug.gitter.linie')} ${koordinaten({ x: l.von[0], y: l.von[1] })} ${t('werkzeug.gitter.nach')} ${koordinaten({ x: l.nach[0], y: l.nach[1] })}.`,
    );
  return saetze.join(' ');
}

const RASTER = 26;

export function gitterBild(z: Gitter): Bild {
  const rand = z.achsen ? 30 : 12;
  const breite = rand + z.xmax * RASTER + 16;
  const hoehe = 16 + z.ymax * RASTER + (z.achsen ? 30 : 12);
  const px = (x: number) => rand + x * RASTER;
  const py = (y: number) => 16 + (z.ymax - y) * RASTER;
  const teile: string[] = [];
  for (let x = 0; x <= z.xmax; x++) teile.push(linie(px(x), py(0), px(x), py(z.ymax), 0.5));
  for (let y = 0; y <= z.ymax; y++) teile.push(linie(px(0), py(y), px(z.xmax), py(y), 0.5));
  if (z.achsen) {
    teile.push(
      linie(px(0), py(0), px(z.xmax), py(0), 2),
      linie(px(0), py(0), px(0), py(z.ymax), 2),
    );
    for (let x = 0; x <= z.xmax; x++) teile.push(text(px(x), py(0) + 18, String(x), 12));
    for (let y = 1; y <= z.ymax; y++) teile.push(text(px(0) - 12, py(y) + 4, String(y), 12));
  }
  for (const [x, y] of z.kaestchen) teile.push(rechteck(px(x), py(y + 1), RASTER, RASTER, true));
  if (z.achse)
    teile.push(
      'x' in z.achse
        ? linie(px(z.achse.x), py(0) + 8, px(z.achse.x), py(z.ymax) - 8, 3.5)
        : linie(px(0) - 8, py(z.achse.y), px(z.xmax) + 8, py(z.achse.y), 3.5),
    );
  for (const l of z.linien)
    teile.push(
      l.gestrichelt
        ? gestrichelt(px(l.von[0]), py(l.von[1]), px(l.nach[0]), py(l.nach[1]), 2)
        : linie(px(l.von[0]), py(l.von[1]), px(l.nach[0]), py(l.nach[1]), 2),
    );
  for (const f of z.figuren) {
    const ecken = f.ecken.map(([x, y]) => [px(x), py(y)] as const);
    teile.push(
      f.bild
        ? `<polygon points="${ecken.map(([x, y]) => `${x},${y}`).join(' ')}" fill="currentColor" fill-opacity="0.12" stroke-dasharray="6 5"/>`
        : vieleck(ecken, !f.leer),
    );
    f.ecken.forEach(([x, y], i) => {
      const n = f.namen[i];
      if (n) teile.push(punktSvg(px(x), py(y), n));
    });
  }
  const alle = [...z.punkte, ...(z.beweglich ? [z.beweglich] : [])];
  const b = bildpunkt(z);
  if (z.hilfslinien)
    for (const p of alle)
      teile.push(
        gestrichelt(px(p.x), py(p.y), px(p.x), py(0)),
        gestrichelt(px(p.x), py(p.y), px(0), py(p.y)),
      );
  for (const p of z.pfeile)
    teile.push(pfeil(px(p.von[0]), py(p.von[1]), px(p.nach[0]), py(p.nach[1])));
  if (b && imGitter(z, b) && z.beweglich) {
    teile.push(gestrichelt(px(z.beweglich.x), py(z.beweglich.y), px(b.x), py(b.y)));
    teile.push(kreis(px(b.x), py(b.y), 4), text(px(b.x) + 14, py(b.y) - 8, b.name, 14));
  }
  for (const p of alle) teile.push(punktSvg(px(p.x), py(p.y), p.name));
  return bild(breite, hoehe, teile, { de: beschreibung(z) });
}

/** Pfeil mit Spitze. */
function pfeil(x1: number, y1: number, x2: number, y2: number): string {
  const w = Math.atan2(y2 - y1, x2 - x1);
  const s = 9;
  const a = [x2 - s * Math.cos(w - 0.5), y2 - s * Math.sin(w - 0.5)];
  const c = [x2 - s * Math.cos(w + 0.5), y2 - s * Math.sin(w + 0.5)];
  return (
    linie(x1, y1, x2, y2, 2.5) +
    `<polygon points="${x2},${y2} ${a.map((v) => Math.round(v * 100) / 100).join(',')} ${c.map((v) => Math.round(v * 100) / 100).join(',')}" fill="currentColor" stroke="none"/>`
  );
}
