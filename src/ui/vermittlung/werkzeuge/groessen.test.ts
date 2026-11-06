// Werkzeuge für Größen und Messen (Q-L2): einheitentafel@1, uhr@1, flaeche@1, quader@1.
import { describe, expect, it } from 'vitest';
import {
  einerSpalte,
  einheitentafelAus,
  einheitentafelBild,
  gelesenIn,
  lesung,
  lesungText,
} from './einheitentafel';
import {
  ausgelegt,
  flaecheAus,
  flaecheBild,
  inhalt,
  rand,
  reihenText,
  umfang,
  umgeschaltet,
} from './flaeche';
import { gefuellt, quaderAus, quaderBild, schichtenText } from './quader';
import {
  dauerText,
  etappen,
  gestellt,
  minutenAus,
  standText,
  uhrAus,
  uhrBild,
  uhrzeit,
} from './uhr';

describe('Einheitentafel (einheitentafel@1)', () => {
  it('trägt die Ziffern so ein, dass die Einer unter der Einheit stehen', () => {
    const z = einheitentafelAus({ wert: '3,45', einheit: 'm' });
    expect(z.spalten).toHaveLength(9); // km H Z E, m H Z E, dm, cm, mm
    const m = einerSpalte(z, 1);
    expect(z.ziffern[m]).toBe('3');
    expect(z.ziffern[m + 1]).toBe('4');
    expect(z.ziffern[m + 2]).toBe('5');
    expect(z.ziffern.filter((c) => c !== null)).toHaveLength(3);
  });

  it('liest in jeder Einheit und füllt fehlende Stellen mit 0', () => {
    const z = einheitentafelAus({ wert: '3,45', einheit: 'm', ziel: 'cm' });
    expect(lesungText(z)).toBe('3,45 m = 345 cm');
    expect(lesung(z)?.ergaenzt).toEqual([]);
    const mm = gelesenIn(z, 4);
    expect(lesungText(mm)).toBe('3,45 m = 3450 mm');
    expect(lesung(mm)?.ergaenzt).toHaveLength(1);
    expect(lesungText(gelesenIn(z, 0))).toBe('3,45 m = 0,00345 km');
    expect(lesungText(einheitentafelAus({ wert: 3, einheit: 'm', ziel: 'cm' }))).toBe(
      '3 m = 300 cm',
    );
    expect(lesungText(einheitentafelAus({ wert: 5000, einheit: 'm', ziel: 'km' }))).toBe(
      '5000 m = 5 km',
    );
    expect(lesungText(gelesenIn(z, undefined))).toBeUndefined();
    expect(lesungText(gelesenIn(z, 1))).toBe('3,45 m');
  });

  it('kennt Gewichte, Geld, Flächen und Volumen mit Liter', () => {
    expect(
      lesungText(einheitentafelAus({ groesse: 'masse', wert: '0,5', einheit: 'kg', ziel: 'g' })),
    ).toBe('0,5 kg = 500 g');
    expect(
      lesungText(einheitentafelAus({ groesse: 'geld', wert: '3,50', einheit: '€', ziel: 'ct' })),
    ).toBe('3,50 € = 350 ct');
    const f = einheitentafelAus({ groesse: 'flaeche', wert: 7, einheit: 'dm²', ziel: 'cm²' });
    expect(f.spalten).toHaveLength(8); // je zwei Spalten
    expect(lesungText(f)).toBe('7 dm² = 700 cm²');
    expect(
      lesungText(einheitentafelAus({ groesse: 'volumen', wert: 2500, einheit: 'ml', ziel: 'dm³' })),
    ).toBe('2500 ml = 2,5 dm³ = 2,5 l');
    expect(
      lesungText(einheitentafelAus({ groesse: 'volumen', wert: 5, einheit: 'm³', ziel: 'dm³' })),
    ).toBe('5 m³ = 5000 dm³ = 5000 l');
    const liter = einheitentafelAus({ groesse: 'volumen', wert: 1, einheit: 'l', ziel: 'cm³' });
    expect(lesungText(liter)).toBe('1 l = 1000 cm³ = 1000 ml');
    expect(lesungText(gelesenIn(liter, 1))).toBe('1 l = 1 dm³');
    expect(einheitentafelBild(liter).beschreibung.de).toContain('Eingetragen ist 1 l: 1 unter dm³');
  });

  it('verwirft Unsinn: unbekannte Größe, unpassende Werte, Lücken in den Einheiten', () => {
    expect(einheitentafelAus({ groesse: 'zeit' }).groesse).toBe('laenge');
    expect(einheitentafelAus({ wert: '3.45', einheit: 'm' }).wert).toBeUndefined();
    expect(einheitentafelAus({ wert: '3,4567', einheit: 'm' }).wert).toBeUndefined();
    expect(einheitentafelAus({ wert: '3', einheit: 'kg' }).wert).toBeUndefined();
    expect(einheitentafelAus({ einheiten: ['km', 'cm'] }).einheiten.map((e) => e.name)).toEqual([
      'km',
      'm',
      'dm',
      'cm',
      'mm',
    ]);
    expect(
      einheitentafelAus({ einheiten: ['m', 'dm', 'cm'] }).einheiten.map((e) => e.name),
    ).toEqual(['m', 'dm', 'cm']);
  });

  it('beschreibt Spalten, Eintrag, Komma und ergänzte Nullen', () => {
    const b = einheitentafelBild(einheitentafelAus({ wert: 3, einheit: 'm', ziel: 'cm' }));
    expect(b.svg).toMatch(/^<svg /);
    expect(b.svg).toContain('font-style="italic"');
    expect(b.beschreibung.de).toContain('Stellenwerttafel für Längen: km, m, dm, cm, mm.');
    expect(b.beschreibung.de).toContain('Eingetragen ist 3 m: 3 unter m (Einer).');
    expect(b.beschreibung.de).toContain('Das Komma steht hinter cm: 3 m = 300 cm.');
    expect(b.beschreibung.de).toContain('Ergänzte Nullen unter dm, cm.');
    expect(b.svg).toContain('3 m = 300 cm');
    const ohneZeile = einheitentafelBild(
      einheitentafelAus({ wert: 3, einheit: 'm', ziel: 'cm' }),
      false,
    );
    expect(ohneZeile.svg).not.toContain('3 m = 300 cm');
    expect(ohneZeile.beschreibung.de).toContain('3 m = 300 cm');
    const leer = einheitentafelBild(einheitentafelAus({ groesse: 'volumen' }));
    expect(leer.beschreibung.de).toContain('dm³ (l)');
    expect(leer.beschreibung.de).not.toContain('Eingetragen');
  });
});

