import { parse } from 'yaml';
import { describe, expect, it } from 'vitest';
import { neuerReview, wirksameStufe } from '../../src/core/learning/review';
import { setzeReviewBlock } from './block';
import { aufloesen, inhaltsdateien } from './dateien';

const TEXT = `# Kommentar bleibt
id: FV.BR.TEST
name:
  de: 'Probe'
version: 1
`;

const vermerk = (text: string, stufe: 1 | 2, pruefer: string) => {
  const r = neuerReview(parse(text) as Record<string, unknown>, stufe, pruefer, '2026-10-31');
  if ('fehler' in r) throw new Error(r.fehler);
  return setzeReviewBlock(text, r.review);
};

describe('Review-Block schreiben', () => {
  it('hängt den Block an und lässt den Rest Zeichen für Zeichen stehen', () => {
    const neu = vermerk(TEXT, 1, 'maschine');
    expect(neu.startsWith(TEXT)).toBe(true);
    expect(wirksameStufe(parse(neu) as Record<string, unknown>)).toBe(1);
  });

  it('ersetzt einen vorhandenen Block, statt einen zweiten anzuhängen', () => {
    const zwei = vermerk(vermerk(TEXT, 1, 'maschine'), 2, 'Frau Beispiel');
    expect(zwei.match(/^review:/gm)).toHaveLength(1);
    const d = parse(zwei) as Record<string, unknown>;
    expect(wirksameStufe(d)).toBe(2);
    expect((d['review'] as { pruefer: string }).pruefer).toBe('Frau Beispiel');
  });

  it('ersetzt auch einen Block mitten in der Datei', () => {
    const mitte = vermerk(TEXT, 1, 'maschine').replace(
      /^(review:[\s\S]*)$/m,
      '$1herkunft: ki-entwurf\n',
    );
    const neu = vermerk(mitte, 1, 'maschine');
    expect(neu).toContain('herkunft: ki-entwurf\nreview:');
    expect(neu.match(/^review:/gm)).toHaveLength(1);
  });
});

describe('Kennungen auflösen', () => {
  const alle = inhaltsdateien('content');

  it('findet alle Dateien des Inhaltsordners', () => {
    expect(alle.filter((d) => d.art === 'kompetenz').length).toBeGreaterThan(100);
    expect(alle.filter((d) => d.art === 'fehlvorstellung').length).toBeGreaterThan(100);
  });

  it('eine Kompetenz-ID meint Kompetenz, Erstvermittlung und Vorlagen, nicht die Fehlvorstellungen', () => {
    const { dateien, unbekannt } = aufloesen(alle, ['M.ZO.BR.ADD-SUB']);
    expect(unbekannt).toEqual([]);
    expect(dateien.map((d) => d.art).sort()).toEqual([
      'kompetenz',
      'vermittlung',
      'vorlage',
      'vorlage',
    ]);
  });

  it('eine Fehlvorstellung, eine Vorlage oder ein Pfad meint genau eine Datei', () => {
    const { dateien, unbekannt } = aufloesen(alle, [
      'FV.BR.ADDITIV',
      'M.ZO.BR.ERWEITERN.ZIELNENNER',
      'content/mathematik/zahl-und-operation/brueche-und-dezimalzahlen/M.ZO.BR.BEGRIFF/kompetenz.yaml',
      'GIBT.ES.NICHT',
    ]);
    expect(dateien).toHaveLength(3);
    expect(unbekannt).toEqual(['GIBT.ES.NICHT']);
  });
});
