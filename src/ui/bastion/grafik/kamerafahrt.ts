/**
 * Kamerafahrt beim Epochenwechsel (Wunsch PV, 03.11.2026, Punkt 5): einmal je neuer Epoche,
 * etwa vier Sekunden, ein Tipper bricht ab, bei „Bewegung reduzieren“ keine Fahrt.
 * Die Fahrt beginnt nah am Bergfried und zieht auf das ganze, gewachsene Bild auf.
 * Rein: Start, Ziel und Anteil der Zeit hinein, Kamera heraus.
 */
import type { Kamera } from './kamera';

export const FAHRT_DAUER_MS = 4000;

/** Sanft anfahren und sanft anhalten */
export function weich(t: number): number {
  const x = Math.min(1, Math.max(0, t));
  return x < 0.5 ? 4 * x * x * x : 1 - (-2 * x + 2) ** 3 / 2;
}

/**
 * Kamera zum Zeitanteil `t` (0 … 1). Der Zoom ändert sich gleichmäßig im Verhältnis
 * (wirkt gleich schnell beim Auf- wie beim Zuziehen); der Bildpunkt in der Fenstermitte
 * wandert gerade vom Start- zum Zielpunkt.
 */
export function fahrtKamera(
  start: Kamera,
  ziel: Kamera,
  t: number,
  fenster: { readonly breite: number; readonly hoehe: number },
): Kamera {
  const a = weich(t);
  const zoom = start.zoom * (ziel.zoom / start.zoom) ** a;
  // Welcher Bühnenpunkt liegt in der Fenstermitte?
  const mitte = (k: Kamera) => ({
    x: (fenster.breite / 2 - k.x) / k.zoom,
    y: (fenster.hoehe / 2 - k.y) / k.zoom,
  });
  const m0 = mitte(start);
  const m1 = mitte(ziel);
  const mx = m0.x + (m1.x - m0.x) * a;
  const my = m0.y + (m1.y - m0.y) * a;
  return { x: fenster.breite / 2 - mx * zoom, y: fenster.hoehe / 2 - my * zoom, zoom };
}

/**
 * Soll eine Fahrt laufen? `gesehen` ist die höchste Epoche, deren Fahrt schon lief
 * (0 = noch nie gemerkt: dann nur merken, keine Fahrt für Altes).
 */
export function fahrtFaellig(epoche: number, gesehen: number, bewegungAus: boolean): boolean {
  return gesehen > 0 && epoche > gesehen && !bewegungAus;
}
