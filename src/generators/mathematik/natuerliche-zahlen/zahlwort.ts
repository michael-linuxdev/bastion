/**
 * Deutsche Zahlwörter für natürliche Zahlen bis 999 999 999 999.
 * Rechtschreibung: alles unter einer Million in einem Wort klein
 * („dreihundertvierzigtausendfünf“), Million und Milliarde als eigene
 * Wörter groß („drei Millionen vierhunderttausendfünf“).
 */
const EINER = ['', 'ein', 'zwei', 'drei', 'vier', 'fünf', 'sechs', 'sieben', 'acht', 'neun'];
const ZEHN_BIS_NEUNZEHN = [
  'zehn',
  'elf',
  'zwölf',
  'dreizehn',
  'vierzehn',
  'fünfzehn',
  'sechzehn',
  'siebzehn',
  'achtzehn',
  'neunzehn',
];
const ZEHNER = [
  '',
  '',
  'zwanzig',
  'dreißig',
  'vierzig',
  'fünfzig',
  'sechzig',
  'siebzig',
  'achtzig',
  'neunzig',
];

export const ZAHLWORT_MAX = 999_999_999_999;

/** 0 … 99; `alleinstehend` = am Wortende („eins“ statt „ein“). */
function unter100(n: number, alleinstehend: boolean): string {
  if (n === 0) return '';
  if (n === 1) return alleinstehend ? 'eins' : 'ein';
  if (n < 10) return EINER[n] ?? '';
  if (n < 20) return ZEHN_BIS_NEUNZEHN[n - 10] ?? '';
  const e = n % 10;
  const z = ZEHNER[Math.floor(n / 10)] ?? '';
  return e === 0 ? z : `${EINER[e] ?? ''}und${z}`;
}

function unter1000(n: number, alleinstehend: boolean): string {
  const h = Math.floor(n / 100);
  return (h > 0 ? `${EINER[h] ?? ''}hundert` : '') + unter100(n % 100, alleinstehend);
}

/** Großes Zahlwort (Million, Milliarde): Anzahl darf nicht auf …01 enden, außer genau 1. */
function gross(anzahl: number, einzahl: string, mehrzahl: string): string {
  if (anzahl === 1) return `eine ${einzahl}`;
  if (anzahl % 100 === 1) {
    // „zweihunderteine Millionen“ – Grammatik umstritten; Generatoren meiden diese Zahlen.
    throw new RangeError(`Zahlwort für ${anzahl} ${mehrzahl} wird nicht gebildet`);
  }
  return `${unter1000(anzahl, false)} ${mehrzahl}`;
}

/** true, wenn `zahlwort` für n ein eindeutiges Wort bildet (siehe `gross`). */
export function zahlwortMoeglich(n: number): boolean {
  const mrd = Math.floor(n / 1e9);
  const mio = Math.floor(n / 1e6) % 1000;
  return (
    Number.isSafeInteger(n) &&
    n >= 0 &&
    n <= ZAHLWORT_MAX &&
    !(mrd > 1 && mrd % 100 === 1) &&
    !(mio > 1 && mio % 100 === 1)
  );
}

export function zahlwort(n: number): string {
  if (!Number.isSafeInteger(n) || n < 0 || n > ZAHLWORT_MAX) {
    throw new RangeError(`zahlwort: ${n} liegt nicht in 0 … ${ZAHLWORT_MAX}`);
  }
  if (n === 0) return 'null';
  const mrd = Math.floor(n / 1e9);
  const mio = Math.floor(n / 1e6) % 1000;
  const tsd = Math.floor(n / 1000) % 1000;
  const rest = n % 1000;

  const teile: string[] = [];
  if (mrd > 0) teile.push(gross(mrd, 'Milliarde', 'Milliarden'));
  if (mio > 0) teile.push(gross(mio, 'Million', 'Millionen'));
  const klein = (tsd > 0 ? `${unter1000(tsd, false)}tausend` : '') + unter1000(rest, true);
  if (klein) teile.push(klein);
  return teile.join(' ');
}
