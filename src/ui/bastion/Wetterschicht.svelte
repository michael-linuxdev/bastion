<script lang="ts">
  /**
   * Wetter über dem ganzen Bild (Wunsch PV 03.11.2026): Regen, Schnee, Nebel und
   * Wolkenschatten auch über Meer, Feldern und Wiese – nicht nur über der Insel.
   * Liegt über Kulisse und Bauplatz, fängt keine Tipper ab. Bewegt sich nur bei
   * „voll“/„leicht“ und ohne „Bewegung reduzieren“; sonst steht das Wetter still im Bild.
   */
  import type { Bewegung } from './grafik/atmosphaere';
  import type { WetterBild, WetterStaerke } from './grafik/wetter';
  import { wetterschicht } from './grafik/wetter-schicht';

  let {
    wetter,
    staerke,
    land,
    bewegung,
    nacht = false,
  }: {
    wetter: WetterBild;
    staerke: WetterStaerke;
    land: boolean;
    bewegung: Bewegung;
    nacht?: boolean;
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
    {#each Array.from({ length: schicht.wolkenschatten }, (_, i) => i) as i (i)}
      <div
        class="wolkenschatten"
        style:--n={i}
        style:inset-block-start="{8 + ((i * 37) % 70)}%"
      ></div>
    {/each}
    {#if schicht.schleier > 0}
      <div class="schleier" style:opacity={schicht.schleier}></div>
    {/if}
    {#each Array.from({ length: schicht.nebel }, (_, i) => i) as i (i)}
      <div class="nebelbank" style:--n={i} style:inset-block-start="{6 + ((i * 29) % 80)}%"></div>
    {/each}
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

  .nebelbank {
    position: absolute;
    inset-inline-start: -40%;
    inline-size: 90%;
    block-size: 22%;
    background: radial-gradient(ellipse at center, rgb(240 244 248 / 0.6), transparent 70%);
    filter: blur(8px);
  }

  .wolkenschatten {
    position: absolute;
    inset-inline-start: -50%;
    inline-size: 75%;
    block-size: 26%;
    background: radial-gradient(ellipse at center, rgb(20 30 44 / 0.24), transparent 70%);
  }

  .wetter-sturm .wolkenschatten {
    background: radial-gradient(ellipse at center, rgb(20 30 44 / 0.32), transparent 70%);
  }

  .nacht .wolkenschatten {
    opacity: 0.5;
  }

  /* Ohne Bewegung stehen Nebel und Schatten an festen, versetzten Stellen */
  .nebelbank,
  .wolkenschatten {
    translate: calc(var(--n) * 38%) 0;
  }

  @media (prefers-reduced-motion: no-preference) {
    .wetterschicht.bewegt .ebene {
      animation: fallen var(--dauer) linear infinite;
    }

    .wetterschicht.bewegt .nebelbank {
      animation: ziehen 80s linear infinite;
      animation-delay: calc(var(--n) * -21s);
    }

    .wetterschicht.bewegt .wolkenschatten {
      animation: ziehen 45s linear infinite;
      animation-delay: calc(var(--n) * -11s);
    }

    .wetterschicht.bewegt.wetter-sturm .wolkenschatten {
      animation-duration: 22s;
    }
  }

  @keyframes fallen {
    from {
      transform: translate(0, 0);
    }
    to {
      transform: translate(var(--weg-x), var(--weg-y));
    }
  }

  @keyframes ziehen {
    from {
      transform: translateX(0);
    }
    to {
      transform: translateX(220%);
    }
  }
</style>
