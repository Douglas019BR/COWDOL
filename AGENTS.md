# Agent Guidelines

## Model routing

- Default, use whenever possible: `hy4-flash-free` (opencode).
- Strong model, `deepseek-v4-pro`: architecture, planning, critical decisions, final review.
- Mid-tier paid, `deepseek-flash` (or another free opencode model when needed): tasks where the free model is not enough.
- Local `GLM`: use freely whenever it is running.

## Implementation workflow

- Every implementation must include unit tests whenever possible.
- Every feature must include evidence that it works: test output, logs, command output, or screenshot.
- A task is not considered complete without evidence; if testing is not possible, document the reason.

## PR guardrails

Every repository must enforce deterministic checks before a PR is considered ready:

- Linter and formatter checks.
- Typo/spell check.
- Secret and sensitive-data scan to ensure no credentials or private data are exposed.

These checks must be automated with deterministic tools, not left to manual review.

## Orchestration and review

- The strong model (`deepseek-v4-pro`) coordinates work and delegates implementation to cheaper models.
- Implementation and review are separate cycles: every implementation must be reviewed by a different model than the one that wrote it.
- The reviewer must verify unit tests, evidence of correctness, and the PR guardrails before the work is considered complete.
