// Rechnen mit rationalen Zahlen – Klasse 7 (LEHRPLAN §8c, Feld RZ): addieren und
// subtrahieren, multiplizieren und dividieren, Vorzeichenregeln, Potenzen und
// Quadratwurzeln, Vorrangregeln und Rechenvorteile.
// Dezimalzahlen werden intern in Zehnteln (ganze Zahlen) gerechnet.
import { runde10 } from '../../../core/learning/format';
import type { Generator, Loesung } from '../../../core/learning/generator';
import { fehlerbilderAus } from '../../../core/learning/loesung';
import { zahlText } from '../../../core/learning/text';
import { rng, type Rng } from '../../../core/rng/rng';
import { auswahl, de, verlange, zahl } from '../../hilfen';

const ohneNull = (x: number) => (x === 0 ? 0 : x); // −0 vermeiden
/** Zahl aus Zehnteln bzw. Hundertsteln, ohne Rundungsrest */
const aus = (wert: number, nenner: number) => ohneNull(runde10(wert / nenner, 6));
const zz = (wert: number) => zahl(ohneNull(runde10(wert, 6)));
/** Zahl in einem Term: negative Zahlen nach einem Rechenzeichen in Klammern */
const k = (x: number) => (x < 0 ? `(${zahlText(x)})` : zahlText(x));

/** Ganze Zahl ≠ 0 in −max … max (auf dezimal in Zehnteln, ohne volle Zehner) */
function operand(r: Rng, max: number, dezimal: boolean, anteilNegativ = 0.5): number {
  const grenze = dezimal ? max * 10 : max;
  let b: number;
  do b = r.int(1, grenze);
  while (dezimal && b % 10 === 0);
  return r.int(1, 100) <= anteilNegativ * 100 ? -b : b;
}

// ---------------------------------------------------------------------------
// Addieren und Subtrahieren (M.ZO.RZ.ADD-SUB.TERM)

export interface PlusMinusParameter {
  readonly dezimal: boolean;
  readonly max: number; // 10 … 50
  readonly glieder: 2 | 3;
}

/** „Berechne 3 − (−9)“, „−2,5 + 4,1 − (−1,3)“ – mindestens eine negative Zahl */
export const plusMinus: Generator<PlusMinusParameter> = {
  id: 'rz.plus-minus',
  version: 1,
  platzhalter: ['term'],
  fehlerbildIds: ['minus-minus', 'plus-minus', 'vorzeichen-falsch'],

  erzeuge(seed, p) {
    verlange(p.max >= 10 && p.max <= 50, 'max: 10 … 50');
    verlange(p.glieder === 2 || p.glieder === 3, 'glieder: 2 oder 3');
    const r = rng(seed);
    const n = p.dezimal ? 10 : 1;
    let zahlen: number[];
    do zahlen = Array.from({ length: p.glieder }, () => operand(r, p.max, p.dezimal, 0.55));
    while (!zahlen.some((x) => x < 0));
    const zeichen = zahlen.slice(1).map(() => (r.int(0, 1) === 0 ? '+' : '−'));
    const term =
      zahlText(aus(zahlen[0] ?? 0, n)) +
      zeichen.map((z, i) => ` ${z} ${k(aus(zahlen[i + 1] ?? 0, n))}`).join('');
    // Ergebnis und typische Fehler: „− (−b)“ als „− b“, „+ (−b)“ als „+ b“
    const rechne = (minusMinus: boolean, plusMinus: boolean) =>
      zeichen.reduce((s, z, i) => {
        const b = zahlen[i + 1] ?? 0;
        if (z === '+') return s + (plusMinus && b < 0 ? -b : b);
        return s - (minusMinus && b < 0 ? -b : b);
      }, zahlen[0] ?? 0);
    const wert = rechne(false, false);
    const richtig = zz(wert / n);
    const kommtVor = (z: string) => zeichen.some((x, i) => x === z && (zahlen[i + 1] ?? 0) < 0);
    return {
      platzhalter: { term: de(term) },
      vorzeichen: true,
      loesung: richtig,
      loesungsweg: [
        de('Minus eine negative Zahl ist plus ihre Gegenzahl: 3 − (−9) = 3 + 9.'),
        de('Plus eine negative Zahl ist minus ihren Betrag: 3 + (−9) = 3 − 9.'),
        de(`${term} = ${zahlText(aus(wert, n))}`),
      ],
      fehlerbilder: fehlerbilderAus(richtig, [
        ['minus-minus', kommtVor('−') ? zz(rechne(true, false) / n) : undefined],
        ['plus-minus', kommtVor('+') ? zz(rechne(false, true) / n) : undefined],
        ['vorzeichen-falsch', wert !== 0 ? zz(-wert / n) : undefined],
      ]),
    };
  },
};

