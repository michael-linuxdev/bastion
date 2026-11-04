// Funktionen systematisch – Klasse 10 (LEHRPLAN §8f, Feld FS): Grundfunktionen erkennen,
// Eigenschaften, Transformationen, Verkettung und Zahlenfolgen. Formeln in LaTeX für KaTeX.
import type { Bild, Generator } from '../../../core/learning/generator';
import { fehlerbilderAus } from '../../../core/learning/loesung';
import { texZahl } from '../../../core/learning/text';
import { rng, type Rng } from '../../../core/rng/rng';
import { aussagenGenerator } from '../../aussagen';
import { auswahl, de, mische, zahl } from '../../hilfen';
import { bild, koordinatensystemBereich, kurve } from '../../svg';

// ---------------------------------------------------------------------------
// Grundfunktionen

export type Grund = 'x' | 'x2' | 'wurzel' | 'kehrwert' | 'exp' | 'sin' | 'x3';

export const GRUND: Readonly<
  Record<Grund, { tex: string; f: (x: number) => number; name: string }>
> = {
  x: { tex: 'x', f: (x) => x, name: 'Gerade durch den Ursprung' },
  x2: { tex: 'x^2', f: (x) => x * x, name: 'Normalparabel' },
  x3: { tex: 'x^3', f: (x) => x ** 3, name: 'kubische Parabel' },
  wurzel: { tex: '\\sqrt{x}', f: (x) => (x >= 0 ? Math.sqrt(x) : NaN), name: 'Wurzelfunktion' },
  kehrwert: { tex: '\\frac{1}{x}', f: (x) => 1 / x, name: 'Hyperbel' },
  exp: { tex: 'e^x', f: (x) => Math.exp(x), name: 'Exponentialfunktion' },
  sin: { tex: '\\sin x', f: (x) => Math.sin(x), name: 'Sinusfunktion' },
};

/** Verwechslungspartner: welcher Graph sieht ähnlich aus */
const AEHNLICH: Readonly<Record<Grund, Grund>> = {
  x: 'x3',
  x2: 'wurzel',
  x3: 'x',
  wurzel: 'x2',
  kehrwert: 'exp',
  exp: 'kehrwert',
  sin: 'x3',
};

function graphBild(fs: readonly ((x: number) => number)[], beschreibung: string): Bild {
  const ks = koordinatensystemBereich(-4, 4, -4, 4, 22);
  const teile = [...ks.teile];
  fs.forEach((f, i) => {
    const pfad = kurve(ks, f, -4, 4, { ymin: -4, ymax: 4 }, 200);
    teile.push(
      i === 0 ? pfad : pfad.replace('<path ', '<path stroke-dasharray="6 5" stroke-opacity="0.6" '),
    );
  });
  return bild(ks.breite, ks.hoehe, teile, de(beschreibung));
}

/** Kennzeichen eines Graphen in Worten, für die Bildbeschreibung (ohne den Namen zu verraten) */
function merkmale(g: Grund): string {
  const f = GRUND[g].f;
  const punkte = [-2, -1, 0, 1, 2]
    .map((x) => {
      const y = f(x);
      return Number.isFinite(y) ? `(${x}|${texZahl(Math.round(y * 100) / 100)})` : null;
    })
    .filter(Boolean)
    .join(', ')
    .replace(/\{,\}/g, ',');
  return `Ein Graph durch die Punkte ${punkte}.`;
}

