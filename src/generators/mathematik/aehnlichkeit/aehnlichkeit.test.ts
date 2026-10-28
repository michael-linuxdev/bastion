import type { Instanz, Loesung, Sprachobjekt } from '../../../core/learning/generator';
import { pflichttests } from '../../pflichttests';
import {
  aehnlichPruefen,
  aehnlichWaehlen,
  bildpunkt,
  bildstrecke,
  fehlendeSeite,
  schattenFlaeche,
} from './aehnlichkeit';

// Parameter wie in den Vorlagen (content/…/M.RF.AE.*)
const T = (i: Instanz, n: string) => (i.platzhalter[n] as Sprachobjekt).de;
const optionen = (i: Instanz) => (i.optionen ?? []).map((o) => o.text?.de ?? '');
const zahlL = (x: number): Loesung => ({ typ: 'zahl', wert: Math.round(x * 1e4) / 1e4 });
const auswahlL = (wert: number): Loesung => ({ typ: 'auswahl', wert });
const zahlAus = (t: string) => Number(t.replace('−', '-').replace(/\s/g, '').replace(',', '.'));
const N = '(−?\\d+(?:,\\d+)?)';
const nach = (t: string, re: RegExp) => zahlAus(re.exec(t)?.[1] ?? 'NaN');
const alleZahlen = (t: string) =>
  [...t.matchAll(new RegExp(N, 'g'))].map((m) => zahlAus(m[1] ?? ''));

pflichttests(bildstrecke, {
  niveaus: { G: { faktor_gesucht: false }, M: { faktor_gesucht: true } },
  unabhaengigeLoesung(i, p) {
    const a = T(i, 'aufgabe');
    if (!p.faktor_gesucht)
      return zahlL(nach(a, new RegExp(`AB ist ${N} cm`)) * nach(a, new RegExp(`k = ${N}`)));
    return zahlL(nach(a, new RegExp(`A'B' = ${N} cm`)) / nach(a, new RegExp(`AB = ${N} cm`)));
  },
  grenzverletzungen: () => [],
  mindestensVerschieden: { G: 65, M: 65 },
});

pflichttests(bildpunkt, {
  niveaus: { G: { zentrum_frei: false }, M: { zentrum_frei: true } },
  unabhaengigeLoesung(i) {
    const b = i.bild?.beschreibung.de ?? '';
    const [zx = 0, zy = 0, px = 0, py = 0] = alleZahlen(b);
    const k = zahlAus(T(i, 'faktor'));
    return { typ: 'punkt', wert: { x: zx + k * (px - zx) || 0, y: zy + k * (py - zy) || 0 } };
  },
  grenzverletzungen: (i, p) =>
    !p.zentrum_frei && T(i, 'zentrum') !== 'Z(0|0)' ? ['Z nicht im Ursprung'] : [],
  mindestensVerschieden: { G: 60, M: 85 },
});

/** Ähnlichkeit zweier Seitenlisten: alle Verhältnisse gleich (Reihenfolge wie angegeben) */
const aehnlicheSeiten = (s: number[], u: number[]) =>
  s.length === u.length &&
  s.every((x, i) => Math.abs((u[i] ?? 0) / x - (u[0] ?? 0) / (s[0] ?? 1)) < 1e-9);

pflichttests(aehnlichPruefen, {
  niveaus: { G: { winkel: false }, M: { winkel: true } },
  unabhaengigeLoesung(i, p) {
    const f = T(i, 'figuren');
    const [eins = '', zwei = ''] = f.split(p.winkel ? 'Dreieck 2' : 'Rechteck 2');
    const z1 = alleZahlen(eins).slice(p.winkel ? 1 : 1);
    const z2 = alleZahlen(zwei).slice(p.winkel ? 0 : 0);
    if (!p.winkel) return auswahlL(aehnlicheSeiten(z1, z2) ? 0 : 1);
    const winkel = ([a = 0, b = 0]: number[]) => [a, b, 180 - a - b].sort((x, y) => x - y).join();
    return auswahlL(winkel(z1) === winkel(z2) ? 0 : 1);
  },
  grenzverletzungen: () => [],
  mindestensVerschieden: { G: 85, M: 75 },
});

pflichttests(aehnlichWaehlen, {
  niveaus: { G: { winkel: false }, M: { winkel: true } },
  unabhaengigeLoesung(i) {
    const s = alleZahlen(T(i, 'figur'));
    return auswahlL(optionen(i).findIndex((o) => aehnlicheSeiten(s, alleZahlen(o))));
  },
  grenzverletzungen(i) {
    const s = alleZahlen(T(i, 'figur'));
    const n = optionen(i).filter((o) => aehnlicheSeiten(s, alleZahlen(o))).length;
    return n === 1 && optionen(i).length >= 3 ? [] : ['nicht genau eine ähnliche Figur'];
  },
  mindestensVerschieden: { G: 80, M: 80 },
});

pflichttests(fehlendeSeite, {
  niveaus: { G: { krumm: false }, M: { krumm: true } },
  unabhaengigeLoesung(i) {
    const a = T(i, 'aufgabe');
    return zahlL(
      (nach(a, new RegExp(`a' = ${N} cm`)) / nach(a, new RegExp(`a = ${N} cm`))) *
        nach(a, new RegExp(`b = ${N} cm`)),
    );
  },
  grenzverletzungen: (i, p) => {
    const a = T(i, 'aufgabe');
    const k = nach(a, new RegExp(`a' = ${N} cm`)) / nach(a, new RegExp(`a = ${N} cm`));
    return !p.krumm && !Number.isInteger(k) ? ['krummer Faktor auf G'] : [];
  },
  mindestensVerschieden: { G: 75, M: 85 },
});

pflichttests(schattenFlaeche, {
  niveaus: { G: { potenz: false }, M: { potenz: true } },
  unabhaengigeLoesung(i, p) {
    const a = T(i, 'aufgabe');
    if (!p.potenz) {
      const [stab = 0, schatten = 0, langer = 0] = alleZahlen(a);
      return zahlL((stab * langer) / schatten);
    }
    const k = nach(a, new RegExp(`k = ${N}`));
    if (a.includes('Würfel')) return zahlL(nach(a, new RegExp(`Volumen ${N} cm³`)) * k ** 3);
    return zahlL(nach(a, new RegExp(`Flächeninhalt ${N} cm²`)) * k ** 2);
  },
  grenzverletzungen: () => [],
  mindestensVerschieden: { G: 85, M: 85 },
});
