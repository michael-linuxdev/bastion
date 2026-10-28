// Läuft bei jedem pnpm test und mit pnpm inhalte:pruefen:
// Fehlerhafte Inhalte machen die CI rot.
import { describe, expect, it } from 'vitest';
import { generatoren } from '../../src/generators';
import { abdeckung, pruefeInhalte } from './pruefen';

describe('Inhalte in content/', () => {
  const bericht = pruefeInhalte('content', generatoren);
  const { fehler, kompetenzen, vorlagen } = bericht;

  it('sind fehlerfrei (Schema, Ordner, Voraussetzungen, Kreise, Vorlagen ↔ Generatoren)', () => {
    expect(fehler).toEqual([]);
  });

  it('enthalten die 41 Kompetenzen der Klasse 5 (LEHRPLAN §8)', () => {
    expect(kompetenzen.filter((k) => k.klassenstufe_typisch.includes(5))).toHaveLength(41);
  });

  it('haben für Klasse 5 die Niveaus G und M, aber noch kein E (K-11)', () => {
    for (const k of kompetenzen) expect(Object.keys(k.niveaus).sort(), k.id).toEqual(['G', 'M']);
  });

  it('jeder registrierte Generator wird von einer Vorlage genutzt', () => {
    const genutzt = new Set(vorlagen.map((v) => v.generator));
    expect([...generatoren.keys()].filter((g) => !genutzt.has(g))).toEqual([]);
  });

  it('Bericht', () => {
    const tabelle = abdeckung(bericht);
    const fertig = [...tabelle.values()].filter((z) => Object.values(z).every((n) => n >= 2));
    const begonnen = [...tabelle.entries()].filter(([, z]) => Object.values(z).some((n) => n > 0));
    console.log(
      [
        `Kompetenzen: ${kompetenzen.length} · Vorlagen: ${vorlagen.length}`,
        `Abdeckung (≥ 2 Vorlagen je Niveau): ${fertig.length} von ${tabelle.size} Kompetenzen`,
        ...begonnen.map(
          ([id, z]) =>
            `  ${id}: ${Object.entries(z)
              .map(([n, a]) => `${n} ${a}`)
              .join(', ')}`,
        ),
        'Reviews: noch kein Prüfwerkzeug – alle Inhalte gelten als ungeprüft (INHALTSFORMAT §8).',
      ].join('\n'),
    );
    expect(tabelle.size).toBe(kompetenzen.length);
  });
});
