// Kreis und Begründen – Klasse 7 (LEHRPLAN §8c, Feld KR): Sekante, Tangente,
// Passante; Inkreis und Umkreis; Satz des Thales, Peripherie- und Zentriwinkel,
// Sehnenviereck; Voraussetzung und Behauptung, Umkehrung, Gegenbeispiel.
import type { Generator } from '../../../core/learning/generator';
import { fehlerbilderAus } from '../../../core/learning/loesung';
import { rng } from '../../../core/rng/rng';
import { auswahl, de, mische, zahl } from '../../hilfen';
import { aufKreis, bild, bogen, kreis, linie, punkt, text } from '../../svg';

// ---------------------------------------------------------------------------
// Lage von Kreis und Gerade (M.RF.KR.LAGE.GERADE)

const LAGEN = ['Sekante', 'Tangente', 'Passante'] as const;

export interface LageParameter {
  /** false: am Bild erkennen; true: aus Abstand d und Radius r schließen */
  readonly abstand: boolean;
}

/** „Wie heißt die Gerade g?“ – Sekante, Tangente oder Passante */
export const kreisGerade: Generator<LageParameter> = {
  id: 'kr.kreis-gerade',
  version: 1,
  platzhalter: ['frage'],
  fehlerbildIds: ['sekante-tangente-verwechselt', 'passante-verwechselt'],

  erzeuge(seed, p) {
    const r = rng(seed);
    const lage = r.int(0, 2);
    const richtig = auswahl(lage);
    const optionen = LAGEN.map((l) => ({ text: de(l) }));
    const fehler = fehlerbilderAus(richtig, [
      [
        'sekante-tangente-verwechselt',
        lage === 0 ? auswahl(1) : lage === 1 ? auswahl(0) : undefined,
      ],
      ['passante-verwechselt', lage === 2 ? auswahl(1) : auswahl(2)],
    ]);
    if (p.abstand) {
      const radius = r.int(3, 9);
      const d =
        lage === 0 ? r.int(0, radius - 1) : lage === 1 ? radius : r.int(radius + 1, radius + 5);
      return {
        platzhalter: {
          frage: de(
            `Ein Kreis hat den Radius r = ${radius} cm. Eine Gerade g hat vom Mittelpunkt den Abstand ${d} cm. Wie heißt g?`,
          ),
        },
        optionen,
        loesung: richtig,
        loesungsweg: [
          de(
            'Abstand kleiner als r: zwei Schnittpunkte (Sekante). Gleich r: ein Berührpunkt (Tangente). Größer als r: kein gemeinsamer Punkt (Passante).',
          ),
          de(
            `${d} cm ${d < radius ? '<' : d === radius ? '=' : '>'} ${radius} cm – also ${LAGEN[lage]}.`,
          ),
        ],
        fehlerbilder: fehler,
      };
    }
    // Bild: Kreis um M, waagerechte Gerade im Abstand d
    const [mx, my, rad] = [150, 110, 70];
    const d = lage === 0 ? r.int(10, 50) : lage === 1 ? rad : r.int(rad + 12, rad + 30);
    const y = my + (r.int(0, 1) === 0 ? -d : d);
    const teile = [
      kreis(mx, my, rad),
      kreis(mx, my, 3, true),
      text(mx + 12, my + 4, 'M', 14),
      linie(20, y, 280, y),
      text(272, y - 8, 'g', 15),
    ];
    if (lage < 2) {
      const dx = Math.sqrt(Math.max(0, rad * rad - (y - my) ** 2));
      teile.push(kreis(mx - dx, y, 3.5, true));
      if (lage === 0) teile.push(kreis(mx + dx, y, 3.5, true));
    }
    return {
      platzhalter: { frage: de('Wie heißt die Gerade g?') },
      bild: bild(
        300,
        220,
        teile,
        de(
          `Ein Kreis um M und eine Gerade g. ${lage === 0 ? 'g schneidet den Kreis in zwei Punkten.' : lage === 1 ? 'g berührt den Kreis in genau einem Punkt.' : 'g geht am Kreis vorbei.'}`,
        ),
      ),
      optionen,
      loesung: richtig,
      loesungsweg: [
        de(
          'Zähle die gemeinsamen Punkte von Gerade und Kreis: zwei – Sekante, einer – Tangente, keiner – Passante.',
        ),
        de(`Hier: ${LAGEN[lage]}.`),
      ],
      fehlerbilder: fehler,
    };
  },
};

