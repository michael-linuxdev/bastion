<script lang="ts">
  // Prüffragen, Urteil und Anmerkungen unter einem Abschnitt der Prüfseite (FOKUS F3).
  // Felder wie im Kern (src/core/learning/pruefbogen.ts): f<i>, urteil, notiz.
  import { FRAGEN, URTEILE, type Teil, type Werte } from '../../core/learning/pruefbogen';
  import { t, type TextSchluessel } from '../texte/texte';

  let {
    abschnitt,
    teil,
    werte,
    onfeld,
  }: {
    abschnitt: string;
    teil: Teil;
    werte: Werte;
    onfeld: (feld: string, wert: string | boolean) => void;
  } = $props();

  const fragen = $derived(
    Array.from({ length: FRAGEN[teil] }, (_, i) =>
      t(`pruefen.frage.${teil}${i + 1}` as TextSchluessel),
    ),
  );
</script>

<div class="urteil" class:fertig={typeof werte['urteil'] === 'string'} data-urteil={abschnitt}>
  <p class="kopf">{t('pruefen.prueffragen')}</p>
  <ul class="fragen">
    {#each fragen as frage, i (i)}
      <li>
        <label class="haken"
          ><input
            type="checkbox"
            checked={werte[`f${i}`] === true}
            onchange={(e) => onfeld(`f${i}`, e.currentTarget.checked)}
          />
          <span>{frage}</span></label
        >
      </li>
    {/each}
  </ul>
  <fieldset class="wahlen">
    <legend>{t('pruefen.urteil')}</legend>
    {#each URTEILE as u (u)}
      <label class="wahl wahl-{u}"
        ><input
          type="radio"
          name="{abschnitt}--urteil"
          value={u}
          checked={werte['urteil'] === u}
          onchange={() => onfeld('urteil', u)}
        />
        {t(`pruefen.urteil-${u}` as TextSchluessel)}</label
      >
    {/each}
  </fieldset>
  <label class="notiz"
    >{t('pruefen.notiz')}
    <textarea
      rows="3"
      maxlength="20000"
      placeholder={t('pruefen.notiz-hilfe')}
      value={typeof werte['notiz'] === 'string' ? werte['notiz'] : ''}
      oninput={(e) => onfeld('notiz', e.currentTarget.value)}></textarea></label
  >
</div>

<style>
  .urteil {
    border: 2px solid var(--farbe-text);
    border-radius: var(--radius);
    padding: var(--abstand-s);
    display: grid;
    gap: var(--abstand-s);
    margin-block: var(--abstand-s) var(--abstand-m);
  }
  .urteil.fertig {
    border-color: var(--farbe-rand);
  }
  .kopf {
    margin: 0;
    font-weight: 700;
    font-size: 0.85rem;
    color: var(--farbe-text-leise);
  }
  .fragen {
    list-style: none;
    padding: 0;
    margin: 0;
    display: grid;
    gap: 0.25rem;
  }
  .haken {
    display: flex;
    gap: 0.5rem;
    align-items: flex-start;
    min-block-size: 2.75rem;
  }
  .haken input {
    margin-block-start: 0.2rem;
    flex: none;
  }
  .wahlen {
    border: 0;
    padding: 0;
    margin: 0;
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }
  .wahlen legend {
    font-weight: 700;
    padding: 0;
    margin-block-end: 0.25rem;
  }
  .wahl {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    min-block-size: 2.75rem;
    padding-inline: 0.8rem;
    border: 1px solid var(--farbe-rand);
    border-radius: 2rem;
    font-weight: 700;
  }
  .wahl:has(input:checked) {
    border-color: var(--farbe-text);
    background: var(--farbe-flaeche);
  }
  .notiz {
    display: grid;
    gap: 0.25rem;
    font-weight: 700;
  }
  textarea {
    font: inherit;
    font-weight: 400;
    inline-size: 100%;
    box-sizing: border-box;
  }
</style>
