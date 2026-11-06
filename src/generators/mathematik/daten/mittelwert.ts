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
 * Vorlagen M.DZ.DA.MITTELWERT.ZAHLEN und .NOTEN. Fassung 2 (Q-L1, 06.11.2026): Ohne Noten wird
 * auf zwei Nachkommastellen gerundet (die Vorlage sagt es), damit kein Ergebnis wie 115,666667
 * entsteht; dazu das Fehlerbild „nicht gerundet“ auch ohne Noten.
 */
function mittelwertFassung(fassung: 1 | 2): Generator<MittelwertParameter> {
  // Nachkommastellen des Ergebnisses: Noten 1, sonst 6 (Fassung 1) bzw. 2 (Fassung 2)
  const stellen = (p: MittelwertParameter) => (p.noten ? 1 : fassung === 2 ? 2 : 6);
  return {
    id: 'da.mittelwert',
    version: fassung,
    platzhalter: ['werte', 'anzahl'],
    fehlerbildIds: ['durch-falsche-anzahl', 'nur-summe', 'nicht-gerundet'],
    // Gerundet wird bei Noten, ab Fassung 2 auch bei Dezimalzahlen (bei ganzzahligem Ergebnis nie)
    fehlerbildIdsFuer: (p) =>
      p.noten || (fassung === 2 && !p.ganzzahlig)
        ? ['durch-falsche-anzahl', 'nur-summe', 'nicht-gerundet']
        : ['durch-falsche-anzahl', 'nur-summe'],

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
      const k = stellen(p);
      const richtig = runde10(genau, k);
      const gerundet = runde10(genau, 6) !== richtig;
      return {
        platzhalter: { werte: de(werte.map(zahlDeutsch).join('; ')), anzahl: n },
        loesung: zahl(richtig),
        loesungsweg: [
          de(`Summe: ${werte.map(zahlDeutsch).join(' + ')} = ${zahlDeutsch(summe)}`),
          de(
            `Durch die Anzahl der Werte teilen: ${zahlDeutsch(summe)} : ${n} = ${dezimalDeutsch(genau, 3)}`,
          ),
          ...(p.noten
            ? [de(`Auf eine Nachkommastelle gerundet: ${dezimalDeutsch(richtig)}`)]
            : fassung === 2 && gerundet
              ? [de(`Auf zwei Nachkommastellen gerundet: ${dezimalDeutsch(richtig)}`)]
              : []),
        ],
        fehlerbilder: fehlerbilderAus(zahl(richtig), [
          ['durch-falsche-anzahl', zahl(runde10(summe / (n - 1), k))],
          ['nur-summe', zahl(summe)],
          [
            'nicht-gerundet',
            p.noten
              ? runde10(genau, 2) !== richtig
                ? zahl(runde10(genau, 2))
                : undefined
              : fassung === 2 && gerundet
                ? zahl(runde10(genau, 3))
                : undefined,
          ],
        ]),
      };
    },
  };
}

/** Fassung 1 bleibt für gespeicherte Aufgaben (INHALTSFORMAT §6.1 Regel 5): Ergebnis auf 6 Stellen. */
export const mittelwertV1 = mittelwertFassung(1);
export const mittelwert = mittelwertFassung(2);
