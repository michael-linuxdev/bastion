# Design-Ideen – Arbeitsdokument

Stand: 31.10.2026 · **Bearbeitbar im Repo** (nicht nur Agent-Store)

## Zweck

Sammel- und Arbeitsdokument für Design-Ideen der Bastion-Oberfläche. Alles hier folgt `VISION.md` §9 (R1–R7): keine Zufallsbelohnungen, keine Echtzeit-Timer, kein Verfall, keine Werbung/Käufe; Bewegung respektiert „weniger Bewegung“; Grafik ändert keine Lern- oder Bastion-Daten (B-27).

Dieses Dokument ist die dauerhafte, editierbare Quelle für das Backlog **AA–ZZ**. Frühere Wellen und die Sammlung **A–Z** laufen parallel in PRs; hier bleibt nur ein kurzer Spiegel, damit niemand den ganzen Zwischenstand aus dem Agent-Store hierher kopieren muss.

**Nicht hier:** Didaktik/Lerninhalte (macht der Verantwortliche separat). **Themen-Welten spürbar (H29)** und die große Konsolidierung kommen erst, wenn die laufenden Design-PRs fertig sind (Preference PV 31.10.2026).

---

## Umgesetzte und laufende Wellen

| Welle | Inhalt (kurz) | Hinweis |
|---|---|---|
| App-Menü / Hub | Hub ohne untere Reiter, Bastion-Vollbild, Bau-Vorschau, Test-Rohstoffe | #129 |
| Design-Bundel A–G u. a. | Hub, Bastion-Ort, Bau-Menü, Eltern/Test, Typo/Motion … | Bundel-PRs, siehe Konsolidierung |
| Üben-IO | Ein-/Ausgabe und Lernflächen-Optik | eigener Strang/PR |
| Danach (J) | Landkarte, Übergang, Fehlerwerkstatt, Gesten, Onboarding, Eltern/Kind | Bundel in Umsetzung |
| **A–Z** | Ideensammlung Hub→…→Z | **in Umsetzung / später konsolidieren** — Details in den jeweiligen PRs, nicht hier vollständig abschreiben |

Nach Abschluss der A–Z-Welle: konsolidieren, dann optional Themen-Welten und neues Backlog aus **AA–ZZ** priorisieren.

---

## Spiegel A–Z (nur Überschriften)

Status: siehe PRs / später konsolidieren. Kein Ersatz für die Store-Sammlung; nur Orientierung.

| Buchstabe | Thema |
|---|---|
| A | Einstieg & Navigation (nach Hub ohne Reiter) |
| B | Bastion als Ort (nicht als App-Rahmen) |
| C | Bau-Menü & Vorschau |
| D | Lernen & Bastion im gleichen Produkt |
| E | Eltern- & Testbereich |
| F | Typografie, Farbe, Bewegung |
| G | Ton & Inhalt (VISION-konform) |
| H | Später / größer (u. a. Themen-Welten) |
| I | Üben Ein-/Ausgabe |
| J | Danach (Landkarte, Übergang, Onboarding …) |
| K | Weitere Ideen (Steinkette, Klassenarbeit, Ritual …) |
| L | Noch weitere Ideen (offen) |
| M–Z | in Umsetzung / Konsolidierung — siehe PRs |

---

## Backlog AA–ZZ

Stand: 31.10.2026 · **Nicht sofort umsetzen** — bearbeitbares Backlog für später.
**AA–AZ** ausformuliert; **BA–ZZ** reserviert (bei Bedarf füllen).

### AA. Erste Woche mit der App

129. Willkommen nur einmal, danach Hub ohne Intro-Wand
130. Beispiel-Bastion zum Anschauen, klar als Beispiel markiert
131. Erste Stein-Verdienung mit 1-Satz-Erklärung

### AB. Geschwister / mehrere Profile

132. Lokale Profile ohne Konto, klar getrennt
133. Profilwechsel hinter Erwachsenen-Schutz
134. Keine Cloud-Sync-Versprechen

### AC. Lehrer / Klasse (falls je)

135. Nur Export/Bericht, keine Klassen-Live-Ansicht
136. Keine Schüler-Rangliste

### AD. Bastion-Erzählung

137. Epoche sichtbar als Horizont-Silhouette
138. Belagerungs-Overlay nur nach Fortschritt, ruhig
139. Geschichte als kurze Tafel-Texte, nicht Cutscenes

