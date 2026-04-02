# ACTIVE PHASE

## Name
Phase 01B-R2 - Proxy degraded persistence state is explicit

## Goal
Make proxy lineage persistence degradation operator-visible instead of silently presenting a fully healthy runtime when the SQLite CLI lineage path is unavailable.

## Files in scope
- `apps/proxy/src/server.ts`
- `apps/proxy/src/routes/chat-completions.ts`
- `apps/proxy/src/routes/chat-completions.test.ts`

## Do not touch
- `packages/db/**`
- `apps/dashboard/**`
- `apps/worker/**`
- `services/**`
- `memory/CURRENT_STATE.md`

## Tasks
1. Make the proxy's health or route-visible state explicitly reflect whether durable lineage persistence is active or unavailable.
2. Preserve current request handling unless a minimal response or metadata adjustment is required to make degradation truthful.
3. Update scoped tests so degraded persistence is asserted explicitly.
4. Do not add new infrastructure or change the current storage backend in this phase.
5. Run the listed validation.
6. After validation passes, update `memory/HANDOFF.md` and `memory/TASK_BOARD.md` for phase closeout.

## Constraints
- do not change request-shaping behavior beyond what is required for truthful degraded-state signaling
- do not modify `packages/db`
- do not introduce dashboard changes in this phase
- keep the phase bounded to `apps/proxy`

## Acceptance criteria
- proxy behavior makes durable-lineage disabled state explicit
- proxy tests cover the explicit degraded-path behavior
- healthy state is no longer indistinguishable from persistence-disabled state
- listed validation passes

## Validation
- `pnpm --filter @promptshield/proxy test`

## Exit condition
Proxy operators can tell when durable lineage persistence is unavailable without inferring it from warnings alone.
