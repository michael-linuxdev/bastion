import { describe, expect, it } from 'vitest';
import {
  aufstellDauerMs,
  aufstellFortschritt,
  bewegungAus,
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
