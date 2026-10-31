/**
 * Wetterbild der Bastion (GRAFIK §4.3, T-15): nur Optik, nie Ressourcen.
 * Offline aus dem Datum; echt von Open-Meteo nach Einschalten (G3).
 */
import { tagImJahr } from './sonne';

export const WETTER_BILDER = ['klar', 'bewoelkt', 'nebel', 'regen', 'schnee'] as const;
export type WetterBild = (typeof WETTER_BILDER)[number];

/** WMO-Wettercode → grobes Bild. */
export function wetterAusWmo(code: number): WetterBild {
  if (code === 0) return 'klar';
  if (code >= 1 && code <= 3) return 'bewoelkt';
  if (code === 45 || code === 48) return 'nebel';
  if ((code >= 71 && code <= 77) || code === 85 || code === 86) return 'schnee';
  if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82) || (code >= 95 && code <= 99))
    return 'regen';
  return 'bewoelkt';
}

/**
 * Offline-Wetter aus dem Datum: deterministisch, jahreszeitlich gewichtet.
 * Winter öfter Schnee/Bedeckt, Sommer öfter klar.
 */
export function wetterAusDatum(d: Date): WetterBild {
  const doy = tagImJahr(d);
  const m = d.getMonth();
  // Feste Mischzahl aus dem Tag, kein Math.random
  const w = ((doy * 2654435761) >>> 0) % 100;
  if (m === 11 || m <= 1) {
    if (w < 35) return 'schnee';
    if (w < 70) return 'bewoelkt';
    if (w < 85) return 'nebel';
    return 'klar';
  }
  if (m >= 5 && m <= 7) {
    if (w < 55) return 'klar';
    if (w < 80) return 'bewoelkt';
    return 'regen';
  }
  if (m >= 8 && m <= 10) {
    if (w < 30) return 'klar';
    if (w < 55) return 'bewoelkt';
    if (w < 85) return 'regen';
    return 'nebel';
  }
  // Frühling
  if (w < 40) return 'klar';
  if (w < 70) return 'bewoelkt';
  if (w < 90) return 'regen';
  return 'nebel';
}

/** Wie viele Partikel höchstens (leicht = weniger). */
export function partikelBudget(bild: WetterBild, leicht: boolean): number {
  if (bild === 'klar' || bild === 'bewoelkt') return 0;
  if (bild === 'nebel') return leicht ? 8 : 16;
  return leicht ? 12 : 28;
}
