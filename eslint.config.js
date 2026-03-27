import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import nextPlugin from '@next/eslint-plugin-next';

export default [
  { ignores: ['dist', '.next'] },
  {
    ...js.configs.recommended,
    files: ['**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      sourceType: 'module',
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
      globals: globals.browser,
    },
    plugins: {
      'react-hooks': reactHooks,
      '@next/next': nextPlugin,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      ...nextPlugin.configs.recommended.rules,
      ...nextPlugin.configs['core-web-vitals'].rules,
    },
  },
];
