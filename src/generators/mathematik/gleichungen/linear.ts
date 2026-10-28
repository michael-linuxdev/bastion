// Terme und Gleichungen – Klasse 7 (LEHRPLAN §8c, Feld GL): Termwerte, Lösungen
// prüfen, lineare Gleichungen lösen, Umformungsschritte, Formeln umstellen und
// anwenden, Gleichungen zu Zahlenrätseln und Sachaufgaben aufstellen.
import { zahlText } from '../../../core/learning/text';
import type { Generator } from '../../../core/learning/generator';
import { fehlerbilderAus } from '../../../core/learning/loesung';
import { rng, type Rng } from '../../../core/rng/rng';
import { auswahl, de, mische, verlange, zahl } from '../../hilfen';

const ohneNull = (x: number) => (x === 0 ? 0 : x);
const zz = (x: number) => zahl(ohneNull(x));
/** Zahl in einem Term: negative Zahlen in Klammern */
const k = (x: number) => (x < 0 ? `(${zahlText(x)})` : zahlText(x));
const ganzOhneNull = (r: Rng, max: number) => r.int(1, max) * (r.int(0, 1) === 0 ? -1 : 1);

/** a · x + b als Text, z. B. „3 · x − 5“, „−x + 4“, „2 · x“ */
export function linear(a: number, b: number, v = 'x'): string {
  const teilA = a === 1 ? v : a === -1 ? `−${v}` : `${zahlText(a)} · ${v}`;
  if (a === 0) return zahlText(b);
  if (b === 0) return teilA;
  return `${teilA} ${b < 0 ? '−' : '+'} ${zahlText(Math.abs(b))}`;
}

// ---------------------------------------------------------------------------
// Termwerte (M.SF.GL.TERMWERT.EINSETZEN)

export interface TermwertParameter {
  /** auch Quadrate und Klammern, x auch als Dezimalzahl */
  readonly erweitert: boolean;
}

type TermArt = 'linear' | 'klammer' | 'quadrat';

/** „Berechne 3 · x − 5 für x = −2.“ */
export const termwert: Generator<TermwertParameter> = {
  id: 'gl.termwert',
  version: 1,
  platzhalter: ['term', 'x'],
  fehlerbildIds: ['minus-vergessen', 'quadrat-vorzeichen', 'links-nach-rechts'],

  erzeuge(seed, p) {
    const r = rng(seed);
    const art: TermArt = p.erweitert ? r.pick(['linear', 'klammer', 'quadrat'] as const) : 'linear';
    const x =
      p.erweitert && art === 'linear' && r.int(0, 2) === 0
        ? -r.int(1, 9) / 2 // halbe Zahlen: −0,5 … −4,5
        : -r.int(1, 9);
    const a = ganzOhneNull(r, 9);
    const b = ganzOhneNull(r, 12);
    let term: string;
    let f: (v: number) => number;
    let linksNachRechts: number | undefined;
    if (art === 'linear') {
      term = linear(a, b);
      f = (v) => a * v + b;
      linksNachRechts = undefined;
    } else if (art === 'klammer') {
      // a · (x + b)
      term = `${zahlText(a)} · (${linear(1, b)})`;
      f = (v) => a * (v + b);
      linksNachRechts = a * x + b;
    } else {
      // x² + a · x  bzw.  x² − a · x
      term = `x² ${a < 0 ? '−' : '+'} ${zahlText(Math.abs(a))} · x`;
      f = (v) => v * v + a * v;
      linksNachRechts = undefined;
    }
    const wert = f(x);
    const richtig = zz(wert);
    return {
      platzhalter: { term: de(term), x },
      vorzeichen: true,
      loesung: richtig,
      loesungsweg: [
        de(`Setze für x die Zahl ${k(x)} ein – mit Klammer, damit das Minus nicht verloren geht.`),
        de(`${term.replace(/x/g, k(x))} = ${zahlText(wert)}`),
      ],
      fehlerbilder: fehlerbilderAus(richtig, [
        ['minus-vergessen', zz(f(-x))],
        ['quadrat-vorzeichen', art === 'quadrat' ? zz(-(x * x) + a * x) : undefined],
        ['links-nach-rechts', linksNachRechts === undefined ? undefined : zz(linksNachRechts)],
      ]),
    };
  },
};

