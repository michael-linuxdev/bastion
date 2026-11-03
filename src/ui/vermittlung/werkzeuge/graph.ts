// Graph (VERMITTLUNG §2.3, Werkzeug graph@1): Funktionsgraphen ab Klasse 9 in der
// Erstvermittlung (Bedarfsliste B5 und B8). Jede Kurve hat die Form
// f(x) = a · g(b · (x − d)) + e mit g aus `art` (x, x², x^n, √x, ∛x; ab Klasse 10 auch
// Exponential-, Logarithmus-, Sinus- und Kosinusfunktion). Als Bild zeigt das Werkzeug
// die Kurven; interaktiv lassen sich a, b, d und e der ersten Kurve mit Schiebereglern
// ändern („Parameter am Graphen“). Ohne b (b = 1) bleiben alle bisherigen Bilder gleich. Reine Logik; die Darstellung ist
// Graph.svelte, das Bild baut der SVG-Baukasten der Generatoren.
import type { Bild } from '../../../core/learning/generator';
import { bild, kreis, koordinatensystemBereich, kurve } from '../../../generators/svg';
import { t } from '../../texte/texte';

export type KurvenArt =
  'gerade' | 'parabel' | 'potenz' | 'wurzel' | 'kubikwurzel' | 'exp' | 'log' | 'sin' | 'cos';
const ARTEN: readonly KurvenArt[] = [
  'gerade',
  'parabel',
  'potenz',
  'wurzel',
  'kubikwurzel',
  'exp',
  'log',
  'sin',
  'cos',
];

export interface KurveParameter {
  readonly art?: string;
  readonly a?: number;
  readonly d?: number;
  readonly e?: number;
  /** Faktor im Inneren: f(x) = a · g(b · (x − d)) + e, größer als 0 (Periode bei sin, cos) */
  readonly b?: number;
  /** Hochzahl bei art: potenz (ganz, −4 … 5, nicht 0) */
  readonly n?: number;
  /** Basis bei art: exp und log, größer als 0 und nicht 1; „e“ für die Eulersche Zahl */
  readonly basis?: number | string;
  /** dünn und gestrichelt, etwa die Normalparabel zum Vergleich */
  readonly vergleich?: boolean;
}

export interface GraphParameter {
  readonly kurven?: readonly KurveParameter[];
  /** Ausschnitt [min, max], ganze Zahlen, 0 enthalten */
  readonly x?: readonly number[];
  readonly y?: readonly number[];
  /** hervorgehobene Punkte [x, y] */
  readonly punkte?: readonly (readonly number[])[];
  /** interaktiv: welche Regler (Teilmenge von a, b, d, e; ohne Angabe a, d, e) */
  readonly regler?: readonly string[];
}

export interface Kurve {
  readonly art: KurvenArt;
  readonly a: number;
  readonly d: number;
  readonly e: number;
  readonly b: number;
  readonly n: number;
  /** Basis bei exp und log; Math.E für e */
  readonly basis: number;
  readonly vergleich: boolean;
}

export type ReglerName = 'a' | 'b' | 'd' | 'e';
export const REGLER: Readonly<Record<ReglerName, { min: number; max: number; schritt: number }>> = {
  a: { min: -3, max: 3, schritt: 0.5 },
  b: { min: 0.5, max: 4, schritt: 0.5 },
  d: { min: -4, max: 4, schritt: 1 },
  e: { min: -4, max: 4, schritt: 1 },
};

export const MAX_KURVEN = 4;
const zahl = (w: unknown, sonst: number) =>
  typeof w === 'number' && Number.isFinite(w) ? w : sonst;
const ganz = (w: unknown, sonst: number) => (Number.isInteger(w) ? (w as number) : sonst);

export function kurveAus(p: KurveParameter): Kurve {
  const art = ARTEN.includes(p.art as KurvenArt) ? (p.art as KurvenArt) : 'parabel';
  let n = ganz(p.n, 2);
  if (n === 0 || n < -4 || n > 5) n = 2;
  let b = zahl(p.b, 1);
  if (b <= 0) b = 1;
  let basis = p.basis === 'e' ? Math.E : zahl(p.basis, 2);
  if (basis <= 0 || basis === 1) basis = 2;
  return {
    art,
    a: zahl(p.a, 1),
    d: zahl(p.d, 0),
    e: zahl(p.e, 0),
    b,
    n,
    basis,
    vergleich: p.vergleich === true,
  };
}

/** Bereich [min, max] aus den Parametern: ganze Zahlen, 0 enthalten, höchstens 16 breit. */
export function bereich(roh: readonly number[] | undefined, sonst: [number, number]) {
  const [lo, hi] = Array.isArray(roh) ? roh : [];
  let min = Math.min(0, ganz(lo, sonst[0]));
  let max = Math.max(0, ganz(hi, sonst[1]));
  if (max - min < 2) [min, max] = sonst;
  if (max - min > 16) [min, max] = sonst;
  return { min, max };
}

