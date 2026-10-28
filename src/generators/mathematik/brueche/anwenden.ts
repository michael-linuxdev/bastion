// Anwenden gebrochener Zahlen – Klasse 6 (LEHRPLAN §8b, Feld BR): geschickt
// rechnen, Gleichungen, Zahlbereiche, Sachaufgaben, Anteile vergleichen.
// Dezimalzahlen werden intern als ganze Zahlen (Zehntel, Hundertstel) gerechnet.
import { bruch, ggT, wertgleich, type Bruch } from '../../../core/learning/bruch';
import { dezimalDeutsch, zahlDeutsch } from '../../../core/learning/format';
import type { Bild, Generator, Loesung, Option } from '../../../core/learning/generator';
import { fehlerbilderAus } from '../../../core/learning/loesung';
import { rng, type Rng } from '../../../core/rng/rng';
import { bild, rechteck, raster } from '../../svg';
import { auswahl, de, mische, variante, verlange, zahl } from '../../hilfen';
import { gekuerzt } from './rechnen';

const text = (b: Bruch) => `${zahlDeutsch(b.zaehler)}/${zahlDeutsch(b.nenner)}`;
const alsBruch = (b: Bruch): Loesung => ({ typ: 'bruch', wert: gekuerzt(b) });
const d = (hundertstel: number) => dezimalDeutsch(hundertstel / 100);

/** Fehlerbilder für Brüche ohne Antworten, die wertgleich zur Lösung oder zueinander sind. */
function bruchFehler(
  richtig: Bruch,
  kandidaten: readonly (readonly [string, Bruch | undefined])[],
) {
  const gesehen: Bruch[] = [richtig];
  const liste: [string, Loesung | undefined][] = [];
  for (const [id, b] of kandidaten) {
    if (!b || b.zaehler < 0 || gesehen.some((g) => wertgleich(g, b))) continue;
    gesehen.push(b);
    liste.push([id, alsBruch(b)]);
  }
  return fehlerbilderAus(alsBruch(richtig), liste);
}

function echterBruch(r: Rng, nenner_max: number, nenner_min = 2): Bruch {
  for (;;) {
    const n = r.int(nenner_min, nenner_max);
    const z = r.int(1, n - 1);
    if (ggT(z, n) === 1) return bruch(z, n);
  }
}

// ---------------------------------------------------------------------------
// Geschickt rechnen mit Dezimalzahlen (M.ZO.BR.RECHENGESETZE.DEZIMAL)

export interface TermDezimalParameter {
  readonly arten: readonly ('punkt-vor-strich' | 'klammer' | 'quadrat')[];
  /** größte Zahl in Zehnteln (z. B. 50 = 5,0) */
  readonly zehntel_max: number; // 10 … 99
}