// ---------------------------------------------------------------------------
// Ist die Zahl eine Lösung? (M.SF.GL.TERMWERT.PROBE)

export interface IstLoesungParameter {
  /** auch Gleichungen mit x auf beiden Seiten */
  readonly beidseitig: boolean;
}

/** „Ist x = −3 eine Lösung von 2 · x + 7 = 1?“ – ja oder nein */
export const istLoesung: Generator<IstLoesungParameter> = {
  id: 'gl.ist-loesung',
  version: 1,
  platzhalter: ['x', 'gleichung'],
  fehlerbildIds: ['minus-vergessen', 'nur-eine-seite'],

  erzeuge(seed, p) {
    const r = rng(seed);
    const loesung = ganzOhneNull(r, 8);
    const a = ganzOhneNull(r, 6);
    const b = ganzOhneNull(r, 10);
    const c = p.beidseitig && r.int(0, 1) === 0 ? ganzOhneNull(r, 6) : 0;
    const cc = c === a ? a + 1 : c; // nie dieselbe Zahl vor x auf beiden Seiten
    // rechte Seite: cc · x + d mit derselben Lösung
    const d = a * loesung + b - cc * loesung;
    const gleichung = `${linear(a, b)} = ${linear(cc, d)}`;
    // Geprüft wird entweder die Lösung, ihre Gegenzahl oder eine Nachbarzahl
    const fall = r.int(0, 2);
    const x = fall === 0 ? loesung : fall === 1 ? -loesung : loesung + (r.int(0, 1) === 0 ? 1 : -1);
    const links = a * x + b;
    const rechts = cc * x + d;
    const stimmt = links === rechts;
    const richtig = auswahl(stimmt ? 0 : 1);
    return {
      platzhalter: { x, gleichung: de(gleichung) },
      optionen: [{ text: de('ja') }, { text: de('nein') }],
      loesung: richtig,
      loesungsweg: [
        de(`Setze x = ${zahlText(x)} auf beiden Seiten ein.`),
        de(`Links: ${zahlText(links)}. Rechts: ${zahlText(rechts)}.`),
        de(
          stimmt
            ? 'Beide Seiten sind gleich – die Zahl ist eine Lösung.'
            : 'Die Seiten sind verschieden – keine Lösung.',
        ),
      ],
      fehlerbilder: fehlerbilderAus(richtig, [
        // Wer das Minus beim Einsetzen verliert, prüft eigentlich −x
        ['minus-vergessen', fall === 1 ? auswahl(0) : undefined],
        ['nur-eine-seite', stimmt ? undefined : auswahl(0)],
      ]),
    };
  },
};

// ---------------------------------------------------------------------------
// Lineare Gleichungen lösen (M.SF.GL.LINEAR.LOESEN)

export interface LinearParameter {
  readonly formen: readonly ('einfach' | 'beidseitig' | 'klammer')[];
}

