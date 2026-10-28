// Kreiszylinder – Klasse 8 (LEHRPLAN §8d, M.RF.KP.ZYLINDER und M.GM.KP.ZYLINDER):
// Netz erkennen, Länge des Mantelrechtecks, Volumen, Mantel und Oberfläche,
// Hohlzylinder und Masse. Gerechnet wird mit π ≈ 3,14 (wie beim Kreis).
import { runde10 } from '../../../core/learning/format';
import { zahlText } from '../../../core/learning/text';
import type { Bild, Generator } from '../../../core/learning/generator';
import { fehlerbilderAus } from '../../../core/learning/loesung';
import { rng, type Rng } from '../../../core/rng/rng';
import { auswahl, de, mische, verlange, zahl } from '../../hilfen';
import { bild, kreis, linie, rechteck, text } from '../../svg';
import { PI } from '../kreis/berechnen';

const zz = (x: number) => zahl(runde10(x, 4));
const t = (x: number) => zahlText(runde10(x, 4));

/** Schrägbild eines Zylinders mit Beschriftung von Radius und Höhe */
function zylinderBild(rad: number, h: number, beschreibung: string, innen?: number): Bild {
  const rx = 60;
  const ry = 18;
  const hoehe = Math.min(150, Math.max(60, (h / rad) * rx));
  const cx = 100;
  const oben = 44;
  const unten = oben + hoehe;
  const teile = [
    `<ellipse cx="${cx}" cy="${oben}" rx="${rx}" ry="${ry}"/>`,
    linie(cx - rx, oben, cx - rx, unten),
    linie(cx + rx, oben, cx + rx, unten),
    `<path d="M ${cx - rx} ${unten} A ${rx} ${ry} 0 0 0 ${cx + rx} ${unten}"/>`,
    `<path d="M ${cx - rx} ${unten} A ${rx} ${ry} 0 0 1 ${cx + rx} ${unten}" stroke-dasharray="5 4" stroke-width="1.2"/>`,
    kreis(cx, oben, 2.5, true),
    linie(cx, oben, cx + rx, oben, 1.5),
    text(cx + rx / 2, oben - ry - 6, `r = ${t(rad)} cm`, 13),
    text(cx + rx + 40, (oben + unten) / 2, `h = ${t(h)} cm`, 13),
  ];
  if (innen !== undefined) {
    const ri = (rx * innen) / rad;
    teile.push(
      `<ellipse cx="${cx}" cy="${oben}" rx="${ri}" ry="${(ry * ri) / rx}" fill="currentColor" fill-opacity="0.25"/>`,
    );
  }
  return bild(250, unten + 30, teile, de(beschreibung));
}

// ---------------------------------------------------------------------------
// Netz (M.RF.KP.ZYLINDER.NETZ)

type NetzArt = 'richtig' | 'gleiche-seite' | 'kurze-seiten' | 'kreise-zu-klein';

function netzBild(art: NetzArt, r: Rng): Bild {
  const rho = 15;
  const laenge = 2 * Math.PI * rho;
  const h = r.int(40, 60);
  const x0 = 36;
  const y0 = 2 * rho + 10;
  const teile = [rechteck(x0, y0, laenge, h)];
  const k = art === 'kreise-zu-klein' ? rho / 2 : rho;
  const versatz = r.int(0, 1) === 0 ? rho : laenge - rho;
  if (art === 'kurze-seiten') {
    teile.push(kreis(x0 - rho, y0 + h / 2, rho), kreis(x0 + laenge + rho, y0 + h / 2, rho));
  } else {
    teile.push(kreis(x0 + versatz, y0 - k, k));
    if (art === 'gleiche-seite') teile.push(kreis(x0 + laenge - versatz, y0 - k, k));
    else teile.push(kreis(x0 + versatz, y0 + h + k, k));
  }
  const beschreibung: Record<NetzArt, string> = {
    richtig: 'Ein Rechteck mit je einem Kreis an der oberen und an der unteren langen Seite.',
    'gleiche-seite': 'Ein Rechteck mit zwei Kreisen, beide an der oberen langen Seite.',
    'kurze-seiten':
      'Ein Rechteck mit je einem Kreis an der linken und an der rechten kurzen Seite.',
    'kreise-zu-klein': 'Ein Rechteck mit je einem sehr kleinen Kreis oben und unten.',
  };
  return bild(180, y0 + h + 2 * rho + 10, teile, de(beschreibung[art]));
}

export interface ZylinderNetzParameter {
  /** Anzahl der Figuren zur Auswahl: 3 oder 4 */
  readonly figuren: number;
}

