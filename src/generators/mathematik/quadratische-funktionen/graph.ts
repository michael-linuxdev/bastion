// Quadratische Funktionen – Klasse 9 (LEHRPLAN §8e, Feld QF): Wertetabelle, Graph ablesen
// (Nullstellen, Wertebereich, Monotonie), Scheitelpunkt aus Scheitel- und Normalform, Maximum
// oder Minimum. Graphen mit `koordinatensystemBereich` und `kurve` (Bedarfsliste B5).
import type { Bild, Generator, Loesung, Sprachobjekt } from '../../../core/learning/generator';
import { fehlerbilderAus } from '../../../core/learning/loesung';
import { texZahl, zahlText } from '../../../core/learning/text';
import { rng, type Rng } from '../../../core/rng/rng';
import { auswahl, de, mische, variante, verlange, zahl } from '../../hilfen';
import { bild, koordinatensystemBereich, kreis, kurve } from '../../svg';

/** Parabel y = a·(x − d)² + e */
export interface Parabel {
  readonly a: number;
  readonly d: number;
  readonly e: number;
}

export const wert = (p: Parabel, x: number) => p.a * (x - p.d) ** 2 + p.e;

/** „a(x − d)² + e“ in LaTeX: (x - 2)^2 - 3, -(x + 1)^2, 2x^2 + 1 */
export function scheitelform(p: Parabel): string {
  const faktor = p.a === 1 ? '' : p.a === -1 ? '-' : texZahl(p.a);
  const quadrat = p.d === 0 ? 'x^2' : `(x ${p.d > 0 ? '-' : '+'} ${texZahl(Math.abs(p.d))})^2`;
  const rest = p.e === 0 ? '' : ` ${p.e > 0 ? '+' : '-'} ${texZahl(Math.abs(p.e))}`;
  return `${faktor}${quadrat}${rest}`;
}

/** x² + p·x + q in LaTeX */
export function normalform(p: number, q: number): string {
  const glied = (k: number, v: string) =>
    k === 0
      ? ''
      : ` ${k > 0 ? '+' : '-'} ${Math.abs(k) === 1 && v ? '' : texZahl(Math.abs(k))}${v}`;
  return `x^2${glied(p, 'x')}${glied(q, '')}`;
}

/** Graph der Parabel im Ausschnitt −6 … 6 (x) und ymin … ymax */
export function parabelBild(
  p: Parabel,
  extra: (a: ReturnType<typeof koordinatensystemBereich>) => string[] = () => [],
): Bild {
  // Ausschnitt knapp am Scheitelpunkt, etwa 9 Einheiten in Öffnungsrichtung, x-Achse immer dabei
  const ymin = p.a > 0 ? Math.min(-1, p.e - 1) : Math.min(-2, p.e - 8);
  const ymax = p.a > 0 ? Math.max(2, p.e + 8) : Math.max(1, p.e + 1);
  const ks = koordinatensystemBereich(-6, 6, ymin, ymax, 26);
  return bild(
    ks.breite,
    ks.hoehe,
    [...ks.teile, kurve(ks, (x) => wert(p, x), -6, 6, { ymin, ymax }, 200), ...extra(ks)],
    de(
      `Ein Koordinatensystem mit einer Parabel. Sie ist nach ${p.a > 0 ? 'oben' : 'unten'} geöffnet, ihr Scheitelpunkt liegt bei (${zahlText(p.d)}|${zahlText(p.e)}).`,
    ),
  );
}

const pm = (r: Rng, max: number) => r.int(1, max) * (r.int(0, 1) === 0 ? -1 : 1);
const sortiert = (w: number[]) => [...w].sort((x, y) => x - y);
const felder = (w: number[]): Loesung => ({ typ: 'felder', wert: sortiert(w) });

// ---------------------------------------------------------------------------
// Wertetabelle (M.SF.QF.GRAPH.WERTETABELLE)

export interface WertetabelleParameter {
  /** Faktoren vor x², z. B. [1] oder [-2, -1, 0.5, 2] */
  readonly faktoren: readonly number[];
}

