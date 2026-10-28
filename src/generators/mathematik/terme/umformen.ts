// Terme umformen – Klasse 8 (LEHRPLAN §8d, Feld TU): zusammenfassen, Klammern
// auflösen, ausmultiplizieren und ausklammern, binomische Formeln, Gleichungen
// mit Klammern, Ungleichungen. Terme werden als Lücke (eine Zahl) oder als
// Auswahl abgefragt – es gibt kein Eingabefeld für ganze Terme.
import { zahlText } from '../../../core/learning/text';
import type { Generator, Loesung } from '../../../core/learning/generator';
import { fehlerbilderAus } from '../../../core/learning/loesung';
import { rng, type Rng } from '../../../core/rng/rng';
import { auswahl, de, mische, zahl } from '../../hilfen';

const pm = (r: Rng, max: number) => r.int(1, max) * (r.int(0, 1) === 0 ? -1 : 1);
const zz = (x: number) => zahl(x === 0 ? 0 : x);
const k = (x: number) => (x < 0 ? `(${zahlText(x)})` : zahlText(x));

/** Summe von Gliedern [Koeffizient, Variable] als Text: „3·x − 2·y + 5“; Variable '' = Zahl */
export function summe(glieder: readonly (readonly [number, string])[]): string {
  const teile = glieder.filter(([c]) => c !== 0);
  if (teile.length === 0) return '0';
  return teile
    .map(([c, v], i) => {
      const betrag = Math.abs(c);
      const kern = v === '' ? zahlText(betrag) : betrag === 1 ? v : `${zahlText(betrag)}·${v}`;
      if (i === 0) return c < 0 ? `−${kern}` : kern;
      return `${c < 0 ? '−' : '+'} ${kern}`;
    })
    .join(' ');
}

/** Vier verschiedene Optionen: richtig zuerst, dann Fehler; doppelte fallen weg */
export function optionenAus(
  r: Rng,
  richtig: string,
  falsche: readonly (readonly [string, string])[],
) {
  const liste: (readonly [string, string])[] = [['richtig', richtig]];
  for (const f of falsche) if (!liste.some(([, t]) => t === f[1])) liste.push(f);
  const optionen = mische(r, liste.slice(0, 4));
  const index = (id: string) => {
    const i = optionen.findIndex(([x]) => x === id);
    return i < 0 ? undefined : auswahl(i);
  };
  return { optionen, index, richtig: auswahl(optionen.findIndex(([x]) => x === 'richtig')) };
}

// ---------------------------------------------------------------------------
// Zusammenfassen (M.SF.TU.ZUSAMMENFASSEN.AUSWAHL, .LUECKE)

export interface ZusammenfassenParameter {
  /** auch Minusklammern und zwei Variablen */
  readonly klammer: boolean;
}

