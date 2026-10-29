import { mount } from 'svelte';
import App from './ui/App.svelte';
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

const app = mount(App, { target: ziel });

offlineStarten();
void dauerhaftenSpeicherAnfragen();

export default app;
