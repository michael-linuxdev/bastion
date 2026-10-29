import { describe, expect, it } from 'vitest';
import type { Kompetenz } from '../competence/kompetenz';
import { pruefeFehlvorstellung } from './fehlvorstellung';

const kontext = {
  dateiname: 'FV.BR.ADDIERT',
  kompetenzen: new Map([
    ['M.ZO.BR.ERWEITERN', {} as Kompetenz],
    ['M.ZO.BR.BEGRIFF', {} as Kompetenz],
  ]),
  vorlagen: new Set(['M.ZO.BR.ERWEITERN.ZIELNENNER']),
  vermittlungen: new Map([['M.ZO.BR.ERWEITERN', new Set(['erklaeren', 'beispiel'])]]),
};

function gueltig(): Record<string, unknown> {
  return {
    id: 'FV.BR.ADDIERT',
    name: { de: 'Addiert statt multipliziert' },
    art: 'falsche-regel',
    beschreibung: { de: 'Überträgt das Rechnen mit natürlichen Zahlen.' },
    kompetenzen: ['M.ZO.BR.ERWEITERN'],
    erklaerung: {
      kurz: { de: 'Beim Erweitern wird multipliziert.' },
      lang: [
        { teil: 'so-denkst-du', de: 'Du hast addiert.' },
        {
          teil: 'warum-nicht',
          de: 'Der Anteil ändert sich.',
          bild: { werkzeug: 'bruchstreifen@1' },
        },
        { teil: 'so-stimmt-es', de: 'Multipliziere beide.' },
      ],
    },
    gegenbeispiel: { de: '1/2 ist nicht 2/3.' },
    rueckweg: { vermittlung: 'M.ZO.BR.ERWEITERN#erklaeren', voraussetzung: 'M.ZO.BR.BEGRIFF' },
    kontrast: ['M.ZO.BR.ERWEITERN.ZIELNENNER'],
    herkunft: 'ki-entwurf',
    version: 1,
  };
}

const mit = (aendern: (d: Record<string, unknown>) => void) => {
  const d = gueltig();
  aendern(d);
  return pruefeFehlvorstellung(d, kontext);
};

describe('Fehlvorstellung prüfen (INHALTSFORMAT §16)', () => {
  it('ein vollständiger Eintrag hat keine Fehler', () => {
    expect(pruefeFehlvorstellung(gueltig(), kontext)).toEqual([]);
  });

  it('ID passt zum Muster und zum Dateinamen', () => {
    expect(mit((d) => (d['id'] = 'fv.addiert'))).toContain('id muss FV.<FELD>.<NAME> lauten');
    expect(mit((d) => (d['id'] = 'FV.BR.ANDERS'))).toContain(
      'id FV.BR.ANDERS passt nicht zum Dateinamen',
    );
  });

  it('verlangt die drei Teile der langen Erklärung in fester Reihenfolge (F3, F4)', () => {
    const f = mit((d) => {
      const e = d['erklaerung'] as { lang: unknown[] };
      e.lang = [e.lang[1], e.lang[0], e.lang[2]];
    });
    expect(f.some((x) => x.startsWith('erklaerung.lang braucht'))).toBe(true);
  });

  it('prüft Rückweg, Kontrast und Gegenbeispiel (F3)', () => {
    expect(mit((d) => (d['rueckweg'] = { vermittlung: 'M.ZO.BR.ERWEITERN#fehlt' }))).toContain(
      'rueckweg.vermittlung: Schritt fehlt fehlt in der Erstvermittlung von M.ZO.BR.ERWEITERN',
    );
    expect(mit((d) => (d['rueckweg'] = { vermittlung: 'M.ZO.BR.ERWEITERN' }))).toContain(
      'rueckweg.vermittlung muss <Kompetenz-ID>#<Schritt-ID> sein',
    );
    // Ohne Erstvermittlung der Kompetenz wird der Schritt (noch) nicht geprüft
    expect(mit((d) => (d['rueckweg'] = { vermittlung: 'M.ZO.BR.BEGRIFF#irgendwo' }))).toEqual([]);
    expect(mit((d) => (d['kontrast'] = []))).toContain('kontrast: mindestens eine Vorlage (F3)');
    expect(mit((d) => delete d['gegenbeispiel'])).toContain('gegenbeispiel.de fehlt (F3)');
  });

  it('hält die kurze Erklärung kurz', () => {
    const f = mit((d) => {
      (d['erklaerung'] as { kurz: unknown }).kurz = { de: Array(36).fill('Wort').join(' ') };
    });
    expect(f).toContain('erklaerung.kurz länger als 35 Wörter');
  });
});
