// Rechnen mit gebrochenen Zahlen – Klasse 6 (LEHRPLAN §8b, Feld BR):
// gemeinsamer Nenner, Grundrechenarten mit Brüchen, Dezimalzahlen mal und
// geteilt, Brüche in Dezimalzahlen (auch periodisch). Rein und deterministisch.
import { bruch, ggT, istGekuerzt, wertgleich, type Bruch } from '../../../core/learning/bruch';
import { dezimalDeutsch, zahlDeutsch } from '../../../core/learning/format';
import type { Fehlerbild, Generator, Loesung, Option } from '../../../core/learning/generator';
import { fehlerbilderAus } from '../../../core/learning/loesung';
import { rng, type Rng } from '../../../core/rng/rng';
import { auswahl, de, mische, variante, verlange, zahl } from '../../hilfen';

export const kgV = (a: number, b: number) => (a / ggT(a, b)) * b;

/** Vollständig gekürzt. */
export function gekuerzt(b: Bruch): Bruch {
  const t = ggT(b.zaehler, b.nenner) || 1;
  return bruch(b.zaehler / t, b.nenner / t);
}

const text = (b: Bruch) => `${zahlDeutsch(b.zaehler)}/${zahlDeutsch(b.nenner)}`;
const alsLoesung = (b: Bruch): Loesung => ({ typ: 'bruch', wert: b });

/** Fehlerbilder für Brüche: auch wertgleiche Antworten weglassen – die zählen ohnehin als richtig. */
function bruchFehlerbilder(
  richtig: Bruch,
  kandidaten: readonly (readonly [string, Bruch | undefined])[],
): Fehlerbild[] {
  const gesehen: Bruch[] = [richtig];
  const ergebnis: [string, Loesung | undefined][] = [];
  for (const [id, b] of kandidaten) {
    if (!b || b.zaehler < 0 || gesehen.some((g) => wertgleich(g, b))) continue;
    gesehen.push(b);
    ergebnis.push([id, alsLoesung(b)]);
  }
  return fehlerbilderAus(alsLoesung(richtig), ergebnis);
}

/** Zufälliger echter, gekürzter Bruch mit Nenner aus der Liste. */
function echterBruch(r: Rng, nenner: readonly number[]): Bruch {
  const n = r.pick(nenner);
  const zaehler: number[] = [];
  for (let z = 1; z < n; z++) if (ggT(z, n) === 1) zaehler.push(z);
  return bruch(r.pick(zaehler), n);
}

const bis = (a: number, b: number) => Array.from({ length: b - a + 1 }, (_, i) => a + i);

// ---------------------------------------------------------------------------
// Gemeinsamer Nenner: kgV und ggT (M.ZO.TB.GGT-KGV)

export interface KgvParameter {
  readonly zahl_max: number; // 6 … 60
  /** true: größter gemeinsamer Teiler statt kleinstes gemeinsames Vielfaches */
  readonly ggt: boolean;
}

