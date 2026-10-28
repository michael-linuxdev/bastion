// Lineare Gleichungssysteme – Klasse 8 (LEHRPLAN §8d, Feld GS): grafisch lösen und
// Lösbarkeit erkennen, rechnerisch lösen (Einsetzen, Gleichsetzen, Addieren),
// Gleichungssysteme zu Sachaufgaben aufstellen und lösen. Lösungen sind ganze Zahlen.
import { runde10 } from '../../../core/learning/format';
import { zahlText } from '../../../core/learning/text';
import type { Generator, Loesung } from '../../../core/learning/generator';
import { fehlerbilderAus } from '../../../core/learning/loesung';
import { rng, type Rng } from '../../../core/rng/rng';
import { auswahl, de, zahl } from '../../hilfen';
import { bild, koordinatensystem4 } from '../../svg';
import { geradeLinie, geradeText } from '../funktionen/funktionen';
import { optionenAus, summe } from '../terme/umformen';

const pm = (r: Rng, max: number) => r.int(1, max) * (r.int(0, 1) === 0 ? -1 : 1);
const pkt = (x: number, y: number): Loesung => ({
  typ: 'punkt',
  wert: { x: runde10(x, 6) || 0, y: runde10(y, 6) || 0 },
});
/** „2·x − 3·y = 12“ */
const allgemein = (a: number, b: number, c: number) =>
  `${summe([
    [a, 'x'],
    [b, 'y'],
  ])} = ${zahlText(c)}`;
const system = (g1: string, g2: string) => `(I) ${g1}; (II) ${g2}`;
const LOESUNGEN = ['genau eine Lösung', 'keine Lösung', 'unendlich viele Lösungen'] as const;

// ---------------------------------------------------------------------------
// Grafisch (M.SF.GS.GRAFISCH)

export interface SchnittpunktParameter {
  /** auch Anstiege ±0,5 */
  readonly halbe: boolean;
}

/** „Lies die Lösung des Gleichungssystems am Schnittpunkt ab.“ */
export const schnittpunktAblesen: Generator<SchnittpunktParameter> = {
  id: 'gs.schnittpunkt-ablesen',
  version: 1,
  platzhalter: ['system'],
  fehlerbildIds: ['x-y-vertauscht', 'achsenschnitt'],

  erzeuge(seed, p) {
    const r = rng(seed);
    const anstiege = p.halbe ? [-2, -1, -0.5, 0.5, 1, 2, 3, -3] : [-3, -2, -1, 1, 2, 3];
    const x0 = pm(r, 4);
    const y0 = pm(r, 4);
    const m1 = r.pick(anstiege);
    let m2 = r.pick(anstiege);
    while (m2 === m1) m2 = r.pick(anstiege);
    const n1 = runde10(y0 - m1 * x0, 6);
    const n2 = runde10(y0 - m2 * x0, 6);
    const ks = koordinatensystem4(6);
    const richtig = pkt(x0, y0);
    return {
      platzhalter: { system: de(system(geradeText(m1, n1), geradeText(m2, n2))) },
      bild: bild(
        ks.breite,
        ks.hoehe,
        [...ks.teile, geradeLinie(ks, m1, n1, 6), geradeLinie(ks, m2, n2, 6)],
        de(
          `Ein Koordinatensystem mit den Geraden zu (I) und (II). Sie schneiden sich im Punkt (${zahlText(x0)}|${zahlText(y0)}).`,
        ),
      ),
      vorzeichen: true,
      loesung: richtig,
      loesungsweg: [
        de('Die Lösung ist der Punkt, der auf beiden Geraden liegt: der Schnittpunkt.'),
        de(`x = ${zahlText(x0)}, y = ${zahlText(y0)}`),
        de(`Probe in (I): ${zahlText(m1)} · ${zahlText(x0)} + ${zahlText(n1)} = ${zahlText(y0)}`),
      ],
      fehlerbilder: fehlerbilderAus(richtig, [
        ['x-y-vertauscht', pkt(y0, x0)],
        ['achsenschnitt', pkt(0, n1)],
      ]),
    };
  },
};

export interface LoesbarkeitParameter {
  /** false: beide Gleichungen nach y aufgelöst; true: allgemeine Form a·x + b·y = c */
  readonly allgemein: boolean;
}

