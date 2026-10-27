import type { Generator } from '../../../core/learning/generator';
import { fehlerbilderAus } from '../../../core/learning/loesung';
import { rng } from '../../../core/rng/rng';
import { auswahl, de, mische } from '../../hilfen';
import { aufKreis, bild, linie, text } from '../../svg';

/** Strecke auf der Geraden durch (sx, sy) mit Richtung `grad`, von t1 bis t2, mit Namen am Ende. */
function strecke(sx: number, sy: number, grad: number, t1: number, t2: number, name: string) {
  const [x1, y1] = aufKreis(sx, sy, t1, grad);
  const [x2, y2] = aufKreis(sx, sy, t2, grad);
  const [nx, ny] = aufKreis(...aufKreis(sx, sy, t2 - 12, grad), 14, grad + 90);
  return [linie(x1, y1, x2, y2, 2.5), text(nx, ny + 5, name, 16)];
}

/** Richtung zur Waagerechten, 0° … 179°. */
const richtung = (grad: number) => ((grad % 180) + 180) % 180;

const LAGEN = [
  { text: de('parallel') },
  { text: de('senkrecht zueinander') },
  { text: de('schneiden sich, aber nicht senkrecht') },
];

export interface LageParameter {
  readonly schraeg: boolean; // false: g liegt waagerecht oder senkrecht
}

/** „Wie liegen die Geraden g und h zueinander?“ – Vorlage M.RF.GF.LAGE.ZWEI-GERADEN */
export const lagebeziehung: Generator<LageParameter> = {
  id: 'gf.lagebeziehung',
  version: 1,
  platzhalter: [],
  fehlerbildIds: ['kreuzung-ausserhalb-uebersehen', 'schief-fuer-senkrecht'],

  erzeuge(seed, p) {
    const r = rng(seed);
    const art = r.int(0, 2);
    const g = p.schraeg ? r.int(0, 17) * 10 : r.pick([0, 90]);
    // Bei „schneiden“ ist der Schnittpunkt manchmal nicht im Bild – Geraden sind unendlich lang.
    const aussen = art === 2 && r.int(0, 1) === 0;
    const h =
      art === 0
        ? g
        : art === 1
          ? g + 90
          : g + (aussen ? r.pick([30, 40, 50]) : r.pick([30, 40, 50, 60, 120, 130, 140, 150]));
    let teile: string[];
    if (art === 0) {
      const abstand = r.pick([25, 35, 45]);
      teile = [
        ...strecke(...aufKreis(150, 110, abstand, g + 90), g, -80, 80, 'g'),
        ...strecke(...aufKreis(150, 110, -abstand, g + 90), g, -80, 80, 'h'),
      ];
    } else if (aussen) {
      const [sx, sy] = aufKreis(150, 110, -110, (g + h) / 2);
      teile = [...strecke(sx, sy, g, 60, 185, 'g'), ...strecke(sx, sy, h, 60, 185, 'h')];
    } else {
      teile = [...strecke(150, 110, g, -90, 90, 'g'), ...strecke(150, 110, h, -80, 80, 'h')];
    }
    const beschreibung =
      `Zwei Geraden g und h. g verläuft unter ${richtung(g)}°, h unter ${richtung(h)}° zur Waagerechten.` +
      (aussen ? ' Im Bild berühren sich die beiden Linien nicht.' : '');
    return {
      platzhalter: {},
      bild: bild(300, 220, teile, de(beschreibung)),
      optionen: LAGEN,
      loesung: auswahl(art),
      loesungsweg: [
        de('Geraden sind unendlich lang – denke sie dir verlängert.'),
        de(
          art === 0
            ? 'Sie haben überall denselben Abstand und schneiden sich nie: g ∥ h.'
            : art === 1
              ? 'Sie schneiden sich im rechten Winkel: g ⟂ h.'
              : 'Verlängert schneiden sie sich, aber nicht im rechten Winkel.',
        ),
      ],
      fehlerbilder: fehlerbilderAus(auswahl(art), [
        ['kreuzung-ausserhalb-uebersehen', aussen ? auswahl(0) : undefined],
        ['schief-fuer-senkrecht', art === 2 ? auswahl(1) : undefined],
      ]),
    };
  },
};

export interface ParalleleParameter {
  readonly schraeg: boolean;
}

/** „Welche Gerade ist parallel zu a?“ – Vorlage M.RF.GF.LAGE.PARALLELE-FINDEN */
export const paralleleFinden: Generator<ParalleleParameter> = {
  id: 'gf.parallele-finden',
  version: 1,
  platzhalter: [],
  fehlerbildIds: ['senkrechte-gewaehlt'],

  erzeuge(seed, p) {
    const r = rng(seed);
    const g = p.schraeg ? r.int(0, 17) * 10 : r.pick([0, 90]);
    const rollen = mische(r, ['parallel', 'senkrecht', 'schief'] as const);
    const winkel = {
      parallel: g,
      senkrecht: g + 90,
      schief: g + r.pick([30, 45, 60, 120, 135, 150]),
    };
    const orte: readonly (readonly [number, number])[] = [
      [80, 60],
      [230, 60],
      [80, 170],
      [230, 170],
    ];
    const namen = ['b', 'c', 'd'];
    const teile = [...strecke(80, 60, g, -42, 42, 'a')];
    rollen.forEach((rolle, i) => {
      const [x, y] = orte[i + 1] ?? [0, 0];
      teile.push(...strecke(x, y, winkel[rolle], -42, 42, namen[i] ?? ''));
    });
    const loesung = auswahl(rollen.indexOf('parallel'));
    return {
      platzhalter: {},
      bild: bild(
        310,
        230,
        teile,
        de(
          `Vier Geraden. a verläuft unter ${richtung(g)}° zur Waagerechten, ` +
            rollen
              .map((rolle, i) => `${namen[i] ?? ''} unter ${richtung(winkel[rolle])}°`)
              .join(', ') +
            '.',
        ),
      ),
      optionen: namen.map((n) => ({ text: de(n) })),
      loesung,
      loesungsweg: [
        de('Parallele Geraden haben dieselbe Richtung.'),
        de(
          'Lege das Geodreieck mit der Mittellinie an a an und verschiebe es entlang einer Hilfslinie.',
        ),
      ],
      fehlerbilder: fehlerbilderAus(loesung, [
        ['senkrechte-gewaehlt', auswahl(rollen.indexOf('senkrecht'))],
      ]),
    };
  },
};
