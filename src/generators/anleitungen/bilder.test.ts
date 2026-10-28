import { describe, expect, it } from 'vitest';
import { anleitungsBilder } from './index';

describe('Bilder der Zeichen-Anleitungen', () => {
  it('sind sicher und beschrieben (I-11, A5)', () => {
    expect(anleitungsBilder.size).toBeGreaterThan(0);
    for (const [id, a] of anleitungsBilder) {
      const bilder = a.bilder();
      expect(bilder.length, id).toBeGreaterThan(1);
      for (const b of bilder) {
        expect(b.svg).toMatch(/^<svg [^>]*viewBox="0 0 \d+ \d+"/);
        expect(b.svg).not.toMatch(/<script|href|url\(|on\w+=/i);
        expect(b.svg).not.toMatch(/NaN|undefined/);
        expect(b.beschreibung.de.length).toBeGreaterThan(10);
      }
    }
  });
});
