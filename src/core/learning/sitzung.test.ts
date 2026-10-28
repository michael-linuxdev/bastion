import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import type { AufgabeEreignis } from './ereignis';
import {
  aktivMs,
  ernsthaft,
  neueSitzungNoetig,
  offeneSitzungen,
  SITZUNG,
  sitzungEreignis,
} from './sitzung';

const MIN = 60_000;
let n = 0;
function aufgabe(teil: Partial<AufgabeEreignis> = {}): AufgabeEreignis {
  n++;
  return {
    id: `A${String(n).padStart(4, '0')}`,
    art: 'aufgabe',
    v: 1,
    profil: 'P',
    ts: 1_000_000 + n * 30_000,
    tag: '2026-10-28',
    geraet: 'geraet01',
    sitzung: 'S1',
    modus: 'ueben',
    kompetenz: 'K',
    vorlage: 'K.V',
    niveau: 'G',
    quelle: { generator: 'g', version: 1, seed: 1 },
    paket: 'p',
    ergebnis: 'richtig',
    hilfen: 0,
    dauerMs: 20_000,
    faellig: false,
    bewertung: 'gut',
    ...teil,
  };
}
const falsch = (dauerMs: number, typ: 'auswahl' | 'zahl', teil: Partial<AufgabeEreignis> = {}) =>
  aufgabe({
    ergebnis: 'falsch',
    dauerMs,
    bewertung: 'nochmal',
    schnappschuss: {
      platzhalter: {},
      loesung: { typ, wert: 1 },
      antwort: { typ, wert: 2 },
    },
    ...teil,
  });

describe('ernsthaft bearbeitet (BASEBAU §3.1)', () => {
  it('richtig zählt immer, auch sehr schnell', () => {
    expect(ernsthaft(aufgabe({ dauerMs: 500 }))).toBe(true);
  });
  it('falsch und schneller als die Mindestzeit gilt als geraten', () => {
    expect(ernsthaft(falsch(2_000, 'auswahl'))).toBe(false);
    expect(ernsthaft(falsch(3_000, 'auswahl'))).toBe(true);
    expect(ernsthaft(falsch(4_000, 'zahl'))).toBe(false);
    expect(ernsthaft(falsch(5_000, 'zahl'))).toBe(true);
  });
  it('übersprungen zählt nicht', () => {
    expect(ernsthaft(aufgabe({ ergebnis: 'uebersprungen' }))).toBe(false);
  });
  it('„Weiß ich nicht“ in der Diagnose ist ehrlich, nicht geraten', () => {
    const e = falsch(1_000, 'zahl', { modus: 'diagnose', bewertung: null });
    const ehrlich: AufgabeEreignis = {
      ...e,
      schnappschuss: {
        platzhalter: {},
        loesung: { typ: 'zahl', wert: 1 },
        antwort: { typ: 'auswahl', wert: -1 },
      },
    };
    expect(ernsthaft(ehrlich)).toBe(true);
  });
});

describe('aktive Lernzeit', () => {
  it('zählt die erste Bearbeitung und die Abstände, Pausen höchstens bis zur Grenze', () => {
    const a = aufgabe({ ts: 0, dauerMs: 40_000 });
    const b = aufgabe({ ts: 60_000 });
    const c = aufgabe({ ts: 60_000 + 20 * MIN }); // nach 20 Minuten Pause
    expect(aktivMs([c, a, b])).toBe(40_000 + 60_000 + SITZUNG.pauseMs);
  });
});

