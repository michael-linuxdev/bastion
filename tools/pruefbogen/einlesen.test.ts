import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { inhaltsdateien } from '../review/dateien';
import { arbeitsliste, dateienVon, leseExport } from './einlesen';

// Erfundene Bewertung (keine echte Lehrkraft): tools/pruefbogen/beispiel/bewertung.json
const json = JSON.parse(
  readFileSync('tools/pruefbogen/beispiel/bewertung.json', 'utf8'),
) as unknown;
const alle = inhaltsdateien('content');

describe('Prüfbogen einlesen (F3)', () => {
  const b = leseExport(json);

  it('liest Kopf und Abschnitte, Urteil, Anmerkung und Häkchen', () => {
    expect(b.pruefer).toBe('Erika Muster');
    expect(b.abschnitte.map((a) => a.id)).toEqual([
      'A-M.ZO.BR.ADD-SUB',
      'A-M.ZO.BR.ERWEITERN',
      'B-FV.BR.VERTAUSCHT',
      'C-M.ZO.BR.ERWEITERN.KUERZEN',
      'D-begriffe',
    ]);
    const c = b.abschnitte.find((a) => a.id.startsWith('C-'));
    expect(c).toMatchObject({ urteil: 'falsch', fragenAbgehakt: 1, zeilenAbgehakt: 2 });
    expect(c?.notiz).toContain('M1');
  });

  it('versteht auch die Formen { documents: [...] } und { id: daten }', () => {
    const dok = { doc_id: 'B-FV.BR.VERTAUSCHT', data: { werte: { urteil: 'passt' } } };
    expect(leseExport({ documents: [dok] }).abschnitte[0]?.urteil).toBe('passt');
    expect(leseExport({ 'B-FV.X': { werte: { urteil: 'falsch' } } }).abschnitte[0]?.urteil).toBe(
      'falsch',
    );
    expect(() => leseExport('kaputt')).toThrow();
  });

  it('ordnet Abschnitte ihren Dateien zu', () => {
    const a = dateienVon('A-M.ZO.BR.ADD-SUB', alle).map((d) => d.art);
    expect(a.sort()).toEqual(['kompetenz', 'vermittlung']);
    expect(dateienVon('B-FV.BR.VERTAUSCHT', alle)).toHaveLength(1);
    expect(dateienVon('C-M.ZO.BR.ERWEITERN.KUERZEN', alle)).toHaveLength(1);
    expect(dateienVon('D-begriffe', alle)).toEqual([]);
  });

  it('schlägt Stufe 2 nur für „passt“ mit gültiger Stufe 1 vor und setzt nichts selbst', () => {
    const md = arbeitsliste(b, alle);
    expect(md).toContain('pnpm review setzen --stufe 2 --pruefer "Erika Muster"');
    // Die Fehlvorstellung VERTAUSCHT hat Stufe 1 und passt
    expect(md).toMatch(/content\/mathematik\/fehlvorstellungen\/FV\.BR\.VERTAUSCHT\.yaml/);
    // „falsch“ und „passt mit Änderung“ landen unter „Zu ändern“, nicht im Vorschlag
    const vorschlag = md.split('## Vorschlag für Stufe 2')[1]?.split('## ')[0] ?? '';
    expect(vorschlag).not.toContain('kuerzen.yaml');
    expect(vorschlag).not.toContain('M.ZO.BR.ERWEITERN/vermittlung.yaml');
    expect(md).toContain('## Zu ändern');
    expect(md).toContain('Schritt erklaeren-kuerzen');
  });

  it('Datei ohne gültige Stufe 1: kein Vorschlag, sondern Hinweis', () => {
    const md = arbeitsliste(
      {
        abschnitte: [
          {
            id: 'B-FV.BR.KOMMA-ALS-BRUCHSTRICH',
            urteil: 'passt',
            fragenAbgehakt: 0,
            zeilenAbgehakt: 0,
          },
        ],
      },
      alle,
    );
    expect(md).toContain('Keine Datei');
    expect(md).toContain('ohne gültige Stufe 1');
  });

  it('macht aus einem Namen mit Sonderzeichen keinen Befehl', () => {
    const md = arbeitsliste(
      {
        pruefer: 'Eve"; rm -rf /',
        abschnitte: [
          { id: 'B-FV.BR.VERTAUSCHT', urteil: 'passt', fragenAbgehakt: 0, zeilenAbgehakt: 0 },
        ],
      },
      alle,
    );
    expect(md).toContain('--pruefer "Eve rm -rf"');
    expect(md).not.toMatch(/--pruefer "[^"\n]*;/);
  });
});