/** „Gib das kleinste gemeinsame Vielfache von 6 und 8 an.“ – Vorlagen M.ZO.TB.GGT-KGV.* */
const kgvGgt: Generator<KgvParameter> = {
  id: 'tb.kgv-ggt',
  version: 1,
  platzhalter: ['a', 'b'],
  fehlerbildIds: ['produkt', 'ggt-statt-kgv', 'kgv-statt-ggt', 'groessere-zahl', 'eins'],

  erzeuge(seed, p) {
    verlange(p.zahl_max >= 6 && p.zahl_max <= 60, 'zahl_max: 6 … 60');
    const r = rng(seed);
    let a: number;
    let b: number;
    // Zahlen mit gemeinsamem Teiler > 1 bevorzugen – sonst ist die Aufgabe trivial
    do {
      a = r.int(2, p.zahl_max);
      b = r.int(2, p.zahl_max);
    } while (a === b || ggT(a, b) === 1 || a % b === 0 || b % a === 0);
    const g = ggT(a, b);
    const v = kgV(a, b);
    const vielfache = (x: number) =>
      Array.from({ length: Math.min(6, v / x) }, (_, i) => zahlDeutsch(x * (i + 1))).join(', ');
    const teiler = (x: number) =>
      bis(1, x)
        .filter((t) => x % t === 0)
        .join(', ');
    if (p.ggt) {
      return {
        platzhalter: { a, b },
        loesung: zahl(g),
        loesungsweg: [
          de(`Teiler von ${a}: ${teiler(a)}`),
          de(`Teiler von ${b}: ${teiler(b)}`),
          de(`Der größte gemeinsame Teiler ist ${g}.`),
        ],
        fehlerbilder: fehlerbilderAus(zahl(g), [
          ['kgv-statt-ggt', zahl(v)],
          ['eins', zahl(1)],
        ]),
      };
    }
    return {
      platzhalter: { a, b },
      loesung: zahl(v),
      loesungsweg: [
        de(`Vielfache von ${Math.max(a, b)}: ${vielfache(Math.max(a, b))} …`),
        de(`Das erste davon, das auch durch ${Math.min(a, b)} teilbar ist: ${zahlDeutsch(v)}`),
      ],
      fehlerbilder: fehlerbilderAus(zahl(v), [
        ['produkt', zahl(a * b)],
        ['ggt-statt-kgv', zahl(g)],
        ['groessere-zahl', zahl(Math.max(a, b))],
      ]),
    };
  },
};

// ---------------------------------------------------------------------------
// Brüche addieren und subtrahieren (M.ZO.BR.ADD-SUB)

export interface BruchAddSubParameter {
  /** gleichnamig · vielfaches (ein Nenner Vielfaches des anderen) · beliebig */
  readonly art: 'gleichnamig' | 'vielfaches' | 'beliebig';
  readonly nenner_max: number; // 4 … 20
  /** auch unechte Brüche als Summanden */
  readonly unecht: boolean;
}

/** „Berechne 3/4 + 5/6.“ – Vorlagen M.ZO.BR.ADD-SUB.* */
export const bruchAddSub: Generator<BruchAddSubParameter> = {
  id: 'br.add-sub',
  version: 1,
  platzhalter: ['a', 'zeichen', 'b'],
  fehlerbildIds: ['nenner-addiert', 'nicht-erweitert'],

  erzeuge(seed, p) {
    verlange(p.nenner_max >= 4 && p.nenner_max <= 20, 'nenner_max: 4 … 20');
    const r = rng(seed);
    const plus = r.int(0, 1) === 0;
    let a: Bruch;
    let b: Bruch;
    for (;;) {
      const n1 = r.int(2, p.nenner_max);
      let n2: number;
      if (p.art === 'gleichnamig') n2 = n1;
      else if (p.art === 'vielfaches') {
        const k = r.int(2, Math.max(2, Math.floor(p.nenner_max / n1)));
        n2 = n1 * k;
        if (n2 > p.nenner_max * 2) continue;
      } else n2 = r.int(2, p.nenner_max);
      if (p.art !== 'gleichnamig' && n1 === n2) continue;
      const zmax1 = p.unecht ? 2 * n1 : n1 - 1;
      const zmax2 = p.unecht ? 2 * n2 : n2 - 1;
      a = bruch(r.int(1, zmax1), n1);
      b = bruch(r.int(1, zmax2), n2);
      if (!istGekuerzt(a) || !istGekuerzt(b) || a.zaehler % a.nenner === 0) continue;
      if (!plus && a.zaehler * b.nenner <= b.zaehler * a.nenner) [a, b] = [b, a];
      if (!plus && wertgleich(a, b)) continue;
      break;
    }
    if (r.int(0, 1) === 0 && plus) [a, b] = [b, a];
    const hn = kgV(a.nenner, b.nenner);
    const za = a.zaehler * (hn / a.nenner);
    const zb = b.zaehler * (hn / b.nenner);
    const roh = bruch(plus ? za + zb : za - zb, hn);
    const richtig = gekuerzt(roh);
    const op = (x: number, y: number) => (plus ? x + y : x - y);
    const zeichen = plus ? '+' : '−';
    return {
      platzhalter: { a, zeichen: de(zeichen), b },
      loesung: alsLoesung(richtig),
      loesungsweg: [
        ...(a.nenner === b.nenner
          ? [de(`Gleiche Nenner: Rechne nur mit den Zählern.`)]
          : [
              de(`Gemeinsamer Nenner: ${hn}`),
              de(`${text(a)} = ${za}/${hn} und ${text(b)} = ${zb}/${hn}`),
            ]),
        de(`${za}/${hn} ${zeichen} ${zb}/${hn} = ${roh.zaehler}/${hn}`),
        ...(roh.zaehler !== richtig.zaehler ? [de(`Gekürzt: ${text(richtig)}`)] : []),
      ],
      fehlerbilder: bruchFehlerbilder(richtig, [
        [
          'nenner-addiert',
          plus || a.nenner !== b.nenner
            ? (() => {
                const n = op(a.nenner, b.nenner);
                const z = op(a.zaehler, b.zaehler);
                return n > 0 && z >= 0 ? bruch(z, n) : undefined;
              })()
            : undefined,
        ],
        [
          'nicht-erweitert',
          a.nenner !== b.nenner && op(a.zaehler, b.zaehler) >= 0
            ? bruch(op(a.zaehler, b.zaehler), hn)
            : undefined,
        ],
      ]),
    };
  },
};

