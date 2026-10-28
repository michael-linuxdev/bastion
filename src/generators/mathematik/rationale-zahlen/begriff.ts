// Rationale Zahlen – Klasse 7 (LEHRPLAN §8c, Feld RZ): negative Zahlen im Alltag,
// Zahlengerade, Gegenzahl und Betrag, vergleichen und ordnen, Zahlbereiche.
// Dezimalzahlen werden intern in Zehnteln (ganze Zahlen) gerechnet.
import { runde10 } from '../../../core/learning/format';
import type { Fehlerbild, Generator, Loesung } from '../../../core/learning/generator';
import { fehlerbilderAus } from '../../../core/learning/loesung';
import { zahlText } from '../../../core/learning/text';
import { rng, type Rng } from '../../../core/rng/rng';
import { bild, linie, markierung, text } from '../../svg';
import { auswahl, de, mische, verlange, zahl } from '../../hilfen';

/** Zahl aus Zehnteln, ohne Rundungsrest */
const z10 = (zehntel: number) => runde10(zehntel / 10, 6);
const ohneNull = (x: number) => (x === 0 ? 0 : x); // −0 vermeiden

/** Ganze Zahl ≠ 0 in −max … max, überwiegend negativ */
function mitVorzeichen(r: Rng, max: number, anteilNegativ = 0.7): number {
  const betrag = r.int(1, max);
  return r.int(1, 100) <= anteilNegativ * 100 ? -betrag : betrag;
}

// ---------------------------------------------------------------------------
// Zahlengerade ablesen (M.ZO.RZ.BEGRIFF.ZAHLENGERADE)

export interface ZahlengeradeParameter {
  /** Abstand zweier Striche in Zehnteln: 10 (= 1) oder 5 (= 0,5) */
  readonly schritt_zehntel: 10 | 5;
  /** Zahlengerade von −bis … bis (3 … 10) */
  readonly bis: number;
}

/** „Welche Zahl gehört an die Markierung?“ – Zahlengerade mit negativen Zahlen */
export const zahlengerade: Generator<ZahlengeradeParameter> = {
  id: 'rz.zahlengerade',
  version: 1,
  platzhalter: [],
  fehlerbildIds: ['vorzeichen-vergessen', 'striche-statt-abstaende', 'striche-als-ganze'],

  erzeuge(seed, p) {
    verlange(p.schritt_zehntel === 10 || p.schritt_zehntel === 5, 'schritt_zehntel: 10 oder 5');
    verlange(p.bis >= 3 && p.bis <= 10, 'bis: 3 … 10');
    const r = rng(seed);
    const jeEins = 10 / p.schritt_zehntel; // Striche je Einheit
    const n = p.bis * jeEins; // Striche auf jeder Seite der 0
    // Beschriftet: 0, die Enden und bei ganzen Schritten jede 5. Zahl bzw. jede ganze Zahl
    const beschriftet = (k: number) =>
      k === 0 || Math.abs(k) === n || (jeEins === 1 ? k % 5 === 0 : k % jeEins === 0);
    let k: number;
    do k = mitVorzeichen(r, n);
    while (beschriftet(k));
    const wert = (striche: number) => ohneNull(z10(striche * p.schritt_zehntel));

    const breite = 340;
    const x = (t: number) => 20 + ((t + n) * breite) / (2 * n);
    const teile: string[] = [linie(10, 60, 370, 60)];
    for (let t = -n; t <= n; t++) {
      const gross = t % jeEins === 0;
      teile.push(linie(x(t), gross ? 50 : 54, x(t), gross ? 70 : 66, t === 0 ? 3 : 1.5));
      if (beschriftet(t)) teile.push(text(x(t), 92, zahlText(wert(t)), 14));
    }
    teile.push(markierung(x(k), 46));
    const richtig = zahl(wert(k));
    const seite = k < 0 ? 'links' : 'rechts';
    return {
      platzhalter: {},
      bild: bild(
        380,
        102,
        teile,
        de(
          `Eine Zahlengerade von ${zahlText(-p.bis)} bis ${p.bis}. Von einem Strich zum nächsten ` +
            `sind es ${zahlText(p.schritt_zehntel / 10)}. Die Markierung steht ${Math.abs(k)} ` +
            `Striche ${seite} von der 0.`,
        ),
      ),
      vorzeichen: true,
      loesung: richtig,
      loesungsweg: [
        de(`Von einem Strich zum nächsten sind es ${zahlText(p.schritt_zehntel / 10)}.`),
        de(
          `Die Markierung liegt ${Math.abs(k)} Abschnitte ${seite} von 0` +
            (k < 0 ? ' – links von 0 liegen die negativen Zahlen' : '') +
            `: ${zahlText(wert(k))}.`,
        ),
      ],
      fehlerbilder: fehlerbilderAus(richtig, [
        ['vorzeichen-vergessen', zahl(wert(-k))],
        ['striche-statt-abstaende', zahl(wert(k + Math.sign(k)))],
        ['striche-als-ganze', jeEins > 1 ? zahl(k) : undefined],
      ]),
    };
  },
};

