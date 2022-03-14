module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2021,
    sourceType: 'module',
  },
  plugins: ['eslint-plugin', '@typescript-eslint', 'jest', 'import', 'eslint-comments', 'simple-import-sort'],
  extends: [
    'eslint:recommended',
    'plugin:sonarjs/recommended',
    'plugin:@typescript-eslint/eslint-recommended',
    'plugin:@typescript-eslint/recommended',
    'airbnb',
    'airbnb-typescript',
    'plugin:react/jsx-runtime',
    'prettier',
  ],
  rules: {
    'import/no-cycle': 0,
    'import/no-import-module-exports': 0,
    'react/function-component-definition': [2, { namedComponents: 'arrow-function' }],
    'no-restricted-syntax': 0,
    'max-classes-per-file': 0,
    'class-methods-use-this': 0,
    'import/no-extraneous-dependencies': 0,
  },
};
