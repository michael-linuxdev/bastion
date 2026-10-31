/**
 * Atlas-Boden für Thema Bastion (Bildart Insel) – GRAFIK-SPRITES P3.
 * Kachelwahl fest aus Position, kein Zufall (wie Dorf/Garten).
 */
import { hash01 } from './dorf';

/**
 * Atlas-Boden-Kachel für Feld (x,y).
 * Spec: `flaeche` / `rand`; Varianten `flaeche_b` / `flaeche_hell`.
 */
export function bastionBodenKachel(
  x: number,
  y: number,
  breite: number,
  tiefe: number,
): 'flaeche' | 'rand' | 'flaeche_b' | 'flaeche_hell' {
  const aussen = x < 0 || y < 0 || x >= breite || y >= tiefe;
  if (aussen) return 'rand';
  if (hash01(x, y) > 0.9) return 'flaeche_hell';
  return (x + y) % 2 === 0 ? 'flaeche' : 'flaeche_b';
}

/** Abend-Abdunkeln der Atlas-Bastion-Fläche (Tint 0xRRGGBB). */
export function bastionBodenTint(abend: boolean): number {
  return abend ? 0x6a7a68 : 0xffffff;
}
