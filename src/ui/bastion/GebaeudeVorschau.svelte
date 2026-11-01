<script lang="ts">
  /**
   * Gebäudevorschau als Mini-Szene (Design C10): Iso-Boden/Himmel + Atlas/Silhouette.
   * Optional Farbe für Zierde (C13). Gesperrte Gebäude als Silhouette (C12).
   * Design-Ideen K43: Bauplan als gestrichelte Geister-Silhouette (`geist`).
   */
  import { onMount } from 'svelte';
  import type { Farbe, GebaeudeTyp } from '../../core/bastion/katalog';
  import { FARBWERT } from './farben';
  import { aktiv } from './thema.svelte';
  import { atlasBasisUrl, atlasEintrag, atlasLaden, type AtlasManifest } from './grafik/atlas';

  let {
    typ,
    stufe = 1,
    epoche = 1,
    gross = false,
    gesperrt = false,
    geist = false,
    farbe,
  }: {
    typ: GebaeudeTyp;
    stufe?: number;
    epoche?: number;
    /** Große Vorschau im Blatt-Kopf */
    gross?: boolean;
    /** Noch nicht freigeschaltet: Silhouette */
    gesperrt?: boolean;
    /** Gestrichelte Geister-Silhouette (Bauplan/Skizze, K43) */
    geist?: boolean;
    /** Zierde-Farbe für Live-Vorschau */
    farbe?: Farbe | undefined;
  } = $props();

  let manifest = $state<AtlasManifest | null>(null);
  let bildFehler = $state(false);

  onMount(() => {
    void atlasLaden().then((m) => {
      manifest = m;
    });
  });

  const eintrag = $derived(atlasEintrag(manifest, aktiv.thema, epoche, typ, stufe));
  const src = $derived(
    !gesperrt && !geist && eintrag && !bildFehler
      ? `${atlasBasisUrl()}${eintrag.datei}`
      : undefined,
  );
  const tint = $derived(farbe ? FARBWERT[farbe] : undefined);
</script>

<div
  class="vorschau"
  class:gross
  class:gesperrt
  class:geist
  class:einblenden={gross}
  aria-hidden="true"
  style:--vorschau-farbe={tint}
>
  <div class="szene">
    <span class="himmel"></span>
    <span class="boden"></span>
    {#if src}
      <img {src} alt="" class="sprite" onerror={() => (bildFehler = true)} />
    {:else}
      <svg class="fallback" viewBox="0 0 48 48" focusable="false">
        <path
          d="M8 40V18l8-6 8 6v4h8V18l8-6 8 6v22H8Z"
          fill={geist ? 'none' : 'currentColor'}
          opacity={geist ? 1 : 0.35}
          stroke={geist ? 'currentColor' : 'none'}
          stroke-width={geist ? 1.8 : 0}
          stroke-dasharray={geist ? '3 2.5' : undefined}
        />
        <path
          d="M16 40v-8h8v8M28 40v-10h8v10"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          opacity={geist ? 0.7 : 0.55}
          stroke-dasharray={geist ? '2.5 2' : undefined}
        />
      </svg>
    {/if}
  </div>
</div>

<style>
  .vorschau {
    display: grid;
    place-items: center;
    inline-size: 3.25rem;
    block-size: 3.25rem;
    border-radius: var(--radius);
    overflow: hidden;
    flex-shrink: 0;
    color: var(--farbe-akzent);
  }

  .vorschau.gross {
    inline-size: min(100%, 12rem);
    block-size: 8rem;
    margin-inline: auto;
    border-radius: var(--radius-karte);
  }

  .vorschau.geist {
    color: var(--farbe-text-leise);
    box-shadow: inset 0 0 0 1.5px color-mix(in srgb, var(--farbe-text-leise) 45%, transparent);
  }

  .vorschau.gross.geist .himmel {
    background: repeating-linear-gradient(
      -45deg,
      color-mix(in srgb, var(--farbe-text-leise) 8%, var(--farbe-flaeche)),
      color-mix(in srgb, var(--farbe-text-leise) 8%, var(--farbe-flaeche)) 6px,
      var(--farbe-hintergrund) 6px,
      var(--farbe-hintergrund) 12px
    );
  }

  @media (prefers-reduced-motion: no-preference) {
    .vorschau.einblenden {
      animation: bastion-einblenden 0.35s ease-out;
    }
  }

  .szene {
    position: relative;
    inline-size: 100%;
    block-size: 100%;
    display: grid;
    place-items: center;
  }

  .himmel {
    position: absolute;
    inset: 0;
    background: linear-gradient(
      180deg,
      var(--farbe-himmel) 0%,
      color-mix(in srgb, var(--farbe-himmel) 55%, var(--bastion-boden)) 72%,
      var(--bastion-boden) 100%
    );
  }

  .boden {
    position: absolute;
    inset-inline: 12%;
    inset-block-end: 12%;
    block-size: 28%;
    background: color-mix(in srgb, var(--bastion-boden) 70%, var(--bastion-raster));
    clip-path: polygon(50% 0, 100% 50%, 50% 100%, 0 50%);
    opacity: 0.95;
  }

  .sprite,
  .fallback {
    position: relative;
    z-index: 1;
    max-inline-size: 78%;
    max-block-size: 78%;
    object-fit: contain;
    image-rendering: pixelated;
  }

  .gross .sprite,
  .gross .fallback {
    max-inline-size: 62%;
    max-block-size: 70%;
  }

  .fallback {
    inline-size: 70%;
    block-size: 70%;
  }

  .gross .fallback {
    inline-size: 55%;
    block-size: 55%;
  }

  .vorschau.gesperrt .sprite,
  .vorschau.gesperrt .fallback {
    filter: brightness(0) opacity(0.45);
  }

  .vorschau:not(.gesperrt) .sprite {
    filter: drop-shadow(
      0 1px 0 color-mix(in srgb, var(--vorschau-farbe, transparent) 35%, transparent)
    );
  }

  .vorschau:not(.gesperrt)[style*='--vorschau-farbe'] .boden {
    background: color-mix(in srgb, var(--vorschau-farbe) 28%, var(--bastion-boden));
  }
</style>
