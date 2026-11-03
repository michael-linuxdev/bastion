// Nächste Übungs-Kompetenz für den direkten Sprung von „Üben“ (ohne Übersicht).
import {
  nachGraph,
  passtZurSchulart,
  type Kompetenz,
  type Schulart,
} from '../../core/competence/kompetenz';
import { empfohlen } from '../../core/learning/empfehlung';
import type { GeneratorVorlage } from '../../core/learning/vorlage';
import type { Zustand } from '../plattform/ablage';
import { sitzt, statusGesamt } from './stand';

/** Ob es Vorlagen gibt (auf irgendeinem Niveau – das Niveau wählt die App, L-22). */
export function hatAufgaben(k: Kompetenz, vorlagen: readonly GeneratorVorlage[]): boolean {
  return vorlagen.some((v) => v.kompetenz === k.id);
}

/**
 * Nächste bzw. offene Aufgabe: zuerst „Gerade dran“ (noch nicht sitzt), sonst
 * empfohlen, sonst erstes Thema der Klasse mit Vorlagen.
 */
export function naechsteKompetenz(
  kompetenzen: readonly Kompetenz[],
  vorlagen: readonly GeneratorVorlage[],
  geradeDran: readonly string[],
  klasse: number,
  zustand: Zustand,
  jetzt: number,
  schulart?: Schulart,
): Kompetenz | undefined {
  const passt = (k: Kompetenz) => hatAufgaben(k, vorlagen) && passtZurSchulart(k, schulart);

  const ausIds = (ids: readonly string[]) =>
    ids.flatMap((id) => {
      const k = kompetenzen.find((x) => x.id === id);
      return k && passt(k) ? [k] : [];
    });

  const dran = ausIds(geradeDran);
  const offen = dran.find((k) => !sitzt(statusGesamt(zustand, k.id, jetzt)));
  if (offen) return offen;
  if (dran[0]) return dran[0];

  const empfehlungen = empfohlen(kompetenzen, (id) => sitzt(statusGesamt(zustand, id, jetzt)));
  const empfohlenMitAufgabe = empfehlungen
    .map((id) => kompetenzen.find((k) => k.id === id))
    .find(
      (k): k is Kompetenz => k !== undefined && passt(k) && k.klassenstufe_typisch.includes(klasse),
    );
  if (empfohlenMitAufgabe) return empfohlenMitAufgabe;

  return nachGraph(kompetenzen).find((k) => k.klassenstufe_typisch.includes(klasse) && passt(k));
}
