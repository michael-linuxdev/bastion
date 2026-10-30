import { describe, expect, it } from 'vitest';
import { BUEHNE_B, BUEHNE_H } from './iso';
import {
  ZOOM_EINPASSEN_MAX,
  ZOOM_KNOPF,
  ZOOM_MAX,
  ZOOM_MIN,
  ZOOM_RAD,
  einpassen,
  zentriert,
  zoomAn,
  type Kamera,
} from './kamera';

const welt = (k: Kamera, sx: number, sy: number) => ({
  x: (sx - k.x) / k.zoom,
  y: (sy - k.y) / k.zoom,
});

describe('Kamera wie in Dorfkrieg', () => {
  const start: Kamera = { x: 10, y: 20, zoom: 1 };

  it('der Punkt unter dem Zeiger bleibt beim Zoomen liegen', () => {
    const danach = zoomAn(start, 100, 50, start.zoom * ZOOM_RAD);
    const vorher = welt(start, 100, 50);
    const nachher = welt(danach, 100, 50);
    expect(nachher.x).toBeCloseTo(vorher.x);
    expect(nachher.y).toBeCloseTo(vorher.y);
    expect(danach.zoom).toBeCloseTo(ZOOM_RAD);
  });

  it('Knopfzoom geht zur Mitte, Rad hinaus ist der Kehrwert', () => {
    const mitte = zoomAn(start, 200, 150, start.zoom * ZOOM_KNOPF);
    const vorMitte = welt(start, 200, 150);
    const nachMitte = welt(mitte, 200, 150);
    expect(nachMitte.x).toBeCloseTo(vorMitte.x);
    expect(nachMitte.y).toBeCloseTo(vorMitte.y);
    const hinaus = zoomAn(mitte, 40, 40, mitte.zoom / ZOOM_RAD);
    const vorHinaus = welt(mitte, 40, 40);
    const nachHinaus = welt(hinaus, 40, 40);
    expect(nachHinaus.x).toBeCloseTo(vorHinaus.x);
    expect(nachHinaus.y).toBeCloseTo(vorHinaus.y);
  });

  it('hält die Grenzen ein', () => {
    expect(zoomAn(start, 0, 0, 99).zoom).toBe(ZOOM_MAX);
    expect(zoomAn(start, 0, 0, 0.01).zoom).toBe(ZOOM_MIN);
  });

  it('passt das ganze Bild in die Mitte, nicht näher als erlaubt', () => {
    const klein = einpassen(800, 600);
    expect(klein.zoom).toBeGreaterThanOrEqual(ZOOM_MIN);
    expect(klein.zoom).toBeLessThanOrEqual(ZOOM_EINPASSEN_MAX);
    const links = klein.x;
    const rechts = klein.x + BUEHNE_B * klein.zoom;
    const oben = klein.y;
    const unten = klein.y + BUEHNE_H * klein.zoom;
    expect(links).toBeGreaterThan(0);
    expect(oben).toBeGreaterThan(0);
    expect(rechts).toBeLessThan(800);
    expect(unten).toBeLessThan(600);
    expect(links).toBeCloseTo(800 - rechts);
    expect(oben).toBeCloseTo(600 - unten);

    const gross = einpassen(4000, 3000);
    expect(gross.zoom).toBe(ZOOM_EINPASSEN_MAX);
    expect(zentriert(400, 300, 1.5).zoom).toBe(1.5);
  });
});
