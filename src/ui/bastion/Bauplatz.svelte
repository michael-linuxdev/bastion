<script lang="ts">
  // Bauplatz als Grafik (Schritt 2.12): lädt PixiJS erst hier nach – nur wer die
  // Bastion bei eingeschaltetem Basebau öffnet, lädt es (R7, A3). Die Liste darunter
  // zeigt dasselbe und ist für Screenreader die gleichwertige Ansicht.
  import type { Bastion } from '../../core/bastion/bauen';
  import type { Buehne, Farben } from './grafik/grafik-buehne';
  import { tt } from './thema.svelte';

  let { bastion }: { bastion: Bastion } = $props();

  let rahmen = $state<HTMLDivElement | undefined>(undefined);
  let buehne = $state<Buehne | undefined>(undefined);
  let fehlgeschlagen = $state(false);

  function farben(): Farben {
    const css = getComputedStyle(document.documentElement);
    const v = (name: string) => css.getPropertyValue(name).trim() || '#888888';
    return {
      boden: v('--bastion-boden'),
      raster: v('--bastion-raster'),
      linie: v('--bastion-linie'),
      imBau: v('--farbe-akzent'),
      familie: {
        kern: v('--bastion-kern'),
        wissen: v('--bastion-wissen'),
        verteidigung: v('--bastion-verteidigung'),
        bau: v('--bastion-bau'),
        zierde: v('--bastion-zierde'),
      },
    };
  }

  $effect(() => {
    const ziel = rahmen;
    if (!ziel) return;
    let abgebrochen = false;
    let erstellt: Buehne | undefined;
    import('./grafik/grafik-buehne')
      .then((m) => m.buehneErstellen(ziel, farben()))
      .then((b) => {
        if (abgebrochen) b.zerstoere();
        else buehne = erstellt = b;
      })
      .catch(() => (fehlgeschlagen = true));
    return () => {
      abgebrochen = true;
      erstellt?.zerstoere();
      buehne = undefined;
    };
  });

  $effect(() => {
    buehne?.zeichne(bastion);
  });
</script>

{#if !fehlgeschlagen}
  <div class="bauplatz" bind:this={rahmen} aria-hidden="true"></div>
  <p class="leise">{tt('bastion.bild-hinweis')}</p>
{/if}

<style>
  .bauplatz {
    inline-size: 100%;
    max-inline-size: 30rem;
    aspect-ratio: 1;
    border-radius: var(--radius);
    overflow: hidden;
    border: 1px solid var(--farbe-rand);
    background: var(--bastion-boden);
  }

  .leise {
    color: var(--farbe-text-leise);
    margin-block: 0;
  }
</style>