/** „Löse: 3 · x + 4 = −11“, „5 · x − 2 = 3 · x + 6“, „3 · (x − 2) = 18“ */
export const linearLoesen: Generator<LinearParameter> = {
  id: 'gl.linear-loesen',
  version: 1,
  platzhalter: ['gleichung'],
  fehlerbildIds: ['falsche-richtung', 'nicht-geteilt', 'vorzeichen-falsch'],

  erzeuge(seed, p) {
    verlange(p.formen.length > 0, 'formen fehlt');
    const r = rng(seed);
    const form = r.pick(p.formen);
    const x = ganzOhneNull(r, 10);
    let a = ganzOhneNull(r, 9);
    if (Math.abs(a) === 1) a = 2 * Math.sign(a);
    const b = ganzOhneNull(r, 15);
    let gleichung: string;
    let weg: string[];
    let falscheRichtung: number | undefined;
    let nichtGeteilt: number | undefined;
    if (form === 'einfach') {
      // a · x + b = c
      const c = a * x + b;
      gleichung = `${linear(a, b)} = ${zahlText(c)}`;
      weg = [
        `${b < 0 ? `+ ${zahlText(-b)}` : `− ${zahlText(b)}`} auf beiden Seiten: ${linear(a, 0)} = ${zahlText(c - b)}`,
        `: ${k(a)} auf beiden Seiten: x = ${zahlText(x)}`,
      ];
      falscheRichtung = (c + b) % a === 0 ? (c + b) / a : undefined;
      nichtGeteilt = c - b;
    } else if (form === 'beidseitig') {
      // a · x + b = c · x + d  mit c ≠ a
      let c = ganzOhneNull(r, 9);
      if (c === a) c = a > 0 ? a - 1 || -1 : a + 1 || 1;
      const d = a * x + b - c * x;
      gleichung = `${linear(a, b)} = ${linear(c, d)}`;
      weg = [
        `${c < 0 ? `+ ${linear(-c, 0)}` : `− ${linear(c, 0)}`} auf beiden Seiten: ${linear(a - c, b)} = ${zahlText(d)}`,
        `${b < 0 ? `+ ${zahlText(-b)}` : `− ${zahlText(b)}`}: ${linear(a - c, 0)} = ${zahlText(d - b)}`,
        `: ${k(a - c)}: x = ${zahlText(x)}`,
      ];
      falscheRichtung = (d + b) % (a - c) === 0 ? (d + b) / (a - c) : undefined;
      nichtGeteilt = a - c === 1 ? undefined : d - b;
    } else {
      // a · (x + b) = c
      const c = a * (x + b);
      gleichung = `${zahlText(a)} · (${linear(1, b)}) = ${zahlText(c)}`;
      weg = [
        `: ${k(a)} auf beiden Seiten: ${linear(1, b)} = ${zahlText(x + b)}`,
        `${b < 0 ? `+ ${zahlText(-b)}` : `− ${zahlText(b)}`}: x = ${zahlText(x)}`,
      ];
      falscheRichtung = c / a + b;
      nichtGeteilt = c - b;
    }
    const richtig = zz(x);
    return {
      platzhalter: { gleichung: de(gleichung) },
      vorzeichen: true,
      loesung: richtig,
      loesungsweg: [
        ...weg.map(de),
        de(`Probe: x = ${zahlText(x)} einsetzen – beide Seiten sind gleich.`),
      ],
      fehlerbilder: fehlerbilderAus(richtig, [
        ['falsche-richtung', falscheRichtung === undefined ? undefined : zz(falscheRichtung)],
        ['nicht-geteilt', nichtGeteilt === undefined ? undefined : zz(nichtGeteilt)],
        ['vorzeichen-falsch', zz(-x)],
      ]),
    };
  },
};

// ---------------------------------------------------------------------------
// Umformungsschritt erkennen (M.SF.GL.LINEAR.UMFORMUNG)

export interface UmformungParameter {
  readonly beidseitig: boolean;
}

