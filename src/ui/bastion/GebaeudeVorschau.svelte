<script lang="ts">
  /**
   * Gebäudevorschau fürs Bau-Blatt: Atlas-Sprite oder Silhouetten-Fallback.
   * Design-Ideen K43: Bauplan als gestrichelte Geister-Silhouette (`geist`).
   */
  import { onMount } from 'svelte';
  import type { GebaeudeTyp } from '../../core/bastion/katalog';
  import { aktiv } from './thema.svelte';
  import { atlasBasisUrl, atlasEintrag, atlasLaden, type AtlasManifest } from './grafik/atlas';

  let {
    typ,
    stufe = 1,
    epoche = 1,
    gross = false,
    geist = false,
  }: {
    typ: GebaeudeTyp;
    stufe?: number;
    epoche?: number;
    /** Große Vorschau im Blatt-Kopf */
    gross?: boolean;
    /** Gestrichelte Geister-Silhouette (Bauplan/Skizze) */
    geist?: boolean;
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
    !geist && eintrag && !bildFehler ? `${atlasBasisUrl()}${eintrag.datei}` : undefined,
  );
</script>

<div class="vorschau" class:gross class:geist aria-hidden="true">
  {#if src}
    <img {src} alt="" onerror={() => (bildFehler = true)} />
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

<style>
  .vorschau {
    display: grid;
    place-items: center;
    inline-size: 3.25rem;
    block-size: 3.25rem;
    border-radius: var(--radius);
    background: color-mix(in srgb, var(--farbe-akzent) 12%, var(--farbe-hintergrund));
    color: var(--farbe-akzent);
    overflow: hidden;
    flex-shrink: 0;
  }

  .vorschau.geist {
    background: color-mix(in srgb, var(--farbe-text-leise) 10%, var(--farbe-hintergrund));
    color: var(--farbe-text-leise);
    box-shadow: inset 0 0 0 1.5px color-mix(in srgb, var(--farbe-text-leise) 45%, transparent);
  }

  .vorschau.gross {
    inline-size: min(100%, 11rem);
    block-size: 7.5rem;
    margin-inline: auto;
    border-radius: var(--radius-karte);
    background: linear-gradient(
      160deg,
      color-mix(in srgb, var(--farbe-akzent) 18%, var(--farbe-flaeche)),
      var(--farbe-hintergrund)
    );
    box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--farbe-akzent) 20%, transparent);
  }

  .vorschau.gross.geist {
    background: repeating-linear-gradient(
      -45deg,
      color-mix(in srgb, var(--farbe-text-leise) 8%, var(--farbe-flaeche)),
      color-mix(in srgb, var(--farbe-text-leise) 8%, var(--farbe-flaeche)) 6px,
      var(--farbe-hintergrund) 6px,
      var(--farbe-hintergrund) 12px
    );
    box-shadow: inset 0 0 0 1.5px dashed
      color-mix(in srgb, var(--farbe-text-leise) 55%, transparent);
  }

  img {
    max-inline-size: 100%;
    max-block-size: 100%;
    object-fit: contain;
    image-rendering: pixelated;
  }

  .fallback {
    inline-size: 70%;
    block-size: 70%;
  }

  .gross .fallback {
    inline-size: 55%;
    block-size: 55%;
  }
</style>
