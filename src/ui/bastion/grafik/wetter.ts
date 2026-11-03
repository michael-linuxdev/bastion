/**
 * Wetterbild der Bastion (GRAFIK §4.3, T-15): nur Optik, nie Ressourcen.
 * Offline aus dem Datum; echt von Open-Meteo nach Einschalten (G3).
 */
import { tagImJahr } from './sonne';

export const WETTER_BILDER = ['klar', 'bewoelkt', 'nebel', 'regen', 'schnee', 'sturm'] as const;
export type WetterBild = (typeof WETTER_BILDER)[number];

/** Ab dieser Windgeschwindigkeit (km/h, 10 m Höhe) zeigt die Bastion Sturm. */
export const STURM_AB_KMH = 50;

/**
 * WMO-Wettercode (und Wind) → grobes Bild. Gewitter (95–99) wird zu Sturm: ruhig,
 * ohne Blitze (R1–R7). Starker Wind macht aus Regen oder Wolken Sturm, Schnee bleibt Schnee.
 */
export function wetterAusWmo(code: number, windKmh?: number): WetterBild {
  const bild = wetterNurCode(code);
  if (windKmh !== undefined && windKmh >= STURM_AB_KMH && bild !== 'schnee') return 'sturm';
  return bild;
}

function wetterNurCode(code: number): WetterBild {
  if (code >= 95 && code <= 99) return 'sturm';
  if (code === 0) return 'klar';
  if (code >= 1 && code <= 3) return 'bewoelkt';
  if (code === 45 || code === 48) return 'nebel';
  if ((code >= 71 && code <= 77) || code === 85 || code === 86) return 'schnee';
  if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) return 'regen';
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
    if (w < 62) return 'bewoelkt';
    if (w < 78) return 'nebel';
    if (w < 88) return 'sturm';
    return 'klar';
  }
  if (m >= 5 && m <= 7) {
    if (w < 55) return 'klar';
    if (w < 80) return 'bewoelkt';
    return 'regen';
  }
  if (m >= 8 && m <= 10) {
    if (w < 30) return 'klar';
    if (w < 52) return 'bewoelkt';
    if (w < 76) return 'regen';
    if (w < 88) return 'sturm';
    return 'nebel';
  }
  // Frühling
  if (w < 40) return 'klar';
  if (w < 70) return 'bewoelkt';
  if (w < 90) return 'regen';
  return 'nebel';
}

/**
 * Regenbogen offline (Auftrag Grafik Punkt 2): nach einem Regentag manchmal, wenn es
 * heute aufklart. Aus dem Datum bestimmt, kein Zufall zur Laufzeit.
 */
export function regenbogenAusDatum(d: Date): boolean {
  const heute = wetterAusDatum(d);
  if (heute !== 'klar' && heute !== 'bewoelkt') return false;
  const gestern = new Date(d.getFullYear(), d.getMonth(), d.getDate() - 1, 12);
  if (wetterAusDatum(gestern) !== 'regen') return false;
  return ((tagImJahr(d) * 2246822519) >>> 0) % 3 !== 0;
}

/**
 * Regenbogen aus echtem Wetter: heute hat es geregnet (Niederschlag des Tages), jetzt
 * ist es klar oder leicht bewölkt, und es stürmt nicht.
 */
export function regenbogenAusEcht(bild: WetterBild, niederschlagMm: number | undefined): boolean {
  return (bild === 'klar' || bild === 'bewoelkt') && (niederschlagMm ?? 0) >= 0.5;
}

/** Wie viele Partikel höchstens (leicht = weniger). Sturm: Windstriche. */
export function partikelBudget(bild: WetterBild, leicht: boolean): number {
  if (bild === 'klar' || bild === 'bewoelkt') return 0;
  if (bild === 'nebel') return leicht ? 8 : 16;
  if (bild === 'sturm') return leicht ? 10 : 22;
  return leicht ? 12 : 28;
}
