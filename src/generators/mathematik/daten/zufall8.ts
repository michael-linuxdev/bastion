// Zufall – Klasse 8 (LEHRPLAN §8d, M.DZ.ZF.EREIGNISSE, .BAUMDIAGRAMM, .ZAEHLEN):
// Ereignisse verknüpfen (Gegenereignis, und, oder, ohne), mehrstufige Zufallsversuche
// mit Pfadregeln, Abzählen mit der Produktregel und n!.
import { bruch, type Bruch } from '../../../core/learning/bruch';
import { zahlText } from '../../../core/learning/text';
import type { Generator, Loesung } from '../../../core/learning/generator';
import { fehlerbilderAus } from '../../../core/learning/loesung';
import { rng, type Rng } from '../../../core/rng/rng';
import { de, zahl } from '../../hilfen';
import { bild, linie, text } from '../../svg';
import { gekuerzt } from '../brueche/rechnen';
import { optionenAus } from '../terme/umformen';

const menge = (xs: readonly number[]) =>
  xs.length === 0 ? '{ } (leere Menge)' : `{${xs.join('; ')}}`;
const br = (z: number, n: number): Loesung => ({ typ: 'bruch', wert: gekuerzt(bruch(z, n)) });
const bt = (b: Bruch) => `${zahlText(b.zaehler)}/${zahlText(b.nenner)}`;

// ---------------------------------------------------------------------------
// Ereignisse verknüpfen (M.DZ.ZF.EREIGNISSE)

interface Ereignis {
  readonly name: string;
  readonly gilt: (n: number) => boolean;
}

function ereignisse(r: Rng, max: number): [Ereignis, Ereignis] {
  const grenze = r.int(2, max - 2);
  const teiler = r.pick([3, 4] as const);
  const liste: Ereignis[] = [
    { name: 'gerade Zahl', gilt: (n) => n % 2 === 0 },
    { name: 'ungerade Zahl', gilt: (n) => n % 2 === 1 },
    { name: `Zahl größer als ${grenze}`, gilt: (n) => n > grenze },
    { name: `Zahl kleiner als ${grenze}`, gilt: (n) => n < grenze },
    { name: `durch ${teiler} teilbare Zahl`, gilt: (n) => n % teiler === 0 },
    { name: 'Primzahl', gilt: (n) => [2, 3, 5, 7, 11, 13, 17, 19].includes(n) },
  ];
  const a = r.pick(liste);
  let b = r.pick(liste);
  while (b === a || (a.name.includes('gerade') && b.name.includes('gerade'))) b = r.pick(liste);
  return [a, b];
}

export interface VerknuepfenParameter {
  /** false: Gegenereignis beim Würfel; true: „und“, „oder“, „aber nicht“ bei 1 … 12 */
  readonly zwei: boolean;
}