/** „Berechne f(−3) für f(x) = x² − 4.“ */
function qfWertetabelleFassung(fassung: 1 | 2): Generator<WertetabelleParameter> {
  return {
    id: 'qf.wertetabelle',
    version: fassung,
    platzhalter: ['funktion', 'x'],
    fehlerbildIds: ['minus-quadrat', 'mal-zwei', 'faktor-vergessen'],

    erzeuge(seed, p) {
      verlange(p.faktoren.length > 0, 'faktoren: mindestens einer');
      const r = rng(seed);
      const a = r.pick(p.faktoren);
      const c = r.int(-6, 6);
      const x = r.int(0, 2) === 0 ? r.int(1, 5) : -r.int(1, 5);
      const f: Parabel = { a, d: 0, e: c };
      const y = wert(f, x);
      const richtig = zahl(y);
      const eingesetzt = fassung === 1 || x < 0 ? `(${texZahl(x)})` : texZahl(x);
      return {
        platzhalter: { funktion: de(`f(x) = ${scheitelform(f)}`), x },
        vorzeichen: true,
        loesung: richtig,
        loesungsweg: [
          de(
            `Setze $x = ${texZahl(x)}$ ein: $f(${texZahl(x)}) = ${scheitelform(f).replace('x^2', `${eingesetzt}^2`)}$.`,
          ),
          de(`$${eingesetzt}^2 = ${texZahl(x * x)}$, also $f(${texZahl(x)}) = ${texZahl(y)}$.`),
        ],
        fehlerbilder: fehlerbilderAus(richtig, [
          ['minus-quadrat', x < 0 ? zahl(-a * x * x + c) : undefined],
          ['mal-zwei', zahl(a * 2 * x + c)],
          ['faktor-vergessen', a === 1 ? undefined : zahl(x * x + c)],
        ]),
      };
    },
  };
}

/** Fassung 1 bleibt für gespeicherte Aufgaben (INHALTSFORMAT §6.1 Regel 5): Klammern auch um positive x: „(3)²“. */
export const qfWertetabelleV1 = qfWertetabelleFassung(1);
export const qfWertetabelle = qfWertetabelleFassung(2);

// ---------------------------------------------------------------------------
// Am Graphen ablesen (M.SF.QF.GRAPH.ABLESEN): Nullstellen (G), Wertebereich (M)

export interface AblesenParameter {
  readonly frage: 'nullstellen' | 'wertebereich';
  /** auch nach unten geöffnete Parabeln */
  readonly unten: boolean;
}

function ablesbareParabel(r: Rng, unten: boolean, nullstellen: boolean): Parabel {
  const a = unten && r.int(0, 1) === 0 ? -1 : 1;
  const d = r.int(-3, 3);
  // Nullstellen ganzzahlig (Abstand 1, 2 oder 3 zum Scheitel) oder gar keine
  const keine = nullstellen && r.int(0, 3) === 0;
  const e = keine ? a * r.int(1, 3) : nullstellen ? -a * r.pick([1, 4, 9]) : pm(r, 4);
  return { a, d, e };
}

