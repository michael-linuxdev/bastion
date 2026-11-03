<script lang="ts" module>
  // Kleine Symbole für Hub, HUD und Bau (GRAFIK §1, Design-Ideen G28).
  // Strich in der Textfarbe, rein schmückend: Der Name steht immer daneben.
  export type SymbolName =
    | 'start'
    | 'ueben'
    | 'bastion'
    | 'stand'
    | 'wiederholen'
    | 'werkstatt'
    | 'diagnose'
    | 'mehr'
    | 'einstellungen'
    | 'hinterhof'
    | 'stein'
    | 'erz'
    | 'bauplan'
    | 'beutel'
    | 'bauen'
    | 'planen'
    | 'eltern'
    | 'frage'
    | 'zurueck'
    | 'buch'
    | 'person'
    | 'sicherung'
    | 'kalender';
</script>

<script lang="ts">
  let { name }: { name: SymbolName } = $props();

  // O4 (Wunsch PV, 03.11.2026): ein Satz aus einem Guss – 24er-Raster, Inhalt zwischen 3 und 21,
  // nur Striche (keine Flächen), runde Enden und Ecken, gleiche Strichstärke für alle.
  const PFADE: Record<SymbolName, string> = {
    start: 'M4 10.5 12 4l8 6.5V19a1 1 0 0 1-1 1h-4.5v-5.5h-5V20H5a1 1 0 0 1-1-1Z',
    ueben: 'M15.5 4.5a2.1 2.1 0 0 1 3 0l1 1a2.1 2.1 0 0 1 0 3L9 19l-4.5 1 1-4.5ZM14 6l4 4',
    bastion: 'M5 20V9h2.5v2H10V9h4v2h2.5V9H19v11ZM10 20v-3.5a2 2 0 0 1 4 0V20M5 9V4l3.5 1.5L5 7',
    stand: 'M4 4v15a1 1 0 0 0 1 1h15M8.5 16v-3M12.5 16V8.5M16.5 16v-6',
    wiederholen: 'M19.5 10A8 8 0 0 0 5.5 7M4.5 3.5V7.5h4M4.5 14a8 8 0 0 0 14 3M19.5 20.5v-4h-4',
    // Glühbirne: Aus Fehlern wird ein Aha (R6)
    werkstatt:
      'M9.5 18h5M10.5 21h3M12 3a6 6 0 0 0-3.6 10.8c.7.6 1.1 1.3 1.1 2.2v.5h5V16c0-.9.4-1.6 1.1-2.2A6 6 0 0 0 12 3Z',
    // Vier Felder: „Mehr“ als Sammlung, nicht als Liste
    mehr: 'M5 4h4a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1ZM15 4h4a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1h-4a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1ZM5 14h4a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-4a1 1 0 0 1 1-1ZM15 14h4a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1h-4a1 1 0 0 1-1-1v-4a1 1 0 0 1 1-1Z',
    diagnose: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18ZM15.5 8.5l-2 5-5 2 2-5 5-2Z',
    // Regler statt Zahnrad: als Strich klarer, sieht nicht wie eine Sonne aus
    einstellungen:
      'M4 6.5h9M17 6.5h3M15 4.5a2 2 0 1 0 0 4 2 2 0 0 0 0-4ZM4 12h2M10 12h10M8 10a2 2 0 1 0 0 4 2 2 0 0 0 0-4ZM4 17.5h9M17 17.5h3M15 15.5a2 2 0 1 0 0 4 2 2 0 0 0 0-4Z',
    // Hinterhof: kleiner Zaun / Beet
    hinterhof: 'M4 18V9l4-3 4 3v9M12 18V9l4-3 4 3v9M4 18h16M8 12v2M8 15v2M16 12v2M16 15v2',
    // Material-Metapher für den Vorrat (Design B6)
    stein: 'M4 14 8 6h8l4 8-4 4H8l-4-4Z',
    erz: 'M12 3 5 8v8l7 5 7-5V8l-7-5Zm0 5v11',
    bauplan: 'M6 4h9l3 3v13H6V4Zm9 0v3h3M9 11h6M9 15h6M9 19h4',
    beutel:
      'M9 8V7a3 3 0 0 1 6 0v1M6.5 8h11l-.9 10.9a1.5 1.5 0 0 1-1.5 1.4H8.9a1.5 1.5 0 0 1-1.5-1.4Z',
    bauen: 'M4 20h16M7 20V10l5-4 5 4v10M10 20v-5h4v5',
    planen: 'M5 4h11l3 3v13H5V4Zm11 0v3h3M8 12h5M8 16h8M14 12l2 2-2 2',
    eltern:
      'M9 11a3.25 3.25 0 1 0 0-6.5 3.25 3.25 0 0 0 0 6.5ZM3.5 20v-.5a5 5 0 0 1 5-5h1a5 5 0 0 1 5 5v.5M16 4.7a3.25 3.25 0 0 1 0 6.1M18 14.8a5 5 0 0 1 2.5 4.4v.8',
    person: 'M12 11.5a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM5 20.5V20a6 6 0 0 1 6-6h2a6 6 0 0 1 6 6v.5',
    // Sicherung: Stand in die Ablage legen
    sicherung: 'M12 3.5v10.5M8 10l4 4 4-4M4 15v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3',
    kalender:
      'M6 5h12a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2ZM4 10h16M8.5 3v4M15.5 3v4M8 14h2M14 14h2',
    frage:
      'M12 17.5h.01M9.1 9a3 3 0 1 1 4.7 2.5c-.8.6-1.3 1.1-1.3 2v.5M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Z',
    zurueck: 'M11 5 4 12l7 7M4 12h16',
    // Offenes Buch: Erklärung neben dem Titel
    buch: 'M12 6.5C10.5 5.2 8.3 4.5 4 4.5V18c4.3 0 6.5.7 8 2 1.5-1.3 3.7-2 8-2V4.5c-4.3 0-6.5.7-8 2ZM12 6.5V20',
  };
</script>

<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
  <path d={PFADE[name]} fill-rule="evenodd" />
</svg>

<style>
  /* Z126: einheitliche Strichstärke Hub/Üben/Bastion/Mehr */
  svg {
    inline-size: 1.5rem;
    block-size: 1.5rem;
    fill: none;
    stroke: currentColor;
    stroke-width: 1.75;
    stroke-linecap: round;
    stroke-linejoin: round;
    flex: none;
  }
</style>
