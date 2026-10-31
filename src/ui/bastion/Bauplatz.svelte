<script lang="ts">
  // Bauplatz als Grafik (Schritte 2.12–2.13): lädt PixiJS erst hier nach – nur wer
  // die Bastion bei eingeschaltetem Basebau öffnet und das Bild zeigt, lädt es (R7, A3).
  // Antippen wählt ein Gebäude; „Versetzen“ und dann ein freies Feld antippen versetzt
  // es. Die Liste darunter zeigt dasselbe und ist die gleichwertige, barrierefreie Ansicht.
  import { untrack } from 'svelte';
  import { darstellung } from '../grafik/darstellung.svelte';
  import { einlagerbar, platzHindernisse, type Bastion } from '../../core/bastion/bauen';
  import { BAUPLATZ, KATALOG, type Bauwerk, type Position } from '../../core/bastion/katalog';
  import {
    bastionLeicht,
    bastionRuhig,
    bastionSound,
    bildZeigen,
    zoomSetzen,
    zoomWahl,
    type BauAuftrag,
  } from '../plattform/ablage';
  import { soundSteuern, soundTipp, ambientStoppen } from './sound/sound';
  import { bewegungAus, type Bewegung } from './grafik/atmosphaere';
  import { bildartVonThema } from './grafik/bildart';
  import type { Ansicht, Buehne, Farben } from './grafik/grafik-buehne';
  import { buehneBreite, buehneHoehe } from './grafik/iso';
  import { farbenMitJahreszeit, jahreszeitAusDatum, schattieren } from './grafik/jahreszeit';
  import { sonnenzeitenMitteleuropa, szeneAbend } from './grafik/sonne';
  import type { WetterBild } from './grafik/wetter';
  import { szeneWetterLaden } from './grafik/wetter-stand';
  import {
    ZIEH_SCHWELLE,
    ZOOM_RAD,
    einpassen,
    zentriert,
    zoomAn,
    type Kamera,
  } from './grafik/kamera';
  import { aktiv, gebaeudeName, tt } from './thema.svelte';
  import FarbWahl from './FarbWahl.svelte';
  import Symbol from '../grafik/Symbol.svelte';
  import type { HinterhofFeld } from '../../core/learning/hinterhof';
  import { hinterhofMitte } from './grafik/hinterhof-szene';
  import { epocheOptik, farbeSkalieren } from './grafik/epoche-optik';
  import type { Epoche } from '../../core/bastion/epochen';

  let {
    bastion,
    onaktion,
    hinterhofFelder = [],
    bauplatz = BAUPLATZ,
    epoche = 1 as Epoche,
    spannung = false,
  }: {
    bastion: Bastion;
    onaktion: (a: BauAuftrag) => Promise<boolean>;
    hinterhofFelder?: readonly HinterhofFeld[];
    /** Aktive Bauplatzgröße nach Epoche (BASEBAU §5.5) */
    bauplatz?: { readonly breite: number; readonly tiefe: number };
    /** Freigeschaltete Epoche für Optik (G10) */
    epoche?: Epoche;
    /** Bewährungsprobe: Spannungs-Himmel (G11) */
    spannung?: boolean;
  } = $props();

  let rahmen = $state<HTMLDivElement | undefined>(undefined);
  let buehne = $state<Buehne | undefined>(undefined);
  let fehlgeschlagen = $state(false);
  /** Bild zeigen (Einstellung `basebau.bild`); aus = reizarm, PixiJS wird nicht geladen */
  let zeigen = $state<boolean | undefined>(undefined);
  void bildZeigen().then((z) => (zeigen = z));
  /** Fenster-Hintergrund = Pixi-Himmel, damit kein Karten-Rand aus Farbdifferenz entsteht */
  let himmelCss = $state('var(--farbe-himmel)');

  /** GRAFIK §4.5: ruhig / leicht / System-Ruhe; §4.6 Sound */
  let ruhig = $state(false);
  let leicht = $state(false);
  let systemRuhe = $state(false);
  let soundAn = $state(false);
  void bastionRuhig().then((z) => (ruhig = z));
  void bastionLeicht().then((z) => (leicht = z));
  void bastionSound().then((z) => (soundAn = z));
  const bewegung = $derived(bewegungAus({ ruhig, leicht, systemRuhe }));
  $effect(() => {
    soundSteuern({ an: soundAn, ruhig: ruhig || systemRuhe });
    return () => ambientStoppen();
  });

  /** Lokale Zeit für Jahreszeit und Sonne; jede Minute aktualisieren (GRAFIK §4.3). */
  let jetzt = $state(new Date());
  $effect(() => {
    const id = setInterval(() => (jetzt = new Date()), 60_000);
    return () => clearInterval(id);
  });
  const jahreszeit = $derived(jahreszeitAusDatum(jetzt));
  let wetterBild = $state<WetterBild>('klar');
  let wetterSonne = $state<ReturnType<typeof sonnenzeitenMitteleuropa> | undefined>(undefined);
  $effect(() => {
    const d = jetzt;
    let abgebrochen = false;
    void szeneWetterLaden(d).then((s) => {
      if (abgebrochen) return;
      wetterBild = s.bild;
      wetterSonne = s.sonne;
    });
    return () => {
      abgebrochen = true;
    };
  });
  const abend = $derived(
    szeneAbend(darstellung.modus, jetzt, wetterSonne ?? sonnenzeitenMitteleuropa(jetzt)),
  );

  $effect(() => {
    if (typeof matchMedia !== 'function') return;
    const m = matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => (systemRuhe = m.matches);
    sync();
    m.addEventListener('change', sync);
    return () => m.removeEventListener('change', sync);
  });

  /** Kamera wie in Dorfkrieg: stufenlos, zum Zeiger, Ziehen verschiebt.
   * Ein gemerkter Zoom (`basebau.zoom`) wird in die Mitte gelegt, sonst das ganze Bild. */
  let kamera = $state<Kamera>({ x: 0, y: 0, zoom: 1 });
  let fenster = $state<HTMLDivElement | undefined>(undefined);
  let kameraSichtbar = $state(false);
  let zieht = $state(false);
  let gewaehlterZoom = $state<number | undefined>(undefined);
  let zoomGeladen = $state(false);
  /** Der Nutzer hat selbst gezoomt oder gezogen – dann nicht beim Größenwechsel neu einpassen. */
  let eigene = false;
  let kameraGestartet = false;
  void zoomWahl().then((z) => {
    gewaehlterZoom = z;
    zoomGeladen = true;
  });

  function imFenster(clientX: number, clientY: number) {
    const el = fenster;
    if (!el) return { x: 0, y: 0 };
    const r = el.getBoundingClientRect();
    return { x: clientX - r.left, y: clientY - r.top };
  }

  let merkenTimer: ReturnType<typeof setTimeout> | undefined;
  function merken() {
    clearTimeout(merkenTimer);
    merkenTimer = setTimeout(() => void zoomSetzen(kamera.zoom), 200);
  }

  $effect(() => {
    const el = fenster;
    if (!el || !zoomGeladen) return;
    const setzen = () => {
      const breite = el.clientWidth;
      const hoehe = el.clientHeight;
      if (breite === 0 || hoehe === 0) return false;
      const gewaehlt = gewaehlterZoom;
      if (!kameraGestartet && gewaehlt !== undefined) {
        eigene = true;
        kamera = zentriert(breite, hoehe, gewaehlt);
      } else if (!eigene) {
        kamera = einpassen(breite, hoehe);
      }
      kameraSichtbar = true;
      return true;
    };
    if (!kameraGestartet) kameraGestartet = setzen();
    const beobachter = new ResizeObserver(() => {
      if (!kameraGestartet) kameraGestartet = setzen();
      else if (!eigene) setzen();
    });
    beobachter.observe(el);
    const rad = (event: WheelEvent) => {
      event.preventDefault();
      const ort = imFenster(event.clientX, event.clientY);
      eigene = true;
      kamera = zoomAn(
        kamera,
        ort.x,
        ort.y,
        kamera.zoom * (event.deltaY > 0 ? 1 / ZOOM_RAD : ZOOM_RAD),
      );
      merken();
    };
    el.addEventListener('wheel', rad, { passive: false });
    return () => {
      beobachter.disconnect();
      el.removeEventListener('wheel', rad);
    };
  });

  /** Bewusst kein SvelteMap: das ist nur die Geste, nicht der angezeigte Zustand. */
  let zeiger: Record<number, { x: number; y: number }> = {};
  let zieh: { x: number; y: number; bewegt: boolean; taste: number } | null = null;
  let kniff: { abstand: number; x: number; y: number } | null = null;

  const zeigerAnzahl = () => Object.keys(zeiger).length;

  function zeigerWeg(id: number) {
    const neu: typeof zeiger = {};
    for (const schluessel of Object.keys(zeiger)) {
      if (Number(schluessel) === id) continue;
      const punkt = zeiger[Number(schluessel)];
      if (punkt) neu[Number(schluessel)] = punkt;
    }
    zeiger = neu;
  }

  function kniffJetzt() {
    const punkte = Object.values(zeiger);
    const a = punkte[0];
    const b = punkte[1];
    if (!a || !b) return null;
    return {
      abstand: Math.hypot(a.x - b.x, a.y - b.y),
      x: (a.x + b.x) / 2,
      y: (a.y + b.y) / 2,
    };
  }

  function zeigerRunter(event: PointerEvent) {
    const el = fenster;
    if (!el) return;
    el.setPointerCapture(event.pointerId);
    zeiger[event.pointerId] = { x: event.clientX, y: event.clientY };
    if (zeigerAnzahl() === 1) {
      zieh = { x: event.clientX, y: event.clientY, bewegt: false, taste: event.button };
      kniff = null;
    } else {
      zieh = null;
      kniff = kniffJetzt();
    }
  }

  function zeigerBewegt(event: PointerEvent) {
    const vorher = zeiger[event.pointerId];
    if (!vorher) return;
    zeiger[event.pointerId] = { x: event.clientX, y: event.clientY };
    if (zeigerAnzahl() >= 2 && kniff) {
      const naechstes = kniffJetzt();
      if (naechstes && kniff.abstand > 0) {
        const ort = imFenster(naechstes.x, naechstes.y);
        const gezoomt = zoomAn(
          kamera,
          ort.x,
          ort.y,
          kamera.zoom * (naechstes.abstand / kniff.abstand),
        );
        kamera = {
          zoom: gezoomt.zoom,
          x: gezoomt.x + (naechstes.x - kniff.x),
          y: gezoomt.y + (naechstes.y - kniff.y),
        };
        kniff = naechstes;
        eigene = true;
        zieht = true;
        merken();
      }
      return;
    }
    if (!zieh) return;
    if (Math.hypot(event.clientX - zieh.x, event.clientY - zieh.y) > ZIEH_SCHWELLE)
      zieh.bewegt = true;
    // Beim Versetzen verschiebt die linke Taste (und der Finger) nicht – ein Tipp setzt.
    // Rechte und mittlere Taste verschieben weiter, zwei Finger auch.
    const verschieben = zieh.taste === 1 || zieh.taste === 2 || (zieh.taste === 0 && !versetzen);
    if (verschieben && zieh.bewegt) {
      kamera = {
        ...kamera,
        x: kamera.x + (event.clientX - vorher.x),
        y: kamera.y + (event.clientY - vorher.y),
      };
      eigene = true;
      zieht = true;
    }
  }

  function zeigerHoch(event: PointerEvent) {
    zeigerWeg(event.pointerId);
    if (zeigerAnzahl() < 2) kniff = null;
    const war = zieh;
    if (zeigerAnzahl() === 0) {
      zieh = null;
      zieht = false;
    }
    if (war && zeigerAnzahl() === 0 && !war.bewegt && war.taste === 0) void angetippt(event);
  }

  function zeigerAbbruch(event: PointerEvent) {
    zeigerWeg(event.pointerId);
    zieh = null;
    kniff = null;
    zieht = false;
  }

  let auswahl = $state<string | undefined>(undefined);
  let versetzen = $state(false);
  let ziel = $state<Position | undefined>(undefined);
  let hinweis = $state<'kein-platz' | undefined>(undefined);

  const gewaehlt = $derived(bastion.bauwerke.find((b) => b.id === auswahl));

  function farben(): Farben {
    const css = getComputedStyle(document.documentElement);
    const v = (name: string) => css.getPropertyValue(name).trim() || '#888888';
    const himmelRoh = v('--farbe-himmel');
    const himmel =
      wetterBild === 'nebel'
        ? schattieren(himmelRoh, -25)
        : wetterBild === 'regen' || wetterBild === 'schnee'
          ? schattieren(himmelRoh, -18)
          : wetterBild === 'bewoelkt'
            ? schattieren(himmelRoh, -10)
            : himmelRoh;
    const optik = epocheOptik(epoche);
    const basis: Farben = {
      boden: farbeSkalieren(v('--bastion-boden'), optik.bodenFaktor),
      raster: v('--bastion-raster'),
      linie: v('--bastion-linie'),
      imBau: v('--farbe-akzent'),
      auswahl: v('--farbe-akzent'),
      himmel,
      licht: v('--farbe-licht'),
      wolke: v('--farbe-flaeche'),
      dach: v('--farbe-akzent-warm'),
      // Szene-Abend nach Sonne/Modus, nicht nur UI-Tokens (GRAFIK §4.3)
      abend,
      jahreszeit,
      wetter: wetterBild,
      spannung,
      familie: {
        kern: farbeSkalieren(v('--bastion-kern'), optik.wandFaktor),
        wissen: farbeSkalieren(v('--bastion-wissen'), optik.wandFaktor),
        verteidigung: farbeSkalieren(v('--bastion-verteidigung'), optik.wandFaktor),
        bau: farbeSkalieren(v('--bastion-bau'), optik.wandFaktor),
        zierde: v('--bastion-zierde'),
      },
    };
    return farbenMitJahreszeit(basis, jahreszeit);
  }

  $effect(() => {
    const ort = rahmen;
    if (!ort) return;
    // Neu zeichnen bei Modus, Jahreszeit, Abend, Wetter, Thema (GRAFIK §2, §4.3, §6).
    void darstellung.modus;
    void jahreszeit;
    void abend;
    void wetterBild;
    void bauplatz.breite;
    void bauplatz.tiefe;
    void epoche;
    void spannung;
    himmelCss = farben().himmel;
    const bildart = bildartVonThema(aktiv.thema);
    let abgebrochen = false;
    let erstellt: Buehne | undefined;
    // Bewegung nur als Startwert (ohne Tracking); Wechsel über setzeBewegung
    const start: Bewegung = untrack(() => bewegung);
    const platz = untrack(() => bauplatz);
    import('./grafik/grafik-buehne')
      .then((m) =>
        m.buehneErstellen(
          ort,
          farben(),
          bildart,
          start,
          untrack(() => aktiv.thema),
          platz,
        ),
      )
      .then((b) => {
        if (abgebrochen) b.zerstoere();
        else buehne = erstellt = b;
      })
      .catch(() => (fehlgeschlagen = true));
    return () => {
      abgebrochen = true;
      erstellt?.zerstoere();
      buehne = undefined;
      // Aufbau kann schon ein Canvas angehängt haben, bevor die Promise fertig ist
      ort.querySelectorAll(':scope > canvas').forEach((c) => c.remove());
    };
  });

  $effect(() => {
    buehne?.setzeBewegung(bewegung);
  });

  let blick = $state<'bauplatz' | 'hinterhof'>('bauplatz');

  function blickWechseln(zielBlick: 'bauplatz' | 'hinterhof') {
    blick = zielBlick;
    const el = fenster;
    if (!el) return;
    eigene = true;
    if (zielBlick === 'hinterhof' && hinterhofFelder.length > 0) {
      const m = hinterhofMitte(hinterhofFelder.length);
      // Bildpunkt in die Fenstermitte legen
      kamera = {
        x: el.clientWidth / 2 - m.x * kamera.zoom,
        y: el.clientHeight / 2 - m.y * kamera.zoom,
        zoom: Math.max(kamera.zoom, 1),
      };
    } else {
      kamera = einpassen(el.clientWidth, el.clientHeight);
    }
    kameraSichtbar = true;
  }

  $effect(() => {
    const g = gewaehlt;
    const a: Ansicht = {
      ...(g ? { auswahl: g.id } : {}),
      ...(g && versetzen && ziel
        ? {
            ziel: {
              pos: ziel,
              typ: g.typ,
              frei: platzHindernisse(bastion, g.typ, ziel, g.id, bauplatz).length === 0,
            },
          }
        : {}),
      ...(hinterhofFelder.length > 0 ? { hinterhof: hinterhofFelder } : {}),
      epoche,
    };
    buehne?.zeichne(bastion, a);
  });

  /** Gebäude, das ein Feld belegt (auch mehrfeldrige) */
  function auf(pos: Position): Bauwerk | undefined {
    return bastion.bauwerke.find((b) => {
      const [w, t] = KATALOG[b.typ].groesse;
      return pos.x >= b.pos.x && pos.x < b.pos.x + w && pos.y >= b.pos.y && pos.y < b.pos.y + t;
    });
  }

  async function angetippt(e: PointerEvent) {
    // Wesen zuerst (GRAFIK §4.4) – kurze Reaktion, kein Gebäude wählen
    const wid = buehne?.wesenBei(e.clientX, e.clientY);
    if (wid && !versetzen) {
      buehne?.tippeWesen(wid);
      soundTipp('wesen');
      return;
    }
    const pos = buehne?.feldBei(e.clientX, e.clientY);
    if (!pos) return;
    hinweis = undefined;
    const g = gewaehlt;
    if (versetzen && g) {
      ziel = pos;
      if (platzHindernisse(bastion, g.typ, pos, g.id, bauplatz).length > 0) {
        hinweis = 'kein-platz';
        return;
      }
      if (await onaktion({ art: 'versetzen', gebaeude: g.id, pos })) {
        versetzen = false;
        ziel = undefined;
        soundTipp('aufstellen');
      }
      return;
    }
    auswahl = auf(pos)?.id;
  }
