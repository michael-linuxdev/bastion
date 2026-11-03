// Daten und Zufall, Niveau E – Klasse 6 (K-31): Kreisdiagramm und relative Häufigkeit begründen.
import { aussagenGenerator } from '../../aussagen';

const dez = (x: number) => String(Math.round(x * 100) / 100).replace('.', ',');

/** „p % sind p°?“ (M.DZ.DA.KREISDIAGRAMM.BEGRUENDEN) */
export const kdWinkelAussage = aussagenGenerator(
  'kd.winkel-aussage',
  ['vollkreis-360', 'halbkreis'],
  ['prozent'],
  (r) => {
    const p = r.pick([5, 10, 15, 20, 25, 30, 35, 40, 45, 60]);
    return {
      situation: `In einem Kreisdiagramm sollen ${p} % dargestellt werden. Lea sagt: „Der Mittelpunktswinkel ist ${p}°.“ Stimmt das?`,
      werte: { prozent: p },
      richtig: `Nein. Der ganze Kreis hat 360°, also gehört zu 1 % ein Winkel von 3,6°: ${p} · 3,6° = ${dez(p * 3.6)}°.`,
      falsch: [
        ['vollkreis-360', 'Ja. Ein Prozent entspricht einem Grad.'],
        ['halbkreis', `Nein. ${p} % von 180° sind ${dez(p * 1.8)}°.`],
      ],
      weg: [
        '100 % sind der ganze Kreis mit 360°.',
        `${p} % von 360° = ${p} · 3,6° = ${dez(p * 3.6)}°`,
      ],
    };
  },
);

/** „k-mal Sechs bei n Würfen: k %?“ (M.DZ.ZF.HAEUFIGKEIT.BEGRUENDEN) */
export const zfRelativAussage = aussagenGenerator(
  'zf.relativ-aussage',
  ['anzahl-statt-anteil', 'prozent-hundertstel'],
  ['n', 'k'],
  (r) => {
    const n = r.pick([20, 25, 50]);
    const k = r.int(2, Math.floor(n / 3));
    const prozent = (k * 100) / n;
    return {
      situation: `Jana würfelt ${n}-mal und erhält ${k}-mal eine Sechs. Wie groß ist die relative Häufigkeit der Sechs in Prozent?`,
      werte: { n, k },
      richtig: `${prozent} %, denn relative Häufigkeit = ${k} : ${n} = ${dez(k / n)}, und das sind ${prozent} Hundertstel.`,
      falsch: [
        ['anzahl-statt-anteil', `${k} %, denn ${k}-mal kam die Sechs.`],
        ['prozent-hundertstel', `${dez(k / n)} %, denn ${k} : ${n} = ${dez(k / n)}.`],
      ],
      weg: [
        'Relative Häufigkeit = Anzahl : Zahl aller Versuche.',
        `${k} : ${n} = ${dez(k / n)} = ${prozent} %`,
      ],
    };
  },
);
