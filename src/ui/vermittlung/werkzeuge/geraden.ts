// Geraden (VERMITTLUNG §2.3, Werkzeug geraden@1): zwei Geraden g und h – parallel, senkrecht
// oder schneidend –, auf Wunsch mit beschrifteten Winkelfeldern am Schnittpunkt und mit einer
// zweiten Parallelen samt Schnittgerade (Winkelpaare). Ohne Ziehen: h wird mit Knöpfen gedreht.
// Reine Logik; die Darstellung ist Geraden.svelte.
import type { Bild } from '../../../core/learning/generator';
import { aufKreis, bild, bogen, gestrichelt, linie, text } from '../../../generators/svg';
import { t } from '../../texte/texte';

export type Lage = 'parallel' | 'senkrecht' | 'schneidend';

export interface GeradenParameter {
  /** parallel, senkrecht oder schneidend (Standard) */
  readonly lage?: unknown;
  /** Richtung von g in Grad zur Waagerechten, 0 … 179 (Standard 0) */
  readonly richtung?: unknown;
  /** Winkel zwischen g und h bei schneidend, 10 … 170 (Standard 50) */
  readonly winkel?: unknown;
  /** true: nur kurze Stücke, die sich im Bild nicht treffen; „verlängern“ zeigt den Rest */
  readonly kurz?: unknown;
  /** true: g und eine Parallele g′ werden von h geschnitten (Schnittpunkte S und T) */
  readonly parallelen?: unknown;
  /** Beschriftung der vier Winkelfelder an S, gegen den Uhrzeigersinn ab g: ['α', '', 'β', ''] */
  readonly felder?: unknown;
  /** dito an T (nur mit parallelen) */
  readonly felder2?: unknown;
  /** Namen der Geraden, Standard ['g', 'h'] */
  readonly namen?: unknown;
  /** Schrittweite beim Drehen in Grad (Standard 10) */
  readonly schritt?: unknown;
  /** true: Die Beschreibung nennt weder Lage noch Winkelgrößen (das Bild gehört zu einer Frage) */
  readonly frage?: unknown;
  /** false: interaktiv ohne Drehknöpfe (nur verlängern), Standard true */
  readonly drehbar?: unknown;
}

export interface Geraden {
  readonly richtung: number;
  /** 0 = parallel, 90 = senkrecht, sonst schneidend */
  readonly winkel: number;
  readonly kurz: boolean;
  readonly verlaengert: boolean;
  readonly parallelen: boolean;
  readonly felder: readonly string[];
  readonly felder2: readonly string[];
  readonly namen: readonly [string, string];
  readonly schritt: number;
  readonly frage: boolean;
  readonly drehbar: boolean;
}

const BREITE = 320;
const HOEHE = 220;
const RAND = 12;

const ganz = (x: unknown, von: number, bis: number, sonst: number) =>
  typeof x === 'number' && Number.isInteger(x) && x >= von && x <= bis ? x : sonst;

function namenAus(x: unknown, anzahl: number): string[] {
  if (!Array.isArray(x)) return [];
  return x.slice(0, anzahl).map((n) => (typeof n === 'string' && n.length <= 4 ? n : ''));
}

export function geradenAus(p: GeradenParameter): Geraden {
  const parallelen = p.parallelen === true;
  const lage: Lage = p.lage === 'parallel' || p.lage === 'senkrecht' ? p.lage : 'schneidend';
  const roh = ganz(p.winkel, 10, 170, 50);
  const winkel =
    lage === 'parallel' && !parallelen
      ? 0
      : lage === 'senkrecht'
        ? 90
        : parallelen
          ? Math.min(150, Math.max(30, roh))
          : roh;
  const namen = namenAus(p.namen, 2);
  const felder = namenAus(p.felder, 4);
  const felder2 = namenAus(p.felder2, 4);
  return {
    richtung: ganz(p.richtung, 0, 179, 0),
    winkel,
    kurz: p.kurz === true && !parallelen,
    verlaengert: false,
    parallelen,
    felder: [0, 1, 2, 3].map((i) => felder[i] ?? ''),
    felder2: [0, 1, 2, 3].map((i) => felder2[i] ?? ''),
    namen: [namen[0] || 'g', namen[1] || 'h'],
    schritt: ganz(p.schritt, 1, 45, 10),
    frage: p.frage === true,
    drehbar: p.drehbar !== false,
  };
}

export const lageVon = (winkel: number): Lage =>
  winkel === 0 ? 'parallel' : winkel === 90 ? 'senkrecht' : 'schneidend';

/** h um `delta` Grad drehen; bei Parallelen bleibt der Winkel zwischen 30° und 150°. */
export function gedreht(z: Geraden, delta: number): Geraden {
  let w = ((z.winkel + delta) % 180) + (z.winkel + delta < 0 ? 180 : 0);
  if (w === 180) w = 0;
  if (z.parallelen) w = Math.min(150, Math.max(30, w));
  return { ...z, winkel: w };
}

