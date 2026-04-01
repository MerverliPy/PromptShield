# ACTIVE PHASE

## Name
Phase 01F — Proxy lineage event emit seam

## Goal
Add a bounded proxy-side emission seam that accepts the typed lineage event payload shell for later persistence or worker delivery.

## Files in scope
- `apps/proxy/src/lib/build-lineage-event.ts`
- `apps/proxy/src/lib/emit-lineage-event.ts`
- `apps/proxy/src/routes/chat-completions.ts`

## Do not touch
- `packages/db/**`
- `packages/policy/**`
- `apps/dashboard/**`
- `apps/worker/**`
- `services/**`
- `docs/**`
- `memory/**`

## Tasks
1. Add `emit-lineage-event.ts` as a local proxy emission seam.
2. Invoke the emission seam from `chat-completions.ts` with the typed payload shell.
3. Keep the seam bounded to local logging or no-op behavior only.
4. Preserve deterministic route behavior and existing request handling.

## Constraints
- control-plane seam only
- no database writes
- no queue or client integration
- keep route handlers thin
- no broad refactor
- no contract churn

## Acceptance criteria
- proxy route maps normalized request plus decision into typed lineage payload shell
- proxy route invokes a local emission seam with that payload
- no changes occur outside listed files

## Validation
- `pnpm exec tsc -p apps/proxy/tsconfig.json --noEmit`
- `pnpm --filter @promptshield/proxy test`
- `git diff -- apps/proxy/src/lib/build-lineage-event.ts apps/proxy/src/lib/emit-lineage-event.ts apps/proxy/src/routes/chat-completions.ts`

## Exit condition
- acceptance criteria pass
- validation is run
- `memory/HANDOFF.md` and `memory/TASK_BOARD.md` are updated
