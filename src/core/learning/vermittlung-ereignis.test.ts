import { describe, expect, it } from 'vitest';
import { quelleAusSeed } from '../rng/zufallsquelle';
import { VERMITTLUNG_V, vermittlungEreignis } from './vermittlung-ereignis';

const basis = {
  profil: 'P',
  geraet: 'G1',
  kompetenz: 'M.ZO.BR.BEGRIFF',
  inhalt: 'M.ZO.BR.BEGRIFF@1',
  schritt: 'pruefen-1',
} as const;
const TS = Date.UTC(2026, 9, 29, 15, 30);

describe('Ereignis vermittlung', () => {
  it('Antwort: mit Schemaversion, Lerntag und Fehlvorstellung bei falscher Antwort', () => {
    const e = vermittlungEreignis(
      { ...basis, typ: 'antwort', richtig: false, antwort: '1', fv: 'FV.BR.TEIL-ZU-REST' },
      TS,
      60,
      quelleAusSeed(1),
    );
    expect(e).toMatchObject({
      art: 'vermittlung',
      v: VERMITTLUNG_V,
      ts: TS,
      typ: 'antwort',
      richtig: false,
      antwort: '1',
      fv: 'FV.BR.TEIL-ZU-REST',
    });
    expect(e.id).toHaveLength(26);
    expect(e.tag).toBe('2026-10-29');
  });

  it('richtige Antwort trägt keine Fehlvorstellung', () => {
    const e = vermittlungEreignis(
      { ...basis, typ: 'antwort', richtig: true, antwort: '0', fv: 'FV.BR.TEIL-ZU-REST' },
      TS,
      60,
      quelleAusSeed(1),
    );
    expect(e.fv).toBeUndefined();
  });

  it('Abschluss trägt nur, was nötig ist (Datensparsamkeit)', () => {
    const e = vermittlungEreignis(
      { ...basis, schritt: 'uebergang', typ: 'abgeschlossen' },
      TS,
      60,
      quelleAusSeed(1),
    );
    expect(Object.keys(e).sort()).toEqual(
      [
        'art',
        'geraet',
        'id',
        'inhalt',
        'kompetenz',
        'profil',
        'schritt',
        'tag',
        'ts',
        'typ',
        'v',
      ].sort(),
    );
  });

  it('gleiche Eingaben ergeben dasselbe Ereignis (rein)', () => {
    const a = vermittlungEreignis({ ...basis, typ: 'abgeschlossen' }, TS, 0, quelleAusSeed(7));
    const b = vermittlungEreignis({ ...basis, typ: 'abgeschlossen' }, TS, 0, quelleAusSeed(7));
    expect(a).toEqual(b);
  });
});
