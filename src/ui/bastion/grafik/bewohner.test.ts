import { describe, expect, it } from 'vitest';
import {
  bewohnerArten,
  bewohnerFortschritt,
  bewohnerFortschrittKey,
  bewohnerStarten,
  taetigkeitFuer,
  type BewohnerFortschritt,
} from './bewohner';
import type { Bastion } from '../../../core/bastion/bauen';
import { leeresKonto } from '../../../core/ledger/buchung';

function bastionMit(typen: Bastion['bauwerke'], fertig: Bastion['fertig'] = []): Bastion {
  return {
    bauwerke: typen,
    vorhaben: [],
    lager: [],
    fertig,
    vorrat: 0,
  };
}

const leer: BewohnerFortschritt = {
  gebaeude: 1,
  fertig: 0,
  buecher: 0,
  epoche: 1,
  hatWissen: false,
  hatTurm: false,
  hatFlaeche: false,
  hatZeichen: false,
  hatWerkstatt: false,
  hatEingang: false,
  hatDenkmal: false,
  leicht: false,
};

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
    const basis: BewohnerFortschritt = { ...leer, gebaeude: 2, fertig: 1 };
    expect(bewohnerArten(basis)).toEqual(['zwerg']);
    expect(bewohnerArten({ ...basis, hatFlaeche: true })).toEqual(['zwerg', 'gaertner']);
    expect(bewohnerArten({ ...basis, buecher: 1, hatTurm: true })).toEqual([
      'zwerg',
      'bibliothek',
      'torhueter',
    ]);
    expect(bewohnerArten({ ...basis, hatWerkstatt: true, fertig: 3 })).toEqual([
      'zwerg',
      'gaertner',
      'handwerk',
    ]);
    expect(bewohnerArten({ ...basis, hatDenkmal: true, hatFlaeche: true, fertig: 2 })).toEqual([
      'zwerg',
      'gaertner',
      'imker',
    ]);
    expect(
      bewohnerArten({
        ...basis,
        hatFlaeche: true,
        buecher: 1,
        hatTurm: true,
        hatWerkstatt: true,
        hatDenkmal: true,
        fertig: 4,
      }),
    ).toEqual(['zwerg', 'gaertner', 'bibliothek', 'torhueter', 'handwerk', 'imker']);
    expect(
      bewohnerArten({ ...basis, hatFlaeche: true, buecher: 1, hatTurm: true, leicht: true }),
    ).toEqual(['zwerg', 'gaertner']);
  });

  it('Torhüter auch am Eingang, Handwerk an Werkstatt', () => {
    const f = bewohnerFortschritt(
      bastionMit([
        { id: 'k', typ: 'kern', stufe: 1, pos: { x: 4, y: 4 } },
        { id: 'e', typ: 'eingang', stufe: 1, pos: { x: 0, y: 4 } },
        { id: 'w', typ: 'werkstatt', stufe: 1, pos: { x: 6, y: 4 } },
      ]),
      leeresKonto('t'),
      0,
      1,
      false,
    );
    expect(f.hatEingang).toBe(true);
    expect(f.hatWerkstatt).toBe(true);
    expect(bewohnerArten(f)).toEqual(['zwerg', 'torhueter', 'handwerk']);
  });

  it('Tätigkeit wechselt deterministisch und koppelt an Fortschritt', () => {
    expect(taetigkeitFuer('zwerg', 0, 0)).toBe(taetigkeitFuer('zwerg', 0, 0));
    expect(taetigkeitFuer('zwerg', 0, 0)).not.toBe(taetigkeitFuer('zwerg', 8000, 0));
    expect(taetigkeitFuer('bibliothek', 0, 0, { ...leer, buecher: 3, hatWissen: true })).toBe(
      'lesen',
    );
    expect(taetigkeitFuer('handwerk', 0, 0, { ...leer, hatWerkstatt: true })).toBe('flicken');
  });

  it('Startliste folgt den freigeschalteten Arten', () => {
    const f: BewohnerFortschritt = {
      ...leer,
      gebaeude: 4,
      fertig: 2,
      buecher: 1,
      hatWissen: true,
      hatFlaeche: true,
    };
    const liste = bewohnerStarten(f, [
      { id: 'k', typ: 'kern', stufe: 1, pos: { x: 4, y: 4 } },
      { id: 'f', typ: 'flaeche', stufe: 1, pos: { x: 1, y: 1 } },
      { id: 'w', typ: 'wissen', stufe: 1, pos: { x: 8, y: 8 } },
    ]);
    expect(liste.map((b) => b.art)).toEqual(['zwerg', 'gaertner', 'bibliothek', 'imker']);
  });

  it('Fortschritt-Schlüssel ist stabil', () => {
    const f = bewohnerFortschritt(
      bastionMit(
        [{ id: 'k', typ: 'kern', stufe: 1, pos: { x: 4, y: 4 } }],
        [
          {
            vorhaben: 'v1',
            gebaeude: 'g1',
            typ: 'turm',
            stufe: 1,
            ts: 1,
            gemeldet: true,
          },
        ],
      ),
      leeresKonto('t'),
      2,
      2,
      true,
    );
    expect(bewohnerFortschrittKey(f)).toBe(bewohnerFortschrittKey(f));
    // fertig → Zwerg; Bücher → Bücherwurm; Epoche 2 → Torhüter, aber leicht → max. 2
    expect(bewohnerArten(f)).toEqual(['zwerg', 'bibliothek']);
  });
});
