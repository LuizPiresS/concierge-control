// @ts-check
import eslint from '@eslint/js';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    ignores: ['eslint.config.mjs', 'lint-staged.config.mjs', 'dist', 'node_modules', 'commitlint.config.mjs'],
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  eslintPluginPrettierRecommended,
  {
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jest,
      },
      sourceType: 'module',
      parserOptions: {
        projectService: true,
      },
    },
  },
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'warn', // Ou 'error' para maior rigor
      '@typescript-eslint/no-floating-promises': 'warn',
      '@typescript-eslint/no-unsafe-argument': 'warn',
      // '@typescript-eslint/explicit-function-return-type': 'warn', // Considere adicionar para verificação de tipos mais rigorosa
    },
  },
);