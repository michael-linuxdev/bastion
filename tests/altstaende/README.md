# Altstände

Echte Datenbank-Stände älterer Schemaversionen (DATENMODELL §6.2). Jede Migration
wird damit getestet: Altstand in eine Datenbank der alten Version schreiben,
mit der aktuellen App öffnen, prüfen, dass nichts verloren geht.

| Datei | Schemaversion | Inhalt |
|---|---|---|
| `schema-1.json` | 1 | ein Profil, eine richtige und eine falsche Aufgabe, eine Sitzung, eine Buchung, eine Einstellung |
| `schema-2.json` | 2 | ein Profil, zwei Vermittlungs-Ereignisse (Antwort mit Fehlvorstellung, Abschluss), eine falsche Aufgabe mit Zwischenschritten (`v` = 2), Sitzung, Buchungen |

Die Dateien enthalten nur ausgedachte Testdaten, keine Daten echter Personen.
