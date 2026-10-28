import { describe, expect, it } from 'vitest';
import { leeresKonto, verbuche } from '../ledger/buchung';
import type { Bastion } from './bauen';
import { epochenstand } from './epoche';
import { START } from './katalog';

const bastion = (kern: number): Bastion => ({
  bauwerke: START.map((b) => (b.typ === 'kern' ? { ...b, stufe: kern } : b)),
  vorhaben: [],
  fertig: [],
  vorrat: 0,
});
const konto = (erworben: number, ausgegeben = 0) =>
  [
    { ressource: 'koennen' as const, menge: erworben },
    { ressource: 'koennen' as const, menge: -ausgegeben },
  ].reduce(verbuche, leeresKonto('P'));

describe('Ende der Epoche 1 (§5.4)', () => {
  it('Bergfried 3 und 15 erworbene Baupläne – beides nötig', () => {
    expect(epochenstand(bastion(1), konto(0))).toEqual({
      kern: 1,
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
