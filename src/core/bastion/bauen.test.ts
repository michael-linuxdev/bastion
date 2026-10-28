import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { kontoAus, type BuchungEreignis } from '../ledger/buchung';
import type { Ressource } from '../ledger/regeln';
import {
  abbrechen,
  bastionAus,
  beginnen,
  beginnHindernisse,
  einlagern,
  aufstellen,
  platzHindernisse,
  fertigmeldungen,
  freierPlatz,
  plaetze,
  versetzen,
  type BauEreignis,
  type Bastion,
  type Ergebnis,
} from './bauen';
import { BAUPLATZ, KATALOG, START, type GebaeudeTyp, type Position } from './katalog';

/** Kleine Welt: Ereignisse sammeln, Bastion und Konto daraus ableiten. */
class Welt {
  bau: BauEreignis[] = [];
  buchungen: BuchungEreignis[] = [];
  zeit = 1_000;
  nr = 0;

  get bastion(): Bastion {
    return bastionAus(this.bau, this.buchungen);
  }
  get konto() {
    return kontoAus('P', this.buchungen);
  }
  angaben() {
    this.zeit += 10;
    return {
      profil: 'P',
      geraet: 'g',
      id: `B${String((this.nr += 1)).padStart(5, '0')}`,
      jetzt: this.zeit,
      tag: '2026-11-01',
    };
  }
  /** Ertrag aus dem Lernen (wie eine Sitzungsbuchung) */
  gutschrift(ressource: Ressource, menge: number, ts = (this.zeit += 10)) {
    this.buchungen.push({
      id: `P.${ressource}.S${(this.nr += 1)}`,
      art: 'buchung',
      v: 1,
      profil: 'P',
      ts,
      tag: '2026-11-01',
      geraet: 'g',
      ressource,
      menge,
      grund: 'sitzung',
      bezug: `S${this.nr}`,
      aufschluesselung: {},
      regel: 1,
    });
  }
  reich() {
    this.gutschrift('fleiss', 5000);
    this.gutschrift('behalten', 2000);
    this.gutschrift('koennen', 50);
  }
  uebernimm(e: Ergebnis) {
    if (!e.ok) throw new Error(`Hindernisse: ${e.hindernisse.join(', ')}`);
    this.bau.push(e.bau);
    this.buchungen.push(...e.buchungen);
    return e.bau;
  }
  neu(typ: GebaeudeTyp, pos: Position) {
    return this.uebernimm(beginnen(this.bastion, this.konto, typ, { pos }, this.angaben()));
  }
  hoeher(id: string) {
    const b = this.bastion.bauwerke.find((x) => x.id === id);
    if (!b) throw new Error('kein Bauwerk');
    return this.uebernimm(
      beginnen(this.bastion, this.konto, b.typ, { ausbau: id }, this.angaben()),
    );
  }
  /** Bergfried direkt auf Stufe 2 bringen */
  kern2() {
    const v = this.hoeher('start.kern');
    for (let i = 0; i < 10; i++) this.gutschrift('schritt', 1);
    expect(this.bastion.bauwerke.find((x) => x.id === 'start.kern')?.stufe).toBe(2);
    return v;
  }
}

describe('Start', () => {
  it('Startzustand, leerer Vorrat, ein Bauplatz', () => {
    const b = new Welt().bastion;
    expect(b.bauwerke).toEqual(START);
    expect(b).toMatchObject({ vorhaben: [], vorrat: 0 });
    expect(plaetze(b)).toBe(1);
  });
});

