import katex from 'katex';
import { describe, expect, it } from 'vitest';
import { formelHtml } from './formel';

describe('Formel mit KaTeX (T-22)', () => {
  it('liefert sichtbaren Satz und MathML für die Vorlese-Funktion', () => {
    const html = formelHtml(katex, '\\sqrt{x+1} = 5');
    expect(html).toContain('class="katex"');
    expect(html).toContain('<math');
    expect(html).toContain('<msqrt>');
  });

  it('kaputtes LaTeX wirft nicht, sondern zeigt den Fehler an der Stelle', () => {
    expect(() => formelHtml(katex, '\\frac{1}{')).not.toThrow();
  });

  it('keine Links oder Attribute aus Inhalten', () => {
    const html = formelHtml(katex, '\\href{javascript:alert(1)}{x}\\htmlClass{boese}{y}');
    // abgelehnt und nur als Text gezeigt: kein Link, keine fremde Klasse
    expect(html).not.toMatch(/<a[\s>]|href=/);
    expect(html).not.toContain('class="boese"');
    expect(html).toContain('katex-error');
  });
});
