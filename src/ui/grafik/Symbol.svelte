<script lang="ts" module>
  // Kleine Symbole für Leiste und Kacheln (GRAFIK §1). Strich in der Textfarbe,
  // rein schmückend: Der Name steht immer daneben.
  export type SymbolName =
    'start' | 'ueben' | 'bastion' | 'stand' | 'wiederholen' | 'werkstatt' | 'diagnose' | 'mehr';
</script>

<script lang="ts">
  let { name }: { name: SymbolName } = $props();

  const PFADE: Record<SymbolName, string> = {
    start: 'M3 11.5 12 4l9 7.5M5.5 9.5V20h5v-5.5h3V20h5V9.5',
    ueben: 'M4 20h4L19.5 8.5a2.1 2.1 0 0 0-3-3L5 17v3ZM14.5 7.5l3 3',
    bastion: 'M4 21V9h3v3h3V9h4v3h3V9h3v12ZM10 21v-4a2 2 0 0 1 4 0v4M4 9V5m0 0h3',
    stand: 'M4 20V4M4 20h16M8 16v-4M12 16V8M16 16v-6',
    wiederholen: 'M4 12a8 8 0 0 1 14-5.3L20 8M20 4v4h-4M20 12a8 8 0 0 1-14 5.3L4 16m0 4v-4h4',
    werkstatt:
      'M14.5 6.5a4 4 0 0 0 5 5l-8.5 8.5a2.1 2.1 0 0 1-3-3l8.5-8.5a4 4 0 0 0-2-2ZM6 6l3 3M4 4l2 2',
    mehr: 'M4 7h16M4 12h16M4 17h16',
    diagnose: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Zm3.5 5.5-2 5-5 2 2-5 5-2Z',
  };
</script>

<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
  <path d={PFADE[name]} />
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
</style>
