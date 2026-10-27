# Bastion – Datenmodell

Status: v0.2 (Entscheidungen bestätigt) · Stand: 27.10.2026 · Aufgabe 0.6
Bezug: `ARCHITEKTUR.md` (T-4, T-7), `BASEBAU.md` §3, `LEHRPLAN.md` §6, `INHALTSFORMAT.md` (I-6)

---

## 1. Leitgedanken

1. **Ereignisse sind die Wahrheit.** Alles, was passiert ist, wird als unveränderliches Ereignis gespeichert. Alles andere wird daraus berechnet.
2. **Berechnete Zustände sind ein Zwischenspeicher.** Man kann sie jederzeit löschen und neu aufbauen.
3. **Zusammenführen muss immer gehen.** Zwei Stände desselben Profils (Tablet und Handy, alte Sicherung und aktueller Stand) lassen sich ohne Datenverlust vereinen.
4. **So wenig wie möglich, so lange wie nötig.** Auch lokal gilt Datensparsamkeit.

## 2. Überblick

```
          ┌──────────── EREIGNISSE (append-only) ────────────┐
          │ aufgabe · sitzung · buchung · bau · einstellung  │
          │ verdichtung                                      │
          └──────────────────────┬───────────────────────────┘
                                 │ Projektion (inkrementell oder Neuaufbau)
          ┌──────────────────────▼───────────────────────────┐
          │ PROJEKTIONEN (Zwischenspeicher)                  │
          │ karten · kompetenzen · wochen · konto · bastion  │
          │ einstellungen                                    │
          └──────────────────────┬───────────────────────────┘
                                 │
                Oberfläche · Elternbericht · Portfolio · Bastion
```

## 3. Gemeinsame Grundlagen

### 3.1 Profile

Mehrere Profile pro Gerät sind möglich (Geschwister teilen sich ein Tablet). Jedes Ereignis gehört genau einem Profil. Das Profil selbst ist minimal:

```ts
interface Profil {
  id: ID;
  erstellt: number;        // ms seit 1970, UTC
}
```

Spitzname, Avatar, Klassenstufe und Schulform sind **Einstellungen** (s. 4.5) und damit ebenfalls Ereignisse.

**Entscheidung D-1: Kein Geburtsdatum, kein echter Name.** Ein Spitzname genügt. Die Elternstufe (K-4: begleitet, vereinbart, selbstverwaltet) wird ausdrücklich eingestellt, nicht aus dem Alter berechnet.
*Warum:* Ein Geburtsdatum wäre die sensibelste Angabe im ganzen System und wird für keine Funktion zwingend gebraucht.

### 3.2 IDs

IDs sind **ULIDs**: 26 Zeichen, zeitlich sortierbar, weltweit praktisch eindeutig, ohne zentrale Vergabe.
*Warum:* Ereignisse von zwei Geräten müssen beim Zusammenführen eindeutig bleiben (Prinzip 3 in Abschnitt 1).

Der Zufall für IDs kommt über eine Schnittstelle in den Kern (`ZufallsQuelle`), damit `src/core/` keine Browser-APIs nutzt (T-2). In der App liefert `crypto.getRandomValues` die Werte, in Tests ein fester Seed.

### 3.3 Zeit und Lerntag

```ts
type Tag = string;   // "2026-10-27"
```

**Entscheidung D-2: Der Lerntag beginnt um 4:00 Uhr Ortszeit.** Jedes Ereignis speichert neben dem Zeitstempel (`ts`, UTC) seinen **Lerntag** (`tag`), berechnet im Moment des Schreibens.
*Warum:*
- Tagesgrenzen (Tageskurve Stein, 2 Bauschritte, Erz-Obergrenze) sollen sich an Lernverhalten orientieren. Wer um 0:30 Uhr eine Einheit beendet, gehört noch zum Vortag – sonst lädt Mitternacht zum Doppelt-Lernen ein.
- Den Lerntag beim Schreiben festzuhalten, verhindert, dass ein Zeitzonenwechsel (Urlaub) im Nachhinein die Geschichte umsortiert.