/** „A: gerade Zahl. Welche Menge ist das Gegenereignis?“ / „Welche Menge ist ‚A und B‘?“ */
export const verknuepfen: Generator<VerknuepfenParameter> = {
  id: 'zf.verknuepfen',
  version: 1,
  platzhalter: ['versuch', 'gefragt'],
  fehlerbildIds: ['und-oder-verwechselt', 'gegenereignis-verwechselt', 'ereignis-selbst'],

  erzeuge(seed, p) {
    const r = rng(seed);
    const max = p.zwei ? 12 : 6;
    const alle = Array.from({ length: max }, (_, i) => i + 1);
    const versuch = p.zwei
      ? 'Aus einer Lostrommel mit den Zahlen 1 bis 12 wird ein Los gezogen.'
      : 'Ein Würfel wird einmal geworfen.';
    for (;;) {
      const [a, b] = ereignisse(r, max);
      const A = alle.filter(a.gilt);
      const B = alle.filter(b.gilt);
      const nichtA = alle.filter((n) => !a.gilt(n));
      if (A.length === 0 || nichtA.length === 0) continue;
      if (!p.zwei) {
        const { optionen, index, richtig } = optionenAus(r, menge(nichtA), [
          ['ereignis-selbst', menge(A)],
          ['gegenereignis-verwechselt', menge(alle)],
          ['gegenereignis-verwechselt', menge(nichtA.slice(1))],
        ]);
        return {
          platzhalter: { versuch: de(versuch), gefragt: de(`das Gegenereignis von A: ${a.name}`) },
          optionen: optionen.map(([, t]) => ({ text: de(t) })),
          loesung: richtig,
          loesungsweg: [
            de(`A = ${menge(A)}`),
            de(`Das Gegenereignis enthält alle anderen Ergebnisse: ${menge(nichtA)}.`),
          ],
          fehlerbilder: fehlerbilderAus(richtig, [
            ['ereignis-selbst', index('ereignis-selbst')],
            ['gegenereignis-verwechselt', index('gegenereignis-verwechselt')],
          ]),
        };
      }
      const und = A.filter((n) => b.gilt(n));
      const oder = alle.filter((n) => a.gilt(n) || b.gilt(n));
      const ohne = A.filter((n) => !b.gilt(n));
      const art = r.int(0, 2);
      const ziel = [und, oder, ohne][art] ?? und;
      const wort = [`A und B`, `A oder B`, `A, aber nicht B`][art] ?? '';
      const andere: [string, string][] = [
        ['und-oder-verwechselt', menge(art === 0 ? oder : und)],
        ['und-oder-verwechselt', menge(art === 2 ? und : ohne)],
        ['gegenereignis-verwechselt', menge(alle.filter((n) => !ziel.includes(n)))],
        ['ereignis-selbst', menge(A)],
      ];
      const { optionen, index, richtig } = optionenAus(r, menge(ziel), andere);
      if (optionen.length < 4) continue;
      return {
        platzhalter: {
          versuch: de(versuch),
          gefragt: de(`„${wort}“ mit A: ${a.name}, B: ${b.name}`),
        },
        optionen: optionen.map(([, t]) => ({ text: de(t) })),
        loesung: richtig,
        loesungsweg: [
          de(`A = ${menge(A)}, B = ${menge(B)}`),
          de(
            [
              '„A und B“: Zahlen, die in beiden Mengen stehen.',
              '„A oder B“: Zahlen, die in mindestens einer der beiden Mengen stehen.',
              '„A, aber nicht B“: Zahlen aus A, die nicht in B stehen.',
            ][art] ?? '',
          ),
          de(menge(ziel)),
        ],
        fehlerbilder: fehlerbilderAus(richtig, [
          ['und-oder-verwechselt', index('und-oder-verwechselt')],
          ['gegenereignis-verwechselt', index('gegenereignis-verwechselt')],
          ['ereignis-selbst', index('ereignis-selbst')],
        ]),
      };
    }
  },
};