/** „3 · x + 4 = 19 wird zu 3 · x = 15. Was wurde auf beiden Seiten gerechnet?“ */
export const umformung: Generator<UmformungParameter> = {
  id: 'gl.umformung',
  version: 1,
  platzhalter: ['vorher', 'nachher'],
  fehlerbildIds: ['rechenzeichen-verdreht', 'falsche-zahl'],

  erzeuge(seed, p) {
    const r = rng(seed);
    const x = ganzOhneNull(r, 9);
    let a = ganzOhneNull(r, 9);
    if (Math.abs(a) === 1) a = 3;
    const b = ganzOhneNull(r, 15);
    const art = p.beidseitig ? r.int(0, 2) : r.int(0, 1);
    let vorher: string;
    let nachher: string;
    let schritt: string;
    let verdreht: string;
    let falsch: string;
    if (art === 0) {
      // b wegrechnen
      const c = a * x + b;
      vorher = `${linear(a, b)} = ${zahlText(c)}`;
      nachher = `${linear(a, 0)} = ${zahlText(c - b)}`;
      schritt = b < 0 ? `+ ${zahlText(-b)}` : `− ${zahlText(b)}`;
      verdreht = b < 0 ? `− ${zahlText(-b)}` : `+ ${zahlText(b)}`;
      falsch = `: ${k(a)}`;
    } else if (art === 1) {
      // durch a teilen
      vorher = `${linear(a, 0)} = ${zahlText(a * x)}`;
      nachher = `x = ${zahlText(x)}`;
      schritt = `: ${k(a)}`;
      verdreht = `· ${k(a)}`;
      falsch = a < 0 ? `+ ${zahlText(-a)}` : `− ${zahlText(a)}`;
    } else {
      // c · x auf die andere Seite
      let c = ganzOhneNull(r, 9);
      if (c === a) c = a + 1 === 0 ? a + 2 : a + 1;
      const d = a * x + b - c * x;
      vorher = `${linear(a, b)} = ${linear(c, d)}`;
      nachher = `${linear(a - c, b)} = ${zahlText(d)}`;
      schritt = c < 0 ? `+ ${linear(-c, 0)}` : `− ${linear(c, 0)}`;
      verdreht = c < 0 ? `− ${linear(-c, 0)}` : `+ ${linear(c, 0)}`;
      falsch = d < 0 ? `+ ${zahlText(-d)}` : `− ${zahlText(d)}`;
    }
    const kandidaten = mische(r, [schritt, verdreht, falsch]);
    const index = (s: string) => auswahl(kandidaten.indexOf(s));
    const richtig = index(schritt);
    return {
      platzhalter: { vorher: de(vorher), nachher: de(nachher) },
      optionen: kandidaten.map((s) => ({ text: de(`${s} auf beiden Seiten`) })),
      loesung: richtig,
      loesungsweg: [
        de(`Aus ${vorher} wird ${nachher}.`),
        de(`Auf beiden Seiten wurde „${schritt}“ gerechnet.`),
      ],
      fehlerbilder: fehlerbilderAus(richtig, [
        ['rechenzeichen-verdreht', index(verdreht)],
        ['falsche-zahl', index(falsch)],
      ]),
    };
  },
};

// ---------------------------------------------------------------------------
// Formeln umstellen (M.SF.GL.FORMELN.UMSTELLEN)

interface Formel {
  readonly formel: string;
  readonly nach: string;
  readonly richtig: string;
  readonly umkehr: string;
  readonly kehrwert: string;
  readonly sonst: string;
  readonly erweitert: boolean;
}

const FORMELN: readonly Formel[] = [
  {
    formel: 'u = 4 · a',
    nach: 'a',
    richtig: 'a = u : 4',
    umkehr: 'a = u · 4',
    kehrwert: 'a = 4 : u',
    sonst: 'a = u − 4',
    erweitert: false,
  },
  {
    formel: 'A = a · b',
    nach: 'b',
    richtig: 'b = A : a',
    umkehr: 'b = A · a',
    kehrwert: 'b = a : A',
    sonst: 'b = A − a',
    erweitert: false,
  },
  {
    formel: 's = v · t',
    nach: 't',
    richtig: 't = s : v',
    umkehr: 't = s · v',
    kehrwert: 't = v : s',
    sonst: 't = s − v',
    erweitert: false,
  },
  {
    formel: 'V = G · h',
    nach: 'h',
    richtig: 'h = V : G',
    umkehr: 'h = V · G',
    kehrwert: 'h = G : V',
    sonst: 'h = V − G',
    erweitert: false,
  },
  {
    formel: 'v = s : t',
    nach: 's',
    richtig: 's = v · t',
    umkehr: 's = v : t',
    kehrwert: 's = t : v',
    sonst: 's = v + t',
    erweitert: true,
  },
  {
    formel: 'V = a · b · c',
    nach: 'c',
    richtig: 'c = V : (a · b)',
    umkehr: 'c = V · a · b',
    kehrwert: 'c = (a · b) : V',
    sonst: 'c = V : a · b',
    erweitert: true,
  },
  {
    formel: 'A = g · h : 2',
    nach: 'h',
    richtig: 'h = 2 · A : g',
    umkehr: 'h = A : 2 · g',
    kehrwert: 'h = g : (2 · A)',
    sonst: 'h = A : g',
    erweitert: true,
  },
  {
    formel: 'u = 2 · a + 2 · b',
    nach: 'b',
    richtig: 'b = (u − 2 · a) : 2',
    umkehr: 'b = (u + 2 · a) : 2',
    kehrwert: 'b = 2 : (u − 2 · a)',
    sonst: 'b = u − 2 · a',
    erweitert: true,
  },
];

