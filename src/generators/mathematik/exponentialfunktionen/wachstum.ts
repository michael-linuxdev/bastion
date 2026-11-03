// Exponentielles Wachstum – Klasse 10 (LEHRPLAN §8f, Feld EX): lineares und exponentielles
// Wachstum unterscheiden, Wachstumsfaktor, Exponentialfunktionen, Wachstum und Zerfall.
// Formeln in LaTeX für KaTeX.
import type { Generator } from '../../../core/learning/generator';
import { fehlerbilderAus } from '../../../core/learning/loesung';
import { texZahl, zahlText } from '../../../core/learning/text';
import { rng, type Rng } from '../../../core/rng/rng';
import { aussagenGenerator } from '../../aussagen';
import { auswahl, de, mische, zahl } from '../../hilfen';
import { bild, kreis, koordinatensystemBereich, kurve } from '../../svg';

/** Auf 6 Stellen runden, damit 1,1³ = 1,331 genau bleibt */
const genau = (x: number) => Math.round(x * 1e6) / 1e6;
const zt = (x: number) => zahlText(genau(x));

/** Wertetabelle x = 0 … 3 als KaTeX-Feld */
export function tabelle(ys: readonly number[]): string {
  const xs = ys.map((_, i) => i);
  return `\\begin{array}{c|${'c'.repeat(ys.length)}} x & ${xs.join(' & ')} \\\\ \\hline y & ${ys.map((y) => texZahl(genau(y))).join(' & ')} \\end{array}`;
}

export type Modell = 'linear' | 'exponentiell' | 'weder';

/** Tabelle zu einem Modell: linear y0 + d·x, exponentiell y0·qˣ, sonst y0 + s·x² */
export function modellTabelle(r: Rng, modell: Modell): number[] {
  for (;;) {
    const y0 = r.pick([2, 3, 4, 5, 8, 10, 20, 40, 50, 100, 160]);
    let ys: number[];
    if (modell === 'linear') {
      const d = r.pick([-1, 1]) * r.int(2, 20);
      ys = [0, 1, 2, 3].map((x) => y0 + d * x);
    } else if (modell === 'exponentiell') {
      const q = r.pick([2, 3, 0.5, 1.5]);
      ys = [0, 1, 2, 3].map((x) => genau(y0 * q ** x));
    } else {
      const s = r.int(1, 4);
      ys = [0, 1, 2, 3].map((x) => y0 + s * x * x);
    }
    // ganze oder halbe Zahlen, nichts unter 0
    if (ys.every((y) => y >= 0 && Number.isInteger(y * 2))) return ys;
  }
}

/** Art eines Tabellenverlaufs aus den Zahlen bestimmen (für Tests und Lösungsweg) */
export function erkenneModell(ys: readonly number[]): Modell {
  const diff = ys.slice(1).map((y, i) => genau(y - (ys[i] ?? 0)));
  if (diff.every((d) => d === diff[0])) return 'linear';
  const quot = ys.slice(1).map((y, i) => genau(y / (ys[i] ?? 1)));
  if (quot.every((q) => q === quot[0])) return 'exponentiell';
  return 'weder';
}

const MODELL_TEXT: Readonly<Record<Modell, string>> = {
  linear: 'linear: Es kommt immer dieselbe Zahl dazu.',
  exponentiell: 'exponentiell: Es wird immer mit derselben Zahl malgenommen.',
  weder: 'weder linear noch exponentiell',
};

// ---------------------------------------------------------------------------
// Wachstumsart aus der Tabelle (M.SF.EX.WACHSTUM.ART, Niveau G)

export interface WachstumArtParameter {
  /** auch Tabellen, die weder linear noch exponentiell sind */
  readonly weder: boolean;
}