/** „Welche Figur ist ein Netz eines Zylinders?“ */
export const zylinderNetz: Generator<ZylinderNetzParameter> = {
  id: 'zy.netz',
  version: 1,
  platzhalter: [],
  fehlerbildIds: ['gleiche-seite', 'kurze-seiten', 'kreise-zu-klein'],

  erzeuge(seed, p) {
    verlange(p.figuren === 3 || p.figuren === 4, 'figuren: 3 oder 4');
    const r = rng(seed);
    const falsche: NetzArt[] =
      p.figuren === 3
        ? mische<NetzArt>(r, ['gleiche-seite', 'kurze-seiten', 'kreise-zu-klein']).slice(0, 2)
        : ['gleiche-seite', 'kurze-seiten', 'kreise-zu-klein'];
    const reihenfolge = mische(r, ['richtig' as NetzArt, ...falsche]);
    const idx = (a: NetzArt) => {
      const i = reihenfolge.indexOf(a);
      return i < 0 ? undefined : auswahl(i);
    };
    const richtig = auswahl(reihenfolge.indexOf('richtig'));
    return {
      platzhalter: {},
      optionen: reihenfolge.map((a) => ({ bild: netzBild(a, r) })),
      loesung: richtig,
      loesungsweg: [
        de(
          'Ein Zylinder hat zwei gleich große Kreise (Grund- und Deckfläche) und einen Mantel. Abgerollt ist der Mantel ein Rechteck.',
        ),
        de(
          'Die Kreise sitzen an den gegenüberliegenden langen Seiten. Die lange Seite ist so lang wie der Kreisumfang.',
        ),
      ],
      fehlerbilder: fehlerbilderAus(richtig, [
        ['gleiche-seite', idx('gleiche-seite')],
        ['kurze-seiten', idx('kurze-seiten')],
        ['kreise-zu-klein', idx('kreise-zu-klein')],
      ]),
    };
  },
};

// ---------------------------------------------------------------------------
// Maße im Netz (M.RF.KP.ZYLINDER.MANTEL)

export interface MantelParameter {
  /** false: Länge des Rechtecks aus r; true: r aus der Länge */
  readonly umkehr: boolean;
}

/** „Wie lang ist das Mantelrechteck?“ / „Welchen Radius haben die Kreise?“ */
export const mantelLaenge: Generator<MantelParameter> = {
  id: 'zy.mantel-laenge',
  version: 1,
  platzhalter: ['aufgabe'],
  fehlerbildIds: ['radius-durchmesser', 'flaeche-statt-umfang', 'hoehe-genommen'],

  erzeuge(seed, p) {
    const r = rng(seed);
    const rad = r.int(2, 15);
    const h = r.int(3, 25);
    const laenge = 2 * PI * rad;
    const beschreibung = `Das Netz eines Zylinders: ein Rechteck, ${t(h)} cm hoch, mit je einem Kreis oben und unten. ${p.umkehr ? `Das Rechteck ist ${t(laenge)} cm lang.` : `Die Kreise haben den Radius ${rad} cm.`}`;
    const L = 130;
    const H = Math.min(80, Math.max(30, (h / rad) * 20));
    const teile = [
      rechteck(30, 44, L, H),
      kreis(30 + 20, 44 - 20, 20),
      kreis(30 + 20, 44 + H + 20, 20),
      text(30 + L + 22, 44 + H / 2 + 4, `${t(h)} cm`, 12),
      p.umkehr
        ? text(30 + L / 2, 44 + H / 2 + 4, `${t(laenge)} cm`, 12)
        : text(110, 25, `r = ${rad} cm`, 12),
      ...(p.umkehr ? [] : [linie(50, 24, 70, 24, 1.5)]),
    ];
    const b = bild(220, 44 + H + 50, teile, de(beschreibung));
    if (!p.umkehr) {
      const richtig = zz(laenge);
      return {
        platzhalter: { aufgabe: de('Wie lang muss das Rechteck sein (in cm)?') },
        bild: b,
        loesung: richtig,
        loesungsweg: [
          de(
            'Die lange Seite des Rechtecks wird um den Kreis gewickelt. Sie ist so lang wie der Kreisumfang.',
          ),
          de(`u = 2 · 3,14 · ${rad} = ${t(laenge)} cm`),
        ],
        fehlerbilder: fehlerbilderAus(richtig, [
          ['radius-durchmesser', zz(PI * rad)],
          ['flaeche-statt-umfang', zz(PI * rad * rad)],
          ['hoehe-genommen', zahl(h)],
        ]),
      };
    }
    const richtig = zahl(rad);
    return {
      platzhalter: { aufgabe: de('Welchen Radius müssen die Kreise haben (in cm)?') },
      bild: b,
      loesung: richtig,
      loesungsweg: [
        de('Die Länge des Rechtecks ist der Kreisumfang: u = 2 · 3,14 · r.'),
        de(`r = ${t(laenge)} : 6,28 = ${rad} cm`),
      ],
      fehlerbilder: fehlerbilderAus(richtig, [
        ['radius-durchmesser', zahl(2 * rad)],
        ['hoehe-genommen', zz(h / (2 * PI))],
      ]),
    };
  },
};