/** „Berechne 1,5 + 0,4 · 3,0“ – Vorlage M.ZO.BR.RECHENGESETZE.DEZIMAL */
export const termDezimal: Generator<TermDezimalParameter> = {
  id: 'br.term-dezimal',
  version: 1,
  platzhalter: ['term'],
  fehlerbildIds: ['links-nach-rechts', 'klammer-uebersehen', 'quadrat-mal-zwei', 'quadrat-komma'],

  erzeuge(seed, p) {
    verlange(p.arten.length > 0, 'arten fehlt');
    verlange(p.zehntel_max >= 10 && p.zehntel_max <= 99, 'zehntel_max: 10 … 99');
    const r = rng(seed);
    const art = r.pick(p.arten);
    const z = () => {
      let x: number;
      do x = r.int(2, p.zehntel_max);
      while (x % 10 === 0);
      return x;
    };
    if (art === 'quadrat') {
      const x = r.int(1, 15);
      if (x % 10 === 0) return termDezimal.erzeuge(seed + 1, p);
      const richtig = (x * x) / 100;
      return {
        platzhalter: { term: de(`${dezimalDeutsch(x / 10)}²`) },
        loesung: zahl(richtig),
        loesungsweg: [
          de(`${dezimalDeutsch(x / 10)}² = ${dezimalDeutsch(x / 10)} · ${dezimalDeutsch(x / 10)}`),
          de(
            `Ohne Komma: ${x} · ${x} = ${x * x}; zwei Nachkommastellen: ${dezimalDeutsch(richtig)}`,
          ),
        ],
        fehlerbilder: fehlerbilderAus(zahl(richtig), [
          ['quadrat-mal-zwei', zahl((2 * x) / 10)],
          ['quadrat-komma', zahl((x * x) / 10)],
        ]),
      };
    }
    const [a, b, c] = [z(), z(), r.int(2, 9)]; // a, b in Zehnteln, c ganz
    const minus = art === 'punkt-vor-strich' && r.int(0, 2) === 0 && a > b * c;
    const zeichen = minus ? '−' : '+';
    if (art === 'klammer') {
      // (a + b) · c  →  in Zehnteln
      const richtig = ((a + b) * c) / 10;
      return {
        platzhalter: { term: de(`(${d(a * 10)} + ${d(b * 10)}) · ${c}`) },
        loesung: zahl(richtig),
        loesungsweg: [
          de(`Zuerst die Klammer: ${d(a * 10)} + ${d(b * 10)} = ${d((a + b) * 10)}`),
          de(`Dann malnehmen: ${d((a + b) * 10)} · ${c} = ${dezimalDeutsch(richtig)}`),
        ],
        fehlerbilder: fehlerbilderAus(zahl(richtig), [
          ['klammer-uebersehen', zahl((a + b * c) / 10)],
        ]),
      };
    }
    // a ± b · c
    const produkt = b * c; // Zehntel
    const richtig = (minus ? a - produkt : a + produkt) / 10;
    const falsch = ((minus ? a - b : a + b) * c) / 10;
    return {
      platzhalter: { term: de(`${d(a * 10)} ${zeichen} ${d(b * 10)} · ${c}`) },
      loesung: zahl(richtig),
      loesungsweg: [
        de(`Punkt vor Strich: zuerst ${d(b * 10)} · ${c} = ${d(produkt * 10)}`),
        de(`Dann ${d(a * 10)} ${zeichen} ${d(produkt * 10)} = ${dezimalDeutsch(richtig)}`),
      ],
      fehlerbilder: fehlerbilderAus(zahl(richtig), [
        ['links-nach-rechts', falsch >= 0 ? zahl(falsch) : undefined],
      ]),
    };
  },
};

// ---------------------------------------------------------------------------
// Rechnen mit Brüchen: Punkt vor Strich und Klammern (M.ZO.BR.RECHENGESETZE.BRUECHE-*)

export interface TermBruchParameter {
  readonly klammer: boolean;
  readonly nenner_max: number; // 4 … 12
  readonly faktor_max: number; // 2 … 9
}

/** „Berechne 1/6 + 5/6 · 3“ bzw. „(1/6 + 5/6) · 3“ – gleiche Nenner, eine natürliche Zahl. */
const termBruch: Generator<TermBruchParameter> = {
  id: 'br.term-bruch',
  version: 1,
  platzhalter: ['a', 'b', 'k'],
  fehlerbildIds: ['links-nach-rechts', 'klammer-uebersehen'],

  erzeuge(seed, p) {
    verlange(p.nenner_max >= 4 && p.nenner_max <= 12, 'nenner_max: 4 … 12');
    verlange(p.faktor_max >= 2 && p.faktor_max <= 9, 'faktor_max: 2 … 9');
    const r = rng(seed);
    const n = r.int(3, p.nenner_max);
    const za = r.int(1, n - 1);
    let zb = r.int(1, n - 1);
    if (zb === za) zb = za === 1 ? 2 : za - 1;
    const k = r.int(2, p.faktor_max);
    const a = bruch(za, n);
    const b = bruch(zb, n);
    const richtig = p.klammer ? bruch((za + zb) * k, n) : bruch(za + zb * k, n);
    const andere = p.klammer ? bruch(za + zb * k, n) : bruch((za + zb) * k, n);
    return {
      platzhalter: { a, b, k },
      loesung: alsBruch(richtig),
      loesungsweg: p.klammer
        ? [
            de(`Zuerst die Klammer: ${text(a)} + ${text(b)} = ${za + zb}/${n}`),
            de(`Dann malnehmen: ${za + zb}/${n} · ${k} = ${(za + zb) * k}/${n}`),
            de(`Gekürzt: ${text(gekuerzt(richtig))}`),
          ]
        : [
            de(`Punkt vor Strich: zuerst ${text(b)} · ${k} = ${zb * k}/${n}`),
            de(`Dann ${text(a)} + ${zb * k}/${n} = ${za + zb * k}/${n}`),
            de(`Gekürzt: ${text(gekuerzt(richtig))}`),
          ],
      fehlerbilder: bruchFehler(richtig, [
        [p.klammer ? 'klammer-uebersehen' : 'links-nach-rechts', andere],
      ]),
    };
  },
};

