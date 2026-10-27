import { zahlDeutsch } from '../../../core/learning/format';
import type { Fehlerbild, Generator } from '../../../core/learning/generator';
import { rng } from '../../../core/rng/rng';
import { STELLEN, STELLEN_KURZ, zifferAn } from './stellen';

export interface ZifferAnStelleParameter {
  /** Kleinste und größte Stellenzahl der Zahl (4 … 12). */
  readonly stellen_min: number;
  readonly stellen_max: number;
}

/**
 * „Welche Ziffer steht in 4 382 517 an der Hunderttausenderstelle?“
 * Vorlage: M.ZO.NZ.STELLENWERT.ZIFFER-AN-STELLE (Sachsen: OS/GY Kl. 5, LB 1).
 */
export const zifferAnStelle: Generator<ZifferAnStelleParameter> = {
  id: 'nz.ziffer-an-stelle',
  version: 1,
  platzhalter: ['zahl', 'stelle'],
  fehlerbildIds: ['von-links-gezaehlt', 'stelle-links-daneben', 'stelle-rechts-daneben'],

  erzeuge(seed, p) {
    if (p.stellen_min < 2 || p.stellen_max > STELLEN.length || p.stellen_min > p.stellen_max) {
      throw new RangeError(`Stellenzahl muss in 2 … ${STELLEN.length} liegen`);
    }
    const r = rng(seed);
    const anzahl = r.int(p.stellen_min, p.stellen_max);
    // Erste Ziffer nie 0; danach beliebig – auch Nullen, die sind lehrreich.
    let zahl = r.int(1, 9);
    for (let i = 1; i < anzahl; i++) zahl = zahl * 10 + r.int(0, 9);
    const stelle = r.int(0, anzahl - 1);
    const richtig = zifferAn(zahl, stelle);

    // Reihenfolge = Vorrang bei gleicher falscher Antwort.
    const kandidaten: [string, number | undefined][] = [
      // Stelle von links statt von rechts abgezählt
      ['von-links-gezaehlt', zifferAn(zahl, anzahl - 1 - stelle)],
      ['stelle-links-daneben', stelle + 1 < anzahl ? zifferAn(zahl, stelle + 1) : undefined],
      ['stelle-rechts-daneben', stelle > 0 ? zifferAn(zahl, stelle - 1) : undefined],
    ];
    const fehlerbilder: Fehlerbild[] = [];
    const vergeben = new Set([richtig]);
    for (const [id, antwort] of kandidaten) {
      if (antwort === undefined || vergeben.has(antwort)) continue;
      vergeben.add(antwort);
      fehlerbilder.push({ id, antwort: { typ: 'zahl', wert: antwort } });
    }

    const tafel = Array.from(
      { length: stelle + 1 },
      (_, i) => `${STELLEN_KURZ[i] ?? ''} ${zifferAn(zahl, i)}`,
    ).join(' · ');
    return {
      platzhalter: { zahl, stelle: STELLEN[stelle] ?? { de: '' } },
      loesung: { typ: 'zahl', wert: richtig },
      loesungsweg: [
        { de: `Die Stellen werden von rechts gezählt, beginnend mit den Einern.` },
        { de: `${zahlDeutsch(zahl)}: ${tafel}` },
        { de: `An der ${STELLEN[stelle]?.de ?? ''} steht die ${richtig}.` },
      ],
      fehlerbilder,
    };
  },
};
