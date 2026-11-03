// Sachaufgaben lesen – Klasse 5 (M.ZO.SA.LESEN): die Frage finden, alle Angaben nutzen, die
// Rechenart aus der Sache wählen. Kurze Geschichten mit natürlichen Zahlen; G zwei, M drei
// Rechenschritte. Die falschen Rechnungen entsprechen den Fehlvorstellungen FV.SA.*:
// Zwischenergebnis statt Antwort, Rechenart nach Gewohnheit, Angabe übersehen.
import type { Generator, Sprachobjekt } from '../../../core/learning/generator';
import { fehlerbilderAus } from '../../../core/learning/loesung';
import { rng, type Rng } from '../../../core/rng/rng';
import { auswahl, de, mische, verlange, zahl } from '../../hilfen';

export type Fall = 'rueckgeld' | 'bus' | 'sparen';
export const FAELLE: readonly Fall[] = ['rueckgeld', 'bus', 'sparen'];

export interface LesenParameter {
  /** false: zwei Rechenschritte (G), true: drei (M) mit einer weiteren Angabe */
  readonly lang: boolean;
}

/** Eine Rechnung als Text (· und −) mit ihrem Wert */
export interface Rechnung {
  readonly text: string;
  readonly wert: number;
}

export interface Geschichte {
  readonly fall: Fall;
  readonly zahlen: readonly number[];
  readonly text: string;
  readonly frage: string;
  readonly richtig: Rechnung;
  readonly falsch: readonly (readonly [string, Rechnung])[];
  readonly weg: readonly string[];
}

const r = (text: string, wert: number): Rechnung => ({ text, wert });

/** Erzeugt eine Geschichte; würfelt neu, bis alle Werte verschieden und nicht negativ sind. */
export function geschichte(z: Rng, p: LesenParameter): Geschichte {
  for (let versuch = 0; versuch < 50; versuch++) {
    const g = entwurf(z, p);
    const werte = [g.richtig, ...g.falsch.map(([, x]) => x)].map((x) => x.wert);
    if (new Set(werte).size === werte.length && werte.every((w) => w >= 0)) return g;
  }
  // Sicherer Standardfall (INHALTSFORMAT §6.1 Regel 2)
  return {
    fall: 'rueckgeld',
    zahlen: [3, 4, 20],
    text: 'Lea kauft 3 Hefte zu je 4 €. Sie bezahlt mit einem 20-€-Schein.',
    frage: 'Wie viel Euro bekommt sie zurück?',
    richtig: r('20 − 3 · 4', 8),
    falsch: [
      ['zwischenergebnis', r('3 · 4', 12)],
      ['rechenart', r('20 − (3 + 4)', 13)],
    ],
    weg: ['Gesucht ist das Rückgeld.', 'Die Hefte kosten 3 · 4 € = 12 €.', '20 € − 12 € = 8 €'],
  };
}

