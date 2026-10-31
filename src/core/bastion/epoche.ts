/**
 * Epochenstand (BASEBAU §5.4–§5.5): freigeschaltete Epoche aus Kern-Stufe und
 * erworbenen Bauplänen. Keine eigenen Ereignisdaten – abgeleitet (B-28 / G9).
 */
import type { Konto } from '../ledger/buchung';
import type { Bastion } from './bauen';
import { bauplatzFuer, EPOCHE_ZIEL, epocheFreigeschaltet, type Epoche } from './epochen';

/** @deprecated Nutze EPOCHE_ZIEL[1] – bleibt für ältere Aufrufe */
export const EPOCHE_1_ZIEL = EPOCHE_ZIEL[1];

export interface Epochenstand {
  /** Freigeschaltete Epoche (Bauplatz + Katalog) */
  readonly epoche: Epoche;
  readonly kern: number;
  readonly bauplaene: number;
  /** Ziel der aktuellen Epoche (Wechsel zur nächsten bzw. Epoche 4 fertig) */
  readonly ziel: { readonly kern: number; readonly bauplaene: number };
  /** Textschlüssel für den Epochen-Namen im Thema (`epoche`, `epoche-2`, …) */
  readonly nameKey: string;
  /** Aktuelles Epochenziel erreicht – nächste Epoche ist offen bzw. alles fertig */
  readonly geschafft: boolean;
  /** Epoche 4 vollständig (Kern 9 und 120 Baupläne) */
  readonly fertig: boolean;
  readonly bauplatz: { readonly breite: number; readonly tiefe: number };
}

export function epochenstand(b: Bastion, konto: Konto): Epochenstand {
  const kern = Math.max(0, ...b.bauwerke.filter((x) => x.typ === 'kern').map((x) => x.stufe));
  const bauplaene = konto.erworben.koennen;
  const epoche = epocheFreigeschaltet(kern, bauplaene);
  const fertig = kern >= EPOCHE_ZIEL[4].kern && bauplaene >= EPOCHE_ZIEL[4].bauplaene;
  const ziel = EPOCHE_ZIEL[epoche];
  const geschafft = kern >= ziel.kern && bauplaene >= ziel.bauplaene;
  return {
    epoche,
    kern,
    bauplaene,
    ziel: { kern: ziel.kern, bauplaene: ziel.bauplaene },
    nameKey: ziel.nameKey,
    geschafft,
    fertig,
    bauplatz: bauplatzFuer(epoche),
  };
}