Manipulierte Geräteuhren werden bewusst nicht abgefangen (KONZEPT §11): Ohne Ranglisten schaden sie niemandem.

### 3.4 Gemeinsame Felder aller Ereignisse

```ts
interface Ereignis {
  id: ID;
  art: 'aufgabe' | 'sitzung' | 'buchung' | 'bau' | 'einstellung' | 'verdichtung';
  v: number;               // Schemaversion dieser Ereignisart
  profil: ID;
  ts: number;              // UTC ms
  tag: Tag;                // Lerntag
  geraet: string;          // Zufalls-ID der Installation, 8 Zeichen
}
```

`geraet` ist eine bei der Installation erzeugte Zufallskennung ohne Bezug zur Hardware. Sie dient nur dazu, beim Zusammenführen Herkünfte zu unterscheiden.

## 4. Ereignisarten

### 4.1 `aufgabe` – eine bearbeitete Aufgabe

```ts
interface AufgabeEreignis extends Ereignis {
  art: 'aufgabe';
  sitzung: ID;
  modus: 'ueben' | 'wiederholen' | 'diagnose' | 'fehlerwerkstatt' | 'pruefung';
  kompetenz: string;                 // "M.ZO.BR.ERWEITERN"
  vorlage: string;                   // "M.ZO.BR.ERWEITERN.ZIELNENNER"
  niveau: 'G' | 'M' | 'E';
  quelle:
    | { generator: string; version: number; seed: number }
    | { variante: number };          // handverfasste Vorlage
  paket: string;                     // "mathematik.zahl-und-operation@7"
  ergebnis: 'richtig' | 'falsch' | 'teilweise' | 'uebersprungen';
  hilfen: number;                    // Anzahl genutzter Hilfestufen
  dauerMs: number;                   // Bearbeitungszeit, max. 10 Min. gekappt
  faellig: boolean;                  // war die Karte zum Zeitpunkt fällig?
  bewertung: 'nochmal' | 'schwer' | 'gut' | null;  // FSRS; null bei Diagnose und Überspringen
  fehlerbild?: string;               // erkanntes Fehlerbild (I-7)
  schnappschuss?: Schnappschuss;     // nur bei falsch/teilweise (I-6)
  korrigiert?: ID;                   // Fehlerwerkstatt: welches frühere Ereignis
}

interface Schnappschuss {
  platzhalter: Record<string, unknown>;
  loesung: unknown;
  antwort: unknown;
}
```

**Bewertung für FSRS** (festgehalten im Ereignis, damit die Wiederholungsplanung reproduzierbar bleibt, auch wenn sich die Regel später ändert):

| Ergebnis | Hilfen | Bewertung |
|---|---|---|
| falsch, teilweise | – | `nochmal` |
| richtig | ≥ 1 | `schwer` |
| richtig | 0 | `gut` |

Die vierte FSRS-Stufe („leicht“) wird nicht genutzt; drei Stufen sind für Jugendliche verständlicher (T-5). Die Bearbeitungszeit fließt bewusst **nicht** in die Bewertung ein – langsames, sorgfältiges Arbeiten darf nicht schlechter bewertet werden.

### 4.2 `sitzung` – eine Lernsitzung

```ts
interface SitzungEreignis extends Ereignis {
  art: 'sitzung';
  beginn: number;
  ende: number;
  abschluss: 'regulaer' | 'nachgetragen';
  aufgaben: number;                  // ernsthaft bearbeitete Aufgaben
  aktivMs: number;                   // Zeit mit Interaktion, Pausen > 2 Min. abgezogen
  lerneinheit: boolean;              // Mindestumfang erreicht (BASEBAU §3.4)?
}
```

Die Sitzung wird **am Ende** geschrieben. Stürzt die App ab oder wird sie geschlossen, findet der nächste Start Aufgaben-Ereignisse ohne zugehörige Sitzung und schreibt sie mit `abschluss: 'nachgetragen'` nach.

