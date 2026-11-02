/**
 * Kleinste PDF-Datei aus Seitenbildern (JPEG), ohne Bibliothek (ARCHITEKTUR T-23).
 *
 * Jede Seite ist A4 hoch; das Bild steht oben links im Rand und wird auf die Breite des
 * Satzspiegels skaliert. JPEG-Daten gehen unverändert hinein (Filter DCTDecode), darum genügt
 * ein Gerüst aus Katalog, Seitenbaum, je Seite Seite, Inhalt und Bild, dazu die xref-Tabelle.
 * Rein: Bytes rein, Bytes raus – keine Browser-API.
 */

export interface PdfSeite {
  /** JPEG-Datei */
  readonly jpeg: Uint8Array;
  /** Bildgröße in Pixeln */
  readonly breite: number;
  readonly hoehe: number;
}

/** A4 in Punkt (1/72 Zoll) und der Rand des Aufgabenblatts (15 mm wie @page im Druck-CSS) */
export const A4 = { breite: 595.28, hoehe: 841.89, rand: 42.52 } as const;

/** Wie viele Pixel Höhe passen bei dieser Bildbreite auf eine Seite (für das Aufteilen)? */
export function seitenhoehePx(bildbreite: number): number {
  const breite = A4.breite - 2 * A4.rand;
  const hoehe = A4.hoehe - 2 * A4.rand;
  return Math.floor((hoehe / breite) * bildbreite);
}

const ascii = (s: string): Uint8Array => {
  const b = new Uint8Array(s.length);
  for (let i = 0; i < s.length; i++) {
    const c = s.charCodeAt(i);
    if (c > 127) throw new Error('PDF-Gerüst nur ASCII');
    b[i] = c;
  }
  return b;
};

const zahl = (n: number) => (Math.round(n * 100) / 100).toString();

export function pdfAusBildern(seiten: readonly PdfSeite[]): Uint8Array<ArrayBuffer> {
  if (seiten.length === 0) throw new Error('PDF ohne Seiten');
  const teile: Uint8Array[] = [];
  const offsets: number[] = [];
  let laenge = 0;
  const schreibe = (t: Uint8Array | string) => {
    const b = typeof t === 'string' ? ascii(t) : t;
    teile.push(b);
    laenge += b.length;
  };
  const objekt = (nr: number, kopf: string, strom?: Uint8Array) => {
    offsets[nr] = laenge;
    schreibe(`${nr} 0 obj\n${kopf}`);
    if (strom) {
      schreibe('\nstream\n');
      schreibe(strom);
      schreibe('\nendstream');
    }
    schreibe('\nendobj\n');
  };

  // Binärkennung nach dem Kopf, damit Programme die Datei als binär behandeln
  schreibe('%PDF-1.4\n%');
  schreibe(new Uint8Array([0xe2, 0xe3, 0xcf, 0xd3, 0x0a]));

  const seitenNr = seiten.map((_, i) => 3 + i * 3);
  objekt(1, '<< /Type /Catalog /Pages 2 0 R >>');
  objekt(
    2,
    `<< /Type /Pages /Kids [${seitenNr.map((n) => `${n} 0 R`).join(' ')}] /Count ${seiten.length} >>`,
  );
  const satzbreite = A4.breite - 2 * A4.rand;
  seiten.forEach((s, i) => {
    const [seite, inhalt, bild] = [3 + i * 3, 4 + i * 3, 5 + i * 3];
    const h = (s.hoehe / s.breite) * satzbreite;
    const y = A4.hoehe - A4.rand - h;
    const zeichnen = ascii(
      `q ${zahl(satzbreite)} 0 0 ${zahl(h)} ${zahl(A4.rand)} ${zahl(y)} cm /Im0 Do Q`,
    );
    objekt(
      seite,
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${A4.breite} ${A4.hoehe}] ` +
        `/Resources << /XObject << /Im0 ${bild} 0 R >> >> /Contents ${inhalt} 0 R >>`,
    );
    objekt(inhalt, `<< /Length ${zeichnen.length} >>`, zeichnen);
    objekt(
      bild,
      `<< /Type /XObject /Subtype /Image /Width ${s.breite} /Height ${s.hoehe} ` +
        `/ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${s.jpeg.length} >>`,
      s.jpeg,
    );
  });

  const anzahl = 3 + seiten.length * 3;
  const xref = laenge;
  schreibe(`xref\n0 ${anzahl}\n0000000000 65535 f \n`);
  for (let nr = 1; nr < anzahl; nr++)
    schreibe(`${String(offsets[nr] ?? 0).padStart(10, '0')} 00000 n \n`);
  schreibe(`trailer\n<< /Size ${anzahl} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`);

  const pdf = new Uint8Array(laenge);
  let pos = 0;
  for (const t of teile) {
    pdf.set(t, pos);
    pos += t.length;
  }
  return pdf;
}

/**
 * Wo eine hohe Seite geteilt wird: an Stellen zwischen Aufgaben (`grenzen`, in Pixeln von oben),
 * so dass kein Stück höher als `max` ist. Gibt es keine passende Grenze, wird hart geschnitten.
 * Ergebnis: Anfang und Ende jedes Stücks.
 */
export function teile(gesamt: number, max: number, grenzen: readonly number[]): [number, number][] {
  const stuecke: [number, number][] = [];
  const sortiert = [...grenzen].filter((g) => g > 0 && g < gesamt).sort((a, b) => a - b);
  let start = 0;
  while (gesamt - start > max) {
    const passend = sortiert.filter((g) => g > start && g - start <= max);
    const ende = passend.length > 0 ? (passend[passend.length - 1] as number) : start + max;
    stuecke.push([start, ende]);
    start = ende;
  }
  stuecke.push([start, gesamt]);
  return stuecke;
}
