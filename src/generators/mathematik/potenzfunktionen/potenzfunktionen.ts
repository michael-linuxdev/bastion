// Potenzfunktionen – Klasse 9 (LEHRPLAN §8e, Feld PF): Graphen von y = xⁿ (n ganzzahlig) zuordnen
// und Eigenschaften angeben, Wurzelfunktionen, Verschieben und Strecken von Graphen.
// Graphen mit `koordinatensystemBereich` und `kurve` (Bedarfsliste B5).
import type { Bild, Generator, Loesung, Sprachobjekt } from '../../../core/learning/generator';
import { fehlerbilderAus } from '../../../core/learning/loesung';
import { texZahl } from '../../../core/learning/text';
import { rng, type Rng } from '../../../core/rng/rng';
import { auswahl, de, mische, zahl } from '../../hilfen';
import { bild, koordinatensystemBereich, kurve } from '../../svg';

const potenz = (n: number) => (n === 1 ? 'x' : `x^{${n}}`);
const pm = (r: Rng, max: number) => r.int(1, max) * (r.int(0, 1) === 0 ? -1 : 1);

/** Graph von y = xⁿ im Ausschnitt −3 … 3 */
export function potenzBild(n: number): Bild {
  const ks = koordinatensystemBereich(-3, 3, -4, 4, 34);
  return bild(
    ks.breite,
    ks.hoehe,
    [...ks.teile, kurve(ks, (x) => x ** n, -3, 3, { ymin: -4, ymax: 4 }, 600)],
    de(
      `Ein Koordinatensystem mit dem Graphen einer Potenzfunktion. Er ist ${n % 2 === 0 ? 'achsensymmetrisch zur y-Achse' : 'punktsymmetrisch zum Ursprung'}${n < 0 ? ' und hat bei x = 0 eine Polstelle' : ' und verläuft durch den Ursprung'}.`,
    ),
  );
}

// ---------------------------------------------------------------------------
// Graph und Term zuordnen (M.SF.PF.POTENZFUNKTION.ZUORDNEN)

const VIER = [2, 3, -1, -2] as const;

/** Fehlerbild für einen falschen Term: andere Symmetrie, anderes Vorzeichen der Hochzahl, beides */
function abweichung(soll: number, ist: number): string {
  const paritaet = Math.abs(soll % 2) !== Math.abs(ist % 2);
  const vorzeichen = Math.sign(soll) !== Math.sign(ist);
  return paritaet && vorzeichen ? 'beides' : vorzeichen ? 'vorzeichen-hochzahl' : 'symmetrie';
}

/** „Welcher Term gehört zum Graphen?“ – y = x², x³, x⁻¹, x⁻² */
export const pfZuordnen: Generator<Record<string, never>> = {
  id: 'pf.zuordnen',
  version: 1,
  platzhalter: [],
  fehlerbildIds: ['symmetrie', 'vorzeichen-hochzahl', 'beides'],

  erzeuge(seed) {
    const r = rng(seed);
    const n = r.pick(VIER);
    const liste = mische(r, [...VIER]);
    const richtig = auswahl(liste.indexOf(n));
    return {
      platzhalter: {},
      bild: potenzBild(n),
      optionen: liste.map((k) => ({ text: de(`$y = ${potenz(k)}$`) })),
      loesung: richtig,
      loesungsweg: [
        de(
          n % 2 === 0
            ? 'Der Graph ist achsensymmetrisch zur y-Achse: gerade Hochzahl.'
            : 'Der Graph ist punktsymmetrisch zum Ursprung: ungerade Hochzahl.',
        ),
        de(
          n < 0
            ? 'Er hat bei $x = 0$ eine Polstelle und nähert sich den Achsen: negative Hochzahl.'
            : 'Er geht durch den Ursprung: positive Hochzahl.',
        ),
        de(`Also $y = ${potenz(n)}$.`),
      ],
      fehlerbilder: liste
        .filter((k) => k !== n)
        .map((k) => ({ id: abweichung(n, k), antwort: auswahl(liste.indexOf(k)) })),
    };
  },
};

// ---------------------------------------------------------------------------
// Eigenschaften (M.SF.PF.POTENZFUNKTION.EIGENSCHAFT)

interface Satz {
  readonly id: string;
  readonly text: string;
  readonly wahr: boolean;
}

