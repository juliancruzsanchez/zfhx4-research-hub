/**
 * Commitlint configuration.
 *
 * Enforces Conventional Commits on every commit so that:
 *   - PR titles can be machine-validated against the same rules
 *   - `git log --oneline` is greppable by type
 *   - Release tooling (semantic-release, release-please) can derive versions
 *
 * Schema: <type>(<optional-scope>): <subject>
 *   - subject <= 72 chars, imperative mood, no trailing period
 *   - body lines <= 100 chars, separated from subject by a blank line
 *   - footer for `BREAKING CHANGE:` and issue refs (Closes #123)
 *
 * Allowed types are listed in `type-enum` below. Adding a new type here is
 * the only place a contributor needs to touch — Husky invokes commitlint
 * automatically on `git commit` (see .husky/commit-msg).
 */
module.exports = {
  extends: ["@commitlint/config-conventional"],
  rules: {
    "type-enum": [
      2,
      "always",
      [
        "feat", // new user-visible feature
        "fix", // bug fix
        "docs", // documentation only
        "refactor", // neither fixes a bug nor adds a feature
        "perf", // performance improvement
        "test", // adding or fixing tests
        "build", // build system or external dependencies
        "ci", // CI configuration
        "chore", // tooling, deps, or other non-src changes
        "style", // formatting only (no logic change)
        "revert", // revert a previous commit
      ],
    ],
    "type-case": [2, "always", "lower-case"],
    "type-empty": [2, "never"],
    "subject-empty": [2, "never"],
    "subject-full-stop": [2, "never", "."],
    "subject-case": [
      2,
      "never",
      ["sentence-case", "start-case", "pascal-case", "upper-case"],
    ],
    "header-max-length": [2, "always", 100],
    "body-max-line-length": [2, "always", 100],
    "footer-max-line-length": [2, "always", 100],
  },
};
