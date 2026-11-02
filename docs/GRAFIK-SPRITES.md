# Übergabeprotokoll – Sprites für Bastion

Status: 01.11.2026 · P0–P6 eingehängt · **§12 Stil-Regel (Paket G, G2) als Entwurf zur Abnahme; sie gilt ab G3 vor §1–§9** · Für Bildagenten und Einbau in PixiJS  
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
| **P4** | Hinterhof-Objekte alle Themen + MiniBastion-Standbilder · **geliefert** (Generator `tools/grafik/sprites-p4-hinterhof.py`) | G7 |
| **P5** | Epoche 2–4 Gebäude je Thema (nach Katalog G9) · **geliefert** (Generator `tools/grafik/sprites-p5-epochen.py`) | G10 |
| **P6** | Belagerungs-Himmel / Rauch-Overlays · **geliefert** (`belagerung/`, Generator `tools/grafik/sprites-p6-belagerung.py`) | G11 |

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
- **P4 (erledigt):** Hinterhof-Objekte und MiniBastion-Standbilder; Runtime mit Code/SVG-Fallback  
- **P5 (erledigt):** Epoche 2–4 Gebäude je Thema; Atlas-Lookup mit Epoche-Fallback  
- **P6 (erledigt):** Belagerungs-Himmel und Rauch-Overlays; Bühne bei Bewährungsprobe  
- **CC0-Sound (erledigt):** Tipps + Ambient-Wind unter `public/sound/` (§11)  
- **Feinschliff P3–P6 (31.10.2026):** Herbstlaub und Schnee-Dach nur über Land (nicht Unterwasser/Weltraum); Hinterhof-Plätze mit Umbruch/Dichte-Skala und nur im Hinterhof-Blick; Bastion-Kern Firstkappe statt schwebender Zinnen  
- Optional/offen: Jahreszeit-Auflagen feiner nutzen; Ambient Wasser/Regen; Lern-UI §9; Messung iPhone 13; Testerinnen mit U4b  

---

## 11. Sound (parallel, nicht Sprite)

Standard aus (`GRAFIK.md` §4.6). **Stand:** Tip-Geräusche aus Kenney Interface Sounds (CC0) und eigenes Ambient-Wind (CC0) unter `public/sound/` mit `manifest.json`; Loader in `src/ui/bastion/sound/` bevorzugt Dateien, sonst Web-Audio-Fallback. Weitere Ambient-Varianten (Wasser, Regen): vor Einbau Lizenz prüfen (CC0 o. Ä.; FreePD, Pixabay nur CC0).

---

## 12. Stil-Regel für die ganze Bastion (Paket G, G2) – Entwurf zur Abnahme

> **Stand 01.11.2026: Entwurf, wartet auf die Abnahme des PV.** Erst danach erzeugt G3 neue Bilder.
> Grundlage ist die Wahl des PV vom 01.11.2026 abends (`docs/session/FOKUS.md`, „Entscheidungen“): **ein eigener Generator für alles in der Bastion**, also Gebäude, Boden, Umgebung, Wesen und Himmel, für jedes Thema im selben Stil, „aus einem Guss“. Für Bilder gibt es keinen Bausatz von außen; die CC0-Sounds (§11) bleiben.
> Vorbild ist das Probestück (a), `tools/grafik/probe/bergfried-a-generator.py` (`GRAFIK.md` §11.4). Wo §1 bis §9 etwas anderes sagen, gilt dieser Abschnitt für alle Bilder, die ab G3 entstehen. Die alten Generatoren (P0–P6) bleiben, bis ihre Bilder ersetzt sind.

### 12.1 Was gilt wofür

| Bereich | Gilt | Vor U4b erneuert |
|---|---|---|
| Gebäude (alle Rollen, §4) | 12.2 bis 12.7 ganz | alle fünf Themen, Epoche 1, alle Rollen (je 14 Bilder; `bastion` 12.8, die anderen 12.10, Klärung PV 02.11.2026) – **erledigt 02.11.2026** |
| Boden (Fläche, Rand, Varianten) | Raster, Licht, Palette | Thema `bastion` |
| Umgebung (Bäume, Büsche, Steine, Wasserrand) | Raster, Licht, Kontur, Palette, Maßstab | Thema `bastion` |
| Wesen und Bewohner | Licht, Kontur, Palette, Maßstab | Wesen des Themas `bastion` (Fuchs, Möwe, Wache) |
| Himmel, Wetter, Auflagen | Palette, weiche Kontur | gemeinsam für alle Themen (§5) |
| Epochen 2–4 | dieselbe Regel, eigene Materialleiter (12.5, 12.10), eine Stufe ein Bild (12.11) | **vorgezogen vor U4b** (PV, 02.11.2026): alle fünf Themen, je 15 Bilder – **erledigt 02.11.2026** |

Ein Generator heißt: ein gemeinsames Python-Modul mit Raster, Licht, Kontur, Palette und den Grundkörpern (Quader, Pyramide, Zylinder, Kegel, Zinnen, Fenster, Fahne, Banner) aus dem Probestück. Jedes Bild wird daraus zusammengesetzt. So sehen alle Bilder gleich gezeichnet aus, auch wenn sie zu verschiedenen Zeiten entstehen. Gleiche Eingabe ergibt das gleiche Bild (§2, „Kein Zufall“). Wo Abwechslung nötig ist (Grashalme, Steine im Mauerwerk), kommt sie aus einer festen Zahl im Code, nicht aus dem Zufall zur Laufzeit.

### 12.2 Raster und Maßstab

