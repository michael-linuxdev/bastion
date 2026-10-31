/**
 * Eigene Tastatur für Zahlen und Terme (INHALTSFORMAT §5.2): welche Tasten eine
 * Aufgabe zeigt. Die Instanz gewinnt, wenn sie etwas sagt; sonst gilt die Vorlage;
 * sonst der Aufgabentyp. Eine Instanz mit `vorzeichen` bekommt immer die Minustaste.
 *
 * Rein: Die Oberfläche zeichnet nur noch den Tastensatz.
 */

/** Eine Angabe in `tastatur:` der Vorlage oder der Instanz */
export type Taste =
  | 'ziffern'
  | 'komma'
  | 'minus'
  | 'bruchstrich'
  | { readonly variable: string }
  | { readonly einheit: string };

export interface Tastensatz {
  readonly ziffern: boolean;
  readonly komma: boolean;
  readonly minus: boolean;
  readonly bruchstrich: boolean;
  readonly variablen: readonly string[];
  readonly einheiten: readonly string[];
}

const EINFACH = ['ziffern', 'komma', 'minus', 'bruchstrich'] as const;

const istObjekt = (x: unknown): x is Record<string, unknown> =>
  typeof x === 'object' && x !== null && !Array.isArray(x);

/** Eine Variable ist ein Buchstabe; eine Einheit kurz und ohne Leerzeichen. */
const VARIABLE = /^\p{L}$/u;
const EINHEIT = /^[\p{L}µ°²³/€%]{1,6}$/u;

/** Form von `tastatur:` prüfen. Fehlt das Feld, ist das in Ordnung. */
export function pruefeTastatur(roh: unknown): string[] {
  if (roh === undefined) return [];
  if (!Array.isArray(roh) || roh.length === 0)
    return ['tastatur: Liste mit mindestens einer Taste'];
  const f: string[] = [];
  const gesehen = new Set<string>();
  roh.forEach((t: unknown, i) => {
    const schluessel = JSON.stringify(t);
    if (gesehen.has(schluessel)) f.push(`tastatur[${i}]: doppelt`);
    gesehen.add(schluessel);
    if (typeof t === 'string') {
      if (!EINFACH.includes(t as (typeof EINFACH)[number]))
        f.push(`tastatur[${i}]: „${t}“ ist unbekannt (${EINFACH.join(', ')}, variable, einheit)`);
      return;
    }
    if (!istObjekt(t) || Object.keys(t).length !== 1)
      return void f.push(`tastatur[${i}]: Zeichenkette oder genau ein Schlüssel`);
    if ('variable' in t) {
      if (typeof t['variable'] !== 'string' || !VARIABLE.test(t['variable']))
        f.push(`tastatur[${i}]: variable ist ein Buchstabe`);
    } else if ('einheit' in t) {
      if (typeof t['einheit'] !== 'string' || !EINHEIT.test(t['einheit']))
        f.push(`tastatur[${i}]: einheit ist kurz und ohne Leerzeichen`);
    } else f.push(`tastatur[${i}]: nur variable oder einheit`);
  });
  return f;
}

/** Was ohne Angabe gilt, nach Art der Lösung */
function nachTyp(loesung: string): readonly Taste[] {
  if (loesung === 'bruch') return ['ziffern', 'bruchstrich'];
  if (loesung === 'zahl') return ['ziffern', 'komma'];
  return ['ziffern'];
}

export function tastenFuer(a: {
  /** Art der Lösung: zahl, bruch, punkt, mit-rest … */
  readonly loesung: string;
  readonly vorlage?: readonly Taste[] | undefined;
  readonly instanz?:
    | {
        readonly tastatur?: readonly Taste[] | undefined;
        readonly vorzeichen?: boolean | undefined;
      }
    | undefined;
}): Tastensatz {
  const liste = a.instanz?.tastatur ?? a.vorlage ?? nachTyp(a.loesung);
  const hat = (t: (typeof EINFACH)[number]) => liste.includes(t);
  return {
    ziffern: hat('ziffern'),
    komma: hat('komma'),
    minus: hat('minus') || a.instanz?.vorzeichen === true,
    bruchstrich: hat('bruchstrich'),
    variablen: liste.flatMap((t) => (typeof t === 'object' && 'variable' in t ? [t.variable] : [])),
    einheiten: liste.flatMap((t) => (typeof t === 'object' && 'einheit' in t ? [t.einheit] : [])),
  };
}

/**
 * Tasten für eine Antwort der Erstvermittlung (`eingabe` mit Lösung und bekannten Fehlern).
 * Minus nur, wenn die Lösung oder ein bekannter Fehler negativ ist.
 */
export function tastenFuerVermittlung(eingabe: {
  readonly art: 'zahl' | 'bruch';
  readonly loesung: string;
  readonly fehler?: readonly { readonly wert: string }[] | undefined;
}): Tastensatz {
  const negativ = [eingabe.loesung, ...(eingabe.fehler ?? []).map((f) => f.wert)].some((w) =>
    /^\s*[-−]/.test(w),
  );
  return tastenFuer({ loesung: eingabe.art, instanz: { vorzeichen: negativ } });
}