/** Wahre und falsche Aussagen über y = xⁿ, je Art (Symmetrie, Definitions-, Wertebereich, Polstelle) */
function saetze(n: number): Satz[] {
  const gerade = n % 2 === 0;
  const negativ = n < 0;
  const wb = gerade
    ? negativ
      ? 'y > 0'
      : 'y \\geq 0'
    : negativ
      ? 'y \\neq 0'
      : '\\text{alle reellen Zahlen}';
  const wbFalsch = gerade ? '\\text{alle reellen Zahlen}' : 'y \\geq 0';
  return [
    {
      id: 'symmetrie',
      wahr: true,
      text: gerade
        ? 'Der Graph ist achsensymmetrisch zur y-Achse.'
        : 'Der Graph ist punktsymmetrisch zum Ursprung.',
    },
    {
      id: 'symmetrie',
      wahr: false,
      text: gerade
        ? 'Der Graph ist punktsymmetrisch zum Ursprung.'
        : 'Der Graph ist achsensymmetrisch zur y-Achse.',
    },
    {
      id: 'definitionsbereich',
      wahr: true,
      text: negativ
        ? 'Man darf jede Zahl außer 0 einsetzen.'
        : 'Man darf jede reelle Zahl einsetzen.',
    },
    {
      id: 'definitionsbereich',
      wahr: false,
      text: negativ
        ? 'Man darf jede reelle Zahl einsetzen.'
        : 'Man darf jede Zahl außer 0 einsetzen.',
    },
    { id: 'wertebereich', wahr: true, text: `Der Wertebereich ist $${wb}$.` },
    { id: 'wertebereich', wahr: false, text: `Der Wertebereich ist $${wbFalsch}$.` },
    {
      id: 'polstelle',
      wahr: true,
      text: negativ
        ? 'Bei $x = 0$ hat der Graph eine Polstelle.'
        : 'Der Graph geht durch den Punkt $(0|0)$.',
    },
    {
      id: 'polstelle',
      wahr: false,
      text: negativ
        ? 'Der Graph geht durch den Punkt $(0|0)$.'
        : 'Bei $x = 0$ hat der Graph eine Polstelle.',
    },
  ];
}

/** „Welche Aussage über y = x⁻³ stimmt?“ – eine wahre, drei falsche */
export const pfEigenschaft: Generator<Record<string, never>> = {
  id: 'pf.eigenschaft',
  version: 1,
  platzhalter: ['funktion'],
  fehlerbildIds: ['symmetrie', 'definitionsbereich', 'wertebereich', 'polstelle'],

  erzeuge(seed) {
    const r = rng(seed);
    const n = r.pick([-4, -3, -2, -1, 2, 3, 4, 5]);
    const alle = saetze(n);
    const wahr = r.pick(alle.filter((s) => s.wahr));
    const falsch = alle.filter((s) => !s.wahr && s.id !== wahr.id);
    const liste = mische(r, [wahr, ...falsch]);
    const index = (s: Satz) => auswahl(liste.indexOf(s));
    return {
      platzhalter: { funktion: de(`y = ${potenz(n)}`) },
      optionen: liste.map((s) => ({ text: de(s.text) satisfies Sprachobjekt })),
      loesung: index(wahr),
      loesungsweg: [
        de(
          `Die Hochzahl ${texZahl(n)} ist ${n % 2 === 0 ? 'gerade' : 'ungerade'} und ${n < 0 ? 'negativ' : 'positiv'}.`,
        ),
        de(
          n < 0
            ? `$${potenz(n)} = \\frac{1}{${potenz(-n)}}$: Für $x = 0$ ist das nicht erklärt, dort liegt eine Polstelle.`
            : 'Jede Zahl lässt sich einsetzen, der Graph geht durch $(0|0)$ und $(1|1)$.',
        ),
        de(
          n % 2 === 0
            ? '$(-x)^n = x^n$: achsensymmetrisch zur y-Achse.'
            : '$(-x)^n = -x^n$: punktsymmetrisch zum Ursprung.',
        ),
      ],
      fehlerbilder: falsch.map((s) => ({ id: s.id, antwort: index(s) })),
    };
  },
};

// ---------------------------------------------------------------------------
// Zuordnen und begründen (M.SF.PF.POTENZFUNKTION.BEGRUENDEN, Niveau E)