// ---------------------------------------------------------------------------
// Gegenzahl und Betrag (M.ZO.RZ.BEGRIFF.GEGENZAHL-BETRAG)

export interface GegenzahlBetragParameter {
  /** auch Dezimalzahlen mit einer Nachkommastelle */
  readonly dezimal: boolean;
  readonly max: number; // 10 … 100
}

/** „Gib die Gegenzahl von −7 an.“ / „Gib den Betrag von −2,5 an.“ */
export const gegenzahlBetrag: Generator<GegenzahlBetragParameter> = {
  id: 'rz.gegenzahl-betrag',
  version: 1,
  platzhalter: ['was', 'zahl'],
  fehlerbildIds: ['zahl-selbst', 'betrag-statt-gegenzahl', 'gegenzahl-statt-betrag'],

  erzeuge(seed, p) {
    verlange(p.max >= 10 && p.max <= 100, 'max: 10 … 100');
    const r = rng(seed);
    const x =
      p.dezimal && r.int(0, 1) === 0
        ? (() => {
            let zehntel: number;
            do zehntel = mitVorzeichen(r, p.max * 10, 0.6);
            while (zehntel % 10 === 0);
            return z10(zehntel);
          })()
        : mitVorzeichen(r, p.max, 0.6);
    const betrag = r.int(0, 1) === 0;
    const richtig = zahl(betrag ? Math.abs(x) : -x);
    return {
      platzhalter: { was: de(betrag ? 'den Betrag' : 'die Gegenzahl'), zahl: x },
      vorzeichen: true,
      loesung: richtig,
      loesungsweg: betrag
        ? [
            de('Der Betrag ist der Abstand zur 0 – er ist nie negativ.'),
            de(`|${zahlText(x)}| = ${zahlText(Math.abs(x))}`),
          ]
        : [
            de('Die Gegenzahl liegt auf der anderen Seite der 0, gleich weit entfernt.'),
            de(`Die Gegenzahl von ${zahlText(x)} ist ${zahlText(-x)}.`),
          ],
      fehlerbilder: fehlerbilderAus(richtig, [
        ['zahl-selbst', zahl(x)],
        ['betrag-statt-gegenzahl', betrag ? undefined : zahl(Math.abs(x))],
        ['gegenzahl-statt-betrag', betrag ? zahl(-x) : undefined],
      ]),
    };
  },
};

// ---------------------------------------------------------------------------
// Negative Zahlen im Alltag (M.ZO.RZ.BEGRIFF.ALLTAG)

export interface AlltagParameter {
  /** false: Lage als Zahl angeben; true: Unterschied zweier Lagen über die 0 hinweg */
  readonly unterschied: boolean;
}

interface Lage {
  readonly einheit: string;
  /** Satz für eine Lage; erhält den Betrag und ob er negativ ist */
  readonly satz: (betrag: string, negativ: boolean) => string;
  readonly max: number;
}