export interface FormelUmstellenParameter {
  readonly erweitert: boolean;
}

/** „Stelle A = a · b nach b um.“ – vier Antworten */
export const formelUmstellen: Generator<FormelUmstellenParameter> = {
  id: 'gl.formel-umstellen',
  version: 1,
  platzhalter: ['formel', 'nach'],
  fehlerbildIds: ['umkehr-falsch', 'kehrwert', 'falsche-rechenart'],

  erzeuge(seed, p) {
    const r = rng(seed);
    const f = r.pick(FORMELN.filter((x) => p.erweitert || !x.erweitert));
    const optionen = mische(r, [f.richtig, f.umkehr, f.kehrwert, f.sonst]);
    const index = (s: string) => auswahl(optionen.indexOf(s));
    const richtig = index(f.richtig);
    return {
      platzhalter: { formel: de(f.formel), nach: de(f.nach) },
      optionen: optionen.map((s) => ({ text: de(s) })),
      loesung: richtig,
      loesungsweg: [
        de(
          `Bringe alles außer ${f.nach} auf die andere Seite – mit der Umkehrrechnung: Aus · wird :, aus + wird −.`,
        ),
        de(f.richtig),
      ],
      fehlerbilder: fehlerbilderAus(richtig, [
        ['umkehr-falsch', index(f.umkehr)],
        ['kehrwert', index(f.kehrwert)],
        ['falsche-rechenart', index(f.sonst)],
      ]),
    };
  },
};

// ---------------------------------------------------------------------------
// Formeln anwenden (M.SF.GL.FORMELN.ANWENDEN)

export interface FormelAnwendenParameter {
  readonly erweitert: boolean;
}

/** „Ein Quader hat V = 120 cm³, a = 4 cm, b = 5 cm. Berechne c.“ */
export const formelAnwenden: Generator<FormelAnwendenParameter> = {
  id: 'gl.formel-anwenden',
  version: 1,
  platzhalter: ['aufgabe'],
  fehlerbildIds: ['multipliziert', 'nur-durch-eine'],

  erzeuge(seed, p) {
    const r = rng(seed);
    const art = r.int(0, p.erweitert ? 4 : 2);
    let text: string;
    let wert: number;
    let weg: string;
    let multipliziert: number | undefined;
    let nurEine: number | undefined;
    if (art === 0) {
      const a = r.int(2, 15);
      const b = r.int(2, 15);
      text = `Ein Rechteck hat den Flächeninhalt A = ${a * b} cm² und die Länge a = ${a} cm. Berechne die Breite b (in cm). Formel: A = a · b`;
      wert = b;
      weg = `b = A : a = ${a * b} : ${a} = ${b}`;
      multipliziert = a * b * a;
    } else if (art === 1) {
      const v = r.pick([4, 5, 12, 15, 50, 60, 80]);
      const t = r.int(2, 9);
      text = `Ein Radfahrer fährt mit v = ${v} km/h und legt s = ${v * t} km zurück. Wie viele Stunden t braucht er? Formel: s = v · t`;
      wert = t;
      weg = `t = s : v = ${v * t} : ${v} = ${t}`;
      multipliziert = v * t * v;
    } else if (art === 2) {
      const a = r.int(2, 25);
      text = `Ein Quadrat hat den Umfang u = ${4 * a} cm. Berechne die Seitenlänge a (in cm). Formel: u = 4 · a`;
      wert = a;
      weg = `a = u : 4 = ${4 * a} : 4 = ${a}`;
      multipliziert = 16 * a;
    } else if (art === 3) {
      const a = r.int(2, 10);
      const b = r.int(2, 10);
      const c = r.int(2, 10);
      text = `Ein Quader hat das Volumen V = ${a * b * c} cm³, a = ${a} cm und b = ${b} cm. Berechne c (in cm). Formel: V = a · b · c`;
      wert = c;
      weg = `c = V : (a · b) = ${a * b * c} : ${a * b} = ${c}`;
      multipliziert = a * b * c * a * b;
      nurEine = b * c;
    } else {
      const a = r.int(2, 20);
      const b = r.int(2, 20);
      text = `Ein Rechteck hat den Umfang u = ${2 * a + 2 * b} cm und die Länge a = ${a} cm. Berechne die Breite b (in cm). Formel: u = 2 · a + 2 · b`;
      wert = b;
      weg = `b = (u − 2 · a) : 2 = (${2 * a + 2 * b} − ${2 * a}) : 2 = ${b}`;
      nurEine = 2 * b;
    }
    const richtig = zahl(wert);
    return {
      platzhalter: { aufgabe: de(text) },
      loesung: richtig,
      loesungsweg: [
        de('Stelle die Formel zuerst nach der gesuchten Größe um, dann setze ein.'),
        de(weg),
      ],
      fehlerbilder: fehlerbilderAus(richtig, [
        ['multipliziert', multipliziert === undefined ? undefined : zahl(multipliziert)],
        ['nur-durch-eine', nurEine === undefined ? undefined : zahl(nurEine)],
      ]),
    };
  },
};

