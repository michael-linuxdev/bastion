// Fachbegriffe in YAML-Zeilen „de: …“ markieren (für pnpm inhalte:begriffe).
import { markiere, type Begriffskarte } from '../../src/core/learning/begriffe';

/**
 * Markiert die Werte aller Zeilen „de: …“. Ein Komma hinter dem schließenden Anführungszeichen
 * (mehrzeilige Kurzform `{ de: '…', }` nach Prettier) bleibt als Trennzeichen stehen.
 */
export const markiereDeZeilen = (inhalt: string, k: Begriffskarte) =>
  inhalt.replace(/^(\s*(?:- )?de: )(.*)$/gm, (zeile, anfang: string, roh: string) => {
    const komma = roh.startsWith("'") && roh.endsWith("',");
    const wert = komma ? roh.slice(0, -1) : roh;
    const zitiert = wert.length > 1 && wert.startsWith("'") && wert.endsWith("'");
    const text = zitiert ? wert.slice(1, -1).replaceAll("''", "'") : wert;
    const markiert = markiere(text, k);
    return markiert === text
      ? zeile
      : `${anfang}'${markiert.replaceAll("'", "''")}'${komma ? ',' : ''}`;
  });