const LAGEN: readonly Lage[] = [
  {
    einheit: '°C',
    satz: (b, n) => `Das Thermometer zeigt ${b} °C ${n ? 'unter' : 'über'} null.`,
    max: 20,
  },
  {
    einheit: 'm',
    satz: (b, n) =>
      n
        ? `Ein Taucher ist ${b} m unter dem Meeresspiegel.`
        : `Ein Vogel fliegt ${b} m über dem Meeresspiegel.`,
    max: 40,
  },
  {
    einheit: '€',
    satz: (b, n) =>
      n ? `Auf Jonas' Konto fehlen ${b} € – er hat Schulden.` : `Auf Jonas' Konto sind ${b} €.`,
    max: 90,
  },
  {
    einheit: 'Stockwerke',
    satz: (b, n) =>
      `Der Aufzug hält ${b} ${b === '1' ? 'Stockwerk' : 'Stockwerke'} ${n ? 'unter' : 'über'} dem Erdgeschoss.`,
    max: 6,
  },
];

/** „Ein Taucher ist 12 m unter dem Meeresspiegel. Welche Zahl beschreibt das?“ */
export const alltag: Generator<AlltagParameter> = {
  id: 'rz.alltag',
  version: 1,
  platzhalter: ['geschichte', 'frage'],
  fehlerbildIds: ['vorzeichen-vergessen', 'abstand-ohne-null'],

  erzeuge(seed, p) {
    const r = rng(seed);
    const lage = r.pick(LAGEN);
    if (!p.unterschied) {
      const x = mitVorzeichen(r, lage.max, 0.75);
      const richtig = zahl(x);
      return {
        platzhalter: {
          geschichte: de(lage.satz(zahlText(Math.abs(x)), x < 0)),
          frage: de(`Welche Zahl beschreibt das (in ${lage.einheit})?`),
        },
        vorzeichen: true,
        loesung: richtig,
        loesungsweg: [
          de(
            x < 0
              ? 'Unter null, unter dem Meeresspiegel, Schulden, unter dem Erdgeschoss: Das sind negative Zahlen.'
              : 'Über null, über dem Meeresspiegel, Guthaben, über dem Erdgeschoss: Das sind positive Zahlen.',
          ),
          de(`${zahlText(x)} ${lage.einheit}`),
        ],
        fehlerbilder: fehlerbilderAus(richtig, [['vorzeichen-vergessen', zahl(-x)]]),
      };
    }
    // Unterschied von einer negativen zu einer positiven Lage
    const unten = -r.int(1, lage.max);
    let oben: number;
    do oben = r.int(1, lage.max);
    while (oben === -unten);
    const richtig = zahl(oben - unten);
    const [erst, dann] = r.int(0, 1) === 0 ? [unten, oben] : [oben, unten];
    return {
      platzhalter: {
        geschichte: de(
          `Erst: ${lage.satz(zahlText(Math.abs(erst)), erst < 0)} Später: ${lage.satz(zahlText(Math.abs(dann)), dann < 0)}`,
        ),
        frage: de(`Wie groß ist der Unterschied (in ${lage.einheit})?`),
      },
      loesung: richtig,
      loesungsweg: [
        de(`Die beiden Lagen sind ${zahlText(unten)} und ${zahlText(oben)}.`),
        de(
          `Von ${zahlText(unten)} bis 0 sind es ${-unten}, von 0 bis ${oben} sind es ${oben}: ` +
            `${-unten} + ${oben} = ${oben - unten}.`,
        ),
      ],
      fehlerbilder: fehlerbilderAus(richtig, [['abstand-ohne-null', zahl(Math.abs(oben + unten))]]),
    };
  },
};

// ---------------------------------------------------------------------------
// Vergleichen (M.ZO.RZ.ORDNEN.VERGLEICHSZEICHEN)

export interface VergleichenParameter {
  readonly dezimal: boolean;
  readonly max: number; // 10 … 100
}

/** Optionen in fester Reihenfolge: 0 = „<“, 1 = „=“, 2 = „>“. */
const ZEICHEN = ['<', '=', '>'] as const;
const zeichenIndex = (a: number, b: number) => (a < b ? 0 : a === b ? 1 : 2);