- **Raster 2∶1** wie `iso.ts`: Raute 48 × 24 Pixel je Feld, gezeichnet in doppelter Größe (96 × 48). Der Generator rechnet in Feld-Koordinaten (x, y) und Höhe z in Pixeln (doppelte Größe): Bildpunkt = (Mitte + (x − y) · 48, Boden + (x + y) · 24 − z).
- **Fußpunkt:** Unterkante Mitte der Bodenraute (§2). Der Fußabdruck (`felder`) ändert sich mit der Stufe nicht. Ein Gebäude darf mit der Stufe **nach oben** wachsen, aber nicht über seine Felder hinaus zur Seite; Dachüberstand, Fahne und Banner höchstens 0,2 Feld darüber.
- **Bildbreite:** wie §2 (1×1 etwa 96–104, 2×2 etwa 200, 3×3 etwa 296 Pixel). Die Höhe ist frei. Der obere Rand wird auf 4 Pixel über dem höchsten Punkt beschnitten.
- **Maßstab (alles in doppelter Größe):**

| Maß | Wert | Bezug |
|---|---|---|
| ein Geschoss | etwa 48 Pixel | Probestück Stufe 2: Fachwerk 90 Pixel mit zwei Fensterreihen |
| Tür | 34–40 Pixel hoch, 0,3 Feld breit | immer an der linken Vorderseite, Bogen bei Stein |
| Fenster | 20–26 Pixel hoch, 0,16–0,2 Feld breit | Bogen bei Stein, gerade bei Holz und Fachwerk |
| Bewohner (Mensch) | 30–34 Pixel hoch | knapp kleiner als die Tür |
| Tiere (Fuchs, Möwe) | 16–24 Pixel hoch | etwa halbe Türhöhe |
| Baum | 1,5–2,5 Geschosse | kleiner als der Bergfried ab Stufe 2 |

- **Rangfolge der Höhe:** Der Bergfried ist ab Stufe 2 das höchste Gebäude der Bastion. Der Späherturm darf höher sein als alle anderen, aber nicht als der Bergfried derselben Stufe oder höher. Zierde (Banner, Beet, Statue, Feuerstelle) bleibt unter einem Geschoss, außer Banner und Statue mit Sockel (bis 1,5 Geschosse).

### 12.3 Licht und Schatten

- **Licht von rechts oben.** Jede Fläche bekommt ihren Ton aus der Grundfarbe:

| Fläche | Ton (Grundfarbe ±) |
|---|---|
| Oberseite, Dachfläche rechts | +14 bis +16 |
| rechte Wand | −8 bis −12 |
| linke Wand, Dachfläche links | −22 bis −40 (Holz dunkler als Stein) |
| runde Körper | Verlauf in Streifen von links dunkel (−40) nach rechts hell (+6) |

- **Schlagschatten:** nur eine weiche Raute unter dem Gebäude (Schwarz, Deckkraft 40 von 255), etwas größer als der Fußabdruck. Keine langen, gerichteten Schatten; sonst passen Bilder bei Abend und Jahreszeit nicht zusammen.
- **Abend und Wetter** färbt die App (Tönung der Bühne). Im Bild wird nichts umgefärbt. Leuchtende Fenster kommen als eigene Ebene `*_fenster.png`, deckungsgleich, Farbe `#FFC85A` (§3, §9).

### 12.4 Kontur

- Farbe `#2B2620` (Text der App), Deckkraft je Bereich:

| Bereich | Deckkraft (von 255) | Linie |
|---|---|---|
| Gebäude, Umgebung, Wesen | 120 | 1 Pixel |
| Boden-Kacheln | 90 | nur am Rand der Raute, sonst keine |
| Himmel, Wetter, Auflagen | 70 | weich, nur wo nötig |

- Gezogen werden nur die **Unterkanten**, die **vordere senkrechte Kante** und die **Ränder von Dächern, Fenstern und Fahnen**. Keine durchgehende schwarze Umrandung: Die Form wird durch Licht und Schatten lesbar, die Kontur hilft nur bei kleiner Darstellung.
- Fugen (Steine, Bretter, Ziegelreihen) in einer dunkleren Fassung der Fläche, nie in Schwarz.

### 12.5 Palette und Materialien

Eine gemeinsame Palette für das Thema `bastion` (Werte aus dem Probestück). Andere Themen bekommen später eine eigene Materialleiter mit denselben Licht- und Konturregeln.

| Name | Farbe | Verwendung |
|---|---|---|
| Stein | `#B0A492` | Mauern ab Stufe 2 und 3 |
| Steinfuge | `#786C5E` | Fugen, Zinnen-Innenseiten |
| Sockel | `#968A7A` | niedriger Steinsockel unter Holz |
| Holz | `#966840` | Wände Stufe 1, Anbauten, Palisade |
| Holzfuge | `#68462A` | Bretterfugen |
| Putz | `#ECE2CC` | Gefache im Fachwerk |
| Balken | `#5C3E28` | Fachwerk, Tür- und Fensterrahmen |
| Schindel | `#70523A` | Dächer Stufe 1 (Holz) |
| Ziegel | `#C4603A` | Dächer ab Stufe 2, Turmhelme |
| Petrol | `#1F7A72` | Banner (Akzent der App) |
| Petrol hell | `#3DBEA5` | Fahnen |
| Fenster am Tag | `#3A2A16` | Öffnungen |
| Tür | `#462E1C` | Türen, Tore |
| Fenster am Abend | `#FFC85A` | nur Ebene `*_fenster.png` |
| Stange, Emblem | `#F4EFE4`, `#F4DE8C` | Fahnenstange, Zeichen auf dem Banner |
| Rasen | `#67A24A`, hell `#86B85C`, dunkel `#5B9342` | Boden (wie P3) |
| Inselrand | `#1C3124` | Rand-Kachel (wie P3) |
| Himmel | `#D6ECF3`, Sonne `#FFC85A`, Wolke `#FFFFFF`/`#E0E8EE` | Himmel und Wetter (wie P1) |

