<script lang="ts">
  // Für Lehrkräfte: Aufgabenblatt drucken (B2, Wunsch des PV, PLAN §4b U7-Vorläufer).
  // Die Blatt-Logik steht im Kern (src/core/learning/arbeitsblatt.ts) und ist dieselbe wie bei
  // `pnpm arbeitsblatt`. PDF entsteht über den Druckdialog des Browsers (ARCHITEKTUR T-21),
  // ohne neue Abhängigkeit. Gedruckt wird nur die Druckansicht (@media print unten).
  import type { Kompetenz, Niveau } from '../../core/competence/kompetenz';
  import {
    BLATT_GRENZEN,
    blattAbfrage,
    neueBlattNummer,
    ohneAufgaben,
    passendeVorlagen,
    ziehe,
    type BlattEingabe,
  } from '../../core/learning/arbeitsblatt';
  import type { Generator } from '../../core/learning/generator';
  import type { GeneratorVorlage } from '../../core/learning/vorlage';
  import { generatoren } from '../../generators';
  import Druckblatt from './Druckblatt.svelte';
  import PdfKnopf from './PdfKnopf.svelte';
  import SafariWeg from './SafariWeg.svelte';
  import { KLASSEN } from '../ueben/klassen';
  import { t, type TextSchluessel } from '../texte/texte';

  let {
    kompetenzen,
    vorlagen,
    klasse,
  }: {
    kompetenzen: readonly Kompetenz[];
    vorlagen: readonly GeneratorVorlage[];
    klasse: number;
  } = $props();

  let offen = $state(false);
  // Startwerte aus der Klasse des Kindes; danach unabhängig davon
  // svelte-ignore state_referenced_locally
  let filterKlasse = $state(klasse);
  let filterBereich = $state('');
  let gewaehlt = $state<string[]>([]);
  let niveau = $state<Niveau>('G');
  let anzahl = $state(12);
  let blattNr = $state(1);
  let loesungen = $state(true);
  let punkte = $state(false);
  let titel = $state('');
  let datum = $state('');

  const gens = generatoren as ReadonlyMap<string, Generator<unknown>>;
  const mitAufgaben = $derived(
    kompetenzen.filter((k) => vorlagen.some((v) => v.kompetenz === k.id && gens.has(v.generator))),
  );
  const bereiche = $derived([...new Set(mitAufgaben.map((k) => k.bereich))]);
  const angeboten = $derived(
    mitAufgaben.filter(
      (k) =>
        k.klassenstufe_typisch.includes(filterKlasse) &&
        (filterBereich === '' || k.bereich === filterBereich),
    ),
  );
  const eingabe = $derived<BlattEingabe>({
    kompetenzen: mitAufgaben.filter((k) => gewaehlt.includes(k.id)),
    vorlagen,
    generatoren: gens,
  });
  const fehlend = $derived(ohneAufgaben(eingabe, niveau));
  const anzahlOk = $derived(
    Number.isInteger(anzahl) &&
      anzahl >= BLATT_GRENZEN.anzahlMin &&
      anzahl <= BLATT_GRENZEN.anzahlMax,
  );
  const nrOk = $derived(Number.isInteger(blattNr) && blattNr >= 0 && blattNr <= 99_999);
  const aufgaben = $derived(
    eingabe.kompetenzen.length > 0 && fehlend.length === 0 && anzahlOk && nrOk
      ? ziehe(eingabe, { niveau, anzahl, seed: blattNr })
      : [],
  );
  const thema = $derived(titel.trim() || eingabe.kompetenzen.map((k) => k.titel.de).join(' · '));
  const datumText = $derived(
    datum ? new Date(`${datum}T12:00:00`).toLocaleDateString('de-DE') : '',
  );

  function umschalten(id: string, an: boolean) {
    gewaehlt = an ? [...gewaehlt, id] : gewaehlt.filter((x) => x !== id);
  }

  const kompetenzName = (id: string) => kompetenzen.find((k) => k.id === id)?.titel.de ?? id;
  const niveauName = (n: Niveau) => t(`blatt.niveau-${n}` as TextSchluessel);
  // iPhone/iPad, vom Home-Bildschirm gestartet: Drucken wirkt dort nicht. Dann führt SafariWeg
  // das Blatt als eigene Druckseite nach Safari (src/ui/eltern/DruckSeite.svelte).
  const iosApp = (navigator as Navigator & { standalone?: boolean }).standalone === true;
  let blattBereich = $state<HTMLElement>();
  const blattElement = () => blattBereich?.querySelector<HTMLElement>('[data-druckblatt]');
  const pdfName = $derived(`bastion-aufgabenblatt-nr-${blattNr}.pdf`);
  const druckAdresse = $derived(
    `${location.origin}${import.meta.env.BASE_URL}?${blattAbfrage({
      kompetenzen: eingabe.kompetenzen.map((k) => k.id),
      niveau,
      anzahl,
      nr: blattNr,
      loesungen,
      punkte,
      titel: titel.trim(),
      datum,
    })}`,
  );
  // Nur Vorlagen, die es wirklich gibt: verhindert ein leeres Blatt ohne Hinweis
  const vorlagenZahl = $derived(passendeVorlagen(eingabe, niveau).length);
</script>

