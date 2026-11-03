// Terme, Niveau E – Klasse 8 (K-31): Umformungen prüfen und die richtige Begründung wählen.
import { aussagenGenerator } from '../../aussagen';

/** „a − (b · x − c) = a − b · x − c“ – stimmt das? (M.SF.TU.ZUSAMMENFASSEN.BEGRUENDEN) */
export const tuMinusklammerAussage = aussagenGenerator(
  'tu.minusklammer-aussage',
  ['minusklammer', 'vorzeichen-glied', 'ungleichartig'],
  ['a', 'b', 'c'],
  (r) => {
    const a = r.int(2, 9);
    const b = r.int(2, 9);
    const c = r.int(2, 9);
    return {
      situation: `Lena rechnet: ${a} − (${b} · x − ${c}) = ${a} − ${b} · x − ${c}. Stimmt das?`,
      werte: { a, b, c },
      richtig: `Nein. Ein Minus vor der Klammer dreht jedes Vorzeichen in der Klammer: ${a} − ${b} · x + ${c}.`,
      falsch: [
        ['minusklammer', 'Ja. Die Klammer darf man einfach weglassen.'],
        ['vorzeichen-glied', `Nein. Richtig ist ${a} + ${b} · x − ${c}.`],
        ['ungleichartig', `Nein. Man fasst zusammen: ${a - b} · x − ${c}.`],
      ],
      weg: [
        'Minus vor der Klammer heißt: jedes Glied in der Klammer mit −1 malnehmen.',
        `−(${b} · x − ${c}) = −${b} · x + ${c}, also ${a} − ${b} · x + ${c}. Zahl und x-Glied sind ungleichartig.`,
      ],
    };
  },
);

/** „a · (x + b) = a · x + b“ – stimmt das? (M.SF.TU.AUSMULTIPLIZIEREN.BEGRUENDEN) */
export const tuAusmultiplizierenAussage = aussagenGenerator(
  'tu.ausmultiplizieren-aussage',
  ['klammer-halb', 'vorzeichen-falsch'],
  ['a', 'b', 'minus'],
  (r) => {
    const a = r.int(2, 9);
    const b = r.int(2, 9);
    const minus = r.int(0, 1) === 1;
    const ab = a * b;
    return minus
      ? {
          situation: `Tim rechnet: −${a} · (x − ${b}) = −${a} · x − ${ab}. Stimmt das?`,
          werte: { a, b, minus: 1 },
          richtig: `Nein. Minus mal Minus ergibt Plus: −${a} · x + ${ab}.`,
          falsch: [
            ['vorzeichen-falsch', 'Ja. Jedes Glied wird mit dem Faktor malgenommen.'],
            ['klammer-halb', `Nein. Richtig ist −${a} · x − ${b}.`],
          ],
          weg: [
            `Jedes Glied mit −${a} malnehmen: −${a} · x und −${a} · (−${b}).`,
            `−${a} · (−${b}) = +${ab}, also −${a} · x + ${ab}.`,
          ],
        }
      : {
          situation: `Tim rechnet: ${a} · (x + ${b}) = ${a} · x + ${b}. Stimmt das?`,
          werte: { a, b, minus: 0 },
          richtig: `Nein. Jedes Glied in der Klammer wird malgenommen: ${a} · x + ${ab}.`,
          falsch: [
            ['klammer-halb', `Ja. Der Faktor ${a} gehört nur zum x.`],
            ['vorzeichen-falsch', `Nein. Richtig ist ${a} · x − ${ab}.`],
          ],
          weg: [
            `Jedes Glied mit ${a} malnehmen: ${a} · x und ${a} · ${b}.`,
            `${a} · ${b} = ${ab}, also ${a} · x + ${ab}.`,
          ],
        };
  },
);

