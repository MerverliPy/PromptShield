# ACTIVE PHASE

## Name
Phase 01H — DB executor-backed lineage store

## Goal
Add a local executor-backed lineage store in `packages/db` that uses the Phase 01G seam to persist request, action, and savings writes through one explicit db-side boundary.

## Files in scope
- `packages/db/src/sql-lineage-store.ts`
- `packages/db/src/sql-lineage-store.test.ts`
- `packages/db/src/index.ts`

## Do not touch
- `apps/proxy/**`
- `packages/policy/**`
- `apps/dashboard/**`
- `apps/worker/**`
- `services/**`
- `docs/**`
- `memory/**` during implementation, except post-validation updates to `memory/HANDOFF.md` and `memory/TASK_BOARD.md` required for phase close

## Tasks
1. Add `sql-lineage-store.ts` as a local executor-backed implementation of `LineageStore`.
2. Reuse the Phase 01G write seam rather than duplicating lineage orchestration.
3. Export the store through `packages/db/src/index.ts`.
4. Cover the store with focused db-side tests.

## Constraints
- database store implementation only
- no proxy route changes
- no queue or worker integration
- keep the seam local to `packages/db`
- no real driver wiring outside the injected executor boundary
- no broad refactor
- no contract churn

## Acceptance criteria
- `packages/db` exposes one executor-backed lineage store implementation behind an injected local boundary
- the store reuses the Phase 01G write seam rather than duplicating orchestration
- the store is covered by focused db-side tests
- no changes occur outside listed files

## Validation
- `pnpm exec tsc -p packages/db/tsconfig.json --noEmit`
- `pnpm --filter @promptshield/db test`
- `git diff -- packages/db/src/sql-lineage-store.ts packages/db/src/sql-lineage-store.test.ts packages/db/src/index.ts`

## Exit condition
- acceptance criteria pass
- validation is run
- `memory/HANDOFF.md` and `memory/TASK_BOARD.md` are updated
