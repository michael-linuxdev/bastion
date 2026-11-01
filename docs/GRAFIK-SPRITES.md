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
| Gebäude (alle Rollen, §4) | 12.2 bis 12.7 ganz | Thema `bastion`, Epoche 1, alle Rollen (14 Bilder, 12.8) |
| Boden (Fläche, Rand, Varianten) | Raster, Licht, Palette | Thema `bastion` |
| Umgebung (Bäume, Büsche, Steine, Wasserrand) | Raster, Licht, Kontur, Palette, Maßstab | Thema `bastion` |
| Wesen und Bewohner | Licht, Kontur, Palette, Maßstab | Wesen des Themas `bastion` (Fuchs, Möwe, Wache) |
| Himmel, Wetter, Auflagen | Palette, weiche Kontur | gemeinsam für alle Themen (§5) |
| andere Themen, Epochen 2–4 | dieselbe Regel, eigene Materialleiter (12.5) | erst nach U4b |

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

- [ ] Palette, Licht, Kontur und Maßstab so übernehmen
- [ ] Materialleiter Holz → Fachwerk → Stein für das Thema `bastion`
- [ ] Tabelle 12.8 (was sich je Rolle und Stufe ändert)
- [ ] Danach erzeugt G3 die Bilder in Chargen, jede mit Vergleichsbild vorher und nachher
