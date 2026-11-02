// Aufgabenblatt als PDF aus der App (ARCHITEKTUR T-23). Grund: Die auf dem iPhone installierte
// App kann nicht drucken (T-21). Das Blatt wird als Bild gezeichnet (html2canvas-pro, erst hier
// nachgeladen), in A4-Stücke zwischen den Aufgaben geteilt und mit pdfAusBildern (Kern) zu
// einer PDF-Datei. Auf Handy und Tablet öffnet „Teilen“ (dort: Drucken, In Dateien sichern),
// sonst wird die Datei heruntergeladen. Alles auf dem Gerät, kein Netz.
import { pdfAusBildern, seitenhoehePx, teile, type PdfSeite } from '../../core/learning/pdf';

/** 180 mm Satzbreite bei 96 dpi, wie die Druckseite */
const BREITE_PX = 680;
/** Schärfe: 2,5 × 96 dpi ≈ 240 dpi */
const SKALA = 2.5;

async function jpegAus(c: HTMLCanvasElement): Promise<Uint8Array> {
  const blob = await new Promise<Blob | null>((ok) => c.toBlob(ok, 'image/jpeg', 0.88));
  if (!blob) throw new Error('Bild ließ sich nicht erzeugen');
  return new Uint8Array(await blob.arrayBuffer());
}

/** Seitenbilder aus einem Druckblatt ([data-druckblatt]), jede `.seite` beginnt neu. */
export async function seitenAus(druckblatt: HTMLElement): Promise<PdfSeite[]> {
  const { default: html2canvas } = await import('html2canvas-pro');
  const behaelter = document.createElement('div');
  behaelter.className = 'pdf-modus';
  behaelter.setAttribute('aria-hidden', 'true');
  Object.assign(behaelter.style, {
    position: 'fixed',
    insetBlockStart: '0',
    insetInlineStart: '-10000px',
    inlineSize: `${BREITE_PX}px`,
    background: '#fff',
    color: '#111',
    fontSize: '14.5px',
  });
  const kopie = druckblatt.cloneNode(true) as HTMLElement;
  kopie.removeAttribute('data-druckblatt');
  behaelter.append(kopie);
  document.body.append(behaelter);
  try {
    await document.fonts.ready;
    const seiten: PdfSeite[] = [];
    for (const seite of Array.from(kopie.querySelectorAll<HTMLElement>('.seite'))) {
      const bild = await html2canvas(seite, {
        scale: SKALA,
        backgroundColor: '#ffffff',
        logging: false,
      });
      const oben = seite.getBoundingClientRect().top;
      const grenzen = Array.from(seite.querySelectorAll('li.aufgabe, li.loesung, footer')).map(
        (el) =>
          Math.round((el.getBoundingClientRect().top - oben) * (bild.height / seite.offsetHeight)),
      );
      for (const [von, bis] of teile(bild.height, seitenhoehePx(bild.width), grenzen)) {
        const stueck = document.createElement('canvas');
        stueck.width = bild.width;
        stueck.height = bis - von;
        const g = stueck.getContext('2d');
        if (!g) throw new Error('Kein Zeichenbereich');
        g.fillStyle = '#fff';
        g.fillRect(0, 0, stueck.width, stueck.height);
        g.drawImage(bild, 0, von, bild.width, bis - von, 0, 0, bild.width, bis - von);
        seiten.push({ jpeg: await jpegAus(stueck), breite: stueck.width, hoehe: stueck.height });
      }
    }
    return seiten;
  } finally {
    behaelter.remove();
  }
}

export type PdfErgebnis = 'geteilt' | 'geladen' | 'abgebrochen';

/** Erzeugt das PDF und gibt es weiter: Teilen auf Touch-Geräten, sonst Herunterladen. */
export async function blattAlsPdf(
  druckblatt: HTMLElement,
  dateiname: string,
): Promise<PdfErgebnis> {
  const pdf = pdfAusBildern(await seitenAus(druckblatt));
  const datei = new File([pdf], dateiname, { type: 'application/pdf' });
  const teilen =
    navigator.maxTouchPoints > 0 &&
    typeof navigator.canShare === 'function' &&
    navigator.canShare({ files: [datei] });
  if (teilen) {
    try {
      await navigator.share({ files: [datei], title: dateiname });
      return 'geteilt';
    } catch (e) {
      if (e instanceof DOMException && e.name === 'AbortError') return 'abgebrochen';
      // sonst unten herunterladen
    }
  }
  const url = URL.createObjectURL(datei);
  const a = document.createElement('a');
  a.href = url;
  a.download = dateiname;
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 60_000);
  return 'geladen';
}
