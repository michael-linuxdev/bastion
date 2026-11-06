// Werkzeuge der Erstvermittlung (VERMITTLUNG §2.3): ID im Inhalt → Darstellung.
// Die Liste der IDs steht im Kern (WERKZEUGE); ein Test hält beide gleich.
import type { Component } from 'svelte';
import Anleitungsbild from './Anleitungsbild.svelte';
import Bruchstreifen from './Bruchstreifen.svelte';
import Dreieck from './Dreieck.svelte';
import Einheitentafel from './Einheitentafel.svelte';
import Einheitskreis from './Einheitskreis.svelte';
import Flaeche from './Flaeche.svelte';
import Geraden from './Geraden.svelte';
import Gitter from './Gitter.svelte';
import Graph from './Graph.svelte';
import Histogramm from './Histogramm.svelte';
import Koerpernetz from './Koerpernetz.svelte';
import Quader from './Quader.svelte';
import Stabdiagramm from './Stabdiagramm.svelte';
import Uhr from './Uhr.svelte';
import Winkel from './Winkel.svelte';
import Zahlenstrahl from './Zahlenstrahl.svelte';

// Parameter kommen ungeprüft aus dem Inhalt; jede Komponente prüft sie selbst.
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- Komponenten mit verschiedenen Props
export const WERKZEUG_KOMPONENTEN: Readonly<Record<string, Component<any>>> = {
  'anleitungsbild@1': Anleitungsbild,
  'bruchstreifen@1': Bruchstreifen,
  'dreieck@1': Dreieck,
  'einheitentafel@1': Einheitentafel,
  'einheitskreis@1': Einheitskreis,
  'flaeche@1': Flaeche,
  'geraden@1': Geraden,
  'gitter@1': Gitter,
  'graph@1': Graph,
  'histogramm@1': Histogramm,
  'koerpernetz@1': Koerpernetz,
  'quader@1': Quader,
  'stabdiagramm@1': Stabdiagramm,
  'uhr@1': Uhr,
  'winkel@1': Winkel,
  'zahlenstrahl@1': Zahlenstrahl,
};

export const WERKZEUG_NAMEN = Object.keys(WERKZEUG_KOMPONENTEN);
