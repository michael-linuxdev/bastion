import type { Instanz, Loesung, Sprachobjekt } from '../../../core/learning/generator';
import { pflichttests } from '../../pflichttests';
import { rechneRational as rechne } from '../../testhilfen';
import {
  begriffeErkennen,
  bequem,
  grundaufgabeBerechnen,
  kapitalNachJahren,
  neuerPreis,
  umAuf,
  welcheRechnung,
  zinsen,
} from './prozent';

// Parameter wie in den Vorlagen (content/…/M.ZO.PZ.*)
const T = (i: Instanz, n: string) => (i.platzhalter[n] as Sprachobjekt).de;
const zahlL = (x: number): Loesung => ({ typ: 'zahl', wert: Number(x.toFixed(6)) });
/** alle Zahlen eines Textes („1 200“ und „12,50“ eingeschlossen) */
const zahlen = (t: string) =>
  (t.replace(/(\d)\s(\d{3})/g, '$1$2').match(/\d+(,\d+)?/g) ?? []).map((z) =>
    Number(z.replace(',', '.')),
  );
const wert = (i: Instanz) => (i.loesung.typ === 'zahl' ? i.loesung.wert : NaN);
const centGenau = (x: number) => Math.abs(x * 100 - Math.round(x * 100)) < 1e-6;

pflichttests(begriffeErkennen, {
  niveaus: { G: { vertauscht: false }, M: { vertauscht: true } },
  unabhaengigeLoesung(i) {
    // Grundwert = größte Zahl ohne %, Prozentwert = kleinere Zahl ohne %, Prozentsatz = mit %
    const o = (i.optionen ?? []).map((x) => x.text?.de ?? '');
    const ohne = o.filter((t) => !t.includes('%')).map((t) => zahlen(t)[0] ?? 0);
    const g = Math.max(...ohne);
    const rolle = T(i, 'rolle');
    const index = o.findIndex((t) =>
      rolle === 'den Prozentsatz'
        ? t.includes('%')
        : !t.includes('%') && (zahlen(t)[0] === g) === (rolle === 'den Grundwert'),
    );
    return { typ: 'auswahl', wert: index };
  },
  grenzverletzungen(i, p) {
    return !p.vertauscht && /^\d+ von/.test(T(i, 'geschichte')) ? ['Prozentwert zuerst auf G'] : [];
  },
  mindestensVerschieden: { G: 40, M: 50 },
});

pflichttests(bequem, {
  niveaus: { G: { saetze: [10, 25, 50, 100] }, M: { saetze: [1, 5, 20, 75] } },
  unabhaengigeLoesung(i) {
    const p = zahlen(T(i, 'prozentsatz'))[0] ?? NaN;
    const g = zahlen(T(i, 'grundwert'))[0] ?? NaN;
    return zahlL((p / 100) * g);
  },
  grenzverletzungen(i, p) {
    const ps = zahlen(T(i, 'prozentsatz'))[0] ?? NaN;
    const f: string[] = [];
    if (!p.saetze.includes(ps)) f.push(`Prozentsatz ${ps}`);
    if (!Number.isInteger(wert(i))) f.push('Ergebnis nicht ganz');
    if ((zahlen(T(i, 'grundwert'))[0] ?? 0) > 400) f.push('Grundwert zu groß');
    return f;
  },
  mindestensVerschieden: { G: 60, M: 60 },
});

pflichttests(grundaufgabeBerechnen, {
  niveaus: { G: { alle: false }, M: { alle: true } },
  unabhaengigeLoesung(i) {
    const t = T(i, 'aufgabe');
    const [a = NaN, b = NaN] = zahlen(t);
    if (t.startsWith('Berechne')) return zahlL((a * b) / 100);
    if (t.includes('Grundwert')) return zahlL((b / a) * 100);
    return zahlL((a / b) * 100);
  },
  grenzverletzungen(i, p) {
    const f: string[] = [];
    if (!p.alle && !T(i, 'aufgabe').startsWith('Berechne')) f.push('andere Grundaufgabe auf G');
    if (!Number.isInteger(wert(i))) f.push('Ergebnis nicht ganz');
    return f;
  },
  mindestensVerschieden: { G: 90, M: 90 },
});