/** „Wie viele Ergebnisse gehören zu ‚A oder B‘?“ */
export const verknuepfenZaehlen: Generator<VerknuepfenParameter> = {
  id: 'zf.verknuepfen-zaehlen',
  version: 1,
  platzhalter: ['versuch', 'gefragt'],
  fehlerbildIds: ['doppelt-gezaehlt', 'ereignis-statt-gegenereignis'],

  erzeuge(seed, p) {
    const r = rng(seed);
    const max = p.zwei ? r.pick([12, 20] as const) : 6;
    const alle = Array.from({ length: max }, (_, i) => i + 1);
    const versuch = p.zwei
      ? `Aus einer Lostrommel mit den Zahlen 1 bis ${max} wird ein Los gezogen.`
      : 'Ein Würfel wird einmal geworfen.';
    for (;;) {
      const [a, b] = ereignisse(r, max);
      const A = alle.filter(a.gilt);
      const B = alle.filter(b.gilt);
      if (!p.zwei) {
        const nichtA = max - A.length;
        if (A.length === 0 || nichtA === 0) continue;
        const richtig = zahl(nichtA);
        return {
          platzhalter: { versuch: de(versuch), gefragt: de(`zum Gegenereignis von A: ${a.name}`) },
          loesung: richtig,
          loesungsweg: [
            de(`A = ${menge(A)} hat ${A.length} Ergebnisse.`),
            de(`Das Gegenereignis hat ${max} − ${A.length} = ${nichtA}.`),
          ],
          fehlerbilder: fehlerbilderAus(richtig, [
            ['ereignis-statt-gegenereignis', zahl(A.length)],
          ]),
        };
      }
      const oder = alle.filter((n) => a.gilt(n) || b.gilt(n)).length;
      const beide = A.filter((n) => b.gilt(n)).length;
      if (beide === 0 || oder === max) continue;
      const richtig = zahl(oder);
      return {
        platzhalter: {
          versuch: de(versuch),
          gefragt: de(`zu „A oder B“ mit A: ${a.name}, B: ${b.name}`),
        },
        loesung: richtig,
        loesungsweg: [
          de(`A = ${menge(A)}, B = ${menge(B)}`),
          de(`${A.length} + ${B.length} − ${beide} (in beiden) = ${oder}`),
        ],
        fehlerbilder: fehlerbilderAus(richtig, [['doppelt-gezaehlt', zahl(A.length + B.length)]]),
      };
    }
  },
};

// ---------------------------------------------------------------------------
// Mehrstufige Zufallsversuche (M.DZ.ZF.BAUMDIAGRAMM)

export interface PfadParameter {
  /** false: zweimal mit Zurücklegen, ein Pfad; true: auch ohne Zurücklegen und Summe zweier Pfade */
  readonly erweitert: boolean;
}

/** „In einer Urne liegen 3 rote und 2 blaue Kugeln … Wie groß ist P(rot, rot)?“ */
export const pfadregel: Generator<PfadParameter> = {
  id: 'zf.pfadregel',
  version: 1,
  platzhalter: ['aufgabe'],
  fehlerbildIds: ['addiert-statt-mal', 'mit-zuruecklegen', 'nur-ein-pfad'],

  erzeuge(seed, p) {
    const r = rng(seed);
    const art = p.erweitert ? r.pick(['ohne', 'genau-eine'] as const) : 'mit';
    const ohne = art === 'ohne' || (art === 'genau-eine' && r.int(0, 1) === 0);
    const rot = r.int(ohne ? 2 : 1, 6);
    const blau = r.int(1, 6);
    const n = rot + blau;
    const satz = `In einer Urne liegen ${rot} rote und ${blau} blaue Kugeln. Es wird zweimal ${ohne ? 'ohne' : 'mit'} Zurücklegen gezogen.`;
    if (art !== 'genau-eine') {
      const zweiter = ohne ? rot - 1 : rot;
      const nenner2 = ohne ? n - 1 : n;
      const richtig = br(rot * zweiter, n * nenner2);
      return {
        platzhalter: {
          aufgabe: de(`${satz} Wie groß ist die Wahrscheinlichkeit, zweimal Rot zu ziehen?`),
        },
        loesung: richtig,
        loesungsweg: [
          de(
            `Erster Zug: ${rot}/${n}. Zweiter Zug: ${zweiter}/${nenner2}${ohne ? ' (eine rote Kugel fehlt jetzt)' : ''}.`,
          ),
          de(
            `Produktregel: ${rot}/${n} · ${zweiter}/${nenner2} = ${bt(gekuerzt(bruch(rot * zweiter, n * nenner2)))}`,
          ),
        ],
        fehlerbilder: fehlerbilderAus(richtig, [
          [
            'addiert-statt-mal',
            rot / n + zweiter / nenner2 <= 1
              ? br(rot * nenner2 + zweiter * n, n * nenner2)
              : undefined,
          ],
          ['mit-zuruecklegen', ohne ? br(rot * rot, n * n) : undefined],
        ]),
      };
    }
    // genau eine rote Kugel: rot-blau oder blau-rot
    const nenner = ohne ? n * (n - 1) : n * n;
    const einPfad = rot * blau;
    const richtig = br(2 * einPfad, nenner);
    return {
      platzhalter: {
        aufgabe: de(
          `${satz} Wie groß ist die Wahrscheinlichkeit, genau eine rote Kugel zu ziehen?`,
        ),
      },
      loesung: richtig,
      loesungsweg: [
        de('Zwei Pfade passen: erst Rot, dann Blau – oder erst Blau, dann Rot.'),
        de(`Jeder Pfad: ${rot}/${n} · ${blau}/${ohne ? n - 1 : n} = ${einPfad}/${nenner}`),
        de(
          `Summenregel: ${einPfad}/${nenner} + ${einPfad}/${nenner} = ${bt(gekuerzt(bruch(2 * einPfad, nenner)))}`,
        ),
      ],
      fehlerbilder: fehlerbilderAus(richtig, [
        ['nur-ein-pfad', br(einPfad, nenner)],
        ['mit-zuruecklegen', ohne ? br(2 * einPfad, n * n) : undefined],
      ]),
    };
  },
};