/** „Lies die Nullstellen ab.“ / „Lies den Wertebereich ab.“ – mit Graph */
const qfAblesen: Generator<AblesenParameter> = {
  id: 'qf.ablesen',
  version: 1,
  platzhalter: ['zeichen'],
  fehlerbildIds: ['scheitel-statt-nullstellen', 'vorzeichen', 'x-statt-y'],

  erzeuge(seed, p) {
    const r = rng(seed);
    const nullstellen = p.frage === 'nullstellen';
    const f = ablesbareParabel(r, p.unten, nullstellen);
    const b = parabelBild(f, (ks) => [kreis(ks.px(f.d), ks.py(f.e), 3.5, true)]);
    if (nullstellen) {
      const w = Math.sqrt(-f.e / f.a);
      const loesung = Number.isNaN(w) ? felder([]) : felder([f.d - w, f.d + w]);
      return {
        platzhalter: { zeichen: de(f.a > 0 ? '\\geq' : '\\leq') },
        bild: b,
        vorzeichen: true,
        felder: {
          namen: [de('x₁ ='), de('x₂ =')],
          ungeordnet: true,
          keineLoesung: true,
        },
        loesung,
        loesungsweg: Number.isNaN(w)
          ? [
              de('Nullstellen sind die Stellen, an denen der Graph die x-Achse schneidet.'),
              de(
                `Der Scheitelpunkt liegt bei $(${texZahl(f.d)}|${texZahl(f.e)})$, die Parabel ist nach ${f.a > 0 ? 'oben' : 'unten'} geöffnet. Sie erreicht die x-Achse nie: keine Nullstelle.`,
              ),
            ]
          : [
              de('Nullstellen sind die Stellen, an denen der Graph die x-Achse schneidet.'),
              de(
                `Der Graph schneidet die x-Achse bei $x_1 = ${texZahl(f.d - w)}$ und $x_2 = ${texZahl(f.d + w)}$.`,
              ),
            ],
        fehlerbilder: fehlerbilderAus(loesung, [
          ['scheitel-statt-nullstellen', felder([f.d, f.e])],
          ['vorzeichen', Number.isNaN(w) || f.d === 0 ? undefined : felder([-f.d - w, -f.d + w])],
        ]),
      };
    }
    // Wertebereich: y ≥ e (nach oben offen) oder y ≤ e (nach unten offen)
    const richtig = zahl(f.e);
    return {
      platzhalter: { zeichen: de(f.a > 0 ? '\\geq' : '\\leq') },
      bild: b,
      vorzeichen: true,
      loesung: richtig,
      loesungsweg: [
        de(
          `Der Scheitelpunkt $(${texZahl(f.d)}|${texZahl(f.e)})$ ist der ${f.a > 0 ? 'tiefste' : 'höchste'} Punkt.`,
        ),
        de(
          `Alle y-Werte sind ${f.a > 0 ? 'mindestens' : 'höchstens'} ${zahlText(f.e)}: $y ${f.a > 0 ? '\\geq' : '\\leq'} ${texZahl(f.e)}$.`,
        ),
      ],
      fehlerbilder: fehlerbilderAus(richtig, [['x-statt-y', f.d === f.e ? undefined : zahl(f.d)]]),
    };
  },
};

/** Nullstellen ablesen (M.SF.QF.GRAPH.NULLSTELLEN) */
export const qfNullstellen = variante(
  qfAblesen,
  'qf.nullstellen',
  ['scheitel-statt-nullstellen', 'vorzeichen'],
  { frage: 'nullstellen' as const },
);

/** Wertebereich ablesen (M.SF.QF.GRAPH.WERTEBEREICH) */
export const qfWertebereich = variante(qfAblesen, 'qf.wertebereich', ['x-statt-y'], {
  frage: 'wertebereich' as const,
});

// ---------------------------------------------------------------------------
// Stimmt das? (M.SF.QF.GRAPH.AUSSAGE, Niveau E)

interface Aussage {
  readonly text: string;
  readonly richtig: string;
  readonly falsch: readonly (readonly [string, string])[];
  readonly weg: readonly string[];
}

