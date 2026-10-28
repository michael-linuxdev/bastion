import { bruch, type Bruch } from '../../../core/learning/bruch';
import type { Instanz, Loesung, Sprachobjekt } from '../../../core/learning/generator';
import { pflichttests } from '../../pflichttests';
import { gekuerzt } from '../brueche/rechnen';
import {
  baumAblesen,
  pfadregel,
  verknuepfen,
  verknuepfenZaehlen,
  zaehlen,
  zaehlenRechnung,
} from './zufall8';

// Parameter wie in den Vorlagen (content/…/M.DZ.ZF.EREIGNISSE, .BAUMDIAGRAMM, .ZAEHLEN)
const T = (i: Instanz, n: string) => (i.platzhalter[n] as Sprachobjekt).de;
const optionen = (i: Instanz) => (i.optionen ?? []).map((o) => o.text?.de ?? '');
const auswahlL = (wert: number): Loesung => ({ typ: 'auswahl', wert });
const zahlL = (wert: number): Loesung => ({ typ: 'zahl', wert });
const bruchL = (b: Bruch): Loesung => ({ typ: 'bruch', wert: gekuerzt(b) });

/** Ereignis aus seinem Namen als Prüffunktion – unabhängig vom Generator nachgebaut */
function pruefung(name: string): (n: number) => boolean {
  if (name === 'gerade Zahl') return (n) => n % 2 === 0;
  if (name === 'ungerade Zahl') return (n) => n % 2 === 1;
  if (name === 'Primzahl')
    return (n) => n > 1 && Array.from({ length: n - 2 }, (_, k) => k + 2).every((d) => n % d !== 0);
  const g = /^Zahl größer als (\d+)$/.exec(name);
  if (g) return (n) => n > Number(g[1]);
  const k = /^Zahl kleiner als (\d+)$/.exec(name);
  if (k) return (n) => n < Number(k[1]);
  const t = /^durch (\d+) teilbare Zahl$/.exec(name);
  if (t) return (n) => n % Number(t[1]) === 0;
  throw new Error(`unbekanntes Ereignis ${name}`);
}
const bis = (v: string) => Number(/bis (\d+)/.exec(v)?.[1] ?? 6);
const alle = (v: string) => Array.from({ length: bis(v) }, (_, i) => i + 1);
const menge = (xs: number[]) => (xs.length === 0 ? '{ } (leere Menge)' : `{${xs.join('; ')}}`);
function zielmenge(i: Instanz): number[] {
  const g = T(i, 'gefragt');
  const z = alle(T(i, 'versuch'));
  const gegen = /Gegenereignis von A: (.+)$/.exec(g);
  if (gegen) return z.filter((n) => !pruefung(gegen[1] ?? '')(n));
  const m = /^(?:zu )?„(.+)“ mit A: (.+), B: (.+)$/.exec(g);
  const A = pruefung(m?.[2] ?? '');
  const B = pruefung(m?.[3] ?? '');
  if (m?.[1] === 'A und B') return z.filter((n) => A(n) && B(n));
  if (m?.[1] === 'A oder B') return z.filter((n) => A(n) || B(n));
  return z.filter((n) => A(n) && !B(n));
}

pflichttests(verknuepfen, {
  niveaus: { G: { zwei: false }, M: { zwei: true } },
  unabhaengigeLoesung: (i) => auswahlL(optionen(i).indexOf(menge(zielmenge(i)))),
  grenzverletzungen: (i) => (optionen(i).length >= 3 ? [] : ['zu wenige Antworten']),
  mindestensVerschieden: { G: 30, M: 80 },
});

pflichttests(verknuepfenZaehlen, {
  niveaus: { G: { zwei: false }, M: { zwei: true } },
  unabhaengigeLoesung: (i) => zahlL(zielmenge(i).length),
  grenzverletzungen: () => [],
  mindestensVerschieden: { G: 10, M: 70 },
});

