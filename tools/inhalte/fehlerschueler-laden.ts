// Lädt Inhalte und Generatoren für den Fehler-Schüler (läuft unter Vite, siehe fehlerschueler-lauf.ts).
import { generatoren } from '../../src/generators/alle';
import { fehlerschueler, verdachtsliste } from './fehlerschueler';
import { pruefeInhalte } from './pruefen';

export function verdachtAlsText(seeds: number): string {
  return verdachtsliste(
    fehlerschueler(pruefeInhalte('content', generatoren), generatoren, { seeds }),
  );
}