// ---------------------------------------------------------------------------
// Sachaufgaben: Veränderungen über die 0 hinweg (M.ZO.RZ.ADD-SUB.SACH)

export interface VeraenderungParameter {
  readonly dezimal: boolean;
}

interface Sache {
  readonly einheit: string;
  readonly max: number;
  readonly dezimal: boolean;
  readonly start: (x: string) => string;
  readonly hoch: string;
  readonly runter: string;
  readonly frage: string;
}

const SACHEN: readonly Sache[] = [
  {
    einheit: '°C',
    max: 15,
    dezimal: true,
    start: (x) => `Am Morgen zeigt das Thermometer ${x} °C.`,
    hoch: 'Bis zum Mittag steigt die Temperatur um',
    runter: 'Bis zum Abend sinkt die Temperatur um',
    frage: 'Wie viel Grad zeigt das Thermometer dann?',
  },
  {
    einheit: '€',
    max: 80,
    dezimal: false,
    start: (x) => `Lenas Kontostand ist ${x} €.`,
    hoch: 'Sie zahlt ein:',
    runter: 'Sie hebt ab:',
    frage: 'Wie hoch ist ihr Kontostand danach?',
  },
  {
    einheit: 'm',
    max: 30,
    dezimal: true,
    start: (x) => `Ein Taucher ist auf ${x} m (bezogen auf den Meeresspiegel).`,
    hoch: 'Er steigt auf um',
    runter: 'Er taucht tiefer um',
    frage: 'Auf wie viel Meter ist er jetzt?',
  },
];

/** „Am Morgen −3 °C, bis Mittag steigt sie um 7 Grad. Wie viel Grad …?“ */
export const veraenderung: Generator<VeraenderungParameter> = {
  id: 'rz.veraenderung',
  version: 1,
  platzhalter: ['geschichte'],
  fehlerbildIds: ['richtung-verwechselt', 'vorzeichen-falsch'],

  erzeuge(seed, p) {
    const r = rng(seed);
    const s = r.pick(SACHEN);
    const dezimal = p.dezimal && s.dezimal;
    const n = dezimal ? 10 : 1;
    const start = operand(r, s.max, dezimal, 0.6);
    const hoch = r.int(0, 1) === 0;
    // Die Veränderung führt meist über die 0 hinweg
    let menge: number;
    do menge = Math.abs(operand(r, s.max, dezimal));
    while (menge === Math.abs(start));
    const ende = hoch ? start + menge : start - menge;
    const einheitMenge = s.einheit === '°C' ? 'Grad' : s.einheit;
    const richtig = zz(ende / n);
    return {
      platzhalter: {
        geschichte: de(
          `${s.start(zahlText(aus(start, n)))} ${hoch ? s.hoch : s.runter} ` +
            `${zahlText(aus(menge, n))} ${einheitMenge}. ${s.frage}`,
        ),
      },
      vorzeichen: true,
      loesung: richtig,
      loesungsweg: [
        de(hoch ? 'Steigen, einzahlen, aufsteigen: plus.' : 'Sinken, abheben, tiefer: minus.'),
        de(
          `${zahlText(aus(start, n))} ${hoch ? '+' : '−'} ${zahlText(aus(menge, n))} = ${zahlText(aus(ende, n))}`,
        ),
      ],
      fehlerbilder: fehlerbilderAus(richtig, [
        ['richtung-verwechselt', zz((hoch ? start - menge : start + menge) / n)],
        ['vorzeichen-falsch', ende !== 0 ? zz(-ende / n) : undefined],
      ]),
    };
  },
};

// ---------------------------------------------------------------------------
// Multiplizieren und Dividieren (M.ZO.RZ.MULT-DIV.TERM)

