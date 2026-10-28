/**
 * Auswahl der nächsten Aufgabe für eine Kompetenz und ein Niveau.
 * Rein: Seed und Vorlagen werden hereingereicht.
 */
import type { Niveau } from '../competence/kompetenz';
import type { GeneratorVorlage } from './vorlage';

/** Alle Vorlagen einer Kompetenz für ein Niveau, nach ID sortiert. */
export function vorlagenFuer(
  vorlagen: readonly GeneratorVorlage[],
  kompetenz: string,
  niveau: Niveau,
): GeneratorVorlage[] {
  return vorlagen
    .filter((v) => v.kompetenz === kompetenz && v.niveaus.includes(niveau))
    .sort((a, b) => a.id.localeCompare(b.id));
}

/**
 * Nächste Vorlage: reihum, damit sich die Aufgabenarten abwechseln
 * (Qualität vor Menge, R4); die Zahlen variieren über den Seed.
 */
export function naechsteVorlage(
  auswahl: readonly GeneratorVorlage[],
  bisherige: number,
): GeneratorVorlage | undefined {
  return auswahl.length === 0 ? undefined : auswahl[bisherige % auswahl.length];
}