pflichttests(pfadregel, {
  niveaus: { G: { erweitert: false }, M: { erweitert: true } },
  unabhaengigeLoesung(i) {
    const a = T(i, 'aufgabe');
    const rot = Number(/(\d+) rote/.exec(a)?.[1]);
    const blau = Number(/(\d+) blaue/.exec(a)?.[1]);
    const ohne = a.includes('ohne Zurücklegen');
    // alle vier Pfade aufzählen
    let gut = 0;
    let gesamt = 0;
    for (const erst of ['r', 'b'] as const)
      for (const dann of ['r', 'b'] as const) {
        let w1 = erst === 'r' ? rot : blau;
        const n1 = rot + blau;
        let w2 = dann === 'r' ? rot : blau;
        if (ohne && erst === dann) w2 -= 1;
        const n2 = ohne ? n1 - 1 : n1;
        w1 = Math.max(w1, 0);
        const passt = a.includes('zweimal Rot zu ziehen')
          ? erst === 'r' && dann === 'r'
          : erst !== dann;
        if (passt) gut += w1 * w2;
        gesamt = n1 * n2;
      }
    return bruchL(bruch(gut, gesamt));
  },
  grenzverletzungen: (i, p) =>
    !p.erweitert && T(i, 'aufgabe').includes('ohne') ? ['ohne Zurücklegen auf G'] : [],
  mindestensVerschieden: { G: 30, M: 50 },
});

pflichttests(baumAblesen, {
  niveaus: { G: { erweitert: false }, M: { erweitert: true } },
  unabhaengigeLoesung(i) {
    const b = i.bild?.beschreibung.de ?? '';
    const w = [...b.matchAll(/(\d+)\/(\d+)/g)].map((m) => [Number(m[1]), Number(m[2])] as const);
    const [t1, , ttT, ttN, ntT] = w; // T, N, nach T: T, N, nach N: T, N
    const n = t1?.[1] ?? 1;
    const p = (x: readonly [number, number] | undefined) => (x?.[0] ?? 0) / n;
    const wert = T(i, 'frage').includes('T, T')
      ? p(t1) * p(ttT)
      : p(t1) * p(ttN) + (1 - p(t1)) * p(ntT);
    return bruchL(bruch(Math.round(wert * n * n), n * n));
  },
  grenzverletzungen: () => [],
  mindestensVerschieden: { G: 70, M: 70 },
});

pflichttests(zaehlen, {
  niveaus: { G: { anordnung: false }, M: { anordnung: true } },
  unabhaengigeLoesung(i) {
    const a = T(i, 'aufgabe');
    const z = [...a.matchAll(/(\d+)/g)].map((m) => Number(m[1]));
    if (a.includes('in einer Reihe')) {
      let f = 1;
      for (let k = 2; k <= (z[0] ?? 0); k++) f *= k;
      return zahlL(f);
    }
    if (a.includes('Zahlenschloss')) return zahlL((z[1] ?? 0) ** (z[0] ?? 0));
    if (a.includes('Plätze')) {
      const [n = 0, , k = 0] = z; // „n Läuferinnen … Plätze 1 bis k“
      let f = 1;
      for (let j = 0; j < k; j++) f *= n - j;
      return zahlL(f);
    }
    return zahlL(z.reduce((x, y) => x * y, 1));
  },
  grenzverletzungen: (i, p) =>
    !p.anordnung && /Reihe|Schloss|Plätze/.test(T(i, 'aufgabe')) ? ['M-Fall auf G'] : [],
  mindestensVerschieden: { G: 80, M: 40 },
});

pflichttests(zaehlenRechnung, {
  niveaus: { G: { anordnung: false }, M: { anordnung: true } },
  unabhaengigeLoesung(i) {
    // Erwartung aus zaehlen nachrechnen, dann die Rechnung mit diesem Wert und nur „·“ wählen
    const a = T(i, 'aufgabe');
    const z = [...a.matchAll(/(\d+)/g)].map((m) => Number(m[1]));
    let soll: number;
    if (a.includes('in einer Reihe'))
      soll = Array.from({ length: z[0] ?? 0 }, (_, k) => k + 1).reduce((x, y) => x * y, 1);
    else if (a.includes('Zahlenschloss')) soll = (z[1] ?? 0) ** (z[0] ?? 0);
    else if (a.includes('Plätze'))
      soll = Array.from({ length: z[2] ?? 0 }, (_, j) => (z[0] ?? 0) - j).reduce(
        (x, y) => x * y,
        1,
      );
    else soll = z.reduce((x, y) => x * y, 1);
    const wert = (o: string) =>
      o.includes('+') ? NaN : o.split(' · ').reduce((x, y) => x * Number(y), 1);
    return auswahlL(optionen(i).findIndex((o) => wert(o) === soll));
  },
  grenzverletzungen: (i) => (optionen(i).length >= 3 ? [] : ['zu wenige Antworten']),
  mindestensVerschieden: { G: 80, M: 50 },
});
