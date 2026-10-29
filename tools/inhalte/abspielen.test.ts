// Probelauf aller Erstvermittlungen mit dem Abspieler (src/core/learning/abspielen.ts):
// Wer alles richtig beantwortet, kommt ans Ende; jede bekannte falsche Antwort
// wird als genau ihre Fehlvorstellung erkannt.
import { describe, expect, it } from 'vitest';
import { bewerte, erster, naechstes } from '../../src/core/learning/abspielen';
import type { Vermittlung } from '../../src/core/learning/vermittlung';
import { ladeVermittlungen } from './laden';

const sequenzen = ladeVermittlungen('content').map((d) => d.daten as Vermittlung);

describe.each(sequenzen.map((v) => [v.id, v] as const))('Abspielen %s', (_, v) => {
  it('alles richtig → Ende über den Übergang', () => {
    let s = erster(v);
    const besucht: string[] = [];
    for (let i = 0; s && i <= v.schritte.length; i++) {
      besucht.push(s.id);
      const a = s.antwort;
      const b = !a
        ? undefined
        : 'optionen' in a
          ? bewerte(s, { option: a.optionen.findIndex((o) => o.richtig === true) })
          : bewerte(s, { text: a.eingabe.loesung });
      if (b) expect(b, s.id).toEqual({ richtig: true });
      const z = naechstes(v, s, b);
      s = z.art === 'schritt' ? z.schritt : undefined;
      if (z.art === 'ende') break;
    }
    expect(besucht.at(-1)).toBe('uebergang');
  });

  it('jede bekannte falsche Antwort ergibt ihre Fehlvorstellung', () => {
    for (const s of v.schritte) {
      const a = s.antwort;
      if (!a) continue;
      if ('optionen' in a)
        a.optionen.forEach((o, i) => {
          if (o.fv) expect(bewerte(s, { option: i }), s.id).toEqual({ richtig: false, fv: o.fv });
        });
      else
        for (const f of a.eingabe.fehler ?? [])
          expect(bewerte(s, { text: f.wert }), s.id).toEqual({ richtig: false, fv: f.fv });
    }
  });
});
