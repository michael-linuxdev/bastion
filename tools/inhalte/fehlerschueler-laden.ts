// Lädt Inhalte und Generatoren für den Fehler-Schüler (läuft unter Vite, siehe fehlerschueler-lauf.ts).
import { generatoren } from '../../src/generators/alle';
import { fehlerschueler, verdachtsliste } from './fehlerschueler';
import { zaehle } from './fehlerschueler-grenze';
import { pruefeInhalte } from './pruefen';

export function verdachtAlsText(seeds: number): string {
  return verdachtsliste(
    fehlerschueler(pruefeInhalte('content', generatoren), generatoren, { seeds }),
  );
}

/** Funde je Art für die Sperrklinke (B4) */
export function fundeJeArt(seeds: number) {
  return zaehle(fehlerschueler(pruefeInhalte('content', generatoren), generatoren, { seeds }));
}
