# Bastion-Sound (GRAFIK §4.6, T-18)

Optional, Standard **aus**. Dateien liegen **lokal im Bundle** (kein CDN).
Der Loader in `src/ui/bastion/sound/` bevorzugt diese Dateien; fehlt etwas,
greift der bisherige Web-Audio-Fallback (prozedural).

## Dateien

| Rolle | Datei | Quelle |
|---|---|---|
| Tip bauen | `tip-bauen.ogg` | Kenney Interface Sounds (`confirmation_001.wav`), CC0 |
| Tip Wesen | `tip-wesen.ogg` | Kenney Interface Sounds (`pluck_001.wav`), CC0 |
| Tip aufstellen | `tip-aufstellen.ogg` | Kenney Interface Sounds (`drop_002.wav`), CC0 |
| Ambient Wind | `ambient-wind.ogg` | Eigenes leises Rauschen, CC0 |

Liste und Quellen: `manifest.json`. Kenney-Lizenztext: `KENNEY-LICENSE.txt`.

## Hinweise

- Nur Bastion / Hinterhof – nicht in der Lern-UI.
- Lautstärke bewusst niedrig (ruhige Atmosphäre, VISION).
- Weitere Ambient-Varianten (Wasser, Regen) dürfen später ergänzt werden;
  Lizenz vor Einbau prüfen (CC0 o. Ä.).
