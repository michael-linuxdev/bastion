// Quadratische Gleichungen – Klasse 9 (LEHRPLAN §8e, Feld QF): ohne Formel lösen (x² = a,
// (x − d)² = a, Produktform, Ausklammern), Anzahl der Lösungen über die Diskriminante, Lösungs-
// formel; Aussagen prüfen (Niveau E). Lösungen als zwei Felder, Reihenfolge egal, „keine Lösung“.
import type { Generator, Loesung, Sprachobjekt } from '../../../core/learning/generator';
import { fehlerbilderAus } from '../../../core/learning/loesung';
import { texZahl } from '../../../core/learning/text';
import { rng, type Rng } from '../../../core/rng/rng';
import { auswahl, de, mische, verlange } from '../../hilfen';
import { normalform } from './graph';

const felder = (w: readonly number[]): Loesung => ({
  typ: 'felder',
  wert: [...w].sort((a, b) => a - b),
});
const FELDER = {
  namen: [de('x₁ ='), de('x₂ =')],
  ungeordnet: true,
  keineLoesung: true,
} as const;
const pm = (r: Rng, max: number) => r.int(1, max) * (r.int(0, 1) === 0 ? -1 : 1);
/** „x - 3“ oder „x + 2“ in LaTeX */
const xMinus = (a: number) => (a === 0 ? 'x' : `x ${a > 0 ? '-' : '+'} ${Math.abs(a)}`);

// ---------------------------------------------------------------------------
// Ohne Formel lösen (M.SF.QF.INHALTLICH.LOESEN)

export type InhaltlichForm = 'quadrat' | 'verschoben' | 'produkt' | 'ausklammern';

export interface InhaltlichParameter {
  readonly formen: readonly InhaltlichForm[];
}

/** „Löse: x² = 49“, „(x − 2)² = 9“, „(x − 3)·(x + 5) = 0“, „x² − 6x = 0“ */
export const qfInhaltlich: Generator<InhaltlichParameter> = {
  id: 'qf.inhaltlich',
  version: 1,
  platzhalter: ['gleichung'],
  fehlerbildIds: ['halbiert', 'wurzel-negativ', 'vorzeichen-produkt', 'vorzeichen-ausklammern'],

  erzeuge(seed, p) {
    verlange(p.formen.length > 0, 'formen: mindestens eine');
    const r = rng(seed);
    const form = r.pick(p.formen);
    let gleichung: string;
    let loesung: Loesung;
    let weg: string[];
    const falsch: [string, Loesung | undefined][] = [];
    if (form === 'quadrat' || form === 'verschoben') {
      const w = r.int(1, 12);
      const negativ = r.int(0, 4) === 0;
      const a = negativ ? -w * w : w * w;
      const d = form === 'verschoben' ? pm(r, 6) : 0;
      gleichung = `${d === 0 ? 'x^2' : `(${xMinus(d)})^2`} = ${texZahl(a)}`;
      loesung = negativ ? felder([]) : felder([d - w, d + w]);
      weg = negativ
        ? [`Ein Quadrat ist nie negativ. $${gleichung}$ hat keine Lösung.`]
        : [
            `Welche Zahlen ergeben quadriert ${a}? $${w}$ und $${-w}$, denn $(\\pm ${w})^2 = ${a}$.`,
            ...(d === 0 ? [] : [`Also $${xMinus(d)} = ${w}$ oder $${xMinus(d)} = ${-w}$.`]),
            `$x_1 = ${texZahl(d - w)}$ und $x_2 = ${texZahl(d + w)}$.`,
          ];
      if (!negativ && a % 2 === 0 && a / 2 !== w)
        falsch.push(['halbiert', felder([d - a / 2, d + a / 2])]);
      if (negativ) falsch.push(['wurzel-negativ', felder([d - w, d + w])]);
    } else if (form === 'produkt') {
      let a = pm(r, 9);
      let b = pm(r, 9);
      if (a === b) b = -b;
      if (a === -b) a = a + 1 || 2;
      gleichung = `(${xMinus(a)}) \\cdot (${xMinus(b)}) = 0`;
      loesung = felder([a, b]);
      weg = [
        'Ein Produkt ist null, wenn einer der Faktoren null ist.',
        `$${xMinus(a)} = 0$ ergibt $x = ${texZahl(a)}$, $${xMinus(b)} = 0$ ergibt $x = ${texZahl(b)}$.`,
      ];
      falsch.push(['vorzeichen-produkt', felder([-a, -b])]);
    } else {
      const k = pm(r, 12);
      gleichung = `${normalform(-k, 0)} = 0`;
      loesung = felder([0, k]);
      weg = [
        `x ausklammern: $x \\cdot (${xMinus(k)}) = 0$.`,
        `Ein Faktor ist null: $x = 0$ oder $${xMinus(k)} = 0$, also $x = ${texZahl(k)}$.`,
      ];
      falsch.push(['vorzeichen-ausklammern', felder([0, -k])]);
    }
    return {
      platzhalter: { gleichung: de(gleichung) },
      vorzeichen: true,
      felder: FELDER,
      loesung,
      loesungsweg: weg.map(de),
      fehlerbilder: fehlerbilderAus(loesung, falsch),
    };
  },
};

