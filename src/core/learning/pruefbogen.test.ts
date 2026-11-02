import { describe, expect, it } from 'vitest';
import type { Kompetenz } from '../competence/kompetenz';
import type { Begriff } from './begriffe';
import type { Fehlvorstellung } from './fehlvorstellung';
import type { Generator } from './generator';
import {
  abschnitte,
  beurteilt,
  exportDokumente,
  genannteFehlvorstellungen,
  pruefbogenModell,
  setze,
  werteAus,
  type PruefEingabe,
} from './pruefbogen';
import type { Vermittlung } from './vermittlung';
import type { GeneratorVorlage } from './vorlage';

// Erfundene Inhalte: eine Kompetenz mit Erstvermittlung und Vorlage, eine Voraussetzung.
const plus = {
  id: 'test.plus',
  version: 1,
  platzhalter: ['a'],
  fehlerbildIds: ['eins-zu-viel'],
  erzeuge: (seed: number) => ({
    platzhalter: { a: seed },
    loesung: { typ: 'zahl', wert: seed + 1 },
    loesungsweg: [],
    fehlerbilder: [{ id: 'eins-zu-viel', antwort: { typ: 'zahl', wert: seed + 2 } }],
  }),
} as unknown as Generator<unknown>;

const kompetenz = (id: string, titel: string) =>
  ({ id, titel: { de: titel }, kann_satz: { de: 'Ich kann.' } }) as unknown as Kompetenz;
const K = kompetenz('M.T.EINS', 'Eins dazu');
const V = kompetenz('M.T.VOR', 'Zählen');

const vermittlung = {
  id: 'M.T.EINS',
  kompetenz: 'M.T.EINS',
  schritte: [
    {
      id: 'vorwissen',
      typ: 'anknuepfen',
      text: { de: 'Was kommt nach 2?' },
      antwort: {
        eingabe: { art: 'zahl', loesung: '3', fehler: [{ wert: '4', fv: 'FV.TT.WEIT' }] },
      },
      bei: { 'FV.TT.WEIT': 'erklaeren', sonst: 'M.T.VOR' },
    },
    { id: 'erklaeren', typ: 'erklaeren', text: { de: 'Eins [[dazu]].' } },
    {
      id: 'pruefen',
      typ: 'pruefen',
      text: { de: 'Wie viel ist 5 + 1?' },
      antwort: {
        optionen: [
          { wert: { de: '6' }, richtig: true },
          { wert: { de: '7' }, fv: 'FV.TT.WEIT' },
        ],
      },
    },
  ],
} as unknown as Vermittlung;

const fv = {
  id: 'FV.TT.WEIT',
  name: { de: 'Zählt zu weit' },
  rueckweg: { vermittlung: 'M.T.EINS#erklaeren', voraussetzung: 'M.T.VOR' },
} as unknown as Fehlvorstellung;

const vorlage = {
  id: 'M.T.EINS.PLUS',
  kompetenz: 'M.T.EINS',
  quelle: 'generator',
  generator: 'test.plus@1',
  niveaus: ['G', 'M'],
  parameter: { G: {}, M: {} },
  text: { aufgabe: { de: '{a} + 1' } },
  fehlerbilder: { 'eins-zu-viel': { de: 'Eins zu viel.', fv: 'FV.TT.WEIT' } },
} as unknown as GeneratorVorlage;

const begriff = (id: string, form: string) =>
  ({ id, wort: { de: form }, formen: [form] }) as unknown as Begriff;

const eingabe: PruefEingabe = {
  kompetenzen: [K],
  alleKompetenzen: new Map([
    [K.id, K],
    [V.id, V],
  ]),
  vermittlungen: new Map([[K.id, vermittlung]]),
  vorlagen: [vorlage],
  fehlvorstellungen: new Map([[fv.id, fv]]),
  begriffe: [begriff('dazu', 'dazu'), begriff('weg', 'weg')],
  generatoren: new Map([['test.plus@1', plus]]),
  stichprobe: 3,
};