**Materialleiter (Thema `bastion`): Holz → Fachwerk → Stein.** Das Material zeigt den Reifegrad. Hat eine Rolle in Epoche 1 nur eine oder zwei Stufen, beginnt sie bei Holz und springt dann gleich zu Fachwerk auf Steinsockel. Die Epochen 2–4 beginnen eine Stufe weiter oben (Epoche 2 bei Fachwerk und Stein, ab Epoche 3 Stein mit Schiefer- und Metalldach); das wird nach U4b mit dem Katalog G9 festgelegt.

Neue Farben nur, wenn keine der Liste passt, und dann in diese Tabelle eintragen. Die Kontrast-Regel für Bilder (3 ∶ 1, `GRAFIK.md` §5) gilt für die Gesamtform, nicht für jede Fuge.

### 12.6 Stufen-Sprache (gilt für jede Rolle und jedes Thema)

1. **Jede Stufe ändert den Umriss**, nicht nur Details. Mindestens eines davon: ein Geschoss mehr, ein Anbau oder Seitenturm, eine andere Dachform, ein Turmaufsatz oder eine Kuppel.
2. **Messbar** (Entscheidung PV, 01.11.2026): Von Stufe zu Stufe unterscheidet sich der Umriss um **mindestens 25 %** der Fläche und die sichtbare Höhe um **mindestens 15 %**. Gemessen wie in `pnpm grafik:stufen` (`GRAFIK.md` §11.2), festgeschrieben in `tools/grafik/atlas-stufen.test.ts` (G3).
3. **Material** folgt der Leiter aus 12.5.
4. **Belohnende Details** wachsen mit: Stufe 1 schlicht (eine Tür, ein Fenster), dann Banner, Fahne, mehr Fenster, Zinnen, Turmhelm. Keine Glitzer- oder Kisten-Optik, keine Funken, kein Gold (R1).
5. **Die Stufe ist ohne Ziffer erkennbar.** Die kleinen Punkte unter dem Gebäude entfallen. Die Ziffer steht nur noch ruhig in der Auswahl und im Bau-Blatt (G4).
6. **Petrol heißt „gewachsen“:** Banner und Fahne in Petrol tauchen erst ab Stufe 2 auf. Stufe 1 trägt keine Akzentfarbe.
7. **Abend-Fenster** für jede Stufe mit Fenstern (`*_fenster.png`); bei der Feuerstelle leuchtet die Glut.
8. Höhere Stufen dürfen Antippen und Überdeckung auf dem Bauplatz nicht stören: Angetippt wird weiter der Fußabdruck; was nach oben wächst, darf dahinterliegende Gebäude teilweise verdecken, aber nie ganz (G3 prüft das mit einem Bildschirmfoto).

### 12.7 Umgebung, Wesen und Himmel

- **Umgebung** (Bäume, Büsche, Steine) aus denselben Grundkörpern: Laubkrone als Kugel aus drei Tönen (links dunkel, rechts hell), Stamm in Holz, Steine in Sockel und Steinfuge. Keine Konturen innen, nur am Rand.
- **Wesen und Bewohner** im Maßstab 12.2 und mit Licht von rechts oben; Kontur 120. Bewegung nur in den Frames aus §6. „Bewegung reduzieren“: nur das erste Idle-Bild.
- **Boden:** Raute ohne Kontur innen, Grashalme oder Steine als feste Muster aus einer festen Zahl. Kein Gitter im Bild; Raster-Linien zeichnet, wenn nötig, die App.
- **Himmel und Wetter:** weiche Formen ohne harte Kanten, Kontur 70. Keine Sonnenstrahlen-Effekte, kein Glitzern.

### 12.8 Tabelle Rolle × Stufe, Thema `bastion`, Epoche 1

Stufen nach dem Katalog (`src/core/bastion/katalog.ts`, Epoche 1). Höhen in Pixeln der doppelten Größe, gemessen wie `pnpm grafik:stufen` (sichtbare Höhe mit Fußraute). Die Werte für den Bergfried stammen aus dem Probestück; die anderen sind Zielwerte für G3.

