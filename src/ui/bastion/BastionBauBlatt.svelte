<script lang="ts">
  /**
   * Bau-/Planen-Blatt: Mini-Szene, Kostenstapel, Planen vs. Bauen (Design C10–C14).
   */
  import type { BauHindernis } from '../../core/bastion/bauen';
  import { einlagerbar } from '../../core/bastion/bauen';
  import type { Bauwerk, Farbe, GebaeudeTyp, Kosten } from '../../core/bastion/katalog';
  import type { Ressource } from '../../core/ledger/regeln';
  import Symbol, { type SymbolName } from '../grafik/Symbol.svelte';
  import { t } from '../texte/texte';
  import FarbWahl from './FarbWahl.svelte';
  import GebaeudeVorschau from './GebaeudeVorschau.svelte';
  import { gebaeudeName, gebaeudeWozu, ressourceName, tt } from './thema.svelte';

  export interface BauAngebot {
    readonly typ: GebaeudeTyp;
    readonly stufe: number;
    readonly ausbau?: Bauwerk;
    readonly hindernisse: readonly BauHindernis[];
    readonly kosten?: Kosten | undefined;
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

  /** Kosten und Details erst nach bewusster Auswahl (Design L57). */
  let gewaehlt = $state<BauAngebot | undefined>(undefined);
  let vorschauFarbe = $state<Farbe | undefined>(undefined);

  const alle = $derived([...neubauten, ...ausbauten]);

  $effect(() => {
    const g = gewaehlt;
    if (g && !alle.some((a) => gleich(a, g))) gewaehlt = undefined;
  });

  $effect(() => {
    void gewaehlt?.typ;
    vorschauFarbe = undefined;
  });

  function gleich(a: BauAngebot, b: BauAngebot) {
    return a.typ === b.typ && a.stufe === b.stufe && a.ausbau?.id === b.ausbau?.id;
  }

  const einzeln = (h: readonly BauHindernis[]) =>
    h.filter((x) => x !== 'kein-freier-bauplatz' && !x.startsWith('zu-wenig-'));
  const fehlt = (h: readonly BauHindernis[]) =>
    (['fleiss', 'behalten', 'koennen'] as const).filter((r) => h.includes(`zu-wenig-${r}`));
  const gesperrt = (h: readonly BauHindernis[]) =>
    h.includes('voraussetzung') || h.includes('kern-zu-niedrig');

  const RES: readonly { key: Exclude<Ressource, 'schritt'>; symbol: SymbolName }[] = [
    { key: 'fleiss', symbol: 'stein' },
    { key: 'behalten', symbol: 'erz' },
    { key: 'koennen', symbol: 'bauplan' },
  ];
</script>

<div id="bastion-bau-blatt" class="blatt" role="dialog" aria-label={tt('bastion.bauen-oeffnen')}>
  <header>
    <h3 class="ort-name">{tt('bastion.bauen')}</h3>
    <button type="button" class="schliessen" onclick={onschliessen}
      >{tt('bastion.bauen-schliessen')}</button
    >
  </header>

  {#if belegt}<p class="leise">{tt('bastion.hindernis.kein-freier-bauplatz')}</p>{/if}

  {#if gewaehlt}
    {@const a = gewaehlt}
    {@const lock = gesperrt(a.hindernisse)}
    {@const mangel = fehlt(a.hindernisse)}
    <div class="fokus" aria-live="polite">
      <p class="label">{tt('bastion.bau-vorschau')}</p>
      <GebaeudeVorschau
        typ={a.typ}
        stufe={a.stufe}
        {epoche}
        gross
        gesperrt={lock}
        {...vorschauFarbe ? { farbe: vorschauFarbe } : {}}
      />
      {#if lock}
        <p class="noch-nicht">{t('bastion.noch-nicht')}</p>
      {/if}
      <p class="titel ort-name">
        {gebaeudeName(a.typ)}{#if a.ausbau}
          {' ' + tt('bastion.auf-stufe') + ' ' + a.stufe}{/if}
      </p>
      <p class="wozu">{gebaeudeWozu(a.typ)}</p>
      {#if a.kosten && (a.kosten.fleiss > 0 || a.kosten.behalten > 0 || a.kosten.koennen > 0)}
        <ul class="stapel" aria-label={tt('bastion.kosten')}>
          {#each RES as { key, symbol } (key)}
            {#if a.kosten[key] > 0}
              <li class:fehlt={mangel.includes(key)}>
                <Symbol name={symbol} />
                <span>{a.kosten[key]}</span>
                <span class="res-name">{ressourceName(key)}</span>
              </li>
            {/if}
          {/each}
        </ul>
      {/if}
      {#if einlagerbar(a.typ) && !a.ausbau}
        <div class="farbe-am-banner">
          <FarbWahl
            farbe={vorschauFarbe}
            name="bau-vorschau-farbe"
            onwahl={(f: Farbe) => (vorschauFarbe = f)}
          />
        </div>
      {/if}
      {#each einzeln(a.hindernisse) as h (h)}
        <p class="hindernis">{hindernisText(h, a.typ, a.stufe)}</p>
      {/each}
      {#if mangel.length > 0}
        <p class="hindernis">
          {tt('bastion.reicht-nicht')}
          {mangel.map(ressourceName).join(', ')}
        </p>
      {/if}
      <div class="aktionen">
        {#if a.hindernisse.length > 0}
          {#if istZiel(a)}
            <span class="leise">{tt('bastion.vorgemerkt')}</span>
          {:else}
            <button type="button" class="zweit planen" onclick={() => onvormerken(a)}>
              <Symbol name="planen" />
              {a.ausbau ? tt('bastion.planen-skizze') : tt('bastion.vormerken')}
            </button>
          {/if}
        {/if}
        <button
          type="button"
          class="haupt bauen"
          disabled={a.hindernisse.length > 0}
          onclick={() => onbauen(a)}
        >
          <Symbol name="bauen" />
          {a.ausbau ? tt('bastion.knopf-ausbauen') : tt('bastion.bauen-stein')}
        </button>
      </div>
    </div>
  {:else}
    <p class="leise">{tt('bastion.bau-waehlen')}</p>
  {/if}

  {#if neubauten.length > 0}
    <h4>{tt('bastion.bauen')}</h4>
    <ul class="karten">
      {#each neubauten as a (a.typ)}
        {@const lock = gesperrt(a.hindernisse)}
        <li>
          <button
            type="button"
            class="karte"
            class:aktiv={gewaehlt && gleich(a, gewaehlt)}
            class:gesperrt={lock}
            aria-pressed={gewaehlt ? gleich(a, gewaehlt) : false}
            onclick={() => (gewaehlt = a)}
          >
            <GebaeudeVorschau typ={a.typ} stufe={a.stufe} {epoche} gesperrt={lock} />
            <span class="name">{gebaeudeName(a.typ)}</span>
            {#if lock}<span class="badge">{t('bastion.noch-nicht')}</span>{/if}
          </button>
        </li>
      {/each}
    </ul>
  {/if}

  {#if ausbauten.length > 0}
    <h4>{tt('bastion.ausbauen')}</h4>
    <ul class="karten">
      {#each ausbauten as a (a.ausbau?.id)}
        {@const lock = gesperrt(a.hindernisse)}
        <li>
          <button
            type="button"
            class="karte"
            class:aktiv={gewaehlt && gleich(a, gewaehlt)}
            class:gesperrt={lock}
            aria-pressed={gewaehlt ? gleich(a, gewaehlt) : false}
            onclick={() => (gewaehlt = a)}
          >
            <GebaeudeVorschau typ={a.typ} stufe={a.stufe} {epoche} gesperrt={lock} />
            <span class="name"
              >{gebaeudeName(a.typ)}
              {tt('bastion.stufe')}
              {a.stufe}</span
            >
            {#if lock}<span class="badge">{t('bastion.noch-nicht')}</span>{/if}
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

  @media (prefers-reduced-motion: no-preference) {
    .blatt {
      animation: bastion-einblenden 0.3s ease-out;
    }
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
  }

  .wozu,
  .hindernis {
    margin: 0;
    font-size: 0.9rem;
  }

  .wozu {
    color: var(--farbe-text-leise);
  }

  .hindernis {
    color: var(--farbe-akzent-warm, var(--farbe-akzent));
  }

  .noch-nicht {
    margin: 0;
    font-weight: 800;
    color: var(--farbe-text-leise);
  }

  .stapel {
    list-style: none;
    margin: 0.25rem 0 0;
    padding: 0;
    display: flex;
    flex-wrap: wrap;
    gap: 0.4rem;
    justify-content: center;
  }

  .stapel li {
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
    padding: 0.25rem 0.5rem;
    border-radius: var(--radius);
    background: color-mix(in srgb, var(--farbe-flaeche) 90%, var(--farbe-akzent));
    font-size: 0.85rem;
    font-weight: 700;
    color: var(--farbe-text);
  }

  .stapel li.fehlt {
    background: color-mix(in srgb, var(--farbe-hinweis-flaeche) 85%, var(--farbe-akzent-warm));
    outline: 1px dashed color-mix(in srgb, var(--farbe-akzent-warm) 55%, transparent);
  }

  .stapel :global(svg) {
    inline-size: 1rem;
    block-size: 1rem;
    color: var(--farbe-akzent);
  }

  .stapel .res-name {
    font-weight: 600;
    color: var(--farbe-text-leise);
    font-size: 0.75rem;
  }

  .farbe-am-banner {
    justify-self: center;
    margin-block-start: 0.15rem;
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

  .karte.gesperrt {
    opacity: 0.85;
  }

  .name {
    font-size: 0.8rem;
    font-weight: 700;
    text-align: center;
    line-height: 1.25;
  }

  .badge {
    font-size: 0.7rem;
    font-weight: 800;
    color: var(--farbe-text-leise);
  }

  button.schliessen,
  button.zweit,
  button.haupt {
    font: inherit;
    min-block-size: var(--ziel);
    padding-inline: var(--abstand-m);
    border-radius: var(--radius);
    border: 2px solid var(--farbe-akzent);
    background: var(--farbe-hintergrund);
    color: inherit;
    cursor: pointer;
  }

  button.planen,
  button.bauen {
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
  }

  button.planen :global(svg),
  button.bauen :global(svg) {
    inline-size: 1.15rem;
    block-size: 1.15rem;
  }

  button.planen {
    border-style: dashed;
    background: color-mix(in srgb, var(--farbe-flaeche-leise) 80%, transparent);
  }

  button.haupt {
    background: var(--farbe-akzent);
    color: var(--farbe-auf-akzent);
    border-style: solid;
  }

  button.haupt:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
</style>
