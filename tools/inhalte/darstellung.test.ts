// Probelauf für die Anzeige: Was ein Kind liest, enthält keine Formelzeichen mehr.
// Aufgabentext und Antwortmöglichkeiten laufen durch `fuelle` (Formel-Teilmenge,
// INHALTSFORMAT §11); der Lösungsweg wird als reiner Text gezeigt und darf darum keine
// Formel enthalten. Seit KaTeX (ARCHITEKTUR T-22) und der Entscheidung des PV vom 02.11.2026
// setzt KaTeX jede Formel, auch in Klasse 5–8; jede muss streng fehlerfrei setzbar sein.
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import katex from 'katex';
import { describe, expect, it } from 'vitest';
import { generatoren } from '../../src/generators/alle';
import {
  alsText,
  fuelle,
  KATEX_OPTIONEN,
  texAnzeige,
  type Textteil,
} from '../../src/core/learning/text';
import { pruefeInhalte } from './pruefen';

const { vorlagen } = pruefeInhalte('content', generatoren);
const ROH = /\$|\\(frac|sqrt|cdot)/;

/** KaTeX setzt die Formel ohne Fehler (streng, wie in der App). */
function setzbar(tex: string) {
  expect(
    () => katex.renderToString(texAnzeige(tex), { ...KATEX_OPTIONEN, throwOnError: true }),
    tex,
  ).not.toThrow();
}

function pruefeTeile(teile: readonly Textteil[], wo: string) {
  const ohneFormel = teile.filter((t) => t.art !== 'formel');
  expect(alsText(ohneFormel), wo).not.toMatch(ROH);
  for (const t of teile) if (t.art === 'formel') setzbar(t.tex);
}

describe('Anzeige mit allen Vorlagen', () => {
  for (const v of vorlagen) {
    it(v.id, () => {
      const g = generatoren.get(v.generator);
      for (const niveau of v.niveaus) {
        for (let seed = 0; seed < 30; seed++) {
          const i = g?.erzeuge(seed, v.parameter[niveau]);
          if (!i) continue;
          const wo = `${niveau} Seed ${seed}`;
          pruefeTeile(fuelle(v.text.aufgabe.de, i.platzhalter), wo);
          for (const o of i.optionen ?? []) if (o.text) pruefeTeile(fuelle(o.text.de, {}), wo);
          for (const s of i.loesungsweg) expect(s.de, `${wo} Lösungsweg`).not.toMatch(ROH);
        }
      }
    });
  }
});

function* yamlDateien(ordner: string): Generator<string> {
  for (const n of readdirSync(ordner)) {
    const p = join(ordner, n);
    if (statSync(p).isDirectory()) yield* yamlDateien(p);
    else if (p.endsWith('.yaml')) yield p;
  }
}

describe('Formeln in Inhaltsdateien (Erstvermittlung, Fehlerkatalog, Begriffe)', () => {
  it('jede Formel setzt KaTeX fehlerfrei', () => {
    for (const datei of yamlDateien('content'))
      for (const m of readFileSync(datei, 'utf8').matchAll(/\$([^$\n]+)\$/g)) {
        setzbar((m[1] ?? '').replace(/(?<![\\a-zA-Z}^_])\{([a-z_]+)\}/g, '1'));
      }
  });
});

describe('KaTeX-Einstellungen (T-22)', () => {
  it('setzt Formeln aus Klasse 9–12', () => {
    for (const tex of [
      '\\sqrt{x+1} = 5',
      'x_{1,2} = -\\frac{p}{2} \\pm \\sqrt{\\left(\\frac{p}{2}\\right)^2 - q}',
      '\\int_0^2 x^2\\,dx',
      '\\vec{x} = \\begin{pmatrix}1\\\\2\\\\3\\end{pmatrix} + t\\cdot\\begin{pmatrix}2\\\\0\\\\-1\\end{pmatrix}',
      'P(X=k) = \\binom{n}{k}\\, p^k (1-p)^{n-k}',
      '\\lim_{x\\to\\infty}\\frac{1}{x} = 0',
    ])
      setzbar(tex);
  });

  it('lässt keine Befehle mit Außenwirkung durch', () => {
    const html = katex.renderToString('\\href{https://example.org}{x}', KATEX_OPTIONEN);
    expect(html).not.toContain('href="https://example.org"');
    const html2 = katex.renderToString('\\htmlId{x}{y}', KATEX_OPTIONEN);
    expect(html2).not.toContain('id="x"');
  });
});
