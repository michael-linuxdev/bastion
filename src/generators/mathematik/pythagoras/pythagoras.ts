// Satzgruppe des Pythagoras – Klasse 9 (LEHRPLAN §8e, Feld PY): Seiten im rechtwinkligen Dreieck
// berechnen, Umkehrung, Höhen- und Kathetensatz, Sachaufgaben. Skizzen sind nicht maßstäblich und
// zeigen den rechten Winkel an wechselnden Ecken, damit nicht immer c die Hypotenuse ist.
import type { Generator, Instanz, Sprachobjekt } from '../../../core/learning/generator';
import { rundeAuf } from '../../../core/learning/auswertung';
import { fehlerbilderAus } from '../../../core/learning/loesung';
import { texZahl, zahlText } from '../../../core/learning/text';
import { rng, type Rng } from '../../../core/rng/rng';
import { auswahl, de, mische, verlange, zahl } from '../../hilfen';
import { ANDERE, SEITE, dreieckSkizze, type Ecke } from './skizze';

export { dreieckSkizze, type Ecke } from './skizze';

export const TRIPEL = [
  [3, 4, 5],
  [6, 8, 10],
  [5, 12, 13],
  [8, 15, 17],
  [9, 12, 15],
  [7, 24, 25],
  [12, 16, 20],
  [20, 21, 29],
] as const;

const einheit = (r: Rng) => r.pick(['cm', 'm', 'mm'] as const);

// ---------------------------------------------------------------------------
// Seite berechnen (M.RF.PY.PYTHAGORAS.SEITE)

export interface SeiteParameter {
  /** false: pythagoreische Zahlentripel, rechter Winkel bei C; true: gerundet, beliebige Ecke */
  readonly gerundet: boolean;
}