/** „Welche Art von Wachstum zeigt die Tabelle?“ */
export const exWachstumArt: Generator<WachstumArtParameter> = {
  id: 'ex.wachstum-art',
  version: 1,
  platzhalter: ['tabelle'],
  fehlerbildIds: ['additiv-gesehen', 'multiplikativ-gesehen', 'weder-gewaehlt'],

  erzeuge(seed, p) {
    const r = rng(seed);
    const arten: Modell[] = p.weder
      ? ['linear', 'exponentiell', 'weder']
      : ['linear', 'exponentiell'];
    const modell = r.pick(arten);
    const ys = modellTabelle(r, modell);
    const optionen = mische(r, arten);
    const richtig = auswahl(optionen.indexOf(modell));
    const index = (m: Modell) =>
      optionen.includes(m) && m !== modell ? auswahl(optionen.indexOf(m)) : undefined;
    const diff = ys.slice(1).map((y, i) => zt(y - (ys[i] ?? 0)));
    const quot = ys.slice(1).map((y, i) => {
      const q = y / (ys[i] ?? 1);
      const g = Math.round(q * 100) / 100;
      return Math.abs(g - q) < 1e-9 ? zt(q) : `etwa ${zt(g)}`;
    });
    return {
      platzhalter: { tabelle: de(tabelle(ys)) },
      optionen: optionen.map((m) => ({ text: de(MODELL_TEXT[m]) })),
      loesung: richtig,
      loesungsweg: [
        de(`Unterschiede von Spalte zu Spalte: ${diff.join('; ')}.`),
        de(`Quotienten von Spalte zu Spalte: ${quot.join('; ')}.`),
        de(
          modell === 'linear'
            ? 'Die Unterschiede sind gleich: linear.'
            : modell === 'exponentiell'
              ? 'Die Quotienten sind gleich: exponentiell.'
              : 'Weder die Unterschiede noch die Quotienten sind gleich.',
        ),
      ],
      fehlerbilder: fehlerbilderAus(richtig, [
        ['additiv-gesehen', index('linear')],
        ['multiplikativ-gesehen', index('exponentiell')],
        ['weder-gewaehlt', index('weder')],
      ]),
    };
  },
};

// ---------------------------------------------------------------------------
// Wachstumsfaktor und Bestand nach n Schritten (M.SF.EX.WACHSTUM.FAKTOR, Niveau M)

export interface FaktorParameter {
  /** auch Abnahme um p % */
  readonly abnahme: boolean;
}

interface FaktorAufgabe {
  readonly b: number;
  readonly p: number;
  readonly n: number;
  readonly ab: boolean;
  readonly q: number;
  readonly ende: number;
}

function faktorAufgabe(seed: number, p: FaktorParameter): FaktorAufgabe {
  const r = rng(seed);
  const ab = p.abnahme && r.int(0, 1) === 1;
  const b = r.pick([100, 200, 500, 1000, 2000, 5000]);
  const pz = r.pick([10, 20, 50]);
  const n = r.int(2, 3);
  const q = genau(ab ? 1 - pz / 100 : 1 + pz / 100);
  return { b, p: pz, n, ab, q, ende: genau(b * q ** n) };
}