/** „Welcher Term gehört zum Graphen?“ (M.SF.FS.SYSTEMATIK, Niveau G) */
export const fsZuordnen: Generator<Record<string, never>> = {
  id: 'fs.zuordnen',
  version: 1,
  platzhalter: ['art'],
  fehlerbildIds: ['aehnlich', 'andere'],

  erzeuge(seed) {
    const r = rng(seed);
    const arten = Object.keys(GRUND) as Grund[];
    const g = r.pick(arten);
    const a = AEHNLICH[g];
    const rest = arten.filter((x) => x !== g && x !== a);
    const andere = r.pick(rest);
    const liste = mische(r, [
      ['richtig', g],
      ['aehnlich', a],
      ['andere', andere],
    ] as const);
    const idx = (k: string) => auswahl(liste.findIndex(([q]) => q === k));
    return {
      platzhalter: { art: arten.indexOf(g) },
      bild: graphBild([GRUND[g].f], merkmale(g)),
      optionen: liste.map(([, x]) => ({ text: de(`$y = ${GRUND[x].tex}$`) })),
      loesung: idx('richtig'),
      loesungsweg: [
        de(`Der Graph ist eine ${GRUND[g].name}.`),
        de(`Prüfe zwei Punkte, etwa $x = 1$ und $x = 2$: Das passt zu $y = ${GRUND[g].tex}$.`),
      ],
      fehlerbilder: [
        { id: 'aehnlich', antwort: idx('aehnlich') },
        { id: 'andere', antwort: idx('andere') },
      ],
    };
  },
};

/** Eigenschaften: richtige Aussage und zwei falsche je Grundfunktion */
const EIGENSCHAFTEN: Readonly<
  Record<Grund, { wahr: string; definition: string; eigenschaft: string }>
> = {
  x: {
    wahr: 'Der Graph ist punktsymmetrisch zum Ursprung und hat die Nullstelle 0.',
    definition: 'Man darf nur $x \\geq 0$ einsetzen.',
    eigenschaft: 'Der Graph ist achsensymmetrisch zur y-Achse.',
  },
  x2: {
    wahr: 'Der Wertebereich ist $y \\geq 0$, der Graph ist achsensymmetrisch zur y-Achse.',
    definition: 'Man darf nur $x \\geq 0$ einsetzen.',
    eigenschaft: 'Der Graph ist punktsymmetrisch zum Ursprung.',
  },
  x3: {
    wahr: 'Der Graph ist punktsymmetrisch zum Ursprung, jede reelle Zahl ist ein Funktionswert.',
    definition: 'Für $x < 0$ ist $x^3$ nicht definiert.',
    eigenschaft: 'Der Wertebereich ist $y \\geq 0$.',
  },
  wurzel: {
    wahr: 'Man darf nur $x \\geq 0$ einsetzen, und alle Werte sind $y \\geq 0$.',
    definition: 'Man darf jede reelle Zahl einsetzen, $\\sqrt{-4} = -2$.',
    eigenschaft: 'Der Graph ist achsensymmetrisch zur y-Achse.',
  },
  kehrwert: {
    wahr: 'Bei $x = 0$ ist die Funktion nicht definiert, der Graph hat keine Nullstelle.',
    definition: 'Man darf jede reelle Zahl einsetzen, auch 0.',
    eigenschaft: 'Der Graph schneidet die x-Achse bei $x = 1$.',
  },
  exp: {
    wahr: 'Alle Werte sind positiv, die x-Achse ist Asymptote.',
    definition: 'Man darf nur $x \\geq 0$ einsetzen.',
    eigenschaft: 'Der Graph schneidet die x-Achse bei $x = -1$.',
  },
  sin: {
    wahr: 'Die Werte liegen zwischen −1 und 1, die Periode ist $2\\pi$.',
    definition: 'Man darf nur Winkel von 0 bis $2\\pi$ einsetzen.',
    eigenschaft: 'Der Graph ist achsensymmetrisch zur y-Achse.',
  },
};

/** „Welche Aussage über y = f(x) stimmt?“ (M.SF.FS.SYSTEMATIK, Niveau M) */
export const fsEigenschaft = aussagenGenerator(
  'fs.eigenschaft',
  ['definition', 'eigenschaft'],
  ['art'],
  (r) => {
    const arten = Object.keys(GRUND) as Grund[];
    const g = r.pick(arten);
    const e = EIGENSCHAFTEN[g];
    return {
      situation: `Gegeben ist $y = ${GRUND[g].tex}$. Welche Aussage stimmt?`,
      werte: { art: arten.indexOf(g) },
      richtig: e.wahr,
      falsch: [
        ['definition', e.definition],
        ['eigenschaft', e.eigenschaft],
      ],
      weg: [
        `Skizziere den Graphen: ${GRUND[g].name}.`,
        'Prüfe Definitionsbereich, Wertebereich, Nullstellen und Symmetrie am Graphen.',
      ],
    };
  },
);