describe('Prüfbogen als Daten', () => {
  const p = pruefbogenModell(eingabe);

  it('nummeriert die Schritte und löst Rückwege auf', () => {
    const [a] = p.a;
    expect(a?.id).toBe('A-M.T.EINS');
    expect(a?.schritte.map((s) => s.nr)).toEqual([1, 2, 3]);
    const vorwissen = a?.schritte[0];
    expect(vorwissen?.antworten).toEqual([
      { wert: '3', richtig: true, eingabe: true },
      {
        wert: '4',
        richtig: false,
        eingabe: true,
        fv: 'FV.TT.WEIT',
        ziel: { art: 'schritt', nr: 2 },
      },
    ]);
    expect(vorwissen?.sonst).toEqual({ art: 'voraussetzung', titel: 'Zählen' });
    // Ohne `bei` geht eine falsche Option einfach weiter
    expect(a?.schritte[2]?.antworten[1]?.ziel).toEqual({ art: 'weiter' });
  });

  it('sammelt die genannten Fehlvorstellungen mit ihren Rückmeldungen und Rückwegen', () => {
    expect(genannteFehlvorstellungen(eingabe)).toEqual(['FV.TT.WEIT']);
    const [b] = p.b;
    expect(b?.rueckmeldungen).toEqual([
      { vorlage: 'M.T.EINS.PLUS', fehlerbild: 'eins-zu-viel', text: 'Eins zu viel.' },
    ]);
    expect(b?.rueckweg).toEqual({
      erklaerung: { art: 'erstvermittlung', titel: 'Eins dazu', schritt: 'erklaeren', nr: 2 },
      voraussetzung: { art: 'voraussetzung', titel: 'Zählen' },
    });
  });

  it('zieht je Niveau die Stichprobe mit den Seeds 1 … n', () => {
    const [c] = p.c;
    expect(c?.niveaus.map((n) => n.niveau)).toEqual(['G', 'M']);
    expect(c?.niveaus[0]?.aufgaben.map((i) => i.platzhalter['a'])).toEqual([1, 2, 3]);
    expect(c?.generatorFehlt).toBe(false);
  });

  it('nimmt nur markierte Fachbegriffe', () => {
    expect(p.d.begriffe.map((b) => b.id)).toEqual(['dazu']);
  });

  it('meldet einen fehlenden Generator statt abzubrechen', () => {
    const ohne = pruefbogenModell({ ...eingabe, generatoren: new Map() });
    expect(ohne.c[0]).toMatchObject({ generatorFehlt: true, niveaus: [] });
  });

  it('ist bei gleicher Eingabe gleich und listet alle Abschnitte in Bogen-Reihenfolge', () => {
    expect(pruefbogenModell(eingabe)).toEqual(p);
    expect(abschnitte(p).map((a) => a.id)).toEqual([
      'A-M.T.EINS',
      'B-FV.TT.WEIT',
      'C-M.T.EINS.PLUS',
      'D-begriffe',
    ]);
  });
});

describe('Bewertung', () => {
  it('setzt Felder, entfernt leere und zählt Abschnitte mit Urteil', () => {
    let b = setze({}, 'A-M.T.EINS', 'urteil', 'passt');
    b = setze(b, 'A-M.T.EINS', 's2', 'nicht');
    b = setze(b, 'B-FV.TT.WEIT', 'f0', true);
    b = setze(b, 'B-FV.TT.WEIT', 'f0', false);
    expect(b['B-FV.TT.WEIT']).toEqual({});
    expect(beurteilt(b, ['A-M.T.EINS', 'B-FV.TT.WEIT'])).toBe(1);
  });

  it('übernimmt aus dem Speicher nur Texte und Wahrheitswerte mit gültigem Namen', () => {
    expect(werteAus({ urteil: 'passt', f0: true, x: 3, 'a/b': 'nein' })).toEqual({
      urteil: 'passt',
      f0: true,
    });
    expect(werteAus('kaputt')).toEqual({});
  });

  it('exportiert kopf zuerst, leere Abschnitte nicht', () => {
    const b = { 'C-X': { G1: true }, kopf: { name: 'Erika' }, 'A-Y': {} };
    expect(exportDokumente(b, { kopf: '2026-11-02T08:00:00.000Z' })).toEqual([
      { id: 'kopf', data: { werte: { name: 'Erika' }, stand: '2026-11-02T08:00:00.000Z' } },
      { id: 'C-X', data: { werte: { G1: true }, stand: '' } },
    ]);
  });
});
