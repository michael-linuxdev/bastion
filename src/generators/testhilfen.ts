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
