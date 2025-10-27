import eslint from '@eslint/js';
import { defineConfig } from 'eslint/config';
import tseslint from 'typescript-eslint';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import globals from 'globals';
import jsxA11y from 'eslint-plugin-jsx-a11y';

export default defineConfig(
  // Ignore build and generated files
  {
    ignores: ['dist', 'build', 'coverage', 'node_modules', 'server'],
  },

  // Base + React + TypeScript setup
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    extends: [
      eslint.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      react.configs.flat.recommended,
      react.configs.flat['jsx-runtime'],
      jsxA11y.flatConfigs.recommended,
    ],
    plugins: {
      react,
      'react-refresh': reactRefresh,
    },
    rules: {
      // Vite + Fast Refresh
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],

      // TypeScript best practices
      "@typescript-eslint/consistent-type-imports": "error",

      // React best practices
      'react/jsx-no-target-blank': ['warn', { allowReferrer: true }],

      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
    },
    settings: {
      react: { version: 'detect' },
    },
  },

  // Vitest globals for test files
  {
    files: ['**/*.{test,spec}.{js,jsx,ts,tsx}'],
    languageOptions: { globals: { ...globals.vitest } },
  },
);
