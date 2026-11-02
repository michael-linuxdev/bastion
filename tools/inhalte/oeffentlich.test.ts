import { describe, expect, it } from 'vitest';
import { reviewHash, wirksameStufe } from '../../src/core/learning/review';
import {
  genannteFehlvorstellungen,
  mindeststufeAus,
  oeffentlicheAuswahl,
  type Bestand,
} from './oeffentlich';
import { paketeMitStand } from './pakete';

type Daten = Record<string, unknown>;

/** Datei mit gültigem Vermerk der Stufe `stufe` (0 = ohne Vermerk). */
function mit(daten: Daten, stufe: 0 | 1 | 2 | 3): Daten {
  if (stufe === 0) return daten;
  return {
    ...daten,
    review: { stufe, datum: '2026-11-01', pruefer: 'test', hash: reviewHash(daten) },
  };
}

/** Kleiner Bestand: A (Stufe 2), B (Stufe 1, braucht A), C (Vorlage auf Stufe 0). */
function bestand(): Bestand {
  const k = (id: string, s: 0 | 1 | 2 | 3, vor: string[] = []) =>
    mit({ id, voraussetzungen: vor }, s);
  const teil = (kid: string, art: string, s: 0 | 1 | 2 | 3, extra: Daten = {}) => ({
    kompetenz: kid,
    daten: mit({ id: `${kid}.${art}`, kompetenz: kid, ...extra }, s),
  });
  return {
    kompetenzen: [k('A', 2), k('B', 1, ['A']), k('C', 2)],
    vermittlungen: [
      teil('A', 'V', 2, { schritte: [{ bei: { 'FV.X': 'erklaeren', sonst: 'A' } }] }),
      teil('B', 'V', 1),
      teil('C', 'V', 2),
    ],
    vorlagen: [
      teil('A', 'T', 2, { fehlerbilder: { f: { fv: 'FV.X' } } }),
      teil('B', 'T', 1, { fehlerbilder: { f: { fv: 'FV.Y' } } }),
      teil('C', 'T1', 2),
      teil('C', 'T2', 0),
    ],
    anleitungen: [],
    fehlvorstellungen: [mit({ id: 'FV.X' }, 2), mit({ id: 'FV.Y' }, 1), mit({ id: 'FV.Z' }, 0)],
  };
}

describe('Öffentliche Seite: Filter nach Review-Stufe (T-20)', () => {
  it('Mindeststufe 0 (Werkstatt): alles, mit Vermerk „Entwurf“', () => {
    const a = oeffentlicheAuswahl(bestand(), 0);
    expect([...a.kompetenzen]).toEqual(['A', 'B', 'C']);
    expect([...a.fehlvorstellungen]).toEqual(['FV.X', 'FV.Y', 'FV.Z']);
    expect(a.entwurf).toBe(true);
  });

  it('Mindeststufe 1: eine Kompetenz mit einer Vorlage auf Stufe 0 fällt ganz heraus', () => {
    const a = oeffentlicheAuswahl(bestand(), 1);
    expect([...a.kompetenzen]).toEqual(['A', 'B']);
    // nur Fehlvorstellungen, auf die ausgelieferte Inhalte zeigen
    expect([...a.fehlvorstellungen]).toEqual(['FV.X', 'FV.Y']);
    expect(a.entwurf).toBe(true);
  });

  it('Mindeststufe 2: nur Stufe 2, kein Vermerk', () => {
    const a = oeffentlicheAuswahl(bestand(), 2);
    expect([...a.kompetenzen]).toEqual(['A']);
    expect([...a.fehlvorstellungen]).toEqual(['FV.X']);
    expect(a.entwurf).toBe(false);
  });

  it('Eine Fehlvorstellung unter der Mindeststufe zieht die Kompetenz mit heraus', () => {
    const b = bestand();
    const fvs = b.fehlvorstellungen.map((f) => (f['id'] === 'FV.X' ? { id: 'FV.X' } : f));
    const a = oeffentlicheAuswahl({ ...b, fehlvorstellungen: fvs }, 2);
    expect([...a.kompetenzen]).toEqual([]);
  });

  it('Eine geänderte Datei verliert ihre Stufe und zieht die Kompetenz heraus', () => {
    const b = bestand();
    const k = b.kompetenzen.map((x) => (x['id'] === 'A' ? { ...x, titel: 'neu' } : x));
    expect([...oeffentlicheAuswahl({ ...b, kompetenzen: k }, 2).kompetenzen]).toEqual([]);
  });

  it('findet Fehlvorstellungen in fv und in den Schlüsseln von bei, nicht in sonst', () => {
    const ids = genannteFehlvorstellungen({
      a: [{ fv: 'FV.A' }, { bei: { 'FV.B': 'x', sonst: 'M.K' } }],
    });
    expect([...ids].sort()).toEqual(['FV.A', 'FV.B']);
  });

  it('BASTION_MINDESTSTUFE: leer = 0, sonst genau 0 bis 3', () => {
    expect(mindeststufeAus(undefined)).toBe(0);
    expect(mindeststufeAus('')).toBe(0);
    expect(mindeststufeAus(' 2 ')).toBe(2);
    expect(() => mindeststufeAus('4')).toThrow();
    expect(() => mindeststufeAus('zwei')).toThrow();
  });
});

