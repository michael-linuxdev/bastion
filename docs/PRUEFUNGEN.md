# Prüfungen in Sachsen – Aufbau als Vorlage für Bastion

Status: Bestandsaufnahme v0.1 · Stand: 29.10.2026 · Grundlage für K-25 (Prüfungen auf Knopfdruck)

Dieses Dokument hält fest, **wie** die Abschlussprüfungen in Mathematik in Sachsen aufgebaut sind. Bastion soll Prüfungen im selben Aufbau und Anspruch erzeugen (`VISION.md` §6, `VERMITTLUNG.md` §6). Es enthält nur Fakten zum Aufbau, **keine Aufgaben** aus den Quellen.

Quellen (bereitgestellt vom Projektverantwortlichen am 29.10.2026, nicht im Repository, siehe `quellen/README.md`):

- **[SMK-M]** Sächsisches Staatsministerium für Kultus: Schriftliche Abiturprüfung Leistungskursfach Mathematik, MUSTER, Material für den Prüfling, Teil A und Deckblatt Teil B (Schuljahr „20xx/xx“). Ältere Fassung (Teil B 90 BE, Teil A 100 Minuten).
- **[ST-LK]** STARK Abitur Sachsen Mathematik LK 2026, Leseprobe: „Hinweise und Tipps zum Zentralabitur“.
- **[ST-GK]** STARK Abitur Sachsen Mathematik GK 2027, Leseprobe: „Hinweise und Tipps zum Zentralabitur“.
- **[ST-RS]** STARK Realschulabschluss Sachsen Mathematik 2027, Leseprobe: Vorwort mit „Hinweise zur Prüfung“.

Die STARK-Hefte sind urheberrechtlich geschützt. Daraus werden nur Tatsachen über die Prüfung übernommen, keine Texte, Aufgaben oder Lösungen. **Alle Angaben müssen vor der Umsetzung an amtlichen Quellen geprüft werden.** Gebraucht werden: die Oberstufen- und Abiturprüfungsverordnung (OAVO), die Verwaltungsvorschrift zur Abiturprüfung des jeweiligen Jahrgangs, die IQB-Dokumente zu Operatoren und Hilfsmitteln sowie die Prüfungsvorgaben für den Realschulabschluss.

---

## 1. Abitur Mathematik – gemeinsame Merkmale (ab Abitur 2025)

- **Zentralabitur** im Auftrag des Kultusministeriums. Grundlage sind die Bildungsstandards Mathematik für die Allgemeine Hochschulreife (KMK 2012) und der sächsische Lehrplan Gymnasium. [ST-LK, ST-GK]
- **Gemeinsamer Aufgabenpool der Länder (IQB):** Im Leistungskurs werden seit 2014 einzelne Aufgaben aus einem gemeinsam erarbeiteten Pool übernommen. [ST-LK] *Folge für Bastion: Das Abitur 2029 besteht vermutlich teilweise aus Pool-Aufgaben. Bastion kann im Stil des Pools erzeugen, ihn aber nicht ersetzen. Mit dem Projektverantwortlichen klären.*
- **Drei Sachgebiete:** Analysis, Analytische Geometrie/Lineare Algebra, Stochastik.
- **Zwei Prüfungsteile:**
  - **Teil A, hilfsmittelfrei:** mehrere kurze, nicht zusammenhängende Aufgaben in zwei Aufgabengruppen. Gruppe 1 deckt die Anforderungsbereiche I und II ab, Gruppe 2 erreicht zumindest in einer Teilaufgabe den Anforderungsbereich III.
  - **Teil B, mit Hilfsmitteln:** bis zu drei umfangreichere Pflichtaufgaben mit zusammenhängenden Teilaufgaben. Sie sind inner- oder außermathematisch, auch Sachgebiete vernetzend.
- **Ablauf:** Die Prüflinge erhalten A und B gleichzeitig. Wer Teil A abgibt, bekommt die Hilfsmittel. Die Abgabe von A muss innerhalb einer Frist erfolgen (LK 110, GK 100 Minuten).
- **Hilfsmittel** in beiden Teilen: Wörterbuch der deutschen Rechtschreibung, Zeichengeräte, für Prüflinge nichtdeutscher Herkunftssprache ein zweisprachiges Wörterbuch. Nur in Teil B dazu:
  - die mathematisch-naturwissenschaftliche Formelsammlung des IQB,
  - ein **modulares Mathematiksystem (MMS)** ohne Netz. Es kann Gleichungen und Gleichungssysteme lösen, differenzieren und integrieren, mit Vektoren und Matrizen rechnen, Binomial- und Normalverteilung auswerten, Tabellen rechnen und Graphen darstellen.

  Bis zum Abitur 2025 war in Teil B ein grafikfähiger Taschenrechner (GTR) mit oder ohne CAS zugelassen. [ST-LK, ST-GK]
