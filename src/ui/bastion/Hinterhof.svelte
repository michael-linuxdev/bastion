<script lang="ts">
  // Hinterhof (BASEBAU B-25): das Können sichtbar, je Lernfeld. Privat – er gehört
  // nur dem Kind; beim späteren Zeigen ist er nur dabei, wenn es ihn selbst
  // einschaltet. Leere Plätze heißen „noch offen“, nie rot.
  // Design L59: gleiche ruhige HUD-Optik wie die Bastion-Spiel-Leiste.
  import type { Kompetenz } from '../../core/competence/kompetenz';
  import type { AufgabeEreignis } from '../../core/learning/ereignis';
  import type { KompetenzStand } from '../../core/learning/fortschritt';
  import { hinterhof, type HinterhofPlatz } from '../../core/learning/hinterhof';
  import type { TextSchluessel } from '../texte/texte';
  import { tt } from './thema.svelte';

  let {
    kompetenzen,
    staende,
    aufgaben,
    klasse,
  }: {
    kompetenzen: readonly Kompetenz[];
    staende: readonly KompetenzStand[];
    aufgaben: readonly AufgabeEreignis[];
    klasse: number;
  } = $props();

  const felder = $derived(hinterhof(kompetenzen, staende, aufgaben, klasse));
  const titel = $derived(new Map(kompetenzen.map((k) => [k.id, k.titel.de])));
  const zustand = (p: HinterhofPlatz) =>
    tt(p.fuellung === 'M' ? 'hinterhof.m' : p.fuellung === 'G' ? 'hinterhof.g' : 'hinterhof.offen');
</script>

<section class="hinterhof" aria-labelledby="hinterhof-titel">
  <h3 id="hinterhof-titel">{tt('hinterhof.ueberschrift')}</h3>
  <p class="leise">{tt('hinterhof.einleitung')}</p>
  <ul class="felder">
    {#each felder as f (f.feld)}
      <li class="feld-karte">
        <details>
          <summary>
            <span class="chip">
              <span class="name">{tt(`feld.${f.feld}` as TextSchluessel)}</span>
              <span class="zahl">{f.gefuellt}/{f.plaetze.length}</span>
            </span>
            <span class="plaetze" aria-hidden="true">
              {#each f.plaetze as p (p.kompetenz)}
                <span
                  class="platz {p.fuellung}"
                  class:vorwissen={p.vorwissen}
                  class:voraus={p.voraus}
                ></span>
              {/each}
            </span>
          </summary>
          <ul class="liste">
            {#each f.plaetze as p (p.kompetenz)}
              <li>
                <span
                  class="platz {p.fuellung}"
                  class:vorwissen={p.vorwissen}
                  class:voraus={p.voraus}
                  aria-hidden="true"
                ></span>
                <span>
                  {titel.get(p.kompetenz) ?? p.kompetenz}
                  <small class="leise">
                    – {zustand(p)}{#if p.vorwissen}, {tt('hinterhof.vorwissen')}{/if}{#if p.voraus}, {tt(
                        'hinterhof.voraus',
                      )}{/if}
                  </small>
                </span>
              </li>
            {/each}
          </ul>
        </details>
      </li>
    {/each}
  </ul>
  <p class="leise">{tt('hinterhof.privat')}</p>
</section>

<style>
  .hinterhof {
    display: grid;
    gap: var(--abstand-s);
  }

  .felder {
    list-style: none;
    margin: 0;
    padding: 0;
    display: grid;
    gap: var(--abstand-s);
  }

  .feld-karte {
    padding: 0.35rem 0.45rem;
    border-radius: var(--radius);
    background: color-mix(in srgb, var(--farbe-flaeche) 90%, transparent);
    box-shadow: 0 1px 4px var(--farbe-schatten);
  }

  summary {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--abstand-s);
    cursor: pointer;
    list-style: none;
  }

  summary::-webkit-details-marker {
    display: none;
  }

  .chip {
    display: flex;
    align-items: center;
    gap: 0.35rem;
    min-block-size: 2rem;
    padding-inline: 0.35rem;
    color: var(--farbe-akzent);
    font-size: 0.85rem;
    font-weight: 700;
  }

  .name {
    font-weight: 800;
    color: var(--farbe-text);
  }

  .zahl {
    color: var(--farbe-text-leise);
    font-weight: 700;
  }

  .plaetze {
    display: flex;
    flex-wrap: wrap;
    gap: 3px;
    inline-size: 100%;
  }

  .platz {
    display: inline-block;
    inline-size: 1rem;
    block-size: 1rem;
    border-radius: 3px;
    border: 1.5px solid var(--farbe-rand);
    flex-shrink: 0;
  }

  .platz.G {
    background: var(--hinterhof-g);
    border-color: var(--hinterhof-g);
  }

  .platz.M {
    background: var(--hinterhof-m);
    border-color: var(--hinterhof-m);
  }

  .platz.vorwissen {
    outline: 2px dotted var(--farbe-akzent);
    outline-offset: 1px;
  }

  .platz.voraus {
    box-shadow: 0 0 0 2px var(--bastion-wissen);
  }

  .liste {
    list-style: none;
    padding-inline-start: 0;
    display: grid;
    gap: 0.25rem;
    margin-block-start: var(--abstand-s);
  }

  .liste li {
    display: flex;
    gap: var(--abstand-s);
    align-items: baseline;
  }

  .leise {
    color: var(--farbe-text-leise);
  }
</style>
