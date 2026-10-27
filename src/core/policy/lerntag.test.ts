import { describe, expect, it } from 'vitest';
import { lerntag } from './lerntag';

const utc = (iso: string) => Date.parse(iso);
const WINTER = 60; // MEZ, UTC+1
const SOMMER = 120; // MESZ, UTC+2

describe('lerntag', () => {
  it('wechselt um 4:00 Uhr Ortszeit', () => {
    // 3:59 MEZ = 2:59 UTC → noch Vortag
    expect(lerntag(utc('2026-11-10T02:59:59.999Z'), WINTER)).toBe('2026-11-09');
    // 4:00 MEZ = 3:00 UTC → neuer Tag
    expect(lerntag(utc('2026-11-10T03:00:00.000Z'), WINTER)).toBe('2026-11-10');
  });

  it('ordnet Lernen nach Mitternacht dem Vortag zu', () => {
    // 0:30 MESZ am 1. Juli = 22:30 UTC am 30. Juni
    expect(lerntag(utc('2026-06-30T22:30:00Z'), SOMMER)).toBe('2026-06-30');
  });

  it('berücksichtigt den UTC-Versatz', () => {
    const ts = utc('2026-10-27T02:30:00Z');
    expect(lerntag(ts, 0)).toBe('2026-10-26'); // 2:30 UTC
    expect(lerntag(ts, WINTER)).toBe('2026-10-26'); // 3:30 MEZ
    expect(lerntag(ts, SOMMER)).toBe('2026-10-27'); // 4:30 MESZ
    expect(lerntag(ts, -300)).toBe('2026-10-26'); // 21:30 in New York am 26.10.
    expect(lerntag(ts, 330)).toBe('2026-10-27'); // 8:00 in Indien
  });

  it('funktioniert über Monats- und Jahresgrenzen', () => {
    expect(lerntag(utc('2027-01-01T01:00:00Z'), WINTER)).toBe('2026-12-31');
    expect(lerntag(utc('2027-01-01T03:00:00Z'), WINTER)).toBe('2027-01-01');
    expect(lerntag(utc('2028-03-01T02:00:00Z'), WINTER)).toBe('2028-02-29'); // Schaltjahr
  });

  it('weist ungültige Eingaben ab', () => {
    expect(() => lerntag(Number.NaN, 0)).toThrow(RangeError);
    expect(() => lerntag(0, 1.5)).toThrow(RangeError);
    expect(() => lerntag(0, 19 * 60)).toThrow(RangeError);
  });
});
