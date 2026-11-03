// Gleichungen mit Dezimalzahlen, Niveau E – Klasse 6 (K-31): Umkehraufgaben begründen.
import { aussagenGenerator } from '../../aussagen';

const dez = (x: number) => String(Math.round(x * 100) / 100).replace('.', ',');

/** „k · x − a = c: x = (c − a) : k?“ (M.SF.BR.GLEICHUNGEN.BEGRUENDEN) */
export const glUmkehrAussage = aussagenGenerator(
  'gl.umkehr-aussage',
  ['umkehraufgabe', 'reihenfolge'],
  ['k', 'a', 'c'],
  (r) => {
    const k = r.int(2, 4);
    const x = r.int(2, 9) + 0.5;
    const a = r.int(1, 4) + 0.5;
    const c = k * x - a;
    const [K, A, C] = [String(k), dez(a), dez(c)];
    return {
      situation: `Mia löst ${K} · x − ${A} = ${C} und schreibt: „x = (${C} − ${A}) : ${K}.“ Stimmt das?`,
      werte: { k, a, c },
      richtig: `Nein. Minus ${A} macht man mit Plus rückgängig: ${K} · x = ${dez(c + a)}, also x = ${dez(c + a)} : ${K} = ${dez(x)}.`,
      falsch: [
        ['umkehraufgabe', 'Ja. Man rechnet mit der Rechenart weiter, die in der Gleichung steht.'],
        ['reihenfolge', `Nein. Zuerst durch ${K} teilen, dann ${A} abziehen.`],
      ],
      weg: [
        `Rückwärts rechnen: Zuletzt wurde ${A} abgezogen, also zuerst ${A} addieren.`,
        `${C} + ${A} = ${dez(c + a)}, ${dez(c + a)} : ${K} = ${dez(x)}. Probe: ${K} · ${dez(x)} − ${A} = ${C}.`,
      ],
    };
  },
);
