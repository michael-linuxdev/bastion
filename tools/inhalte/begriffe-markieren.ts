// Markiert in allen Vorlagen, Anleitungen, Fehlvorstellungen und Erstvermittlungen das erste
// Vorkommen jedes Fachbegriffs je Text als [[Form]] (LEHRPLAN L-7, INHALTSFORMAT §11.1).
// Aufruf: pnpm inhalte:begriffe
// Ändert nur Zeilen „de: …“ und schreibt geänderte Werte in einfachen Anführungszeichen.
// In Fehlvorstellungen nur die Erklärung und das Gegenbeispiel, nicht Name und Beschreibung.
// In Erstvermittlungen stehen Antwortoptionen in der Kurzform `wert: { de: … }` und bleiben unberührt.
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { begriffskarte, markiere, type Begriff } from '../../src/core/learning/begriffe';
import {
  ladeAnleitungen,
  ladeBegriffe,
  ladeFehlvorstellungen,
  ladeVermittlungen,
  ladeVorlagen,
} from './laden';

const ordner = process.argv[2] ?? 'content';
const begriffe = (ladeBegriffe(ordner).daten as { begriffe: Begriff[] }).begriffe;
const karte = begriffskarte(begriffe);

const markiereZeilen = (inhalt: string) =>
  inhalt.replace(/^(\s*(?:- )?de: )(.*)$/gm, (zeile, anfang: string, wert: string) => {
    const zitiert = wert.startsWith("'") && wert.endsWith("'");
    const text = zitiert ? wert.slice(1, -1).replaceAll("''", "'") : wert;
    const markiert = markiere(text, karte);
    return markiert === text ? zeile : `${anfang}'${markiert.replaceAll("'", "''")}'`;
  });

/** Nur der Teil von „erklaerung:“ bis vor „rueckweg:“ wird geprüft und markiert. */
const markiereFehlvorstellung = (inhalt: string) => {
  const von = inhalt.search(/^erklaerung:/m);
  const bis = inhalt.search(/^rueckweg:/m);
  if (von < 0 || bis < von) return inhalt;
  return inhalt.slice(0, von) + markiereZeilen(inhalt.slice(von, bis)) + inhalt.slice(bis);
};

let geaendert = 0;
const dateien = [
  ...[...ladeVorlagen(ordner), ...ladeAnleitungen(ordner)].map((d) => ({
    datei: d.datei,
    markieren: markiereZeilen,
  })),
  ...ladeFehlvorstellungen(ordner).map((d) => ({
    datei: d.datei,
    markieren: markiereFehlvorstellung,
  })),
  ...ladeVermittlungen(ordner).map((d) => ({ datei: d.datei, markieren: markiereZeilen })),
];
for (const { datei, markieren } of dateien) {
  const pfad = join(ordner, datei);
  const alt = readFileSync(pfad, 'utf8');
  const neu = markieren(alt);
  if (neu !== alt) {
    writeFileSync(pfad, neu);
    geaendert += 1;
  }
}
console.log(`${geaendert} Dateien geändert.`);
