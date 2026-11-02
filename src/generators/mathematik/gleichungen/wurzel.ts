// Wurzelgleichungen – Klasse 9 (LEHRPLAN §8e, M.SF.GL.WURZEL): einfache Wurzelgleichungen durch
// Quadrieren lösen, mit Probe; Scheinlösungen erkennen (Niveau E). Formeln in LaTeX für KaTeX.
import type { Generator, Loesung, Sprachobjekt } from '../../../core/learning/generator';
import { fehlerbilderAus } from '../../../core/learning/loesung';
import { texZahl } from '../../../core/learning/text';
import { rng, type Rng } from '../../../core/rng/rng';
import { auswahl, de, mische, verlange, zahl } from '../../hilfen';

export type WurzelForm = 'einfach' | 'summe' | 'linear' | 'isolieren';

/** „3x − 2“ in LaTeX */
function radikand(a: number, b: number): string {
  const x = a === 1 ? 'x' : `${a}x`;
  return b === 0 ? x : `${x} ${b < 0 ? '-' : '+'} ${Math.abs(b)}`;
}
const plus = (d: number) => (d < 0 ? ` - ${-d}` : ` + ${d}`);

interface Wurzelgleichung {
  readonly form: WurzelForm;
  /** √(a·x + b) + d = e, also √(a·x + b) = c mit c = e − d */
  readonly a: number;
  readonly b: number;
  readonly d: number;
  readonly e: number;
  readonly c: number;
  readonly x: number;
}

const tex = (g: Wurzelgleichung) =>
  `\\sqrt{${radikand(g.a, g.b)}}${g.d === 0 ? '' : plus(g.d)} = ${texZahl(g.e)}`;

function gleichung(r: Rng, form: WurzelForm, ohneLoesung = false): Wurzelgleichung {
  for (;;) {
    const a = form === 'linear' ? r.int(2, 5) : 1;
    const b = form === 'einfach' ? 0 : r.int(-20, 20);
    const d = form === 'isolieren' ? r.int(-9, 9) : 0;
    const c = ohneLoesung
      ? -r.int(1, 9)
      : r.int(form === 'einfach' ? 2 : 1, form === 'einfach' ? 15 : 9);
    if ((form !== 'einfach' && b === 0) || (form === 'isolieren' && d === 0)) continue;
    if ((c * c - b) % a !== 0) continue;
    const x = (c * c - b) / a;
    if (x === 0 && form !== 'einfach') continue;
    return { form, a, b, d, e: c + d, c, x };
  }
}

/** Typische falsche Ergebnisse (Fehlerbilder) */
function falsch(g: Wurzelgleichung): [string, number | undefined][] {
  const { a, b, c, d, e } = g;
  const geteilt = (z: number) => (z % a === 0 ? z / a : undefined);
  return [
    ['nicht-quadriert', geteilt(c - b)],
    ['falsche-richtung', b === 0 ? undefined : geteilt(c * c + b)],
    ['nicht-geteilt', a === 1 ? undefined : c * c - b],
    ['isolieren-vergessen', d === 0 ? undefined : geteilt(e * e - b)],
  ];
}

function weg(g: Wurzelgleichung): string[] {
  const { a, b, c, d, x } = g;
  return [
    ...(d === 0
      ? []
      : [`Erst die Wurzel allein stellen: $\\sqrt{${radikand(a, b)}} = ${texZahl(c)}$.`]),
    `Beide Seiten quadrieren: $${radikand(a, b)} = ${texZahl(c * c)}$.`,
    ...(b === 0 ? [] : [`$${a === 1 ? 'x' : `${a}x`} = ${texZahl(c * c - b)}$`]),
    ...(a === 1 ? [] : [`$x = ${texZahl(x)}$`]),
    `Probe: $\\sqrt{${texZahl(a * x + b)}} = ${texZahl(c)}$ – stimmt.`,
  ];
}

// ---------------------------------------------------------------------------
// Wurzelgleichungen lösen (M.SF.GL.WURZEL.LOESEN), mit Zwischenschritten

export interface WurzelLoesenParameter {
  readonly formen: readonly WurzelForm[];
}

function loesenAufgabe(seed: number, p: WurzelLoesenParameter): Wurzelgleichung {
  verlange(p.formen.length > 0, 'formen: mindestens eine');
  const r = rng(seed);
  return gleichung(r, r.pick(p.formen));
}

