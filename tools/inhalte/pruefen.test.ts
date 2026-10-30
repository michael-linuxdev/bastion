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

  it('enthalten die 41 Kompetenzen der Klasse 5 (LEHRPLAN §8)', () => {
    expect(kompetenzen.filter((k) => k.klassenstufe_typisch.includes(5))).toHaveLength(41);
  });

  it('enthalten die 26 Kompetenzen der Klasse 6 (LEHRPLAN §8b) die 29 der Klasse 7 (§8c) und die 27 der Klasse 8 (§8d)', () => {
    // gezählt nach der ersten Klassenstufe: manche Kompetenz der Klasse 5 gilt auch für 6
    const ab = (n: number) => kompetenzen.filter((k) => Math.min(...k.klassenstufe_typisch) === n);
    expect(ab(6)).toHaveLength(26);
    expect(ab(7)).toHaveLength(29);
    expect(ab(8)).toHaveLength(27);
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
        'Reviews: noch kein Prüfwerkzeug – alle Inhalte gelten als ungeprüft (INHALTSFORMAT §8).',
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

  // Felder, deren Fehlerbilder schon zugeordnet sind (PLAN U5a): Präfix der Kompetenz-ID
  const FV_ZUGEORDNET = ['M.ZO.BR.', 'M.SF.BR.', 'M.ZO.NZ.', 'M.SF.NZ.', 'M.ZO.TB.', 'M.ZO.RZ.', 'M.ZO.PZ.', 'M.SF.TU.', 'M.SF.GL.', 'M.SF.GS.', 'M.SF.FK.', 'M.SF.ZU.'];
  const zugeordnet = (kompetenz: string) => FV_ZUGEORDNET.some((p) => kompetenz.startsWith(p));

  it('zugeordnete Felder: jedes Fehlerbild verweist auf eine Fehlvorstellung (F2)', () => {
    const ohne = vorlagen
      .filter((v) => zugeordnet(v.kompetenz))
      .flatMap((v) =>
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
