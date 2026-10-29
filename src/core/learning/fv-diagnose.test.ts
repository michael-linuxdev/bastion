import { describe, expect, it } from 'vitest';
import type { AufgabeEreignis } from './ereignis';
import { FV_REGELN, fvKatalog, fvZustaende } from './fv-diagnose';
import type { VermittlungEreignis } from './vermittlung-ereignis';

let n = 0;
function aufgabe(vorlage: string, fehlerbild?: string): AufgabeEreignis {
  n += 1;
  return {
    id: `A${String(n).padStart(5, '0')}`,
    art: 'aufgabe',
    v: 1,
    profil: 'P',
    ts: 1000 + n,
    tag: '2026-10-29',
    geraet: 'g',
    sitzung: 'S',
    modus: 'ueben',
    kompetenz: 'K',
    vorlage,
    niveau: 'G',
    quelle: { generator: 'g', version: 1, seed: n },
    paket: 'p',
    ergebnis: fehlerbild === undefined ? 'richtig' : 'falsch',
    hilfen: 0,
    dauerMs: 1000,
    faellig: false,
    bewertung: fehlerbild === undefined ? 'gut' : 'nochmal',
    ...(fehlerbild ? { fehlerbild } : {}),
  };
}

const katalog = fvKatalog(
  [
    { id: 'V.ERW', fehlerbilder: { addiert: { fv: 'FV.ADD' }, anders: {} } },
    { id: 'V.KONTRAST', fehlerbilder: { addiert: { fv: 'FV.ADD' } } },
    { id: 'V.FREMD', fehlerbilder: { x: { fv: 'FV.X' } } },
  ],
  [{ id: 'FV.ADD', kontrast: ['V.KONTRAST'] }],
);
const zustand = (folge: AufgabeEreignis[], v: VermittlungEreignis[] = []) =>
  fvZustaende(folge, v, katalog).get('FV.ADD')?.zustand;

describe('Diagnose der Fehlvorstellungen (VERMITTLUNG §3.3)', () => {
  it('einmal aufgefallen, zweimal im Fenster vermutet', () => {
    expect(zustand([aufgabe('V.ERW', 'addiert')])).toBe('aufgefallen');
    expect(
      zustand([aufgabe('V.ERW', 'addiert'), aufgabe('V.ERW'), aufgabe('V.ERW', 'addiert')]),
    ).toBe('vermutet');
    // Fehlerbild ohne fv und fremde Vorlagen zählen nicht
    expect(zustand([aufgabe('V.ERW', 'anders'), aufgabe('V.FREMD', 'x')])).toBeUndefined();
  });

  it('außerhalb des Fensters bleibt es bei aufgefallen', () => {
    const folge = [
      aufgabe('V.ERW', 'addiert'),
      ...Array.from({ length: FV_REGELN.fenster }, () => aufgabe('V.ERW')),
      aufgabe('V.ERW', 'addiert'),
    ];
    expect(zustand(folge)).toBe('aufgefallen');
  });

  it('vermutet → in Arbeit → aufgelöst über Kontrastaufgaben → wieder da', () => {
    const start = [aufgabe('V.ERW', 'addiert'), aufgabe('V.ERW', 'addiert')];
    const inArbeit = [...start, aufgabe('V.ERW')];
    expect(zustand(inArbeit)).toBe('in-arbeit');
    const einKontrast = [...inArbeit, aufgabe('V.KONTRAST')];
    expect(fvZustaende(einKontrast, [], katalog).get('FV.ADD')?.kontrasteRichtig).toBe(1);
    const aufgeloest = [...einKontrast, aufgabe('V.KONTRAST')];
    expect(zustand(aufgeloest)).toBe('aufgeloest');
    expect(zustand([...aufgeloest, aufgabe('V.ERW', 'addiert')])).toBe('wieder-da');
  });

  it('ein neuer Treffer in Arbeit setzt die Kontraste zurück', () => {
    const folge = [
      aufgabe('V.ERW', 'addiert'),
      aufgabe('V.ERW', 'addiert'),
      aufgabe('V.KONTRAST'),
      aufgabe('V.KONTRAST', 'addiert'),
      aufgabe('V.KONTRAST'),
    ];
    const s = fvZustaende(folge, [], katalog).get('FV.ADD');
    expect(s).toMatchObject({ zustand: 'in-arbeit', treffer: 3, kontrasteRichtig: 1 });
  });

  it('Fehler in den Zwischenschritten zählen als Treffer, je Aufgabe einmal (K-29)', () => {
    const mitSchritten = (): AufgabeEreignis => ({
      ...aufgabe('V.ERW', 'anders'),
      schritte: [
        {
          id: 's1',
          versuche: 2,
          richtig: false,
          fehler: [
            { fv: 'FV.ADD', eingabe: { typ: 'zahl', wert: 1 } },
            { fv: 'FV.ADD', eingabe: { typ: 'zahl', wert: 2 } },
          ],
        },
      ],
    });
    expect(fvZustaende([mitSchritten()], [], katalog).get('FV.ADD')?.treffer).toBe(1);
    expect(zustand([mitSchritten(), mitSchritten()])).toBe('vermutet');
  });

  it('Treffer aus der Erstvermittlung zählen mit', () => {
    const v: VermittlungEreignis = {
      id: 'V0',
      art: 'vermittlung',
      v: 1,
      profil: 'P',
      ts: 1,
      tag: '2026-10-29',
      geraet: 'g',
      kompetenz: 'K',
      inhalt: 'K@1',
      schritt: 'pruefen',
      typ: 'antwort',
      richtig: false,
      antwort: '1',
      fv: 'FV.ADD',
    };
    expect(zustand([aufgabe('V.ERW', 'addiert')], [v])).toBe('vermutet');
  });

  it('gleiche Ereignisse in anderer Reihenfolge ergeben dasselbe (Neuaufbau, D-6)', () => {
    const folge = [aufgabe('V.ERW', 'addiert'), aufgabe('V.ERW'), aufgabe('V.ERW', 'addiert')];
    expect(fvZustaende([...folge].reverse(), [], katalog)).toEqual(fvZustaende(folge, [], katalog));
  });
});