/** E: Aussagen über Funktionsklassen (M.SF.FS.SYSTEMATIK.BEGRUENDEN) */
export const fsKlasseAussage = aussagenGenerator(
  'fs.klasse-aussage',
  ['gegenbeispiel', 'einzelfall'],
  ['art'],
  (r) => {
    const art = r.int(0, 2);
    const faelle = [
      {
        situation:
          'Ben sagt: „Jede Potenzfunktion $y = x^n$ geht durch den Punkt $(1|1)$.“ Stimmt das?',
        richtig: 'Ja. $1^n = 1$ für jede Hochzahl n, auch für negative.',
        falsch: [
          ['gegenbeispiel', 'Nein. $y = \\frac{1}{x}$ geht nicht durch $(1|1)$.'],
          ['einzelfall', 'Nur für $n = 2$, denn nur die Normalparabel geht durch $(1|1)$.'],
        ],
        weg: ['Setze $x = 1$ ein: $1^n = 1$.', 'Das gilt für jedes n.'],
      },
      {
        situation:
          'Ben sagt: „Jede Potenzfunktion $y = x^n$ geht durch den Ursprung $(0|0)$.“ Stimmt das?',
        richtig: 'Nein. $y = x^{-1} = \\frac{1}{x}$ ist bei $x = 0$ gar nicht definiert.',
        falsch: [
          ['gegenbeispiel', 'Ja. $0^n = 0$ für jede Hochzahl.'],
          ['einzelfall', 'Ja, denn $y = x^2$ und $y = x^3$ gehen durch $(0|0)$.'],
        ],
        weg: ['Ein Gegenbeispiel genügt: $n = -1$.', '$0^{-1} = \\frac{1}{0}$ gibt es nicht.'],
      },
      {
        situation:
          'Ben sagt: „Jede Exponentialfunktion $y = a^x$ mit $a > 0$ hat eine Nullstelle.“ Stimmt das?',
        richtig: 'Nein. $a^x$ ist für $a > 0$ immer positiv, die x-Achse ist nur Asymptote.',
        falsch: [
          [
            'gegenbeispiel',
            'Ja. Für $a < 1$ fällt der Graph und schneidet irgendwann die x-Achse.',
          ],
          ['einzelfall', 'Ja, denn $2^0 = 0$.'],
        ],
        weg: ['$a^x > 0$ für jedes x.', 'Darum kann $a^x = 0$ nie gelten.'],
      },
    ] as const;
    const f = faelle[art] ?? faelle[0];
    return { ...f, werte: { art } };
  },
);

// ---------------------------------------------------------------------------
// Transformationen (M.SF.FS.TRANSFORMATION, nur Gymnasium)

type Trafo = 'oben' | 'links' | 'streck-y' | 'streck-x';

interface Wirkung {
  readonly art: Trafo;
  readonly c: number;
  readonly g: Grund;
}

function trafoTex(w: Wirkung): string {
  const f = GRUND[w.g].tex;
  const ein = (innen: string) =>
    w.g === 'wurzel'
      ? `\\sqrt{${innen}}`
      : w.g === 'sin'
        ? `\\sin(${innen})`
        : w.g === 'exp'
          ? `e^{${innen}}`
          : w.g === 'kehrwert'
            ? `\\frac{1}{${innen}}`
            : `(${innen})^${w.g === 'x3' ? 3 : 2}`;
  const c = Math.abs(w.c);
  switch (w.art) {
    case 'oben':
      return `${f} ${w.c > 0 ? '+' : '-'} ${c}`;
    case 'links':
      return ein(`x ${w.c > 0 ? '+' : '-'} ${c}`);
    case 'streck-y':
      return `${w.c} \\cdot ${w.g === 'sin' ? '\\sin x' : f}`;
    case 'streck-x':
      return ein(`${w.c}x`);
  }
}