// ---------------------------------------------------------------------------
// Brüche multiplizieren (M.ZO.BR.MULT) und dividieren (M.ZO.BR.DIV)

export interface BruchMalGeteiltParameter {
  readonly rechnung: 'mal' | 'durch';
  /** zweiter Faktor bzw. Divisor: natürliche Zahl oder Bruch */
  readonly mit: 'zahl' | 'bruch';
  readonly nenner_max: number; // 4 … 15
  readonly zahl_max: number; // 2 … 12
}

/** „Berechne 2/3 · 9/10.“ oder „Berechne 3/4 : 5.“ – Vorlagen M.ZO.BR.MULT.*, M.ZO.BR.DIV.* */
const bruchMalGeteilt: Generator<BruchMalGeteiltParameter> = {
  id: 'br.mal-geteilt',
  version: 1,
  platzhalter: ['a', 'zeichen', 'b'],
  fehlerbildIds: [
    'nenner-mal-zahl',
    'beide-mal-zahl',
    'nenner-addiert',
    'kein-kehrwert',
    'kehrwert-erster',
    'mal-statt-durch',
  ],

  erzeuge(seed, p) {
    verlange(p.nenner_max >= 4 && p.nenner_max <= 15, 'nenner_max: 4 … 15');
    verlange(p.zahl_max >= 2 && p.zahl_max <= 12, 'zahl_max: 2 … 12');
    const r = rng(seed);
    const a = echterBruch(r, bis(2, p.nenner_max));
    const b: Bruch | number =
      p.mit === 'zahl' ? r.int(2, p.zahl_max) : echterBruch(r, bis(2, p.nenner_max));
    const bb: Bruch = typeof b === 'number' ? bruch(b, 1) : b;
    const mal = p.rechnung === 'mal';
    const faktor = mal ? bb : bruch(bb.nenner, bb.zaehler); // Kehrwert beim Teilen
    const roh = bruch(a.zaehler * faktor.zaehler, a.nenner * faktor.nenner);
    const richtig = gekuerzt(roh);
    const kandidaten: [string, Bruch | undefined][] = mal
      ? typeof b === 'number'
        ? [
            ['nenner-mal-zahl', bruch(a.zaehler, a.nenner * b)],
            ['beide-mal-zahl', bruch(a.zaehler * b, a.nenner * b)],
          ]
        : [['nenner-addiert', bruch(a.zaehler * b.zaehler, a.nenner + b.nenner)]]
      : typeof b === 'number'
        ? [
            ['mal-statt-durch', bruch(a.zaehler * b, a.nenner)],
            ['beide-mal-zahl', bruch(a.zaehler * b, a.nenner * b)],
          ]
        : [
            ['kein-kehrwert', bruch(a.zaehler * bb.zaehler, a.nenner * bb.nenner)],
            ['kehrwert-erster', bruch(a.nenner * bb.zaehler, a.zaehler * bb.nenner)],
          ];
    const bText = typeof b === 'number' ? String(b) : text(b);
    return {
      platzhalter: { a, zeichen: de(mal ? '·' : ':'), b },
      loesung: alsLoesung(richtig),
      loesungsweg: [
        ...(mal
          ? []
          : [
              de(
                `Teilen heißt: mit dem Kehrwert malnehmen. Kehrwert von ${bText}: ${text(faktor)}`,
              ),
            ]),
        de(
          typeof b === 'number' && mal
            ? `Nur den Zähler mit ${b} malnehmen: ${a.zaehler} · ${b} = ${roh.zaehler}`
            : `Zähler mal Zähler, Nenner mal Nenner: (${a.zaehler} · ${faktor.zaehler})/(${a.nenner} · ${faktor.nenner}) = ${text(roh)}`,
        ),
        ...(roh.zaehler !== richtig.zaehler ? [de(`Gekürzt: ${text(richtig)}`)] : []),
      ],
      fehlerbilder: bruchFehlerbilder(richtig, kandidaten),
    };
  },
};