/** Baumdiagramm mit Wahrscheinlichkeiten an den Ästen; gefragt ist ein Pfad (G) oder zwei (M) */
export const baumAblesen: Generator<PfadParameter> = {
  id: 'zf.baum-ablesen',
  version: 1,
  platzhalter: ['frage'],
  fehlerbildIds: ['addiert-statt-mal', 'nur-ein-pfad'],

  erzeuge(seed, p) {
    const r = rng(seed);
    const nenner = r.pick([4, 5, 10] as const);
    const a1 = r.int(1, nenner - 1); // P(T) im ersten Zug
    const a2 = r.int(1, nenner - 1); // P(T) im zweiten Zug nach T
    const b2 = r.int(1, nenner - 1); // P(T) im zweiten Zug nach N
    const ast = (z: number) => `${z}/${nenner}`;
    const S = ['T', 'N'] as const;
    const teile: string[] = [];
    const x0 = 20;
    const y0 = 130;
    const ersteY = [60, 200];
    const erste = [a1, nenner - a1];
    const zweite = [
      [a2, nenner - a2],
      [b2, nenner - b2],
    ];
    ersteY.forEach((y1, i) => {
      teile.push(
        linie(x0, y0, 150, y1),
        text(80, (y0 + y1) / 2 - 6, ast(erste[i] ?? 0), 14),
        text(162, y1 + 5, S[i] ?? '', 15),
      );
      [y1 - 40, y1 + 40].forEach((y2, j) => {
        teile.push(
          linie(175, y1, 300, y2),
          text(232, (y1 + y2) / 2 - 6, ast(zweite[i]?.[j] ?? 0), 14),
          text(312, y2 + 5, S[j] ?? '', 15),
        );
      });
    });
    const b = bild(
      340,
      260,
      teile,
      de(
        `Ein Baumdiagramm mit zwei Stufen, T für Treffer und N für Niete. Erste Stufe: T ${ast(a1)}, N ${ast(nenner - a1)}. Nach T: T ${ast(a2)}, N ${ast(nenner - a2)}. Nach N: T ${ast(b2)}, N ${ast(nenner - b2)}.`,
      ),
    );
    if (!p.erweitert) {
      const richtig = br(a1 * a2, nenner * nenner);
      return {
        platzhalter: { frage: de('Wie groß ist die Wahrscheinlichkeit für den Pfad T, T?') },
        bild: b,
        loesung: richtig,
        loesungsweg: [
          de(
            `Produktregel: Wahrscheinlichkeiten entlang des Pfades malnehmen: ${ast(a1)} · ${ast(a2)} = ${bt(gekuerzt(bruch(a1 * a2, nenner * nenner)))}`,
          ),
        ],
        fehlerbilder: fehlerbilderAus(richtig, [
          ['addiert-statt-mal', a1 + a2 <= nenner ? br(a1 + a2, nenner) : undefined],
        ]),
      };
    }
    // genau ein Treffer: T,N oder N,T
    const tn = a1 * (nenner - a2);
    const nt = (nenner - a1) * b2;
    const richtig = br(tn + nt, nenner * nenner);
    return {
      platzhalter: { frage: de('Wie groß ist die Wahrscheinlichkeit für genau einen Treffer?') },
      bild: b,
      loesung: richtig,
      loesungsweg: [
        de(
          `Pfad T, N: ${ast(a1)} · ${ast(nenner - a2)} = ${tn}/${nenner * nenner}. Pfad N, T: ${ast(nenner - a1)} · ${ast(b2)} = ${nt}/${nenner * nenner}.`,
        ),
        de(
          `Summenregel: ${tn + nt}/${nenner * nenner} = ${bt(gekuerzt(bruch(tn + nt, nenner * nenner)))}`,
        ),
      ],
      fehlerbilder: fehlerbilderAus(richtig, [
        ['nur-ein-pfad', tn > 0 ? br(tn, nenner * nenner) : undefined],
      ]),
    };
  },
};

