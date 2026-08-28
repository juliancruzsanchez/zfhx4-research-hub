# Contributing to ZFHX4 Research Hub

Thanks for taking the time to contribute. This document describes the commit
and pull-request conventions used in this repository. The rules are enforced
both locally (via `commitlint` + `husky`) and in CI (via the
`Lint PR title` workflow), so following them keeps you unblocked.

## At a glance

| | Rule | Enforced by |
| --- | --- | --- |
| Commit subject | `type(scope): description` | `commitlint` (`.husky/commit-msg`) |
| Subject length | ≤ 100 chars, imperative mood, no trailing period | `commitlint` |
| Body line length | ≤ 100 chars per line | `commitlint` |
| PR title | Same format as commit subject | `Lint PR title` GitHub workflow |
| Branch name | `type/<scope>-<short-kebab-desc>` | humans (see below) |
| Pre-commit | `prettier --write` and `eslint --fix` on staged files | `lint-staged` (`.husky/pre-commit`) |

## Commit and PR titles

We follow [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/).

```
<type>(<optional-scope>): <imperative subject>
```

Allowed `type` values:

| Type | When to use |
| --- | --- |
| `feat` | A new user-visible feature |
| `fix` | A bug fix |
| `docs` | Documentation-only change (README, comments, `.md` files) |
| `refactor` | A code change that neither fixes a bug nor adds a feature |
| `perf` | A performance improvement |
| `test` | Adding or fixing tests |
| `build` | Build system, package manager, or external dependency change |
| `ci` | CI/CD configuration |
| `chore` | Tooling, scripts, or other non-`src/` maintenance |
| `style` | Formatting-only change (whitespace, prettier rewrap) |
| `revert` | Reverts a previous commit |

The `scope` is the area of the codebase affected. Use the file or route name
when it is clear (`landing`, `workspace`, `auth`, `functions`, `deps`,
`ci`, `docs`).

### Examples

```
feat(workspace): add medication dosage unit selector
fix(landing): remove unused studyCategory state
chore(deps): drop orphaned convex dependency
docs(readme): document the worktree workflow
refactor(functions): extract Groq error handling into helper
test(workspace): add coverage for upload size validation
```

### Breaking changes

Append a `!` after the type/scope and add a `BREAKING CHANGE:` footer:

```
feat(firebase)!: require admin custom claim instead of email allowlist

BREAKING CHANGE: callers that previously relied on the
`admin@example.com` email check must now set the `admin: true` custom
claim on the user. Existing admin accounts must be migrated via the
Firebase Admin SDK before deploying this release.
```

## Branches

Branch names follow the same `type/scope-kebab-desc` shape as commits:

```
feat/workspace-medication-units
fix/landing-unused-state
chore/deps-remove-convex
docs/readme-worktree-workflow
```

Rules:

- Lowercase only.
- Use a single `/` after the type.
- Use `-` to separate words in the description; keep it under ~50 chars.
- One logical change per branch. If a fix uncovers a second fix, open a
  second branch.

## Pull requests

1. Branch from `main` (or the current default branch).
2. Make your changes. Keep commits small and focused; the PR title is
   what the changelog will read, so the *squash commit* message should
   match it.
3. Push your branch and open a PR against `main`. Use the
   `.github/pull_request_template.md` checklist.
4. Make sure the `Lint PR title` workflow is green before requesting
   review. The merge button will be blocked otherwise.
5. After approval, **squash-merge** so the squash commit subject matches
   the PR title.

## Local tooling (one-time setup)

```bash
bun install        # installs dev deps including husky, commitlint, lint-staged
bun run prepare    # initialises the husky git hooks
```

After `bun run prepare`:

- `git commit -m "bad message"` will be rejected.
- `git commit` will run `prettier --write` and `eslint --fix` on staged
  files before commitlint evaluates the message.

To bypass the hooks in an emergency (e.g. importing history), use
`git commit --no-verify`. Use sparingly — the CI checks still apply.

## Questions?

Open a discussion or ping the maintainer in the PR. There are no bad
questions about process.
