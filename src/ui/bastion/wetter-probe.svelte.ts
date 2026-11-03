/**
 * Wetter zum Ausprobieren (Auftrag Grafik Punkt 2): im Zahnrad der Bastion wählbar,
 * gilt nur für die Ansicht und nur bis zum Neuladen. Wird nicht gespeichert und ändert
 * nichts am echten Wetter oder am Lernen.
 */
import type { Jahreszeit } from './grafik/jahreszeit';
import type { WetterBild, WetterStaerke } from './grafik/wetter';

export type WetterProbe =
  'auto' | WetterBild | 'regenbogen' | 'niesel' | 'starkregen' | 'schnee-leicht' | 'gestoeber';

/** Proben mit Stärke: welches Wetterbild und wie dicht */
const MIT_STAERKE: Partial<Record<WetterProbe, { bild: WetterBild; staerke: WetterStaerke }>> = {
  niesel: { bild: 'regen', staerke: 'leicht' },
  starkregen: { bild: 'regen', staerke: 'stark' },
  'schnee-leicht': { bild: 'schnee', staerke: 'leicht' },
  gestoeber: { bild: 'schnee', staerke: 'stark' },
};

export const WETTER_PROBEN: readonly WetterProbe[] = [
  'auto',
  'klar',
  'bewoelkt',
  'niesel',
  'regen',
  'starkregen',
  'schnee-leicht',
  'schnee',
  'gestoeber',
  'sturm',
  'nebel',
  'regenbogen',
];

export const wetterProbe = $state<{ wahl: WetterProbe }>({ wahl: 'auto' });

export interface WetterJetzt {
  readonly bild: WetterBild;
  readonly staerke: WetterStaerke;
  readonly regenbogen: boolean;
}

/** Bild, Stärke und Regenbogen aus Probe und echtem/Datums-Wetter */
export function wetterMitProbe(probe: WetterProbe, echt: WetterJetzt): WetterJetzt {
  if (probe === 'auto') return echt;
  if (probe === 'regenbogen') return { bild: 'bewoelkt', staerke: 'mittel', regenbogen: true };
  const mit = MIT_STAERKE[probe];
  if (mit) return { ...mit, regenbogen: false };
  return { bild: probe as WetterBild, staerke: 'mittel', regenbogen: false };
}

/** Jahreszeit zum Ausprobieren (Wunsch PV 03.11.2026), wie das Wetter nur für die Ansicht */
export type JahreszeitProbe = 'auto' | Jahreszeit;
export const JAHRESZEIT_PROBEN: readonly JahreszeitProbe[] = [
  'auto',
  'fruehling',
  'sommer',
  'herbst',
  'winter',
];
export const jahreszeitProbe = $state<{ wahl: JahreszeitProbe }>({ wahl: 'auto' });

export function jahreszeitMitProbe(probe: JahreszeitProbe, echt: Jahreszeit): Jahreszeit {
  return probe === 'auto' ? echt : probe;
}
