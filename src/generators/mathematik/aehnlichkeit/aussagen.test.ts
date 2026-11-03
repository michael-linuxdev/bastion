import { describe } from 'vitest';
import type { Instanz, Loesung } from '../../../core/learning/generator';
import { pflichttests } from '../../pflichttests';
import { aeAehnlichAussage, aeFlaecheVolumenAussage, aeStreckfaktorAussage } from './aussagen';

const texte = (i: Instanz) => (i.optionen ?? []).map((o) => o.text?.de ?? '');
const w = (i: Instanz, n: string) => Number(i.platzhalter[n]);
const de = (x: number) => String(Math.round(x * 1000) / 1000).replace('.', ',');
const index = (i: Instanz, passt: (t: string) => boolean): Loesung => ({
  typ: 'auswahl',
  wert: texte(i).findIndex(passt),
});
const verschieden = (i: Instanz) =>
  new Set(texte(i)).size === texte(i).length ? [] : ['zwei gleiche Möglichkeiten'];

describe('Streckfaktor begründen (E)', () => {
  pflichttests(aeStreckfaktorAussage, {
    niveaus: { E: {} },
    // Unabhängig: k = Bild : Original
    unabhaengigeLoesung: (i) =>
      index(
        i,
        (t) =>
          t.startsWith(`k = ${de(w(i, 'bild'))} : `) &&
          t.includes(`= ${de(w(i, 'bild') / w(i, 'original'))},`),
      ),
    grenzverletzungen: verschieden,
    mindestensVerschieden: { E: 15 },
  });
});

describe('Ähnliche Dreiecke begründen (E)', () => {
  pflichttests(aeAehnlichAussage, {
    niveaus: { E: {} },
    // Unabhängig: dritte Winkel bilden und Winkelmengen vergleichen
    unabhaengigeLoesung(i) {
      const a = w(i, 'alpha');
      const b = w(i, 'beta');
      const c = w(i, 'gamma2');
      const d = w(i, 'delta2');
      const eins = [a, b, 180 - a - b].sort((x, y) => x - y).join();
      const zwei = [c, d, 180 - c - d].sort((x, y) => x - y).join();
      const ja = eins === zwei;
      return index(i, (t) => (ja ? t.startsWith('Ja. Beide') : t.startsWith('Nein. Dreieck 1')));
    },
    grenzverletzungen: (i) => {
      const v = verschieden(i);
      if (180 - w(i, 'gamma2') - w(i, 'delta2') <= 0) v.push('Winkelsumme');
      return v;
    },
    mindestensVerschieden: { E: 20 },
  });
});

describe('Fläche und Volumen beim Strecken (E)', () => {
  pflichttests(aeFlaecheVolumenAussage, {
    niveaus: { E: {} },
    unabhaengigeLoesung(i) {
      const soll = w(i, 'k') ** (w(i, 'volumen') ? 3 : 2) * w(i, 'wert');
      return index(i, (t) => t.startsWith(`Das Bild hat ${soll} `) && t.includes('wächst mit k'));
    },
    grenzverletzungen: (i) => {
      const v = verschieden(i);
      const zahlen = texte(i).map((t) => Number(/hat (\d+)/.exec(t)?.[1]));
      if (new Set(zahlen).size !== zahlen.length) v.push('zwei gleiche Ergebnisse');
      return v;
    },
    mindestensVerschieden: { E: 15 },
  });
});
