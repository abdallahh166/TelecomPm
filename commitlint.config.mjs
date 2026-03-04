export default {
  extends: ["@commitlint/config-conventional"],
  defaultIgnores: true,
  ignores: [
    // Legacy squash/merge subjects that already exist in history.
    (message) => /^Ci\/fix iis file locks \(#82\)$/.test(message),
    (message) => /^Develop \(#84\)$/.test(message),
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
