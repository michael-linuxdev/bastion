import { describe, expect, it } from 'vitest';
import {
  aufstellDauerMs,
  aufstellFortschritt,
  bewegungAus,
  KAMERA_RUHE_MS,
  TAKT_HZ,
  taktFuer,
  tickerAn,
  wolkenVersatz,
} from './atmosphaere';

describe('atmosphaere', () => {
  it('ruhig und System-Ruhe schalten Bewegung aus', () => {
    expect(bewegungAus({ ruhig: true, leicht: false, systemRuhe: false })).toBe('aus');
    expect(bewegungAus({ ruhig: false, leicht: false, systemRuhe: true })).toBe('aus');
    expect(bewegungAus({ ruhig: false, leicht: true, systemRuhe: false })).toBe('leicht');
    expect(bewegungAus({ ruhig: false, leicht: false, systemRuhe: false })).toBe('voll');
  });

  it('Ticker nur wenn nicht aus', () => {
    expect(tickerAn('aus')).toBe(false);
    expect(tickerAn('leicht')).toBe(true);
    expect(tickerAn('voll')).toBe(true);
  });

  it('Takt: 30 Hz nur mit Bewegung, ruhender Kamera und etwas zu bewegen (Q-G1)', () => {
    expect(TAKT_HZ).toBe(30);
    expect(taktFuer({ bewegung: 'voll', bewegt: true, kameraBewegt: false })).toBe(TAKT_HZ);
    expect(taktFuer({ bewegung: 'leicht', bewegt: true, kameraBewegt: false })).toBe(TAKT_HZ);
    // „Bewegung reduzieren“: Ticker steht, auch wenn es Wesen gäbe
    expect(taktFuer({ bewegung: 'aus', bewegt: true, kameraBewegt: false })).toBe(0);
    // Zoomen und Schwenken: das Bild steht, der Browser bewegt es
    expect(taktFuer({ bewegung: 'voll', bewegt: true, kameraBewegt: true })).toBe(0);
    // Nichts zu bewegen (keine Wesen, Fahnen, Partikel): kein Takt
    expect(taktFuer({ bewegung: 'voll', bewegt: false, kameraBewegt: false })).toBe(0);
    expect(KAMERA_RUHE_MS).toBeGreaterThan(0);
    expect(KAMERA_RUHE_MS).toBeLessThan(500);
  });

  it('Wolkenversatz ist deterministisch und bei aus 0', () => {
    expect(wolkenVersatz(0, 'aus')).toBe(0);
    expect(wolkenVersatz(15_000, 'voll')).toBeCloseTo(wolkenVersatz(15_000, 'voll'));
    expect(Math.abs(wolkenVersatz(15_000, 'voll'))).toBeGreaterThan(10);
    expect(Math.abs(wolkenVersatz(15_000, 'leicht'))).toBeLessThan(
      Math.abs(wolkenVersatz(15_000, 'voll')),
    );
  });

  it('Aufstell-Dauer und Fortschritt', () => {
    expect(aufstellDauerMs('aus')).toBe(0);
    expect(aufstellDauerMs('voll')).toBe(400);
    expect(aufstellFortschritt(0, 400)).toBe(0);
    expect(aufstellFortschritt(400, 400)).toBe(1);
    expect(aufstellFortschritt(200, 400)).toBeGreaterThan(0.5);
  });
});