/** „Berechne die Länge der Seite c.“ – mit Skizze */
function pySeiteFassung(fassung: 1 | 2): Generator<SeiteParameter> {
  return {
    id: 'py.seite',
    version: fassung,
    platzhalter: ['gesucht', 'einheit'],
    fehlerbildIds: ['summe', 'wurzel-vergessen', 'kathete-addiert', 'hypotenuse-falsch'],

    erzeuge(seed, p) {
      const r = rng(seed);
      const rechts: Ecke = p.gerundet ? r.pick(['A', 'B', 'C']) : 'C';
      const [e1, e2] = ANDERE[rechts];
      const hyp = SEITE[rechts];
      const k1 = SEITE[e1];
      const k2 = SEITE[e2];
      let x: number;
      let y: number;
      if (p.gerundet) {
        x = r.int(2, 15);
        y = r.int(2, 15);
        if (x === y) y = y + 1;
      } else {
        const [a, b] = r.pick(TRIPEL);
        const k = r.pick([1, 1, 2]);
        [x, y] = r.int(0, 1) === 0 ? [a * k, b * k] : [b * k, a * k];
      }
      const z = Math.sqrt(x * x + y * y); // Hypotenuse
      const hypotenuseGesucht = r.int(0, 2) !== 0;
      const u = einheit(r);
      const beschriftung: Record<string, string> = {};
      let gesucht: string;
      let genau: number;
      let weg: string[];
      const zG = rundeAuf(z, 1);
      const falsch: [string, number | undefined][] = [];
      if (hypotenuseGesucht) {
        beschriftung[k1] = `${k1} = ${zahlText(x)} ${u}`;
        beschriftung[k2] = `${k2} = ${zahlText(y)} ${u}`;
        beschriftung[hyp] = `${hyp} = ?`;
        gesucht = hyp;
        genau = z;
        weg = [
          `Der rechte Winkel liegt bei ${rechts}, also ist ${hyp} die Hypotenuse.`,
          `$${hyp}^2 = ${k1}^2 + ${k2}^2 = ${x * x} + ${y * y} = ${x * x + y * y}$`,
          `$${hyp} = \\sqrt{${x * x + y * y}} ${Number.isInteger(z) ? '=' : '\\approx'} ${texZahl(Number.isInteger(z) ? z : zG)}$ ${u}`,
        ];
        falsch.push(['summe', x + y], ['wurzel-vergessen', x * x + y * y]);
      } else {
        // Kathete gesucht: z und x gegeben
        const zz = p.gerundet ? r.int(Math.max(x, y) + 1, Math.max(x, y) + 10) : z;
        const kat = Math.sqrt(zz * zz - x * x);
        beschriftung[k1] = `${k1} = ${zahlText(x)} ${u}`;
        beschriftung[hyp] = `${hyp} = ${zahlText(zz)} ${u}`;
        beschriftung[k2] = `${k2} = ?`;
        gesucht = k2;
        genau = kat;
        weg = [
          `Der rechte Winkel liegt bei ${rechts}, also ist ${hyp} die Hypotenuse.`,
          `$${k2}^2 = ${hyp}^2 - ${k1}^2 = ${zz * zz} - ${x * x} = ${zz * zz - x * x}$`,
          `$${k2} = \\sqrt{${zz * zz - x * x}} ${Number.isInteger(kat) ? '=' : '\\approx'} ${texZahl(Number.isInteger(kat) ? kat : rundeAuf(kat, 1))}$ ${u}`,
        ];
        falsch.push(
          ['kathete-addiert', rundeAuf(Math.sqrt(zz * zz + x * x), p.gerundet ? 1 : 6)],
          ['wurzel-vergessen', zz * zz - x * x],
        );
      }
      if (p.gerundet && rechts !== 'C') {
        // „c ist immer die Hypotenuse“: c² = Summe der anderen beiden Quadrate
        const gegeben = Object.entries(beschriftung).filter(([, v]) => !v.endsWith('?'));
        const werte = Object.fromEntries(
          gegeben.map(([k, v]) => [k, Number(v.split(' = ')[1]?.split(' ')[0]?.replace(',', '.'))]),
        );
        if (gesucht === 'c') {
          const andere = Object.values(werte);
          falsch.push([
            'hypotenuse-falsch',
            rundeAuf(Math.sqrt(andere.reduce((s, w) => s + w * w, 0)), 1),
          ]);
        } else if (werte['c'] !== undefined) {
          const rest = Object.entries(werte).find(([k]) => k !== 'c')?.[1] ?? 0;
          const q = (werte['c'] ?? 0) ** 2 - rest * rest;
          if (q > 0) falsch.push(['hypotenuse-falsch', rundeAuf(Math.sqrt(q), 1)]);
        }
      }
      const loesungWert = Number.isInteger(genau) ? genau : rundeAuf(genau, 1);
      const richtig = zahl(loesungWert);
      const instanz: Instanz = {
        platzhalter: { gesucht: de(gesucht), einheit: de(u) },
        bild: dreieckSkizze(rechts, beschriftung, fassung),
        loesung: richtig,
        ...(Number.isInteger(genau) ? {} : { runden: { stellen: 1, genau } }),
        loesungsweg: weg.map(de),
        fehlerbilder: fehlerbilderAus(
          richtig,
          falsch.map(([id, w]) => [id, w === undefined || Number.isNaN(w) ? undefined : zahl(w)]),
        ),
      };
      return instanz;
    },
  };
}

/** Fassung 1 bleibt für gespeicherte Aufgaben (INHALTSFORMAT §6.1 Regel 5): Beschriftung der senkrechten Seite außerhalb des Bildes. */
export const pySeiteV1 = pySeiteFassung(1);
export const pySeite = pySeiteFassung(2);

// ---------------------------------------------------------------------------
// Fehler finden (M.RF.PY.PYTHAGORAS.FEHLER, Niveau E)