export const termBruchPunkt = variante(termBruch, 'br.term-bruch-punkt', ['links-nach-rechts'], {
  klammer: false,
});
export const termBruchKlammer = variante(
  termBruch,
  'br.term-bruch-klammer',
  ['klammer-uebersehen'],
  {
    klammer: true,
  },
);

// ---------------------------------------------------------------------------
// Gleichungen mit Brüchen (M.SF.BR.GLEICHUNGEN)

export interface GleichungPlusParameter {
  readonly gleichnamig: boolean;
  readonly nenner_max: number; // 4 … 12
}

/** „Bestimme x: x + 3/8 = 7/8“ oder „x − 1/4 = 2/3“ – Vorlage M.SF.BR.GLEICHUNGEN.PLUS-MINUS */
export const gleichungBruchPlus: Generator<GleichungPlusParameter> = {
  id: 'gl.bruch-plus-minus',
  version: 1,
  platzhalter: ['zeichen', 'a', 'b'],
  fehlerbildIds: ['falsche-umkehr'],

  erzeuge(seed, p) {
    verlange(p.nenner_max >= 4 && p.nenner_max <= 12, 'nenner_max: 4 … 12');
    const r = rng(seed);
    const plus = r.int(0, 1) === 0;
    // x und a wählen, b ausrechnen; bei „+“ muss b > a sein
    const x = echterBruch(r, p.nenner_max, 2);
    let a = echterBruch(r, p.nenner_max, 2);
    if (p.gleichnamig) {
      const zaehler = Array.from({ length: x.nenner - 1 }, (_, i) => i + 1).filter(
        (z) => ggT(z, x.nenner) === 1,
      );
      a = bruch(r.pick(zaehler), x.nenner);
    }
    const summe = gekuerzt(bruch(x.zaehler * a.nenner + a.zaehler * x.nenner, x.nenner * a.nenner));
    const diff = x.zaehler * a.nenner - a.zaehler * x.nenner;
    // x − a = b nur, wenn b > 0
    const minus = !plus && diff > 0;
    const b = minus ? gekuerzt(bruch(diff, x.nenner * a.nenner)) : summe;
    const zeichen = minus ? '−' : '+';
    // falsche Umkehr: bei + addiert statt subtrahiert, bei − subtrahiert statt addiert
    const falsch = minus
      ? (() => {
          const z = b.zaehler * a.nenner - a.zaehler * b.nenner;
          return z > 0 ? bruch(z, b.nenner * a.nenner) : undefined;
        })()
      : bruch(b.zaehler * a.nenner + a.zaehler * b.nenner, b.nenner * a.nenner);
    return {
      platzhalter: { zeichen: de(zeichen), a, b },
      loesung: alsBruch(x),
      loesungsweg: [
        de(
          minus
            ? `Umkehraufgabe: x = ${text(b)} + ${text(a)}`
            : `Umkehraufgabe: x = ${text(b)} − ${text(a)}`,
        ),
        de(`x = ${text(gekuerzt(x))}`),
        de(`Probe: ${text(gekuerzt(x))} ${zeichen} ${text(a)} = ${text(b)}`),
      ],
      fehlerbilder: bruchFehler(x, [['falsche-umkehr', falsch]]),
    };
  },
};

export interface GleichungMalParameter {
  /** k natürliche Zahl oder Bruch */
  readonly faktor: 'zahl' | 'bruch';
  readonly nenner_max: number; // 4 … 12
}

