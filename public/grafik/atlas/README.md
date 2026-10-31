# Atlas (GRAFIK-SPRITES.md)

Pfadschema Gebäude: `{thema}/e{1–4}/{rolle}_s{stufe}` – siehe `atlasId` in
`src/ui/bastion/grafik/atlas.ts`. Dateien liegen unter `gebaeude/`, `boden/`,
`wesen/`, `himmel/`, `wetter/`, `auflage/` relativ zu diesem Ordner;
`manifest.json` listet id, Datei, Anker, Pixelmaß.

**P0 Dorf (Epoche 1):** geliefert – Generator `tools/grafik/sprites-p0-dorf.py`.
Die App zeichnet Dorf-Gebäude, Wesen und die **Wiese** (Boden-Kacheln
`flaeche`/`rand` sowie Varianten) aus dem Atlas; fehlt ein Eintrag, bleibt der
Code-Fallback (`dorf.ts`, `wesen.ts`).

**P1 Wetter-Himmel:** geliefert – Generator `tools/grafik/sprites-p1-wetter.py`
(merged in Manifest). Sonne/Mond/Wolken, Regen/Schnee/Nebel, Schnee-Dach und
Laub; die Bühne nutzt sie für alle Themen, sonst Code-Fallback.

**P2 Garten (Epoche 1):** geliefert – Generator `tools/grafik/sprites-p2-garten.py`.
Gebäude, Rasen-Kacheln und Wesen (Biene, Schnecke, Schmetterling); die App
zeichnet Garten aus dem Atlas, sonst Code-Fallback (`garten.ts`).

**P3 Bastion / Unterwasser / Weltraum (Epoche 1):** geliefert – Generator
`tools/grafik/sprites-p3-themen.py`. Gebäude, Boden und Wesen je Thema;
Abend-Fenster wo Öffnungen; die App zeichnet Insel/Unterwasser/Weltraum aus
dem Atlas, sonst Code-Fallback.

**P4 Hinterhof + MiniBastion:** geliefert – Generator
`tools/grafik/sprites-p4-hinterhof.py`. Je Thema `platz_g`/`platz_m`/
`platz_offen`, `wappen_voll`, `denkmal_voll` und `minibat/…/standbild.png`;
Hinterhof-Szene und Startkarten-MiniBastion nutzen sie, sonst Code/SVG-Fallback.

**P5 Epoche 2–4:** geliefert – Generator `tools/grafik/sprites-p5-epochen.py`.
Gebäude aller Themen für e2–e4 (Katalog G9, reifere Optik), Abend-Fenster und
Boden-Kacheln; Runtime fällt bei fehlender Epoche auf niedrigere zurück.

**P6 Belagerungs-Himmel / Rauch:** geliefert – Generator
`tools/grafik/sprites-p6-belagerung.py`. `belagerung/himmel.png` und
`rauch_1…3.png`; die Bühne nutzt sie bei Bewährungsprobe, sonst Code-Fallback.

**Service Worker:** Atlas-Dateien stehen **nicht** im Vorab-Speicher (zu viele PNGs,
A3/R7). Nach dem Öffnen der Bastion speichert Workbox sie per CacheFirst
(`vite.config.ts`); fehlt etwas, bleibt der Code-Fallback.
