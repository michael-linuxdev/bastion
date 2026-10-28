// Status einer Kompetenz zur Anzeige – eine Stelle für Übersicht, „Mein Stand“ und Rückweg.
import type { Niveau } from '../../core/competence/kompetenz';
import { anzeigeStatus, type AnzeigeStatus } from '../../core/learning/fortschritt';
import type { Zustand } from '../plattform/ablage';

export function statusVon(
  z: Zustand,
  kompetenz: string,
  niveau: Niveau,
  jetzt: number,
): AnzeigeStatus {
  return anzeigeStatus(
    z.staende.get(`${kompetenz}|${niveau}`),
    z.karten.filter((k) => k.kompetenz === kompetenz && k.niveau === niveau),
    jetzt,
  );
}

/** „Sitzt“ im Sinne von L-5: mindestens gekonnt (auch wenn es gerade aufgefrischt werden sollte). */
export const sitzt = (s: AnzeigeStatus) =>
  s === 'gekonnt' || s === 'gefestigt' || s === 'auffrischen';

/** Nächste Wiederholung einer Kompetenz (früheste Fälligkeit ihrer Karten). */
export function naechsteWiederholung(
  z: Zustand,
  kompetenz: string,
  niveau: Niveau,
): number | undefined {
  const f = z.karten
    .filter((k) => k.kompetenz === kompetenz && k.niveau === niveau)
    .map((k) => k.faellig);
  return f.length ? Math.min(...f) : undefined;
}
