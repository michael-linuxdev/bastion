import { dezimalDeutsch, runde10, zahlDeutsch } from '../../../core/learning/format';
import type { Generator } from '../../../core/learning/generator';
import { fehlerbilderAus } from '../../../core/learning/loesung';
import { rng } from '../../../core/rng/rng';
import { de, verlange, zahl } from '../../hilfen';

export interface MittelwertParameter {
  readonly anzahl_min: number; // 3 … 8
  readonly anzahl_max: number;
  readonly wert_max: number; // bei Noten: 6
  readonly noten: boolean; // Schulnoten 1 … 6, Ergebnis auf eine Nachkommastelle gerundet
  readonly ganzzahlig: boolean; // Durchschnitt geht auf (nur bei noten: false)
}

/**
 * „Berechne den Durchschnitt von 12, 7, 15 und 10.“ / „Notendurchschnitt“
 * Vorlagen M.DZ.DA.MITTELWERT.ZAHLEN und .NOTEN
 */
export const mittelwert: Generator<MittelwertParameter> = {
  id: 'da.mittelwert',
  version: 1,
  platzhalter: ['werte', 'anzahl'],
  fehlerbildIds: ['durch-falsche-anzahl', 'nur-summe', 'nicht-gerundet'],

  erzeuge(seed, p) {
    verlange(
      p.anzahl_min >= 3 && p.anzahl_min <= p.anzahl_max && p.anzahl_max <= 8,
      'anzahl: 3 … 8',
    );
    verlange(
      p.noten ? p.wert_max === 6 : p.wert_max >= 10 && p.wert_max <= 1000,
      'wert_max: 6 (Noten) oder 10 … 1000',
    );
    const r = rng(seed);
    const n = r.int(p.anzahl_min, p.anzahl_max);
    const werte = Array.from({ length: n }, () => r.int(1, p.wert_max));
    if (p.ganzzahlig && !p.noten) {
      // letzten Wert so anpassen, dass die Summe durch n teilbar ist
      const letzter = werte[n - 1] as number;
      const rest = werte.reduce((a, b) => a + b, 0) % n;
      werte[n - 1] = letzter - rest > 0 ? letzter - rest : letzter + (n - rest);
    }
    const summe = werte.reduce((a, b) => a + b, 0);
    const genau = summe / n;
    const richtig = p.noten ? runde10(genau, 1) : runde10(genau, 6);
    return {
      platzhalter: { werte: de(werte.map(zahlDeutsch).join('; ')), anzahl: n },
      loesung: zahl(richtig),
      loesungsweg: [
        de(`Summe: ${werte.map(zahlDeutsch).join(' + ')} = ${zahlDeutsch(summe)}`),
        de(
          `Durch die Anzahl der Werte teilen: ${zahlDeutsch(summe)} : ${n} = ${dezimalDeutsch(genau, 3)}`,
        ),
        ...(p.noten ? [de(`Auf eine Nachkommastelle gerundet: ${dezimalDeutsch(richtig)}`)] : []),
      ],
      fehlerbilder: fehlerbilderAus(zahl(richtig), [
        [
          'durch-falsche-anzahl',
          zahl(p.noten ? runde10(summe / (n - 1), 1) : runde10(summe / (n - 1), 6)),
        ],
        ['nur-summe', zahl(summe)],
        [
          'nicht-gerundet',
          p.noten && runde10(genau, 2) !== richtig ? zahl(runde10(genau, 2)) : undefined,
        ],
      ]),
    };
  },
};