/** „Ein Bestand von 500 wächst jährlich um 20 %. Wie groß ist er nach 3 Jahren?“ */
export const exFaktor: Generator<FaktorParameter> = {
  id: 'ex.faktor',
  version: 1,
  platzhalter: ['satz', 'bestand', 'prozent', 'jahre'],
  fehlerbildIds: ['faktor-prozent', 'linear', 'abnahme-faktor', 'hochzahl-mal'],
  schritte: [
    { id: 'faktor', fehlerbildIds: ['faktor-prozent', 'abnahme-faktor'] },
    { id: 'wert', fehlerbildIds: ['linear', 'hochzahl-mal'], platzhalter: ['faktor'] },
  ],

  erzeuge(seed, p) {
    const a = faktorAufgabe(seed, p);
    const richtig = zahl(a.ende);
    const anders = genau(a.ab ? 1 + a.p / 100 : 1 - a.p / 100);
    return {
      platzhalter: {
        satz: de(
          `Ein Bestand von ${a.b} Tieren ${a.ab ? 'nimmt' : 'wächst'} jedes Jahr um ${a.p} %${a.ab ? ' ab' : ''}. Wie groß ist er nach ${a.n} Jahren?`,
        ),
        bestand: a.b,
        prozent: a.p,
        jahre: a.n,
      },
      loesung: richtig,
      loesungsweg: [
        de(`Wachstumsfaktor: $q = 1 ${a.ab ? '-' : '+'} \\frac{${a.p}}{100} = ${texZahl(a.q)}$.`),
        de(`Nach ${a.n} Jahren: $${a.b} \\cdot ${texZahl(a.q)}^{${a.n}} = ${texZahl(a.ende)}$.`),
      ],
      fehlerbilder: fehlerbilderAus(richtig, [
        ['faktor-prozent', zahl(genau(a.b * (a.p / 100) ** a.n))],
        ['linear', zahl(genau(a.b + (a.ab ? -1 : 1) * a.n * a.b * (a.p / 100)))],
        ['abnahme-faktor', a.ab ? zahl(genau(a.b * anders ** a.n)) : undefined],
        ['hochzahl-mal', zahl(genau(a.b * a.q * a.n))],
      ]),
    };
  },

  schritt(seed, p, id) {
    const a = faktorAufgabe(seed, p);
    if (id === 'faktor') {
      const loesung = zahl(a.q);
      return {
        loesung,
        fehlerbilder: fehlerbilderAus(loesung, [
          ['faktor-prozent', zahl(a.p / 100)],
          ['abnahme-faktor', a.ab ? zahl(genau(1 + a.p / 100)) : undefined],
        ]),
      };
    }
    const loesung = zahl(a.ende);
    return {
      platzhalter: { faktor: a.q },
      loesung,
      fehlerbilder: fehlerbilderAus(loesung, [
        ['linear', zahl(genau(a.b + (a.ab ? -1 : 1) * a.n * a.b * (a.p / 100)))],
        ['hochzahl-mal', zahl(genau(a.b * a.q * a.n))],
      ]),
    };
  },
};

// ---------------------------------------------------------------------------
// E: Modell begründen (M.SF.EX.WACHSTUM.BEGRUENDEN)

export const exModellAussage = aussagenGenerator(
  'ex.modell-aussage',
  ['modell', 'differenz-quotient'],
  ['y0', 'y1', 'y2', 'y3'],
  (r) => {
    const exp = r.int(0, 1) === 1;
    const ys = modellTabelle(r, exp ? 'exponentiell' : 'linear');
    const [y0 = 0, y1 = 0, y2 = 0, y3 = 0] = ys;
    const d = zt(y1 - y0);
    const q = zt(y1 / y0);
    return exp
      ? {
          situation: `Wertetabelle: x = 0, 1, 2, 3 ergibt y = ${ys.map(zt).join('; ')}. Tim sagt: „Das ist lineares Wachstum, denn y ändert sich bei jedem Schritt.“ Stimmt das?`,
          werte: { y0, y1, y2, y3 },
          richtig: `Nein. Die Quotienten sind immer gleich (${q}): Es wird jedes Mal mit ${q} malgenommen. Das ist exponentiell.`,
          falsch: [
            ['modell', 'Ja. Wenn sich y bei jedem Schritt ändert, ist das Wachstum linear.'],
            ['differenz-quotient', `Ja. Die Unterschiede sind immer gleich, also linear.`],
          ],
          weg: [
            `Quotienten: ${ys
              .slice(1)
              .map((y, i) => zt(y / (ys[i] ?? 1)))
              .join('; ')} – alle gleich.`,
            'Gleiche Quotienten: exponentiell. Gleiche Unterschiede: linear.',
          ],
        }
      : {
          situation: `Wertetabelle: x = 0, 1, 2, 3 ergibt y = ${ys.map(zt).join('; ')}. Tim sagt: „Das ist exponentielles Wachstum, denn y ${y1 > y0 ? 'wächst' : 'nimmt ab'}.“ Stimmt das?`,
          werte: { y0, y1, y2, y3 },
          richtig: `Nein. Die Unterschiede sind immer gleich (${d}): Es kommt jedes Mal dieselbe Zahl dazu. Das ist linear.`,
          falsch: [
            [
              'modell',
              `Ja. Was ${y1 > y0 ? 'wächst' : 'abnimmt'}, ${y1 > y0 ? 'wächst' : 'nimmt'} exponentiell${y1 > y0 ? '' : ' ab'}.`,
            ],
            ['differenz-quotient', 'Ja. Die Quotienten sind immer gleich, also exponentiell.'],
          ],
          weg: [
            `Unterschiede: ${ys
              .slice(1)
              .map((y, i) => zt(y - (ys[i] ?? 0)))
              .join('; ')} – alle gleich.`,
            'Gleiche Unterschiede: linear. Gleiche Quotienten: exponentiell.',
          ],
        };
  },
);

