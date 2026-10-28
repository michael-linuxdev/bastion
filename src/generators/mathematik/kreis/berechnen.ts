// Kreisberechnung – Klasse 8 (LEHRPLAN §8d, M.GM.KR): Umfang und Flächeninhalt,
// Umkehraufgaben, Sachaufgaben, Kreisring, Halb- und Viertelkreise und daraus
// zusammengesetzte Figuren. Gerechnet wird mit π ≈ 3,14, damit jede Lösung genau
// ist (höchstens zwei Stellen nach dem Komma, ohne Runden).
import { runde10 } from '../../../core/learning/format';
import { zahlText } from '../../../core/learning/text';
import type { Bild, Generator } from '../../../core/learning/generator';
import { fehlerbilderAus } from '../../../core/learning/loesung';
import { rng } from '../../../core/rng/rng';
import { de, zahl } from '../../hilfen';
import { bild, kreis, linie, text } from '../../svg';

export const PI = 3.14;
const zz = (x: number) => zahl(runde10(x, 4));
const t = (x: number) => zahlText(runde10(x, 4));

// ---------------------------------------------------------------------------
// Bilder

/** Kreis mit eingezeichnetem Radius oder Durchmesser */
function kreisBild(wert: number, art: 'r' | 'd'): Bild {
  const m = 100;
  const rr = 70;
  const teile = [kreis(m, m, rr), kreis(m, m, 3, true)];
  if (art === 'r')
    teile.push(linie(m, m, m + rr, m), text(m + rr / 2, m - 8, `r = ${t(wert)} cm`, 14));
  else teile.push(linie(m - rr, m, m + rr, m), text(m, m - 8, `d = ${t(wert)} cm`, 14));
  return bild(
    200,
    200,
    teile,
    de(
      `Ein Kreis. Eingezeichnet ist ${art === 'r' ? 'der Radius' : 'der Durchmesser'} ${art} = ${t(wert)} cm.`,
    ),
  );
}

/** Kreisring mit äußerem und innerem Radius */
function ringBild(aussen: number, innen: number, einheit: string): Bild {
  const m = 100;
  const ra = 80;
  const ri = Math.max(18, (ra * innen) / aussen);
  return bild(
    200,
    200,
    [
      `<path d="M ${m - ra} ${m} a ${ra} ${ra} 0 1 0 ${2 * ra} 0 a ${ra} ${ra} 0 1 0 ${-2 * ra} 0 Z M ${m - ri} ${m} a ${ri} ${ri} 0 1 1 ${2 * ri} 0 a ${ri} ${ri} 0 1 1 ${-2 * ri} 0 Z" fill="currentColor" fill-opacity="0.25" fill-rule="evenodd"/>`,
      kreis(m, m, 3, true),
      linie(m, m, m, m - ra),
      text(m - 28, m - ra / 2, `${t(aussen)} ${einheit}`, 13),
      linie(m, m, m + ri, m),
      text(m + ri / 2, m + 16, `${t(innen)} ${einheit}`, 13),
    ],
    de(
      `Ein Kreisring. Der äußere Radius ist ${t(aussen)} ${einheit}, der innere Radius ${t(innen)} ${einheit}.`,
    ),
  );
}

// ---------------------------------------------------------------------------
// Umfang und Flächeninhalt (M.GM.KR.UMFANG-FLAECHE)

export interface KreisParameter {
  /** false: u oder A aus r oder d; true: r oder d aus u oder A */
  readonly umkehr: boolean;
}

