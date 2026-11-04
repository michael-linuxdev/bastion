import { describe, expect, it } from 'vitest';
import type { Kompetenz } from '../competence/kompetenz';
import { reviewHash } from './review';
import { platzhalterIn, pruefeVorlage } from './vorlage';

const kompetenz = {
  id: 'M.ZO.NZ.STELLENWERT',
  niveaus: { G: { beschreibung: { de: 'g' } }, M: { beschreibung: { de: 'm' } } },
} as unknown as Kompetenz;

const kontext = {
  dateiname: 'ziffer-an-stelle',
  ordnerKompetenz: 'M.ZO.NZ.STELLENWERT',
  kompetenzen: new Map([[kompetenz.id, kompetenz]]),
  generatoren: new Map([
    ['nz.ziffer-an-stelle@1', { platzhalter: ['zahl', 'stelle'], fehlerbildIds: ['von-links'] }],
  ]),
};

const gueltig = () => ({
  id: 'M.ZO.NZ.STELLENWERT.ZIFFER-AN-STELLE',
  kompetenz: 'M.ZO.NZ.STELLENWERT',
  niveaus: ['G', 'M'],
  typ: 'zahl-eingabe',
  quelle: 'generator',
  generator: 'nz.ziffer-an-stelle@1',
  parameter: { G: { stellen_max: 7 }, M: { stellen_max: 12 } },
  text: { aufgabe: { de: 'Welche Ziffer steht in {zahl} an der {stelle}?' } },
  hilfen: [{ de: 'Zähle von rechts.' }],
  fehlerbilder: { 'von-links': { de: 'Von rechts zählen.' } },
  herkunft: 'ki-entwurf',
  version: 1,
});

describe('pruefeVorlage', () => {
  it('akzeptiert eine gültige Vorlage', () => {
    expect(pruefeVorlage(gueltig(), kontext)).toEqual([]);
  });

  it('Fehlerbilder je Parameter: nur die aufführen, die mit diesen Parametern vorkommen', () => {
    // „lang“ gibt es nur bei mehr als 9 Stellen (wie „nicht erweitert“ nur bei verschiedenen Nennern)
    const mitFuer = {
      ...kontext,
      generatoren: new Map([
        [
          'nz.ziffer-an-stelle@1',
          {
            platzhalter: ['zahl', 'stelle'],
            fehlerbildIds: ['von-links', 'lang'],
            fehlerbildIdsFuer: (p: { stellen_max: number }) =>
              p.stellen_max > 9 ? ['von-links', 'lang'] : ['von-links'],
          },
        ],
      ]),
    };
    // M hat 12 Stellen: „lang“ muss stehen
    expect(pruefeVorlage(gueltig(), mitFuer).join(' | ')).toContain(
      'Rückmeldung für Fehlerbild „lang“ fehlt',
    );
    // Nur G mit 7 Stellen: „lang“ darf nicht stehen
    const nurG = { ...gueltig(), niveaus: ['G'], parameter: { G: { stellen_max: 7 } } };
    expect(pruefeVorlage(nurG, mitFuer)).toEqual([]);
    expect(
      pruefeVorlage(
        { ...nurG, fehlerbilder: { ...nurG.fehlerbilder, lang: { de: 'Zu lang.' } } },
        mitFuer,
      ).join(' | '),
    ).toContain('„lang“ kommt mit den Parametern dieser Vorlage nie vor');
  });

  it('akzeptiert einen passenden Review-Block und lehnt eine kaputte Stufe ab', () => {
    const daten = gueltig();
    expect(
      pruefeVorlage(
        {
          ...daten,
          review: { stufe: 1, datum: '2026-10-30', pruefer: 'maschine', hash: reviewHash(daten) },
        },
        kontext,
      ),
    ).toEqual([]);
    expect(pruefeVorlage({ ...daten, review: { stufe: 4 } }, kontext).join(' | ')).toContain(
      'review.stufe',
    );
  });

  it.each([
    ['unbekannter Generator', { generator: 'nz.gibt-es-nicht@1' }, 'nicht registriert'],
    ['falsche Generator-Version', { generator: 'nz.ziffer-an-stelle@2' }, 'nicht registriert'],
    [
      'Platzhalter fehlt im Generator',
      { text: { aufgabe: { de: 'Runde {zahl} auf {genauigkeit}.' } } },
      '{genauigkeit}',
    ],
    ['Rückmeldung für Fehlerbild fehlt', { fehlerbilder: {} }, '„von-links“ fehlt'],
    [
      'unbekanntes Fehlerbild',
      { fehlerbilder: { 'von-links': { de: 'a' }, erfunden: { de: 'b' } } },
      '„erfunden“ kennt',
    ],
    ['Niveau gibt es bei der Kompetenz nicht', { niveaus: ['E'] }, 'Niveau E'],
    ['Parameter für ein Niveau fehlen', { parameter: { G: {} } }, 'Niveau M fehlt'],
    ['ID passt nicht zum Dateinamen', { id: 'M.ZO.NZ.STELLENWERT.ANDERS' }, 'id muss'],
    ['unbekannte Kompetenz', { kompetenz: 'M.ZO.NZ.GIBTS-NICHT' }, 'existiert nicht'],
    ['unbekannter Aufgabentyp', { typ: 'malen' }, 'unbekannter typ'],
    ['keine Hilfe', { hilfen: [] }, 'mindestens eine Hilfe'],
  ])('meldet: %s', (_, aenderung, erwartet) => {
    expect(pruefeVorlage({ ...gueltig(), ...aenderung }, kontext).join(' | ')).toContain(erwartet);
  });
});

describe('platzhalterIn', () => {
  it('findet alle Platzhalter', () => {
    expect(platzhalterIn('Erweitere {bruch} auf {zielnenner}. {bruch}')).toEqual([
      'bruch',
      'zielnenner',
      'bruch',
    ]);
  });
});
