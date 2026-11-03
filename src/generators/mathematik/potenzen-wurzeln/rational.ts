// Potenzen mit rationalen Hochzahlen – Klasse 9 (LEHRPLAN §8e, Feld PW, M.ZO.PW.RATIONAL):
// a^(m/n) als Wurzel schreiben und berechnen, Schreibweisen zuordnen, Aussagen prüfen (E).
// Die Basis ist bei Bruch-Hochzahlen immer positiv (Lehrplan GY LB 1).
import type { Generator, Sprachobjekt } from '../../../core/learning/generator';
import { fehlerbilderAus } from '../../../core/learning/loesung';
import { rng, type Rng } from '../../../core/rng/rng';
import { auswahl, de, mische, verlange, zahl } from '../../hilfen';

const frac = (m: number | string, n: number) => `\\frac{${m}}{${n}}`;
const wurzel = (n: number, inhalt: string) =>
  n === 2 ? `\\sqrt{${inhalt}}` : `\\sqrt[${n}]{${inhalt}}`;

// ---------------------------------------------------------------------------
// Berechnen (M.ZO.PW.RATIONAL.WERT), mit Zwischenschritten

export interface RationalWertParameter {
  /** true: Zähler der Hochzahl auch größer als 1 (8^(2/3)) */
  readonly zaehler: boolean;
}

/** n-te Wurzel w und Hochzahl m/n; Basis w^n, Ergebnis w^m */
function rationalWerte(seed: number, p: RationalWertParameter, fassung: 1 | 2 = 2) {
  const r = rng(seed);
  for (;;) {
    const n = r.pick(fassung === 2 ? [2, 2, 3, 3, 4, 5] : [2, 2, 3, 3, 4]);
    const w = r.int(2, n === 2 ? 12 : n === 3 ? 6 : n === 4 ? 4 : 3);
    const m = p.zaehler ? r.int(2, n === 2 ? 3 : 4) : 1;
    if (p.zaehler && m % n === 0) continue; // 8^(3/3) wäre nur 8
    if (fassung === 2 && m > 1 && n % m === 0) continue; // 16^(2/4): Hochzahl ungekürzt
    const ergebnis = w ** m;
    if (ergebnis > 2000) continue;
    return { n, w, m, basis: w ** n, ergebnis };
  }
}

/** „Berechne 27^(1/3)“ oder „8^(2/3)“ */
function pwRationalWertFassung(fassung: 1 | 2): Generator<RationalWertParameter> {
  return {
    id: 'pw.rational-wert',
    version: fassung,
    platzhalter: ['term', 'basis', 'n', 'm'],
    fehlerbildIds: ['geteilt', 'mal-bruch', 'nur-wurzel', 'nur-potenz'],

    schritte: [
      { id: 'wurzel', fehlerbildIds: ['geteilt'] },
      { id: 'potenz', fehlerbildIds: ['mal-statt-hoch'], platzhalter: ['w'] },
    ],

    erzeuge(seed, p) {
      const { n, w, m, basis, ergebnis } = rationalWerte(seed, p, fassung);
      const richtig = zahl(ergebnis);
      const hoch = `${basis}^{${frac(m, n)}}`;
      return {
        platzhalter: { term: de(hoch), basis, n, m },
        loesung: richtig,
        loesungsweg: [
          de(
            m === 1
              ? `$a^{\\frac{1}{n}} = \\sqrt[n]{a}$, also $${hoch} = ${wurzel(n, String(basis))}$.`
              : `$a^{\\frac{m}{n}} = \\left(\\sqrt[n]{a}\\right)^m$, also $${hoch} = \\left(${wurzel(n, String(basis))}\\right)^{${m}}$.`,
          ),
          de(`$${wurzel(n, String(basis))} = ${w}$, denn $${w}^{${n}} = ${basis}$.`),
          ...(m === 1 ? [] : [de(`$${w}^{${m}} = ${ergebnis}$`)]),
        ],
        fehlerbilder: fehlerbilderAus(richtig, [
          ['geteilt', m === 1 && basis % n === 0 ? zahl(basis / n) : undefined],
          ['mal-bruch', m > 1 && (basis * m) % n === 0 ? zahl((basis * m) / n) : undefined],
          ['nur-wurzel', m > 1 ? zahl(w) : undefined],
          ['nur-potenz', m > 1 && basis ** m <= 100_000 ? zahl(basis ** m) : undefined],
        ]),
      };
    },

    schritt(seed, p, id) {
      const { n, w, m, basis, ergebnis } = rationalWerte(seed, p, fassung);
      if (id === 'wurzel') {
        const loesung = zahl(w);
        return {
          loesung,
          fehlerbilder: fehlerbilderAus(loesung, [
            ['geteilt', basis % n === 0 ? zahl(basis / n) : undefined],
          ]),
        };
      }
      const loesung = zahl(ergebnis);
      return {
        loesung,
        fehlerbilder: fehlerbilderAus(loesung, [['mal-statt-hoch', zahl(w * m)]]),
        platzhalter: { w },
      };
    },
  };
}