// ---------------------------------------------------------------------------
// Dezimalzahlen mal und geteilt (M.ZO.BR.DEZ-MULT-DIV)

export interface DezMalGeteiltParameter {
  readonly rechnung: 'mal' | 'durch';
  /** Nachkommastellen der beiden Zahlen (je 1 oder 2) */
  readonly stellen: number;
  /** größte Ziffernfolge ohne Komma */
  readonly ziffern_max: number; // 9 … 999
}

const zehn = (k: number) => 10 ** k;

/** „Berechne 0,6 · 0,12.“ oder „Berechne 3,6 : 0,4.“ – Vorlagen M.ZO.BR.DEZ-MULT-DIV.* */
const dezMalGeteilt: Generator<DezMalGeteiltParameter> = {
  id: 'br.dez-mal-geteilt',
  version: 1,
  platzhalter: ['a', 'zeichen', 'b'],
  fehlerbildIds: ['komma-stellen-falsch', 'komma-nicht-verschoben'],

  erzeuge(seed, p) {
    verlange(p.stellen === 1 || p.stellen === 2, 'stellen: 1 oder 2');
    verlange(p.ziffern_max >= 9 && p.ziffern_max <= 999, 'ziffern_max: 9 … 999');
    const r = rng(seed);
    if (p.rechnung === 'mal') {
      // a = x / 10^s1, b = y / 10^s2; Ergebnis = x·y / 10^(s1+s2)
      const s1 = r.int(1, p.stellen);
      const s2 = r.int(1, p.stellen);
      let x: number;
      let y: number;
      do {
        x = r.int(2, p.ziffern_max);
        y = r.int(2, Math.min(p.ziffern_max, 99));
      } while (x % 10 === 0 || y % 10 === 0);
      const a = x / zehn(s1);
      const b = y / zehn(s2);
      const ergebnis = (x * y) / zehn(s1 + s2);
      const falsch = (x * y) / zehn(Math.max(s1, s2));
      return {
        platzhalter: { a, zeichen: de('·'), b },
        loesung: zahl(ergebnis),
        loesungsweg: [
          de(`Ohne Komma rechnen: ${zahlDeutsch(x)} · ${zahlDeutsch(y)} = ${zahlDeutsch(x * y)}`),
          de(`Nachkommastellen zusammenzählen: ${s1} + ${s2} = ${s1 + s2}`),
          de(`Ergebnis: ${dezimalDeutsch(ergebnis)}`),
        ],
        fehlerbilder: fehlerbilderAus(zahl(ergebnis), [['komma-stellen-falsch', zahl(falsch)]]),
      };
    }
    // Teilen: Ergebnis q (ganz oder eine Stelle), Divisor b mit s Stellen; a = q · b
    const s = r.int(1, p.stellen);
    let y: number;
    do y = r.int(2, Math.min(p.ziffern_max, 99));
    while (y % 10 === 0);
    const qz = r.int(2, 40); // Ergebnis in Zehnteln oder ganz
    const qStellen = r.int(0, 1);
    const q = qz / zehn(qStellen);
    const b = y / zehn(s);
    const a = (qz * y) / zehn(qStellen + s);
    const ohneVerschieben = qz / zehn(qStellen + s); // a durch y statt durch b
    return {
      platzhalter: { a, zeichen: de(':'), b },
      loesung: zahl(q),
      loesungsweg: [
        de(
          `Komma bei beiden Zahlen um ${s} ${s === 1 ? 'Stelle' : 'Stellen'} nach rechts verschieben:`,
        ),
        de(`${dezimalDeutsch((qz * y) / zehn(qStellen))} : ${zahlDeutsch(y)}`),
        de(`Ergebnis: ${dezimalDeutsch(q)}`),
      ],
      fehlerbilder: fehlerbilderAus(zahl(q), [['komma-nicht-verschoben', zahl(ohneVerschieben)]]),
    };
  },
};

