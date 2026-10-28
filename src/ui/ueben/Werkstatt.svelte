<script lang="ts">
  // Fehlerwerkstatt (R6): offene Fehler nach Ursache, mit der passenden
  // Rückmeldung als Überschrift. Kein Zähler für „schlechte“ Leistung, keine Wertung.
  import type { Kompetenz } from '../../core/competence/kompetenz';
  import { fuelle } from '../../core/learning/text';
  import type { GeneratorVorlage } from '../../core/learning/vorlage';
  import type { Fehlergruppe } from '../../core/learning/werkstatt';
  import { t } from '../texte/texte';
  import Textteile from './Textteile.svelte';

  let {
    gruppen,
    vorlagen,
    kompetenzen,
    onaufarbeiten,
  }: {
    gruppen: readonly Fehlergruppe[];
    vorlagen: ReadonlyMap<string, GeneratorVorlage>;
    kompetenzen: ReadonlyMap<string, Kompetenz>;
    onaufarbeiten: (gruppe: Fehlergruppe) => void;
  } = $props();

  function ursache(g: Fehlergruppe) {
    const text = g.fehlerbild ? vorlagen.get(g.vorlage)?.fehlerbilder[g.fehlerbild] : undefined;
    const beispiel = g.fehler[0]?.schnappschuss?.platzhalter ?? {};
    if (!text) return undefined;
    try {
      return fuelle(text.de, beispiel);
    } catch {
      return undefined; // Vorlage hat sich geändert – dann ohne Ursachentext
    }
  }
</script>

<section class="werkstatt">
  <h2>{t('werkstatt.ueberschrift')}</h2>
  <p class="einleitung">{t('werkstatt.einleitung')}</p>

  {#if gruppen.length === 0}
    <p>{t('werkstatt.leer')}</p>
  {:else}
    <ul class="liste">
      {#each gruppen as g (`${g.vorlage}|${g.niveau}|${g.fehlerbild ?? ''}`)}
        {@const u = ursache(g)}
        <li class="gruppe">
          <p class="ursache">
            {#if u}<Textteile teile={u} />{:else}{t('werkstatt.ohne-muster')}{/if}
          </p>
          <p class="herkunft">
            {kompetenzen.get(g.kompetenz)?.titel.de ?? g.kompetenz} · {t(
              g.niveau === 'G' ? 'niveau.G' : 'niveau.M',
            )} · {g.fehler.length}
            {t('werkstatt.mal')}
          </p>
          <button onclick={() => onaufarbeiten(g)}>{t('werkstatt.aufarbeiten')}</button>
        </li>
      {/each}
    </ul>
  {/if}
</section>

<style>
  .werkstatt {
    display: grid;
    gap: var(--abstand-s);
  }

  .einleitung,
  .herkunft {
    color: var(--farbe-text-leise);
  }

  .liste {
    list-style: none;
    padding: 0;
    margin: 0;
    display: grid;
    gap: var(--abstand-m);
  }

  .gruppe {
    background: var(--farbe-flaeche);
    border: 1px solid var(--farbe-rand);
    border-radius: var(--radius);
    padding-block: var(--abstand-s);
    padding-inline: var(--abstand-m);
  }

  .ursache {
    font-weight: bold;
  }

  button {
    font: inherit;
    min-block-size: 2.75rem;
    padding-inline: var(--abstand-m);
    border-radius: var(--radius);
    border: 2px solid var(--farbe-akzent);
    background: transparent;
    color: var(--farbe-text);
    cursor: pointer;
  }
</style>