/** „Tim rechnet … Wo liegt der Fehler?“ – Hypotenuse falsch zugeordnet, Wurzel vergessen … */
export const pyFehler: Generator<Record<string, never>> = {
  id: 'py.fehler',
  version: 1,
  platzhalter: ['rechnung'],
  fehlerbildIds: ['kein-fehler', 'wurzel', 'einheit'],

  erzeuge(seed) {
    const r = rng(seed);
    const rechts = r.pick(['A', 'B'] as const);
    const [e1, e2] = ANDERE[rechts];
    const hyp = SEITE[rechts];
    const [x, z] = r.pick([
      [6, 10],
      [5, 13],
      [8, 17],
      [9, 15],
      [7, 25],
    ] as const);
    // Gegeben: Kathete SEITE[e1] = x, Hypotenuse = z; gesucht: SEITE[e2]
    const k1 = SEITE[e1];
    const k2 = SEITE[e2];
    const falscheRechnung = `$${k2}^2 = ${k1}^2 + ${hyp}^2 = ${x * x} + ${z * z}$`;
    const kandidaten: [string, string][] = [
      [
        'richtig',
        `Die Hypotenuse ist ${hyp}, weil sie dem rechten Winkel bei ${rechts} gegenüberliegt. Richtig ist $${k2}^2 = ${hyp}^2 - ${k1}^2$.`,
      ],
      ['kein-fehler', 'Die Rechnung stimmt, $a^2 + b^2 = c^2$ wurde richtig angewendet.'],
      ['wurzel', 'Der Fehler ist nur, dass am Ende die Wurzel fehlt.'],
      ['einheit', 'Der Fehler ist die fehlende Einheit, sonst stimmt alles.'],
    ];
    const liste = mische(r, kandidaten);
    const index = (id: string) => auswahl(liste.findIndex(([k]) => k === id));
    return {
      platzhalter: {
        rechnung: de(
          `Im Dreieck ABC liegt der rechte Winkel bei ${rechts}. Gegeben sind $${k1} = ${x}$ cm und $${hyp} = ${z}$ cm. Tim rechnet: ${falscheRechnung}.`,
        ),
      },
      optionen: liste.map(([, t]) => ({ text: de(t) satisfies Sprachobjekt })),
      loesung: index('richtig'),
      loesungsweg: [
        de(`Die Hypotenuse liegt dem rechten Winkel gegenüber, hier also ${hyp}, nicht c.`),
        de(
          `$${k2}^2 = ${z * z} - ${x * x} = ${z * z - x * x}$, $${k2} = ${Math.sqrt(z * z - x * x)}$ cm.`,
        ),
      ],
      fehlerbilder: liste
        .filter(([id]) => id !== 'richtig')
        .map(([id]) => ({ id, antwort: index(id) })),
    };
  },
};

// ---------------------------------------------------------------------------
// Umkehrung: rechtwinklig? (M.RF.PY.UMKEHRUNG.PRUEFEN)

export interface UmkehrungParameter {
  /** true: Wo liegt der rechte Winkel? (drei Möglichkeiten) */
  readonly wo: boolean;
}

