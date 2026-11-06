// Bilder aus Werkzeugen in den Erstvermittlungen: Jede Angabe muss ein Bild ergeben. Die
// Werkzeuge selbst fallen bei Unsinn still auf nichts oder ein Standardbild zurück; hier
// fällt ein Tippfehler im Inhalt auf.
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { parse } from 'yaml';
import { describe, expect, it } from 'vitest';
import { anleitungsbild } from '../../src/ui/vermittlung/werkzeuge/anleitungsbild';
import { dreieckAus } from '../../src/ui/vermittlung/werkzeuge/dreieck';
import { geradenAus } from '../../src/ui/vermittlung/werkzeuge/geraden';
import { gitterAus } from '../../src/ui/vermittlung/werkzeuge/gitter';
import { histogrammAus } from '../../src/ui/vermittlung/werkzeuge/histogramm';
import { koerpernetzAus } from '../../src/ui/vermittlung/werkzeuge/koerpernetz';
import { winkelAus } from '../../src/ui/vermittlung/werkzeuge/winkel';

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
  const v = parse(readFileSync(d, 'utf8')) as {
    schritte?: { id: string; bild?: Angabe; werkzeug?: Angabe }[];
  };
  return (v.schritte ?? []).flatMap((s) => [
    ...(s.bild ? [{ wo: `${d} · ${s.id}`, ...s.bild }] : []),
    ...(s.werkzeug ? [{ wo: `${d} · ${s.id}`, werkzeug: s.werkzeug.id, ...s.werkzeug }] : []),
  ]);
});

const anzahl = (x: unknown) => (Array.isArray(x) ? x.length : 0);

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

  it('jedes Dreieck zeigt alle angegebenen Beschriftungen', () => {
    expect(angaben.filter((a) => a.werkzeug === 'dreieck@1').length).toBeGreaterThan(0);
    const falsch = angaben
      .filter((a) => a.werkzeug === 'dreieck@1')
      .filter((a) => {
        const seiten = (a.parameter?.['seiten'] ?? {}) as Record<string, unknown>;
        const d = dreieckAus(a.parameter ?? {});
        return (
          Object.keys(seiten).length !== Object.keys(d.seiten).length ||
          (a.parameter?.['rechts'] !== undefined && a.parameter['rechts'] !== d.rechts)
        );
      })
      .map((a) => a.wo);
    expect(falsch).toEqual([]);
  });

  it('Geraden, Winkel, Gitter und Körpernetz übernehmen jede Angabe (kein stiller Standard)', () => {
    const falsch: string[] = [];
    for (const a of angaben) {
      const p = a.parameter ?? {};
      if (a.werkzeug === 'geraden@1') {
        const z = geradenAus(p);
        const lage = p['lage'];
        const winkelPasst =
          lage === 'parallel'
            ? z.winkel === 0
            : lage === 'senkrecht'
              ? z.winkel === 90
              : p['winkel'] === undefined || z.winkel === p['winkel'];
        if (!winkelPasst || (p['richtung'] !== undefined && z.richtung !== p['richtung']))
          falsch.push(a.wo);
        if (anzahl(p['felder']) > 4 || anzahl(p['felder2']) > 4) falsch.push(a.wo);
      } else if (a.werkzeug === 'winkel@1') {
        if (p['grad'] !== undefined && winkelAus(p).grad !== p['grad']) falsch.push(a.wo);
      } else if (a.werkzeug === 'gitter@1') {
        const z = gitterAus(p);
        if (
          z.punkte.length !== anzahl(p['punkte']) ||
          z.figuren.length !== anzahl(p['figuren']) ||
          z.kaestchen.length !== anzahl(p['kaestchen']) ||
          z.pfeile.length !== anzahl(p['pfeile']) ||
          z.linien.length !== anzahl(p['linien']) ||
          (p['spiegelachse'] !== undefined && z.achse === undefined) ||
          (p['beweglich'] !== undefined && z.beweglich === undefined) ||
          (p['verschiebung'] !== undefined && z.verschiebung === undefined) ||
          (p['max'] !== undefined && z.xmax !== p['max'])
        )
          falsch.push(a.wo);
      } else if (a.werkzeug === 'koerpernetz@1') {
        const z = koerpernetzAus(p);
        if (p['boden'] !== undefined && z.boden === undefined) falsch.push(a.wo);
        if (typeof p['netz'] === 'number' && z.netz.length !== 6) falsch.push(a.wo);
        if (Array.isArray(p['netz']) && JSON.stringify([...z.netz]) !== JSON.stringify(p['netz']))
          falsch.push(a.wo);
      }
    }
    expect(angaben.filter((a) => a.werkzeug === 'gitter@1').length).toBeGreaterThan(0);
    expect(falsch).toEqual([]);
  });
});