describe('Uhr (uhr@1)', () => {
  it('liest Uhrzeiten und schreibt Dauern', () => {
    expect(minutenAus('9:40')).toBe(580);
    expect(minutenAus('13:05')).toBe(785);
    expect(minutenAus('24:00')).toBeUndefined();
    expect(minutenAus('9:7')).toBeUndefined();
    expect(uhrzeit(785)).toBe('13:05');
    expect(dauerText(20)).toBe('20 min');
    expect(dauerText(60)).toBe('1 h');
    expect(dauerText(95)).toBe('1 h 35 min');
    expect(uhrAus({ von: '10:00', bis: '9:00' }).bis).toBeUndefined();
    expect(uhrAus({ von: 'unsinn', schritt: 7 })).toEqual({ von: 580, etappen: false, schritt: 5 });
  });

  it('zerlegt Zeitspannen in Etappen über die volle Stunde', () => {
    const m = (s: string) => minutenAus(s) ?? 0;
    expect(etappen(m('9:40'), m('11:15'))).toEqual([
      { von: m('9:40'), bis: m('10:00') },
      { von: m('10:00'), bis: m('11:00') },
      { von: m('11:00'), bis: m('11:15') },
    ]);
    expect(etappen(m('8:50'), m('9:30'))).toHaveLength(2);
    expect(etappen(m('9:10'), m('9:30'))).toEqual([{ von: m('9:10'), bis: m('9:30') }]);
    expect(etappen(m('9:00'), m('11:00'))).toEqual([{ von: m('9:00'), bis: m('11:00') }]);
    expect(etappen(m('9:00'), m('9:00'))).toEqual([]);
  });

  it('stellt das Ende vor und zurück, nie vor den Anfang', () => {
    const z = uhrAus({ von: '9:40', bis: '9:40' });
    expect(standText(gestellt(z, 20))).toBe('Von 9:40 Uhr bis 10:00 Uhr: 20 min');
    expect(gestellt(z, -5).bis).toBe(z.von);
    expect(gestellt(uhrAus({ von: '23:50' }), 60).von).toBe(24 * 60 - 1);
    expect(standText(uhrAus({ von: '7:55' }))).toBe('7:55 Uhr');
  });

  it('beschreibt Uhren und Etappen', () => {
    const b = uhrBild(uhrAus({ von: '9:40', bis: '11:15', etappen: true }));
    expect(b.svg).toMatch(/^<svg /);
    expect(b.beschreibung.de).toContain('Anfang 9:40 Uhr, Ende 11:15 Uhr.');
    expect(b.beschreibung.de).toContain('Von 9:40 bis 10:00: 20 min');
    expect(b.beschreibung.de).toContain('Zusammen 95 min = 1 h 35 min.');
    expect(uhrBild(uhrAus({ von: '9:40', bis: '11:15' })).beschreibung.de).not.toContain(
      'Zusammen',
    );
    expect(uhrBild(uhrAus({ von: '7:55' })).beschreibung.de).toBe('Eine Uhr zeigt 7:55 Uhr.');
  });
});

