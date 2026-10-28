// Hilfen nur für Tests: unabhängige Rechenwege für die Pflicht-Tests.

/** Wandelt angezeigten Text („3 482 · 6“) in Rechenzeichen um. */
function normalisiere(text: string): string {
  return text
    .replaceAll(String.fromCharCode(0x202f), '')
    .replaceAll('·', '*')
    .replaceAll('−', '-')
    .replaceAll(':', '/')
    .replaceAll(' ', '');
}

/**
 * Rechnet einen Term mit + − · : und Klammern aus (rekursiver Abstieg,
 * Punkt vor Strich, links nach rechts). Bewusst unabhängig vom Generator-Code.
 */
export function rechne(text: string): number {
  const s = normalisiere(text);
  let i = 0;
  const zahl = (): number => {
    if (s[i] === '(') {
      i++;
      const w = summe();
      i++; // ')'
      return w;
    }
    const start = i;
    while (i < s.length && /[0-9]/.test(s[i] ?? '')) i++;
    return Number(s.slice(start, i));
  };
  const produkt = (): number => {
    let w = zahl();
    while (s[i] === '*' || s[i] === '/') {
      const op = s[i++];
      const rechts = zahl();
      w = op === '*' ? w * rechts : w / rechts;
    }
    return w;
  };
  const summe = (): number => {
    let w = produkt();
    while (s[i] === '+' || s[i] === '-') {
      const op = s[i++];
      const rechts = produkt();
      w = op === '+' ? w + rechts : w - rechts;
    }
    return w;
  };
  return summe();
}

/** Setzt `wert` für die Variable ein und prüft „links ⋚ rechts“ (=, <). */
export function gilt(gleichung: string, variable: string, wert: number): boolean {
  const ersetzt = gleichung.replaceAll(variable, `(${wert})`);
  const [links, rechts] = ersetzt.split(/[=<]/);
  const l = rechne(links ?? '');
  const r = rechne(rechts ?? '');
  return ersetzt.includes('<') ? l < r : l === r;
}

/**
 * Rechner für Terme mit rationalen Zahlen (Klasse 7), bewusst unabhängig vom Generator-Code:
 * Zahlen mit Komma, −, +, ·, :, Klammern, ² und ³ (Hochzahl bindet stärker als das Minus davor).
 */
export function rechneRational(term: string): number {
  const t = term.replace(/\s/g, '').replaceAll(String.fromCharCode(0x202f), '');
  let i = 0;
  const zeichen = () => t[i];
  function zahlLesen(): number {
    const m = /^\d+(,\d+)?/.exec(t.slice(i));
    if (!m) throw new Error(`keine Zahl bei ${t.slice(i)}`);
    i += m[0].length;
    return Number(m[0].replace(',', '.'));
  }
  function grund(): number {
    let x: number;
    if (zeichen() === '(') {
      i++;
      x = summe();
      if (zeichen() !== ')') throw new Error('Klammer fehlt');
      i++;
    } else x = zahlLesen();
    while (zeichen() === '²' || zeichen() === '³') x = x ** (t[i++] === '²' ? 2 : 3);
    return x;
  }
  function vorzeichen(): number {
    if (zeichen() === '−') {
      i++;
      return -vorzeichen();
    }
    return grund();
  }
  function produkt(): number {
    let x = vorzeichen();
    while (zeichen() === '·' || zeichen() === ':') {
      const op = t[i++];
      const y = vorzeichen();
      x = op === '·' ? x * y : x / y;
    }
    return x;
  }
  function summe(): number {
    let x = produkt();
    while (zeichen() === '+' || zeichen() === '−') {
      const op = t[i++];
      const y = produkt();
      x = op === '+' ? x + y : x - y;
    }
    return x;
  }
  const x = summe();
  if (i !== t.length) throw new Error(`Rest: ${t.slice(i)}`);
  return x;
}