// ---------------------------------------------------------------------------
// Brüche in Dezimalzahlen (M.ZO.BR.PERIODISCH)

/** Dezimaldarstellung eines Bruchs: Ganzes, Vorperiode, Periode (leer = endlich). */
export function dezimalentwicklung(b: Bruch): { ganz: number; vor: string; periode: string } {
  const ganz = Math.floor(b.zaehler / b.nenner);
  let rest = b.zaehler % b.nenner;
  const gesehen = new Map<number, number>();
  let ziffern = '';
  while (rest !== 0 && !gesehen.has(rest)) {
    gesehen.set(rest, ziffern.length);
    rest *= 10;
    ziffern += String(Math.floor(rest / b.nenner));
    rest %= b.nenner;
  }
  if (rest === 0) return { ganz, vor: ziffern, periode: '' };
  const start = gesehen.get(rest) ?? 0;
  return { ganz, vor: ziffern.slice(0, start), periode: ziffern.slice(start) };
}

/** Schreibweise mit Periodenstrich (Überstrich über jeder Ziffer der Periode). */
export function periodenText(d: { ganz: number; vor: string; periode: string }): string {
  const strich = [...d.periode].map((z) => `${z}̅`).join('');
  return `${d.ganz},${d.vor}${strich}`;
}

const ENDLICHE_NENNER = [2, 4, 5, 8, 10, 20, 25, 40, 50];

export interface BruchZuDezimalParameter {
  readonly nenner: readonly number[]; // Teilmenge von ENDLICHE_NENNER
  /** auch unechte Brüche */
  readonly unecht: boolean;
}

