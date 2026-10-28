import type { Bild, Instanz, Loesung, Sprachobjekt } from '../../../core/learning/generator';
import { pflichttests } from '../../pflichttests';
import { mantelLaenge, zylinderBerechnen, zylinderNetz, zylinderSach } from './zylinder';

// Parameter wie in den Vorlagen (content/…/M.RF.KP.ZYLINDER, M.GM.KP.ZYLINDER); π ≈ 3,14
const T = (i: Instanz, n: string) => (i.platzhalter[n] as Sprachobjekt).de;
const B = (i: Instanz) => i.bild?.beschreibung.de ?? '';
const zahlL = (x: number): Loesung => ({ typ: 'zahl', wert: Math.round(x * 1e4) / 1e4 });
const auswahlL = (wert: number): Loesung => ({ typ: 'auswahl', wert });
const zahlAus = (t: string) => Number(t.replace(/\s/g, '').replace(',', '.'));
const nach = (t: string, re: RegExp) => zahlAus(re.exec(t)?.[1] ?? 'NaN');
const N = '(\\d[\\d\\s]*(?:,\\d+)?)';
const pi = 3.14;

/** Ist das Bild ein Zylindernetz? Rechteck plus zwei Kreise, deren Umfang die Breite ist, oben und unten */
function istNetz(b: Bild): boolean {
  const rect = /<rect x="([\d.]+)" y="([\d.]+)" width="([\d.]+)" height="([\d.]+)"/.exec(b.svg);
  if (!rect) return false;
  const [x, y, w, h] = rect.slice(1).map(Number) as [number, number, number, number];
  const kreise = [...b.svg.matchAll(/<circle cx="([\d.]+)" cy="([\d.]+)" r="([\d.]+)"/g)].map((m) =>
    [m[1], m[2], m[3]].map(Number),
  ) as [number, number, number][];
  if (kreise.length !== 2) return false;
  const passt = kreise.every(
    ([cx, , r]) => Math.abs(2 * Math.PI * r - w) < 1 && cx >= x && cx <= x + w,
  );
  const obenUnten =
    kreise.some(([, cy, r]) => Math.abs(cy + r - y) < 0.5) &&
    kreise.some(([, cy, r]) => Math.abs(cy - r - (y + h)) < 0.5);
  return passt && obenUnten;
}

pflichttests(zylinderNetz, {
  niveaus: { G: { figuren: 3 }, M: { figuren: 4 } },
  unabhaengigeLoesung: (i) =>
    auswahlL((i.optionen ?? []).findIndex((o) => o.bild !== undefined && istNetz(o.bild))),
  grenzverletzungen: (i) =>
    (i.optionen ?? []).filter((o) => o.bild !== undefined && istNetz(o.bild)).length === 1
      ? []
      : ['nicht genau ein Netz'],
  mindestensVerschieden: { G: 90, M: 90 },
});

pflichttests(mantelLaenge, {
  niveaus: { G: { umkehr: false }, M: { umkehr: true } },
  unabhaengigeLoesung(i, p) {
    const b = B(i);
    if (!p.umkehr) return zahlL(2 * pi * nach(b, /Radius (\d+) cm/));
    return zahlL(nach(b, new RegExp(`Rechteck ist ${N} cm lang`)) / (2 * pi));
  },
  grenzverletzungen: () => [],
  mindestensVerschieden: { G: 75, M: 75 },
});

pflichttests(zylinderBerechnen, {
  niveaus: { G: { erweitert: false }, M: { erweitert: true } },
  unabhaengigeLoesung(i) {
    const a = T(i, 'aufgabe');
    if (a.includes('Rohr')) {
      const ra = nach(a, /außen den Radius (\d+) cm/);
      const ri = nach(a, /innen den Radius (\d+) cm/);
      return zahlL(pi * (ra * ra - ri * ri) * nach(a, /ist (\d+) cm lang/));
    }
    if (a.includes('Wie hoch')) {
      const rad = nach(a, /den Radius (\d+) cm/);
      return zahlL(nach(a, new RegExp(`Volumen ${N} cm³`)) / (pi * rad * rad));
    }
    const b = B(i);
    const rad = nach(b, /Radius (\d+) cm/);
    const h = nach(b, /Höhe (\d+) cm/);
    if (a.includes('Volumen')) return zahlL(pi * rad * rad * h);
    if (a.includes('Mantels')) return zahlL(2 * pi * rad * h);
    return zahlL(2 * pi * rad * rad + 2 * pi * rad * h);
  },
  grenzverletzungen: (i, p) =>
    !p.erweitert && /Oberfläche|Rohr|Wie hoch/.test(T(i, 'aufgabe')) ? ['M-Fall auf G'] : [],
  mindestensVerschieden: { G: 85, M: 90 },
});

pflichttests(zylinderSach, {
  niveaus: { G: { masse: false }, M: { masse: true } },
  unabhaengigeLoesung(i, p) {
    const a = T(i, 'aufgabe');
    if (!p.masse) {
      const r = nach(a, /(\d+) cm Durchmesser/) / 2;
      const v = pi * r * r * nach(a, /(\d+) cm hoch/);
      return zahlL(a.includes('Liter') ? v / 1000 : v);
    }
    const r = nach(a, /hat (\d+) cm Radius/);
    const v = pi * r * r * nach(a, /ist (\d+) cm lang/);
    return zahlL(Math.round(v * nach(a, /Dichte (\d+,\d) g/)));
  },
  grenzverletzungen: () => [],
  mindestensVerschieden: { G: 80, M: 80 },
});
