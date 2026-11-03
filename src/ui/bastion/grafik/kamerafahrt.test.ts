import { describe, expect, it } from 'vitest';
import { fahrtFaellig, fahrtKamera, weich } from './kamerafahrt';

const fenster = { breite: 400, hoehe: 800 };
const start = { x: -300, y: -200, zoom: 2 };
const ziel = { x: 20, y: 100, zoom: 0.5 };

describe('kamerafahrt', () => {
  it('beginnt am Start und endet genau am Ziel', () => {
    const a = fahrtKamera(start, ziel, 0, fenster);
    expect(a.zoom).toBeCloseTo(2);
    expect(a.x).toBeCloseTo(start.x);
    expect(a.y).toBeCloseTo(start.y);
    const b = fahrtKamera(start, ziel, 1, fenster);
    expect(b.zoom).toBeCloseTo(0.5);
    expect(b.x).toBeCloseTo(ziel.x);
    expect(b.y).toBeCloseTo(ziel.y);
  });

  it('zieht gleichmäßig auf: in der Mitte der Fahrt liegt der Zoom dazwischen', () => {
    const m = fahrtKamera(start, ziel, 0.5, fenster);
    expect(m.zoom).toBeCloseTo(1);
  });

  it('fährt weich an und hält weich an', () => {
    expect(weich(0)).toBe(0);
    expect(weich(1)).toBe(1);
    expect(weich(0.1)).toBeLessThan(0.1);
    expect(weich(0.9)).toBeGreaterThan(0.9);
    expect(weich(2)).toBe(1);
  });

  it('läuft nur für eine neue Epoche, nicht beim ersten Mal und nicht ohne Bewegung', () => {
    expect(fahrtFaellig(2, 1, false)).toBe(true);
    expect(fahrtFaellig(2, 2, false)).toBe(false);
    expect(fahrtFaellig(3, 0, false)).toBe(false);
    expect(fahrtFaellig(3, 2, true)).toBe(false);
  });
});
