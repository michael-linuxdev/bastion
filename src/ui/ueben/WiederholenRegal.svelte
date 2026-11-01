<script lang="ts" module>
  import type { Kompetenz } from '../../core/competence/kompetenz';
  import type { Niveau } from '../../core/competence/kompetenz';
  import type { GeneratorVorlage } from '../../core/learning/vorlage';

  export interface RegalFach {
    readonly kompetenz: Kompetenz;
    readonly anzahl: number;
    readonly auftraege: readonly {
      readonly kompetenz: Kompetenz;
      readonly vorlage: GeneratorVorlage;
      readonly niveau: Niveau;
    }[];
  }
</script>

<script lang="ts">
  /**
   * Wiederholen als Regal (Design L54): fällige Themen als wenige große Kacheln,
   * ohne Zähler verpasster Tage und ohne Druck.
   */
  import { t } from '../texte/texte';

  let {
    faecher,
    onfach,
    onalle,
    onzurueck,
  }: {
    faecher: readonly RegalFach[];
    onfach: (f: RegalFach) => void;
    onalle: () => void;
    onzurueck: () => void;
  } = $props();
</script>

<section class="regal" aria-labelledby="regal-titel">
  <button type="button" class="zurueck" onclick={onzurueck}>{t('uebung.zurueck')}</button>
  <h2 id="regal-titel">{t('wiederholen.ueberschrift')}</h2>
  <p class="leise">{t('wiederholen.regal-hinweis')}</p>
  {#if faecher.length === 0}
    <p>{t('wiederholen.keine')}</p>
  {:else}
    <ul class="faecher">
      {#each faecher as f (f.kompetenz.id)}
        <li>
          <button type="button" class="fach" onclick={() => onfach(f)}>
            <span class="name">{f.kompetenz.titel.de}</span>
            <span class="info"
              >{f.anzahl === 1
                ? t('wiederholen.eine')
                : `${f.anzahl} ${t('wiederholen.mehrere')}`}</span
            >
          </button>
        </li>
      {/each}
    </ul>
    {#if faecher.length > 1}
      <button type="button" class="haupt alle" onclick={onalle}>{t('wiederholen.alle')}</button>
    {/if}
  {/if}
</section>

<style>
  .regal {
    display: grid;
    gap: var(--abstand-m);
  }

  .zurueck {
    font: inherit;
    justify-self: start;
    min-block-size: var(--ziel);
    border: none;
    background: transparent;
    color: var(--farbe-text);
    cursor: pointer;
    padding-inline: 0;
  }

  h2 {
    margin-block: 0;
  }

  .leise {
    color: var(--farbe-text-leise);
    margin-block: 0;
  }

  .faecher {
    list-style: none;
    margin: 0;
    padding: 0;
    display: grid;
    gap: var(--abstand-s);
  }

  .fach {
    display: grid;
    gap: 0.35rem;
    inline-size: 100%;
    min-block-size: 5.5rem;
    padding: var(--abstand-m);
    border: none;
    border-radius: var(--radius-karte);
    background: var(--farbe-flaeche);
    box-shadow: 0 2px 10px var(--farbe-schatten);
    text-align: start;
    cursor: pointer;
    color: var(--farbe-text);
    font: inherit;
  }

  .name {
    font-weight: 800;
    font-size: 1.25rem;
  }

  .info {
    color: var(--farbe-text-leise);
    font-size: 0.95rem;
  }

  .alle {
    justify-self: start;
  }
</style>