function graphAussage(r: Rng): Aussage {
  const art = r.int(0, 3);
  const c = r.int(1, 5);
  if (art === 0)
    return {
      text: 'Jede Parabel hat zwei Nullstellen.',
      richtig: `Nein. $y = x^2 + ${c}$ liegt ganz über der x-Achse und hat keine Nullstelle.`,
      falsch: [
        ['immer-zwei', 'Ja. Eine Parabel hat zwei Äste, jeder schneidet die x-Achse einmal.'],
        ['beispiel', 'Ja, zum Beispiel hat $y = x^2 - 4$ die Nullstellen $-2$ und 2.'],
        ['nur-unten', 'Nein. Nur nach unten geöffnete Parabeln haben keine Nullstelle.'],
      ],
      weg: [
        'Eine einzige Parabel ohne zwei Nullstellen widerlegt die Aussage.',
        `$x^2 \\geq 0$, also ist $x^2 + ${c} \\geq ${c}$. Der Graph erreicht die x-Achse nie.`,
      ],
    };
  if (art === 1)
    return {
      text: 'Der Graph von $y = x^2$ fällt für $x < 0$ und steigt für $x > 0$.',
      richtig: 'Ja. Links vom Scheitelpunkt (0|0) fällt die Normalparabel, rechts steigt sie.',
      falsch: [
        ['monotonie-verdreht', 'Nein, umgekehrt: Sie steigt für $x < 0$ und fällt für $x > 0$.'],
        ['immer-steigend', 'Nein. Weil $x^2$ nie negativ ist, steigt sie überall.'],
        ['beispiel', 'Ja, denn $(-2)^2 = 4$ ist größer als $2^2 = 4$.'],
      ],
      weg: [
        'Lies von links nach rechts: $(-3)^2 = 9$, $(-2)^2 = 4$, $(-1)^2 = 1$, $0^2 = 0$ – die Werte werden kleiner.',
        'Danach $1^2 = 1$, $2^2 = 4$, $3^2 = 9$ – die Werte werden größer.',
      ],
    };
  if (art === 2)
    return {
      text: `Der Wertebereich von $y = -x^2 + ${c}$ ist $y \\geq ${c}$.`,
      richtig: `Nein. Die Parabel ist nach unten geöffnet, ${c} ist der größte Wert: $y \\leq ${c}$.`,
      falsch: [
        ['oeffnung-ignoriert', 'Ja. Der Scheitelpunkt ist immer der tiefste Punkt.'],
        ['x-statt-y', 'Nein. Der Wertebereich ist $x \\leq 0$.'],
        ['alle-zahlen', 'Nein. Der Wertebereich sind alle reellen Zahlen.'],
      ],
      weg: [
        'Das Minus vor $x^2$ öffnet die Parabel nach unten.',
        `Der Scheitelpunkt $(0|${c})$ ist der höchste Punkt, also sind alle y-Werte höchstens ${c}.`,
      ],
    };
  return {
    text: 'Der Definitionsbereich von $y = x^2 - 4$ ist $x \\geq 2$.',
    richtig:
      'Nein. Für jede reelle Zahl x kann man $x^2 - 4$ ausrechnen. Der Definitionsbereich sind alle reellen Zahlen.',
    falsch: [
      ['definition-wertebereich', 'Ja, denn erst ab $x = 2$ ist der Funktionswert positiv.'],
      ['x-statt-y', 'Nein. Der Definitionsbereich ist $y \\geq -4$.'],
      ['beispiel', 'Ja, denn für $x = 3$ ist $y = 5$.'],
    ],
    weg: [
      'Der Definitionsbereich sagt, welche x man einsetzen darf.',
      'Quadrieren und subtrahieren geht mit jeder Zahl, also sind alle reellen Zahlen erlaubt.',
    ],
  };
}

