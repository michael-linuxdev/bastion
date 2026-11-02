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

const RANG: readonly AnzeigeStatus[] = ['neu', 'in-arbeit', 'auffrischen', 'gekonnt', 'gefestigt'];
const NIVEAUS: readonly Niveau[] = ['G', 'M', 'E'];

/**
 * Status für Lernende, ohne Niveau (L-22): der beste Stand über alle Niveaus.
 * Das Niveau wählt die App still (src/core/learning/niveau-wahl.ts); Lernende sehen es nicht.
 */
export function statusGesamt(z: Zustand, kompetenz: string, jetzt: number): AnzeigeStatus {
  return NIVEAUS.map((n) => statusVon(z, kompetenz, n, jetzt)).reduce((a, b) =>
    RANG.indexOf(b) > RANG.indexOf(a) ? b : a,
  );
}

/** Nächste Wiederholung über alle Niveaus (früheste Fälligkeit). */
export function naechsteWiederholungGesamt(z: Zustand, kompetenz: string): number | undefined {
  const f = NIVEAUS.map((n) => naechsteWiederholung(z, kompetenz, n)).filter(
    (x): x is number => x !== undefined,
  );
  return f.length ? Math.min(...f) : undefined;
}
