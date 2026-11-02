// Rationale und irrationale Zahlen, Zahlbereiche ℕ ⊂ ℤ ⊂ ℚ ⊂ ℝ – Klasse 9 (LEHRPLAN §8e,
// M.ZO.PW.REELL). Formeln in LaTeX-Schreibweise (KaTeX, T-22).
import type { Generator } from '../../../core/learning/generator';
import { rng, type Rng } from '../../../core/rng/rng';
import { auswahl, de, mische } from '../../hilfen';

interface Zahl {
  readonly tex: string;
  /** Text für den Lösungsweg */
  readonly text: string;
  readonly rational: boolean;
  /** Fehlerbild, wenn jemand falsch einordnet */
  readonly fehler: string;
  readonly warum: string;
}

const QUADRATE = [4, 9, 16, 25, 36, 49, 64, 81, 100, 121, 144];

function irgendeineZahl(r: Rng): Zahl {
  const art = r.int(0, 5);
  if (art === 0) {
    const q = r.pick(QUADRATE);
    return {
      tex: `\\sqrt{${q}}`,
      text: `√${q}`,
      rational: true,
      fehler: 'nach-aussehen',
      warum: `√${q} = ${Math.sqrt(q)} ist eine ganze Zahl, also rational – auch wenn ein Wurzelzeichen davorsteht.`,
    };
  }
  if (art === 1) {
    let n: number;
    do n = r.int(2, 99);
    while (QUADRATE.includes(n));
    return {
      tex: `\\sqrt{${n}}`,
      text: `√${n}`,
      rational: false,
      fehler: 'anzeige-endlich',
      warum: `${n} ist keine Quadratzahl. Dann ist √${n} irrational: Die Dezimalzahl endet nie und wird nie periodisch. Der Taschenrechner zeigt nur die ersten Stellen.`,
    };
  }
  if (art === 2) {
    const z = r.int(1, 8);
    return {
      tex: `0{,}\\overline{${z}}`,
      text: `0,${z}${z}${z}…`,
      rational: true,
      fehler: 'periodisch-irrational',
      warum: `Periodische Dezimalzahlen sind rational: 0,${z}${z}${z}… = ${z}/9.`,
    };
  }
  if (art === 3) {
    const k = r.int(2, 5);
    return {
      tex: `${k}\\pi`,
      text: `${k}π`,
      rational: false,
      fehler: 'anzeige-endlich',
      warum: `π ist irrational, und ${k} · π auch. 3,14 ist nur ein gerundeter Wert.`,
    };
  }
  if (art === 4) {
    const n = r.pick([3, 7, 9, 11, 13]);
    const z = r.int(1, n - 1);
    return {
      tex: `\\frac{${z}}{${n}}`,
      text: `${z}/${n}`,
      rational: true,
      fehler: 'nach-aussehen',
      warum: `Jeder Bruch aus ganzen Zahlen ist rational – auch wenn die Dezimalzahl lang ist.`,
    };
  }
  const n = r.pick([2, 3, 5, 6, 7]);
  return {
    tex: `-\\sqrt{${n}}`,
    text: `−√${n}`,
    rational: false,
    fehler: 'anzeige-endlich',
    warum: `√${n} ist irrational, also auch −√${n}. Das Minus ändert daran nichts.`,
  };
}

/** „Ist √20 rational oder irrational?“ */
export const pwRationalIrrational: Generator<Record<string, never>> = {
  id: 'pw.rational-irrational',
  version: 1,
  platzhalter: ['zahl'],
  fehlerbildIds: ['nach-aussehen', 'anzeige-endlich', 'periodisch-irrational'],

  erzeuge(seed) {
    const r = rng(seed);
    const z = irgendeineZahl(r);
    // feste Reihenfolge: rational, irrational
    const richtig = auswahl(z.rational ? 0 : 1);
    return {
      platzhalter: { zahl: de(z.tex) },
      optionen: [{ text: de('rational') }, { text: de('irrational') }],
      loesung: richtig,
      loesungsweg: [de(z.warum)],
      fehlerbilder: [{ id: z.fehler, antwort: auswahl(z.rational ? 1 : 0) }],
    };
  },
};