### AE. Garten & Natur

140. Jahreszeiten-Tönung optional, kein Kalender-Zwang
141. Gießen-Animation an Bewohner gekoppelt
142. Wildwuchs nur als Dekor, kein Verfall-Mechanic

### AF. Unterwasser / Weltraum / Sonderwelten

143. HUD-Akzentfarbe pro Welt
144. Steuerung unverändert, nur Atmosphäre
145. Einstieg in Welt mit einem Satz Ortsname

### AG. Mini-Bastion / Hinterhof

146. Gleicher Interaktionsvertrag wie Hauptbastion
147. Schneller Wechsel ohne Lade-Feeling
148. Eigenes kleines Vorratsfach nur Anzeige

### AH. Planen vs. Bauen Feinschliff

149. Skizzen-Layer ein-/ausblendbar
150. Kosten bei Skizze ausgegraut „noch nicht gebaut“
151. Mehrere Skizzen ohne Zwang zu bauen

### AI. Rohstoff-Metapher

152. Stein/Erz/Bauplan mit einheitlichen Beutel-Icons
153. Keine Premium-Währung, keine Edelsteine
154. Anzeige „verdient durch Üben“ als Hilfe-Text

### AJ. Üben-Session-Design

155. Geplante Session-Länge wählbar (kurz/mittel), kein Timer-Druck
156. Abbruch speichert Fortschritt der Runde
157. Nach Session immer Angebot Bastion oder Hub

### AK. Fehlerwerkstatt 2.0

158. Karte „damals / heute“ festes Layout
159. Filter nur „offen“ / „schon geübt“
160. Keine Schuld-Sprache

### AL. Diagnose & Stand

161. Landkarte mit max. einer Hervorhebung
162. „Als Nächstes“-Chip genau einer
163. Druckversion für Eltern eine Seite

### AM. Barriere Plus

164. Dyslexie-freundliche Schriftoption (lokal, ARCHITEKTUR klären)
165. Farbenblind-sichere Urteil-Markierung (Form + Farbe)
166. Gesten-Alternativen für Drag

### AN. Offline / PWA

167. Update verfügbar: ruhiger Hinweis, kein Zwang
168. Precache-Status verständlich („Bereit ohne Netz“)
169. Bei Update: was ist neu in 3 Bullets

### AO. Performance wahrnehmen

170. Darstellung leicht als spürbarer Schalter
171. Lange Listen virtualisieren wo nötig
172. Atlas-Nachladen ohne leere Flash-Frames

### AP. Text & i18n

173. String-Längen für DE prüfen (Umbruch)
174. Platz für zweite Sprache vorbereiten, ohne sie zu liefern
175. Keine hartkodierten Satzzeichen-Cluster

### AQ. Iconografie-System

176. Strichstärke 1.5–2 überall
177. Gefüllte vs. Outline-Regel dokumentieren
178. Keine Emoji in der Primär-UI

### AR. Motion-Sprache

179. Dauer-Tokens (schnell/mittel/langsam)
180. Easing einheitlich
181. Fokus-Wechsel ohne Bounce

### AS. Sound-Design-Rahmen

182. Lautstärke-Kurven dokumentieren
183. Cue-Liste (max. 8 Sounds)
184. Stille als Default nach Fresh-Install prüfen

### AT. Eltern-Alltag

185. Wochensicht „wann wurde geübt“ ohne Streak
186. Stille Stunden nicht als Feature (kein Lockout)
187. Hinweis bei sehr langer Session (Einladung, kein Abbruch)

### AU. Sicherheit kindgerecht

188. PIN nur Eltern; Kind-Flächen ohne PIN-Prompts
189. Export enthält keine unnötigen Geräte-IDs in der UI
190. Klartext: Daten bleiben lokal

### AV. Bastion-Bau-Qualität

191. Snap-Hilfen dezent
192. Überlappungs-Warnung ruhig
193. Undo letzter Bau (ohne Verfall, bewusst)

### AW. Content-Pipeline sichtbar

194. Generator-Determinismus in Docs verlinken
195. Fehlende Vorlage: Designer-Fallback-Karte
196. Inhaltsversion in Für Erwachsene

### AX. QA / Design-QA

