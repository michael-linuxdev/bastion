import { describe, expect, it } from 'vitest';
import {
  partikelBudget,
  regenbogenAusDatum,
  regenbogenAusEcht,
  wetterAusDatum,
  wetterAusWmo,
} from './wetter';

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

  it('Sturm aus Gewitter oder starkem Wind, Schnee bleibt Schnee', () => {
    expect(wetterAusWmo(95)).toBe('sturm');
    expect(wetterAusWmo(61, 60)).toBe('sturm');
    expect(wetterAusWmo(3, 49)).toBe('bewoelkt');
    expect(wetterAusWmo(71, 70)).toBe('schnee');
    expect(partikelBudget('sturm', false)).toBeGreaterThan(0);
  });

  it('Regenbogen nur nach Regen und wenn es aufklart', () => {
    expect(regenbogenAusEcht('klar', 2)).toBe(true);
    expect(regenbogenAusEcht('regen', 2)).toBe(false);
    expect(regenbogenAusEcht('bewoelkt', 0)).toBe(false);
    let tage = 0;
    for (let t = 0; t < 365; t++) {
      const d = new Date(2026, 0, 1 + t, 12);
      if (regenbogenAusDatum(d)) {
        tage++;
        expect(['klar', 'bewoelkt']).toContain(wetterAusDatum(d));
        expect(wetterAusDatum(new Date(2026, 0, t, 12))).toBe('regen');
      }
    }
    expect(tage).toBeGreaterThan(0);
    expect(regenbogenAusDatum(new Date(2026, 5, 3, 9))).toBe(
      regenbogenAusDatum(new Date(2026, 5, 3, 18)),
    );
  });
});
