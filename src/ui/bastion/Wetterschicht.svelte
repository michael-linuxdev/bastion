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
        class:zwei={e.abschnitte === 2}
        class:drei={e.abschnitte === 3}
        style:background-image={e.kachel}
        style:background-size="{e.groesse}px {e.groesse}px"
        style:opacity={nacht ? e.deckkraft * 0.6 : e.deckkraft}
        style:inset-block-start="-{e.weg.y / e.abschnitte}px"
        style:inset-inline-start="{-Math.max(0, e.weg.x)}px"
        style:inset-inline-end="{Math.min(0, e.weg.x)}px"
        style:--weg-x="{e.weg.x}px"
        style:--weg-y="{e.weg.y}px"
        style:--dauer="{e.dauer}s"
        style:--kachel="{e.groesse}px"
      ></div>
    {/each}
  </div>
{/if}

<style>
  .wetterschicht {
    /* Die Kacheln ziehen in festen Bildschirm-Richtungen (translate); die Ränder der Ebenen
       folgen dem, auch bei Schrift von rechts nach links */
    direction: ltr;
    position: absolute;
    inset: 0;
    overflow: hidden;
    pointer-events: none;
  }

  /* Die Ebene ragt nur auf der Seite über das Fenster, von der die Kachel hereinzieht
     (oben und gegen die Zugrichtung) – genau so weit wie ein Durchlauf (GRAFIK §32) */
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
      animation: fallen-1 var(--dauer) linear infinite;
    }

    .wetterschicht.bewegt .ebene.zwei {
      animation-name: fallen-2;
    }

    .wetterschicht.bewegt .ebene.drei {
      animation-name: fallen-3;
    }

    /* Nebelbänke und Wolkenschatten ziehen nicht selbst, sie liegen fest in der Welt und
       wandern nur mit der Kamera. Animiert bekäme jede eine eigene Grafikebene, die beim
       Heranzoomen mitwächst – zwölf Wolkenschatten brachten das iPhone zum Absturz
       (PV 03.11.2026). */
  }

  /* Ein Durchlauf in ein bis drei Abschnitten (GRAFIK §32): Am Ende eines Abschnitts springt
     die Ebene eine Kachel nach oben – das Muster wiederholt sich je Kachel, der Sprung ist
     unsichtbar, und die Ebene ragt nur eine Kachel über das Fenster */
  @keyframes fallen-1 {
    from {
      transform: translate(0, 0);
    }
    to {
      transform: translate(var(--weg-x), var(--weg-y));
    }
  }

  @keyframes fallen-2 {
    0% {
      transform: translate(0, 0);
    }
    49.99% {
      transform: translate(calc(var(--weg-x) / 2), calc(var(--weg-y) / 2));
    }
    50% {
      transform: translate(calc(var(--weg-x) / 2), calc(var(--weg-y) / 2 - var(--kachel)));
    }
    100% {
      transform: translate(var(--weg-x), calc(var(--weg-y) - var(--kachel)));
    }
  }

  @keyframes fallen-3 {
    0% {
      transform: translate(0, 0);
    }
    33.33% {
      transform: translate(calc(var(--weg-x) / 3), calc(var(--weg-y) / 3));
    }
    33.34% {
      transform: translate(calc(var(--weg-x) / 3), calc(var(--weg-y) / 3 - var(--kachel)));
    }
    66.66% {
      transform: translate(calc(var(--weg-x) * 2 / 3), calc(var(--weg-y) * 2 / 3 - var(--kachel)));
    }
    66.67% {
      transform: translate(
        calc(var(--weg-x) * 2 / 3),
        calc(var(--weg-y) * 2 / 3 - 2 * var(--kachel))
      );
    }
    100% {
      transform: translate(var(--weg-x), calc(var(--weg-y) - 2 * var(--kachel)));
    }
  }
</style>
