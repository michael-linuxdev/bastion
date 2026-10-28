import type { Instanz } from '../../../core/learning/generator';
import { pflichttests } from '../../pflichttests';
import { vieleckErgaenzen, vieleckZerlegen } from './vielecke-zerlegen';

// Parameter wie in den Vorlagen (content/…/M.GM.FL.VIELECKE)
/** Eckpunkte des (ersten) Polygons im Bild, in cm (22 Pixel je cm) */
function ecken(i: Instanz): [number, number][] {
  const m = /<polygon points="([^"]+)"/.exec(i.bild?.svg ?? '');
  return (m?.[1] ?? '')
    .split(' ')
    .map((p) => p.split(',').map(Number) as [number, number])
    .map(([x, y]) => [x / 22, y / 22]);
}
/** Flächeninhalt mit der Gaußschen Trapezformel – unabhängig von der Zerlegung */
function flaeche(pk: [number, number][]): number {
  let s = 0;
  pk.forEach(([x1, y1], k) => {
    const [x2, y2] = pk[(k + 1) % pk.length] ?? [0, 0];
    s += x1 * y2 - x2 * y1;
  });
  return Math.round(Math.abs(s / 2) * 1e6) / 1e6;
}

pflichttests(vieleckZerlegen, {
  niveaus: { G: { zwei_dreiecke: false }, M: { zwei_dreiecke: true } },
  unabhaengigeLoesung: (i) => ({ typ: 'zahl', wert: flaeche(ecken(i)) }),
  grenzverletzungen(i, p) {
    const n = ecken(i).length;
    return (p.zwei_dreiecke ? n === 4 : n === 5) ? [] : [`${n} Ecken`];
  },
  mindestensVerschieden: { G: 70, M: 70 },
});

pflichttests(vieleckErgaenzen, {
  niveaus: { G: { ecken: 1 }, M: { ecken: 2 } },
  unabhaengigeLoesung: (i) => ({ typ: 'zahl', wert: flaeche(ecken(i)) }),
  grenzverletzungen(i, p) {
    const pk = ecken(i);
    const f: string[] = [];
    if (pk.length !== (p.ecken === 2 ? 6 : 5)) f.push(`${pk.length} Ecken`);
    // keine zwei gleichen Ecken (Ecken berühren sich nicht)
    if (new Set(pk.map(([x, y]) => `${x}|${y}`)).size !== pk.length) f.push('doppelte Ecke');
    return f;
  },
  mindestensVerschieden: { G: 70, M: 80 },
});