// ---------------------------------------------------------------------------
// Gleichungen aufstellen (M.SF.GL.AUFSTELLEN.AUSWAHL, .LOESEN)

interface Raetsel {
  readonly text: string;
  readonly gleichung: string;
  /** falsche Gleichungen mit ihrem Fehlerbild */
  readonly falsch: readonly (readonly [string, string])[];
  readonly x: number;
}

/** Zahlenrätsel mit Lösung x; auf M auch x auf beiden Seiten und negative Zahlen */
function raetsel(r: Rng, erweitert: boolean): Raetsel {
  const art = r.int(0, erweitert ? 4 : 2);
  const x = erweitert ? ganzOhneNull(r, 12) : r.int(2, 15);
  const a = r.int(2, 6);
  // auf G bleibt alles positiv: b kleiner als a · x
  const b = erweitert ? r.int(2, 20) : r.int(2, Math.min(20, a * x - 1));
  const w = (n: number) =>
    ['', '', 'Doppelte', 'Dreifache', 'Vierfache', 'Fünffache', 'Sechsfache'][n] ?? `${n}-fache`;
  switch (art) {
    case 0:
      return {
        text: `Das ${w(a)} einer Zahl vermehrt um ${b} ergibt ${zahlText(a * x + b)}.`,
        gleichung: `${a} · x + ${b} = ${zahlText(a * x + b)}`,
        falsch: [
          ['klammer-falsch', `${a} · (x + ${b}) = ${zahlText(a * x + b)}`],
          ['rechenzeichen-falsch', `${a} · x − ${b} = ${zahlText(a * x + b)}`],
        ],
        x,
      };
    case 1:
      if (a * x - b === 0) return raetsel(r, erweitert); // sonst hätte „b − a · x“ dieselbe Lösung
      return {
        text: `Das ${w(a)} einer Zahl vermindert um ${b} ergibt ${zahlText(a * x - b)}.`,
        gleichung: `${a} · x − ${b} = ${zahlText(a * x - b)}`,
        falsch: [
          ['reihenfolge-falsch', `${b} − ${a} · x = ${zahlText(a * x - b)}`],
          ['klammer-falsch', `${a} · (x − ${b}) = ${zahlText(a * x - b)}`],
        ],
        x,
      };
    case 2:
      return {
        text: `Addiert man ${b} zu einer Zahl und multipliziert das Ergebnis mit ${a}, erhält man ${zahlText(a * (x + b))}.`,
        gleichung: `${a} · (x + ${b}) = ${zahlText(a * (x + b))}`,
        falsch: [
          ['klammer-falsch', `${a} · x + ${b} = ${zahlText(a * (x + b))}`],
          ['reihenfolge-falsch', `x + ${a} · ${b} = ${zahlText(a * (x + b))}`],
        ],
        x,
      };
    case 3: {
      // Addiert man b zu einer Zahl, erhält man das a-Fache der Zahl: x + b = a · x
      const xs = b % (a - 1) === 0 && b !== a ? b / (a - 1) : undefined;
      if (xs === undefined) return raetsel(r, erweitert);
      return {
        text: `Addiert man ${b} zu einer Zahl, erhält man das ${w(a)} der Zahl.`,
        gleichung: `x + ${b} = ${a} · x`,
        falsch: [
          ['fache-als-plus', `x + ${b} = ${a} + x`],
          ['reihenfolge-falsch', `${a} · (x + ${b}) = x`],
        ],
        x: xs,
      };
    }
    default: {
      // Eine Zahl um b vermindert ergibt c (oft negativ)
      const c = x - b;
      if (c === 0) return raetsel(r, erweitert); // sonst hätte „b − x“ dieselbe Lösung
      return {
        text: `Vermindert man eine Zahl um ${b}, erhält man ${zahlText(c)}.`,
        gleichung: `x − ${b} = ${zahlText(c)}`,
        falsch: [
          ['reihenfolge-falsch', `${b} − x = ${zahlText(c)}`],
          ['rechenzeichen-falsch', `x + ${b} = ${zahlText(c)}`],
        ],
        x,
      };
    }
  }
}