function entwurf(z: Rng, p: LesenParameter): Geschichte {
  const fall = z.pick(FAELLE);
  if (fall === 'rueckgeld') {
    const a = z.int(2, 6);
    const b = z.int(2, 5);
    const c = z.pick([20, 50]);
    const d = z.int(3, 9);
    const preis = a * b;
    return p.lang
      ? {
          fall,
          zahlen: [a, b, c, d],
          text: `Lea kauft ${a} Hefte zu je ${b} € und eine Schere für ${d} €. Sie bezahlt mit einem ${c}-€-Schein.`,
          frage: 'Wie viel Euro bekommt sie zurück?',
          richtig: r(`${c} − ${a} · ${b} − ${d}`, c - preis - d),
          falsch: [
            ['zwischenergebnis', r(`${a} · ${b} + ${d}`, preis + d)],
            ['rechenart', r(`${c} − (${a} + ${b}) − ${d}`, c - a - b - d)],
            ['angabe-uebersehen', r(`${c} − ${a} · ${b}`, c - preis)],
          ],
          weg: [
            'Gesucht ist das Rückgeld.',
            `Ausgaben: ${a} · ${b} € + ${d} € = ${preis + d} €.`,
            `${c} € − ${preis + d} € = ${c - preis - d} €`,
          ],
        }
      : {
          fall,
          zahlen: [a, b, c],
          text: `Lea kauft ${a} Hefte zu je ${b} €. Sie bezahlt mit einem ${c}-€-Schein.`,
          frage: 'Wie viel Euro bekommt sie zurück?',
          richtig: r(`${c} − ${a} · ${b}`, c - preis),
          falsch: [
            ['zwischenergebnis', r(`${a} · ${b}`, preis)],
            ['rechenart', r(`${c} − (${a} + ${b})`, c - a - b)],
          ],
          weg: [
            'Gesucht ist das Rückgeld.',
            `Die Hefte kosten ${a} · ${b} € = ${preis} €.`,
            `${c} € − ${preis} € = ${c - preis} €`,
          ],
        };
  }
  if (fall === 'bus') {
    const a = z.int(20, 40);
    const b = z.int(3, 9);
    const c = z.int(2, 9);
    const d = z.int(2, 9);
    return p.lang
      ? {
          fall,
          zahlen: [a, b, c, d],
          text: `Im Bus sitzen ${a} Kinder. An der ersten Haltestelle steigen ${b} aus und ${c} ein. An der zweiten steigen ${d} aus.`,
          frage: 'Wie viele Kinder sitzen jetzt im Bus?',
          richtig: r(`${a} − ${b} + ${c} − ${d}`, a - b + c - d),
          falsch: [
            ['zwischenergebnis', r(`${a} − ${b} + ${c}`, a - b + c)],
            ['rechenart', r(`${a} + ${b} + ${c} + ${d}`, a + b + c + d)],
            ['angabe-uebersehen', r(`${a} − ${b} − ${d}`, a - b - d)],
          ],
          weg: [
            'Gesucht ist die Zahl der Kinder am Ende.',
            'Aussteigen heißt weniger, einsteigen heißt mehr.',
            `${a} − ${b} + ${c} − ${d} = ${a - b + c - d}`,
          ],
        }
      : {
          fall,
          zahlen: [a, b, c],
          text: `Im Bus sitzen ${a} Kinder. An der Haltestelle steigen ${b} aus und ${c} ein.`,
          frage: 'Wie viele Kinder sitzen jetzt im Bus?',
          richtig: r(`${a} − ${b} + ${c}`, a - b + c),
          falsch: [
            ['zwischenergebnis', r(`${a} − ${b}`, a - b)],
            ['rechenart', r(`${a} + ${b} + ${c}`, a + b + c)],
          ],
          weg: [
            'Gesucht ist die Zahl der Kinder am Ende.',
            'Aussteigen heißt weniger, einsteigen heißt mehr.',
            `${a} − ${b} + ${c} = ${a - b + c}`,
          ],
        };
  }
  const a = z.int(5, 30);
  const b = z.int(2, 6);
  const c = z.int(3, 8);
  const d = z.int(5, 15);
  return p.lang
    ? {
        fall,
        zahlen: [a, b, c, d],
        text: `Ben hat ${a} €. Er spart jede Woche ${b} € dazu. Nach ${c} Wochen kauft er ein Spiel für ${d} €.`,
        frage: 'Wie viel Euro hat er danach noch?',
        richtig: r(`${a} + ${b} · ${c} − ${d}`, a + b * c - d),
        falsch: [
          ['zwischenergebnis', r(`${a} + ${b} · ${c}`, a + b * c)],
          ['rechenart', r(`${a} + ${b} + ${c} − ${d}`, a + b + c - d)],
          ['angabe-uebersehen', r(`${b} · ${c} − ${d}`, b * c - d)],
        ],
        weg: [
          'Gesucht ist das Geld nach dem Kauf.',
          `Gespart: ${b} € · ${c} = ${b * c} €, zusammen ${a + b * c} €.`,
          `${a + b * c} € − ${d} € = ${a + b * c - d} €`,
        ],
      }
    : {
        fall,
        zahlen: [a, b, c],
        text: `Ben hat ${a} €. Er spart jede Woche ${b} € dazu.`,
        frage: `Wie viel Euro hat er nach ${c} Wochen?`,
        richtig: r(`${a} + ${b} · ${c}`, a + b * c),
        falsch: [
          ['zwischenergebnis', r(`${b} · ${c}`, b * c)],
          ['rechenart', r(`${a} + ${b} + ${c}`, a + b + c)],
        ],
        weg: [
          'Gesucht ist das Geld nach den Wochen.',
          `Gespart: ${b} € · ${c} = ${b * c} €.`,
          `${a} € + ${b * c} € = ${a + b * c} €`,
        ],
      };
}

const FEHLER = ['zwischenergebnis', 'rechenart', 'angabe-uebersehen'] as const;

function platzhalter(g: Geschichte): Record<string, Sprachobjekt | number> {
  return { geschichte: de(g.text), frage: de(g.frage), fall: de(g.fall) };
}

/** „Welche Rechnung beantwortet die Frage?“ (M.ZO.SA.LESEN.RECHNUNG) */
export const saRechnung: Generator<LesenParameter> = {
  id: 'sa.rechnung',
  version: 1,
  platzhalter: ['geschichte', 'frage', 'fall'],
  fehlerbildIds: FEHLER,

  erzeuge(seed, p) {
    verlange(typeof p.lang === 'boolean', 'lang: true oder false');
    const z = rng(seed);
    const g = geschichte(z, p);
    const liste = mische(z, [['richtig', g.richtig] as const, ...g.falsch]);
    const index = (id: string) => auswahl(liste.findIndex(([k]) => k === id));
    return {
      platzhalter: platzhalter(g),
      optionen: liste.map(([, x]) => ({ text: de(x.text) })),
      loesung: index('richtig'),
      loesungsweg: g.weg.map(de),
      fehlerbilder: g.falsch.map(([id]) => ({ id, antwort: index(id) })),
    };
  },
};

/** „Rechne aus.“ – dieselben Geschichten mit Zahl als Antwort (M.ZO.SA.LESEN.ERGEBNIS) */
export const saErgebnis: Generator<LesenParameter> = {
  id: 'sa.ergebnis',
  version: 1,
  platzhalter: ['geschichte', 'frage', 'fall'],
  fehlerbildIds: FEHLER,

  erzeuge(seed, p) {
    verlange(typeof p.lang === 'boolean', 'lang: true oder false');
    const g = geschichte(rng(seed), p);
    const richtig = zahl(g.richtig.wert);
    return {
      platzhalter: platzhalter(g),
      loesung: richtig,
      loesungsweg: g.weg.map(de),
      fehlerbilder: fehlerbilderAus(
        richtig,
        g.falsch.map(([id, x]) => [id, zahl(x.wert)]),
      ),
    };
  },
};