export const verlaengert = (z: Geraden, ja: boolean): Geraden => ({ ...z, verlaengert: ja });

/** Größe der vier Winkelfelder an einem Schnittpunkt, gegen den Uhrzeigersinn ab g. */
export const feldgroessen = (winkel: number): [number, number, number, number] => [
  winkel,
  180 - winkel,
  winkel,
  180 - winkel,
];

/** Richtung in SVG-Koordinaten (y nach unten) */
const richtung = (grad: number): [number, number] => [
  Math.cos((grad * Math.PI) / 180),
  -Math.sin((grad * Math.PI) / 180),
];

/** Parameterbereich [t1, t2], in dem P + t · r(grad) im Bild bleibt */
function spanne(px: number, py: number, grad: number): [number, number] {
  const [dx, dy] = richtung(grad);
  let t1 = -Infinity;
  let t2 = Infinity;
  for (const [p, d, lo, hi] of [
    [px, dx, RAND, BREITE - RAND],
    [py, dy, RAND, HOEHE - RAND],
  ] as const) {
    if (Math.abs(d) < 1e-9) continue;
    const a = (lo - p) / d;
    const b = (hi - p) / d;
    t1 = Math.max(t1, Math.min(a, b));
    t2 = Math.min(t2, Math.max(a, b));
  }
  return [t1, t2];
}

/** Gerade durch (px, py) mit Richtung `grad`, Name am rechten Ende; `nur` zeigt nur ein Stück. */
function gerade(
  px: number,
  py: number,
  grad: number,
  name: string,
  nur?: { von: number; bis: number; rest: boolean },
): string[] {
  const [t1, t2] = spanne(px, py, grad);
  const [dx, dy] = richtung(grad);
  const [nx, ny] = richtung(grad + 90);
  const teile: string[] = [];
  const von = nur ? Math.max(t1, nur.von) : t1;
  const bis = nur ? Math.min(t2, nur.bis) : t2;
  teile.push(linie(px + von * dx, py + von * dy, px + bis * dx, py + bis * dy, 2.5));
  if (nur?.rest) {
    teile.push(gestrichelt(px + t1 * dx, py + t1 * dy, px + von * dx, py + von * dy, 2));
    teile.push(gestrichelt(px + bis * dx, py + bis * dy, px + t2 * dx, py + t2 * dy, 2));
  }
  const ende = (nur ? bis : t2) - 16;
  teile.push(text(px + ende * dx + 13 * nx, py + ende * dy + 13 * ny + 5, name, 16));
  return teile;
}

/** Rechter-Winkel-Zeichen am Scheitel (cx, cy) zwischen den Richtungen start und start + 90. */
function rechterWinkel(cx: number, cy: number, start: number): string[] {
  const [ax, ay] = aufKreis(cx, cy, 18, start);
  const [bx, by] = aufKreis(cx, cy, 25.46, start + 45);
  const [ex, ey] = aufKreis(cx, cy, 18, start + 90);
  const [px, py] = aufKreis(cx, cy, 9, start + 45);
  return [
    linie(ax, ay, bx, by, 1.5),
    linie(bx, by, ex, ey, 1.5),
    `<circle cx="${Math.round(px * 100) / 100}" cy="${Math.round(py * 100) / 100}" r="2" fill="currentColor" stroke="none"/>`,
  ];
}

/** Winkelfelder an einem Schnittpunkt zeichnen: Bogen und Name je beschriftetem Feld. */
function felderTeile(
  cx: number,
  cy: number,
  g: number,
  winkel: number,
  felder: readonly string[],
): string[] {
  const teile: string[] = [];
  const grenzen = [g, g + winkel, g + 180, g + 180 + winkel, g + 360];
  felder.forEach((name, i) => {
    if (!name) return;
    const von = grenzen[i] ?? g;
    const bis = grenzen[i + 1] ?? g;
    const radius = 22 + (i % 2) * 6;
    teile.push(bogen(cx, cy, radius, von, bis));
    const [lx, ly] = aufKreis(cx, cy, radius + 15, (von + bis) / 2);
    teile.push(text(lx, ly + 5, name, 15));
  });
  return teile;
}

/** Name eines Schnittpunkts: in ein freies Winkelfeld, sonst etwas weiter außen. */
function punktname(
  cx: number,
  cy: number,
  g: number,
  winkel: number,
  felder: readonly string[],
  name: string,
): string {
  const mitten = [g + winkel / 2, g + 90 + winkel / 2, g + 180 + winkel / 2, g + 270 + winkel / 2];
  const frei = felder.findIndex((f) => !f);
  // alle vier beschriftet: klein in die Mitte zwischen Scheitel und Bogen
  const [x, y] = aufKreis(cx, cy, frei >= 0 ? 24 : 11, mitten[frei >= 0 ? frei : 1] ?? g);
  return text(x, y + 4, name, frei >= 0 ? 14 : 11);
}

