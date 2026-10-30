import { describe, expect, it } from 'vitest';
import { quelleAusSeed } from '../rng/zufallsquelle';
import type { AufgabeEreignis } from '../learning/ereignis';
import type { EinstellungEreignis } from '../policy/einstellung';
import { nutzungEreignis, VERWEIL_MAX_MS } from './nutzung';
import { testprotokoll, zusammenfassung } from './protokoll';
import { pruefziffer, teilnehmerLesen, teilnehmerNummer } from './teilnehmer';

describe('Teilnehmer-Nummern (K-14)', () => {
  it('Prüfziffer nach Luhn', () => {
    expect(pruefziffer('7992739871')).toBe(3); // Lehrbuchbeispiel
    expect(teilnehmerNummer(7)).toBe(`T-07-${pruefziffer('07')}`);
  });

  it('liest gültige Nummern in verschiedenen Schreibweisen, lehnt falsche ab', () => {
    const nr = teilnehmerNummer(12);
    expect(teilnehmerLesen(nr)).toBe(nr);
    expect(teilnehmerLesen(nr.toLowerCase().replaceAll('-', ' '))).toBe(nr);
    const falsch = `${nr.slice(0, -1)}${(Number(nr.at(-1)) + 1) % 10}`;
    expect(teilnehmerLesen(falsch)).toBeUndefined();
    expect(teilnehmerLesen('T-00-0')).toBeUndefined();
    expect(teilnehmerLesen('Max')).toBeUndefined();
  });

  it('jede Ziffer falsch abgetippt fällt auf', () => {
    for (let n = 1; n <= 99; n++) {
      const nr = teilnehmerNummer(n);
      const nn = nr.slice(2, 4);
      for (let i = 0; i < 2; i++)
        for (let d = 0; d <= 9; d++) {
          const anders = nn.slice(0, i) + String(d) + nn.slice(i + 1);
          if (anders === nn || anders === '00') continue;
          expect(teilnehmerLesen(`T-${anders}-${nr.at(-1)}`)).toBeUndefined();
        }
    }
  });
});

describe('Nutzungsprotokoll (D-18)', () => {
  it('Ereignis mit gekappter Verweildauer, ohne leere Felder', () => {
    const e = nutzungEreignis(
      { profil: 'P', geraet: 'G', was: 'ansicht', ziel: 'uebung', dauerMs: 99 * 60_000 },
      1000,
      60,
      quelleAusSeed(1),
    );
    expect(e).toMatchObject({ art: 'nutzung', was: 'ansicht', ziel: 'uebung' });
    expect(e.dauerMs).toBe(VERWEIL_MAX_MS);
    const ohne = nutzungEreignis(
      { profil: 'P', geraet: 'G', was: 'app' },
      1000,
      60,
      quelleAusSeed(1),
    );
    expect(ohne).not.toHaveProperty('ziel');
    expect(ohne).not.toHaveProperty('dauerMs');
  });

  it('Datei: ab dem Einschalten, ohne Profil und Gerät, nur Test-Einstellungen, unbekannte Fehler', () => {
    const z = quelleAusSeed(2);
    const aufgabe = (ts: number, teil: Partial<AufgabeEreignis>): AufgabeEreignis => ({
      id: `A${ts}`,
      art: 'aufgabe',
      v: 2,
      profil: 'P',
      ts,
      tag: '2026-10-29',
      geraet: 'G',
      sitzung: 'S',
      modus: 'ueben',
      kompetenz: 'K',
      vorlage: 'K.V',
      niveau: 'G',
      quelle: { generator: 'g', version: 1, seed: 1 },
      paket: 'p',
      ergebnis: 'falsch',
      hilfen: 0,
      dauerMs: 1,
      faellig: false,
      bewertung: 'nochmal',
      schnappschuss: {
        platzhalter: { a: 1 },
        loesung: { typ: 'zahl', wert: 2 },
        antwort: { typ: 'zahl', wert: 3 },
      },
      ...teil,
    });
    const einstellung = (ts: number, schluessel: string): EinstellungEreignis => ({
      id: `E${ts}`,
      art: 'einstellung',
      v: 1,
      profil: 'P',
      ts,
      tag: '2026-10-29',
      geraet: 'G',
      schluessel,
      wert: 'x',
      durch: 'eltern',
    });
    const p = testprotokoll({
      teilnehmer: 'T-07-4',
      erstellt: '2026-10-30',
      seit: 100,
      aufgaben: [aufgabe(50, {}), aufgabe(150, {}), aufgabe(160, { fehlerbild: 'x' })],
      sitzungen: [],
      vermittlungen: [],
      nutzungen: [nutzungEreignis({ profil: 'P', geraet: 'G', was: 'app' }, 170, 60, z)],
      einstellungen: [einstellung(120, 'test.aktiv'), einstellung(130, 'eltern.pin')],
    });
    expect(p.ereignisse.map((e) => e.art)).toEqual([
      'einstellung',
      'aufgabe',
      'aufgabe',
      'nutzung',
    ]);
    expect(JSON.stringify(p)).not.toContain('"profil"');
    expect(JSON.stringify(p)).not.toContain('"geraet"');
    expect(JSON.stringify(p)).not.toContain('eltern.pin');
    expect(p.unbekannteFehler).toEqual([
      {
        ts: 150,
        vorlage: 'K.V',
        niveau: 'G',
        platzhalter: { a: 1 },
        loesung: { typ: 'zahl', wert: 2 },
        antwort: { typ: 'zahl', wert: 3 },
      },
    ]);
    expect(zusammenfassung(p).jeArt).toEqual({ einstellung: 1, aufgabe: 2, nutzung: 1 });
  });
});
