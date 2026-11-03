// Logarithmus und Umkehrfunktionen – Klasse 10, nur Gymnasium (LEHRPLAN §8f, Feld LG):
// Umkehrfunktion, Logarithmus als Umkehrung des Potenzierens, Logarithmengesetze,
// Exponentialgleichungen. Formeln in LaTeX für KaTeX.
import type { Generator } from '../../../core/learning/generator';
import { fehlerbilderAus } from '../../../core/learning/loesung';
import { texZahl, zahlText } from '../../../core/learning/text';
import { rng } from '../../../core/rng/rng';
import { aussagenGenerator } from '../../aussagen';
import { auswahl, de, mische, zahl } from '../../hilfen';

const r2 = (x: number) => Math.round(x * 100) / 100;
const r3 = (x: number) => Math.round(x * 1000) / 1000;
const z = (x: number) => (x < 0 ? `−${zahlText(-x)}` : zahlText(x));

// ---------------------------------------------------------------------------
// Umkehrfunktion (M.SF.LG.UMKEHRFUNKTION)

/** „P(2|7) liegt auf f. Welcher Punkt liegt auf der Umkehrfunktion?“ (Niveau G) */
export const lgSpiegeln: Generator<Record<string, never>> = {
  id: 'lg.spiegeln',
  version: 1,
  platzhalter: ['x', 'y'],
  fehlerbildIds: ['spiegelachse', 'kehrwert'],

  erzeuge(seed) {
    const r = rng(seed);
    const x = r.int(1, 6);
    let y = r.int(2, 9);
    if (y === x) y += 1;
    const liste = mische(r, [
      ['richtig', `(${y}|${x})`],
      ['spiegelachse', `(${x}|−${y})`],
      ['kehrwert', `(${x}|$\\frac{1}{${y}}$)`],
    ] as const);
    const idx = (k: string) => auswahl(liste.findIndex(([q]) => q === k));
    const richtig = idx('richtig');
    return {
      platzhalter: { x, y },
      optionen: liste.map(([, t]) => ({ text: de(`P'${t}`) })),
      loesung: richtig,
      loesungsweg: [
        de('Die Umkehrfunktion tauscht x und y: Aus (x|y) wird (y|x).'),
        de(`Das ist die Spiegelung an der Geraden $y = x$. Aus (${x}|${y}) wird (${y}|${x}).`),
      ],
      fehlerbilder: fehlerbilderAus(richtig, [
        ['spiegelachse', idx('spiegelachse')],
        ['kehrwert', idx('kehrwert')],
      ]),
    };
  },
};

/** „f(x) = 3x + 2. Berechne f⁻¹(14).“ (Niveau M) */
export const lgUmkehrWert: Generator<Record<string, never>> = {
  id: 'lg.umkehr-wert',
  version: 1,
  platzhalter: ['term', 'm', 'n', 'c'],
  fehlerbildIds: ['eingesetzt', 'kehrwert'],

  erzeuge(seed) {
    const r = rng(seed);
    const m = r.pick([2, 3, 4, 5, -2, -3]);
    let n = r.int(-9, 9);
    if (n === 0) n = 4;
    const x = r.int(-5, 8);
    const c = m * x + n;
    const richtig = zahl(x);
    const fc = m * c + n;
    const term = `${m === 1 ? '' : m === -1 ? '-' : texZahl(m)}x ${n < 0 ? '-' : '+'} ${Math.abs(n)}`;
    return {
      platzhalter: { m, n, c, term: de(term) },
      vorzeichen: true,
      loesung: richtig,
      loesungsweg: [
        de(`$f^{-1}(${texZahl(c)})$ ist die Zahl x mit $f(x) = ${texZahl(c)}$.`),
        de(
          `$${term} = ${texZahl(c)}$, also $x = (${texZahl(c)} ${n < 0 ? '+' : '-'} ${Math.abs(n)}) : ${m < 0 ? `(${texZahl(m)})` : texZahl(m)} = ${texZahl(x)}$.`,
        ),
      ],
      fehlerbilder: fehlerbilderAus(richtig, [
        ['eingesetzt', zahl(fc)],
        ['kehrwert', c === 0 ? undefined : zahl(r3(1 / c))],
      ]),
    };
  },
};