describe('Bauen mit Bauschritten (B-7)', () => {
  it('ohne Vorhaben kommen Bauschritte in den Vorrat; ein Banner nimmt einen und steht sofort', () => {
    const w = new Welt();
    w.gutschrift('fleiss', 12);
    w.gutschrift('schritt', 1);
    expect(w.bastion.vorrat).toBe(1);
    const v = w.neu('zeichen', { x: 0, y: 0 });
    const b = w.bastion;
    expect(b.vorrat).toBe(0);
    expect(b.vorhaben).toEqual([]);
    expect(b.bauwerke.find((x) => x.id === v.gebaeude)).toMatchObject({ typ: 'zeichen', stufe: 1 });
    expect(w.konto.stand.fleiss).toBe(2);
    expect(w.konto.erworben.fleiss).toBe(12);
  });

  it('ein Vorhaben nimmt den Vorrat und wächst mit jedem neuen Bauschritt', () => {
    const w = new Welt();
    w.reich();
    w.gutschrift('schritt', 2);
    w.neu('turm', { x: 0, y: 0 });
    expect(w.bastion.vorhaben[0]).toMatchObject({ fortschritt: 2, bedarf: 6 });
    for (let i = 0; i < 3; i++) w.gutschrift('schritt', 1);
    expect(w.bastion.vorhaben[0]?.fortschritt).toBe(5);
    w.gutschrift('schritt', 1);
    expect(w.bastion.vorhaben).toEqual([]);
    expect(w.bastion.fertig).toMatchObject([{ typ: 'turm', stufe: 1, gemeldet: false }]);
  });

  it('mit Zimmerei zwei Vorhaben; ein Bauschritt wirkt auf beide', () => {
    const w = new Welt();
    w.reich();
    w.kern2();
    w.neu('werkstatt', { x: 0, y: 0 });
    for (let i = 0; i < 6; i++) w.gutschrift('schritt', 1);
    expect(plaetze(w.bastion)).toBe(2);
    w.neu('turm', { x: 0, y: 3 });
    w.neu('eingang', { x: 6, y: 10 });
    w.gutschrift('schritt', 1);
    expect(w.bastion.vorhaben.map((v) => v.fortschritt)).toEqual([1, 1]);
  });

  it('ein später eingetroffener Bauschritt mit früherer Zeit zählt richtig (nachgetragene Sitzung)', () => {
    const w = new Welt();
    w.reich();
    w.neu('turm', { x: 0, y: 0 });
    // Die Sitzung lag vor dem Baubeginn und wird erst jetzt gebucht
    w.gutschrift('schritt', 1, 1_005);
    expect(w.bastion.vorhaben[0]).toMatchObject({ fortschritt: 1, erstattbar: 1 });
    expect(w.bastion.vorrat).toBe(0);
  });
});

describe('Abbrechen (B-8)', () => {
  it('gibt Stein, Erz, Baupläne und die Bauschritte vollständig zurück', () => {
    const w = new Welt();
    w.reich();
    w.gutschrift('schritt', 2);
    const vorher = w.konto.stand;
    const v = w.neu('turm', { x: 0, y: 0 });
    w.gutschrift('schritt', 1);
    expect(w.konto.stand).toMatchObject({
      fleiss: vorher.fleiss - 100,
      behalten: vorher.behalten - 30,
    });
    w.uebernimm(abbrechen(w.bastion, v.id, w.angaben()));
    expect(w.konto.stand).toMatchObject({
      fleiss: vorher.fleiss,
      behalten: vorher.behalten,
      koennen: vorher.koennen,
    });
    expect(w.bastion).toMatchObject({ vorhaben: [], vorrat: 3 });
    // Der Platz ist wieder frei
    expect(beginnHindernisse(w.bastion, w.konto, 'turm', { pos: { x: 0, y: 0 } })).toEqual([]);
  });

  it('ein Bauschritt, den zwei Vorhaben teilten, entsteht beim Abbruch nicht doppelt', () => {
    const w = new Welt();
    w.reich();
    w.kern2();
    w.neu('werkstatt', { x: 0, y: 0 });
    for (let i = 0; i < 6; i++) w.gutschrift('schritt', 1);
    const a = w.neu('turm', { x: 0, y: 3 });
    w.neu('eingang', { x: 6, y: 10 });
    w.gutschrift('schritt', 2);
    w.uebernimm(abbrechen(w.bastion, a.id, w.angaben()));
    expect(w.bastion.vorrat).toBe(0);
    expect(w.bastion.vorhaben[0]?.fortschritt).toBe(2);
  });
});

describe('Hindernisse beim Beginnen', () => {
  it('Ressourcen, Bauplatz, Platz, Ausbau, Höchstzahl', () => {
    const w = new Welt();
    expect(beginnHindernisse(w.bastion, w.konto, 'turm', { pos: { x: 0, y: 0 } })).toEqual([
      'zu-wenig-fleiss',
      'zu-wenig-behalten',
      'zu-wenig-koennen',
    ]);
    w.reich();
    expect(beginnHindernisse(w.bastion, w.konto, 'zeichen', { pos: { x: 11, y: 12 } })).toEqual([
      'ausserhalb',
    ]);
    // Der Bergfried steht auf 5–7 × 4–6
    expect(beginnHindernisse(w.bastion, w.konto, 'zeichen', { pos: { x: 6, y: 5 } })).toEqual([
      'belegt',
    ]);
    w.neu('turm', { x: 0, y: 0 });
    expect(beginnHindernisse(w.bastion, w.konto, 'zeichen', { pos: { x: 0, y: 0 } })).toEqual([
      'kein-freier-bauplatz',
      'belegt',
    ]);
    w.gutschrift('schritt', 6);
    w.neu('turm', { x: 1, y: 0 });
    expect(beginnHindernisse(w.bastion, w.konto, 'turm', { pos: { x: 2, y: 0 } })).toEqual([
      'hoechstzahl',
      'kein-freier-bauplatz',
    ]);
    expect(beginnHindernisse(w.bastion, w.konto, 'kern', { ausbau: 'start.kern' })).toEqual([
      'kein-freier-bauplatz',
    ]);
  });

  it('dasselbe Gebäude wird nicht zweimal gleichzeitig ausgebaut', () => {
    const w = new Welt();
    w.reich();
    w.kern2();
    w.neu('werkstatt', { x: 0, y: 0 });
    w.gutschrift('schritt', 6);
    w.hoeher('start.kern');
    expect(beginnHindernisse(w.bastion, w.konto, 'kern', { ausbau: 'start.kern' })).toContain(
      'wird-schon-gebaut',
    );
  });
});

