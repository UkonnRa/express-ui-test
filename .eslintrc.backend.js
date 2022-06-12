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
    "plugin:import/recommended",
    "plugin:import/typescript",
    "prettier",
  ],
  rules: {
    "import/order": 2,
    // Circular is harmful for tsyringe and should be disabled
    "import/no-cycle": 2,
    // Conflict with SonarLint typescript:S4326
    "@typescript-eslint/return-await": 0,
    // If enable, `{} as T` is not usable
    // TODO: Make `read-service.ts` safer
    "@typescript-eslint/consistent-type-assertions": 0,
  },
};
