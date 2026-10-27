import { describe, expect, it } from 'vitest';
import type { Kompetenz } from '../competence/kompetenz';
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
