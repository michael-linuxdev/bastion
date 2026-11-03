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
  import type { Jahreszeit } from './grafik/jahreszeit';
  import type { Thema } from '../../core/policy/einstellung';
  import type { Kamera } from './grafik/kamera';
  import type { Bewegung } from './grafik/atmosphaere';
  import { buehneFuer, INSEL, punkt } from './grafik/iso';
  import { inselRand } from './grafik/insel-rand';
  import {
    DING_BREITE,
    HORIZONT,
    MEER,
    STERNE,
    dingBild,
    inselBewuchs,
    kulissenDinge,
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
    jahreszeit = 'sommer',
    szenerie = 0,
  }: {
    thema: KulissenThema;
    themaName: Thema;
    stimmung: Stimmung;
    kamera: Kamera;
    inselOben: number;
    platz: { readonly breite: number; readonly tiefe: number };
    bewegung: Bewegung;
    wetter?: WetterBild;
    regenbogen?: boolean;
    jahreszeit?: Jahreszeit;
    /** Eigene Szenerie des Kindes (gewürfelter Startwert), 0 = Grundszenerie */
    szenerie?: number;
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
  const ringe = $derived(
    thema.wasser && (wetter === 'regen' || wetter === 'sturm') ? meerPlaetze(18, 1.2, 0) : [],
  );
  const schollen = $derived(thema.wasser && wetter === 'schnee' ? meerPlaetze(10, 0.5, 1) : []);
  /** Wolken am Himmel: Land und Meer (nicht unter Wasser, nicht im Weltraum) */
  const himmelWolken = $derived(!thema.sterneImmer && thema.jahreszeitBoden);
  /** Feste Wolken: Lage in Prozent der Breite, Höhe über dem Horizont, Breite */
  const WOLKEN = [
    { x: -6, hoch: 100, b: 150 },
    { x: 22, hoch: 120, b: 110 },
    { x: 44, hoch: 90, b: 190 },
    { x: 68, hoch: 150, b: 130 },
    { x: 86, hoch: 115, b: 160 },
    { x: 8, hoch: 200, b: 120 },
    { x: 56, hoch: 230, b: 140 },
  ] as const;
  const sterneZeigen = $derived(stimmung === 'nacht' || thema.sterneImmer);

  const buehne = $derived(buehneFuer(platz));
  const basis = $derived(`${import.meta.env.BASE_URL}grafik/atlas/kulisse/${themaName}/`);
  const pfad = $derived(`${basis}${stimmung}/`);
  const lage = $derived(kulissenLage(kamera, inselOben));
  /** Größe des Fensters: Dinge weit außerhalb werden nicht gezeichnet (bis zu 270 Plätze) */
  let fensterB = $state(800);
  let fensterH = $state(1200);
  const himmel = $derived(thema.himmel[stimmung]);
  const meer = $derived(thema.grund[stimmung]);
  const hY = $derived(Math.round(lage.horizontY));
  const hoch = $derived(HORIZONT.hoehe * lage.horizontSkala);
  const wasserFern = $derived(hY - (HORIZONT.hoehe - HORIZONT.wasser) * lage.horizontSkala);
  const dinge = $derived(
    kulissenDinge(platz.breite, platz.tiefe, thema, szenerie).map((d) => ({
      ...d,
      bild: dingBild(thema, d.bild, jahreszeit, d.variante),
      tier: thema.leben.includes('grasen') && ['kuh', 'schaf', 'pferd'].includes(d.bild),
      // Luftperspektive (Wunsch PV: Tiefe in der Ferne): ab 8 Feldern Abstand blasser,
      // leicht bläulich, ganz weit minimal unscharf (0 = nah, 1 = am weitesten)
      dunst: Math.min(
        1,
        Math.max(0, (Math.max(-d.gx, d.gx - platz.breite, -d.gy, d.gy - platz.tiefe) - 8) / 30),
      ).toFixed(2),
      ...punkt(d.gx, d.gy, platz),
    })),
  );
  /** Bewegtes (Wunsch PV: mehr Leben): feste Plätze rund um den Bauplatz, in Feldern */
  const lebenPlatz = (gx: number, gy: number) => punkt(gx, gy, platz);
  const moewen = $derived(
    thema.leben.includes('moewen')
      ? [
          { ...lebenPlatz(-3, platz.tiefe * 0.4), r: 70, d: 34, n: 0 },
          { ...lebenPlatz(platz.breite + 4, -2), r: 110, d: 48, n: 1 },
          { ...lebenPlatz(platz.breite * 0.5, platz.tiefe + 6), r: 90, d: 41, n: 2 },
          { ...lebenPlatz(-8, -6), r: 60, d: 29, n: 3 },
        ]
      : [],
  );
  const falter = $derived(
    thema.leben.includes('schmetterlinge')
      ? [
          { ...lebenPlatz(-1.5, platz.tiefe * 0.5), r: 26, d: 14, n: 0 },
          { ...lebenPlatz(platz.breite + 1.5, platz.tiefe * 0.3), r: 34, d: 17, n: 1 },
          { ...lebenPlatz(platz.breite * 0.4, platz.tiefe + 2), r: 22, d: 12, n: 2 },
          { ...lebenPlatz(platz.breite * 0.6, -2), r: 30, d: 16, n: 3 },
        ]
      : [],
  );
  const schwaerme = $derived(
    thema.leben.includes('schwarm')
      ? [
          { ...lebenPlatz(-4, platz.tiefe * 0.6), n: 0 },
          { ...lebenPlatz(platz.breite + 3, platz.tiefe * 0.2), n: 1 },
          { ...lebenPlatz(platz.breite * 0.3, platz.tiefe + 7), n: 2 },
        ]
      : [],
  );
  const satellit = $derived(thema.leben.includes('satellit') ? lebenPlatz(-6, -10) : undefined);
  /** Rand des Bauplatzes (Raute) für den Schaumring, in Bühnen-Bildpunkten */
  /**
   * Inselrand mit freier Küste (§20, Wunsch PV): Strand (nur am Meer), Seitenwand und
   * Oberfläche, in Bühnen-Bildpunkten. Die Oberfläche liegt auf Höhe des Bauplatzes.
   */
  const inselLinie = (zusatz: number, tiefer: number) =>
    inselRand(platz.breite, platz.tiefe, szenerie, zusatz)
      .map((p) => {
        const q = punkt(p.gx, p.gy, platz);
        return `${q.x.toFixed(1)},${(q.y + tiefer).toFixed(1)}`;
      })
      .join(' ');
  const atlasBasis = `${import.meta.env.BASE_URL}grafik/atlas/`;
  const bewuchs = $derived(
    inselBewuchs(platz.breite, platz.tiefe, themaName, szenerie).map((w) => ({
      ...w,
      src: `${atlasBasis}${w.pfad}${w.jahreszeit && jahreszeit !== 'sommer' ? `_${jahreszeit}` : ''}.png`,
      ...punkt(w.gx, w.gy, platz),
    })),
  );
  const insel = $derived({
    strand: thema.insel.strand ? inselLinie(0.55, INSEL) : '',
    wand: inselLinie(0, INSEL),
    oben: inselLinie(0, 0),
    // Spiegelung der Inselwand im Wasser (Wunsch PV: Licht und Wasser): unter dem Strand
    spiegel: thema.wasser ? inselLinie(0.55, INSEL * 3.2) : '',
  });

  const bootStart = $derived(punkt(-4, platz.tiefe + 5, platz));
  const bootZiel = $derived(punkt(platz.breite + 5, platz.tiefe + 5, platz));
</script>

<div
  bind:clientWidth={fensterB}
  bind:clientHeight={fensterH}
  class="kulisse {stimmung} wetter-{wetter}"
  class:jz-fruehling={thema.jahreszeitBoden && jahreszeit === 'fruehling'}
  class:jz-herbst={thema.jahreszeitBoden && jahreszeit === 'herbst'}
  class:jz-winter={thema.jahreszeitBoden && jahreszeit === 'winter'}
  class:bewegt={bewegung !== 'aus'}
  class:wasser={thema.wasser}
  aria-hidden="true"
  style:background="linear-gradient({himmel[0]}, {himmel[1]}
  {wasserFern}px, {meer}
  {wasserFern}px)"