/** „Wie viele Lösungen hat das Gleichungssystem?“ */
export const loesbarkeit: Generator<LoesbarkeitParameter> = {
  id: 'gs.loesbarkeit',
  version: 1,
  platzhalter: ['system'],
  fehlerbildIds: ['parallel-schneiden', 'gleich-statt-parallel', 'nur-n-verglichen'],

  erzeuge(seed, p) {
    const r = rng(seed);
    const fall = r.int(0, 2);
    let g1: string;
    let g2: string;
    if (!p.allgemein) {
      const m = pm(r, 4);
      const n = pm(r, 6);
      // zweite Gleichung anders geschrieben: y − n2 = m2·x
      const m2 = fall === 0 ? m + pm(r, 2) : m;
      const n2 = fall === 1 ? n + pm(r, 3) : fall === 0 ? r.pick([n, n + 1, n - 2]) : n;
      g1 = geradeText(m, n);
      g2 =
        r.int(0, 1) === 0
          ? `${summe([
              [1, 'y'],
              [-n2, ''],
            ])} = ${summe([[m2, 'x']])}`
          : geradeText(m2, n2);
    } else {
      const a = pm(r, 5);
      let b = pm(r, 5);
      if (b === a) b = -b;
      const c = pm(r, 12);
      const f = r.pick([-3, -2, 2, 3]);
      g1 = allgemein(a, b, c);
      if (fall === 0) {
        let a2 = pm(r, 5);
        let b2 = pm(r, 5);
        while (a * b2 === a2 * b) {
          a2 = pm(r, 5);
          b2 = pm(r, 5);
        }
        g2 = allgemein(a2, b2, pm(r, 12));
      } else {
        g2 = allgemein(f * a, f * b, fall === 2 ? f * c : f * c + pm(r, 4));
      }
    }
    const richtig = auswahl(fall);
    return {
      platzhalter: { system: de(system(g1, g2)) },
      optionen: LOESUNGEN.map((t) => ({ text: de(t) })),
      loesung: richtig,
      loesungsweg: [
        de(
          p.allgemein
            ? 'Prüfe, ob die linke Seite von (II) ein Vielfaches der linken Seite von (I) ist.'
            : 'Löse beide Gleichungen nach y auf und vergleiche die Anstiege.',
        ),
        de(
          [
            'Die Anstiege sind verschieden: Die Geraden schneiden sich – genau eine Lösung.',
            'Gleicher Anstieg, aber verschiedene Achsenabschnitte: Die Geraden sind parallel – keine Lösung.',
            'Beide Gleichungen beschreiben dieselbe Gerade – unendlich viele Lösungen.',
          ][fall] ?? '',
        ),
      ],
      fehlerbilder: fehlerbilderAus(richtig, [
        ['parallel-schneiden', fall === 1 ? auswahl(0) : undefined],
        ['gleich-statt-parallel', fall === 1 ? auswahl(2) : fall === 2 ? auswahl(1) : undefined],
        ['nur-n-verglichen', fall === 0 ? auswahl(1) : undefined],
      ]),
    };
  },
};

// ---------------------------------------------------------------------------
// Rechnerisch (M.SF.GS.RECHNERISCH)

export interface RechnerischParameter {
  /** false: Einsetzen oder Gleichsetzen (eine Gleichung nach y aufgelöst); true: Additionsverfahren */
  readonly addition: boolean;
}

