import type { Instanz, Loesung, Sprachobjekt } from '../../../core/learning/generator';
import { pflichttests } from '../../pflichttests';
import { angebotKosten, angebotVergleich, rabattSkonto, rechnungPruefen } from './wirtschaft';

// Parameter wie in den Vorlagen (content/…/M.ZO.PZ.WIRTSCHAFT, .ANGEBOTE)
const T = (i: Instanz, n: string) => (i.platzhalter[n] as Sprachobjekt).de;
const zahlL = (x: number): Loesung => ({ typ: 'zahl', wert: Math.round(x * 100) / 100 });
const auswahlL = (wert: number): Loesung => ({ typ: 'auswahl', wert });
/** alle Euro-Beträge im Text in Cent */
const cent = (t: string) =>
  [...t.matchAll(/(\d[\d\s]*(?:,\d\d)?) €/g)].map((m) =>
    Math.round(Number((m[1] ?? '').replace(/\s/g, '').replace(',', '.')) * 100),
  );
const prozente = (t: string) => [...t.matchAll(/(\d+) %/g)].map((m) => Number(m[1]));

pflichttests(rabattSkonto, {
  niveaus: { G: { mehrstufig: false }, M: { mehrstufig: true } },
  unabhaengigeLoesung(i) {
    const a = T(i, 'aufgabe');
    const [preis = 0] = cent(a);
    const pz = prozente(a);
    if (a.includes('ohne Mehrwertsteuer (netto). Dazu')) return zahlL((preis * 1.19) / 100);
    if (a.includes('einschließlich')) return zahlL(preis / 1.19 / 100);
    if (pz.length === 2)
      return zahlL((preis * (1 - (pz[0] ?? 0) / 100) * (1 - (pz[1] ?? 0) / 100)) / 100);
    return zahlL((preis * (1 - (pz[0] ?? 0) / 100)) / 100);
  },
  grenzverletzungen: (i) =>
    i.loesung.typ === 'zahl' && Number.isInteger(Math.round(i.loesung.wert * 1e6) / 1e4)
      ? []
      : ['keine ganzen Cent'],
  mindestensVerschieden: { G: 90, M: 90 },
});

pflichttests(rechnungPruefen, {
  niveaus: { G: { zeile: false }, M: { zeile: true } },
  unabhaengigeLoesung(i, p) {
    const t = T(i, 'rechnung');
    const [preis = 0, rabatt = 0, zwischen = 0, steuer = 0, ende = 0] = cent(t);
    const [satz = 0] = prozente(t);
    const ok = [
      rabatt === (preis * satz) / 100,
      zwischen === preis - rabatt,
      steuer === Math.round((zwischen * 19) / 100),
      ende === zwischen + steuer,
    ];
    if (!p.zeile) return auswahlL(ok.every(Boolean) ? 0 : 1);
    return auswahlL(ok.findIndex((x) => !x));
  },
  grenzverletzungen(i, p) {
    const t = T(i, 'rechnung');
    const [preis = 0, rabatt = 0, zwischen = 0, steuer = 0, ende = 0] = cent(t);
    const [satz = 0] = prozente(t);
    const falsch = [
      rabatt !== (preis * satz) / 100,
      zwischen !== preis - rabatt,
      steuer !== Math.round((zwischen * 19) / 100),
      ende !== zwischen + steuer,
    ].filter(Boolean).length;
    return falsch <= 1 && (!p.zeile || falsch === 1) ? [] : [`${falsch} falsche Zeilen`];
  },
  mindestensVerschieden: { G: 75, M: 90 },
});

pflichttests(angebotVergleich, {
  niveaus: { G: { raten: false }, M: { raten: true } },
  unabhaengigeLoesung(i, p) {
    const t = T(i, 'angebote');
    if (!p.raten) {
      const menge = Number(/brauchst (\d+)/.exec(t)?.[1]);
      const st = [...t.matchAll(/(\d+) Stück für/g)].map((m) => Number(m[1]));
      const [pa = 0, pb = 0] = cent(t);
      return auswahlL((menge / (st[0] ?? 1)) * pa < (menge / (st[1] ?? 1)) * pb ? 0 : 1);
    }
    const b = cent(t);
    const [skonto = 0] = prozente(t);
    const n = Number(/(\d+) Raten/.exec(t)?.[1]);
    const bar = (b[0] ?? 0) * (1 - skonto / 100);
    const raten = b.length === 3 ? (b[1] ?? 0) + n * (b[2] ?? 0) : n * (b[1] ?? 0);
    return auswahlL(bar < raten ? 0 : 1);
  },
  grenzverletzungen: () => [],
  mindestensVerschieden: { G: 90, M: 90 },
});

pflichttests(angebotKosten, {
  niveaus: { G: { raten: false }, M: { raten: true } },
  unabhaengigeLoesung(i, p) {
    const t = T(i, 'aufgabe');
    const b = cent(t);
    if (!p.raten) {
      const [n = 1, brauch = 0] = [...t.matchAll(/mit (\d+) |brauchst (\d+) /g)].map((m) =>
        Number(m[1] ?? m[2]),
      );
      return zahlL(((brauch / n) * (b[0] ?? 0)) / 100);
    }
    const n = Number(/(\d+) Raten/.exec(t)?.[1]);
    const gesamt = b.length === 3 ? (b[1] ?? 0) + n * (b[2] ?? 0) : n * (b[1] ?? 0);
    return zahlL((gesamt - (b[0] ?? 0)) / 100);
  },
  grenzverletzungen: (i) =>
    i.loesung.typ === 'zahl' && i.loesung.wert > 0 ? [] : ['keine Mehrkosten'],
  mindestensVerschieden: { G: 90, M: 90 },
});
