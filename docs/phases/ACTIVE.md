# ACTIVE PHASE

## Name
Phase 04B — Dashboard durable summary consumption

## Goal
Replace the dashboard static preview summary path in `apps/dashboard/lib/get-dashboard-view-model.ts` with durable db-backed reads while preserving the explicit fallback path.

## Files in scope
- `apps/dashboard/lib/get-dashboard-view-model.ts`
- `apps/dashboard/lib/get-dashboard-view-model.test.ts`

## Do not touch
- `apps/proxy/**`
- `packages/db/**`
- `packages/policy/**`
- `apps/dashboard/app/**`
- `apps/dashboard/components/**`
- `apps/worker/**`
- `services/**`
- `docs/**`
- `memory/**` during implementation, except post-validation updates to `memory/HANDOFF.md` and `memory/TASK_BOARD.md` required for phase close

## Tasks
1. Replace the source-relative static preview summary wrapper in `apps/dashboard/lib/get-dashboard-view-model.ts`.
2. Read dashboard summary data through one explicit db-backed seam.
3. Preserve the explicit fallback path when durable reads are unavailable.
4. Add focused dashboard-side coverage if needed within the listed scope.

## Constraints
- no proxy route changes
- dashboard consumption only
- no db implementation changes
- no queue or worker integration
- preserve the fallback path introduced in Phase 04A
- no broad refactor
- no contract churn

## Acceptance criteria
- `apps/dashboard/lib/get-dashboard-view-model.ts` no longer wraps a static preview summary
- dashboard reads through one explicit db-backed summary seam while preserving fallback behavior
- any dashboard-side coverage added remains within the listed scope
- no changes occur outside listed files

## Validation
- `pnpm exec tsc -p apps/dashboard/tsconfig.json --noEmit`
- `git diff -- apps/dashboard/lib/get-dashboard-view-model.ts apps/dashboard/lib/get-dashboard-view-model.test.ts`

## Exit condition
- acceptance criteria pass
- validation is run
- `memory/HANDOFF.md` and `memory/TASK_BOARD.md` are updated
