<script lang="ts">
  // Fehlerwerkstatt (R6): offene Fehler nach Ursache, mit der passenden
  // Rückmeldung als Überschrift. Kein Zähler für „schlechte“ Leistung, keine Wertung.
  import type { Kompetenz } from '../../core/competence/kompetenz';
  import { fuelle } from '../../core/learning/text';
  import type { GeneratorVorlage } from '../../core/learning/vorlage';
  import type { Fehlergruppe } from '../../core/learning/werkstatt';
  import type { Fehlvorstellung } from '../../core/learning/fehlvorstellung';
  import type { FvStand } from '../../core/learning/fv-diagnose';
  import Leerzustand from '../grafik/Leerzustand.svelte';
  import { t } from '../texte/texte';
  import Textteile from './Textteile.svelte';

  let {
    gruppen,
    vorlagen,
    kompetenzen,
    fehlvorstellungen = new Map(),
    fvStaende = new Map(),
    onaufarbeiten,
  }: {
    gruppen: readonly Fehlergruppe[];
    vorlagen: ReadonlyMap<string, GeneratorVorlage>;
    kompetenzen: ReadonlyMap<string, Kompetenz>;
    /** Fehlerkatalog und Diagnose: Gruppen nach Denkfehler (U3j) */
    fehlvorstellungen?: ReadonlyMap<string, Fehlvorstellung>;
    fvStaende?: ReadonlyMap<string, FvStand>;
    onaufarbeiten: (gruppe: Fehlergruppe) => void;
  } = $props();

  /** Themen einer Gruppe – bei Denkfehlern können es mehrere sein */
  const themen = (g: Fehlergruppe) =>
    [...new Set(g.fehler.map((e) => kompetenzen.get(e.kompetenz)?.titel.de ?? e.kompetenz))].join(
      ', ',
    );

  function ursache(g: Fehlergruppe) {
    const fv = g.fv ? fehlvorstellungen.get(g.fv) : undefined;
    if (fv) return fuelle(fv.erklaerung.kurz.de, {});
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
    <Leerzustand symbol="werkstatt" text={t('werkstatt.leer')} />
  {:else}
    <ul class="liste">
      {#each gruppen as g (g.fv ?? `${g.vorlage}|${g.niveau}|${g.fehlerbild ?? ''}`)}
        {@const u = ursache(g)}
        {@const fv = g.fv ? fehlvorstellungen.get(g.fv) : undefined}
        {@const zustand = g.fv ? fvStaende.get(g.fv)?.zustand : undefined}
        <li class="gruppe">
          {#if fv}
            <p class="denkfehler">
              {t('werkstatt.denkfehler')}
              {fv.name.de}
              {#if zustand}<span class="zustand">{t(`werkstatt.fv.${zustand}`)}</span>{/if}
            </p>
          {/if}
          <p class="ursache">
            {#if u}<Textteile teile={u} />{:else}{t('werkstatt.ohne-muster')}{/if}
          </p>
          <p class="herkunft">
            {fv ? themen(g) : (kompetenzen.get(g.kompetenz)?.titel.de ?? g.kompetenz)}
            {#if !fv}· {t(g.niveau === 'G' ? 'niveau.G' : 'niveau.M')}{/if} · {g.fehler.length}
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

  .denkfehler {
    font-weight: 800;
    margin-block: 0;
  }

  .zustand {
    font-weight: normal;
    font-size: 0.875rem;
    color: var(--farbe-text-leise);
    margin-inline-start: var(--abstand-s);
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