>
  {#if sterneZeigen && wasserFern > 0}
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
    <!-- Luftperspektive: zum Horizont hin liegt Dunst in der Farbe des Himmels -->
    <div
      class="ferne"
      style:inset-block-start="{wasserFern}px"
      style:block-size="{Math.max(80, hoch * 2.4)}px"
      style:background="linear-gradient({himmel[1]}, transparent)"
    ></div>
  {/if}
  <!-- Himmel über dem Horizont (PV: „hinterm Horizont ist nichts“): ruhige Wolken,
       weit weg, sie wandern beim Verschieben nur wenig mit -->
  {#if himmelWolken && wasserFern > 40}
    {#each WOLKEN as w, i (i)}
      <div
        class="himmelwolke"
        style:inset-block-start="{wasserFern - w.hoch * lage.horizontSkala * 2.2}px"
        style:inset-inline-start="calc({w.x}% + {lage.horizontX * 0.6}px)"
        style:inline-size="{w.b * lage.horizontSkala * 3.2}px"
        style:block-size="{w.b * lage.horizontSkala * 1.05}px"
        style:--n={i}
      ></div>
    {/each}
  {/if}
  {#if thema.boot && wasserFern > 20}
    {#each [18, 57, 83] as x, i (i)}
      <svg
        class="segel-fern"
        viewBox="0 0 10 12"
        aria-hidden="true"
        style:inset-block-start="{wasserFern - 11}px"
        style:inset-inline-start="calc({x}% + {lage.horizontX * 0.8}px)"
        style:--n={i}
      >
        <path d="M5 0 L5 10 L1 10 Z" />
        <path d="M5.6 2 L5.6 10 L9 10 Z" />
        <rect x="0" y="10.2" width="10" height="1.4" rx="0.7" />
      </svg>
    {/each}
  {/if}
  {#if regenbogen && stimmung !== 'nacht'}
    <div
      class="regenbogen"
      style:inset-block-start="{(wasserFern > 120 ? wasserFern : 220) - 200}px"
    ></div>
  {/if}
  <!-- Nebelbänke und Wolkenschatten: Wetterschicht, an der Welt (wandern mit der Kamera) -->
  <div
    class="welt"
    style:inline-size="{buehne.breite}px"
    style:block-size="{buehne.hoehe}px"
    style:transform="translate({kamera.x}px, {kamera.y}px) scale({kamera.zoom})"
  >
    <svg class="schaum" viewBox="0 0 {buehne.breite} {buehne.hoehe}" aria-hidden="true">
      {#if insel.spiegel}
        <defs>
          <linearGradient id="spiegelung" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0.55" stop-color="rgb(30 50 40)" stop-opacity="0.3" />
            <stop offset="1" stop-color="rgb(30 50 40)" stop-opacity="0" />
          </linearGradient>
        </defs>
        <polygon class="spiegelung" points={insel.spiegel} />
      {/if}
      <g class="inselrand">
        {#if insel.strand}
          <polygon class="strand" points={insel.strand} style:fill={thema.insel.strand} />
        {/if}
        <polygon class="wand" points={insel.wand} style:fill={thema.insel.wand} />
        <polygon class="oben" points={insel.oben} style:fill={thema.insel.oben} />
      </g>
      {#if thema.wasser}
        <!-- Schaum an der echten Küste, die Brandung schwillt an und ab -->
        <polygon class="kueste" points={insel.strand} />
        <polygon class="kueste ufer welle" points={insel.strand} />
      {/if}
      {#each schollen as s (s.i)}
        <polygon
          class="scholle"
          points="{s.x - 22},{s.y} {s.x - 8},{s.y - 9} {s.x + 16},{s.y - 7} {s.x + 24},{s.y +
            2} {s.x + 6},{s.y + 9} {s.x - 14},{s.y + 7}"
        />
      {/each}
    </svg>
    {#each bewuchs as w, i (i)}
      <img
        class="ding"
        src={w.src}
        alt=""
        style:inline-size="{w.breite}px"
        style:inset-inline-start="{w.x}px"
        style:inset-block-start="{w.y}px"
      />
    {/each}
    {#each ringe as r (r.i)}
      <span
        class="ring"
        style:inset-inline-start="{r.x - 10}px"
        style:inset-block-start="{r.y - 5}px"
        style:--n={r.i}
      ></span>
    {/each}
    {#each dinge as d, i (i)}
      <!-- Hinter dem Horizont liegt nichts: weit Entferntes sonst am Himmel (herausgezoomt) -->
      {@const sx = kamera.x + d.x * kamera.zoom}
      {@const sy = kamera.y + d.y * kamera.zoom}
      {#if sy > wasserFern + 8 && sy < fensterH + 260 && sx > -260 && sx < fensterB + 260}
        <img
          class="ding"
          class:flach={d.flach}
          class:tier={d.tier}
          src="{basis}dinge/{d.bild}.png"
          alt=""
          style:inline-size="{d.breite ?? DING_BREITE}px"
          style:inset-inline-start="{d.x}px"
          style:inset-block-start="{d.y}px"
          style:--n={i % 7}
          style:--dunst={d.dunst}
        />
      {/if}
    {/each}
    {#each schwaerme as f (f.n)}
      <img
        class="ding schwarm"
        src="{basis}dinge/fischschwarm.png"
        alt=""
        style:inline-size="{DING_BREITE * 1.3}px"
        style:inset-inline-start="{f.x}px"
        style:inset-block-start="{f.y}px"
        style:--n={f.n}
      />
    {/each}
    {#if satellit}
      <img
        class="ding satellit"
        src="{basis}dinge/satellit.png"
        alt=""
        style:inline-size="{DING_BREITE * 1.2}px"
        style:inset-inline-start="{satellit.x}px"
        style:inset-block-start="{satellit.y}px"
      />
    {/if}
    {#each moewen as m (m.n)}
      <span
        class="kreis"
        style:inset-inline-start="{m.x}px"
        style:inset-block-start="{m.y - 140}px"
        style:--r="{m.r}px"
        style:--d="{m.d}s"
        style:--n={m.n}
      >
        <svg class="moewe" viewBox="0 0 28 12" aria-hidden="true">
          <path d="M1 7 Q7 0 14 7 Q21 0 27 7" />
        </svg>
      </span>
    {/each}
    {#each falter as f (f.n)}
      <span
        class="kreis"
        style:inset-inline-start="{f.x}px"
        style:inset-block-start="{f.y - 30}px"
        style:--r="{f.r}px"
        style:--d="{f.d}s"
        style:--n={f.n}
      >
        <svg class="falter" viewBox="0 0 12 10" aria-hidden="true" style:--n={f.n}>
          <ellipse cx="3.4" cy="4" rx="3.2" ry="3.6" />
          <ellipse cx="8.6" cy="4" rx="3.2" ry="3.6" />
          <rect x="5.4" y="2" width="1.2" height="7" rx="0.6" class="leib" />
        </svg>
      </span>
    {/each}
    {#if thema.boot}
      <img
        class="ding boot"
        src="{basis}dinge/boot.png"
        alt=""
        style:inline-size="{DING_BREITE}px"
        style:inset-inline-start="{bootStart.x}px"
        style:inset-block-start="{bootStart.y}px"
        style:--boot-x="{bootZiel.x - bootStart.x}px"
        style:--boot-y="{bootZiel.y - bootStart.y}px"
      />
    {/if}
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
  .ferne {
    position: absolute;
    inset-inline: 0;
    opacity: 0.45;
    pointer-events: none;
  }

  .nacht .ferne {
    opacity: 0.25;
  }

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

  .schaum .inselrand polygon {
    stroke: none;
  }

  .schaum .inselrand .wand {
    filter: brightness(0.92);
  }

  .schaum polygon.kueste {
    fill: none;
    stroke: rgb(236 246 248 / 0.55);
    stroke-width: 7;
    stroke-linejoin: round;
  }

  .ding {
    --dunst: 0;
    position: absolute;
    block-size: auto;
    /* Fuß unten Mitte auf dem Platz */
    translate: -50% -100%;
    /* Luftperspektive: weit weg blasser, heller, etwas blau, kaum unscharf */
    filter: saturate(calc(1 - var(--dunst) * 0.5)) brightness(calc(1 + var(--dunst) * 0.14))
      hue-rotate(calc(var(--dunst) * 8deg)) blur(calc(var(--dunst) * 0.7px));
    opacity: calc(1 - var(--dunst) * 0.25);
  }

  .himmelwolke {
    position: absolute;
    border-radius: 50%;
    /* Weiß oben, leicht grau unten – so hebt sich die Wolke vom hellen Himmel ab */
    background:
      radial-gradient(ellipse 45% 55% at 32% 55%, rgb(255 255 255), transparent 70%),
      radial-gradient(ellipse 40% 60% at 60% 40%, rgb(255 255 255), transparent 70%),
      radial-gradient(ellipse 35% 45% at 80% 62%, rgb(250 252 255), transparent 70%),
      radial-gradient(ellipse 70% 40% at 50% 78%, rgb(196 210 226 / 0.9), transparent 75%);
    filter: blur(1.5px);
    opacity: 0.95;
  }

  .wetter-bewoelkt .himmelwolke,
  .wetter-regen .himmelwolke,
  .wetter-sturm .himmelwolke {
    filter: blur(3px) brightness(0.82) saturate(0.6);
    opacity: 1;
  }

  .daemmerung .himmelwolke {
    filter: blur(2px) sepia(0.4) brightness(0.85);
  }

  .nacht .himmelwolke {
    opacity: 0.18;
  }

  .segel-fern {
    position: absolute;
    inline-size: 9px;
    block-size: 11px;
    fill: rgb(244 244 240 / 0.85);
  }

  .segel-fern rect {
    fill: rgb(90 70 56 / 0.7);
  }

  .nacht .segel-fern {
    opacity: 0.3;
  }

  /* Flächen am Boden: Fuß in der Mitte, nicht unten */
  .ding.flach {
    translate: -50% -60%;
  }

  .kreis {
    position: absolute;
    inline-size: 0;
    block-size: 0;
  }

  .moewe {
    position: absolute;
    inline-size: 26px;
    block-size: 11px;
    translate: -50% -50%;
    fill: none;
    stroke: rgb(250 250 248);
    stroke-width: 2.2;
    stroke-linecap: round;
    stroke-linejoin: round;
    filter: drop-shadow(0 1px 0 rgb(60 70 80 / 0.45));
  }

  .falter {
    position: absolute;
    inline-size: 12px;
    block-size: 10px;
    translate: -50% -50%;
    fill: hsl(calc(20 + var(--n) * 70) 80% 62%);
  }

  .falter .leib {
    fill: rgb(60 50 44);
  }

  .daemmerung .moewe,
  .nacht .moewe {
    opacity: 0.5;
  }

  .nacht .falter {
    display: none;
  }

  .daemmerung .schaum {
    filter: brightness(0.8) sepia(0.15);
  }

  .daemmerung .ding {
    filter: brightness(calc(0.8 + var(--dunst) * 0.1)) sepia(0.15)
      saturate(calc(1 - var(--dunst) * 0.5)) blur(calc(var(--dunst) * 0.7px));
  }

  .nacht .schaum {
    filter: brightness(0.45) saturate(0.7);
  }

  .nacht .ding {
    filter: brightness(calc(0.45 - var(--dunst) * 0.1)) saturate(0.7)
      blur(calc(var(--dunst) * 0.7px));
  }

  /* —— Jahreszeiten (Wunsch PV 03.11.2026): Felder und Hügel folgen dem Kalender —— */
  .jz-fruehling:not(.wasser) .meer,
  .jz-fruehling .horizont {
    filter: saturate(1.15) brightness(1.06) hue-rotate(-6deg);
  }

  /* Inselrand folgt der Jahreszeit wie der Boden des Bauplatzes */
  .jz-fruehling .inselrand .oben {
    filter: saturate(1.15) brightness(1.06);
  }

  .jz-herbst .inselrand .oben {
    filter: sepia(0.4) saturate(1.1) hue-rotate(-18deg);
  }

  .wetter-schnee .inselrand .oben {
    filter: saturate(0.15) brightness(1.75) contrast(0.75);
  }

  .jz-winter .inselrand .oben {
    filter: saturate(0.25) brightness(1.5) contrast(0.8);
  }

  .jz-herbst:not(.wasser) .meer,
  .jz-herbst .horizont {
    filter: sepia(0.35) saturate(1.1) hue-rotate(-18deg) brightness(0.98);
  }

  .jz-winter:not(.wasser) .meer {
    filter: saturate(0.25) brightness(1.55) contrast(0.8);
  }

  .jz-winter .horizont {
    filter: saturate(0.3) brightness(1.4);
  }

  .jz-winter.wasser .meer {
    filter: saturate(0.75) brightness(0.95);
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
    block-size: 12rem;
    background: linear-gradient(rgb(255 255 255 / 0.7), rgb(255 255 255 / 0.25) 60%, transparent);
  }

  .wetter-sturm .schaum polygon.kueste:not(.welle) {
    stroke: rgb(244 250 252 / 0.8);
    stroke-width: 12;
  }

  .schaum .spiegelung {
    fill: url(#spiegelung);
    stroke: none;
  }

  .schaum .ufer {
    fill: none;
    stroke: rgb(240 248 250 / 0.7);
    stroke-width: 4;
    stroke-linejoin: round;
    stroke-linecap: round;
  }

  .schaum .ufer.welle {
    stroke: rgb(240 248 250 / 0.35);
    stroke-width: 9;
    opacity: 0.6;
  }

  .wetter-sturm .schaum .ufer.welle {
    stroke-width: 11;
    stroke: rgb(240 248 250 / 0.28);
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

    /* Wellen ziehen langsam (eine Kachel in 40 s); das Boot quert in 3 Minuten */
    .kulisse.bewegt.wasser .meer {
      animation: wellen 40s linear infinite;
    }

    .kulisse.bewegt .boot {
      animation: segeln 180s linear infinite;
    }

    /* Wellen laufen ans Ufer: der Schaum schwillt langsam an und ab */
    .kulisse.bewegt .ufer.welle {
      animation: brandung 5s ease-in-out infinite;
    }

    .kulisse.bewegt.wetter-sturm .ufer.welle {
      animation-duration: 2.4s;
    }

    .kulisse.bewegt .himmelwolke {
      animation: wolkenzug 160s ease-in-out infinite alternate;
      animation-delay: calc(var(--n) * -23s);
    }

    .kulisse.bewegt.wetter-sturm .himmelwolke {
      animation-duration: 50s;
    }

    .kulisse.bewegt .segel-fern {
      animation: wolkenzug 240s ease-in-out infinite alternate;
      animation-delay: calc(var(--n) * -70s);
    }

    /* Möwen und Schmetterlinge ziehen ruhige Kreise, Flügel schlagen */
    .kulisse.bewegt .kreis {
      animation: kreisen var(--d) linear infinite;
      animation-delay: calc(var(--n) * -7s);
    }

    .kulisse.bewegt .kreis > svg {
      animation: gegenkreisen var(--d) linear infinite;
      animation-delay: calc(var(--n) * -7s);
    }

    .kulisse.bewegt .moewe path {
      animation: fluegel 1.1s ease-in-out infinite alternate;
      transform-origin: 50% 60%;
    }

    .kulisse.bewegt .falter ellipse {
      animation: flattern 0.25s ease-in-out infinite alternate;
      transform-origin: 50% 50%;
    }

    .kulisse.bewegt .tier {
      animation: grasen 6s ease-in-out infinite;
      animation-delay: calc(var(--n) * -0.9s);
      transform-origin: 50% 100%;
    }

    .kulisse.bewegt .schwarm {
      animation: schwimmen 36s ease-in-out infinite alternate;
      animation-delay: calc(var(--n) * -12s);
    }

    .kulisse.bewegt .satellit {
      animation: umlauf 150s linear infinite;
    }
  }

  @keyframes kreisen {
    from {
      transform: rotate(0deg) translateX(var(--r));
    }
    to {
      transform: rotate(360deg) translateX(var(--r));
    }
  }

  @keyframes gegenkreisen {
    from {
      rotate: 0deg;
    }
    to {
      rotate: -360deg;
    }
  }

  @keyframes fluegel {
    from {
      transform: scaleY(1);
    }
    to {
      transform: scaleY(0.45);
    }
  }

  @keyframes flattern {
    from {
      transform: scaleX(1);
    }
    to {
      transform: scaleX(0.35);
    }
  }

  @keyframes grasen {
    0%,
    70%,
    100% {
      transform: rotate(0deg);
    }
    80% {
      transform: rotate(-2deg);
    }
    90% {
      transform: rotate(1.5deg);
    }
  }

  @keyframes schwimmen {
    from {
      transform: translate(-90px, 10px);
    }
    to {
      transform: translate(90px, -14px);
    }
  }

  @keyframes umlauf {
    from {
      transform: translate(0, 0);
    }
    to {
      transform: translate(900px, 260px);
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

  @keyframes brandung {
    0%,
    100% {
      opacity: 0.15;
      transform: translateY(0);
    }
    50% {
      opacity: 0.75;
      transform: translateY(3px);
    }
  }

  @keyframes wolkenzug {
    from {
      transform: translateX(-40px);
    }
    to {
      transform: translateX(40px);
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
