<script lang="ts">
  /**
   * Kulisse hinter dem Bauplatz (GRAFIK.md §13, Variante C, PV 02.11.2026):
   * Meer rundherum, das mit der Insel mitgeht; Schaum am Inselrand, Felsen,
   * Inselchen und ein Segelboot; weit über der Insel der Horizont mit Hügeln,
   * der erst beim Herauszoomen ins Bild rückt. Nachts Sterne über dem Horizont.
   * Bewegung (Wellen, Boot) nur bei „voll“/„leicht“ und ohne „Bewegung reduzieren“.
   */
  import type { Kamera } from './grafik/kamera';
  import type { Bewegung } from './grafik/atmosphaere';
  import { buehneFuer, punkt } from './grafik/iso';
  import {
    DING_MASS,
    HORIZONT,
    MEER,
    STERNE,
    dingeUmBauplatz,
    kulissenLage,
    type KulissenThema,
    type Stimmung,
  } from './grafik/kulisse';

  let {
    thema,
    themaName,
    stimmung,
    kamera,
    inselOben,
    platz,
    bewegung,
  }: {
    thema: KulissenThema;
    themaName: string;
    stimmung: Stimmung;
    kamera: Kamera;
    inselOben: number;
    platz: { readonly breite: number; readonly tiefe: number };
    bewegung: Bewegung;
  } = $props();

  const buehne = $derived(buehneFuer(platz));
  const basis = $derived(`${import.meta.env.BASE_URL}grafik/atlas/kulisse/${themaName}/`);
  const pfad = $derived(`${basis}${stimmung}/`);
  const lage = $derived(kulissenLage(kamera, inselOben));
  const himmel = $derived(thema.himmel[stimmung]);
  const meer = $derived(thema.grund[stimmung]);
  const hY = $derived(Math.round(lage.horizontY));
  const hoch = $derived(HORIZONT.hoehe * lage.horizontSkala);
  const wasserFern = $derived(hY - (HORIZONT.hoehe - HORIZONT.wasser) * lage.horizontSkala);
  const dinge = $derived(
    dingeUmBauplatz(platz.breite, platz.tiefe).map((d) => ({ ...d, ...punkt(d.gx, d.gy, platz) })),
  );
  /** Rand des Bauplatzes (Raute) für den Schaumring, in Bühnen-Bildpunkten */
  const raute = $derived(
    [
      punkt(0, 0, platz),
      punkt(platz.breite, 0, platz),
      punkt(platz.breite, platz.tiefe, platz),
      punkt(0, platz.tiefe, platz),
    ]
      .map((q) => `${q.x},${q.y}`)
      .join(' '),
  );
  const bootStart = $derived(punkt(-4, platz.tiefe + 5, platz));
  const bootZiel = $derived(punkt(platz.breite + 5, platz.tiefe + 5, platz));
</script>

<div
  class="kulisse {stimmung}"
  class:bewegt={bewegung !== 'aus'}
  aria-hidden="true"
  style:background="linear-gradient({himmel[0]}, {himmel[1]}
  {wasserFern}px, {meer}
  {wasserFern}px)"
