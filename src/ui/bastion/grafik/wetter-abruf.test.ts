import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  liesWetterCache,
  wetterAbrufen,
  wetterCacheLeeren,
  wetterHolen,
  type WetterStand,
} from './wetter-abruf';

const ORT = { name: 'Dresden', lat: 51.05, lon: 13.74 };

const speicher = new Map<string, string>();

function schreibRoh(stand: WetterStand): void {
  speicher.set('bastion.wetter.cache', JSON.stringify(stand));
}

beforeEach(() => {
  speicher.clear();
  vi.stubGlobal('localStorage', {
    getItem: (k: string) => speicher.get(k) ?? null,
    setItem: (k: string, v: string) => {
      speicher.set(k, v);
    },
    removeItem: (k: string) => {
      speicher.delete(k);
    },
  });
});

afterEach(() => {
  wetterCacheLeeren();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('wetter-abruf Cache', () => {
  it('liest Cache auch an einem anderen Kalendertag (kein Mitternacht-Verfall)', () => {
    schreibRoh({
      bild: 'regen',
      ort: ORT,
      tag: '2020-01-01',
      quelle: 'netz',
    });
    const c = liesWetterCache();
    expect(c?.bild).toBe('regen');
    expect(c?.quelle).toBe('cache');
    expect(c?.ort.name).toBe('Dresden');
  });

  it('wetterHolen nutzt alten Cache für denselben Ort ohne Netz', async () => {
    schreibRoh({
      bild: 'schnee',
      ort: ORT,
      tag: '2019-12-24',
      quelle: 'netz',
      sonne: { aufgangMin: 480, untergangMin: 960 },
    });
    const fetchSpy = vi.fn();
    vi.stubGlobal('fetch', fetchSpy);
    const stand = await wetterHolen(ORT);
    expect(stand?.bild).toBe('schnee');
    expect(stand?.quelle).toBe('cache');
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('wetterHolen holt neu, wenn der Ort wechselt', async () => {
    schreibRoh({
      bild: 'klar',
      ort: ORT,
      tag: '2026-01-01',
      quelle: 'netz',
    });
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({
        ok: true,
        json: async () => ({
          current: { weather_code: 61 },
          daily: {
            sunrise: ['2026-10-31T07:00:00'],
            sunset: ['2026-10-31T17:00:00'],
          },
        }),
      })),
    );
    const stand = await wetterHolen({ name: 'Leipzig', lat: 51.34, lon: 12.37 });
    expect(stand?.bild).toBe('regen');
    expect(stand?.ort.name).toBe('Leipzig');
    expect(stand?.quelle).toBe('netz');
    expect(liesWetterCache()?.ort.name).toBe('Leipzig');
  });

  it('wetterAbrufen schreibt dauerhaften Cache', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({
        ok: true,
        json: async () => ({
          current: { weather_code: 3 },
          daily: { sunrise: ['2026-10-31T07:00:00'], sunset: ['2026-10-31T17:00:00'] },
        }),
      })),
    );
    const stand = await wetterAbrufen(ORT);
    expect(stand?.bild).toBe('bewoelkt');
    const c = liesWetterCache();
    expect(c?.bild).toBe('bewoelkt');
    expect(c?.ort.lat).toBe(ORT.lat);
  });

  it('wetterCacheLeeren entfernt den Stand', () => {
    schreibRoh({ bild: 'nebel', ort: ORT, tag: '2026-01-01', quelle: 'netz' });
    wetterCacheLeeren();
    expect(liesWetterCache()).toBeUndefined();
  });
});
