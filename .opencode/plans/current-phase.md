# Current Phase

Status: DRAFT

## Goal
Add focused unit coverage for dashboard view-model formatting so metric and outcome text stay predictable as the dashboard shifts onto durable summaries.

## Why this phase is next
`getDashboardViewModel` and the durable dashboard read model are already wired up, but the dashboard view-model formatting branches still do not have direct coverage. This is a small, user-facing gap with a clear validation path and it locks down the final presentation layer without widening scope.

## In scope
- `apps/dashboard/lib/get-dashboard-view-model.test.ts` and/or a focused `apps/dashboard/lib/view-models.test.ts`
- Direct tests for `createDashboardViewModel`
- Metric label/value/note formatting, including unknown-metric fallback
- Recent outcome summary branches: savings, reroute, and rejection

## Out of scope
- Dashboard shell/layout changes
- Database or proxy behavior
- Contract shape changes
- New data sources or refactors beyond the view-model test coverage

## Tasks
- Add focused `createDashboardViewModel` test coverage for metric formatting and fallback metadata.
- Add outcome summary assertions for the saved, rerouted, and rejected branches.
- Keep the existing durable/fallback `getDashboardViewModel` coverage intact.

## Validation
- `pnpm --filter @promptshield/dashboard test`

## Acceptance criteria
- Dashboard test suite passes.
- The view-model formatting branches are covered by tests.
- Unknown metrics still render with a safe fallback label/note.
- Outcome summaries stay deterministic across the covered cases.
