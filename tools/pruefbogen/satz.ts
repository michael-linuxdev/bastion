// Gemeinsamer Satz für Prüfbogen und Arbeitsblatt: Texte wie in der App (Brüche, Hochzahlen,
// Wurzeln aus src/core/learning/text.ts, Formeln mit KaTeX) als HTML, Lösungen als Text und die Grund-Stile.
import type { Instanz, Loesung, Wert } from '../../src/core/learning/generator';
import { loesungAlsText } from '../../src/core/learning/arbeitsblatt';
import katex from 'katex';
import { fuelle, KATEX_OPTIONEN, texAnzeige, type Textteil } from '../../src/core/learning/text';
import { alsFormeln } from '../../src/core/learning/rechenausdruck';
import { esc } from './html';

export function teileHtml(teile: readonly Textteil[]): string {
  return teile
    .map((t) => {
      const mathml = (tex: string) =>
        katex.renderToString(texAnzeige(tex), { ...KATEX_OPTIONEN, output: 'mathml' });
      if (t.art === 'bruch') return mathml(`\\frac{${t.zaehler}}{${t.nenner}}`);
      if (t.art === 'hoch') return `<sup>${esc(t.text)}</sup>`;
      if (t.art === 'wurzel') return `√<span class="ueber">${esc(t.text)}</span>`;
      // Formeln (T-22): als MathML, das der Browser selbst setzt – ohne CSS und Schriften
      if (t.art === 'formel') return mathml(t.tex);
      const inhalt = t.art === 'begriff' ? `<u>${esc(t.text)}</u>` : esc(t.text);
      return t.fett ? `<b>${inhalt}</b>` : inhalt;
    })
    .join('');
}

/** Platzhalter ohne Wert als ‹name› schreiben – nur außerhalb von Formeln (dort ist `{…}` LaTeX). */
const platzhalterOhneWert = (s: string, platzhalter: Readonly<Record<string, Wert>>) =>
  s
    .split('$')
    .map((stueck, i) =>
      i % 2 === 1
        ? stueck
        : stueck.replace(/\{([a-z_]+)\}/g, (m, name: string) =>
            name in platzhalter ? m : `‹${name}›`,
          ),
    )
    .join('$');

/** Text füllen; Platzhalter ohne Wert (Rückmeldungen ohne konkrete Aufgabe) bleiben als ‹name›. */
export const text = (s: string, platzhalter: Readonly<Record<string, Wert>> = {}) =>
  teileHtml(fuelle(platzhalterOhneWert(s, platzhalter), platzhalter));

/** Lösung für HTML; die Regel steht im Kern (`loesungAlsText`), Rechenausdrücke als Formel. */
export const loesungText = (l: Loesung, optionen?: Instanz['optionen']): string =>
  text(alsFormeln(loesungAlsText(l, optionen)));

/** Seite, Schrift und Brüche; beide Werkzeuge setzen ihre eigenen Stile dahinter. */
export const GRUND_STIL = `
:root { color-scheme: light; }
body { font: 11pt/1.4 system-ui, sans-serif; color: #111; background: #fff; max-inline-size: 48rem; margin-inline: auto; padding: 1rem; }
.br { display: inline-flex; flex-direction: column; vertical-align: middle; text-align: center; font-size: 9pt; line-height: 1.1; }
.br > span:first-child { border-block-end: 1px solid currentcolor; }
.ueber { text-decoration: overline; }
`;