/** Wirkung in Worten; `falsch` dreht Richtung oder Achse um */
function wirkungText(w: Wirkung, fehler?: 'richtung' | 'achse'): string {
  const c = Math.abs(w.c);
  switch (w.art) {
    case 'oben': {
      const oben = w.c > 0 !== (fehler === 'richtung');
      if (fehler === 'achse') return `um ${c} nach ${w.c > 0 ? 'links' : 'rechts'} verschoben`;
      return `um ${c} nach ${oben ? 'oben' : 'unten'} verschoben`;
    }
    case 'links': {
      const links = w.c > 0 !== (fehler === 'richtung');
      if (fehler === 'achse') return `um ${c} nach ${w.c > 0 ? 'oben' : 'unten'} verschoben`;
      return `um ${c} nach ${links ? 'links' : 'rechts'} verschoben`;
    }
    case 'streck-y':
      if (fehler === 'achse') return `in x-Richtung mit dem Faktor ${w.c} gestreckt`;
      if (fehler === 'richtung')
        return `in y-Richtung mit dem Faktor $\\frac{1}{${w.c}}$ gestaucht`;
      return `in y-Richtung mit dem Faktor ${w.c} gestreckt`;
    case 'streck-x':
      if (fehler === 'achse') return `in y-Richtung mit dem Faktor ${w.c} gestreckt`;
      if (fehler === 'richtung') return `in x-Richtung mit dem Faktor ${w.c} gestreckt`;
      return `in x-Richtung mit dem Faktor $\\frac{1}{${w.c}}$ gestaucht`;
  }
}

/** „Wie entsteht der Graph aus dem von f?“ (Niveau G) */
export const fsWirkung: Generator<Record<string, never>> = {
  id: 'fs.wirkung',
  version: 1,
  platzhalter: ['term', 'art', 'c'],
  fehlerbildIds: ['richtung', 'achse'],

  erzeuge(seed) {
    const r = rng(seed);
    const art = r.pick(['oben', 'links', 'streck-y', 'streck-x'] as const);
    const g = r.pick(['x2', 'wurzel', 'exp', 'sin', 'x3'] as const);
    const c = art === 'oben' || art === 'links' ? r.pick([-3, -2, -1, 1, 2, 3]) : r.pick([2, 3]);
    const w: Wirkung = { art, c, g };
    const liste = mische(r, [
      ['richtig', wirkungText(w)],
      ['richtung', wirkungText(w, 'richtung')],
      ['achse', wirkungText(w, 'achse')],
    ] as const);
    const idx = (k: string) => auswahl(liste.findIndex(([q]) => q === k));
    const erklaerung: Readonly<Record<Trafo, string>> = {
      oben: 'Eine Zahl außerhalb von f wirkt in y-Richtung: Alle Werte werden um c größer.',
      links:
        'Eine Zahl im Inneren wirkt in x-Richtung und umgekehrt: $f(x + c)$ hat den Wert von f(0) schon bei $x = -c$.',
      'streck-y': 'Ein Faktor vor f wirkt in y-Richtung: Alle Werte werden c-mal so groß.',
      'streck-x':
        'Ein Faktor im Inneren wirkt in x-Richtung und umgekehrt: Der Graph wird um den Faktor c schmaler.',
    };
    return {
      platzhalter: {
        term: de(`$y = ${trafoTex(w)}$`),
        art: ['oben', 'links', 'streck-y', 'streck-x'].indexOf(art),
        c,
      },
      optionen: liste.map(([, t]) => ({
        text: de(`Der Graph von $y = ${GRUND[g].tex}$ wird ${t}.`),
      })),
      loesung: idx('richtig'),
      loesungsweg: [
        de(`$y = ${trafoTex(w)}$ entsteht aus $y = ${GRUND[g].tex}$.`),
        de(erklaerung[art]),
      ],
      fehlerbilder: [
        { id: 'richtung', antwort: idx('richtung') },
        { id: 'achse', antwort: idx('achse') },
      ],
    };
  },
};

