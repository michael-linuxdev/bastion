<script lang="ts">
  // Bauplatz als Grafik (Schritte 2.12–2.13): lädt PixiJS erst hier nach – nur wer
  // die Bastion bei eingeschaltetem Basebau öffnet und das Bild zeigt, lädt es (R7, A3).
  // Antippen wählt ein Gebäude; „Versetzen“ und dann ein freies Feld antippen versetzt
  // es. Die Liste darunter zeigt dasselbe und ist die gleichwertige, barrierefreie Ansicht.
  import { darstellung } from '../grafik/darstellung.svelte';
  import { einlagerbar, platzHindernisse, type Bastion } from '../../core/bastion/bauen';
  import { KATALOG, type Bauwerk, type Position } from '../../core/bastion/katalog';
  import {
    bildSetzen,
    bildZeigen,
    zoomSetzen,
    zoomWahl,
    type BauAuftrag,
  } from '../plattform/ablage';
  import type { Ansicht, Buehne, Farben } from './grafik/grafik-buehne';
  import { BUEHNE_B, BUEHNE_H, RAUTE_B } from './grafik/iso';
  import { gebaeudeName, tt } from './thema.svelte';
  import FarbWahl from './FarbWahl.svelte';

  let { bastion, onaktion }: { bastion: Bastion; onaktion: (a: BauAuftrag) => Promise<boolean> } =
    $props();

  let rahmen = $state<HTMLDivElement | undefined>(undefined);
  let buehne = $state<Buehne | undefined>(undefined);
  let fehlgeschlagen = $state(false);
  /** Bild zeigen (Einstellung `basebau.bild`); aus = reizarm, PixiJS wird nicht geladen */
  let zeigen = $state<boolean | undefined>(undefined);
  void bildZeigen().then((z) => (zeigen = z));

  /** Zoom (2.13a): 100, 150, 200 %. Auf schmalen Bildschirmen anfangs 150 %, damit ein
   * Feld mindestens etwa 44 Punkte groß ist; die Wahl wird gemerkt (`basebau.zoom`). */
  const ZOOM = [1, 1.5, 2] as const;
  let zoom = $state<number>(1);
  let fenster = $state<HTMLDivElement | undefined>(undefined);
  let fensterBreite = $state(0);
  let gewaehlterZoom = $state<number | undefined>(undefined);
  let zoomGeladen = $state(false);
  void zoomWahl().then((z) => {
    gewaehlterZoom = z;
    zoomGeladen = true;
  });
  $effect(() => {
    if (!zoomGeladen || fensterBreite === 0) return;
    zoom = gewaehlterZoom ?? ((fensterBreite * RAUTE_B) / BUEHNE_B < 44 ? 1.5 : 1);
  });
  const stufeIndex = $derived(
    Math.max(
      0,
      ZOOM.findIndex((z) => z === zoom),
    ),
  );
  let druck: { x: number; y: number } | undefined;

  function zoomen(richtung: -1 | 1) {
    const neu = ZOOM[Math.min(ZOOM.length - 1, Math.max(0, stufeIndex + richtung))] ?? 1;
    const f = fenster;
    // Die Mitte des sichtbaren Ausschnitts bleibt in der Mitte
    const mitte = f
      ? {
          x: (f.scrollLeft + f.clientWidth / 2) / (f.scrollWidth || 1),
          y: (f.scrollTop + f.clientHeight / 2) / (f.scrollHeight || 1),
        }
      : undefined;
    zoom = neu;
    gewaehlterZoom = neu;
    void zoomSetzen(neu);
    requestAnimationFrame(() => {
      if (!f || !mitte) return;
      f.scrollLeft = mitte.x * f.scrollWidth - f.clientWidth / 2;
      f.scrollTop = mitte.y * f.scrollHeight - f.clientHeight / 2;
    });
  }

  let auswahl = $state<string | undefined>(undefined);
  let versetzen = $state(false);
  let ziel = $state<Position | undefined>(undefined);
  let hinweis = $state<'kein-platz' | undefined>(undefined);

  const gewaehlt = $derived(bastion.bauwerke.find((b) => b.id === auswahl));

  function farben(): Farben {
    const css = getComputedStyle(document.documentElement);
    const v = (name: string) => css.getPropertyValue(name).trim() || '#888888';
    return {
      boden: v('--bastion-boden'),
      raster: v('--bastion-raster'),
      linie: v('--bastion-linie'),
      imBau: v('--farbe-akzent'),
      auswahl: v('--farbe-akzent'),
      himmel: v('--farbe-himmel'),
      licht: v('--farbe-licht'),
      wolke: v('--farbe-flaeche'),
      dach: v('--farbe-akzent-warm'),
      abend: darstellung.dunkel,
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
    const ort = rahmen;
    if (!ort) return;
    // Neu zeichnen, wenn hell oder dunkel wechselt (GRAFIK §2)
    void darstellung.dunkel;
    let abgebrochen = false;
    let erstellt: Buehne | undefined;
    import('./grafik/grafik-buehne')
      .then((m) => m.buehneErstellen(ort, farben()))
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
        disabled={stufeIndex === 0}
        onclick={() => zoomen(-1)}>−</button
      >
      <span>{Math.round(zoom * 100)} %</span>
      <button
        aria-label={tt('bastion.zoom-groesser')}
        disabled={stufeIndex === ZOOM.length - 1}
        onclick={() => zoomen(1)}>+</button
      >
    </div>
    <div
      class="fenster"
      style:aspect-ratio={`${BUEHNE_B} / ${BUEHNE_H}`}
      bind:this={fenster}
      bind:clientWidth={fensterBreite}
    >
      <div
        class="bauplatz"
        class:versetzen
        style:inline-size={`${zoom * 100}%`}
        style:aspect-ratio={`${BUEHNE_B} / ${BUEHNE_H}`}
        bind:this={rahmen}
        aria-hidden="true"
        onpointerdown={(e) => (druck = { x: e.clientX, y: e.clientY })}
        onpointerup={(e) => {
          // Wer zum Verschieben wischt, tippt nicht: nur kurze Wege zählen als Tipp
          if (druck && Math.hypot(e.clientX - druck.x, e.clientY - druck.y) < 10) void angetippt(e);
          druck = undefined;
        }}
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
{/if}

<style>
  .fenster {
    inline-size: 100%;
    max-inline-size: 36rem;
    overflow: auto;
    overscroll-behavior: contain;
    border-radius: var(--radius-karte);
    box-shadow: 0 2px 10px var(--farbe-schatten);
    background: var(--farbe-himmel);
  }

  .bauplatz {
    cursor: pointer;
    touch-action: pan-x pan-y;
  }

  .zoom {
    display: flex;
    align-items: center;
    gap: var(--abstand-s);
  }

  .zoom span {
    min-inline-size: 3.5rem;
    text-align: center;
    color: var(--farbe-text-leise);
  }

  .zoom button {
    min-inline-size: 2.75rem;
    font-size: 1.25rem;
  }

  .bauplatz.versetzen {
    cursor: crosshair;
    outline: 3px solid var(--farbe-akzent);
    outline-offset: -3px;
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
