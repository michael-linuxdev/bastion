import { describe, expect, it } from 'vitest';
import { GEBAEUDE_TYPEN } from '../../core/bastion/katalog';
import { THEMEN } from '../../core/policy/einstellung';
import de from './de.json';

const texte = de as Record<string, string>;
/** Wörter, die jedes Thema haben muss (B-17) */
const WOERTER = [
  'name',
  'ganzes',
  'epoche',
  'geschafft',
  'wissen-ein',
  'wissen-viele',
  'wissen-zeichen',
  ...['fleiss', 'behalten', 'koennen', 'schritt'].flatMap((r) => [`${r}-einer`, `${r}-viele`]),
  ...GEBAEUDE_TYPEN.flatMap((g) => [`gebaeude.${g}`, `gebaeude.${g}.wozu`]),
];

describe('Textdatei – Themen (B-17)', () => {
  it('jedes Thema hat jedes Wort, und keines ist leer', () => {
    for (const thema of THEMEN)
      for (const w of WOERTER) expect(texte[`thema.${thema}.${w}`], `${thema}: ${w}`).toBeTruthy();
  });

  it('jeder Platzhalter in einem Text ist ein Wort, das jedes Thema hat', () => {
    for (const [schluessel, text] of Object.entries(texte)) {
      // Texte, die über die Wörter des Themas laufen (tt in thema.svelte.ts)
      if (!/^(bastion|abschluss|rueckkehr|basebau)\./.test(schluessel)) continue;
      for (const [, name] of text.matchAll(/\{([a-z.-]+)\}/g))
        expect(WOERTER, `${schluessel}: {${name}}`).toContain(name);
    }
  });

  it('keine Themen ohne Mechanik: Es gibt keine Wörter für unbekannte Rollen', () => {
    const erlaubt = new Set(WOERTER);
    for (const schluessel of Object.keys(texte).filter((k) => k.startsWith('thema.'))) {
      const [, thema, ...rest] = schluessel.split('.');
      expect(THEMEN).toContain(thema);
      expect(erlaubt.has(rest.join('.')), schluessel).toBe(true);
    }
  });
});
