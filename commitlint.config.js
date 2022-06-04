const types = require("@digitalroute/cz-conventional-changelog-for-jira/types");

module.exports = {
  extends: ["@commitlint/config-conventional"],
  plugins: [
    {
      rules: {
        "has-jira-issue": function (parsed, when = "always", value = "DAZ") {
          const { subject } = parsed;
          const negated = when === "never";
          const issueRegex = `${value}-\\d+\\s.*`;
          const matches = new RegExp(issueRegex, "u").test(subject);

          const pass = negated !== matches;
          const errorMessage = [
            "subject",
            negated ? "may not" : "must",
            `include a JIRA-issue matching: ${value}-[0-9]+`,
          ].join(" ");

          return [pass, errorMessage];
        },
      },
    },
  ],
  rules: {
    "scope-empty": [2, "always"],
    "type-enum": [2, "always", Object.keys(types)],
    "subject-case": [0, "always"],
    "has-jira-issue": [2, "always", "WHIT"],
  },
};
