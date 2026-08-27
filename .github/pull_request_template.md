<!--
  PR title MUST follow Conventional Commits. The `Lint PR title` workflow
  will fail the check if the title does not start with one of the allowed
  types. See CONTRIBUTING.md (or .github/CONTRIBUTING.md) for the full list.

  Allowed types: feat, fix, docs, refactor, perf, test, build, ci, chore, style, revert

  Example titles:
    feat(workspace): add medication dosage unit selector
    fix(landing): remove unused studyCategory state
    chore(deps): drop orphaned convex dependency
-->

## Summary

<!-- 1–3 sentences describing what changed and why. Reviewers should be able
     to read this section alone and understand the intent of the PR. -->

## Linked issue

<!-- Replace `Closes #N` with the issue number, or write `none` if this is a
     drive-by change. -->

Closes #

## Type of change

<!-- Check exactly one. The first letter is the Conventional Commits type
     that MUST match the PR title. -->

- [ ] feat — new user-visible feature
- [ ] fix — bug fix
- [ ] docs — documentation only
- [ ] refactor — neither fixes a bug nor adds a feature
- [ ] perf — performance improvement
- [ ] test — adding or fixing tests
- [ ] build — build system or external dependencies
- [ ] ci — CI configuration
- [ ] chore — tooling, deps, or other non-src changes
- [ ] style — formatting only
- [ ] revert — revert a previous commit

## How tested

<!-- Describe the verification you ran. "Built locally" is the floor; unit
     tests, manual reproduction steps, or screenshots are better. -->

- [ ] `bun run lint` passes
- [ ] `bun run build` passes
- [ ] Manual verification steps in the comments below

## Screenshots / recordings

<!-- Required for any UI change. Drag an image into the comment box or paste
     a link. Delete this section if not applicable. -->

## Breaking changes

<!-- If you checked the `feat!:` or `fix!:` style in the title, OR this PR
     changes a public API, call it out here. Otherwise delete this section. -->

- [ ] No breaking changes
- [ ] Breaking change described below
