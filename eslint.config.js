// ESLint-Konfiguration. Prüft Code-Qualität und – besonders wichtig –
// die Ordnergrenzen aus ARCHITEKTUR T-2/T-10 und CLAUDE.md.
import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import svelte from 'eslint-plugin-svelte';
import boundaries from 'eslint-plugin-boundaries';
import prettier from 'eslint-config-prettier';
import globals from 'globals';
import svelteConfig from './svelte.config.js';

// Browser-APIs, die im Kern verboten sind. Der Kern bekommt alles, was er
// von außen braucht (Zeit, Zufall, Speicher), über Schnittstellen gereicht.
// Für ESLint die Svelte-Konfiguration ohne `onwarn`: Warnungen meldet hier
// die Regel `svelte/valid-compile`, statt ESLint abstürzen zu lassen.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const { onwarn, ...svelteConfigFuerLint } = svelteConfig;

const browserGlobals = Object.keys(globals.browser).filter((name) => !(name in globals.es2022));

export default tseslint.config(
  { ignores: ['dist/', 'dev-dist/', 'coverage/', 'playwright-report/', 'test-results/'] },

  js.configs.recommended,
  ...tseslint.configs.strict,
  ...svelte.configs.recommended,
  prettier,
  ...svelte.configs.prettier,

  {
    languageOptions: {
      globals: { ...globals.browser, ...globals.node },
    },
  },
  {
    files: ['**/*.svelte', '**/*.svelte.ts'],
    languageOptions: {
      parserOptions: {
        parser: tseslint.parser,
        extraFileExtensions: ['.svelte'],
        svelteConfig: svelteConfigFuerLint,
      },
    },
    rules: {
      // Compilerwarnungen (z. B. veraltete Svelte-4-Syntax) als Lint-Fehler.
      'svelte/valid-compile': 'error',
    },
  },

  // --- Ordnergrenzen -------------------------------------------------------
  {
    files: ['src/**/*.ts', 'src/**/*.svelte'],
    plugins: { boundaries },
    settings: {
      'import/resolver': {
        node: { extensions: ['.ts', '.svelte', '.js'] },
      },
      // Reihenfolge zählt: Das erste passende Muster bestimmt den Typ.
      'boundaries/elements': [
        { type: 'core-bastion', pattern: 'src/core/bastion' },
        { type: 'core-ledger', pattern: 'src/core/ledger' },
        { type: 'core', pattern: 'src/core' },
        { type: 'storage', pattern: 'src/storage' },
        { type: 'generators', pattern: 'src/generators' },
        { type: 'ui', pattern: 'src/ui' },
        // Alles übrige direkt in src/ (z. B. main.ts) ist der App-Einstieg.
        { type: 'app', pattern: 'src' },
      ],
    },
    rules: {
      'boundaries/dependencies': [
        'error',
        {
          default: 'allow',
          policies: [
            // Der Kern kennt weder Oberfläche noch Speicher noch Generatoren.
            {
              from: { element: { types: { anyOf: ['core', 'core-ledger', 'core-bastion'] } } },
              disallow: {
                to: { element: { types: { anyOf: ['ui', 'storage', 'generators', 'app'] } } },
              },
              message:
                'src/core darf nichts aus src/ui, src/storage, src/generators oder main.ts importieren (ARCHITEKTUR T-2).',
            },
            // Die Bastion liest nur das Ledger (K-1): kein anderer Kernteil, keine Fremdpakete.
            {
              from: { element: { type: 'core-bastion' } },
              disallow: {
                to: {
                  element: { types: { anyOf: ['core', 'ui', 'storage', 'generators', 'app'] } },
                },
              },
              message: 'src/core/bastion darf nur aus src/core/ledger importieren (K-1).',
            },
          ],
        },
      ],
    },
  },
  {
    // Kern: keine Browser-APIs, kein Svelte, keine Fremdpakete außer Tests.
    files: ['src/core/**/*.ts'],
    rules: {
      'no-restricted-globals': [
        'error',
        ...browserGlobals.map((name) => ({
          name,
          message:
            'Browser-APIs sind in src/core verboten (ARCHITEKTUR T-2). Über eine Schnittstelle hereinreichen.',
        })),
      ],
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['svelte', 'svelte/*', '*.svelte'],
              message: 'Svelte gehört nicht in src/core (ARCHITEKTUR T-2).',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['src/core/bastion/**/*.ts'],
    ignores: ['**/*.test.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              regex: '^[^./]',
              message:
                'src/core/bastion darf keine Fremdpakete importieren, nur src/core/ledger (K-1).',
            },
          ],
        },
      ],
    },
  },
);
