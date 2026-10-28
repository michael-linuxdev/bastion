// Bilder zu den Zeichen-Anleitungen (LEHRPLAN L-10, INHALTSFORMAT §4.4):
// je Anleitung ein Bild pro Schritt, als SVG aus dem Code (I-11).
// Die Texte stehen in content/…/anleitungen/*.yaml.
import type { Bild } from '../../core/learning/generator';
import {
  aufKreis,
  bild,
  bogen,
  kreis,
  linie,
  punkt,
  raster,
  rechteck,
  text,
  vieleck,
} from '../svg';
import { geodreieck } from './geodreieck';

export interface AnleitungsBilder {
  readonly id: string;
  readonly version: number;
  readonly bilder: () => readonly Bild[];
}

const gestrichelt = (x1: number, y1: number, x2: number, y2: number) =>
  `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke-width="1.5" stroke-dasharray="6 4"/>`;
const dick = (x1: number, y1: number, x2: number, y2: number) => linie(x1, y1, x2, y2, 3.5);
const rechterWinkel = (x: number, y: number, dx: number, dy: number) =>
  vieleck([
    [x, y],
    [x + dx, y],
    [x + dx, y + dy],
    [x, y + dy],
  ]) + kreis(x + dx / 2, y + dy / 2, 1.8, true);

/** Senkrechte zu g durch P */
export const senkrechte: AnleitungsBilder = {
  id: 'anleitung.senkrechte',
  version: 1,
  bilder: () => {
    const g = [linie(20, 110, 280, 110), text(270, 130, 'g')];
    const p = punkt(180, 45, 'P');
    const geo = geodreieck(180, 110, 90, { breite: 160 });
    return [
      bild(300, 200, [...g, p], { de: 'Eine waagerechte Gerade g und darüber ein Punkt P.' }),
      bild(300, 200, [...g, p, geo], {
        de: 'Das Geodreieck liegt mit der Mittellinie auf g. Die lange Kante geht senkrecht nach oben durch P.',
      }),
      bild(300, 200, [...g, p, geo, dick(180, 25, 180, 110)], {
        de: 'An der langen Kante entlang ist eine Linie durch P gezeichnet.',
      }),
      bild(300, 200, [...g, p, linie(180, 20, 180, 190), rechterWinkel(180, 110, -14, -14)], {
        de: 'Ohne Geodreieck: g und die Senkrechte durch P, am Schnittpunkt ein Zeichen für den rechten Winkel.',
      }),
    ];
  },
};

/** Parallele zu g durch P */
export const parallele: AnleitungsBilder = {
  id: 'anleitung.parallele',
  version: 1,
  bilder: () => {
    const g = [linie(10, 140, 290, 140), text(280, 160, 'g')];
    const p = punkt(150, 70, 'P');
    const geo = geodreieck(150, 70, 180, { breite: 240, hilfslinien: [20, 40, 70] });
    return [
      bild(300, 200, [...g, p], { de: 'Eine waagerechte Gerade g und darüber ein Punkt P.' }),
      bild(300, 200, [...g, p, geo], {
        de: 'Das Geodreieck liegt mit der langen Kante an P, die Spitze zeigt nach unten. Eine gestrichelte Hilfslinie liegt genau auf g.',
      }),
      bild(300, 200, [...g, p, geo, dick(20, 70, 280, 70)], {
        de: 'An der langen Kante entlang ist eine Linie durch P gezeichnet.',
      }),
      bild(300, 200, [...g, p, linie(10, 70, 290, 70), text(280, 60, 'h')], {
        de: 'Ohne Geodreieck: g und darüber die Parallele h durch P.',
      }),
    ];
  },
};

/** Winkel von 50° am Scheitel S zeichnen */
export const winkel: AnleitungsBilder = {
  id: 'anleitung.winkel',
  version: 1,
  bilder: () => {
    const s = punkt(150, 160, 'S');
    const schenkel = linie(150, 160, 285, 160);
    const geo = geodreieck(150, 160, 0, { breite: 240, skala: true });
    const [mx, my] = aufKreis(150, 160, 74, 50);
    const marke = kreis(mx, my, 4, true);
    const [ex, ey] = aufKreis(150, 160, 135, 50);
    return [
      bild(300, 190, [schenkel, s], {
        de: 'Ein Punkt S und von dort ein Schenkel nach rechts.',
      }),
      bild(300, 190, [schenkel, s, geo], {
        de: 'Das Geodreieck liegt mit der langen Kante auf dem Schenkel, der Nullpunkt genau auf S.',
      }),
      bild(300, 190, [schenkel, s, geo, marke, text(mx + 16, my - 4, '50°', 13)], {
        de: 'Auf der Winkelskala ist bei 50° ein Punkt markiert, von rechts aus gezählt.',
      }),
      bild(300, 190, [schenkel, s, marke, dick(150, 160, ex, ey)], {
        de: 'Ohne Geodreieck: Eine Linie verbindet S mit dem markierten Punkt. Das ist der zweite Schenkel.',
      }),
      bild(
        300,
        190,
        [
          schenkel,
          s,
          linie(150, 160, ex, ey),
          bogen(150, 160, 40, 0, 50),
          text(205, 145, '50°', 14),
        ],
        {
          de: 'Fertiger Winkel mit Bogen und der Beschriftung 50°.',
        },
      ),
    ];
  },
};