function grad(w: number) {
  return `${w}°`;
}

/** Text für den Bildschirmleser und die Statuszeile. */
export function beschreibung(z: Geraden): string {
  const [g, h] = z.namen;
  const lage = lageVon(z.winkel);
  const r2 = (z.richtung + z.winkel) % 180;
  const saetze: string[] = [];
  if (z.parallelen) {
    saetze.push(
      `${t('werkzeug.geraden.parallelen')} ${g}, ${g}′ ${t('werkzeug.geraden.und')} ${h}.`,
    );
    saetze.push(
      `${t('werkzeug.geraden.winkel-zwischen')} ${g} ${t('werkzeug.geraden.und')} ${h}: ${grad(z.winkel)}.`,
    );
  } else {
    saetze.push(
      `${t('werkzeug.geraden.zwei')} ${g} ${t('werkzeug.geraden.und')} ${h}. ` +
        `${g} ${t('werkzeug.geraden.verlauf')} ${grad(z.richtung)} ${t('werkzeug.geraden.zur-waagerechten')}, ${h} ${t('werkzeug.geraden.verlauf')} ${grad(r2)}.`,
    );
    // Kurze Stücke: Die Lage verrät sich erst nach dem Verlängern (Schritt „entdecken“).
    if ((!z.kurz || z.verlaengert) && !z.frage) saetze.push(t(`werkzeug.geraden.${lage}`));
    if (z.kurz)
      saetze.push(t(z.verlaengert ? 'werkzeug.geraden.verlaengert' : 'werkzeug.geraden.kurz'));
  }
  const groessen = feldgroessen(z.winkel);
  const liste = (felder: readonly string[]) =>
    felder
      .flatMap((n, i) => (n ? [z.frage ? n : `${n} = ${grad(groessen[i] ?? 0)}`] : []))
      .join(', ');
  const anS = liste(z.felder);
  const anT = z.parallelen ? liste(z.felder2) : '';
  if (anS) saetze.push(`${t('werkzeug.geraden.an')} S: ${anS}.`);
  if (anT) saetze.push(`${t('werkzeug.geraden.an')} T: ${anT}.`);
  return saetze.join(' ');
}

export function geradenBild(z: Geraden): Bild {
  const [g, h] = z.namen;
  const cx = BREITE / 2;
  const cy = HOEHE / 2;
  const teile: string[] = [];
  const [nx, ny] = richtung(z.richtung + 90);
  if (z.parallelen) {
    const cot = Math.cos((z.winkel * Math.PI) / 180) / Math.sin((z.winkel * Math.PI) / 180);
    const [dx, dy] = richtung(z.richtung);
    const s: [number, number] = [cx + 45 * nx + 45 * cot * dx, cy + 45 * ny + 45 * cot * dy];
    const tt: [number, number] = [cx - 45 * nx - 45 * cot * dx, cy - 45 * ny - 45 * cot * dy];
    teile.push(...gerade(s[0], s[1], z.richtung, g));
    teile.push(...gerade(tt[0], tt[1], z.richtung, `${g}′`));
    teile.push(...gerade(s[0], s[1], z.richtung + z.winkel, h));
    teile.push(...felderTeile(s[0], s[1], z.richtung, z.winkel, z.felder));
    teile.push(...felderTeile(tt[0], tt[1], z.richtung, z.winkel, z.felder2));
    teile.push(punktname(s[0], s[1], z.richtung, z.winkel, z.felder, 'S'));
    teile.push(punktname(tt[0], tt[1], z.richtung, z.winkel, z.felder2, 'T'));
  } else if (z.winkel === 0) {
    teile.push(...gerade(cx + 22 * nx, cy + 22 * ny, z.richtung, g));
    teile.push(...gerade(cx - 22 * nx, cy - 22 * ny, z.richtung, h));
  } else {
    const nur = z.kurz ? { von: 45, bis: 1000, rest: z.verlaengert } : undefined;
    teile.push(...gerade(cx, cy, z.richtung, g, nur));
    teile.push(...gerade(cx, cy, z.richtung + z.winkel, h, nur));
    if (!z.kurz || z.verlaengert) {
      if (z.winkel === 90 && !z.felder.some(Boolean))
        teile.push(...rechterWinkel(cx, cy, z.richtung));
      teile.push(...felderTeile(cx, cy, z.richtung, z.winkel, z.felder));
    }
  }
  return bild(BREITE, HOEHE, teile, { de: beschreibung(z) });
}
