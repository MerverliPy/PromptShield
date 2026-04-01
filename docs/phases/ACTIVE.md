# ACTIVE PHASE

## Name
Phase 01G — DB lineage event durable write seam

## Goal
Add a bounded db-side durable write seam for the typed lineage event payload shell so proxy emission can later persist through one explicit storage boundary.

## Files in scope
- `packages/db/src/write-lineage-event.ts`
- `packages/db/src/write-lineage-event.test.ts`
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
1. Add `write-lineage-event.ts` as a bounded db-side durable write seam.
2. Export the seam through `packages/db/src/index.ts`.
3. Cover the seam with a focused db-side test.
4. Keep the seam bounded to local persistence only.

## Constraints
- database write seam only
- no proxy route changes
- no queue or worker integration
- keep the seam local to `packages/db`
- no broad refactor
- no contract churn

## Acceptance criteria
- `packages/db` exposes one bounded durable write seam for the typed lineage payload shell
- the durable seam is covered by a focused db-side test
- no changes occur outside listed files

## Validation
- `pnpm exec tsc -p packages/db/tsconfig.json --noEmit`
- `git diff -- packages/db/src/write-lineage-event.ts packages/db/src/write-lineage-event.test.ts packages/db/src/index.ts`

## Exit condition
- acceptance criteria pass
- validation is run
- `memory/HANDOFF.md` and `memory/TASK_BOARD.md` are updated
