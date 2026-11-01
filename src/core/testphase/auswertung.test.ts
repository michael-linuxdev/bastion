import { describe, expect, it } from 'vitest';
import type { AufgabeEreignis, SchrittErgebnis } from '../learning/ereignis';
import type { VermittlungEreignis } from '../learning/vermittlung-ereignis';
import type { NutzungEreignis } from './nutzung';
import {
  bericht,
  f5Urteil,
  gesamtAuswerten,
  kriterium1Urteil,
  personAuswerten,
  protokollLesen,
  zusammenfuehren,
} from './auswertung';
import { PROTOKOLL_FORMAT, type ProtokollEreignis, type Testprotokoll } from './protokoll';

// Synthetische Protokolle: keine echten Teilnehmer-Nummern (die Form „X-…“ ist keine gültige)
const K = 'M.ZO.BR.BEGRIFF';

type Ohne<E> = Omit<E, 'profil' | 'geraet'>;

class Bau {
  private ts = 1_000;
  private n = 0;
  readonly ereignisse: ProtokollEreignis[] = [];
  /** ProtokollEreignis kennt nur die gemeinsamen Felder; hier mit Prüfung je Art */
  private rein(e: Ohne<AufgabeEreignis> | Ohne<VermittlungEreignis> | Ohne<NutzungEreignis>) {
    this.ereignisse.push(e);
  }
  private naechst() {
    this.ts += 1_000;
    this.n += 1;
    return { id: `E${String(this.n).padStart(5, '0')}`, ts: this.ts, tag: '2026-11-01' as const };
  }
  vermittlung(schritt: string, typ: 'antwort' | 'abgeschlossen' = 'abgeschlossen', k = K) {
    this.rein({
      ...this.naechst(),
      art: 'vermittlung',
      v: 1,
      kompetenz: k,
      inhalt: `${k}@1`,
      schritt,
      typ,
      ...(typ === 'antwort' ? { richtig: true, antwort: '1' } : {}),
    });
    return this;
  }
  aufgabe(
    a: {
      ergebnis?: 'richtig' | 'falsch';
      hilfen?: number;
      niveau?: 'G' | 'M';
      modus?: AufgabeEreignis['modus'];
      fehlerbild?: string;
      schritte?: SchrittErgebnis[];
      kompetenz?: string;
      vorlage?: string;
    } = {},
  ) {
    const ergebnis = a.ergebnis ?? 'richtig';
    this.rein({
      ...this.naechst(),
      art: 'aufgabe',
      v: 2,
      sitzung: 'S1',
      modus: a.modus ?? 'ueben',
      kompetenz: a.kompetenz ?? K,
      vorlage: a.vorlage ?? 'br.begriff-anteil',
      niveau: a.niveau ?? 'G',
      quelle: { generator: 'g', version: 1, seed: 1 },
      paket: 'p',
      ergebnis,
      hilfen: a.hilfen ?? 0,
      dauerMs: 1000,
      faellig: false,
      bewertung: null,
      ...(a.fehlerbild ? { fehlerbild: a.fehlerbild } : {}),
      ...(a.schritte ? { schritte: a.schritte } : {}),
      ...(ergebnis === 'falsch'
        ? {
            schnappschuss: {
              platzhalter: { z: 1 },
              loesung: { typ: 'zahl' as const, wert: 4 },
              antwort: { typ: 'zahl' as const, wert: 1 },
            },
          }
        : {}),
    });
    return this;
  }
  nutzung(was: 'abbruch' | 'weg-uebersprungen' | 'hilfe', ziel: string) {
    this.rein({ ...this.naechst(), art: 'nutzung', v: 1, was, ziel });
    return this;
  }
  protokoll(teilnehmer: string): Testprotokoll {
    return {
      format: PROTOKOLL_FORMAT,
      teilnehmer,
      erstellt: '2026-11-01',
      seit: 0,
      ereignisse: this.ereignisse,
      unbekannteFehler: [],
    };
  }
}

/** Erstvermittlung, dann drei Einstiegsaufgaben; `fehler` macht eine davon falsch oder mit Tipp */
function person(nr: string, fehler?: 'falsch' | 'tipp'): Testprotokoll {
  const b = new Bau().vermittlung('entdecken', 'antwort').vermittlung('uebergang');
  b.aufgabe();
  b.aufgabe(fehler === 'tipp' ? { hilfen: 1 } : {});
  b.aufgabe(fehler === 'falsch' ? { ergebnis: 'falsch', fehlerbild: 'vertauscht' } : {});
  return b.protokoll(nr);
}

/** n falsche Antworten, davon m mit Fehlerbild */
function fehler(b: Bau, n: number, m: number): Bau {
  for (let i = 0; i < n; i++)
    b.aufgabe({
      ergebnis: 'falsch',
      niveau: 'M',
      vorlage: i < m ? 'br.begriff-anteil' : `br.unbekannt-${i % 2}`,
      ...(i < m ? { fehlerbild: 'vertauscht' } : {}),
    });
  return b;
}

