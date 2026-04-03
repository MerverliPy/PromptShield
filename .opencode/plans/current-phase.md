# Current Phase

Status: COMPLETE

## Goal
Align the static dashboard read model’s `recentOutcomeLimit` behavior with the SQL-backed read model so list slicing is deterministic and safe for all callers.

## Why this phase is next
`createStaticDashboardReadModel` currently slices directly and can behave unexpectedly for negative or non-finite limits, while the SQL read model already normalizes those values. Tightening this seam is a small, high-confidence fix that keeps dashboard read-model semantics consistent.

## Primary files
- packages/db/src/dashboard-read-model.ts
- packages/db/src/dashboard-read-model.test.ts

## Expected max files changed
2

## Risk
Low; this is a pure read-model behavior change with straightforward unit coverage.

## Rollback note
Revert the limit-normalization helper and its regression test if the new semantics are not desired.

## In scope
- Normalize `recentOutcomeLimit` before slicing static dashboard summaries.
- Add regression tests for undefined, negative, and non-finite limits.

## Out of scope
- Dashboard UI changes.
- SQL read-model changes.
- Proxy, worker, or optimizer behavior.

## Tasks
- Update the static dashboard read model to clamp invalid limits safely.
- Add unit coverage for the static read model’s limit handling.

## Validation command
pnpm --filter @promptshield/db test

## Validation
- Passed: `pnpm --filter @promptshield/db test`

## Acceptance criteria
- Static dashboard summaries return the full list only for unset limits.
- Negative or non-finite limits do not produce partial/accidental slicing.
- The db package test suite passes.

## Completion summary
Normalized static `recentOutcomeLimit` handling to match SQL semantics: undefined returns all outcomes, finite values are truncated and clamped at zero, and non-finite values return no outcomes. Added regression tests covering undefined, negative, fractional, and non-finite limits; db tests passed.
