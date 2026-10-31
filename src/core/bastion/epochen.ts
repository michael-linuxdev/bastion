/**
 * Epochen 1–4 (BASEBAU §5.5, B-28): Ziele, Bauplatzgröße, Katalog-Erweiterungen.
 * Epoche wird aus Kern-Stufe und erworbenen Bauplänen abgeleitet – keine eigenen Daten.
 */
export const EPOCHEN = [1, 2, 3, 4] as const;
export type Epoche = (typeof EPOCHEN)[number];

/** Wechselbedingung: Kern-Stufe und erworbene Baupläne mindestens … */
export const EPOCHE_ZIEL: Readonly<
  Record<Epoche, { readonly kern: number; readonly bauplaene: number; readonly nameKey: string }>
> = {
  1: { kern: 3, bauplaene: 15, nameKey: 'epoche' }, // Außenposten → Burg
  2: { kern: 5, bauplaene: 40, nameKey: 'epoche-2' },
  3: { kern: 7, bauplaene: 80, nameKey: 'epoche-3' },
  4: { kern: 9, bauplaene: 120, nameKey: 'epoche-4' },
};

export const BAUPLATZ_NACH_EPOCHE: Readonly<
  Record<Epoche, { readonly breite: number; readonly tiefe: number }>
> = {
  1: { breite: 12, tiefe: 12 },
  2: { breite: 16, tiefe: 16 },
  3: { breite: 20, tiefe: 20 },
  4: { breite: 24, tiefe: 24 },
};

/**
 * Welche Epoche ist freigeschaltet (Bauplatz + Katalog)?
 * Epoche n ist offen, sobald das Ziel von n−1 erfüllt ist (Epoche 1 immer).
 */
export function epocheFreigeschaltet(kernStufe: number, bauplaeneErworben: number): Epoche {
  if (kernStufe >= EPOCHE_ZIEL[3].kern && bauplaeneErworben >= EPOCHE_ZIEL[3].bauplaene) return 4;
  if (kernStufe >= EPOCHE_ZIEL[2].kern && bauplaeneErworben >= EPOCHE_ZIEL[2].bauplaene) return 3;
  if (kernStufe >= EPOCHE_ZIEL[1].kern && bauplaeneErworben >= EPOCHE_ZIEL[1].bauplaene) return 2;
  return 1;
}

export function bauplatzFuer(epoche: Epoche): { readonly breite: number; readonly tiefe: number } {
  return BAUPLATZ_NACH_EPOCHE[epoche];
}

/** Höchstzahl Türme / Einfassung je Epoche (BASEBAU §5.5). */
export function turmHoechstens(epoche: Epoche): number {
  return ({ 1: 2, 2: 4, 3: 6, 4: 8 } as const)[epoche];
}

export function einfassungHoechstens(epoche: Epoche): number {
  return ({ 1: 40, 2: 60, 3: 80, 4: 100 } as const)[epoche];
}

/** Maximale Kern-Stufe, die in dieser Epoche gebaut werden darf. */
export function kernMaxStufe(epoche: Epoche): number {
  return ({ 1: 3, 2: 5, 3: 7, 4: 9 } as const)[epoche];
}
