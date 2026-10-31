/**
 * Jahreszeit aus dem lokalen Datum (GRAFIK §4.3): nur Bild, nie Ressourcen.
 * Meteorologische Einteilung für Mitteleuropa.
 */

export const JAHRESZEITEN = ['fruehling', 'sommer', 'herbst', 'winter'] as const;
export type Jahreszeit = (typeof JAHRESZEITEN)[number];

/** Felder der Szenen-Palette, die die Jahreszeit anfasst. */
export type JahreszeitPalette = {
  readonly boden: string;
  readonly raster: string;
  readonly himmel: string;
  readonly wolke: string;
  readonly licht: string;
  readonly dach: string;
  readonly abend: boolean;
};

/** Monat 0–11 → Jahreszeit. */
export function jahreszeitAusDatum(d: Date): Jahreszeit {
  const m = d.getMonth();
  if (m >= 2 && m <= 4) return 'fruehling';
  if (m >= 5 && m <= 7) return 'sommer';
  if (m >= 8 && m <= 10) return 'herbst';
  return 'winter';
}

/** Farbe aufhellen oder abdunkeln (hex #RRGGBB); menge positiv = heller. */
export function schattieren(hex: string, menge: number): string {
  const n = Number.parseInt(hex.slice(1, 7), 16);
  if (Number.isNaN(n)) return hex;
  const kanal = (wert: number) => Math.max(0, Math.min(255, wert + menge));
  const r = kanal((n >> 16) & 255);
  const g = kanal((n >> 8) & 255);
  const b = kanal(n & 255);
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
}

/**
 * Palette der Szene an die Jahreszeit anpassen.
 * Sommer ≈ unverändert; Winter kühler/heller Boden; Herbst wärmer; Frühling frischer.
 */
export function farbenMitJahreszeit<T extends JahreszeitPalette>(basis: T, jz: Jahreszeit): T {
  switch (jz) {
    case 'fruehling':
      return {
        ...basis,
        boden: schattieren(basis.boden, 12),
        himmel: schattieren(basis.himmel, 8),
        wolke: schattieren(basis.wolke, 6),
      };
    case 'sommer':
      return basis;
    case 'herbst':
      return {
        ...basis,
        boden: schattieren(basis.boden, -18),
        dach: schattieren(basis.dach, -10),
        himmel: schattieren(basis.himmel, -12),
        licht: schattieren(basis.licht, -8),
      };
    case 'winter':
      return {
        ...basis,
        boden: schattieren(basis.boden, 40),
        raster: schattieren(basis.raster, 30),
        himmel: schattieren(basis.himmel, -20),
        wolke: schattieren(basis.wolke, -8),
        licht: basis.abend ? basis.licht : schattieren(basis.licht, -15),
      };
  }
}
