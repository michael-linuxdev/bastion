<script lang="ts">
  // Kleine Ansicht der Bastion für die Startseite (GRAFIK §1): Insel schräg von
  // oben, Himmel mit Sonne – am Abend (dunkel) mit erleuchteten Fenstern.
  // Im Thema Dorf dieselbe Karte, aber mit den Dorfbildern (GRAFIK §6):
  // Wiese, Gemeindehaus mit rotem Dach, Baum und Zaun.
  // Im Thema Garten: Wiese, Teich, Baumhaus und ein Zwerg (GRAFIK §7), ohne Bewegung.
  // Nur Bild, keine Daten; die Farben der Insel kommen aus der Fassung.
  import { aktiv } from '../bastion/thema.svelte';
</script>

{#if aktiv.thema === 'dorf'}
  <svg
    viewBox="0 0 240 120"
    aria-hidden="true"
    focusable="false"
    preserveAspectRatio="xMidYMax slice"
  >
    <rect width="240" height="120" style="fill: var(--farbe-himmel)" />
    <circle cx="206" cy="22" r="11" style="fill: var(--farbe-licht)" />
    <ellipse cx="40" cy="28" rx="16" ry="5" class="wolke" />
    <ellipse cx="54" cy="25" rx="11" ry="5" class="wolke" />
    <!-- Unten im Bild, damit Dach und Fahne auch auf der flachen Startkarte bleiben -->
    <path d="M28 102 120 78l92 24-92 16Z" class="wiese" />
    <path d="M28 102v4l92 16v-4Z" class="wiese-rand" />
    <path d="M212 102v4l-92 16v-4Z" class="wiese-rand-vorn" />
    <rect x="52" y="90" width="4" height="12" fill="#6d4a2e" />
    <circle cx="54" cy="86" r="9" fill="#2d6a3c" />
    <circle cx="49" cy="84" r="5" fill="#3f874c" />
    <path d="M100 100V80l24 6v20Z" fill="#a4927a" />
    <path d="M148 100V80l-24 6v20Z" fill="#b7a48c" />
    <path d="M97 81 124 68l27 13-27 6Z" class="dach" />
    <path d="M124 68v-12" stroke="#f4efe4" stroke-width="2" />
    <path d="M124 56l11 3.5-11 3.5Z" fill="#3dbea5" />
    <rect x="108" y="86" width="5" height="7" rx="1" class="luke" />
    <rect x="132" y="86" width="5" height="7" rx="1" class="luke" />
    <g class="pfaehle">
      <rect x="168" y="104" width="4" height="10" />
      <path d="M166 104l4-5 4 5Z" />
      <rect x="176" y="106" width="4" height="10" />
      <path d="M174 106l4-5 4 5Z" />
      <rect x="184" y="108" width="4" height="10" />
      <path d="M182 108l4-5 4 5Z" />
    </g>
  </svg>
{:else if aktiv.thema === 'garten'}
  <svg
    viewBox="0 0 240 120"
    aria-hidden="true"
    focusable="false"
    preserveAspectRatio="xMidYMax slice"
  >
    <rect width="240" height="120" style="fill: var(--farbe-himmel)" />
    <circle cx="206" cy="22" r="11" style="fill: var(--farbe-licht)" />
    <ellipse cx="40" cy="28" rx="16" ry="5" class="wolke" />
    <ellipse cx="54" cy="25" rx="11" ry="5" class="wolke" />
    <path d="M28 102 120 78l92 24-92 16Z" class="wiese" />
    <path d="M28 102v4l92 16v-4Z" class="wiese-rand" />
    <path d="M212 102v4l-92 16v-4Z" class="wiese-rand-vorn" />
    <path d="M48 92 70 86l22 6-22 6Z" class="teich" />
    <ellipse cx="78" cy="90" rx="6" ry="2.4" class="blatt" />
    <rect x="118" y="78" width="5" height="22" fill="#6d4a2e" />
    <circle cx="120" cy="72" r="12" fill="#2f6b3a" />
    <circle cx="112" cy="76" r="7" fill="#3f8748" />
    <path d="M108 74h24l-4 8h-16Z" fill="#c4a574" />
    <path d="M106 74 120 64l14 10Z" fill="#c4603a" />
    <rect x="116" y="76" width="6" height="5" class="luke" />
    <circle cx="168" cy="108" r="4" fill="#f3c7a1" />
    <path d="M164 106h8l-4-8Z" fill="#c0392b" />
    <rect x="166" y="108" width="4" height="6" fill="#3d6b4f" />
  </svg>
{:else}
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
{/if}

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
  .wiese {
    fill: #5b9342;
  }
  .wiese-rand {
    fill: #3f6d32;
  }
  .wiese-rand-vorn {
    fill: #2f5528;
  }
  .dach {
    fill: #8d3a34;
  }
  .luke {
    fill: #3a2a16;
  }
  .pfaehle {
    fill: #7b5a3c;
  }
  .pfaehle path {
    fill: #a67c52;
  }
  :global([data-modus='dunkel']) .wiese {
    fill: #243c2c;
  }
  :global([data-modus='dunkel']) .wiese-rand {
    fill: #1a2e22;
  }
  :global([data-modus='dunkel']) .wiese-rand-vorn {
    fill: #14241c;
  }
  :global([data-modus='dunkel']) .luke {
    fill: var(--farbe-licht);
  }
  .teich {
    fill: #3d8eb4;
  }
  .blatt {
    fill: #3e8c4a;
  }
  :global([data-modus='dunkel']) .teich {
    fill: #1a4556;
  }
  :global([data-modus='dunkel']) .blatt {
    fill: #1e5a3a;
  }
</style>
