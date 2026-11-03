import { describe } from 'vitest';
import type { Instanz, Loesung } from '../../../core/learning/generator';
import { pflichttests } from '../../pflichttests';
import { krAendern, krRingFehler } from './aussagen';

const texte = (i: Instanz) => (i.optionen ?? []).map((o) => o.text?.de ?? '');
const vier = (i: Instanz) => ((i.optionen?.length ?? 0) === 4 ? [] : ['vier Optionen']);

describe('Radius k-mal so groß (E)', () => {
  pflichttests(krAendern, {
    niveaus: { E: {} },
    // Unabhängig: Faktor aus k und der Größe, dann die Möglichkeit, die mit ihm beginnt und begründet
    unabhaengigeLoesung(i): Loesung {
      const k = Number(i.platzhalter['faktor']);
      const flaeche = String((i.platzhalter['groesse'] as { de: string }).de).includes('Fläche');
      const f = flaeche ? k * k : k;
      const wert = texte(i).findIndex((x) => x.startsWith(`${f}-mal`) && x.includes('denn in'));
      return { typ: 'auswahl', wert };
    },
    grenzverletzungen: (i) => {
      const k = Number(i.platzhalter['faktor']);
      const zahlen = texte(i).map((x) => Number(x.split('-')[0]));
      const v = vier(i);
      if (![3, 4, 5].includes(k)) v.push(`k = ${k}`);
      if (new Set(zahlen).size !== 4) v.push('zwei gleiche Faktoren');
      return v;
    },
    mindestensVerschieden: { E: 6 },
  });
});

describe('Fehler im Kreisring (E)', () => {
  pflichttests(krRingFehler, {
    niveaus: { E: {} },
    unabhaengigeLoesung(i): Loesung {
      const R = Number(i.platzhalter['gross']);
      const r = Number(i.platzhalter['klein']);
      const ring = (Math.round((3.14 * R * R - 3.14 * r * r) * 100) / 100)
        .toString()
        .replace('.', ',');
      const wert = texte(i).findIndex((x) => x.startsWith('Falsch. Erst') && x.includes(ring));
      return { typ: 'auswahl', wert };
    },
    grenzverletzungen: (i) => {
      const R = Number(i.platzhalter['gross']);
      const r = Number(i.platzhalter['klein']);
      const v = vier(i);
      if (R < 4 || R > 10 || r < 1 || R - r < 2) v.push(`R = ${R}, r = ${r}`);
      return v;
    },
    mindestensVerschieden: { E: 20 },
  });
});
