import { dezimalDeutsch, runde10, zahlDeutsch } from '../../../core/learning/format';
import type { Generator, Sprachobjekt } from '../../../core/learning/generator';
import { fehlerbilderAus } from '../../../core/learning/loesung';
import { rng, type Rng } from '../../../core/rng/rng';
import { auswahl, de, verlange, zahl } from '../../hilfen';

// Intern wird mit ganzen Tausendsteln gerechnet (keine Gleitkomma-Fehler).
const T = 1000;
const anzeige = (tausendstel: number): Sprachobjekt => de(dezimalDeutsch(tausendstel / T));
// Ergebnisse auf 6 Nachkommastellen genau (24,5 : 1000 = 0,0245)
const wert = (tausendstel: number) => runde10(tausendstel / T, 6);
const nachkommastellen = (tausendstel: number) =>
  tausendstel % 1000 === 0 ? 0 : tausendstel % 100 === 0 ? 1 : tausendstel % 10 === 0 ? 2 : 3;

/** Zufällige Dezimalzahl in Tausendsteln mit genau `stellen` Nachkommastellen (1 … 3). */
function dezimal(r: Rng, ganz_max: number, stellen: number): number {
  const schritt = 10 ** (3 - stellen);
  let n = r.int(0, ganz_max) * T + r.int(1, T / schritt - 1) * schritt;
  if (nachkommastellen(n) !== stellen) n += schritt; // z. B. x,50 → x,51
  return n;
}

const OPTIONEN = [{ text: de('<') }, { text: de('=') }, { text: de('>') }];
const zeichen = (a: number, b: number) => (a < b ? 0 : a === b ? 1 : 2);

export interface DezVergleichenParameter {
  readonly ganz_max: number; // 0 … 1000
}

/** „Vergleiche: 0,45 ☐ 0,5“ – Vorlage M.ZO.BR.DEZ-ORDNEN.VERGLEICHEN */
export const dezimalVergleichen: Generator<DezVergleichenParameter> = {
  id: 'br.dezimal-vergleichen',
  version: 1,
  platzhalter: ['a', 'b'],
  fehlerbildIds: ['mehr-stellen-groesser', 'zeichen-verdreht'],

  erzeuge(seed, p) {
    verlange(p.ganz_max >= 0 && p.ganz_max <= 1000, 'ganz_max: 0 … 1000');
    const r = rng(seed);
    const ganz = r.int(0, p.ganz_max) * T;
    // Falle: weniger Nachkommastellen, aber größer (0,5 > 0,45)
    const kurz = ganz + r.int(1, 9) * 100;
    let lang = ganz + r.int(1, 99) * 10;
    if (lang % 100 === 0) lang += 10;
    const [a, b] = r.int(0, 1) === 0 ? [kurz, lang] : [lang, kurz];
    const richtig = zeichen(a, b);
    // Fehler: Nachkommateil wie eine ganze Zahl verglichen (45 > 5)
    const nachA = Number(dezimalDeutsch(a / T).split(',')[1] ?? '0');
    const nachB = Number(dezimalDeutsch(b / T).split(',')[1] ?? '0');
    return {
      platzhalter: { a: anzeige(a), b: anzeige(b) },
      optionen: OPTIONEN,
      loesung: auswahl(richtig),
      loesungsweg: [
        de('Hänge Nullen an, bis beide gleich viele Nachkommastellen haben.'),
        de(
          `${dezimalDeutsch(a / T)} → ${(a / T).toFixed(3).replace('.', ',')} und ${dezimalDeutsch(b / T)} → ${(b / T).toFixed(3).replace('.', ',')}`,
        ),
        de(`${dezimalDeutsch(a / T)} ${['<', '=', '>'][richtig] ?? ''} ${dezimalDeutsch(b / T)}`),
      ],
      fehlerbilder: fehlerbilderAus(auswahl(richtig), [
        ['mehr-stellen-groesser', auswahl(zeichen(nachA, nachB))],
        ['zeichen-verdreht', richtig === 1 ? undefined : auswahl(2 - richtig)],
      ]),
    };
  },
};

const RUNDUNG: readonly Sprachobjekt[] = [de('Ganze'), de('Zehntel'), de('Hundertstel')];

export interface DezRundenParameter {
  readonly ganz_max: number;
  readonly stellen_max: number; // Rundungsstelle bis: 1 = Zehntel, 2 = Hundertstel
}

/** „Runde 3,476 auf Zehntel.“ – Vorlage M.ZO.BR.DEZ-ORDNEN.RUNDEN */
export const dezimalRunden: Generator<DezRundenParameter> = {
  id: 'br.dezimal-runden',
  version: 1,
  platzhalter: ['zahl', 'stelle'],
  fehlerbildIds: ['abgeschnitten', 'falsche-stelle'],

  erzeuge(seed, p) {
    verlange(p.stellen_max >= 1 && p.stellen_max <= 2, 'stellen_max: 1 … 2');
    const r = rng(seed);
    const ziel = r.int(0, p.stellen_max); // 0 = Ganze, 1 = Zehntel, 2 = Hundertstel
    const n = dezimal(r, p.ganz_max, Math.min(3, ziel + r.int(1, 2)));
    const einheit = 10 ** (3 - ziel);
    const richtig = Math.floor(n / einheit + 0.5) * einheit;
    const ab = Math.floor(n / einheit) * einheit;
    const nachbar = ziel < 2 ? Math.floor(n / (einheit / 10) + 0.5) * (einheit / 10) : undefined;
    return {
      platzhalter: { zahl: anzeige(n), stelle: RUNDUNG[ziel] ?? de('') },
      loesung: zahl(wert(richtig)),
      loesungsweg: [
        de(
          `Entscheidend ist die Ziffer rechts von den ${RUNDUNG[ziel]?.de ?? ''}n: ${Math.floor((n % einheit) / (einheit / 10))}.`,
        ),
        de(`${dezimalDeutsch(n / T)} ≈ ${dezimalDeutsch(richtig / T)}`),
      ],
      fehlerbilder: fehlerbilderAus(zahl(wert(richtig)), [
        ['abgeschnitten', zahl(wert(ab))],
        ['falsche-stelle', nachbar !== undefined ? zahl(wert(nachbar)) : undefined],
      ]),
    };
  },
};