**Entscheidung D-3: Auch nachgetragene Sitzungen zählen als Lerneinheit**, wenn der Mindestumfang erreicht wurde.
*Warum:* Leerer Akku oder ein geschlossener Browser-Tab sind kein Grund, erarbeiteten Fortschritt zu verweigern. Das präzisiert BASEBAU §3.4 („mit regulärem Sitzungsabschluss“) zugunsten der Lernenden.

### 4.3 `buchung` – Ressourcen-Ledger

```ts
interface BuchungEreignis extends Ereignis {
  art: 'buchung';
  ressource: 'stein' | 'erz' | 'bauplan' | 'bauschritt';
  menge: number;                     // positiv = Gutschrift, negativ = Abbuchung
  grund:
    | 'sitzung'                      // Stein, Erz, Bauschritt aus einer Sitzung
    | 'kompetenz-gefestigt'          // Bauplan
    | 'belagerung'                   // Bauplan (ab Phase 4)
    | 'bau-beginn'                   // Abbuchung
    | 'bau-abbruch'                  // Erstattung
    | 'zusammenfuehrung';            // Korrektur nach Import (s. 7.3)
  bezug: string;                     // Sitzungs-ID, "Kompetenz@Niveau" oder Bauvorhaben-ID
  aufschluesselung?: Record<string, number>;
  regel: number;                     // Version der Balancing-Regeln
}
```

**Entscheidung D-4: Gebucht wird pro Sitzung, nicht pro Aufgabe.** Eine Sitzung erzeugt höchstens drei Buchungen (Stein, Erz, Bauschritt), jeweils mit Aufschlüsselung, z. B.:

```json
{ "ressource": "stein", "menge": 19, "grund": "sitzung", "bezug": "01JB…",
  "aufschluesselung": { "aufgaben": 22, "voll": 16, "halb": 6, "geraten": 0 }, "regel": 1 }
```

*Warum:* Die Frage „Woher kommt das?“ (R-Transparenz) wird auf Sitzungsebene beantwortet – das ist für Jugendliche und Eltern verständlicher als tausende Einzelbuchungen. Und der Ledger bleibt klein genug, um ihn **nie verdichten zu müssen** (s. 8).

Die Gutschrift erfolgt beim Sitzungsabschluss. Während der Sitzung zeigt die Oberfläche einen vorläufigen Zähler, berechnet aus den Aufgaben-Ereignissen.

**Bauschritte im Ledger:** Bauschritte werden gutgeschrieben wie andere Ressourcen. Ihr Verbrauch folgt BASEBAU B-7 („wirkt auf jedes aktive Bauvorhaben“):
- Läuft mindestens ein Bauvorhaben, wird ein neuer Bauschritt **allen** aktiven Vorhaben angerechnet und nicht abgebucht.
- Läuft keines, bleibt er im Vorrat. Beim Beginnen eines Vorhabens wird der Vorrat bis zum Bedarf abgebucht (`grund: 'bau-beginn'`).

Das ist bewusst großzügig: Wer eine Zeit lang nur lernt und nicht baut, verliert nichts (R3).

### 4.4 `bau` – Aktionen in der Bastion

```ts
interface BauEreignis extends Ereignis {
  art: 'bau';
  aktion: 'beginnen' | 'abbrechen' | 'fertigstellen' | 'versetzen' | 'gestalten' | 'epoche';
  vorhaben?: ID;                     // bei beginnen/abbrechen/fertigstellen
  gebaeude: ID;                      // Instanz-ID des Gebäudes
  typ: string;                       // "wachturm"
  stufe?: number;                    // Zielstufe
  pos?: { x: number; y: number; drehung: 0 | 90 | 180 | 270 };
  gestaltung?: Record<string, string>;  // z. B. Bannerfarbe
}
```

`fertigstellen` wird geschrieben, sobald die nötigen Bauschritte erreicht sind. Das ist ableitbar, wird aber als Ereignis festgehalten, damit die Bastion-Geschichte („Am 12. März wurde der Bergfried Stufe 2 fertig“) ohne Neuberechnung erzählbar bleibt.

Geplante, aber nicht begonnene Gebäude existieren nur in der Oberfläche – Planen kostet nichts und hinterlässt keine Spuren.

