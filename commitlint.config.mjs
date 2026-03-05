const subjectOf = (message) => (message ?? "").split(/\r?\n/, 1)[0].trim();

export default {
  extends: ["@commitlint/config-conventional"],
  defaultIgnores: true,
  ignores: [
    // Legacy squash/merge subjects that already exist in history.
    (message) => subjectOf(message) === "Ci/fix iis file locks (#82)",
    (message) => subjectOf(message) === "Develop (#84)",
    (message) => subjectOf(message) === "Docs/frontend feedback remediation clean (#92)",
    (message) =>
      /^Docs\/frontend feedback remediation clean \(#\d+\)$/.test(
        subjectOf(message),
      ),
  ],
  rules: {
    "type-enum": [
      2,
      "always",
      [
        "build",
        "chore",
        "ci",
        "docs",
        "feat",
        "fix",
        "perf",
        "refactor",
        "revert",
        "style",
        "test",
      ],
    ],
  },
};
