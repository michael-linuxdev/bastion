/**
 * Sonnenstand für die Bastion-Szene (GRAFIK §4.3).
 * Ohne Ort: grobe Mitteleuropa-Näherung (ca. 51° N). Mit Ort später Open-Meteo (G3).
 */
import type { Modus } from '../../../core/policy/einstellung';

export interface Sonnenzeiten {
  /** Minuten seit Mitternacht Ortszeit */
  readonly aufgangMin: number;
  readonly untergangMin: number;
}

/** Tag im Jahr 1…366 (Schaltjahr berücksichtigt). */
export function tagImJahr(d: Date): number {
  const start = Date.UTC(d.getFullYear(), 0, 0);
  const heute = Date.UTC(d.getFullYear(), d.getMonth(), d.getDate());
  return Math.round((heute - start) / 86_400_000);
}

/**
 * Auf- und Untergang ohne Netz, Mitteleuropa.
 * Sinus um den Sommersonnenwend-Tag (~172): länger hell im Sommer, früher dunkel im Winter.
 */
export function sonnenzeitenMitteleuropa(d: Date): Sonnenzeiten {
  const doy = tagImJahr(d);
  // 0 an der Sommersonnenwende → maximal lange Tage
  const phase = ((doy - 172) / 365) * Math.PI * 2;
  // Stunden vom Mittag bis Untergang: Sommer ≈ 8,3 · Winter ≈ 4,0
  const halb = 6.15 + 2.15 * Math.cos(phase);
  const mittag = 12.1;
  return {
    aufgangMin: Math.round((mittag - halb) * 60),
    untergangMin: Math.round((mittag + halb) * 60),
  };
}

export function minutenSeitMitternacht(d: Date): number {
  return d.getHours() * 60 + d.getMinutes();
}

/** Nacht, wenn vor Aufgang oder nach Untergang. */
export function istNacht(d: Date, zeiten: Sonnenzeiten): boolean {
  const m = minutenSeitMitternacht(d);
  return m < zeiten.aufgangMin || m >= zeiten.untergangMin;
}

/**
 * Abendoptik der **Szene** (nicht der UI-Tokens):
 * Hell → Tag · Dunkel → Abend · System → Sonnenstand (ohne Ort: Mitteleuropa).
 * Später: bei gesetztem Ort die Open-Meteo-Zeiten übergeben.
 */
export function szeneAbend(
  modus: Modus,
  jetzt: Date = new Date(),
  zeiten: Sonnenzeiten = sonnenzeitenMitteleuropa(jetzt),
): boolean {
  if (modus === 'hell') return false;
  if (modus === 'dunkel') return true;
  return istNacht(jetzt, zeiten);
}
