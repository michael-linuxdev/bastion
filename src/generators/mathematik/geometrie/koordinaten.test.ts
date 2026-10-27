import { describe } from 'vitest';
import type { Instanz, Sprachobjekt } from '../../../core/learning/generator';
import { pflichttests } from '../../pflichttests';
import { punktAblesen, punktFinden, spiegelpunkt, verschiebung } from './koordinaten';

const t = (i: Instanz, n: string) => (i.platzhalter[n] as Sprachobjekt).de;
const koord = (s: string) => {
  const m = /\((\d+)\|(\d+)\)/.exec(s);
  return { x: Number(m?.[1]), y: Number(m?.[2]) };
};
// Unabhängig: Kreismittelpunkt des markierten Punktes im SVG zurückrechnen (raster 30, Rand 30/20).
function punktImSvg(i: Instanz, p: { max: number }) {
  const m = /<circle cx="([\d.]+)" cy="([\d.]+)"/.exec(i.bild?.svg ?? '');
  return { x: (Number(m?.[1]) - 30) / 30, y: p.max - (Number(m?.[2]) - 20) / 30 };
}

pflichttests(punktAblesen, {
  niveaus: { G: { max: 6 }, M: { max: 12 } },
  unabhaengigeLoesung: (i, p) => ({ typ: 'punkt', wert: punktImSvg(i, p) }),
  grenzverletzungen: (i, p) => {
    const q = punktImSvg(i, p);
    return q.x < 1 || q.y < 1 || q.x > p.max || q.y > p.max ? ['außerhalb'] : [];
  },
  mindestensVerschieden: { G: 25, M: 55 }, // gemessen M: 64 von 144 möglichen Punkten
});

pflichttests(punktFinden, {
  niveaus: { G: { max: 6 }, M: { max: 12 } },
  unabhaengigeLoesung(i) {
    const gesucht = `(${i.platzhalter['x'] as number}|${i.platzhalter['y'] as number})`;
    const teile = (i.bild?.beschreibung.de ?? '').split(/, | Punkten /);
    const nr = ['A', 'B', 'C', 'D'].findIndex((b) => teile.some((x) => x.startsWith(b + gesucht)));
    return { typ: 'auswahl', wert: nr };
  },
  grenzverletzungen: () => [],
  mindestensVerschieden: { G: 30, M: 90 },
});

for (const figur of [false, true]) {
  describe(figur ? 'Dreieck' : 'Punkt', () => {
    pflichttests(spiegelpunkt, {
      niveaus: { G: { max: 8, figur }, M: { max: 12, figur } },
      unabhaengigeLoesung(i) {
        const q = koord(t(i, 'punkt'));
        const [, achse, wert] = /([xy]) = (\d+)/.exec(t(i, 'achse')) ?? [];
        const a = Number(wert);
        return {
          typ: 'punkt',
          wert: achse === 'x' ? { x: 2 * a - q.x, y: q.y } : { x: q.x, y: 2 * a - q.y },
        };
      },
      grenzverletzungen(i, p) {
        const l = i.loesung;
        if (l.typ !== 'punkt') return ['keine Punktlösung'];
        const q = koord(t(i, 'punkt'));
        const f: string[] = [];
        if (l.wert.x < 0 || l.wert.y < 0 || l.wert.x > p.max || l.wert.y > p.max)
          f.push('Bildpunkt außerhalb');
        if (l.wert.x === q.x && l.wert.y === q.y) f.push('Punkt liegt auf der Achse');
        if (/-\d/.test(i.bild?.svg ?? '')) f.push('negative Bildkoordinate');
        return f;
      },
      mindestensVerschieden: { G: 80, M: 95 }, // gemessen G: 85
    });
  });
}

pflichttests(verschiebung, {
  niveaus: { G: { max: 8 }, M: { max: 15 } },
  unabhaengigeLoesung(i) {
    const p = koord(t(i, 'p'));
    const pb = koord(t(i, 'p_bild'));
    const q = koord(t(i, 'q'));
    return { typ: 'punkt', wert: { x: q.x + pb.x - p.x, y: q.y + pb.y - p.y } };
  },
  grenzverletzungen(i, p) {
    const l = i.loesung;
    return l.typ === 'punkt' &&
      (l.wert.x < 0 || l.wert.y < 0 || l.wert.x > p.max || l.wert.y > p.max)
      ? ['außerhalb']
      : [];
  },
  mindestensVerschieden: { G: 98, M: 98 },
});
