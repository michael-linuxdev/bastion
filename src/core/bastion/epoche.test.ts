import { describe, expect, it } from 'vitest';
import { leeresKonto, verbuche } from '../ledger/buchung';
import type { Bastion } from './bauen';
import { epochenstand } from './epoche';
import { START } from './katalog';

const bastion = (bergfried: number): Bastion => ({
  bauwerke: START.map((b) => (b.typ === 'bergfried' ? { ...b, stufe: bergfried } : b)),
  vorhaben: [],
  fertig: [],
  vorrat: 0,
});
const konto = (erworben: number, ausgegeben = 0) =>
  [
    { ressource: 'bauplan' as const, menge: erworben },
    { ressource: 'bauplan' as const, menge: -ausgegeben },
  ].reduce(verbuche, leeresKonto('P'));

describe('Ende der Epoche 1 (§5.4)', () => {
  it('Bergfried 3 und 15 erworbene Baupläne – beides nötig', () => {
    expect(epochenstand(bastion(1), konto(0))).toEqual({
      bergfried: 1,
      bauplaene: 0,
      geschafft: false,
    });
    expect(epochenstand(bastion(3), konto(14)).geschafft).toBe(false);
    expect(epochenstand(bastion(2), konto(20)).geschafft).toBe(false);
    expect(epochenstand(bastion(3), konto(15)).geschafft).toBe(true);
  });

  it('erworben zählt, nicht ausgegeben: Bauen bestraft nicht', () => {
    expect(epochenstand(bastion(3), konto(15, 12))).toMatchObject({
      bauplaene: 15,
      geschafft: true,
    });
  });
});
