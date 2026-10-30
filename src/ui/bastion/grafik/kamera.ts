// Kamera wie in Dorfkrieg: stufenlos zoomen, der Punkt unter dem Zeiger bleibt
// liegen, Ziehen verschiebt, zwei Finger zoomen und verschieben zugleich.
// Grenzen: 0,35 bis 2,4; beim Einpassen höchstens 1,8. Ohne PixiJS, damit der
// Test dieselbe Rechnung prüft wie die Oberfläche.
import { BUEHNE_B, BUEHNE_H } from './iso';

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

/** Das ganze Bild in der Mitte, mit etwas Rand. */
export function einpassen(breite: number, hoehe: number): Kamera {
  const rand = 28;
  const zoom = klemmen(
    Math.min(breite / (BUEHNE_B + rand * 2), hoehe / (BUEHNE_H + rand * 2)),
    ZOOM_MIN,
    ZOOM_EINPASSEN_MAX,
  );
  return {
    zoom,
    x: (breite - BUEHNE_B * zoom) / 2,
    y: (hoehe - BUEHNE_H * zoom) / 2,
  };
}

/** Gewählter Zoom, Bild in der Mitte des Fensters. */
export function zentriert(breite: number, hoehe: number, zoom: number): Kamera {
  const z = klemmen(zoom, ZOOM_MIN, ZOOM_MAX);
  return { zoom: z, x: (breite - BUEHNE_B * z) / 2, y: (hoehe - BUEHNE_H * z) / 2 };
}