/** „Fasse zusammen: 5·a − (2·a − 3·b) + 4·b“ – vier Ergebnisse zur Wahl */
export const zusammenfassen: Generator<ZusammenfassenParameter> = {
  id: 'tu.zusammenfassen',
  version: 1,
  platzhalter: ['term'],
  fehlerbildIds: ['minusklammer', 'ungleichartige-zusammengefasst', 'vorzeichen-verloren'],

  erzeuge(seed, p) {
    const r = rng(seed);
    if (!p.klammer) {
      const [a, b, c] = [r.int(2, 9), pm(r, 9), r.int(1, 12)];
      const d = pm(r, 9);
      const term = summe([
        [a, 'x'],
        [c, ''],
        [b, 'x'],
        [d, 'x'],
      ]);
      const x = a + b + d;
      if (x === 0) return zusammenfassen.erzeuge(seed + 1, p);
      const richtig = summe([
        [x, 'x'],
        [c, ''],
      ]);
      const o = optionenAus(r, richtig, [
        ['ungleichartige-zusammengefasst', summe([[x + c, 'x']])],
        [
          'vorzeichen-verloren',
          summe([
            [a + Math.abs(b) + Math.abs(d), 'x'],
            [c, ''],
          ]),
        ],
        [
          'vorzeichen-verloren',
          summe([
            [-x, 'x'],
            [c, ''],
          ]),
        ],
        ['ungleichartige-zusammengefasst', zahlText(x + c)],
      ]);
      return {
        platzhalter: { term: de(term) },
        optionen: o.optionen.map(([, t]) => ({ text: de(t) })),
        loesung: o.richtig,
        loesungsweg: [
          de(
            `x-Glieder: ${summe([
              [a, 'x'],
              [b, 'x'],
              [d, 'x'],
            ])} = ${summe([[x, 'x']])}. Die Zahl ${c} bleibt.`,
          ),
          de(richtig),
        ],
        fehlerbilder: fehlerbilderAus(o.richtig, [
          ['ungleichartige-zusammengefasst', o.index('ungleichartige-zusammengefasst')],
          ['vorzeichen-verloren', o.index('vorzeichen-verloren')],
        ]),
      };
    }
    // a·x − (b·x − c·y) + d·y
    const [a, b, c, d] = [r.int(3, 12), r.int(1, 9), r.int(1, 9), pm(r, 9)];
    const term = `${summe([[a, 'x']])} − (${summe([
      [b, 'x'],
      [-c, 'y'],
    ])}) ${d < 0 ? '−' : '+'} ${Math.abs(d) === 1 ? 'y' : `${Math.abs(d)}·y`}`;
    const xr = a - b;
    const yr = c + d;
    const richtig = summe([
      [xr, 'x'],
      [yr, 'y'],
    ]);
    const o = optionenAus(r, richtig, [
      [
        'minusklammer',
        summe([
          [xr, 'x'],
          [-c + d, 'y'],
        ]),
      ],
      [
        'minusklammer',
        summe([
          [a + b, 'x'],
          [yr, 'y'],
        ]),
      ],
      ['ungleichartige-zusammengefasst', summe([[xr + yr, 'x']])],
      [
        'vorzeichen-verloren',
        summe([
          [-xr, 'x'],
          [yr, 'y'],
        ]),
      ],
    ]);
    return {
      platzhalter: { term: de(term) },
      optionen: o.optionen.map(([, t]) => ({ text: de(t) })),
      loesung: o.richtig,
      loesungsweg: [
        de(
          `Minusklammer auflösen – alle Vorzeichen in der Klammer drehen: ${summe([
            [a, 'x'],
            [-b, 'x'],
            [c, 'y'],
            [d, 'y'],
          ])}`,
        ),
        de(`Zusammenfassen: ${richtig}`),
      ],
      fehlerbilder: fehlerbilderAus(o.richtig, [
        ['minusklammer', o.index('minusklammer')],
        ['ungleichartige-zusammengefasst', o.index('ungleichartige-zusammengefasst')],
        ['vorzeichen-verloren', o.index('vorzeichen-verloren')],
      ]),
    };
  },
};

