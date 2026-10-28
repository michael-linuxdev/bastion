import { describe, expect, it } from 'vitest';
import { alterAm, geburtsdatumAus, schuljahrFragen, schuljahrVon, selbstverwaltet } from './alter';

describe('Alter und Selbstverwaltung (L-15)', () => {
  it('rechnet volle Jahre, auch rund um den Geburtstag', () => {
    expect(alterAm('2010-10-29', '2026-10-28')).toBe(15);
    expect(alterAm('2010-10-28', '2026-10-28')).toBe(16);
    expect(alterAm('2008-02-29', '2026-02-28')).toBe(17);
    expect(alterAm('2008-02-29', '2026-03-01')).toBe(18);
  });

  it('nimmt nur gültige Daten bis heute an', () => {
    expect(geburtsdatumAus('2012-05-17', '2026-10-28')).toBe('2012-05-17');
    expect(geburtsdatumAus('2027-01-01', '2026-10-28')).toBeUndefined();
    expect(geburtsdatumAus('2012-02-30', '2026-10-28')).toBeUndefined();
    expect(geburtsdatumAus('1800-01-01', '2026-10-28')).toBeUndefined();
    expect(geburtsdatumAus(42, '2026-10-28')).toBeUndefined();
  });

  it('selbstverwaltet ab 18 oder mit „Ich bin erwachsen“', () => {
    expect(selbstverwaltet({ geburtsdatum: undefined, erwachsen: false }, '2026-10-28')).toBe(
      false,
    );
    expect(selbstverwaltet({ geburtsdatum: '2008-10-29', erwachsen: false }, '2026-10-28')).toBe(
      false,
    );
    expect(selbstverwaltet({ geburtsdatum: '2008-10-28', erwachsen: false }, '2026-10-28')).toBe(
      true,
    );
    expect(selbstverwaltet({ geburtsdatum: undefined, erwachsen: true }, '2026-10-28')).toBe(true);
  });
});

describe('Schuljahreswechsel (L-17)', () => {
  it('Schuljahr beginnt am 1. August', () => {
    expect(schuljahrVon('2026-07-31')).toBe(2025);
    expect(schuljahrVon('2026-08-01')).toBe(2026);
    expect(schuljahrVon('2027-01-15')).toBe(2026);
  });
  it('fragt einmal je neuem Schuljahr, nie beim ersten Mal und nicht Erwachsene', () => {
    expect(schuljahrFragen(undefined, '2026-08-02', false)).toBe(false);
    expect(schuljahrFragen(2025, '2026-08-02', false)).toBe(true);
    expect(schuljahrFragen(2026, '2026-12-02', false)).toBe(false);
    expect(schuljahrFragen(2025, '2026-08-02', true)).toBe(false);
  });
});
