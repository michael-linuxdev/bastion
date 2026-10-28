import type { Bruch } from '../../../core/learning/bruch';
import type { Instanz } from '../../../core/learning/generator';
import { pflichttests } from '../../pflichttests';
import { kreisAnteil, kreisWinkel, relativeHaeufigkeit, strichliste } from './zufall';

const Z = (i: Instanz, n: string) => i.platzhalter[n] as number;

pflichttests(strichliste, {
  niveaus: { G: { anzahl_max: 12 }, M: { anzahl_max: 30 } },
  unabhaengigeLoesung(i) {
    // Striche im Bild zählen: Zeile der gefragten Augenzahl, senkrechte Striche + Querstriche
    const svg = i.bild?.svg ?? '';
    const zeile = Z(i, 'augen') - 1;
    const y = 22 + zeile * 30;
    const senkrecht = [
      ...svg.matchAll(
        /<line x1="([\d.]+)" y1="([\d.]+)" x2="([\d.]+)" y2="([\d.]+)" stroke-width="1.6"\/>/g,
      ),
    ]
      .map((m) => m.slice(1).map(Number))
      .filter(
        ([, y1, , y2]) =>
          Math.min(y1 ?? 0, y2 ?? 0) >= y - 10 && Math.max(y1 ?? 0, y2 ?? 0) <= y + 10,
      );
    return { typ: 'zahl', wert: senkrecht.length };
  },
  grenzverletzungen(i, p) {
    const w = i.loesung.typ === 'zahl' ? i.loesung.wert : 0;
    return w >= 5 && w <= Math.max(p.anzahl_max, 9) ? [] : [`Anzahl ${w} außerhalb`];
  },
  mindestensVerschieden: { G: 60, M: 80 },
});

pflichttests(relativeHaeufigkeit, {
  niveaus: { G: { wuerfe: [10, 20, 25, 50, 100] }, M: { wuerfe: [40, 80, 120, 200] } },
  unabhaengigeLoesung(i) {
    const werte = (i.bild?.beschreibung.de ?? '').split('; ')[1]?.match(/\d+/g)?.map(Number) ?? [];
    const gefragt = werte[Z(i, 'augen') - 1] ?? 0;
    const summe = werte.reduce((s, x) => s + x, 0);
    return { typ: 'zahl', wert: Number(((gefragt / summe) * 100).toFixed(6)) };
  },
  grenzverletzungen(i, p) {
    const werte = (i.bild?.beschreibung.de ?? '').split('; ')[1]?.match(/\d+/g)?.map(Number) ?? [];
    const f: string[] = [];
    if (werte.reduce((s, x) => s + x, 0) !== Z(i, 'n')) f.push('Summe ≠ n');
    if (!p.wuerfe.includes(Z(i, 'n'))) f.push('n nicht erlaubt');
    if (i.loesung.typ === 'zahl' && !Number.isInteger(i.loesung.wert)) f.push('Prozent nicht ganz');
    return f;
  },
  mindestensVerschieden: { G: 80, M: 80 },
});

pflichttests(kreisAnteil, {
  niveaus: {
    G: { nenner: [2, 3, 4, 5], einteilung: true },
    M: { nenner: [4, 6, 8, 12], einteilung: false },
  },
  unabhaengigeLoesung(i) {
    const d = i.bild?.beschreibung.de ?? '';
    const geteilt = /in (\d+) gleich große Teile geteilt\. (\d+) davon/.exec(d);
    const b: Bruch = geteilt
      ? { zaehler: Number(geteilt[2]), nenner: Number(geteilt[1]) }
      : (() => {
          const w = Number(/Mittelpunktswinkel von (\d+)°/.exec(d)?.[1]);
          // Winkel als Bruch von 360°, gekürzt
          let [z, n] = [w, 360];
          for (let t = z; t > 1; t--)
            if (z % t === 0 && n % t === 0) {
              [z, n] = [z / t, n / t];
              break;
            }
          return { zaehler: z, nenner: n };
        })();
    return { typ: 'bruch', wert: b };
  },
  grenzverletzungen(i, p) {
    return i.loesung.typ === 'bruch' && p.nenner.includes(i.loesung.wert.nenner)
      ? []
      : ['Nenner nicht erlaubt'];
  },
  // G hat 8, M 12 mögliche Anteile
  mindestensVerschieden: { G: 6, M: 9 },
});

pflichttests(kreisWinkel, {
  niveaus: { G: { prozent: false }, M: { prozent: true } },
  unabhaengigeLoesung(i) {
    const t = (i.platzhalter['anteil'] as { de: string }).de;
    const prozent = /^(\d+) %$/.exec(t);
    if (prozent)
      return { typ: 'zahl', wert: Number(((Number(prozent[1]) / 100) * 360).toFixed(6)) };
    const [z, n] = t.split('/').map(Number);
    return { typ: 'zahl', wert: ((z ?? 0) / (n ?? 1)) * 360 };
  },
  grenzverletzungen: (i) =>
    i.loesung.typ === 'zahl' && i.loesung.wert > 0 && i.loesung.wert < 360
      ? []
      : ['Winkel außerhalb'],
  mindestensVerschieden: { G: 12, M: 13 },
});