// ---------------------------------------------------------------------------
// Berechnen (M.GM.KP.ZYLINDER)

export interface ZylinderBerechnenParameter {
  /** false: Volumen oder Mantel; true: Oberfläche, Hohlzylinder oder Höhe aus dem Volumen */
  readonly erweitert: boolean;
}

/** „Berechne das Volumen des Zylinders.“ */
export const zylinderBerechnen: Generator<ZylinderBerechnenParameter> = {
  id: 'zy.berechnen',
  version: 1,
  platzhalter: ['aufgabe'],
  fehlerbildIds: [
    'radius-durchmesser',
    'umfang-statt-flaeche',
    'ein-deckel',
    'mantel-statt-oberflaeche',
    'innen-vergessen',
  ],

  erzeuge(seed, p) {
    const r = rng(seed);
    const rad = r.int(2, 12);
    const h = r.int(2, 20);
    const art = p.erweitert
      ? r.pick(['oberflaeche', 'hohl', 'hoehe'] as const)
      : r.pick(['volumen', 'mantel'] as const);
    const G = PI * rad * rad;
    const M = 2 * PI * rad * h;
    const zyl = (b: string, innen?: number) => zylinderBild(rad, h, b, innen);
    if (art === 'volumen' || art === 'mantel') {
      const v = art === 'volumen';
      const richtig = zz(v ? G * h : M);
      return {
        platzhalter: {
          aufgabe: de(
            v
              ? 'Berechne das Volumen V des Zylinders in cm³.'
              : 'Berechne den Flächeninhalt des Mantels in cm².',
          ),
        },
        bild: zyl(`Ein Zylinder mit dem Radius ${rad} cm und der Höhe ${h} cm.`),
        loesung: richtig,
        loesungsweg: v
          ? [
              de(`Grundfläche: 3,14 · ${rad}² = ${t(G)} cm²`),
              de(`V = ${t(G)} · ${h} = ${t(G * h)} cm³`),
            ]
          : [
              de(`Der Mantel ist ein Rechteck: Umfang mal Höhe.`),
              de(`M = 2 · 3,14 · ${rad} · ${h} = ${t(M)} cm²`),
            ],
        fehlerbilder: fehlerbilderAus(richtig, [
          ['radius-durchmesser', zz(v ? PI * 4 * rad * rad * h : PI * rad * h)],
          ['umfang-statt-flaeche', v ? zz(2 * PI * rad * h) : zz(G * h)],
        ]),
      };
    }
    if (art === 'oberflaeche') {
      const O = 2 * G + M;
      const richtig = zz(O);
      return {
        platzhalter: { aufgabe: de('Berechne die Oberfläche O des Zylinders in cm².') },
        bild: zyl(`Ein Zylinder mit dem Radius ${rad} cm und der Höhe ${h} cm.`),
        loesung: richtig,
        loesungsweg: [
          de(`Zwei Kreise: 2 · 3,14 · ${rad}² = ${t(2 * G)} cm²`),
          de(`Mantel: 2 · 3,14 · ${rad} · ${h} = ${t(M)} cm²`),
          de(`O = ${t(O)} cm²`),
        ],
        fehlerbilder: fehlerbilderAus(richtig, [
          ['mantel-statt-oberflaeche', zz(M)],
          ['ein-deckel', zz(G + M)],
        ]),
      };
    }
    if (art === 'hohl') {
      const ri = r.int(1, rad - 1);
      const V = PI * (rad * rad - ri * ri) * h;
      const richtig = zz(V);
      return {
        platzhalter: {
          aufgabe: de(
            `Ein Rohr (Hohlzylinder) hat außen den Radius ${rad} cm, innen den Radius ${ri} cm und ist ${h} cm lang. Berechne das Volumen des Materials in cm³.`,
          ),
        },
        bild: zyl(
          `Ein Hohlzylinder mit dem äußeren Radius ${rad} cm, dem inneren Radius ${ri} cm und der Höhe ${h} cm.`,
          ri,
        ),
        loesung: richtig,
        loesungsweg: [
          de(
            `Grundfläche ist ein Kreisring: 3,14 · (${rad}² − ${ri}²) = ${t(PI * (rad * rad - ri * ri))} cm²`,
          ),
          de(`V = ${t(PI * (rad * rad - ri * ri))} · ${h} = ${t(V)} cm³`),
        ],
        fehlerbilder: fehlerbilderAus(richtig, [
          ['innen-vergessen', zz(G * h)],
          ['radius-durchmesser', zz(PI * (rad - ri) * (rad - ri) * h)],
        ]),
      };
    }
    // Höhe aus dem Volumen
    const V = G * h;
    const richtig = zahl(h);
    return {
      platzhalter: {
        aufgabe: de(
          `Ein Zylinder hat den Radius ${rad} cm und das Volumen ${t(V)} cm³. Wie hoch ist er (in cm)?`,
        ),
      },
      loesung: richtig,
      loesungsweg: [
        de(`Grundfläche: 3,14 · ${rad}² = ${t(G)} cm²`),
        de(`h = V : G = ${t(V)} : ${t(G)} = ${h} cm`),
      ],
      fehlerbilder: fehlerbilderAus(richtig, [
        ['radius-durchmesser', zz(V / (PI * 4 * rad * rad))],
        ['umfang-statt-flaeche', zz(V / (2 * PI * rad))],
      ]),
    };
  },
};