/** „Bestimme x: 3 · x = 3/4“ oder „2/3 · x = 4/9“ – Vorlage M.SF.BR.GLEICHUNGEN.MAL */
export const gleichungBruchMal: Generator<GleichungMalParameter> = {
  id: 'gl.bruch-mal',
  version: 1,
  platzhalter: ['k', 'b'],
  fehlerbildIds: ['mal-statt-durch'],

  erzeuge(seed, p) {
    verlange(p.nenner_max >= 4 && p.nenner_max <= 12, 'nenner_max: 4 … 12');
    const r = rng(seed);
    const x = echterBruch(r, p.nenner_max, 2);
    const k: Bruch | number = p.faktor === 'zahl' ? r.int(2, 6) : echterBruch(r, p.nenner_max, 2);
    const kb = typeof k === 'number' ? bruch(k, 1) : k;
    const b = gekuerzt(bruch(x.zaehler * kb.zaehler, x.nenner * kb.nenner));
    const kText = typeof k === 'number' ? String(k) : text(k);
    return {
      platzhalter: { k, b },
      loesung: alsBruch(x),
      loesungsweg: [
        de(`Umkehraufgabe: x = ${text(b)} : ${kText}`),
        de(`Teilen heißt malnehmen mit dem Kehrwert: ${text(b)} · ${kb.nenner}/${kb.zaehler}`),
        de(`x = ${text(gekuerzt(x))}`),
      ],
      fehlerbilder: bruchFehler(x, [
        ['mal-statt-durch', bruch(b.zaehler * kb.zaehler, b.nenner * kb.nenner)],
      ]),
    };
  },
};

// ---------------------------------------------------------------------------
// Zahlbereiche (M.ZO.BR.MENGEN)

const JA_NEIN: Option[] = [{ text: de('Ja') }, { text: de('Nein') }];

export interface NatuerlichParameter {
  /** auch Brüche, die eine natürliche Zahl sind (z. B. 12/4) */
  readonly verkleidet: boolean;
}

/** „Ist 12/4 eine natürliche Zahl?“ – Vorlage M.ZO.BR.MENGEN.NATUERLICH */
export const natuerlich: Generator<NatuerlichParameter> = {
  id: 'br.natuerlich',
  version: 1,
  platzhalter: ['zahl'],
  fehlerbildIds: ['bruch-heisst-nicht-natuerlich', 'komma-zahl-natuerlich'],

  erzeuge(seed, p) {
    const r = rng(seed);
    const fall = r.int(0, p.verkleidet ? 3 : 2);
    let zahlWert: number | Bruch;
    let ist: boolean;
    let weg: string;
    if (fall === 0) {
      const n = r.int(0, 500);
      zahlWert = n;
      ist = true;
      weg = `${zahlDeutsch(n)} ist eine Zahl zum Zählen – eine natürliche Zahl.`;
    } else if (fall === 1) {
      const b = echterBruch(r, 12);
      const ganz = r.int(0, 3);
      zahlWert = bruch(b.zaehler + ganz * b.nenner, b.nenner);
      ist = false;
      weg = `${text(zahlWert)} liegt zwischen zwei natürlichen Zahlen – es ist eine gebrochene Zahl, aber keine natürliche.`;
    } else if (fall === 2) {
      let z: number;
      do z = r.int(1, 99);
      while (z % 10 === 0);
      zahlWert = (r.int(0, 20) * 10 + z) / 10;
      ist = false;
      weg = `${dezimalDeutsch(zahlWert)} hat Ziffern hinter dem Komma, die nicht 0 sind – keine natürliche Zahl.`;
    } else {
      const n = r.int(2, 9);
      const g = r.int(1, 9);
      zahlWert = bruch(g * n, n);
      ist = true;
      weg = `${text(zahlWert)} = ${g}. Der Bruch ist also die natürliche Zahl ${g}.`;
    }
    const richtig = auswahl(ist ? 0 : 1);
    return {
      platzhalter: { zahl: zahlWert },
      optionen: JA_NEIN,
      loesung: richtig,
      loesungsweg: [de(weg)],
      fehlerbilder: fehlerbilderAus(richtig, [
        ['bruch-heisst-nicht-natuerlich', fall === 3 ? auswahl(1) : undefined],
        ['komma-zahl-natuerlich', fall === 2 ? auswahl(0) : undefined],
      ]),
    };
  },
};

