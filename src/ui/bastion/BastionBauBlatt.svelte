<script lang="ts">
  /**
   * Spielerisches Bau-/Planen-Blatt mit Gebäudevorschau (Preferences).
   */
  import type { BauHindernis } from '../../core/bastion/bauen';
  import type { Bauwerk, GebaeudeTyp } from '../../core/bastion/katalog';
  import GebaeudeVorschau from './GebaeudeVorschau.svelte';
  import { gebaeudeName, gebaeudeWozu, ressourceName, tt } from './thema.svelte';

  export interface BauAngebot {
    readonly typ: GebaeudeTyp;
    readonly stufe: number;
    readonly ausbau?: Bauwerk;
    readonly hindernisse: readonly BauHindernis[];
    readonly kostenText: string;
  }

  let {
    neubauten,
    ausbauten,
    belegt,
    epoche = 1,
    istZiel,
    onbauen,
    onvormerken,
    hindernisText,
    onschliessen,
  }: {
    neubauten: readonly BauAngebot[];
    ausbauten: readonly BauAngebot[];
    belegt: boolean;
    epoche?: number;
    istZiel: (a: BauAngebot) => boolean;
    onbauen: (a: BauAngebot) => void;
    onvormerken: (a: BauAngebot) => void;
    hindernisText: (h: BauHindernis, typ: GebaeudeTyp, stufe: number) => string;
    onschliessen: () => void;
  } = $props();

  let gewaehlt = $state<BauAngebot | undefined>(undefined);

  const alle = $derived([...neubauten, ...ausbauten]);

  $effect(() => {
    const g = gewaehlt;
    if (g && !alle.some((a) => gleich(a, g))) gewaehlt = alle[0];
    else if (!g && alle.length > 0) gewaehlt = alle[0];
  });

  function gleich(a: BauAngebot, b: BauAngebot) {
    return a.typ === b.typ && a.stufe === b.stufe && a.ausbau?.id === b.ausbau?.id;
  }

  const einzeln = (h: readonly BauHindernis[]) =>
    h.filter((x) => x !== 'kein-freier-bauplatz' && !x.startsWith('zu-wenig-'));
  const fehlt = (h: readonly BauHindernis[]) =>
    (['fleiss', 'behalten', 'koennen'] as const)
      .filter((r) => h.includes(`zu-wenig-${r}`))
      .map(ressourceName);
</script>

