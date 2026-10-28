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
  | { readonly art: 'wurzel'; readonly text: string };

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
      if (typeof w === 'object' && istBruch(w))
        teile.push({
          art: 'bruch',
          zaehler: zahlText(w.zaehler),
          nenner: zahlText(w.nenner),
          fett: fett.an,
        });
      else teile.push({ art: 'text', text: wertText(w), fett: fett.an });
    } else {
      teile.push({ art: 'text', text: m[0], fett: fett.an });
    }
  }
}

/** Formel: Platzhalter einsetzen, dann \sqrt{…}, ^{…}, ^x und \cdot erkennen. */
function formel(text: string, platzhalter: Readonly<Record<string, Wert>>, teile: Textteil[]) {
  const eingesetzt = text.replace(/\{([a-z_]+)\}/g, (_, n: string) =>
    wertText(holeWert(n, platzhalter)),
  );
  for (const m of eingesetzt.matchAll(
    /\\sqrt\{\s*([^}]*?)\s*\}|\^\{\s*([^}]*?)\s*\}|\^(\w)|\\cdot|[^\\^]+|[\\^]/g,
  )) {
    if (m[1] !== undefined) teile.push({ art: 'wurzel', text: m[1] });
    else if (m[2] !== undefined) teile.push({ art: 'hoch', text: m[2] });
    else if (m[3] !== undefined) teile.push({ art: 'hoch', text: m[3] });
    else if (m[0] === '\\cdot') teile.push({ art: 'text', text: '·', fett: false });
    else teile.push({ art: 'text', text: m[0], fett: false });
  }
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
            : t.text,
    )
    .join('');
}
