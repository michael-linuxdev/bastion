// Prüft, dass im CSS nur logische Eigenschaften stehen (CLAUDE.md, ARCHITEKTUR A6).
// Physische Angaben wie `margin-left` würden bei Rechts-nach-links-Schriften
// (Arabisch, Persisch) an der falschen Seite landen.
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const VERBOTEN: [RegExp, string][] = [
  [
    /\b(margin|padding|border)-(left|right|top|bottom)\b/,
    '…-inline-start/-end bzw. …-block-start/-end',
  ],
  [/(?<![\w-])(left|right)\s*:/, 'inset-inline-start / inset-inline-end'],
  [/\btext-align\s*:\s*(left|right)\b/, 'text-align: start / end'],
  [/\bfloat\s*:\s*(left|right)\b/, 'float: inline-start / inline-end'],
  [/(?<![\w-])(min-|max-)?(width|height)\s*:/, 'inline-size / block-size'],
];

function dateien(ordner: string): string[] {
  return readdirSync(ordner, { withFileTypes: true }).flatMap((eintrag) => {
    const pfad = join(ordner, eintrag.name);
    if (eintrag.isDirectory()) return dateien(pfad);
    return /\.(css|svelte)$/.test(eintrag.name) ? [pfad] : [];
  });
}

function cssAnteil(pfad: string, inhalt: string): string {
  if (pfad.endsWith('.css')) return inhalt;
  return [...inhalt.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)].map((m) => m[1]).join('\n');
}

describe('CSS nutzt nur logische Eigenschaften', () => {
  for (const pfad of dateien('src')) {
    it(pfad, () => {
      const css = cssAnteil(pfad, readFileSync(pfad, 'utf8')).replace(/\/\*[\s\S]*?\*\//g, '');
      const funde = css
        .split('\n')
        .flatMap((zeile) =>
          VERBOTEN.filter(([muster]) => muster.test(zeile)).map(
            ([, ersatz]) => `„${zeile.trim()}“ → stattdessen ${ersatz}`,
          ),
        );
      expect(funde).toEqual([]);
    });
  }
});