/** Zufälliges System mit ganzzahliger Lösung (x0|y0) */
function zufallsSystem(r: Rng, addition: boolean) {
  const x0 = pm(r, 6);
  const y0 = pm(r, 6);
  if (!addition) {
    const m = pm(r, 3);
    const n = y0 - m * x0;
    if (r.int(0, 1) === 0) {
      // Gleichsetzen: zwei Gleichungen nach y aufgelöst
      let m2 = pm(r, 3);
      if (m2 === m) m2 = -m;
      const n2 = y0 - m2 * x0;
      return {
        x0,
        y0,
        art: 'gleichsetzen' as const,
        m,
        n,
        a: -m2,
        b: 1,
        c: n2,
        g1: geradeText(m, n),
        g2: geradeText(m2, n2),
      };
    }
    let a = pm(r, 4);
    const b = pm(r, 4);
    if (a + b * m === 0) a = a + 1;
    const c = a * x0 + b * y0;
    return {
      x0,
      y0,
      art: 'einsetzen' as const,
      m,
      n,
      a,
      b,
      c,
      g1: geradeText(m, n),
      g2: allgemein(a, b, c),
    };
  }
  const a1 = pm(r, 5);
  const b1 = pm(r, 5);
  // y fällt beim Addieren weg (b2 = −b1) oder nach Malnehmen von (II) mit 2
  const a2 = pm(r, 5);
  const b2 = r.int(0, 1) === 0 ? -b1 : -2 * b1;
  if (a1 * b2 === a2 * b1) return zufallsSystem(r, addition);
  const c1 = a1 * x0 + b1 * y0;
  const c2 = a2 * x0 + b2 * y0;
  return {
    x0,
    y0,
    art: 'addition' as const,
    a1,
    b1,
    c1,
    a2,
    b2,
    c2,
    g1: allgemein(a1, b1, c1),
    g2: allgemein(a2, b2, c2),
  };
}

/** „Löse das Gleichungssystem.“ – Lösungspaar eingeben */
export const lgsLoesen: Generator<RechnerischParameter> = {
  id: 'gs.loesen',
  version: 1,
  platzhalter: ['system'],
  fehlerbildIds: ['x-y-vertauscht', 'y-vorzeichen'],

  erzeuge(seed, p) {
    const r = rng(seed);
    const s = zufallsSystem(r, p.addition);
    const richtig = pkt(s.x0, s.y0);
    const weg =
      s.art === 'addition'
        ? [
            de(
              s.b2 === -s.b1
                ? 'Addiere (I) und (II): y fällt weg.'
                : 'Nimm (I) mit 2 mal und addiere (II): y fällt weg.',
            ),
            de(`x = ${zahlText(s.x0)}`),
            de(`x in (I) einsetzen: y = ${zahlText(s.y0)}`),
          ]
        : [
            de(
              s.art === 'einsetzen'
                ? 'Setze (I) für y in (II) ein.'
                : 'Setze die rechten Seiten gleich.',
            ),
            de(`x = ${zahlText(s.x0)}`),
            de(`x in (I) einsetzen: y = ${zahlText(s.y0)}`),
          ];
    return {
      platzhalter: { system: de(system(s.g1, s.g2)) },
      vorzeichen: true,
      loesung: richtig,
      loesungsweg: weg,
      fehlerbilder: fehlerbilderAus(richtig, [
        ['x-y-vertauscht', pkt(s.y0, s.x0)],
        ['y-vorzeichen', pkt(s.x0, -s.y0)],
      ]),
    };
  },
};