<section class="werkstatt-block lehrkraft" aria-labelledby="eltern-blatt">
  <h3 id="eltern-blatt">{t('blatt.titel')}</h3>
  <p class="leise">{t('blatt.text')}</p>
  <button type="button" aria-expanded={offen} onclick={() => (offen = !offen)}
    >{offen ? t('blatt.zuklappen') : t('blatt.oeffnen')}</button
  >

  {#if offen}
    <form class="auswahl" onsubmit={(e) => e.preventDefault()}>
      <fieldset>
        <legend>{t('blatt.themen')}</legend>
        <div class="filter">
          <label
            >{t('blatt.klasse')}
            <select bind:value={filterKlasse}>
              {#each KLASSEN as k (k)}<option value={k}>{k}</option>{/each}
            </select></label
          >
          <label
            >{t('blatt.bereich')}
            <select bind:value={filterBereich}>
              <option value="">{t('blatt.alle-bereiche')}</option>
              {#each bereiche as b (b)}<option value={b}
                  >{t(`bereich.${b}` as TextSchluessel)}</option
                >{/each}
            </select></label
          >
        </div>
        <ul class="themen">
          {#each angeboten as k (k.id)}
            <li>
              <label class="haken"
                ><input
                  type="checkbox"
                  checked={gewaehlt.includes(k.id)}
                  onchange={(e) => umschalten(k.id, e.currentTarget.checked)}
                />
                {k.titel.de}</label
              >
            </li>
          {:else}
            <li class="leise">{t('blatt.keine-themen')}</li>
          {/each}
        </ul>
        {#if gewaehlt.length > 0}
          <p class="leise" data-gewaehlt>
            {t('blatt.gewaehlt')}
            {gewaehlt.map(kompetenzName).join(' · ')}
          </p>
        {/if}
      </fieldset>

      <fieldset class="reihe">
        <legend>{t('blatt.niveau')}</legend>
        {#each ['G', 'M'] as const as n (n)}
          <label class="haken"
            ><input type="radio" name="blatt-niveau" value={n} bind:group={niveau} />
            {niveauName(n)}</label
          >
        {/each}
      </fieldset>

      <div class="felder">
        <label
          >{t('blatt.anzahl')}
          <input
            type="number"
            inputmode="numeric"
            min={BLATT_GRENZEN.anzahlMin}
            max={BLATT_GRENZEN.anzahlMax}
            bind:value={anzahl}
          /></label
        >
        <label
          >{t('blatt.nummer')}
          <input
            type="number"
            inputmode="numeric"
            min="0"
            max="99999"
            bind:value={blattNr}
          /></label
        >
        <button type="button" onclick={() => (blattNr = neueBlattNummer(blattNr))}
          >{t('blatt.neues')}</button
        >
      </div>
      <p class="leise">{t('blatt.nummer-hinweis')}</p>

      <div class="felder">
        <label class="haken"
          ><input type="checkbox" bind:checked={loesungen} /> {t('blatt.loesungen')}</label
        >
        <label class="haken"
          ><input type="checkbox" bind:checked={punkte} /> {t('blatt.punkte')}</label
        >
      </div>
      <div class="felder">
        <label
          >{t('blatt.eigener-titel')}
          <input type="text" maxlength="80" bind:value={titel} /></label
        >
        <label
          >{t('blatt.datum')}
          <input type="date" bind:value={datum} /></label
        >
      </div>
    </form>

    {#if gewaehlt.length === 0}
      <p class="leise" role="status">{t('blatt.erst-waehlen')}</p>
    {:else if fehlend.length > 0}
      <p role="status">
        {t('blatt.fehlt-niveau')}
        {fehlend.map((k) => k.titel.de).join(' · ')}
      </p>
    {:else if !anzahlOk || !nrOk || vorlagenZahl === 0}
      <p role="status">{t('blatt.ungueltig')}</p>
    {:else}
      {#if iosApp}
        <PdfKnopf blatt={blattElement} dateiname={pdfName} haupt />
        <details class="safari-weg">
          <summary>{t('blatt.pdf-oder')}</summary>
          <SafariWeg adresse={druckAdresse} />
        </details>
      {:else}
        <button type="button" class="haupt drucken" onclick={() => window.print()}
          >{t('blatt.drucken')}</button
        >
        <PdfKnopf blatt={blattElement} dateiname={pdfName} />
        <p class="leise">{t('blatt.drucken-hinweis')}</p>
      {/if}

      <div bind:this={blattBereich}>
        <Druckblatt {aufgaben} {thema} {niveau} {blattNr} {loesungen} {punkte} {datumText} />
      </div>
    {/if}
  {/if}
</section>

<style>
  .lehrkraft {
    display: grid;
    gap: var(--abstand-s);
  }
  .auswahl {
    display: grid;
    gap: var(--abstand-s);
  }
  fieldset {
    border: 1px solid var(--farbe-rand);
    border-radius: var(--radius);
    padding: var(--abstand-s);
    margin: 0;
    min-inline-size: 0;
  }
  .filter,
  .felder,
  .reihe {
    display: flex;
    flex-wrap: wrap;
    gap: var(--abstand-s);
    align-items: end;
  }
  .filter label,
  .felder label:not(.haken) {
    display: grid;
    gap: 0.25rem;
  }
  .felder input[type='number'] {
    inline-size: 6rem;
  }
  .felder input[type='text'] {
    inline-size: min(18rem, 100%);
  }
  .themen {
    list-style: none;
    padding: 0;
    margin-block: var(--abstand-s) 0;
    display: grid;
    gap: 0.25rem;
    max-block-size: 16rem;
    overflow-y: auto;
  }
  .haken {
    display: flex;
    gap: 0.5rem;
    align-items: center;
    min-block-size: 2.75rem;
  }

  /* Druckansicht: auf dem Bildschirm wie ein Blatt Papier, im App-Satz */
</style>