// ---------------------------------------------------------------------------
// Inkreis und Umkreis (M.RF.KR.LAGE.IN-UMKREIS)

const LINIEN = ['Mittelsenkrechten', 'Winkelhalbierenden', 'Seitenhalbierenden', 'Höhen'] as const;

export interface InUmkreisParameter {
  /** auch: Wo liegt der Umkreismittelpunkt beim rechtwinkligen, stumpfwinkligen Dreieck? */
  readonly lage: boolean;
}

const UMKREIS_LAGE = [
  { dreieck: 'spitzwinkligen', antwort: 0 },
  { dreieck: 'rechtwinkligen', antwort: 1 },
  { dreieck: 'stumpfwinkligen', antwort: 2 },
] as const;
const ORTE = [
  'innerhalb des Dreiecks',
  'genau in der Mitte der längsten Seite',
  'außerhalb des Dreiecks',
] as const;

/** „Der Mittelpunkt des Umkreises ist der Schnittpunkt der …“ */
export const inUmkreis: Generator<InUmkreisParameter> = {
  id: 'kr.in-umkreis',
  version: 1,
  platzhalter: ['frage'],
  fehlerbildIds: ['in-um-verwechselt', 'andere-linie', 'immer-innen'],

  erzeuge(seed, p) {
    const r = rng(seed);
    if (p.lage && r.int(0, 1) === 0) {
      const f = r.pick(UMKREIS_LAGE);
      const richtig = auswahl(f.antwort);
      return {
        platzhalter: {
          frage: de(`Wo liegt der Mittelpunkt des Umkreises bei einem ${f.dreieck} Dreieck?`),
        },
        optionen: ORTE.map((o) => ({ text: de(o) })),
        loesung: richtig,
        loesungsweg: [
          de(
            'Beim rechtwinkligen Dreieck ist die längste Seite ein Durchmesser des Umkreises (Satz des Thales).',
          ),
          de(`Hier: ${ORTE[f.antwort]}.`),
        ],
        fehlerbilder: fehlerbilderAus(richtig, [
          ['immer-innen', f.antwort === 0 ? undefined : auswahl(0)],
        ]),
      };
    }
    const um = r.int(0, 1) === 0;
    const richtig = auswahl(um ? 0 : 1);
    return {
      platzhalter: {
        frage: de(
          `Der Mittelpunkt des ${um ? 'Umkreises' : 'Inkreises'} eines Dreiecks ist der Schnittpunkt der …`,
        ),
      },
      optionen: LINIEN.map((l) => ({ text: de(l) })),
      loesung: richtig,
      loesungsweg: [
        de(
          'Der Umkreis geht durch alle drei Ecken: Sein Mittelpunkt ist von allen Ecken gleich weit weg – das leisten die Mittelsenkrechten.',
        ),
        de(
          'Der Inkreis berührt alle drei Seiten: Sein Mittelpunkt ist von allen Seiten gleich weit weg – das leisten die Winkelhalbierenden.',
        ),
      ],
      fehlerbilder: fehlerbilderAus(richtig, [
        ['in-um-verwechselt', auswahl(um ? 1 : 0)],
        ['andere-linie', auswahl(r.int(2, 3))],
      ]),
    };
  },
};

// ---------------------------------------------------------------------------
// Winkel am Kreis berechnen (M.RF.KR.WINKELSAETZE.BERECHNEN)

type Satz = 'thales' | 'zentri' | 'sehnenviereck';

export interface WinkelAmKreisParameter {
  readonly saetze: readonly Satz[];
}