// ---------------------------------------------------------------------------
// Abzählen (M.DZ.ZF.ZAEHLEN)

export interface ZaehlenParameter {
  /** false: Produktregel bei Kombinationen; true: auch Anordnungen (n!) und mit/ohne Wiederholung */
  readonly anordnung: boolean;
}

const fak = (n: number): number => (n <= 1 ? 1 : n * fak(n - 1));

function zaehlAufgabe(r: Rng, anordnung: boolean) {
  const art = anordnung ? r.pick(['reihe', 'mit', 'ohne'] as const) : 'kombi';
  if (art === 'kombi') {
    const k = r.pick([
      {
        text: (a: number, b: number, c: number) =>
          `Mia hat ${a} T-Shirts, ${b} Hosen und ${c} Mützen.`,
        frage:
          'Wie viele verschiedene Kombinationen aus T-Shirt, Hose und Mütze kann sie anziehen?',
      },
      {
        text: (a: number, b: number, c: number) =>
          `In der Mensa gibt es ${a} Vorspeisen, ${b} Hauptgerichte und ${c} Nachspeisen.`,
        frage: 'Wie viele verschiedene Menüs aus je einem Gang kann man wählen?',
      },
      {
        text: (a: number, b: number, c: number) =>
          `Ein Eisladen hat ${a} Sorten, ${b} Soßen und ${c} Streusel.`,
        frage: 'Wie viele Becher mit je einer Sorte, einer Soße und einem Streusel gibt es?',
      },
    ] as const);
    const a = r.int(2, 6);
    const b = r.int(2, 6);
    const c = r.int(2, 5);
    return {
      aufgabe: `${k.text(a, b, c)} ${k.frage}`,
      wert: a * b * c,
      rechnung: `${a} · ${b} · ${c}`,
      falsch: [
        ['addiert', `${a} + ${b} + ${c}`, a + b + c],
        ['stufe-vergessen', `${a} · ${b}`, a * b],
      ] as [string, string, number][],
    };
  }
  if (art === 'reihe') {
    const n = r.int(4, 7);
    const wer = r.pick([
      'Kinder',
      'Bücher',
      'Läuferinnen',
      'Autos',
      'Bilder',
      'Stühle',
      'Gäste',
      'Fahnen',
    ] as const);
    return {
      aufgabe: `Auf wie viele Arten kann man ${n} ${wer} in einer Reihe anordnen?`,
      wert: fak(n),
      rechnung: Array.from({ length: n }, (_, i) => n - i).join(' · '),
      falsch: [
        ['n-mal-n', `${n} · ${n}`, n * n],
        ['addiert', Array.from({ length: n }, (_, i) => n - i).join(' + '), (n * (n + 1)) / 2],
      ] as [string, string, number][],
    };
  }
  const stellen = r.int(2, 4);
  const ziffern = r.pick([4, 5, 6, 8, 10] as const);
  if (art === 'mit') {
    return {
      aufgabe: `Ein Zahlenschloss hat ${stellen} Ringe mit je ${ziffern} Ziffern. Wie viele Codes gibt es?`,
      wert: ziffern ** stellen,
      rechnung: Array.from({ length: stellen }, () => ziffern).join(' · '),
      falsch: [
        [
          'ohne-statt-mit',
          Array.from({ length: stellen }, (_, i) => ziffern - i).join(' · '),
          fak(ziffern) / fak(ziffern - stellen),
        ],
        ['addiert', Array.from({ length: stellen }, () => ziffern).join(' + '), ziffern * stellen],
      ] as [string, string, number][],
    };
  }
  const leute = r.int(stellen + 2, 12);
  return {
    aufgabe: `${leute} Läuferinnen starten. Wie viele Möglichkeiten gibt es für die Plätze 1 bis ${stellen}?`,
    wert: fak(leute) / fak(leute - stellen),
    rechnung: Array.from({ length: stellen }, (_, i) => leute - i).join(' · '),
    falsch: [
      [
        'mit-statt-ohne',
        Array.from({ length: stellen }, () => leute).join(' · '),
        leute ** stellen,
      ],
      [
        'addiert',
        Array.from({ length: stellen }, (_, i) => leute - i).join(' + '),
        stellen * leute - (stellen * (stellen - 1)) / 2,
      ],
    ] as [string, string, number][],
  };
}

