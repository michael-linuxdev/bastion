import { createHash } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import { ladeKompetenzen, ladeVorlagen } from './laden';
import { bauePakete, PAKETFORMAT, type PaketEintrag } from './pakete';

describe('Inhaltspakete', () => {
  const dateien = bauePakete('content');
  const manifest = JSON.parse(dateien.get('manifest.json') ?? '{}') as {
    format: number;
    pakete: PaketEintrag[];
  };

  it('Manifest nennt jedes Paket mit stimmender Prüfsumme und Größe', () => {
    expect(manifest.format).toBe(PAKETFORMAT);
    for (const p of manifest.pakete) {
      const inhalt = dateien.get(p.datei) ?? '';
      expect(createHash('sha256').update(inhalt).digest('hex'), p.name).toBe(p.pruefsumme);
      expect(Buffer.byteLength(inhalt)).toBe(p.groesse);
    }
    expect(dateien.size).toBe(manifest.pakete.length + 1);
  });

  it('Grundpaket enthält alle Kompetenzen, Bereichspakete alle Vorlagen', () => {
    const lies = (name: string) => {
      const p = manifest.pakete.find((x) => x.name === name);
      return JSON.parse(dateien.get(p?.datei ?? '') ?? '{}') as Record<string, unknown[]>;
    };
    expect(lies('mathematik.grund')['kompetenzen']).toHaveLength(ladeKompetenzen('content').length);
    const bereiche = manifest.pakete.filter((p) => p.bereich);
    // ein Paket je Bereich, keines leer
    expect(new Set(bereiche.map((b) => b.bereich)).size).toBe(bereiche.length);
    for (const b of bereiche) expect(lies(b.name)['vorlagen']?.length, b.name).toBeGreaterThan(0);
    const summe = bereiche.reduce((s, b) => s + (lies(b.name)['vorlagen']?.length ?? 0), 0);
    expect(summe).toBe(ladeVorlagen('content').length);
  });

  it('gleiche Inhalte → gleiche Dateinamen (zwischenspeicherbar)', () => {
    expect([...bauePakete('content').keys()]).toEqual([...dateien.keys()]);
  });
});
