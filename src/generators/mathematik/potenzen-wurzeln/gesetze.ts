// Potenzgesetze – Klasse 9 (LEHRPLAN §8e, Feld PW, M.ZO.PW.GESETZE): Potenzen mit gleicher
// Basis malnehmen und teilen, Potenzen potenzieren, ganzzahlige Hochzahlen; Rechnungen mit
// Potenzgesetzen prüfen (Niveau E). Formeln in LaTeX zwischen `$…$`, gesetzt mit KaTeX.
import type { Generator, Loesung, Sprachobjekt } from '../../../core/learning/generator';
import { fehlerbilderAus } from '../../../core/learning/loesung';
import { texZahl } from '../../../core/learning/text';
import { rng, type Rng } from '../../../core/rng/rng';
import { auswahl, de, mische, verlange, zahl } from '../../hilfen';

export type Gesetz = 'mal' | 'durch' | 'hoch';

/** Potenz in LaTeX: a^{3}, 2^{-4}, (−3)^{2} */
const pot = (basis: string, h: number) => `${basis}^{${texZahl(h)}}`;
const potWert = (b: number, h: number) => pot(b < 0 ? `(${texZahl(b)})` : texZahl(b), h);

/** Term in LaTeX für ein Gesetz, z. B. a^{3} \cdot a^{4} */
function term(art: Gesetz, basis: string, m: number, n: number): string {
  if (art === 'mal') return `${pot(basis, m)} \\cdot ${pot(basis, n)}`;
  if (art === 'durch') return `${pot(basis, m)} : ${pot(basis, n)}`;
  return `\\left(${pot(basis, m)}\\right)^{${texZahl(n)}}`;
}

const ergebnis = (art: Gesetz, m: number, n: number) =>
  art === 'mal' ? m + n : art === 'durch' ? m - n : m * n;

/** Der Satz, der das Gesetz im Lösungsweg nennt */
const REGEL: Readonly<Record<Gesetz, string>> = {
  mal: 'Gleiche Basis, malnehmen: Die Hochzahlen werden addiert.',
  durch: 'Gleiche Basis, teilen: Die Hochzahlen werden subtrahiert.',
  hoch: 'Potenz einer Potenz: Die Hochzahlen werden malgenommen.',
};
const rechnung = (art: Gesetz, m: number, n: number) =>
  art === 'mal'
    ? `${texZahl(m)} + ${n < 0 ? `(${texZahl(n)})` : texZahl(n)}`
    : art === 'durch'
      ? `${texZahl(m)} - ${n < 0 ? `(${texZahl(n)})` : texZahl(n)}`
      : `${m < 0 ? `(${texZahl(m)})` : texZahl(m)} \\cdot ${n < 0 ? `(${texZahl(n)})` : texZahl(n)}`;

/** Typische falsche Hochzahlen je Gesetz (Fehlerbilder) */
function falscheHochzahlen(art: Gesetz, m: number, n: number): [string, number | undefined][] {
  const vorzeichen = m < 0 || n < 0 ? ergebnis(art, Math.abs(m), Math.abs(n)) : undefined;
  return [
    ['mal-statt-plus', art === 'mal' ? m * n : undefined],
    ['plus-statt-mal', art === 'hoch' ? m + n : undefined],
    ['geteilt', art === 'durch' && n !== 0 && m % n === 0 ? m / n : undefined],
    ['vorzeichen', vorzeichen],
  ];
}

// ---------------------------------------------------------------------------
// Hochzahl bestimmen (M.ZO.PW.GESETZE.EXPONENT)

export interface ExponentParameter {
  readonly gesetze: readonly Gesetz[];
  /** auch negative Hochzahlen (und Ergebnis 0 oder negativ) */
  readonly negativ: boolean;
}

const VARIABLEN = ['a', 'b', 'x', 'y', 'z'];

function hochzahlen(r: Rng, art: Gesetz, negativ: boolean): [number, number] {
  for (;;) {
    const h = () => (negativ ? r.int(-6, 9) : r.int(2, 9));
    const m = h();
    const n = art === 'hoch' ? (negativ ? r.int(-4, 5) : r.int(2, 5)) : h();
    if (m === 0 || n === 0 || n === 1 || m === 1) continue;
    if (!negativ && art === 'durch' && m <= n) continue;
    if (negativ && m > 0 && n > 0) continue; // auf M mindestens eine negative Hochzahl
    return [m, n];
  }
}