/** „Ist das Dreieck mit a = 7, b = 24, c = 25 rechtwinklig?“ */
export const pyUmkehrung: Generator<UmkehrungParameter> = {
  id: 'py.umkehrung',
  version: 1,
  platzhalter: ['seiten'],
  fehlerbildIds: ['falsche-seite', 'beinahe', 'kleinste-seite'],

  erzeuge(seed, p) {
    const r = rng(seed);
    const [a0, b0, c0] = r.pick(TRIPEL);
    const k = r.pick([1, 2]);
    const rechtwinklig = p.wo || r.int(0, 1) === 0;
    const laengen = [a0 * k, b0 * k, rechtwinklig ? c0 * k : c0 * k + r.pick([-1, 1])];
    const reihenfolge = mische(r, [0, 1, 2]);
    const seiten = reihenfolge.map((i) => laengen[i] ?? 0);
    const namen = ['a', 'b', 'c'];
    const seitenText = seiten.map((s, i) => `${namen[i]} = ${s}`).join(', ');
    const groesste = seiten.indexOf(Math.max(...seiten));
    const [k1 = 0, k2 = 0] = seiten.filter((_, i) => i !== groesste);
    const g = seiten[groesste] ?? 0;
    const weg = [
      `Die längste Seite ist ${namen[groesste]} = ${g}. Nur sie kann die Hypotenuse sein.`,
      `$${k1}^2 + ${k2}^2 = ${k1 * k1 + k2 * k2}$ und $${g}^2 = ${g * g}$.`,
      k1 * k1 + k2 * k2 === g * g
        ? `Gleich, also ist das Dreieck nach der Umkehrung des Satzes von Pythagoras rechtwinklig${p.wo ? `, der rechte Winkel liegt gegenüber von ${namen[groesste]}, also bei ${namen[groesste]?.toUpperCase()}` : ''}.`
        : 'Nicht gleich, also ist das Dreieck nicht rechtwinklig.',
    ];
    if (p.wo) {
      const ecken = ['A', 'B', 'C'];
      const kleinste = seiten.indexOf(Math.min(...seiten));
      const andere = [0, 1, 2].find((i) => i !== groesste && i !== kleinste) ?? 0;
      return {
        platzhalter: { seiten: de(seitenText) },
        optionen: ecken.map((e) => ({ text: de(`bei ${e}`) })),
        loesung: auswahl(groesste),
        loesungsweg: weg.map(de),
        fehlerbilder: [
          { id: 'kleinste-seite', antwort: auswahl(kleinste) },
          { id: 'falsche-seite', antwort: auswahl(andere) },
        ],
      };
    }
    const ja = k1 * k1 + k2 * k2 === g * g;
    return {
      platzhalter: { seiten: de(seitenText) },
      optionen: [
        { text: de('Ja, es ist rechtwinklig.') },
        { text: de('Nein, es ist nicht rechtwinklig.') },
      ],
      loesung: auswahl(ja ? 0 : 1),
      loesungsweg: weg.map(de),
      fehlerbilder: [{ id: ja ? 'falsche-seite' : 'beinahe', antwort: auswahl(ja ? 1 : 0) }],
    };
  },
};

// ---------------------------------------------------------------------------
// Satz oder Umkehrung? (M.RF.PY.UMKEHRUNG.SATZ, Niveau E)

/** „Welcher Satz begründet das?“ – Satz des Pythagoras oder seine Umkehrung */
export const pySatzOderUmkehrung: Generator<Record<string, never>> = {
  id: 'py.satz-oder-umkehrung',
  version: 1,
  platzhalter: ['situation'],
  fehlerbildIds: ['satz-statt-umkehrung', 'umkehrung-statt-satz', 'hoehensatz', 'thales'],

  erzeuge(seed) {
    const r = rng(seed);
    const [a, b, c] = r.pick(TRIPEL);
    const umkehrung = r.int(0, 1) === 0;
    const situation = umkehrung
      ? `Ein Dreieck hat die Seiten ${a} cm, ${b} cm und ${c} cm. Weil $${a}^2 + ${b}^2 = ${c}^2$ gilt, ist es rechtwinklig.`
      : `In einem rechtwinkligen Dreieck sind die Katheten ${a} cm und ${b} cm lang. Also ist die Hypotenuse ${c} cm lang.`;
    const kandidaten: [string, string][] = [
      [
        'richtig',
        umkehrung ? 'die Umkehrung des Satzes von Pythagoras' : 'der Satz des Pythagoras',
      ],
      [
        umkehrung ? 'satz-statt-umkehrung' : 'umkehrung-statt-satz',
        umkehrung ? 'der Satz des Pythagoras' : 'die Umkehrung des Satzes von Pythagoras',
      ],
      ['hoehensatz', 'der Höhensatz'],
      ['thales', 'der Satz des Thales'],
    ];
    const liste = mische(r, kandidaten);
    const index = (id: string) => auswahl(liste.findIndex(([k]) => k === id));
    return {
      platzhalter: { situation: de(situation) },
      optionen: liste.map(([, t]) => ({ text: de(t) })),
      loesung: index('richtig'),
      loesungsweg: [
        de('Satz des Pythagoras: Wenn ein Dreieck rechtwinklig ist, dann gilt $a^2 + b^2 = c^2$.'),
        de('Umkehrung: Wenn $a^2 + b^2 = c^2$ gilt, dann ist das Dreieck rechtwinklig.'),
        de(
          umkehrung
            ? 'Hier wird aus der Gleichung auf den rechten Winkel geschlossen: Umkehrung.'
            : 'Hier ist der rechte Winkel bekannt und es wird gerechnet: Satz des Pythagoras.',
        ),
      ],
      fehlerbilder: liste
        .filter(([id]) => id !== 'richtig')
        .map(([id]) => ({ id, antwort: index(id) })),
    };
  },
};

