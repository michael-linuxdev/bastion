<script lang="ts">
  // Kompetenzansicht (PLAN 1c, Punkt 8): was gefestigt ist, was wackelt – ohne
  // Bastion verständlich, ohne Noten und Prozente, mit Erklärung jeder Stufe.
  import { nachGraph, type Kompetenz, type Niveau } from '../../core/competence/kompetenz';
  import { empfohlen } from '../../core/learning/empfehlung';
  import type { AnzeigeStatus } from '../../core/learning/fortschritt';
  import type { AufgabeEreignis } from '../../core/learning/ereignis';
  import type { GeneratorVorlage } from '../../core/learning/vorlage';
  import Bericht from '../eltern/Bericht.svelte';
  import PinVermerke from '../eltern/PinVermerke.svelte';
  import { pinVermerke, type Zustand } from '../plattform/ablage';
  import { tt } from '../bastion/thema.svelte';
  import { t, type TextSchluessel } from '../texte/texte';
  import BasebauSchalter from '../bastion/BasebauSchalter.svelte';
  import KlassenWahl from './KlassenWahl.svelte';
  import { nachBereich } from './reihenfolge';
  import { naechsteWiederholung, sitzt, statusVon } from './stand';

  let {
    kompetenzen,
    vorlagen,
    zustand,
    aufgaben,
    niveau = $bindable(),
    klasse = $bindable(5),
    basebau = $bindable(true),
    selbst = false,
    onueben,
  }: {
    kompetenzen: readonly Kompetenz[];
    vorlagen: readonly GeneratorVorlage[];
    zustand: Zustand;
    aufgaben: readonly AufgabeEreignis[];
    niveau: Niveau;
    klasse?: number;
    /** Basebau-Schalter (R7) */
    basebau?: boolean;
    /** selbstverwaltet (L-15): kein Elternbereich – der Bericht gehört einem selbst */
    selbst?: boolean;
    onueben: (k: Kompetenz) => void;
  } = $props();

  let vermerke = $state<readonly string[]>([]);
  void pinVermerke().then((v) => (vermerke = v));

  // Einmal beim Öffnen – kein laufender Timer (R2)
  const jetzt = Date.now();
  const themen = $derived(
    nachGraph(nachBereich(kompetenzen)).filter(
      (k) =>
        k.klassenstufe_typisch.includes(klasse) &&
        vorlagen.some((v) => v.kompetenz === k.id && v.niveaus.includes(niveau)),
    ),
  );
  const status = $derived(
    new Map(themen.map((k) => [k.id, statusVon(zustand, k.id, niveau, jetzt)])),
  );
  const gruppe = (s: AnzeigeStatus) => themen.filter((k) => status.get(k.id) === s);
  const weiter = $derived(
    empfohlen(themen, (id) => sitzt(status.get(id) ?? 'neu'))
      .slice(0, 3)
      .map((id) => themen.find((k) => k.id === id))
      .filter((k): k is Kompetenz => k !== undefined),
  );
  const angefangen = $derived(themen.some((k) => status.get(k.id) !== 'neu'));
  /** Y123: alle Themen sitzen – ruhiger Satz, kein Scoreboard */
  const allesSitzt = $derived(
    angefangen && themen.length > 0 && themen.every((k) => sitzt(status.get(k.id) ?? 'neu')),
  );
  const datum = (ms: number) =>
    new Date(ms).toLocaleDateString('de-DE', { weekday: 'short', day: 'numeric', month: 'short' });

  const ABSCHNITTE: readonly AnzeigeStatus[] = ['auffrischen', 'in-arbeit', 'gekonnt', 'gefestigt'];
</script>

