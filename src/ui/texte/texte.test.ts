import { describe, expect, it } from 'vitest';
import { GEBAEUDE_TYPEN } from '../../core/bastion/katalog';
import de from './de.json';

describe('Textdatei', () => {
  it('jedes Gebäude hat Name und Beschreibung (BASEBAU §5.2)', () => {
    const texte = de as Record<string, string>;
    for (const typ of GEBAEUDE_TYPEN) {
      expect(texte[`gebaeude.${typ}`]).toBeTruthy();
      expect(texte[`gebaeude.${typ}.wozu`]).toBeTruthy();
    }
  });
});
