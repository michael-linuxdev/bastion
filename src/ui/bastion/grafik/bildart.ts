/**
 * Themen → Bildart ohne PixiJS (GRAFIK §6) – damit die Wahl nicht die
 * Pixi-Bühne in die App-Hülle zieht (ARCHITEKTUR §9).
 */
import type { Thema } from '../../../core/policy/einstellung';

export type Bildart = 'insel' | 'dorf' | 'garten' | 'unterwasser' | 'weltraum';

export function bildartVonThema(thema: Thema): Bildart {
  if (thema === 'dorf') return 'dorf';
  if (thema === 'garten') return 'garten';
  if (thema === 'unterwasser') return 'unterwasser';
  if (thema === 'weltraum') return 'weltraum';
  return 'insel';
}

/** Umkehrung für den Atlas: Bildart → Thema der Atlas-IDs (`insel` heißt dort `bastion`). */
export function atlasThema(art: Bildart): Thema {
  return art === 'insel' ? 'bastion' : art;
}