/** „Berechne den Flächeninhalt des Kreises.“ / „Ein Kreis hat den Umfang 31,4 cm. Wie groß ist d?“ */
export const kreisBerechnen: Generator<KreisParameter> = {
  id: 'kr.berechnen',
  version: 1,
  platzhalter: ['aufgabe'],
  fehlerbildIds: [
    'radius-durchmesser',
    'umfang-flaeche',
    'mal-zwei-statt-quadrat',
    'wurzel-vergessen',
  ],

  erzeuge(seed, p) {
    const r = rng(seed);
    const gegeben: 'r' | 'd' = r.int(0, 1) === 0 ? 'r' : 'd';
    const flaeche = r.int(0, 1) === 0;
    if (!p.umkehr) {
      const w = gegeben === 'r' ? r.int(2, 25) : 2 * r.int(2, 20);
      const rad = gegeben === 'r' ? w : w / 2;
      const ergebnis = flaeche ? PI * rad * rad : 2 * PI * rad;
      const richtig = zz(ergebnis);
      return {
        platzhalter: {
          aufgabe: de(`Berechne ${flaeche ? 'den Flächeninhalt A in cm²' : 'den Umfang u in cm'}.`),
        },
        bild: kreisBild(w, gegeben),
        loesung: richtig,
        loesungsweg: [
          ...(gegeben === 'd' ? [de(`r = d : 2 = ${t(rad)} cm`)] : []),
          de(
            flaeche
              ? `A = π · r² ≈ 3,14 · ${t(rad)}² = ${t(ergebnis)} cm²`
              : `u = 2 · π · r ≈ 2 · 3,14 · ${t(rad)} = ${t(ergebnis)} cm`,
          ),
        ],
        fehlerbilder: fehlerbilderAus(richtig, [
          [
            'radius-durchmesser',
            zz(
              flaeche
                ? gegeben === 'r'
                  ? PI * 4 * rad * rad
                  : PI * w * w
                : gegeben === 'r'
                  ? PI * rad
                  : 4 * PI * rad,
            ),
          ],
          ['umfang-flaeche', zz(flaeche ? 2 * PI * rad : PI * rad * rad)],
          ['mal-zwei-statt-quadrat', flaeche && rad !== 2 ? zz(PI * 2 * rad) : undefined],
        ]),
      };
    }
    // Umkehr: r ganz, gegeben u oder A, gesucht r oder d
    const rad = r.int(2, 25);
    const gesucht: 'r' | 'd' = r.int(0, 1) === 0 ? 'r' : 'd';
    const wert = flaeche ? PI * rad * rad : 2 * PI * rad;
    const ergebnis = gesucht === 'r' ? rad : 2 * rad;
    const richtig = zahl(ergebnis);
    return {
      platzhalter: {
        aufgabe: de(
          `Ein Kreis hat ${flaeche ? `den Flächeninhalt ${t(wert)} cm²` : `den Umfang ${t(wert)} cm`}. Berechne ${gesucht === 'r' ? 'den Radius r' : 'den Durchmesser d'} in cm.`,
        ),
      },
      loesung: richtig,
      loesungsweg: flaeche
        ? [
            de(`r² = A : 3,14 = ${t(rad * rad)}`),
            de(`r = ${rad} cm`),
            ...(gesucht === 'd' ? [de(`d = 2 · r = ${2 * rad} cm`)] : []),
          ]
        : [
            de(`d = u : 3,14 = ${2 * rad} cm`),
            ...(gesucht === 'r' ? [de(`r = d : 2 = ${rad} cm`)] : []),
          ],
      fehlerbilder: fehlerbilderAus(richtig, [
        ['radius-durchmesser', zahl(gesucht === 'r' ? 2 * rad : rad)],
        [
          'wurzel-vergessen',
          flaeche ? zahl(gesucht === 'r' ? rad * rad : 2 * rad * rad) : undefined,
        ],
      ]),
    };
  },
};

