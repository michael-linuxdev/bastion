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
  lager: [],
});
const konto = (erworben: number, ausgegeben = 0) =>
  [
    { ressource: 'koennen' as const, menge: erworben },
    { ressource: 'koennen' as const, menge: -ausgegeben },
  ].reduce(verbuche, leeresKonto('P'));

describe('Epochenstand (§5.4–§5.5)', () => {
  it('Epoche 1: Bergfried 3 und 15 Baupläne schalten Epoche 2 frei', () => {
    expect(epochenstand(bastion(1), konto(0))).toMatchObject({
      epoche: 1,
      kern: 1,
      bauplaene: 0,
      geschafft: false,
      fertig: false,
      bauplatz: { breite: 12, tiefe: 12 },
    });
    expect(epochenstand(bastion(3), konto(14)).epoche).toBe(1);
    expect(epochenstand(bastion(2), konto(20)).epoche).toBe(1);
    const e2 = epochenstand(bastion(3), konto(15));
    expect(e2.epoche).toBe(2);
    expect(e2.bauplatz).toEqual({ breite: 16, tiefe: 16 });
    expect(e2.ziel).toEqual({ kern: 5, bauplaene: 40 });
    expect(e2.nameKey).toBe('epoche-2');
  });

  it('erworben zählt, nicht ausgegeben: Bauen bestraft nicht', () => {
    expect(epochenstand(bastion(3), konto(15, 12)).epoche).toBe(2);
  });

  it('Epoche 3 und 4 und Abschluss', () => {
    expect(epochenstand(bastion(5), konto(40)).epoche).toBe(3);
    expect(epochenstand(bastion(7), konto(80)).epoche).toBe(4);
    expect(epochenstand(bastion(7), konto(80)).bauplatz).toEqual({ breite: 24, tiefe: 24 });
    const ende = epochenstand(bastion(9), konto(120));
    expect(ende.epoche).toBe(4);
    expect(ende.fertig).toBe(true);
    expect(ende.geschafft).toBe(true);
  });
});
