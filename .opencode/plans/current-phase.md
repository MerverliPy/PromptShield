# Current Phase

Status: COMPLETE

## Goal
Lock down the SQL-backed dashboard read model’s `recentOutcomeLimit` behavior with regression tests so durable and static summary reads stay aligned.

## Why this phase is next
The static dashboard read model was just normalized, but the SQLite-backed read model is the shared durable path used by the dashboard and worker. Its limit handling is already implemented, yet the edge cases are only partially covered. Adding focused regression coverage here is the smallest safe step that prevents semantic drift across durable reads.

## Primary files
- packages/db/src/sql-dashboard-read-model.test.ts

## Expected max files changed
1

## Risk
Low; this is a test-only change against a pure read-model seam.

## Rollback note
Remove the added regression tests if the SQL read-model limit semantics are intentionally changed later.

## In scope
- Add regression tests for unset, zero, negative, fractional, and non-finite `recentOutcomeLimit` values.
- Confirm the SQL dashboard read model still skips the recent-outcomes query at limit `0`.

## Out of scope
- Dashboard UI changes.
- SQL read-model implementation changes.
- Proxy, worker, or optimizer behavior.

## Tasks
- Add focused regression tests for SQL dashboard limit normalization.
- Keep the assertions narrow so query-shape and metric behavior remain stable.

## Validation command
pnpm --filter @promptshield/db test

## Validation
- `pnpm --filter @promptshield/db test` passed.
- Validator PASS.

## Acceptance criteria
- SQL dashboard summaries return all recent outcomes only when the limit is unset.
- Limit `0` skips the recent-outcomes query and returns an empty list.
- Negative, fractional, and non-finite limits normalize safely.
- The db package test suite passes.

## Completion summary
Added regression tests in `packages/db/src/sql-dashboard-read-model.test.ts` for unset, zero, negative, fractional, and non-finite `recentOutcomeLimit` behavior. `pnpm --filter @promptshield/db test` passed and validator returned PASS.
