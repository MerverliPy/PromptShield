# Current Phase

Status: COMPLETE

## Goal
Clarify the dashboard's durable-vs-fallback state so operators can immediately tell when the UI is reading live lineage data.

## Why this phase is next
This is the highest-priority open candidate in the backlog, stays within one module, and is limited to two files with a clear dashboard validation path.

## Backlog item
dashboard-durable-status-clarity — clarify durable vs fallback dashboard status

## Primary files
- apps/dashboard/lib/get-dashboard-view-model.ts
- apps/dashboard/lib/get-dashboard-view-model.test.ts

## Expected max files changed
2

## Risk
Low: the change is isolated to dashboard view-model selection and its tests.

## Rollback note
Revert the dashboard view-model and test changes to restore the previous durable/fallback indicator behavior.

## In scope
Update the dashboard view model to clearly signal durable lineage summary versus fallback demo data.
Add or adjust tests covering both durable and fallback paths.

## Out of scope
Any proxy, persistence, or data-layer changes.
Any dashboard layout or styling refactor.

## Tasks
- Update the dashboard view-model indicator text for durable reads if needed.
- Verify fallback behavior remains explicit.
- Add or adjust tests for the durable and fallback indicators.

## Validation command
pnpm verify:dashboard

## Validation
- `pnpm verify:dashboard` — PASS

## Acceptance criteria
- Dashboard clearly distinguishes durable lineage reads from fallback demo data.
- Dashboard tests pass.

## Completion summary
Updated the dashboard durable data indicator to explicitly say it is a live database read and aligned the dashboard test expectation.