// ---------------------------------------------------------------------------
// Höhensatz und Kathetensatz (M.RF.PY.HOEHENSATZ.BERECHNEN)

export interface HoehensatzParameter {
  readonly saetze: readonly ('hoehe' | 'kathete')[];
}

/** „Die Hypotenusenabschnitte sind p = 4 cm und q = 9 cm. Berechne h.“ */
export const pyHoehensatz: Generator<HoehensatzParameter> = {
  id: 'py.hoehensatz',
  version: 1,
  platzhalter: ['angabe', 'gesucht'],
  fehlerbildIds: ['wurzel-vergessen', 'summe', 'falscher-abschnitt'],

  erzeuge(seed, p) {
    verlange(p.saetze.length > 0, 'saetze: mindestens einer');
    const r = rng(seed);
    const satz = r.pick(p.saetze);
    if (satz === 'hoehe') {
      // h² = p·q, p·q eine Quadratzahl
      const h = r.int(2, 12);
      const teiler = [];
      for (let t = 1; t < h; t++) if ((h * h) % t === 0 && (h * h) / t !== t) teiler.push(t);
      const pp = r.pick(teiler.length > 0 ? teiler : [1]);
      const q = (h * h) / pp;
      const richtig = zahl(h);
      return {
        platzhalter: {
          angabe: de(
            `In einem rechtwinkligen Dreieck teilt die Höhe h die Hypotenuse in die Abschnitte $p = ${pp}$ cm und $q = ${q}$ cm.`,
          ),
          gesucht: de('die Höhe h'),
        },
        loesung: richtig,
        loesungsweg: [
          de('Höhensatz: $h^2 = p \\cdot q$.'),
          de(`$h^2 = ${pp} \\cdot ${q} = ${h * h}$, also $h = ${h}$ cm.`),
        ],
        fehlerbilder: fehlerbilderAus(richtig, [
          ['wurzel-vergessen', zahl(h * h)],
          ['summe', (pp + q) % 2 === 0 ? zahl((pp + q) / 2) : undefined],
        ]),
      };
    }
    // Kathetensatz a² = c·p
    const a = r.int(3, 15);
    const teiler = [];
    for (let t = 1; t <= a; t++) if ((a * a) % t === 0 && (a * a) / t > a) teiler.push(t);
    const pp = r.pick(teiler.length > 0 ? teiler : [1]);
    const c = (a * a) / pp;
    const q = c - pp;
    const richtig = zahl(a);
    return {
      platzhalter: {
        angabe: de(
          `In einem rechtwinkligen Dreieck mit dem rechten Winkel bei C ist die Hypotenuse $c = ${c}$ cm lang. Der Hypotenusenabschnitt unter der Kathete a ist $p = ${pp}$ cm.`,
        ),
        gesucht: de('die Kathete a'),
      },
      loesung: richtig,
      loesungsweg: [
        de('Kathetensatz: $a^2 = c \\cdot p$, mit dem Abschnitt p, der an a anliegt.'),
        de(`$a^2 = ${c} \\cdot ${pp} = ${a * a}$, also $a = ${a}$ cm.`),
      ],
      fehlerbilder: fehlerbilderAus(richtig, [
        ['wurzel-vergessen', zahl(a * a)],
        [
          'falscher-abschnitt',
          Number.isInteger(Math.sqrt(c * q)) ? zahl(Math.sqrt(c * q)) : undefined,
        ],
      ]),
    };
  },
};

