import { mount } from 'svelte';
import App from './ui/App.svelte';
import DruckSeite from './ui/eltern/DruckSeite.svelte';
import { offlineStarten } from './ui/plattform/offline.svelte';
import { dauerhaftenSpeicherAnfragen } from './ui/plattform/speicher';
import { sprache, t } from './ui/texte/texte';
import { darstellungSetzen } from './ui/grafik/darstellung.svelte';
import './ui/grund.css';

document.documentElement.lang = sprache.code;
document.documentElement.dir = sprache.richtung;
document.title = t('app.titel');

// Erst wie das System; die gespeicherte Wahl setzt die App beim Laden (GRAFIK §2)
darstellungSetzen('system');

const ziel = document.getElementById('app');
if (!ziel) {
  throw new Error('Element #app fehlt in index.html');
}

// Eigene Druckseite für ein Aufgabenblatt (?blatt=…): ohne App-Rahmen, ohne PIN, ohne Daten.
// Nötig, weil die auf dem iPhone installierte App nicht drucken kann (Elternbereich, B2).
const druck = new URLSearchParams(location.search).get('blatt') === '1';
const app = druck
  ? mount(DruckSeite, { target: ziel, props: { abfrage: location.search } })
  : mount(App, { target: ziel });

offlineStarten();
void dauerhaftenSpeicherAnfragen();

export default app;
