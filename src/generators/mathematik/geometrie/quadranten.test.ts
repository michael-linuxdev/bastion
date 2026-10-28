import type { Instanz, Loesung, Sprachobjekt } from '../../../core/learning/generator';
import { pflichttests } from '../../pflichttests';
import { punktAblesen4, quadrantBestimmen, spiegeln4 } from './quadranten';

// Parameter wie in den Vorlagen (content/…/M.RF.GF.QUADRANTEN)
const T = (i: Instanz, n: string) => (i.platzhalter[n] as Sprachobjekt).de;
/** „(−3|5)“ → { x: −3, y: 5 } */
function punktAus(t: string) {
  const [x = NaN, y = NaN] = t
    .replace(/[()]/g, '')
    .split('|')
    .map((z) => Number(z.replace('−', '-')));
  return { x, y };
}
const pkt = (x: number, y: number): Loesung => ({ typ: 'punkt', wert: { x: x || 0, y: y || 0 } });
const imGitter = (p: { x: number; y: number }, max: number) =>
  p.x !== 0 && p.y !== 0 && Math.abs(p.x) <= max && Math.abs(p.y) <= max && (p.x < 0 || p.y < 0);

pflichttests(punktAblesen4, {
  niveaus: { G: { max: 5 }, M: { max: 8 } },
  unabhaengigeLoesung(i) {
    const b = i.bild?.beschreibung.de ?? '';
    const [, dx, lr, dy, ou] =
      /liegt (\d+) Einheiten (links|rechts) vom Ursprung und (\d+) Einheiten (unter|über)/.exec(
        b,
      ) ?? [];
    return pkt(Number(dx) * (lr === 'links' ? -1 : 1), Number(dy) * (ou === 'unter' ? -1 : 1));
  },
  grenzverletzungen(i, p) {
    const w = i.loesung.typ === 'punkt' ? i.loesung.wert : { x: 0, y: 0 };
    return imGitter(w, p.max) && i.vorzeichen ? [] : [`Punkt ${w.x}|${w.y}`];
  },
  mindestensVerschieden: { G: 40, M: 70 },
});

pflichttests(quadrantBestimmen, {
  niveaus: { G: { max: 5 }, M: { max: 8 } },
  unabhaengigeLoesung(i) {
    const { x, y } = punktAus(T(i, 'punkt'));
    const q = x > 0 && y > 0 ? 0 : x < 0 && y > 0 ? 1 : x < 0 && y < 0 ? 2 : 3;
    return { typ: 'auswahl', wert: q };
  },
  grenzverletzungen(i, p) {
    return imGitter(punktAus(T(i, 'punkt')), p.max) ? [] : ['Punkt'];
  },
  mindestensVerschieden: { G: 40, M: 70 },
});

pflichttests(spiegeln4, {
  niveaus: { G: { max: 5, ursprung: false }, M: { max: 8, ursprung: true } },
  unabhaengigeLoesung(i) {
    const { x, y } = punktAus(T(i, 'punkt'));
    const w = T(i, 'woran');
    return w.includes('x-Achse') ? pkt(x, -y) : w.includes('y-Achse') ? pkt(-x, y) : pkt(-x, -y);
  },
  grenzverletzungen(i, p) {
    const f: string[] = [];
    if (!imGitter(punktAus(T(i, 'punkt')), p.max)) f.push('Punkt');
    if (!p.ursprung && T(i, 'woran').includes('Ursprung')) f.push('Ursprung auf G');
    return f;
  },
  mindestensVerschieden: { G: 60, M: 80 },
});