/** Winkel am Kreis mit Bild: Thales, Zentri-Peripheriewinkel, Sehnenviereck */
export const winkelAmKreis: Generator<WinkelAmKreisParameter> = {
  id: 'kr.winkel-am-kreis',
  version: 1,
  platzhalter: ['frage'],
  fehlerbildIds: [
    'ohne-rechten-winkel',
    'halbiert-statt-verdoppelt',
    'gleich-gesetzt',
    'voll-statt-gestreckt',
  ],

  erzeuge(seed, p) {
    const r = rng(seed);
    const satz = r.pick(p.saetze);
    const [mx, my, rad] = [150, 120, 90];
    const P = (w: number) => aufKreis(mx, my, rad, w);
    const grund = [kreis(mx, my, rad), kreis(mx, my, 2.5, true)];
    if (satz === 'thales') {
      const alpha = r.int(15, 75);
      // Der Winkel bei A ist halb so groß wie der Mittelpunktswinkel BMC: C liegt bei 2·α
      const A = P(180);
      const B = P(0);
      const C = P(2 * alpha);
      const wert = 90 - alpha;
      const richtig = zahl(wert);
      return {
        platzhalter: {
          frage: de(
            `AB ist ein Durchmesser, C liegt auf dem Kreis. Bei A ist der Winkel α = ${alpha}°. Wie groß ist der Winkel β bei B?`,
          ),
        },
        bild: bild(
          300,
          240,
          [
            ...grund,
            linie(A[0], A[1], B[0], B[1]),
            linie(A[0], A[1], C[0], C[1]),
            linie(B[0], B[1], C[0], C[1]),
            punkt(A[0], A[1], 'A'),
            punkt(B[0], B[1], 'B'),
            punkt(C[0], C[1], 'C'),
            text(A[0] + 30, A[1] - 6, 'α', 14),
            text(B[0] - 28, B[1] - 6, 'β', 14),
          ],
          de(
            `Ein Kreis mit dem Durchmesser AB. C liegt auf dem Kreis, das Dreieck ABC ist eingezeichnet. α = ${alpha}° bei A.`,
          ),
        ),
        loesung: richtig,
        loesungsweg: [
          de('Satz des Thales: Der Winkel bei C ist ein rechter Winkel, also 90°.'),
          de(`Innenwinkelsumme: β = 180° − 90° − ${alpha}° = ${wert}°`),
        ],
        fehlerbilder: fehlerbilderAus(richtig, [['ohne-rechten-winkel', zahl(180 - alpha)]]),
      };
    }
    if (satz === 'zentri') {
      const gamma = r.int(20, 80);
      const nachZentri = r.int(0, 1) === 0;
      // A und B symmetrisch unten, C oben
      const halb = gamma; // Zentriwinkel 2γ, also A und B je γ vom unteren Punkt entfernt
      const A = P(270 - halb);
      const B = P(270 + halb);
      const C = P(90 + r.int(-20, 20));
      const zentri = 2 * gamma;
      const wert = nachZentri ? zentri : gamma;
      const richtig = zahl(wert);
      return {
        platzhalter: {
          frage: de(
            nachZentri
              ? `M ist der Mittelpunkt. Der Peripheriewinkel bei C über der Sehne AB ist ${gamma}°. Wie groß ist der Zentriwinkel bei M?`
              : `M ist der Mittelpunkt. Der Zentriwinkel bei M über der Sehne AB ist ${zentri}°. Wie groß ist der Peripheriewinkel bei C?`,
          ),
        },
        bild: bild(
          300,
          240,
          [
            ...grund,
            linie(A[0], A[1], C[0], C[1]),
            linie(B[0], B[1], C[0], C[1]),
            linie(A[0], A[1], mx, my),
            linie(B[0], B[1], mx, my),
            punkt(A[0], A[1], 'A'),
            punkt(B[0], B[1], 'B'),
            punkt(C[0], C[1], 'C'),
            text(mx + 12, my - 6, 'M', 14),
            bogen(mx, my, 18, 270 - halb, 270 + halb),
          ],
          de(
            'Ein Kreis um M mit den Punkten A, B und C auf dem Kreis. A und C sowie B und C sind verbunden, ebenso A und B mit M.',
          ),
        ),
        loesung: richtig,
        loesungsweg: [
          de(
            'Zentri-Peripheriewinkelsatz: Der Zentriwinkel ist doppelt so groß wie der Peripheriewinkel über derselben Sehne.',
          ),
          de(nachZentri ? `2 · ${gamma}° = ${zentri}°` : `${zentri}° : 2 = ${gamma}°`),
        ],
        fehlerbilder: fehlerbilderAus(richtig, [
          ['halbiert-statt-verdoppelt', nachZentri ? zahl(gamma / 2) : zahl(zentri * 2)],
          ['gleich-gesetzt', zahl(nachZentri ? gamma : zentri)],
        ]),
      };
    }
    // Sehnenviereck: Gegenwinkel ergänzen sich zu 180°
    const alpha = r.int(55, 125);
    // Der Winkel bei A ist halb so groß wie der Bogen BCD: B bei 360° − α, D bei α
    const [A, B, C, D] = [P(180), P(360 - alpha), P(0), P(alpha)];
    const wert = 180 - alpha;
    const richtig = zahl(wert);
    return {
      platzhalter: {
        frage: de(
          `ABCD ist ein Sehnenviereck: Alle Ecken liegen auf dem Kreis. Bei A ist der Winkel α = ${alpha}°. Wie groß ist der Winkel γ bei C?`,
        ),
      },
      bild: bild(
        300,
        240,
        [
          ...grund,
          linie(A[0], A[1], B[0], B[1]),
          linie(B[0], B[1], C[0], C[1]),
          linie(C[0], C[1], D[0], D[1]),
          linie(D[0], D[1], A[0], A[1]),
          punkt(A[0], A[1], 'A'),
          punkt(B[0], B[1], 'B'),
          punkt(C[0], C[1], 'C'),
          punkt(D[0], D[1], 'D'),
        ],
        de('Ein Viereck ABCD, dessen vier Ecken auf einem Kreis liegen.'),
      ),
      loesung: richtig,
      loesungsweg: [
        de('Im Sehnenviereck ergänzen sich gegenüberliegende Winkel zu 180°.'),
        de(`γ = 180° − ${alpha}° = ${wert}°`),
      ],
      fehlerbilder: fehlerbilderAus(richtig, [
        ['gleich-gesetzt', zahl(alpha)],
        ['voll-statt-gestreckt', zahl(360 - alpha)],
      ]),
    };
  },
};

