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
