/**
 * Rechenausdrücke in Generator-Texten als Formel schreiben (PV, 02.11.2026: jede Formel mit
 * KaTeX). Lösungswege, Antwortmöglichkeiten und Antworten kommen aus den Generatoren als
 * einfacher Text: „3/4 + 1/4 = 1“, „√(9 + 16) = 5“, „x²“, „0,91̅6̅“. `alsFormeln` findet solche
 * Ausdrücke und schreibt sie als `$…$` in LaTeX, `fuelle` macht daraus Formel-Textteile.
 *
 * Warum bei der Anzeige und nicht im Generator: Die Aufgaben bleiben gleich, also bleiben
 * Generator-Versionen, Hashes und Prüfstufen der Vorlagen erhalten (INHALTSFORMAT §6, §8),
 * und auch früher gespeicherte Aufgaben erscheinen in der neuen Schreibweise.
 *
 * Erkannt wird nur, was eindeutig Mathematik ist: ein Bruchstrich zwischen Zahlen oder
 * Klammern, ein Wurzelzeichen, eine hochgestellte Ziffer oder ein Periodenstrich. Eine Kette
 * aus solchen Ausdrücken, Zahlen und einzelnen Variablen, verbunden durch Rechenzeichen mit
 * Leerzeichen (` + `, ` = ` …) oder einen Malpunkt, wird eine einzige Formel.
 */

const HOCH = '⁰¹²³⁴⁵⁶⁷⁸⁹';
const PERIODE = '̅';
const ZAHL = `\\d+(?:\\u202f\\d{3})*(?:,(?:\\d${PERIODE}?)+)?`;
/**
 * Einzelner Buchstabe als Variable: nicht Teil eines Wortes, keine Funktion wie f(x) und keine
 * Einheit: weder hinter einer Zahl („15 m³“) noch m² oder m³ („Berechne in m²“).
 */
const VARIABLE = `(?<![\\p{L}\\d'’])(?<![\\d)] +)(?!m[²³])[a-z](?![\\p{L}'’(])`;
/** Lücke in einer Aufgabe wie „(x + 1)² = x² + 2·x + ☐“ */
const LUECKE = '☐';
const KLAMMER = `\\((?:[^()]|\\([^()]*\\))*\\)`;
const EINHEIT = `(?:[${HOCH}]*√−?)?(?:${ZAHL}|${VARIABLE}|${KLAMMER}|${LUECKE})[${HOCH}]*`;
const TERM = `−?${EINHEIT}(?:\\/${EINHEIT})?(?: ?%|°)?`;
const ZEICHEN = '[+−·:=<>≈≤≥≠]';
const VERBINDUNG = `(?: ${ZEICHEN} |·)`;
const KETTE = new RegExp(`(?<![\\p{L}\\d,/])${TERM}(?:${VERBINDUNG}${TERM})*`, 'gu');
/** Nur diese Zeichen machen aus einer Kette eine Formel */
const MERKMAL = new RegExp(`[0-9)]\\/[0-9(√]|√|[${HOCH}]|${PERIODE}`, 'u');

const TEX_ZEICHEN: Record<string, string> = {
  '+': '+',
  '−': '-',
  '·': '\\cdot',
  ':': ':',
  '=': '=',
  '<': '<',
  '>': '>',
  '≈': '\\approx',
  '≤': '\\leq',
  '≥': '\\geq',
  '≠': '\\neq',
};

const hoch = (s: string) => [...s].map((z) => HOCH.indexOf(z)).join('');

/** Zahl als LaTeX: Komma `{,}`, Tausender `\,`, Periode `\overline{…}` */
function texZahl(zahl: string): string {
  const [ganz = '', nach] = zahl.split(',');
  const vorne = ganz.replace(/\u202f/g, '\\,');
  if (nach === undefined) return vorne;
  const stellen = nach.replace(
    new RegExp(`(?:\\d${PERIODE})+`, 'g'),
    (p) => `\\overline{${p.replace(new RegExp(PERIODE, 'g'), '')}}`,
  );
  return `${vorne}{,}${stellen}`;
}

/** Eine Einheit (Zahl, Variable, Klammer, mit Wurzel und Hochzahl) als LaTeX. */
function texEinheit(e: string): string {
  const m = new RegExp(`^(?:([${HOCH}]*)√(−?))?(.*?)([${HOCH}]*)$`, 'u').exec(e);
  const [, wurzel, minus = '', kern = '', exponent = ''] = m ?? [];
  const innen = kern.startsWith('(')
    ? `(${texAusdruck(kern.slice(1, -1))})`
    : kern === LUECKE
      ? '\\square'
      : texZahl(kern);
  let tex = innen;
  if (wurzel !== undefined) {
    const index = hoch(wurzel);
    const radikand = `${minus ? '-' : ''}${kern.startsWith('(') ? texAusdruck(kern.slice(1, -1)) : innen}`;
    tex = `\\sqrt${index ? `[${index}]` : ''}{${radikand}}`;
  }
  return exponent ? `${tex}^{${hoch(exponent)}}` : tex;
}

/** Zähler oder Nenner: Klammern fallen weg, der Bruchstrich gruppiert schon. */
const bruchteil = (e: string) =>
  new RegExp(`^${KLAMMER}$`).test(e) ? texAusdruck(e.slice(1, -1)) : texEinheit(e);

const TERM_TEILE = new RegExp(`^(−?)(${EINHEIT})(?:\\/(${EINHEIT}))?( ?%|°)?$`, 'u');

function texTerm(t: string): string {
  const m = TERM_TEILE.exec(t);
  if (!m) return t;
  const [, minus = '', oben = '', unten, zusatz] = m;
  const kern =
    unten === undefined ? texEinheit(oben) : `\\frac{${bruchteil(oben)}}{${bruchteil(unten)}}`;
  const ende = zusatz === undefined ? '' : zusatz.includes('%') ? '\\,\\%' : '^{\\circ}';
  return `${minus ? '-' : ''}${kern}${ende}`;
}

/** Inhalt einer Kette (oder einer Klammer) als LaTeX. */
function texAusdruck(s: string): string {
  // An Rechenzeichen außerhalb von Klammern trennen
  const teile: string[] = [];
  const zeichen: string[] = [];
  let tiefe = 0;
  let anfang = 0;
  for (let i = 0; i < s.length; i++) {
    const z = s[i] ?? '';
    if (z === '(') tiefe++;
    else if (z === ')') tiefe--;
    else if (tiefe === 0 && z in TEX_ZEICHEN) {
      const mitLeer = s[i - 1] === ' ' && s[i + 1] === ' ';
      if (!mitLeer && z !== '·') continue;
      teile.push(s.slice(anfang, mitLeer ? i - 1 : i));
      zeichen.push(TEX_ZEICHEN[z] ?? z);
      anfang = mitLeer ? i + 2 : i + 1;
      if (mitLeer) i++;
    }
  }
  teile.push(s.slice(anfang));
  return teile.map((t, i) => (i === 0 ? '' : ` ${zeichen[i - 1]} `) + texTerm(t)).join('');
}

/** Rechenausdrücke außerhalb vorhandener Formeln als `$…$` schreiben. */
export function alsFormeln(text: string): string {
  return text
    .split('$')
    .map((stueck, i) =>
      i % 2 === 1
        ? `$${stueck}$`
        : stueck.replace(KETTE, (kette) =>
            MERKMAL.test(kette) ? `$${texAusdruck(kette)}$` : kette,
          ),
    )
    .join('');
}