describe('Sitzungs-Ereignis', () => {
  it('Lerneinheit ab 10 ernsthaften Aufgaben', () => {
    const neun = Array.from({ length: 9 }, () => aufgabe({ sitzung: 'S9' }));
    expect(sitzungEreignis(neun, 'regulaer').lerneinheit).toBe(false);
    const zehn = [...neun, aufgabe({ sitzung: 'S9' })];
    const s = sitzungEreignis(zehn, 'regulaer');
    expect(s).toMatchObject({ id: 'S9', art: 'sitzung', aufgaben: 10, lerneinheit: true });
  });
  it('Lerneinheit auch nach 8 Minuten aktiver Zeit mit wenigen Aufgaben', () => {
    const lang = Array.from({ length: 5 }, (_, i) =>
      aufgabe({ sitzung: 'S8', ts: i * 2 * MIN, dauerMs: 2 * MIN }),
    );
    const s = sitzungEreignis(lang, 'regulaer');
    expect(s.aktivMs).toBe(10 * MIN);
    expect(s.lerneinheit).toBe(true);
  });
  it('geratene Aufgaben zählen nicht zur Lerneinheit', () => {
    const geraten = Array.from({ length: 12 }, () => falsch(1_000, 'auswahl', { sitzung: 'SR' }));
    expect(sitzungEreignis(geraten, 'regulaer')).toMatchObject({ aufgaben: 0, lerneinheit: false });
  });
  it('Zeit und Lerntag kommen aus den Aufgaben, nicht vom Zeitpunkt des Schreibens', () => {
    const a = aufgabe({ sitzung: 'ST', ts: 100_000, dauerMs: 10_000, tag: '2026-10-27' });
    const b = aufgabe({ sitzung: 'ST', ts: 200_000, tag: '2026-10-27' });
    expect(sitzungEreignis([b, a], 'nachgetragen')).toMatchObject({
      beginn: 90_000,
      ende: 200_000,
      ts: 200_000,
      tag: '2026-10-27',
      abschluss: 'nachgetragen',
    });
  });
  it('lehnt leere oder gemischte Sitzungen ab', () => {
    expect(() => sitzungEreignis([], 'regulaer')).toThrow();
    expect(() =>
      sitzungEreignis([aufgabe({ sitzung: 'X' }), aufgabe({ sitzung: 'Y' })], 'regulaer'),
    ).toThrow();
  });
  it('ist unabhängig von der Reihenfolge der Aufgaben', () => {
    const liste = Array.from({ length: 15 }, (_, i) =>
      i % 3 === 0 ? falsch(1_000 + i * 500, 'zahl', { sitzung: 'SP' }) : aufgabe({ sitzung: 'SP' }),
    );
    fc.assert(
      fc.property(fc.shuffledSubarray(liste, { minLength: liste.length }), (gemischt) => {
        expect(sitzungEreignis(gemischt, 'regulaer')).toEqual(sitzungEreignis(liste, 'regulaer'));
      }),
    );
  });
});

describe('offene Sitzungen nachtragen (D-3)', () => {
  const alt1 = [aufgabe({ sitzung: 'O1' }), aufgabe({ sitzung: 'O1' })];
  const alt2 = [aufgabe({ sitzung: 'O2' })];
  const bekannt = [aufgabe({ sitzung: 'O3' })];
  const fremd = [aufgabe({ sitzung: 'O4', geraet: 'anderes1' })];
  const laufend = [aufgabe({ sitzung: 'JETZT' })];
  const alle = [...alt1, ...alt2, ...bekannt, ...fremd, ...laufend];

  it('nur eigene, beendete, noch nicht erfasste Sitzungen', () => {
    const offen = offeneSitzungen(alle, new Set(['O3']), 'geraet01', 'JETZT');
    expect(offen.map((s) => s.id)).toEqual(['O1', 'O2']);
    expect(offen.every((s) => s.abschluss === 'nachgetragen')).toBe(true);
    expect(offen[0]?.aufgaben).toBe(2);
  });
  it('nach dem Nachtragen ist nichts mehr offen', () => {
    const offen = offeneSitzungen(alle, new Set(['O3']), 'geraet01', 'JETZT');
    const danach = new Set(['O3', ...offen.map((s) => s.id)]);
    expect(offeneSitzungen(alle, danach, 'geraet01', 'JETZT')).toEqual([]);
  });
});

describe('neue Sitzung', () => {
  const letzte = { ts: 0, tag: '2026-10-28' };
  it('nach langer Ruhe oder an einem neuen Lerntag', () => {
    expect(neueSitzungNoetig(undefined, 0, '2026-10-28')).toBe(false);
    expect(neueSitzungNoetig(letzte, SITZUNG.neueSitzungNachMs - 1, '2026-10-28')).toBe(false);
    expect(neueSitzungNoetig(letzte, SITZUNG.neueSitzungNachMs, '2026-10-28')).toBe(true);
    expect(neueSitzungNoetig(letzte, 1_000, '2026-10-29')).toBe(true);
  });
});
