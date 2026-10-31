/**
 * Open-Meteo Abruf (T-15, GRAFIK §4.3): nur nach Einschalten, Ort als Freitext.
 * Cache bis Mitternacht Ortszeit; bei Fehler stiller Fallback (kein Hinweis).
 * Keine Standort-API des Geräts.
 */
import type { Sonnenzeiten } from './sonne';
import { wetterAusWmo, type WetterBild } from './wetter';

const GEO = 'https://geocoding-api.open-meteo.com/v1/search';
const FORECAST = 'https://api.open-meteo.com/v1/forecast';
const CACHE_KEY = 'bastion.wetter.cache';

export interface WetterOrt {
  readonly name: string;
  readonly lat: number;
  readonly lon: number;
}

export interface WetterStand {
  readonly bild: WetterBild;
  readonly ort: WetterOrt;
  /** Sonnenzeiten am Ort, Minuten seit Mitternacht Ortszeit der Antwort */
  readonly sonne?: Sonnenzeiten;
  /** Lerntag (lokal), bis zu dem der Cache gilt */
  readonly tag: string;
  readonly quelle: 'netz' | 'cache';
}

function lokalerTag(d = new Date()): string {
  const j = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const t = String(d.getDate()).padStart(2, '0');
  return `${j}-${m}-${t}`;
}

function minutenAusIso(iso: string): number | undefined {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return undefined;
  return d.getHours() * 60 + d.getMinutes();
}

function liesCache(): WetterStand | undefined {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return undefined;
    const c = JSON.parse(raw) as WetterStand;
    if (c.tag !== lokalerTag()) return undefined;
    if (!c.bild || !c.ort) return undefined;
    return { ...c, quelle: 'cache' };
  } catch {
    return undefined;
  }
}

function schreibCache(stand: WetterStand): void {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ ...stand, quelle: 'netz' }));
  } catch {
    /* Speichern optional */
  }
}

/** Geocoding: erste Treffer-Stadt oder undefined. */
export async function ortSuchen(freitext: string): Promise<WetterOrt | undefined> {
  const name = freitext.trim();
  if (name.length < 2) return undefined;
  const url = `${GEO}?name=${encodeURIComponent(name)}&count=1&language=de&format=json`;
  const antwort = await fetch(url);
  if (!antwort.ok) return undefined;
  const data = (await antwort.json()) as {
    results?: { name: string; latitude: number; longitude: number }[];
  };
  const treffer = data.results?.[0];
  if (!treffer) return undefined;
  return { name: treffer.name, lat: treffer.latitude, lon: treffer.longitude };
}

/** Forecast inkl. Wettercode und Sonnenzeiten; speichert Cache bis Mitternacht. */
export async function wetterAbrufen(ort: WetterOrt): Promise<WetterStand | undefined> {
  const url =
    `${FORECAST}?latitude=${ort.lat}&longitude=${ort.lon}` +
    `&current=weather_code&daily=sunrise,sunset&timezone=auto&forecast_days=1`;
  const antwort = await fetch(url);
  if (!antwort.ok) return undefined;
  const data = (await antwort.json()) as {
    current?: { weather_code?: number };
    daily?: { sunrise?: string[]; sunset?: string[] };
  };
  const code = data.current?.weather_code;
  if (typeof code !== 'number') return undefined;
  const aufgang = data.daily?.sunrise?.[0] ? minutenAusIso(data.daily.sunrise[0]) : undefined;
  const untergang = data.daily?.sunset?.[0] ? minutenAusIso(data.daily.sunset[0]) : undefined;
  const stand: WetterStand = {
    bild: wetterAusWmo(code),
    ort,
    tag: lokalerTag(),
    quelle: 'netz',
    ...(aufgang !== undefined && untergang !== undefined
      ? { sonne: { aufgangMin: aufgang, untergangMin: untergang } }
      : {}),
  };
  schreibCache(stand);
  return stand;
}

/**
 * Liefert aktuellen Netz-/Cache-Stand oder undefined (dann offline-Datum nutzen).
 * Bei Netzfehler: Cache von heute, sonst undefined – still.
 */
export async function wetterHolen(ort: WetterOrt): Promise<WetterStand | undefined> {
  const cache = liesCache();
  if (cache && cache.ort.lat === ort.lat && cache.ort.lon === ort.lon) return cache;
  try {
    return await wetterAbrufen(ort);
  } catch {
    return cache;
  }
}

export const wetterCacheLeeren = () => {
  try {
    localStorage.removeItem(CACHE_KEY);
  } catch {
    /* ignore */
  }
};