export interface MalGeteiltParameter {
  /** G: der zweite Faktor bzw. Teiler ist eine natürliche Zahl (HS, LEHRPLAN §8c) */
  readonly zweiter_natuerlich: boolean;
  readonly dezimal: boolean;
  readonly max: number; // 5 … 15
}

/** „Berechne (−36) : 4“, „3,6 : (−1,2)“, „(−0,5) · (−8)“ */
export const malGeteilt: Generator<MalGeteiltParameter> = {
  id: 'rz.mal-geteilt',
  version: 1,
  platzhalter: ['term'],
  fehlerbildIds: ['vorzeichen-falsch', 'komma-falsch'],

  erzeuge(seed, p) {
    verlange(p.max >= 5 && p.max <= 15, 'max: 5 … 15');
    const r = rng(seed);
    const mal = r.int(0, 1) === 0;
    // a und b als ganze Zahlen; bei dezimal ist genau eine von ihnen in Zehnteln
    let a = operand(r, p.max, false, 0.6);
    let b = r.int(2, p.max);
    if (p.zweiter_natuerlich)
      a = -Math.abs(a); // ganze Zahl mal/durch natürliche Zahl
    else if (a > 0 || r.int(0, 1) === 0) b = -b; // immer mindestens eine negative Zahl
    const zehntel = p.dezimal ? r.int(0, 1) : -1; // 0: a in Zehnteln, 1: b in Zehnteln
    const wa = zehntel === 0 ? a / 10 : a;
    const wb = zehntel === 1 ? b / 10 : b;
    let term: string;
    let wert: number;
    if (mal) {
      wert = wa * wb;
      term = `${zahlText(aus(wa * 10, 10))} · ${k(aus(wb * 10, 10))}`;
    } else {
      // Dividend = Ergebnis · Teiler, damit es aufgeht: (wa · wb) : wb = wa
      wert = wa;
      term = `${zahlText(aus(Math.round(wa * wb * 100), 100))} : ${k(aus(wb * 10, 10))}`;
    }
    const richtig = zz(wert);
    const betrag = Math.abs(wert);
    return {
      platzhalter: { term: de(term) },
      vorzeichen: true,
      loesung: richtig,
      loesungsweg: [
        de('Gleiche Vorzeichen ergeben plus, verschiedene Vorzeichen ergeben minus.'),
        de(`Ohne Vorzeichen gerechnet: ${zahlText(runde10(betrag, 6))}`),
        de(`${term} = ${zahlText(runde10(wert, 6))}`),
      ],
      fehlerbilder: fehlerbilderAus(richtig, [
        ['vorzeichen-falsch', zz(-wert)],
        ['komma-falsch', p.dezimal ? zz(mal ? wert * 10 : wert / 10) : undefined],
      ]),
    };
  },
};

// ---------------------------------------------------------------------------
// Vorzeichen eines Produkts (M.ZO.RZ.MULT-DIV.VORZEICHEN)

export interface VorzeichenParameter {
  readonly faktoren_min: number; // 3 … 6
  readonly faktoren_max: number; // 3 … 6
  /** auch Divisionen und manchmal ein Faktor 0 */
  readonly gemischt: boolean;
}