/** „7·x − 3·x + 2·x = ☐·x“ bzw. „5·a − (2·a − 3·b) = 3·a + ☐·b“ */
export const zusammenfassenLuecke: Generator<ZusammenfassenParameter> = {
  id: 'tu.zusammenfassen-luecke',
  version: 1,
  platzhalter: ['aufgabe'],
  fehlerbildIds: ['vorzeichen-verloren', 'minusklammer'],

  erzeuge(seed, p) {
    const r = rng(seed);
    if (!p.klammer) {
      const glieder = [r.int(2, 12), pm(r, 9), pm(r, 9)];
      const w = glieder.reduce((s, x) => s + x, 0);
      if (w === 0) return zusammenfassenLuecke.erzeuge(seed + 1, p);
      const richtig = zz(w);
      return {
        platzhalter: { aufgabe: de(`${summe(glieder.map((g) => [g, 'x'] as const))} = ☐·x`) },
        vorzeichen: true,
        loesung: richtig,
        loesungsweg: [de(`${glieder.map(k).join(' + ')} = ${zahlText(w)}`)],
        fehlerbilder: fehlerbilderAus(richtig, [
          ['vorzeichen-verloren', zz(glieder.reduce((s, x) => s + Math.abs(x), 0))],
        ]),
      };
    }
    const [a, b, c] = [r.int(3, 12), r.int(1, 9), r.int(1, 9)];
    const minus = r.int(0, 1) === 0; // − (b·x − c·y) oder − (b·x + c·y)
    const yr = minus ? c : -c;
    const richtig = zz(yr);
    return {
      platzhalter: {
        aufgabe: de(
          `${summe([[a, 'x']])} − (${summe([
            [b, 'x'],
            [minus ? -c : c, 'y'],
          ])}) = ${summe([[a - b, 'x']])} + ☐·y`,
        ),
      },
      vorzeichen: true,
      loesung: richtig,
      loesungsweg: [
        de('Ein Minus vor der Klammer dreht beim Auflösen alle Vorzeichen in der Klammer.'),
        de(
          `${summe([
            [a, 'x'],
            [-b, 'x'],
            [yr, 'y'],
          ])} = ${summe([
            [a - b, 'x'],
            [yr, 'y'],
          ])}`,
        ),
      ],
      fehlerbilder: fehlerbilderAus(richtig, [['minusklammer', zz(-yr)]]),
    };
  },
};

// ---------------------------------------------------------------------------
// Ausmultiplizieren und Ausklammern (M.SF.TU.AUSMULTIPLIZIEREN.LUECKE, .AUSWAHL)

export interface AusmultiplizierenParameter {
  /** auch negative Faktoren und Ausklammern */
  readonly erweitert: boolean;
}

/** „4·(x − 3) = 4·x − ☐“, „−3·(2·x − 5) = ☐·x + 15“, „12·x − 18 = 6·(2·x − ☐)“ */
export const ausmultiplizierenLuecke: Generator<AusmultiplizierenParameter> = {
  id: 'tu.ausmultiplizieren-luecke',
  version: 1,
  platzhalter: ['aufgabe'],
  fehlerbildIds: ['nur-erstes-glied', 'vorzeichen-falsch', 'nicht-geteilt'],

  erzeuge(seed, p) {
    const r = rng(seed);
    const art = p.erweitert ? r.int(0, 2) : 0;
    const f = p.erweitert && art === 1 ? -r.int(2, 9) : r.int(2, 9);
    const a = r.int(1, 6);
    const b = pm(r, 12);
    if (art === 2) {
      // Ausklammern: f·a·x + f·b = f·(a·x + b) – gesucht b
      const richtig = zz(b);
      return {
        platzhalter: {
          aufgabe: de(
            `${summe([
              [f * a, 'x'],
              [f * b, ''],
            ])} = ${f}·(${summe([[a, 'x']])} + ☐)`,
          ),
        },
        vorzeichen: true,
        loesung: richtig,
        loesungsweg: [de(`Ausklammern heißt teilen: ${zahlText(f * b)} : ${f} = ${zahlText(b)}`)],
        fehlerbilder: fehlerbilderAus(richtig, [['nicht-geteilt', zz(f * b)]]),
      };
    }
    if (art === 1) {
      // f negativ: f·(a·x + b) = ☐·x + f·b
      const richtig = zz(f * a);
      return {
        platzhalter: {
          aufgabe: de(
            `${zahlText(f)}·(${summe([
              [a, 'x'],
              [b, ''],
            ])}) = ☐·x ${f * b < 0 ? '−' : '+'} ${Math.abs(f * b)}`,
          ),
        },
        vorzeichen: true,
        loesung: richtig,
        loesungsweg: [
          de(
            `Jedes Glied in der Klammer mal ${k(f)}: ${zahlText(f)} · ${a}·x = ${zahlText(f * a)}·x`,
          ),
        ],
        fehlerbilder: fehlerbilderAus(richtig, [['vorzeichen-falsch', zz(-f * a)]]),
      };
    }
    // f·(a·x + b) = f·a·x + ☐
    const richtig = zz(f * b);
    return {
      platzhalter: {
        aufgabe: de(
          `${f}·(${summe([
            [a, 'x'],
            [b, ''],
          ])}) = ${summe([[f * a, 'x']])} + ☐`,
        ),
      },
      vorzeichen: true,
      loesung: richtig,
      loesungsweg: [
        de(`Auch das zweite Glied wird malgenommen: ${f} · ${k(b)} = ${zahlText(f * b)}`),
      ],
      fehlerbilder: fehlerbilderAus(richtig, [
        ['nur-erstes-glied', zz(b)],
        ['vorzeichen-falsch', zz(-f * b)],
      ]),
    };
  },
};

