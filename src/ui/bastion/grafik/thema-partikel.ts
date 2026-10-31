/**
 * Welche Jahreszeit-Partikel zu welchem Thema passen (P3 Feinschliff).
 * Herbstlaub und Schnee-Dach nur über Land – nicht Unterwasser/Weltraum.
 */
import type { Bildart } from './bildart';

/** Dorf, Garten, Bastion (Insel) – Land-Themen. */
export function istLandBildart(art: Bildart): boolean {
  return art === 'insel' || art === 'dorf' || art === 'garten';
}