// ---------------------------------------------------------------------------
// Exponentialfunktionen f(x) = c · aˣ (M.SF.EX.FUNKTION)

export interface ExpFunktion {
  readonly c: number;
  readonly a: number;
}

const texA = (a: number) =>
  a === 0.5 ? '\\frac{1}{2}' : a === 1 / 3 ? '\\frac{1}{3}' : texZahl(a);
export const expTerm = (f: ExpFunktion) =>
  `${f.c === 1 ? '' : `${texZahl(f.c)} \\cdot `}${f.a < 1 ? `\\left(${texA(f.a)}\\right)` : texA(f.a)}^{x}`;

export function expBild(f: ExpFunktion): ReturnType<typeof bild> {
  const ymax = 9;
  const ks = koordinatensystemBereich(-4, 4, -1, ymax, 24);
  const g = (x: number) => f.c * f.a ** x;
  return bild(
    ks.breite,
    ks.hoehe,
    [
      ...ks.teile,
      kurve(ks, g, -4, 4, { ymin: -1, ymax }, 200),
      kreis(ks.px(0), ks.py(f.c), 3.5, true),
      ...(g(1) <= ymax ? [kreis(ks.px(1), ks.py(g(1)), 3.5, true)] : []),
    ],
    de(
      `Ein Koordinatensystem mit einem Exponentialgraphen. Er geht durch (0|${zt(f.c)}) und (1|${zt(g(1))}) und ${f.a > 1 ? 'steigt' : 'fällt'}.`,
    ),
  );
}

function expFunktion(r: Rng): ExpFunktion {
  const a = r.pick([2, 3, 0.5]);
  const c = r.pick(a === 3 ? [1, 2] : [1, 2, 3, 4]);
  return { c, a };
}

/** „Welcher Term gehört zum Graphen?“ (M.SF.EX.FUNKTION.GRAPH, Niveau G) */
export const exGraphWaehlen: Generator<Record<string, never>> = {
  id: 'ex.graph-waehlen',
  version: 1,
  platzhalter: ['c', 'a'],
  fehlerbildIds: ['c-a-vertauscht', 'abnahme-faktor', 'modell'],

  erzeuge(seed) {
    const r = rng(seed);
    for (;;) {
      const f = expFunktion(r);
      const kandidaten: [string, string][] = [
        ['richtig', expTerm(f)],
        ['c-a-vertauscht', f.c === 1 || f.a === 0.5 ? '' : expTerm({ c: f.a, a: f.c })],
        ['abnahme-faktor', expTerm({ c: f.c, a: f.a === 0.5 ? 2 : f.a === 2 ? 0.5 : 1 / 3 })],
        ['modell', `${texZahl(f.c)} + ${texZahl(f.a)}x`],
      ];
      const liste = mische(
        r,
        kandidaten.filter(([, t]) => t !== ''),
      );
      if (new Set(liste.map(([, t]) => t)).size !== liste.length) continue;
      const idx = (k: string) => {
        const i = liste.findIndex(([q]) => q === k);
        return i < 0 ? undefined : auswahl(i);
      };
      const richtig = auswahl(liste.findIndex(([q]) => q === 'richtig'));
      return {
        platzhalter: { c: f.c, a: f.a },
        bild: expBild(f),
        optionen: liste.map(([, t]) => ({ text: de(`$f(x) = ${t}$`) })),
        loesung: richtig,
        loesungsweg: [
          de(
            `Bei $x = 0$ liest du $y = ${texZahl(f.c)}$ ab: $c = ${texZahl(f.c)}$, denn $a^0 = 1$.`,
          ),
          de(
            `Von $x = 0$ zu $x = 1$ wird mit ${zt(f.a)} malgenommen: $a = ${texA(f.a)}$. Also $f(x) = ${expTerm(f)}$.`,
          ),
        ],
        fehlerbilder: fehlerbilderAus(richtig, [
          ['c-a-vertauscht', idx('c-a-vertauscht')],
          ['abnahme-faktor', idx('abnahme-faktor')],
          ['modell', idx('modell')],
        ]),
      };
    }
  },
};