// ---------------------------------------------------------------------------
// Kleinster Zahlbereich (M.ZO.PW.REELL.BEREICH)

const BEREICHE = ['ℕ', 'ℤ', 'ℚ', 'ℝ'] as const;
const NAMEN = [
  'ℕ (natürliche Zahlen)',
  'ℤ (ganze Zahlen)',
  'ℚ (rationale Zahlen)',
  'ℝ (reelle Zahlen)',
] as const;

function bereichsZahl(r: Rng): { tex: string; text: string; bereich: number; warum: string } {
  const art = r.int(0, 5);
  if (art === 0) {
    const b = r.int(2, 9);
    return {
      tex: `-\\sqrt{${b * b}}`,
      text: `−√${b * b}`,
      bereich: 1,
      warum: `−√${b * b} = −${b}. Das ist eine negative ganze Zahl, also in ℤ, aber nicht in ℕ.`,
    };
  }
  if (art === 1) {
    const n = r.int(2, 6);
    const z = n * r.int(2, 6);
    return {
      tex: `\\frac{${z}}{${n}}`,
      text: `${z}/${n}`,
      bereich: 0,
      warum: `${z}/${n} = ${z / n}. Das ist eine natürliche Zahl, also schon in ℕ.`,
    };
  }
  if (art === 2) {
    const a = r.pick([1, 4, 9]);
    const b = r.pick([25, 49, 81, 121].filter((x) => x !== a));
    return {
      tex: `\\sqrt{\\frac{${a}}{${b}}}`,
      text: `√(${a}/${b})`,
      bereich: 2,
      warum: `√(${a}/${b}) = ${Math.sqrt(a)}/${Math.sqrt(b)}. Das ist ein Bruch, aber keine ganze Zahl, also in ℚ.`,
    };
  }
  if (art === 3) {
    let n: number;
    do n = r.int(2, 60);
    while (QUADRATE.includes(n));
    return {
      tex: `\\sqrt{${n}}`,
      text: `√${n}`,
      bereich: 3,
      warum: `${n} ist keine Quadratzahl, √${n} ist irrational und liegt nur in ℝ.`,
    };
  }
  if (art === 4) {
    const z = r.int(1, 9);
    return {
      tex: `-0{,}${z}`,
      text: `−0,${z}`,
      bereich: 2,
      warum: `−0,${z} = −${z}/10 ist ein Bruch mit Minus, also in ℚ, aber nicht in ℤ.`,
    };
  }
  const b = r.int(2, 9);
  return {
    tex: `\\sqrt{${b * b}} - ${b * b}`,
    text: `√${b * b} − ${b * b}`,
    bereich: 1,
    warum: `√${b * b} − ${b * b} = ${b} − ${b * b} = ${b - b * b}. Das ist eine negative ganze Zahl, also in ℤ.`,
  };
}

/** „Welcher ist der kleinste Zahlbereich, zu dem −√9 gehört?“ */
export const pwZahlbereich: Generator<Record<string, never>> = {
  id: 'pw.zahlbereich',
  version: 1,
  platzhalter: ['zahl'],
  fehlerbildIds: ['zu-gross', 'zu-klein'],

  erzeuge(seed) {
    const r = rng(seed);
    const z = bereichsZahl(r);
    const falsch = [0, 1, 2, 3].filter((i) => i !== z.bereich);
    // je Richtung das nächstliegende Fehlerbild (mehr braucht die Diagnose nicht)
    const groesser = falsch.find((i) => i > z.bereich);
    const kleiner = falsch.filter((i) => i < z.bereich).at(-1);
    return {
      platzhalter: { zahl: de(z.tex) },
      optionen: NAMEN.map((n) => ({ text: de(n) })),
      loesung: auswahl(z.bereich),
      loesungsweg: [de(z.warum), de(`Der kleinste Zahlbereich ist ${BEREICHE[z.bereich]}.`)],
      fehlerbilder: [
        ...(groesser !== undefined ? [{ id: 'zu-gross', antwort: auswahl(groesser) }] : []),
        ...(kleiner !== undefined ? [{ id: 'zu-klein', antwort: auswahl(kleiner) }] : []),
      ],
    };
  },
};

