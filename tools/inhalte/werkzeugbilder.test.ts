// Bilder aus Werkzeugen in den Erstvermittlungen: Jede Angabe muss ein Bild ergeben. Die
// Werkzeuge selbst fallen bei Unsinn still auf nichts oder ein Standardbild zurück; hier
// fällt ein Tippfehler im Inhalt auf.
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { parse } from 'yaml';
import { describe, expect, it } from 'vitest';
import { anleitungsbild } from '../../src/ui/vermittlung/werkzeuge/anleitungsbild';
import { histogrammAus } from '../../src/ui/vermittlung/werkzeuge/histogramm';

function dateien(ordner: string): string[] {
  return readdirSync(ordner).flatMap((n) => {
    const p = join(ordner, n);
    return statSync(p).isDirectory() ? dateien(p) : n === 'vermittlung.yaml' ? [p] : [];
  });
}

interface Angabe {
  readonly werkzeug?: string;
  readonly id?: string;
  readonly parameter?: Record<string, unknown>;
}

const angaben = dateien('content').flatMap((d) => {
  const v = parse(readFileSync(d, 'utf8')) as { schritte?: { id: string; bild?: Angabe }[] };
  return (v.schritte ?? []).flatMap((s) => (s.bild ? [{ wo: `${d} · ${s.id}`, ...s.bild }] : []));
});

describe('Werkzeug-Bilder in Erstvermittlungen', () => {
  it('jedes Anleitungsbild gibt es', () => {
    expect(angaben.filter((a) => a.werkzeug === 'anleitungsbild@1').length).toBeGreaterThan(0);
    const falsch = angaben
      .filter((a) => a.werkzeug === 'anleitungsbild@1' && !anleitungsbild(a.parameter ?? {}))
      .map((a) => a.wo);
    expect(falsch).toEqual([]);
  });

  it('jedes Histogramm hat gültige Klassen (kein Standardbild)', () => {
    expect(angaben.filter((a) => a.werkzeug === 'histogramm@1').length).toBeGreaterThan(0);
    const falsch = angaben
      .filter((a) => a.werkzeug === 'histogramm@1')
      .filter((a) => {
        const h = histogrammAus(a.parameter ?? {});
        return JSON.stringify(h.grenzen) !== JSON.stringify(a.parameter?.['grenzen']);
      })
      .map((a) => a.wo);
    expect(falsch).toEqual([]);
  });
});