/** Dreieck an einer senkrechten Achse auf Kästchenpapier spiegeln */
export const spiegeln: AnleitungsBilder = {
  id: 'anleitung.spiegeln',
  version: 1,
  bilder: () => {
    const k = 20;
    const gitter = raster(20, 20, k, 14, 8);
    const achse = [gestrichelt(160, 10, 160, 190), text(172, 22, 'a', 14)];
    const A: [number, number] = [100, 60];
    const B: [number, number] = [140, 160];
    const C: [number, number] = [60, 140];
    const bildpunkt = ([x, y]: [number, number]): [number, number] => [320 - x, y];
    const figur = [vieleck([A, B, C], true), punkt(...A, 'A'), punkt(...B, 'B'), punkt(...C, 'C')];
    const [A2, B2, C2] = [bildpunkt(A), bildpunkt(B), bildpunkt(C)];
    const zaehlen = (von: [number, number], bis: number) =>
      `<line x1="${von[0]}" y1="${von[1]}" x2="${bis}" y2="${von[1]}" stroke-width="2.5" stroke-dasharray="3 3"/>`;
    const grund = [...gitter, ...achse, ...figur];
    return [
      bild(320, 200, grund, {
        de: 'Kästchenpapier mit einem Dreieck ABC links und einer senkrechten Spiegelachse a.',
      }),
      bild(320, 200, [...grund, zaehlen(A, 160), text(130, 52, '3', 13)], {
        de: 'Von A bis zur Achse sind es 3 Kästchen nach rechts.',
      }),
      bild(320, 200, [...grund, zaehlen(A, A2[0]), text(190, 52, '3', 13), punkt(...A2, 'A′')], {
        de: 'Hinter der Achse noch einmal 3 Kästchen weiter liegt A′.',
      }),
      bild(320, 200, [...grund, punkt(...A2, 'A′'), punkt(...B2, 'B′'), punkt(...C2, 'C′')], {
        de: 'Alle drei Bildpunkte A′, B′ und C′ sind eingezeichnet.',
      }),
      bild(
        320,
        200,
        [
          ...grund,
          vieleck([A2, B2, C2], true),
          punkt(...A2, 'A′'),
          punkt(...B2, 'B′'),
          punkt(...C2, 'C′'),
        ],
        {
          de: 'Das Spiegelbild A′B′C′ ist fertig. Es ist seitenverkehrt.',
        },
      ),
    ];
  },
};