export interface ZahlbereichAussageParameter {
  /** auch Aussagen über Teilmengen */
  readonly teilmengen: boolean;
}

/** „Welche Aussage stimmt?“ – Vorlage M.ZO.BR.MENGEN.AUSSAGEN */
export const zahlbereichAussage: Generator<ZahlbereichAussageParameter> = {
  id: 'br.zahlbereich-aussage',
  version: 1,
  platzhalter: [],
  fehlerbildIds: ['teilmenge-verdreht', 'bruch-element-natuerlich'],

  erzeuge(seed, p) {
    const r = rng(seed);
    const n = r.int(2, 99);
    const b = echterBruch(r, 9);
    const wahr: [string, string][] = [
      ['w-element-n', `${n} ist ein Element der natürlichen Zahlen.`],
      ['w-element-q', `${text(b)} ist ein Element der gebrochenen Zahlen.`],
      ...(p.teilmengen
        ? ([
            ['w-teilmenge', 'Die natürlichen Zahlen sind eine Teilmenge der gebrochenen Zahlen.'],
            ['w-jede', 'Jede natürliche Zahl ist auch eine gebrochene Zahl.'],
          ] as [string, string][])
        : []),
    ];
    const falsch: [string, string][] = [
      ['bruch-element-natuerlich', `${text(b)} ist ein Element der natürlichen Zahlen.`],
      ['f-zwischen', 'Zwischen 0 und 1 gibt es keine gebrochene Zahl.'],
      ...(p.teilmengen
        ? ([
            [
              'teilmenge-verdreht',
              'Die gebrochenen Zahlen sind eine Teilmenge der natürlichen Zahlen.',
            ],
            ['f-jede', 'Jede gebrochene Zahl ist auch eine natürliche Zahl.'],
          ] as [string, string][])
        : [
            ['f-kein-element', `${n} ist kein Element der gebrochenen Zahlen.`] as [string, string],
          ]),
    ];
    const richtigeAussage = r.pick(wahr);
    const optionen = mische(r, [richtigeAussage, ...mische(r, falsch).slice(0, 2)]);
    const index = (id: string) => {
      const i = optionen.findIndex(([k]) => k === id);
      return i < 0 ? undefined : auswahl(i);
    };
    const richtig = auswahl(optionen.indexOf(richtigeAussage));
    return {
      platzhalter: {},
      optionen: optionen.map(([, t]) => ({ text: de(t) })),
      loesung: richtig,
      loesungsweg: [
        de(
          'Natürliche Zahlen: 0, 1, 2, 3 … Gebrochene Zahlen: alle Zahlen, die man als Bruch schreiben kann – auch die natürlichen.',
        ),
        de(`Richtig ist: ${richtigeAussage[1]}`),
      ],
      fehlerbilder: fehlerbilderAus(richtig, [
        ['teilmenge-verdreht', index('teilmenge-verdreht')],
        ['bruch-element-natuerlich', index('bruch-element-natuerlich')],
      ]),
    };
  },
};

// ---------------------------------------------------------------------------
// Sachaufgaben (M.ZO.BR.SACH)

const WAREN = ['Äpfel', 'Tomaten', 'Kartoffeln', 'Kirschen', 'Käse', 'Möhren'];

export interface SachPreisParameter {
  /** true: auch Rückgeld von einem Schein */
  readonly rueckgeld: boolean;
}