</script>

{#if zeigen !== undefined && zeigen && !fehlgeschlagen}
  <!-- Die Grafik ist für Screenreader ausgeblendet: Die Liste in den Einstellungen zeigt alles. -->
  <div class="buehne">
    <div
      class="fenster"
      class:sichtbar={kameraSichtbar}
      class:versetzen
      class:zieht
      style:background={himmelCss}
      aria-hidden="true"
      bind:this={fenster}
      onpointerdown={zeigerRunter}
      onpointermove={zeigerBewegt}
      onpointerup={zeigerHoch}
      onpointercancel={zeigerAbbruch}
      oncontextmenu={(event) => event.preventDefault()}
    >
      <div
        class="bauplatz"
        style:inline-size="{buehneBreite()}px"
        style:block-size="{buehneHoehe()}px"
        style:transform="translate({kamera.x}px, {kamera.y}px) scale({kamera.zoom})"
        bind:this={rahmen}
        aria-hidden="true"
      ></div>
    </div>
    {#if hinterhofFelder.length > 0}
      <button
        class="hinterhof"
        aria-label={blick === 'bauplatz' ? tt('hinterhof.zur-szene') : tt('hinterhof.zum-bauplatz')}
        onclick={() => blickWechseln(blick === 'bauplatz' ? 'hinterhof' : 'bauplatz')}
      >
        <Symbol name="hinterhof" />
      </button>
    {/if}
    {#if gewaehlt}
      <div class="wahl" role="status">
        <strong>{gebaeudeName(gewaehlt.typ)}</strong>
        {#if KATALOG[gewaehlt.typ].stufen.length > 1}
          {tt('bastion.stufe')} {gewaehlt.stufe}{/if}
        {#if versetzen}
          <span>{tt(hinweis ? 'bastion.hindernis.belegt' : 'bastion.tippe-feld')}</span>
          <button
            onclick={() => {
              versetzen = false;
              ziel = undefined;
              hinweis = undefined;
            }}>{tt('bastion.abbrechen')}</button
          >
        {:else}
          <span class="knoepfe">
            <button onclick={() => (versetzen = true)}>{tt('bastion.versetzen')}</button>
            {#if einlagerbar(gewaehlt.typ)}
              <button
                onclick={async () => {
                  const g = gewaehlt;
                  if (g && (await onaktion({ art: 'einlagern', gebaeude: g.id })))
                    auswahl = undefined;
                }}>{tt('bastion.einlagern')}</button
              >
            {/if}
            <button onclick={() => (auswahl = undefined)}>{tt('bastion.fertig')}</button>
          </span>
          {#if einlagerbar(gewaehlt.typ)}
            <FarbWahl
              farbe={gewaehlt.farbe}
              name="farbe-auswahl"
              onwahl={(f) => void onaktion({ art: 'gestalten', gebaeude: gewaehlt.id, farbe: f })}
            />
          {/if}
        {/if}
      </div>
    {/if}
  </div>
{/if}

<style>
  .buehne {
    position: relative;
    inline-size: 100%;
    block-size: 100%;
    min-block-size: 12rem;
    display: grid;
  }

  .fenster {
    position: absolute;
    inset: 0;
    overflow: hidden;
    overscroll-behavior: none;
    touch-action: none;
    cursor: grab;
  }

  .fenster.zieht {
    cursor: grabbing;
  }

  .fenster.versetzen {
    cursor: crosshair;
    outline: 3px solid var(--farbe-akzent);
    outline-offset: -3px;
  }

  .bauplatz {
    position: absolute;
    inset-block-start: 0;
    inset-inline-start: 0;
    transform-origin: 0 0;
    visibility: hidden;
  }

  .bauplatz :global(canvas) {
    touch-action: none;
  }

  .fenster.sichtbar .bauplatz {
    visibility: visible;
  }

  .hinterhof {
    position: absolute;
    inset-block-start: var(--abstand-s);
    inset-inline-start: var(--abstand-s);
    z-index: 2;
    display: grid;
    place-items: center;
    inline-size: 2.75rem;
    block-size: 2.75rem;
    padding: 0;
    border: none;
    border-radius: var(--radius);
    background: var(--farbe-flaeche);
    color: var(--farbe-text);
    box-shadow: 0 1px 4px var(--farbe-schatten);
    cursor: pointer;
  }

  .wahl {
    position: absolute;
    inset-inline: var(--abstand-s);
    inset-block-end: var(--abstand-s);
    z-index: 2;
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--abstand-s);
    padding: var(--abstand-s);
    border-radius: var(--radius);
    background: color-mix(in srgb, var(--farbe-flaeche) 92%, transparent);
    box-shadow: 0 1px 6px var(--farbe-schatten);
  }

  .knoepfe {
    display: flex;
    flex-wrap: wrap;
    gap: var(--abstand-s);
  }

  .wahl button {
    font: inherit;
    min-block-size: 2.75rem;
    padding-inline: var(--abstand-m);
    border-radius: var(--radius);
    border: 2px solid var(--farbe-akzent);
    background: var(--farbe-hintergrund);
    color: inherit;
    cursor: pointer;
  }
</style>