/** „Multipliziere aus: −2·(x − 4)“ – vier Ergebnisse zur Wahl */
export const ausmultiplizierenWahl: Generator<AusmultiplizierenParameter> = {
  id: 'tu.ausmultiplizieren-wahl',
  version: 1,
  platzhalter: ['term'],
  fehlerbildIds: ['nur-erstes-glied', 'vorzeichen-falsch'],

  erzeuge(seed, p) {
    const r = rng(seed);
    const f = p.erweitert ? pm(r, 9) : r.int(2, 9);
    if (Math.abs(f) === 1) return ausmultiplizierenWahl.erzeuge(seed + 1, p);
    const a = r.int(1, 6);
    const b = pm(r, 9);
    const term = `${zahlText(f)}·(${summe([
      [a, 'x'],
      [b, ''],
    ])})`;
    const richtig = summe([
      [f * a, 'x'],
      [f * b, ''],
    ]);
    const o = optionenAus(r, richtig, [
      [
        'nur-erstes-glied',
        summe([
          [f * a, 'x'],
          [b, ''],
        ]),
      ],
      [
        'vorzeichen-falsch',
        summe([
          [f * a, 'x'],
          [-f * b, ''],
        ]),
      ],
      [
        'vorzeichen-falsch',
        summe([
          [-f * a, 'x'],
          [f * b, ''],
        ]),
      ],
      [
        'nur-erstes-glied',
        summe([
          [a, 'x'],
          [f * b, ''],
        ]),
      ],
    ]);
    return {
      platzhalter: { term: de(term) },
      optionen: o.optionen.map(([, t]) => ({ text: de(t) })),
      loesung: o.richtig,
      loesungsweg: [
        de(`Jedes Glied mal ${k(f)}: ${k(f)} · ${a}·x und ${k(f)} · ${k(b)}`),
        de(richtig),
      ],
      fehlerbilder: fehlerbilderAus(o.richtig, [
        ['nur-erstes-glied', o.index('nur-erstes-glied')],
        ['vorzeichen-falsch', o.index('vorzeichen-falsch')],
      ]),
    };
  },
};

// ---------------------------------------------------------------------------
// Binomische Formeln (M.SF.TU.BINOMISCH.LUECKE, .AUSWAHL)

export interface BinomischParameter {
  /** auch (2·x − 3)² und (x + a)·(x − a) */
  readonly erweitert: boolean;
}

interface Binom {
  readonly term: string;
  /** Koeffizienten des Ergebnisses: x², x, Zahl */
  readonly q: number;
  readonly l: number;
  readonly c: number;
}

function binom(r: Rng, erweitert: boolean): Binom {
  const art = erweitert ? r.int(0, 2) : r.int(0, 1);
  const s = erweitert ? r.int(1, 3) : 1; // Faktor vor x
  const a = r.int(1, 9);
  const vx = s === 1 ? 'x' : `${s}·x`;
  if (art === 2) return { term: `(${vx} + ${a})·(${vx} − ${a})`, q: s * s, l: 0, c: -a * a };
  const plus = art === 0;
  return {
    term: `(${vx} ${plus ? '+' : '−'} ${a})²`,
    q: s * s,
    l: (plus ? 2 : -2) * s * a,
    c: a * a,
  };
}
const ergebnis = (q: number, l: number, c: number) =>
  summe([
    [q, 'x²'],
    [l, 'x'],
    [c, ''],
  ]);

