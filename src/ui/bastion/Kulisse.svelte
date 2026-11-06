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
  import { untrack } from 'svelte';
  import { buehneFuer, INSEL, punkt } from './grafik/iso';
  import { inselRand } from './grafik/insel-rand';
  import {
    cullKamera,
    cullRand,
    sichtKasten,
    sichtRand,
    DING_BREITE,
    HORIZONT,
    HORIZONT_ABSTAND,
    HORIZONT_SKALA,
    HORIZONT_WASSERLINIE,
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
  /**
   * Ferne Schicht (GRAFIK §30): Horizont, Sterne, Wolken, Dunst und Abendton liegen in einem
   * Behälter, den nur eine Transform bewegt (Parallaxe, Höhe und Maßstab aus `kulissenLage`).
   * Der Ursprung ist die Horizontlinie; die Wasserlinie des Bands liegt WASSER darüber.
   */
  const lage = $derived(kulissenLage(kamera, inselOben));
  const fernTransform = $derived(
    `translate(${lage.horizontX}px, ${lage.horizontY}px) scale(${lage.horizontSkala})`,
  );
  const WASSER = HORIZONT_WASSERLINIE;
  /** Größe des Fensters: Dinge weit außerhalb werden nicht gezeichnet (bis zu 270 Plätze) */
  let fensterB = $state(800);
  let fensterH = $state(1200);
  /**
   * Culling mit Abstand (GRAFIK §30): Die Dinge werden nach dieser Kamera ein- und
   * ausgeblendet. Sie folgt der echten Kamera erst nach einem Viertel Fenster oder 10 % Zoom,
   * dazwischen bewegt der Browser nur die fertige Ebene.
   */
  let cull = $state<Kamera>({ x: 0, y: 0, zoom: 1 });
  $effect(() => {
    const neu = cullKamera(
      untrack(() => cull),
      kamera,
      { breite: fensterB, hoehe: fensterH },
    );
    if (neu !== untrack(() => cull)) cull = neu;
  });
  const cullLage = $derived(kulissenLage(cull, inselOben));
  /** Wasserlinie im Fenster nach der Cull-Kamera: dahinter liegt nichts */
  const cullWasser = $derived(cullLage.horizontY - WASSER * cullLage.horizontSkala);
  /** Welche Dinge ins Bild kommen: großzügig, auch was nur mit dem Bild hereinragt */
  const rand = $derived(cullRand({ breite: fensterB, hoehe: fensterH }));
  /** Rand des Sichtkastens (GRAFIK §32): knapp, die Cull-Kamera springt rechtzeitig */
  const kastenRand = $derived(sichtRand({ breite: fensterB, hoehe: fensterH }));
  /** Oberkante der Wellenkachel in der Welt: knapp unter der Horizontlinie */
  const meerOben = $derived(inselOben - HORIZONT_ABSTAND + 60);
  /**
   * Waagrecht gleichförmige Bänder der Ferne (Wasser unter der Linie, Dunst, Luftperspektive,
   * Abendton) liegen in der Welt-Ebene statt in einer eigenen: Lage und Länge in
   * Bühnen-Bildpunkten aus der Cull-Kamera; zwischen zwei Sprüngen weichen sie höchstens
   * um den Zoom-Drift von 10 % ab, was man bei gleichförmigen Bändern nicht sieht.
   */
  const bandY = (u: number) =>
    (cullLage.horizontY + u * cullLage.horizontSkala - cull.y) / cull.zoom;
  const bandMass = $derived(cullLage.horizontSkala / cull.zoom);
  const wasserOben = $derived(bandY(-WASSER));
  const himmel = $derived(thema.himmel[stimmung]);
  const meer = $derived(thema.grund[stimmung]);
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
  /** Höchstes Ding über seinem Fuß (Bilder sind höchstens so hoch wie breit) */
  const dingHoch = $derived(
    Math.max(DING_BREITE, ...dinge.map((d) => d.breite ?? DING_BREITE)) + 16,
  );
  /**
   * Sichtkasten in der Welt (GRAFIK §30, §32): Fenster plus Rand nach der Cull-Kamera, in
   * Bühnen-Bildpunkten. Nur dieser Kasten wird als Ebene gehalten; er wandert erst mit,
   * wenn die Cull-Kamera springt. Oben endet er über der Wasserlinie, so hoch wie das
   * höchste Ding: Darüber liegt in der Welt nichts (der Himmel ist die Ferne).
   */
  const sicht = $derived(
    sichtKasten(cull, { breite: fensterB, hoehe: fensterH }, kastenRand, {
      oben: bandY(-WASSER - 4) - dingHoch,
    }),
  );
  /**
   * Dasselbe für die ferne Schicht, in Band-Bildpunkten. Unten endet er mit dem
   * Horizont-Band; herangezoomt liegt die Ferne ganz über dem Fenster (Höhe 0, keine Ebene).
   */
  const fernSicht = $derived(
    sichtKasten(
      { x: cullLage.horizontX, y: cullLage.horizontY, zoom: cullLage.horizontSkala },
      { breite: fensterB, hoehe: fensterH },
      kastenRand,
      { unten: HORIZONT.hoehe - HORIZONT.wasser },
    ),
  );
  const meerGrund = $derived.by(() => {
    const oben = Math.max(sicht.y0, wasserOben);
    return { oben, hoehe: Math.max(0, sicht.y0 + sicht.h - oben) };
  });
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
  style:background="linear-gradient({himmel[0]}, {himmel[1]} 40%, {himmel[1]})"
  style:--meer={meer}
>
  <!-- Ferne Schicht: nur ihre Transform ändert sich mit der Kamera (GRAFIK §30) -->
  <div class="fern" style:transform={fernTransform}>
    <!-- Herangezoomt liegt die Ferne ganz über dem Fenster: dann keine Ebene (GRAFIK §32) -->
    {#if fernSicht.h > 0}
      <div
        class="sicht"
        style:inset-inline-start="{fernSicht.x0}px"
        style:inset-block-start="{fernSicht.y0}px"
        style:inline-size="{fernSicht.b}px"
        style:block-size="{fernSicht.h}px"
      >
        <div class="versatz" style:translate="{-fernSicht.x0}px {-fernSicht.y0}px">
          {#if sterneZeigen}
            <div
              class="sterne"
              style:background-image="url({pfad}sterne.png)"
              style:background-size="{STERNE / HORIZONT_SKALA}px {STERNE / HORIZONT_SKALA}px"
            ></div>
          {/if}
          <div
            class="horizont"
            style:inset-block-start="{-HORIZONT.wasser}px"
            style:block-size="{HORIZONT.hoehe}px"
            style:background-image="url({pfad}horizont.png)"
            style:background-size="{HORIZONT.breite}px {HORIZONT.hoehe}px"
          ></div>
          <!-- Himmel über dem Horizont (PV: „hinterm Horizont ist nichts“): ruhige Wolken,
         weit weg, sie wandern beim Verschieben nur wenig mit -->
          {#if himmelWolken}
            {#each WOLKEN as w, i (i)}
              <div
                class="himmelwolke"
                style:inset-block-start="{-WASSER - w.hoch * 2.2}px"
                style:inset-inline-start="{(w.x - 50) * 24}px"
                style:inline-size="{w.b * 3.2}px"
                style:block-size="{w.b * 1.05}px"
                style:--n={i}
              ></div>
            {/each}
          {/if}
          {#if thema.boot}
            {#each [18, 57, 83] as x, i (i)}
              <svg
                class="segel-fern"
                viewBox="0 0 10 12"
                aria-hidden="true"
                style:inset-block-start="{-WASSER - 11}px"
                style:inset-inline-start="{(x - 50) * 24}px"
                style:--n={i}
              >
                <path d="M5 0 L5 10 L1 10 Z" />
                <path d="M5.6 2 L5.6 10 L9 10 Z" />
                <rect x="0" y="10.2" width="10" height="1.4" rx="0.7" />
              </svg>
            {/each}
          {/if}
          {#if regenbogen && stimmung !== 'nacht'}
            <div class="regenbogen" style:inset-block-start="{-WASSER - 200}px"></div>
          {/if}
        </div>
      </div>
    {/if}
  </div>
  <!-- Nebelbänke und Wolkenschatten: Wetterschicht, an der Welt (wandern mit der Kamera) -->
  <div
    class="welt"
    style:inline-size="{buehne.breite}px"
    style:block-size="{buehne.hoehe}px"
    style:transform="translate({kamera.x}px, {kamera.y}px) scale({kamera.zoom})"
  >
    <div
      class="sicht"
      style:inset-inline-start="{sicht.x0}px"
      style:inset-block-start="{sicht.y0}px"
      style:inline-size="{sicht.b}px"
      style:block-size="{sicht.h}px"
    >
      <div class="versatz" style:translate="{-sicht.x0}px {-sicht.y0}px">
        <!-- Meer als Fläche in der Welt (GRAFIK §30): bewegt sich mit der Insel, ohne Neuzeichnen.
         Oben beginnt sie unter der Horizontlinie; die Lücke deckt das Wasserband der Ferne. -->
        {#if meerGrund.hoehe > 0}
          <div
            class="meer-grund"
            style:inset-inline-start="{sicht.x0}px"
            style:inline-size="{sicht.b}px"
            style:inset-block-start="{meerGrund.oben}px"
            style:block-size="{meerGrund.hoehe}px"
          >
            <div
              class="meer"
              style:inset-block-start="{Math.max(0, meerOben - meerGrund.oben)}px"
              style:background-image="url({pfad}meer.png)"
              style:background-size="{MEER.breite}px {MEER.hoehe}px"
              style:--meer-weg="{MEER.breite}px"
            ></div>
          </div>
        {/if}
        <svg
          class="schaum"
          viewBox="0 0 {buehne.breite} {buehne.hoehe}"
          style:inline-size="{buehne.breite}px"
          style:block-size="{buehne.hoehe}px"
          aria-hidden="true"
        >
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
            srcset="{w.src} 1x, {w.src.replace(/\.png$/, '@2x.png')} 2x"
            alt=""
            style:inline-size="{w.breite}px"
            style:inset-inline-start="{w.x}px"
            style:inset-block-start="{w.y}px"
          />
        {/each}
        {#each dinge as d, i (i)}
          <!-- Hinter dem Horizont liegt nichts: weit Entferntes sonst am Himmel (herausgezoomt) -->
          {@const sx = cull.x + d.x * cull.zoom}
          {@const sy = cull.y + d.y * cull.zoom}
          {#if sy > cullWasser + 8 && sy < fensterH + rand && sx > -rand && sx < fensterB + rand}
            <img
              class="ding"
              class:flach={d.flach}
              class:tier={d.tier}
              class:gespiegelt={d.gespiegelt}
              src="{basis}dinge/{d.bild}.png"
              srcset="{basis}dinge/{d.bild}.png 1x, {basis}dinge/{d.bild}@2x.png 2x"
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
            srcset="{basis}dinge/fischschwarm.png 1x, {basis}dinge/fischschwarm@2x.png 2x"
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
            srcset="{basis}dinge/satellit.png 1x, {basis}dinge/satellit@2x.png 2x"
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
            srcset="{basis}dinge/boot.png 1x, {basis}dinge/boot@2x.png 2x"
            alt=""
            style:inline-size="{DING_BREITE}px"
            style:inset-inline-start="{bootStart.x}px"
            style:inset-block-start="{bootStart.y}px"
            style:--boot-x="{bootZiel.x - bootStart.x}px"
            style:--boot-y="{bootZiel.y - bootStart.y}px"
          />
        {/if}
        <!-- Über Meer, Inselrand und Dingen: Dunst und Luftperspektive am Horizont, abends die
             Tönung unter der Wasserlinie (eine Fläche, kein Filter je Bild, §24) -->
        <div
          class="band dunst"
          style:inset-inline-start="{sicht.x0}px"
          style:inline-size="{sicht.b}px"
          style:inset-block-start="{bandY(-WASSER - 4)}px"
          style:block-size="{(wetter === 'nebel' ? 192 : 48) * bandMass}px"
        ></div>
        <div
          class="band ferne"
          style:inset-inline-start="{sicht.x0}px"
          style:inline-size="{sicht.b}px"
          style:inset-block-start="{wasserOben}px"
          style:block-size="{HORIZONT.hoehe * 2.4 * bandMass}px"
          style:background="linear-gradient({himmel[1]}, transparent)"
        ></div>
        {#if stimmung !== 'tag'}
          <div
            class="band abendton"
            style:inset-inline-start="{sicht.x0}px"
            style:inline-size="{sicht.b}px"
            style:inset-block-start="{meerGrund.oben}px"
            style:block-size="{meerGrund.hoehe}px"
          ></div>
        {/if}
        <!-- Tropfenringe zuletzt (GRAFIK §32): Sie schwellen als eigene Ebenen; lägen Dinge
             darüber, bekämen die eine gemeinsame Sammelebene (bei Regen bis 41 MB). Die
             Tönung von Abend und Nacht steckt darum in der Farbe der Ringe. -->
        {#each ringe as r (r.i)}
          <span
            class="ring"
            style:inset-inline-start="{r.x - 10}px"
            style:inset-block-start="{r.y - 5}px"
            style:--n={r.i}
          ></span>
        {/each}
      </div>
    </div>
  </div>
</div>

<style>
  .kulisse {
    position: absolute;
    inset: 0;
    overflow: hidden;
    pointer-events: none;
  }

  /* Ferne Schicht (GRAFIK §30): Ursprung auf der Horizontlinie, Maßstab des Bands; der
     Browser bewegt sie als fertige Ebene (will-change), nichts darin wird je Schritt neu
     ausgerichtet. Breite FERN_BREITE, mittig um 0 (Parallaxe ein Viertel der Kamera). */
  .fern {
    position: absolute;
    inset-block-start: 0;
    inset-inline-start: 0;
    inline-size: 0;
    block-size: 0;
    transform-origin: 0 0;
    pointer-events: none;
  }

  /* Sichtkasten (GRAFIK §30): die einzige Ebene, die der Browser für Welt und Ferne hält –
     Fenster plus Rand, beschnitten, als fertige Ebene bewegt (will-change). Alles darin
     behält seine Welt-Koordinaten über den Versatz. Größe und Lage ändern sich nur, wenn
     die Cull-Kamera springt. */
  .sicht {
    position: absolute;
    overflow: clip;
    will-change: transform;
  }

  .versatz {
    position: absolute;
    inset: 0;
  }

  .sterne,
  .horizont {
    position: absolute;
    inset-inline-start: -3072px;
    inline-size: 6144px;
  }

  .band {
    position: absolute;
  }

  .sterne,
  .horizont,
  .ferne {
    opacity: 0.45;
  }

  .nacht .ferne {
    opacity: 0.25;
  }

  .sterne {
    inset-block-start: -4096px;
    block-size: 4070px;
    background-repeat: repeat;
  }

  .horizont {
    background-repeat: repeat-x;
  }

  .dunst {
    background: linear-gradient(rgb(255 255 255 / 0.22), transparent);
  }

  /* Meer in der Welt: Grundfarbe und darüber die Wellenkachel; die Wellen ziehen als
     Transform der Kachel-Ebene (Compositor), nicht als Neuzeichnen des Musters. */
  .meer-grund {
    position: absolute;
    background: var(--meer);
    overflow: hidden;
  }

  .meer {
    position: absolute;
    inset: 0;
    opacity: 0.45;
    background-repeat: repeat;
  }

  .welt {
    position: absolute;
    inset-block-start: 0;
    inset-inline-start: 0;
    transform-origin: 0 0;
  }

  .schaum {
    position: absolute;
    inset-block-start: 0;
    inset-inline-start: 0;
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
    /* Luftperspektive: weit weg blasser – nur über die Deckkraft, ohne Filter. Ein Filter
       je Bild gab jedem der bis zu 270 Dinge eine eigene Grafikebene; beim Zoomen lief
       der Speicher auf dem iPhone über und die App stürzte ab (PV 03.11.2026). */
    opacity: calc(1 - var(--dunst) * 0.35);
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

  /* Seitenverkehrt (feste Wahl je Platz): ruhend, also keine eigene Grafikebene */
  .ding.gespiegelt {
    scale: -1 1;
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

  /* Abend und Nacht: eine Tönung in Fenstergröße über Meer, Inselrand und Dingen statt
     eines Filters an jedem Bild (Speicher, siehe .ding) */

  .daemmerung .abendton {
    background: rgb(70 36 20 / 0.2);
  }

  .nacht .abendton {
    background: rgb(6 12 30 / 0.52);
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

  /* Ringfarbe mit dem Abendton darüber gemischt (Tönung über Farbe c: Ton·α + c·(1 − α)),
     weil die Ringe über dem Abendton liegen – gleiches Bild wie vorher */
  .daemmerung .ring {
    border-color: rgb(203 204 202 / 0.55);
  }

  .nacht .ring {
    border-color: rgb(116 124 135 / 0.55);
  }

  .regenbogen {
    position: absolute;
    inset-inline-start: -700px;
    inline-size: 1400px;
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
      animation: wellen 40s steps(128) infinite;
    }

    .kulisse.bewegt .boot {
      animation: segeln 180s linear infinite;
    }

    /* Wellen laufen ans Ufer: der Schaum schwillt langsam an und ab */
    /* In Stufen: der Browser malt die Küste nur ein paar Mal je Sekunde neu */
    .kulisse.bewegt .ufer.welle {
      animation: brandung 5s steps(10) infinite;
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

  /* In Stufen: eine Kachel in 40 s, der Browser malt das Meer nur gut dreimal je Sekunde neu */
  @keyframes wellen {
    from {
      background-position: 0 0;
    }
    to {
      background-position: var(--meer-weg) 0;
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

  /* Nur die Strichdeckkraft, keine Verschiebung: eine Verschiebung bekäme eine eigene
     Grafikebene, die beim Zoomen mitwächst (Absturz auf dem iPhone, PV 03.11.2026) */
  @keyframes brandung {
    0%,
    100% {
      stroke-opacity: 0.25;
    }
    50% {
      stroke-opacity: 1;
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
