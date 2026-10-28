/**
 * Ende der Epoche 1 (BASEBAU §5.4, §9 Punkt 3): Bergfried Stufe 3 **und**
 * 15 erworbene Baupläne (nicht ausgegebene – wer baut, wird nicht bestraft).
 * Epoche 2 wird nicht gebaut (K-18): Fertig sein ist erlaubt.
 */
import type { Konto } from '../ledger/buchung';
import type { Bastion } from './bauen';

export const EPOCHE_1_ZIEL = { bergfried: 3, bauplaene: 15 } as const;

export interface Epochenstand {
  readonly bergfried: number;
  readonly bauplaene: number;
  readonly geschafft: boolean;
}

export function epochenstand(b: Bastion, konto: Konto): Epochenstand {
  const bergfried = Math.max(
    0,
    ...b.bauwerke.filter((x) => x.typ === 'bergfried').map((x) => x.stufe),
  );
  const bauplaene = konto.erworben.bauplan;
  return {
    bergfried,
    bauplaene,
    geschafft: bergfried >= EPOCHE_1_ZIEL.bergfried && bauplaene >= EPOCHE_1_ZIEL.bauplaene,
  };
}