export interface DezAddSubParameter {
  readonly ganz_max: number; // 1 … 1000
}

/** „Berechne 3,45 + 12,8“ – Vorlage M.ZO.BR.DEZ-RECHNEN.ADD-SUB */
export const dezimalAddSub: Generator<DezAddSubParameter> = {
  id: 'br.dezimal-add-sub',
  version: 1,
  platzhalter: ['a', 'b', 'zeichen'],
  fehlerbildIds: ['rechtsbuendig-geschrieben'],

  erzeuge(seed, p) {
    verlange(p.ganz_max >= 1 && p.ganz_max <= 1000, 'ganz_max: 1 … 1000');
    const r = rng(seed);
    const plus = r.int(0, 1) === 0;
    let a = dezimal(r, p.ganz_max, r.int(1, 2));
    let b = dezimal(r, p.ganz_max, nachkommastellen(a) === 1 ? 2 : 1);
    if (!plus && b > a) [a, b] = [b, a];
    const richtig = plus ? a + b : a - b;
    // Fehler: Ziffern rechtsbündig untereinander (Komma nicht unter Komma)
    const stellen = Math.max(nachkommastellen(a), nachkommastellen(b));
    const ganzzahl = (x: number) =>
      Number(
        dezimalDeutsch(x / T)
          .replace(',', '')
          .replaceAll(String.fromCharCode(0x202f), ''),
      );
    const roh = plus ? ganzzahl(a) + ganzzahl(b) : ganzzahl(a) - ganzzahl(b);
    const falsch = roh > 0 ? runde10(roh / 10 ** stellen, 3) : undefined;
    return {
      platzhalter: { a: anzeige(a), b: anzeige(b), zeichen: de(plus ? '+' : '−') },
      loesung: zahl(wert(richtig)),
      loesungsweg: [
        de('Schreibe Komma unter Komma. Fülle fehlende Stellen mit Nullen auf.'),
        de(
          `${dezimalDeutsch(a / T)} ${plus ? '+' : '−'} ${dezimalDeutsch(b / T)} = ${dezimalDeutsch(richtig / T)}`,
        ),
      ],
      fehlerbilder: fehlerbilderAus(zahl(wert(richtig)), [
        ['rechtsbuendig-geschrieben', falsch !== undefined ? zahl(falsch) : undefined],
      ]),
    };
  },
};

export interface DezMalDurchParameter {
  readonly mit_zehnerpotenz: boolean; // false: · bzw. : einstellige Zahl; true: · bzw. : 10, 100, 1000
}

/** „Berechne 2,4 · 6“ / „24,5 : 1000“ – Vorlagen M.ZO.BR.DEZ-RECHNEN.EINSTELLIG und .ZEHNERPOTENZ */
export const dezimalMalDurch: Generator<DezMalDurchParameter> = {
  id: 'br.dezimal-mal-durch',
  version: 1,
  platzhalter: ['a', 'b', 'zeichen'],
  fehlerbildIds: ['komma-um-eine-stelle-falsch', 'komma-falsche-richtung'],

  erzeuge(seed, p) {
    const r = rng(seed);
    const mal = r.int(0, 1) === 0;
    let a: number;
    let b: number;
    if (p.mit_zehnerpotenz) {
      a = dezimal(r, 99, r.int(1, 2));
      b = r.pick([10, 100, 1000]);
    } else {
      b = r.int(2, 9);
      a = dezimal(r, 20, r.int(1, 2));
      if (!mal) a = Math.round(a / b / 10) * 10 * b || 10 * b; // Division geht auf (Hundertstel)
    }
    const richtig = mal ? a * b : a / b;
    const verschoben = mal ? richtig / 10 : richtig * 10;
    return {
      platzhalter: { a: anzeige(a), b, zeichen: de(mal ? '·' : ':') },
      loesung: zahl(wert(richtig)),
      loesungsweg: p.mit_zehnerpotenz
        ? [
            de(
              `${mal ? 'Mal' : 'Durch'} ${zahlDeutsch(b)}: Komma um ${Math.log10(b)} Stelle${b > 10 ? 'n' : ''} nach ${mal ? 'rechts' : 'links'} verschieben.`,
            ),
            de(
              `${dezimalDeutsch(a / T)} ${mal ? '·' : ':'} ${zahlDeutsch(b)} = ${dezimalDeutsch(richtig / T)}`,
            ),
          ]
        : [
            de(
              `Rechne ohne Komma und setze es dann: Das Ergebnis hat so viele Nachkommastellen wie ${dezimalDeutsch(a / T)}.`,
            ),
            de(`${dezimalDeutsch(a / T)} ${mal ? '·' : ':'} ${b} = ${dezimalDeutsch(richtig / T)}`),
          ],
      fehlerbilder: fehlerbilderAus(zahl(wert(richtig)), [
        ['komma-um-eine-stelle-falsch', zahl(wert(verschoben))],
        [
          'komma-falsche-richtung',
          p.mit_zehnerpotenz ? zahl(wert(mal ? a / b : a * b)) : undefined,
        ],
      ]),
    };
  },
};
