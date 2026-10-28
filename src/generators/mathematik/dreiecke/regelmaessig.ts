// Regelmäßige Vielecke – Klasse 8 (LEHRPLAN §8d, M.RF.DV.REGELMAESSIG): Symmetrieachsen,
// Mittelpunktswinkel, Innenwinkel und Innenwinkelsumme regelmäßiger n-Ecke.
import { zahlText } from '../../../core/learning/text';
import type { Generator } from '../../../core/learning/generator';
import { fehlerbilderAus } from '../../../core/learning/loesung';
import { rng } from '../../../core/rng/rng';
import { de, zahl } from '../../hilfen';
import { bild, vieleck } from '../../svg';

const NAMEN: Readonly<Record<number, string>> = {
  3: 'gleichseitiges Dreieck',
  4: 'Quadrat',
  5: 'regelmäßiges Fünfeck',
  6: 'regelmäßiges Sechseck',
  8: 'regelmäßiges Achteck',
  9: 'regelmäßiges Neuneck',
  10: 'regelmäßiges Zehneck',
  12: 'regelmäßiges Zwölfeck',
};
const ECKEN = [3, 4, 5, 6, 8, 9, 10, 12] as const;

/** Regelmäßiges n-Eck, eine Ecke oben */
function vieleckBild(n: number) {
  const punkte = Array.from({ length: n }, (_, k) => {
    const w = -Math.PI / 2 + (2 * Math.PI * k) / n;
    return [100 + 80 * Math.cos(w), 100 + 80 * Math.sin(w)] as const;
  });
  return bild(
    200,
    200,
    [vieleck(punkte)],
    de(`Ein regelmäßiges Vieleck mit ${n} gleich langen Seiten und ${n} gleich großen Winkeln.`),
  );
}

export interface SymmetrieParameter {
  /** false: Anzahl der Symmetrieachsen; true: Mittelpunktswinkel */
  readonly winkel: boolean;
}

/** „Wie viele Symmetrieachsen hat das Vieleck?“ / „Wie groß ist der Mittelpunktswinkel?“ */
export const vieleckSymmetrie: Generator<SymmetrieParameter> = {
  id: 'dv.vieleck-symmetrie',
  version: 1,
  platzhalter: ['frage'],
  fehlerbildIds: ['nur-durch-ecken', 'innenwinkel-statt-mittelpunktswinkel', 'halber-winkel'],

  erzeuge(seed, p) {
    const r = rng(seed);
    const n = r.pick(ECKEN);
    if (!p.winkel) {
      const richtig = zahl(n);
      return {
        platzhalter: { frage: de('Wie viele Symmetrieachsen hat das Vieleck?') },
        bild: vieleckBild(n),
        loesung: richtig,
        loesungsweg: [
          de(`Ein regelmäßiges n-Eck hat n Symmetrieachsen, hier ${n}.`),
          de(
            n % 2 === 0
              ? 'Die Hälfte geht durch gegenüberliegende Ecken, die andere Hälfte durch die Mitten gegenüberliegender Seiten.'
              : 'Jede Achse geht durch eine Ecke und die Mitte der gegenüberliegenden Seite.',
          ),
        ],
        fehlerbilder: fehlerbilderAus(richtig, [
          ['nur-durch-ecken', n % 2 === 0 ? zahl(n / 2) : undefined],
        ]),
      };
    }
    const m = 360 / n;
    const richtig = zahl(m);
    return {
      platzhalter: {
        frage: de(`Wie groß ist der Mittelpunktswinkel (in Grad)? Das Vieleck hat ${n} Ecken.`),
      },
      bild: vieleckBild(n),
      loesung: richtig,
      loesungsweg: [
        de(
          'Die Verbindungen vom Mittelpunkt zu den Ecken teilen den Vollwinkel 360° in n gleiche Teile.',
        ),
        de(`360° : ${n} = ${zahlText(m)}°`),
      ],
      fehlerbilder: fehlerbilderAus(richtig, [
        ['innenwinkel-statt-mittelpunktswinkel', zahl(180 - m)],
        ['halber-winkel', Number.isInteger(180 / n) ? zahl(180 / n) : undefined],
      ]),
    };
  },
};

export interface InnenwinkelParameter {
  /** false: Innenwinkelsumme; true: einzelner Innenwinkel oder Eckenzahl aus dem Innenwinkel */
  readonly einzeln: boolean;
}

/** „Wie groß ist die Innenwinkelsumme eines Sechsecks?“ / „Ein Innenwinkel ist 140°. Wie viele Ecken?“ */
export const innenwinkel: Generator<InnenwinkelParameter> = {
  id: 'dv.innenwinkel-vieleck',
  version: 1,
  platzhalter: ['aufgabe'],
  fehlerbildIds: ['n-mal-180', 'mittelpunktswinkel', 'summe-statt-einzeln'],

  erzeuge(seed, p) {
    const r = rng(seed);
    const n = r.pick(ECKEN.filter((x) => x > 3));
    const summe = (n - 2) * 180;
    const einzeln = summe / n;
    const name = NAMEN[n] ?? `regelmäßiges ${n}-Eck`;
    if (!p.einzeln) {
      const richtig = zahl(summe);
      return {
        platzhalter: {
          aufgabe: de(`Wie groß ist die Innenwinkelsumme eines ${n}-Ecks (in Grad)?`),
        },
        loesung: richtig,
        loesungsweg: [
          de(`Ein ${n}-Eck lässt sich von einer Ecke aus in ${n - 2} Dreiecke zerlegen.`),
          de(`${n - 2} · 180° = ${summe}°`),
        ],
        fehlerbilder: fehlerbilderAus(richtig, [['n-mal-180', zahl(n * 180)]]),
      };
    }
    if (r.int(0, 1) === 0) {
      const richtig = zahl(einzeln);
      return {
        platzhalter: {
          aufgabe: de(
            `Wie groß ist ein Innenwinkel im ${name.replace('regelmäßiges', 'regelmäßigen')} (in Grad)?`,
          ),
        },
        loesung: richtig,
        loesungsweg: [
          de(`Innenwinkelsumme: (${n} − 2) · 180° = ${summe}°`),
          de(`Alle ${n} Winkel sind gleich: ${summe}° : ${n} = ${zahlText(einzeln)}°`),
        ],
        fehlerbilder: fehlerbilderAus(richtig, [
          ['mittelpunktswinkel', zahl(360 / n)],
          ['summe-statt-einzeln', zahl(summe)],
        ]),
      };
    }
    const richtig = zahl(n);
    return {
      platzhalter: {
        aufgabe: de(
          `In einem regelmäßigen Vieleck ist jeder Innenwinkel ${zahlText(einzeln)}° groß. Wie viele Ecken hat es?`,
        ),
      },
      loesung: richtig,
      loesungsweg: [
        de(
          `Der Mittelpunktswinkel ist 180° − ${zahlText(einzeln)}° = ${zahlText(180 - einzeln)}°.`,
        ),
        de(`360° : ${zahlText(180 - einzeln)}° = ${n} Ecken`),
      ],
      fehlerbilder: fehlerbilderAus(richtig, [
        ['mittelpunktswinkel', Number.isInteger(360 / einzeln) ? zahl(360 / einzeln) : undefined],
      ]),
    };
  },
};