/** „1,5 kg Äpfel zu 2,40 € je kg – wie viel kostet das?“ – Vorlage M.ZO.BR.SACH.PREIS */
export const sachPreis: Generator<SachPreisParameter> = {
  id: 'br.sach-preis',
  version: 1,
  platzhalter: ['geschichte'],
  fehlerbildIds: ['addiert', 'komma-falsch', 'kein-rueckgeld'],

  erzeuge(seed, p) {
    const r = rng(seed);
    const ware = r.pick(WAREN);
    const menge = r.int(3, 30); // Zehntel kg, 0,3 … 3,0
    const preis = r.int(8, 60); // Zehntel €, 0,80 … 6,00
    const kosten = menge * preis; // Hundertstel €
    const kg = dezimalDeutsch(menge / 10);
    const euro = (h: number) =>
      `${zahlDeutsch(Math.floor(h / 100))},${String(h % 100).padStart(2, '0')}`;
    const preisText = euro(preis * 10);
    if (!p.rueckgeld) {
      return {
        platzhalter: {
          geschichte: de(
            `${kg} kg ${ware} kosten ${preisText} € je Kilogramm. Wie viel Euro kosten sie zusammen?`,
          ),
        },
        loesung: zahl(kosten / 100),
        loesungsweg: [
          de(`Menge mal Preis je Kilogramm: ${kg} · ${preisText}`),
          de(
            `Ohne Komma: ${menge} · ${preis} = ${kosten}; zwei Nachkommastellen: ${euro(kosten)} €`,
          ),
        ],
        fehlerbilder: fehlerbilderAus(zahl(kosten / 100), [
          ['addiert', zahl((menge * 10 + preis * 10) / 100)],
          ['komma-falsch', zahl(kosten / 10)],
        ]),
      };
    }
    const schein = kosten < 1000 ? 1000 : kosten < 2000 ? 2000 : 5000; // Hundertstel €, immer mehr als der Preis
    const rest = schein - kosten;
    return {
      platzhalter: {
        geschichte: de(
          `Jana kauft ${kg} kg ${ware} zu ${preisText} € je Kilogramm. Sie bezahlt mit einem ${schein / 100}-€-Schein. Wie viel Euro bekommt sie zurück?`,
        ),
      },
      loesung: zahl(rest / 100),
      loesungsweg: [
        de(`Preis: ${kg} · ${preisText} = ${euro(kosten)} €`),
        de(`Rückgeld: ${schein / 100} € − ${euro(kosten)} € = ${euro(rest)} €`),
      ],
      fehlerbilder: fehlerbilderAus(zahl(rest / 100), [['kein-rueckgeld', zahl(kosten / 100)]]),
    };
  },
};

const BRUCHWORT: readonly [Bruch, string][] = [
  [bruch(1, 2), 'die Hälfte'],
  [bruch(1, 3), 'ein Drittel'],
  [bruch(2, 3), 'zwei Drittel'],
  [bruch(1, 4), 'ein Viertel'],
  [bruch(3, 4), 'drei Viertel'],
  [bruch(1, 5), 'ein Fünftel'],
  [bruch(2, 5), 'zwei Fünftel'],
  [bruch(1, 6), 'ein Sechstel'],
  [bruch(1, 8), 'ein Achtel'],
  [bruch(3, 8), 'drei Achtel'],
  [bruch(1, 10), 'ein Zehntel'],
  [bruch(3, 10), 'drei Zehntel'],
];

export interface SachAnteilParameter {
  /** Anzahl der Ausgaben: 1 oder 2 */
  readonly ausgaben: number;
}