/** „Welche Aussage über f(x) = c · aˣ stimmt?“ (M.SF.EX.FUNKTION.EIGENSCHAFT, Niveau M) */
export const exEigenschaft = aussagenGenerator(
  'ex.eigenschaft',
  ['asymptote', 'faktor-in-potenz', 'abnahme-faktor'],
  ['c', 'a', 'art'],
  (r) => {
    const f = expFunktion(r);
    const art = r.int(0, 2);
    const steigt = f.a > 1;
    const term = `$f(x) = ${expTerm(f)}$`;
    const wahr =
      [
        `Der Graph schneidet die y-Achse bei ${f.c}, denn $a^0 = 1$.`,
        `Der Graph ${steigt ? 'steigt' : 'fällt'}, denn $a = ${texA(f.a)}$ ist ${steigt ? 'größer' : 'kleiner'} als 1.`,
        'Der Graph kommt der x-Achse beliebig nahe, berührt sie aber nie.',
      ][art] ?? '';
    return {
      situation: `Gegeben ist ${term}. Welche Aussage stimmt?`,
      werte: { c: f.c, a: f.a, art },
      richtig: wahr,
      falsch: [
        ['asymptote', `Der Graph schneidet die x-Achse bei $x = ${steigt ? '-' : ''}${f.c + 3}$.`],
        // Bei c = 1 wäre (c · a)² richtig – dann fehlt diese Möglichkeit
        ...(f.c === 1
          ? []
          : ([
              [
                'faktor-in-potenz',
                `Es gilt $f(2) = ${texZahl(f.c * f.a)}^2 = ${texZahl(genau((f.c * f.a) ** 2))}$.`,
              ],
            ] as [string, string][])),
        [
          'abnahme-faktor',
          `Der Graph ${steigt ? 'fällt' : 'steigt'}, denn $a = ${texA(f.a)}$ ist ${steigt ? 'größer' : 'kleiner'} als 1.`,
        ],
      ],
      weg: [
        `$f(0) = ${texZahl(f.c)} \\cdot ${texA(f.a)}^0 = ${texZahl(f.c)}$.`,
        `$a^x$ ist immer größer als 0, also hat $f$ keine Nullstelle. Für $a ${steigt ? '> 1' : '< 1'}$ ${steigt ? 'steigt' : 'fällt'} der Graph.`,
      ],
    };
  },
);

/** E: „Der Graph schneidet irgendwann die x-Achse“ (M.SF.EX.FUNKTION.BEGRUENDEN) */
export const exAsymptoteAussage = aussagenGenerator(
  'ex.asymptote-aussage',
  ['asymptote', 'modell'],
  ['c', 'nenner'],
  (r) => {
    const c = r.pick([8, 16, 32, 64, 100]);
    const nenner = r.pick([2, 4, 10]);
    const halb = nenner === 2 ? '\\frac{1}{2}' : nenner === 4 ? '\\frac{1}{4}' : '0{,}1';
    return {
      situation: `Für $f(x) = ${c} \\cdot \\left(${halb}\\right)^{x}$ sagt Lea: „Der Graph fällt immer weiter. Irgendwann schneidet er die x-Achse.“ Stimmt das?`,
      werte: { c, nenner },
      richtig: `Nein. Eine Potenz mit positiver Basis ist immer größer als 0. Der Graph kommt der x-Achse nur beliebig nahe.`,
      falsch: [
        ['asymptote', 'Ja. Was immer weiter fällt, erreicht irgendwann die 0.'],
        [
          'modell',
          `Ja. Er fällt jedes Mal um ${zt(c - c / nenner)} und ist deshalb nach ${Math.ceil(c / (c - c / nenner)) + 1} Schritten unter 0.`,
        ],
      ],
      weg: [
        `$f(1) = ${zt(c / nenner)}$, $f(2) = ${zt(c / nenner ** 2)}$: Jeder Wert ist ${nenner === 10 ? 'ein Zehntel' : nenner === 2 ? 'die Hälfte' : 'ein Viertel'} des vorigen, aber nie 0.`,
        'Die x-Achse ist eine Asymptote: Der Graph nähert sich ihr, ohne sie zu erreichen.',
      ],
    };
  },
);