| Rolle (Name) | Felder | Stufe 1 | Stufe 2 | Stufe 3 | Höhe s1 / s2 / s3 |
|---|---|---|---|---|---|
| kern (Bergfried) | 3×3 | **Holzturm** auf niedrigem Steinsockel, Schindel-Pyramidendach, Tür, ein Fenster | **Steingeschoss + vorkragendes Fachwerk**, Ziegeldach, Holzanbau links vorn, Petrol-Banner, Fahne | **hoher Steinturm**, Kragsims mit Zinnenkranz, Turmaufsatz mit Ziegelhelm, runder Seitenturm mit Kegeldach, Mauerstück mit Zinnen, Fenster in drei Reihen | 223 / 379 / 491 (+70 % / +30 %) |
| wissen (Studierstube) | 2×2 | **Holzhaus**, ein Geschoss, Satteldach aus Schindeln, Tür, ein breites Lesefenster | **Fachwerk über Steinsockel**, zwei Geschosse, Ziegeldach mit Dachgaube und **Dachreiter** (kleines Türmchen mit Spitze), rundes Fenster im Giebel, Banner | – | etwa 150 / 230 |
| turm (Späherturm) | 1×1 | **offener Holzturm**: vier Pfosten mit Kreuzstreben, Plattform mit Geländer, kleines Schindeldach, Leiter | **geschlossene Turmstube aus Fachwerk** auf Steinfuß, vorkragend, Ziegel-Spitzhelm, Fahne | – | etwa 180 / 260 (nie höher als der Bergfried s2) |
| werkstatt (Zimmerei) | 2×2 | **offener Holzschuppen** mit Pultdach aus Schindeln, Werkbank, Bretterstapel, Sägebock | – | – | etwa 150 |
| eingang (Tor) | 1×1 | **Holztor** zwischen zwei Pfosten mit Querbalken und kleinem Schindeldach | – (ab Epoche 2) | – | etwa 120 |
| einfassung (Palisade) | 1×1 | **angespitzte Holzpfähle** mit Querriegel; links und rechts anschlussfähig, damit Reihen ohne Lücke wirken | – | – | etwa 90 |
| ursprung (Feuerstelle) | 1×1 | **Steinkreis** mit Scheiten, Glut (Abend-Ebene), Sitzstamm | – | – | etwa 60 |
| zeichen (Banner) | 1×1 | **Holzmast** mit Petrol-Banner und Emblem (Ausnahme von 12.6 Nr. 6: das Banner ist die Rolle selbst) | – | – | etwa 130 |
| flaeche (Gartenbeet) | 2×2 | **Holzrahmen** mit drei Reihen Pflanzen, Weg aus Trittsteinen | – | – | etwa 70 |
| denkmal (Statue) | 1×1 | **Steinsockel** mit Figur in neutralem Grau, dazu `*_maske.png` für die Akzentfarbe (§3) | – | – | etwa 130 |

Zusammen 14 Gebäudebilder plus Abend-Ebenen, dazu Boden (4 Kacheln), Umgebung und die drei Wesen des Themas. Reihenfolge in G3 wie `FOKUS.md`: Bergfried, Studierstube, Späherturm, Werkstatt, Tor, dann Einfassung und Zierde, dann Boden, Umgebung, Wesen. Himmel und Wetter (P1) werden nur angepasst, wenn sie neben den neuen Gebäuden fremd wirken.

### 12.9 Abnahme dieser Regel (PV)

**Abgenommen vom PV am 02.11.2026** anhand der Bilder aus G3 und G4 (alle vier Punkte „ja“).

- [x] Palette, Licht, Kontur und Maßstab so übernehmen
- [x] Materialleiter Holz → Fachwerk → Stein für das Thema `bastion`
- [x] Tabelle 12.8 (was sich je Rolle und Stufe ändert)
- [x] Danach erzeugt G3 die Bilder in Chargen, jede mit Vergleichsbild vorher und nachher (erledigt, `GRAFIK.md` §11.8; dazu Gerüst und Vorher/Nachher aus G4, §11.9)

### 12.10 Andere Themen, Epoche 1 (Klärung PV 02.11.2026: alle fünf Themen vor U4b)

Gleiche Regel wie 12.2 bis 12.7, gleicher Generator: Die gemeinsamen Teile (Raster, Licht, Kontur, Palette, Grundkörper, Wesen-Zeichnung, Schreiben in den Atlas) stehen in `tools/grafik/g3_stil.py`; jedes Thema hat ein eigenes Skript `tools/grafik/sprites-g3-<thema>.py` mit seinen Formen und seiner Materialleiter. Petrol bleibt der Akzent für „gewachsen“ (12.6 Nr. 6) in jedem Thema.

**Dorf** (`sprites-g3-dorf.py`, 02.11.2026). Materialleiter: **Lehm mit Strohdach → Fachwerk mit Ziegeldach → Bruchstein mit Schieferdach.** Neue Farben: Lehm `#CEB284`, Lehmfleck `#B89A6C`, Stroh `#D0AC58`, Strohfuge `#A07C34`, Schiefer `#606876`, Wasser `#62A0C4`, Zaunlatte `#CCB896`.

| Rolle (Name) | Felder | Stufe 1 | Stufe 2 | Stufe 3 | Höhe s1 / s2 / s3 |
|---|---|---|---|---|---|
| kern (Gemeindehaus) | 3×3 | **Lehmhaus** mit dickem Strohdach, Tür, zwei Fenster | **Fachwerkhaus**, zwei Geschosse auf Steinsockel, Ziegeldach mit Gaube, Schornstein, Lehm-Anbau mit Strohdach, Banner | **Rathaus aus Bruchstein**, Gesims, Portal mit Stufe, Schieferdach, **Uhrturm** mit Uhr, Glockenstube und Schieferhelm, Fachwerk-Seitenflügel, Fahne | 200 / 313 / 492 |
| wissen (Bücherei) | 2×2 | **Lehmhäuschen** mit Strohdach, breites Lesefenster | **Fachwerk** über Steinsockel, zwei Geschosse, Ziegeldach, Schornstein, Erker, Schild mit Buch, Banner | – | 172 / 289 |
| turm (Windmühle) | 1×1 | **Bockwindmühle**: Holzkasten auf einem Bock, Gitterflügel, Treppe | **Turmmühle**: Steinsockel, heller Turm, hölzerner Rundgang, Haube, Flügel mit Segeltuch, Fahne | – | 186 / 250 |
| werkstatt (Schreinerei) | 2×2 | offener Schuppen mit Lehm-Rückwand und Stroh-Pultdach, Werkbank mit Hobel, Stammstapel, Hackklotz, Laterne | – | – | |
| eingang (Dorfbrücke) | 1×1 | Holzsteg mit Geländer über einen kleinen Bach | – | – | |
| einfassung (Zaun) | 1×1 | helle Latten mit spitzem Kopf an zwei Riegeln, anschlussfähig | – | – | |
| ursprung (Dorfbrunnen) | 1×1 | runder Steinkranz mit Wasser, Welle mit Seil und Eimer, Kurbel, Schindeldach | – | – | |
| zeichen (Wappen) | 1×1 | Pfosten mit Wappenschild in Petrol und gelbem Zeichen | – | – | |
| flaeche (Obstwiese) | 2×2 | Wiese mit drei Obstbäumen (Äpfel, Birnen) und Blumen | – | – | |
| denkmal (Denkmal) | 1×1 | gestufter Bruchsteinsockel, Figur in Grau: Bäuerin mit Garbe | – | – | |

