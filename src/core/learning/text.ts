/**
 * Vorlagentexte füllen (INHALTSFORMAT §11): Platzhalter einsetzen, Zahlen
 * deutsch schreiben, **fett** und eine kleine Formel-Teilmenge zwischen $…$
 * (Hochzahl, Wurzel, Malpunkt) in Textteile zerlegen. Die Oberfläche setzt
 * die Teile nur noch zusammen – ohne HTML aus Inhalten (keine Einschleusung).
 */
import type { Bruch } from './bruch';
import type { Sprachobjekt, Wert } from './generator';
import { dezimalDeutsch, zahlDeutsch } from './format';

export type Textteil =
  | { readonly art: 'text'; readonly text: string; readonly fett: boolean }
  | {
      readonly art: 'bruch';
      readonly zaehler: string;
      readonly nenner: string;
      readonly fett: boolean;
    }
  /** Fachbegriff [[…]] – die Oberfläche zeigt auf Antippen die Erklärung (L-7) */
  | { readonly art: 'begriff'; readonly text: string; readonly fett: boolean }
  | { readonly art: 'hoch'; readonly text: string }
  | { readonly art: 'wurzel'; readonly text: string }
  /**
   * Formel in LaTeX-Schreibweise, die die eigene Teilmenge nicht kann (Klasse 9–12: Wurzel über
   * einem Term, Brüche mit Variablen, Vektoren, Integrale …). Die Oberfläche setzt sie mit KaTeX
   * (ARCHITEKTUR T-22); einfache Formeln der Klassen 5–8 bleiben bei der eigenen Teilmenge.
   */
  | { readonly art: 'formel'; readonly tex: string };

const istBruch = (w: Wert): w is Bruch => typeof w === 'object' && 'nenner' in w;
const istSprache = (w: Wert): w is Sprachobjekt => typeof w === 'object' && 'de' in w;

/** Zahl deutsch: ganze Zahlen gegliedert, sonst mit Komma. */
export const zahlText = (n: number) => (Number.isInteger(n) ? zahlDeutsch(n) : dezimalDeutsch(n));

function wertText(w: Wert): string {
  if (typeof w === 'number') return zahlText(w);
  if (istBruch(w)) return `${zahlText(w.zaehler)}/${zahlText(w.nenner)}`;
  if (istSprache(w)) return w.de;
  return '';
}

function holeWert(name: string, platzhalter: Readonly<Record<string, Wert>>): Wert {
  const w = platzhalter[name];
  if (w === undefined) throw new Error(`Platzhalter {${name}} fehlt`);
  return w;
}

