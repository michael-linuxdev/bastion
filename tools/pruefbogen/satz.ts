// Gemeinsamer Satz für Prüfbogen und Arbeitsblatt: Texte wie in der App (Brüche, Hochzahlen,
// Wurzeln aus src/core/learning/text.ts) als HTML, Lösungen als Text und die Grund-Stile.
import type { Instanz, Loesung, Wert } from '../../src/core/learning/generator';
import { fuelle, zahlText, type Textteil } from '../../src/core/learning/text';
import { esc } from './html';

export function teileHtml(teile: readonly Textteil[]): string {
  return teile
    .map((t) => {
      if (t.art === 'bruch')
        return `<span class="br"><span>${esc(t.zaehler)}</span><span>${esc(t.nenner)}</span></span>`;
      if (t.art === 'hoch') return `<sup>${esc(t.text)}</sup>`;
      if (t.art === 'wurzel') return `√<span class="ueber">${esc(t.text)}</span>`;
      const inhalt = t.art === 'begriff' ? `<u>${esc(t.text)}</u>` : esc(t.text);
      return t.fett ? `<b>${inhalt}</b>` : inhalt;
    })
    .join('');
}

/** Text füllen; Platzhalter ohne Wert (Rückmeldungen ohne konkrete Aufgabe) bleiben als ‹name›. */
export const text = (s: string, platzhalter: Readonly<Record<string, Wert>> = {}) =>
  teileHtml(
    fuelle(
      s.replace(/\{([a-z_]+)\}/g, (m, name: string) => (name in platzhalter ? m : `‹${name}›`)),
      platzhalter,
    ),
  );

export function loesungText(l: Loesung, optionen?: Instanz['optionen']): string {
  switch (l.typ) {
    case 'bruch':
      return `${zahlText(l.wert.zaehler)}/${zahlText(l.wert.nenner)}`;
    case 'zahl':
      return zahlText(l.wert);
    case 'auswahl': {
      const o = optionen?.[l.wert];
      return `${String.fromCharCode(65 + l.wert)}${o?.text ? ` (${esc(o.text.de)})` : ''}`;
    }
    case 'reihenfolge':
      return l.wert.map(zahlText).join(' < ');
    case 'punkt':
      return `(${zahlText(l.wert.x)} | ${zahlText(l.wert.y)})`;
    case 'mit-rest':
      return `${zahlText(l.wert.quotient)} Rest ${zahlText(l.wert.rest)}`;
  }
}

/** Seite, Schrift und Brüche; beide Werkzeuge setzen ihre eigenen Stile dahinter. */
export const GRUND_STIL = `
:root { color-scheme: light; }
body { font: 11pt/1.4 system-ui, sans-serif; color: #111; background: #fff; max-inline-size: 48rem; margin-inline: auto; padding: 1rem; }
.br { display: inline-flex; flex-direction: column; vertical-align: middle; text-align: center; font-size: 9pt; line-height: 1.1; }
.br > span:first-child { border-block-end: 1px solid currentcolor; }
.ueber { text-decoration: overline; }
`;
