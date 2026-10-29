import { describe, expect, it } from 'vitest';
import { quelleAusSeed } from '../rng/zufallsquelle';
import {
  aufgabeEreignis,
  AUFGABE_V,
  bewertung,
  DAUER_MAX_MS,
  type AufgabeAngaben,
} from './ereignis';

const basis: AufgabeAngaben = {
  profil: 'P',
  geraet: 'abcd1234',
  sitzung: 'S',
  modus: 'ueben',
  kompetenz: 'M.ZO.NZ.RUNDEN',
  vorlage: 'M.ZO.NZ.RUNDEN.AUF-STELLE',
  niveau: 'G',
  generator: 'nz.runden-auf-stelle@1',
  seed: 42,
  paket: 'mathematik.zahl-und-operation.52e7b57a36',
  hilfen: 0,
  dauerMs: 12_345,
  faellig: false,
  platzhalter: { zahl: 4372 },
  loesung: { typ: 'zahl', wert: 4400 },
  antwort: { typ: 'zahl', wert: 4400 },
  ergebnis: { richtig: true },
};
// 27.10.2026, 12:00 UTC; Winterzeit in Deutschland: +60 Minuten
const TS = Date.UTC(2026, 9, 27, 12);

describe('Bewertung (DATENMODELL §4.1)', () => {
  it('folgt der Tabelle', () => {
    expect(bewertung(false, 0)).toBe('nochmal');
    expect(bewertung(false, 2)).toBe('nochmal');
    expect(bewertung(true, 1)).toBe('schwer');
    expect(bewertung(true, 0)).toBe('gut');
  });
});

describe('aufgabeEreignis', () => {
  it('richtige Antwort: ohne Schnappschuss und Fehlerbild', () => {
    const e = aufgabeEreignis(basis, TS, 60, quelleAusSeed(1));
    expect(e).toMatchObject({
      art: 'aufgabe',
      v: AUFGABE_V,
      tag: '2026-10-27',
      quelle: { generator: 'nz.runden-auf-stelle', version: 1, seed: 42 },
      ergebnis: 'richtig',
      bewertung: 'gut',
      dauerMs: 12_345,
    });
    expect(e.id).toHaveLength(26);
    expect(e).not.toHaveProperty('schnappschuss');
    expect(e).not.toHaveProperty('fehlerbild');
  });

  it('Zwischenschritte stehen nur bei falschem Ergebnis im Ereignis (D-17)', () => {
    const schritte = [
      {
        id: 'nenner',
        versuche: 2,
        richtig: true,
        fehler: [{ fehlerbild: 'x', fv: 'FV.BR.X', eingabe: { typ: 'zahl', wert: 5 } as const }],
      },
    ];
    const falsch = aufgabeEreignis(
      { ...basis, ergebnis: { richtig: false }, schritte },
      TS,
      60,
      quelleAusSeed(1),
    );
    expect(falsch.schritte).toEqual(schritte);
    expect(aufgabeEreignis({ ...basis, schritte }, TS, 60, quelleAusSeed(1))).not.toHaveProperty(
      'schritte',
    );
  });

  it('falsche Antwort: mit Schnappschuss und erkanntem Fehlerbild', () => {
    const e = aufgabeEreignis(
      {
        ...basis,
        hilfen: 1,
        antwort: { typ: 'zahl', wert: 4300 },
        ergebnis: { richtig: false, fehlerbild: 'falsche-richtung' },
      },
      TS,
      60,
      quelleAusSeed(1),
    );
    expect(e.ergebnis).toBe('falsch');
    expect(e.bewertung).toBe('nochmal');
    expect(e.fehlerbild).toBe('falsche-richtung');
    expect(e.schnappschuss).toEqual({
      platzhalter: { zahl: 4372 },
      loesung: { typ: 'zahl', wert: 4400 },
      antwort: { typ: 'zahl', wert: 4300 },
    });
  });

  it('kappt die Dauer und rechnet den Lerntag mit 4-Uhr-Grenze', () => {
    const lang = aufgabeEreignis({ ...basis, dauerMs: 3_600_000 }, TS, 60, quelleAusSeed(1));
    expect(lang.dauerMs).toBe(DAUER_MAX_MS);
    // 28.10., 2:30 Ortszeit (1:30 UTC) gehört noch zum 27.
    const nachts = aufgabeEreignis(basis, Date.UTC(2026, 9, 28, 1, 30), 60, quelleAusSeed(1));
    expect(nachts.tag).toBe('2026-10-27');
  });

  it('Diagnose-Aufgaben bekommen keine FSRS-Bewertung', () => {
    expect(
      aufgabeEreignis({ ...basis, modus: 'diagnose' }, TS, 60, quelleAusSeed(1)).bewertung,
    ).toBeNull();
  });
});
