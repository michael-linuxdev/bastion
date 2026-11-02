import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { A4, pdfAusBildern, seitenhoehePx, teile } from './pdf';

const text = (b: Uint8Array) => Array.from(b, (c) => String.fromCharCode(c)).join('');
// Kleinstes Ersatz-JPEG: Inhalt egal, die Datei wird nur durchgereicht
const jpeg = (n: number) =>
  new Uint8Array([0xff, 0xd8, ...Array.from({ length: n }, () => 7), 0xff, 0xd9]);

describe('PDF aus Seitenbildern (T-23)', () => {
  it('Kopf, Seitenzahl, Bilder und Ende stimmen', () => {
    const pdf = text(
      pdfAusBildern([
        { jpeg: jpeg(10), breite: 680, hoehe: 900 },
        { jpeg: jpeg(20), breite: 680, hoehe: 400 },
      ]),
    );
    expect(pdf.startsWith('%PDF-1.4\n')).toBe(true);
    expect(pdf).toContain('/Type /Pages /Kids [3 0 R 6 0 R] /Count 2');
    expect(pdf.match(/\/Subtype \/Image/g)).toHaveLength(2);
    expect(pdf).toContain('/Width 680 /Height 900');
    expect(pdf).toContain('/Filter /DCTDecode /Length 14');
    expect(pdf.trimEnd().endsWith('%%EOF')).toBe(true);
  });

  it('die xref-Tabelle zeigt genau auf jedes Objekt', () => {
    const roh = pdfAusBildern([{ jpeg: jpeg(50), breite: 100, hoehe: 100 }]);
    const pdf = text(roh);
    const start = Number(/startxref\n(\d+)/.exec(pdf)?.[1]);
    expect(pdf.slice(start, start + 4)).toBe('xref');
    const zeilen = pdf.slice(start).split('\n');
    const anzahl = Number(zeilen[1]?.split(' ')[1]);
    expect(anzahl).toBe(6);
    for (let nr = 1; nr < anzahl; nr++) {
      const off = Number(zeilen[2 + nr]?.slice(0, 10));
      expect(pdf.slice(off, off + `${nr} 0 obj`.length)).toBe(`${nr} 0 obj`);
    }
  });

  it('das Bild füllt die Satzbreite und beginnt oben am Rand', () => {
    const pdf = text(pdfAusBildern([{ jpeg: jpeg(1), breite: 200, hoehe: 100 }]));
    const breite = A4.breite - 2 * A4.rand;
    const h = breite / 2;
    expect(pdf).toContain(
      `q ${Math.round(breite * 100) / 100} 0 0 ${Math.round(h * 100) / 100} ${A4.rand} ${Math.round((A4.hoehe - A4.rand - h) * 100) / 100} cm /Im0 Do Q`,
    );
  });

  it('ohne Seiten gibt es kein PDF', () => {
    expect(() => pdfAusBildern([])).toThrow();
  });

  it('Seitenhöhe in Pixeln passt zum Satzspiegel', () => {
    expect(seitenhoehePx(680)).toBe(
      Math.floor(((A4.hoehe - 2 * A4.rand) / (A4.breite - 2 * A4.rand)) * 680),
    );
  });
});

describe('Hohe Seiten zwischen Aufgaben teilen', () => {
  it('passt alles, bleibt es ein Stück', () => {
    expect(teile(500, 1000, [100, 200])).toEqual([[0, 500]]);
  });

  it('teilt an der letzten Grenze, die noch passt', () => {
    expect(teile(2500, 1000, [300, 900, 1200, 1800, 2400])).toEqual([
      [0, 900],
      [900, 1800],
      [1800, 2500],
    ]);
  });

  it('schneidet hart, wenn eine Aufgabe höher als eine Seite ist', () => {
    expect(teile(2500, 1000, [1500])).toEqual([
      [0, 1000],
      [1000, 1500],
      [1500, 2500],
    ]);
  });

  it('Stücke schließen lückenlos an und sind nie höher als eine Seite (Eigenschaft)', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 20_000 }),
        fc.integer({ min: 50, max: 3000 }),
        fc.array(fc.integer({ min: 0, max: 20_000 })),
        (gesamt, max, grenzen) => {
          const s = teile(gesamt, max, grenzen);
          expect(s[0]?.[0]).toBe(0);
          expect(s[s.length - 1]?.[1]).toBe(gesamt);
          for (let i = 0; i < s.length; i++) {
            const [a, b] = s[i] as [number, number];
            expect(b).toBeGreaterThan(a);
            expect(b - a).toBeLessThanOrEqual(max);
            if (i > 0) expect(a).toBe(s[i - 1]?.[1]);
          }
        },
      ),
    );
  });
});
