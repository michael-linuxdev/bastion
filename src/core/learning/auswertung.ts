/**
 * Eingaben lesen und Antworten auswerten (INHALTSFORMAT §5, §5.1, §7).
 *
 * Rein und ohne Browser-APIs: Die Oberfläche liefert Text bzw. eine
 * gewählte Option, der Kern entscheidet richtig/falsch und erkennt
 * Fehlerbilder.
 */
import { bruch, istGekuerzt, wertgleich, type Bruch } from './bruch';
import type { Instanz, Loesung } from './generator';
import { gleicheLoesung } from './loesung';

/** Ergebnis beim Lesen einer Eingabe. */
export type Gelesen<T> =
  | { readonly ok: true; readonly wert: T; readonly hinweis?: 'punkt-statt-komma' }
  | {
      readonly ok: false;
      readonly grund: 'leer' | 'keine-zahl' | 'tausendertrenner' | 'nenner-null';
    };

/**
 * Zahl nach I-5: Komma als Dezimaltrennzeichen, Punkt wird akzeptiert (mit
 * Hinweis), keine Tausendertrennzeichen, Leerzeichen am Rand, führende
 * Nullen und ein „+“ werden ignoriert.
 */
export function leseZahl(eingabe: string): Gelesen<number> {
  const t = eingabe.trim().replace(/^\+/, '').replace('−', '-');
  if (t === '') return { ok: false, grund: 'leer' };
  const m = /^(-?)(\d+)(?:([.,])(\d+))?$/.exec(t);
  if (!m) return { ok: false, grund: /\d\s+\d/.test(t) ? 'tausendertrenner' : 'keine-zahl' };
  const [, vorzeichen, ganz, trenner, nachkomma] = m;
  const wert = Number(`${vorzeichen ?? ''}${ganz ?? ''}${nachkomma ? `.${nachkomma}` : ''}`);
  return trenner === '.' ? { ok: true, wert, hinweis: 'punkt-statt-komma' } : { ok: true, wert };
}

/** Bruch „3/4“ oder gemischte Zahl „1 3/4“; eine ganze Zahl gilt als Bruch mit Nenner 1. */
export function leseBruch(eingabe: string): Gelesen<Bruch> {
  const t = eingabe.trim();
  if (t === '') return { ok: false, grund: 'leer' };
  const gemischt = /^(\d+)\s+(\d+)\s*\/\s*(\d+)$/.exec(t);
  const einfach = /^(-?\d+)\s*\/\s*(\d+)$/.exec(t);
  const ganz = /^-?\d+$/.exec(t);
  if (gemischt) {
    const [g, z, n] = [Number(gemischt[1]), Number(gemischt[2]), Number(gemischt[3])];
    if (n === 0) return { ok: false, grund: 'nenner-null' };
    return { ok: true, wert: bruch(g * n + z, n) };
  }
  if (einfach) {
    const [z, n] = [Number(einfach[1]), Number(einfach[2])];
    if (n === 0) return { ok: false, grund: 'nenner-null' };
    return { ok: true, wert: bruch(z, n) };
  }
  if (ganz) return { ok: true, wert: bruch(Number(t), 1) };
  return { ok: false, grund: 'keine-zahl' };
}

/** Primfaktoren „2 · 3 · 3“, „2*3*3“ oder „2 3 3“ → aufsteigend sortiert. */
export function leseFaktoren(eingabe: string): Gelesen<number[]> {
  const teile = eingabe
    .trim()
    .split(/\s*[·*×x,]\s*|\s+/i)
    .filter((x) => x !== '');
  if (teile.length === 0) return { ok: false, grund: 'leer' };
  if (!teile.every((x) => /^\d+$/.test(x))) return { ok: false, grund: 'keine-zahl' };
  return { ok: true, wert: teile.map(Number).sort((a, b) => a - b) };
}

/** Uhrzeit „7:45“ oder „7.45“ → Minuten nach Mitternacht. */
export function leseUhrzeit(eingabe: string): Gelesen<number> {
  const m = /^(\d{1,2})\s*[:.]\s*(\d{2})(?:\s*Uhr)?$/i.exec(eingabe.trim());
  if (eingabe.trim() === '') return { ok: false, grund: 'leer' };
  if (!m || Number(m[1]) > 23 || Number(m[2]) > 59) return { ok: false, grund: 'keine-zahl' };
  return { ok: true, wert: Number(m[1]) * 60 + Number(m[2]) };
}

/** Wie streng Brüche verglichen werden (Vorlagenfeld `antwort.form`). */
export type Bruchform = 'beliebig' | 'gekuerzt' | 'exakt';

export type Ergebnis =
  | { readonly richtig: true }
  | {
      readonly richtig: false;
      /** ID des erkannten Fehlerbilds, falls die Antwort zu einem passt. */
      readonly fehlerbild?: string;
      /** Wertgleich, aber nicht in der verlangten Form. */
      readonly hinweis?: 'nicht-gekuerzt' | 'andere-schreibweise';
    };

const nah = (a: number, b: number) => Math.abs(a - b) < 1e-9;

/** Gleicher Wert – bei Zahlen ohne Gleitkomma-Rauschen, bei Brüchen wertgleich. */
function gleicherWert(a: Loesung, b: Loesung): boolean {
  if (a.typ === 'zahl' && b.typ === 'zahl') return nah(a.wert, b.wert);
  if (a.typ === 'bruch' && b.typ === 'bruch') return wertgleich(a.wert, b.wert);
  return gleicheLoesung(a, b);
}

/** Vergleicht eine Antwort mit Lösung und Fehlerbildern der Instanz. */
export function auswerten(
  instanz: Instanz,
  antwort: Loesung,
  form: Bruchform = 'beliebig',
): Ergebnis {
  const l = instanz.loesung;
  if (l.typ === 'bruch' && antwort.typ === 'bruch') {
    if (wertgleich(l.wert, antwort.wert)) {
      if (form === 'beliebig') return { richtig: true };
      if (form === 'gekuerzt' && istGekuerzt(antwort.wert)) return { richtig: true };
      if (form === 'exakt' && gleicheLoesung(l, antwort)) return { richtig: true };
      // Ein Fehlerbild darf genau diese Schreibweise beschreiben (z. B. „nicht vollständig gekürzt“).
      const genau = instanz.fehlerbilder.find((f) => gleicheLoesung(f.antwort, antwort));
      if (genau) return { richtig: false, fehlerbild: genau.id };
      return {
        richtig: false,
        hinweis: form === 'gekuerzt' ? 'nicht-gekuerzt' : 'andere-schreibweise',
      };
    }
  } else if (gleicherWert(l, antwort)) {
    return { richtig: true };
  }
  // Erst exakt gleiche Fehler-Antwort, dann wertgleiche (z. B. 6/8 statt des erwarteten 3/4).
  const fehler =
    instanz.fehlerbilder.find((f) => gleicheLoesung(f.antwort, antwort)) ??
    instanz.fehlerbilder.find((f) => gleicherWert(f.antwort, antwort));
  return fehler ? { richtig: false, fehlerbild: fehler.id } : { richtig: false };
}
