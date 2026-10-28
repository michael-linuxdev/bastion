// Lädt die Inhaltspakete von der eigenen Adresse (CLAUDE.md: keine anderen
// Netzverbindungen). Offline kommen sie aus dem Speicher des Service Workers.
import type { Kompetenz } from '../../core/competence/kompetenz';
import { begriffskarte, type Begriff, type Begriffskarte } from '../../core/learning/begriffe';
import type { GeneratorVorlage } from '../../core/learning/vorlage';

interface Manifest {
  readonly format: number;
  readonly pakete: readonly { readonly name: string; readonly datei: string }[];
}

export interface Inhalte {
  readonly kompetenzen: readonly Kompetenz[];
  readonly vorlagen: readonly GeneratorVorlage[];
  /** Vorlagen-ID → Paket mit Prüfsummen-Anfang, z. B. "mathematik.raum-und-form.0cfb07d011" */
  readonly paketVon: ReadonlyMap<string, string>;
  /** Fachbegriffe mit Erklärung (L-7), Form → Begriff */
  readonly begriffe: Begriffskarte;
}

const UNTERSTUETZTES_FORMAT = 1;

async function hole<T>(datei: string): Promise<T> {
  const antwort = await fetch(`${import.meta.env.BASE_URL}packs/${datei}`);
  if (!antwort.ok) throw new Error(`Paket ${datei}: ${antwort.status}`);
  return (await antwort.json()) as T;
}

export async function ladeInhalte(): Promise<Inhalte> {
  const manifest = await hole<Manifest>('manifest.json');
  if (manifest.format !== UNTERSTUETZTES_FORMAT) throw new Error('Paketformat unbekannt');
  const pakete = await Promise.all(
    manifest.pakete.map((p) =>
      hole<{ kompetenzen?: Kompetenz[]; vorlagen?: GeneratorVorlage[]; begriffe?: Begriff[] }>(
        p.datei,
      ),
    ),
  );
  const paketVon = new Map<string, string>();
  pakete.forEach((p, i) => {
    const datei = manifest.pakete[i]?.datei.replace(/\.json$/, '') ?? '';
    for (const v of p.vorlagen ?? []) paketVon.set(v.id, datei);
  });
  return {
    kompetenzen: pakete.flatMap((p) => p.kompetenzen ?? []),
    vorlagen: pakete.flatMap((p) => p.vorlagen ?? []),
    paketVon,
    begriffe: begriffskarte(pakete.flatMap((p) => p.begriffe ?? [])),
  };
}