/** Term zum verschobenen Graphen: y = (x − d)² + e oder √(x − d) + e (Niveau M) */
export const fsTermAusGraph: Generator<Record<string, never>> = {
  id: 'fs.term-aus-graph',
  version: 1,
  platzhalter: ['d', 'e'],
  fehlerbildIds: ['richtung', 'achse'],

  erzeuge(seed) {
    const r = rng(seed);
    for (;;) {
      const g = r.pick(['x2', 'wurzel'] as const);
      const d = r.pick([-2, -1, 1, 2]);
      const e = r.pick([-2, -1, 1, 2]);
      if (Math.abs(d) === Math.abs(e)) continue;
      const ein = (dd: number) => {
        const innen = `x ${dd > 0 ? '-' : '+'} ${Math.abs(dd)}`;
        return g === 'x2' ? `(${innen})^2` : `\\sqrt{${innen}}`;
      };
      const term = (dd: number, ee: number) => `${ein(dd)} ${ee > 0 ? '+' : '-'} ${Math.abs(ee)}`;
      const liste = mische(r, [
        ['richtig', term(d, e)],
        ['richtung', term(-d, e)],
        ['achse', term(e, d)],
      ] as const);
      if (new Set(liste.map(([, t]) => t)).size !== 3) continue;
      const idx = (k: string) => auswahl(liste.findIndex(([q]) => q === k));
      const f = GRUND[g].f;
      return {
        platzhalter: { d, e },
        bild: graphBild(
          [(x) => f(x - d) + e, f],
          `Ein Graph und gestrichelt die ${GRUND[g].name}. Der durchgezogene Graph hat seinen ${g === 'x2' ? 'Scheitelpunkt' : 'Anfangspunkt'} bei (${d}|${e}).`.replace(
            /-/g,
            '−',
          ),
        ),
        optionen: liste.map(([, t]) => ({ text: de(`$y = ${t}$`) })),
        loesung: idx('richtig'),
        loesungsweg: [
          de(
            `Der Punkt $(0|0)$ von $y = ${GRUND[g].tex}$ ist nach $(${d}|${e})$ gewandert: ${Math.abs(d)} nach ${d > 0 ? 'rechts' : 'links'}, ${Math.abs(e)} nach ${e > 0 ? 'oben' : 'unten'}.`,
          ),
          de(
            `Nach rechts um d heißt $x - d$ im Inneren, nach oben um e heißt $+ e$ außen: $y = ${term(d, e)}$.`,
          ),
        ],
        fehlerbilder: [
          { id: 'richtung', antwort: idx('richtung') },
          { id: 'achse', antwort: idx('achse') },
        ],
      };
    }
  },
};

/** E: Reihenfolge der Abbildungen bei y = a · f(x − d) + e (M.SF.FS.TRANSFORMATION.BEGRUENDEN) */
export const fsReihenfolgeAussage = aussagenGenerator(
  'fs.reihenfolge-aussage',
  ['reihenfolge', 'richtung'],
  ['a', 'd', 'e'],
  (r) => {
    const a = r.pick([2, 3]);
    const d = r.pick([1, 2, 3]);
    const e = r.pick([1, 2, 4]);
    return {
      situation: `Wie entsteht der Graph von $y = ${a} \\cdot f(x - ${d}) + ${e}$ aus dem Graphen von f?`,
      werte: { a, d, e },
      richtig: `Um ${d} nach rechts verschieben, dann in y-Richtung mit ${a} strecken, dann um ${e} nach oben verschieben.`,
      falsch: [
        [
          'reihenfolge',
          `Um ${e} nach oben verschieben, dann in y-Richtung mit ${a} strecken, dann um ${d} nach rechts verschieben.`,
        ],
        [
          'richtung',
          `Um ${d} nach links verschieben, dann in y-Richtung mit ${a} strecken, dann um ${e} nach oben verschieben.`,
        ],
      ],
      weg: [
        `Von innen nach außen: erst $x - ${d}$, dann mal ${a}, dann $+ ${e}$.`,
        `Würde man zuerst um ${e} nach oben schieben, würde die Streckung auch diese Verschiebung mit ${a} malnehmen.`,
      ],
    };
  },
);

// ---------------------------------------------------------------------------
// Verknüpfen und Verketten (M.SF.FS.VERKNUEPFEN, nur Gymnasium)

interface Kette {
  readonly innen: string;
  readonly aussen: string;
  readonly ganz: string;
}