describe('Versetzen (§4.2)', () => {
  it('kostenlos, nur auf freie Felder im Bauplatz', () => {
    const w = new Welt();
    const vorher = w.konto;
    w.uebernimm(versetzen(w.bastion, 'start.ursprung', { x: 0, y: 0 }, w.angaben()));
    expect(w.bastion.bauwerke.find((x) => x.id === 'start.ursprung')?.pos).toEqual({
      x: 0,
      y: 0,
    });
    expect(w.konto).toEqual(vorher);
    expect(versetzen(w.bastion, 'start.ursprung', { x: 5, y: 4 }, w.angaben())).toEqual({
      ok: false,
      hindernisse: ['belegt'],
    });
    // Der Bergfried darf sich selbst überlappen (ein Feld weiter)
    expect(versetzen(w.bastion, 'start.kern', { x: 4, y: 4 }, w.angaben()).ok).toBe(true);
  });
});

describe('Einlagern (B-21)', () => {
  it('Zierde kostenlos ins Lager und wieder aufstellen; der Platz wird frei', () => {
    const w = new Welt();
    w.gutschrift('fleiss', 20);
    w.gutschrift('schritt', 1);
    const v = w.neu('zeichen', { x: 0, y: 0 });
    const vorher = w.konto;
    w.uebernimm(einlagern(w.bastion, v.gebaeude, w.angaben()));
    expect(w.bastion.bauwerke.some((x) => x.id === v.gebaeude)).toBe(false);
    expect(w.bastion.lager).toMatchObject([{ id: v.gebaeude, typ: 'zeichen' }]);
    expect(platzHindernisse(w.bastion, 'zeichen', { x: 0, y: 0 })).toEqual([]);
    w.uebernimm(aufstellen(w.bastion, v.gebaeude, { x: 3, y: 0 }, w.angaben()));
    expect(w.bastion.lager).toEqual([]);
    expect(w.bastion.bauwerke.find((x) => x.id === v.gebaeude)?.pos).toEqual({ x: 3, y: 0 });
    expect(w.konto).toEqual(vorher);
  });

  it('nur Zierde; aufstellen nur auf freie Felder', () => {
    const w = new Welt();
    expect(einlagern(w.bastion, 'start.kern', w.angaben()).ok).toBe(false);
    w.uebernimm(einlagern(w.bastion, 'start.ursprung', w.angaben()));
    expect(aufstellen(w.bastion, 'start.ursprung', { x: 5, y: 4 }, w.angaben())).toEqual({
      ok: false,
      hindernisse: ['belegt'],
    });
    // Eingelagertes zählt für die Höchstzahl mit (Ursprung: höchstens einer)
    expect(beginnHindernisse(w.bastion, w.konto, 'ursprung', { pos: { x: 0, y: 0 } })).toContain(
      'nicht-baubar',
    );
  });
});

describe('freier Platz', () => {
  it('erstes passendes Feld, nie auf einem Gebäude; voller Platz: keiner', () => {
    const w = new Welt();
    expect(freierPlatz(w.bastion, 'zeichen')).toEqual({ x: 0, y: 0 });
    w.reich();
    w.gutschrift('schritt', 1);
    w.neu('zeichen', { x: 0, y: 0 });
    expect(freierPlatz(w.bastion, 'zeichen')).toEqual({ x: 1, y: 0 });
    expect(freierPlatz(w.bastion, 'flaeche')).toEqual({ x: 1, y: 0 });
    const voll: Bastion = {
      ...w.bastion,
      bauwerke: Array.from({ length: 144 }, (_, i) => ({
        id: `b${i}`,
        typ: 'zeichen' as const,
        stufe: 1,
        pos: { x: i % 12, y: Math.floor(i / 12) },
      })),
    };
    expect(freierPlatz(voll, 'zeichen')).toBeUndefined();
  });
});