/** „Gib 7/4 als Dezimalzahl an.“ – Vorlage M.ZO.BR.PERIODISCH.UNECHT-ZU-DEZIMAL (Kl. 5 hat echte Brüche) */
export const unechtZuDezimal: Generator<BruchZuDezimalParameter> = {
  id: 'br.unecht-zu-dezimal',
  version: 1,
  platzhalter: ['bruch'],
  fehlerbildIds: ['ziffern-hintereinander', 'kehrwert'],

  erzeuge(seed, p) {
    verlange(
      p.nenner.length > 0 && p.nenner.every((n) => ENDLICHE_NENNER.includes(n)),
      'nenner aus 2, 4, 5, 8, 10, 20, 25, 40, 50',
    );
    const r = rng(seed);
    let b: Bruch;
    do {
      const n = r.pick(p.nenner);
      b = bruch(r.int(1, p.unecht ? 2 * n : n - 1), n);
    } while (!istGekuerzt(b) || b.zaehler % b.nenner === 0);
    const wert = Number(`${dezimalentwicklung(b).ganz}.${dezimalentwicklung(b).vor}`);
    const erweitert = [10, 100, 1000].find((z) => z % b.nenner === 0) ?? 1000;
    const k = erweitert / b.nenner;
    const kehr = dezimalentwicklung(bruch(b.nenner, b.zaehler));
    return {
      platzhalter: { bruch: b },
      loesung: zahl(wert),
      loesungsweg: [
        de(
          `Erweitere auf ${zahlDeutsch(erweitert)}: ${text(b)} = ${zahlDeutsch(b.zaehler * k)}/${zahlDeutsch(erweitert)}`,
        ),
        de(`${zahlDeutsch(b.zaehler * k)}/${zahlDeutsch(erweitert)} = ${dezimalDeutsch(wert)}`),
      ],
      fehlerbilder: fehlerbilderAus(zahl(wert), [
        ['ziffern-hintereinander', zahl(Number(`${b.zaehler}.${b.nenner}`))],
        [
          'kehrwert',
          kehr.periode === '' ? zahl(Number(`${kehr.ganz}.${kehr.vor || '0'}`)) : undefined,
        ],
      ]),
    };
  },
};

export interface PeriodischParameter {
  /** false: nur entscheiden „endlich oder periodisch“; true: die richtige Schreibweise wählen */
  readonly schreibweise: boolean;
  readonly nenner_max: number; // 6 … 15
}