function kette(r: Rng): Kette {
  const m = r.pick([2, 3, 4, 5]);
  const b = r.pick([1, 2, 3, 5]);
  const n = r.pick([2, 3, 4]);
  const innen = r.pick([`${m}x - ${b}`, `${m}x + ${b}`, `x^2 + ${b}`]);
  const art = r.int(0, 3);
  switch (art) {
    case 0:
      return { innen, aussen: `u^${n}`, ganz: `(${innen})^${n}` };
    case 1:
      return { innen, aussen: '\\sqrt{u}', ganz: `\\sqrt{${innen}}` };
    case 2:
      return { innen, aussen: '\\sin u', ganz: `\\sin(${innen})` };
    default:
      return { innen, aussen: 'e^u', ganz: `e^{${innen}}` };
  }
}

/** „Welches ist die innere, welches die äußere Funktion?“ (Niveau G) */
export const fsVerkettung: Generator<Record<string, never>> = {
  id: 'fs.verkettung',
  version: 1,
  platzhalter: ['term'],
  fehlerbildIds: ['innen-aussen', 'produkt'],

  erzeuge(seed) {
    const r = rng(seed);
    const k = kette(r);
    const liste = mische(r, [
      ['richtig', `innen $${k.innen}$, außen $${k.aussen}$`],
      [
        'innen-aussen',
        `innen $${k.aussen.replace(/u/g, 'x')}$, außen $${k.innen.replace(/x/g, 'u')}$`,
      ],
      [
        'produkt',
        `keine Verkettung, sondern ein Produkt aus $${k.innen}$ und $${k.aussen.replace(/u/g, 'x')}$`,
      ],
    ] as const);
    const idx = (k2: string) => auswahl(liste.findIndex(([q]) => q === k2));
    return {
      platzhalter: { term: de(`$h(x) = ${k.ganz}$`) },
      optionen: liste.map(([, t]) => ({ text: de(t) })),
      loesung: idx('richtig'),
      loesungsweg: [
        de(
          `Was rechnet man zuerst, wenn man eine Zahl einsetzt? $u = ${k.innen}$: die innere Funktion.`,
        ),
        de(`Damit macht man danach $${k.aussen}$: die äußere Funktion.`),
      ],
      fehlerbilder: [
        { id: 'innen-aussen', antwort: idx('innen-aussen') },
        { id: 'produkt', antwort: idx('produkt') },
      ],
    };
  },
};

/** „Berechne f(g(a)).“ (Niveau M) */
export const fsVerkettungWert: Generator<Record<string, never>> = {
  id: 'fs.verkettung-wert',
  version: 1,
  platzhalter: ['funktionen', 'm', 'b', 'k', 'a'],
  fehlerbildIds: ['innen-aussen', 'produkt'],

  erzeuge(seed) {
    const r = rng(seed);
    for (;;) {
      // f(x) = x² + k, g(x) = m·x + b
      const m = r.pick([2, 3, -2]);
      const b = r.int(-3, 3);
      const k = r.int(-4, 4);
      const a = r.int(-2, 3);
      const f = (x: number) => x * x + k;
      const g = (x: number) => m * x + b;
      const richtigWert = f(g(a));
      const falsch1 = g(f(a));
      const falsch2 = f(a) * g(a);
      if (new Set([richtigWert, falsch1, falsch2]).size !== 3) continue;
      const richtig = zahl(richtigWert);
      const kTex = k === 0 ? '' : ` ${k > 0 ? '+' : '-'} ${Math.abs(k)}`;
      const bTex = b === 0 ? '' : ` ${b > 0 ? '+' : '-'} ${Math.abs(b)}`;
      return {
        platzhalter: {
          funktionen: de(`$f(x) = x^2${kTex}$ und $g(x) = ${m}x${bTex}$`),
          m,
          b,
          k,
          a,
        },
        vorzeichen: true,
        loesung: richtig,
        loesungsweg: [
          de(`Innen zuerst: $g(${a}) = ${m} \\cdot ${a < 0 ? `(${a})` : a}${bTex} = ${g(a)}$.`),
          de(
            `Dann außen: $f(${g(a)}) = ${g(a) < 0 ? `(${g(a)})` : g(a)}^2${kTex} = ${richtigWert}$.`,
          ),
        ],
        fehlerbilder: fehlerbilderAus(richtig, [
          ['innen-aussen', zahl(falsch1)],
          ['produkt', zahl(falsch2)],
        ]),
      };
    }
  },
};

