import { describe, expect, it } from 'vitest';
import { hashe, pinGueltig, pruefe } from './pin';

describe('Eltern-PIN', () => {
  it('prüft die richtige PIN, lehnt falsche ab, Salz macht Hashes verschieden', async () => {
    const h = await hashe('4711');
    expect(h).toMatch(/^pbkdf2-sha256\$150000\$/);
    expect(await pruefe('4711', h)).toBe(true);
    expect(await pruefe('4712', h)).toBe(false);
    expect(await hashe('4711')).not.toBe(h);
    expect(await pruefe('4711', 'kaputt')).toBe(false);
  });
  it('PIN: 4 bis 8 Ziffern', () => {
    expect(pinGueltig('123')).toBe(false);
    expect(pinGueltig('1234')).toBe(true);
    expect(pinGueltig('12345678')).toBe(true);
    expect(pinGueltig('12a4')).toBe(false);
  });
});