// ---------------------------------------------------------------------------
// Wachstum und Zerfall im Sachzusammenhang (M.SF.EX.SACH)

export interface BestandParameter {
  /** auch Halbierung (Zerfall) */
  readonly zerfall: boolean;
}

interface BestandAufgabe {
  readonly b: number;
  readonly n: number;
  readonly halb: boolean;
  readonly ende: number;
  readonly kontext: number;
}

function bestandAufgabe(seed: number, p: BestandParameter): BestandAufgabe {
  const r = rng(seed);
  const halb = p.zerfall && r.int(0, 1) === 1;
  const n = r.int(2, 5);
  const b = halb ? r.int(1, 9) * 2 ** n * 10 : r.int(2, 30) * 10;
  return { b, n, halb, ende: halb ? b / 2 ** n : b * 2 ** n, kontext: r.int(0, 1) };
}

/** Satz mit Anfangsbestand b und n Schritten */
type Kontext = (b: number, n: number) => string;
const WACHSTUM: readonly Kontext[] = [
  (b, n) =>
    `Eine Bakterienkultur hat ${b} Bakterien. Ihre Zahl verdoppelt sich jede Stunde. Wie viele Bakterien sind es nach ${n} Stunden?`,
  (b, n) =>
    `Seerosen bedecken ${b} cm² eines Teiches. Die Fläche verdoppelt sich jede Woche. Wie viel cm² bedecken sie nach ${n} Wochen?`,
];
const ZERFALL: readonly Kontext[] = [
  (b, n) =>
    `Eine Probe enthält ${b} mg eines radioaktiven Stoffes. Seine Halbwertszeit ist ein Tag. Wie viel mg sind nach ${n} Tagen noch übrig?`,
  (b, n) =>
    `Im Blut sind ${b} mg eines Medikaments. Jede Stunde wird die Hälfte abgebaut. Wie viel mg sind nach ${n} Stunden noch im Blut?`,
];

/** „500 Bakterien, Verdopplung jede Stunde: Wie viele nach 4 Stunden?“ (Niveau G) */
export const exBestand: Generator<BestandParameter> = {
  id: 'ex.bestand',
  version: 1,
  platzhalter: ['satz', 'anfang', 'schritte'],
  fehlerbildIds: ['linear', 'hochzahl-mal'],

  erzeuge(seed, p) {
    const a = bestandAufgabe(seed, p);
    const satz = (a.halb ? ZERFALL : WACHSTUM)[a.kontext] ?? WACHSTUM[0];
    const richtig = zahl(a.ende);
    const q = a.halb ? '\\frac{1}{2}' : '2';
    return {
      platzhalter: {
        satz: de(satz ? satz(a.b, a.n) : ''),
        anfang: a.b,
        schritte: a.n,
      },
      loesung: richtig,
      loesungsweg: [
        de(`Jeder Schritt: mal ${a.halb ? '½' : '2'}. Nach ${a.n} Schritten: mal $${q}^{${a.n}}$.`),
        de(`$${a.b} \\cdot ${q}^{${a.n}} = ${texZahl(a.ende)}$`),
      ],
      fehlerbilder: fehlerbilderAus(richtig, [
        ['linear', zahl(a.halb ? a.b - a.n * (a.b / 2) : a.b + a.n * a.b)],
        ['hochzahl-mal', zahl(a.halb ? a.b / (2 * a.n) : a.b * 2 * a.n)],
      ]),
    };
  },
};

export interface VerdopplungParameter {
  /** auch Halbwertszeit bei Abnahme um p % */
  readonly abnahme: boolean;
}