### 4.5 `einstellung` – Einstellungen und Profilangaben

```ts
interface EinstellungEreignis extends Ereignis {
  art: 'einstellung';
  schluessel: string;                // "profil.spitzname", "eltern.tageslimitMin", "basebau.aktiv"
  wert: unknown;
  durch: 'jugendlich' | 'eltern';
}
```

**Entscheidung D-5: Auch Einstellungen sind Ereignisse.**
*Warum:*
- **Transparenz:** Jugendliche sehen ein Protokoll, *was* Eltern wann eingestellt haben („Am 3.11. wurde das Tageslimit auf 30 Minuten gesetzt“) – ohne Uhrzeit, ohne Wertverlauf bei geheimen Feldern (KONZEPT §10: Jugendliche sehen, was Eltern sehen können; hier gilt es auch umgekehrt).
- **Zusammenführen:** Pro Schlüssel gewinnt die jüngste Änderung – einfach und eindeutig.

Geräteweite Einstellungen (Sprache der Oberfläche, Farbschema) verwenden `profil: '*'`.

Die Eltern-PIN wird als PBKDF2-Hash mit Salz unter `eltern.pin` gespeichert. Im Protokoll erscheint nur „PIN geändert“.

### 4.6 `verdichtung` – Zusammenfassung alter Rohdaten

Siehe Abschnitt 8.

```ts
interface VerdichtungEreignis extends Ereignis {
  art: 'verdichtung';
  bis: Tag;                          // alle Aufgaben-Ereignisse bis einschließlich dieses Tages ersetzt
  karten: KartenStand[];             // FSRS-Zustand je Karte zum Stichtag
  kompetenzen: KompetenzStand[];     // Status je Kompetenz × Niveau zum Stichtag
  wochen: WochenStand[];             // Wochenzusammenfassungen bis zum Stichtag
  offeneFehler: AufgabeEreignis[];   // noch nicht korrigierte Fehler bleiben vollständig erhalten
}
```

## 5. Projektionen

| Projektion | Schlüssel | Inhalt | Quelle |
|---|---|---|---|
| `karten` | Profil × Vorlage × Niveau | FSRS-Zustand (Stabilität, Schwierigkeit, nächste Fälligkeit, letzte Wiederholung) | `aufgabe` mit Bewertung |
| `kompetenzen` | Profil × Kompetenz × Niveau | Status (neu … gefestigt, auffrischen), Datum „gekonnt“, Datum „gefestigt“ | `aufgabe`, `karten` |
| `wochen` | Profil × ISO-Woche | Anzahl Sitzungen, Lerneinheiten, Aufgaben, aktive Minuten, Kompetenzen gekonnt/gefestigt | `sitzung`, `kompetenzen` |
| `konto` | Profil | Stand je Ressource, Summe erworbener Baupläne, Bauschritt-Vorrat | `buchung` |
| `bastion` | Profil | Gebäude mit Typ, Stufe, Position, Gestaltung; aktive Vorhaben mit Fortschritt; Epoche | `bau`, `buchung` |
| `einstellungen` | Profil × Schlüssel | aktueller Wert | `einstellung` |

**Entscheidung D-6: Ereignis und Projektion werden in derselben Datenbank-Transaktion geschrieben.** Es gibt außerdem eine Funktion `neuAufbauen(profil)`, die alle Projektionen aus den Ereignissen neu berechnet.

**Pflicht-Test:** Für zufällig erzeugte Ereignisfolgen (fast-check) muss gelten: *inkrementell fortgeschriebene Projektion = neu aufgebaute Projektion.* Dieser Test ist das wichtigste Sicherheitsnetz des ganzen Datenmodells.

Neuaufbau wird automatisch ausgelöst nach Migrationen, nach Imports und auf Wunsch im Elternbereich („Daten neu berechnen“).

### 5.1 Was der Basebau sieht (K-1)

Der Basebau liest ausschließlich `konto`, `bastion` und die Liste gefestigter Kompetenzen (für die Studierstube, B-6). Technisch erzwungen durch die Ordnergrenzen in `src/core/bastion/`.

