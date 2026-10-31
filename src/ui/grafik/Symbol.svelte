<script lang="ts" module>
  // Kleine Symbole für Leiste und Kacheln (GRAFIK §1). Strich in der Textfarbe,
  // rein schmückend: Der Name steht immer daneben.
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
    | 'hinterhof';
</script>

<script lang="ts">
  let { name }: { name: SymbolName } = $props();

  /** Gefüllte Formen (Zahnrad): Strichpfade sähen sonst wie eine Sonne aus. */
  const GEFUELLT: ReadonlySet<SymbolName> = new Set(['einstellungen']);

  const PFADE: Record<SymbolName, string> = {
    start: 'M3 11.5 12 4l9 7.5M5.5 9.5V20h5v-5.5h3V20h5V9.5',
    ueben: 'M4 20h4L19.5 8.5a2.1 2.1 0 0 0-3-3L5 17v3ZM14.5 7.5l3 3',
    bastion: 'M4 21V9h3v3h3V9h4v3h3V9h3v12ZM10 21v-4a2 2 0 0 1 4 0v4M4 9V5m0 0h3',
    stand: 'M4 20V4M4 20h16M8 16v-4M12 16V8M16 16v-6',
    wiederholen: 'M4 12a8 8 0 0 1 14-5.3L20 8M20 4v4h-4M20 12a8 8 0 0 1-14 5.3L4 16m0 4v-4h4',
    // Glühbirne: Aus Fehlern wird ein Aha (R6)
    werkstatt:
      'M9.5 18h5M10.5 21h3M12 3a6 6 0 0 0-3.6 10.8c.7.6 1.1 1.3 1.1 2.2v.5h5V16c0-.9.4-1.6 1.1-2.2A6 6 0 0 0 12 3Z',
    mehr: 'M4 7h16M4 12h16M4 17h16',
    diagnose: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Zm3.5 5.5-2 5-5 2 2-5 5-2Z',
    // Zahnrad gefüllt mit Naben-Loch (evenodd): klare Zähne, keine Strahlen = keine Sonne
    einstellungen:
      'M9.5 2.2h5v2.3l1.7.7 1.6-1.6 3.5 3.5-1.6 1.6.7 1.7H22.5v5h-2.3l-.7 1.7 1.6 1.6-3.5 3.5-1.6-1.6-1.7.7V22.5h-5v-2.3l-1.7-.7-1.6 1.6-3.5-3.5 1.6-1.6-.7-1.7H1.5v-5h2.3l.7-1.7-1.6-1.6 3.5-3.5 1.6 1.6 1.7-.7V2.2zm2.5 6.3a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7z',
    // Hinterhof: kleiner Zaun / Beet
    hinterhof: 'M4 18V9l4-3 4 3v9M12 18V9l4-3 4 3v9M4 18h16M8 12v2M8 15v2M16 12v2M16 15v2',
  };
</script>

<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" class:gefuellt={GEFUELLT.has(name)}>
  <path d={PFADE[name]} fill-rule="evenodd" />
</svg>

<style>
  svg {
    inline-size: 1.5rem;
    block-size: 1.5rem;
    fill: none;
    stroke: currentColor;
    stroke-width: 2;
    stroke-linecap: round;
    stroke-linejoin: round;
    flex: none;
  }

  svg.gefuellt {
    fill: currentColor;
    stroke: none;
  }
</style>