pflichttests(welcheRechnung, {
  niveaus: { G: { alle: false }, M: { alle: true } },
  unabhaengigeLoesung(i) {
    const t = T(i, 'aufgabe');
    const [a = NaN, b = NaN] = zahlen(t);
    const ziel = t.startsWith('Berechne')
      ? (a * b) / 100
      : t.includes('Grundwert')
        ? (b / a) * 100
        : (a / b) * 100;
    const index = (i.optionen ?? []).findIndex(
      (o) => Math.abs(rechne(o.text?.de ?? '') - ziel) < 1e-9,
    );
    return { typ: 'auswahl', wert: index };
  },
  grenzverletzungen(i, p) {
    return !p.alle && !T(i, 'aufgabe').startsWith('Berechne') ? ['andere Grundaufgabe auf G'] : [];
  },
  mindestensVerschieden: { G: 90, M: 90 },
});

pflichttests(neuerPreis, {
  niveaus: { G: { rueckwaerts: false }, M: { rueckwaerts: true } },
  unabhaengigeLoesung(i) {
    const t = T(i, 'geschichte');
    const [betrag = NaN, p = NaN] = zahlen(t);
    const hoch = /steigt|gestiegen/.test(t);
    const faktor = 1 + ((hoch ? 1 : -1) * p) / 100;
    return zahlL(t.includes('vorher') ? betrag / faktor : betrag * faktor);
  },
  grenzverletzungen(i, p) {
    const f: string[] = [];
    if (!centGenau(wert(i))) f.push('nicht auf den Cent genau');
    if (!p.rueckwaerts && T(i, 'geschichte').includes('vorher')) f.push('rückwärts auf G');
    return f;
  },
  mindestensVerschieden: { G: 90, M: 90 },
});

pflichttests(umAuf, {
  niveaus: { G: { erweitert: false }, M: { erweitert: true } },
  unabhaengigeLoesung(i) {
    const t = T(i, 'geschichte');
    const [alt = NaN, neu = NaN] = zahlen(t);
    return zahlL(
      t.includes('Auf wie viel') ? (neu / alt) * 100 : (Math.abs(neu - alt) / alt) * 100,
    );
  },
  grenzverletzungen(i, p) {
    const t = T(i, 'geschichte');
    const f: string[] = [];
    if (!p.erweitert && (t.includes('sinkt') || t.includes('Auf wie viel'))) f.push('M-Fall auf G');
    if (!Number.isInteger(wert(i))) f.push('Prozentsatz nicht ganz');
    return f;
  },
  mindestensVerschieden: { G: 60, M: 80 },
});

pflichttests(zinsen, {
  niveaus: { G: { erweitert: false }, M: { erweitert: true } },
  unabhaengigeLoesung(i) {
    const t = T(i, 'aufgabe');
    const n = zahlen(t);
    if (t.includes('Tage')) {
      const [k = NaN, tage = NaN, p = NaN] = n;
      return zahlL((((k * p) / 100) * tage) / 360);
    }
    if (t.includes('Zinssatz (in %)')) return zahlL(((n[1] ?? NaN) / (n[0] ?? NaN)) * 100);
    if (t.includes('angelegt')) return zahlL(((n[1] ?? NaN) / (n[0] ?? NaN)) * 100);
    return zahlL(((n[0] ?? NaN) * (n[1] ?? NaN)) / 100);
  },
  grenzverletzungen(i, p) {
    const f: string[] = [];
    if (!centGenau(wert(i))) f.push('nicht auf den Cent genau');
    if (!p.erweitert && /Tage|Zinssatz \(|angelegt/.test(T(i, 'aufgabe'))) f.push('M-Fall auf G');
    return f;
  },
  mindestensVerschieden: { G: 75, M: 85 },
});

pflichttests(kapitalNachJahren, {
  niveaus: { G: { erweitert: false }, M: { erweitert: true } },
  unabhaengigeLoesung(i) {
    const t = T(i, 'aufgabe');
    const [k = NaN, p = NaN] = zahlen(t);
    const jahre = t.includes('zwei Jahre') ? 2 : 1;
    return zahlL(k * (1 + p / 100) ** jahre);
  },
  grenzverletzungen(i) {
    return centGenau(wert(i)) ? [] : ['nicht auf den Cent genau'];
  },
  mindestensVerschieden: { G: 70, M: 70 },
});