// ---------------------------------------------------------------------------
// Passenden Satz wählen (M.RF.KR.WINKELSAETZE.SATZ)

const SAETZE = [
  'Satz des Thales',
  'Zentri-Peripheriewinkelsatz',
  'Peripheriewinkelsatz',
  'Satz über das Sehnenviereck',
] as const;
const LAGEN_SATZ: readonly (readonly [string, number])[] = [
  [
    'Ein Dreieck ABC hat die Ecke C auf einem Kreis mit dem Durchmesser AB. Gesucht ist der Winkel bei C.',
    0,
  ],
  [
    'Man will zeigen, dass ein Winkel ein rechter Winkel ist. Seine Ecke liegt auf einem Halbkreis.',
    0,
  ],
  [
    'Bekannt ist der Winkel bei M zwischen zwei Radien. Gesucht ist ein Winkel auf dem Kreis über derselben Sehne.',
    1,
  ],
  [
    'Zwei Punkte C und D liegen auf demselben Kreisbogen über der Sehne AB. Man will zeigen, dass die Winkel bei C und D gleich groß sind.',
    2,
  ],
  [
    'Ein Viereck hat alle vier Ecken auf einem Kreis. Bekannt ist ein Winkel, gesucht der gegenüberliegende.',
    3,
  ],
  [
    'Alle Ecken eines Vierecks liegen auf einem Kreis. Man will zeigen, dass gegenüberliegende Winkel zusammen 180° ergeben.',
    3,
  ],
];

/** „Welcher Satz hilft hier?“ */
export const satzWaehlen: Generator<Record<string, never>> = {
  id: 'kr.satz-waehlen',
  version: 1,
  platzhalter: ['lage'],
  fehlerbildIds: ['anderer-satz'],

  erzeuge(seed) {
    const r = rng(seed);
    const [lage, satz] = r.pick(LAGEN_SATZ);
    const richtig = auswahl(satz);
    const falsch = (satz + r.int(1, 3)) % 4;
    return {
      platzhalter: { lage: de(lage) },
      optionen: SAETZE.map((s) => ({ text: de(s) })),
      loesung: richtig,
      loesungsweg: [
        de(
          'Thales: Winkel über einem Durchmesser. Zentri-Peripherie: Winkel bei M und auf dem Kreis. Peripheriewinkel: Winkel auf demselben Bogen. Sehnenviereck: gegenüberliegende Winkel.',
        ),
        de(`Hier hilft der ${SAETZE[satz]}.`),
      ],
      fehlerbilder: fehlerbilderAus(richtig, [['anderer-satz', auswahl(falsch)]]),
    };
  },
};

// ---------------------------------------------------------------------------
// Voraussetzung, Behauptung, Umkehrung (M.RF.KR.BEGRUENDEN.SATZBAU)

interface WennDann {
  readonly wenn: string;
  readonly dann: string;
  /** Stimmt die Umkehrung „Wenn dann …, dann wenn …“? */
  readonly umkehrungWahr: boolean;
}

