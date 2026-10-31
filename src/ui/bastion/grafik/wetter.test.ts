import { describe, expect, it } from 'vitest';
import { partikelBudget, wetterAusDatum, wetterAusWmo } from './wetter';

describe('wetter', () => {
  it('ordnet WMO-Codes zu', () => {
    expect(wetterAusWmo(0)).toBe('klar');
    expect(wetterAusWmo(3)).toBe('bewoelkt');
    expect(wetterAusWmo(45)).toBe('nebel');
    expect(wetterAusWmo(61)).toBe('regen');
    expect(wetterAusWmo(71)).toBe('schnee');
  });

  it('Offline-Wetter ist deterministisch und jahreszeitlich', () => {
    const a = wetterAusDatum(new Date(2026, 0, 15));
    const b = wetterAusDatum(new Date(2026, 0, 15));
    expect(a).toBe(b);
    expect(['klar', 'bewoelkt', 'nebel', 'regen', 'schnee']).toContain(a);
  });

  it('Partikelbudget ist 0 bei klar', () => {
    expect(partikelBudget('klar', false)).toBe(0);
    expect(partikelBudget('regen', true)).toBeLessThan(partikelBudget('regen', false));
  });
});
