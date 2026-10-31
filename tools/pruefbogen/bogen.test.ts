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

describe('Prüfbogen zum Ausfüllen', () => {
  const online = pruefbogen(eingabe, { form: 'online', name: 'Musterfeld Brüche' });
  const abschnitte = [
    ...online.matchAll(/<section class="[a-z]+ abschnitt" data-s="([^"]+)"/g),
  ].map((m) => m[1]);

  it('hat je Kompetenz, Fehlvorstellung und Vorlage einen Abschnitt mit Urteil, dazu die Begriffe', () => {
    const fvs = genannteFehlvorstellungen(eingabe).length;
    expect(abschnitte).toHaveLength(MUSTERFELD.length + fvs + eingabe.vorlagen.length + 1);
    for (const s of abschnitte) expect(online).toContain(`data-abschnitt="${s}"`);
  });

  it('gibt jedem Feld eine eindeutige ID, und jedes Feld gehört zu einem Abschnitt oder zum Kopf', () => {
    const ids = [...online.matchAll(/ id="([^"]+--[^"]+)"/g)].map((m) => m[1]);
    expect(new Set(ids).size).toBe(ids.length);
    const zu = new Set([...online.matchAll(/data-s="([^"]+)" data-f=/g)].map((m) => m[1]));
    for (const s of zu) expect(s === 'kopf' || abschnitte.includes(s)).toBe(true);
  });

  it('hat keine Kästchen zum Ausdrucken mehr und keine eigene Dokument-Hülle', () => {
    expect(online).not.toContain('☐');
    expect(online).not.toMatch(/<!doctype|<body/i);
    expect(online.startsWith('<title>Prüfbogen Musterfeld Brüche</title>')).toBe(true);
  });

  it('nutzt nur gültige Pfade für die Datenbank', () => {
    for (const s of abschnitte) expect(s).toMatch(/^[A-Za-z0-9_\-.~:@+]{1,200}$/);
  });
});
