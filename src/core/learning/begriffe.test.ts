import { describe, expect, it } from 'vitest';
import { begriffskarte, fundstellen, markiere, unmarkiert, type Begriff } from './begriffe';
import { alsText, fuelle } from './text';

const b = (id: string, formen: string[]): Begriff => ({
  id,
  wort: { de: formen[0] ?? id },
  formen,
  erklaerung: { de: `Erklärung ${id}` },
});
const karte = begriffskarte([
  b('nenner', ['Nenner']),
  b('winkel', ['Winkel']),
  b('rechter-winkel', ['rechten Winkel']),
  b('teilbar', ['teilbar']),
]);

describe('Fachbegriffe in Texten', () => {
  it('findet ganze Wörter, längste Form zuerst, nicht in Platzhaltern und Formeln', () => {
    const f = fundstellen(
      'Der Nenner {nenner} ist teilbar; Scheitelwinkel, $Winkel$ und ein rechten Winkel. Winkel!',
      karte,
    );
    expect(f.map((x) => [x.form, x.begriff?.id, x.markiert])).toEqual([
      ['Nenner', 'nenner', false],
      ['teilbar', 'teilbar', false],
      ['rechten Winkel', 'rechter-winkel', false],
      ['Winkel', 'winkel', false],
    ]);
  });
  it('verlangt die Markierung beim ersten Vorkommen je Text (L-7)', () => {
    expect(unmarkiert('[[Nenner]] und Nenner', karte)).toEqual([]);
    expect(unmarkiert('Nenner und [[Nenner]]', karte).map((f) => f.form)).toEqual(['Nenner']);
    expect(markiere('**Kürze**: Nenner und Nenner sind teilbar.', karte)).toBe(
      '**Kürze**: [[Nenner]] und Nenner sind [[teilbar]].',
    );
    // Markieren ist idempotent
    const einmal = markiere('Der Nenner ist teilbar.', karte);
    expect(markiere(einmal, karte)).toBe(einmal);
  });
  it('erkennt unbekannte Markierungen', () => {
    expect(fundstellen('[[Zähler]]', karte)[0]?.begriff).toBeUndefined();
  });
  it('wird zum Textteil „begriff“, auch fett', () => {
    expect(fuelle('Der [[Nenner]] ist **[[teilbar]]**.', {})).toEqual([
      { art: 'text', text: 'Der ', fett: false },
      { art: 'begriff', text: 'Nenner', fett: false },
      { art: 'text', text: ' ist ', fett: false },
      { art: 'begriff', text: 'teilbar', fett: true },
      { art: 'text', text: '.', fett: false },
    ]);
    expect(alsText(fuelle('Der [[Nenner]].', {}))).toBe('Der Nenner.');
  });
});
