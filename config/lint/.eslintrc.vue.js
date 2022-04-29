/**
 * @type {import('@types/eslint').Linter.Config}
 */
module.exports = {
  root: true,
  extends: [
    "plugin:vue/vue3-recommended",
    "plugin:sonarjs/recommended",
    "eslint:recommended",
    "@vue/eslint-config-typescript/recommended",
    "plugin:import/recommended",
    "plugin:import/typescript",
    "@vue/eslint-config-prettier",
    ".eslintrc-auto-import.json",
  ],
  env: {
    "vue/setup-compiler-macros": true,
  },
  overrides: [
    {
      files: ["cypress/integration/**.spec.{js,ts,jsx,tsx}"],
      extends: ["plugin:cypress/recommended"],
    },
  ],
};
