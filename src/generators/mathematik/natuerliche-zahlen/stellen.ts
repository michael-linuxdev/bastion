import type { Sprachobjekt } from '../../../core/learning/generator';

/** Stellennamen von rechts: Index 0 = Einer (Lehrplan Kl. 5: Stellenwerttafel). */
export const STELLEN: readonly Sprachobjekt[] = [
  { de: 'Einerstelle' },
  { de: 'Zehnerstelle' },
  { de: 'Hunderterstelle' },
  { de: 'Tausenderstelle' },
  { de: 'Zehntausenderstelle' },
  { de: 'Hunderttausenderstelle' },
  { de: 'Millionenstelle' },
  { de: 'Zehnmillionenstelle' },
  { de: 'Hundertmillionenstelle' },
  { de: 'Milliardenstelle' },
  { de: 'Zehnmilliardenstelle' },
  { de: 'Hundertmilliardenstelle' },
];

/** Kurzzeichen der Stellenwerttafel, Index 0 = Einer. */
export const STELLEN_KURZ: readonly string[] = [
  'E',
  'Z',
  'H',
  'T',
  'ZT',
  'HT',
  'Mio',
  'ZMio',
  'HMio',
  'Mrd',
  'ZMrd',
  'HMrd',
];

/** Ziffer an Stelle `stelle` (0 = Einer) einer natürlichen Zahl. */
export function zifferAn(zahl: number, stelle: number): number {
  return Math.floor(zahl / 10 ** stelle) % 10;
}
