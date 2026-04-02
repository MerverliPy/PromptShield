# ACTIVE PHASE

## Name
Phase 04E - Worker consumes durable savings input seam

## Goal
Replace the worker's empty default savings-rollup source with an env-gated durable sqlite source while preserving explicit fallback behavior when durable lineage data is unavailable.

## Files in scope
- `apps/worker/src/index.ts`
- `apps/worker/src/index.test.ts`

## Do not touch
- `packages/db/**`
- `apps/proxy/**`
- `apps/dashboard/**`
- `services/optimizer/**`
- `memory/CURRENT_STATE.md`

## Tasks
1. Update the worker default dependency builder so it uses `PROMPTSHIELD_PROXY_LINEAGE_DB` when present.
2. Consume the exported durable savings-rollup source seam from `@promptshield/db`.
3. Preserve the current explicit fallback path when the env var is unset or durable source setup cannot proceed.
4. Extend worker tests to cover:
   - default idle behavior remains unchanged
   - explicit dependency injection still works
   - durable lineage inputs are consumed when the sqlite path is set
   - fallback remains deterministic when the env var is unset
5. Follow the existing repo pattern for sqlite-backed tests so durable-path assertions do not become flaky on machines without the sqlite CLI.

## Constraints
- modify only the worker module
- do not add rollup persistence in this phase
- do not change the worker CLI contract
- do not read proxy internals
- keep request-path behavior untouched

## Acceptance criteria
- default worker execution can compute savings-rollup totals from saved lineage records when `PROMPTSHIELD_PROXY_LINEAGE_DB` is set
- current idle behavior still returns the same supported job list
- explicit dependency injection still overrides the default path cleanly
- fallback behavior remains truthful when durable lineage data is unavailable

## Validation
- `pnpm exec tsc -p apps/worker/tsconfig.json --noEmit`
- `pnpm --filter @promptshield/worker test`

## Exit condition
The worker default path can consume durable lineage records for `savings-rollup` without widening scope into proxy code.
