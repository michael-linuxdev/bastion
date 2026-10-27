// Prüft, dass die Lint-Regeln für die Ordnergrenzen wirklich greifen.
// Ohne diesen Test könnte eine Änderung an eslint.config.js die Grenzen
// unbemerkt abschalten (ARCHITEKTUR T-10, T-13).
import { ESLint } from 'eslint';
import { describe, expect, it } from 'vitest';

const eslint = new ESLint();

async function fehlerFuer(dateipfad: string, code: string): Promise<string[]> {
  const [ergebnis] = await eslint.lintText(code, { filePath: dateipfad });
  return (ergebnis?.messages ?? []).map((m) => m.ruleId ?? m.message);
}

describe('Ordnergrenzen', () => {
  it('verbietet src/core, aus src/ui zu importieren', async () => {
    const fehler = await fehlerFuer(
      'src/core/probe.ts',
      "import App from '../ui/App.svelte';\nexport const x = App;\n",
    );
    expect(fehler).toContain('boundaries/dependencies');
  });

  it('verbietet Browser-APIs in src/core', async () => {
    const fehler = await fehlerFuer(
      'src/core/probe.ts',
      'export const x = window.location.href + String(localStorage);\n',
    );
    expect(fehler.filter((f) => f === 'no-restricted-globals')).toHaveLength(2);
  });

  it('verbietet Svelte in src/core', async () => {
    const fehler = await fehlerFuer(
      'src/core/probe.ts',
      "import { mount } from 'svelte';\nexport const x = mount;\n",
    );
    expect(fehler).toContain('no-restricted-imports');
  });

  it('verbietet src/core/bastion andere Kernteile als das Ledger', async () => {
    const fehler = await fehlerFuer(
      'src/core/bastion/probe.ts',
      "import { rng } from '../rng/rng';\nexport const x = rng;\n",
    );
    expect(fehler).toContain('boundaries/dependencies');
  });

  it('erlaubt Kernteilen untereinander zu importieren', async () => {
    const fehler = await fehlerFuer(
      'src/core/srs/probe.ts',
      "import { rng } from '../rng/rng';\nexport const x = rng;\n",
    );
    expect(fehler).toEqual([]);
  });

  it('verbietet src/core/bastion Fremdpakete', async () => {
    const fehler = await fehlerFuer(
      'src/core/bastion/probe.ts',
      "import { mount } from 'svelte';\nexport const x = mount;\n",
    );
    expect(fehler).toContain('no-restricted-imports');
  });

  it('lässt Importe außerhalb des Kerns zu', async () => {
    const fehler = await fehlerFuer('src/ui/probe.ts', "export { x } from '../main';\n");
    expect(fehler).not.toContain('boundaries/dependencies');
  });
});
