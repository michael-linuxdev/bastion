<script lang="ts">
  // Bauplatz als Grafik (Schritte 2.12–2.13): lädt PixiJS erst hier nach – nur wer
  // die Bastion bei eingeschaltetem Basebau öffnet und das Bild zeigt, lädt es (R7, A3).
  // Antippen wählt ein Gebäude; „Versetzen“ und dann ein freies Feld antippen versetzt
  // es. Die Liste darunter zeigt dasselbe und ist die gleichwertige, barrierefreie Ansicht.
  import { einlagerbar, platzHindernisse, type Bastion } from '../../core/bastion/bauen';
  import { KATALOG, type Bauwerk, type Position } from '../../core/bastion/katalog';
  import { bildSetzen, bildZeigen, type BauAuftrag } from '../plattform/ablage';
  import type { Ansicht, Buehne, Farben } from './grafik/grafik-buehne';
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
    <div
      class="bauplatz"
      class:versetzen
      bind:this={rahmen}
      aria-hidden="true"
      onpointerup={(e) => void angetippt(e)}
    ></div>
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
  .bauplatz {
    inline-size: 100%;
    max-inline-size: 30rem;
    aspect-ratio: 1;
    border-radius: var(--radius);
    overflow: hidden;
    border: 1px solid var(--farbe-rand);
    background: var(--bastion-boden);
    cursor: pointer;
    touch-action: manipulation;
  }

  .bauplatz.versetzen {
    cursor: crosshair;
    border-color: var(--farbe-akzent);
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
