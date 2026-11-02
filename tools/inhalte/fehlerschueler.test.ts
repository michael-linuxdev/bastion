// Fehler-Schüler (FOKUS F5) mit kleinen, erfundenen Inhalten: Jede Art von
// Verdacht wird gefunden, stimmige Inhalte ergeben keinen. Der Lauf über alle
// echten Inhalte ist `pnpm fehlerschueler` und gehört nicht in jeden Testlauf.
import { describe, expect, it } from 'vitest';
import type { Generator } from '../../src/core/learning/generator';
import { fehlerschueler, verdachtsliste } from './fehlerschueler';
import type { Pruefbericht } from './pruefen';

const t = (de: string) => ({ de });
const kompetenz = (id: string, voraussetzungen: string[] = []) => ({
  id,
  feld: 'brueche',
  voraussetzungen,
});
const fv = (id: string, kompetenzen: string[], rueckweg: string, voraussetzung?: string) => ({
  id,
  kompetenzen,
  rueckweg: { vermittlung: rueckweg, ...(voraussetzung ? { voraussetzung } : {}) },
});

const generator = {
  id: 'g',
  version: 1,
  erzeuge: () => ({ fehlerbilder: [{ id: 'oft' }] }),
  schritte: [{ id: 's1', fehlerbildIds: ['schrittfehler'] }],
  schritt: () => ({ loesung: { typ: 'zahl', wert: 1 }, fehlerbilder: [{ id: 'schrittfehler' }] }),
} as unknown as Generator<unknown>;

function bericht(a: {
  fehlerbilder: Record<string, string>;
  schrittFv: string;
  bei: Record<string, string>;
  optionFv: string;
}): Pruefbericht {
  return {
    fehler: [],
    kompetenzen: [kompetenz('A'), kompetenz('B', ['A']), kompetenz('C')],
    vorlagen: [
      {
        id: 'B.V',
        kompetenz: 'B',
        niveaus: ['G'],
        generator: 'g@1',
        parameter: { G: {} },
        fehlerbilder: Object.fromEntries(
          Object.entries(a.fehlerbilder).map(([id, f]) => [id, { ...t('x'), fv: f }]),
        ),
        schritte: [
          {
            id: 's1',
            frage: t('?'),
            typ: 'zahl-eingabe',
            fehlerbilder: { schrittfehler: { ...t('x'), fv: a.schrittFv } },
          },
        ],
      },
    ],
    vermittlungen: [
      {
        id: 'B',
        kompetenz: 'B',
        schritte: [
          {
            id: 'pruefen',
            typ: 'pruefen',
            text: t('?'),
            antwort: {
              optionen: [
                { wert: t('1'), richtig: true },
                { wert: t('2'), fv: a.optionFv },
              ],
            },
            weiter: 'uebergang',
            bei: a.bei,
          },
        ],
      },
    ],
    fehlvorstellungen: [
      fv('FV.BR.GUT', ['B'], 'B#erklaeren'),
      fv('FV.BR.GRUNDLAGE', ['A', 'B'], 'A#erklaeren', 'A'),
      fv('FV.BR.FREMD', ['B', 'C'], 'C#erklaeren', 'C'),
      fv('FV.BR.NUR-C', ['C'], 'C#erklaeren'),
    ],
    begriffe: [],
    anleitungen: [],
  } as unknown as Pruefbericht;
}

const generatoren = new Map([['g@1', generator]]);

describe('Fehler-Schüler', () => {
  it('stimmige Inhalte: kein Verdacht', () => {
    const funde = fehlerschueler(
      bericht({
        fehlerbilder: { oft: 'FV.BR.GRUNDLAGE' },
        schrittFv: 'FV.BR.GUT',
        bei: { 'FV.BR.GUT': 'erklaeren' },
        optionFv: 'FV.BR.GUT',
      }),
      generatoren,
      { seeds: 3 },
    );
    expect(funde).toEqual([]);
    expect(verdachtsliste(funde)).toBe('Keine Verdachtsfälle.\n');
  });

  it('findet jede Art und fasst gleiche Ursachen zusammen', () => {
    const funde = fehlerschueler(
      bericht({
        fehlerbilder: { oft: 'FV.BR.FREMD', nie: 'FV.BR.GUT' },
        schrittFv: 'FV.BR.NUR-C',
        bei: { 'FV.BR.GUT': 'beispiel' },
        optionFv: 'FV.BR.NUR-C',
      }),
      generatoren,
      { seeds: 3 },
    );
    const arten = (a: string) => funde.filter((f) => f.art === a).map((f) => f.text);
    expect(arten('A')).toEqual([expect.stringContaining('nie erzeugt')]);
    // FV.BR.FREMD: Rückweg und Grundlage in C; FV.BR.NUR-C im Schritt und in der Vermittlung
    expect(arten('B')).toHaveLength(3);
    expect(funde.find((f) => f.text.startsWith('FV.BR.NUR-C: Rückweg'))?.wo).toHaveLength(2);
    expect(arten('C')).toEqual(['FV.BR.NUR-C nennt B nicht unter kompetenzen']);
    expect(arten('D')).toEqual(['FV.BR.NUR-C gehört zu C']);
    expect(arten('E')).toEqual([]);
    expect(verdachtsliste(funde)).toContain('## brueche');
  });

  it('E: Rückweg im Schritt weicht vom Rückweg der Fehlvorstellung ab', () => {
    const funde = fehlerschueler(
      bericht({
        fehlerbilder: { oft: 'FV.BR.GUT' },
        schrittFv: 'FV.BR.GUT',
        bei: { 'FV.BR.GUT': 'beispiel' },
        optionFv: 'FV.BR.GUT',
      }),
      generatoren,
      { seeds: 3 },
    );
    expect(funde.map((f) => [f.art, f.text])).toEqual([
      [
        'E',
        'FV.BR.GUT in „pruefen“: Schritt führt zu „beispiel“, die Fehlvorstellung zu „erklaeren“',
      ],
    ]);
  });
});