Umgebung: Linde (`baum_a`) und Apfelbaum (`baum_b`) an den festen Baumplätzen der Dorf-Szene, vorne nur Apfelbäume. Wesen: Huhn, Katze, Spatz (Frames wie §6). Der Boden bleibt wie P0.

**Garten** (`sprites-g3-garten.py`, 02.11.2026). Materialleiter: **rohes Holz und Rinde → gehobelte Bretter mit Schindeln → bemaltes Holz mit Glas und Moosdach.** Neue Farben: Rinde `#6E543C`, Rundholz `#A07850`, Brett `#B28A5C`, bemalt (Salbei) `#7EA88C`, Rahmen `#F4EFE4`, Glas `#BEE2E8`, Moos `#70964A`, Seil `#C4AA78`.

| Rolle (Name) | Felder | Stufe 1 | Stufe 2 | Stufe 3 | Höhe s1 / s2 / s3 |
|---|---|---|---|---|---|
| kern (Baumhaus) | 3×3 | **Baum mit Plattform** aus Rundholz, Geländer, Strickleiter, Laterne | **Bretterhütte** mit Schindeldach auf größerer Plattform, Leiter, Blumenkasten, Wimpel | **zweite, bemalte Hütte** hoch in der Krone mit Glas und Moosdach, Türmchen mit Spitzdach, Rutsche, Nebenbaum mit Brücke, Banner, Fahne | 284 / 344 / 446 |
| wissen (Gewächshaus) | 2×2 | **Frühbeet**: niedriger Holzrahmen mit schrägem Glasdeckel | **Glashaus** auf Steinsockel, Glas-Satteldach, Glaslaterne, Pflanzen hinter Glas, Banner | – | 127 / 311 |
| turm (Aussichtsbaum) | 1×1 | **schlanker Baum** mit Leiter und kleinem Ausguck | **hoher Baum**, Ausguck mit Schindel-Spitzdach, Geländer, Fernrohr, Laterne, Wimpel | – | 211 / 307 |
| werkstatt (Geräteschuppen) | 2×2 | Bretterschuppen mit Satteldach, offene Tür, Rechen und Spaten, Schubkarre, Gießkanne | – | – | |
| eingang (Gartentor) | 1×1 | weißer Rosenbogen über einem Lattentor | – | – | |
| einfassung (Hecke) | 1×1 | geschnittener Laubblock, anschlussfähig | – | – | |
| ursprung (Gartenbank) | 1×1 | Holzbank mit Lehne, Blumentopf | – | – | |
| zeichen (Wimpel) | 1×1 | weiße Stange mit Wimpelkette zu einem Pfosten | – | – | |
| flaeche (Blumenbeet) | 2×2 | Erde mit Steinrand, vier Blumenbänder, Sonnenblume | – | – | |
| denkmal (Gartenzwerg) | 1×1 | Gartenzwerg aus Ton auf rundem Steinsockel | – | – | |

Umgebung: Strauch grün (`strauch_a`) und blühend (`strauch_b`) im Wechsel auf den festen Strauchplätzen der Garten-Szene. Wesen: Biene, Schnecke, Schmetterling.

**Unterwasser** (`sprites-g3-unterwasser.py`, 02.11.2026). Materialleiter: **Treibholz und Muscheln → Korallenstein mit Bullaugen → Messing, Perlmutt und Glaskuppel.** Neue Farben: Treibholz `#9C8668`, Muschel `#E8D0B8`, Korallenstein `#CE9C84`, Messing `#C8A454`, Perlmutt `#E2DEEA`, Glas `#A4D6E2`, Sand `#D6C496`, Seegras `#4E8C60`, Rot `#D05446`, Licht `#FFD678`.