const STOFFE = [
  { name: 'Aluminium', dichte: 2.7 },
  { name: 'Eisen', dichte: 7.9 },
  { name: 'Kupfer', dichte: 8.9 },
] as const;

export interface ZylinderSachParameter {
  /** false: Inhalt einer Dose in ml oder l; true: Masse eines Stabs oder Rohrs */
  readonly masse: boolean;
}

/** „Wie viel ml passen in die Dose?“ / „Wie schwer ist der Stab?“ */
export const zylinderSach: Generator<ZylinderSachParameter> = {
  id: 'zy.sach',
  version: 1,
  platzhalter: ['aufgabe'],
  fehlerbildIds: ['radius-durchmesser', 'einheit-falsch', 'dichte-vergessen'],

  erzeuge(seed, p) {
    const r = rng(seed);
    if (!p.masse) {
      const d = 2 * r.int(2, 6);
      const h = r.int(5, 20);
      const V = PI * (d / 2) ** 2 * h; // cm³ = ml
      const liter = r.int(0, 2) === 0;
      const richtig = zz(liter ? V / 1000 : V);
      const was = r.pick([
        'Eine Konservendose',
        'Ein Trinkbecher',
        'Eine Teedose',
        'Ein Messbecher',
      ] as const);
      return {
        platzhalter: {
          aufgabe: de(
            `${was} ist zylinderförmig: ${d} cm Durchmesser, ${h} cm hoch. Wie viel ${liter ? 'Liter' : 'ml'} passen hinein?`,
          ),
        },
        loesung: richtig,
        loesungsweg: [
          de(`r = ${d / 2} cm; V = 3,14 · ${d / 2}² · ${h} = ${t(V)} cm³`),
          de(liter ? `1 000 cm³ = 1 l, also ${t(V / 1000)} l` : `1 cm³ = 1 ml, also ${t(V)} ml`),
        ],
        fehlerbilder: fehlerbilderAus(richtig, [
          ['radius-durchmesser', zz((liter ? 1 / 1000 : 1) * PI * d * d * h)],
          ['einheit-falsch', liter ? zz(V) : undefined],
        ]),
      };
    }
    const stoff = r.pick(STOFFE);
    const rad = r.int(1, 8);
    const h = 5 * r.int(2, 30);
    const V = PI * rad * rad * h;
    const m = Math.round(V * stoff.dichte);
    const richtig = zahl(m);
    return {
      platzhalter: {
        aufgabe: de(
          `Ein Stab aus ${stoff.name} ist ${h} cm lang und hat ${rad} cm Radius. ${stoff.name} hat die Dichte ${t(stoff.dichte)} g/cm³. Wie viel Gramm wiegt der Stab? Runde auf ganze Gramm.`,
        ),
      },
      loesung: richtig,
      loesungsweg: [
        de(`V = 3,14 · ${rad}² · ${h} = ${t(V)} cm³`),
        de(`m = V · Dichte = ${t(V)} · ${t(stoff.dichte)} ≈ ${m} g`),
      ],
      fehlerbilder: fehlerbilderAus(richtig, [
        ['dichte-vergessen', zahl(Math.round(V))],
        ['radius-durchmesser', zahl(Math.round(PI * 4 * rad * rad * h * stoff.dichte))],
      ]),
    };
  },
};
