// Lädt die Inhaltsdateien und baut die Arbeitsliste (läuft unter Vite, siehe lauf.ts).
import { inhaltsdateien } from '../review/dateien';
import { arbeitsliste, leseExport } from './einlesen';

export function arbeitslisteAus(json: string, ordner: string): string {
  return arbeitsliste(leseExport(JSON.parse(json) as unknown), inhaltsdateien(ordner));
}
