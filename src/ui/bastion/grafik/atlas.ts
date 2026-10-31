/**
 * Sprite-Atlas-Anbindung (GRAFIK-SPRITES.md, B-28).
 * Lädt optional ein Manifest; fehlt es oder schlägt es fehl, bleibt der Code-Fallback.
 * Keine Netz-URL außer der eigenen App-Adresse.
 */
import type { GebaeudeTyp } from '../../../core/bastion/katalog';
import type { Thema } from '../../../core/policy/einstellung';

export interface AtlasEintrag {
  readonly id: string;
  readonly datei: string;
  readonly felder: readonly [number, number];
  readonly anker: { readonly x: number; readonly y: number };
  readonly pixel: { readonly w: number; readonly h: number };
}

export interface AtlasManifest {
  readonly version: number;
  readonly eintraege: readonly AtlasEintrag[];
}

const MANIFEST_URL = `${import.meta.env.BASE_URL}grafik/atlas/manifest.json`;

let geladen: AtlasManifest | null | undefined;

/** Manifest einmal laden; null = kein Atlas (Fallback). */
export async function atlasLaden(): Promise<AtlasManifest | null> {
  if (geladen !== undefined) return geladen;
  try {
    const antwort = await fetch(MANIFEST_URL);
    if (!antwort.ok) {
      geladen = null;
      return null;
    }
    const data = (await antwort.json()) as AtlasManifest;
    if (!data || !Array.isArray(data.eintraege)) {
      geladen = null;
      return null;
    }
    geladen = data;
    return data;
  } catch {
    geladen = null;
    return null;
  }
}

/** Nur für Tests: Cache zurücksetzen. */
export function atlasZuruecksetzen(): void {
  geladen = undefined;
}

export function atlasId(thema: Thema, epoche: number, rolle: GebaeudeTyp, stufe: number): string {
  return `${thema}/e${epoche}/${rolle}_s${stufe}`;
}

/** Eintrag suchen oder undefined → Code zeichnen. */
export function atlasEintrag(
  manifest: AtlasManifest | null,
  thema: Thema,
  epoche: number,
  rolle: GebaeudeTyp,
  stufe: number,
): AtlasEintrag | undefined {
  if (!manifest) return undefined;
  const id = atlasId(thema, epoche, rolle, stufe);
  return manifest.eintraege.find((e) => e.id === id);
}

/** Beliebigen Manifest-Eintrag per ID (Gebäude, Boden, Wesen). */
export function atlasEintragPerId(
  manifest: AtlasManifest | null,
  id: string,
): AtlasEintrag | undefined {
  if (!manifest) return undefined;
  return manifest.eintraege.find((e) => e.id === id);
}

/** Wesen-Frame-ID nach GRAFIK-SPRITES.md §3 / §6. */
export function atlasWesenId(
  thema: Thema,
  art: string,
  zyklus: 'idle' | 'walk' | 'react',
  frame: number,
): string {
  return `wesen/${thema}/${art}_${zyklus}_${frame}`;
}

/** Basis-URL der Atlas-Dateien (eigene App-Adresse). */
export function atlasBasisUrl(): string {
  return `${import.meta.env.BASE_URL}grafik/atlas/`;
}