/** Graph zeigen; vier Antworten aus Term und Begründung */
export const pfBegruenden: Generator<Record<string, never>> = {
  id: 'pf.begruenden',
  version: 1,
  platzhalter: [],
  fehlerbildIds: ['begruendung-falsch', 'symmetrie', 'vorzeichen-hochzahl'],

  erzeuge(seed) {
    const r = rng(seed);
    const n = r.pick([2, 3, 4, -1, -2, -3]);
    const gerade = n % 2 === 0;
    const sym = gerade ? 'achsensymmetrisch zur y-Achse' : 'punktsymmetrisch zum Ursprung';
    const symFalsch = gerade ? 'punktsymmetrisch zum Ursprung' : 'achsensymmetrisch zur y-Achse';
    const mitPol = n < 0 ? 'eine Polstelle bei $x = 0$ hat' : 'durch den Ursprung geht';
    const andereParitaet = n > 0 ? n + 1 : n - 1;
    const kandidaten: [string, string][] = [
      ['richtig', `$y = ${potenz(n)}$, weil der Graph ${sym} ist und ${mitPol}.`],
      ['begruendung-falsch', `$y = ${potenz(n)}$, weil der Graph ${symFalsch} ist und ${mitPol}.`],
      ['symmetrie', `$y = ${potenz(andereParitaet)}$, weil der Graph ${mitPol}.`],
      ['vorzeichen-hochzahl', `$y = ${potenz(-n)}$, weil der Graph ${sym} ist.`],
    ];
    const liste = mische(r, kandidaten);
    const index = (id: string) => auswahl(liste.findIndex(([x]) => x === id));
    return {
      platzhalter: {},
      bild: potenzBild(n),
      optionen: liste.map(([, t]) => ({ text: de(t) satisfies Sprachobjekt })),
      loesung: index('richtig'),
      loesungsweg: [
        de(`Symmetrie: ${sym}, also ${gerade ? 'gerade' : 'ungerade'} Hochzahl.`),
        de(
          n < 0 ? 'Polstelle bei 0: negative Hochzahl.' : 'Durch den Ursprung: positive Hochzahl.',
        ),
        de('Term und Begründung müssen beide stimmen.'),
      ],
      fehlerbilder: liste
        .filter(([id]) => id !== 'richtig')
        .map(([id]) => ({ id, antwort: index(id) })),
    };
  },
};

// ---------------------------------------------------------------------------
// Wurzelfunktion: Werte (M.SF.PF.WURZELFUNKTION.WERT)

export interface WurzelWertParameter {
  /** true: auch „Für welches x ist f(x) = 5?“ */
  readonly umkehren: boolean;
}

/** „Berechne f(49) für f(x) = √x“ oder „Für welches x ist f(x) = 6?“ */
export const pfWurzelWert: Generator<WurzelWertParameter> = {
  id: 'pf.wurzel-wert',
  version: 1,
  platzhalter: ['funktion', 'frage'],
  fehlerbildIds: ['halbiert', 'nicht-quadriert', 'kubik-quadrat'],

  erzeuge(seed, p) {
    const r = rng(seed);
    const n = r.pick([2, 2, 3]);
    const w = r.int(2, n === 2 ? 12 : 6);
    const a = w ** n;
    const funktion = n === 2 ? 'f(x) = \\sqrt{x}' : 'f(x) = x^{\\frac{1}{3}}';
    const umkehren = p.umkehren && r.int(0, 1) === 0;
    if (umkehren) {
      const richtig = zahl(a);
      return {
        platzhalter: { funktion: de(funktion), frage: de(`Für welches x ist $f(x) = ${w}$?`) },
        loesung: richtig,
        loesungsweg: [
          de(`Gesucht ist x mit $${n === 2 ? '\\sqrt{x}' : 'x^{\\frac{1}{3}}'} = ${w}$.`),
          de(`${n === 2 ? 'Quadrieren' : 'Hoch 3 nehmen'}: $x = ${w}^{${n}} = ${a}$.`),
        ],
        fehlerbilder: fehlerbilderAus(richtig, [
          ['nicht-quadriert', zahl(w * n)],
          ['kubik-quadrat', n === 3 ? zahl(w * w) : undefined],
        ]),
      };
    }
    const richtig = zahl(w);
    return {
      platzhalter: { funktion: de(funktion), frage: de(`Berechne $f(${a})$.`) },
      loesung: richtig,
      loesungsweg: [
        de(`$f(${a}) = ${n === 2 ? `\\sqrt{${a}}` : `${a}^{\\frac{1}{3}} = \\sqrt[3]{${a}}`}$.`),
        de(`$${w}^{${n}} = ${a}$, also $f(${a}) = ${w}$.`),
      ],
      fehlerbilder: fehlerbilderAus(richtig, [['halbiert', a % n === 0 ? zahl(a / n) : undefined]]),
    };
  },
};

