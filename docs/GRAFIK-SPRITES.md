# Übergabeprotokoll – Sprites für Bastion

Status: 31.10.2026 · P0–P3 eingehängt · Abend-Fenster-Layer · Für Bildagenten und Einbau in PixiJS  
Bezug: `GRAFIK.md` §4/§6, B-28, B-27 · Raster: `src/ui/bastion/grafik/iso.ts` (Raute 48×24, Verhältnis 2∶1)

Dieses Dokument ist die **verbindliche Bestellung**. Wer Sprites erzeugt, liefert genau diese Dateien, in dieser Benennung, ohne Kampffiguren und ohne erkennbare Übernahme aus Clash of Clans oder anderen Spielen.

---

## 1. Stilbriefing (kurz)

| | |
|---|---|
| Blick | Isometrisch, **2∶1** (Raute breiter als hoch), leicht von oben vorn |
| Politur | Knackige Silhouette, klare Kanten, lesbar in klein – Niveau „Base-Builder“ |
| Wärme | Freundlich, nicht kindlich; Stardew-Wärme als Untergrenze |
| Verboten | Militär, Truppen, Waffen, Blut, Clash-/Dorfkrieg-Kampffiguren, Logos, Marken |
| Erlaubt | Friedliche Wesen, Rauch, Wasser, Pflanzen, Sterne, Korallen |
| Abend | Separate Variante oder Overlay: wärmere Fenster, kühlerer Himmel (Fenster können als Layer geliefert werden) |
| Jahreszeit | Optional später; **Pflicht v1:** neutrale „Sommer/Alltag“-Fassung. Winter-Schneehauben und Herbstlaub als **Auflagen-Layer** (siehe §5) |

Farben der App (Richtung A): Himmel hell `#D6ECF3`, Akzent Petrol `#1F7A72`, warmes Dach `#C4603A` / `#E07A4F`, Text `#2B2620`. Themen dürfen davon abweichen, solange Kontrast auf dem Boden stimmt.

---

## 2. Technische Vorgaben

| Vorgabe | Wert |
|---|---|
| Format | PNG mit Alphakanal (oder WebP verlustfrei mit Alpha) |
| Farbraum | sRGB |
| Skalierung | Für Retina: **2×** der Logikgröße zeichnen (App nutzt doppelte Auflösung) |
| Raute Boden | Logik **48×24** px → Sprite-Bodenanker darauf ausrichten |
| Max. Datei je Sprite | anstreben ≤ 80 KB; Atlas-Blätter ≤ 2048×2048 |
| Anker | Unterkante Mitte der Bodenraute = Fußpunkt des Gebäudes |
| Kein Text | im Bild (Beschriftung macht die App) |
| Kein Zufall | gleiche Eingabe → gleiches Asset; Varianten nur als nummerierte Dateien |

### Fußabdrücke (Felder → ungefähre Bildbreite)

| Größe Felder | Logik-Breite Boden | 2× Zeichenfläche (empfohlen) |
|---|---|---|
| 1×1 | 48×24 | Canvas ca. 96×120 (Höhe inkl. Gebäude) |
| 2×2 | 96×48 | ca. 192×200 |
| 3×3 | 144×72 | ca. 288×280 |

Höhe ist rollenabhängig (Kern/Turm höher). Freistellen: alles außerhalb der Silhouette transparent.

---

## 3. Dateinamen

```
gebaeude/<thema>/e<epoche>/<rolle>_s<stufe>.png
gebaeude/<thema>/e<epoche>/<rolle>_s<stufe>_fenster.png   # optional Abend-Layer
boden/<thema>/e<epoche>/flaeche.png
boden/<thema>/e<epoche>/rand.png
boden/<thema>/e<epoche>/flaeche_b.png      # optional: Schachbrett-Variante
boden/<thema>/e<epoche>/flaeche_hell.png   # optional: hellerer Tupfen
himmel/wolke_<n>.png
himmel/sonne.png
himmel/mond.png
wetter/regen_tropfen.png
wetter/schnee_flocke.png
wetter/nebel.png
auflage/schnee_dach_1x1.png
auflage/schnee_dach_2x2.png
auflage/schnee_dach_3x3.png
auflage/laub_<n>.png
belagerung/himmel.png                  # Spannungs-Dunst (Bewährungsprobe)
belagerung/rauch_<n>.png               # Rauch-Overlay 1…3, keine Truppen
wesen/<thema>/<art>_idle_<frame>.png
wesen/<thema>/<art>_walk_<frame>.png
wesen/<thema>/<art>_react_<frame>.png
hinterhof/<thema>/platz_g.png
hinterhof/<thema>/platz_m.png
hinterhof/<thema>/platz_offen.png
hinterhof/<thema>/wappen_voll.png
hinterhof/<thema>/denkmal_voll.png
minibat/<thema>/standbild.png          # 480×240 Logik → 960×480 @2x
```

