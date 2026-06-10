import js from '@eslint/js';
import prettier from 'eslint-config-prettier';
import astro from 'eslint-plugin-astro';
import svelte from 'eslint-plugin-svelte';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import svelteConfig from './svelte.config.js';

export default tseslint.config(
  {
    ignores: [
      '.astro/',
      '.wrangler/',
      'dist/',
      'node_modules/',
      'test-results/',
      'public/downloads/',
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...astro.configs['flat/recommended'],
  ...astro.configs['flat/jsx-a11y-recommended'],
  ...svelte.configs['flat/recommended'],
  ...svelte.configs['flat/prettier'],
  {
    files: ['**/*.{js,mjs,cjs,ts,astro,svelte}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
    },
  },
  {
    files: ['public/**/*.js', 'src/**/*.astro', 'src/**/*.svelte'],
    languageOptions: {
      globals: globals.browser,
    },
  },
  {
    files: [
      '*.config.{js,mjs,ts}',
      'eslint.config.js',
      'astro.config.mjs',
      'svelte.config.js',
      'scripts/**/*.{js,mjs,cjs}',
      'tests/**/*.{js,ts}',
    ],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
  },
  {
    files: ['**/*.svelte', '**/*.svelte.{js,ts}'],
    languageOptions: {
      parserOptions: {
        parser: tseslint.parser,
        svelteConfig,
      },
    },
  },
  {
    files: ['**/*.d.ts'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
  prettier
);
