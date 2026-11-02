// KaTeX erst laden, wenn eine Formel es braucht (ARCHITEKTUR T-22): nicht in der App-Hülle,
// kommt mit der ersten Formel ab Klasse 9. Skript, CSS und Schriften liegen im eigenen Build
// und im Offline-Speicher, kein Netz.
import type katexTyp from 'katex';
import { KATEX_OPTIONEN, texAnzeige } from '../../core/learning/text';

let laden: Promise<typeof katexTyp> | undefined;

export function katexLaden(): Promise<typeof katexTyp> {
  laden ??= Promise.all([import('katex'), import('katex/dist/katex.min.css')]).then(
    ([m]) => m.default,
  );
  return laden;
}

/**
 * HTML für eine Formel. Einzige Stelle, an der die Oberfläche fertiges HTML einsetzt: Es kommt
 * nur aus KaTeX selbst, mit `trust: false` (keine Links, keine Attribute aus Inhalten).
 * Ausgabe mit MathML, damit die Vorlese-Funktion die Formel liest.
 */
export function formelHtml(k: typeof katexTyp, tex: string): string {
  return k.renderToString(texAnzeige(tex), { ...KATEX_OPTIONEN, output: 'htmlAndMathml' });
}
