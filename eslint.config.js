import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

const boundaryZones = [
  {
    files: ['src/api/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: [
                '@/components/*',
                '@/components/**',
                '@/features/*',
                '@/features/**',
                '@/pages/*',
                '@/pages/**',
                '@/app/*',
                '@/app/**',
                '@/hooks/*',
                '@/hooks/**',
              ],
              message: 'api/ may only depend on api/, types/, and lib/.',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['src/components/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@/api/*', '@/api/**', '@/pages/*', '@/pages/**'],
              message:
                'components/ may depend on components/, hooks/, features/, types/, and lib/.',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['src/features/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@/pages/*', '@/pages/**', '@/app/*', '@/app/**'],
              message: 'features/ may not depend on pages/ or app/.',
            },
          ],
        },
      ],
    },
  },
]

export default defineConfig([
  globalIgnores(['dist', 'coverage', 'node_modules', '.spec-stage', 'playwright-report', 'test-results']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
    },
    rules: {
      '@typescript-eslint/consistent-type-imports': [
        'error',
        { prefer: 'type-imports', fixStyle: 'inline-type-imports' },
      ],
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      /* The frozen architecture intentionally co-locates hooks/constants with
         their providers (ThemeContext, ToastProvider, guards, routerMeta) and
         reads refs to hand focus-targets to the focus trap. These React
         Compiler-era rules conflict with that published design. */
      'react-refresh/only-export-components': 'off',
      'react-hooks/refs': 'off',
      'react-hooks/set-state-in-effect': 'off',
      'react-hooks/purity': 'off',
      'react-hooks/exhaustive-deps': 'warn',
    },
  },
  ...boundaryZones,
  {
    files: [
      'vite.config.ts',
      'eslint.config.js',
      'postcss.config.js',
      'tailwind.config.ts',
      'playwright.config.ts',
    ],
    languageOptions: {
      globals: globals.node,
    },
  },
  {
    files: ['e2e/**/*.{ts,tsx}'],
    languageOptions: {
      globals: { ...globals.browser, ...globals.node },
    },
  },
  {
    files: ['src/test/**/*.{ts,tsx}', 'src/**/*.test.{ts,tsx}'],
    languageOptions: {
      globals: { ...globals.browser, ...globals.node },
    },
  },
])