/** „(x + 5)² = x² + ☐·x + 25“ */
export const binomischLuecke: Generator<BinomischParameter> = {
  id: 'tu.binomisch-luecke',
  version: 1,
  platzhalter: ['aufgabe'],
  fehlerbildIds: ['vorzeichen-falsch', 'nicht-verdoppelt', 'nicht-quadriert'],

  erzeuge(seed, p) {
    const r = rng(seed);
    const b = binom(r, p.erweitert);
    const fragMitte = b.l !== 0 && r.int(0, 1) === 0;
    const qText = b.q === 1 ? 'x²' : `${b.q}·x²`;
    if (fragMitte) {
      const richtig = zz(b.l);
      const rest = b.c < 0 ? `− ${-b.c}` : `+ ${b.c}`;
      return {
        platzhalter: { aufgabe: de(`${b.term} = ${qText} + ☐·x ${rest}`) },
        vorzeichen: true,
        loesung: richtig,
        loesungsweg: [
          de('Das Mittelglied ist 2 · erstes Glied · zweites Glied.'),
          de(`${b.term} = ${ergebnis(b.q, b.l, b.c)}`),
        ],
        fehlerbilder: fehlerbilderAus(richtig, [['nicht-verdoppelt', zz(b.l / 2)]]),
      };
    }
    const richtig = zz(b.c);
    const mitte = b.l === 0 ? '' : ` ${b.l < 0 ? '−' : '+'} ${Math.abs(b.l)}·x`;
    return {
      platzhalter: { aufgabe: de(`${b.term} = ${qText}${mitte} + ☐`) },
      vorzeichen: true,
      loesung: richtig,
      loesungsweg: [
        de('Das letzte Glied ist das Quadrat der Zahl – bei (a + b)·(a − b) mit Minus.'),
        de(`${b.term} = ${ergebnis(b.q, b.l, b.c)}`),
      ],
      fehlerbilder: fehlerbilderAus(richtig, [
        ['nicht-quadriert', zz(b.c < 0 ? -Math.sqrt(-b.c) * 2 : Math.sqrt(b.c) * 2)],
        ['vorzeichen-falsch', b.c < 0 ? zz(-b.c) : undefined],
      ]),
    };
  },
};

/** „Multipliziere aus: (x + 3)²“ – vier Ergebnisse zur Wahl */
export const binomischWahl: Generator<BinomischParameter> = {
  id: 'tu.binomisch-wahl',
  version: 1,
  platzhalter: ['term'],
  fehlerbildIds: [
    'ohne-mittelglied',
    'nicht-verdoppelt',
    'nicht-quadriert',
    'vorzeichen-falsch',
    'mittelglied-erfunden',
  ],

  erzeuge(seed, p) {
    const r = rng(seed);
    const b = binom(r, p.erweitert);
    const richtig = ergebnis(b.q, b.l, b.c);
    const wurzel = Math.sqrt(Math.abs(b.c));
    const s = Math.sqrt(b.q);
    const o = optionenAus(
      r,
      richtig,
      b.l === 0
        ? [
            // dritte binomische Formel
            ['vorzeichen-falsch', ergebnis(b.q, 0, -b.c)],
            ['nicht-quadriert', ergebnis(b.q, 0, -2 * wurzel)],
            ['mittelglied-erfunden', ergebnis(b.q, -2 * s * wurzel, b.c)],
          ]
        : [
            ['ohne-mittelglied', ergebnis(b.q, 0, b.c)],
            ['nicht-verdoppelt', ergebnis(b.q, b.l / 2, b.c)],
            ['nicht-quadriert', ergebnis(b.q, b.l, 2 * wurzel)],
            ['vorzeichen-falsch', ergebnis(b.q, b.l, -b.c)],
          ],
    );
    return {
      platzhalter: { term: de(b.term) },
      optionen: o.optionen.map(([, t]) => ({ text: de(t) })),
      loesung: o.richtig,
      loesungsweg: [
        de(
          b.l === 0
            ? 'Dritte binomische Formel: (a + b)·(a − b) = a² − b².'
            : b.l > 0
              ? 'Erste binomische Formel: (a + b)² = a² + 2·a·b + b².'
              : 'Zweite binomische Formel: (a − b)² = a² − 2·a·b + b².',
        ),
        de(`${b.term} = ${richtig}`),
      ],
      fehlerbilder: fehlerbilderAus(o.richtig, [
        ['ohne-mittelglied', o.index('ohne-mittelglied')],
        ['nicht-verdoppelt', o.index('nicht-verdoppelt')],
        ['nicht-quadriert', o.index('nicht-quadriert')],
        ['vorzeichen-falsch', o.index('vorzeichen-falsch')],
        ['mittelglied-erfunden', o.index('mittelglied-erfunden')],
      ]),
    };
  },
};

