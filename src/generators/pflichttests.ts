// Pflicht-Tests für jeden Generator (INHALTSFORMAT §6.3). Wird nur aus
// *.test.ts-Dateien aufgerufen, nie aus der App.
import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { gleichGeschrieben } from '../core/learning/bruch';
import type { Generator, Instanz, Loesung } from '../core/learning/generator';

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
}

function gleicheLoesung(a: Loesung, b: Loesung): boolean {
  if (a.typ === 'bruch' && b.typ === 'bruch') return gleichGeschrieben(a.wert, b.wert);
  if (a.typ === 'zahl' && b.typ === 'zahl') return a.wert === b.wert;
  return false;
}

const seed = fc.nat({ max: 0xffffffff });

export function pflichttests<P>(generator: Generator<P>, pruefung: PflichtPruefung<P>): void {
  const laeufe = pruefung.laeufe ?? 10_000;

  describe(`${generator.id}@${generator.version} – Pflicht-Tests`, () => {
    for (const [niveau, parameter] of Object.entries(pruefung.niveaus)) {
      describe(`Niveau ${niveau}`, () => {
        it('Lösung stimmt mit unabhängiger Berechnung überein', () => {
          fc.assert(
            fc.property(seed, (s) => {
              const instanz = generator.erzeuge(s, parameter);
              expect(instanz.loesung).toEqual(pruefung.unabhaengigeLoesung(instanz, parameter));
            }),
            { numRuns: laeufe },
          );
        });

        it('alle Zahlen liegen in den Niveau-Grenzen', () => {
          fc.assert(
            fc.property(seed, (s) => {
              expect(
                pruefung.grenzverletzungen(generator.erzeuge(s, parameter), parameter),
              ).toEqual([]);
            }),
            { numRuns: laeufe },
          );
        });

        it('kein Fehlerbild ergibt die richtige Antwort, keine Antwort doppelt', () => {
          fc.assert(
            fc.property(seed, (s) => {
              const instanz = generator.erzeuge(s, parameter);
              const antworten = instanz.fehlerbilder.map((f) => f.antwort);
              for (const [i, a] of antworten.entries()) {
                expect(gleicheLoesung(a, instanz.loesung)).toBe(false);
                for (const b of antworten.slice(i + 1)) expect(gleicheLoesung(a, b)).toBe(false);
              }
              for (const f of instanz.fehlerbilder) {
                expect(generator.fehlerbildIds).toContain(f.id);
              }
            }),
            { numRuns: laeufe },
          );
        });

        it('alle Platzhalter werden gefüllt', () => {
          fc.assert(
            fc.property(seed, (s) => {
              const instanz = generator.erzeuge(s, parameter);
              expect(Object.keys(instanz.platzhalter).sort()).toEqual(
                [...generator.platzhalter].sort(),
              );
              for (const wert of Object.values(instanz.platzhalter)) {
                expect(wert).toBeDefined();
              }
            }),
            { numRuns: laeufe },
          );
        });

        it('gleicher Seed → identische Instanz', () => {
          fc.assert(
            fc.property(seed, (s) => {
              expect(generator.erzeuge(s, parameter)).toEqual(generator.erzeuge(s, parameter));
            }),
            { numRuns: Math.min(laeufe, 1000) },
          );
        });

        it('bietet Abwechslung in 100 aufeinanderfolgenden Seeds', () => {
          const mindestens = pruefung.mindestensVerschieden[niveau] ?? 1;
          for (const start of [0, 1_000_000, 0xffffffff - 99]) {
            const verschieden = new Set(
              Array.from({ length: 100 }, (_, i) =>
                JSON.stringify(generator.erzeuge(start + i, parameter).platzhalter),
              ),
            );
            expect(verschieden.size).toBeGreaterThanOrEqual(mindestens);
          }
        });
      });
    }
  });
}
