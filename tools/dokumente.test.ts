// Schützt die Stellen, an denen parallele PRs früher zusammengestoßen sind
// (SESSION-PROMPT, „Stränge und parallele Arbeit“, Regel 2; AGENTS.md).
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const lies = (pfad: string) => readFileSync(pfad, 'utf8');

/** Zeilen der Tabelle in §5 von PLAN.md, die mit einem Datum beginnen. */
function planProtokoll(): string[] {
  const text = lies('docs/PLAN.md');
  const start = text.indexOf('\n## 5.');
  const ende = text.indexOf('\n## ', start + 1);
  return text
    .slice(start, ende === -1 ? undefined : ende)
    .split('\n')
    .filter((z) => /^\| \d{1,2}\.\d{1,2}\.\d{4} \|/.test(z));
}

describe('Dokumente für parallele Stränge', () => {
  it('PLAN.md §5 bekommt keine neuen Zeilen (Protokoll steht in docs/session/*-PROTOKOLL.md)', () => {
    expect(planProtokoll().length).toBeLessThanOrEqual(63);
  });

  for (const strang of ['LERNKERN', 'GRAFIK']) {
    it(`${strang}-PROTOKOLL.md enthält nur Kopf und Tabellenzeilen`, () => {
      const zeilen = lies(`docs/session/${strang}-PROTOKOLL.md`).trimEnd().split('\n');
      const tabelle = zeilen.slice(zeilen.indexOf('| Datum | Änderung |') + 2);
      expect(tabelle.length).toBeGreaterThan(0);
      for (const z of tabelle) expect(z).toMatch(/^\| \d{1,2}\.\d{1,2}\.\d{4} \| .+ \|$/);
    });
  }

  it('.gitattributes führt die Protokolle beim Mergen zusammen', () => {
    expect(lies('.gitattributes')).toContain('docs/session/*-PROTOKOLL.md merge=union');
  });
});