/** Würfelnetz zeichnen, ausschneiden, falten */
export const wuerfelnetz: AnleitungsBilder = {
  id: 'anleitung.wuerfelnetz',
  version: 1,
  bilder: () => {
    const s = 40;
    const x0 = 60;
    const y0 = 60;
    const gitter = raster(20, 20, 20, 14, 8);
    const reihe = [0, 1, 2, 3].map((i) => rechteck(x0 + i * s, y0, s, s));
    const kreuz = [...reihe, rechteck(x0 + s, y0 - s, s, s), rechteck(x0 + s, y0 + s, s, s)];
    const lasche = (x1: number, y1: number, x2: number, y2: number, nx: number, ny: number) =>
      vieleck([
        [x1, y1],
        [x2, y2],
        [x2 + nx * 8 - (x2 - x1) * 0.2, y2 + ny * 8 - (y2 - y1) * 0.2],
        [x1 + nx * 8 + (x2 - x1) * 0.2, y1 + ny * 8 + (y2 - y1) * 0.2],
      ]);
    const laschen = [
      lasche(x0, y0, x0 + s, y0, 0, -1),
      lasche(x0 + 2 * s, y0, x0 + 3 * s, y0, 0, -1),
      lasche(x0 + 3 * s, y0, x0 + 4 * s, y0, 0, -1),
      lasche(x0 + 4 * s, y0, x0 + 4 * s, y0 + s, 1, 0),
      lasche(x0 + 2 * s, y0 - s, x0 + 2 * s, y0, 1, 0),
      lasche(x0 + 2 * s, y0 + s, x0 + 2 * s, y0 + 2 * s, 1, 0),
      lasche(x0, y0 + s, x0 + s, y0 + s, 0, 1),
    ];
    const falz = [
      gestrichelt(x0 + s, y0, x0 + s, y0 + s),
      gestrichelt(x0 + 2 * s, y0, x0 + 2 * s, y0 + s),
      gestrichelt(x0 + 3 * s, y0, x0 + 3 * s, y0 + s),
      gestrichelt(x0 + s, y0, x0 + 2 * s, y0),
      gestrichelt(x0 + s, y0 + s, x0 + 2 * s, y0 + s),
    ];
    const umriss = [
      vieleck([
        [x0, y0],
        [x0 + s, y0],
        [x0 + s, y0 - s],
        [x0 + 2 * s, y0 - s],
        [x0 + 2 * s, y0],
        [x0 + 4 * s, y0],
        [x0 + 4 * s, y0 + s],
        [x0 + 2 * s, y0 + s],
        [x0 + 2 * s, y0 + 2 * s],
        [x0 + s, y0 + 2 * s],
        [x0 + s, y0 + s],
        [x0, y0 + s],
      ]),
    ];
    return [
      bild(320, 200, [...gitter, ...reihe], {
        de: 'Vier gleich große Quadrate in einer Reihe auf Kästchenpapier.',
      }),
      bild(320, 200, [...gitter, ...kreuz], {
        de: 'Über und unter dem zweiten Quadrat ist je ein weiteres Quadrat angesetzt – ein Kreuz aus sechs Quadraten.',
      }),
      bild(320, 200, [...gitter, ...kreuz, ...laschen], {
        de: 'An einigen Außenkanten sind schmale Klebelaschen angezeichnet.',
      }),
      bild(320, 200, [...umriss, ...laschen, ...falz], {
        de: 'Das ausgeschnittene Netz. Gestrichelt: die Linien, an denen gefaltet wird.',
      }),
    ];
  },
};

/** Dreieck aus a = 5 cm, b = 4 cm, c = 6 cm konstruieren (1 cm = 30 Bildpunkte) */
export const sss: AnleitungsBilder = {
  id: 'anleitung.sss',
  version: 1,
  bilder: () => {
    const A: [number, number] = [60, 190];
    const B: [number, number] = [240, 190];
    // C aus den Kreisen um A (r = 120) und B (r = 150)
    const cx = A[0] + 67.5;
    const cy = A[1] - Math.sqrt(120 ** 2 - 67.5 ** 2);
    const grund = [
      linie(A[0], A[1], B[0], B[1]),
      punkt(A[0], A[1], 'A'),
      punkt(B[0], B[1], 'B'),
      text(150, 210, 'c = 6 cm', 13),
    ];
    const bogenA = bogen(A[0], A[1], 120, 40, 72);
    const bogenB = bogen(B[0], B[1], 150, 124, 154);
    return [
      bild(300, 220, grund, { de: 'Die Strecke AB ist 6 cm lang.' }),
      bild(300, 220, [...grund, bogenA], {
        de: 'Um A ist ein Kreisbogen mit dem Radius 4 cm gezeichnet.',
      }),
      bild(300, 220, [...grund, bogenA, bogenB, kreis(cx, cy, 3, true)], {
        de: 'Um B ist ein Kreisbogen mit dem Radius 5 cm gezeichnet. Die beiden Bögen schneiden sich.',
      }),
      bild(
        300,
        220,
        [
          ...grund,
          bogenA,
          bogenB,
          dick(A[0], A[1], cx, cy),
          dick(B[0], B[1], cx, cy),
          punkt(cx, cy, 'C'),
        ],
        {
          de: 'Der Schnittpunkt C ist mit A und B verbunden. Das Dreieck ABC ist fertig.',
        },
      ),
    ];
  },
};

