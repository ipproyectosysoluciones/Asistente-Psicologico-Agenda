import js from '@eslint/js'
import tsPlugin from '@typescript-eslint/eslint-plugin'
import tsParser from '@typescript-eslint/parser'
import globals from 'globals'

export default [
  js.configs.recommended,
  {
    files: ['src/**/*.{ts,tsx}'],
    plugins: { '@typescript-eslint': tsPlugin },
    languageOptions: {
      parser: tsParser,
      globals: {
        ...globals.browser,
        React: 'readonly',
      },
    },
    rules: { 'no-console': 'warn' },
  },
  {
    files: ['src/pages/auth/**/*.{ts,tsx}'],
    rules: { 'no-console': 'error' },
  },
]