// ---------------------------------------------------------------------------
// Stimmt das? (M.SF.QF.INHALTLICH.AUSSAGE, Niveau E)

interface Aussage {
  readonly text: string;
  readonly richtig: string;
  readonly falsch: readonly (readonly [string, string])[];
  readonly weg: readonly string[];
}

function inhaltlichAussage(r: Rng): Aussage {
  const art = r.int(0, 3);
  const w = r.int(2, 9);
  if (art === 0)
    return {
      text: `Aus $x^2 = ${w * w}$ folgt $x = ${w}$.`,
      richtig: `Nein. Auch $x = -${w}$ ist eine Lösung, denn $(-${w})^2 = ${w * w}$.`,
      falsch: [
        ['nur-positiv', `Ja. Die Wurzel aus ${w * w} ist ${w}.`],
        ['wurzel-negativ', `Nein. Richtig ist nur $x = -${w}$.`],
        ['beispiel', `Ja, die Probe zeigt: $${w}^2 = ${w * w}$.`],
      ],
      weg: [
        'Gesucht sind alle Zahlen, die quadriert $' + w * w + '$ ergeben.',
        `Das sind $${w}$ und $-${w}$. Die Wurzel liefert nur die positive, die Gleichung hat aber zwei Lösungen.`,
      ],
    };
  if (art === 1)
    return {
      text: `$x^2 = -${w * w}$ hat die Lösungen ${w} und $-${w}$.`,
      richtig: 'Nein. Ein Quadrat ist nie negativ, also gibt es keine Lösung.',
      falsch: [
        ['wurzel-negativ', 'Ja, man zieht die Wurzel und setzt ± davor.'],
        ['nur-positiv', `Nein. Die einzige Lösung ist ${w}.`],
        ['beispiel', `Ja, denn $${w}^2 = ${w * w}$.`],
      ],
      weg: [
        'Jede Zahl mit sich selbst malgenommen ergibt null oder etwas Positives.',
        `$${w}^2 = ${w * w}$ und $(-${w})^2 = ${w * w}$, nie $-${w * w}$.`,
      ],
    };
  if (art === 2)
    return {
      text: `$x^2 = ${w}x$. Teilt man durch x, folgt $x = ${w}$. Das ist die einzige Lösung.`,
      richtig: `Nein. Auch $x = 0$ ist eine Lösung. Beim Teilen durch x geht sie verloren.`,
      falsch: [
        ['durch-x', 'Ja. Teilen durch x ist eine erlaubte Umformung.'],
        ['vorzeichen-ausklammern', `Nein. Die Lösungen sind 0 und $-${w}$.`],
        ['beispiel', `Ja, denn $${w}^2 = ${w} \\cdot ${w}$.`],
      ],
      weg: [
        `Ausklammern statt teilen: $x^2 - ${w}x = x \\cdot (x - ${w}) = 0$.`,
        `Also $x = 0$ oder $x = ${w}$. Durch x darf man nur teilen, wenn x nicht 0 ist.`,
      ],
    };
  const a = r.int(1, 6);
  const b = r.int(1, 6);
  return {
    text: `$(x - ${a}) \\cdot (x + ${b}) = 0$ hat die Lösungen ${a} und $-${b}$.`,
    richtig: 'Ja. Ein Produkt ist null, wenn ein Faktor null ist.',
    falsch: [
      ['vorzeichen-produkt', `Nein. Die Lösungen sind $-${a}$ und ${b}.`],
      ['ausmultiplizieren', 'Nein. Man muss erst ausmultiplizieren, vorher kann man nichts sagen.'],
      ['immer-zwei', 'Ja, weil jede quadratische Gleichung zwei Lösungen hat.'],
    ],
    weg: [
      `$x - ${a} = 0$ für $x = ${a}$, und $x + ${b} = 0$ für $x = -${b}$.`,
      'In beiden Fällen ist ein Faktor null, also das ganze Produkt.',
    ],
  };
}

