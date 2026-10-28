import { dezimalDeutsch } from '../../../core/learning/format';
import type { Generator } from '../../../core/learning/generator';
import { fehlerbilderAus } from '../../../core/learning/loesung';
import { rng } from '../../../core/rng/rng';
import { de, zahl } from '../../hilfen';

/** Hohlmaß und Volumen: 1 l = 1 dm³, 1 ml = 1 cm³. Wert in ml bzw. cm³ je Einheit. */
const IN_ML: Readonly<Record<string, number>> = { ml: 1, 'cm³': 1, l: 1000, 'dm³': 1000 };
const PAARE: readonly (readonly [string, string])[] = [
  ['l', 'dm³'],
  ['dm³', 'l'],
  ['ml', 'cm³'],
  ['cm³', 'ml'],
  ['l', 'cm³'],
  ['dm³', 'ml'],
  ['cm³', 'l'],
  ['ml', 'dm³'],
];

export interface HohlmassParameter {
  readonly paare: number; // die ersten n Paare aus PAARE (4 … 8)
  readonly dezimal: boolean;
}

/** „3 l = ? dm³“, „2500 cm³ = ? l“ – Vorlage M.GM.KP.EINHEITEN.LITER */
export const hohlmassVolumen: Generator<HohlmassParameter> = {
  id: 'gr.hohlmass-volumen',
  version: 1,
  platzhalter: ['wert', 'von', 'nach'],
  fehlerbildIds: ['liter-nicht-gleich-dm3', 'nicht-umgerechnet'],

  erzeuge(seed, p) {
    const r = rng(seed);
    const [von, nach] = PAARE[r.int(0, Math.min(Math.max(p.paare, 4), PAARE.length) - 1)] ?? [
      'l',
      'dm³',
    ];
    const f = (IN_ML[von] ?? 1) / (IN_ML[nach] ?? 1); // 1, 1000 oder 1/1000
    // In Tausendsteln rechnen, damit keine Gleitkomma-Ungenauigkeit entsteht.
    let tausendstel: number;
    if (f === 1) tausendstel = p.dezimal ? r.int(11, 999) * 100 : r.int(2, 99) * 1000;
    else if (f > 1) tausendstel = p.dezimal ? r.int(11, 99) * 100 : r.int(2, 9) * 1000;
    else tausendstel = (p.dezimal ? r.int(11, 999) * 10 : r.int(2, 9) * 1000) * 1000;
    const wert = tausendstel / 1000;
    const richtig = f >= 1 ? (tausendstel * f) / 1000 : tausendstel / 1000 / 1000;
    return {
      platzhalter: { wert: de(dezimalDeutsch(wert)), von: de(von), nach: de(nach) },
      loesung: zahl(richtig),
      loesungsweg: [
        de('1 l = 1 dm³ und 1 ml = 1 cm³. Außerdem: 1 l = 1000 ml und 1 dm³ = 1000 cm³.'),
        de(
          f === 1
            ? `${dezimalDeutsch(wert)} ${von} = ${dezimalDeutsch(richtig)} ${nach}`
            : f > 1
              ? `mal 1000: ${dezimalDeutsch(wert)} ${von} = ${dezimalDeutsch(richtig)} ${nach}`
              : `durch 1000: ${dezimalDeutsch(wert)} ${von} = ${dezimalDeutsch(richtig)} ${nach}`,
        ),
      ],
      fehlerbilder: fehlerbilderAus(zahl(richtig), [
        // tausendstel = wert · 1000
        ['liter-nicht-gleich-dm3', f === 1 ? zahl(tausendstel) : undefined],
        ['nicht-umgerechnet', f === 1 ? undefined : zahl(wert)],
      ]),
    };
  },
};
