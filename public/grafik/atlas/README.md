# Atlas (GRAFIK-SPRITES.md)

Pfadschema Gebäude: `{thema}/e{1–4}/{rolle}_s{stufe}` – siehe `atlasId` in
`src/ui/bastion/grafik/atlas.ts`. Dateien liegen unter `gebaeude/`, `boden/`, `wesen/`
relativ zu diesem Ordner; `manifest.json` listet id, Datei, Anker, Pixelmaß.

**P0 Dorf (Epoche 1):** geliefert – Generator `tools/grafik/sprites-p0-dorf.py`.
Die App zeichnet Dorf-Gebäude, Wesen und die **Wiese** (Boden-Kacheln
`flaeche`/`rand` sowie Varianten) aus dem Atlas; fehlt ein Eintrag, bleibt der
Code-Fallback (`dorf.ts`, `wesen.ts`).

Weitere Themen/Epochen: Ordner angelegt; als Nächstes P1 Wetter-Himmel, dann P2 Garten.