/** „Stimmt das?“ – Aussagen zum Lösen ohne Formel */
export const qfInhaltlichAussage: Generator<Record<string, never>> = {
  id: 'qf.inhaltlich-aussage',
  version: 1,
  platzhalter: ['aussage'],
  fehlerbildIds: [
    'nur-positiv',
    'wurzel-negativ',
    'beispiel',
    'durch-x',
    'vorzeichen-ausklammern',
    'vorzeichen-produkt',
    'ausmultiplizieren',
    'immer-zwei',
  ],

  erzeuge(seed) {
    const r = rng(seed);
    const a = inhaltlichAussage(r);
    const liste = mische(r, [['richtig', a.richtig] as const, ...a.falsch]);
    const index = (id: string) => auswahl(liste.findIndex(([x]) => x === id));
    return {
      platzhalter: { aussage: de(a.text) },
      optionen: liste.map(([, t]) => ({ text: de(t) satisfies Sprachobjekt })),
      loesung: index('richtig'),
      loesungsweg: a.weg.map(de),
      fehlerbilder: a.falsch.map(([id]) => ({ id, antwort: index(id) })),
    };
  },
};

// ---------------------------------------------------------------------------
// Anzahl der Lösungen (M.SF.QF.FORMEL.ANZAHL)

/** Normalform mit ganzzahligem p und q: zufällig keine, eine oder zwei Lösungen */
function normalGleichung(r: Rng): { p: number; q: number } {
  const art = r.int(0, 2);
  const h = pm(r, 5); // p/2
  const p = 2 * h;
  if (art === 0) return { p, q: h * h + r.int(1, 9) }; // D < 0
  if (art === 1) return { p, q: h * h }; // D = 0
  return { p, q: h * h - r.pick([1, 4, 9, 16, 2, 3, 5]) }; // D > 0
}

const ANZAHL = ['keine Lösung', 'genau eine Lösung', 'zwei Lösungen'] as const;
const anzahl = (d: number) => (d < 0 ? 0 : d === 0 ? 1 : 2);

/** „Wie viele Lösungen hat x² + 6x + 9 = 0?“ */
export const qfAnzahl: Generator<Record<string, never>> = {
  id: 'qf.anzahl',
  version: 1,
  platzhalter: ['gleichung'],
  fehlerbildIds: ['q-vorzeichen', 'p-nicht-halbiert', 'immer-zwei'],

  erzeuge(seed) {
    const r = rng(seed);
    const { p, q } = normalGleichung(r);
    const h = p / 2;
    const d = h * h - q;
    const richtig = anzahl(d);
    // „immer zwei“ zuerst: die häufigste Annahme, wenn es keine oder eine Lösung gibt
    const kandidaten: [string, number][] = [
      ['immer-zwei', 2],
      ['q-vorzeichen', anzahl(h * h + q)],
      ['p-nicht-halbiert', anzahl(p * p - q)],
    ];
    // Je falscher Anzahl nur ein Fehlerbild, nie die richtige
    const fehler: { id: string; antwort: Loesung }[] = [];
    for (const [id, k] of kandidaten)
      if (k !== richtig && !fehler.some((f) => f.antwort.typ === 'auswahl' && f.antwort.wert === k))
        fehler.push({ id, antwort: auswahl(k) });
    return {
      platzhalter: { gleichung: de(`${normalform(p, q)} = 0`) },
      optionen: ANZAHL.map((t) => ({ text: de(t) })),
      loesung: auswahl(richtig),
      loesungsweg: [
        de('Die Diskriminante entscheidet: $D = \\left(\\frac{p}{2}\\right)^2 - q$.'),
        de(`Hier: $D = ${h < 0 ? `(${h})` : h}^2 - ${q < 0 ? `(${q})` : q} = ${d}$.`),
        de(
          d < 0
            ? 'D ist negativ: keine Lösung.'
            : d === 0
              ? 'D ist null: genau eine Lösung.'
              : 'D ist positiv: zwei Lösungen.',
        ),
      ],
      fehlerbilder: fehler,
    };
  },
};

// ---------------------------------------------------------------------------
// Lösungsformel (M.SF.QF.FORMEL.LOESEN)

export interface FormelParameter {
  /** auch a·x² + b·x + c = 0 mit a ≠ 1 (erst durch a teilen) */
  readonly normieren: boolean;
}