### 5.2 Was Eltern sehen

Der Elternbericht liest ausschließlich `kompetenzen` und `wochen`. **Nie** einzelne Aufgaben, Antworten, Fehler, Uhrzeiten oder Bearbeitungsdauern.

## 6. Speicherung in IndexedDB (Dexie)

```ts
db.version(1).stores({
  // Ereignisse
  aufgaben:     'id, [profil+ts], [profil+tag], [profil+vorlage+niveau], sitzung',
  sitzungen:    'id, [profil+ts], [profil+tag]',
  buchungen:    'id, [profil+ts], [profil+ressource]',
  bau:          'id, [profil+ts], gebaeude',
  einstellungen_ereignisse: 'id, [profil+schluessel+ts]',
  verdichtungen:'id, [profil+bis]',

  // Projektionen
  karten:       '[profil+vorlage+niveau], [profil+faellig]',
  kompetenzen:  '[profil+kompetenz+niveau], [profil+status]',
  wochen:       '[profil+woche]',
  konto:        'profil',
  bastion:      'profil',
  einstellungen:'[profil+schluessel]',

  // Verwaltung
  profile:      'id',
  pakete:       'id',            // Inhaltspakete (INHALTSFORMAT §10)
  meta:         'schluessel',    // schemaVersion, geraet, ...
  sicherungen:  'id, erstellt',  // automatische Sicherungen vor Migrationen
});
```

**Entscheidung D-7: Getrennte Tabellen je Ereignisart** statt einer gemeinsamen Ereignistabelle.
*Warum:* Aufgaben-Ereignisse sind um ein Vielfaches häufiger als alle anderen und brauchen andere Indizes. Getrennte Tabellen halten Abfragen schnell und Verdichtung einfach. Die gemeinsame Sicht „alle Ereignisse eines Profils nach Zeit“ entsteht im Kern durch Zusammenführen sortierter Listen.

### 6.1 Größenabschätzung

| | Pro Jahr (Profil P1: 4×/Woche, 15 Min.) |
|---|---|
| Aufgaben-Ereignisse | ~3 500 × ~250 Byte ≈ 0,9 MB |
| davon Schnappschüsse bei Fehlern | ~1 000 × ~300 Byte ≈ 0,3 MB |
| Sitzungen, Buchungen, Bau, Einstellungen | < 0,2 MB |
| **Summe** | **≈ 1,5 MB pro Jahr und Profil** |

Speicher ist also kein Grund zur Verdichtung – Datensparsamkeit ist es (s. 8).

### 6.2 Schemaversionen und Migrationen

**Entscheidung D-8: Erst sichern, dann migrieren.**
1. Vor jeder Migration schreibt die App eine vollständige Sicherung (unverschlüsselt, nur lokal) in die Tabelle `sicherungen`. Es bleiben die letzten zwei erhalten.
2. Die Migration läuft als Dexie-Upgrade in einer Transaktion und hebt alle betroffenen Ereignisse auf die neue Schemaversion (`v`).
3. Danach werden alle Projektionen neu aufgebaut.
4. Schlägt etwas fehl, bietet die App beim nächsten Start die Wiederherstellung aus der Sicherung an.

Jede Migration hat einen Test mit **echten Altständen** aus einem Testdaten-Archiv (`tests/altstaende/`), das ab Phase 1 mit jeder Schemaversion wächst.

Ereignisse werden durch Migrationen **in ihrer Form**, nie **in ihrer Bedeutung** geändert. Ein Ergebnis bleibt richtig, eine Buchung behält ihre Menge. Neue Balancing-Regeln wirken nur auf neue Buchungen (`regel`).

## 7. Export, Import und Zusammenführen

### 7.1 Exportformat

Eine Sicherungsdatei `.bastion` enthält:

```
Kopf (unverschlüsselt):  "BASTION" · Formatversion · Erstellt (Tag) · Salz · IV
Inhalt (verschlüsselt):  gzip( JSON { format, profile[], ereignisse[] } )
```

