// Läuft bei jedem pnpm test: Fehlerhafte Inhalte machen die CI rot.
import { describe, expect, it } from 'vitest';
import { pruefeInhalte } from './pruefen';

describe('Inhalte in content/', () => {
  const { fehler, kompetenzen } = pruefeInhalte('content');

  it('sind fehlerfrei (Schema, Ordner, Voraussetzungen, keine Kreise)', () => {
    expect(fehler).toEqual([]);
  });

  it('enthalten die 41 Kompetenzen der Klasse 5 (LEHRPLAN §8)', () => {
    expect(kompetenzen.filter((k) => k.klassenstufe_typisch.includes(5))).toHaveLength(41);
  });

  it('haben für Klasse 5 die Niveaus G und M, aber noch kein E (K-11)', () => {
    for (const k of kompetenzen) {
      expect(Object.keys(k.niveaus).sort(), k.id).toEqual(['G', 'M']);
    }
  });
});