describe('Fertigmeldungen (DATENMODELL §4.4)', () => {
  it('je fertigem Vorhaben genau ein Ereignis, mit der Zeit des Fertigwerdens', () => {
    const w = new Welt();
    w.gutschrift('fleiss', 20);
    w.gutschrift('schritt', 1);
    const v = w.neu('zeichen', { x: 0, y: 0 });
    let n = 0;
    const meldungen = fertigmeldungen(
      w.bastion,
      { profil: 'P', geraet: 'g' },
      () => `F${(n += 1)}`,
      () => '2026-11-01',
    );
    expect(meldungen).toMatchObject([
      { aktion: 'fertigstellen', vorhaben: v.id, ts: v.ts, typ: 'zeichen' },
    ]);
    w.bau.push(...meldungen);
    expect(w.bastion.fertig[0]?.gemeldet).toBe(true);
    expect(
      fertigmeldungen(
        w.bastion,
        { profil: 'P', geraet: 'g' },
        () => 'X',
        () => '',
      ),
    ).toEqual([]);
  });
});

describe('Eigenschaften', () => {
  const TYPEN: GebaeudeTyp[] = [
    'zeichen',
    'flaeche',
    'denkmal',
    'turm',
    'eingang',
    'einfassung',
    'wissen',
  ];
  const schritt = fc.oneof(
    fc.record({ art: fc.constant('lernen' as const), menge: fc.integer({ min: 1, max: 3 }) }),
    fc.record({
      art: fc.constant('bauen' as const),
      typ: fc.constantFrom(...TYPEN),
      x: fc.integer({ min: 0, max: BAUPLATZ.breite - 1 }),
      y: fc.integer({ min: 0, max: BAUPLATZ.tiefe - 1 }),
    }),
    fc.record({ art: fc.constant('abbrechen' as const) }),
    fc.record({ art: fc.constant('kern' as const) }),
  );

  it('nie negative Ressourcen, nie Überlappung, Abbruch erstattet genau, Reihenfolge der Eingaben egal', () => {
    fc.assert(
      fc.property(fc.array(schritt, { maxLength: 40 }), (plan) => {
        const w = new Welt();
        w.gutschrift('fleiss', 800);
        w.gutschrift('behalten', 200);
        w.gutschrift('koennen', 6);
        for (const s of plan) {
          if (s.art === 'lernen') w.gutschrift('schritt', s.menge);
          else if (s.art === 'bauen') {
            const e = beginnen(w.bastion, w.konto, s.typ, { pos: { x: s.x, y: s.y } }, w.angaben());
            if (e.ok) w.uebernimm(e);
          } else if (s.art === 'kern') {
            const e = beginnen(w.bastion, w.konto, 'kern', { ausbau: 'start.kern' }, w.angaben());
            if (e.ok) w.uebernimm(e);
          } else {
            const v = w.bastion.vorhaben[0];
            if (v) {
              const vorher = { ...w.konto.stand };
              w.uebernimm(abbrechen(w.bastion, v.id, w.angaben()));
              const k = KATALOG[v.typ].stufen[v.stufe - 1]?.kosten;
              expect(w.konto.stand.fleiss).toBe(vorher.fleiss + (k?.fleiss ?? 0));
            }
          }
          const b = w.bastion;
          for (const r of ['fleiss', 'behalten', 'koennen'] as const)
            expect(w.konto.stand[r]).toBeGreaterThanOrEqual(0);
          expect(b.vorrat).toBeGreaterThanOrEqual(0);
          expect(b.vorhaben.length).toBeLessThanOrEqual(plaetze(b));
          for (const v of b.vorhaben) expect(v.fortschritt).toBeLessThan(v.bedarf);
          const belegt = new Set<string>();
          for (const x of [...b.bauwerke, ...b.vorhaben.filter((v) => v.stufe === 1)]) {
            const [bw, bt] = KATALOG[x.typ].groesse;
            for (let i = x.pos.x; i < x.pos.x + bw; i++)
              for (let j = x.pos.y; j < x.pos.y + bt; j++) {
                expect(belegt.has(`${i},${j}`)).toBe(false);
                belegt.add(`${i},${j}`);
              }
          }
          // Bauschritte entstehen nie aus dem Nichts
          const gutgeschrieben = w.konto.erworben.schritt;
          expect(b.vorrat + b.vorhaben.reduce((s, v) => s + v.erstattbar, 0)).toBeLessThanOrEqual(
            gutgeschrieben,
          );
        }
        expect(bastionAus([...w.bau].reverse(), [...w.buchungen].reverse())).toEqual(w.bastion);
      }),
    );
  });
});