**Thema:** `bastion` | `garten` | `weltraum` | `dorf` | `unterwasser`  
**Epoche:** `1` Außenposten-Ära … `4` Zitadellen-Ära (`BASEBAU.md` §5.5)  
**Rolle:** `kern` | `werkstatt` | `wissen` | `turm` | `eingang` | `einfassung` | `ursprung` | `zeichen` | `flaeche` | `denkmal`  
**Stufe:** `1`… je Katalog (Kern Epoche 1: 1–3)

Zierde: Akzentfarbe wählbar – Sprite in **neutralem Grau/Beige** liefern plus optional `*_maske.png` (weiß = einfärbbar).

---

## 4. Was jede Rolle zeigen soll (Epoche 1, alle Themen)

Wörter je Thema stehen in der Textdatei (`thema.<thema>.…`). Das Bild muss zur Rolle passen, nicht zum Burg-Wort „Bergfried“ in jedem Thema.

| Rolle | Bastion | Garten | Weltraum | Dorf | Unterwasser |
|---|---|---|---|---|---|
| kern | Bergfried | Baumhaus | Kommandomodul | Gemeindehaus + Fahne | Hauptkuppel |
| werkstatt | Zimmerei | Geräteschuppen | Montagehalle | Schreinerei (Säge) | Werft |
| wissen | Studierstube | Gewächshaus | Sternwarte | Bücherei (Buch) | Perlenkammer |
| turm | Späherturm | Aussichtsbaum | Antennenmast | Windmühle (Flügel erkennbar) | Leuchtturm |
| eingang | Tor | Gartentor | Luftschleuse | Dorfbrücke | Tauchschleuse |
| einfassung | Palisade | Hecke | Schutzwand | Zaun (3 Pfähle) | Korallenriff |
| ursprung | Feuerstelle | Gartenbank | Landeplatz | Dorfbrunnen | Anker |
| zeichen | Banner | Wimpel | Flagge | Wappen | Boje |
| flaeche | Gartenbeet | Blumenbeet | Kristallfeld | Obstwiese | Seegraswiese |
| denkmal | Statue | Gartenzwerg | Satellit | Denkmal | Muschelskulptur |

Höhere Epochen: dieselbe Rolle, **reiferer** Baustil (Stein statt Holz, Metall statt Platte, …) – siehe `BASEBAU.md` §5.5 Namen.

---

## 5. Auflagen und Wetter (gemeinsam für alle Themen)

| Asset | Beschreibung |
|---|---|
| Schnee-Dach 1×1 / 2×2 / 3×3 | Weiche Kappe, transparenter Rand, auf Dächer legbar |
| Laub 1…3 | Einzelne Blätter für Partikel |
| Regentropfen | Einfacher Strich/ Tropfen, Alpha |
| Schneeflocke | Einfach, lesbar in 8–12 px Logik |
| Nebel | Weiches Rechteck/Ellipse mit Alpha-Verlauf |
| Wolke 1…2 | Weiche Ellipsen-Gruppe, hell und eine dunklere |
| Belagerungs-Himmel | Weicher Spannungs-Dunst (kein Militär), nur bei Bewährungsprobe |
| Rauch 1…3 | Weiche Rauchwolken als Overlay; keine Truppen, keine Waffen |

---

## 6. Wesen – Frames

Pro Art (siehe `GRAFIK.md` §4.4):

| Zyklus | Frames (Pflicht) | Hinweis |
|---|---|---|
| idle | 2–4 | ruhiges Atmen / Pickén |
| walk | 4 | Seitlich oder iso-konsistent; Spiegeln erlaubt in der App |
| react | 2–3 | Aufschauen / Weghüpfen nach Tippen |

Größe: Wesen ca. **24–36 px** Logikbreite (48–72 @2x), damit fünf Stück die Szene nicht zufüllen. Silhouette klar, kein Gesichtstext in Lesbarkeit nötig.

---

## 7. Hinterhof und MiniBastion

- **platz_g / platz_m / platz_offen:** kleine Objekte (Thema-Metapher), offen = leere Mulde/Umrandung, nie rot.
- **wappen_voll / denkmal_voll:** Belohnung wenn Lernfeld voll (B-25).
- **minibat/…/standbild.png:** eine ruhige Gesamtansicht 2∶1 für die Startkarte; Jahreszeit/Wetter später per Overlay in der App – Standbild darf „klarer Tag“ sein.

---

## 8. Lieferchargen (Priorität)

Damit Technik und Bild parallel laufen:

| Charge | Inhalt | Blockiert |
|---|---|---|
| **P0** | `dorf` Epoche 1: alle 10 Rollen Stufe 1 + kern/wissen/turm höhere Stufen die im Katalog vorkommen; Boden; 3 Wesen komplett · **geliefert** (`public/grafik/atlas/`, Generator `tools/grafik/sprites-p0-dorf.py`) | G5 |
| **P1** | Wetter-Auflagen + Wolken/Sonne/Mond + Schnee-Dach · **geliefert** (`himmel/`, `wetter/`, `auflage/`, Generator `tools/grafik/sprites-p1-wetter.py`) | G2/G3 |
| **P2** | `garten` Epoche 1 komplett + Wesen · **geliefert** (`gebaeude/garten/`, `boden/garten/`, `wesen/garten/`, Generator `tools/grafik/sprites-p2-garten.py`) | G5 |
| **P3** | `bastion`, `unterwasser`, `weltraum` Epoche 1 · **geliefert** (Generator `tools/grafik/sprites-p3-themen.py`) | G6 |
| **P4** | Hinterhof-Objekte alle Themen + MiniBastion-Standbilder | G7 |
| **P5** | Epoche 2–4 Gebäude je Thema (nach Katalog G9) · *umgesetzt* | G10 |
| **P6** | Belagerungs-Himmel / Rauch-Overlays · *umgesetzt* (`belagerung/`, Generator `tools/grafik/sprites-p6-belagerung.py`) | G11 |

Pro Charge: Ordnerstruktur wie §3, dazu eine `manifest.json` (Liste der Dateien, Pixelgröße, Anker x/y relativ).

Beispiel `manifest.json`-Eintrag:

```json
{
  "id": "dorf/e1/kern_s1",
  "datei": "gebaeude/dorf/e1/kern_s1.png",
  "felder": [3, 3],
  "anker": { "x": 0.5, "y": 1.0 },
  "pixel": { "w": 288, "h": 260 }
}
```

---

## 9. Abnahme (Checkliste je Sprite)

- [ ] Transparenter Hintergrund, keine weiße Box  
- [ ] Fußpunkt auf Bodenraute 2∶1 ausgerichtet  
- [ ] In 50 % Größe noch erkennbar (Handy)  
- [ ] Kein Text, kein Logo, keine Waffe  
- [ ] Abend-Fenster-Layer (falls geliefert) deckungsgleich  
- [ ] Dateiname und Manifest-Eintrag stimmen  
- [ ] Lizenz: **eigenes Werk für Bastion** (AGPL-Repo) oder ausdrücklich freigegebene Vorlage – keine 1∶1-Kopien aus Spielen  

---

## 10. Einbau-Stand

- G0–G11 Code: Ticker, Schalter, Jahreszeit, Open-Meteo, Atlas-Loader, Code-Fallback  
- **P0 (erledigt):** Manifest gefüllt, Dorf-Gebäude und Wesen nutzen Atlas-Texturen; `dorf.ts` bleibt Fallback (Bäume; Wiese nur wenn Boden-Kacheln fehlen)  
- **Boden/Wiese Dorf (erledigt):** Atlas-Kacheln `flaeche`/`rand` (+ optional `flaeche_b`/`flaeche_hell`); Runtime legt die Wiese als Sprites, Code-`dorfWiese` nur noch Fallback; Abend per Tint  
- **P1 Wetter-Himmel (erledigt):** `himmel/sonne|mond|wolke_*`, `wetter/*`, `auflage/schnee_dach_*` und `laub_*`; Bühne nutzt Atlas für Gestirn, Wolken, Partikel, Nebel und Winter-Dachauflage (Code-Fallback bleibt)  
- **P2 (erledigt):** Garten-Gebäude, Rasen, Wesen im Atlas  
- **Abend-Fenster / Politur (erledigt):** `*_fenster.png` für Dorf (Kern/Werkstatt/Wissen/Turm) und Garten (Kern/Werkstatt/Wissen); Runtime legt sie am Abend deckungsgleich über das Tages-Sprite; Tages-Politur (Rahmen, Sims, Silhouette)  
- **P3 (erledigt):** Bastion / Unterwasser / Weltraum Epoche 1 (Gebäude, Boden, Wesen, Abend-Fenster wo passend); Runtime mit Code-Fallback  
- Als Nächstes: **P4** Hinterhof-Objekte + MiniBastion-Standbilder  


---

## 11. Sound (parallel, nicht Sprite)

CC0/CC-BY-Quellen (Beispiele zur Suche, vor Einbau Lizenz prüfen): Kenney Interface/Audio, FreePD, Pixabay (nur CC0). Dateien nach `public/sound/` bzw. `src/ui/bastion/sound/` mit Manifest. Standard aus (`GRAFIK.md` §4.6).