197. Checkliste Portrait/Landscape je Route
198. Leerzustand-Galerie im Docs
199. Contrast-Stichprobe Himmel+HUD

### AY. Release-Reife

200. „Bereit für Familie X“ Kriterienliste
201. Bekannte Lücken ehrlich in SESSION
202. Kein Feature-Freeze-Bruch ohne PLAN-Update

### AZ. (Abschlussblock AA–AY)

Ideen 129–202 oben; AZ selbst ohne Extra-Nummern. Nächster Block: **BA–BZ** (ausgearbeitet).

### BA. Erste echte Woche zu Hause

203. Sonntagabend-Check: ein Satz „Bereit für die Woche?“ ohne Druck
204. Wochenrückblick für Eltern: 3 Zeilen max., nur lokal
205. Kind sieht keine Wochenstatistik — nur „heute schon geübt“-Markierung

### BB. Geschwister fair teilen

206. Profil-Farben/Badges unterscheidbar, ohne Wettbewerb
207. Getrennte Bastionen klar beschriftet („Mias Ort“)
208. Gemeinsames Gerät: letzter Profilwechsel mit Zeitstempel nur für Eltern

### BC. Schule & Alltag

209. „Morgen Klassenarbeit“-Hinweis nur im Elternbereich
210. Kurze Übung vor der Schule: 3-Aufgaben-Modus prominent
211. Nach der Schule: Hub begrüßt ruhig, kein „Du warst weg“-Drama

### BD. Bastion-Epoche 2–4 spürbar

212. Horizont-Silhouette wechselt mit Epoche
213. Boden-Textur/Akzentfarbe pro Epoche, HUD bleibt gleich
214. Epoche-Wechsel: einmalige ruhige Entdeckungskarte

### BE. Belagerung & Spannung ohne Stress

215. Belagerungs-Overlay nur als Atmosphäre, kein Countdown
216. „Sicherheit der Mauer“ als Fortschrittsbild, nicht als HP-Balken
217. Kinder können Belagerung in Einstellungen ausblenden

### BF. Wasser, Wetter, Licht

218. Regen nur Partikel + Ton optional, Gebäude bleiben trocken-lesbar
219. Abendlicht gold, Nacht nur Bastion (Lernflächen hell)
220. Nebel/Dunst dezent, „Darstellung leicht“ schaltet aus

### BG. Tiere & kleine Mitbewohner

221. Igel/Frosch/Katze als ruhige Sprites, Pfad um Gebäude
222. Keine Sammel-Pets, keine XP für Tiere
223. Antippen: eine Geste (strecken, blinzeln), dann Ruhe

### BH. Garten vertiefen

224. Beete als nutzbare Bau-Typen mit Atlas
225. Jahreszeit-Tönung Laub/Schnee ohne Kalender-Zwang
226. Bienchen nur bei fortgeschrittenem Garten, sehr wenige

### BI. Unterwasser-Welt

227. Lichtstrahlen von oben, Blasen sparsam
228. Gebäude-Stil Koralle/Wrack, gleiche Bau-Logik
229. HUD-Akzent kühles Türkis, Touch-Ziele unverändert groß

### BJ. Weltraum-Welt

230. Sternen-Himmel statisch+sanft, kein Parallax-Stress
231. Module statt Häuser, gleiche Vorschau/Kosten-UI
232. Akzent kühles Violett sparsam — kein Neon-Glow

### BK. Mini-Bastion / Hinterhof 2.0

233. Eigene kleine Kamera-Defaults merken
234. Schnellwechsel mit kurzem Ortsnamen-Titel
235. Keine zweite Rohstoff-Ökonomie

### BL. Bauen als Handwerk

236. Werkzeugleiste: Wählen / Verschieben / Planen — eine Metapher
237. Magnetisches Einrasten nur optisch angedeutet
238. „Rückgängig“ für letzten Bau, Bestätigung bei Abriss

### BM. Rohstoffe erzählen

239. Beutel-Innenansicht mit 3 Material-Haufen
240. Leerer Beutel: Illustration + „Üben bringt Stein“
241. Probe-Rohstoffe gestrichelt und beschriftet

### BN. Üben-Fluss Feinschliff

242. Zwischen-Atem nach 2–3 Aufgaben als Banner, kein Modal
243. „Fertig für heute“ führt immer zu Hub oder Bastion-Wahl
244. Offene Aufgabe am Hub als eine Karte „Weiter geht’s“