- **Nur Ereignisse und Profile**, keine Projektionen. Die Datei bleibt klein und widerspruchsfrei; das Zielgerät baut die Projektionen neu auf.
- Verschlüsselung: AES-GCM, Schlüssel per PBKDF2 aus dem Sicherungscode, alles über WebCrypto.
- Komprimierung über die eingebaute `CompressionStream`-Schnittstelle des Browsers.
- Zwei Varianten: **Profil-Sicherung** (ein Profil) und **Geräte-Sicherung** (alle Profile, nur im Elternbereich).

**Entscheidung D-9: Sicherungen sind immer verschlüsselt. Den Sicherungscode schlägt die App vor** – vier zufällige, leicht schreibbare deutsche Wörter. Ein eigener Code ist möglich, muss aber mindestens gleich stark sein.
*Warum:* Eine unverschlüsselte Datei mit der Lerngeschichte eines Kindes kann in Messenger-Chats, auf Schul-PCs oder in Cloud-Ordnern landen. Ein vorgeschlagener Wort-Code ist für 11-Jährige merkbar und abschreibbar, aber nicht zu erraten. Ehrlicher Hinweis in der App: *Ohne Code lässt sich die Sicherung nicht öffnen – auch nicht von uns.*

Elterneinstellungen und PIN-Hash reisen in der Profil-Sicherung mit. Eine Sicherung auf ein neues Gerät zu spielen, hebt Elterneinstellungen also nicht auf. (Ein neues, leeres Profil anzulegen, lässt sich lokal nicht verhindern – das ist die ehrliche Grenze aus ARCHITEKTUR §7.)

### 7.2 Import

| Fall | Verhalten |
|---|---|
| Profil existiert auf dem Gerät nicht | Wird angelegt |
| Profil existiert (gleiche ID) | **Zusammenführen** (7.3) |
| Sicherung ist älter als der aktuelle Stand | Zusammenführen – es geht nichts verloren, es kommt nur hinzu, was fehlt |
| Andere Formatversion | Wird beim Import auf das aktuelle Schema gehoben (gleiche Upgrade-Funktionen wie 6.2) |

Vor jedem Import wird automatisch eine Sicherung angelegt (wie D-8).

### 7.3 Zusammenführen

**Entscheidung D-10: Zusammenführen ist die Vereinigung der Ereignismengen.** Ereignisse mit gleicher ID gelten als identisch. Danach werden alle Projektionen neu aufgebaut.
*Warum:* Weil Ereignisse unveränderlich sind und eindeutige IDs haben, kann beim Vereinigen nichts verloren gehen und nichts doppelt zählen. Das ist das einfachste Verfahren, das nachweisbar korrekt ist – wichtig für ein Ein-Personen-Projekt.

Drei Sonderfälle:

1. **Einstellungen:** Pro Schlüssel gewinnt die jüngste Änderung (`ts`). Bei gleichem Zeitstempel gewinnt die Elternänderung.
2. **Konkurrierende Bauvorhaben:** Wurden auf zwei Geräten mit denselben Ressourcen verschiedene Vorhaben begonnen, kann der Kontostand nach dem Zusammenführen negativ werden. Dann werden die *zuletzt begonnenen* Vorhaben automatisch abgebrochen (mit voller Erstattung, B-8), bis der Stand wieder ≥ 0 ist. Die App zeigt an, was passiert ist. Es geht nichts verloren; ein Vorhaben muss nur neu begonnen werden.
3. **Tagesgrenzen:** Wurde am selben Lerntag auf zwei Geräten gelernt, können mehr als 2 Bauschritte oder mehr als 30 Erz für diesen Tag im Ledger stehen. Das wird **akzeptiert** und nicht korrigiert.
   *Warum:* Es ist selten, die Abweichung ist klein, und rückwirkendes Kürzen wäre ein Verlust (R3).

Doppelt gebuchte Baupläne (dieselbe Kompetenz auf zwei Geräten gefestigt) werden dagegen erkannt: Pro `Kompetenz@Niveau` zählt nur die früheste Buchung; spätere werden durch eine Korrekturbuchung (`grund: 'zusammenfuehrung'`) ausgeglichen – aber nur, wenn dieser Bauplan noch nicht verbaut ist. Ist er verbaut, bleibt es dabei.

