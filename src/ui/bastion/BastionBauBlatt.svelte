<script lang="ts">
  /**
   * Blatt zum Bauen und Planen direkt auf dem Bastion-Reiter
   * (Preferences: nicht nur in den Einstellungen).
   */
  import type { BauHindernis } from '../../core/bastion/bauen';
  import type { Bauwerk, GebaeudeTyp } from '../../core/bastion/katalog';
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
    istZiel,
    onbauen,
    onvormerken,
    hindernisText,
  }: {
    neubauten: readonly BauAngebot[];
    ausbauten: readonly BauAngebot[];
    belegt: boolean;
    istZiel: (a: BauAngebot) => boolean;
    onbauen: (a: BauAngebot) => void;
    onvormerken: (a: BauAngebot) => void;
    hindernisText: (h: BauHindernis, typ: GebaeudeTyp, stufe: number) => string;
  } = $props();

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
  </header>
  {#if belegt}<p class="leise">{tt('bastion.hindernis.kein-freier-bauplatz')}</p>{/if}
  <ul class="liste">
    {#each neubauten as a (a.typ)}
      <li>
        <span>
          <strong>{gebaeudeName(a.typ)}</strong>
          <br /><small class="leise">{gebaeudeWozu(a.typ)}</small>
          {#if a.kostenText}<br /><small>{tt('bastion.kosten')} {a.kostenText}</small>{/if}
          {#each einzeln(a.hindernisse) as h (h)}
            <br /><small class="hindernis">{hindernisText(h, a.typ, a.stufe)}</small>
          {/each}
          {#if fehlt(a.hindernisse).length > 0}
            <br /><small class="hindernis"
              >{tt('bastion.reicht-nicht')} {fehlt(a.hindernisse).join(', ')}</small
            >
          {/if}
        </span>
        <span class="knoepfe">
          {#if a.hindernisse.length > 0}
            {#if istZiel(a)}
              <small class="leise">{tt('bastion.vorgemerkt')}</small>
            {:else}
              <button type="button" onclick={() => onvormerken(a)}>{tt('bastion.vormerken')}</button
              >
            {/if}
          {/if}
          <button type="button" disabled={a.hindernisse.length > 0} onclick={() => onbauen(a)}
            >{tt('bastion.knopf-bauen')}</button
          >
        </span>
      </li>
    {/each}
  </ul>
  {#if ausbauten.length > 0}
    <h3>{tt('bastion.ausbauen')}</h3>
    <ul class="liste">
      {#each ausbauten as a (a.ausbau?.id)}
        <li>
          <span>
            <strong>{gebaeudeName(a.typ)}</strong>
            {tt('bastion.auf-stufe')}
            {a.stufe}
            {#if a.kostenText}<br /><small>{tt('bastion.kosten')} {a.kostenText}</small>{/if}
            {#each einzeln(a.hindernisse) as h (h)}
              <br /><small class="hindernis">{hindernisText(h, a.typ, a.stufe)}</small>
            {/each}
          </span>
          <span class="knoepfe">
            {#if a.hindernisse.length > 0}
              {#if istZiel(a)}
                <small class="leise">{tt('bastion.vorgemerkt')}</small>
              {:else}
                <button type="button" onclick={() => onvormerken(a)}>{tt('bastion.planen')}</button>
              {/if}
            {/if}
            <button type="button" disabled={a.hindernisse.length > 0} onclick={() => onbauen(a)}
              >{tt('bastion.knopf-ausbauen')}</button
            >
          </span>
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
    max-block-size: min(55dvh, 28rem);
    overflow: auto;
    padding: var(--abstand-m);
    border-radius: var(--radius) var(--radius) 0 0;
    background: color-mix(in srgb, var(--farbe-flaeche) 96%, transparent);
    box-shadow: 0 -4px 20px var(--farbe-schatten);
    display: grid;
    gap: var(--abstand-s);
  }

  header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--abstand-s);
  }

  header h3 {
    margin: 0;
  }

  .leise {
    color: var(--farbe-text-leise);
    margin-block: 0;
  }

  .liste {
    list-style: none;
    padding: 0;
    margin: 0;
    display: grid;
    gap: var(--abstand-s);
  }

  .liste li {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: var(--abstand-m);
    padding: var(--abstand-s);
    border-radius: var(--radius);
    background: var(--farbe-hintergrund);
  }

  .knoepfe {
    display: flex;
    flex-wrap: wrap;
    gap: var(--abstand-s);
    justify-content: flex-end;
  }

  .hindernis {
    color: var(--farbe-text-leise);
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

  button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
</style>