/** „Löse: x² − 2x − 15 = 0“ oder „2x² − 4x − 30 = 0“ */
export const qfFormel: Generator<FormelParameter> = {
  id: 'qf.formel',
  version: 1,
  platzhalter: ['gleichung'],
  fehlerbildIds: ['vorzeichen-p', 'q-vorzeichen', 'nicht-normiert', 'keine-statt-zwei'],

  erzeuge(seed, p) {
    const r = rng(seed);
    const keine = r.int(0, 5) === 0;
    let x1 = pm(r, 9);
    let x2 = pm(r, 9);
    if (x1 === x2) x2 = x1 > 0 ? x1 - 10 : x1 + 10;
    if (x1 === -x2) x1 = x1 + (x1 > 0 ? 1 : -1);
    // x² + p·x + q = (x − x1)(x − x2)
    let pp = -(x1 + x2);
    let q = x1 * x2;
    if (keine) {
      const h = pm(r, 4);
      pp = 2 * h;
      q = h * h + r.int(1, 8);
    }
    const a = p.normieren ? r.pick([2, 3, -1, -2]) : 1;
    const gleichung =
      a === 1 ? `${normalform(pp, q)} = 0` : `${texKoeffizienten(a, a * pp, a * q)} = 0`;
    const loesung = keine ? felder([]) : felder([x1, x2]);
    const h = pp / 2;
    const d = h * h - q;
    const wurzelD = Math.sqrt(d);
    const falsch: [string, Loesung | undefined][] = [
      ['vorzeichen-p', keine ? undefined : felder([-x1, -x2])],
      ['keine-statt-zwei', keine ? undefined : felder([])],
    ];
    // q mit falschem Vorzeichen: Lösungen von x² + p·x − q, wenn ganzzahlig
    const d2 = h * h + q;
    const w2 = Math.sqrt(d2);
    if (d2 > 0 && Number.isInteger(w2) && Number.isInteger(-h + w2))
      falsch.push(['q-vorzeichen', felder([-h - w2, -h + w2])]);
    // Nicht durch a geteilt: x² + (a·p)·x + a·q
    if (a !== 1) {
      const h3 = (a * pp) / 2;
      const d3 = h3 * h3 - a * q;
      const w3 = Math.sqrt(d3);
      if (d3 > 0 && Number.isInteger(w3) && Number.isInteger(h3))
        falsch.push(['nicht-normiert', felder([-h3 - w3, -h3 + w3])]);
    }
    return {
      platzhalter: { gleichung: de(gleichung) },
      vorzeichen: true,
      felder: FELDER,
      loesung,
      loesungsweg: [
        ...(a === 1 ? [] : [de(`Erst durch $${texZahl(a)}$ teilen: $${normalform(pp, q)} = 0$.`)]),
        de(
          `$p = ${texZahl(pp)}$, $q = ${texZahl(q)}$. Lösungsformel: $x_{1,2} = -\\frac{p}{2} \\pm \\sqrt{\\left(\\frac{p}{2}\\right)^2 - q}$.`,
        ),
        de(`$D = ${texZahl(h * h)} - ${q < 0 ? `(${texZahl(q)})` : texZahl(q)} = ${texZahl(d)}$.`),
        de(
          keine
            ? 'D ist negativ: keine Lösung.'
            : `$x_{1,2} = ${texZahl(-h)} \\pm ${texZahl(wurzelD)}$, also $x_1 = ${texZahl(Math.min(x1, x2))}$ und $x_2 = ${texZahl(Math.max(x1, x2))}$.`,
        ),
      ],
      fehlerbilder: fehlerbilderAus(loesung, falsch),
    };
  },
};

/** a·x² + b·x + c in LaTeX, a ≠ 1 */
function texKoeffizienten(a: number, b: number, c: number): string {
  const erst = a === -1 ? '-x^2' : `${texZahl(a)}x^2`;
  const glied = (k: number, v: string) =>
    k === 0 ? '' : ` ${k > 0 ? '+' : '-'} ${Math.abs(k) === 1 && v ? '' : Math.abs(k)}${v}`;
  return `${erst}${glied(b, 'x')}${glied(c, '')}`;
}

// ---------------------------------------------------------------------------
// Stimmt das? (M.SF.QF.FORMEL.AUSSAGE, Niveau E)

