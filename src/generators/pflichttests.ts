// Pflicht-Tests für jeden Generator (INHALTSFORMAT §6.3). Wird nur aus
// *.test.ts-Dateien aufgerufen, nie aus der App.
import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import type { Bild, Generator, Instanz, Loesung } from '../core/learning/generator';
import { rundeAuf } from '../core/learning/auswertung';
import { gleicheLoesung } from '../core/learning/loesung';
import { musterweg, pruefeSchritt } from '../core/learning/zwischenschritte';

export interface PflichtPruefung<P> {
  /** Parameter je Niveau, wie sie in der Vorlage stehen. */
  readonly niveaus: Readonly<Record<string, P>>;
  /** Lösung auf einem zweiten, einfachen Weg aus den Platzhaltern berechnet. */
  unabhaengigeLoesung(instanz: Instanz, parameter: P): Loesung;
  /** Liste der verletzten Niveau-Grenzen; leer, wenn alles passt. */
  grenzverletzungen(instanz: Instanz, parameter: P): string[];
  /** Mindestzahl verschiedener Instanzen in 100 aufeinanderfolgenden Seeds, je Niveau. */
  readonly mindestensVerschieden: Readonly<Record<string, number>>;
  /** Seeds je Niveau für die Eigenschaftstests (Standard: 10 000). */
  readonly laeufe?: number;
  /** Zeitlimit je Test in ms für rechenintensive Generatoren (Standard: Vitest-Vorgabe). */
  readonly zeitlimitMs?: number;
}

const seed = fc.nat({ max: 0xffffffff });

/**
 * Tempo: Vitest-`expect` ist in Schleifen mit 10 000 Läufen teuer. Darum erst billig vergleichen
 * und nur bei Abweichung `toEqual` aufrufen, das dann die genaue Meldung liefert. JSON kann sich
 * bei gleichem Inhalt in der Reihenfolge der Schlüssel unterscheiden; dann prüft `toEqual` nach.
 */
function gleich(ist: unknown, soll: unknown, meldung?: string): void {
  if (JSON.stringify(ist) !== JSON.stringify(soll)) expect(ist, meldung).toEqual(soll);
}

/** Was die Person von einer Aufgabe sieht – Grundlage für den Abwechslungs-Test. */
const sichtbar = (i: Instanz) => ({
  platzhalter: i.platzhalter,
  elemente: i.elemente,
  bild: i.bild?.svg,
  optionen: i.optionen,
});

/** Probleme eines Bildes: keine Beschreibung, nicht wohlgeformt, Verweise nach außen (A2, A5). */
function bildprobleme(bild: Bild): string[] {
  const p: string[] = [];
  if (!bild.beschreibung.de.trim()) p.push('Bild ohne Textbeschreibung');
  if (!/^<svg [^>]*xmlns="http:\/\/www\.w3\.org\/2000\/svg"[^>]*viewBox="[^"]+"/.test(bild.svg)) {
    p.push('Bild beginnt nicht mit <svg xmlns=… viewBox=…>');
  }
  if (!bild.svg.endsWith('</svg>')) p.push('Bild endet nicht mit </svg>');
  if (/<script|href=|url\(|<foreignObject|<image|on[a-z]+=/i.test(bild.svg)) {
    p.push('Bild enthält Skript, Verweis oder eingebettete Datei');
  }
  return p;
}