/** „Löse: √(x + 5) = 4“, „√(3x − 2) = 5“, „√(x + 3) + 2 = 6“ */
export const glWurzelLoesen: Generator<WurzelLoesenParameter> = {
  id: 'gl.wurzel-loesen',
  version: 1,
  platzhalter: ['gleichung', 'wurzelterm'],
  fehlerbildIds: ['nicht-quadriert', 'falsche-richtung', 'nicht-geteilt', 'isolieren-vergessen'],

  schritte: [
    { id: 'quadrat', fehlerbildIds: ['nicht-quadriert', 'isolieren-vergessen'] },
    { id: 'x', fehlerbildIds: ['falsche-richtung', 'nicht-geteilt'], platzhalter: ['quadrat'] },
  ],

  erzeuge(seed, p) {
    const g = loesenAufgabe(seed, p);
    const richtig = zahl(g.x);
    return {
      platzhalter: { gleichung: de(tex(g)), wurzelterm: de(radikand(g.a, g.b)) },
      vorzeichen: true,
      loesung: richtig,
      loesungsweg: weg(g).map(de),
      fehlerbilder: fehlerbilderAus(
        richtig,
        falsch(g).map(([id, w]) => [id, w === undefined ? undefined : zahl(w)]),
      ),
    };
  },

  schritt(seed, p, id) {
    const g = loesenAufgabe(seed, p);
    if (id === 'quadrat') {
      const loesung = zahl(g.c * g.c);
      return {
        loesung,
        fehlerbilder: fehlerbilderAus(loesung, [
          ['nicht-quadriert', zahl(g.c)],
          ['isolieren-vergessen', g.d === 0 ? undefined : zahl(g.e * g.e)],
        ]),
      };
    }
    const loesung = zahl(g.x);
    const [, richtung, nichtGeteilt] = falsch(g);
    return {
      loesung,
      fehlerbilder: fehlerbilderAus(loesung, [
        ['falsche-richtung', richtung?.[1] === undefined ? undefined : zahl(richtung[1])],
        ['nicht-geteilt', nichtGeteilt?.[1] === undefined ? undefined : zahl(nichtGeteilt[1])],
      ]),
      platzhalter: { quadrat: g.c * g.c },
    };
  },
};

// ---------------------------------------------------------------------------
// Lösung oder Scheinlösung? (M.SF.GL.WURZEL.PROBE, Niveau E)

/** „Welche Lösung hat √(x + 5) = −2?“ – mit „keine Lösung“ zur Auswahl */
export const glWurzelProbe: Generator<Record<string, never>> = {
  id: 'gl.wurzel-probe',
  version: 1,
  platzhalter: ['gleichung'],
  fehlerbildIds: ['scheinloesung', 'keine-loesung-falsch', 'nicht-quadriert', 'falsche-richtung'],

  erzeuge(seed) {
    const r = rng(seed);
    const ohneLoesung = r.int(0, 1) === 0;
    const form = r.pick(['summe', 'isolieren'] as const);
    const g = gleichung(r, form, ohneLoesung);
    const keine = 'Keine Lösung: Eine Wurzel ist nie negativ.';
    const xText = (x: number) => `$x = ${texZahl(x)}$`;
    const schein = g.c * g.c - g.b;
    const kandidaten: [string, string][] = ohneLoesung
      ? [
          ['richtig', keine],
          ['scheinloesung', xText(schein)],
          ['nicht-quadriert', xText(g.c - g.b)],
          ['falsche-richtung', xText(g.c * g.c + g.b)],
        ]
      : [
          ['richtig', xText(g.x)],
          ['keine-loesung-falsch', keine],
          ['nicht-quadriert', xText(g.c - g.b)],
          ['falsche-richtung', xText(g.c * g.c + g.b)],
        ];
    // Gleiche Zahlen nur einmal anbieten
    const liste = mische(
      r,
      kandidaten.filter(([, t], i) => kandidaten.findIndex(([, u]) => u === t) === i),
    );
    const index = (id: string) => auswahl(liste.findIndex(([x]) => x === id));
    const wegText = ohneLoesung
      ? [
          ...(g.d === 0
            ? []
            : [
                `Erst die Wurzel allein stellen: $\\sqrt{${radikand(g.a, g.b)}} = ${texZahl(g.c)}$.`,
              ]),
          `Rechts steht eine negative Zahl. Eine Wurzel ist nie negativ, also gibt es keine Lösung.`,
          `Wer trotzdem quadriert, bekommt $x = ${texZahl(schein)}$. Die Probe zeigt: $\\sqrt{${texZahl(g.c * g.c)}} = ${texZahl(-g.c)}$, nicht $${texZahl(g.c)}$. Das ist eine Scheinlösung.`,
        ]
      : weg(g);
    return {
      platzhalter: { gleichung: de(tex(g)) },
      optionen: liste.map(([, t]) => ({ text: de(t) satisfies Sprachobjekt })),
      loesung: index('richtig'),
      loesungsweg: wegText.map(de),
      fehlerbilder: liste
        .filter(([id]) => id !== 'richtig')
        .map(([id]) => ({ id, antwort: index(id) as Loesung })),
    };
  },
};
