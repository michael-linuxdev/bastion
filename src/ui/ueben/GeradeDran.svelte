<script lang="ts">
  // „Gerade in der Schule dran“ (LEHRPLAN L-18): Lernbereich wählen, darin einzelne
  // Themen ab- oder zuwählen. Die gewählten Themen stehen in der Übersicht oben.
  import type { Kompetenz } from '../../core/competence/kompetenz';
  import { lernbereiche } from '../../core/learning/gerade-dran';
  import { t, type TextSchluessel } from '../texte/texte';

  let {
    kompetenzen,
    klasse,
    schulart,
    auswahl = $bindable([]),
    onwahl,
  }: {
    /** nur Kompetenzen mit Aufgaben */
    kompetenzen: readonly Kompetenz[];
    klasse: number;
    schulart: 'oberschule' | 'gymnasium' | undefined;
    auswahl?: readonly string[];
    onwahl: (k: Kompetenz) => void;
  } = $props();

  const gruppen = $derived(lernbereiche(kompetenzen, klasse, schulart));
  const gewaehlt = $derived(new Set(auswahl));
  const dran = $derived(kompetenzen.filter((k) => gewaehlt.has(k.id)));
  const name = (n: string, art: 'lehrplan' | 'feld') =>
    art === 'feld' ? t(`feld.${n}` as TextSchluessel) : n;

  function setze(ids: readonly string[], an: boolean) {
    auswahl = an
      ? [...auswahl, ...ids.filter((id) => !auswahl.includes(id))]
      : auswahl.filter((id) => !ids.includes(id));
  }
</script>

<section class="dran" aria-labelledby="dran-titel">
  {#if dran.length > 0}
    <h3 id="dran-titel">{t('dran.titel')}</h3>
    <ul class="liste">
      {#each dran as k (k.id)}
        <li><button onclick={() => onwahl(k)}>{k.titel.de}</button></li>
      {/each}
    </ul>
  {/if}
  <details>
    <summary>{dran.length > 0 ? t('dran.aendern') : t('dran.waehlen')}</summary>
    {#if !schulart}<p class="leise">{t('dran.ohne-schulart')}</p>{/if}
    {#each gruppen as g (g.name)}
      {@const ids = g.kompetenzen.map((k) => k.id)}
      {@const alle = ids.every((id) => gewaehlt.has(id))}
      <fieldset>
        <legend>
          <label
            ><input type="checkbox" checked={alle} onchange={() => setze(ids, !alle)} />
            <strong>{name(g.name, g.art)}</strong></label
          >
        </legend>
        {#each g.kompetenzen as k (k.id)}
          <label class="thema"
            ><input
              type="checkbox"
              checked={gewaehlt.has(k.id)}
              onchange={() => setze([k.id], !gewaehlt.has(k.id))}
            />
            {k.titel.de}</label
          >
        {/each}
      </fieldset>
    {/each}
  </details>
</section>

<style>
  .dran {
    display: grid;
    gap: var(--abstand-s);
  }
  fieldset {
    border: 1px solid var(--farbe-rand);
    border-radius: var(--radius);
    margin-block: var(--abstand-s);
    display: grid;
    gap: 0.25rem;
  }
  label {
    display: flex;
    align-items: center;
    gap: var(--abstand-s);
    min-block-size: 2.75rem;
  }
  .thema {
    padding-inline-start: var(--abstand-m);
  }
  .liste {
    list-style: none;
    padding: 0;
    display: grid;
    gap: var(--abstand-s);
  }
  .liste button {
    inline-size: 100%;
    text-align: start;
    min-block-size: 2.75rem;
  }
</style>