/** „(x + a)² = x² + a²“ – stimmt das? (M.SF.TU.BINOMISCH.BEGRUENDEN) */
export const tuBinomischAussage = aussagenGenerator(
  'tu.binomisch-aussage',
  ['mittelglied', 'quadrat-mal-zwei', 'vorzeichen-falsch'],
  ['a', 'minus'],
  (r) => {
    const a = r.int(3, 9);
    const minus = r.int(0, 1) === 1;
    const v = minus ? '−' : '+';
    const g = minus ? '+' : '−';
    return {
      situation: `Ida rechnet: (x ${v} ${a})² = x² ${v} ${a * a}. Stimmt das?`,
      werte: { a, minus: minus ? 1 : 0 },
      richtig: `Nein. Es fehlt das Mittelglied: (x ${v} ${a})² = x² ${v} ${2 * a} · x + ${a * a}.`,
      falsch: [
        ['mittelglied', 'Ja. Man quadriert jedes Glied der Klammer.'],
        ['quadrat-mal-zwei', `Nein. Richtig ist x² ${v} ${2 * a}.`],
        [
          'vorzeichen-falsch',
          `Nein. Richtig ist x² ${g} ${2 * a} · x ${minus ? '−' : '+'} ${a * a}.`,
        ],
      ],
      weg: [
        `(x ${v} ${a})² = (x ${v} ${a}) · (x ${v} ${a}): Jedes Glied mit jedem malnehmen.`,
        `x² ${v} ${a} · x ${v} ${a} · x + ${a * a} = x² ${v} ${2 * a} · x + ${a * a}`,
      ],
    };
  },
);

/** „a · (x − b) = c: Welcher erste Schritt ist richtig?“ (M.SF.TU.GLEICHUNGEN.BEGRUENDEN) */
export const tuGleichungSchrittAussage = aussagenGenerator(
  'tu.gleichung-schritt-aussage',
  ['klammer-halb', 'vorzeichen-falsch'],
  ['a', 'b', 'c'],
  (r) => {
    const a = r.int(2, 6);
    const b = r.int(2, 9);
    const x = r.int(b + 1, b + 8);
    const c = a * (x - b);
    return {
      situation: `Gesucht ist x in ${a} · (x − ${b}) = ${c}. Welcher erste Schritt ist richtig?`,
      werte: { a, b, c },
      richtig: `${a} · x − ${a * b} = ${c}, denn beide Glieder der Klammer werden mit ${a} malgenommen. Dann ist x = ${x}.`,
      falsch: [
        ['klammer-halb', `${a} · x − ${b} = ${c}, denn nur das x wird mit ${a} malgenommen.`],
        [
          'vorzeichen-falsch',
          `${a} · x + ${a * b} = ${c}, denn malnehmen macht das Minus zu Plus.`,
        ],
      ],
      weg: [
        `Klammer auflösen: ${a} · x − ${a * b} = ${c}.`,
        `${a} · x = ${c + a * b}, also x = ${x}. Probe: ${a} · (${x} − ${b}) = ${c}.`,
      ],
    };
  },
);

/** „−a · x < a · k, also x < −k“ – stimmt das? (M.SF.TU.UNGLEICHUNGEN.BEGRUENDEN) */
export const tuUngleichungAussage = aussagenGenerator(
  'tu.ungleichung-aussage',
  ['zeichen-drehen', 'grenze', 'zeichen-verdreht'],
  ['a', 'k'],
  (r) => {
    const a = r.int(2, 6);
    const k = r.int(2, 9);
    return {
      situation: `Ole löst −${a} · x < ${a * k} und erhält x < −${k}. Stimmt das?`,
      werte: { a, k },
      richtig: `Nein. Beim Teilen durch die negative Zahl −${a} dreht sich das Zeichen: x > −${k}.`,
      falsch: [
        ['zeichen-drehen', `Ja. Man teilt beide Seiten durch −${a}.`],
        ['grenze', `Nein. Richtig ist x ≥ −${k}, die Grenze gehört dazu.`],
        ['zeichen-verdreht', `Nein. Richtig ist x < ${k}.`],
      ],
      weg: [
        `Beide Seiten durch −${a} teilen. Teilen durch eine negative Zahl dreht das Zeichen < zu >.`,
        `Probe mit x = 0: −${a} · 0 = 0 < ${a * k} stimmt, und 0 > −${k}. Mit x < −${k} wäre 0 keine Lösung.`,
      ],
    };
  },
);
