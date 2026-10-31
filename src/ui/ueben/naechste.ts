// Nächste Übungs-Kompetenz für den direkten Sprung von „Üben“ (ohne Übersicht).
import { nachGraph, type Kompetenz, type Niveau } from '../../core/competence/kompetenz';
import { empfohlen } from '../../core/learning/empfehlung';
import type { GeneratorVorlage } from '../../core/learning/vorlage';
import type { Zustand } from '../plattform/ablage';
import { sitzt, statusVon } from './stand';

/** Ob für Niveau und Klasse Vorlagen existieren. */
export function hatAufgaben(
  k: Kompetenz,
  vorlagen: readonly GeneratorVorlage[],
  niveau: Niveau,
): boolean {
  return vorlagen.some((v) => v.kompetenz === k.id && v.niveaus.includes(niveau));
}

/**
 * Nächste bzw. offene Aufgabe: zuerst „Gerade dran“ (noch nicht sitzt), sonst
 * empfohlen, sonst erstes Thema der Klasse mit Vorlagen.
 */
export function naechsteKompetenz(
  kompetenzen: readonly Kompetenz[],
  vorlagen: readonly GeneratorVorlage[],
  geradeDran: readonly string[],
  niveau: Niveau,
  klasse: number,
  zustand: Zustand,
  jetzt: number,
): Kompetenz | undefined {
  const passt = (k: Kompetenz) => hatAufgaben(k, vorlagen, niveau);

  const ausIds = (ids: readonly string[]) =>
    ids.flatMap((id) => {
      const k = kompetenzen.find((x) => x.id === id);
      return k && passt(k) ? [k] : [];
    });

  const dran = ausIds(geradeDran);
  const offen = dran.find((k) => !sitzt(statusVon(zustand, k.id, niveau, jetzt)));
  if (offen) return offen;
  if (dran[0]) return dran[0];

  const empfehlungen = empfohlen(kompetenzen, (id) => sitzt(statusVon(zustand, id, niveau, jetzt)));
  const empfohlenMitAufgabe = empfehlungen
    .map((id) => kompetenzen.find((k) => k.id === id))
    .find(
      (k): k is Kompetenz => k !== undefined && passt(k) && k.klassenstufe_typisch.includes(klasse),
    );
  if (empfohlenMitAufgabe) return empfohlenMitAufgabe;

  return nachGraph(kompetenzen).find((k) => k.klassenstufe_typisch.includes(klasse) && passt(k));
}
