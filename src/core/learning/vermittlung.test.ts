import { describe, expect, it } from 'vitest';
import type { Kompetenz } from '../competence/kompetenz';
import { pruefeVermittlung } from './vermittlung';

const kompetenz = (id: string, voraussetzungen: string[] = []) =>
  ({ id, voraussetzungen }) as unknown as Kompetenz;

const kontext = {
  ordnerKompetenz: 'M.ZO.BR.ERWEITERN',
  kompetenzen: new Map([
    ['M.ZO.BR.ERWEITERN', kompetenz('M.ZO.BR.ERWEITERN', ['M.ZO.BR.BEGRIFF'])],
    ['M.ZO.BR.BEGRIFF', kompetenz('M.ZO.BR.BEGRIFF')],
  ]),
  vorlagen: new Map([
    [
      'M.ZO.BR.ERWEITERN.ZIELNENNER',
      { kompetenz: 'M.ZO.BR.ERWEITERN', niveaus: ['G', 'M'] as const },
    ],
  ]),
  fehlvorstellungen: new Set(['FV.BR.ADDIERT', 'FV.BR.NUR-ZAEHLER']),
};

const text = (de: string) => ({ de });
const auswahl = {
  optionen: [
    { wert: text('6/8'), richtig: true },
    { wert: text('4/5'), fv: 'FV.BR.ADDIERT' },
    { wert: text('6/4'), fv: 'FV.BR.NUR-ZAEHLER' },
  ],
};

/** Eine gültige, vollständige Sequenz */
function gueltig() {
  return {
    id: 'M.ZO.BR.ERWEITERN',
    kompetenz: 'M.ZO.BR.ERWEITERN',
    niveau: 'G',
    dauer_min: 12,
    herkunft: 'ki-entwurf',
    version: 1,
    schritte: [
      { id: 'ziel', typ: 'ziel', text: text('Ziel'), weiter: 'vorwissen' },
      {
        id: 'vorwissen',
        typ: 'anknuepfen',
        text: text('Welcher Anteil?'),
        bild: { werkzeug: 'bruchstreifen@1', parameter: { teile: 4, gefaerbt: 3 } },
        antwort: { optionen: [{ wert: text('3/4'), richtig: true }, { wert: text('4/3') }] },
        weiter: 'entdecken',
        bei: { sonst: 'M.ZO.BR.BEGRIFF' },
      },
      {
        id: 'entdecken',
        typ: 'entdecken',
        text: text('Teile feiner.'),
        werkzeug: { id: 'bruchstreifen@1', parameter: { teile: 4 } },
        antwort: { eingabe: { art: 'bruch', loesung: '6/8' } },
        weiter: 'erklaeren',
      },
      { id: 'erklaeren', typ: 'erklaeren', text: text('Feiner teilen …'), weiter: 'beispiel' },
      { id: 'beispiel', typ: 'beispiel', text: text('2/3 = 8/12'), weiter: 'ergaenzen' },
      {
        id: 'ergaenzen',
        typ: 'ergaenzen',
        text: text('3/5 = □/10'),
        antwort: {
          eingabe: { art: 'zahl', loesung: '6', fehler: [{ wert: '8', fv: 'FV.BR.ADDIERT' }] },
        },
        weiter: 'gegenbeispiel',
      },
      {
        id: 'gegenbeispiel',
        typ: 'gegenbeispiel',
        text: text('Tim rechnet 2/3 = 4/5. Stimmt das?'),
        antwort: {
          optionen: [
            { wert: text('Nein'), richtig: true },
            { wert: text('Ja'), fv: 'FV.BR.ADDIERT' },
          ],
        },
        weiter: 'merksatz',
      },
      {
        id: 'merksatz',
        typ: 'merksatz',
        text: text('Zähler und Nenner mal dieselbe Zahl.'),
        weiter: 'pruefen',
      },
      {
        id: 'pruefen',
        typ: 'pruefen',
        text: text('Welcher Bruch ist so groß wie 3/4?'),
        antwort: auswahl,
        weiter: 'uebergang',
        bei: { 'FV.BR.ADDIERT': 'erklaeren', sonst: 'beispiel' },
      },
      {
        id: 'uebergang',
        typ: 'uebergang',
        text: text('Jetzt du.'),
        vorlagen: ['M.ZO.BR.ERWEITERN.ZIELNENNER'],
        anzahl: 3,
      },
    ],
  };
}