// ---------------------------------------------------------------------------
// Gleichungen mit Klammern (M.SF.TU.GLEICHUNGEN.LOESEN, .AUFLOESEN)

export interface GleichungKlammerParameter {
  /** Klammern auf beiden Seiten */
  readonly beidseitig: boolean;
}

interface KlammerGleichung {
  readonly text: string;
  readonly aufgeloest: string;
  readonly falschAufgeloest: string;
  readonly x: number;
  /** Lösung, wenn nur das erste Glied der Klammer malgenommen wird */
  readonly nurErstes?: number | undefined;
}

function klammerGleichung(r: Rng, beidseitig: boolean): KlammerGleichung {
  for (;;) {
    const x = pm(r, 9);
    const a = r.int(2, 6);
    const b = pm(r, 8);
    const c = r.int(1, 5) * (r.int(0, 1) === 0 ? 1 : -1);
    if (!beidseitig) {
      // a·(x + b) = c·x + d
      if (c === a) continue;
      const d = a * (x + b) - c * x;
      const nurErstesZaehler = d - b; // a·x + b = c·x + d
      const nurErstes =
        a - c !== 0 && nurErstesZaehler % (a - c) === 0 ? nurErstesZaehler / (a - c) : undefined;
      return {
        text: `${a}·(${summe([
          [1, 'x'],
          [b, ''],
        ])}) = ${summe([
          [c, 'x'],
          [d, ''],
        ])}`,
        aufgeloest: `${summe([
          [a, 'x'],
          [a * b, ''],
        ])} = ${summe([
          [c, 'x'],
          [d, ''],
        ])}`,
        falschAufgeloest: `${summe([
          [a, 'x'],
          [b, ''],
        ])} = ${summe([
          [c, 'x'],
          [d, ''],
        ])}`,
        x,
        nurErstes: nurErstes === x ? undefined : nurErstes,
      };
    }
    // a·(x + b) = c·(x + e) + d
    const e = pm(r, 6);
    if (c === a) continue;
    const d = a * (x + b) - c * (x + e);
    return {
      text: `${a}·(${summe([
        [1, 'x'],
        [b, ''],
      ])}) = ${k(c)}·(${summe([
        [1, 'x'],
        [e, ''],
      ])}) ${d < 0 ? '−' : '+'} ${Math.abs(d)}`,
      aufgeloest: `${summe([
        [a, 'x'],
        [a * b, ''],
      ])} = ${summe([
        [c, 'x'],
        [c * e + d, ''],
      ])}`,
      falschAufgeloest: `${summe([
        [a, 'x'],
        [a * b, ''],
      ])} = ${summe([
        [c, 'x'],
        [e + d, ''],
      ])}`,
      x,
    };
  }
}