/** Zufällige Zahl ≠ 0; bei dezimal mit einer Nachkommastelle */
function rationale(r: Rng, p: VergleichenParameter): number {
  if (!p.dezimal) return mitVorzeichen(r, p.max, 0.6);
  let zehntel: number;
  do zehntel = mitVorzeichen(r, p.max * 10, 0.6);
  while (zehntel % 10 === 0);
  return z10(zehntel);
}

/** „Setze das richtige Zeichen ein: −7 ☐ −3“ */
export const rzVergleichen: Generator<VergleichenParameter> = {
  id: 'rz.vergleichen',
  version: 1,
  platzhalter: ['a', 'b'],
  fehlerbildIds: ['betraege-verglichen', 'zeichen-verdreht'],

  erzeuge(seed, p) {
    verlange(p.max >= 10 && p.max <= 100, 'max: 10 … 100');
    const r = rng(seed);
    const fall = r.int(0, 9);
    const a = -Math.abs(rationale(r, p));
    let b: number;
    if (fall === 0) b = a;
    else if (fall <= 5) {
      // beide negativ – die Falle: der größere Betrag ist die kleinere Zahl
      do b = -Math.abs(rationale(r, p));
      while (b === a);
    } else {
      // negativ gegen positiv, Betrag der negativen oft größer
      b = Math.abs(rationale(r, p));
    }
    const [links, rechts] = r.int(0, 1) === 0 ? [a, b] : [b, a];
    const richtig = zeichenIndex(links, rechts);
    const nachBetrag = zeichenIndex(Math.abs(links), Math.abs(rechts));
    return {
      platzhalter: { a: links, b: rechts },
      optionen: ZEICHEN.map((z) => ({ text: de(z) })),
      loesung: auswahl(richtig),
      loesungsweg: [
        de('Auf der Zahlengeraden liegt die kleinere Zahl weiter links.'),
        de(
          links < 0 && rechts < 0 && links !== rechts
            ? 'Bei zwei negativen Zahlen ist die mit dem größeren Betrag die kleinere.'
            : 'Jede negative Zahl ist kleiner als jede positive Zahl.',
        ),
        de(`${zahlText(links)} ${ZEICHEN[richtig]} ${zahlText(rechts)}`),
      ],
      fehlerbilder: fehlerbilderAus(auswahl(richtig), [
        ['betraege-verglichen', auswahl(nachBetrag)],
        ['zeichen-verdreht', richtig === 1 ? undefined : auswahl(2 - richtig)],
      ]),
    };
  },
};

// ---------------------------------------------------------------------------
// Ordnen (M.ZO.RZ.ORDNEN.DER-GROESSE-NACH)

export interface OrdnenParameter {
  readonly anzahl: number; // 4 … 6
  readonly dezimal: boolean;
  readonly max: number; // 10 … 100
}

/** „Ordne der Größe nach: −3; 5; −7; 0,5 …“ – mindestens zwei negative Zahlen */
export const rzOrdnen: Generator<OrdnenParameter> = {
  id: 'rz.ordnen',
  version: 1,
  platzhalter: [],
  fehlerbildIds: ['nach-betrag', 'absteigend'],

  erzeuge(seed, p) {
    verlange(p.anzahl >= 4 && p.anzahl <= 6, 'anzahl: 4 … 6');
    verlange(p.max >= 10 && p.max <= 100, 'max: 10 … 100');
    const r = rng(seed);
    const zahlen = new Set<number>();
    // Falle: eine negative und eine positive Zahl mit gleichem Betrag sowie zwei negative
    const basis = Math.abs(rationale(r, p));
    zahlen.add(-basis).add(basis);
    let zweite: number;
    do zweite = -Math.abs(rationale(r, p));
    while (zahlen.has(zweite));
    zahlen.add(zweite);
    while (zahlen.size < p.anzahl) zahlen.add(rationale(r, p));
    const elemente = mische(r, [...zahlen]);
    const richtig = [...elemente].sort((a, b) => a - b);
    if (elemente.every((x, i) => x === richtig[i])) elemente.reverse();
    // Nach Betrag (bei gleichem Betrag zuerst die negative)
    const nachBetrag = [...elemente].sort((a, b) => Math.abs(a) - Math.abs(b) || a - b);
    const gleich = (a: readonly number[], b: readonly number[]) => a.every((x, i) => x === b[i]);
    const fehlerbilder: Fehlerbild[] = [];
    const vergeben: number[][] = [richtig];
    for (const [id, folge] of [
      ['nach-betrag', nachBetrag],
      ['absteigend', [...richtig].reverse()],
    ] as const) {
      if (vergeben.some((v) => gleich(v, folge))) continue;
      vergeben.push(folge);
      fehlerbilder.push({ id, antwort: { typ: 'reihenfolge', wert: folge } });
    }
    return {
      platzhalter: {},
      elemente,
      loesung: { typ: 'reihenfolge', wert: richtig },
      loesungsweg: [
        de('Ganz links auf der Zahlengeraden steht die negative Zahl mit dem größten Betrag.'),
        de('Danach kommen die übrigen negativen Zahlen, dann die positiven.'),
        de(richtig.map(zahlText).join(' < ')),
      ],
      fehlerbilder,
    };
  },
};