/** E: „y = x² ist umkehrbar“ (M.SF.LG.UMKEHRFUNKTION.BEGRUENDEN) */
export const lgUmkehrbarAussage = aussagenGenerator(
  'lg.umkehrbar-aussage',
  ['umkehrbar', 'kehrwert'],
  ['a'],
  (r) => {
    const a = r.int(2, 9);
    return {
      situation: `Tim sagt: „$f(x) = x^2$ hat die Umkehrfunktion $f^{-1}(x) = \\sqrt{x}$, für alle reellen x.“ Stimmt das?`,
      werte: { a },
      richtig: `Nein. $f(${a}) = f(-${a}) = ${a * a}$: Zu ${a * a} gehören zwei x-Werte. Umkehrbar ist $x^2$ nur für $x \\geq 0$, dann ist $\\sqrt{x}$ die Umkehrfunktion.`,
      falsch: [
        ['umkehrbar', 'Ja. Die Wurzel macht das Quadrieren immer rückgängig.'],
        ['kehrwert', 'Nein. Die Umkehrfunktion ist $\\frac{1}{x^2}$.'],
      ],
      weg: [
        'Umkehrbar ist eine Funktion nur, wenn jeder y-Wert zu genau einem x gehört.',
        `$${a}^2 = (-${a})^2 = ${a * a}$. Schränkt man auf $x \\geq 0$ ein, gibt es nur noch ein x.`,
      ],
    };
  },
);

// ---------------------------------------------------------------------------
// Logarithmus (M.ZO.LG.LOGARITHMUS)

const BASEN = [2, 3, 5, 10] as const;

/** Argument bⁿ als LaTeX: ganze Zahl oder Bruch 1/b^|n| */
function argument(b: number, n: number): string {
  return n >= 0 ? texZahl(b ** n) : `\\frac{1}{${texZahl(b ** -n)}}`;
}

/** „Berechne log₂ 32.“ (Niveau G) */
export const lgWert: Generator<{ readonly negativ: boolean }> = {
  id: 'lg.wert',
  version: 1,
  platzhalter: ['basis', 'n', 'term'],
  fehlerbildIds: ['basis-argument', 'teilen-statt-log'],

  erzeuge(seed, p) {
    const r = rng(seed);
    const b = r.pick(BASEN);
    const max = b === 2 ? 6 : b === 3 ? 4 : 3;
    const n = p.negativ && r.int(0, 2) === 0 ? -r.int(1, 3) : r.int(2, max);
    const richtig = zahl(n);
    const term = `\\log_{${b}} ${argument(b, n)}`;
    return {
      platzhalter: { basis: b, n, term: de(term) },
      vorzeichen: true,
      loesung: richtig,
      loesungsweg: [
        de(`$${term}$ fragt: Mit welcher Hochzahl wird ${b} zu $${argument(b, n)}$?`),
        de(`$${b}^{${n}} = ${argument(b, n)}$, also $${term} = ${texZahl(n)}$.`),
      ],
      fehlerbilder: fehlerbilderAus(richtig, [
        ['basis-argument', n === 1 || n === -1 ? undefined : zahl(r3(1 / n))],
        ['teilen-statt-log', n > 0 ? zahl(r3(b ** n / b)) : undefined],
      ]),
    };
  },
};

const BEKANNT = [
  { a: 2, l: 0.301 },
  { a: 3, l: 0.477 },
] as const;

