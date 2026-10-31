import { describe, expect, it } from 'vitest';
import {
  bewohnerArten,
  bewohnerFortschritt,
  bewohnerStarten,
  taetigkeitFuer,
  type BewohnerFortschritt,
} from './bewohner';
import type { Bastion } from '../../../core/bastion/bauen';
import { leeresKonto } from '../../../core/ledger/buchung';

function bastionMit(typen: Bastion['bauwerke']): Bastion {
  return {
    bauwerke: typen,
    vorhaben: [],
    lager: [],
    fertig: [],
    vorrat: 0,
  };
}

describe('bewohner', () => {
  it('ohne Fortschritt keine Bewohner', () => {
    const f = bewohnerFortschritt(
      bastionMit([{ id: 'k', typ: 'kern', stufe: 1, pos: { x: 4, y: 4 } }]),
      leeresKonto('t'),
      0,
      1,
      false,
    );
    expect(bewohnerArten(f)).toEqual([]);
  });

  it('schaltet Arten an Fortschritt frei', () => {
    const basis: BewohnerFortschritt = {
      gebaeude: 2,
      fertig: 1,
      buecher: 0,
      epoche: 1,
      hatWissen: false,
      hatTurm: false,
      hatFlaeche: false,
      hatZeichen: false,
      leicht: false,
    };
    expect(bewohnerArten(basis)).toEqual(['zwerg']);
    expect(bewohnerArten({ ...basis, hatFlaeche: true })).toEqual(['zwerg', 'gaertner']);
    expect(bewohnerArten({ ...basis, buecher: 1, hatTurm: true })).toEqual([
      'zwerg',
      'bibliothek',
      'torhueter',
    ]);
    expect(
      bewohnerArten({ ...basis, hatFlaeche: true, buecher: 1, hatTurm: true, leicht: true }),
    ).toEqual(['zwerg', 'gaertner']);
  });

  it('Tätigkeit wechselt deterministisch', () => {
    expect(taetigkeitFuer('zwerg', 0, 0)).toBe(taetigkeitFuer('zwerg', 0, 0));
    expect(taetigkeitFuer('zwerg', 0, 0)).not.toBe(taetigkeitFuer('zwerg', 8000, 0));
  });

  it('Startliste folgt den freigeschalteten Arten', () => {
    const f: BewohnerFortschritt = {
      gebaeude: 3,
      fertig: 2,
      buecher: 1,
      epoche: 1,
      hatWissen: true,
      hatTurm: false,
      hatFlaeche: true,
      hatZeichen: false,
      leicht: false,
    };
    const liste = bewohnerStarten(f, [
      { id: 'k', typ: 'kern', stufe: 1, pos: { x: 4, y: 4 } },
      { id: 'f', typ: 'flaeche', stufe: 1, pos: { x: 1, y: 1 } },
      { id: 'w', typ: 'wissen', stufe: 1, pos: { x: 8, y: 8 } },
    ]);
    expect(liste.map((b) => b.art)).toEqual(['zwerg', 'gaertner', 'bibliothek']);
  });
});