/** „Welche Gleichung entsteht beim Einsetzen / Addieren?“ */
export const lgsSchritt: Generator<RechnerischParameter> = {
  id: 'gs.schritt',
  version: 1,
  platzhalter: ['system', 'schritt'],
  fehlerbildIds: ['klammer-vergessen', 'falsch-eingesetzt', 'rechte-seite-falsch', 'subtrahiert'],

  erzeuge(seed, p) {
    const r = rng(seed);
    for (;;) {
      const s = zufallsSystem(r, p.addition);
      if (s.art === 'addition') {
        if (s.b2 !== -s.b1 || s.c2 === 0) continue;
        const { optionen, index, richtig } = optionenAus(
          r,
          `${summe([[s.a1 + s.a2, 'x']])} = ${zahlText(s.c1 + s.c2)}`,
          [
            ['rechte-seite-falsch', `${summe([[s.a1 + s.a2, 'x']])} = ${zahlText(s.c1 - s.c2)}`],
            [
              'subtrahiert',
              `${summe([
                [s.a1 - s.a2, 'x'],
                [2 * s.b1, 'y'],
              ])} = ${zahlText(s.c1 - s.c2)}`,
            ],
            ['rechte-seite-falsch', `${summe([[s.a1 + s.a2, 'x']])} = ${zahlText(s.c1)}`],
          ],
        );
        if (s.a1 + s.a2 === 0) continue;
        return {
          platzhalter: { system: de(system(s.g1, s.g2)), schritt: de('Addiere (I) und (II)') },
          optionen: optionen.map(([, t]) => ({ text: de(t) })),
          loesung: richtig,
          loesungsweg: [
            de('Addiere links die x-Glieder und die y-Glieder, rechts die Zahlen.'),
            de(
              `Die y-Glieder heben sich auf: ${summe([[s.a1 + s.a2, 'x']])} = ${zahlText(s.c1 + s.c2)}`,
            ),
          ],
          fehlerbilder: fehlerbilderAus(richtig, [
            ['rechte-seite-falsch', index('rechte-seite-falsch')],
            ['subtrahiert', index('subtrahiert')],
          ]),
        };
      }
      // bei a = b wäre „x und y vertauscht eingesetzt“ gleichwertig zur richtigen Gleichung
      if (s.art !== 'einsetzen' || s.a === s.b) continue;
      const term = summe([
        [s.m, 'x'],
        [s.n, ''],
      ]);
      const gl = (glieder: [number, string][]) => `${summe(glieder)} = ${zahlText(s.c)}`;
      const { optionen, index, richtig } = optionenAus(
        r,
        gl([
          [s.a, 'x'],
          [s.b * s.m, 'x'],
          [s.b * s.n, ''],
        ]),
        [
          [
            'klammer-vergessen',
            gl([
              [s.a, 'x'],
              [s.b * s.m, 'x'],
              [s.n, ''],
            ]),
          ],
          [
            'falsch-eingesetzt',
            gl([
              [s.a * s.m, 'x'],
              [s.a * s.n, ''],
              [s.b, 'x'],
            ]),
          ],
          [
            'klammer-vergessen',
            gl([
              [s.a, 'x'],
              [s.b * s.m, 'x'],
              [-s.b * s.n, ''],
            ]),
          ],
        ],
      );
      if (optionen.length < 3) continue;
      return {
        platzhalter: { system: de(system(s.g1, s.g2)), schritt: de('Setze (I) für y in (II) ein') },
        optionen: optionen.map(([, t]) => ({ text: de(t) })),
        loesung: richtig,
        loesungsweg: [
          de(`Nach (I) ist y = ${term}. Ersetze in (II) das y durch (${term}).`),
          de(
            'Löse die Klammer auf: Jedes Glied in der Klammer wird mit der Zahl davor malgenommen.',
          ),
        ],
        fehlerbilder: fehlerbilderAus(richtig, [
          ['klammer-vergessen', index('klammer-vergessen')],
          ['falsch-eingesetzt', index('falsch-eingesetzt')],
        ]),
      };
    }
  },
};

// ---------------------------------------------------------------------------
// Sachaufgaben (M.SF.GS.SACH)

interface Sache {
  readonly text: (anzahl: number, wert: number, px: number, py: number) => string;
  /** Namen der beiden Unbekannten (x, y), Wert je Stück */
  readonly x: string;
  readonly y: string;
  readonly wertX: readonly number[];
  readonly wertY: readonly number[];
  readonly einheit: string;
}

const SACHEN: readonly Sache[] = [
  {
    text: (n, w) =>
      `Auf einem Hof leben Hühner und Kaninchen, zusammen ${n} Tiere mit ${w} Beinen.`,
    x: 'Hühner',
    y: 'Kaninchen',
    wertX: [2],
    wertY: [4],
    einheit: 'Beine',
  },
  {
    text: (n, w, px, py) =>
      `Eine Gruppe kauft ${n} Eintrittskarten und zahlt ${zahlText(w)} €. Eine Karte für Erwachsene kostet ${zahlText(px)} €, eine für Kinder ${zahlText(py)} €.`,
    x: 'Erwachsene',
    y: 'Kinder',
    wertX: [8, 9, 10, 12],
    wertY: [4, 5, 6],
    einheit: '€',
  },
  {
    text: (n, w) =>
      `In einer Spardose liegen ${n} Münzen, nur 2-€- und 1-€-Münzen, zusammen ${zahlText(w)} €.`,
    x: '2-€-Münzen',
    y: '1-€-Münzen',
    wertX: [2],
    wertY: [1],
    einheit: '€',
  },
  {
    text: (n, w) =>
      `Im Parkhaus stehen Autos und Motorräder, zusammen ${n} Fahrzeuge mit ${w} Rädern.`,
    x: 'Autos',
    y: 'Motorräder',
    wertX: [4],
    wertY: [2],
    einheit: 'Räder',
  },
];