/** „Welches Vorzeichen hat (−17) · 23 · (−4) · (−9)?“ */
export const vorzeichenRegel: Generator<VorzeichenParameter> = {
  id: 'rz.vorzeichen',
  version: 1,
  platzhalter: ['term'],
  fehlerbildIds: ['minus-falsch-gezaehlt', 'null-uebersehen'],

  erzeuge(seed, p) {
    verlange(
      p.faktoren_min >= 3 && p.faktoren_min <= p.faktoren_max && p.faktoren_max <= 6,
      'faktoren: 3 … 6',
    );
    const r = rng(seed);
    const anzahl = r.int(p.faktoren_min, p.faktoren_max);
    const zahlen = Array.from({ length: anzahl }, () => operand(r, 30, false, 0.5));
    if (!zahlen.some((x) => x < 0)) zahlen[r.int(0, anzahl - 1)] = -r.int(2, 30);
    const mitNull = p.gemischt && r.int(0, 4) === 0;
    if (mitNull) zahlen[r.int(1, anzahl - 1)] = 0;
    const zeichen = zahlen.slice(1).map(() => (p.gemischt && r.int(0, 2) === 0 ? ':' : '·'));
    // Nie durch 0 teilen
    zeichen.forEach((z, i) => {
      if (z === ':' && zahlen[i + 1] === 0) zeichen[i] = '·';
    });
    const term =
      zahlText(zahlen[0] ?? 0) + zeichen.map((z, i) => ` ${z} ${k(zahlen[i + 1] ?? 0)}`).join('');
    const minus = zahlen.filter((x) => x < 0).length;
    const nachMinus = minus % 2 === 0 ? 0 : 1;
    const richtig = auswahl(mitNull ? 2 : nachMinus);
    return {
      platzhalter: { term: de(term) },
      optionen: [
        { text: de('positiv') },
        { text: de('negativ') },
        ...(p.gemischt ? [{ text: de('weder noch – das Ergebnis ist 0') }] : []),
      ],
      loesung: richtig,
      loesungsweg: mitNull
        ? [de('Ein Faktor ist 0 – dann ist das ganze Produkt 0.')]
        : [
            de(`Zähle die negativen Zahlen: Es sind ${minus}.`),
            de(
              minus % 2 === 0
                ? 'Eine gerade Anzahl Minuszeichen ergibt plus: Das Ergebnis ist positiv.'
                : 'Eine ungerade Anzahl Minuszeichen ergibt minus: Das Ergebnis ist negativ.',
            ),
          ],
      fehlerbilder: fehlerbilderAus(richtig, [
        ['null-uebersehen', mitNull ? auswahl(nachMinus) : undefined],
        ['minus-falsch-gezaehlt', mitNull ? undefined : auswahl(1 - nachMinus)],
      ]),
    };
  },
};

// ---------------------------------------------------------------------------
// Potenzen (M.ZO.RZ.POTENZEN.POTENZ)

export interface PotenzParameter {
  readonly dezimal: boolean;
  /** auch −a² ohne Klammer */
  readonly ohne_klammer: boolean;
}

const HOCH = { 2: '²', 3: '³' } as const;

/** „Berechne (−3)²“, „−4²“, „(−0,2)³“ */
export const potenz: Generator<PotenzParameter> = {
  id: 'rz.potenz',
  version: 1,
  platzhalter: ['term'],
  fehlerbildIds: ['klammer-uebersehen', 'vorzeichen-falsch', 'mal-hochzahl', 'komma-falsch'],

  erzeuge(seed, p) {
    const r = rng(seed);
    const n = r.int(0, 2) === 0 ? 3 : 2;
    const dez = p.dezimal && r.int(0, 1) === 0;
    // Basis als Betrag in ganzen Zahlen bzw. Zehnteln
    const betrag = dez ? r.int(1, n === 2 ? 12 : 5) : r.int(2, n === 2 ? 15 : 6);
    if (dez && betrag % 10 === 0) return potenz.erzeuge(seed + 1, p);
    const basis = dez ? betrag / 10 : betrag;
    const ohne = p.ohne_klammer && r.int(0, 2) === 0; // −a^n = −(a^n)
    const hoch = HOCH[n];
    const bText = zahlText(runde10(basis, 6));
    const term = ohne ? `−${bText}${hoch}` : `(−${bText})${hoch}`;
    const wert = ohne ? -(basis ** n) : (-basis) ** n;
    const richtig = zz(wert);
    // Der andere Fall (mit statt ohne Klammer und umgekehrt)
    const anders = ohne ? (-basis) ** n : -(basis ** n);
    return {
      platzhalter: { term: de(term) },
      vorzeichen: true,
      loesung: richtig,
      loesungsweg: [
        ohne
          ? de(
              `Ohne Klammer gehört die Hochzahl nur zu ${bText}: −${bText}${hoch} = −(${bText}${hoch}).`,
            )
          : de(`Mit Klammer wird die negative Zahl ${n}-mal mit sich selbst multipliziert.`),
        de(
          `${term} = ${ohne ? '−' : ''}${Array.from({ length: n }, () => (ohne ? bText : `(−${bText})`)).join(' · ')} = ${zahlText(runde10(wert, 6))}`,
        ),
      ],
      fehlerbilder: fehlerbilderAus(richtig, [
        ['klammer-uebersehen', anders !== wert ? zz(anders) : undefined],
        ['vorzeichen-falsch', zz(-wert)],
        ['mal-hochzahl', zz((ohne ? -basis : -basis) * n)],
        ['komma-falsch', dez ? zz(wert * 10) : undefined],
      ]),
    };
  },
};