/** „Es ist lg 2 ≈ 0,301. Berechne lg 8.“ (Niveau M, Logarithmengesetze) */
export const lgGesetze: Generator<Record<string, never>> = {
  id: 'lg.gesetze',
  version: 1,
  platzhalter: ['a', 'l', 'art', 'k', 'term'],
  fehlerbildIds: ['potenz', 'summe', 'kehrwert'],

  erzeuge(seed) {
    const r = rng(seed);
    const { a, l } = r.pick(BEKANNT);
    const art = r.int(0, 3);
    const k = r.int(2, 3);
    // 0: lg aᵏ = k·lg a; 1: lg (a · 10ᵏ) = lg a + k; 2: lg (10/a) = 1 − lg a; 3: lg (1/a) = −lg a
    const arg = [
      `${texZahl(a ** k)}`,
      `${texZahl(a * 10 ** k)}`,
      `\\frac{10}{${a}}`,
      `\\frac{1}{${a}}`,
    ][art];
    const wert = r3([k * l, l + k, 1 - l, -l][art] ?? 0);
    const richtig = zahl(wert);
    const gesetz = [
      `$\\lg ${a ** k} = \\lg ${a}^{${k}} = ${k} \\cdot \\lg ${a}$`,
      `$\\lg ${texZahl(a * 10 ** k)} = \\lg ${a} + \\lg ${texZahl(10 ** k)} = \\lg ${a} + ${k}$`,
      `$\\lg \\frac{10}{${a}} = \\lg 10 - \\lg ${a} = 1 - \\lg ${a}$`,
      `$\\lg \\frac{1}{${a}} = \\lg 1 - \\lg ${a} = -\\lg ${a}$`,
    ][art];
    return {
      platzhalter: { a, l, art, k, term: de(`\\lg ${arg}`) },
      vorzeichen: true,
      loesung: richtig,
      runden: { stellen: 3, genau: wert },
      loesungsweg: [
        de(`Logarithmengesetz: ${gesetz}.`),
        de(`Mit $\\lg ${a} \\approx ${texZahl(l)}$: Ergebnis $\\approx ${texZahl(wert)}$.`),
      ],
      fehlerbilder: fehlerbilderAus(richtig, [
        ['potenz', art === 0 ? zahl(r3(l ** k)) : undefined],
        ['summe', art === 1 ? zahl(r3(l * k)) : art === 2 ? zahl(r3(l - 1)) : undefined],
        ['kehrwert', art === 3 ? zahl(r3(1 / l)) : undefined],
      ]),
    };
  },
};

/** E: „log(a + b) = log a + log b“ – Fehler finden (M.ZO.LG.LOGARITHMUS.BEGRUENDEN) */
export const lgSummeAussage = aussagenGenerator(
  'lg.summe-aussage',
  ['summe', 'potenz'],
  ['basis', 'n'],
  (r) => {
    // n ≥ 3: sonst wäre (log x)² = 2 · log x und die falsche Antwort zahlengleich
    const b = r.pick([2, 3]);
    const n = b === 2 ? r.int(3, 5) : 3;
    const x = b ** n;
    const doppelt = 2 * n;
    return {
      situation: `Lea rechnet: $\\log_{${b}}(${x} + ${x}) = \\log_{${b}} ${x} + \\log_{${b}} ${x} = ${doppelt}$. Stimmt das?`,
      werte: { basis: b, n },
      richtig: `Nein. Das Gesetz gilt für Produkte: $\\log_{${b}}(${x} \\cdot ${x}) = ${doppelt}$. Hier ist $\\log_{${b}} ${2 * x}$ gemeint, und $${b}^{${doppelt}} = ${b ** doppelt}$ ist nicht ${2 * x}.`,
      falsch: [
        ['summe', 'Ja. Der Logarithmus einer Summe ist die Summe der Logarithmen.'],
        ['potenz', `Nein. Richtig ist $(\\log_{${b}} ${x})^2 = ${n * n}$.`],
      ],
      weg: [
        'Logarithmengesetz: $\\log(u \\cdot v) = \\log u + \\log v$. Für Summen gibt es kein solches Gesetz.',
        `$${x} + ${x} = ${2 * x}$, und $${b}^{${doppelt}} = ${b ** doppelt} \\neq ${2 * x}$.`,
      ],
    };
  },
);

// ---------------------------------------------------------------------------
// Exponentialgleichungen (M.SF.LG.GLEICHUNGEN)