/** Mittelsenkrechte einer Strecke AB mit dem Zirkel */
export const mittelsenkrechte: AnleitungsBilder = {
  id: 'anleitung.mittelsenkrechte',
  version: 1,
  bilder: () => {
    const A: [number, number] = [70, 120];
    const B: [number, number] = [230, 120];
    const h = Math.sqrt(110 ** 2 - 80 ** 2);
    const grund = [linie(A[0], A[1], B[0], B[1]), punkt(A[0], A[1], 'A'), punkt(B[0], B[1], 'B')];
    const boegenA = [bogen(A[0], A[1], 110, 30, 56), bogen(A[0], A[1], 110, 304, 330)];
    const boegenB = [bogen(B[0], B[1], 110, 124, 150), bogen(B[0], B[1], 110, 210, 236)];
    const oben: [number, number] = [150, A[1] - h];
    const unten: [number, number] = [150, A[1] + h];
    return [
      bild(300, 240, grund, { de: 'Eine waagerechte Strecke AB.' }),
      bild(300, 240, [...grund, ...boegenA], {
        de: 'Um A sind zwei Bögen gezeichnet, einer oberhalb und einer unterhalb von AB.',
      }),
      bild(
        300,
        240,
        [
          ...grund,
          ...boegenA,
          ...boegenB,
          kreis(oben[0], oben[1], 3, true),
          kreis(unten[0], unten[1], 3, true),
        ],
        {
          de: 'Um B sind mit derselben Zirkelöffnung zwei Bögen gezeichnet. Sie schneiden die ersten oben und unten.',
        },
      ),
      bild(
        300,
        240,
        [
          ...grund,
          ...boegenA,
          ...boegenB,
          dick(oben[0], oben[1] - 10, unten[0], unten[1] + 10),
          rechterWinkel(150, 120, 12, -12),
        ],
        {
          de: 'Die beiden Schnittpunkte sind verbunden. Die Linie halbiert AB und steht senkrecht darauf.',
        },
      ),
    ];
  },
};

/** Schrägbild eines Dreiecksprismas (Kavalierperspektive: 45°, Tiefe halbiert) */
export const schraegbildPrisma: AnleitungsBilder = {
  id: 'anleitung.schraegbild-prisma',
  version: 1,
  bilder: () => {
    type P = readonly [number, number];
    const A: P = [60, 200];
    const B: P = [180, 200];
    const C: P = [120, 100];
    // Tiefe 6 Kästchen → gezeichnet 3 Kästchendiagonalen nach rechts oben
    const hinten = (p: P): P => [p[0] + 60, p[1] - 60];
    const [A2, B2, C2] = [hinten(A), hinten(B), hinten(C)];
    const strich = (p: P, q: P, art: 'normal' | 'dick' | 'verdeckt' = 'normal') =>
      art === 'dick'
        ? dick(p[0], p[1], q[0], q[1])
        : art === 'verdeckt'
          ? gestrichelt(p[0], p[1], q[0], q[1])
          : linie(p[0], p[1], q[0], q[1]);
    const grund = [
      ...raster(0, 0, 20, 15, 12),
      vieleck([A, B, C]),
      punkt(A[0], A[1], 'A'),
      punkt(B[0], B[1], 'B'),
      punkt(C[0], C[1], 'C'),
    ];
    return [
      bild(300, 240, grund, {
        de: 'Auf Kästchenpapier ist vorne das Dreieck ABC in wahrer Größe gezeichnet.',
      }),
      bild(
        300,
        240,
        [...grund, strich(A, A2, 'dick'), strich(B, B2, 'dick'), strich(C, C2, 'dick')],
        {
          de: 'Von A, B und C gehen schräge Linien nach rechts oben, jede drei Kästchendiagonalen lang.',
        },
      ),
      bild(
        300,
        240,
        [
          ...grund,
          strich(A, A2),
          strich(B, B2),
          strich(C, C2),
          strich(A2, B2, 'dick'),
          strich(B2, C2, 'dick'),
          strich(C2, A2, 'dick'),
        ],
        { de: 'Die Endpunkte der schrägen Linien sind zum hinteren Dreieck verbunden.' },
      ),
      bild(
        300,
        240,
        [
          ...grund,
          strich(B, B2),
          strich(C, C2),
          strich(B2, C2),
          strich(A, A2, 'verdeckt'),
          strich(A2, B2, 'verdeckt'),
          strich(A2, C2, 'verdeckt'),
        ],
        {
          de: 'Die drei Kanten an der hinteren Ecke unten links sind gestrichelt, weil sie verdeckt sind.',
        },
      ),
    ];
  },
};

