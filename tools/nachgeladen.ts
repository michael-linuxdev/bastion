// Welche Dateien lädt die App nur bei Bedarf nach (z. B. die Grafik der Bastion,
// ARCHITEKTUR T-6)? Aus dem Vite-Manifest: Alles, was vom Einstieg (index.html)
// nicht über statische Importe erreichbar ist. Genutzt vom Größenbudget und vom
// Service Worker, der Nachgeladenes nicht vorab speichert (R7, A3).
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

interface Eintrag {
  readonly file: string;
  readonly isEntry?: boolean;
  readonly imports?: readonly string[];
}

export function nachgeladeneDateien(dist: string): Set<string> {
  const pfad = join(dist, '.vite', 'manifest.json');
  if (!existsSync(pfad)) return new Set();
  const manifest = JSON.parse(readFileSync(pfad, 'utf8')) as Record<string, Eintrag>;
  const statisch = new Set<string>();
  const offen = Object.keys(manifest).filter((k) => manifest[k]?.isEntry);
  for (let k = offen.pop(); k !== undefined; k = offen.pop()) {
    const e = manifest[k];
    if (!e || statisch.has(e.file)) continue;
    statisch.add(e.file);
    offen.push(...(e.imports ?? []));
  }
  return new Set(
    Object.values(manifest)
      .map((e) => e.file)
      .filter((f) => f.endsWith('.js') && !statisch.has(f)),
  );
}