/** „Ein Rad mit 60 cm Durchmesser dreht sich 200-mal. Wie weit kommt es?“ */
export const kreisSach: Generator<KreisParameter> = {
  id: 'kr.sach',
  version: 1,
  platzhalter: ['aufgabe'],
  fehlerbildIds: ['radius-durchmesser', 'einheit-vergessen'],

  erzeuge(seed, p) {
    const r = rng(seed);
    const d = 10 * r.int(4, 8); // cm
    const n = 10 * r.int(2, 50); // Umdrehungen
    const strecke = (PI * d * n) / 100; // m
    const was = r.pick([
      'Ein Fahrrad',
      'Ein Roller',
      'Ein Bollerwagen',
      'Ein Kinderwagen',
    ] as const);
    if (!p.umkehr) {
      const richtig = zz(strecke);
      return {
        platzhalter: {
          aufgabe: de(
            `${was} hat Räder mit ${d} cm Durchmesser. Jedes Rad dreht sich ${n}-mal. Wie viele Meter legt es zurück?`,
          ),
        },
        loesung: richtig,
        loesungsweg: [
          de(
            `Bei einer Umdrehung rollt das Rad seinen Umfang ab: u = 3,14 · ${d} cm = ${t(PI * d)} cm.`,
          ),
          de(`${n} Umdrehungen: ${t(PI * d)} cm · ${n} = ${t(PI * d * n)} cm = ${t(strecke)} m`),
        ],
        fehlerbilder: fehlerbilderAus(richtig, [
          ['radius-durchmesser', zz(strecke * 2)],
          ['einheit-vergessen', zz(PI * d * n)],
        ]),
      };
    }
    const richtig = zahl(n);
    return {
      platzhalter: {
        aufgabe: de(
          `${was} hat Räder mit ${d} cm Durchmesser und fährt ${t(strecke)} m weit. Wie oft dreht sich jedes Rad?`,
        ),
      },
      loesung: richtig,
      loesungsweg: [
        de(`Umfang: u = 3,14 · ${d} cm = ${t(PI * d)} cm`),
        de(`${t(strecke)} m = ${t(strecke * 100)} cm; ${t(strecke * 100)} : ${t(PI * d)} = ${n}`),
      ],
      fehlerbilder: fehlerbilderAus(richtig, [
        ['radius-durchmesser', zahl(n / 2)],
        ['einheit-vergessen', zz(strecke / (PI * d))],
      ]),
    };
  },
};

// ---------------------------------------------------------------------------
// Kreisring und Kreisteile (M.GM.KR.KREISRING)

export interface RingParameter {
  /** auch Durchmesser statt Radien gegeben (Unterlegscheibe, Rohr) */
  readonly durchmesser: boolean;
}

/** „Berechne den Flächeninhalt des Kreisrings.“ */
export const kreisring: Generator<RingParameter> = {
  id: 'kr.kreisring',
  version: 1,
  platzhalter: ['aufgabe'],
  fehlerbildIds: ['radien-abgezogen', 'nur-aussen', 'radius-durchmesser'],

  erzeuge(seed, p) {
    const r = rng(seed);
    const ra = r.int(3, 20);
    const ri = r.int(1, ra - 1);
    const flaeche = PI * (ra * ra - ri * ri);
    const richtig = zz(flaeche);
    const mitD = p.durchmesser && r.int(0, 1) === 0;
    const aufgabe = mitD
      ? `Eine Unterlegscheibe hat außen ${2 * ra} mm und innen ${2 * ri} mm Durchmesser. Berechne ihren Flächeninhalt in mm².`
      : 'Berechne den Flächeninhalt des Kreisrings in cm².';
    return {
      platzhalter: { aufgabe: de(aufgabe) },
      ...(mitD ? {} : { bild: ringBild(ra, ri, 'cm') }),
      loesung: richtig,
      loesungsweg: [
        ...(mitD ? [de(`Radien: außen ${ra} mm, innen ${ri} mm.`)] : []),
        de(
          `A = 3,14 · ${ra}² − 3,14 · ${ri}² = ${t(PI * ra * ra)} − ${t(PI * ri * ri)} = ${t(flaeche)}`,
        ),
      ],
      fehlerbilder: fehlerbilderAus(richtig, [
        ['radien-abgezogen', zz(PI * (ra - ri) * (ra - ri))],
        ['nur-aussen', zz(PI * ra * ra)],
        ['radius-durchmesser', mitD ? zz(4 * flaeche) : undefined],
      ]),
    };
  },
};

export interface FigurParameter {
  /** false: Halb- oder Viertelkreis allein; true: Rechteck mit Halbkreisen (zusammengesetzt) */
  readonly zusammengesetzt: boolean;
}

const halbkreisPfad = (cx: number, cy: number, rr: number, oben: boolean) =>
  `<path d="M ${cx - rr} ${cy} A ${rr} ${rr} 0 0 ${oben ? 1 : 0} ${cx + rr} ${cy} Z" fill="currentColor" fill-opacity="0.25"/>`;