/** „Von 60 € gibt Lea ein Viertel für ein Buch aus …“ – Vorlage M.ZO.BR.SACH.ANTEIL */
export const sachAnteil: Generator<SachAnteilParameter> = {
  id: 'br.sach-anteil',
  version: 1,
  platzhalter: ['geschichte'],
  fehlerbildIds: ['ausgabe-statt-rest', 'nur-erste-ausgabe'],

  erzeuge(seed, p) {
    verlange(p.ausgaben === 1 || p.ausgaben === 2, 'ausgaben: 1 oder 2');
    const r = rng(seed);
    const [a, aw] = r.pick(BRUCHWORT);
    let b = a;
    let bw = '';
    if (p.ausgaben === 2) {
      do [b, bw] = r.pick(BRUCHWORT);
      while (
        b.zaehler * a.nenner + a.zaehler * b.nenner >= a.nenner * b.nenner ||
        wertgleich(a, b)
      );
    }
    const nenner = p.ausgaben === 2 ? (a.nenner * b.nenner) / ggT(a.nenner, b.nenner) : a.nenner;
    const ganzes = nenner * r.int(2, Math.max(2, Math.floor(120 / nenner)));
    const ausA = (ganzes / a.nenner) * a.zaehler;
    const ausB = p.ausgaben === 2 ? (ganzes / b.nenner) * b.zaehler : 0;
    const rest = ganzes - ausA - ausB;
    const name = r.pick(['Lea', 'Ben', 'Mia', 'Can', 'Ida', 'Tom']);
    const geschichte =
      p.ausgaben === 1
        ? `${name} hat ${ganzes} €. ${name} gibt ${aw} davon für ein Spiel aus. Wie viel Euro bleiben übrig?`
        : `${name} hat ${ganzes} €. ${name} gibt ${aw} davon für ein Buch und ${bw} für einen Kinobesuch aus. Wie viel Euro bleiben übrig?`;
    return {
      platzhalter: { geschichte: de(geschichte) },
      loesung: zahl(rest),
      loesungsweg: [
        de(`${aw} von ${ganzes} €: ${ganzes} : ${a.nenner} · ${a.zaehler} = ${ausA} €`),
        ...(p.ausgaben === 2
          ? [de(`${bw} von ${ganzes} €: ${ganzes} : ${b.nenner} · ${b.zaehler} = ${ausB} €`)]
          : []),
        de(`Übrig: ${ganzes} € − ${ausA + ausB} € = ${rest} €`),
      ],
      fehlerbilder: fehlerbilderAus(zahl(rest), [
        ['ausgabe-statt-rest', zahl(ausA + ausB)],
        ['nur-erste-ausgabe', p.ausgaben === 2 ? zahl(ganzes - ausA) : undefined],
      ]),
    };
  },
};

// ---------------------------------------------------------------------------
// Anteile vergleichen und Flächenanteile (M.ZO.BR.ANTEILE)

/** Anteile mit „glatten“ Prozentwerten. */
const ANTEILE: readonly Bruch[] = [
  bruch(1, 2),
  bruch(1, 4),
  bruch(3, 4),
  bruch(1, 5),
  bruch(2, 5),
  bruch(3, 5),
  bruch(4, 5),
  bruch(1, 10),
  bruch(3, 10),
  bruch(7, 10),
  bruch(9, 10),
  bruch(1, 20),
  bruch(3, 20),
  bruch(7, 20),
  bruch(1, 25),
  bruch(6, 25),
  bruch(1, 8),
  bruch(3, 8),
];
const prozentVon = (b: Bruch) => (b.zaehler * 100) / b.nenner;

type Schreibweise = 'bruch' | 'dezimal' | 'prozent';
function schreibe(b: Bruch, w: Schreibweise): string {
  if (w === 'bruch') return text(b);
  if (w === 'dezimal') return dezimalDeutsch(b.zaehler / b.nenner);
  return `${dezimalDeutsch(prozentVon(b))} %`;
}

export interface AnteilVergleichParameter {
  /** auch Dezimalzahlen und nah beieinanderliegende Werte */
  readonly schwer: boolean;
}