<section class="stand">
  <h2>{t('stand.ueberschrift')}</h2>
  <p class="leise">{t('stand.einleitung')}</p>

  <fieldset class="niveau">
    <legend>{t('niveau.ueberschrift')}</legend>
    <label><input type="radio" value="G" bind:group={niveau} /> {t('niveau.G')}</label>
    <label><input type="radio" value="M" bind:group={niveau} /> {t('niveau.M')}</label>
  </fieldset>
  <KlassenWahl bind:klasse />

  {#if allesSitzt}
    <p class="feier" role="status">{t('stand.alles-sitzt')}</p>
  {:else}
    <p class="zahlen">
      {themen.length}
      {t('stand.zusammenfassung')} ·
      {gruppe('gefestigt').length}
      {t('status.gefestigt')} ·
      {gruppe('gekonnt').length + gruppe('auffrischen').length}
      {t('status.gekonnt')} ·
      {gruppe('in-arbeit').length}
      {t('status.in-arbeit')}
    </p>
  {/if}

  {#if !angefangen}
    <p>{t('stand.leer')}</p>
  {/if}

  {#if weiter.length > 0}
    <h3>{t('stand.empfohlen')}</h3>
    <ul class="liste">
      {#each weiter as k (k.id)}
        <li>
          <span>{k.titel.de}</span>
          <button onclick={() => onueben(k)}>{t('diagnose.ueben')}</button>
        </li>
      {/each}
    </ul>
  {/if}

  {#each ABSCHNITTE as s (s)}
    {@const liste = gruppe(s)}
    {#if liste.length > 0}
      <h3 class="abschnitt {s}">{t(`stand.${s}` as TextSchluessel)} ({liste.length})</h3>
      <p class="leise">{t(`stand.${s}-erklaerung` as TextSchluessel)}</p>
      <ul class="liste">
        {#each liste as k (k.id)}
          {@const wann = naechsteWiederholung(zustand, k.id, niveau)}
          <li>
            <span>
              {k.titel.de}
              {#if wann !== undefined && (s === 'gekonnt' || s === 'gefestigt')}
                <small class="leise">{t('stand.wiederholung')} {datum(wann)}</small>
              {/if}
            </span>
            <button onclick={() => onueben(k)}>{t('diagnose.ueben')}</button>
          </li>
        {/each}
      </ul>
    {/if}
  {/each}

  {#if gruppe('neu').length > 0 && angefangen}
    <p class="leise">{t('stand.neu')}: {gruppe('neu').length}</p>
  {/if}

  <h3>{tt('basebau.ueberschrift')}</h3>
  <BasebauSchalter bind:an={basebau} durch="jugendlich" />

  <!-- Transparenz (KONZEPT §10): genau das, was Eltern sehen können -->
  <details class="eltern-sehen">
    <summary>{selbst ? t('stand.bericht-selbst') : t('stand.eltern-sehen')}</summary>
    {#if !selbst}<p class="leise">{t('stand.eltern-sehen-text')}</p>{/if}
    <PinVermerke {vermerke} />
    <Bericht {kompetenzen} {vorlagen} {zustand} {aufgaben} {klasse} />
  </details>
</section>

<style>
  .stand {
    display: grid;
    gap: var(--abstand-s);
  }

  .leise {
    color: var(--farbe-text-leise);
  }

  .zahlen {
    font-weight: bold;
  }

  .feier {
    margin-block: var(--abstand-s);
    padding-block: var(--abstand-s);
    padding-inline: var(--abstand-m);
    border-inline-start: 4px solid var(--farbe-erfolg);
    color: var(--farbe-text);
  }

  .niveau {
    display: flex;
    gap: var(--abstand-m);
    border: 1px solid var(--farbe-rand);
    border-radius: var(--radius);
  }

  .niveau label {
    min-block-size: 2.75rem;
    display: flex;
    align-items: center;
    gap: var(--abstand-s);
  }

  .abschnitt {
    margin-block-end: 0;
    border-inline-start: 4px solid var(--farbe-rand);
    padding-inline-start: var(--abstand-s);
  }

  .abschnitt.gefestigt,
  .abschnitt.gekonnt {
    border-inline-start-color: var(--farbe-erfolg);
  }

  .abschnitt.auffrischen {
    border-inline-start-color: var(--farbe-akzent);
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
    gap: var(--abstand-s);
    background: var(--farbe-flaeche);
    border: 1px solid var(--farbe-rand);
    border-radius: var(--radius);
    padding-block: var(--abstand-s);
    padding-inline: var(--abstand-m);
  }

  .liste small {
    display: block;
  }

  .eltern-sehen {
    margin-block-start: var(--abstand-l);
  }

  .eltern-sehen summary {
    cursor: pointer;
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
