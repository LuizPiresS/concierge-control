// @ts-check
import eslint from '@eslint/js';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  // 1. Configuração Global e Arquivos Ignorados
  {
    ignores: [
      'eslint.config.mjs',
      'lint-staged.config.mjs',
      'dist',
      'node_modules',
      'commitlint.config.mjs',
    ],
  },

  // 2. Configurações Base (Recomendadas)
  eslint.configs.recommended,
  ...tseslint.configs.strictTypeChecked,
  eslintPluginPrettierRecommended,

  // 3. Configuração Específica para Arquivos TypeScript
  {
    files: ['**/*.ts'],
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jest,
      },
      parserOptions: {
        project: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: {
      'simple-import-sort': simpleImportSort,
    },
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          // ADD THIS LINE:
          varsIgnorePattern: '^_', // Ignores local variables starting with _
        },
      ],
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-floating-promises': 'warn',
      '@typescript-eslint/no-unsafe-argument': 'warn',
      // '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-useless-constructor': 'off',
      '@typescript-eslint/require-await': 'off',
      // '@typescript-eslint/no-misused-spread': 'off',
      '@typescript-eslint/no-extraneous-class': [
        'error',
        { allowWithDecorator: true },
      ],
    },
  },
);