function formelAussage(r: Rng): Aussage {
  const art = r.int(0, 3);
  const h = r.int(1, 5);
  if (art === 0)
    return {
      text: `$${normalform(2 * h, h * h)} = 0$ hat zwei Lösungen, weil jede quadratische Gleichung zwei hat.`,
      richtig: `Nein. $D = ${h * h} - ${h * h} = 0$, es gibt genau eine Lösung: $x = -${h}$.`,
      falsch: [
        ['immer-zwei', 'Ja. Die Lösungsformel liefert immer $x_1$ und $x_2$.'],
        [
          'q-vorzeichen',
          `Nein. $D = ${h * h} + ${h * h}$ ist positiv, also gibt es zwei, aber aus einem anderen Grund.`,
        ],
        ['beispiel', `Ja, zum Beispiel hat $x^2 - ${h * h} = 0$ zwei Lösungen.`],
      ],
      weg: [
        `$${normalform(2 * h, h * h)} = (x + ${h})^2$.`,
        `$(x + ${h})^2 = 0$ nur für $x = -${h}$. Die Diskriminante ist 0.`,
      ],
    };
  if (art === 1)
    return {
      text: 'Ist q negativ, hat $x^2 + px + q = 0$ immer zwei Lösungen.',
      richtig:
        'Ja. $\\left(\\frac{p}{2}\\right)^2$ ist nie negativ. Zieht man ein negatives q ab, wird D positiv.',
      falsch: [
        ['q-vorzeichen', 'Nein. Ist q negativ, ist D negativ, also gibt es keine Lösung.'],
        ['beispiel', 'Nein, $x^2 + 2x - 3 = 0$ hat nur die Lösung 1.'],
        ['p-entscheidet', 'Das hängt nur von p ab, nicht von q.'],
      ],
      weg: [
        '$D = \\left(\\frac{p}{2}\\right)^2 - q$. Der erste Teil ist mindestens 0.',
        'Minus eine negative Zahl heißt plus: D ist größer als 0, also zwei Lösungen.',
      ],
    };
  if (art === 2) {
    const a = r.int(1, 4);
    const b = a + r.int(1, 4);
    return {
      text: `Ist q positiv, hat $x^2 + px + q = 0$ keine Lösung.`,
      richtig: `Nein. $${normalform(-(a + b), a * b)} = 0$ hat q = ${a * b} und die Lösungen ${a} und ${b}.`,
      falsch: [
        ['q-vorzeichen', 'Ja. Ein positives q macht D negativ.'],
        ['beispiel', 'Ja, zum Beispiel hat $x^2 + 4 = 0$ keine Lösung.'],
        ['immer-zwei', 'Nein. Sie hat immer zwei Lösungen.'],
      ],
      weg: [
        'Ein einziges Gegenbeispiel genügt.',
        `$(x - ${a}) \\cdot (x - ${b}) = ${normalform(-(a + b), a * b)}$: q ist positiv, trotzdem gibt es zwei Lösungen.`,
      ],
    };
  }
  const w = r.int(2, 6);
  return {
    text: `$x^2 + ${w * w} = 0$ hat die Lösungen ${w} und $-${w}$.`,
    richtig: `Nein. $x^2 = -${w * w}$, und ein Quadrat ist nie negativ. Keine Lösung.`,
    falsch: [
      ['wurzel-negativ', 'Ja. Wurzel ziehen und ± davorsetzen.'],
      ['immer-zwei', 'Ja, weil jede quadratische Gleichung zwei Lösungen hat.'],
      ['q-vorzeichen', `Nein. Die Lösungen sind ${w * w} und $-${w * w}$.`],
    ],
    weg: [
      `Umformen: $x^2 = -${w * w}$.`,
      `Auch mit der Formel: $D = 0 - ${w * w} < 0$. Keine Lösung.`,
    ],
  };
}

/** „Stimmt das?“ – Aussagen zur Anzahl der Lösungen */
export const qfFormelAussage: Generator<Record<string, never>> = {
  id: 'qf.formel-aussage',
  version: 1,
  platzhalter: ['aussage'],
  fehlerbildIds: ['immer-zwei', 'q-vorzeichen', 'beispiel', 'p-entscheidet', 'wurzel-negativ'],

  erzeuge(seed) {
    const r = rng(seed);
    const a = formelAussage(r);
    const liste = mische(r, [['richtig', a.richtig] as const, ...a.falsch]);
    const index = (id: string) => auswahl(liste.findIndex(([x]) => x === id));
    return {
      platzhalter: { aussage: de(a.text) },
      optionen: liste.map(([, t]) => ({ text: de(t) satisfies Sprachobjekt })),
      loesung: index('richtig'),
      loesungsweg: a.weg.map(de),
      fehlerbilder: a.falsch.map(([id]) => ({ id, antwort: index(id) })),
    };
  },
};
