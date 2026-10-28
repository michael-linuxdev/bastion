/**
 * Studierstube (BASEBAU §4.3, B-6): Spiegel des Könnens. Für jede Kompetenz,
 * die auf einem Niveau gefestigt ist, steht ein Buch im Regal – automatisch und
 * kostenlos. Ein Buch bleibt, auch wenn das Thema später wackelt; ehrlich
 * „auffrischen“ zeigt „Mein Stand“.
 *
 * Quelle sind die Bauplan-Buchungen (Grund `kompetenz-gefestigt`): Sie entstehen
 * genau einmal beim ersten „gefestigt“ und werden nie zurückgenommen. So liest
 * die Bastion nur das Ledger (K-1, DATENMODELL §5.1).
 */
import type { BuchungEreignis } from '../ledger/buchung';

export interface Buch {
  readonly kompetenz: string;
  readonly niveau: string;
  /** Lerntag des ersten „gefestigt“ */
  readonly seit: string;
}

/** Alle Bücher, das älteste zuerst. */
export function buecher(buchungen: readonly BuchungEreignis[]): Buch[] {
  const regal = new Map<string, Buch>();
  for (const b of buchungen) {
    if (b.grund !== 'kompetenz-gefestigt' || b.ressource !== 'bauplan' || b.menge <= 0) continue;
    const at = b.bezug.lastIndexOf('@');
    if (at < 1 || regal.has(b.bezug)) continue;
    regal.set(b.bezug, {
      kompetenz: b.bezug.slice(0, at),
      niveau: b.bezug.slice(at + 1),
      seit: b.tag,
    });
  }
  return [...regal.values()].sort((a, b) =>
    a.seit < b.seit ? -1 : a.seit > b.seit ? 1 : a.kompetenz < b.kompetenz ? -1 : 1,
  );
}