describe('Öffentliche Seite mit den echten Inhalten', () => {
  const lies = (dateien: Map<string, string>, name: string) => {
    const m = JSON.parse(dateien.get('manifest.json') ?? '{}') as {
      pakete: { name: string; datei: string }[];
    };
    const p = m.pakete.find((x) => x.name === name);
    return JSON.parse(dateien.get(p?.datei ?? '') ?? '{}') as Record<string, unknown>;
  };

  it('Stufe 0: alle Kompetenzen, Vermerk „Entwurf“', () => {
    const { stand } = paketeMitStand('content', 0);
    expect(stand.kompetenzen).toBeGreaterThan(100);
    expect(stand.entwurf).toBe(true);
  });

  it('Mindeststufe 1: nur Kompetenzen, deren Dateien alle Stufe 1 haben, ohne Lücke', () => {
    const { dateien, stand } = paketeMitStand('content', 1);
    const grund = lies(dateien, 'mathematik.grund');
    const kompetenzen = grund['kompetenzen'] as Daten[];
    // Stand 02.11.2026: höchstens das Musterfeld Brüche (nach B3 vorerst keine)
    for (const k of kompetenzen)
      expect(['M.ZO.BR.ADD-SUB', 'M.ZO.BR.BEGRIFF', 'M.ZO.BR.ERWEITERN']).toContain(k['id']);
    for (const k of kompetenzen)
      expect(wirksameStufe(k), String(k['id'])).toBeGreaterThanOrEqual(1);
    expect(stand).toMatchObject({ mindeststufe: 1, kompetenzen: kompetenzen.length });
    // Jede Vorlage und jede Fehlvorstellung, auf die sie zeigt, ist mit dabei und hat Stufe 1
    const m = JSON.parse(dateien.get('manifest.json') ?? '{}') as {
      pakete: { name: string; bereich?: string }[];
    };
    const fv = new Map(
      (grund['fehlvorstellungen'] as Daten[]).map((f) => [String(f['id']), f] as const),
    );
    for (const p of m.pakete.filter((x) => x.bereich)) {
      const vorlagen = lies(dateien, p.name)['vorlagen'] as Daten[];
      for (const v of vorlagen) expect(wirksameStufe(v)).toBeGreaterThanOrEqual(1);
      for (const id of genannteFehlvorstellungen(vorlagen)) {
        expect(fv.has(id), id).toBe(true);
        expect(wirksameStufe(fv.get(id) ?? {})).toBeGreaterThanOrEqual(1);
      }
    }
  });

  it('Mindeststufe 2: heute ein leeres, aber gültiges Paket', () => {
    const { dateien, stand } = paketeMitStand('content', 2);
    expect(stand).toEqual({ mindeststufe: 2, entwurf: false, kompetenzen: 0 });
    const grund = lies(dateien, 'mathematik.grund');
    expect(grund['kompetenzen']).toEqual([]);
    expect(grund['fehlvorstellungen']).toEqual([]);
    expect(Array.isArray(grund['begriffe'])).toBe(true);
  });
});
