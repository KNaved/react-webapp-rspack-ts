import js from '@eslint/js'
import importPlugin from 'eslint-plugin-import'
import jsonc from 'eslint-plugin-jsonc'
import prettier from 'eslint-plugin-prettier/recommended'
import react from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'
import simpleImportSort from 'eslint-plugin-simple-import-sort'
import unusedImports from 'eslint-plugin-unused-imports'
import globals from 'globals'
import jsoncParser from 'jsonc-eslint-parser'
import tseslint from 'typescript-eslint'

/** @type {import("eslint").Linter.FlatConfig[]} */
export default [
  {
    ignores: ['**/.github/ai-review.ts']
  },
  {
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      '**/build/**',
      '**/.vscode/**',
      '**/.cache/**',
      '**/coverage/**',
      '**/storybook-static/**',
      '**/yarn.lock',
      '**/pnpm-lock.yaml',
      '**/.DS_Store',
      '**/src/AssetFiles/**'
    ]
  },
  {
    files: ['**/*.{js,cjs,mjs,ts,tsx,jsx,json,jsonc,json5}']
  },

  // Base JS config - applies to all JS/TS(X) files
  js.configs.recommended,

  // React specific rules and settings
  {
    files: ['**/*.{jsx,tsx}'],
    languageOptions: {
      globals: {
        ...globals.browser // Ensure browser globals are available for React
      },
      parserOptions: {
        ecmaFeatures: {
          jsx: true
        }
      }
    },
    settings: {
      react: { version: 'detect' }
    },
    plugins: {
      react,
      'react-hooks': reactHooks
    },
    rules: {
      ...react.configs.flat.recommended.rules,
      ...react.configs.flat['jsx-runtime'].rules,
      'react/prop-types': 'off', // Disable prop-types as we use TypeScript for type checking
      'react/self-closing-comp': 'error', //Enforce self-closing tags for components without children
      'react/jsx-key': 'error', //Ensures key props are provided to elements in lists for React reconciliation.
      'react/jsx-no-target-blank': 'error' //Any JSX <a> element with target="_blank" must also have rel="noreferrer" (or rel="noopener noreferrer")
    }
  },

  // TypeScript specific rules and settings
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        project: './tsconfig.json',
        ecmaVersion: 'latest',
        sourceType: 'module'
      },
      globals: {
        // Add browser globals here as well for TSX files
        ...globals.browser,
        ...globals.node
      }
    },
    plugins: {
      '@typescript-eslint': tseslint.plugin
    },
    rules: {
      ...tseslint.configs.recommendedTypeChecked.rules,
      '@typescript-eslint/no-unused-vars': [
        'error',
        { vars: 'all', args: 'after-used', ignoreRestSiblings: true }
      ],
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/ban-ts-comment': 'off',
      '@typescript-eslint/consistent-type-imports': [
        'error',
        { prefer: 'type-imports' }
      ],
      '@typescript-eslint/no-useless-constructor': 'warn'
    }
  },

  // Import sorting and unused imports - applies to all JS/TS(X) files
  {
    settings: {
      'import/resolver': {
        typescript: {}
      }
    },
    plugins: {
      'simple-import-sort': simpleImportSort,
      'unused-imports': unusedImports,
      import: importPlugin
    },
    rules: {
      'simple-import-sort/imports': [
        'error',
        {
          groups: [
            ['^\\u0000'],
            [
              '^react',
              '^react-redux',
              '^@reduxjs/toolkit',
              '^react-router-dom',
              '^(crypto|events|fs)((\\/.*)|$)',
              '^node:',
              '^@?\\w'
            ],
            [
              '(\\.(\\.)?|~\\/src)\\/(l|L)ayouts?(\\.|\\/)?',
              '(\\.(\\.)?|~\\/src)\\/Hocs?(\\.|\\/)?'
            ],
            ['(\\.(\\.)?|~\\/src)\\/(c|C)omponents?(\\.|\\/)?'],
            ['^[\\.\\.\\/]', '^[\\.\\/]'],
            [
              '(\\.(\\.)?|~\\/src)\\/(r|R)edux?(\\.|\\/)?',
              '(\\.(\\.)?|~\\/src)\\/(s|S)ervice?(\\.|\\/)?'
            ],
            [
              '(\\.(\\.)?|~\\/src)\\/(c|C)onstants?(\\.|\\/)?',
              '(\\.(\\.)?|~\\/src)\\/(c|C)onfigurations?(\\.|\\/)?',
              '(\\.(\\.)?|~\\/src)\\/(u|U)tils?(\\.|\\/)?'
            ]
          ]
        }
      ],
      'simple-import-sort/exports': 'error',
      'unused-imports/no-unused-imports': 'error',
      'import/no-duplicates': 'error',
      'import/first': 'error'
    }
  },

  // Prettier - should be last to avoid conflicts
  prettier,

  // JSON/JSONC specific rules
  {
    files: ['**/*.json', '**/*.jsonc', '**/*.json5'],
    plugins: { jsonc },
    languageOptions: {
      parser: jsoncParser
    },
    rules: {
      ...jsonc.configs['flat/recommended-with-json'].rules,
      ...jsonc.configs['flat/recommended-with-jsonc'].rules,
      ...jsonc.configs['flat/recommended-with-json5'].rules
    }
  },

  // Global browser and service worker environments (ensure this is present)
  {
    languageOptions: {
      globals: {
        ...globals.serviceworker,
        ...globals.browser,
        process: 'readonly' // Add process as a global
      }
    }
  },

  // General project rules - applied to all JS/TS(X) files
  {
    rules: {
      'no-var': 'error',
      'max-depth': 2,
      'no-case-declarations': 'off',
      'no-unreachable-loop': 'error',
      'no-unneeded-ternary': 'error',
      'no-unused-vars': 'off', // Handled by unused-imports and @typescript-eslint
      'default-case': ['error', { commentPattern: '^no default$' }], // require default case in switch statements
      'default-case-last': 'error', // Enforce default clauses in switch statements to be last
      'no-else-return': ['error', { allowElseIf: false }], // disallow else after a return in an if
      'no-empty-function': [
        // disallow empty functions, except for standalone funcs/arrows
        'error',
        {
          allow: ['arrowFunctions', 'functions', 'methods']
        }
      ],
      'no-compare-neg-zero': 'error', // Disallow comparisons to negative zero
      'no-unreachable': 'error', // disallow unreachable statements after a return, throw, continue, or break statement
      'no-multi-str': 'warn',
      'no-unsafe-finally': 'error'
    }
  }
]