/** Fassung 1 bleibt für gespeicherte Aufgaben (INHALTSFORMAT §6.1 Regel 5): ungekürzte Hochzahl wie 2/4. */
export const pwRationalWertV1 = pwRationalWertFassung(1);
export const pwRationalWert = pwRationalWertFassung(2);

// ---------------------------------------------------------------------------
// Schreibweisen (M.ZO.PW.RATIONAL.SCHREIBWEISE)

export interface SchreibweiseParameter {
  /** auch negative Hochzahlen: 1/√x = x^(−1/2) */
  readonly negativ: boolean;
}

const VAR = ['x', 'a', 'b', 'y'];

/** „Welcher Term ist gleich ³√x²?“ – vier Terme zur Auswahl */
export const pwSchreibweise: Generator<SchreibweiseParameter> = {
  id: 'pw.rational-schreibweise',
  version: 1,
  platzhalter: ['term'],
  fehlerbildIds: ['vertauscht', 'geteilt', 'minus-vergessen', 'hochzahl-mal'],

  erzeuge(seed, p) {
    const r = rng(seed);
    const v = r.pick(VAR);
    const n = r.pick([2, 3, 4, 5]);
    const m = r.pick([1, 2, 3].filter((x) => x !== n && (x === 1 || n % x !== 0)));
    const negativ = p.negativ && r.int(0, 1) === 0;
    const innen = m === 1 ? v : `${v}^{${m}}`;
    const w = wurzel(n, innen);
    const term = negativ ? `\\frac{1}{${w}}` : w;
    const hoch = (z: number, nn: number, minus: boolean) =>
      `${v}^{${minus ? '-' : ''}${nn === 1 ? z : frac(z, nn)}}`;
    const kandidaten: [string, string][] = [
      ['richtig', hoch(m, n, negativ)],
      ['vertauscht', hoch(n, m, negativ)],
      ['geteilt', negativ ? `\\frac{1}{${frac(innen, n)}}` : frac(innen, n)],
      [
        negativ ? 'minus-vergessen' : 'hochzahl-mal',
        negativ ? hoch(m, n, false) : `${v}^{${m * n}}`,
      ],
    ];
    // Doppelte Terme (z. B. m = 1: x^(1/1)) vermeiden
    const eindeutig = kandidaten.filter(
      ([, t], i) => kandidaten.findIndex(([, u]) => u === t) === i,
    );
    const liste = mische(r, eindeutig);
    const index = (id: string) => auswahl(liste.findIndex(([x]) => x === id));
    return {
      platzhalter: { term: de(term) },
      optionen: liste.map(([, t]) => ({ text: de(`$${t}$`) satisfies Sprachobjekt })),
      loesung: index('richtig'),
      loesungsweg: [
        de(
          '$\\sqrt[n]{a^m} = a^{\\frac{m}{n}}$: Die Wurzel steht im Nenner, die Hochzahl unter der Wurzel im Zähler.',
        ),
        ...(negativ
          ? [de('$\\frac{1}{a^k} = a^{-k}$: Der Kehrwert bekommt ein Minus in der Hochzahl.')]
          : []),
        de(`Also $${term} = ${hoch(m, n, negativ)}$.`),
      ],
      fehlerbilder: liste
        .filter(([id]) => id !== 'richtig')
        .map(([id]) => ({ id, antwort: index(id) })),
    };
  },
};

// ---------------------------------------------------------------------------
// Stimmt das? (M.ZO.PW.RATIONAL.AUSSAGE, Niveau E)

interface Aussage {
  readonly tex: string;
  readonly richtig: string;
  readonly falsch: readonly (readonly [string, string])[];
  readonly weg: readonly string[];
}

