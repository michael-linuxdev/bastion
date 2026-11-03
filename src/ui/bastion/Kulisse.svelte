<script lang="ts">
  /**
   * Kulisse hinter dem Bauplatz (GRAFIK.md §13, Variante C, PV 02.11.2026):
   * Meer rundherum, das mit der Insel mitgeht; Schaum am Inselrand, Felsen,
   * Inselchen und ein Segelboot; weit über der Insel der Horizont mit Hügeln,
   * der erst beim Herauszoomen ins Bild rückt. Nachts Sterne über dem Horizont.
   * Bewegung (Wellen, Boot) nur bei „voll“/„leicht“ und ohne „Bewegung reduzieren“.
   * Wetter (Auftrag Grafik Punkt 2): Regen mit Tropfenringen, Schnee auf den Hügeln und
   * Eisschollen am Ufer, Sturm mit höheren Wellen und Wolkenschatten, Nebelbänke über dem
   * Meer (der Horizont verschwindet), Regenbogen nach Regen. Ruhig, ohne Blitze.
   */
  import type { WetterBild } from './grafik/wetter';
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
    wetter = 'klar',
    regenbogen = false,
  }: {
    thema: KulissenThema;
    themaName: string;
    stimmung: Stimmung;
    kamera: Kamera;
    inselOben: number;
    platz: { readonly breite: number; readonly tiefe: number };
    bewegung: Bewegung;
    wetter?: WetterBild;
    regenbogen?: boolean;
  } = $props();

  /** Feste Plätze im Meer rund um den Bauplatz (Felder), kein Zufall */
  function meerPlaetze(n: number, abstand: number, start: number) {
    const aus: { x: number; y: number; i: number }[] = [];
    for (let i = 0; i < n; i++) {
      const t = (i + 0.5) / n;
      const seite = (i + start) % 4;
      const b = platz.breite;
      const d = platz.tiefe;
      const a = abstand + ((i * 7) % 3) * 0.6;
      const feld =
        seite === 0
          ? { gx: t * b, gy: -a }
          : seite === 1
            ? { gx: b + a, gy: t * d }
            : seite === 2
              ? { gx: (1 - t) * b, gy: d + a }
              : { gx: -a, gy: (1 - t) * d };
      aus.push({ ...punkt(feld.gx, feld.gy, platz), i });
    }
    return aus;
  }
  const ringe = $derived(wetter === 'regen' || wetter === 'sturm' ? meerPlaetze(18, 1.2, 0) : []);
  const schollen = $derived(wetter === 'schnee' ? meerPlaetze(10, 0.5, 1) : []);

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
  class="kulisse {stimmung} wetter-{wetter}"
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
  {#if regenbogen && stimmung !== 'nacht'}
    <div
      class="regenbogen"
      style:inset-block-start="{(wasserFern > 120 ? wasserFern : 220) - 200}px"
    ></div>
  {/if}
  {#if wetter === 'nebel'}
    {#each [0.25, 0.5, 0.75] as h, i (i)}
      <div class="nebelbank" style:inset-block-start="{h * 100}%" style:--n={i}></div>
    {/each}
  {/if}
  {#if wetter === 'sturm'}
    {#each [0, 1, 2] as i (i)}
      <div class="wolkenschatten" style:inset-block-start="{20 + i * 28}%" style:--n={i}></div>
    {/each}
  {/if}
  <div
    class="welt"
    style:inline-size="{buehne.breite}px"
    style:block-size="{buehne.hoehe}px"
    style:transform="translate({kamera.x}px, {kamera.y}px) scale({kamera.zoom})"
  >
    <svg class="schaum" viewBox="0 0 {buehne.breite} {buehne.hoehe}" aria-hidden="true">
      <polygon points={raute} />
      {#each schollen as s (s.i)}
        <polygon
          class="scholle"
          points="{s.x - 22},{s.y} {s.x - 8},{s.y - 9} {s.x + 16},{s.y - 7} {s.x + 24},{s.y +
            2} {s.x + 6},{s.y + 9} {s.x - 14},{s.y + 7}"
        />
      {/each}
    </svg>
    {#each ringe as r (r.i)}
      <span
        class="ring"
        style:inset-inline-start="{r.x - 10}px"
        style:inset-block-start="{r.y - 5}px"
        style:--n={r.i}
      ></span>
    {/each}
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

  /* —— Wetter (Auftrag Grafik Punkt 2) —— */
  .wetter-regen .meer,
  .wetter-sturm .meer {
    filter: brightness(0.88) saturate(0.8);
  }

  .wetter-schnee .horizont {
    filter: saturate(0.3) brightness(1.4);
  }

  .wetter-nebel .horizont,
  .wetter-nebel .ding {
    opacity: 0.25;
  }

  .wetter-nebel .dunst {
    block-size: 9rem;
    background: linear-gradient(rgb(255 255 255 / 0.7), rgb(255 255 255 / 0.2));
  }

  .wetter-sturm .schaum polygon {
    stroke: rgb(244 250 252 / 0.8);
    stroke-width: 12;
  }

  .schaum polygon.scholle {
    fill: rgb(240 246 250 / 0.92);
    stroke: rgb(190 214 228 / 0.9);
    stroke-width: 2;
  }

  .ring {
    position: absolute;
    inline-size: 20px;
    block-size: 10px;
    border: 1.5px solid rgb(236 246 248 / 0.55);
    border-radius: 50%;
  }

  .nebelbank {
    position: absolute;
    inset-inline: -20%;
    block-size: 18%;
    background: radial-gradient(ellipse at center, rgb(240 244 248 / 0.75), transparent 70%);
    filter: blur(6px);
  }

  .wolkenschatten {
    position: absolute;
    inset-inline-start: -30%;
    inline-size: 60%;
    block-size: 22%;
    background: radial-gradient(ellipse at center, rgb(20 30 44 / 0.22), transparent 70%);
  }

  .regenbogen {
    position: absolute;
    inset-inline-start: 25%;
    inline-size: 70%;
    block-size: 200px;
    border-radius: 50% 50% 0 0 / 100% 100% 0 0;
    background: radial-gradient(
      ellipse at 50% 100%,
      transparent 62%,
      rgb(165 134 200 / 0.3) 63%,
      rgb(127 143 214 / 0.3) 66%,
      rgb(111 182 220 / 0.3) 69%,
      rgb(143 207 116 / 0.3) 72%,
      rgb(242 211 106 / 0.3) 75%,
      rgb(238 162 94 / 0.3) 78%,
      rgb(228 106 106 / 0.3) 81%,
      transparent 83%
    );
  }

  @media (prefers-reduced-motion: no-preference) {
    .kulisse.bewegt .ring {
      animation: tropfen 2.4s ease-out infinite;
      animation-delay: calc(var(--n) * -0.37s);
    }

    .kulisse.bewegt.wetter-sturm .meer {
      animation-duration: 12s;
    }

    .kulisse.bewegt .nebelbank {
      animation: ziehen 90s linear infinite;
      animation-delay: calc(var(--n) * -30s);
    }

    .kulisse.bewegt .wolkenschatten {
      animation: ziehen 40s linear infinite;
      animation-delay: calc(var(--n) * -13s);
    }

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

  @keyframes tropfen {
    from {
      transform: scale(0.2);
      opacity: 0.9;
    }
    to {
      transform: scale(1.6);
      opacity: 0;
    }
  }

  @keyframes ziehen {
    from {
      transform: translateX(0);
    }
    to {
      transform: translateX(160%);
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
