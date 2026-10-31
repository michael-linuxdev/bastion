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

<section class="dran landkarte" aria-labelledby="dran-titel">
  {#if dran.length > 0}
    <h3 id="dran-titel">{t('dran.titel')}</h3>
    <ul class="steine">
      {#each dran as k (k.id)}
        <li>
          <button class="stein" onclick={() => onwahl(k)}>
            <span class="punkt" aria-hidden="true"></span>
            {k.titel.de}
          </button>
        </li>
      {/each}
    </ul>
  {/if}
  <details>
    <summary>{dran.length > 0 ? t('dran.aendern') : t('dran.waehlen')}</summary>
    {#if !schulart}<p class="leise">{t('dran.ohne-schulart')}</p>{/if}
    <ul class="felder">
      {#each gruppen as g (g.name)}
        {@const ids = g.kompetenzen.map((k) => k.id)}
        {@const alle = ids.every((id) => gewaehlt.has(id))}
        <li class="feld">
          <label class="feld-kopf"
            ><input type="checkbox" checked={alle} onchange={() => setze(ids, !alle)} />
            <strong>{name(g.name, g.art)}</strong></label
          >
          <ul class="steine">
            {#each g.kompetenzen as k (k.id)}
              <li>
                <label class="stein wahl" class:an={gewaehlt.has(k.id)}
                  ><input
                    type="checkbox"
                    checked={gewaehlt.has(k.id)}
                    onchange={() => setze([k.id], !gewaehlt.has(k.id))}
                  />
                  <span class="punkt" aria-hidden="true"></span>
                  {k.titel.de}</label
                >
              </li>
            {/each}
          </ul>
        </li>
      {/each}
    </ul>
  </details>
</section>

<style>
  .dran {
    display: grid;
    gap: var(--abstand-s);
    padding: var(--abstand-m);
    border-radius: var(--radius-karte);
    background:
      radial-gradient(
        ellipse at 80% 10%,
        color-mix(in srgb, var(--farbe-himmel, #d6ecf3) 45%, transparent),
        transparent 50%
      ),
      var(--farbe-flaeche);
    box-shadow: 0 2px 8px var(--farbe-schatten);
  }
  .felder {
    list-style: none;
    margin: 0;
    padding: 0;
    display: grid;
    gap: var(--abstand-s);
  }
  .feld {
    padding: var(--abstand-s);
    border-radius: var(--radius);
    background: color-mix(in srgb, var(--farbe-flaeche-leise) 80%, transparent);
  }
  .feld-kopf {
    display: flex;
    align-items: center;
    gap: var(--abstand-s);
    min-block-size: 2.75rem;
    margin-block-end: 0.25rem;
  }
  .steine {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-wrap: wrap;
    gap: 0.4rem;
  }
  .stein {
    font: inherit;
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    min-block-size: 2.75rem;
    padding-block: 0.35rem;
    padding-inline: 0.65rem;
    border: none;
    border-radius: 999px;
    background: color-mix(in srgb, var(--farbe-flaeche-leise) 90%, var(--farbe-akzent));
    color: var(--farbe-text);
    cursor: pointer;
    text-align: start;
  }
  .stein.wahl {
    background: var(--farbe-flaeche);
    box-shadow: inset 0 0 0 1px var(--farbe-rand);
  }
  .stein.wahl.an {
    background: color-mix(in srgb, var(--farbe-flaeche) 70%, var(--farbe-akzent));
    box-shadow: inset 0 0 0 2px var(--farbe-akzent);
  }
  .stein.wahl input {
    position: absolute;
    opacity: 0;
    inline-size: 1px;
    block-size: 1px;
  }
  .punkt {
    inline-size: 0.65rem;
    block-size: 0.65rem;
    border-radius: 50%;
    background: var(--farbe-akzent);
    flex-shrink: 0;
  }
  .leise {
    color: var(--farbe-text-leise);
  }
</style>