type Sequenz = ReturnType<typeof gueltig>;
const mit = (aendern: (s: Sequenz & { schritte: Record<string, unknown>[] }) => void) => {
  const s = gueltig() as Sequenz & { schritte: Record<string, unknown>[] };
  aendern(s);
  return pruefeVermittlung(s, kontext);
};
const schritt = (s: { schritte: Record<string, unknown>[] }, id: string) => {
  const x = s.schritte.find((y) => y['id'] === id);
  if (!x) throw new Error(id);
  return x;
};

describe('Erstvermittlung prüfen (INHALTSFORMAT §15)', () => {
  it('eine vollständige Sequenz hat keine Fehler', () => {
    expect(pruefeVermittlung(gueltig(), kontext)).toEqual([]);
  });

  it('meldet einen Verweis ins Leere', () => {
    expect(mit((s) => (schritt(s, 'beispiel')['weiter'] = 'gibt-es-nicht'))).toContain(
      'beispiel: weiter zeigt auf keinen Schritt',
    );
  });

  it('meldet einen Kreis ohne Weg zum uebergang', () => {
    const f = mit((s) => (schritt(s, 'merksatz')['weiter'] = 'beispiel'));
    expect(f).toContain('merksatz: über weiter kein Weg zum uebergang');
  });

  it('meldet unerreichbare Schritte', () => {
    const f = mit((s) => {
      schritt(s, 'erklaeren')['weiter'] = 'ergaenzen';
      schritt(s, 'pruefen')['bei'] = { sonst: 'erklaeren' };
    });
    expect(f).toContain('beispiel: vom Start nicht erreichbar');
  });

  it('verlangt bei pruefen für jede falsche Option eine Fehlvorstellung (V6)', () => {
    const f = mit((s) => {
      schritt(s, 'pruefen')['antwort'] = {
        optionen: [{ wert: text('6/8'), richtig: true }, { wert: text('4/5') }],
      };
    });
    expect(f).toContain('pruefen: falsche option 2 ohne fv (V6)');
  });

  it('verlangt genau eine richtige Option', () => {
    const f = mit((s) => {
      schritt(s, 'gegenbeispiel')['antwort'] = {
        optionen: [
          { wert: text('Nein'), richtig: true },
          { wert: text('Ja'), richtig: true },
        ],
      };
    });
    expect(f).toContain('gegenbeispiel: genau eine option mit richtig: true');
  });

  it('kennt nur Fehlvorstellungen aus dem Katalog', () => {
    const f = mit((s) => (schritt(s, 'pruefen')['bei'] = { 'FV.BR.UNBEKANNT': 'erklaeren' }));
    expect(f).toContain('pruefen: bei FV.BR.UNBEKANNT ist keine Fehlvorstellung');
  });

  it('erlaubt als Rückweg nur eigene Voraussetzungen', () => {
    const f = mit((s) => (schritt(s, 'vorwissen')['bei'] = { sonst: 'M.ZO.TB.TEILER' }));
    expect(f).toContain(
      'vorwissen: bei sonst zeigt weder auf einen Schritt noch auf eine Voraussetzung',
    );
  });

  it('verlangt die Pflicht-Bausteine (V4–V6)', () => {
    const f = mit((s) => {
      s.schritte = s.schritte.filter((x) => x['id'] !== 'merksatz');
      schritt(s, 'gegenbeispiel')['weiter'] = 'pruefen';
    });
    expect(f).toContain('es fehlt ein Schritt merksatz (V4–V6)');
  });

  it('prüft Werkzeuge, Dauer, Textlänge und Übergangsvorlagen', () => {
    expect(mit((s) => (schritt(s, 'vorwissen')['bild'] = { werkzeug: 'zauberstab@1' }))).toContain(
      'vorwissen.bild: unbekanntes Werkzeug zauberstab@1',
    );
    expect(mit((s) => (s.dauer_min = 30))).toContain(
      'dauer_min muss zwischen 1 und 15 liegen (V7)',
    );
    expect(
      mit((s) => (schritt(s, 'erklaeren')['text'] = text(Array(41).fill('Wort').join(' ')))),
    ).toContain('erklaeren: mehr als 40 Wörter (V8)');
    expect(mit((s) => (s.niveau = 'E'))).toContain(
      'uebergang: Vorlage M.ZO.BR.ERWEITERN.ZIELNENNER hat kein Niveau E',
    );
  });

  it('verbietet Antworten bei erklärenden Schritten', () => {
    expect(mit((s) => (schritt(s, 'merksatz')['antwort'] = auswahl))).toContain(
      'merksatz: merksatz hat keine antwort',
    );
  });
});
