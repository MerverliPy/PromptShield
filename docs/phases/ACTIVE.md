# ACTIVE PHASE

## Name
Phase 01J — DB durable dashboard summary read model

## Goal
Add a durable executor-backed dashboard summary read model in `packages/db` that summarizes persisted request, action, and savings records through one explicit db-side boundary.

## Files in scope
- `packages/db/src/dashboard-read-model.ts`
- `packages/db/src/dashboard-read-model.test.ts`
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
1. Add an executor-backed dashboard summary read model in `packages/db`.
2. Summarize persisted request, action, and savings data through one explicit db read seam.
3. Export the read model through `packages/db/src/index.ts`.
4. Cover the read model with focused db-side tests.

## Constraints
- database read-model implementation only
- no proxy route changes
- no dashboard implementation changes
- no queue or worker integration
- keep the seam local to `packages/db`
- no real driver wiring outside the injected executor boundary
- no broad refactor
- no contract churn

## Acceptance criteria
- `packages/db` exposes one durable executor-backed dashboard summary read model behind an injected local boundary
- the read model summarizes persisted request/action/savings records through one explicit db seam
- the read model is covered by focused db-side tests
- no changes occur outside listed files

## Validation
- `pnpm exec tsc -p packages/db/tsconfig.json --noEmit`
- `pnpm --filter @promptshield/db test`
- `git diff -- packages/db/src/dashboard-read-model.ts packages/db/src/dashboard-read-model.test.ts packages/db/src/index.ts`

## Exit condition
- acceptance criteria pass
- validation is run
- `memory/HANDOFF.md` and `memory/TASK_BOARD.md` are updated
