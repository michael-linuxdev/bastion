import { describe, expect, it } from 'vitest';
import { eingabeAusInhalten } from './aus-inhalten';
import { genannteFehlvorstellungen, pruefbogen, werkzeugBild } from './bogen';

const MUSTERFELD = ['M.ZO.BR.BEGRIFF', 'M.ZO.BR.ERWEITERN', 'M.ZO.BR.ADD-SUB'];
const eingabe = eingabeAusInhalten('content', MUSTERFELD, '2026-10-30', 3);
const html = pruefbogen(eingabe);

describe('Prüfbogen', () => {
  it('enthält jeden Schritt jeder Erstvermittlung', () => {
    for (const id of MUSTERFELD)
      for (const s of eingabe.vermittlungen.get(id)?.schritte ?? [])
        expect(html).toContain(s.text.de.replace(/\[\[([^\]]+)\]\]/g, '<u>$1</u>').split('**')[0]);
  });

  it('nennt die zehn Fehlvorstellungen des Musterfelds mit Abschnitt', () => {
    const ids = genannteFehlvorstellungen(eingabe);
    expect(ids).toHaveLength(10);
    for (const id of ids) expect(html).toContain(`id="${id}"`);
  });

  it('zeigt je Vorlage und Niveau die gewünschte Zahl Beispielaufgaben', () => {
    const tabellen = html.match(/<table class="stichprobe">.*?<\/table>/gs) ?? [];
    const niveaus = eingabe.vorlagen.reduce((n, v) => n + v.niveaus.length, 0);
    expect(tabellen).toHaveLength(niveaus);
    for (const t of tabellen) expect(t.match(/<tr><td class="nr">/g)).toHaveLength(3);
  });

  it('lässt keinen Platzhalter und keine Markierung offen', () => {
    expect(html).not.toMatch(/\{[a-z_]+\}|\[\[/);
  });

  it('ist bei gleicher Eingabe gleich', () => {
    expect(pruefbogen(eingabe)).toBe(html);
  });

  it('übernimmt keinen Text als HTML', () => {
    const bild = werkzeugBild({ werkzeug: '<script>', parameter: {} });
    expect(bild).not.toContain('<script>');
  });
});