// ---------------------------------------------------------------------------
// Stimmt das immer? (M.ZO.PW.REELL.AUSSAGE, Niveau E)

/** Aussagen über rationale und irrationale Zahlen, mit Begründung zur Wahl */
export const pwReellAussage: Generator<Record<string, never>> = {
  id: 'pw.reell-aussage',
  version: 1,
  platzhalter: ['aussage'],
  fehlerbildIds: ['summe-immer', 'anzeige-endlich', 'naechste-zahl', 'bestaetigendes-beispiel'],

  erzeuge(seed) {
    const r = rng(seed);
    const art = r.int(0, 2);
    const n = r.pick([2, 3, 5, 7]);
    let aussage: string;
    let richtig: string;
    let falsch: [string, string][];
    let weg: string[];
    if (art === 0) {
      aussage = 'Die Summe zweier irrationaler Zahlen ist immer irrational.';
      richtig = `Stimmt nicht: $\\sqrt{${n}} + (-\\sqrt{${n}}) = 0$, und 0 ist rational.`;
      falsch = [
        ['summe-immer', 'Stimmt: Irrational plus irrational bleibt irrational.'],
        ['bestaetigendes-beispiel', `Stimmt nicht: $\\sqrt{${n}} + \\sqrt{${n}} = 2\\sqrt{${n}}$.`],
      ];
      weg = [
        `Gesucht ist ein Gegenbeispiel: zwei irrationale Zahlen mit rationaler Summe.`,
        `√${n} und −√${n} sind irrational, ihre Summe ist 0.`,
      ];
    } else if (art === 1) {
      let m: number;
      do m = r.int(2, 30);
      while (QUADRATE.includes(m));
      aussage = 'Ist die natürliche Zahl n keine Quadratzahl, dann ist √n irrational.';
      richtig = 'Stimmt.';
      falsch = [
        [
          'anzeige-endlich',
          `Stimmt nicht: Der Taschenrechner zeigt für $\\sqrt{${m}}$ nur endlich viele Stellen.`,
        ],
        ['bestaetigendes-beispiel', 'Stimmt nicht: $\\sqrt{16} = 4$.'],
      ];
      weg = [
        `Das ist ein bekannter Satz: Die Wurzel einer natürlichen Zahl ist entweder ganz oder irrational.`,
        `Der Taschenrechner rundet: √${m} hat unendlich viele Stellen ohne Periode.`,
      ];
    } else {
      const a = r.int(1, 8);
      aussage =
        'Zwischen zwei verschiedenen rationalen Zahlen liegt immer eine weitere rationale Zahl.';
      richtig = `Stimmt: Der Mittelwert liegt dazwischen, z. B. liegt $0{,}${a}5$ zwischen $0{,}${a}$ und $0{,}${a + 1}$.`;
      falsch = [
        ['naechste-zahl', `Stimmt nicht: Zwischen $0{,}${a}$ und $0{,}${a + 1}$ liegt keine Zahl.`],
        ['bestaetigendes-beispiel', 'Stimmt nicht: Zwischen 1 und 3 liegt nur die 2.'],
      ];
      weg = [
        'Nimm den Mittelwert der beiden Zahlen: Er liegt genau in der Mitte und ist wieder rational.',
        `Zum Beispiel (0,${a} + 0,${a + 1}) : 2 = 0,${a}5.`,
      ];
    }
    const liste = mische(r, [['richtig', richtig] as [string, string], ...falsch]);
    const index = (id: string) => auswahl(liste.findIndex(([x]) => x === id));
    return {
      platzhalter: { aussage: de(aussage) },
      optionen: liste.map(([, t]) => ({ text: de(t) })),
      loesung: index('richtig'),
      loesungsweg: weg.map(de),
      fehlerbilder: falsch.map(([id]) => ({ id, antwort: index(id) })),
    };
  },
};
