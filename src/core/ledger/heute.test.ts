import { describe, expect, it } from 'vitest';
import type { AufgabeEreignis } from '../learning/ereignis';
import type { BuchungEreignis } from './buchung';
import { tagesertrag } from './heute';
import type { Buchung } from './regeln';

const b = (teil: Partial<Buchung> & Pick<Buchung, 'ressource' | 'menge'>): BuchungEreignis => ({
  id: `${teil.ressource}.${teil.bezug ?? 'S'}`,
  art: 'buchung',
  v: 1,
  profil: 'P',
  ts: 0,
  geraet: 'g',
  grund: 'sitzung',
  bezug: 'S',
  tag: '2026-10-28',
  aufschluesselung: {},
  regel: 1,
  ...teil,
});

let nr = 0;
/** sehr schnelle falsche Antwort (BASEBAU §3.1) */
const geraten = (tag: string): AufgabeEreignis => ({
  id: `A${(nr += 1)}`,
  art: 'aufgabe',
  v: 1,
  profil: 'P',
  ts: nr,
  tag,
  geraet: 'g',
  sitzung: 'S',
  modus: 'ueben',
  kompetenz: 'K',
  vorlage: 'K.V',
  niveau: 'G',
  quelle: { generator: 'g', version: 1, seed: 1 },
  paket: 'p',
  ergebnis: 'falsch',
  hilfen: 0,
  dauerMs: 800,
  faellig: false,
  bewertung: 'nochmal',
  schnappschuss: {
    platzhalter: {},
    loesung: { typ: 'zahl', wert: 1 },
    antwort: { typ: 'zahl', wert: 2 },
  },
});

describe('Tagesertrag (BASEBAU §6.1)', () => {
  it('summiert die Buchungen des Lerntags mit „woher“', () => {
    const e = tagesertrag(
      [
        b({
          ressource: 'fleiss',
          menge: 26,
          aufschluesselung: { aufgaben: 30, voll: 25, halb: 2, geraten: 3 },
        }),
        b({
          ressource: 'behalten',
          menge: 3,
          aufschluesselung: { wiederholungen: 2, korrekturen: 1, gekappt: 0 },
        }),
        b({ ressource: 'schritt', menge: 1, bezug: 'S1' }),
        b({ ressource: 'schritt', menge: 1, bezug: 'S2' }),
        b({
          ressource: 'koennen',
          menge: 1,
          grund: 'kompetenz-gefestigt',
          bezug: 'M.ZO.BR.ERWEITERN@G',
        }),
        b({ ressource: 'fleiss', menge: 9, bezug: 'GESTERN', tag: '2026-10-27' }),
      ],
      [geraten('2026-10-28'), geraten('2026-10-28'), geraten('2026-10-27')],
      '2026-10-28',
    );
    expect(e).toEqual({
      menge: { fleiss: 26, behalten: 3, koennen: 1, schritt: 2 },
      fleissAufgaben: 27,
      weniger: true,
      geraten: 2,
      wiederholungen: 2,
      korrekturen: 1,
      gekappt: 0,
      bauplaene: [{ kompetenz: 'M.ZO.BR.ERWEITERN', niveau: 'G' }],
      schritteVoll: true,
    });
  });

  it('ohne Buchungen: alles null', () => {
    expect(tagesertrag([], [], '2026-10-28')).toMatchObject({
      menge: { fleiss: 0, behalten: 0, koennen: 0, schritt: 0 },
      schritteVoll: false,
      bauplaene: [],
    });
  });
});
