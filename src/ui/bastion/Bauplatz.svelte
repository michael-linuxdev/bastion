<script lang="ts">
  // Bauplatz als Grafik (Schritte 2.12–2.13): lädt PixiJS erst hier nach – nur wer
  // die Bastion bei eingeschaltetem Basebau öffnet und das Bild zeigt, lädt es (R7, A3).
  // Antippen wählt ein Gebäude; „Versetzen“ und dann ein freies Feld antippen versetzt
  // es. Die Liste darunter zeigt dasselbe und ist die gleichwertige, barrierefreie Ansicht.
  import { untrack } from 'svelte';
  import { darstellung } from '../grafik/darstellung.svelte';
  import { einlagerbar, platzHindernisse, type Bastion } from '../../core/bastion/bauen';
  import { KATALOG, type Bauwerk, type Position } from '../../core/bastion/katalog';
  import {
    bastionLeicht,
    bastionRuhig,
    bildSetzen,
    bildZeigen,
    leichtSetzen,
    ruhigSetzen,
    zoomSetzen,
    zoomWahl,
    type BauAuftrag,
  } from '../plattform/ablage';
  import { bewegungAus, type Bewegung } from './grafik/atmosphaere';
  import type { Ansicht, Buehne, Farben } from './grafik/grafik-buehne';
  import { BUEHNE_B, BUEHNE_H } from './grafik/iso';
  import { farbenMitJahreszeit, jahreszeitAusDatum } from './grafik/jahreszeit';
  import { szeneAbend } from './grafik/sonne';
  import {
    ZIEH_SCHWELLE,
    ZOOM_KNOPF,
    ZOOM_MAX,
    ZOOM_MIN,
    ZOOM_RAD,
    einpassen,
    zentriert,
    zoomAn,
    type Kamera,
  } from './grafik/kamera';
  import { aktiv, gebaeudeName, tt } from './thema.svelte';
  import FarbWahl from './FarbWahl.svelte';

  let { bastion, onaktion }: { bastion: Bastion; onaktion: (a: BauAuftrag) => Promise<boolean> } =
    $props();

  let rahmen = $state<HTMLDivElement | undefined>(undefined);
  let buehne = $state<Buehne | undefined>(undefined);
  let fehlgeschlagen = $state(false);
  /** Bild zeigen (Einstellung `basebau.bild`); aus = reizarm, PixiJS wird nicht geladen */
  let zeigen = $state<boolean | undefined>(undefined);
  void bildZeigen().then((z) => (zeigen = z));

  /** GRAFIK §4.5: ruhig / leicht / System-Ruhe */
  let ruhig = $state(false);
  let leicht = $state(false);
  let systemRuhe = $state(false);
  void bastionRuhig().then((z) => (ruhig = z));
  void bastionLeicht().then((z) => (leicht = z));
  const bewegung = $derived(bewegungAus({ ruhig, leicht, systemRuhe }));

  /** Lokale Zeit für Jahreszeit und Sonne; jede Minute aktualisieren (GRAFIK §4.3). */
  let jetzt = $state(new Date());
  $effect(() => {
    const id = setInterval(() => (jetzt = new Date()), 60_000);
    return () => clearInterval(id);
  });
  const jahreszeit = $derived(jahreszeitAusDatum(jetzt));
  const abend = $derived(szeneAbend(darstellung.modus, jetzt));

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

  const amAnschlag = (richtung: -1 | 1) =>
    richtung < 0 ? kamera.zoom <= ZOOM_MIN + 0.001 : kamera.zoom >= ZOOM_MAX - 0.001;

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

  function zoomen(richtung: -1 | 1) {
    const el = fenster;
    if (!el || amAnschlag(richtung)) return;
    eigene = true;
    const faktor = richtung > 0 ? ZOOM_KNOPF : 1 / ZOOM_KNOPF;
    kamera = zoomAn(kamera, el.clientWidth / 2, el.clientHeight / 2, kamera.zoom * faktor);
    merken();
  }

  function einpassenJetzt() {
    const el = fenster;
    if (!el) return;
    eigene = false;
    kamera = einpassen(el.clientWidth, el.clientHeight);
    kameraSichtbar = true;
    // 0 heißt: kein eigener Zoom, beim nächsten Öffnen wieder einpassen
    clearTimeout(merkenTimer);
    void zoomSetzen(0);
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
    const basis: Farben = {
      boden: v('--bastion-boden'),
      raster: v('--bastion-raster'),
      linie: v('--bastion-linie'),
      imBau: v('--farbe-akzent'),
      auswahl: v('--farbe-akzent'),
      himmel: v('--farbe-himmel'),
      licht: v('--farbe-licht'),
      wolke: v('--farbe-flaeche'),
      dach: v('--farbe-akzent-warm'),
      // Szene-Abend nach Sonne/Modus, nicht nur UI-Tokens (GRAFIK §4.3)
      abend,
      jahreszeit,
      familie: {
        kern: v('--bastion-kern'),
        wissen: v('--bastion-wissen'),
        verteidigung: v('--bastion-verteidigung'),
        bau: v('--bastion-bau'),
        zierde: v('--bastion-zierde'),
      },
    };
    return farbenMitJahreszeit(basis, jahreszeit);
  }

  $effect(() => {
    const ort = rahmen;
    if (!ort) return;
    // Neu zeichnen bei Modus, Jahreszeit, Abend, Thema (GRAFIK §2, §4.3, §6).
    void darstellung.modus;
    void jahreszeit;
    void abend;
    const bildart = aktiv.thema === 'dorf' ? 'dorf' : 'insel';
    let abgebrochen = false;
    let erstellt: Buehne | undefined;
    // Bewegung nur als Startwert (ohne Tracking); Wechsel über setzeBewegung
    const start: Bewegung = untrack(() => bewegung);
    import('./grafik/grafik-buehne')
      .then((m) => m.buehneErstellen(ort, farben(), bildart, start))
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
    buehne?.setzeBewegung(bewegung);
  });

  $effect(() => {
    const g = gewaehlt;
    const a: Ansicht = {
      ...(g ? { auswahl: g.id } : {}),
      ...(g && versetzen && ziel
        ? {
            ziel: {
              pos: ziel,
              typ: g.typ,
              frei: platzHindernisse(bastion, g.typ, ziel, g.id).length === 0,
            },
          }
        : {}),
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
    const pos = buehne?.feldBei(e.clientX, e.clientY);
    if (!pos) return;
    hinweis = undefined;
    const g = gewaehlt;
    if (versetzen && g) {
      ziel = pos;
      if (platzHindernisse(bastion, g.typ, pos, g.id).length > 0) {
        hinweis = 'kein-platz';
        return;
      }
      if (await onaktion({ art: 'versetzen', gebaeude: g.id, pos })) {
        versetzen = false;
        ziel = undefined;
      }
      return;
    }
    auswahl = auf(pos)?.id;
  }

  function umschalten() {
    zeigen = !zeigen;
    void bildSetzen(zeigen);
    auswahl = undefined;
    versetzen = false;
  }
</script>

{#if zeigen !== undefined}
  {#if zeigen && !fehlgeschlagen}
    <!-- Die Grafik ist für Screenreader ausgeblendet: Die Liste darunter zeigt alles. -->
    <div class="zoom" role="group" aria-label={tt('bastion.zoom')}>
      <button
        aria-label={tt('bastion.zoom-kleiner')}
        disabled={amAnschlag(-1)}
        onclick={() => zoomen(-1)}>−</button
      >
      <button
        aria-label={tt('bastion.zoom-groesser')}
        disabled={amAnschlag(1)}
        onclick={() => zoomen(1)}>+</button
      >
      <button aria-label={tt('bastion.zoom-passen')} onclick={einpassenJetzt}>⌖</button>
    </div>
    <div
      class="fenster"
      class:sichtbar={kameraSichtbar}
      class:versetzen
      class:zieht
      style:aspect-ratio={`${BUEHNE_B} / ${BUEHNE_H}`}
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
        style:inline-size="{BUEHNE_B}px"
        style:block-size="{BUEHNE_H}px"
        style:transform="translate({kamera.x}px, {kamera.y}px) scale({kamera.zoom})"
        bind:this={rahmen}
        aria-hidden="true"
      ></div>
    </div>
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
    {:else}
      <p class="leise">{tt('bastion.bild-hinweis')}</p>
    {/if}
  {/if}
  <button class="dezent" onclick={umschalten}
    >{zeigen ? tt('bastion.bild-aus') : tt('bastion.bild-an')}</button
  >
  {#if zeigen && !fehlgeschlagen}
    <div class="darstellung" role="group" aria-label={tt('bastion.darstellung')}>
      <label>
        <input
          type="checkbox"
          checked={ruhig}
          onchange={() => {
            ruhig = !ruhig;
            void ruhigSetzen(ruhig);
          }}
        />
        {tt('bastion.ruhig')}
      </label>
      <label>
        <input
          type="checkbox"
          checked={leicht}
          disabled={ruhig || systemRuhe}
          onchange={() => {
            leicht = !leicht;
            void leichtSetzen(leicht);
          }}
        />
        {tt('bastion.leicht')}
      </label>
    </div>
  {/if}
{/if}

<style>
  .darstellung {
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem 1.25rem;
    margin-block: 0.5rem 0;
    font-size: 0.95rem;
    color: var(--farbe-text-leise);
  }

  .darstellung label {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    min-block-size: 44px;
  }

  .fenster {
    position: relative;
    inline-size: 100%;
    max-inline-size: 36rem;
    overflow: hidden;
    overscroll-behavior: none;
    touch-action: none;
    border-radius: var(--radius-karte);
    box-shadow: 0 2px 10px var(--farbe-schatten);
    background: var(--farbe-himmel);
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

  .zoom {
    display: flex;
    align-items: center;
    gap: var(--abstand-s);
  }

  .zoom button {
    min-inline-size: 2.75rem;
    font-size: 1.25rem;
  }

  .wahl {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--abstand-s);
  }

  .knoepfe {
    display: flex;
    flex-wrap: wrap;
    gap: var(--abstand-s);
  }

  .leise {
    color: var(--farbe-text-leise);
    margin-block: 0;
  }

  button {
    font: inherit;
    min-block-size: 2.75rem;
    padding-inline: var(--abstand-m);
    border-radius: var(--radius);
    border: 2px solid var(--farbe-akzent);
    background: var(--farbe-hintergrund);
    color: inherit;
    cursor: pointer;
  }

  .dezent {
    justify-self: start;
    border: none;
    background: none;
    text-decoration: underline;
    padding-inline: 0;
    color: var(--farbe-text-leise);
  }
</style>
