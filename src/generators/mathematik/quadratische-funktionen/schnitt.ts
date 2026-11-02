// Parabel und Gerade, Sachaufgaben – Klasse 9 (LEHRPLAN §8e, Feld QF): Schnittstellen
// zeichnerisch (G, mit Graph) und rechnerisch (M), Anzahl der Schnittpunkte begründen (E);
// Bogen, Wurf und größte Fläche (G/M), Lösungen im Sachzusammenhang deuten (E).
import type { Generator, Loesung, Sprachobjekt } from '../../../core/learning/generator';
import { fehlerbilderAus } from '../../../core/learning/loesung';
import { texZahl, zahlText } from '../../../core/learning/text';
import { rng, type Rng } from '../../../core/rng/rng';
import { auswahl, de, mische, verlange, zahl } from '../../hilfen';
import { bild, koordinatensystemBereich, kurve } from '../../svg';
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
/** Ganzzahlige Lösungen von x² + b·x + c = 0, sonst undefined */
function ganzeLoesungen(b: number, c: number): number[] | undefined {
  const d = b * b - 4 * c;
  if (d < 0) return [];
  const w = Math.sqrt(d);
  if (!Number.isInteger(w) || (b + w) % 2 !== 0) return undefined;
  return d === 0 ? [-b / 2] : [(-b - w) / 2, (-b + w) / 2];
}
/** „m·x + n“ in LaTeX */
function gerade(m: number, n: number): string {
  const mx = m === 0 ? '' : m === 1 ? 'x' : m === -1 ? '-x' : `${texZahl(m)}x`;
  if (mx === '') return texZahl(n);
  return n === 0 ? mx : `${mx} ${n > 0 ? '+' : '-'} ${Math.abs(n)}`;
}

// ---------------------------------------------------------------------------
// Schnittstellen von Parabel und Gerade (M.SF.QF.SCHNITTPUNKTE.BESTIMMEN)

export interface SchnittParameter {
  /** true: Gerade mit Anstieg, rechnerisch; false: waagerechte Gerade, mit Graph */
  readonly rechnerisch: boolean;
}

function schnittAufgabe(seed: number, p: SchnittParameter) {
  const r = rng(seed);
  for (;;) {
    const pp = p.rechnerisch ? 2 * r.int(-3, 3) : 0;
    const q = r.int(-6, 4);
    const m = p.rechnerisch ? pm(r, 3) : 0;
    const n = p.rechnerisch ? r.int(-6, 6) : r.int(-3, 8);
    // x² + p·x + q = m·x + n  ⇔  x² + (p − m)·x + (q − n) = 0
    const loesungen = ganzeLoesungen(pp - m, q - n);
    if (loesungen === undefined || loesungen.length === 1) continue;
    if (!p.rechnerisch && loesungen.some((x) => Math.abs(x) > 5)) continue;
    if (loesungen.length === 0 && r.int(0, 2) !== 0) continue; // „keine“ seltener
    return { pp, q, m, n, loesungen };
  }
}

