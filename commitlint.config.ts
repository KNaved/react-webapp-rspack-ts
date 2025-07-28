import type { UserConfig } from '@commitlint/types'

const configuration: UserConfig = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    // Header
    'type-empty': [2, 'never'],
    // Allowed type enums
    // 'type-enum': [2,'always', ['feat', 'fix', 'docs', 'style', 'refactor', 'perf', 'test', 'build', 'ci', 'chore', 'revert']],
    'scope-empty': [0, 'never'],
    'scope-enum': [
      2,
      'always',
      [
        'env',
        'redux',
        'packages',
        'breaking-change',
        'error',
        'commit-lint',
        'config',
        'layout',
        'theme',
        'css',
        'router',
        'eslint',
        'plugin',
        'hooks',
        'scripts',
        'auth',
        'csp',
        'changelog',
        'api',
        'migration',
        'vulnerability',
        'tests',
        'mocks'
      ]
    ], // define allowed scopes as per your project
    'subject-empty': [2, 'never'],
    'subject-case': [2, 'always', 'sentence-case'], // sentence case summary
    'header-full-stop': [2, 'never', '.'], // no full stop at the end of header

    // Body is optional
    'body-empty': [0, 'never'],
    'body-leading-blank': [2, 'always'],

    // Footer is optional
    'footer-empty': [0, 'never'],
    'footer-leading-blank': [2, 'always']
  }
}

export default configuration
