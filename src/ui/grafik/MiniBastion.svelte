<script lang="ts">
  // Kleine Ansicht der Bastion für die Startseite (GRAFIK §1): Insel schräg von
  // oben, Himmel mit Sonne – am Abend (dunkel) mit erleuchteten Fenstern.
  // Nur Bild, keine Daten; die Farben kommen aus der Fassung.
</script>

<svg
  viewBox="0 0 240 120"
  aria-hidden="true"
  focusable="false"
  preserveAspectRatio="xMidYMax slice"
>
  <rect width="240" height="120" style="fill: var(--farbe-himmel)" />
  <circle cx="196" cy="40" r="13" style="fill: var(--farbe-licht)" />
  <ellipse cx="62" cy="44" rx="20" ry="6" class="wolke" />
  <ellipse cx="80" cy="40" rx="14" ry="6" class="wolke" />
  <!-- Insel: Oberseite und Rand -->
  <path d="M30 92 120 64l90 28-90 28Z" style="fill: var(--bastion-boden)" />
  <path d="M30 92v6l90 28v-6Z" style="fill: var(--bastion-raster)" />
  <path d="M210 92v6l-90 28v-6Z" style="fill: var(--bastion-zierde)" />
  <!-- Turm: zwei Seitentöne, Dach warm -->
  <path d="M100 96V60l20 6v36Z" style="fill: var(--bastion-verteidigung)" />
  <path d="M140 96V60l-20 6v36Z" style="fill: var(--bastion-raster)" />
  <path d="M97 61 120 38l23 23-23 7Z" style="fill: var(--farbe-akzent-warm)" />
  <rect
    x="106"
    y="72"
    width="6"
    height="9"
    rx="3"
    style="fill: var(--farbe-licht)"
    class="fenster"
  />
  <rect
    x="127"
    y="72"
    width="6"
    height="9"
    rx="3"
    style="fill: var(--farbe-licht)"
    class="fenster"
  />
  <!-- Haus daneben -->
  <path d="M150 100V86l14 4v14Z" style="fill: var(--bastion-verteidigung)" />
  <path d="M178 100V86l-14 4v14Z" style="fill: var(--bastion-raster)" />
  <path d="M148 87 164 76l16 11-16 5Z" style="fill: var(--farbe-akzent-warm-hell)" />
</svg>

<style>
  svg {
    display: block;
    inline-size: 100%;
    block-size: 100%;
  }
  .wolke {
    fill: var(--farbe-flaeche);
    opacity: 0.85;
  }
  :global([data-modus='dunkel']) .wolke {
    opacity: 0.15;
  }
  :global([data-modus='hell']) .fenster {
    opacity: 0.35;
  }
</style>
