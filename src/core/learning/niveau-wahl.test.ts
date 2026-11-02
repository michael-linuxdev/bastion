import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import type { Niveau } from '../competence/kompetenz';
import { NIVEAU_WAHL, niveauFuer, type NiveauEreignis } from './niveau-wahl';

let ts = 0;
const aufgabe = (
  niveau: Niveau,
  gut: boolean,
  vorlage = `v${ts % 2}`,
  extra: Partial<NiveauEreignis> = {},
): NiveauEreignis => ({
  kompetenz: 'M.ZO.BR.ERWEITERN',
  niveau,
  ergebnis: gut ? 'richtig' : 'falsch',
  hilfen: 0,
  vorlage,
  ts: ++ts,
  ...extra,
});
const reihe = (niveau: Niveau, guete: readonly boolean[]) => guete.map((g) => aufgabe(niveau, g));
const ALLE: Niveau[] = ['G', 'M', 'E'];

describe('Niveau automatisch wählen (L-22)', () => {
  it('beginnt auf dem niedrigsten verfügbaren Niveau', () => {
    expect(niveauFuer([], 'M.ZO.BR.ERWEITERN', ALLE)).toBe('G');
    expect(niveauFuer([], 'M.ZO.BR.ERWEITERN', ['E', 'M'])).toBe('M');
    expect(niveauFuer([], 'M.ZO.BR.ERWEITERN', [])).toBe('G');
  });

  it('steigt nach „gekonnt“ auf dem aktuellen Niveau auf: 5 von 6 ohne Hilfe, 2 Vorlagen', () => {
    const vier = reihe('G', [true, true, true, true]);
    expect(niveauFuer(vier, 'M.ZO.BR.ERWEITERN', ALLE)).toBe('G');
    const fuenf = [...vier, aufgabe('G', true)];
    expect(niveauFuer(fuenf, 'M.ZO.BR.ERWEITERN', ALLE)).toBe('M');
  });

  it('braucht zwei verschiedene Vorlagen zum Aufsteigen', () => {
    const eine = Array.from({ length: 6 }, () => aufgabe('G', true, 'nur-eine'));
    expect(niveauFuer(eine, 'M.ZO.BR.ERWEITERN', ALLE)).toBe('G');
  });

  it('mit Hilfe gelöst zählt nicht für den Aufstieg', () => {
    const mitHilfe = Array.from({ length: 6 }, () => aufgabe('G', true, undefined, { hilfen: 1 }));
    expect(niveauFuer(mitHilfe, 'M.ZO.BR.ERWEITERN', ALLE)).toBe('G');
  });

  it('steigt nach drei misslungenen Aufgaben nacheinander ab, nicht unter das unterste', () => {
    const hoch = reihe('G', [true, true, true, true, true]);
    const zweiFalsch = [...hoch, ...reihe('M', [false, false])];
    expect(niveauFuer(zweiFalsch, 'M.ZO.BR.ERWEITERN', ALLE)).toBe('M');
    const dreiFalsch = [...zweiFalsch, aufgabe('M', false)];
    expect(niveauFuer(dreiFalsch, 'M.ZO.BR.ERWEITERN', ALLE)).toBe('G');
    const unten = reihe('G', [false, false, false, false]);
    expect(niveauFuer(unten, 'M.ZO.BR.ERWEITERN', ALLE)).toBe('G');
  });

  it('nach dem Abstieg zählt das untere Niveau neu: erst wieder „gekonnt“, dann hoch', () => {
    const vorher = [
      ...reihe('G', [true, true, true, true, true]),
      ...reihe('M', [false, false, false]),
    ];
    const danach = [...vorher, ...reihe('G', [true, true, true, true])];
    expect(niveauFuer(danach, 'M.ZO.BR.ERWEITERN', ALLE)).toBe('G');
    expect(niveauFuer([...danach, aufgabe('G', true)], 'M.ZO.BR.ERWEITERN', ALLE)).toBe('M');
  });

  it('springt über Niveaus ohne Aufgaben und bleibt oben stehen', () => {
    const fuenf = reihe('G', [true, true, true, true, true]);
    expect(niveauFuer(fuenf, 'M.ZO.BR.ERWEITERN', ['G', 'E'])).toBe('E');
    expect(niveauFuer(fuenf, 'M.ZO.BR.ERWEITERN', ['G'])).toBe('G');
  });

  it('Wiederholungen auf anderem Niveau und andere Kompetenzen verschieben nichts', () => {
    const fremd = [
      ...reihe('M', [false, false, false]).map((e) => ({ ...e, kompetenz: 'M.ZO.NZ.ADD-SUB' })),
    ];
    const g = [aufgabe('G', true), aufgabe('E', false), aufgabe('E', false), aufgabe('E', false)];
    expect(niveauFuer([...fremd, ...g], 'M.ZO.BR.ERWEITERN', ALLE)).toBe('G');
  });

  it('übersprungene Aufgaben zählen nicht', () => {
    const ueber = Array.from({ length: 5 }, () =>
      aufgabe('M', false, undefined, { ergebnis: 'uebersprungen' }),
    );
    const g = reihe('G', [true, true, true, true, true]);
    expect(niveauFuer([...g, ...ueber], 'M.ZO.BR.ERWEITERN', ALLE)).toBe('M');
  });

  it('bisherige Lernstände bleiben: die erste Aufgabe legt das Startniveau fest', () => {
    expect(niveauFuer([aufgabe('M', true)], 'M.ZO.BR.ERWEITERN', ALLE)).toBe('M');
  });

  it('Reihenfolge nach Zeit, nicht nach Lage in der Liste', () => {
    const r = [...reihe('G', [true, true, true, true, true])];
    expect(niveauFuer([...r].reverse(), 'M.ZO.BR.ERWEITERN', ALLE)).toBe('M');
  });

  it('liefert immer ein verfügbares Niveau (Eigenschaft)', () => {
    fc.assert(
      fc.property(
        fc.array(fc.record({ n: fc.constantFrom<Niveau>('G', 'M', 'E'), g: fc.boolean() }), {
          maxLength: 60,
        }),
        fc.subarray(ALLE, { minLength: 1 }),
        (folge, verfuegbar) => {
          const ev = folge.map((x) => aufgabe(x.n, x.g));
          expect(verfuegbar).toContain(niveauFuer(ev, 'M.ZO.BR.ERWEITERN', verfuegbar));
        },
      ),
    );
  });

  it('Schwellen wie „gekonnt“', () => {
    expect(NIVEAU_WAHL).toMatchObject({ fenster: 6, richtig: 5, vorlagen: 2, runter: 3 });
  });
});