/** „Ist 5/6 als Dezimalzahl endlich oder periodisch?“ – Vorlage M.ZO.BR.PERIODISCH.ERKENNEN */
export const periodisch: Generator<PeriodischParameter> = {
  id: 'br.periodisch',
  version: 1,
  platzhalter: ['bruch'],
  fehlerbildIds: [
    'nenner-ungerade-gleich-periodisch',
    'periode-zu-frueh',
    'abgebrochen',
    'ohne-strich',
  ],

  erzeuge(seed, p) {
    verlange(p.nenner_max >= 6 && p.nenner_max <= 15, 'nenner_max: 6 … 15');
    const r = rng(seed);
    const periodischGewollt = p.schreibweise || r.int(0, 1) === 0;
    let b: Bruch;
    let d: ReturnType<typeof dezimalentwicklung>;
    do {
      b = echterBruch(r, bis(3, p.nenner_max));
      d = dezimalentwicklung(b);
    } while ((d.periode !== '') !== periodischGewollt);
    const istPeriodisch = d.periode !== '';
    if (!p.schreibweise) {
      const optionen: Option[] = [{ text: de('endlich') }, { text: de('periodisch') }];
      const richtig = auswahl(istPeriodisch ? 1 : 0);
      return {
        platzhalter: { bruch: b },
        optionen,
        loesung: richtig,
        loesungsweg: [
          de(
            istPeriodisch
              ? `Der Nenner ${b.nenner} lässt sich nicht auf 10, 100 oder 1000 erweitern. Beim Teilen wiederholt sich der Rest.`
              : `Der Nenner ${b.nenner} lässt sich auf 10, 100 oder 1000 erweitern.`,
          ),
          de(`${text(b)} = ${istPeriodisch ? periodenText(d) : `${d.ganz},${d.vor}`}`),
        ],
        fehlerbilder: fehlerbilderAus(richtig, [
          // z. B. 3/25 oder 1/5: ungerader Nenner, aber endlich
          [
            'nenner-ungerade-gleich-periodisch',
            !istPeriodisch && b.nenner % 2 === 1 ? auswahl(1) : undefined,
          ],
        ]),
      };
    }
    // Schreibweise wählen: richtige Periode und typische Fehler
    const ziffern = d.vor + d.periode;
    const richtigText = periodenText(d);
    const kandidaten: [string, string][] = [
      ['richtig', richtigText],
      ['ohne-strich', `${d.ganz},${ziffern}`],
      [
        'abgebrochen',
        `${d.ganz},${(ziffern + d.periode + d.periode).slice(0, ziffern.length + 2)}`,
      ],
      d.vor !== ''
        ? ['periode-zu-frueh', periodenText({ ganz: d.ganz, vor: '', periode: ziffern })]
        : d.periode.length > 1
          ? ['strich-zu-kurz', `${d.ganz},${d.periode[0] ?? ''}\u0305${d.periode.slice(1)}`]
          : ['ohne-strich-lang', `${d.ganz},${d.periode.repeat(3)}`],
    ];
    const eindeutig = kandidaten.filter(
      ([, t], i) => kandidaten.findIndex(([, u]) => u === t) === i,
    );
    const gemischt = mische(r, eindeutig);
    const index = (id: string) => {
      const i = gemischt.findIndex(([k]) => k === id);
      return i < 0 ? undefined : auswahl(i);
    };
    const richtig = auswahl(gemischt.findIndex(([k]) => k === 'richtig'));
    return {
      platzhalter: { bruch: b },
      optionen: gemischt.map(([, t]) => ({ text: de(t) })),
      loesung: richtig,
      loesungsweg: [
        de(`Schriftlich teilen: ${b.zaehler} : ${b.nenner} = ${d.ganz},${ziffern}${d.periode} …`),
        de(
          `Es wiederholt sich: ${d.periode}. Der Strich steht nur über den Ziffern, die sich wiederholen.`,
        ),
        de(`${text(b)} = ${richtigText}`),
      ],
      fehlerbilder: fehlerbilderAus(richtig, [
        ['periode-zu-frueh', index('periode-zu-frueh')],
        ['ohne-strich', index('ohne-strich')],
        ['abgebrochen', index('abgebrochen')],
      ]),
    };
  },
};

// Varianten je Vorlage – jede mit genau ihren Fehlerbildern (INHALTSFORMAT §7)
export const kgv = variante(kgvGgt, 'tb.kgv', ['produkt', 'ggt-statt-kgv', 'groessere-zahl'], {
  ggt: false,
});
export const ggt = variante(kgvGgt, 'tb.ggt', ['kgv-statt-ggt', 'eins'], { ggt: true });
export const bruchMalZahl = variante(
  bruchMalGeteilt,
  'br.mal-zahl',
  ['nenner-mal-zahl', 'beide-mal-zahl'],
  { rechnung: 'mal', mit: 'zahl' } as const,
);
export const bruchMalBruch = variante(bruchMalGeteilt, 'br.mal-bruch', ['nenner-addiert'], {
  rechnung: 'mal',
  mit: 'bruch',
} as const);
export const bruchDurchZahl = variante(
  bruchMalGeteilt,
  'br.durch-zahl',
  ['mal-statt-durch', 'beide-mal-zahl'],
  { rechnung: 'durch', mit: 'zahl' } as const,
);
export const bruchDurchBruch = variante(
  bruchMalGeteilt,
  'br.durch-bruch',
  ['kein-kehrwert', 'kehrwert-erster'],
  { rechnung: 'durch', mit: 'bruch' } as const,
);
export const dezMal = variante(dezMalGeteilt, 'br.dez-mal', ['komma-stellen-falsch'], {
  rechnung: 'mal',
} as const);
export const dezDurch = variante(dezMalGeteilt, 'br.dez-durch', ['komma-nicht-verschoben'], {
  rechnung: 'durch',
} as const);
