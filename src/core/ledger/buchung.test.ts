import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import type { AufgabeEreignis } from '../learning/ereignis';
import type { KompetenzStand } from '../learning/fortschritt';
import { sitzungEreignis, type SitzungEreignis } from '../learning/sitzung';
import {
  buchungsId,
  fehlendeBuchungen,
  kontoAus,
  leeresKonto,
  verbuche,
  type BuchungEreignis,
} from './buchung';

let n = 0;
function aufgabe(sitzung: string, teil: Partial<AufgabeEreignis> = {}): AufgabeEreignis {
  n++;
  return {
    id: `A${String(n).padStart(6, '0')}`,
    art: 'aufgabe',
    v: 1,
    profil: 'P',
    ts: 1_000_000 + n * 30_000,
    tag: '2026-10-28',
    geraet: 'geraet01',
    sitzung,
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
const kontext = { profil: 'P', geraet: 'geraet01', jetzt: 9_000_000 };
const gefestigt = (kompetenz: string): KompetenzStand => ({
  profil: 'P',
  kompetenz,
  niveau: 'G',
  status: 'gefestigt',
  gefestigtAm: '2026-11-04',
  aufgaben: 12,
  letzte: [],
});

/** Eine Sitzung aus `groesse` Aufgaben; jede dritte ist eine fällige Wiederholung. */
function sitzung(id: string, groesse: number, tag = '2026-10-28') {
  const aufgaben = Array.from({ length: groesse }, (_, i) =>
    aufgabe(id, { tag, faellig: i % 3 === 0, modus: i % 3 === 0 ? 'wiederholen' : 'ueben' }),
  );
  return { aufgaben, sitzung: sitzungEreignis(aufgaben, 'regulaer') };
}

describe('fehlende Buchungen', () => {
  it('feste IDs aus dem Anlass; ein zweiter Lauf bucht nichts mehr', () => {
    const a = sitzung('S1', 12);
    const erst = fehlendeBuchungen([a.sitzung], a.aufgaben, [gefestigt('K1')], new Set(), kontext);
    expect(erst.map((b) => b.id)).toEqual([
      'P.fleiss.S1',
      'P.behalten.S1',
      'P.schritt.S1',
      'P.koennen.K1@G',
    ]);
    expect(erst.find((b) => b.ressource === 'fleiss')).toMatchObject({
      art: 'buchung',
      v: 1,
      menge: 12,
      ts: a.sitzung.ts,
      tag: '2026-10-28',
      grund: 'sitzung',
    });
    const vorhanden = new Set(erst.map((b) => b.id));
    expect(
      fehlendeBuchungen([a.sitzung], a.aufgaben, [gefestigt('K1')], vorhanden, kontext),
    ).toEqual([]);
    expect(buchungsId('P', { ressource: 'behalten', bezug: 'S1' })).toBe('P.behalten.S1');
  });

  it('gespeicherte Buchungen bleiben, auch wenn neue Sitzungen hinzukommen', () => {
    const a = sitzung('S1', 30);
    const erst = fehlendeBuchungen([a.sitzung], a.aufgaben, [], new Set(), kontext);
    const b = sitzung('S2', 30);
    const dann = fehlendeBuchungen(
      [a.sitzung, b.sitzung],
      [...a.aufgaben, ...b.aufgaben],
      [],
      new Set(erst.map((x) => x.id)),
      kontext,
    );
    expect(dann.every((x) => x.bezug === 'S2')).toBe(true);
    // zweite Sitzung am selben Tag: Aufgaben 31–50 halb, danach nichts (BASEBAU §3.1)
    expect(dann.find((x) => x.ressource === 'fleiss')?.menge).toBe(10);
  });
});

describe('Konto (DATENMODELL §5)', () => {
  it('Stand und Erworbenes je Ressource', () => {
    const k = [
      { ressource: 'fleiss' as const, menge: 20 },
      { ressource: 'fleiss' as const, menge: -5 },
      { ressource: 'koennen' as const, menge: 1 },
    ].reduce(verbuche, leeresKonto('P'));
    expect(k.stand).toEqual({ fleiss: 15, behalten: 0, koennen: 1, schritt: 0 });
    expect(k.erworben).toEqual({ fleiss: 20, behalten: 0, koennen: 1, schritt: 0 });
  });

  it('Pflicht-Test D-6: fortgeschrieben = neu aufgebaut, in jeder Reihenfolge des Buchens', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            groesse: fc.integer({ min: 1, max: 30 }),
            tag: fc.constantFrom('2026-10-28', '2026-10-29'),
            festigt: fc.boolean(),
          }),
          { minLength: 1, maxLength: 8 },
        ),
        (plan) => {
          const sitzungen: SitzungEreignis[] = [];
          const aufgaben: AufgabeEreignis[] = [];
          const staende: KompetenzStand[] = [];
          const gebucht: BuchungEreignis[] = [];
          let konto = leeresKonto('P');
          plan.forEach((p, i) => {
            const s = sitzung(`S${i}`, p.groesse, p.tag);
            sitzungen.push(s.sitzung);
            aufgaben.push(...s.aufgaben);
            if (p.festigt) staende.push(gefestigt(`K${i}`));
            // nach jeder Sitzung buchen, was fehlt – wie die App
            const neu = fehlendeBuchungen(
              sitzungen,
              aufgaben,
              staende,
              new Set(gebucht.map((b) => b.id)),
              kontext,
            );
            gebucht.push(...neu);
            konto = neu.reduce(verbuche, konto);
          });
          expect(konto).toEqual(kontoAus('P', gebucht));
          expect(new Set(gebucht.map((b) => b.id)).size).toBe(gebucht.length);
          expect(konto.stand.koennen).toBe(staende.length);
        },
      ),
    );
  });

  it('Zusammenführen zweier Geräte: gleiche Anlässe ergeben gleiche IDs, nichts doppelt', () => {
    const a = sitzung('S1', 12);
    const aufA = fehlendeBuchungen([a.sitzung], a.aufgaben, [gefestigt('K1')], new Set(), kontext);
    const aufB = fehlendeBuchungen([a.sitzung], a.aufgaben, [gefestigt('K1')], new Set(), {
      ...kontext,
      geraet: 'geraet02',
      jetzt: 9_999_999,
    });
    const vereint = new Map([...aufA, ...aufB].map((b) => [b.id, b]));
    expect(kontoAus('P', [...vereint.values()])).toEqual(kontoAus('P', aufA));
  });
});