| Rolle (Name) | Felder | Stufe 1 | Stufe 2 | Stufe 3 | Höhe s1 / s2 / s3 |
|---|---|---|---|---|---|
| kern (Hauptkuppel) | 3×3 | **kleine Kuppel** aus Muschelplatten mit Treibholzrippen auf einem Steinring, Tür, Bullauge | **große Kuppel aus Korallenstein** auf Steinsockel, vier Bullaugen, Aufsatz mit Glas-Oberlicht, Röhre zu einer Nebenkuppel, Banner | **runder Turm** aus Korallenstein mit Messingring und **hoher Glaskuppel**, Laternenspitze, zwei Nebenkuppeln mit Röhren, Banner, Fahne | 109 / 205 / 325 |
| wissen (Perlenkammer) | 2×2 | **offene Riesenmuschel** mit leuchtender Perle | **Perlmutt-Kuppel** mit hohem **Schneckenturm** (Spiralkegel, Laterne), Bullaugen, Banner | – | 142 / 235 |
| turm (Leuchtturm) | 1×1 | **Treibholzpfahl** mit Querholz und Laterne | **gestreifter Steinturm** (weiß-rot), Rundgang, Glaskanzel mit Licht, Messinghaube, Fahne | – | 152 / 287 |
| werkstatt (Werft) | 2×2 | Holzgerüst mit Kran, kleines U-Boot im Bau, Bretter | – | – | |
| eingang (Tauchschleuse) | 1×1 | runde Luke mit Handrad im Messingrahmen, zwei Lampen | – | – | |
| einfassung (Korallenriff) | 1×1 | Ast- und Fächerkorallen, Hirnkoralle auf Steinstreifen, anschlussfähig | – | – | |
| ursprung (Anker) | 1×1 | schräger Anker im Sand mit Kette | – | – | |
| zeichen (Boje) | 1×1 | Petrol-Boje mit hellem Band, Fahne, Licht, Kette | – | – | |
| flaeche (Seegraswiese) | 2×2 | Sand mit Seegras-Büscheln, Muscheln, Seestern | – | – | |
| denkmal (Muschelskulptur) | 1×1 | graue Muschel auf Steinsockel | – | – | |

Umgebung: Ast-Koralle (`koralle_a`) und Fächer (`koralle_b`) im Wechsel auf den festen Korallenplätzen. Wesen: Fisch, Krebs, Qualle.

**Weltraum** (`sprites-g3-weltraum.py`, 02.11.2026). Materialleiter: **Blech und Landekapsel → helle Paneele mit Nieten → Glas, Solarflügel und Leuchtband.** Neue Farben: Blech `#969CA4`, Paneel `#DEE2E8`, Solar `#344880`, Glas `#96CEE2`, Orange `#E88C3C`, Leuchtband `#6EDCDC`, Fels `#707080`.

| Rolle (Name) | Felder | Stufe 1 | Stufe 2 | Stufe 3 | Höhe s1 / s2 / s3 |
|---|---|---|---|---|---|
| kern (Kommandomodul) | 3×3 | **Landekapsel** auf drei Beinen, Luke, Bullauge, Antenne | **Paneelmodul** auf Sockel mit Bullaugen und Tür, Kapsel obenauf, Solarflügel, Banner | **Turm aus drei Modulen** mit Leuchtbändern, **Glaskuppel**, zwei Solarflügel, Andockring, Seitenmodul, Fahne | 186 / 271 / 409 |
| wissen (Sternwarte) | 2×2 | **Teleskop** auf Dreibein neben einer Gerätekiste | **Rundbau mit Kuppel**, offener Spalt, großes Teleskop, Leuchtband, Banner | – | 108 / 228 |
| turm (Antennenmast) | 1×1 | **Gittermast** mit kleiner Schüssel und Lämpchen | **hoher Mast** auf Gerätekasten, große Schüssel, zwei Stabantennen, Blinklicht, Fahne | – | 154 / 277 |
| werkstatt (Montagehalle) | 2×2 | Paneelhalle mit offenem Rolltor, Roboterarm, Kisten, Leuchtband | – | – | |
| eingang (Luftschleuse) | 1×1 | Rahmen mit Schiebetür, Warnstreifen, Lampe | – | – | |
| einfassung (Schutzwand) | 1×1 | Paneele auf Stützen mit Leuchtband, anschlussfähig | – | – | |
| ursprung (Landeplatz) | 1×1 | runde Platte mit Markierung und Randlichtern | – | – | |
| zeichen (Flagge) | 1×1 | Mast mit Petrol-Flagge und Stern | – | – | |
| flaeche (Kristallfeld) | 2×2 | Felsboden mit leuchtenden Kristallgruppen | – | – | |
| denkmal (Satellit) | 1×1 | grauer Satellit mit Flügeln und Schüssel auf Ständer | – | – | |

Solarflügel dürfen als einzige Teile weiter als 0,2 Feld über den Fußabdruck hinausragen, bleiben aber im Bild. Wesen: Drohne, Roboter. Damit sind alle fünf Themen der Epoche 1 erneuert.

### 12.11 Epochen 2–4 (Entscheidungen PV, 02.11.2026)

- **Vorgezogen:** Die Stufen der Epochen 2–4 (je Thema 15 Bilder: Bergfried 4–9, Studierstube 3–5, Späherturm 3–5, Werkstatt 2–3, Tor 2) werden jetzt im Stil dieser Regel erneuert, alle fünf Themen, Thema für Thema ein PR (bastion, dorf, garten, unterwasser, weltraum).
- **Eine Stufe, ein Bild:** Eine Stufe sieht in jeder Epoche gleich aus. Ihr Bild liegt in der Epoche, in der sie zuerst baubar ist (`kern_s1` in `e1`, `kern_s4` in `e2` …); spätere Epochen nehmen es über den Epoche-Rückfall (`atlasEintrag`). Die alten P5-Fassungen der Stufen 1–3 in `e2`–`e4` sind entfernt (`tools/grafik/epochen-aufraeumen.py`). Grund: Die Stufe bleibt ohne Ziffer erkennbar (12.6 Nr. 5); ein nicht ausgebauter Holzturm bleibt ein Holzturm.
- **Messung ab Stufe 4:** Höhe mindestens **8 %** je Stufe (PV), Umriss mindestens **10 %** (statt 25 %). Grund: Ab Stufe 4 ist der Fußabdruck gefüllt; 25 % Umriss ginge nur mit etwa 30 % Höhe je Stufe. Darum trägt jede Stufe ein neues Merkmal, das man ohne Ziffer sieht (Festlegung Grafik-Strang im Auftrag des PV, 02.11.2026). Test: `tools/grafik/atlas-stufen.test.ts`, Kette über alle Epochen.
- **Wachstum ab Stufe 4:** vor allem im Umriss innerhalb des Fußabdrucks (Mauerring, Ecktürme, Torhaus, zweiter Turm, Kuppel oder Schieferhelm), weniger in der Höhe. Offen beim PV: Epoche 1 bleibt wie abgenommen (Empfehlung) oder heutige Stufe 2 → 4 und 3 → 7.