function aussage(r: Rng): Aussage {
  const art = r.int(0, 4);
  const w = r.int(2, 5);
  if (art === 0) {
    const a = w * w;
    return {
      tex: `a^{\\frac{1}{2}} = \\frac{a}{2}`,
      richtig:
        `Nein. $a^{\\frac{1}{2}} = \\sqrt{a}$. Für a = ${a}: $\\sqrt{${a}} = ${w}$, aber $\\frac{${a}}{2} = ${a / 2}$.`.replace(
          /(\d)\.(\d)/g,
          '$1{,}$2',
        ),
      falsch: [
        ['geteilt', 'Ja. Hoch ein Halb heißt halbieren.'],
        ['nur-beispiel', 'Ja, denn für a = 4 stimmt es: $\\sqrt{4} = 2 = \\frac{4}{2}$.'],
        ['vertauscht', 'Nein. Richtig ist $a^{\\frac{1}{2}} = a^2$.'],
      ],
      weg: [
        'Hoch ein Halb ist die Quadratwurzel: $a^{\\frac{1}{2}} = \\sqrt{a}$.',
        `Gegenbeispiel: $${a}^{\\frac{1}{2}} = ${w}$, aber die Hälfte von ${a} ist nicht ${w}.`,
      ],
    };
  }
  if (art === 1) {
    return {
      tex: `a^{\\frac{1}{2}} \\cdot a^{\\frac{1}{2}} = a^{\\frac{1}{4}}`,
      richtig:
        'Nein. Die Hochzahlen werden addiert: $\\frac{1}{2} + \\frac{1}{2} = 1$, also $a^1 = a$.',
      falsch: [
        ['mal-statt-plus', 'Ja. Beim Malnehmen werden die Hochzahlen malgenommen.'],
        ['vertauscht', 'Nein. Richtig ist $a^{\\frac{1}{2}}$, die Hochzahl bleibt gleich.'],
        ['geteilt', 'Nein. Richtig ist $\\frac{a}{4}$.'],
      ],
      weg: [
        'Gleiche Basis, malnehmen: Hochzahlen addieren.',
        '$\\frac{1}{2} + \\frac{1}{2} = 1$. Passt dazu: $\\sqrt{a} \\cdot \\sqrt{a} = a$.',
      ],
    };
  }
  if (art === 2) {
    const n = r.pick([3, 4]);
    return {
      tex: `a^{\\frac{2}{${n}}} = \\sqrt{a^{${n}}}`,
      richtig: `Nein. Der Nenner gibt die Wurzel an: $a^{\\frac{2}{${n}}} = \\sqrt[${n}]{a^2}$.`,
      falsch: [
        ['vertauscht', 'Ja. Der Zähler gibt die Wurzel an, der Nenner die Hochzahl.'],
        ['geteilt', `Nein. Richtig ist $\\frac{2a}{${n}}$.`],
        ['nur-beispiel', 'Ja, denn für a = 1 stimmt es.'],
      ],
      weg: [
        `$a^{\\frac{m}{n}} = \\sqrt[n]{a^m}$: Nenner n ist die Wurzel, Zähler m die Hochzahl.`,
        `Also $a^{\\frac{2}{${n}}} = \\sqrt[${n}]{a^2}$.`,
      ],
    };
  }
  if (art === 3) {
    const n = r.pick([2, 3]);
    return {
      tex: `\\left(a^{\\frac{1}{${n}}}\\right)^{${n}} = a \\text{ für } a \\geq 0`,
      richtig: `Ja. Die Hochzahlen werden malgenommen: $\\frac{1}{${n}} \\cdot ${n} = 1$.`,
      falsch: [
        ['plus-statt-mal', `Nein. Richtig ist $a^{${n} + \\frac{1}{${n}}}$.`],
        ['geteilt', `Nein. Richtig ist $\\frac{a}{${n}}$.`],
        ['nur-beispiel', 'Nur für a = 1, sonst nicht.'],
      ],
      weg: [
        'Potenz einer Potenz: Hochzahlen malnehmen.',
        `$\\frac{1}{${n}} \\cdot ${n} = 1$, also $a^1 = a$. Die ${n === 2 ? 'Quadratwurzel' : 'Kubikwurzel'} hoch ${n} gibt a zurück.`,
      ],
    };
  }
  return {
    tex: `${w * w}^{-\\frac{1}{2}} = -${w}`,
    richtig: `Nein. $${w * w}^{-\\frac{1}{2}} = \\frac{1}{\\sqrt{${w * w}}} = \\frac{1}{${w}}$.`,
    falsch: [
      ['negativ-minus', 'Ja. Das Minus der Hochzahl kommt vor das Ergebnis.'],
      ['negativ-ignoriert', `Nein. Richtig ist ${w}.`],
      ['geteilt', `Nein. Richtig ist $-\\frac{${w * w}}{2}$.`],
    ],
    weg: [
      'Eine negative Hochzahl bedeutet Kehrwert: $a^{-k} = \\frac{1}{a^k}$.',
      `$${w * w}^{\\frac{1}{2}} = \\sqrt{${w * w}} = ${w}$, also $${w * w}^{-\\frac{1}{2}} = \\frac{1}{${w}}$.`,
    ],
  };
}

/** „Stimmt das?“ – Aussage über Bruch-Hochzahlen, vier Antworten mit Begründung */
export const pwRationalAussage: Generator<Record<string, never>> = {
  id: 'pw.rational-aussage',
  version: 1,
  platzhalter: ['aussage'],
  fehlerbildIds: [
    'geteilt',
    'nur-beispiel',
    'vertauscht',
    'mal-statt-plus',
    'plus-statt-mal',
    'negativ-minus',
    'negativ-ignoriert',
  ],

  erzeuge(seed) {
    const r = rng(seed);
    const a = aussage(r);
    verlange(a.falsch.length === 3, 'drei falsche Antworten');
    const liste = mische(r, [['richtig', a.richtig] as const, ...a.falsch]);
    const index = (id: string) => auswahl(liste.findIndex(([x]) => x === id));
    return {
      platzhalter: { aussage: de(a.tex) },
      optionen: liste.map(([, t]) => ({ text: de(t) satisfies Sprachobjekt })),
      loesung: index('richtig'),
      loesungsweg: a.weg.map(de),
      fehlerbilder: a.falsch.map(([id]) => ({ id, antwort: index(id) })),
    };
  },
};