>
  {#if stimmung === 'nacht' && wasserFern > 0}
    <div
      class="sterne"
      style:block-size="{wasserFern}px"
      style:background-image="url({pfad}sterne.png)"
      style:background-size="{STERNE}px {STERNE}px"
      style:background-position="{lage.horizontX}px 0"
    ></div>
  {/if}
  <div
    class="meer"
    style:inset-block-start="{Math.max(0, wasserFern)}px"
    style:background-image="url({pfad}meer.png)"
    style:background-size="{MEER.breite * kamera.zoom}px {MEER.hoehe * kamera.zoom}px"
    style:--meer-x="{kamera.x}px"
    style:--meer-y="{kamera.y}px"
    style:--meer-weg="{MEER.breite * kamera.zoom}px"
  ></div>
  {#if hY + hoch > 0}
    <div
      class="horizont"
      style:inset-block-start="{hY - HORIZONT.wasser * lage.horizontSkala}px"
      style:block-size="{hoch}px"
      style:background-image="url({pfad}horizont.png)"
      style:background-size="{HORIZONT.breite * lage.horizontSkala}px {hoch}px"
      style:background-position="{lage.horizontX}px 0"
    ></div>
    <div class="dunst" style:inset-block-start="{wasserFern - 4}px"></div>
  {/if}
  <div
    class="welt"
    style:inline-size="{buehne.breite}px"
    style:block-size="{buehne.hoehe}px"
    style:transform="translate({kamera.x}px, {kamera.y}px) scale({kamera.zoom})"
  >
    <svg class="schaum" viewBox="0 0 {buehne.breite} {buehne.hoehe}" aria-hidden="true">
      <polygon points={raute} />
    </svg>
    {#each dinge as d, i (i)}
      <img
        class="ding"
        src="{basis}dinge/{d.bild}.png"
        alt=""
        style:inline-size="{DING_MASS[d.bild].w}px"
        style:inset-inline-start="{d.x - DING_MASS[d.bild].w / 2}px"
        style:inset-block-start="{d.y - DING_MASS[d.bild].h}px"
      />
    {/each}
    <img
      class="ding boot"
      src="{basis}dinge/boot.png"
      alt=""
      style:inline-size="{DING_MASS.boot.w}px"
      style:inset-inline-start="{bootStart.x - DING_MASS.boot.w / 2}px"
      style:inset-block-start="{bootStart.y - DING_MASS.boot.h}px"
      style:--boot-x="{bootZiel.x - bootStart.x}px"
      style:--boot-y="{bootZiel.y - bootStart.y}px"
    />
  </div>
</div>

<style>
  .kulisse {
    position: absolute;
    inset: 0;
    overflow: hidden;
    pointer-events: none;
  }

  .sterne,
  .meer,
  .horizont,
  .dunst {
    position: absolute;
    inset-inline: 0;
  }

  .sterne {
    inset-block-start: 0;
    background-repeat: repeat;
  }

  .horizont {
    background-repeat: repeat-x;
  }

  .dunst {
    block-size: 3rem;
    background: linear-gradient(rgb(255 255 255 / 0.22), transparent);
  }

  .meer {
    inset-block-end: 0;
    background-repeat: repeat;
    background-position: var(--meer-x) var(--meer-y);
  }

  .welt {
    position: absolute;
    inset-block-start: 0;
    inset-inline-start: 0;
    transform-origin: 0 0;
  }

  .schaum {
    position: absolute;
    inset: 0;
    inline-size: 100%;
    block-size: 100%;
    overflow: visible;
  }

  .schaum polygon {
    fill: none;
    stroke: rgb(236 246 248 / 0.55);
    stroke-width: 7;
    stroke-linejoin: round;
  }

  .ding {
    position: absolute;
    block-size: auto;
  }

  .daemmerung .ding,
  .daemmerung .schaum {
    filter: brightness(0.8) sepia(0.15);
  }

  .nacht .ding,
  .nacht .schaum {
    filter: brightness(0.45) saturate(0.7);
  }

  @media (prefers-reduced-motion: no-preference) {
    /* Wellen ziehen langsam (eine Kachel in 40 s); das Boot quert in 3 Minuten */
    .kulisse.bewegt .meer {
      animation: wellen 40s linear infinite;
    }

    .kulisse.bewegt .boot {
      animation: segeln 180s linear infinite;
    }
  }

  @keyframes wellen {
    from {
      background-position: var(--meer-x) var(--meer-y);
    }
    to {
      background-position: calc(var(--meer-x) + var(--meer-weg)) var(--meer-y);
    }
  }

  @keyframes segeln {
    from {
      transform: translate(0, 0);
    }
    to {
      transform: translate(var(--boot-x), var(--boot-y));
    }
  }
</style>