/** „Löse: 3·(x + 2) = 2·x + 10“ */
export const gleichungKlammer: Generator<GleichungKlammerParameter> = {
  id: 'tu.gleichung-klammer',
  version: 1,
  platzhalter: ['gleichung'],
  fehlerbildIds: ['nur-erstes-glied', 'vorzeichen-falsch'],

  erzeuge(seed, p) {
    const r = rng(seed);
    const g = klammerGleichung(r, p.beidseitig);
    const richtig = zz(g.x);
    return {
      platzhalter: { gleichung: de(g.text) },
      vorzeichen: true,
      loesung: richtig,
      loesungsweg: [
        de(`Klammern auflösen: ${g.aufgeloest}`),
        de(`Dann x auf eine Seite, Zahlen auf die andere: x = ${zahlText(g.x)}`),
      ],
      fehlerbilder: fehlerbilderAus(richtig, [
        ['nur-erstes-glied', g.nurErstes === undefined ? undefined : zz(g.nurErstes)],
        ['vorzeichen-falsch', zz(-g.x)],
      ]),
    };
  },
};

/** „Welche Gleichung entsteht, wenn du die Klammern auflöst?“ */
export const klammerAufloesen: Generator<GleichungKlammerParameter> = {
  id: 'tu.klammer-aufloesen',
  version: 1,
  platzhalter: ['gleichung'],
  fehlerbildIds: ['nur-erstes-glied'],

  erzeuge(seed, p) {
    const r = rng(seed);
    const g = klammerGleichung(r, p.beidseitig);
    const andere = g.aufgeloest.replace(
      /= (−?)/,
      (_m, minus: string) => `= ${minus === '−' ? '' : '−'}`,
    );
    const o = optionenAus(r, g.aufgeloest, [
      ['nur-erstes-glied', g.falschAufgeloest],
      ['vorzeichen', andere],
      // Zahl der linken Klammer nicht mitgenommen, Vorzeichen gedreht
      [
        'vorzeichen',
        g.aufgeloest.replace(
          / ([+−]) (\d+) =/,
          (_m, z: string, n: string) => ` ${z === '+' ? '−' : '+'} ${n} =`,
        ),
      ],
    ]);
    return {
      platzhalter: { gleichung: de(g.text) },
      optionen: o.optionen.map(([, t]) => ({ text: de(t) })),
      loesung: o.richtig,
      loesungsweg: [
        de('Die Zahl vor der Klammer wird mit jedem Glied in der Klammer malgenommen.'),
        de(g.aufgeloest),
      ],
      fehlerbilder: fehlerbilderAus(o.richtig, [['nur-erstes-glied', o.index('nur-erstes-glied')]]),
    };
  },
};

// ---------------------------------------------------------------------------
// Ungleichungen (M.SF.TU.UNGLEICHUNGEN.LOESUNG, .GROESSTE)

export interface UngleichungParameter {
  /** auch negative Zahl vor x (Zeichen dreht sich um) */
  readonly negativ: boolean;
}

interface Ungleichung {
  readonly text: string;
  readonly grenze: number;
  /** true: x < grenze bzw. x ≤ grenze; false: x > grenze */
  readonly kleiner: boolean;
  readonly gleich: boolean;
  readonly gedreht: boolean;
}

function ungleichung(r: Rng, negativ: boolean): Ungleichung {
  const a = negativ && r.int(0, 1) === 0 ? -r.int(2, 6) : r.int(2, 6);
  const grenze = pm(r, 8);
  const b = pm(r, 12);
  const zeichen = r.pick(['<', '>', '≤', '≥'] as const);
  const c = a * grenze + b;
  const kleinerVorher = zeichen === '<' || zeichen === '≤';
  const kleiner = a > 0 ? kleinerVorher : !kleinerVorher;
  return {
    text: `${summe([
      [a, 'x'],
      [b, ''],
    ])} ${zeichen} ${zahlText(c)}`,
    grenze,
    kleiner,
    gleich: zeichen === '≤' || zeichen === '≥',
    gedreht: a < 0,
  };
}
const ungText = (kleiner: boolean, gleich: boolean, g: number) =>
  `x ${kleiner ? (gleich ? '≤' : '<') : gleich ? '≥' : '>'} ${zahlText(g)}`;