/** „Schreibe als eine Potenz: a³ · a⁴ = a^□“ – gefragt ist die Hochzahl */
export const pwGesetzExponent: Generator<ExponentParameter> = {
  id: 'pw.gesetz-exponent',
  version: 1,
  platzhalter: ['term', 'basis'],
  fehlerbildIds: ['mal-statt-plus', 'plus-statt-mal', 'geteilt', 'vorzeichen'],

  erzeuge(seed, p) {
    verlange(p.gesetze.length > 0, 'gesetze: mindestens eins');
    const r = rng(seed);
    const art = r.pick(p.gesetze);
    const basis = r.pick(VARIABLEN);
    const [m, n] = hochzahlen(r, art, p.negativ);
    const k = ergebnis(art, m, n);
    const richtig = zahl(k);
    return {
      platzhalter: {
        term: de(`${term(art, basis, m, n)} = ${basis}^{\\square}`),
        basis: de(basis),
      },
      vorzeichen: p.negativ,
      loesung: richtig,
      loesungsweg: [
        de(REGEL[art]),
        de(`$${term(art, basis, m, n)} = ${basis}^{${rechnung(art, m, n)}} = ${pot(basis, k)}$`),
      ],
      fehlerbilder: fehlerbilderAus(
        richtig,
        falscheHochzahlen(art, m, n).map(([id, h]) => [id, h === undefined ? undefined : zahl(h)]),
      ),
    };
  },
};

// ---------------------------------------------------------------------------
// Geschickt berechnen (M.ZO.PW.GESETZE.WERT), mit Zwischenschritten

export interface WertParameter {
  readonly gesetze: readonly Gesetz[];
  readonly negativ: boolean;
}

/** größte Hochzahl des Ergebnisses je Basis, damit es im Kopf geht */
const MAX_ERGEBNIS: Readonly<Record<number, number>> = { 2: 8, 3: 5, 5: 4, 10: 6 };

function wertAufgabe(seed: number, p: WertParameter) {
  verlange(p.gesetze.length > 0, 'gesetze: mindestens eins');
  const r = rng(seed);
  const art = r.pick(p.gesetze);
  const b = r.pick([2, 3, 5, 10]);
  const max = MAX_ERGEBNIS[b] ?? 4;
  for (;;) {
    const [m, n] =
      art === 'hoch'
        ? [r.int(p.negativ ? -3 : 2, 4), r.int(p.negativ ? -2 : 2, 3)]
        : [r.int(p.negativ ? -4 : 2, 12), r.int(p.negativ ? -6 : 2, 9)];
    if (m === 0 || n === 0 || m === 1 || n === 1) continue;
    const k = ergebnis(art, m, n);
    if (k < 1 || k > max) continue;
    // auf M bei mal und durch mindestens eine negative Hochzahl; bei hoch auch positive
    if (p.negativ && art !== 'hoch' && m > 0 && n > 0) continue;
    return { art, b, m, n, k };
  }
}

/** „Berechne geschickt: 2⁷ : 2⁴“ – erst als eine Potenz schreiben, dann ausrechnen */
function pwGesetzWertFassung(fassung: 1 | 2): Generator<WertParameter> {
  return {
    id: 'pw.gesetz-wert',
    version: fassung,
    platzhalter: ['term', 'basis'],
    fehlerbildIds: ['mal-statt-plus', 'plus-statt-mal', 'geteilt', 'vorzeichen', 'basen-mal'],

    schritte: [
      {
        id: 'potenz',
        fehlerbildIds: ['mal-statt-plus', 'plus-statt-mal', 'geteilt', 'vorzeichen'],
      },
      { id: 'wert', fehlerbildIds: ['hochzahl-mal'] },
    ],

    erzeuge(seed, p) {
      const { art, b, m, n, k } = wertAufgabe(seed, p);
      const wert = b ** k;
      const richtig = zahl(wert);
      const alsWert = (h: number | undefined) =>
        h === undefined || h < 0 || h > 12 || b ** h > 10_000_000 ? undefined : zahl(b ** h);
      const basenMal = art === 'mal' && (b * b) ** k <= 10_000_000 ? zahl((b * b) ** k) : undefined;
      return {
        platzhalter: { term: de(term(art, texZahl(b), m, n)), basis: b },
        loesung: richtig,
        loesungsweg: [
          de(REGEL[art]),
          de(
            `$${term(art, texZahl(b), m, n)} = ${texZahl(b)}^{${rechnung(art, m, n)}} = ${potWert(b, k)}$`,
          ),
          de(
            fassung === 2 && k === 1
              ? `$${potWert(b, k)} = ${texZahl(wert)}$`
              : `$${potWert(b, k)} = ${Array.from({ length: k }, () => texZahl(b)).join(' \\cdot ')} = ${texZahl(wert)}$`,
          ),
        ],
        fehlerbilder: fehlerbilderAus(richtig, [
          ...falscheHochzahlen(art, m, n).map(
            ([id, h]) => [id, alsWert(h)] as [string, Loesung | undefined],
          ),
          ['basen-mal', basenMal],
        ]),
      };
    },

    schritt(seed, p, id) {
      const { art, b, m, n, k } = wertAufgabe(seed, p);
      if (id === 'potenz') {
        const loesung = zahl(k);
        return {
          loesung,
          fehlerbilder: fehlerbilderAus(
            loesung,
            falscheHochzahlen(art, m, n).map(([fid, h]) => [
              fid,
              h === undefined ? undefined : zahl(h),
            ]),
          ),
        };
      }
      const loesung = zahl(b ** k);
      return {
        loesung,
        fehlerbilder: fehlerbilderAus(loesung, [['hochzahl-mal', zahl(b * k)]]),
        platzhalter: { potenz: k },
      };
    },
  };
}