/** „Wie viele Kombinationen …?“ – Zahl eingeben */
export const zaehlen: Generator<ZaehlenParameter> = {
  id: 'zf.zaehlen',
  version: 1,
  platzhalter: ['aufgabe'],
  fehlerbildIds: ['addiert', 'stufe-vergessen', 'n-mal-n', 'ohne-statt-mit', 'mit-statt-ohne'],

  erzeuge(seed, p) {
    const r = rng(seed);
    const a = zaehlAufgabe(r, p.anordnung);
    const richtig = zahl(a.wert);
    return {
      platzhalter: { aufgabe: de(a.aufgabe) },
      loesung: richtig,
      loesungsweg: [
        de('Produktregel: Die Anzahlen der einzelnen Stufen werden malgenommen.'),
        de(`${a.rechnung} = ${zahlText(a.wert)}`),
      ],
      fehlerbilder: fehlerbilderAus(
        richtig,
        a.falsch.map(([id, , w]) => [id, zahl(w)] as const),
      ),
    };
  },
};

/** „Welche Rechnung passt?“ */
export const zaehlenRechnung: Generator<ZaehlenParameter> = {
  id: 'zf.zaehlen-rechnung',
  version: 1,
  platzhalter: ['aufgabe'],
  fehlerbildIds: ['addiert', 'stufe-vergessen', 'n-mal-n', 'ohne-statt-mit', 'mit-statt-ohne'],

  erzeuge(seed, p) {
    const r = rng(seed);
    const a = zaehlAufgabe(r, p.anordnung);
    const { optionen, index, richtig } = optionenAus(
      r,
      a.rechnung,
      a.falsch.map(([id, t]) => [id, t] as const),
    );
    return {
      platzhalter: { aufgabe: de(a.aufgabe) },
      optionen: optionen.map(([, t]) => ({ text: de(t) })),
      loesung: richtig,
      loesungsweg: [
        de(
          'Für jede Stufe zählt, wie viele Möglichkeiten es noch gibt. Diese Zahlen werden malgenommen.',
        ),
        de(`${a.rechnung} = ${zahlText(a.wert)}`),
      ],
      fehlerbilder: fehlerbilderAus(richtig, [
        ['addiert', index('addiert')],
        ['stufe-vergessen', index('stufe-vergessen')],
        ['n-mal-n', index('n-mal-n')],
        ['ohne-statt-mit', index('ohne-statt-mit')],
        ['mit-statt-ohne', index('mit-statt-ohne')],
      ]),
    };
  },
};