// ---------------------------------------------------------------------------
// Zahlbereiche (M.ZO.RZ.ZAHLBEREICHE.ZUORDNEN, .AUSSAGEN)

/** 0 natürlich (alle vier), 1 negativ ganz, 2 positiv gebrochen, 3 negativ gebrochen */
const BEREICHE = [
  'natürliche, ganze, gebrochene und rationale Zahlen',
  'ganze und rationale Zahlen',
  'gebrochene und rationale Zahlen',
  'nur rationale Zahlen',
] as const;

export interface ZahlbereichParameter {
  /** auch Brüche, die eigentlich ganze Zahlen sind (−12/4), und Dezimalzahlen wie 3,0 */
  readonly verkleidet: boolean;
}

/** „Zu welchen Zahlbereichen gehört −3/4?“ – vier feste Antworten */
export const zahlbereich: Generator<ZahlbereichParameter> = {
  id: 'rz.zahlbereich',
  version: 1,
  platzhalter: ['zahl'],
  fehlerbildIds: [
    'ganze-zahl-vergessen',
    'vorzeichen-uebersehen',
    'natuerlich-nicht-gebrochen',
    'verkleidet-uebersehen',
  ],

  erzeuge(seed, p) {
    const r = rng(seed);
    const fall = r.int(0, 3);
    const n = r.int(1, 30);
    let anzeige: string;
    let verkleidet = false;
    if (p.verkleidet && r.int(0, 2) === 0 && fall <= 1) {
      // Bruch mit ganzzahligem Wert
      const nenner = r.int(2, 6);
      anzeige = `${fall === 1 ? '−' : ''}${n * nenner}/${nenner}`;
      verkleidet = true;
    } else if (fall <= 1) anzeige = zahlText(fall === 1 ? -n : n);
    else {
      const nenner = r.int(2, 9);
      let zaehler: number;
      do zaehler = r.int(1, 3 * nenner);
      while (zaehler % nenner === 0);
      const alsDezimal = r.int(0, 1) === 0;
      const betrag = alsDezimal
        ? zahlText(z10(r.int(1, 99) * 10 + r.int(1, 9)) / 10)
        : `${zaehler}/${nenner}`;
      anzeige = `${fall === 3 ? '−' : ''}${betrag}`;
    }
    const richtig = auswahl(fall);
    return {
      platzhalter: { zahl: de(anzeige) },
      optionen: BEREICHE.map((b) => ({ text: de(b) })),
      loesung: richtig,
      loesungsweg: [
        de(
          'Natürliche Zahlen: 0, 1, 2 … Ganze Zahlen: auch −1, −2 … Gebrochene Zahlen: alle Brüche ohne Minus. Rationale Zahlen: alle Brüche, auch mit Minus.',
        ),
        ...(verkleidet
          ? [de(`${anzeige} = ${zahlText(fall === 1 ? -n : n)} – das ist eine ganze Zahl.`)]
          : []),
        de(`${anzeige} gehört zu: ${BEREICHE[fall]}.`),
      ],
      fehlerbilder: fehlerbilderAus(richtig, [
        ['verkleidet-uebersehen', verkleidet ? auswahl(fall === 0 ? 2 : 3) : undefined],
        ['ganze-zahl-vergessen', fall === 1 ? auswahl(3) : undefined],
        ['vorzeichen-uebersehen', fall === 3 ? auswahl(2) : fall === 1 ? auswahl(0) : undefined],
        ['natuerlich-nicht-gebrochen', fall === 0 ? auswahl(1) : undefined],
      ]),
    };
  },
};