/** „Löse 3ˣ = 81.“ oder „2 · 5ˣ = 250.“ (Niveau G, ganzzahlig) */
export const lgGleichungGanz: Generator<{ readonly faktor: boolean }> = {
  id: 'lg.gleichung-ganz',
  version: 1,
  platzhalter: ['gleichung', 'basis', 'c', 'rechts'],
  fehlerbildIds: ['teilen-statt-log', 'faktor-zuerst'],

  erzeuge(seed, p) {
    const r = rng(seed);
    const b = r.pick(BASEN);
    const n = r.int(2, b === 2 ? 7 : b === 3 ? 5 : b === 5 ? 4 : 4);
    const c = p.faktor ? r.int(2, 5) : 1;
    const rechts = c * b ** n;
    const gleichung = `${c === 1 ? '' : `${c} \\cdot `}${b}^{x} = ${texZahl(rechts)}`;
    const richtig = zahl(n);
    return {
      platzhalter: { gleichung: de(gleichung), basis: b, c, rechts },
      loesung: richtig,
      loesungsweg: [
        ...(c === 1 ? [] : [de(`Zuerst durch ${c} teilen: $${b}^{x} = ${texZahl(b ** n)}$.`)]),
        de(`$${texZahl(b ** n)} = ${b}^{${n}}$, also $x = ${n}$.`),
      ],
      fehlerbilder: fehlerbilderAus(richtig, [
        ['teilen-statt-log', Number.isInteger(rechts / b) ? zahl(rechts / b) : undefined],
        ['faktor-zuerst', c === 1 ? undefined : zahl(r3(Math.log(rechts) / Math.log(c * b)))],
      ]),
    };
  },
};

/** „Löse 1,5ˣ = 20 auf zwei Stellen.“ (Niveau M, mit Logarithmus) */
export const lgGleichung: Generator<Record<string, never>> = {
  id: 'lg.gleichung',
  version: 1,
  platzhalter: ['gleichung', 'basis', 'c', 'rechts'],
  fehlerbildIds: ['teilen-statt-log', 'faktor-zuerst'],

  erzeuge(seed) {
    const r = rng(seed);
    for (;;) {
      const b = r.pick([1.5, 2, 3, 1.2, 1.1, 0.5, 0.8]);
      const c = r.pick([1, 1, 2, 5, 100]);
      const rechts = b < 1 ? r.pick([0.2, 0.1, 0.05]) * c : r.pick([10, 20, 50, 100]) * c;
      const genau = Math.log(rechts / c) / Math.log(b);
      if (Number.isInteger(r3(genau))) continue;
      const loesung = zahl(r2(genau));
      const gleichung = `${c === 1 ? '' : `${texZahl(c)} \\cdot `}${texZahl(b)}^{x} = ${texZahl(rechts)}`;
      return {
        platzhalter: { gleichung: de(gleichung), basis: b, c, rechts },
        vorzeichen: true,
        loesung,
        runden: { stellen: 2, genau },
        loesungsweg: [
          ...(c === 1
            ? []
            : [
                de(
                  `Zuerst durch ${texZahl(c)} teilen: $${texZahl(b)}^{x} = ${texZahl(rechts / c)}$.`,
                ),
              ]),
          de(
            `Logarithmieren: $x = \\frac{\\ln ${texZahl(rechts / c)}}{\\ln ${texZahl(b)}} \\approx ${texZahl(r2(genau))}$.`,
          ),
        ],
        fehlerbilder: fehlerbilderAus(loesung, [
          ['teilen-statt-log', zahl(r2(rechts / b))],
          ['faktor-zuerst', c === 1 ? undefined : zahl(r2(Math.log(rechts) / Math.log(c * b)))],
        ]),
      };
    }
  },
};

/** E: „ln x ist auch für x ≤ 0 definiert“ (M.SF.LG.GLEICHUNGEN.BEGRUENDEN) */
export const lgLnAussage = aussagenGenerator(
  'lg.ln-aussage',
  ['definition', 'basis-argument'],
  ['x'],
  (r) => {
    const x = -r.int(1, 9);
    return {
      situation: `Ole sagt: „$\\ln(${z(x).replace('−', '-')})$ ist eine negative Zahl, denn der Logarithmus einer negativen Zahl ist negativ.“ Stimmt das?`,
      werte: { x },
      richtig: `Nein. $\\ln x$ ist die Umkehrung von $e^x$, und $e^x$ ist immer größer als 0. Deshalb ist $\\ln x$ nur für $x > 0$ definiert; $\\ln(${x})$ gibt es nicht.`,
      falsch: [
        ['definition', 'Ja. Der Logarithmus behält das Vorzeichen der Zahl.'],
        ['basis-argument', `Ja. $\\ln(${x}) = e^{${x}}$, und das ist eine kleine Zahl.`],
      ],
      weg: [
        '$y = \\ln x$ heißt $e^y = x$.',
        '$e^y$ ist für jedes y positiv. Also gibt es kein y mit $e^y$ negativ oder 0.',
      ],
    };
  },
);
