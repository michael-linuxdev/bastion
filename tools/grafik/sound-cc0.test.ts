import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

describe('Bastion CC0-Sounddateien (T-18, GRAFIK §4.6)', () => {
  it('Manifest, Ogg-Dateien und Kenney-Lizenz liegen unter public/sound/', () => {
    const ordner = resolve('public/sound');
    const manifest = JSON.parse(readFileSync(resolve(ordner, 'manifest.json'), 'utf8')) as {
      format: number;
      quellen: Record<string, { lizenz: string }>;
      dateien: Record<string, { datei: string; quelle: string } | undefined>;
    };
    expect(manifest.format).toBe(1);
    expect(manifest.quellen['kenney-interface']?.lizenz).toBe('CC0-1.0');
    expect(manifest.quellen['bastion']?.lizenz).toBe('CC0-1.0');
    for (const schluessel of ['bauen', 'wesen', 'aufstellen', 'ambient'] as const) {
      const eintrag = manifest.dateien[schluessel];
      expect(eintrag, schluessel).toBeDefined();
      if (!eintrag) continue;
      const roh = readFileSync(resolve(ordner, eintrag.datei));
      expect(roh.byteLength, eintrag.datei).toBeGreaterThan(100);
      expect(roh.subarray(0, 4).toString('ascii')).toBe('OggS');
    }
    const lizenz = readFileSync(resolve(ordner, 'KENNEY-LICENSE.txt'), 'utf8');
    expect(lizenz).toMatch(/Creative Commons Zero|CC0/i);
  });
});
