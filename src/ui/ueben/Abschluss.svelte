<script lang="ts">
  // Abschlussbildschirm (KONZEPT §2, BASEBAU §6.1): Was habe ich heute gekonnt?
  // Zuerst das Können, ohne Punkte und Prozente; darunter die Ressourcen mit
  // „woher“ (§3.5, §9 Punkt 2: erst das Können, dann die Ressourcen);
  // zuletzt ein Vorschlag zur Pause (R5).
  import type { Kompetenz } from '../../core/competence/kompetenz';
  import type { AufgabeEreignis } from '../../core/learning/ereignis';
  import { tagesbilanz, type Thema } from '../../core/learning/heute';
  import type { BuchungEreignis } from '../../core/ledger/buchung';
  import { tagesertrag } from '../../core/ledger/heute';
  import { lerntag } from '../../core/policy/lerntag';
  import type { Zustand } from '../plattform/ablage';
  import { t } from '../texte/texte';

  let {
    kompetenzen,
    zustand,
    aufgaben,
    buchungen,
    onstart,
  }: {
    kompetenzen: readonly Kompetenz[];
    zustand: Zustand;
    aufgaben: readonly AufgabeEreignis[];
    buchungen: readonly BuchungEreignis[];
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
  const ertrag = $derived(tagesertrag(buchungen, aufgaben, tag));
  /** „1 Lerneinheit“, „2 Lerneinheiten“ */
  const mit = (n: number, eins: string, mehrere: string) => `${n} ${n === 1 ? eins : mehrere}`;
  const erzWoher = $derived(
    [
      ertrag.wiederholungen > 0
        ? mit(
            ertrag.wiederholungen,
            t('abschluss.wiederholung-eine'),
            t('abschluss.wiederholungen'),
          )
        : '',
      ertrag.korrekturen > 0
        ? mit(ertrag.korrekturen, t('abschluss.fehler-einer'), t('abschluss.fehler'))
        : '',
    ]
      .filter(Boolean)
      .join(` ${t('abschluss.und')} `),
  );
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
    <h3>{t('abschluss.ertrag')}</h3>
    {#if ertrag.menge.stein + ertrag.menge.erz + ertrag.menge.bauschritt + ertrag.menge.bauplan === 0}
      <p class="leise">{t('abschluss.ertrag-nichts')}</p>
    {:else}
      <ul class="ertrag">
        {#if ertrag.menge.stein > 0}
          <li>
            <strong>{ertrag.menge.stein} {t('ressource.stein')}</strong> – {t('abschluss.aus')}
            {mit(
              ertrag.steinAufgaben,
              t('abschluss.aufgabe-bearbeitet-eine'),
              t('abschluss.aufgaben-bearbeitet'),
            )}
          </li>
        {/if}
        {#if ertrag.menge.erz > 0}
          <li>
            <strong>{ertrag.menge.erz} {t('ressource.erz')}</strong> – {t('abschluss.aus')}
            {erzWoher}
          </li>
        {/if}
        {#if ertrag.menge.bauschritt > 0}
          <li>
            <strong
              >{mit(
                ertrag.menge.bauschritt,
                t('ressource.bauschritt-einer'),
                t('ressource.bauschritte'),
              )}</strong
            >
            – {t('abschluss.aus')}
            {mit(
              ertrag.menge.bauschritt,
              t('abschluss.lerneinheit-eine'),
              t('abschluss.lerneinheiten'),
            )}
          </li>
        {/if}
        {#if ertrag.menge.bauplan > 0}
          <li>
            <strong
              >{mit(
                ertrag.menge.bauplan,
                t('ressource.bauplan-einer'),
                t('ressource.bauplaene'),
              )}</strong
            >
            – {t('abschluss.weil')}
            {ertrag.bauplaene.map(name).join(', ')}
          </li>
        {/if}
      </ul>
    {/if}
    {#if ertrag.geraten > 0}<p class="leise">{t('abschluss.geraten')}</p>{/if}
    {#if ertrag.weniger}<p class="leise">{t('abschluss.weniger')}</p>{/if}
    {#if ertrag.gekappt > 0}<p class="leise">{t('abschluss.gekappt')}</p>{/if}
    {#if ertrag.bauschritteVoll}<p class="leise">{t('abschluss.bauschritte-voll')}</p>{/if}

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

  .ertrag {
    list-style: none;
    padding-inline-start: 0;
    display: grid;
    gap: var(--abstand-s);
  }

  .leise {
    color: var(--farbe-text-leise);
    margin-block: 0;
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
