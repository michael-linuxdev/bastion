// Potenzen und Wurzeln – Klasse 9 (LEHRPLAN §8e, Feld PW): Quadrat-, Kubik- und n-te Wurzeln,
// Wurzeln abschätzen, Aussagen über Wurzeln prüfen (Niveau E). Formeln in LaTeX-Schreibweise,
// gesetzt mit KaTeX (ARCHITEKTUR T-22); der Lösungsweg bleibt reiner Text.
import type { Generator, Sprachobjekt } from '../../../core/learning/generator';
import { fehlerbilderAus } from '../../../core/learning/loesung';
import { zahlText } from '../../../core/learning/text';
import { rng, type Rng } from '../../../core/rng/rng';
import { auswahl, de, mische, verlange, zahl } from '../../hilfen';

const HOCH = ['⁰', '¹', '²', '³', '⁴', '⁵', '⁶', '⁷', '⁸', '⁹'];
/** „³√27“ für den Lösungsweg (reiner Text) */
export const wurzelText = (n: number, radikand: number) =>
  `${n === 2 ? '' : (HOCH[n] ?? '')}√${zahlText(radikand)}`;
/** LaTeX für die Aufgabe: \sqrt{144}, \sqrt[3]{-8} */
export const wurzelTex = (n: number, radikand: number) =>
  `${n === 2 ? '\\sqrt' : `\\sqrt[${n}]`}{${radikand}}`;
const malSelbst = (b: number, n: number) =>
  Array.from({ length: n }, () => (b < 0 ? `(${zahlText(b)})` : zahlText(b))).join(' · ');

// ---------------------------------------------------------------------------
// Wurzeln berechnen (M.ZO.PW.WURZEL.BERECHNEN)

export interface WurzelParameter {
  /** erlaubte Wurzelexponenten, z. B. [2, 3] oder [2, 3, 4, 5] */
  readonly exponenten: readonly number[];
  /** auch ungerade Wurzeln aus negativen Zahlen (³√−8 = −2) */
  readonly negativ: boolean;
}

/** größte Basis je Exponent, damit die Zahlen im Kopf gehen */
const MAX_BASIS: Readonly<Record<number, number>> = { 2: 20, 3: 10, 4: 6, 5: 4 };

/** „Berechne ³√27“ – die Wurzel geht immer auf */
export const pwWurzel: Generator<WurzelParameter> = {
  id: 'pw.wurzel',
  version: 1,
  platzhalter: ['term', 'radikand', 'n'],
  fehlerbildIds: ['halbiert', 'durch-n', 'vorzeichen-vergessen'],

  erzeuge(seed, p) {
    verlange(
      p.exponenten.length > 0 && p.exponenten.every((n) => n in MAX_BASIS),
      'exponenten: 2 … 5',
    );
    const r = rng(seed);
    const n = r.pick(p.exponenten);
    const basis = r.int(2, MAX_BASIS[n] ?? 2);
    const negativ = p.negativ && n % 2 === 1 && r.int(0, 2) === 0;
    const b = negativ ? -basis : basis;
    const radikand = b ** n;
    const richtig = zahl(b);
    return {
      platzhalter: { term: de(wurzelTex(n, radikand)), radikand, n },
      vorzeichen: p.negativ,
      loesung: richtig,
      loesungsweg: [
        de(
          n === 2
            ? `Gesucht ist die Zahl ab 0, die mit sich selbst malgenommen ${zahlText(radikand)} ergibt.`
            : `Gesucht ist die Zahl, die ${n}-mal mit sich selbst malgenommen ${zahlText(radikand)} ergibt.`,
        ),
        de(
          `${malSelbst(b, n)} = ${zahlText(radikand)}, also ist ${wurzelText(n, radikand)} = ${zahlText(b)}.`,
        ),
      ],
      fehlerbilder: fehlerbilderAus(richtig, [
        ['halbiert', n === 2 ? zahl(radikand / 2) : undefined],
        ['durch-n', n > 2 && radikand % n === 0 ? zahl(radikand / n) : undefined],
        ['vorzeichen-vergessen', negativ ? zahl(basis) : undefined],
      ]),
    };
  },
};

