// Welche Dateien lädt die App nur bei Bedarf nach? Aus dem Vite-Manifest: Alles,
// was vom Einstieg (index.html) nicht über statische Importe erreichbar ist.
// Zwei Arten (ARCHITEKTUR T-6, T-14):
// - die Grafik der Bastion (PixiJS): nur bei Bedarf, nicht vorab gespeichert (R7, A3);
// - die Aufgaben-Generatoren (src/generators/alle.ts): nachgeladen, damit die
//   App-Hülle klein bleibt, aber vorab gespeichert – Üben geht auch ohne Netz.
// Genutzt vom Größenbudget und vom Service Worker.
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

interface Eintrag {
  readonly file: string;
  readonly isEntry?: boolean;
  readonly imports?: readonly string[];
}

const GENERATOREN = 'src/generators/alle.ts';

function lies(dist: string): Record<string, Eintrag> | undefined {
  const pfad = join(dist, '.vite', 'manifest.json');
  if (!existsSync(pfad)) return undefined;
  return JSON.parse(readFileSync(pfad, 'utf8')) as Record<string, Eintrag>;
}

/** Dateien, die von den Startpunkten aus über statische Importe erreichbar sind. */
function erreichbar(manifest: Record<string, Eintrag>, start: readonly string[]): Set<string> {
  const dateien = new Set<string>();
  const offen = [...start];
  for (let k = offen.pop(); k !== undefined; k = offen.pop()) {
    const e = manifest[k];
    if (!e || dateien.has(e.file)) continue;
    dateien.add(e.file);
    offen.push(...(e.imports ?? []));
  }
  return dateien;
}

function aufteilen(dist: string) {
  const manifest = lies(dist);
  if (!manifest) return { generatoren: new Set<string>(), grafik: new Set<string>() };
  const statisch = erreichbar(
    manifest,
    Object.keys(manifest).filter((k) => manifest[k]?.isEntry),
  );
  const generatoren = new Set(
    [...erreichbar(manifest, [GENERATOREN])].filter((f) => f.endsWith('.js') && !statisch.has(f)),
  );
  const grafik = new Set(
    Object.values(manifest)
      .map((e) => e.file)
      .filter((f) => f.endsWith('.js') && !statisch.has(f) && !generatoren.has(f)),
  );
  return { generatoren, grafik };
}

/** Nur bei Bedarf geladen und nicht vorab gespeichert: die Grafik der Bastion. */
export const nachgeladeneDateien = (dist: string): Set<string> => aufteilen(dist).grafik;

/** Nachgeladen, aber vorab gespeichert: die Aufgaben-Generatoren. */
export const generatorDateien = (dist: string): Set<string> => aufteilen(dist).generatoren;
