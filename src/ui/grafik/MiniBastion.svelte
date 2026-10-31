<script lang="ts">
  // Kleine Ansicht der Bastion für die Startseite (GRAFIK §1, §4.7):
  // Standbild der aktuellen Atmosphäre (Jahreszeit, Abend nach Sonne) ohne Bewegung.
  import { aktiv } from '../bastion/thema.svelte';
  import { darstellung } from './darstellung.svelte';
  import { jahreszeitAusDatum } from '../bastion/grafik/jahreszeit';
  import { szeneAbend } from '../bastion/grafik/sonne';

  const jetzt = new Date();
  const jahreszeit = jahreszeitAusDatum(jetzt);
  const abend = $derived(szeneAbend(darstellung.modus, jetzt));
</script>

<div class="mini" class:abend data-jahreszeit={jahreszeit} aria-hidden="true">
  {#if aktiv.thema === 'garten'}
    <svg viewBox="0 0 240 120" focusable="false" preserveAspectRatio="xMidYMax slice">
      <rect width="240" height="120" class="himmel" />
      <circle cx="206" cy="22" r="11" class="gestirn" />
      {#if !abend}
        <ellipse cx="40" cy="28" rx="16" ry="5" class="wolke" />
      {/if}
      <path d="M28 102 120 78l92 24-92 16Z" class="wiese" />
      <path d="M28 102v4l92 16v-4Z" class="wiese-rand" />
      <path d="M212 102v4l-92 16v-4Z" class="wiese-rand-vorn" />
      <rect x="108" y="78" width="6" height="22" fill="#5c4030" />
      <circle cx="111" cy="72" r="14" class="laub" />
      <circle cx="104" cy="68" r="8" class="laub-hell" />
      <path d="M98 92V78l16 4v14Z" fill="#8b6a45" />
      <path d="M130 92V78l-16 4v14Z" fill="#9a7a55" />
      <path d="M96 79 114 68l18 11-18 5Z" class="dach" />
      {#if jahreszeit === 'winter'}
        <path d="M96 79 114 68l18 11-18 5Z" class="schnee" />
      {/if}
      <circle cx="160" cy="96" r="3" fill="#e07a9a" />
      <circle cx="172" cy="98" r="2.5" fill="#e6c35c" />
      <circle cx="50" cy="94" r="8" class="laub" />
    </svg>
  {:else if aktiv.thema === 'dorf'}
    <svg viewBox="0 0 240 120" focusable="false" preserveAspectRatio="xMidYMax slice">
      <rect width="240" height="120" class="himmel" />
      <circle cx="206" cy="22" r="11" class="gestirn" />
      {#if !abend}
        <ellipse cx="40" cy="28" rx="16" ry="5" class="wolke" />
        <ellipse cx="54" cy="25" rx="11" ry="5" class="wolke" />
      {/if}
      <path d="M28 102 120 78l92 24-92 16Z" class="wiese" />
      <path d="M28 102v4l92 16v-4Z" class="wiese-rand" />
      <path d="M212 102v4l-92 16v-4Z" class="wiese-rand-vorn" />
      <rect x="52" y="90" width="4" height="12" fill="#6d4a2e" />
      <circle cx="54" cy="86" r="9" class="laub" />
      <circle cx="49" cy="84" r="5" class="laub-hell" />
      <path d="M100 100V80l24 6v20Z" fill="#a4927a" />
      <path d="M148 100V80l-24 6v20Z" fill="#b7a48c" />
      <path d="M97 81 124 68l27 13-27 6Z" class="dach" />
      {#if jahreszeit === 'winter'}
        <path d="M97 81 124 68l27 13-27 6Z" class="schnee" />
      {/if}
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
  {:else}
    <svg viewBox="0 0 240 120" focusable="false" preserveAspectRatio="xMidYMax slice">
      <rect width="240" height="120" class="himmel" />
      <circle cx="196" cy="40" r="13" class="gestirn" />
      {#if !abend}
        <ellipse cx="62" cy="44" rx="20" ry="6" class="wolke" />
        <ellipse cx="80" cy="40" rx="14" ry="6" class="wolke" />
      {/if}
      <path d="M30 92 120 64l90 28-90 28Z" class="insel" />
      <path d="M30 92v6l90 28v-6Z" class="insel-rand" />
      <path d="M210 92v6l-90 28v-6Z" class="insel-vorn" />
      <path d="M100 96V60l20 6v36Z" style="fill: var(--bastion-verteidigung)" />
      <path d="M140 96V60l-20 6v36Z" style="fill: var(--bastion-raster)" />
      <path d="M97 61 120 38l23 23-23 7Z" class="dach-insel" />
      {#if jahreszeit === 'winter'}
        <path d="M97 61 120 38l23 23-23 7Z" class="schnee" />
      {/if}
      <rect x="106" y="72" width="6" height="9" rx="3" class="luke" />
      <rect x="127" y="72" width="6" height="9" rx="3" class="luke" />
      <path d="M150 100V86l14 4v14Z" style="fill: var(--bastion-verteidigung)" />
      <path d="M178 100V86l-14 4v14Z" style="fill: var(--bastion-raster)" />
      <path d="M148 87 164 76l16 11-16 5Z" class="dach-klein" />
    </svg>
  {/if}
</div>

<style>
  .mini,
  svg {
    display: block;
    inline-size: 100%;
    block-size: 100%;
  }
  .himmel {
    fill: var(--farbe-himmel);
  }
  .gestirn {
    fill: var(--farbe-licht);
  }
  .wolke {
    fill: var(--farbe-flaeche);
    opacity: 0.85;
  }
  .insel {
    fill: var(--bastion-boden);
  }
  .insel-rand {
    fill: var(--bastion-raster);
  }
  .insel-vorn {
    fill: var(--bastion-zierde);
  }
  .dach-insel {
    fill: var(--farbe-akzent-warm);
  }
  .dach-klein {
    fill: var(--farbe-akzent-warm-hell);
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
  .laub {
    fill: #2d6a3c;
  }
  .laub-hell {
    fill: #3f874c;
  }
  .dach {
    fill: #8d3a34;
  }
  .luke {
    fill: #3a2a16;
  }
  .mini.abend .luke {
    fill: var(--farbe-licht);
  }
  .mini:not(.abend) .luke {
    opacity: 0.35;
  }
  .pfaehle {
    fill: #7b5a3c;
  }
  .pfaehle path {
    fill: #a67c52;
  }
  .schnee {
    fill: #f4f7fb;
    opacity: 0.85;
  }
  /* Jahreszeit-Standbild */
  .mini[data-jahreszeit='herbst'] .wiese {
    fill: #8a7a3a;
  }
  .mini[data-jahreszeit='herbst'] .laub {
    fill: #b85a2a;
  }
  .mini[data-jahreszeit='herbst'] .laub-hell {
    fill: #d4783c;
  }
  .mini[data-jahreszeit='winter'] .wiese {
    fill: #d8e2ea;
  }
  .mini[data-jahreszeit='winter'] .wiese-rand {
    fill: #b8c8d4;
  }
  .mini[data-jahreszeit='winter'] .wiese-rand-vorn {
    fill: #9aafc0;
  }
  .mini[data-jahreszeit='winter'] .laub,
  .mini[data-jahreszeit='winter'] .laub-hell {
    fill: #c5d0da;
  }
  .mini[data-jahreszeit='fruehling'] .wiese {
    fill: #6aaa4e;
  }
  .mini.abend .wiese {
    fill: #243c2c;
  }
  .mini.abend[data-jahreszeit='winter'] .wiese {
    fill: #2a3540;
  }
  .mini.abend .wiese-rand {
    fill: #1a2e22;
  }
  .mini.abend .wiese-rand-vorn {
    fill: #14241c;
  }
  .mini.abend .wolke {
    opacity: 0.15;
  }
</style>