// ---------------------------------------------------------------------------
// Quadratwurzeln (M.ZO.RZ.POTENZEN.WURZEL)

export interface WurzelParameter {
  /** Radikand auch als Dezimalzahl (0,49; 1,44) */
  readonly dezimal: boolean;
}

/** „Berechne √0,49“ – die Wurzel geht immer auf */
export const wurzel: Generator<WurzelParameter> = {
  id: 'rz.wurzel',
  version: 1,
  platzhalter: ['radikand'],
  fehlerbildIds: ['halbiert', 'komma-falsch'],

  erzeuge(seed, p) {
    const r = rng(seed);
    const dez = p.dezimal && r.int(0, 3) !== 0;
    // Ergebnis in Zehnteln (dezimal) bzw. ganz
    let w: number;
    do w = dez ? r.int(1, 20) : r.int(2, 20);
    while (dez && w % 10 === 0);
    const ergebnis = dez ? w / 10 : w;
    const radikand = runde10(ergebnis * ergebnis, 6);
    const richtig = zz(ergebnis);
    return {
      platzhalter: { radikand },
      loesung: richtig,
      loesungsweg: [
        de(`Gesucht ist die Zahl, die mit sich selbst multipliziert ${zahlText(radikand)} ergibt.`),
        de(
          `${zahlText(ergebnis)} · ${zahlText(ergebnis)} = ${zahlText(radikand)}, also ist √${zahlText(radikand)} = ${zahlText(ergebnis)}.`,
        ),
        ...(dez
          ? [de('Das Ergebnis hat halb so viele Nachkommastellen wie die Zahl unter der Wurzel.')]
          : []),
      ],
      fehlerbilder: fehlerbilderAus(richtig, [
        ['halbiert', zz(radikand / 2)],
        ['komma-falsch', dez ? zz(ergebnis / 10) : undefined],
      ]),
    };
  },
};

// ---------------------------------------------------------------------------
// Vorrangregeln (M.ZO.RZ.RECHENGESETZE.TERM)

export interface TermParameter {
  readonly dezimal: boolean;
  readonly klammern: boolean;
}

/** „Berechne (−3) · 4 + 12 : (−2)“, „(−5 + 2) · (−4)“ */
export const rzTerm: Generator<TermParameter> = {
  id: 'rz.term',
  version: 1,
  platzhalter: ['term'],
  fehlerbildIds: ['links-nach-rechts', 'klammer-uebersehen', 'vorzeichen-falsch'],

  erzeuge(seed, p) {
    const r = rng(seed);
    const arten = p.klammern
      ? ['plus-mal', 'mal-plus-geteilt', 'klammer']
      : ['plus-mal', 'mal-plus-geteilt'];
    const art = r.pick(arten);
    const n = p.dezimal ? 10 : 1;
    const a = operand(r, p.dezimal ? 5 : 20, p.dezimal, 0.6); // ggf. Zehntel
    const b = operand(r, 9, false, 0.5);
    const c = operand(r, 9, false, 0.6);
    let term: string;
    let wert: number; // in Zehnteln bzw. ganz
    let falsch: [string, number | undefined][];
    const A = zahlText(aus(a, n));
    if (art === 'plus-mal') {
      // a + b · c
      term = `${A} + ${k(b)} · ${k(c)}`;
      wert = a + b * c * n;
      falsch = [['links-nach-rechts', (a + b * n) * c]];
    } else if (art === 'mal-plus-geteilt') {
      // b · c − (d · e) : e   mit glattem Quotienten
      const d = operand(r, 9, false, 0.5);
      const e = r.int(2, 6) * (r.int(0, 1) === 0 ? 1 : -1);
      const dividend = d * e;
      term = `${k(b)} · ${k(c)} − ${k(dividend)} : ${k(e)}`;
      wert = (b * c - d) * n;
      falsch = [
        [
          'links-nach-rechts',
          Number.isInteger((b * c - dividend) / e) ? ((b * c - dividend) / e) * n : undefined,
        ],
      ];
    } else {
      // (a + b) · c
      term = `(${A} + ${k(b)}) · ${k(c)}`;
      wert = (a + b * n) * c;
      falsch = [['klammer-uebersehen', a + b * c * n]];
    }
    const richtig = zz(wert / n);
    return {
      platzhalter: { term: de(term) },
      vorzeichen: true,
      loesung: richtig,
      loesungsweg: [
        de('Zuerst die Klammern, dann Punktrechnung (· und :), dann Strichrechnung (+ und −).'),
        de('Achte bei jedem Schritt auf die Vorzeichen.'),
        de(`${term} = ${zahlText(aus(wert, n))}`),
      ],
      fehlerbilder: fehlerbilderAus(richtig, [
        ...falsch.map(([id, w]): [string, Loesung | undefined] => [
          id,
          w === undefined ? undefined : zz(w / n),
        ]),
        ['vorzeichen-falsch', wert !== 0 ? zz(-wert / n) : undefined],
      ]),
    };
  },
};