export interface ZahlbereichAussageParameter {
  /** auch Aussagen über Schnitt- und Vereinigungsmengen */
  readonly mengen: boolean;
}

type Aussage = readonly [id: string, text: string, wahr: boolean];

const AUSSAGEN: readonly Aussage[] = [
  ['jede-natuerliche-ganz', 'Jede natürliche Zahl ist eine ganze Zahl.', true],
  ['jede-ganze-rational', 'Jede ganze Zahl ist eine rationale Zahl.', true],
  ['jede-gebrochene-rational', 'Jede gebrochene Zahl ist eine rationale Zahl.', true],
  ['negative-nicht-natuerlich', 'Keine negative Zahl ist eine natürliche Zahl.', true],
  ['zwischen-ganzen', 'Zwischen −1 und 0 liegen rationale Zahlen.', true],
  ['teilmenge-verdreht', 'Jede ganze Zahl ist eine natürliche Zahl.', false],
  ['teilmenge-verdreht', 'Jede rationale Zahl ist eine ganze Zahl.', false],
  ['negativ-gebrochen', '−1/2 ist eine gebrochene Zahl.', false],
  ['kleinste-zahl', 'Es gibt eine kleinste rationale Zahl.', false],
  ['zwischen-ganzen', 'Zwischen −2 und −1 liegt keine Zahl.', false],
];

const MENGEN_AUSSAGEN: readonly Aussage[] = [
  [
    'schnitt-vereinigung',
    'Die Schnittmenge der ganzen und der gebrochenen Zahlen sind die natürlichen Zahlen.',
    true,
  ],
  [
    'schnitt-vereinigung',
    'Die Vereinigungsmenge der natürlichen und der ganzen Zahlen sind die ganzen Zahlen.',
    true,
  ],
  [
    'schnitt-vereinigung',
    'Die Schnittmenge der ganzen und der gebrochenen Zahlen ist leer.',
    false,
  ],
  [
    'schnitt-vereinigung',
    'Die Vereinigungsmenge der ganzen und der gebrochenen Zahlen sind die natürlichen Zahlen.',
    false,
  ],
];

/** „Stimmt die Aussage? Jede ganze Zahl ist eine rationale Zahl.“ – wahr oder falsch */
export const zahlbereichAussage: Generator<ZahlbereichAussageParameter> = {
  id: 'rz.zahlbereich-aussage',
  version: 1,
  platzhalter: ['aussage'],
  fehlerbildIds: [
    'teilmenge-verdreht',
    'negativ-gebrochen',
    'kleinste-zahl',
    'zwischen-ganzen',
    'schnitt-vereinigung',
    'falsch-geglaubt',
  ],

  erzeuge(seed, p) {
    const r = rng(seed);
    const [id, satz, wahr] = r.pick(p.mengen ? [...AUSSAGEN, ...MENGEN_AUSSAGEN] : AUSSAGEN);
    const richtig: Loesung = auswahl(wahr ? 0 : 1);
    return {
      platzhalter: { aussage: de(satz) },
      optionen: [{ text: de('stimmt') }, { text: de('stimmt nicht') }],
      loesung: richtig,
      loesungsweg: [
        de(
          'Natürliche ⊂ ganze ⊂ rationale Zahlen, und natürliche ⊂ gebrochene ⊂ rationale Zahlen.',
        ),
        de(`Die Aussage ${wahr ? 'stimmt' : 'stimmt nicht'}.`),
      ],
      // Wer eine wahre Aussage verwirft, hat keinen bestimmten Fehler – nur der Hinweis bleibt
      fehlerbilder: fehlerbilderAus(richtig, [
        [wahr ? 'falsch-geglaubt' : id, auswahl(wahr ? 1 : 0)],
      ]),
    };
  },
};
