// Probelauf für die Anzeige: Was ein Kind liest, enthält keine Formelzeichen mehr.
// Aufgabentext, Antwortmöglichkeiten und Lösungsweg laufen durch `fuelle` (INHALTSFORMAT §11),
// Texte aus Generatoren vorher durch `alsFormeln` (Rechenausdrücke werden Formeln). Seit KaTeX
// (ARCHITEKTUR T-22) und der Entscheidung des PV vom 02.11.2026 setzt KaTeX jede Formel, auch in
// Klasse 5–8; jede muss streng fehlerfrei setzbar sein.
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import katex from 'katex';
import { parse } from 'yaml';
import { describe, expect, it } from 'vitest';
import { generatoren } from '../../src/generators/alle';
import {
  alsText,
  fuelle,
  KATEX_OPTIONEN,
  texAnzeige,
  type Textteil,
} from '../../src/core/learning/text';
import { alsFormeln } from '../../src/core/learning/rechenausdruck';
import { antwortText } from '../../src/core/learning/werkstatt';
import { pruefeInhalte } from './pruefen';

const { vorlagen } = pruefeInhalte('content', generatoren);
const ROH = /\$|\\(frac|sqrt|cdot)/;
/** Dazu Rechenausdrücke aus Generatoren, die keine Formel geworden sind (Einheiten wie m³ erlaubt) */
const ROH_GENERATOR =
  /\$|\\(frac|sqrt|cdot)|\d\/\d|√|[\d)][⁰¹²³⁴⁵⁶⁷⁸⁹]|(?<![\p{L}])(?<![\d)] +)(?!m[²³])[a-z][⁰¹²³⁴⁵⁶⁷⁸⁹]|\u0305/u;

/** KaTeX setzt die Formel ohne Fehler (streng, wie in der App). */
function setzbar(tex: string) {
  expect(
    () => katex.renderToString(texAnzeige(tex), { ...KATEX_OPTIONEN, throwOnError: true }),
    tex,
  ).not.toThrow();
}

function pruefeTeile(teile: readonly Textteil[], wo: string, roh = ROH) {
  const ohneFormel = teile.filter((t) => t.art !== 'formel');
  expect(alsText(ohneFormel), wo).not.toMatch(roh);
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
          pruefeTeile(fuelle(v.text.aufgabe.de, i.platzhalter), wo, ROH_GENERATOR);
          for (const o of i.optionen ?? [])
            if (o.text)
              pruefeTeile(fuelle(alsFormeln(o.text.de), {}), `${wo} Option`, ROH_GENERATOR);
          for (const s of i.loesungsweg)
            pruefeTeile(fuelle(alsFormeln(s.de), i.platzhalter), `${wo} Lösungsweg`, ROH_GENERATOR);
          const antwort = antwortText(i.loesung, i.optionen);
          pruefeTeile(fuelle(alsFormeln(antwort), {}), `${wo} Antwort`, ROH_GENERATOR);
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

/** Alle `de`-Texte einer YAML-Datei (rekursiv) */
function* deTexte(wert: unknown): Generator<string> {
  if (Array.isArray(wert)) for (const w of wert) yield* deTexte(w);
  else if (wert && typeof wert === 'object')
    for (const [k, w] of Object.entries(wert)) {
      if (k === 'de' && typeof w === 'string') yield w;
      else yield* deTexte(w);
    }
}

describe('Texte in Inhaltsdateien (Hilfen, Rückmeldungen, Erstvermittlung, Fehlerkatalog)', () => {
  it('Rechenausdrücke erscheinen als Formel, nie als roher Text', () => {
    const funde: string[] = [];
    for (const datei of yamlDateien('content')) {
      if (/(kompetenz|begriffe)\.yaml$/.test(datei)) continue;
      for (const text of deTexte(parse(readFileSync(datei, 'utf8')))) {
        // Platzhalter durch eine Zahl ersetzen: geprüft wird nur, was der Text selbst schreibt
        const ohne = text
          .split('$')
          .map((t, i) =>
            t.replace(i % 2 === 1 ? /(?<![\\a-zA-Z}\]^_])\{([a-z_]+)\}/g : /\{([a-z_]+)\}/g, '1'),
          )
          .join('$');
        const teile = fuelle(ohne, {});
        for (const t of teile) if (t.art === 'formel') setzbar(t.tex);
        const rest = alsText(teile.filter((t) => t.art !== 'formel'));
        const m = ROH_GENERATOR.exec(rest);
        if (m) funde.push(`${datei}: …${rest.slice(Math.max(0, m.index - 30), m.index + 20)}…`);
      }
    }
    expect(funde).toEqual([]);
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