// ---------------------------------------------------------------------------
// Welcher Satz passt? (M.RF.PY.HOEHENSATZ.WAHL, Niveau E)

const SAETZE = [
  ['pythagoras', 'Satz des Pythagoras'],
  ['hoehensatz', 'Höhensatz'],
  ['kathetensatz', 'Kathetensatz'],
] as const;

/** „Gegeben: p und q, gesucht: h. Welcher Satz hilft direkt?“ */
function pySatzWahlFassung(fassung: 1 | 2): Generator<Record<string, never>> {
  return {
    id: 'py.satz-wahl',
    version: fassung,
    platzhalter: ['gegeben', 'gesucht'],
    fehlerbildIds: ['pythagoras', 'hoehensatz', 'kathetensatz'],

    erzeuge(seed) {
      const r = rng(seed);
      const fall = r.pick([
        { gegeben: 'die Hypotenusenabschnitte p und q', gesucht: 'die Höhe h', satz: 'hoehensatz' },
        {
          gegeben: 'die Höhe h und den Abschnitt p',
          gesucht: 'den Abschnitt q',
          satz: 'hoehensatz',
        },
        {
          gegeben: 'die Hypotenuse c und den Abschnitt p',
          gesucht: 'die Kathete a',
          satz: 'kathetensatz',
        },
        {
          gegeben: 'die Kathete b und die Hypotenuse c',
          gesucht: 'den Abschnitt q',
          satz: 'kathetensatz',
        },
        { gegeben: 'die Katheten a und b', gesucht: 'die Hypotenuse c', satz: 'pythagoras' },
        {
          gegeben: 'die Kathete a und die Hypotenuse c',
          gesucht: 'die Kathete b',
          satz: 'pythagoras',
        },
      ] as const);
      const liste = mische(r, [...SAETZE]);
      const index = (id: string) => auswahl(liste.findIndex(([k]) => k === id));
      return {
        platzhalter: { gegeben: de(fall.gegeben), gesucht: de(fall.gesucht) },
        optionen: liste.map(([, t]) => ({ text: de(t) })),
        loesung: index(fall.satz),
        loesungsweg: [
          de(
            'Pythagoras verbindet die drei Seiten. Der Höhensatz verbindet h, p und q. Der Kathetensatz verbindet eine Kathete, c und den anliegenden Abschnitt.',
          ),
          de(
            fassung === 2
              ? `Du kennst ${fall.gegeben} und suchst ${fall.gesucht}: ${SAETZE.find(([k]) => k === fall.satz)?.[1] ?? ''}.`
              : `Gegeben sind ${fall.gegeben}, gesucht ${fall.gesucht}: ${SAETZE.find(([k]) => k === fall.satz)?.[1] ?? ''}.`,
          ),
        ],
        fehlerbilder: liste
          .filter(([k]) => k !== fall.satz)
          .map(([k]) => ({ id: k, antwort: index(k) })),
      };
    },
  };
}

/** Fassung 1 bleibt für gespeicherte Aufgaben (INHALTSFORMAT §6.1 Regel 5): Lösungsweg „gesucht den Abschnitt q“. */
export const pySatzWahlV1 = pySatzWahlFassung(1);
export const pySatzWahl = pySatzWahlFassung(2);

// ---------------------------------------------------------------------------
// Sachaufgaben (M.RF.PY.SACH.BERECHNEN)

export type PySachArt = 'leiter' | 'diagonale' | 'dach' | 'raumdiagonale';