### 7.4 QR-Übertragung (Phase 3)

Nutzt dasselbe Format wie 7.1, aufgeteilt in eine Folge von QR-Codes. Für große Stände bleibt die Datei der empfohlene Weg. Einzelheiten werden in Phase 3 festgelegt.

## 8. Verdichtung

**Entscheidung D-11: Rohe Aufgaben-Ereignisse werden nach 12 Monaten verdichtet.**

Einmal im Monat prüft die App, ob es Aufgaben-Ereignisse gibt, die älter als 12 Monate sind. Dann:
1. Ein `verdichtung`-Ereignis hält den Stand zum Stichtag fest: FSRS-Zustand aller Karten, Status aller Kompetenzen, Wochenzusammenfassungen.
2. Noch **nicht korrigierte Fehler** bleiben vollständig erhalten (Fehlerwerkstatt, R6).
3. Alle übrigen Aufgaben-Ereignisse bis zum Stichtag werden gelöscht.
4. Projektionen bauen ab jetzt auf der jüngsten Verdichtung plus späteren Ereignissen auf.

Nicht verdichtet werden: Sitzungen, Buchungen, Bau- und Einstellungs-Ereignisse. Sie sind klein und tragen die Geschichte der Bastion.

*Warum 12 Monate:* Ein Schuljahr plus Puffer. Danach braucht weder die Wiederholungsplanung (der FSRS-Zustand trägt alles Nötige) noch die Fehlerwerkstatt die einzelnen Aufgaben. Eine jahrelange, sekundengenaue Protokollierung jeder Antwort eines Kindes wäre durch keine Funktion gerechtfertigt.

*Zusammenführen und Verdichtung:* Trifft beim Import ein bereits verdichteter Zeitraum auf rohe Ereignisse desselben Zeitraums, gewinnt die Verdichtung; die rohen Ereignisse werden verworfen. Die Verdichtung enthält deren Wirkung bereits.

## 9. Löschen

| Aktion | Wer | Wirkung |
|---|---|---|
| Profil löschen | Eltern (PIN), bei Stufe „selbstverwaltet“ der Nutzer selbst | Alle Ereignisse, Projektionen und automatischen Sicherungen dieses Profils werden entfernt |
| Alles löschen | Eltern (PIN) | Datenbank wird vollständig geleert |
| Elternzugriff entfernen | Nutzer in Stufe „selbstverwaltet“ | Eltern-PIN und Elterneinstellungen werden entfernt (K-4) |

Bereits exportierte Sicherungsdateien liegen außerhalb der App und können von ihr nicht gelöscht werden. Darauf weist der Löschdialog hin.

### 9.1 PIN vergessen

**Entscheidung D-12: Beim Festlegen der PIN zeigt die App einmalig einen Wiederherstellungscode** (vier Wörter, wie D-9) zum Aufschreiben. Mit diesem Code lässt sich die PIN zurücksetzen. Ohne ihn bleibt nur: Profil-Sicherung erstellen lassen, App zurücksetzen, Sicherung einspielen – dann gelten die alten Elterneinstellungen weiter, und eine neue PIN wird festgelegt.
*Warum:* Ein „PIN vergessen“-Knopf ohne Hürde würde den Elternbereich für jeden Jugendlichen in zwei Klicks öffnen. Ein Code, der bei den Eltern liegt, ist die einfachste ehrliche Lösung ohne Server.

## 10. Datenschutz-Prüfung