const L_FIGUR = [
  [0, 0, 6, 2],
  [0, 2, 2, 3],
];

describe('Fläche (flaeche@1)', () => {
  it('liest Rechtecke und verwirft Überlappung, Lücken und zu Großes', () => {
    expect(flaecheAus({}).rechtecke).toEqual([[0, 0, 5, 3]]);
    const l = flaecheAus({ rechtecke: L_FIGUR, einheit: 'm' });
    expect(l.rechtecke).toHaveLength(2);
    expect(l.einheit).toBe('m');
    const ueber = [
      [0, 0, 4, 2],
      [2, 0, 4, 2],
    ];
    expect(flaecheAus({ rechtecke: ueber }).rechtecke).toEqual([[0, 0, 5, 3]]);
    const getrennt = [
      [0, 0, 2, 2],
      [3, 0, 2, 2],
    ];
    expect(flaecheAus({ rechtecke: getrennt }).rechtecke).toEqual([[0, 0, 5, 3]]);
    expect(flaecheAus({ rechtecke: [[0, 0, 20, 3]] }).rechtecke).toEqual([[0, 0, 5, 3]]);
    expect(flaecheAus({ einheit: 'zoll' }).einheit).toBe('cm');
  });

  it('findet den Rand von Ecke zu Ecke, Umfang und Inhalt', () => {
    const r = flaecheAus({ rechtecke: [[0, 0, 5, 3]] });
    expect(rand(r.rechtecke)).toHaveLength(4);
    expect(umfang(r)).toBe(16);
    expect(inhalt(r)).toBe(15);
    const l = flaecheAus({ rechtecke: L_FIGUR });
    const stuecke = rand(l.rechtecke);
    expect(stuecke).toHaveLength(6);
    expect(stuecke.map((s) => s.bis - s.von).sort((a, b) => a - b)).toEqual([2, 2, 3, 4, 5, 6]);
    expect(umfang(l)).toBe(22);
    expect(inhalt(l)).toBe(18);
  });

  it('legt Reihen aus und schaltet die Zerlegung um', () => {
    const z = flaecheAus({ rechtecke: [[0, 0, 5, 3]], reihen: 1, einheit: 'm' });
    expect(z.quadrate).toBe(true);
    expect(reihenText(z)).toBe('1 von 3 Reihen ausgelegt, in jeder Reihe 5 Quadrate.');
    expect(ausgelegt(ausgelegt(ausgelegt(z, 1), 1), 1).reihen).toBe(3);
    expect(ausgelegt(z, -5).reihen).toBe(0);
    expect(flaecheAus({ reihen: 9 }).reihen).toBe(3);
    const l = flaecheAus({ rechtecke: L_FIGUR, reihen: 0 });
    expect(reihenText(l)).toBe('0 von 5 Reihen ausgelegt.');
    expect(umgeschaltet(l).zerlegt).toBe(true);
  });

  it('beschreibt Rechteck, Figur, Zerlegung und fehlendes Stück', () => {
    const r = flaecheBild(flaecheAus({ rechtecke: [[0, 0, 5, 3]], einheit: 'm', quadrate: true }));
    expect(r.svg).toMatch(/^<svg /);
    expect(r.beschreibung.de).toBe(
      'Rechteck, 5 m lang, 3 m breit. Eingeteilt in Quadrate von 1 m mal 1 m.',
    );
    expect(r.svg).toContain('>5 m<');
    expect(r.svg).toContain('>3 m<');
    const l = flaecheBild(
      flaecheAus({ rechtecke: L_FIGUR, inhalte: true, fehlend: [[2, 2, 4, 3]] }),
    );
    expect(l.beschreibung.de).toContain(
      'Figur aus 2 Rechtecken: A 6 cm mal 2 cm = 12 cm², B 2 cm mal 3 cm = 6 cm².',
    );
    expect(l.beschreibung.de).toContain('Seiten am Rand:');
    expect(l.beschreibung.de).toContain('fehlende Stück zum großen Rechteck: 4 cm mal 3 cm.');
    expect(l.svg).toContain('A = 12 cm²');
    expect(l.svg).toContain('stroke-dasharray');
  });
});