/** „Bestimme die x-Koordinaten der Schnittpunkte von Parabel und Gerade.“ */
export const qfSchnitt: Generator<SchnittParameter> = {
  id: 'qf.schnitt',
  version: 1,
  platzhalter: ['parabel', 'gerade'],
  fehlerbildIds: ['parabel-nullstellen', 'vorzeichen-n'],

  erzeuge(seed, p) {
    const { pp, q, m, n, loesungen } = schnittAufgabe(seed, p);
    const loesung = felder(loesungen);
    const nullstellen = ganzeLoesungen(pp, q);
    const vorzeichen = ganzeLoesungen(pp - m, q + n);
    const parabel = `y = ${normalform(pp, q)}`;
    const geradeTex = `y = ${gerade(m, n)}`;
    let b;
    if (!p.rechnerisch) {
      const ymin = Math.min(-1, q - 1);
      const ymax = Math.max(n + 2, 4);
      const ks = koordinatensystemBereich(-6, 6, ymin, ymax, 24);
      b = bild(
        ks.breite,
        ks.hoehe,
        [
          ...ks.teile,
          kurve(ks, (x) => x * x + pp * x + q, -6, 6, { ymin, ymax }),
          kurve(ks, () => n, -6, 6, { ymin, ymax }, 2, 2),
        ],
        de(
          `Ein Koordinatensystem mit der Parabel y = x² ${q < 0 ? '−' : '+'} ${Math.abs(q)} und der waagerechten Geraden y = ${zahlText(n)}.`,
        ),
      );
    }
    return {
      platzhalter: { parabel: de(parabel), gerade: de(geradeTex) },
      ...(b ? { bild: b } : {}),
      vorzeichen: true,
      felder: FELDER,
      loesung,
      loesungsweg: [
        de(`Gleichsetzen: $${normalform(pp, q)} = ${gerade(m, n)}$.`),
        de(`Alles auf eine Seite: $${normalform(pp - m, q - n)} = 0$.`),
        de(
          loesungen.length === 0
            ? 'Diese Gleichung hat keine Lösung: Parabel und Gerade schneiden sich nicht.'
            : `Lösungen: $x_1 = ${texZahl(loesungen[0] ?? 0)}$ und $x_2 = ${texZahl(loesungen[1] ?? 0)}$.`,
        ),
      ],
      fehlerbilder: fehlerbilderAus(loesung, [
        [
          'parabel-nullstellen',
          nullstellen !== undefined && nullstellen.length === 2 ? felder(nullstellen) : undefined,
        ],
        [
          'vorzeichen-n',
          p.rechnerisch && n !== 0 && vorzeichen !== undefined && vorzeichen.length === 2
            ? felder(vorzeichen)
            : undefined,
        ],
      ]),
    };
  },
};

// ---------------------------------------------------------------------------
// Wie viele Schnittpunkte? (M.SF.QF.SCHNITTPUNKTE.ANZAHL, Niveau E)

const WORT = ['keinen Schnittpunkt', 'genau einen Schnittpunkt', 'zwei Schnittpunkte'];

/** „Wie viele Schnittpunkte haben y = x² + 1 und y = 2x?“ – Anzahl mit Begründung */
export const qfSchnittAnzahl: Generator<Record<string, never>> = {
  id: 'qf.schnitt-anzahl',
  version: 1,
  platzhalter: ['parabel', 'gerade'],
  fehlerbildIds: ['immer-zwei', 'parabel-nullstellen', 'vorzeichen-n'],

  erzeuge(seed) {
    const r = rng(seed);
    for (;;) {
      const art = r.int(0, 2);
      const h = pm(r, 3);
      const m = 2 * h;
      // x² + q = m·x + n  ⇔  x² − m·x + (q − n) = 0,  D/4 = h² − (q − n)
      const q = r.int(-4, 4);
      const n =
        art === 1 ? q - h * h : art === 0 ? q - h * h + r.int(1, 4) : q - h * h - r.int(1, 4);
      const d = h * h - (q - n);
      const richtig = d < 0 ? 0 : d === 0 ? 1 : 2;
      const nullstellen = q < 0 ? 2 : q === 0 ? 1 : 0;
      const d2 = h * h - (q + n);
      const vorzeichen = d2 < 0 ? 0 : d2 === 0 ? 1 : 2;
      const begruendung = [
        `denn $${normalform(-m, q - n)} = 0$ hat keine Lösung.`,
        `denn $${normalform(-m, q - n)} = 0$ hat genau eine Lösung: Die Gerade berührt die Parabel.`,
        `denn $${normalform(-m, q - n)} = 0$ hat zwei Lösungen.`,
      ];
      const kandidaten: [string, string][] = [
        ['richtig', `${WORT[richtig] ?? ''}, ${begruendung[richtig] ?? ''}`],
        [
          'immer-zwei',
          'zwei Schnittpunkte, denn eine Gerade schneidet eine Parabel immer zweimal.',
        ],
        [
          'parabel-nullstellen',
          `${WORT[nullstellen] ?? ''}, so viele, wie die Parabel Nullstellen hat.`,
        ],
        [
          'vorzeichen-n',
          `${WORT[vorzeichen] ?? ''}, denn $${normalform(-m, q + n)} = 0$ entscheidet.`,
        ],
      ];
      // Die falschen Antworten dürfen nicht dieselbe Anzahl wie die richtige nennen
      const liste0 = kandidaten.filter(
        ([id], i) =>
          id === 'richtig' ||
          ((id === 'immer-zwei' ? 2 : id === 'parabel-nullstellen' ? nullstellen : vorzeichen) !==
            richtig &&
            i > 0),
      );
      if (liste0.length < 3) continue;
      const liste = mische(r, liste0);
      const index = (id: string) => auswahl(liste.findIndex(([x]) => x === id));
      return {
        platzhalter: {
          parabel: de(`y = ${normalform(0, q)}`),
          gerade: de(`y = ${gerade(m, n)}`),
        },
        optionen: liste.map(([, t]) => ({ text: de(t) satisfies Sprachobjekt })),
        loesung: index('richtig'),
        loesungsweg: [
          de(
            `Gleichsetzen: $${normalform(0, q)} = ${gerade(m, n)}$, also $${normalform(-m, q - n)} = 0$.`,
          ),
          de(
            `Diskriminante: $D = ${texZahl(h * h)} - ${q - n < 0 ? `(${texZahl(q - n)})` : texZahl(q - n)} = ${texZahl(d)}$.`,
          ),
          de(`So viele Lösungen, so viele Schnittpunkte: ${WORT[richtig] ?? ''}.`),
        ],
        fehlerbilder: liste
          .filter(([id]) => id !== 'richtig')
          .map(([id]) => ({ id, antwort: index(id) })),
      };
    }
  },
};

