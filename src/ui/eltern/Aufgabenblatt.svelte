<script lang="ts">
  // Für Lehrkräfte: Aufgabenblatt drucken (B2, Wunsch des PV, PLAN §4b U7-Vorläufer).
  // Die Blatt-Logik steht im Kern (src/core/learning/arbeitsblatt.ts) und ist dieselbe wie bei
  // `pnpm arbeitsblatt`. PDF entsteht über den Druckdialog des Browsers (ARCHITEKTUR T-21),
  // ohne neue Abhängigkeit. Gedruckt wird nur die Druckansicht (@media print unten).
  import type { Kompetenz, Niveau } from '../../core/competence/kompetenz';
  import {
    BLATT_GRENZEN,
    blattStufe,
    loesungAlsText,
    neueBlattNummer,
    ohneAufgaben,
    ohneBegriffe,
    optionsBuchstabe,
    passendeVorlagen,
    punkteSumme,
    ziehe,
    type BlattAufgabe,
    type BlattEingabe,
  } from '../../core/learning/arbeitsblatt';
  import type { Generator, Loesung } from '../../core/learning/generator';
  import { fuelle, zahlText } from '../../core/learning/text';
  import type { GeneratorVorlage } from '../../core/learning/vorlage';
  import { generatoren } from '../../generators';
  import Textteile from '../ueben/Textteile.svelte';
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
  const stufe = $derived(blattStufe(aufgaben));
  const thema = $derived(titel.trim() || eingabe.kompetenzen.map((k) => k.titel.de).join(' · '));
  const datumText = $derived(
    datum ? new Date(`${datum}T12:00:00`).toLocaleDateString('de-DE') : '',
  );

  function umschalten(id: string, an: boolean) {
    gewaehlt = an ? [...gewaehlt, id] : gewaehlt.filter((x) => x !== id);
  }

  const kompetenzName = (id: string) => kompetenzen.find((k) => k.id === id)?.titel.de ?? id;
  const teile = (s: string, platzhalter: Parameters<typeof fuelle>[1]) =>
    fuelle(ohneBegriffe(s), platzhalter);
  const loesungAlsTextOhneHtml = (a: BlattAufgabe) =>
    loesungAlsText(a.instanz.loesung, a.instanz.optionen);
  const loesungBruch = (l: Loesung) => (l.typ === 'bruch' ? l.wert : undefined);
  const niveauName = (n: Niveau) => t(`blatt.niveau-${n}` as TextSchluessel);
  const stufeText = (s: number) => t(`blatt.stufe-${s}` as TextSchluessel);
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
      <button type="button" class="haupt drucken" onclick={() => window.print()}
        >{t('blatt.drucken')}</button
      >
      <p class="leise">{t('blatt.drucken-hinweis')}</p>

      <div class="druckblatt" data-druckblatt>
        <article class="seite">
          <header class="kopf">
            <p class="zeile">
              <span>{t('blatt.name')} ______________________</span>
              <span
                >{t('blatt.datum-zeile')}
                {datumText || '____________'}</span
              >
            </p>
            <h4>{thema}</h4>
            <p class="hinweis">
              {aufgaben.length}
              {t('blatt.aufgaben')} · {niveauName(
                niveau,
              )}{#if punkte}{` · ${punkteSumme(aufgaben)} ${t('blatt.punkte-kurz')}`}{/if}
            </p>
          </header>
          <ol class="aufgaben">
            {#each aufgaben as a (a.nr)}
              <li class="aufgabe" data-aufgabe>
                <p class="frage">
                  <b class="nr">{a.nr}</b>
                  <Textteile
                    teile={teile(a.vorlage.text.aufgabe.de, a.instanz.platzhalter)}
                    erklaeren={false}
                  />
                  {#if punkte}<span class="punkte">({a.punkte} {t('blatt.punkte-kurz')})</span>{/if}
                </p>
                {#if a.instanz.bild}
                  <figure class="bild" role="img" aria-label={a.instanz.bild.beschreibung.de}>
                    <!-- SVG stammt aus unseren Generatoren (Code, kein Paketinhalt);
                         die Pflicht-Tests schließen Skripte und Verweise aus. -->
                    <!-- eslint-disable-next-line svelte/no-at-html-tags -->
                    {@html a.instanz.bild.svg}
                  </figure>
                {/if}
                {#if a.instanz.elemente}
                  <p class="elemente">{a.instanz.elemente.map(zahlText).join('   ')}</p>
                {/if}
                {#if a.instanz.optionen}
                  <div class="optionen">
                    {#each a.instanz.optionen as o, n (n)}
                      <span class="option"
                        ><b>{optionsBuchstabe(n)}</b>
                        {#if o.text}<Textteile
                            teile={teile(o.text.de, {})}
                            erklaeren={false}
                          />{/if}
                        {#if o.bild}
                          <!-- eslint-disable-next-line svelte/no-at-html-tags -->
                          {@html o.bild.svg}
                        {/if}</span
                      >
                    {/each}
                  </div>
                {/if}
                <div class="rechnen" class:klein={a.instanz.optionen !== undefined}></div>
                <p class="antwort">{t('blatt.ergebnis')} ____________</p>
              </li>
            {/each}
          </ol>
          <footer class="fuss">
            <span>{t('blatt.fuss')} {blattNr} · {niveauName(niveau)}</span>
            <span class="stufe" data-stufe
              >{stufeText(stufe)} ({t('blatt.review-stufe')} {stufe})</span
            >
          </footer>
        </article>

        {#if loesungen}
          <article class="seite loesungsseite" data-loesungen>
            <header class="kopf">
              <h4>{t('blatt.loesungen-titel')} {thema}</h4>
              <p class="hinweis">
                {t('blatt.fuss')}
                {blattNr} · {niveauName(niveau)} · {t(
                  'blatt.fuer-lehrkraft',
                )}{#if punkte}{` · ${punkteSumme(aufgaben)} ${t('blatt.punkte-kurz')}`}{/if}
              </p>
            </header>
            <ol class="liste">
              {#each aufgaben as a (a.nr)}
                {@const bruch = loesungBruch(a.instanz.loesung)}
                <li class="loesung">
                  <p>
                    <b class="nr">{a.nr}</b>
                    <b
                      >{#if bruch}<Textteile
                          teile={[
                            {
                              art: 'bruch',
                              zaehler: zahlText(bruch.zaehler),
                              nenner: zahlText(bruch.nenner),
                              fett: false,
                            },
                          ]}
                          erklaeren={false}
                        />{:else}{loesungAlsTextOhneHtml(a)}{/if}</b
                    >
                    {#if punkte}<span class="punkte">({a.punkte} {t('blatt.punkte-kurz')})</span
                      >{/if}
                  </p>
                  {#if a.instanz.loesungsweg.length > 0}
                    <ol class="weg">
                      {#each a.instanz.loesungsweg as s, n (n)}
                        <li>
                          <Textteile teile={teile(s.de, a.instanz.platzhalter)} erklaeren={false} />
                        </li>
                      {/each}
                    </ol>
                  {/if}
                </li>
              {/each}
            </ol>
            <footer class="fuss">
              <span>{t('blatt.fuss')} {blattNr} · {niveauName(niveau)}</span>
              <span class="stufe">{stufeText(stufe)} ({t('blatt.review-stufe')} {stufe})</span>
            </footer>
          </article>
        {/if}
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
  .druckblatt {
    display: grid;
    gap: var(--abstand-m);
    color: #111;
  }
  .seite {
    background: #fff;
    color: #111;
    padding: var(--abstand-m);
    border: 1px solid var(--farbe-rand);
    border-radius: var(--radius);
    overflow-x: auto;
  }
  .kopf .zeile {
    display: flex;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: var(--abstand-s);
    margin: 0;
  }
  .kopf h4 {
    font-size: 1.2rem;
    margin-block: 0.4rem;
  }
  .hinweis {
    color: #555;
    font-size: 0.85rem;
    margin-block: 0 0.6rem;
  }
  .aufgaben,
  .liste {
    list-style: none;
    padding: 0;
    margin: 0;
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(min(100%, 16rem), 1fr));
    gap: 0.8rem 1.2rem;
  }
  .aufgabe {
    break-inside: avoid;
    display: flex;
    flex-direction: column;
  }
  .frage {
    margin-block: 0 0.3rem;
  }
  .nr {
    display: inline-block;
    min-inline-size: 1.4rem;
  }
  .punkte {
    color: #444;
    font-size: 0.85em;
    white-space: nowrap;
  }
  .rechnen {
    flex: 1;
    min-block-size: 4.5cm;
    border: 1px solid #999;
    background-image:
      linear-gradient(#ddd 1px, transparent 1px), linear-gradient(90deg, #ddd 1px, transparent 1px);
    background-size: 5mm 5mm;
    print-color-adjust: exact;
    -webkit-print-color-adjust: exact;
  }
  .rechnen.klein {
    flex: 0 0 auto;
    min-block-size: 1.5cm;
  }
  .antwort {
    margin-block: 0.3rem 0;
  }
  .optionen {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    margin-block-end: 0.3rem;
  }
  .option :global(svg) {
    inline-size: 6.5rem;
    block-size: auto;
    vertical-align: middle;
  }
  .bild {
    margin: 0;
  }
  .bild :global(svg) {
    inline-size: 9rem;
    block-size: auto;
  }
  .loesung {
    break-inside: avoid;
    border-block-start: 1px solid #bbb;
    padding-block-start: 0.3rem;
  }
  .loesung p {
    margin: 0;
  }
  ol.weg {
    margin: 0.2rem 0 0;
    padding-inline-start: 1.2rem;
    font-size: 0.9rem;
  }
  .fuss {
    display: flex;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: var(--abstand-s);
    border-block-start: 1px solid #999;
    margin-block-start: 1rem;
    padding-block-start: 0.3rem;
    font-size: 0.8rem;
    color: #444;
  }
  .fuss .stufe {
    font-weight: bold;
  }

  /*
   * Druck (A4): nur das Blatt, keine App-Leisten. Alles, was das Blatt nicht enthält oder
   * selbst das Blatt ist, wird ausgeblendet; die Vorfahren verlieren Rahmen und Abstände.
   */
  @media print {
    @page {
      size: A4;
      margin: 15mm 15mm 18mm;
    }
    :global(
      body:has([data-druckblatt])
        *:not(:has([data-druckblatt])):not([data-druckblatt]):not([data-druckblatt] *)
    ) {
      display: none !important;
    }
    :global(body:has([data-druckblatt]) *:has([data-druckblatt])) {
      margin: 0 !important;
      padding: 0 !important;
      border: 0 !important;
      background: none !important;
      box-shadow: none !important;
      max-inline-size: none !important;
      inline-size: auto !important;
    }
    :global(body:has([data-druckblatt])) {
      background: #fff !important;
      font-size: 11pt;
    }
    .seite {
      border: 0;
      padding: 0;
      border-radius: 0;
      overflow: visible;
    }
    .aufgaben,
    .liste {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
    .loesungsseite {
      break-before: page;
    }
  }
</style>