/** „Welche Zahlen x erfüllen 2·x + 3 < 11?“ – vier Lösungen zur Wahl */
export const ungleichungLoesung: Generator<UngleichungParameter> = {
  id: 'tu.ungleichung-loesung',
  version: 1,
  platzhalter: ['ungleichung'],
  fehlerbildIds: ['zeichen-nicht-gedreht', 'zeichen-verdreht', 'gleich-vergessen'],

  erzeuge(seed, p) {
    const r = rng(seed);
    const u = ungleichung(r, p.negativ);
    const richtig = ungText(u.kleiner, u.gleich, u.grenze);
    const o = optionenAus(r, richtig, [
      [
        u.gedreht ? 'zeichen-nicht-gedreht' : 'zeichen-verdreht',
        ungText(!u.kleiner, u.gleich, u.grenze),
      ],
      ['gleich-vergessen', ungText(u.kleiner, !u.gleich, u.grenze)],
      ['zeichen-verdreht', ungText(u.kleiner, u.gleich, -u.grenze)],
    ]);
    return {
      platzhalter: { ungleichung: de(u.text) },
      optionen: o.optionen.map(([, t]) => ({ text: de(t) })),
      loesung: o.richtig,
      loesungsweg: [
        de('Löse wie eine Gleichung.'),
        ...(u.gedreht
          ? [de('Beim Teilen durch eine negative Zahl dreht sich das Ungleichheitszeichen um.')]
          : []),
        de(richtig),
      ],
      fehlerbilder: fehlerbilderAus(o.richtig, [
        ['zeichen-nicht-gedreht', o.index('zeichen-nicht-gedreht')],
        ['zeichen-verdreht', o.index('zeichen-verdreht')],
        ['gleich-vergessen', o.index('gleich-vergessen')],
      ]),
    };
  },
};

/** „Gib die größte (kleinste) ganze Zahl an, die 3·x − 2 < 13 erfüllt.“ */
export const ungleichungRand: Generator<UngleichungParameter> = {
  id: 'tu.ungleichung-rand',
  version: 1,
  platzhalter: ['ungleichung', 'welche'],
  fehlerbildIds: ['grenze-selbst', 'zeichen-nicht-gedreht'],

  erzeuge(seed, p) {
    const r = rng(seed);
    const u = ungleichung(r, p.negativ);
    // größte ganze Zahl bei x < g bzw. x ≤ g; kleinste bei x > g bzw. x ≥ g
    const wert = u.kleiner
      ? u.gleich
        ? u.grenze
        : u.grenze - 1
      : u.gleich
        ? u.grenze
        : u.grenze + 1;
    const richtig: Loesung = zz(wert);
    const nichtGedreht = u.kleiner
      ? u.gleich
        ? u.grenze
        : u.grenze + 1
      : u.gleich
        ? u.grenze
        : u.grenze - 1;
    return {
      platzhalter: { ungleichung: de(u.text), welche: de(u.kleiner ? 'größte' : 'kleinste') },
      vorzeichen: true,
      loesung: richtig,
      loesungsweg: [
        de(`Lösung: ${ungText(u.kleiner, u.gleich, u.grenze)}`),
        de(`Die ${u.kleiner ? 'größte' : 'kleinste'} ganze Zahl ist ${zahlText(wert)}.`),
      ],
      fehlerbilder: fehlerbilderAus(richtig, [
        ['grenze-selbst', u.gleich ? undefined : zz(u.grenze)],
        ['zeichen-nicht-gedreht', u.gedreht ? zz(nichtGedreht) : undefined],
      ]),
    };
  },
};