**Thema `bastion`** (`tools/grafik/sprites-g3e-bastion.py`, 02.11.2026). Materialleiter ab Epoche 2: Stein mit Schieferdach, ab Stufe 8 Kupfer (Grünspan). Neue Farben: Schiefer `#606876`, Kupfer `#5C9C8A`, Knauf `#D6B668` (matt).

| Rolle | Stufe (Epoche) | Neues Merkmal |
|---|---|---|
| kern | 4 (2) | Mauerring mit Zinnen, drei Ecktürme mit Schieferkegel, Schieferhelm |
| kern | 5 (2) | Torhaus mit zwei Türmchen, höhere Ecktürme mit Fahnen, höherer Helm |
| kern | 6 (3) | Erkertürmchen am Zinnenkranz, gestufter Aufsatz, höhere Mauern |
| kern | 7 (3) | hinterer Eckturm, Palas, hoher Doppelhelm |
| kern | 8 (4) | Kupferdächer, Kuppel mit Laterne und Spitze |
| kern | 9 (4) | hohe Turmspitze, breitere Ecktürme |
| wissen | 3 / 4 / 5 | Bibliothek mit Treppenturm / Sternturm mit Kuppel und Fernrohr / Archiv mit Kupferkuppel |
| turm | 3 / 4 / 5 | Steinturm mit Zinnen / Rundturm mit Wehrgang / Leuchtturm mit Laternenstube und Kupferspitze |
| werkstatt | 2 / 3 | Fachwerk-Zimmerei mit Holzkran / steinerne Bauhütte mit Tretradkran |
| eingang | 2 | steinernes Torhaus mit Fallgitter und Schieferhelm |

**Thema `weltraum`** (`tools/grafik/sprites-g3e-weltraum.py`, 02.11.2026). Leiter weiter: Paneele → Ringmodule, Andockbuchten, Glaskuppeln. Neue Farbe: Warnstreifen `#ECC43C`.

| Rolle | Stufe (Epoche) | Neues Merkmal |
|---|---|---|
| kern | 4 (2) | Plattform mit Warnstreifen, vier Module, Seitenmodule mit Schüssel, ein Paar Solarflügel |
| kern | 5 (2) | Andockbucht mit Fähre, zweistöckige Seitenmodule, zweites Paar Solarflügel |
| kern | 6 (3) | fünftes Modul, großer Wohnring mit Speichen |
| kern | 7 (3) | Seitenmodule als Rundtürme mit Glaskuppel, hohe Spitze |
| kern | 8 (4) | sechstes Modul, große Glaskuppel, drittes Paar Solarflügel |
| kern | 9 (4) | siebtes Modul, zweiter Ring oben, Spitze mit Fahne |
| wissen | 3 / 4 / 5 | Radioteleskop / Observatorium mit Kuppel und Schüssel auf Mast / großes Observatorium mit Ring und Glaskuppel |
| turm | 3 / 4 / 5 | Funkturm mit zwei Schüsseln / hoher Funkturm mit Ringplattform / Sendeturm mit zwei Ringen und Glaskanzel |
| werkstatt | 2 / 3 | Montagehalle mit Portalkran und kleiner Rakete / Startrampe mit hoher Rakete im Gitterturm |
| eingang | 2 | große Schleuse mit Doppeltür, Glaskanzel und Andockarm |

**Thema `dorf`** (`tools/grafik/sprites-g3e-dorf.py`, 02.11.2026). Bruchstein mit Schiefer, ab Stufe 8 Kupfer. Neue Farben: Zifferblatt `#F4EFE4`, Segeltuch `#F0E8D6`, Laterne `#3C3C40`.

| Rolle | Stufe (Epoche) | Neues Merkmal |
|---|---|---|
| kern | 4 (2) | Rathaus aus Bruchstein mit Laubengang, frei stehender Uhrturm mit Schieferhelm |
| kern | 5 (2) | Treppengiebel, welsche Haube mit Laterne, erstes Bürgerhaus |
| kern | 6 (3) | Uhrturm mit Umgang und Glockenstube, zweites Bürgerhaus |
| kern | 7 (3) | Kirchturm hinten links, hoher Schieferhelm am Uhrturm |
| kern | 8 (4) | Residenz: Kupfer-Mansarddach, Kupferkuppel, Pavillon |
| kern | 9 (4) | hohe Kupferspitzen auf Uhr- und Kirchturm |
| wissen | 3 / 4 / 5 | Bücherei mit Treppengiebel und Treppenturm / Stadtbibliothek mit Uhr-Eckturm / Residenz-Bibliothek mit Säulenportal und Kupferkuppel |
| turm | 3 / 4 / 5 | Holländer mit Galerie / Galerieholländer aus Ziegel / Prunkmühle mit Kupferhaube |
| werkstatt | 2 / 3 | Fachwerk-Schreinerei mit Bretterlager / Sägemühle mit Wasserrad |
| eingang | 2 | Steinbrücke mit Bogen, Laternen und Banner |