/** Umkreis eines Dreiecks: zwei Mittelsenkrechten, Schnittpunkt M, Kreis um M durch A */
export const umkreis: AnleitungsBilder = {
  id: 'anleitung.umkreis',
  version: 1,
  bilder: () => {
    type P = readonly [number, number];
    const A: P = [60, 210];
    const B: P = [240, 210];
    const C: P = [130, 80];
    // Mittelsenkrechte von AB: x = 150; von BC: durch die Mitte von BC, senkrecht zu BC
    const mBC: P = [(B[0] + C[0]) / 2, (B[1] + C[1]) / 2];
    const [dx, dy] = [C[0] - B[0], C[1] - B[1]];
    const laenge = Math.hypot(dx, dy);
    const senk: P = [-dy / laenge, dx / laenge];
    const t = (150 - mBC[0]) / senk[0]; // Schnitt mit x = 150
    const M: P = [150, mBC[1] + t * senk[1]];
    const radius = Math.hypot(A[0] - M[0], A[1] - M[1]);
    const dreieck = [
      linie(A[0], A[1], B[0], B[1]),
      linie(B[0], B[1], C[0], C[1]),
      linie(C[0], C[1], A[0], A[1]),
      punkt(A[0], A[1], 'A'),
      punkt(B[0], B[1], 'B'),
      punkt(C[0], C[1], 'C'),
    ];
    const msAB = gestrichelt(150, 50, 150, 300);
    const msBC = gestrichelt(
      mBC[0] - 120 * senk[0],
      mBC[1] - 120 * senk[1],
      mBC[0] + 90 * senk[0],
      mBC[1] + 90 * senk[1],
    );
    const mPunkt = kreis(M[0], M[1], 3.5, true) + text(M[0] + 14, M[1] + 4, 'M', 14);
    return [
      bild(300, 320, [...dreieck, msAB, rechterWinkel(150, 210, 10, -10)], {
        de: 'Ein Dreieck ABC. Die Mittelsenkrechte von AB ist eingezeichnet: Sie steht senkrecht in der Mitte von AB.',
      }),
      bild(300, 320, [...dreieck, msAB, msBC], {
        de: 'Dazu ist die Mittelsenkrechte von BC eingezeichnet.',
      }),
      bild(300, 320, [...dreieck, msAB, msBC, mPunkt], {
        de: 'Die beiden Mittelsenkrechten schneiden sich im Punkt M.',
      }),
      bild(300, 320, [...dreieck, mPunkt, kreis(M[0], M[1], radius)], {
        de: 'Um M ist ein Kreis gezeichnet. Er geht durch alle drei Ecken A, B und C – das ist der Umkreis.',
      }),
    ];
  },
};

/** Parallelogramm aus a, b und α: Seite, Winkel, zweite Seite, Parallelen */
export const parallelogramm: AnleitungsBilder = {
  id: 'anleitung.parallelogramm',
  version: 1,
  bilder: () => {
    type P = readonly [number, number];
    const A: P = [40, 190];
    const B: P = [200, 190];
    const alpha = 60;
    const D = aufKreis(A[0], A[1], 100, alpha);
    const C: P = [B[0] + (D[0] - A[0]), B[1] + (D[1] - A[1])];
    const schenkel = aufKreis(A[0], A[1], 150, alpha);
    const grund = [linie(A[0], A[1], B[0], B[1]), punkt(A[0], A[1], 'A'), punkt(B[0], B[1], 'B')];
    const winkelA = [
      linie(A[0], A[1], schenkel[0], schenkel[1], 1.5),
      bogen(A[0], A[1], 28, 0, alpha),
      text(A[0] + 40, A[1] - 12, 'α', 13),
    ];
    const dPunkt = punkt(D[0], D[1], 'D');
    return [
      bild(320, 230, grund, { de: 'Die Seite a = AB ist gezeichnet.' }),
      bild(320, 230, [...grund, ...winkelA], {
        de: 'In A ist der Winkel α an AB angetragen. Der freie Schenkel zeigt schräg nach oben.',
      }),
      bild(320, 230, [...grund, ...winkelA, dick(A[0], A[1], D[0], D[1]), dPunkt], {
        de: 'Auf dem freien Schenkel ist die Länge b abgetragen. Dort liegt D.',
      }),
      bild(
        320,
        230,
        [
          ...grund,
          ...winkelA,
          linie(A[0], A[1], D[0], D[1]),
          dPunkt,
          gestrichelt(D[0] - 20, D[1], C[0] + 40, C[1]),
          gestrichelt(B[0], B[1], C[0] + (C[0] - B[0]) * 0.2, C[1] + (C[1] - B[1]) * 0.2),
          punkt(C[0], C[1], 'C'),
          linie(D[0], D[1], C[0], C[1], 3),
          linie(B[0], B[1], C[0], C[1], 3),
        ],
        {
          de: 'Durch D ist die Parallele zu AB gezeichnet, durch B die Parallele zu AD. Sie schneiden sich in C.',
        },
      ),
    ];
  },
};
