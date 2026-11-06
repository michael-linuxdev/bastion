<script lang="ts">
  /**
   * Wetter über dem ganzen Bild (Wunsch PV 03.11.2026): Regen, Schnee, Nebel und
   * Wolkenschatten auch über Meer, Feldern und Wiese – nicht nur über der Insel.
   * Liegt über Kulisse und Bauplatz, fängt keine Tipper ab. Bewegt sich nur bei
   * „voll“/„leicht“ und ohne „Bewegung reduzieren“; sonst steht das Wetter still im Bild.
   */
  import type { Bewegung } from './grafik/atmosphaere';
  import type { Kamera } from './grafik/kamera';
  import type { WetterBild, WetterStaerke } from './grafik/wetter';
  import { wetterschicht } from './grafik/wetter-schicht';

  let {
    wetter,
    staerke,
    land,
    bewegung,
    nacht = false,
    kamera,
    welt,
  }: {
    wetter: WetterBild;
    staerke: WetterStaerke;
    land: boolean;
    bewegung: Bewegung;
    nacht?: boolean;
    /** Wolken und Nebel gehören zur Welt: sie wandern beim Verschieben und Zoomen mit */
    kamera: Kamera;
    welt: { readonly breite: number; readonly hoehe: number };
  } = $props();

  const schicht = $derived(wetterschicht(wetter, staerke, land, bewegung === 'leicht'));
</script>

{#if schicht.ebenen.length > 0 || schicht.schleier > 0 || schicht.nebel > 0 || schicht.wolkenschatten > 0}
  <div
    class="wetterschicht wetter-{wetter}"
    class:bewegt={bewegung !== 'aus'}
    class:nacht
    aria-hidden="true"
  >
    <div
      class="welt"
      style:inline-size="{welt.breite}px"
      style:block-size="{welt.hoehe}px"
      style:transform="translate({kamera.x}px, {kamera.y}px) scale({kamera.zoom})"
    >
      <!-- Feste Plätze über einem großen Stück Welt (dreimal so breit und hoch wie die Bühne) -->
      {#each Array.from({ length: schicht.wolkenschatten * 3 }, (_, i) => i) as i (i)}
        <div
          class="wolkenschatten"
          style:--n={i}
          style:inset-block-start="{-110 + ((i * 47) % 300)}%"
          style:translate="{(i * 113) % 420}% 0"
        ></div>
      {/each}
      {#each Array.from({ length: schicht.nebel * 3 }, (_, i) => i) as i (i)}
        <div
          class="nebelbank"
          style:--n={i}
          style:inset-block-start="{-100 + ((i * 41) % 290)}%"
          style:translate="{(i * 97) % 360}% 0"
        ></div>
      {/each}
    </div>
    {#if schicht.schleier > 0}
      <div class="schleier" style:opacity={schicht.schleier}></div>
    {/if}
    {#each schicht.ebenen as e, i (i)}
      <div
        class="ebene"
        style:background-image={e.kachel}
        style:background-size="{e.groesse}px {e.groesse}px"
        style:opacity={nacht ? e.deckkraft * 0.6 : e.deckkraft}
        style:inset-block-start="-{e.weg.y}px"
        style:inset-inline="-{Math.abs(e.weg.x)}px"
        style:--weg-x="{e.weg.x}px"
        style:--weg-y="{e.weg.y}px"
        style:--dauer="{e.dauer}s"
      ></div>
    {/each}
  </div>
{/if}

<style>
  .wetterschicht {
    position: absolute;
    inset: 0;
    overflow: hidden;
    pointer-events: none;
  }

  .ebene {
    position: absolute;
    inset-block-end: 0;
    background-repeat: repeat;
    will-change: transform;
  }

  .schleier {
    position: absolute;
    inset: 0;
    background: rgb(70 82 98);
  }

  .wetter-schnee .schleier {
    background: rgb(236 242 248);
  }

  .wetter-nebel .schleier {
    background: rgb(232 236 240);
  }

  .welt {
    position: absolute;
    inset-block-start: 0;
    inset-inline-start: 0;
    transform-origin: 0 0;
  }

  .nebelbank {
    position: absolute;
    inset-inline-start: -120%;
    inline-size: 110%;
    block-size: 28%;
    background: radial-gradient(ellipse at center, rgb(240 244 248 / 0.6), transparent 70%);
    filter: blur(8px);
  }

  .wolkenschatten {
    position: absolute;
    inset-inline-start: -120%;
    inline-size: 90%;
    block-size: 34%;
    background: radial-gradient(ellipse at center, rgb(20 30 44 / 0.24), transparent 70%);
  }

  .wetter-sturm .wolkenschatten {
    background: radial-gradient(ellipse at center, rgb(20 30 44 / 0.32), transparent 70%);
  }

  .nacht .wolkenschatten {
    opacity: 0.5;
  }

  @media (prefers-reduced-motion: no-preference) {
    .wetterschicht.bewegt .ebene {
      animation: fallen var(--dauer) linear infinite;
    }

    /* Nebelbänke und Wolkenschatten ziehen nicht selbst, sie liegen fest in der Welt und
       wandern nur mit der Kamera. Animiert bekäme jede eine eigene Grafikebene, die beim
       Heranzoomen mitwächst – zwölf Wolkenschatten brachten das iPhone zum Absturz
       (PV 03.11.2026). */
  }

  @keyframes fallen {
    from {
      transform: translate(0, 0);
    }
    to {
      transform: translate(var(--weg-x), var(--weg-y));
    }
  }
</style>