/** E: Definitionslücke eines Quotienten (M.SF.FS.VERKNUEPFEN.BEGRUENDEN) */
export const fsLueckeAussage = aussagenGenerator(
  'fs.luecke-aussage',
  ['luecke-zaehler', 'luecke-keine'],
  ['z', 'n'],
  (r) => {
    for (;;) {
      const z = r.int(-5, 5);
      const n = r.int(-5, 5);
      if (z === n || n === 0) continue;
      const lin = (c: number) => (c === 0 ? 'x' : `x ${c > 0 ? '-' : '+'} ${Math.abs(c)}`);
      return {
        situation: `$f(x) = ${lin(z)}$ und $g(x) = ${lin(n)}$. Lea sagt: „$h(x) = \\frac{f(x)}{g(x)}$ ist für jede Zahl x definiert, weil f und g es sind.“ Stimmt das?`,
        werte: { z, n },
        richtig: `Nein. Bei $x = ${n}$ ist $g(x) = 0$, und durch 0 darf man nicht teilen. h hat dort eine Definitionslücke.`,
        falsch: [
          ['luecke-zaehler', `Nein. Bei $x = ${z}$ ist der Zähler 0, dort ist h nicht definiert.`],
          [
            'luecke-keine',
            'Ja. Wenn man f und g überall ausrechnen kann, dann auch ihren Quotienten.',
          ],
        ],
        weg: [
          `Ein Quotient ist nur definiert, wo der Nenner nicht 0 ist.`,
          `$g(x) = 0$ bei $x = ${n}$. Ein Zähler 0 ist erlaubt: $\\frac{0}{${z - n}} = 0$.`,
        ],
      };
    }
  },
);

// ---------------------------------------------------------------------------
// Zahlenfolgen (M.SF.FS.FOLGEN, nur Gymnasium)

interface Folge {
  readonly geo: boolean;
  readonly a1: number;
  readonly d: number;
  readonly n: number;
}

function folge(seed: number): Folge {
  const r = rng(seed);
  const geo = r.int(0, 1) === 1;
  return geo
    ? { geo, a1: r.pick([1, 2, 3, 5]), d: r.pick([2, 3, -2]), n: r.int(4, 7) }
    : { geo, a1: r.int(-10, 20), d: r.pick([-5, -3, -2, 2, 3, 4, 5, 7]), n: r.int(5, 20) };
}

const glied = (f: Folge, n: number) => (f.geo ? f.a1 * f.d ** (n - 1) : f.a1 + (n - 1) * f.d);

/** „Berechne das n-te Glied.“ (Niveau G) */
export const fsFolgeGlied: Generator<Record<string, never>> = {
  id: 'fs.folge-glied',
  version: 1,
  platzhalter: ['satz', 'a1', 'd', 'n'],
  fehlerbildIds: ['index'],

  erzeuge(seed) {
    const f = folge(seed);
    const wert = glied(f, f.n);
    const richtig = zahl(wert);
    const anfang = [1, 2, 3]
      .map((k) => glied(f, k))
      .map((x) => (x < 0 ? `−${-x}` : String(x)))
      .join('; ');
    return {
      platzhalter: {
        satz: de(
          f.geo
            ? `Eine Folge beginnt mit ${anfang} … Jedes Glied ist das vorige mal ${f.d < 0 ? `(−${-f.d})` : f.d}. Berechne $a_{${f.n}}$.`
            : `Eine Folge beginnt mit ${anfang} … Jedes Glied ist um ${Math.abs(f.d)} ${f.d > 0 ? 'größer' : 'kleiner'} als das vorige. Berechne $a_{${f.n}}$.`,
        ),
        a1: f.a1,
        d: f.d,
        n: f.n,
      },
      vorzeichen: true,
      loesung: richtig,
      loesungsweg: [
        de(
          f.geo
            ? `Explizit: $a_n = a_1 \\cdot q^{n-1} = ${f.a1} \\cdot ${f.d < 0 ? `(${f.d})` : f.d}^{${f.n - 1}}$.`
            : `Explizit: $a_n = a_1 + (n - 1) \\cdot d = ${f.a1} + ${f.n - 1} \\cdot ${f.d < 0 ? `(${f.d})` : f.d}$.`,
        ),
        de(`$a_{${f.n}} = ${wert}$. Bis zum n-ten Glied sind es $n - 1$ Schritte.`),
      ],
      fehlerbilder: fehlerbilderAus(richtig, [['index', zahl(glied(f, f.n + 1))]]),
    };
  },
};

