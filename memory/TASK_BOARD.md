# TASK_BOARD

updated_at: 2026-04-01
phase: Phase 01J
status: queued

## NOW
- Phase 01J — DB durable dashboard summary read model
- Objective: add a durable executor-backed dashboard summary read model in `packages/db` over persisted request, action, and savings records
- Owner: implementation

## NEXT
- Resume Phase 04B by replacing the dashboard static preview summary path with durable db-backed reads after the db read model lands
- Revisit Phase 04B once durable dashboard summaries can read from the db surface instead of the static preview adapter
- Resolve Phase 05C Python validation in an environment with `pytest`, then decide whether any helper-only cleanup is still needed

## BLOCKED
- Phase 04B remains open: dashboard provider still wraps a static preview summary instead of durable db-backed summaries
- Phase 05C local validation blocker: `pytest services/optimizer/tests -q` -> `pytest: command not found`

## DONE_THIS_WEEK
- Phase 01I closed: `packages/db` now owns executor-backed lineage persistence and proxy now persists through `@promptshield/db` with failure-tolerant route behavior
- Phase 01I files changed: `packages/db/src/sql-lineage-store.ts`, `packages/db/src/sql-lineage-store.test.ts`, `packages/db/src/write-lineage-event.ts`, `packages/db/src/write-lineage-event.test.ts`, `packages/db/src/index.ts`, `packages/db/package.json`, `apps/proxy/src/lib/build-lineage-event.ts`, `apps/proxy/src/lib/persist-lineage-event.ts`, `apps/proxy/src/routes/chat-completions.ts`, `apps/proxy/src/routes/chat-completions.test.ts`, and `apps/proxy/src/server.ts`
- Validation rerun now: `pnpm exec tsc -p packages/db/tsconfig.json --noEmit`
- Validation rerun now: `pnpm exec tsc -p apps/proxy/tsconfig.json --noEmit`
- Validation rerun now: `pnpm --filter @promptshield/db test`
- Validation rerun now: `pnpm --filter @promptshield/proxy test`
- Phase 01H closed: corrected the `@promptshield/db` package boundary so the package root resolves through `src/index.ts`, keeps lineage write types available, and exposes `writeLineageEvent`
- Phase 01H files changed: `packages/db/package.json` and `packages/db/src/index.ts`
- Validation rerun now: `pnpm exec tsc -p packages/db/tsconfig.json --noEmit`
- Phase 01G closed: added `packages/db` lineage write seam, focused db tests, truthful package exports, and a package-local `test` script
- Phase 01G files changed: `packages/db/src/write-lineage-event.ts`, `packages/db/src/write-lineage-event.test.ts`, `packages/db/src/index.ts`, and `packages/db/package.json`
- Validation rerun now: `pnpm exec tsc -p packages/db/tsconfig.json --noEmit`
- Validation rerun now: `pnpm --filter @promptshield/db test`
- M-01 closed: `memory/CURRENT_STATE.md` synchronized to current public branch truth
- Retroactively closed after review: 06A, 06C, 01F-A, 02A, 02B, 03A, 03B, 02C, 02D, 04A, 05A, 05B
- Validation rerun now: `pnpm exec tsc -p apps/proxy/tsconfig.json --noEmit`
- Validation rerun now: `pnpm --filter @promptshield/proxy test`
- Validation rerun now: `pnpm --filter @promptshield/db exec tsc --noEmit`
- Validation rerun now: `pnpm exec tsc -p packages/contracts/tsconfig.json --noEmit`
- Validation rerun now: `pnpm exec tsc -p apps/dashboard/tsconfig.json --noEmit`
- Validation rerun now: `pnpm --filter @promptshield/worker test`
- Validation rerun now: `pnpm --filter @promptshield/optimizer test`
- Review completed after implementation fix: `docs/refactor-summary.md`
- Review completed after implementation fix: `apps/dashboard/lib/get-dashboard-view-model.ts`
- Left open after review: Phase 04B partial, Phase 05C blocked
