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

/** Boden-Kachel-ID: Spec `flaeche`/`rand`, plus Wiesen-Varianten `flaeche_b`/`flaeche_hell`. */
export type BodenKachel = 'flaeche' | 'rand' | 'flaeche_b' | 'flaeche_hell';

export function atlasId(thema: Thema, epoche: number, rolle: GebaeudeTyp, stufe: number): string {
  return `${thema}/e${epoche}/${rolle}_s${stufe}`;
}

export function atlasBodenId(thema: Thema, epoche: number, kachel: BodenKachel): string {
  return `boden/${thema}/e${epoche}/${kachel}`;
}

/** Abend-Fenster-Overlay nach GRAFIK-SPRITES.md §3 (`*_fenster.png`). */
export function atlasFensterId(
  thema: Thema,
  epoche: number,
  rolle: GebaeudeTyp,
  stufe: number,
): string {
  return `${atlasId(thema, epoche, rolle, stufe)}_fenster`;
}

/**
 * Eintrag suchen oder undefined → Code zeichnen.
 * P5: fehlt die aktuelle Epoche, nächstniedrigere (bis e1) – gleiche Stufe/Rolle.
 */
export function atlasEintrag(
  manifest: AtlasManifest | null,
  thema: Thema,
  epoche: number,
  rolle: GebaeudeTyp,
  stufe: number,
): AtlasEintrag | undefined {
  if (!manifest) return undefined;
  const eMax = Math.max(1, Math.min(4, Math.floor(epoche)));
  for (let e = eMax; e >= 1; e--) {
    const id = atlasId(thema, e, rolle, stufe);
    const gefunden = manifest.eintraege.find((x) => x.id === id);
    if (gefunden) return gefunden;
  }
  return undefined;
}

/**
 * Abend-Fenster mit Epoche-Fallback (wie atlasEintrag).
 * Fehlt der Layer ganz, liefert undefined – kein Abend-Overlay.
 */
export function atlasFensterEintrag(
  manifest: AtlasManifest | null,
  thema: Thema,
  epoche: number,
  rolle: GebaeudeTyp,
  stufe: number,
): AtlasEintrag | undefined {
  if (!manifest) return undefined;
  const eMax = Math.max(1, Math.min(4, Math.floor(epoche)));
  for (let e = eMax; e >= 1; e--) {
    const id = atlasFensterId(thema, e, rolle, stufe);
    const gefunden = manifest.eintraege.find((x) => x.id === id);
    if (gefunden) return gefunden;
  }
  return undefined;
}

/**
 * Boden-Kachel mit Epoche-Fallback (P5: e2–e4, sonst e1).
 */
export function atlasBodenEintrag(
  manifest: AtlasManifest | null,
  thema: Thema,
  epoche: number,
  kachel: BodenKachel,
): AtlasEintrag | undefined {
  if (!manifest) return undefined;
  const eMax = Math.max(1, Math.min(4, Math.floor(epoche)));
  for (let e = eMax; e >= 1; e--) {
    const id = atlasBodenId(thema, e, kachel);
    const gefunden = manifest.eintraege.find((x) => x.id === id);
    if (gefunden) return gefunden;
  }
  return undefined;
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

/** Himmel-ID nach GRAFIK-SPRITES.md §3 (P1). */
export type HimmelTeil = 'sonne' | 'mond' | 'wolke_1' | 'wolke_2';

export function atlasHimmelId(teil: HimmelTeil): string {
  return `himmel/${teil}`;
}

/** Wetter-Partikel-ID (P1). */
export type WetterTeil = 'regen_tropfen' | 'schnee_flocke' | 'nebel';

export function atlasWetterId(teil: WetterTeil): string {
  return `wetter/${teil}`;
}

/** Schnee-Dach-Auflage nach Feldgröße (P1). */
export function atlasSchneeDachId(felder: readonly [number, number]): string {
  return `auflage/schnee_dach_${felder[0]}x${felder[1]}`;
}

/** Laub-Partikel 1…3 (P1). */
export function atlasLaubId(n: 1 | 2 | 3): string {
  return `auflage/laub_${n}`;
}

/** Hinterhof-Platz/Wappen/Denkmal (P4, GRAFIK-SPRITES.md §7). */
export type HinterhofTeil = 'platz_g' | 'platz_m' | 'platz_offen' | 'wappen_voll' | 'denkmal_voll';

export function atlasHinterhofId(thema: Thema, teil: HinterhofTeil): string {
  return `hinterhof/${thema}/${teil}`;
}

/** MiniBastion-Standbild (P4). */
export function atlasMinibatId(thema: Thema): string {
  return `minibat/${thema}/standbild`;
}

/** Basis-URL der Atlas-Dateien (eigene App-Adresse). */
export function atlasBasisUrl(): string {
  return `${import.meta.env.BASE_URL}grafik/atlas/`;
}
