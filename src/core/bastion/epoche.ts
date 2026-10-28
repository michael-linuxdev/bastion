/**
 * Ende der Epoche 1 (BASEBAU §5.4, §9 Punkt 3): Bergfried Stufe 3 **und**
 * 15 erworbene Baupläne (nicht ausgegebene – wer baut, wird nicht bestraft).
 * Epoche 2 wird nicht gebaut (K-18): Fertig sein ist erlaubt.
 */
import type { Konto } from '../ledger/buchung';
import type { Bastion } from './bauen';

export const EPOCHE_1_ZIEL = { kern: 3, bauplaene: 15 } as const;

export interface Epochenstand {
  readonly kern: number;
  readonly bauplaene: number;
  readonly geschafft: boolean;
}

export function epochenstand(b: Bastion, konto: Konto): Epochenstand {
  const kern = Math.max(0, ...b.bauwerke.filter((x) => x.typ === 'kern').map((x) => x.stufe));
  const bauplaene = konto.erworben.koennen;
  return {
    kern,
    bauplaene,
    geschafft: kern >= EPOCHE_1_ZIEL.kern && bauplaene >= EPOCHE_1_ZIEL.bauplaene,
  };
}
