import type { Instanz, Sprachobjekt } from '../../../core/learning/generator';
import { pflichttests } from '../../pflichttests';
import { rechteck, seiteFehlt, zusammengesetzt } from './flaechen';

const zahlen = (s: string) =>
  [...s.replaceAll(String.fromCharCode(0x202f), '').matchAll(/\d+/g)].map((m) => Number(m[0]));
const angabe = (i: Instanz) => (i.platzhalter['angabe'] as Sprachobjekt).de;

for (const gesucht of ['umfang', 'flaeche'] as const) {
  pflichttests(rechteck, {
    niveaus: {
      G: { gesucht, max: 12, einheiten: ['cm', 'm'] },
      M: { gesucht, max: 60, einheiten: ['mm', 'cm', 'dm', 'm'] },
    },
    unabhaengigeLoesung(i) {
      const [a = NaN, b = a] = zahlen(angabe(i));
      return { typ: 'zahl', wert: gesucht === 'umfang' ? a + b + a + b : a * b };
    },
    grenzverletzungen: (i, p) =>
      zahlen(angabe(i)).every((z) => z >= 2 && z <= p.max) ? [] : ['Seite'],
    mindestensVerschieden: { G: 45, M: 85 },
  });
}

pflichttests(seiteFehlt, {
  niveaus: { M: { max: 25 } },
  unabhaengigeLoesung(i) {
    const [gegeben = NaN, a = NaN] = zahlen(angabe(i));
    const b = angabe(i).includes('Umfang') ? (gegeben - a - a) / 2 : gegeben / a;
    return { typ: 'zahl', wert: b };
  },
  grenzverletzungen: (i) =>
    i.loesung.typ === 'zahl' && Number.isInteger(i.loesung.wert) ? [] : ['b'],
  mindestensVerschieden: { M: 90 },
});

// Unabhängig: Vieleck aus dem SVG lesen, Fläche (Gaußsche Trapezformel) und Umfang in
// Pixeln berechnen und mit dem Maßstab aus der Bildbeschreibung zurückrechnen.
function ausBild(i: Instanz) {
  const pts = (/points="([^"]+)"/.exec(i.bild?.svg ?? '')?.[1] ?? '')
    .split(' ')
    .map((p) => p.split(',').map(Number) as [number, number]);
  let a2 = 0;
  let u = 0;
  pts.forEach(([x1, y1], k) => {
    const [x2, y2] = pts[(k + 1) % pts.length] ?? [0, 0];
    a2 += x1 * y2 - x2 * y1;
    u += Math.hypot(x2 - x1, y2 - y1);
  });
  const breitePx = Math.max(...pts.map((p) => p[0])) - Math.min(...pts.map((p) => p[0]));
  const [W = NaN] = zahlen(i.bild?.beschreibung.de ?? '');
  const s = breitePx / W;
  return { flaeche: Math.abs(a2) / 2 / (s * s), umfang: u / s, s, pts };
}

for (const gesucht of ['umfang', 'flaeche'] as const) {
  pflichttests(zusammengesetzt, {
    niveaus: {
      G: { gesucht, alle_masse: true, max: 12 },
      M: { gesucht, alle_masse: false, max: 30 },
    },
    unabhaengigeLoesung(i) {
      const b = ausBild(i);
      return { typ: 'zahl', wert: Math.round(gesucht === 'umfang' ? b.umfang : b.flaeche) };
    },
    grenzverletzungen(i) {
      // Jede Maßangabe im Bild muss zu einer gezeichneten Seite passen.
      const { s, pts } = ausBild(i);
      const seiten = pts.map(([x1, y1], k) => {
        const [x2, y2] = pts[(k + 1) % pts.length] ?? [0, 0];
        return Math.round(Math.hypot(x2 - x1, y2 - y1) / s);
      });
      const masse = [...(i.bild?.svg ?? '').matchAll(/>(\d+) (?:cm|m)</g)].map((m) => Number(m[1]));
      return masse.filter((m) => !seiten.includes(m)).map((m) => `Maß ${m} passt zu keiner Seite`);
    },
    mindestensVerschieden: { G: 90, M: 95 },
  });
}