<div id="bastion-bau-blatt" class="blatt" role="dialog" aria-label={tt('bastion.bauen-oeffnen')}>
  <header>
    <h3>{tt('bastion.bauen')}</h3>
    <button type="button" class="schliessen" onclick={onschliessen}
      >{tt('bastion.bauen-schliessen')}</button
    >
  </header>

  {#if belegt}<p class="leise">{tt('bastion.hindernis.kein-freier-bauplatz')}</p>{/if}

  {#if gewaehlt}
    {@const a = gewaehlt}
    <div class="fokus" aria-live="polite">
      <p class="label">{tt('bastion.bau-vorschau')}</p>
      <GebaeudeVorschau typ={a.typ} stufe={a.stufe} {epoche} gross />
      <p class="titel">
        {gebaeudeName(a.typ)}{#if a.ausbau}
          {' ' + tt('bastion.auf-stufe') + ' ' + a.stufe}{/if}
      </p>
      <p class="wozu">{gebaeudeWozu(a.typ)}</p>
      {#if a.kostenText}
        <p class="kosten">{tt('bastion.kosten')} {a.kostenText}</p>
      {/if}
      {#each einzeln(a.hindernisse) as h (h)}
        <p class="hindernis">{hindernisText(h, a.typ, a.stufe)}</p>
      {/each}
      {#if fehlt(a.hindernisse).length > 0}
        <p class="hindernis">{tt('bastion.reicht-nicht')} {fehlt(a.hindernisse).join(', ')}</p>
      {/if}
      <div class="aktionen">
        {#if a.hindernisse.length > 0}
          {#if istZiel(a)}
            <span class="leise">{tt('bastion.vorgemerkt')}</span>
          {:else}
            <button type="button" class="zweit" onclick={() => onvormerken(a)}
              >{a.ausbau ? tt('bastion.planen') : tt('bastion.vormerken')}</button
            >
          {/if}
        {/if}
        <button
          type="button"
          class="haupt"
          disabled={a.hindernisse.length > 0}
          onclick={() => onbauen(a)}
          >{a.ausbau ? tt('bastion.knopf-ausbauen') : tt('bastion.knopf-bauen')}</button
        >
      </div>
    </div>
  {:else}
    <p class="leise">{tt('bastion.bau-waehlen')}</p>
  {/if}

  {#if neubauten.length > 0}
    <h4>{tt('bastion.bauen')}</h4>
    <ul class="karten">
      {#each neubauten as a (a.typ)}
        <li>
          <button
            type="button"
            class="karte"
            class:aktiv={gewaehlt && gleich(a, gewaehlt)}
            aria-pressed={gewaehlt ? gleich(a, gewaehlt) : false}
            onclick={() => (gewaehlt = a)}
          >
            <GebaeudeVorschau typ={a.typ} stufe={a.stufe} {epoche} />
            <span class="name">{gebaeudeName(a.typ)}</span>
          </button>
        </li>
      {/each}
    </ul>
  {/if}

  {#if ausbauten.length > 0}
    <h4>{tt('bastion.ausbauen')}</h4>
    <ul class="karten">
      {#each ausbauten as a (a.ausbau?.id)}
        <li>
          <button
            type="button"
            class="karte"
            class:aktiv={gewaehlt && gleich(a, gewaehlt)}
            aria-pressed={gewaehlt ? gleich(a, gewaehlt) : false}
            onclick={() => (gewaehlt = a)}
          >
            <GebaeudeVorschau typ={a.typ} stufe={a.stufe} {epoche} />
            <span class="name"
              >{gebaeudeName(a.typ)}
              {tt('bastion.stufe')}
              {a.stufe}</span
            >
          </button>
        </li>
      {/each}
    </ul>
  {/if}
</div>

<style>
  .blatt {
    position: absolute;
    inset-inline: 0;
    inset-block-end: 0;
    z-index: 4;
    max-block-size: min(70dvh, 36rem);
    overflow: auto;
    padding: var(--abstand-m);
    padding-block-end: calc(var(--abstand-m) + 0.5rem);
    border-radius: var(--radius) var(--radius) 0 0;
    background: color-mix(in srgb, var(--farbe-flaeche) 96%, transparent);
    box-shadow: 0 -6px 28px var(--farbe-schatten);
    display: grid;
    gap: var(--abstand-s);
  }

  header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--abstand-s);
    position: sticky;
    inset-block-start: calc(-1 * var(--abstand-m));
    margin-block-start: calc(-1 * var(--abstand-m));
    margin-inline: calc(-1 * var(--abstand-m));
    padding: var(--abstand-m);
    padding-block-end: var(--abstand-s);
    background: color-mix(in srgb, var(--farbe-flaeche) 96%, transparent);
    z-index: 1;
  }

  header h3,
  h4 {
    margin: 0;
  }

  h4 {
    font-size: 0.95rem;
    color: var(--farbe-text-leise);
  }

  .schliessen {
    flex-shrink: 0;
  }

  .leise {
    color: var(--farbe-text-leise);
    margin-block: 0;
  }

  .fokus {
    display: grid;
    gap: 0.35rem;
    padding: var(--abstand-s);
    border-radius: var(--radius-karte);
    background: var(--farbe-hintergrund);
    text-align: center;
  }

  .label {
    margin: 0;
    font-size: 0.75rem;
    font-weight: 700;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    color: var(--farbe-text-leise);
  }

  .titel {
    margin: 0;
    font-size: 1.2rem;
    font-weight: 800;
  }

  .wozu,
  .kosten,
  .hindernis {
    margin: 0;
    font-size: 0.9rem;
  }

  .wozu,
  .kosten {
    color: var(--farbe-text-leise);
  }

  .hindernis {
    color: var(--farbe-akzent-warm, var(--farbe-akzent));
  }

  .aktionen {
    display: flex;
    flex-wrap: wrap;
    gap: var(--abstand-s);
    justify-content: center;
    margin-block-start: 0.25rem;
  }

  .karten {
    list-style: none;
    padding: 0;
    margin: 0;
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(5.5rem, 1fr));
    gap: var(--abstand-s);
  }

  .karte {
    font: inherit;
    display: grid;
    justify-items: center;
    gap: 0.35rem;
    inline-size: 100%;
    padding: 0.5rem;
    border: 2px solid transparent;
    border-radius: var(--radius);
    background: var(--farbe-hintergrund);
    color: inherit;
    cursor: pointer;
    min-block-size: 5.5rem;
  }

  .karte.aktiv {
    border-color: var(--farbe-akzent);
    background: color-mix(in srgb, var(--farbe-akzent) 10%, var(--farbe-flaeche));
    box-shadow: 0 2px 10px var(--farbe-schatten);
  }

  .name {
    font-size: 0.8rem;
    font-weight: 700;
    text-align: center;
    line-height: 1.25;
  }

  button.schliessen,
  button.zweit,
  button.haupt {
    font: inherit;
    min-block-size: 2.75rem;
    padding-inline: var(--abstand-m);
    border-radius: var(--radius);
    border: 2px solid var(--farbe-akzent);
    background: var(--farbe-hintergrund);
    color: inherit;
    cursor: pointer;
  }

  button.haupt {
    background: var(--farbe-akzent);
    color: var(--farbe-auf-akzent);
  }

  button.haupt:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
</style>