export interface PySachParameter {
  readonly arten: readonly PySachArt[];
}

/** Leiter an der Wand, Diagonale, Dachhöhe, Raumdiagonale */
export const pySach: Generator<PySachParameter> = {
  id: 'py.sach',
  version: 1,
  platzhalter: ['situation', 'frage'],
  fehlerbildIds: ['summe', 'kathete-addiert', 'halbe-vergessen', 'flaechendiagonale'],

  erzeuge(seed, p) {
    verlange(p.arten.length > 0, 'arten: mindestens eine');
    const r = rng(seed);
    const art = r.pick(p.arten);
    const ganz = (w: number) => (Number.isInteger(w) ? w : rundeAuf(w, 1));
    const mitRunden = (w: number) =>
      Number.isInteger(w) ? {} : { runden: { stellen: 1, genau: w } };
    if (art === 'leiter') {
      const [x, , z] = r.pick(TRIPEL);
      const k = r.pick([0.5, 1]);
      const abstand = x * k;
      const laenge = z * k;
      const hoehe = Math.sqrt(laenge * laenge - abstand * abstand);
      const richtig = zahl(ganz(hoehe));
      return {
        platzhalter: {
          situation: de(
            `Eine ${zahlText(laenge)} m lange Leiter lehnt an einer Wand. Ihr Fuß steht ${zahlText(abstand)} m von der Wand entfernt.`,
          ),
          frage: de('In welcher Höhe berührt sie die Wand (in m)?'),
        },
        loesung: richtig,
        ...mitRunden(hoehe),
        loesungsweg: [
          de(
            'Wand, Boden und Leiter bilden ein rechtwinkliges Dreieck. Die Leiter ist die Hypotenuse.',
          ),
          de(
            `$h^2 = ${texZahl(laenge)}^2 - ${texZahl(abstand)}^2 = ${texZahl(laenge * laenge - abstand * abstand)}$, also $h = ${texZahl(ganz(hoehe))}$ m.`,
          ),
        ],
        fehlerbilder: fehlerbilderAus(richtig, [
          ['kathete-addiert', zahl(rundeAuf(Math.sqrt(laenge * laenge + abstand * abstand), 1))],
          ['summe', zahl(rundeAuf(laenge - abstand, 1))],
        ]),
      };
    }
    if (art === 'diagonale') {
      const a = r.int(3, 20);
      const b = r.int(3, 20);
      const d = Math.sqrt(a * a + b * b);
      const richtig = zahl(ganz(d));
      return {
        platzhalter: {
          situation: de(`Ein rechteckiges Feld ist ${a} m lang und ${b} m breit.`),
          frage: de('Wie lang ist der Weg quer über die Diagonale (in m)?'),
        },
        loesung: richtig,
        ...mitRunden(d),
        loesungsweg: [
          de(
            'Die Diagonale teilt das Rechteck in zwei rechtwinklige Dreiecke. Sie ist die Hypotenuse.',
          ),
          de(
            `$d^2 = ${a}^2 + ${b}^2 = ${a * a + b * b}$, also $d ${Number.isInteger(d) ? '=' : '\\approx'} ${texZahl(ganz(d))}$ m.`,
          ),
        ],
        fehlerbilder: fehlerbilderAus(richtig, [['summe', zahl(a + b)]]),
      };
    }
    if (art === 'dach') {
      const [x, y, z] = r.pick(TRIPEL);
      const breite = 2 * x;
      const sparren = z;
      const hoehe = y;
      const richtig = zahl(hoehe);
      return {
        platzhalter: {
          situation: de(
            `Ein Satteldach ist ${breite} m breit. Die Dachsparren sind auf beiden Seiten ${sparren} m lang.`,
          ),
          frage: de('Wie hoch ist das Dach (in m)?'),
        },
        loesung: richtig,
        loesungsweg: [
          de(
            'Die Höhe teilt das Dach in zwei rechtwinklige Dreiecke mit der halben Breite als Kathete.',
          ),
          de(
            `$h^2 = ${sparren}^2 - ${x}^2 = ${sparren * sparren - x * x}$, also $h = ${hoehe}$ m.`,
          ),
        ],
        fehlerbilder: fehlerbilderAus(richtig, [
          [
            'halbe-vergessen',
            sparren > breite
              ? zahl(rundeAuf(Math.sqrt(sparren * sparren - breite * breite), 1))
              : undefined,
          ],
          ['kathete-addiert', zahl(rundeAuf(Math.sqrt(sparren * sparren + x * x), 1))],
        ]),
      };
    }
    const a = r.int(2, 9);
    const b = r.int(2, 9);
    const c = r.int(2, 9);
    const d = Math.sqrt(a * a + b * b + c * c);
    const richtig = zahl(ganz(d));
    return {
      platzhalter: {
        situation: de(
          `Ein quaderförmiger Karton ist ${a} dm lang, ${b} dm breit und ${c} dm hoch.`,
        ),
        frage: de('Wie lang ist die Raumdiagonale (in dm)?'),
      },
      loesung: richtig,
      ...mitRunden(d),
      loesungsweg: [
        de(`Erst die Diagonale der Grundfläche: $e^2 = ${a}^2 + ${b}^2 = ${a * a + b * b}$.`),
        de(
          `Dann mit der Höhe: $d^2 = e^2 + ${c}^2 = ${a * a + b * b + c * c}$, also $d ${Number.isInteger(d) ? '=' : '\\approx'} ${texZahl(ganz(d))}$ dm.`,
        ),
      ],
      fehlerbilder: fehlerbilderAus(richtig, [
        ['flaechendiagonale', zahl(ganz(Math.sqrt(a * a + b * b)))],
        ['summe', zahl(a + b + c)],
      ]),
    };
  },
};