- **Allgemeine Kompetenzen**, ausgewogen berücksichtigt: argumentieren, Probleme lösen, modellieren, Darstellungen verwenden, mit symbolischen, formalen und technischen Elementen umgehen, kommunizieren. [ST-LK, ST-GK]
- **Bewertung:**
  - Erst- und Zweitkorrektur, bei mehr als drei Punkten Abweichung eine Drittkorrektur.
  - Bewertet werden sachliche Richtigkeit, Gedankenführung und sprachliche Darstellung.
  - Bei schweren Verstößen gegen Sprache oder Form kann je ein Punkt abgezogen werden.
  - Es gibt fachbezogene Korrekturhinweise. Die Bewertungseinheiten (BE) stehen an jeder Teilaufgabe.

  [ST-LK]

## 2. Leistungskurs (LK)

| | Ab Abitur 2025 [ST-LK] | Muster, ältere Fassung [SMK-M] |
|---|---|---|
| Arbeitszeit gesamt | 300 Minuten | 300 Minuten |
| Teil A | 30 BE; Abgabe innerhalb der ersten 110 Minuten | 30 BE; höchstens 100 Minuten |
| Teil A, Gruppe 1 (Pflicht) | 4 Aufgaben: 2 Analysis, je 1 Geometrie/LA und Stochastik | Aufgaben 1–4 |
| Teil A, Gruppe 2 (Wahl) | 6 Aufgaben, je 2 je Sachgebiet; **2 beliebige** davon bearbeiten | Aufgaben 5–10, 2 wählen; Wahl auf dem Blatt ankreuzen |
| Teil B | bis zu 3 Pflichtaufgaben, 70 BE | 2 Aufgaben (B 1, B 2), 90 BE |
| Gesamt | **100 BE** | 120 BE |

Formen in Teil A (beobachtet im Muster [SMK-M]):

- Mehrfachauswahl mit fünf Antworten, genau eine richtig (je 1 BE),
- Werte aus einem gegebenen Graphen ablesen und begründen,
- kurze Rechnungen,
- Funktionenscharen mit Parameter,
- Nachweise („Zeigen Sie …“) und Begründungen,
- Erwartungswert und Standardabweichung,
- Zufallsexperimente mit Begründung des Vorgehens.

Antworten werden teils auf dem Aufgabenblatt eingetragen, teils auf Reinschriftpapier.

**100-BE-Skala** (ab 2025) [ST-LK]:

| BE | Punkte |
|---|---|
| 100–95 / 94–90 / 89–85 | 15 / 14 / 13 |
| 84–80 / 79–75 / 74–70 | 12 / 11 / 10 |
| 69–65 / 64–60 / 59–55 | 9 / 8 / 7 |
| 54–50 / 49–45 / 44–40 | 6 / 5 / 4 |
| 39–33 / 32–27 / 26–20 | 3 / 2 / 1 |
| 19–0 | 0 |

## 3. Grundkurs (GK)

| | Ab Abitur 2025 [ST-GK] |
|---|---|
| Arbeitszeit gesamt | 255 Minuten (bis 2023: 240 Minuten, davon 70 für Teil A) |
| Teil A | 25 BE; Abgabe innerhalb der ersten 100 Minuten |
| Teil A, Gruppe 1 | je Sachgebiet 1 Aufgabe, **alle 3** bearbeiten |
| Teil A, Wahl | je Sachgebiet eine weitere Aufgabe aus Gruppe 1 und eine aus Gruppe 2; **je Gruppe eine** wählen. Insgesamt 5 von 9 Aufgaben |
| Teil B | bis zu 3 Pflichtaufgaben, 55 BE (2025: drei Aufgaben B 1 bis B 3) |
| Gesamt | **80 BE** |

**80-BE-Skala** (ab 2025) [ST-GK]:

| BE | Punkte |
|---|---|
| 80–76 / 75–72 / 71–68 | 15 / 14 / 13 |
| 67–64 / 63–60 / 59–56 | 12 / 11 / 10 |
| 55–52 / 51–48 / 47–44 | 9 / 8 / 7 |
| 43–40 / 39–36 / 35–32 | 6 / 5 / 4 |
| 31–27 / 26–22 / 21–16 | 3 / 2 / 1 |
| 15–0 | 0 |

## 4. Realschulabschluss (Oberschule, Klasse 10) [ST-RS]

| | |
|---|---|
| Teil A | 30 Minuten, etwa 10 kleine Aufgaben; nur Zeichengeräte, kein Taschenrechner, keine Formelsammlung; Basiswissen und einfache Rechnungen (auch Brüche). Im Jahrgang 2023: 12 BE |
| Teil B | 210 Minuten, 5 Pflichtaufgaben und 3 Wahlaufgaben, von denen **eine** gelöst wird; Zeichengeräte, Taschenrechner, Formelsammlung; komplexe Aufgaben |

Formen in Teil A (beobachtet):

- schriftliches Rechnen im Rechenkästchen,
- Anteile und Einheiten umrechnen,
- Schätzaufgaben,
- Wahr oder falsch,
- Winkel bestimmen,
- Zahlen auf dem Zahlenstrahl eintragen,
- Zweitafelbild und Schrägbild,
- Baumdiagramm beschriften,
- Funktionswerte am Graphen ablesen,
- Logikrätsel.

Teil B ist sachbezogen, zum Beispiel Körper, Prozent und Kosten, Statistik mit arithmetischem Mittel und Zentralwert.

*Der Hauptschulabschluss und die Prüfungen in Klasse 9 fehlen noch.*

## 5. Folgen für Bastion

1. **Prüfungsformate als Daten:** Für jede Prüfungsart (Kurzkontrolle, Klassenarbeit, Klausur, Realschulabschluss, Abitur GK und LK) wird beschrieben:
   - Teile, Zeiten und Hilfsmittel,
   - Aufgabengruppen und Wahlregeln,
   - Bewertungseinheiten und Notenskala.

   So lassen sich Änderungen der Vorgaben (wie 2024/2025) ohne neuen Code nachziehen.
2. **Neue Aufgabentypen**, die heute fehlen:
   - Mehrfachauswahl mit fünf Antworten im Prüfungsstil,
   - Ablesen am Graphen mit Begründung,
   - Nachweis- und Begründungsaufgaben mit Erwartungshorizont,
   - Funktionenscharen,
   - Rechenkästchen,
   - Zweitafelbild und Schrägbild,
   - Baumdiagramm beschriften.
3. **Hilfsmittelfrei und mit MMS:** Für Teil A müssen die Generatoren „schöne“ Zahlen garantieren, die ohne Rechner lösbar sind. Teil B darf Rechnerergebnisse voraussetzen. Bastion selbst bietet kein MMS an.
4. **Bewertungseinheiten je Teilaufgabe** und Korrekturhinweise (Erwartungshorizont, Zwischenergebnisse) gehören zu jeder Prüfungsvorlage.
5. **Notenskalen** (80 und 100 BE) nur, wenn Noten eingeschaltet sind (K-26). Die Punkte und BE stehen immer da.
6. **Formelsatz für den Druck** ist Pflicht: Brüche, Wurzeln, Grenzwerte, Integrale, Vektoren, Matrizen, Binomialkoeffizienten. Dazu kommen Graphen und Raumskizzen.
7. **Operatoren** (Bestimmen, Berechnen, Zeigen, Begründen, Ermitteln, Untersuchen …) brauchen eine eigene Liste nach den amtlichen Vorgaben. Damit endet das Nicht-Ziel „Operatoren-Training“ (`PLAN.md` §2.1), sobald die Prüfungen drankommen.
8. **Pool-Aufgaben:** klären, wie Bastion mit dem IQB-Pool umgeht (§1).

## 6. Offen

- Amtliche Vorgaben für das Abitur 2029 (Prüfungsjahrgang, Verwaltungsvorschrift, Operatorenliste, Hilfsmittel).
- Aufbau des Hauptschulabschlusses und der Leistungsermittlung in Klasse 5 bis 9 (Kurzkontrollen, Klassenarbeiten) an Oberschule und Gymnasium.
- Ob die Muster-Prüfung des Kultusministeriums frei verwendet werden darf. Bis zur Klärung bleibt sie außerhalb des Repositorys.