export function pflichttests<P>(generator: Generator<P>, pruefung: PflichtPruefung<P>): void {
  const laeufe = pruefung.laeufe ?? 10_000;

  describe(`${generator.id}@${generator.version} – Pflicht-Tests`, () => {
    for (const [niveau, parameter] of Object.entries(pruefung.niveaus)) {
      describe(`Niveau ${niveau}`, () => {
        it(
          'Lösung stimmt mit unabhängiger Berechnung überein',
          () => {
            fc.assert(
              fc.property(seed, (s) => {
                const instanz = generator.erzeuge(s, parameter);
                gleich(instanz.loesung, pruefung.unabhaengigeLoesung(instanz, parameter));
              }),
              { numRuns: laeufe },
            );
          },
          pruefung.zeitlimitMs,
        );

        it(
          'alle Zahlen liegen in den Niveau-Grenzen',
          () => {
            fc.assert(
              fc.property(seed, (s) => {
                gleich(pruefung.grenzverletzungen(generator.erzeuge(s, parameter), parameter), []);
              }),
              { numRuns: laeufe },
            );
          },
          pruefung.zeitlimitMs,
        );

        it(
          'kein Fehlerbild ergibt die richtige Antwort, keine Antwort doppelt',
          () => {
            fc.assert(
              fc.property(seed, (s) => {
                const instanz = generator.erzeuge(s, parameter);
                const probleme: string[] = [];
                const fb = instanz.fehlerbilder;
                for (const [i, f] of fb.entries()) {
                  if (gleicheLoesung(f.antwort, instanz.loesung))
                    probleme.push(`Fehlerbild ${f.id} ergibt die richtige Antwort`);
                  for (const g of fb.slice(i + 1))
                    if (gleicheLoesung(f.antwort, g.antwort))
                      probleme.push(`Fehlerbilder ${f.id} und ${g.id} ergeben dieselbe Antwort`);
                  if (!generator.fehlerbildIds.includes(f.id))
                    probleme.push(`Fehlerbild ${f.id} fehlt in fehlerbildIds`);
                }
                // Gerundetes Ergebnis (B3): Lösung ist der gerundete genaue Wert
                if (instanz.runden) {
                  const soll = rundeAuf(instanz.runden.genau, instanz.runden.stellen);
                  if (instanz.loesung.typ !== 'zahl') probleme.push('gerundet, aber keine Zahl');
                  else if (Math.abs(instanz.loesung.wert - soll) >= 5e-10)
                    probleme.push(`gerundet ${instanz.loesung.wert}, erwartet ${soll}`);
                }
                gleich(probleme, [], `Seed ${s}`);
              }),
              { numRuns: laeufe },
            );
          },
          pruefung.zeitlimitMs,
        );

        it(
          'Bilder sind beschrieben und laden nichts nach; Auswahl-Lösungen zeigen auf Optionen',
          () => {
            fc.assert(
              fc.property(seed, (s) => {
                const instanz = generator.erzeuge(s, parameter);
                const bilder = [instanz.bild, ...(instanz.optionen ?? []).map((o) => o.bild)];
                for (const b of bilder) if (b) expect(bildprobleme(b)).toEqual([]);
                for (const l of [instanz.loesung, ...instanz.fehlerbilder.map((f) => f.antwort)]) {
                  if (l.typ !== 'auswahl') continue;
                  expect(l.wert).toBeGreaterThanOrEqual(0);
                  expect(l.wert).toBeLessThan(instanz.optionen?.length ?? 0);
                }
              }),
              { numRuns: Math.min(laeufe, 2000) },
            );
          },
          pruefung.zeitlimitMs,
        );

        it(
          'alle Platzhalter werden gefüllt',
          () => {
            fc.assert(
              fc.property(seed, (s) => {
                const instanz = generator.erzeuge(s, parameter);
                gleich(Object.keys(instanz.platzhalter).sort(), [...generator.platzhalter].sort());
                const leer = Object.entries(instanz.platzhalter)
                  .filter(([, wert]) => wert === undefined)
                  .map(([name]) => name);
                gleich(leer, [], 'Platzhalter ohne Wert');
              }),
              { numRuns: laeufe },
            );
          },
          pruefung.zeitlimitMs,
        );

        it(
          'gleicher Seed → identische Instanz',
          () => {
            fc.assert(
              fc.property(seed, (s) => {
                gleich(generator.erzeuge(s, parameter), generator.erzeuge(s, parameter));
              }),
              { numRuns: Math.min(laeufe, 1000) },
            );
          },
          pruefung.zeitlimitMs,
        );

        it(
          'bietet Abwechslung in 100 aufeinanderfolgenden Seeds',
          () => {
            const mindestens = pruefung.mindestensVerschieden[niveau] ?? 1;
            for (const start of [0, 1_000_000, 0xffffffff - 99]) {
              const verschieden = new Set(
                Array.from({ length: 100 }, (_, i) =>
                  JSON.stringify(sichtbar(generator.erzeuge(start + i, parameter))),
                ),
              );
              expect(verschieden.size).toBeGreaterThanOrEqual(mindestens);
            }
          },
          pruefung.zeitlimitMs,
        );

        // Zwischenschritte (INHALTSFORMAT §17): nur für Generatoren, die welche haben
        if (generator.schritt && generator.schritte) {
          const ids = generator.schritte;
          it(
            'Zwischenschritte: Musterweg endet beim Ergebnis, Schrittfehler erkannt und nie richtig',
            () => {
              fc.assert(
                fc.property(seed, (s) => {
                  const instanz = generator.erzeuge(s, parameter);
                  const weg = musterweg(generator, s, parameter);
                  expect(weg.map((x) => x.id)).toEqual(ids.map((x) => x.id));
                  expect(
                    gleicheLoesung(weg.at(-1)?.aufgabe.loesung ?? instanz.loesung, instanz.loesung),
                  ).toBe(true);
                  for (const [i, { aufgabe }] of weg.entries()) {
                    expect(pruefeSchritt(aufgabe, aufgabe.loesung)).toEqual({ richtig: true });
                    const antworten = aufgabe.fehlerbilder.map((f) => f.antwort);
                    for (const f of aufgabe.fehlerbilder) {
                      expect(ids[i]?.fehlerbildIds).toContain(f.id);
                      expect(pruefeSchritt(aufgabe, f.antwort)).toEqual({
                        richtig: false,
                        fehlerbild: f.id,
                      });
                    }
                    for (const [j, a] of antworten.entries())
                      for (const b of antworten.slice(j + 1))
                        expect(gleicheLoesung(a, b)).toBe(false);
                    for (const p of ids[i]?.platzhalter ?? [])
                      expect(aufgabe.platzhalter?.[p], p).toBeDefined();
                  }
                }),
                { numRuns: laeufe },
              );
            },
            pruefung.zeitlimitMs,
          );
        }
      });
    }
  });
}
