module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2021,
    sourceType: 'module',
    project: ['./tsconfig.json', './packages/*/tsconfig.json', './services/*/tsconfig.json'],
    warnOnUnsupportedTypeScriptVersion: false,
  },
  plugins: ['eslint-plugin', '@typescript-eslint', 'jest', 'import', 'eslint-comments', 'simple-import-sort'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/eslint-recommended',
    'plugin:@typescript-eslint/recommended',
    'airbnb',
    'airbnb-typescript',
    'prettier',
  ],

  rules: {
    'import/no-cycle': 0,
  },

  overrides: [
    {
      files: 'vite.config.ts',
      rules: {
        'import/no-extraneous-dependencies': 0,
      },
    },
  ],
};