| Daten | Zweck | Aufbewahrung | Sieht der Jugendliche | Sehen Eltern | Verlässt das Gerät |
|---|---|---|---|---|---|
| Spitzname, Avatar | Anrede, Profilwahl | bis Löschung | ja | ja | nur im Export |
| Klassenstufe, Schulform (freiwillig) | Startvorschlag Diagnose | bis Löschung | ja | ja | nur im Export |
| Einzelne Antworten, Bearbeitungszeit | Wiederholungsplanung, Ernsthaftigkeitsregel, Status | **12 Monate**, dann verdichtet | eigene Fehler in der Fehlerwerkstatt | **nein** | nur im Export |
| Fehler-Schnappschüsse | Fehlerwerkstatt | bis korrigiert bzw. Verdichtung | ja | **nein** | nur im Export |
| FSRS-Zustand je Vorlage | Wiederholungsplanung | bis Löschung | indirekt (fällige Wiederholungen) | nein | nur im Export |
| Kompetenzstatus | Fortschritt, Portfolio, Bauplan | bis Löschung | ja | ja | nur im Export |
| Wochenzusammenfassungen | Elternbericht, Wochenrückblick | bis Löschung | ja | ja | nur im Export |
| Sitzungen (Tag, Dauer, Umfang) | Lerneinheiten, Zeitsystem | bis Löschung | ja | nur als Wochensumme | nur im Export |
| Ledger, Bau-Ereignisse | Bastion | bis Löschung | ja | nein (nur ob Basebau aktiv) | nur im Export |
| Einstellungen und Protokoll | Zeitsystem, Elternbereich, Transparenz | bis Löschung | ja (ohne geheime Werte) | ja | nur im Export |
| PIN-Hash, Wiederherstellungs-Hash | Elternbereich | bis Löschung | nein | nein (nur Prüfung) | nur im Export |
| Geräte-ID (Zufall) | Zusammenführen | bis Neuinstallation | nein | nein | nur im Export |

**Bewusst nicht erhoben:** echter Name, Geburtsdatum, Wohnort, Schule, E-Mail, Telefonnummer, Standort, Geräteinformationen, Uhrzeiten in Berichten, Nutzungsstatistiken für die Entwickler.

**Bewusst nicht gezeigt:** Eltern sehen keine einzelnen Antworten, keine Fehler, keine Uhrzeiten und keine Bearbeitungszeiten. Das schützt den Raum, in dem Jugendliche Fehler machen dürfen (R6).

## 11. Offene Punkte

| ID | Frage | Tendenz |
|---|---|---|
| D-O1 | ULID-Bibliothek oder eigene kleine Umsetzung im Kern? | Eigene Umsetzung (wenige Zeilen, keine Abhängigkeit) |
| D-O2 | FSRS-Parameter persönlich anpassen (Optimierer) | Nicht vor Phase 4; braucht viele Wiederholungen pro Person |
| D-O3 | Wortliste für Sicherungs- und Wiederherstellungscodes | Eigene Liste mit ~2 000 kindgerechten, eindeutigen deutschen Wörtern |
| D-O4 | Wie oft an Sicherungen erinnern? | Monatlich, im Elternbereich einstellbar (T-1) |

## 12. Entscheidungen dieses Dokuments

| ID | Entscheidung | Status |
|---|---|---|
| D-1 | Kein Geburtsdatum, kein echter Name; Elternstufe wird eingestellt | Entschieden |
| D-2 | Lerntag beginnt um 4:00 Uhr, wird beim Schreiben festgehalten | Entschieden |
| D-3 | Nachgetragene Sitzungen zählen als Lerneinheit | Entschieden |
| D-4 | Ledger bucht pro Sitzung mit Aufschlüsselung | Entschieden |
| D-5 | Einstellungen sind Ereignisse; Protokoll für Jugendliche sichtbar | Entschieden |
| D-6 | Ereignis und Projektion in einer Transaktion; Neuaufbau jederzeit möglich, per Test abgesichert | Entschieden |
| D-7 | Getrennte Tabellen je Ereignisart | Entschieden |
| D-8 | Erst sichern, dann migrieren | Entschieden |
| D-9 | Sicherungen immer verschlüsselt, Wort-Code von der App vorgeschlagen | Entschieden |
| D-10 | Zusammenführen = Vereinigung der Ereignismengen | Entschieden |
| D-11 | Rohe Aufgaben-Ereignisse nach 12 Monaten verdichten | Entschieden |
| D-12 | Wiederherstellungscode für die Eltern-PIN | Entschieden |
