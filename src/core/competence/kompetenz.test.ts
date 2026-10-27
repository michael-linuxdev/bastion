import { describe, expect, it } from 'vitest';
import { pruefeGraph, pruefeKompetenz } from './kompetenz';

const gueltig = () => ({
  id: 'M.ZO.BR.ERWEITERN',
  fach: 'mathematik',
  bereich: 'zahl-und-operation',
  feld: 'brueche-und-dezimalzahlen',
  titel: { de: 'Brüche erweitern und kürzen' },
  kann_satz: { de: 'Ich kann Brüche erweitern und kürzen.' },
  klassenstufe_typisch: [5, 6],
  voraussetzungen: ['M.ZO.BR.BEGRIFF'],
  niveaus: { G: { beschreibung: { de: 'leicht' } }, M: { beschreibung: { de: 'mittel' } } },
  kmk: { leitidee: 'L1', prozesse: ['K5'] },
  anforderungsbereiche: ['I'],
  abdeckung: 'generator',
  sachsen: { gymnasium: { klassenstufe: 5, lernbereich: 'LB 2 Gemeine Brüche und Dezimalzahlen' } },
  version: 1,
});
const PFAD = ['zahl-und-operation', 'brueche-und-dezimalzahlen', 'M.ZO.BR.ERWEITERN'];

describe('pruefeKompetenz', () => {
  it('akzeptiert eine gültige Kompetenz', () => {
    expect(pruefeKompetenz(gueltig(), PFAD)).toEqual([]);
  });

  it.each([
    ['falsches ID-Schema', { id: 'BR.ERWEITERN' }, 'Schema'],
    ['falscher Bereich', { bereich: 'raum-und-form' }, 'bereich muss'],
    ['Kann-Satz ohne „Ich kann“', { kann_satz: { de: 'Erweitern' } }, 'Ich kann'],
    ['String statt Sprachobjekt', { titel: 'Brüche' }, 'Sprachobjekt'],
    ['Klassenstufe außerhalb', { klassenstufe_typisch: [4] }, 'klassenstufe_typisch'],
    ['unbekanntes Niveau', { niveaus: { X: { beschreibung: { de: 'x' } } } }, 'unbekanntes Niveau'],
    ['Leitidee passt nicht', { kmk: { leitidee: 'L4', prozesse: ['K5'] } }, 'leitidee'],
    ['falscher Prozess', { kmk: { leitidee: 'L1', prozesse: ['K9'] } }, 'prozesse'],
    ['Lehrplanbezug fehlt', { sachsen: {} }, 'sachsen fehlt'],
    [
      'Lernbereich ohne „LB n“',
      { sachsen: { gymnasium: { klassenstufe: 5, lernbereich: 'Brüche' } } },
      'lernbereich',
    ],
    ['setzt sich selbst voraus', { voraussetzungen: ['M.ZO.BR.ERWEITERN'] }, 'selbst'],
  ])('meldet: %s', (_, aenderung, erwartet) => {
    const fehler = pruefeKompetenz({ ...gueltig(), ...aenderung }, PFAD);
    expect(fehler.join(' | ')).toContain(erwartet);
  });

  it('meldet eine Datei im falschen Ordner', () => {
    expect(pruefeKompetenz(gueltig(), ['zahl-und-operation', 'teilbarkeit', 'X']).join()).toContain(
      'falschen Ordner',
    );
  });

  it('meldet Nicht-Objekte', () => {
    expect(pruefeKompetenz('text')).toHaveLength(1);
  });
});

describe('pruefeGraph', () => {
  it('akzeptiert einen Graphen ohne Kreise', () => {
    expect(
      pruefeGraph([
        { id: 'A', voraussetzungen: [] },
        { id: 'B', voraussetzungen: ['A'] },
        { id: 'C', voraussetzungen: ['A', 'B'] },
      ]),
    ).toEqual([]);
  });

  it('meldet fehlende Voraussetzungen und Dubletten', () => {
    const fehler = pruefeGraph([
      { id: 'A', voraussetzungen: ['X'] },
      { id: 'A', voraussetzungen: [] },
    ]);
    expect(fehler.join(' | ')).toContain('X existiert nicht');
    expect(fehler.join(' | ')).toContain('doppelt');
  });

  it('meldet Kreise', () => {
    const fehler = pruefeGraph([
      { id: 'A', voraussetzungen: ['C'] },
      { id: 'B', voraussetzungen: ['A'] },
      { id: 'C', voraussetzungen: ['B'] },
    ]);
    expect(fehler.join()).toContain('Kreis');
  });
});
