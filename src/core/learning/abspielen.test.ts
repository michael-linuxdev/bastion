import { describe, expect, it } from 'vitest';
import { bewerte, erster, kurzfassung, naechstes, richtigeAntwort } from './abspielen';
import type { Schritt, Vermittlung } from './vermittlung';

const s = (teil: Partial<Schritt> & Pick<Schritt, 'id' | 'typ'>): Schritt => ({
  text: { de: teil.id },
  ...teil,
});

const v: Vermittlung = {
  id: 'M.X',
  kompetenz: 'M.X',
  niveau: 'G',
  dauer_min: 10,
  herkunft: 'ki-entwurf',
  version: 1,
  schritte: [
    s({ id: 'ziel', typ: 'ziel', weiter: 'vorwissen' }),
    s({
      id: 'vorwissen',
      typ: 'anknuepfen',
      antwort: { eingabe: { art: 'zahl', loesung: '3' } },
      weiter: 'erklaeren',
      bei: { sonst: 'M.VORHER' },
    }),
    s({ id: 'erklaeren', typ: 'erklaeren', weiter: 'beispiel' }),
    s({ id: 'beispiel', typ: 'beispiel', weiter: 'pruefen' }),
    s({
      id: 'pruefen',
      typ: 'pruefen',
      antwort: {
        optionen: [
          { wert: { de: '3/5' }, richtig: true },
          { wert: { de: '5/3' }, fv: 'FV.BR.VERTAUSCHT' },
          { wert: { de: '2/5' }, fv: 'FV.BR.GEGENTEIL' },
        ],
      },
      weiter: 'merksatz',
      bei: { 'FV.BR.VERTAUSCHT': 'erklaeren' },
    }),
    s({
      id: 'ergaenzen',
      typ: 'ergaenzen',
      antwort: {
        eingabe: {
          art: 'bruch',
          loesung: '2/6',
          fehler: [{ wert: '6/2', fv: 'FV.BR.VERTAUSCHT' }],
        },
      },
      weiter: 'merksatz',
    }),
    s({ id: 'merksatz', typ: 'merksatz', weiter: 'uebergang' }),
    s({ id: 'uebergang', typ: 'uebergang', vorlagen: ['M.X.A'], anzahl: 3 }),
  ],
};
const schritt = (id: string) => v.schritte.find((x) => x.id === id) as Schritt;

describe('Abspielen einer Erstvermittlung', () => {
  it('Optionen: richtig, falsch mit Fehlvorstellung, unbekannter Index', () => {
    expect(bewerte(schritt('pruefen'), { option: 0 })).toEqual({ richtig: true });
    expect(bewerte(schritt('pruefen'), { option: 1 })).toEqual({
      richtig: false,
      fv: 'FV.BR.VERTAUSCHT',
    });
    expect(bewerte(schritt('pruefen'), { option: 9 })).toEqual({ ungueltig: true });
    expect(bewerte(schritt('pruefen'), { text: '3/5' })).toEqual({ ungueltig: true });
  });

  it('Eingabe: Zahl mit Komma oder Punkt, Bruch genau so geschrieben', () => {
    expect(bewerte(schritt('vorwissen'), { text: ' 3 ' })).toEqual({ richtig: true });
    expect(bewerte(schritt('vorwissen'), { text: '4' })).toEqual({ richtig: false });
    expect(bewerte(schritt('vorwissen'), { text: 'drei' })).toEqual({ ungueltig: true });
    expect(bewerte(schritt('ergaenzen'), { text: '2/6' })).toEqual({ richtig: true });
    // wertgleich, aber nicht abgelesen: hier zählt die Schreibweise
    expect(bewerte(schritt('ergaenzen'), { text: '1/3' })).toEqual({ richtig: false });
    expect(bewerte(schritt('ergaenzen'), { text: '6 / 2' })).toEqual({
      richtig: false,
      fv: 'FV.BR.VERTAUSCHT',
    });
  });

  it('Verzweigung: weiter, bei Fehlvorstellung, sonst, Rückweg zur Voraussetzung', () => {
    expect(erster(v)?.id).toBe('ziel');
    const ziel = (id: string, b?: Parameters<typeof naechstes>[2]) => naechstes(v, schritt(id), b);
    expect(ziel('ziel')).toEqual({ art: 'schritt', schritt: schritt('vorwissen') });
    expect(ziel('pruefen', { richtig: true })).toMatchObject({ schritt: { id: 'merksatz' } });
    expect(ziel('pruefen', { richtig: false, fv: 'FV.BR.VERTAUSCHT' })).toMatchObject({
      schritt: { id: 'erklaeren' },
    });
    // Fehlvorstellung ohne eigenen Eintrag und ohne „sonst“: weiter
    expect(ziel('pruefen', { richtig: false, fv: 'FV.BR.GEGENTEIL' })).toMatchObject({
      schritt: { id: 'merksatz' },
    });
    expect(ziel('vorwissen', { richtig: false })).toEqual({
      art: 'voraussetzung',
      kompetenz: 'M.VORHER',
      danach: schritt('erklaeren'),
    });
    expect(ziel('uebergang')).toEqual({ art: 'ende' });
  });

  it('richtige Antwort und Kurzfassung', () => {
    expect(richtigeAntwort(schritt('pruefen'))).toBe('3/5');
    expect(richtigeAntwort(schritt('ergaenzen'))).toBe('2/6');
    expect(richtigeAntwort(schritt('merksatz'))).toBeUndefined();
    expect(kurzfassung(v).map((x) => x.id)).toEqual(['beispiel', 'merksatz']);
  });
});