describe('Quader (quader@1)', () => {
  it('liest Kanten, Einheit und Schichten; Unsinn wird zum Standard', () => {
    expect(quaderAus({})).toEqual({
      laenge: 4,
      breite: 3,
      hoehe: 2,
      einheit: 'cm',
      masse: true,
      wuerfel: false,
      netz: false,
    });
    const z = quaderAus({ laenge: 5, breite: 2, hoehe: 3, schichten: 9, einheit: 'dm' });
    expect(z.schichten).toBe(3);
    expect(z.wuerfel).toBe(true);
    expect(quaderAus({ laenge: 11, hoehe: 0 }).laenge).toBe(4);
  });

  it('legt Schichten hinein und nimmt sie heraus', () => {
    const z = quaderAus({ laenge: 4, breite: 3, hoehe: 2, schichten: 0 });
    expect(schichtenText(z)).toBe('0 von 2 Schichten gelegt, jede Schicht 4 mal 3 Würfel.');
    expect(gefuellt(gefuellt(gefuellt(z, 1), 1), 1).schichten).toBe(2);
    expect(gefuellt(z, -1).schichten).toBe(0);
    expect(gefuellt(quaderAus({}), 1).schichten).toBeUndefined();
  });

  it('beschreibt Würfel, Quader und Netz', () => {
    const w = quaderBild(quaderAus({ laenge: 10, breite: 10, hoehe: 10, wuerfel: true }));
    expect(w.svg).toMatch(/^<svg /);
    expect(w.beschreibung.de).toBe('Würfel mit der Kante 10 cm. Er ist aus Würfeln von 1 cm³.');
    const q = quaderBild(quaderAus({ laenge: 4, breite: 3, hoehe: 2, schichten: 1 }));
    expect(q.beschreibung.de).toContain('Quader, 4 cm lang, 3 cm breit, 2 cm hoch.');
    expect(q.beschreibung.de).toContain('1 von 2 Schichten gelegt');
    expect(q.svg).toContain('stroke-dasharray');
    const n = quaderBild(quaderAus({ laenge: 5, breite: 3, hoehe: 2, netz: true }));
    expect(n.beschreibung.de).toContain(
      'vorne und hinten je 5 cm mal 2 cm, oben und unten je 5 cm mal 3 cm, links und rechts je 3 cm mal 2 cm.',
    );
    expect(n.svg).toContain('>5 · 3<');
  });
});
