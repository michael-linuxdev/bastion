<script lang="ts">
  // Klassenarbeit vorbereiten (LEHRPLAN L-19): Termin und Themen eintragen, die noch
  // unsicheren Themen üben, eine Probe-Klassenarbeit ohne Hilfen schreiben.
  // Nur das Datum, kein Countdown (R2, kein Druck).
  import { untrack } from 'svelte';
  import type { Kompetenz } from '../../core/competence/kompetenz';
  import { lernbereiche } from '../../core/learning/gerade-dran';
  import { nochUeben, type Klassenarbeit } from '../../core/learning/klassenarbeit';
  import type { Zustand } from '../plattform/ablage';
  import { t, type TextSchluessel } from '../texte/texte';
  import { statusVon } from './stand';

  let {
    kompetenzen,
    klasse,
    schulart,
    zustand,
    geradeDran,
    heute,
    klassenarbeit = $bindable(undefined),
    onueben,
    onprobe,
  }: {
    /** nur Kompetenzen mit Aufgaben */
    kompetenzen: readonly Kompetenz[];
    klasse: number;
    schulart: 'oberschule' | 'gymnasium' | undefined;
    zustand: Zustand;
    geradeDran: readonly string[];
    /** heutiger Lerntag (frühestes Datum) */
    heute: string;
    klassenarbeit?: Klassenarbeit | undefined;
    onueben: (k: Kompetenz) => void;
    onprobe: (themen: readonly string[]) => void;
  } = $props();

  const jetzt = Date.now();
  // Formular startet mit der gespeicherten Klassenarbeit – sonst mit „Gerade dran“
  let termin = $state(untrack(() => klassenarbeit?.termin ?? ''));
  let themen = $state<readonly string[]>(untrack(() => klassenarbeit?.themen ?? geradeDran));
  let bearbeiten = $state(false);
  const formular = $derived(klassenarbeit === undefined || bearbeiten);

  const gruppen = $derived(lernbereiche(kompetenzen, klasse, schulart));
  const nachId = $derived(new Map(kompetenzen.map((k) => [k.id, k])));
  const ueben = $derived(
    klassenarbeit
      ? nochUeben(klassenarbeit, (id) => statusVon(zustand, id, 'G', jetzt))
          .map((id) => nachId.get(id))
          .filter((k): k is Kompetenz => k !== undefined)
      : [],
  );
  const name = (n: string, art: 'lehrplan' | 'feld') =>
    art === 'feld' ? t(`feld.${n}` as TextSchluessel) : n;
  const datum = (tag: string) =>
    new Date(`${tag}T12:00:00`).toLocaleDateString('de-DE', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    });
  function umschalten(id: string) {
    themen = themen.includes(id) ? themen.filter((x) => x !== id) : [...themen, id];
  }
</script>

<section class="klassenarbeit">
  <h2>{t('ka.ueberschrift')}</h2>
  <p class="nüchtern">{t('ka.nüchtern-hinweis')}</p>
  {#if klassenarbeit && !formular}
    <p class="termin">{t('ka.am')} {datum(klassenarbeit.termin)}</p>
    {#if ueben.length > 0}
      <h3>{t('ka.noch-ueben')}</h3>
      <ul class="liste">
        {#each ueben as k (k.id)}
          <li><button onclick={() => onueben(k)}>{k.titel.de}</button></li>
        {/each}
      </ul>
    {:else}
      <p>{t('ka.alles-sitzt')}</p>
    {/if}
    <p class="knoepfe">
      <button class="haupt" onclick={() => klassenarbeit && onprobe(klassenarbeit.themen)}
        >{t('ka.probe')}</button
      >
      <button class="zweit" onclick={() => (bearbeiten = true)}>{t('ka.aendern')}</button>
      <button
        class="zweit"
        onclick={() => {
          klassenarbeit = undefined;
          termin = '';
          themen = geradeDran;
        }}>{t('ka.loeschen')}</button
      >
    </p>
    <p class="leise">{t('ka.probe-erklaerung')}</p>
  {:else}
    <p>{t('ka.einleitung')}</p>
    <form
      onsubmit={(e) => {
        e.preventDefault();
        if (termin !== '' && themen.length > 0) {
          klassenarbeit = { termin, themen: [...themen] };
          bearbeiten = false;
        }
      }}
    >
      <label class="datum"
        >{t('ka.termin')} <input type="date" bind:value={termin} min={heute} required /></label
      >
      <p>{t('ka.themen')}</p>
      {#each gruppen as g (g.name)}
        <fieldset>
          <legend><strong>{name(g.name, g.art)}</strong></legend>
          {#each g.kompetenzen as k (k.id)}
            <label
              ><input
                type="checkbox"
                checked={themen.includes(k.id)}
                onchange={() => umschalten(k.id)}
              />
              {k.titel.de}</label
            >
          {/each}
        </fieldset>
      {/each}
      <button class="haupt" type="submit" disabled={termin === '' || themen.length === 0}
        >{t('ka.speichern')}</button
      >
    </form>
  {/if}
</section>

<style>
  /* K40: nüchterner als Üben – weniger Schatten, ruhigere Flächen */
  .klassenarbeit {
    display: grid;
    gap: var(--abstand-s);
    padding: var(--abstand-m);
    border-radius: var(--radius);
    background: var(--farbe-hintergrund);
    border: 1px solid var(--farbe-rand);
    box-shadow: none;
  }
  .nüchtern {
    margin: 0;
    color: var(--farbe-text-leise);
    font-size: 0.95rem;
    border-inline-start: 3px solid var(--farbe-rand);
    padding-inline-start: var(--abstand-s);
  }
  .termin {
    font-weight: 600;
  }
  form {
    display: grid;
    gap: var(--abstand-s);
  }
  fieldset {
    border: 1px solid var(--farbe-rand);
    border-radius: var(--radius);
    display: grid;
    gap: 0.25rem;
    background: transparent;
  }
  label {
    display: flex;
    align-items: center;
    gap: var(--abstand-s);
    min-block-size: 2.75rem;
  }
  .datum {
    display: grid;
    gap: 0.25rem;
    max-inline-size: 22rem;
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
    border: 1px solid var(--farbe-rand);
    border-radius: var(--radius);
    background: var(--farbe-flaeche);
    box-shadow: none;
  }
  .knoepfe {
    display: flex;
    flex-wrap: wrap;
    gap: var(--abstand-s);
  }
  .klassenarbeit :global(.haupt) {
    background: var(--farbe-text);
    color: var(--farbe-flaeche);
  }
</style>