describe('Urteile an der Schwelle (STRATEGIE §0)', () => {
  it('Kriterium 1: mindestens 2 von 3, ab 3 Personen', () => {
    expect(kriterium1Urteil(2, 3)).toBe('ja');
    expect(kriterium1Urteil(1, 3)).toBe('nein');
    expect(kriterium1Urteil(2, 2)).toBe('offen');
    expect(kriterium1Urteil(3, 4)).toBe('ja');
    expect(kriterium1Urteil(2, 4)).toBe('nein');
  });
  it('F5: 80 % genau reicht, knapp darunter nicht', () => {
    expect(f5Urteil(8, 10)).toBe('ja');
    expect(f5Urteil(15, 19)).toBe('nein'); // 78,9 %
    expect(f5Urteil(0, 0)).toBe('offen');
  });
});

describe('Einstiegsaufgaben (TESTS.md §4.5)', () => {
  it('die ersten drei auf Niveau G nach dem Abschluss zählen, spätere nicht', () => {
    const b = new Bau().vermittlung('uebergang');
    b.aufgabe({ niveau: 'M' }).aufgabe({ modus: 'fehlerwerkstatt' });
    b.aufgabe().aufgabe().aufgabe();
    b.aufgabe({ ergebnis: 'falsch' });
    const [e] = personAuswerten(b.protokoll('X')).einstieg;
    expect(e?.status).toBe('geloest');
    expect(e?.aufgaben).toHaveLength(3);
  });
  it('ein Tipp genügt für „nicht gelöst“', () => {
    expect(personAuswerten(person('X', 'tipp')).einstieg[0]?.status).toBe('nicht-geloest');
  });
  it('weniger als drei Aufgaben: zählt nicht, außer eine ist schon falsch', () => {
    const b = new Bau().vermittlung('uebergang').aufgabe().aufgabe();
    expect(personAuswerten(b.protokoll('X')).einstieg[0]?.status).toBe('zu-wenig');
    b.aufgabe({ ergebnis: 'falsch', niveau: 'M' });
    expect(personAuswerten(b.protokoll('X')).einstieg[0]?.status).toBe('zu-wenig');
    const c = new Bau().vermittlung('uebergang').aufgabe({ ergebnis: 'falsch' });
    expect(personAuswerten(c.protokoll('X')).einstieg[0]?.status).toBe('nicht-geloest');
  });
  it('vorher geübt zählt nicht, eine falsche Diagnose vorher schon', () => {
    const geuebt = new Bau().aufgabe().vermittlung('uebergang').aufgabe().aufgabe().aufgabe();
    expect(personAuswerten(geuebt.protokoll('X')).einstieg[0]?.status).toBe('vorher-geuebt');
    const diagnose = new Bau()
      .aufgabe({ modus: 'diagnose', ergebnis: 'falsch' })
      .vermittlung('uebergang')
      .aufgabe()
      .aufgabe()
      .aufgabe();
    expect(personAuswerten(diagnose.protokoll('X')).einstieg[0]?.status).toBe('geloest');
  });
  it('nur der erste Abschluss einer Erstvermittlung zählt', () => {
    const b = new Bau().vermittlung('uebergang').aufgabe({ ergebnis: 'falsch' });
    b.vermittlung('uebergang').aufgabe().aufgabe().aufgabe();
    const p = personAuswerten(b.protokoll('X'));
    expect(p.einstieg).toHaveLength(1);
    expect(p.einstieg[0]?.status).toBe('nicht-geloest');
  });
});

describe('Testlauf, der alles erfüllt', () => {
  // Person 1 gelöst, dazu 10 Fehler, 8 mit Fehlerbild; Person 2 mit Tipp; Person 3 gelöst
  const p1 = fehler(new Bau().vermittlung('uebergang').aufgabe().aufgabe().aufgabe(), 10, 8);
  const g = gesamtAuswerten([p1.protokoll('X-1'), person('X-2', 'tipp'), person('X-3')]);

  it('Kriterium 1: 2 von 3, erfüllt', () => {
    expect(g.kriterium1).toEqual([
      { kompetenz: K, ausgewertet: 3, geloest: 2, nichtGezaehlt: 0, erfuellt: 'ja' },
    ]);
  });
  it('F5: 8 von 10, erfüllt; unbekannte Fehler nach Vorlage gruppiert', () => {
    expect(g.f5).toEqual({ falsch: 10, mitFehlerbild: 8, anteil: 0.8, erfuellt: 'ja' });
    expect(g.unbekanntJeVorlage.map((u) => [u.vorlage, u.antworten.length])).toEqual([
      ['br.unbekannt-0', 1],
      ['br.unbekannt-1', 1],
    ]);
  });
  it('Bericht nennt das Ergebnis und keine Teilnehmer-Nummer', () => {
    const text = bericht(g);
    expect(text).toContain(`| ${K} | 2 von 3 | 0 | ja |`);
    expect(text).toContain('8 von 10 falschen Antworten (80,0 %)');
    expect(text).not.toContain('X-1');
    expect(bericht(g, { mitNummern: true })).toContain('Person 1 (X-1)');
  });
});

