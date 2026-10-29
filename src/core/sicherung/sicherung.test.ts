import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import {
  dateiname,
  ERINNERUNG_TAGE,
  erinnerungTage,
  fehlende,
  FORMAT,
  inhaltPruefen,
  IV_LAENGE,
  KOPF_LAENGE,
  kopfLesen,
  kopfSchreiben,
  SALZ_LAENGE,
  sicherungFaellig,
} from './sicherung';

const TAG = 24 * 60 * 60 * 1000;

describe('Kopf der Sicherungsdatei', () => {
  it('schreiben und lesen ergibt dasselbe', () => {
    fc.assert(
      fc.property(
        fc.uint8Array({ minLength: SALZ_LAENGE, maxLength: SALZ_LAENGE }),
        fc.uint8Array({ minLength: IV_LAENGE, maxLength: IV_LAENGE }),
        (salz, iv) => {
          const kopf = kopfSchreiben({ format: FORMAT, erstellt: '2026-10-28', salz, iv });
          expect(kopf).toHaveLength(KOPF_LAENGE);
          const datei = new Uint8Array([...kopf, 1, 2, 3]);
          expect(kopfLesen(datei)).toEqual({ format: FORMAT, erstellt: '2026-10-28', salz, iv });
        },
      ),
    );
  });
  it('erkennt fremde, leere und neuere Dateien', () => {
    expect(
      kopfLesen(
        Uint8Array.from('Hallo Welt, das ist keine Sicherung!!!!!!!!!!!!!', (c) => c.charCodeAt(0)),
      ),
    ).toBe('keine-sicherung');
    expect(kopfLesen(new Uint8Array())).toBe('keine-sicherung');
    const kopf = kopfSchreiben({
      format: FORMAT,
      erstellt: '2026-10-28',
      salz: new Uint8Array(SALZ_LAENGE),
      iv: new Uint8Array(IV_LAENGE),
    });
    kopf[7] = FORMAT + 1;
    expect(kopfLesen(new Uint8Array([...kopf, 0]))).toBe('zu-neu');
  });
});

describe('Inhalt prüfen', () => {
  const profil = { id: 'P', erstellt: 1 };
  const ereignis = {
    id: 'E',
    art: 'aufgabe',
    v: 1,
    profil: 'P',
    ts: 5,
    tag: '2026-10-28',
    geraet: 'G',
  };
  it('nimmt einen gültigen Inhalt an', () => {
    const inhalt = { format: 1, profile: [profil], ereignisse: [ereignis] };
    expect(inhaltPruefen(inhalt)).toBe(inhalt);
  });
  it('lehnt Beschädigtes ab', () => {
    for (const kaputt of [
      null,
      'text',
      { format: 1 },
      { format: 1, profile: [{ id: 3 }], ereignisse: [] },
      { format: 1, profile: [profil], ereignisse: [{ ...ereignis, profil: 'X' }] },
      { format: 1, profile: [profil], ereignisse: [{ ...ereignis, ts: 'gestern' }] },
    ])
      expect(inhaltPruefen(kaputt)).toBe('beschaedigt');
  });
  it('versteht Vermittlungs-Ereignisse (U3a)', () => {
    const v = { ...ereignis, art: 'vermittlung', v: 1 };
    expect(inhaltPruefen({ format: 1, profile: [profil], ereignisse: [v] })).not.toBe('zu-neu');
    expect(inhaltPruefen({ format: 1, profile: [profil], ereignisse: [{ ...v, v: 2 }] })).toBe(
      'zu-neu',
    );
  });
  it('erkennt Sicherungen aus einer neueren App', () => {
    expect(inhaltPruefen({ format: FORMAT + 1, profile: [], ereignisse: [] })).toBe('zu-neu');
    for (const neu of [
      { ...ereignis, v: 99 },
      { ...ereignis, art: 'verdichtung' },
    ])
      expect(inhaltPruefen({ format: 1, profile: [profil], ereignisse: [neu] })).toBe('zu-neu');
  });
});

describe('Zusammenführen (D-10)', () => {
  it('nimmt nur, was fehlt – nichts geht verloren, nichts zählt doppelt', () => {
    fc.assert(
      fc.property(
        fc.array(fc.integer({ min: 0, max: 30 })),
        fc.array(fc.integer({ min: 0, max: 30 })),
        (a, b) => {
          const vorhanden = new Set(a.map(String));
          const neu = fehlende(
            vorhanden,
            b.map((n) => ({ id: String(n) })),
          );
          const ids = neu.map((e) => e.id);
          expect(new Set(ids).size).toBe(ids.length);
          expect(new Set([...vorhanden, ...ids])).toEqual(new Set([...a, ...b].map(String)));
          for (const id of ids) expect(vorhanden.has(id)).toBe(false);
        },
      ),
    );
  });
});

describe('Sicherungs-Erinnerung', () => {
  it('erst, wenn es etwas zu sichern gibt', () => {
    expect(sicherungFaellig(undefined, undefined, 100 * TAG)).toBe(false);
  });
  it('monatlich nach der letzten Sicherung, sonst nach der ersten Aufgabe', () => {
    expect(sicherungFaellig(undefined, 0, (ERINNERUNG_TAGE - 1) * TAG)).toBe(false);
    expect(sicherungFaellig(undefined, 0, ERINNERUNG_TAGE * TAG)).toBe(true);
    expect(sicherungFaellig(10 * TAG, 0, (ERINNERUNG_TAGE + 5) * TAG)).toBe(false);
    expect(sicherungFaellig(10 * TAG, 0, (ERINNERUNG_TAGE + 10) * TAG)).toBe(true);
  });
  it('Abstand wählbar, abschaltbar (D-O4)', () => {
    expect(sicherungFaellig(undefined, 0, 14 * TAG, 14)).toBe(true);
    expect(sicherungFaellig(undefined, 0, 89 * TAG, 90)).toBe(false);
    expect(sicherungFaellig(undefined, 0, 1000 * TAG, 0)).toBe(false);
    expect(erinnerungTage(undefined)).toBe(ERINNERUNG_TAGE);
    expect(erinnerungTage(0)).toBe(0);
    expect(erinnerungTage(90)).toBe(90);
    expect(erinnerungTage(7)).toBe(ERINNERUNG_TAGE);
  });
  it('Dateiname mit Tag', () => {
    expect(dateiname('2026-10-28')).toBe('bastion-sicherung-2026-10-28.bastion');
  });
});