// ---------------------------------------------------------------------------
// Wurzelfunktion: Eigenschaften (M.SF.PF.WURZELFUNKTION.EIGENSCHAFT)

/** „Welche Aussage über f(x) = √x stimmt?“ */
export const pfWurzelEigenschaft: Generator<Record<string, never>> = {
  id: 'pf.wurzel-eigenschaft',
  version: 1,
  platzhalter: ['funktion'],
  fehlerbildIds: ['definitionsbereich', 'wertebereich', 'monotonie', 'symmetrie'],

  erzeuge(seed) {
    const r = rng(seed);
    const n = r.pick([2, 3, 4]);
    const funktion = n === 2 ? 'f(x) = \\sqrt{x}' : `f(x) = x^{\\frac{1}{${n}}}`;
    const wahr: Satz[] = [
      { id: 'w1', wahr: true, text: 'Man darf nur Zahlen $x \\geq 0$ einsetzen.' },
      { id: 'w2', wahr: true, text: 'Alle Funktionswerte sind mindestens 0.' },
      { id: 'w3', wahr: true, text: 'Der Graph steigt überall.' },
      { id: 'w4', wahr: true, text: 'Der Graph geht durch $(0|0)$ und $(1|1)$.' },
    ];
    const falsch: Satz[] = [
      { id: 'definitionsbereich', wahr: false, text: 'Man darf jede reelle Zahl einsetzen.' },
      { id: 'wertebereich', wahr: false, text: 'Der Wertebereich sind alle reellen Zahlen.' },
      { id: 'monotonie', wahr: false, text: 'Der Graph fällt für große x wieder.' },
      { id: 'symmetrie', wahr: false, text: 'Der Graph ist achsensymmetrisch zur y-Achse.' },
    ];
    const w = r.pick(wahr);
    const f3 = mische(r, falsch).slice(0, 3);
    const liste = mische(r, [w, ...f3]);
    const index = (s: Satz) => auswahl(liste.indexOf(s));
    return {
      platzhalter: { funktion: de(funktion) },
      optionen: liste.map((s) => ({ text: de(s.text) })),
      loesung: index(w),
      loesungsweg: [
        de(
          `$${funktion.slice(7)}$ ist die ${n === 2 ? 'Quadratwurzel' : `${n}. Wurzel`}: nur für $x \\geq 0$ erklärt, Ergebnis nie negativ.`,
        ),
        de('Je größer x, desto größer die Wurzel: Der Graph steigt, wird aber immer flacher.'),
      ],
      fehlerbilder: f3.map((s) => ({ id: s.id, antwort: index(s) })),
    };
  },
};

// ---------------------------------------------------------------------------
// Definitionsbereich begründen (M.SF.PF.WURZELFUNKTION.DEFINITION, Niveau E)

/** „Welchen Definitionsbereich hat f(x) = √(x − 3), und warum?“ */
export const pfDefinition: Generator<Record<string, never>> = {
  id: 'pf.definition',
  version: 1,
  platzhalter: ['funktion'],
  fehlerbildIds: ['vorzeichen', 'alle', 'wertebereich'],

  erzeuge(seed) {
    const r = rng(seed);
    const a = pm(r, 6);
    const innen = `x ${a > 0 ? '-' : '+'} ${Math.abs(a)}`;
    const kandidaten: [string, string][] = [
      [
        'richtig',
        `$x \\geq ${texZahl(a)}$, weil unter der Wurzel keine negative Zahl stehen darf: $${innen} \\geq 0$.`,
      ],
      ['vorzeichen', `$x \\geq ${texZahl(-a)}$, weil die Zahl in der Wurzel abgelesen wird.`],
      ['alle', 'Alle reellen Zahlen, weil man jede Zahl einsetzen kann.'],
      ['wertebereich', '$y \\geq 0$, weil eine Wurzel nie negativ ist.'],
    ];
    const liste = mische(r, kandidaten);
    const index = (id: string) => auswahl(liste.findIndex(([x]) => x === id));
    return {
      platzhalter: { funktion: de(`f(x) = \\sqrt{${innen}}`) },
      optionen: liste.map(([, t]) => ({ text: de(t) satisfies Sprachobjekt })),
      loesung: index('richtig'),
      loesungsweg: [
        de(`Unter der Wurzel muss mindestens 0 stehen: $${innen} \\geq 0$.`),
        de(
          `Umformen: $x \\geq ${texZahl(a)}$. Der Definitionsbereich spricht über x, nicht über y.`,
        ),
      ],
      fehlerbilder: liste
        .filter(([id]) => id !== 'richtig')
        .map(([id]) => ({ id, antwort: index(id) })),
    };
  },
};

