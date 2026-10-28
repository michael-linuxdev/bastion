import { zahlDeutsch } from '../../../core/learning/format';
import type { Generator } from '../../../core/learning/generator';
import { fehlerbilderAus } from '../../../core/learning/loesung';
import { rng } from '../../../core/rng/rng';
import { auswahl, de, verlange, zahlMitStellen } from '../../hilfen';

export interface VergleichenParameter {
  /** Stellenzahl der Zahlen (2 … 11); eine darf eine Stelle mehr haben. */
  readonly stellen: number;
}

/** Optionen in fester Reihenfolge: 0 = „<“, 1 = „=“, 2 = „>“. */
const OPTIONEN = [{ text: de('<') }, { text: de('=') }, { text: de('>') }];
const zeichenIndex = (a: number, b: number) => (a < b ? 0 : a === b ? 1 : 2);

/**
 * „Setze das richtige Zeichen ein: 48 312 ☐ 48 231“
 * Vorlage: M.ZO.NZ.ORDNEN.VERGLEICHSZEICHEN (Sachsen: OS/GY Kl. 5, LB 1).
 */
export const vergleichszeichen: Generator<VergleichenParameter> = {
  id: 'nz.vergleichszeichen',
  version: 1,
  platzhalter: ['a', 'b'],
  fehlerbildIds: ['erste-ziffer-verglichen', 'zeichen-verdreht'],

  erzeuge(seed, p) {
    verlange(p.stellen >= 2 && p.stellen <= 11, 'stellen muss in 2 … 11 liegen');
    const r = rng(seed);
    const fall = r.int(0, 9);
    const a = zahlMitStellen(r, p.stellen);
    let b: number;
    if (fall === 0)
      b = a; // gleich – selten, aber möglich
    else if (fall <= 3) {
      // andere Stellenzahl, Anfangsziffer lockt in die falsche Richtung
      const kurz = zahlMitStellen(r, p.stellen);
      b = Number(String(r.int(1, Number(String(kurz)[0]))) + String(kurz));
    } else {
      // gleiche Stellenzahl, Unterschied an einer inneren Stelle
      const stelle = r.int(0, p.stellen - 2);
      const ziffer = Math.floor(a / 10 ** stelle) % 10;
      const neu = (ziffer + r.int(1, 9)) % 10;
      b = a + (neu - ziffer) * 10 ** stelle;
    }
    const [links, rechts] = r.int(0, 1) === 0 ? [a, b] : [b, a];
    const richtig = zeichenIndex(links, rechts);
    const ersteL = Number(String(links)[0]);
    const ersteR = Number(String(rechts)[0]);

    return {
      platzhalter: { a: links, b: rechts },
      optionen: OPTIONEN,
      loesung: auswahl(richtig),
      loesungsweg: [
        de(
          String(links).length !== String(rechts).length
            ? 'Die Zahlen haben verschieden viele Stellen. Die Zahl mit mehr Stellen ist größer.'
            : 'Gleich viele Stellen: von links Ziffer für Ziffer vergleichen, bis sich eine Ziffer unterscheidet.',
        ),
        de(`${zahlDeutsch(links)} ${['<', '=', '>'][richtig] ?? ''} ${zahlDeutsch(rechts)}`),
      ],
      fehlerbilder: fehlerbilderAus(auswahl(richtig), [
        [
          'erste-ziffer-verglichen',
          String(links).length !== String(rechts).length
            ? auswahl(zeichenIndex(ersteL, ersteR))
            : undefined,
        ],
        ['zeichen-verdreht', richtig === 1 ? undefined : auswahl(2 - richtig)],
      ]),
    };
  },
};