function sachaufgabe(r: Rng) {
  const s = r.pick(SACHEN);
  const px = r.pick(s.wertX);
  const py = r.pick(s.wertY);
  const x = r.int(2, 20);
  const y = r.int(2, 20);
  return { s, px, py, x, y, n: x + y, w: px * x + py * y };
}

/** „Welches Gleichungssystem passt?“ */
export const sachSystem: Generator<Record<string, never>> = {
  id: 'gs.sach-system',
  version: 1,
  platzhalter: ['sache'],
  fehlerbildIds: ['werte-vertauscht', 'anzahl-mal-wert', 'summe-statt-wert'],

  erzeuge(seed) {
    const r = rng(seed);
    const a = sachaufgabe(r);
    const zeile = (g1: string, g2: string) => system(g1, g2);
    const { optionen, index, richtig } = optionenAus(
      r,
      zeile(`x + y = ${a.n}`, `${allgemein(a.px, a.py, a.w)}`),
      [
        ['werte-vertauscht', zeile(`x + y = ${a.n}`, `${allgemein(a.py, a.px, a.w)}`)],
        ['summe-statt-wert', zeile(`x + y = ${a.w}`, `${allgemein(a.px, a.py, a.n)}`)],
        ['anzahl-mal-wert', zeile(`x + y = ${a.n}`, `${summe([[a.px + a.py, 'x']])} = ${a.w}`)],
      ],
    );
    return {
      platzhalter: {
        sache: de(
          `${a.s.text(a.n, a.w, a.px, a.py)} x steht für die Zahl der ${a.s.x}, y für die Zahl der ${a.s.y}.`,
        ),
      },
      optionen: optionen.map(([, t]) => ({ text: de(t) })),
      loesung: richtig,
      loesungsweg: [
        de(`Anzahl: x + y = ${a.n}`),
        de(`${a.s.einheit === '€' ? 'Geld' : a.s.einheit}: ${allgemein(a.px, a.py, a.w)}`),
      ],
      fehlerbilder: fehlerbilderAus(richtig, [
        ['werte-vertauscht', index('werte-vertauscht')],
        ['summe-statt-wert', index('summe-statt-wert')],
        ['anzahl-mal-wert', index('anzahl-mal-wert')],
      ]),
    };
  },
};

export interface SachLoesenParameter {
  /** false: das System ist angegeben; true: nur die Sachaufgabe */
  readonly ohne_system: boolean;
}

/** „Wie viele Kaninchen sind es?“ */
export const sachLoesen: Generator<SachLoesenParameter> = {
  id: 'gs.sach-loesen',
  version: 1,
  platzhalter: ['sache', 'frage'],
  fehlerbildIds: ['andere-unbekannte', 'nur-anzahl-geteilt'],

  erzeuge(seed, p) {
    const r = rng(seed);
    let a = sachaufgabe(r);
    while (a.x === a.y) a = sachaufgabe(r);
    const fragtY = r.int(0, 1) === 0;
    const richtig = zahl(fragtY ? a.y : a.x);
    const halb = a.n / 2;
    const hinweis = p.ohne_system
      ? ''
      : ` Es gilt ${system(`x + y = ${a.n}`, allgemein(a.px, a.py, a.w))}, x steht für die ${a.s.x}, y für die ${a.s.y}.`;
    return {
      platzhalter: {
        sache: de(a.s.text(a.n, a.w, a.px, a.py) + hinweis),
        frage: de(`Wie viele ${fragtY ? a.s.y : a.s.x} sind es?`),
      },
      loesung: richtig,
      loesungsweg: [
        de(`(I) x + y = ${a.n}, (II) ${allgemein(a.px, a.py, a.w)}`),
        de(`Aus (I): y = ${a.n} − x. In (II) einsetzen und lösen: x = ${a.x}, y = ${a.y}.`),
      ],
      fehlerbilder: fehlerbilderAus(richtig, [
        ['andere-unbekannte', zahl(fragtY ? a.x : a.y)],
        ['nur-anzahl-geteilt', Number.isInteger(halb) ? zahl(halb) : undefined],
      ]),
    };
  },
};