const FOLGEN = [
  {
    tex: '\\frac{1}{n}',
    wahr: 'fallend, beschränkt und konvergent gegen 0',
    monoton: 'steigend, denn n wird immer größer',
    konvergent: 'beschränkt, aber nicht konvergent',
  },
  {
    tex: '(-1)^n',
    wahr: 'beschränkt, aber nicht konvergent: Sie springt zwischen −1 und 1',
    monoton: 'fallend, denn die Glieder werden abwechselnd kleiner',
    konvergent: 'konvergent, denn sie ist beschränkt',
  },
  {
    tex: '2^n',
    wahr: 'steigend und nicht beschränkt',
    monoton: 'fallend, weil der Abstand der Glieder wächst',
    konvergent: 'konvergent gegen 2',
  },
  {
    tex: '\\frac{n}{n+1}',
    wahr: 'steigend, beschränkt und konvergent gegen 1',
    monoton: 'fallend, denn der Nenner wird größer',
    konvergent: 'nicht konvergent, denn sie steigt immer weiter',
  },
] as const;

/** „Welche Aussage über die Folge stimmt?“ (Niveau M) */
export const fsFolgeEigenschaft = aussagenGenerator(
  'fs.folge-eigenschaft',
  ['monoton', 'beschraenkt-konvergent'],
  ['art'],
  (r) => {
    const art = r.int(0, FOLGEN.length - 1);
    const f = FOLGEN[art] ?? FOLGEN[0];
    return {
      situation: `Welche Aussage über die Folge $a_n = ${f.tex}$ stimmt?`,
      werte: { art },
      richtig: `Die Folge ist ${f.wahr}.`,
      falsch: [
        ['monoton', `Die Folge ist ${f.monoton}.`],
        ['beschraenkt-konvergent', `Die Folge ist ${f.konvergent}.`],
      ],
      weg: [
        'Schreibe die ersten Glieder auf: $a_1, a_2, a_3, a_4$.',
        'Steigen oder fallen sie? Bleiben sie zwischen zwei Zahlen? Nähern sie sich einer Zahl?',
      ],
    };
  },
);

/** E: „beschränkt, also konvergent?“ (M.SF.FS.FOLGEN.BEGRUENDEN) */
export const fsKonvergentAussage = aussagenGenerator(
  'fs.konvergent-aussage',
  ['beschraenkt-konvergent', 'monoton'],
  ['grenze'],
  (r) => {
    const grenze = r.pick([1, 2, 3, 5]);
    return {
      situation: `Tom sagt: „Jede Folge, deren Glieder alle zwischen $-${grenze}$ und ${grenze} liegen, ist konvergent.“ Stimmt das?`,
      werte: { grenze },
      richtig: `Nein. $a_n = ${grenze === 1 ? '' : `${grenze} \\cdot `}(-1)^n$ bleibt zwischen $-${grenze}$ und ${grenze}, springt aber immer hin und her und nähert sich keiner Zahl.`,
      falsch: [
        [
          'beschraenkt-konvergent',
          'Ja. Eine beschränkte Folge kann nicht ins Unendliche laufen, also hat sie einen Grenzwert.',
        ],
        [
          'monoton',
          'Ja. Eine beschränkte Folge steigt oder fällt immer und nähert sich dabei einer Zahl.',
        ],
      ],
      weg: [
        'Ein Gegenbeispiel genügt.',
        `$(-1)^n$ ist beschränkt, aber nicht monoton und nicht konvergent. Erst beschränkt und monoton zusammen sichern einen Grenzwert.`,
      ],
    };
  },
);