// ---------------------------------------------------------------------------
// Die richtige Rechnung wählen (M.RF.PY.SACH.ANSATZ, Niveau E)

/** „Welche Rechnung liefert die Raumdiagonale des Quaders?“ */
export const pyAnsatz: Generator<Record<string, never>> = {
  id: 'py.ansatz',
  version: 1,
  platzhalter: ['situation'],
  fehlerbildIds: ['flaechendiagonale', 'summe', 'klammer'],

  erzeuge(seed) {
    const r = rng(seed);
    const a = r.int(2, 9);
    const b = r.int(2, 9);
    const c = r.int(2, 9);
    const kandidaten: [string, string][] = [
      ['richtig', `$d = \\sqrt{${a}^2 + ${b}^2 + ${c}^2}$`],
      ['flaechendiagonale', `$d = \\sqrt{${a}^2 + ${b}^2}$`],
      ['summe', `$d = ${a} + ${b} + ${c}$`],
      ['klammer', `$d = \\sqrt{(${a} + ${b})^2 + ${c}^2}$`],
    ];
    const liste = mische(r, kandidaten);
    const index = (id: string) => auswahl(liste.findIndex(([k]) => k === id));
    return {
      platzhalter: {
        situation: de(`Ein Quader ist ${a} cm lang, ${b} cm breit und ${c} cm hoch.`),
      },
      optionen: liste.map(([, t]) => ({ text: de(t) satisfies Sprachobjekt })),
      loesung: index('richtig'),
      loesungsweg: [
        de(`Rechtwinkliges Dreieck 1 in der Grundfläche: $e^2 = ${a}^2 + ${b}^2$.`),
        de(
          `Rechtwinkliges Dreieck 2 aus e, der Höhe und der Raumdiagonale: $d^2 = e^2 + ${c}^2 = ${a}^2 + ${b}^2 + ${c}^2$.`,
        ),
      ],
      fehlerbilder: liste
        .filter(([id]) => id !== 'richtig')
        .map(([id]) => ({ id, antwort: index(id) })),
    };
  },
};
