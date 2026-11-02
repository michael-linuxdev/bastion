<script lang="ts">
  // Das gedruckte Aufgabenblatt (B2): Aufgaben- und Lösungsseite mit Druck-CSS. Wird im
  // Elternbereich und auf der eigenen Druckseite gezeigt (iPhone-App, ?blatt=…), damit beide
  // genau gleich aussehen. Gedruckt wird nur dieses Blatt (@media print unten).
  import type { Niveau } from '../../core/competence/kompetenz';
  import {
    blattStufe,
    loesungAlsText,
    ohneBegriffe,
    optionsBuchstabe,
    punkteSumme,
    type BlattAufgabe,
  } from '../../core/learning/arbeitsblatt';
  import type { Loesung } from '../../core/learning/generator';
  import { fuelle, texZahl, zahlText } from '../../core/learning/text';
  import Rechentext from '../ueben/Rechentext.svelte';
  import Textteile from '../ueben/Textteile.svelte';
  import { t, type TextSchluessel } from '../texte/texte';

  let {
    aufgaben,
    thema,
    niveau,
    blattNr,
    loesungen,
    punkte,
    datumText,
  }: {
    aufgaben: readonly BlattAufgabe[];
    thema: string;
    niveau: Niveau;
    blattNr: number;
    loesungen: boolean;
    punkte: boolean;
    datumText: string;
  } = $props();

  const stufe = $derived(blattStufe(aufgaben));
  const teile = (s: string, platzhalter: Parameters<typeof fuelle>[1]) =>
    fuelle(ohneBegriffe(s), platzhalter);
  const loesungAlsTextOhneHtml = (a: BlattAufgabe) =>
    loesungAlsText(a.instanz.loesung, a.instanz.optionen);
  const loesungBruch = (l: Loesung) => (l.typ === 'bruch' ? l.wert : undefined);
  const niveauName = (n: Niveau) => t(`blatt.niveau-${n}` as TextSchluessel);
  const stufeText = (s: number) => t(`blatt.stufe-${s}` as TextSchluessel);
</script>

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
                  {#if o.text}<Rechentext text={ohneBegriffe(o.text.de)} erklaeren={false} />{/if}
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
      <span class="stufe" data-stufe>{stufeText(stufe)} ({t('blatt.review-stufe')} {stufe})</span>
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
                        art: 'formel',
                        tex: `\\frac{${texZahl(bruch.zaehler)}}{${texZahl(bruch.nenner)}}`,
                      },
                    ]}
                    erklaeren={false}
                  />{:else}<Rechentext text={loesungAlsTextOhneHtml(a)} erklaeren={false} />{/if}</b
              >
              {#if punkte}<span class="punkte">({a.punkte} {t('blatt.punkte-kurz')})</span>{/if}
            </p>
            {#if a.instanz.loesungsweg.length > 0}
              <ol class="weg">
                {#each a.instanz.loesungsweg as s, n (n)}
                  <li>
                    <Rechentext
                      text={ohneBegriffe(s.de)}
                      platzhalter={a.instanz.platzhalter}
                      erklaeren={false}
                    />
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

<style>
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
  /* PDF aus der App (T-23): dasselbe Aussehen wie im Druck, in einem Behälter mit 180 mm Breite */
  :global(.pdf-modus) .druckblatt {
    gap: 0;
  }
  :global(.pdf-modus) .seite {
    border: 0;
    border-radius: 0;
    padding: 0;
    overflow: visible;
  }
  :global(.pdf-modus) .aufgaben,
  :global(.pdf-modus) .liste {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
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
