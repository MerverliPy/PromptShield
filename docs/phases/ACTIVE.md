# ACTIVE PHASE

## Name
Phase 04D - Durable savings input source seam

## Goal
Add a bounded `packages/db` seam that reads savings-rollup inputs from durable lineage records so the worker can consume saved lineage data without reading proxy internals.

## Files in scope
- `packages/db/src/sql-savings-rollup-source.ts`
- `packages/db/src/sql-savings-rollup-source.test.ts`
- `packages/db/src/index.ts`

## Do not touch
- `apps/worker/**`
- `apps/proxy/**`
- `apps/dashboard/**`
- `services/optimizer/**`
- `memory/CURRENT_STATE.md`

## Tasks
1. Add a sqlite-backed source factory that returns the worker rollup input shape from durable lineage storage.
2. Read from existing durable lineage tables only; do not introduce new tables in this phase.
3. Keep row ordering deterministic so worker results are stable under test.
4. Add focused tests for:
   - empty durable lineage data
   - one saved lineage row
   - multiple saved lineage rows with deterministic ordering
5. Export the new source from `packages/db/src/index.ts`.

## Constraints
- stay entirely inside `packages/db`
- reuse existing sqlite CLI executor patterns already used in this package
- do not introduce worker persistence in this phase
- do not change existing lineage write behavior
- keep the returned shape aligned to the existing worker savings-rollup input contract

## Acceptance criteria
- `packages/db` exports a durable savings-rollup source seam
- the source returns `requestEventId`, `grossCostUsd`, and `optimizedCostUsd`
- empty lineage storage returns an empty array
- tests are focused and package-local
- package exports remain truthful

## Validation
- `pnpm exec tsc -p packages/db/tsconfig.json --noEmit`
- `pnpm --filter @promptshield/db test`

## Exit condition
The worker can import an exported db seam for durable savings-rollup inputs without reading proxy internals.
