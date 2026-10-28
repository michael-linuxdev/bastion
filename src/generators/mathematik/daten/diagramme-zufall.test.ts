import type { Instanz, Loesung, Sprachobjekt } from '../../../core/learning/generator';
import { pflichttests } from '../../pflichttests';
import { diagrammAblesen, diagrammBeurteilen } from './diagramme';
import { chancenVergleichen, ereignisMenge, ereignisZaehlen, laplace } from './wahrscheinlichkeit';

// Parameter wie in den Vorlagen (content/…/M.DZ.DA.DIAGRAMME, M.DZ.ZF.BEGRIFFE, .WAHRSCHEINLICHKEIT)
const T = (i: Instanz, n: string) => (i.platzhalter[n] as Sprachobjekt).de;
const auswahlL = (wert: number): Loesung => ({ typ: 'auswahl', wert });
const zahlen = (t: string) => (t.match(/\d+/g) ?? []).map(Number);

// Werte aus der Bildbeschreibung (die Beschreibung ist die barrierefreie Fassung des Bildes)
const MONATE = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni'];
function monatswerte(i: Instanz): Map<string, number> {
  const b = i.bild?.beschreibung.de ?? '';
  return new Map(MONATE.map((m) => [m, Number(new RegExp(`${m}: (\\d+)`).exec(b)?.[1])]));
}

pflichttests(diagrammAblesen, {
  niveaus: { G: { unterschied: false }, M: { unterschied: true } },
  unabhaengigeLoesung(i) {
    const w = monatswerte(i);
    const genannt = MONATE.filter((m) => T(i, 'frage').includes(m));
    const [a = '', b = ''] = genannt;
    return {
      typ: 'zahl',
      wert: genannt.length === 1 ? (w.get(a) ?? NaN) : Math.abs((w.get(a) ?? 0) - (w.get(b) ?? 0)),
    };
  },
  grenzverletzungen(i, p) {
    const f: string[] = [];
    const b = i.bild?.beschreibung.de ?? '';
    if (p.unterschied !== b.startsWith('Ein Liniendiagramm')) f.push('falsche Diagrammart');
    if (i.loesung.typ === 'zahl' && i.loesung.wert <= 0) f.push('Wert nicht positiv');
    return f;
  },
  mindestensVerschieden: { G: 90, M: 80 },
});

pflichttests(diagrammBeurteilen, {
  niveaus: { G: { achse: false }, M: { achse: true } },
  unabhaengigeLoesung(i, p) {
    const o = (i.optionen ?? []).map((x) => x.text?.de ?? '');
    if (!p.achse) {
      const f = T(i, 'frage');
      const art = /Anteil|100 %/.test(f)
        ? 'Kreisdiagramm'
        : /verändert/.test(f)
          ? 'Liniendiagramm'
          : 'Säulendiagramm';
      return auswahlL(o.indexOf(art));
    }
    // Werte aus der Beschreibung; die richtige Aussage nennt den echten Unterschied
    const b = i.bild?.beschreibung.de ?? '';
    const a = Number(/Laden A: (\d+)/.exec(b)?.[1]);
    const c = Number(/Laden B: (\d+)/.exec(b)?.[1]);
    return auswahlL(o.findIndex((t) => t.includes(`${c - a} Stück mehr`)));
  },
  grenzverletzungen(i, p) {
    return p.achse && !i.bild ? ['ohne Bild'] : [];
  },
  mindestensVerschieden: { G: 6, M: 40 },
});

/** Zahlen 1 … n des Versuchs und das Ereignis als Prüffunktion – unabhängig nachgebaut */
function versuchUndEreignis(i: Instanz, ereignisName: string) {
  const v = T(i, 'versuch');
  const n = v.startsWith('Ein Würfel') ? 6 : (zahlen(v)[0] ?? NaN);
  const alle = Array.from({ length: n }, (_, k) => k + 1);
  const e = T(i, ereignisName);
  const k = zahlen(e)[0] ?? NaN;
  const prim = (x: number) => x > 1 && alle.filter((t) => x % t === 0).length === 2;
  const gilt = (x: number) =>
    e === 'eine gerade Zahl'
      ? x % 2 === 0
      : e === 'eine ungerade Zahl'
        ? x % 2 === 1
        : e === 'eine Primzahl'
          ? prim(x)
          : e === 'eine durch 3 teilbare Zahl'
            ? x % 3 === 0
            : e.startsWith('eine gerade Zahl größer')
              ? x % 2 === 0 && x > k
              : e.startsWith('eine Zahl größer')
                ? x > k
                : e.startsWith('mindestens')
                  ? x >= k
                  : x <= k;
  return { alle, gilt };
}