// ---------------------------------------------------------------------------
// Wurzeln abschätzen (M.ZO.PW.WURZEL.ZWISCHEN), Aufgabentyp felder-eingabe

export interface ZwischenParameter {
  /** 2: Quadratwurzel, 3: Kubikwurzel */
  readonly n: 2 | 3;
  /** größter Radikand */
  readonly max: number;
}

/** „Zwischen welchen zwei aufeinanderfolgenden ganzen Zahlen liegt √50?“ */
export const pwZwischen: Generator<ZwischenParameter> = {
  id: 'pw.wurzel-zwischen',
  version: 1,
  platzhalter: ['term', 'radikand'],
  fehlerbildIds: ['halbiert', 'potenzen-statt-wurzeln', 'eins-zu-gross'],

  erzeuge(seed, p) {
    verlange(p.n === 2 || p.n === 3, 'n: 2 oder 3');
    verlange(p.max >= 10 && p.max <= 1000, 'max: 10 … 1000');
    const r = rng(seed);
    let radikand: number;
    let k: number;
    do {
      radikand = r.int(3, p.max);
      k = Math.floor(Math.round(radikand ** (1 / p.n) * 1e9) / 1e9);
    } while (k ** p.n === radikand || (k + 1) ** p.n === radikand);
    const richtig = { typ: 'felder', wert: [k, k + 1] } as const;
    const pot = (x: number) => zahlText(x ** p.n);
    return {
      platzhalter: { term: de(wurzelTex(p.n, radikand)), radikand },
      felder: { namen: [de('kleinere Zahl:'), de('größere Zahl:')] },
      loesung: richtig,
      loesungsweg: [
        de(
          `Suche die ${p.n === 2 ? 'Quadratzahlen' : 'Kubikzahlen'} links und rechts von ${zahlText(radikand)}: ${pot(k)} < ${zahlText(radikand)} < ${pot(k + 1)}.`,
        ),
        de(
          `${wurzelText(p.n, k ** p.n)} = ${k} und ${wurzelText(p.n, (k + 1) ** p.n)} = ${k + 1}, also liegt ${wurzelText(p.n, radikand)} zwischen ${k} und ${k + 1}.`,
        ),
      ],
      fehlerbilder: fehlerbilderAus(richtig, [
        [
          'halbiert',
          p.n === 2
            ? { typ: 'felder', wert: [Math.floor(radikand / 2), Math.floor(radikand / 2) + 1] }
            : undefined,
        ],
        ['potenzen-statt-wurzeln', { typ: 'felder', wert: [k ** p.n, (k + 1) ** p.n] }],
        ['eins-zu-gross', { typ: 'felder', wert: [k + 1, k + 2] }],
      ]),
    };
  },
};

// ---------------------------------------------------------------------------
// Stimmt das immer? (M.ZO.PW.WURZEL.AUSSAGE, Niveau E)

interface Aussage {
  readonly tex: string;
  readonly richtig: string;
  readonly falsch: readonly (readonly [string, string])[];
  readonly weg: readonly string[];
}

const TRIPEL = [
  [3, 4, 5],
  [6, 8, 10],
  [5, 12, 13],
  [8, 15, 17],
] as const;
const KLEIN = [
  [0.25, 0.5],
  [0.04, 0.2],
  [0.09, 0.3],
  [0.36, 0.6],
] as const;