/** Erstes ganzes n mit qⁿ ≥ 2 (Wachstum) bzw. qⁿ ≤ ½ (Abnahme) */
export function erstesN(q: number, abnahme: boolean): number {
  let n = 0;
  let w = 1;
  while (abnahme ? w > 0.5 : w < 2) {
    w *= q;
    n += 1;
  }
  return n;
}

/** „Nach wie vielen ganzen Jahren hat sich der Bestand erstmals verdoppelt?“ (Niveau M) */
export const exVerdopplung: Generator<VerdopplungParameter> = {
  id: 'ex.verdopplung',
  version: 1,
  platzhalter: ['satz', 'prozent', 'abnahme'],
  fehlerbildIds: ['linear', 'erstmals'],

  erzeuge(seed, p) {
    const r = rng(seed);
    const ab = p.abnahme && r.int(0, 1) === 1;
    const pz = r.pick(ab ? [5, 10, 15, 20, 25, 30, 40] : [5, 8, 10, 12, 15, 20, 25, 30, 40, 50]);
    const q = genau(ab ? 1 - pz / 100 : 1 + pz / 100);
    const n = erstesN(q, ab);
    const richtig = zahl(n);
    const linear = Math.ceil((ab ? 50 : 100) / pz);
    const tabelle = Array.from(
      { length: n + 1 },
      (_, i) => `${i}: ${zt(Math.round(q ** i * 1000) / 1000)}`,
    );
    return {
      platzhalter: {
        satz: de(
          ab
            ? `Ein Bestand nimmt jedes Jahr um ${pz} % ab. Nach wie vielen ganzen Jahren ist er erstmals auf die Hälfte oder weniger gesunken?`
            : `Ein Bestand wächst jedes Jahr um ${pz} %. Nach wie vielen ganzen Jahren hat er sich erstmals verdoppelt?`,
        ),
        prozent: pz,
        abnahme: ab ? 1 : 0,
      },
      loesung: richtig,
      loesungsweg: [
        de(
          `Wachstumsfaktor $q = ${texZahl(q)}$. Gesucht ist das erste n mit $q^n ${ab ? '\\leq \\frac{1}{2}' : '\\geq 2'}$.`,
        ),
        de(`Jahre und Faktor $q^n$: ${tabelle.join('; ')}.`),
        de(`Erstmals ${ab ? 'höchstens die Hälfte' : 'mindestens das Doppelte'} nach ${n} Jahren.`),
      ],
      fehlerbilder: fehlerbilderAus(richtig, [
        ['linear', zahl(linear)],
        ['erstmals', zahl(n - 1)],
      ]),
    };
  },
};

/** E: Grenzen des Modells (M.SF.EX.SACH.BEGRUENDEN) */
export const exModellgrenzeAussage = aussagenGenerator(
  'ex.modellgrenze-aussage',
  ['modellgrenze', 'modell'],
  ['teich', 'wochen'],
  (r) => {
    const teich = r.pick([50, 100, 200, 500]);
    const wochen = r.int(15, 25);
    const flaeche = 2 ** wochen;
    return {
      situation: `Seerosen bedecken 1 m² eines Teiches mit ${teich} m². Die Fläche verdoppelt sich jede Woche. Lea rechnet: „Nach ${wochen} Wochen bedecken sie $2^{${wochen}} = ${texZahl(flaeche)}$ m².“ Stimmt das?`,
      werte: { teich, wochen },
      richtig: `Nein. Mehr als ${teich} m² gibt es im Teich nicht. Das Modell gilt nur, solange Platz ist; danach wächst die Fläche nicht mehr exponentiell.`,
      falsch: [
        ['modellgrenze', 'Ja. Exponentielles Wachstum geht immer weiter.'],
        [
          'modell',
          `Nein. Es sind 1 + ${wochen} = ${wochen + 1} m², denn jede Woche kommt 1 m² dazu.`,
        ],
      ],
      weg: [
        `Nach $n$ Wochen: $2^n$ m². Schon nach ${Math.ceil(Math.log2(teich))} Wochen wären es mehr als ${teich} m².`,
        'Ein Modell beschreibt die Wirklichkeit nur in Grenzen. Prüfe immer, ob das Ergebnis passt.',
      ],
    };
  },
);