// ---------------------------------------------------------------------------
// Sachaufgaben (M.SF.QF.SACH.BERECHNEN)

export type SachArt = 'bogen' | 'wurf' | 'flaeche';

export interface SachParameter {
  readonly arten: readonly SachArt[];
}

/** „Ein Brückenbogen hat die Form y = −0,25x² + 4 …“, Wurf, größte Fläche */
export const qfSach: Generator<SachParameter> = {
  id: 'qf.sach',
  version: 1,
  platzhalter: ['situation', 'frage', 'einheit'],
  fehlerbildIds: [
    'halbe-breite',
    'hoehe-statt-breite',
    'zeit-statt-hoehe',
    'umfang-halbe',
    'seite-statt-flaeche',
  ],

  erzeuge(seed, p) {
    verlange(p.arten.length > 0, 'arten: mindestens eine');
    const r = rng(seed);
    const art = r.pick(p.arten);
    if (art === 'bogen') {
      const a = r.pick([0.25, 0.5, 1]);
      const w = r.int(2, 6); // halbe Breite
      const h = a * w * w;
      const richtig = zahl(2 * w);
      return {
        platzhalter: {
          situation: de(
            `Ein Torbogen hat die Form $y = -${texZahl(a)}x^2 + ${texZahl(h)}$ (x und y in Metern, der Boden ist die x-Achse).`,
          ),
          frage: de('Wie breit ist der Bogen am Boden?'),
          einheit: de('m'),
        },
        loesung: richtig,
        loesungsweg: [
          de(
            `Am Boden ist $y = 0$: $-${texZahl(a)}x^2 + ${texZahl(h)} = 0$, also $x^2 = ${texZahl(w * w)}$.`,
          ),
          de(
            `$x = -${w}$ oder $x = ${w}$. Die Breite ist der Abstand: $${w} - (-${w}) = ${2 * w}$ m.`,
          ),
        ],
        fehlerbilder: fehlerbilderAus(richtig, [
          ['halbe-breite', zahl(w)],
          ['hoehe-statt-breite', h !== 2 * w && Number.isInteger(h * 100) ? zahl(h) : undefined],
        ]),
      };
    }
    if (art === 'wurf') {
      const t = r.int(1, 4); // Zeit bis zum höchsten Punkt
      const v = 10 * t;
      const hMax = 5 * t * t;
      const richtig = zahl(hMax);
      return {
        platzhalter: {
          situation: de(
            `Ein Ball wird senkrecht hochgeworfen. Seine Höhe nach t Sekunden ist $h(t) = -5t^2 + ${v}t$ (in Metern).`,
          ),
          frage: de('Wie hoch fliegt der Ball höchstens?'),
          einheit: de('m'),
        },
        loesung: richtig,
        loesungsweg: [
          de(
            `Der höchste Punkt ist der Scheitelpunkt. Nullstellen: $t = 0$ und $t = ${2 * t}$, die Mitte ist $t = ${t}$.`,
          ),
          de(`$h(${t}) = -5 \\cdot ${t * t} + ${v} \\cdot ${t} = ${hMax}$ m.`),
        ],
        fehlerbilder: fehlerbilderAus(richtig, [['zeit-statt-hoehe', zahl(t)]]),
      };
    }
    const u = 4 * r.int(3, 15);
    const richtig = zahl((u / 4) ** 2);
    return {
      platzhalter: {
        situation: de(
          `Mit ${u} m Zaun soll ein rechteckiges Beet eingezäunt werden. Bei einer Seite x ist der Flächeninhalt $A(x) = x \\cdot (${u / 2} - x)$.`,
        ),
        frage: de('Wie groß ist der Flächeninhalt höchstens?'),
        einheit: de('m²'),
      },
      loesung: richtig,
      loesungsweg: [
        de(
          `$A(x) = -x^2 + ${u / 2}x$ ist eine nach unten geöffnete Parabel mit den Nullstellen 0 und ${u / 2}.`,
        ),
        de(
          `Der Scheitelpunkt liegt in der Mitte: $x = ${u / 4}$. Dann ist $A = ${u / 4} \\cdot ${u / 4} = ${(u / 4) ** 2}$ m². Das Beet ist ein Quadrat.`,
        ),
      ],
      fehlerbilder: fehlerbilderAus(richtig, [
        ['umfang-halbe', zahl((u / 2) ** 2)],
        ['seite-statt-flaeche', zahl(u / 4)],
      ]),
    };
  },
};