function aussage(r: Rng): Aussage {
  const art = r.int(0, 2);
  if (art === 0) {
    const [x, y, z] = r.pick(TRIPEL);
    return {
      tex: '\\sqrt{a+b} = \\sqrt{a} + \\sqrt{b}',
      richtig: `Nein. Gegenbeispiel: $\\sqrt{${x * x}+${y * y}} = ${z}$, aber $\\sqrt{${x * x}} + \\sqrt{${y * y}} = ${x + y}$.`,
      falsch: [
        ['summe-auseinander', 'Ja, die Wurzel darf man auf jeden Summanden einzeln ziehen.'],
        ['nur-positiv', 'Ja, solange a und b positiv sind.'],
        ['bestaetigendes-beispiel', 'Nein. Gegenbeispiel: a = 0 und b = 4.'],
      ],
      weg: [
        `Ein Gegenbeispiel genügt: a = ${x * x}, b = ${y * y}.`,
        `√(${x * x} + ${y * y}) = √${z * z} = ${z}, aber √${x * x} + √${y * y} = ${x} + ${y} = ${x + y}.`,
      ],
    };
  }
  if (art === 1) {
    const k = r.int(2, 9);
    return {
      tex: '\\sqrt{x^2} = x',
      richtig: `Nur für $x \\geq 0$. Für $x = -${k}$ ist $\\sqrt{(-${k})^2} = ${k}$.`,
      falsch: [
        ['betrag-vergessen', 'Ja, für alle Zahlen x – Quadrieren und Wurzelziehen heben sich auf.'],
        ['vorzeichen-verdreht', 'Nur für $x \\leq 0$.'],
        ['bestaetigendes-beispiel', `Nein. Gegenbeispiel: x = ${k}.`],
      ],
      weg: [
        `Probiere eine negative Zahl: x = −${k}.`,
        `(−${k})² = ${k * k} und √${k * k} = ${k}, nicht −${k}. Die Wurzel ist nie negativ.`,
      ],
    };
  }
  const [x, w] = r.pick(KLEIN);
  const k = r.int(2, 9);
  return {
    tex: '\\sqrt{x} < x \\text{ für alle } x > 0',
    richtig:
      `Nein. Für $x = ${zahlText(x)}$ ist $\\sqrt{x} = ${zahlText(w)}$, also größer als x.`.replace(
        /(\d),(\d)/g,
        '$1{,}$2',
      ),
    falsch: [
      ['macht-kleiner', 'Ja, Wurzelziehen macht Zahlen immer kleiner.'],
      [
        'bestaetigendes-beispiel',
        `Nein. Gegenbeispiel: x = ${k * k}, denn $\\sqrt{${k * k}} = ${k}$.`,
      ],
      ['nur-ganze', 'Ja, denn x muss größer als 0 sein.'],
    ],
    weg: [
      'Probiere eine Zahl zwischen 0 und 1.',
      `√${zahlText(x)} = ${zahlText(w)}, denn ${zahlText(w)} · ${zahlText(w)} = ${zahlText(x)}. Und ${zahlText(w)} > ${zahlText(x)}.`,
    ],
  };
}

/** „Stimmt das immer?“ – Aussage über Wurzeln, vier Antworten mit Begründung */
export const pwWurzelAussage: Generator<Record<string, never>> = {
  id: 'pw.wurzel-aussage',
  version: 1,
  platzhalter: ['aussage'],
  fehlerbildIds: [
    'summe-auseinander',
    'nur-positiv',
    'betrag-vergessen',
    'vorzeichen-verdreht',
    'macht-kleiner',
    'nur-ganze',
    'bestaetigendes-beispiel',
  ],

  erzeuge(seed) {
    const r = rng(seed);
    const a = aussage(r);
    const liste = mische(r, [['richtig', a.richtig] as const, ...a.falsch]);
    const index = (id: string) => auswahl(liste.findIndex(([x]) => x === id));
    const richtig = index('richtig');
    return {
      platzhalter: { aussage: de(a.tex) },
      optionen: liste.map(([, t]) => ({ text: de(t) satisfies Sprachobjekt })),
      loesung: richtig,
      loesungsweg: a.weg.map(de),
      fehlerbilder: a.falsch.map(([id]) => ({ id, antwort: index(id) })),
    };
  },
};