/** „Was ist mehr: 3/5 oder 45 %?“ – Vorlage M.ZO.BR.ANTEILE.VERGLEICHEN */
export const anteilVergleich: Generator<AnteilVergleichParameter> = {
  id: 'br.anteil-vergleich',
  version: 1,
  platzhalter: [],
  fehlerbildIds: ['prozentzahl-groesser', 'gleich-uebersehen'],

  erzeuge(seed, p) {
    const r = rng(seed);
    const x = r.pick(ANTEILE);
    let y = r.pick(ANTEILE);
    const gleich = r.int(0, 3) === 0;
    if (gleich) y = x;
    else
      while (
        wertgleich(x, y) ||
        (p.schwer && Math.abs(prozentVon(x) - prozentVon(y)) > 25) ||
        (!p.schwer && Math.abs(prozentVon(x) - prozentVon(y)) < 10)
      )
        y = r.pick(ANTEILE);
    const wx: Schreibweise = 'bruch';
    const wy: Schreibweise = p.schwer ? r.pick(['dezimal', 'prozent'] as const) : 'prozent';
    const [tx, ty] = [schreibe(x, wx), schreibe(y, wy)];
    const optionen: Option[] = [
      { text: de(`${tx} ist mehr`) },
      { text: de(`${ty} ist mehr`) },
      { text: de('beide sind gleich viel') },
    ];
    const px = prozentVon(x);
    const py = prozentVon(y);
    const richtig = auswahl(px > py ? 0 : px < py ? 1 : 2);
    // Fehler: die größere „Zahl“ im Prozentwert für mehr halten (45 % gegen 3/5)
    const prozentNaiv = wy === 'prozent' && py < px && py > x.zaehler ? auswahl(1) : undefined;
    return {
      platzhalter: {},
      optionen,
      loesung: richtig,
      loesungsweg: [
        de(`In Prozent umrechnen: ${tx} = ${dezimalDeutsch(px)} %`),
        ...(wy !== 'prozent' ? [de(`${ty} = ${dezimalDeutsch(py)} %`)] : []),
        de(
          px === py
            ? 'Beide sind gleich viel.'
            : `${dezimalDeutsch(Math.max(px, py))} % ist mehr als ${dezimalDeutsch(Math.min(px, py))} %.`,
        ),
      ],
      fehlerbilder: fehlerbilderAus(richtig, [
        ['prozentzahl-groesser', prozentNaiv],
        ['gleich-uebersehen', gleich ? auswahl(0) : undefined],
      ]),
    };
  },
};

export interface FlaechenanteilParameter {
  /** mögliche Rastergrößen [Spalten, Zeilen] */
  readonly raster: readonly (readonly [number, number])[];
}

function rasterBild(spalten: number, zeilen: number, gefaerbt: number): Bild {
  const g = Math.min(28, Math.floor(280 / spalten), Math.floor(200 / zeilen));
  const teile = [...raster(10, 10, g, spalten, zeilen)];
  for (let i = 0; i < gefaerbt; i++) {
    const s = i % spalten;
    const z = Math.floor(i / spalten);
    teile.push(rechteck(10 + s * g, 10 + z * g, g, g, true));
  }
  return bild(spalten * g + 20, zeilen * g + 20, teile, {
    de: `Ein Rechteck aus ${spalten * zeilen} gleich großen Kästchen, ${gefaerbt} davon sind gefärbt.`,
  });
}

/** „Wie viel Prozent der Fläche sind gefärbt?“ – Vorlage M.ZO.BR.ANTEILE.FLAECHE */
export const flaechenanteil: Generator<FlaechenanteilParameter> = {
  id: 'br.flaechenanteil',
  version: 1,
  platzhalter: [],
  fehlerbildIds: ['anzahl-statt-prozent', 'ungefaerbt'],

  erzeuge(seed, p) {
    const glatt = (gesamt: number) =>
      Array.from({ length: gesamt - 1 }, (_, i) => i + 1).filter((k) => (k * 100) % gesamt === 0);
    verlange(
      p.raster.length > 0 && p.raster.every(([s, z]) => glatt(s * z).length > 0),
      'raster: Kästchenzahl muss glatte Prozente ergeben',
    );
    const r = rng(seed);
    const [s, z] = r.pick(p.raster);
    const gesamt = s * z;
    // nur Anzahlen mit ganzzahligem Prozentwert
    const k = r.pick(glatt(gesamt));
    const prozent = (k * 100) / gesamt;
    return {
      platzhalter: {},
      bild: rasterBild(s, z, k),
      loesung: zahl(prozent),
      loesungsweg: [
        de(`${k} von ${gesamt} Kästchen sind gefärbt: ${k}/${gesamt}`),
        de(`Auf Hundertstel erweitern: ${k}/${gesamt} = ${prozent}/100 = ${prozent} %`),
      ],
      fehlerbilder: fehlerbilderAus(zahl(prozent), [
        ['anzahl-statt-prozent', zahl(k)],
        ['ungefaerbt', zahl(100 - prozent)],
      ]),
    };
  },
};