### BO. Tipps & Erklärungen

245. Tipps nummeriert 1/n, Text kurz
246. Erklärung-Buch öffnet Overlay, Aufgabe bleibt dimmed sichtbar
247. Keine Tipps während Schrittweg (Klarheit der Phase)

### BP. Fehlvorstellungen sichtbar

248. FV-Karte: Titel, ein Schema, „Warum das passiert“ einklappbar
249. Gegenbeispiel optisch getrennt vom Urteil
250. Rückweg-Kompetenz als eine ruhige Tür

### BQ. Stand & Diagnose Landkarte

251. Zoom auf ein Themenfeld, Rest ausgegraut
252. Legende sitzt / wackelt / neu in drei Symbolen
253. Ein „Als Nächstes“-Stein, nicht drei CTAs

### BR. Mehr-Informationsarchitektur

254. Kind-Zone max. 4 Einträge
255. Erwachsenen-Zone optisch Werkbank (Raster, weniger Rundung)
256. Suche unnötig — alles scrollbar mit Ankern

### BS. Sicherung & Vertrauen

257. Export-Erfolg: „Kopie liegt bereit“ + wo
258. Import-Vorschau: Profilname/Datum vor Überschreiben
259. Vertrauensleiste unverändert: kein Konto, kein Tracking

### BT. Barriere nächste Stufe

260. Kontrast-Modus kräftiger Text + stärkere Fokusringe
261. Alle Urteil-Zustände Form+Farbe
262. Tastatur: Hub-Türen mit Pfeiltasten erreichbar

### BU. Motion & Sound Tokens

263. CSS/Vars: `--bewegung-schnell|mittel|langsam`
264. Sound-Stufen Labels in Kindersprache testen
265. Ambient nie in Üben-Phase, auch nicht leise

### BV. Microcopy-Pass 2

266. Glossar „Noch nicht / Stimmt / Schauen wir“ verbindlich
267. Keine Ausrufezeichen-Ketten
268. Eltern-Texte Siezen vermeiden, klar aber warm

### BW. Icon-System festziehen

269. Eine Stroke-Width, dokumentiert in DESIGN-IDEEN
270. Gefüllt = primäre Aktion, Outline = sekundär
271. Keine Emoji in Buttons/Navigation

### BX. Performance wahrnehmbar

272. „Darstellung leicht“ zeigt sofort weniger Partikel
273. Atlas-Swap ohne weißes Aufblitzen
274. Lange Eltern-Listen lazy/abschnittsweise

### BY. Design-QA Ritual

275. Vor Merge: 6 Screenshots Pflicht (Hub, Üben, Bastion, Mehr, Eltern, Landscape)
276. Leerzustände je Fläche einmal anklicken
277. Reduced-motion Stichprobe

### BZ. Übergang zu Themen-Welten

278. Pro Welt ein Stimmungsboard (Himmel, Boden, Akzent, 3 Referenz-Sprites)
279. Wechsel Welt = harter Cut mit Ortsnamen, kein Crossfade-Chaos
280. Welten-Freischaltung an echten Fortschritt, sichtbar in Landkarte

### CA–ZZ. Reserviert / später füllen

**BA–BZ** ausgearbeitet (31.10.2026). Platzhalter **CA** bis **ZZ**: bewusst leer halten oder bei Bedarf ergänzen — keine Verpflichtung zur Vollständigkeit.

| Block | Status |
|---|---|
| CA–CZ | reserviert |
| DA–DZ | reserviert |
| EA–EZ | reserviert |
| FA–FZ | reserviert |
| GA–GZ | reserviert |
| HA–HZ | reserviert |
| IA–IZ | reserviert |
| JA–JZ | reserviert |
| KA–KZ | reserviert |
| LA–LZ | reserviert |
| MA–MZ | reserviert |
| NA–NZ | reserviert |
| OA–OZ | reserviert |
| PA–PZ | reserviert |
| QA–QZ | reserviert |
| RA–RZ | reserviert |
| SA–SZ | reserviert |
| TA–TZ | reserviert |
| UA–UZ | reserviert |
| VA–VZ | reserviert |
| WA–WZ | reserviert |
| XA–XZ | reserviert |
| YA–YZ | reserviert |
| ZA–ZZ | reserviert |
