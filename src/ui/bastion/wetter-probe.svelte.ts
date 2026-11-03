/**
 * Wetter zum Ausprobieren (Auftrag Grafik Punkt 2): im Zahnrad der Bastion wählbar,
 * gilt nur für die Ansicht und nur bis zum Neuladen. Wird nicht gespeichert und ändert
 * nichts am echten Wetter oder am Lernen.
 */
import type { WetterBild } from './grafik/wetter';

export type WetterProbe = 'auto' | WetterBild | 'regenbogen';

export const WETTER_PROBEN: readonly WetterProbe[] = [
  'auto',
  'klar',
  'bewoelkt',
  'regen',
  'schnee',
  'sturm',
  'nebel',
  'regenbogen',
];

export const wetterProbe = $state<{ wahl: WetterProbe }>({ wahl: 'auto' });

/** Bild und Regenbogen aus Probe und echtem/Datums-Wetter */
export function wetterMitProbe(
  probe: WetterProbe,
  bild: WetterBild,
  regenbogen: boolean,
): { bild: WetterBild; regenbogen: boolean } {
  if (probe === 'auto') return { bild, regenbogen };
  if (probe === 'regenbogen') return { bild: 'bewoelkt', regenbogen: true };
  return { bild: probe, regenbogen: false };
}