function grundfunktion(k: Kurve): (x: number) => number {
  switch (k.art) {
    case 'gerade':
      return (x) => x;
    case 'parabel':
      return (x) => x * x;
    case 'potenz':
      return (x) => x ** k.n;
    case 'wurzel':
      return (x) => (x >= 0 ? Math.sqrt(x) : NaN);
    case 'kubikwurzel':
      return (x) => (x >= 0 ? Math.cbrt(x) : NaN);
    case 'exp':
      return (x) => k.basis ** x;
    case 'log':
      return (x) => (x > 0 ? Math.log(x) / Math.log(k.basis) : NaN);
    case 'sin':
      return Math.sin;
    case 'cos':
      return Math.cos;
  }
}

export function funktion(k: Kurve): (x: number) => number {
  const g = grundfunktion(k);
  return (x) => k.a * g(k.b * (x - k.d)) + k.e;
}

const minus = (w: number) => (w < 0 ? `−${zahlDe(-w)}` : zahlDe(w));
function zahlDe(w: number): string {
  return String(Math.round(w * 100) / 100).replace('.', ',');
}

/** Term als Text, z. B. „f(x) = 2 · (x − 1)² + 3“ – zum Vorlesen und unter dem Graphen. */
export function term(k: Kurve): string {
  const verschoben = k.d === 0 ? 'x' : `(x ${k.d > 0 ? '−' : '+'} ${zahlDe(Math.abs(k.d))})`;
  const innen = k.b === 1 ? verschoben : `${zahlDe(k.b)}${k.d === 0 ? 'x' : ` · ${verschoben}`}`;
  const basis = k.basis === Math.E ? 'e' : zahlDe(k.basis);
  const tief = (w: string) =>
    w
      .split('')
      .map((c) => ('0123456789,'.includes(c) ? '₀₁₂₃₄₅₆₇₈₉,'['0123456789,'.indexOf(c)] : c))
      .join('');
  const hoch = (n: number) => {
    const z = '⁰¹²³⁴⁵⁶⁷⁸⁹';
    const s = String(Math.abs(n))
      .split('')
      .map((c) => z[Number(c)])
      .join('');
    return (n < 0 ? '⁻' : '') + s;
  };
  let g: string;
  switch (k.art) {
    case 'gerade':
      g = innen;
      break;
    case 'parabel':
      g = `${innen}²`;
      break;
    case 'potenz':
      g = `${innen}${hoch(k.n)}`;
      break;
    case 'wurzel':
      g = `√${k.d === 0 && k.b === 1 ? 'x' : innen}`;
      break;
    case 'kubikwurzel':
      g = `∛${k.d === 0 && k.b === 1 ? 'x' : innen}`;
      break;
    case 'exp':
      g = innen === 'x' ? `${basis}ˣ` : `${basis}^(${innen.replace(/^\((.*)\)$/, '$1')})`;
      break;
    case 'log':
      g = `${k.basis === Math.E ? 'ln' : `log${tief(basis)}`}(${innen.replace(/^\((.*)\)$/, '$1')})`;
      break;
    case 'sin':
    case 'cos':
      g = `${k.art}(${innen.replace(/^\((.*)\)$/, '$1')})`;
      break;
  }
  let s: string;
  if (k.a === 0) s = '0';
  else if (k.a === 1) s = g;
  else if (k.a === -1) s = `−${g}`;
  else s = `${minus(k.a)} · ${g}`;
  if (k.e !== 0)
    s = k.a === 0 ? minus(k.e) : `${s} ${k.e > 0 ? '+' : '−'} ${zahlDe(Math.abs(k.e))}`;
  return `f(x) = ${s}`;
}

export function kurvenAus(p: GraphParameter): Kurve[] {
  const roh = Array.isArray(p.kurven) && p.kurven.length > 0 ? p.kurven : [{}];
  return roh.slice(0, MAX_KURVEN).map(kurveAus);
}

export function reglerAus(p: GraphParameter): ReglerName[] {
  const r = Array.isArray(p.regler) ? p.regler : ['a', 'd', 'e'];
  return (['a', 'b', 'd', 'e'] as const).filter((n) => r.includes(n));
}

/** Das SVG-Bild zu den Kurven; `beschreibung` liest der Bildschirmleser vor. */
export function graphBild(p: GraphParameter, kurven: readonly Kurve[]): Bild {
  const xb = bereich(p.x, [-5, 5]);
  const yb = bereich(p.y, [-2, 8]);
  const ks = koordinatensystemBereich(xb.min, xb.max, yb.min, yb.max, 24);
  const teile = [...ks.teile];
  for (const k of kurven) {
    const pfad = kurve(ks, funktion(k), xb.min, xb.max, { ymin: yb.min, ymax: yb.max }, 160);
    teile.push(
      k.vergleich
        ? pfad.replace('<path ', '<path stroke-dasharray="6 5" stroke-opacity="0.6" ')
        : pfad,
    );
  }
  for (const pt of Array.isArray(p.punkte) ? p.punkte : []) {
    const [x, y] = pt;
    if (typeof x === 'number' && typeof y === 'number')
      teile.push(kreis(ks.px(x), ks.py(y), 4, true));
  }
  const text = kurven
    .map((k) => (k.vergleich ? `${t('werkzeug.graph.gestrichelt')} ${term(k)}` : term(k)))
    .join('; ');
  return bild(ks.breite, ks.hoehe, teile, { de: `${t('werkzeug.graph.beschreibung')} ${text}.` });
}