/** „Stimmt das?“ – Aussage über Graphen quadratischer Funktionen */
export const qfGraphAussage: Generator<Record<string, never>> = {
  id: 'qf.graph-aussage',
  version: 1,
  platzhalter: ['aussage'],
  fehlerbildIds: [
    'immer-zwei',
    'beispiel',
    'nur-unten',
    'monotonie-verdreht',
    'immer-steigend',
    'oeffnung-ignoriert',
    'x-statt-y',
    'alle-zahlen',
    'definition-wertebereich',
  ],

  erzeuge(seed) {
    const r = rng(seed);
    const a = graphAussage(r);
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
// Scheitelpunkt (M.SF.QF.SCHEITEL.BESTIMMEN): G aus Scheitelform, M aus Normalform

export interface ScheitelParameter {
  readonly formen: readonly ('scheitelform' | 'normalform')[];
}

function scheitelAufgabe(seed: number, p: ScheitelParameter) {
  verlange(p.formen.length > 0, 'formen: mindestens eine');
  const r = rng(seed);
  const form = r.pick(p.formen);
  const d = pm(r, 5);
  const e = r.int(-9, 9);
  // Normalform: x² + p·x + q mit p = −2d, q = d² + e
  return { form, d, e, pp: -2 * d, q: d * d + e };
}

/** „Gib den Scheitelpunkt von f(x) = (x − 2)² + 3 an.“ – zwei Felder x und y */
export const qfScheitel: Generator<ScheitelParameter> = {
  id: 'qf.scheitel',
  version: 1,
  platzhalter: ['funktion'],
  fehlerbildIds: ['vorzeichen-d', 'q-statt-e', 'p-nicht-halbiert'],

  erzeuge(seed, p) {
    const { form, d, e, pp, q } = scheitelAufgabe(seed, p);
    const funktion = form === 'scheitelform' ? scheitelform({ a: 1, d, e }) : normalform(pp, q);
    const richtig: Loesung = { typ: 'felder', wert: [d, e] };
    const fp = (x: number, y: number): Loesung => ({ typ: 'felder', wert: [x, y] });
    return {
      platzhalter: { funktion: de(`f(x) = ${funktion}`) },
      vorzeichen: true,
      felder: { namen: [de('x-Wert:'), de('y-Wert:')] },
      loesung: richtig,
      loesungsweg:
        form === 'scheitelform'
          ? [
              de(
                'In der Scheitelform $f(x) = (x - d)^2 + e$ liegt der Scheitelpunkt bei $S(d|e)$.',
              ),
              de(
                `Hier: $S(${texZahl(d)}|${texZahl(e)})$. Achte auf das Vorzeichen: $(x ${d > 0 ? '-' : '+'} ${Math.abs(d)})$ gehört zu $d = ${texZahl(d)}$.`,
              ),
            ]
          : [
              de(
                `Quadratisch ergänzen: $x^2 ${pp > 0 ? '+' : '-'} ${Math.abs(pp)}x = (x ${pp > 0 ? '+' : '-'} ${Math.abs(pp) / 2})^2 - ${(pp / 2) ** 2}$.`,
              ),
              de(
                `$f(x) = (x ${pp > 0 ? '+' : '-'} ${Math.abs(pp) / 2})^2 - ${(pp / 2) ** 2} ${q < 0 ? '-' : '+'} ${Math.abs(q)} = ${scheitelform({ a: 1, d, e })}$`,
              ),
              de(`Also $S(${texZahl(d)}|${texZahl(e)})$.`),
            ],
      fehlerbilder: fehlerbilderAus(richtig, [
        ['vorzeichen-d', fp(-d, e)],
        ['q-statt-e', form === 'normalform' && q !== e ? fp(d, q) : undefined],
        ['p-nicht-halbiert', form === 'normalform' ? fp(-pp, e) : undefined],
      ]),
    };
  },
};

// ---------------------------------------------------------------------------
// Maximum oder Minimum? (M.SF.QF.SCHEITEL.EXTREMUM, Niveau E)

/** „f(x) = −2(x − 1)² + 5: Was stimmt?“ – Art und Wert des Extremums mit Begründung */
export const qfExtremum: Generator<Record<string, never>> = {
  id: 'qf.extremum',
  version: 1,
  platzhalter: ['funktion'],
  fehlerbildIds: ['oeffnung-verdreht', 'x-statt-y', 'faktor-als-wert'],

  erzeuge(seed) {
    const r = rng(seed);
    const a = r.pick([-3, -2, -1, -0.5, 0.5, 2, 3]);
    const d = pm(r, 4);
    let e = r.int(-8, 8);
    while (e === d || e === a || e === 0) e = r.int(-8, 8);
    const f: Parabel = { a, d, e };
    const art = a > 0 ? 'Minimum' : 'Maximum';
    const anders = a > 0 ? 'Maximum' : 'Minimum';
    const kandidaten: [string, string][] = [
      [
        'richtig',
        `${art} ${zahlText(e)} bei $x = ${texZahl(d)}$, weil die Parabel nach ${a > 0 ? 'oben' : 'unten'} geöffnet ist.`,
      ],
      ['oeffnung-verdreht', `${anders} ${zahlText(e)} bei $x = ${texZahl(d)}$.`],
      ['x-statt-y', `${art} ${zahlText(d)} bei $x = ${texZahl(e)}$.`],
      ['faktor-als-wert', `${art} ${zahlText(a)} bei $x = ${texZahl(d)}$.`],
    ];
    const liste = mische(r, kandidaten);
    const index = (id: string) => auswahl(liste.findIndex(([x]) => x === id));
    return {
      platzhalter: { funktion: de(`f(x) = ${scheitelform(f)}`) },
      optionen: liste.map(([, t]) => ({ text: de(t) satisfies Sprachobjekt })),
      loesung: index('richtig'),
      loesungsweg: [
        de(`Scheitelpunkt aus der Scheitelform: $S(${texZahl(d)}|${texZahl(e)})$.`),
        de(
          `Der Faktor $${texZahl(a)}$ ist ${a > 0 ? 'positiv: Die Parabel ist nach oben geöffnet, S ist der tiefste Punkt' : 'negativ: Die Parabel ist nach unten geöffnet, S ist der höchste Punkt'}.`,
        ),
        de(`Also ${art} ${zahlText(e)} an der Stelle $x = ${texZahl(d)}$.`),
      ],
      fehlerbilder: liste
        .filter(([id]) => id !== 'richtig')
        .map(([id]) => ({ id, antwort: index(id) })),
    };
  },
};
