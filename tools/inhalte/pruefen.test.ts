// Läuft bei jedem pnpm test und mit pnpm inhalte:pruefen:
// Fehlerhafte Inhalte machen die CI rot.
import { describe, expect, it } from 'vitest';
import { generatoren } from '../../src/generators/alle';
import { anleitungsBilder } from '../../src/generators/anleitungen';
import { abdeckung, pruefeInhalte } from './pruefen';

describe('Inhalte in content/', () => {
  const bericht = pruefeInhalte(
    'content',
    generatoren,
    new Map([...anleitungsBilder].map(([id, a]) => [id, a.bilder().length])),
  );
  const { fehler, kompetenzen, vorlagen } = bericht;

  it('sind fehlerfrei (Schema, Ordner, Voraussetzungen, Kreise, Vorlagen ↔ Generatoren)', () => {
    expect(fehler).toEqual([]);
  });

  it('enthalten die 42 Kompetenzen der Klasse 5 (LEHRPLAN §8, mit SA.LESEN seit 03.11.2026)', () => {
    expect(kompetenzen.filter((k) => k.klassenstufe_typisch.includes(5))).toHaveLength(42);
  });

  it('enthalten die 26 Kompetenzen der Klasse 6 (LEHRPLAN §8b) die 29 der Klasse 7 (§8c) und die 27 der Klasse 8 (§8d)', () => {
    // gezählt nach der ersten Klassenstufe: manche Kompetenz der Klasse 5 gilt auch für 6
    const ab = (n: number) => kompetenzen.filter((k) => Math.min(...k.klassenstufe_typisch) === n);
    expect(ab(6)).toHaveLength(26);
    expect(ab(7)).toHaveLength(29);
    expect(ab(8)).toHaveLength(27);
  });

  it('haben G und M, ab Klasse 9 auch E; bis Klasse 8 ist E erlaubt (K-28, K-30, K-31)', () => {
    for (const k of kompetenzen) {
      const n = Object.keys(k.niveaus).sort();
      if (Math.min(...k.klassenstufe_typisch) >= 9) expect(n, k.id).toEqual(['E', 'G', 'M']);
      else
        expect(
          [
            ['G', 'M'],
            ['E', 'G', 'M'],
          ],
          k.id,
        ).toContainEqual(n);
    }
  });

  it('jede Kompetenz mit Niveau E hat eine E-Vorlage (K-31)', () => {
    const ohne = kompetenzen
      .filter((k) => 'E' in k.niveaus)
      .filter((k) => !vorlagen.some((v) => v.kompetenz === k.id && v.niveaus.includes('E')))
      .map((k) => k.id);
    expect(ohne).toEqual([]);
  });

  it('jeder registrierte Generator wird von einer Vorlage genutzt', () => {
    const genutzt = new Set(vorlagen.map((v) => v.generator));
    // Ältere Fassungen bleiben für gespeicherte Aufgaben, wenn eine Vorlage eine neuere nutzt
    // (INHALTSFORMAT §6.1 Regel 5).
    const neuere = (g: string) => {
      const [id, version] = g.split('@');
      return [...genutzt].some((n) => {
        const [nid, nv] = n.split('@');
        return nid === id && Number(nv) > Number(version);
      });
    };
    expect([...generatoren.keys()].filter((g) => !genutzt.has(g) && !neuere(g))).toEqual([]);
  });

  it('jede Vorlage nutzt die neueste Fassung ihres Generators', () => {
    const neueste = new Map<string, number>();
    for (const g of generatoren.keys()) {
      const [id, v] = g.split('@');
      neueste.set(id ?? '', Math.max(neueste.get(id ?? '') ?? 0, Number(v)));
    }
    const veraltet = vorlagen
      .filter((v) => {
        const [id, n] = v.generator.split('@');
        return Number(n) < (neueste.get(id ?? '') ?? 0);
      })
      .map((v) => `${v.id}: ${v.generator}`);
    expect(veraltet).toEqual([]);
  });

  it('Bericht', () => {
    const tabelle = abdeckung(bericht);
    const fertig = [...tabelle.values()].filter((z) => Object.values(z).every((n) => n >= 2));
    const fbs = vorlagen.flatMap((v) => Object.values(v.fehlerbilder));
    const mitFv = fbs.filter((t) => (t as { fv?: string }).fv).length;
    const begonnen = [...tabelle.entries()].filter(([, z]) => Object.values(z).some((n) => n > 0));
    console.log(
      [
        `Kompetenzen: ${kompetenzen.length} · Vorlagen: ${vorlagen.length}`,
        `Abdeckung (≥ 2 Vorlagen je Niveau): ${fertig.length} von ${tabelle.size} Kompetenzen`,
        `Fehlerbilder mit Fehlvorstellung (F2): ${mitFv} von ${fbs.length}`,
        ...begonnen.map(
          ([id, z]) =>
            `  ${id}: ${Object.entries(z)
              .map(([n, a]) => `${n} ${a}`)
              .join(', ')}`,
        ),
        'Reviews: Stand je Stufe zeigt `pnpm review` (INHALTSFORMAT §8).',
      ].join('\n'),
    );
    expect(tabelle.size).toBe(kompetenzen.length);
  });

  // Nachgerüstete Kompetenzen (PLAN U2, U5): Fehlerkatalog vollständig (VERMITTLUNG §3.5)
  const NACHGERUESTET = ['M.ZO.BR.BEGRIFF', 'M.ZO.BR.ERWEITERN', 'M.ZO.BR.ADD-SUB'];

  it('nachgerüstete Kompetenzen: jedes Fehlerbild verweist auf eine Fehlvorstellung (F2)', () => {
    const ohne = vorlagen
      .filter((v) => NACHGERUESTET.includes(v.kompetenz))
      .flatMap((v) =>
        Object.entries(v.fehlerbilder)
          .filter(([, t]) => !(t as { fv?: string }).fv)
          .map(([fid]) => `${v.id}: ${fid}`),
      );
    expect(ohne).toEqual([]);
  });

  it('nachgerüstete Kompetenzen haben eine geprüfte Erstvermittlung (V1–V8)', () => {
    const mit = new Set(bericht.vermittlungen.map((v) => v.kompetenz));
    expect(NACHGERUESTET.filter((k) => !mit.has(k))).toEqual([]);
  });

  it('nachgerüstete Kompetenzen: mindestens drei Fehlvorstellungen je Kompetenz (F1)', () => {
    for (const k of NACHGERUESTET)
      expect(
        bericht.fehlvorstellungen.filter((f) => f.kompetenzen.includes(k)).length,
        k,
      ).toBeGreaterThanOrEqual(3);
  });

  // Seit U5b sind alle Felder zugeordnet: Jedes Fehlerbild braucht eine Fehlvorstellung (F2)
  it('alle Vorlagen: jedes Fehlerbild verweist auf eine Fehlvorstellung (F2)', () => {
    const ohne = vorlagen.flatMap((v) =>
      Object.entries(v.fehlerbilder)
        .filter(([, t]) => !(t as { fv?: string }).fv)
        .map(([fid]) => `${v.id}: ${fid}`),
    );
    expect(ohne).toEqual([]);
  });

  it('eine Fehlvorstellung nennt jede Kompetenz, in deren Vorlagen sie vorkommt', () => {
    const nachId = new Map(bericht.fehlvorstellungen.map((f) => [f.id, f]));
    const fehlt = vorlagen.flatMap((v) =>
      Object.values(v.fehlerbilder).flatMap((t) => {
        const fv = nachId.get((t as { fv?: string }).fv ?? '');
        return fv && !fv.kompetenzen.includes(v.kompetenz) ? [`${fv.id}: ${v.kompetenz}`] : [];
      }),
    );
    expect([...new Set(fehlt)]).toEqual([]);
  });
});