// ---------------------------------------------------------------------------
// Verschieben und Strecken (M.SF.PF.PARAMETER.BESCHREIBEN)

export interface VerschiebungParameter {
  /** auch Streckung c·f(x) und Kombinationen */
  readonly strecken: boolean;
}

interface Beschreibung {
  readonly id: string;
  readonly text: string;
}

/** „Wie entsteht der Graph von g(x) = (x − 2)² + 1 aus dem von f(x) = x²?“ */
export const pfVerschiebung: Generator<VerschiebungParameter> = {
  id: 'pf.verschiebung',
  version: 1,
  platzhalter: ['f', 'g'],
  fehlerbildIds: ['richtung-x', 'achse-vertauscht', 'streckung-verschiebung'],

  erzeuge(seed, p) {
    const r = rng(seed);
    const n = p.strecken ? r.pick([2, 3]) : 2;
    const art = p.strecken ? r.int(0, 2) : r.int(0, 1);
    const k = r.int(1, 5);
    const f = potenz(n);
    let g: string;
    let richtig: string;
    let falsch: Beschreibung[];
    if (art === 0) {
      // waagerecht: f(x − d)
      const d = pm(r, 4);
      const klammer = `(x ${d > 0 ? '-' : '+'} ${Math.abs(d)})`;
      g = `${klammer}^{${n}}`;
      const dir = d > 0 ? 'rechts' : 'links';
      const gegen = d > 0 ? 'links' : 'rechts';
      richtig = `um ${Math.abs(d)} nach ${dir} verschoben`;
      falsch = [
        { id: 'richtung-x', text: `um ${Math.abs(d)} nach ${gegen} verschoben` },
        {
          id: 'achse-vertauscht',
          text: `um ${Math.abs(d)} nach ${d > 0 ? 'unten' : 'oben'} verschoben`,
        },
        { id: 'streckung-verschiebung', text: `mit dem Faktor ${Math.abs(d) + 1} gestreckt` },
      ];
    } else if (art === 1) {
      // senkrecht: f(x) + e
      const e = pm(r, 5);
      g = `${f} ${e > 0 ? '+' : '-'} ${Math.abs(e)}`;
      richtig = `um ${Math.abs(e)} nach ${e > 0 ? 'oben' : 'unten'} verschoben`;
      falsch = [
        { id: 'richtung-x', text: `um ${Math.abs(e)} nach ${e > 0 ? 'unten' : 'oben'} verschoben` },
        {
          id: 'achse-vertauscht',
          text: `um ${Math.abs(e)} nach ${e > 0 ? 'rechts' : 'links'} verschoben`,
        },
        { id: 'streckung-verschiebung', text: `mit dem Faktor ${Math.abs(e) + 1} gestreckt` },
      ];
    } else {
      // Streckung c·f(x)
      const c = k + 1;
      g = `${c}${f}`;
      richtig = `in y-Richtung mit dem Faktor ${c} gestreckt`;
      falsch = [
        { id: 'richtung-x', text: `in y-Richtung mit dem Faktor $\\frac{1}{${c}}$ gestaucht` },
        { id: 'achse-vertauscht', text: `um ${c} nach rechts verschoben` },
        { id: 'streckung-verschiebung', text: `um ${c} nach oben verschoben` },
      ];
    }
    const liste = mische(r, [{ id: 'richtig', text: richtig }, ...falsch]);
    const index = (id: string) => auswahl(liste.findIndex((b) => b.id === id));
    return {
      platzhalter: { f: de(`f(x) = ${f}`), g: de(`g(x) = ${g}`) },
      optionen: liste.map((b) => ({ text: de(`Der Graph von f wird ${b.text}.`) })),
      loesung: index('richtig'),
      loesungsweg: [
        de(
          art === 0
            ? '$f(x - d)$: Der Graph wird um d nach rechts verschoben, bei $f(x + d)$ nach links. Das Vorzeichen in der Klammer ist umgekehrt.'
            : art === 1
              ? '$f(x) + e$: Jeder Funktionswert wird um e größer, der Graph rückt nach oben (bei negativem e nach unten).'
              : '$c \\cdot f(x)$: Jeder Funktionswert wird mit c malgenommen, der Graph wird in y-Richtung gestreckt.',
        ),
        de(`Also: ${richtig}.`),
      ],
      fehlerbilder: falsch.map((b) => ({ id: b.id, antwort: index(b.id) })),
    };
  },
};

