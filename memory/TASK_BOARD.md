# TASK_BOARD

updated_at: 2026-04-01
phase: Phase 01G
status: active

## NOW
- Phase 01G — DB lineage event durable write seam
- Objective: add a bounded durable write seam for typed lineage payloads in `packages/db`
- Owner: implementation

## NEXT
- Revisit Phase 04B once durable dashboard summaries can read from the db surface instead of the static preview adapter
- Resolve Phase 05C Python validation in an environment with `pytest`, then decide whether any helper-only cleanup is still needed

## BLOCKED
- Phase 04B remains open: dashboard provider still wraps a static preview summary instead of durable db-backed summaries
- Phase 05C local validation blocker: `pytest services/optimizer/tests -q` -> `pytest: command not found`

## DONE_THIS_WEEK
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