export interface AufstellenParameter {
  readonly erweitert: boolean;
}

/** „Welche Gleichung passt zum Rätsel?“ – drei Gleichungen zur Auswahl */
export const gleichungWaehlen: Generator<AufstellenParameter> = {
  id: 'gl.gleichung-waehlen',
  version: 1,
  platzhalter: ['raetsel'],
  fehlerbildIds: ['reihenfolge-falsch', 'klammer-falsch', 'rechenzeichen-falsch', 'fache-als-plus'],

  erzeuge(seed, p) {
    const r = rng(seed);
    const t = raetsel(r, p.erweitert);
    const optionen = mische(r, [t.gleichung, ...t.falsch.map(([, g]) => g)]);
    const index = (s: string) => auswahl(optionen.indexOf(s));
    const richtig = index(t.gleichung);
    return {
      platzhalter: { raetsel: de(t.text) },
      optionen: optionen.map((s) => ({ text: de(s) })),
      loesung: richtig,
      loesungsweg: [
        de(
          'Übersetze Stück für Stück: „eine Zahl“ ist x, „das Dreifache“ ist 3 · x, „vermehrt um“ ist +.',
        ),
        de(t.gleichung),
      ],
      fehlerbilder: fehlerbilderAus(
        richtig,
        t.falsch.map(([id, g]) => [id, index(g)]),
      ),
    };
  },
};

/** „Das Dreifache einer Zahl vermindert um 7 ergibt 14. Wie heißt die Zahl?“ */
export const raetselLoesen: Generator<AufstellenParameter> = {
  id: 'gl.raetsel-loesen',
  version: 1,
  platzhalter: ['raetsel'],
  fehlerbildIds: ['falsche-richtung', 'vorzeichen-falsch'],

  erzeuge(seed, p) {
    const r = rng(seed);
    const t = raetsel(r, p.erweitert);
    const richtig = zz(t.x);
    // Falsche Richtung: Zahl dazu statt weg (aus der Gleichung a · x ± b = c)
    const m = /^(\d+) · x ([+−]) (\d+) = (−?[\d ]+)$/.exec(t.gleichung);
    let falscheRichtung: number | undefined;
    if (m) {
      const [a, b, c] = [
        Number(m[1]),
        Number(m[3]),
        Number((m[4] ?? '').replace('−', '-').replace(/\s/g, '')),
      ];
      const z = m[2] === '+' ? c + b : c - b;
      falscheRichtung = z % a === 0 ? z / a : undefined;
    }
    return {
      platzhalter: { raetsel: de(t.text) },
      vorzeichen: p.erweitert,
      loesung: richtig,
      loesungsweg: [
        de(`Gleichung: ${t.gleichung}`),
        de(`Lösung: x = ${zahlText(t.x)}. Probe im Rätsel: Es passt.`),
      ],
      fehlerbilder: fehlerbilderAus(richtig, [
        ['falsche-richtung', falscheRichtung === undefined ? undefined : zz(falscheRichtung)],
        ['vorzeichen-falsch', t.x !== 0 ? zz(-t.x) : undefined],
      ]),
    };
  },
};