/** Text außerhalb von Formeln: Platzhalter, **fett** und [[Fachbegriffe]]. */
function fliesstext(
  text: string,
  platzhalter: Readonly<Record<string, Wert>>,
  teile: Textteil[],
  fett: { an: boolean },
) {
  for (const m of text.matchAll(/\*\*|\{([a-z_]+)\}|\[\[([^\]]+)\]\]|[^*{[]+|[*{[]/g)) {
    if (m[0] === '**') {
      fett.an = !fett.an;
    } else if (m[2]) {
      teile.push({ art: 'begriff', text: m[2], fett: fett.an });
    } else if (m[1]) {
      const w = holeWert(m[1], platzhalter);
      // Brüche aus Platzhaltern setzt ebenfalls KaTeX (PV, 02.11.2026: jede Formel einheitlich)
      if (typeof w === 'object' && istBruch(w)) teile.push({ art: 'formel', tex: texWert(w) });
      else teile.push({ art: 'text', text: wertText(w), fett: fett.an });
    } else {
      teile.push({ art: 'text', text: m[0], fett: fett.an });
    }
  }
}

/**
 * Zahl in LaTeX-Schreibweise für KaTeX: Dezimalkomma als `{,}` (sonst setzt KaTeX ein
 * Leerzeichen dahinter), Tausendergliederung als `\,`, Minus als `-`.
 */
export function texZahl(n: number): string {
  return zahlText(n)
    .replace(/,(?=\d)/g, '{,}')
    .replace(/\u202f/g, '\\,')
    .replace(/−/g, '-');
}

/** Wert eines Platzhalters in einer Formel: Zahl und Bruch als LaTeX, Text unverändert. */
function texWert(w: Wert): string {
  if (typeof w === 'number') return texZahl(w);
  if (istBruch(w)) {
    const minus = w.zaehler < 0 !== w.nenner < 0 ? '-' : '';
    return `${minus}\\frac{${texZahl(Math.abs(w.zaehler))}}{${texZahl(Math.abs(w.nenner))}}`;
  }
  return wertText(w);
}

/**
 * Jede Formel wird mit `\displaystyle` gesetzt: Brüche erscheinen groß wie in einer eigenen
 * Zeile, in Hochzahlen werden sie trotzdem klein (PV, 02.11.2026: große Brüche).
 */
export const texAnzeige = (tex: string) => `\\displaystyle ${tex}`;

/**
 * Einstellungen für KaTeX, gleich in App, Werkzeugen und Tests (ARCHITEKTUR T-22):
 * keine Befehle mit Außenwirkung (`trust: false`), strenge Prüfung, begrenzte Makros.
 */
export const KATEX_OPTIONEN = {
  throwOnError: false,
  trust: false,
  strict: 'error',
  maxExpand: 100,
  maxSize: 10,
} as const;

/**
 * Platzhalter in einer Formel: `{name}`, aber nicht direkt hinter einem LaTeX-Befehl, einer
 * schließenden Klammer, `^` oder `_` – dort ist es eine LaTeX-Gruppe (`\vec{a}`,
 * `\binom{n}{k}`, `x^{n}`). Platzhalter in Gruppen mit Leerzeichen: `\sqrt{ {radikand} }`.
 */
const PLATZHALTER_IN_FORMEL = /(?<![\\a-zA-Z}^_])\{([a-z_]+)\}/g;

/**
 * Formel: Platzhalter einsetzen; gesetzt wird sie mit KaTeX (ARCHITEKTUR T-22). Seit 02.11.2026
 * gilt das für jede Formel, auch die einfachen der Klassen 5–8 (Entscheidung des PV).
 */
function formel(text: string, platzhalter: Readonly<Record<string, Wert>>, teile: Textteil[]) {
  const tex = text
    .replace(PLATZHALTER_IN_FORMEL, (_, n: string) => texWert(holeWert(n, platzhalter)))
    .trim();
  if (tex !== '') teile.push({ art: 'formel', tex });
}

export function fuelle(text: string, platzhalter: Readonly<Record<string, Wert>>): Textteil[] {
  const teile: Textteil[] = [];
  const fett = { an: false };
  text.split('$').forEach((stueck, i) => {
    if (i % 2 === 1) formel(stueck, platzhalter, teile);
    else fliesstext(stueck, platzhalter, teile, fett);
  });
  // Benachbarte gleichartige Textteile zusammenfassen
  const zusammen: Textteil[] = [];
  for (const t of teile) {
    const vorher = zusammen[zusammen.length - 1];
    if (t.art === 'text' && vorher?.art === 'text' && vorher.fett === t.fett)
      zusammen[zusammen.length - 1] = { ...vorher, text: vorher.text + t.text };
    else zusammen.push(t);
  }
  return zusammen.filter((t) => t.art !== 'text' || t.text !== '');
}

/** Nur der reine Text, z. B. für Screenreader-Beschriftungen. */
export function alsText(teile: readonly Textteil[]): string {
  return teile
    .map((t) =>
      t.art === 'bruch'
        ? `${t.zaehler}/${t.nenner}`
        : t.art === 'hoch'
          ? `^${t.text}`
          : t.art === 'wurzel'
            ? `√${t.text}`
            : t.art === 'formel'
              ? t.tex
              : t.text,
    )
    .join('');
}

/** Namen aller {platzhalter} in einem Text. */
export function platzhalterIn(text: string): string[] {
  return text
    .split('$')
    .flatMap((stueck, i) => [
      ...stueck.matchAll(i % 2 === 1 ? PLATZHALTER_IN_FORMEL : /\{([a-z_]+)\}/g),
    ])
    .map((m) => m[1] ?? '');
}