const WENN_DANN: readonly WennDann[] = [
  {
    wenn: 'ein Viereck ein Quadrat ist',
    dann: 'sind alle vier Seiten gleich lang',
    umkehrungWahr: false,
  },
  { wenn: 'eine Zahl durch 4 teilbar ist', dann: 'ist sie gerade', umkehrungWahr: false },
  {
    wenn: 'C auf dem Kreis mit dem Durchmesser AB liegt',
    dann: 'ist der Winkel bei C ein rechter Winkel',
    umkehrungWahr: true,
  },
  {
    wenn: 'ein Dreieck gleichseitig ist',
    dann: 'sind alle drei Winkel 60° groß',
    umkehrungWahr: true,
  },
  { wenn: 'zwei Winkel Scheitelwinkel sind', dann: 'sind sie gleich groß', umkehrungWahr: false },
  {
    wenn: 'ein Viereck ein Rechteck ist',
    dann: 'sind seine Diagonalen gleich lang',
    umkehrungWahr: false,
  },
  { wenn: 'eine Zahl auf 0 endet', dann: 'ist sie durch 5 teilbar', umkehrungWahr: false },
  {
    wenn: 'ein Dreieck zwei gleich große Winkel hat',
    dann: 'ist es gleichschenklig',
    umkehrungWahr: true,
  },
];

export interface SatzbauParameter {
  /** auch: Stimmt die Umkehrung? */
  readonly umkehrung: boolean;
}

/** „Was ist die Voraussetzung in: Wenn …, dann …?“ bzw. „Stimmt die Umkehrung?“ */
export const satzbau: Generator<SatzbauParameter> = {
  id: 'kr.satzbau',
  version: 1,
  platzhalter: ['frage'],
  fehlerbildIds: [
    'voraussetzung-behauptung-vertauscht',
    'umkehrung-gleich-satz',
    'umkehrung-zu-streng',
  ],

  erzeuge(seed, p) {
    const r = rng(seed);
    const s = r.pick(WENN_DANN);
    const satz = `Wenn ${s.wenn}, dann ${s.dann}.`;
    if (p.umkehrung && r.int(0, 1) === 0) {
      const richtig = auswahl(s.umkehrungWahr ? 0 : 1);
      return {
        platzhalter: { frage: de(`Der Satz „${satz}“ stimmt. Stimmt auch seine Umkehrung?`) },
        optionen: [
          { text: de('Ja, die Umkehrung stimmt auch.') },
          { text: de('Nein, es gibt ein Gegenbeispiel.') },
        ],
        loesung: richtig,
        loesungsweg: [
          de('Bei der Umkehrung tauschen Voraussetzung und Behauptung die Plätze.'),
          de(
            s.umkehrungWahr
              ? 'Hier stimmt auch die Umkehrung.'
              : 'Hier stimmt die Umkehrung nicht – suche ein Gegenbeispiel.',
          ),
        ],
        fehlerbilder: fehlerbilderAus(richtig, [
          [
            s.umkehrungWahr ? 'umkehrung-zu-streng' : 'umkehrung-gleich-satz',
            auswahl(s.umkehrungWahr ? 1 : 0),
          ],
        ]),
      };
    }
    const fragtVoraussetzung = r.int(0, 1) === 0;
    const teile = mische(r, [s.wenn, s.dann]);
    const richtig = auswahl(teile.indexOf(fragtVoraussetzung ? s.wenn : s.dann));
    return {
      platzhalter: {
        frage: de(
          `Was ist in dem Satz „${satz}“ die ${fragtVoraussetzung ? 'Voraussetzung' : 'Behauptung'}?`,
        ),
      },
      optionen: teile.map((t) => ({ text: de(`„${t}“`) })),
      loesung: richtig,
      loesungsweg: [
        de('Die Voraussetzung steht nach „Wenn“, die Behauptung nach „dann“.'),
        de(`Voraussetzung: „${s.wenn}“. Behauptung: „${s.dann}“.`),
      ],
      fehlerbilder: fehlerbilderAus(richtig, [
        [
          'voraussetzung-behauptung-vertauscht',
          auswahl(teile.indexOf(fragtVoraussetzung ? s.dann : s.wenn)),
        ],
      ]),
    };
  },
};

// ---------------------------------------------------------------------------
// Gegenbeispiel finden (M.RF.KR.BEGRUENDEN.GEGENBEISPIEL)

