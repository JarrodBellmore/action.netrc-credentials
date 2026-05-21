// See: https://eslint.org/docs/latest/use/configure/configuration-files

import typescriptEslint from '@typescript-eslint/eslint-plugin'
import tsParser from '@typescript-eslint/parser'
import prettier from 'eslint-plugin-prettier'

export default [
  {
    ignores: ['**/coverage', '**/dist', '**/node_modules']
  },
  {
    plugins: {
      prettier,
      '@typescript-eslint': typescriptEslint
    },

    languageOptions: {
      parser: tsParser,
      ecmaVersion: 2023,
      sourceType: 'module'
    },

    rules: {
      ...typescriptEslint.configs.recommended.rules,
      'no-console': 'off',
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_' }
      ],
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      'prettier/prettier': 'error'
    }
  }
]