// ---------------------------------------------------------------------------
// Rechenvorteile (M.ZO.RZ.RECHENGESETZE.GESCHICKT)

export interface GeschicktParameter {
  readonly dezimal: boolean;
}

/** „Berechne geschickt: (−25) · 7 · 4“, „−3,7 + 5,2 + 3,7“, „(−6) · 13 + (−6) · 7“ */
export const geschickt: Generator<GeschicktParameter> = {
  id: 'rz.geschickt',
  version: 1,
  platzhalter: ['term'],
  fehlerbildIds: ['vorzeichen-falsch', 'gegenzahl-uebersehen'],

  erzeuge(seed, p) {
    const r = rng(seed);
    const art = r.pick(['gegenzahlen', 'mal-hundert', 'verteilen'] as const);
    const n = p.dezimal ? 10 : 1;
    let term: string;
    let wert: number; // in Zehnteln bzw. ganz
    let weg: string;
    let gegenzahlFehler: number | undefined;
    if (art === 'gegenzahlen') {
      // −a + b + a  (die Gegenzahlen heben sich auf)
      const a = Math.abs(operand(r, 20, p.dezimal));
      let b = operand(r, 20, p.dezimal);
      if (Math.abs(b) === a) b = b > 0 ? b + 1 : b - 1;
      const A = zahlText(aus(a, n));
      term = `−${A} + ${k(aus(b, n))} + ${A}`;
      wert = b;
      weg = `−${A} und ${A} sind Gegenzahlen, zusammen 0. Übrig bleibt ${zahlText(aus(b, n))}.`;
      gegenzahlFehler = b - 2 * a;
    } else if (art === 'mal-hundert') {
      // (−25) · x · 4  bzw. 4 · x · (−25)
      const [f1, f2] = r.pick([
        [25, 4],
        [50, 2],
        [20, 5],
        [125, 8],
      ] as const);
      const x = r.int(3, 19);
      const negativ = r.int(0, 1) === 0 ? -1 : 1;
      const xs = negativ * (r.int(0, 1) === 0 ? 1 : -1);
      term = `${k(-f1)} · ${k(xs * x)} · ${f2}`;
      wert = -f1 * xs * x * f2 * n;
      weg = `Vertauschen: ${k(-f1)} · ${f2} = ${zahlText(-f1 * f2)}, dann · ${k(xs * x)}.`;
    } else {
      // (−a) · b + (−a) · c = (−a) · (b + c)  mit b + c = 10, 20 …
      const a = r.int(2, 9);
      const summe = r.int(1, 3) * 10;
      const b = r.int(1, summe - 1);
      const c = summe - b;
      term = `(−${a}) · ${b} + (−${a}) · ${c}`;
      wert = -a * summe * n;
      weg = `Verteilungsgesetz: (−${a}) · (${b} + ${c}) = (−${a}) · ${summe}.`;
    }
    const richtig = zz(wert / n);
    return {
      platzhalter: { term: de(term) },
      vorzeichen: true,
      loesung: richtig,
      loesungsweg: [de(weg), de(`${term} = ${zahlText(aus(wert, n))}`)],
      fehlerbilder: fehlerbilderAus(richtig, [
        ['vorzeichen-falsch', wert !== 0 ? zz(-wert / n) : undefined],
        [
          'gegenzahl-uebersehen',
          gegenzahlFehler === undefined ? undefined : zz(gegenzahlFehler / n),
        ],
      ]),
    };
  },
};