interface Allaussage {
  readonly aussage: string;
  readonly gegenbeispiel: string;
  readonly kandidaten: readonly [string, string, string];
  readonly geometrie: boolean;
}

const ALLAUSSAGEN: readonly Allaussage[] = [
  {
    aussage: 'Jede Primzahl ist ungerade.',
    gegenbeispiel: '2',
    kandidaten: ['3', '9', '7'],
    geometrie: false,
  },
  {
    aussage: 'Jede durch 3 teilbare Zahl ist auch durch 6 teilbar.',
    gegenbeispiel: '9',
    kandidaten: ['12', '18', '6'],
    geometrie: false,
  },
  {
    aussage: 'Das Produkt zweier Zahlen ist immer größer als jede der beiden Zahlen.',
    gegenbeispiel: '0,5 · 4',
    kandidaten: ['3 · 4', '2 · 7', '5 · 5'],
    geometrie: false,
  },
  {
    aussage: 'Die Summe zweier ganzer Zahlen ist immer größer als jede der beiden Zahlen.',
    gegenbeispiel: '5 + (−2)',
    kandidaten: ['5 + 2', '3 + 8', '10 + 1'],
    geometrie: false,
  },
  {
    aussage: 'Jedes Quadrat einer Zahl ist größer als die Zahl selbst.',
    gegenbeispiel: '0,5',
    kandidaten: ['3', '2', '10'],
    geometrie: false,
  },
  {
    aussage: 'Jedes Viereck mit vier gleich langen Seiten ist ein Quadrat.',
    gegenbeispiel: 'eine Raute mit Winkeln von 60° und 120°',
    kandidaten: [
      'ein Quadrat mit 5 cm Seitenlänge',
      'ein Rechteck mit 3 cm und 5 cm',
      'ein Trapez',
    ],
    geometrie: true,
  },
  {
    aussage: 'Jedes Viereck mit gleich langen Diagonalen ist ein Rechteck.',
    gegenbeispiel: 'ein gleichschenkliges Trapez',
    kandidaten: ['ein Quadrat', 'ein Rechteck', 'ein Rechteck mit 2 cm und 6 cm'],
    geometrie: true,
  },
  {
    aussage: 'In jedem Dreieck ist ein Winkel größer als 60°.',
    gegenbeispiel: 'ein gleichseitiges Dreieck',
    kandidaten: [
      'ein rechtwinkliges Dreieck',
      'ein stumpfwinkliges Dreieck',
      'ein Dreieck mit 50°, 50° und 80°',
    ],
    geometrie: true,
  },
  {
    aussage: 'Jedes Dreieck mit einem Winkel von 90° ist gleichschenklig.',
    gegenbeispiel: 'ein Dreieck mit 90°, 30° und 60°',
    kandidaten: [
      'ein Dreieck mit 90°, 45° und 45°',
      'ein gleichschenkliges Dreieck',
      'ein gleichseitiges Dreieck',
    ],
    geometrie: true,
  },
];

export interface GegenbeispielParameter {
  readonly geometrie: boolean;
}

/** „Welches Beispiel widerlegt die Aussage?“ */
export const gegenbeispiel: Generator<GegenbeispielParameter> = {
  id: 'kr.gegenbeispiel',
  version: 1,
  platzhalter: ['aussage'],
  fehlerbildIds: ['bestaetigt-statt-widerlegt'],

  erzeuge(seed, p) {
    const r = rng(seed);
    const a = r.pick(ALLAUSSAGEN.filter((x) => p.geometrie || !x.geometrie));
    const optionen = mische(r, [a.gegenbeispiel, ...a.kandidaten]);
    const richtig = auswahl(optionen.indexOf(a.gegenbeispiel));
    const bestaetigt = optionen.findIndex((o) => o !== a.gegenbeispiel);
    return {
      platzhalter: { aussage: de(a.aussage) },
      optionen: optionen.map((o) => ({ text: de(o) })),
      loesung: richtig,
      loesungsweg: [
        de(
          'Ein Gegenbeispiel erfüllt die Voraussetzung, aber nicht die Behauptung. Ein einziges genügt, um eine Aussage über „jede“ Zahl oder Figur zu widerlegen.',
        ),
        de(`Gegenbeispiel: ${a.gegenbeispiel}.`),
      ],
      fehlerbilder: fehlerbilderAus(richtig, [['bestaetigt-statt-widerlegt', auswahl(bestaetigt)]]),
    };
  },
};