/** „Berechne den Flächeninhalt der Figur.“ – Halbkreis, Viertelkreis, Rechteck mit Halbkreisen */
export const kreisFigur: Generator<FigurParameter> = {
  id: 'kr.figur',
  version: 1,
  platzhalter: [],
  fehlerbildIds: ['ganzer-kreis', 'kreisteil-vergessen', 'radius-durchmesser'],

  erzeuge(seed, p) {
    const r = rng(seed);
    if (!p.zusammengesetzt) {
      const viertel = r.int(0, 1) === 0;
      const rad = 2 * r.int(1, 8);
      const teil = viertel ? 4 : 2;
      const flaeche = (PI * rad * rad) / teil;
      const richtig = zz(flaeche);
      const s = 130 / rad;
      const teile = viertel
        ? [
            `<path d="M 30 170 L 30 ${170 - rad * s} A ${rad * s} ${rad * s} 0 0 1 ${30 + rad * s} 170 Z" fill="currentColor" fill-opacity="0.25"/>`,
            text(30 + (rad * s) / 2, 188, `r = ${rad} cm`, 14),
          ]
        : [
            halbkreisPfad(100, 150, 80, true),
            linie(20, 150, 180, 150),
            text(100, 172, `d = ${2 * rad} cm`, 14),
          ];
      return {
        platzhalter: {},
        bild: bild(
          200,
          200,
          teile,
          de(
            viertel
              ? `Ein Viertelkreis mit dem Radius ${rad} cm.`
              : `Ein Halbkreis mit dem Durchmesser ${2 * rad} cm.`,
          ),
        ),
        loesung: richtig,
        loesungsweg: [
          ...(viertel ? [] : [de(`r = d : 2 = ${rad} cm`)]),
          de(`A = 3,14 · ${rad}² : ${teil} = ${t(flaeche)} cm²`),
        ],
        fehlerbilder: fehlerbilderAus(richtig, [
          ['ganzer-kreis', zz(PI * rad * rad)],
          ['radius-durchmesser', zz((PI * 4 * rad * rad) / teil)],
        ]),
      };
    }
    // Rechteck a × d mit einem oder zwei Halbkreisen über der Seite d (Laufbahn)
    const rad = r.int(1, 8);
    const d = 2 * rad;
    const a = r.int(d + 1, 3 * d + 2);
    const zwei = r.int(0, 1) === 0;
    const kreisteil = zwei ? PI * rad * rad : (PI * rad * rad) / 2;
    const flaeche = a * d + kreisteil;
    const richtig = zz(flaeche);
    const s = 160 / (a + (zwei ? d : rad));
    const x0 = 20 + (zwei ? rad * s : 0);
    const y0 = 100 - rad * s;
    const teile = [
      `<rect x="${x0}" y="${y0}" width="${a * s}" height="${d * s}" fill="currentColor" fill-opacity="0.25"/>`,
      `<path d="M ${x0 + a * s} ${y0} A ${rad * s} ${rad * s} 0 0 1 ${x0 + a * s} ${y0 + d * s} Z" fill="currentColor" fill-opacity="0.25"/>`,
      ...(zwei
        ? [
            `<path d="M ${x0} ${y0 + d * s} A ${rad * s} ${rad * s} 0 0 1 ${x0} ${y0} Z" fill="currentColor" fill-opacity="0.25"/>`,
          ]
        : []),
      text(x0 + (a * s) / 2, y0 - 8, `${a} cm`, 13),
      text(x0 + (a * s) / 2, y0 + (d * s) / 2 + 5, `${d} cm`, 13),
    ];
    return {
      platzhalter: {},
      bild: bild(
        200,
        200,
        teile,
        de(
          `Ein Rechteck, ${a} cm lang und ${d} cm hoch. An ${zwei ? 'beiden kurzen Seiten' : 'der rechten kurzen Seite'} ist ein Halbkreis angesetzt.`,
        ),
      ),
      loesung: richtig,
      loesungsweg: [
        de(`Rechteck: ${a} · ${d} = ${a * d} cm²`),
        de(
          zwei
            ? `Zwei Halbkreise sind ein ganzer Kreis: 3,14 · ${rad}² = ${t(kreisteil)} cm²`
            : `Halbkreis: 3,14 · ${rad}² : 2 = ${t(kreisteil)} cm²`,
        ),
        de(`Zusammen: ${t(flaeche)} cm²`),
      ],
      fehlerbilder: fehlerbilderAus(richtig, [
        ['kreisteil-vergessen', zahl(a * d)],
        ['radius-durchmesser', zz(a * d + (zwei ? 4 : 2) * kreisteil)],
        ['ganzer-kreis', zwei ? undefined : zz(a * d + PI * rad * rad)],
      ]),
    };
  },
};
