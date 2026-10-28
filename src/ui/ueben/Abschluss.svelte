<script lang="ts">
  // Abschlussbildschirm (KONZEPT §2, BASEBAU §6.1): Was habe ich heute gekonnt?
  // Zuerst das Können, ohne Punkte und Prozente; dann ein Vorschlag zur Pause (R5).
  // Ressourcen kommen erst mit dem Basebau dazu.
  import type { Kompetenz } from '../../core/competence/kompetenz';
  import type { AufgabeEreignis } from '../../core/learning/ereignis';
  import { tagesbilanz, type Thema } from '../../core/learning/heute';
  import { lerntag } from '../../core/policy/lerntag';
  import type { Zustand } from '../plattform/ablage';
  import { t } from '../texte/texte';

  let {
    kompetenzen,
    zustand,
    aufgaben,
    onstart,
  }: {
    kompetenzen: readonly Kompetenz[];
    zustand: Zustand;
    aufgaben: readonly AufgabeEreignis[];
    onstart: () => void;
  } = $props();

  // Einmal beim Öffnen – kein laufender Timer (R2)
  const jetzt = Date.now();
  const tag = lerntag(jetzt, -new Date(jetzt).getTimezoneOffset());
  const bilanz = $derived(tagesbilanz(aufgaben, [...zustand.staende.values()], tag));
  const titel = $derived(new Map(kompetenzen.map((k) => [k.id, k.titel.de])));
  const name = (th: Thema) =>
    `${titel.get(th.kompetenz) ?? th.kompetenz} · ${t(th.niveau === 'G' ? 'niveau.G' : 'niveau.M')}`;
  const anzahl = (n: number, eins: string, mehrere: string) => (n === 1 ? eins : `${n} ${mehrere}`);
</script>

<section class="abschluss">
  <h2>{t('abschluss.ueberschrift')}</h2>

  {#if bilanz.aufgaben === 0}
    <p>{t('abschluss.nichts')}</p>
  {:else}
    {#if bilanz.gefestigt.length > 0}
      <h3>{t('abschluss.gefestigt')}</h3>
      <ul class="erfolg">
        {#each bilanz.gefestigt as th (`${th.kompetenz}|${th.niveau}`)}<li>✓ {name(th)}</li>{/each}
      </ul>
    {/if}
    {#if bilanz.gekonnt.length > 0}
      <h3>{t('abschluss.gekonnt')}</h3>
      <ul class="erfolg">
        {#each bilanz.gekonnt as th (`${th.kompetenz}|${th.niveau}`)}<li>✓ {name(th)}</li>{/each}
      </ul>
    {/if}

    <h3>{t('abschluss.geuebt')}</h3>
    <ul>
      {#each bilanz.themen as th (`${th.kompetenz}|${th.niveau}`)}<li>{name(th)}</li>{/each}
    </ul>

    <ul class="zahlen">
      <li>
        {anzahl(bilanz.aufgaben, t('abschluss.aufgabe-eine'), t('abschluss.aufgaben'))}
      </li>
      {#if bilanz.wiederholt > 0}
        <li>
          {anzahl(bilanz.wiederholt, t('abschluss.wiederholt-eine'), t('abschluss.wiederholt'))}
        </li>
      {/if}
      {#if bilanz.aufgearbeitet > 0}
        <li>
          {anzahl(
            bilanz.aufgearbeitet,
            t('abschluss.aufgearbeitet-einer'),
            t('abschluss.aufgearbeitet'),
          )}
        </li>
      {/if}
    </ul>
    <p class="pause">{t('abschluss.pause')}</p>
  {/if}

  <button class="haupt" onclick={onstart}>{t('abschluss.startseite')}</button>
</section>

<style>
  .abschluss {
    display: grid;
    gap: var(--abstand-s);
  }

  h3 {
    margin-block: var(--abstand-m) 0;
  }

  ul {
    margin-block: 0;
    padding-inline-start: var(--abstand-l);
  }

  .erfolg {
    list-style: none;
    padding-inline-start: 0;
    color: #3f7d3a;
    font-weight: bold;
  }

  .zahlen {
    list-style: none;
    padding-inline-start: 0;
    margin-block-start: var(--abstand-m);
    color: var(--farbe-text-leise);
  }

  .pause {
    border-inline-start: 4px solid var(--farbe-akzent);
    padding-inline-start: var(--abstand-m);
  }

  button {
    font: inherit;
    justify-self: start;
    min-block-size: 2.75rem;
    padding-inline: var(--abstand-m);
    border-radius: var(--radius);
    border: 2px solid var(--farbe-akzent);
    cursor: pointer;
  }

  .haupt {
    background: var(--farbe-akzent);
    color: var(--farbe-hintergrund);
  }
</style>