/** Fassung 1 bleibt für gespeicherte Aufgaben (INHALTSFORMAT §6.1 Regel 5): „10¹ = 10 = 10“. */
export const pwGesetzWertV1 = pwGesetzWertFassung(1);
export const pwGesetzWert = pwGesetzWertFassung(2);

// ---------------------------------------------------------------------------
// Fehler finden (M.ZO.PW.GESETZE.FEHLER, Niveau E)

interface Pruefung {
  readonly tex: string;
  readonly richtig: string;
  readonly falsch: readonly (readonly [string, string])[];
  readonly weg: readonly string[];
}

function pruefung(r: Rng): Pruefung {
  const a = r.pick(VARIABLEN);
  const m = r.int(2, 6);
  const n = r.int(2, 6);
  const art = r.int(0, 5);
  if (art === 0)
    return {
      tex: `${pot(a, m)} \\cdot ${pot(a, n)} = ${pot(a, m * n)}`,
      richtig: `Nein. Beim Malnehmen werden die Hochzahlen addiert: $${pot(a, m)} \\cdot ${pot(a, n)} = ${pot(a, m + n)}$.`,
      falsch: [
        ['mal-statt-plus', 'Ja. Beim Malnehmen werden auch die Hochzahlen malgenommen.'],
        ['basen-mal', `Nein. Richtig ist $(${a} \\cdot ${a})^{${m + n}}$.`],
        ['nur-zahlen', `Nein, aber nur, weil ${a} eine Variable ist. Mit Zahlen stimmt es.`],
      ],
      weg: [
        `$${pot(a, m)} \\cdot ${pot(a, n)}$ sind ${m} + ${n} = ${m + n} Faktoren ${a}.`,
        `Also $${pot(a, m + n)}$, nicht $${pot(a, m * n)}$.`,
      ],
    };
  if (art === 1)
    return {
      tex: `\\left(${pot(a, m)}\\right)^{${n}} = ${pot(a, m + n)}`,
      richtig: `Nein. Bei der Potenz einer Potenz werden die Hochzahlen malgenommen: $\\left(${pot(a, m)}\\right)^{${n}} = ${pot(a, m * n)}$.`,
      falsch: [
        ['plus-statt-mal', 'Ja. Die Hochzahlen werden addiert.'],
        ['nur-zahlen', `Nein, aber nur, weil ${a} eine Variable ist. Mit Zahlen stimmt es.`],
        ['hoch-hoch', `Nein. Richtig ist $${a}^{${m}^{${n}}}$, also ${a} hoch ${m ** n}.`],
      ],
      weg: [
        `$\\left(${pot(a, m)}\\right)^{${n}}$ heißt: ${n}-mal $${pot(a, m)}$ malnehmen.`,
        `Das sind ${n} · ${m} = ${m * n} Faktoren ${a}, also $${pot(a, m * n)}$.`,
      ],
    };
  if (art === 2)
    return {
      tex: `${a}^{0} = 0`,
      richtig: `Nein. Für $${a} \\neq 0$ gilt $${a}^{0} = 1$, denn $${pot(a, m)} : ${pot(a, m)} = ${a}^{0}$ und das ist 1.`,
      falsch: [
        ['hoch-null', `Ja. Null Faktoren ${a} ergeben null.`],
        ['hoch-null-basis', `Nein. Richtig ist $${a}^{0} = ${a}$.`],
        ['nur-zahlen', `Nein, aber nur, weil ${a} eine Variable ist. Mit Zahlen stimmt es.`],
      ],
      weg: [
        `Teile eine Potenz durch sich selbst: $${pot(a, m)} : ${pot(a, m)} = ${a}^{${m} - ${m}} = ${a}^{0}$.`,
        'Eine Zahl (nicht 0) durch sich selbst ist 1. Also ist die Potenz mit Hochzahl 0 gleich 1.',
      ],
    };
  if (art === 3) {
    const b = r.pick([2, 3, 5]);
    const k = r.int(2, 3);
    return {
      tex: `${pot(a, -n)} = -${pot(a, n)}`,
      richtig: `Nein. $${pot(a, -n)} = \\frac{1}{${pot(a, n)}}$, zum Beispiel $${pot(String(b), -k)} = \\frac{1}{${b ** k}}$.`,
      falsch: [
        ['negativ-minus', 'Ja. Das Minus der Hochzahl kommt vor die Potenz.'],
        ['nur-zahlen', `Nein, aber nur, weil ${a} eine Variable ist. Mit Zahlen stimmt es.`],
        ['negativ-ignoriert', `Nein. Richtig ist $${pot(a, -n)} = ${pot(a, n)}$.`],
      ],
      weg: [
        `$${pot(a, -n)} = ${a}^{0 - ${n}} = ${a}^{0} : ${pot(a, n)} = 1 : ${pot(a, n)}$.`,
        `Also $${pot(a, -n)} = \\frac{1}{${pot(a, n)}}$. Das ist ein Bruch, keine negative Zahl.`,
      ],
    };
  }
  if (art === 4) {
    const [x, y] = r.pick([
      [2, 5],
      [4, 25],
      [2, 50],
      [5, 20],
    ] as const);
    return {
      tex: `${pot(String(x), m)} \\cdot ${pot(String(y), m)} = ${pot(String(x * y), m)}`,
      richtig:
        'Ja. Bei gleicher Hochzahl werden die Basen malgenommen: $a^{m} \\cdot b^{m} = (a \\cdot b)^{m}$.',
      falsch: [
        ['nur-gleiche-basis', 'Nein. Potenzgesetze gelten nur bei gleicher Basis.'],
        [
          'basen-mal',
          `Nein. Richtig ist $${pot(String(x * y), 2 * m)}$, die Hochzahlen werden addiert.`,
        ],
        ['basen-addiert', `Nein. Richtig ist $${pot(String(x + y), m)}$.`],
      ],
      weg: [
        `$${pot(String(x), m)} \\cdot ${pot(String(y), m)}$ sind ${m} Paare ${x} · ${y}.`,
        `Jedes Paar ist ${x * y}, also $${pot(String(x * y), m)}$.`,
      ],
    };
  }
  const b = r.pick([2, 3, 5]);
  return {
    tex: `${pot(String(b), m)} \\cdot ${pot(String(b), n)} = ${pot(String(b * b), m + n)}`,
    richtig: `Nein. Die Basis bleibt ${b}, nur die Hochzahlen werden addiert: $${pot(String(b), m + n)}$.`,
    falsch: [
      ['basen-mal', 'Ja. Basen malnehmen, Hochzahlen addieren.'],
      ['mal-statt-plus', `Nein. Richtig ist $${pot(String(b), m * n)}$.`],
      ['nur-gleiche-basis', 'Nein. Man darf Potenzen gar nicht zusammenfassen.'],
    ],
    weg: [
      `$${pot(String(b), m)} \\cdot ${pot(String(b), n)}$ sind ${m + n} Faktoren ${b}.`,
      `Also $${pot(String(b), m + n)}$. Die Basis ${b} ändert sich nicht.`,
    ],
  };
}

/** „Stimmt die Rechnung?“ – vier Antworten mit Begründung */
export const pwGesetzFehler: Generator<Record<string, never>> = {
  id: 'pw.gesetz-fehler',
  version: 1,
  platzhalter: ['rechnung'],
  fehlerbildIds: [
    'mal-statt-plus',
    'plus-statt-mal',
    'basen-mal',
    'nur-zahlen',
    'hoch-hoch',
    'hoch-null',
    'hoch-null-basis',
    'negativ-minus',
    'negativ-ignoriert',
    'nur-gleiche-basis',
    'basen-addiert',
  ],

  erzeuge(seed) {
    const r = rng(seed);
    const a = pruefung(r);
    const liste = mische(r, [['richtig', a.richtig] as const, ...a.falsch]);
    const index = (id: string) => auswahl(liste.findIndex(([x]) => x === id));
    return {
      platzhalter: { rechnung: de(a.tex) },
      optionen: liste.map(([, t]) => ({ text: de(t) satisfies Sprachobjekt })),
      loesung: index('richtig'),
      loesungsweg: a.weg.map(de),
      fehlerbilder: a.falsch.map(([id]) => ({ id, antwort: index(id) })),
    };
  },
};