**Thema `garten`** (`tools/grafik/sprites-g3e-garten.py`, 02.11.2026). Weiter mit Stein, Glas und Schmiedeeisen, ab Stufe 8 Kupfer. Neue Farbe: Schmiedeeisen `#3A3E42`.

| Rolle | Stufe (Epoche) | Neues Merkmal |
|---|---|---|
| kern | 4 (2) | zweiter Baum mit Hütte und Hängebrücke |
| kern | 5 (2) | dritter Baum mit bemalter Hütte, Wendeltreppe |
| kern | 6 (3) | Steinterrasse mit Blumen, Pavillon auf der Krone |
| kern | 7 (3) | hoher Doppelturm auf der oberen Hütte |
| kern | 8 (4) | Glaskuppel mit Laterne, Kupferdächer |
| kern | 9 (4) | hohe Kupferspitze, Nebenbäume mit Glaskuppeln |
| wissen | 3 / 4 / 5 | Orangerie aus Stein / großes Glashaus mit Seitenschiffen / Palmenhaus mit Glaskuppel |
| turm | 3 / 4 / 5 | bemalte Aussichtsstube / Pagode mit fünf Dächern / hohe Pagode mit Kupferdächern |
| werkstatt | 2 / 3 | Gärtnerei mit Wasserturm / Gartenmeisterei aus Stein mit Windpumpe |
| eingang | 2 | Steinpfeiler mit Schmiedeeisentor und Rosen-Pergola |

**Thema `unterwasser`** (`tools/grafik/sprites-g3e-unterwasser.py`, 02.11.2026). Weiter mit Perlmutt-Türmen, Messing und Glas. Neue Farben: Glasglocke `#BEE4EC` (durchscheinend), Turmweiß `#ECE8E0`.

| Rolle | Stufe (Epoche) | Neues Merkmal |
|---|---|---|
| kern | 4 (2) | höherer Korallenturm, vier Nebenkuppeln mit Röhren |
| kern | 5 (2) | zwei Perlmutt-Türme mit Glaskuppeln |
| kern | 6 (3) | zweites Geschoss mit Messingring |
| kern | 7 (3) | Messing-Ringgalerie auf Stützen |
| kern | 8 (4) | große Glasglocke über der unteren Stadt |
| kern | 9 (4) | hohe Messingspitze mit Laternenstube und Perle |
| wissen | 3 / 4 / 5 | Perlmutt-Kuppel mit zwei Schneckentürmen / Archiv mit Glas-Oberlicht / großes Archiv mit drei Schneckentürmen |
| turm | 3 / 4 / 5 | Leuchtturm mit zwei Galerien / Korallensockel und Glaskuppel / sehr hoher Turm mit Glaskugel |
| werkstatt | 2 / 3 | Dock mit U-Boot und Kran / Werfthalle mit Glasdach und Portalkran |
| eingang | 2 | große Schleuse mit Glaskuppel und Lampenmasten |

### 12.12 Qualität: vierfach gezeichnet, feinere Materialien (Wunsch PV, 02.11.2026)

Gilt für alle Bilder des G3-Generators (`tools/grafik/g3_stil.py`). Maße, Fußpunkte und IDs bleiben; die App lädt unverändert.

- **Vierfach zeichnen:** Gebäude, Umgebung, Kulisse-Dinge, Boden-Kacheln und der Horizont der Kulisse werden intern vierfach gezeichnet (`S = 4`) und weich verkleinert, wie schon die Wesen (`W_S`), der Himmel und der Hinterhof. Die Skripte rechnen weiter in einfachen Bildpunkten; `Zeichner` vergrößert jede Form und jede Linienbreite. Beim Boden bleibt die Kante der Raute hart, damit zwischen den Kacheln keine Fugen entstehen.
- **Kontur mischt:** Konturen und Linien mit Deckkraft unter 255 dunkeln die Fläche ab (vorher stanzten sie durchsichtige Linien in das Bild, durch die der Boden schien).
- **Materialien** (feste Zahlenfolge `zahl(…)`, kein Zufall): Steinquader je Stein ein leicht anderer Ton mit Lichtsaum oben und Schattensaum unten; Holz mit feiner, welliger Maserung und Astlöchern; Ziegel- und Schieferdächer in Reihen mit Schatten unter jeder Reihe und versetzten Stoßfugen, Grat und First im Licht; Fenster mit Laibung, Sprossen, mattem Glanz und Sims (Sprossen auch auf der Abend-Ebene); Türen mit Brettern, zwei Eisenbändern, Ring und Schwelle.
- **Weiche Eigenschatten** (`Iso.abdunkeln`, dunkelt nur schon Gezeichnetes ab, nie die Luft): Dachüberstand auf der Wand (Pyramide, Satteldach, Kegel auf dem Rundturm), Körper auf dem, worauf er steht (Turm auf Mauer, Aufsatz auf Kranz), Wandfuß etwas dunkler.
- **Dateigröße:** Gebäude, Umgebung und Kulisse-Dinge werden als Palette-PNG mit 256 Farben gespeichert (fein gestreut). So bleibt der Atlas trotz der feineren Bilder etwa so groß wie vorher. `atlas-stufen.test.ts` liest dafür auch Palette-PNGs.
- **Umriss-Test:** Die alten Bilder hatten durch die gestanzten Konturen Löcher im Umriss; das hob den gemessenen Unterschied zwischen zwei Stufen künstlich an. Mit geschlossenen Konturen liegen neun Übergänge knapp unter der Grenze (siehe `GRAFIK.md` §14). Sie lagen auch vorher schon darunter, wenn man die Löcher füllt.
