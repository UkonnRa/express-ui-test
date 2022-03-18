/**
 * @type {import('@types/eslint').Linter.Config}
 */
module.exports = {
  root: true,
  parser: "@typescript-eslint/parser",
  parserOptions: {
    project: "./tsconfig.dev.json",
  },
  plugins: ["@typescript-eslint", "import", "eslint-comments"],
  extends: [
    "eslint:recommended",
    "plugin:sonarjs/recommended",
    "plugin:@typescript-eslint/recommended",
    "standard-with-typescript",
    "plugin:import/recommended",
    "plugin:import/typescript",
    "prettier",
  ],
  rules: {
    "max-classes-per-file": 0,
    "class-methods-use-this": 0,
    "@typescript-eslint/return-await": 0,
    "sonarjs/no-duplicate-string": 0,
    "import/order": 1,
    "no-return-await": 2,
  },
};