// ---------------------------------------------------------------------------
// Reihenfolge von Strecken und Verschieben (M.SF.PF.PARAMETER.REIHENFOLGE, Niveau E)

/** „Stimmt das? g(x) = 2x² + 3 entsteht, wenn man erst um 3 nach oben verschiebt und dann streckt.“ */
export const pfReihenfolge: Generator<Record<string, never>> = {
  id: 'pf.reihenfolge',
  version: 1,
  platzhalter: ['aussage'],
  fehlerbildIds: ['reihenfolge-egal', 'nur-streckung', 'beispiel'],

  erzeuge(seed) {
    const r = rng(seed);
    const c = r.int(2, 4);
    const e = r.int(1, 5);
    const erstStrecken = r.int(0, 1) === 0;
    // erstStrecken: Aussage stimmt (c·x² + e); sonst ergibt sich c·(x² + e) = c·x² + c·e
    const aussage = erstStrecken
      ? `$g(x) = ${c}x^2 + ${e}$ entsteht aus $f(x) = x^2$, wenn man erst mit dem Faktor ${c} streckt und dann um ${e} nach oben verschiebt.`
      : `$g(x) = ${c}x^2 + ${e}$ entsteht aus $f(x) = x^2$, wenn man erst um ${e} nach oben verschiebt und dann mit dem Faktor ${c} streckt.`;
    const kandidaten: [string, string][] = erstStrecken
      ? [
          ['richtig', `Ja. Erst strecken gibt $${c}x^2$, dann plus ${e} gibt $${c}x^2 + ${e}$.`],
          ['reihenfolge-egal', 'Ja, aber die Reihenfolge ist ohnehin egal.'],
          [
            'nur-streckung',
            `Nein. Beim Strecken wird auch die ${e} mitgestreckt, es entsteht $${c}x^2 + ${c * e}$.`,
          ],
          ['beispiel', `Nein, denn bei $x = 0$ ist $g(0) = ${c * e}$.`],
        ]
      : [
          [
            'richtig',
            `Nein. Erst verschieben gibt $x^2 + ${e}$, dann strecken gibt $${c}x^2 + ${c * e}$.`,
          ],
          ['reihenfolge-egal', 'Ja. Die Reihenfolge von Strecken und Verschieben ist egal.'],
          ['nur-streckung', `Ja. Beim Strecken bleibt die ${e} unverändert.`],
          ['beispiel', `Ja, denn bei $x = 1$ ist $g(1) = ${c + e}$.`],
        ];
    const liste = mische(r, kandidaten);
    const index = (id: string) => auswahl(liste.findIndex(([x]) => x === id));
    return {
      platzhalter: { aussage: de(aussage) },
      optionen: liste.map(([, t]) => ({ text: de(t) satisfies Sprachobjekt })),
      loesung: index('richtig'),
      loesungsweg: [
        de('Strecken nimmt den ganzen Funktionswert mal, auch eine schon addierte Zahl.'),
        de(
          `Erst strecken, dann verschieben: $${c}x^2 + ${e}$. Erst verschieben, dann strecken: $${c} \\cdot (x^2 + ${e}) = ${c}x^2 + ${c * e}$.`,
        ),
      ],
      fehlerbilder: liste
        .filter(([id]) => id !== 'richtig')
        .map(([id]) => ({ id, antwort: index(id) as Loesung })),
    };
  },
};