// ---------------------------------------------------------------------------
// Lösung im Sachzusammenhang (M.SF.QF.SACH.SINN, Niveau E)

/** „Die Gleichung hat die Lösungen t = −1 und t = 3. Wann landet der Ball?“ */
export const qfSachSinn: Generator<Record<string, never>> = {
  id: 'qf.sach-sinn',
  version: 1,
  platzhalter: ['situation'],
  fehlerbildIds: ['beide', 'betrag', 'mittelwert'],

  erzeuge(seed) {
    const r = rng(seed);
    const a = r.int(1, 3);
    let b = r.int(2, 6);
    if (b === a || (b - a) / 2 === a || (b - a) / 2 === b) b = b + 1;
    // h(t) = −5·(t + a)·(t − b) = −5t² + 5(b − a)t + 5ab
    const v = 5 * (b - a);
    const h0 = 5 * a * b;
    const kandidaten: [string, string][] = [
      [
        'richtig',
        `Nach ${b} s. Die Lösung $t = -${a}$ läge vor dem Abwurf und ergibt hier keinen Sinn.`,
      ],
      ['beide', `Nach $-${a}$ s und nach ${b} s, eine Gleichung hat beide Lösungen.`],
      ['betrag', `Nach ${a} s, denn bei Zeiten zählt der Betrag.`],
      ['mittelwert', `Nach ${zahlText((b - a) / 2)} s, in der Mitte zwischen beiden Lösungen.`],
    ];
    const liste = mische(r, kandidaten);
    const index = (id: string) => auswahl(liste.findIndex(([x]) => x === id));
    return {
      platzhalter: {
        situation: de(
          `Ein Ball wird von einem ${h0} m hohen Turm geworfen. Seine Höhe ist $h(t) = -5t^2 + ${v}t + ${h0}$. Die Gleichung $h(t) = 0$ hat die Lösungen $t = -${a}$ und $t = ${b}$.`,
        ),
      },
      optionen: liste.map(([, t]) => ({ text: de(t) satisfies Sprachobjekt })),
      loesung: index('richtig'),
      loesungsweg: [
        de('$h(t) = 0$ heißt: Der Ball ist am Boden.'),
        de(
          `Der Ball wird bei $t = 0$ geworfen. Eine negative Zeit liegt davor, also landet er nach ${b} s.`,
        ),
      ],
      fehlerbilder: liste
        .filter(([id]) => id !== 'richtig')
        .map(([id]) => ({ id, antwort: index(id) })),
    };
  },
};
