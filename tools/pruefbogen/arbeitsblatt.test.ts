import { describe, expect, it } from 'vitest';
import { eingabeAusInhalten } from './aus-inhalten';
import { arbeitsblatt, blattStufe, passendeVorlagen, STUFEN_TEXT, ziehe } from './arbeitsblatt';

const MUSTERFELD = ['M.ZO.BR.BEGRIFF', 'M.ZO.BR.ERWEITERN', 'M.ZO.BR.ADD-SUB'];
const eingabe = eingabeAusInhalten('content', MUSTERFELD, '');
const optionen = { niveau: 'G', anzahl: 12, seed: 7 } as const;
const html = arbeitsblatt(eingabe, optionen);

describe('Arbeitsblatt', () => {
  it('ergibt mit gleichem Seed dasselbe Blatt, mit anderem Seed ein anderes', () => {
    expect(arbeitsblatt(eingabe, optionen)).toBe(html);
    expect(arbeitsblatt(eingabe, { ...optionen, seed: 8 })).not.toBe(html);
  });

  it('hat genau die gewünschte Zahl Aufgaben, jede mit Rechenplatz und Lösung', () => {
    expect(html.match(/<section class="aufgabe">/g)).toHaveLength(12);
    expect(html.match(/<div class="rechnen/g)).toHaveLength(12);
    expect(html.match(/<div class="loesung">/g)).toHaveLength(12);
  });

  it('nimmt jede passende Vorlage gleich oft und keine Aufgabe doppelt', () => {
    const aufgaben = ziehe(eingabe, optionen);
    const vorlagen = passendeVorlagen(eingabe, 'G');
    const je = new Map<string, number>();
    for (const a of aufgaben) je.set(a.vorlage.id, (je.get(a.vorlage.id) ?? 0) + 1);
    expect(je.size).toBe(vorlagen.length);
    const zahlen = [...je.values()];
    expect(Math.max(...zahlen) - Math.min(...zahlen)).toBeLessThanOrEqual(1);
    const fragen = html.match(/<section class="aufgabe">.*?<\/section>/gs) ?? [];
    expect(new Set(fragen).size).toBe(fragen.length);
  });

  it('hat Kopf mit Name, Datum und Thema und eine eigene Lösungsseite', () => {
    expect(html).toContain('Name:');
    expect(html).toContain('Datum:');
    expect(html).toContain('<h1>Brüche als Anteile');
    expect(html).toContain('<main class="blatt loesungen">');
    expect(html).toContain('.loesungen { break-before: page; }');
  });

  it('setzt Brüche wie in der App und lässt keinen Platzhalter oder Fachbegriff offen', () => {
    expect(html).toMatch(/<span class="br"><span>\d+<\/span><span>\d+<\/span><\/span>/);
    expect(html).not.toMatch(/\{[a-z_]+\}|\[\[|‹/);
  });

  it('nennt in der Fußzeile die schwächste Review-Stufe der Vorlagen', () => {
    const stufe = blattStufe(ziehe(eingabe, optionen));
    expect(html).toContain(`${STUFEN_TEXT[stufe]} (Review-Stufe ${stufe})`);
    expect(STUFEN_TEXT[0]).toBe('Entwurf, nicht fachlich geprüft');
    expect(blattStufe([])).toBe(0);
  });

  it('meldet Kompetenzen ohne Aufgaben auf dem Niveau', () => {
    expect(() => arbeitsblatt(eingabe, { ...optionen, niveau: 'E' })).toThrow(/Niveau E/);
  });
});
