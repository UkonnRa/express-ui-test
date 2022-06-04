/**
 * @type {import('@types/eslint').Linter.Config}
 */
module.exports = {
  root: true,
  parser: "@typescript-eslint/parser",
  parserOptions: {
    project: "./tsconfig.dev.json",
  },
  extends: [
    "plugin:sonarjs/recommended",
    "standard-with-typescript",
    "prettier",
  ],
  rules: {
    // Conflict with SonarLint typescript:S4326
    "@typescript-eslint/return-await": 0,
  },
};
