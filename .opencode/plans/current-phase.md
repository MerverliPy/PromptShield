# Current Phase

Status: PASS

## Goal
Add focused unit coverage for dashboard view-model formatting so metric labels, values, and recent outcome summaries stay predictable.

## Why this phase is next
`createDashboardViewModel` is the smallest incomplete seam in the active dashboard path. Its formatting branches are user-facing, isolated to one module, and already have a direct test surface, so this phase has high value with a very clear validation path.

## In scope
- `apps/dashboard/lib/get-dashboard-view-model.test.ts`
- Direct tests for `createDashboardViewModel`
- Metric label/value/note formatting, including unknown-metric fallback
- Recent outcome summary branches: savings, reroute, and rejection

## Out of scope
- Dashboard shell/layout changes
- Database or proxy behavior
- Contract shape changes
- New data sources or refactors beyond the view-model test coverage

## Tasks
- Add focused `createDashboardViewModel` coverage for metric formatting and fallback metadata.
- Add outcome summary assertions for the saved, rerouted, and rejected branches.
- Keep the existing durable/fallback `getDashboardViewModel` coverage intact.

## Validation
- `pnpm --filter @promptshield/dashboard test`

## Acceptance criteria
- Dashboard test suite passes.
- The view-model formatting branches are covered by tests.
- Unknown metrics still render with a safe fallback label/note.
- Outcome summaries stay deterministic across the covered cases.
