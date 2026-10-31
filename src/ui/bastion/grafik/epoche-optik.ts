/**
 * Visueller Stil je Epoche (GRAFIK §8 / G10) – Code-Fallback bis Atlas-Sprites da sind.
 * Mechanik unverändert; nur Farben, Höhe und Einfassungs-Dicke.
 */
import type { Epoche } from '../../../core/bastion/epochen';

export interface EpocheOptik {
  readonly epoche: Epoche;
  /** Zusätzliche Gebäudehöhe in Bildpunkten */
  readonly hoehePlus: number;
  /** Einfassung: Holz → Stein → fest → Zitadelle */
  readonly einfassungDicke: number;
  readonly einfassungAlpha: number;
  /** Wandfarbe etwas kühler / steiniger ab Epoche 2 */
  readonly wandFaktor: number;
  /** Kern-Akzent (Zitadelle) */
  readonly kernAkzent?: string;
  /** Boden etwas edler */
  readonly bodenFaktor: number;
}

const TABELLE: Readonly<Record<Epoche, EpocheOptik>> = {
  1: {
    epoche: 1,
    hoehePlus: 0,
    einfassungDicke: 2,
    einfassungAlpha: 0.95,
    wandFaktor: 1,
    bodenFaktor: 1,
  },
  2: {
    epoche: 2,
    hoehePlus: 4,
    einfassungDicke: 3.5,
    einfassungAlpha: 1,
    wandFaktor: 0.88,
    bodenFaktor: 0.96,
  },
  3: {
    epoche: 3,
    hoehePlus: 8,
    einfassungDicke: 4.5,
    einfassungAlpha: 1,
    wandFaktor: 0.8,
    bodenFaktor: 0.92,
  },
  4: {
    epoche: 4,
    hoehePlus: 12,
    einfassungDicke: 5.5,
    einfassungAlpha: 1,
    wandFaktor: 0.74,
    kernAkzent: '#c9a227',
    bodenFaktor: 0.9,
  },
};

export function epocheOptik(epoche: Epoche = 1): EpocheOptik {
  return TABELLE[epoche];
}

/** RGB-Hex abdunkeln/aufhellen (Faktor 0–1 dunkler). */
export function farbeSkalieren(hex: string, faktor: number): string {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
  if (!m?.[1]) return hex;
  const n = parseInt(m[1], 16);
  const skal = (c: number) => Math.max(0, Math.min(255, Math.round(c * faktor)));
  const r = skal((n >> 16) & 255);
  const g = skal((n >> 8) & 255);
  const b = skal(n & 255);
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
}
