// Markiert in allen Vorlagen das erste Vorkommen jedes Fachbegriffs je Text als
// [[Form]] (LEHRPLAN L-7, INHALTSFORMAT §11.1). Aufruf: pnpm inhalte:begriffe
// Ändert nur Zeilen „de: …“ und schreibt geänderte Werte in einfachen Anführungszeichen.
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { begriffskarte, markiere, type Begriff } from '../../src/core/learning/begriffe';
import { ladeAnleitungen, ladeBegriffe, ladeVorlagen } from './laden';

const ordner = process.argv[2] ?? 'content';
const begriffe = (ladeBegriffe(ordner).daten as { begriffe: Begriff[] }).begriffe;
const karte = begriffskarte(begriffe);
let geaendert = 0;
for (const v of [...ladeVorlagen(ordner), ...ladeAnleitungen(ordner)]) {
  const pfad = join(ordner, v.datei);
  const alt = readFileSync(pfad, 'utf8');
  const neu = alt.replace(/^(\s*(?:- )?de: )(.*)$/gm, (zeile, anfang: string, wert: string) => {
    const zitiert = wert.startsWith("'") && wert.endsWith("'");
    const text = zitiert ? wert.slice(1, -1).replaceAll("''", "'") : wert;
    const markiert = markiere(text, karte);
    return markiert === text ? zeile : `${anfang}'${markiert.replaceAll("'", "''")}'`;
  });
  if (neu !== alt) {
    writeFileSync(pfad, neu);
    geaendert += 1;
  }
}
console.log(`${geaendert} Dateien geändert.`);
