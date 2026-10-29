// Werkzeuge der Erstvermittlung (VERMITTLUNG §2.3): ID im Inhalt → Darstellung.
// Die Liste der IDs steht im Kern (WERKZEUGE); ein Test hält beide gleich.
import type { Component } from 'svelte';
import Bruchstreifen from './Bruchstreifen.svelte';
import Zahlenstrahl from './Zahlenstrahl.svelte';

// Parameter kommen ungeprüft aus dem Inhalt; jede Komponente prüft sie selbst.
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- Komponenten mit verschiedenen Props
export const WERKZEUG_KOMPONENTEN: Readonly<Record<string, Component<any>>> = {
  'bruchstreifen@1': Bruchstreifen,
  'zahlenstrahl@1': Zahlenstrahl,
};

export const WERKZEUG_NAMEN = Object.keys(WERKZEUG_KOMPONENTEN);