describe('Testlauf, der knapp scheitert', () => {
  // Person 1 gelöst, Personen 2 und 3 brauchen bei einer Einstiegsaufgabe einen Tipp;
  // Person 1 hat 19 falsche Antworten, 15 davon mit Fehlerbild (78,9 %)
  const p1 = fehler(new Bau().vermittlung('uebergang').aufgabe().aufgabe().aufgabe(), 19, 15);
  const g = gesamtAuswerten([p1.protokoll('X-1'), person('X-2', 'tipp'), person('X-3', 'tipp')]);

  it('Kriterium 1: 1 von 3, nicht erfüllt', () => {
    expect(g.kriterium1[0]).toMatchObject({ geloest: 1, ausgewertet: 3, erfuellt: 'nein' });
    expect(bericht(g)).toContain(`| ${K} | 1 von 3 | 0 | nein |`);
  });
  it('F5: 15 von 19 (78,9 %), nicht erfüllt', () => {
    expect(g.f5).toMatchObject({ falsch: 19, mitFehlerbild: 15, erfuellt: 'nein' });
    expect(bericht(g)).toContain('(78,9 %)');
  });
});

describe('Zwischenschritte, „Weiter ohne Weg“ und Abbrüche', () => {
  const b = new Bau()
    .vermittlung('entdecken', 'antwort')
    .vermittlung('erklaeren-ganzes', 'antwort')
    .nutzung('abbruch', `vermittlung:${K}`)
    .nutzung('abbruch', 'vermittlung:M.ZO.BR.ERWEITERN')
    .aufgabe({
      ergebnis: 'falsch',
      fehlerbild: 'x',
      schritte: [
        { id: 'a', versuche: 1, richtig: true },
        { id: 'b', versuche: 2, richtig: true },
        { id: 'c', versuche: 2, richtig: false },
      ],
    })
    .aufgabe({ ergebnis: 'falsch' })
    .nutzung('weg-uebersprungen', 'br.begriff-anteil')
    .nutzung('hilfe', 'tipp:br.begriff-anteil')
    .nutzung('hilfe', 'loesungsweg:br.begriff-anteil');
  const p = personAuswerten(b.protokoll('X'));

  it('zählt Schritte nach Versuchen', () => {
    expect(p.schritte).toEqual({
      aufgabenMitWeg: 1,
      schritte: 3,
      ersterVersuch: 1,
      zweiterVersuch: 1,
      gezeigt: 1,
      ohneWeg: 1,
    });
    expect([p.tipps, p.loesungswege]).toEqual([1, 1]);
  });
  it('nennt den zuletzt beantworteten Schritt einer abgebrochenen Erstvermittlung', () => {
    expect(p.abbrueche).toEqual([
      { kompetenz: K, schritt: 'erklaeren-ganzes' },
      { kompetenz: 'M.ZO.BR.ERWEITERN' },
    ]);
    expect(bericht(gesamtAuswerten([b.protokoll('X')]))).toContain(
      'Erstvermittlung abgebrochen: M.ZO.BR.ERWEITERN, vor der ersten Antwort',
    );
  });
});

describe('Dateien lesen und zusammenführen', () => {
  it('lehnt fremde Formate ab', () => {
    expect(protokollLesen(null)).toEqual({ fehler: 'keine JSON-Datei' });
    expect(protokollLesen({ format: 99 })).toHaveProperty('fehler');
    expect(protokollLesen({ format: PROTOKOLL_FORMAT, teilnehmer: 'X' })).toHaveProperty('fehler');
    expect(
      protokollLesen({ format: PROTOKOLL_FORMAT, teilnehmer: 'X', ereignisse: [{ art: 'x' }] }),
    ).toHaveProperty('fehler');
    expect(protokollLesen(person('X'))).toHaveProperty('protokoll');
  });
  it('zwei Exporte derselben Person werden eins, ohne doppelte Ereignisse', () => {
    const ganz = person('X');
    const frueh: Testprotokoll = { ...ganz, ereignisse: ganz.ereignisse.slice(0, 3) };
    const [eins, ...rest] = zusammenfuehren([frueh, ganz, person('Y')]);
    expect(rest).toHaveLength(1);
    expect(eins?.ereignisse).toHaveLength(ganz.ereignisse.length);
    expect(personAuswerten(eins as Testprotokoll).einstieg[0]?.status).toBe('geloest');
  });
});