pflichttests(ereignisZaehlen, {
  niveaus: { G: { erweitert: false }, M: { erweitert: true } },
  unabhaengigeLoesung(i) {
    const { alle, gilt } = versuchUndEreignis(i, 'ereignis');
    return { typ: 'zahl', wert: alle.filter(gilt).length };
  },
  grenzverletzungen(i, p) {
    return !p.erweitert && !T(i, 'versuch').startsWith('Ein Würfel') ? ['kein Würfel auf G'] : [];
  },
  mindestensVerschieden: { G: 10, M: 40 },
});

pflichttests(ereignisMenge, {
  niveaus: { G: { erweitert: false }, M: { erweitert: true } },
  unabhaengigeLoesung(i) {
    const { alle, gilt } = versuchUndEreignis(i, 'gefragt');
    const t = `{${alle.filter(gilt).join('; ')}}`;
    return auswahlL((i.optionen ?? []).findIndex((o) => o.text?.de === t));
  },
  grenzverletzungen(i) {
    return (i.optionen ?? []).length === 3 ? [] : ['nicht drei Optionen'];
  },
  mindestensVerschieden: { G: 15, M: 40 },
});

pflichttests(laplace, {
  niveaus: { G: { erweitert: false }, M: { erweitert: true } },
  unabhaengigeLoesung(i) {
    const v = T(i, 'versuch');
    let g: number;
    let n: number;
    if (v.startsWith('In einem Beutel')) {
      const farben = [...v.matchAll(/(\d+) (rote|blaue|grüne|gelbe)/g)].map(
        (m) => [m[2], Number(m[1])] as const,
      );
      n = farben.reduce((s, [, z]) => s + z, 0);
      const farbe = /eine (rote|blaue|grüne|gelbe) Kugel/.exec(T(i, 'ereignis'))?.[1];
      g = farben.find(([f]) => f === farbe)?.[1] ?? NaN;
    } else {
      const { alle, gilt } = versuchUndEreignis(i, 'ereignis');
      n = alle.length;
      g = alle.filter(gilt).length;
    }
    let [z, m] = [g, n];
    for (let t = Math.min(z, m); t > 1; t--)
      if (z % t === 0 && m % t === 0) {
        z /= t;
        m /= t;
      }
    return { typ: 'bruch', wert: { zaehler: z, nenner: m } };
  },
  grenzverletzungen(i, p) {
    const v = T(i, 'versuch');
    const f: string[] = [];
    if (!p.erweitert && (v.match(/rote|blaue|grüne|gelbe/g) ?? []).length > 2)
      f.push('mehr als zwei Farben auf G');
    if (!p.erweitert && v.startsWith('Ein Glücksrad')) f.push('Glücksrad auf G');
    return f;
  },
  mindestensVerschieden: { G: 25, M: 50 },
});

pflichttests(chancenVergleichen, {
  niveaus: { G: { erweitert: false }, M: { erweitert: true } },
  unabhaengigeLoesung(i) {
    const [ra = 0, ba = 0] = zahlen(T(i, 'a'));
    const [rb = 0, bb = 0] = zahlen(T(i, 'b'));
    const pa = ra / (ra + ba);
    const pb = rb / (rb + bb);
    return auswahlL(Math.abs(pa - pb) < 1e-12 ? 2 : pa > pb ? 0 : 1);
  },
  grenzverletzungen(i, p) {
    const n = [...zahlen(T(i, 'a')), ...zahlen(T(i, 'b'))];
    return n.some((x) => x < 1 || x > (p.erweitert ? 12 : 8)) ? ['Anzahl'] : [];
  },
  mindestensVerschieden: { G: 80, M: 80 },
});
