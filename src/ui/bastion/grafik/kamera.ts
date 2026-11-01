// Kamera wie in Dorfkrieg: stufenlos zoomen, der Punkt unter dem Zeiger bleibt
// liegen, Ziehen verschiebt, zwei Finger zoomen und verschieben zugleich.
// Grenzen: 0,35 bis 2,4; beim Einpassen höchstens 1,8. Ohne PixiJS, damit der
// Test dieselbe Rechnung prüft wie die Oberfläche.
import { buehneBreite, buehneHoehe } from './iso';

/** Wie weit man herauszoomen kann (Dorfkrieg). */
export const ZOOM_MIN = 0.35;
/** Wie weit man hineinzoomen kann (Dorfkrieg). */
export const ZOOM_MAX = 2.4;
/** Beim Einpassen des ganzen Bildes nicht näher als das (Dorfkrieg). */
export const ZOOM_EINPASSEN_MAX = 1.8;
/** Knopf + und −: Faktor je Tipp, zur Mitte des Fensters. */
export const ZOOM_KNOPF = 1.12;
/** Mausrad: Faktor je Raster, zum Zeiger. Hinaus ist der Kehrwert. */
export const ZOOM_RAD = 1.1;
/** Ab dieser Bewegung in Bildpunkten ist es Ziehen, kein Tipp. */
export const ZIEH_SCHWELLE = 8;

export interface Kamera {
  x: number;
  y: number;
  zoom: number;
}

const klemmen = (wert: number, min: number, max: number) => Math.max(min, Math.min(max, wert));

/**
 * Zoom auf den Fensterpunkt (sx, sy). Der Weltpunkt darunter bleibt dort.
 * `naechstes` wird auf die Grenzen geklemmt.
 */
export function zoomAn(k: Kamera, sx: number, sy: number, naechstes: number): Kamera {
  const zoom = klemmen(naechstes, ZOOM_MIN, ZOOM_MAX);
  const wx = (sx - k.x) / k.zoom;
  const wy = (sy - k.y) / k.zoom;
  return { zoom, x: sx - wx * zoom, y: sy - wy * zoom };
}

/** Das ganze Bild in der Mitte, ohne Karten-Rand (Vollbild-Bühne). */
export function einpassen(breite: number, hoehe: number): Kamera {
  const bb = buehneBreite();
  const bh = buehneHoehe();
  const zoom = klemmen(Math.min(breite / bb, hoehe / bh), ZOOM_MIN, ZOOM_EINPASSEN_MAX);
  return {
    zoom,
    x: (breite - bb * zoom) / 2,
    y: (hoehe - bh * zoom) / 2,
  };
}

/** Gewählter Zoom, Bild in der Mitte des Fensters. */
export function zentriert(breite: number, hoehe: number, zoom: number): Kamera {
  const z = klemmen(zoom, ZOOM_MIN, ZOOM_MAX);
  const bb = buehneBreite();
  const bh = buehneHoehe();
  return { zoom: z, x: (breite - bb * z) / 2, y: (hoehe - bh * z) / 2 };
}

/** Speichern: „zoom,x,y“ (Einstellung `basebau.kamera`). */
export function kameraText(k: Kamera): string {
  const z = klemmen(k.zoom, ZOOM_MIN, ZOOM_MAX);
  return `${z},${k.x},${k.y}`;
}

/**
 * Lesen aus Einstellungswert. Zahl = alter Zoom-only-Wert.
 * Unbrauchbares → undefined (dann einpassen/zentrieren).
 */
export function kameraAus(wert: unknown): Kamera | undefined {
  if (typeof wert === 'number' && wert >= ZOOM_MIN && wert <= ZOOM_MAX) {
    return { zoom: wert, x: 0, y: 0 };
  }
  if (typeof wert !== 'string' || wert === '') return undefined;
  const [zs, xs, ys] = wert.split(',');
  const zoom = Number(zs);
  const x = Number(xs);
  const y = Number(ys);
  if (![zoom, x, y].every(Number.isFinite)) return undefined;
  if (zoom < ZOOM_MIN || zoom > ZOOM_MAX) return undefined;
  return { zoom, x, y };
}

/** Gemerkte Kamera wiederherstellen; Zoom immer, x/y nur wenn gesetzt (nicht 0/0-Platzhalter vom alten Zoom). */
export function kameraWiederherstellen(breite: number, hoehe: number, gemerkt: Kamera): Kamera {
  const z = klemmen(gemerkt.zoom, ZOOM_MIN, ZOOM_MAX);
  if (gemerkt.x === 0 && gemerkt.y === 0) return zentriert(breite, hoehe, z);
  return { zoom: z, x: gemerkt.x, y: gemerkt.y };
}
